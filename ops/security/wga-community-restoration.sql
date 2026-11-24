-- CANDIDATE: isolated acceptance and owner review required before Production.
-- Add bounded server functions; do not grant direct business-table writes.
BEGIN;
DO $guard$ BEGIN
 IF to_regnamespace('wga_community_private') IS NOT NULL THEN
  RAISE EXCEPTION 'Community schema already exists; stop and review';
 END IF;
 IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='wga_runtime' AND NOT rolsuper AND NOT rolcreaterole AND NOT rolcreatedb AND NOT rolbypassrls)
 OR to_regclass('public."ChatMessage"') IS NULL THEN RAISE EXCEPTION 'Unexpected runtime or chat inventory'; END IF;
END $guard$;
CREATE SCHEMA wga_community_private;
REVOKE ALL ON SCHEMA wga_community_private FROM PUBLIC;
CREATE TABLE wga_community_private.rate_windows (
 kind text NOT NULL CHECK(kind IN ('chat','report','score')),
 key_hash text NOT NULL CHECK(key_hash ~ '^[a-f0-9]{64}$'),
 bucket bigint NOT NULL, hits integer NOT NULL CHECK(hits>0), expires_at timestamptz NOT NULL,
 PRIMARY KEY(kind,key_hash,bucket)
);
ALTER TABLE wga_community_private.rate_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON wga_community_private.rate_windows FROM PUBLIC,wga_runtime;
CREATE INDEX ON wga_community_private.rate_windows(expires_at);
CREATE FUNCTION wga_community_private.take_rate(p_kind text,p_key text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE n integer; cap integer; window_seconds integer; b bigint;
BEGIN
 IF p_key IS NULL OR p_key !~ '^[a-f0-9]{64}$' OR p_kind NOT IN('chat','report','score') THEN RAISE EXCEPTION 'Invalid rate scope'; END IF;
 cap:=CASE WHEN p_kind='chat' THEN 6 WHEN p_kind='report' THEN 10 ELSE 30 END;
 window_seconds:=CASE WHEN p_kind='score' THEN 60 ELSE 30 END;
 b:=floor(extract(epoch FROM statement_timestamp())/window_seconds);
 -- Only expired ephemeral rate counters are removed; no visitor records are deleted.
 DELETE FROM wga_community_private.rate_windows WHERE ctid IN
  (SELECT ctid FROM wga_community_private.rate_windows WHERE expires_at<statement_timestamp() LIMIT 100);
 INSERT INTO wga_community_private.rate_windows AS r VALUES(p_kind,p_key,b,1,statement_timestamp()+interval '2 minutes')
 ON CONFLICT(kind,key_hash,bucket) DO UPDATE SET hits=r.hits+1 RETURNING hits INTO n;
 IF n>cap THEN RAISE EXCEPTION 'community_rate_limited'; END IF;
END $$;
CREATE FUNCTION wga_community_private.chat_messages(p_slug text,p_limit integer)
RETURNS TABLE(id text,"playerName" text,text text,ts numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT c.id,c."playerName",c.text,extract(epoch FROM c."createdAt")*1000
 FROM public."ChatMessage" c JOIN public."Game" g ON g.id=c."gameId"
 WHERE g.slug=p_slug AND left(g.slug,1)<>'_' AND lower(g.slug) NOT LIKE '%template%'
 AND c."hiddenAt" IS NULL AND c."reportedAt" IS NULL AND c."createdAt">statement_timestamp()-interval '24 hours'
 ORDER BY c."createdAt" DESC LIMIT least(greatest(coalesce(p_limit,50),1),80)
$$;
CREATE FUNCTION wga_community_private.post_chat(p_slug text,p_actor text,p_name text,p_text text,p_rate text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE gid text; label text; mid text:=gen_random_uuid()::text; stamp timestamptz:=statement_timestamp();
BEGIN
 IF p_text IS NULL OR length(btrim(p_text)) NOT BETWEEN 1 AND 180 OR p_name IS NULL OR length(p_name) NOT BETWEEN 1 AND 40 THEN RAISE EXCEPTION 'Invalid chat input'; END IF;
 PERFORM wga_community_private.take_rate('chat',p_rate);
 SELECT g.id INTO gid FROM public."Game" g WHERE g.slug=p_slug AND left(g.slug,1)<>'_' AND lower(g.slug) NOT LIKE '%template%';
 IF gid IS NULL THEN RAISE EXCEPTION 'Invalid public game'; END IF;
 label:=p_name;
 IF p_actor IS NOT NULL THEN SELECT coalesce(nullif(u."displayName",''),'Player') INTO label FROM public."User" u WHERE u.id=p_actor; IF NOT FOUND THEN RAISE EXCEPTION 'Unknown actor'; END IF; END IF;
 INSERT INTO public."ChatMessage"(id,"gameId","userId","playerName",text,"createdAt") VALUES(mid,gid,p_actor,left(label,40),p_text,stamp);
 RETURN jsonb_build_object('id',mid,'user',left(label,40),'text',p_text,'ts',extract(epoch FROM stamp)*1000);
END $$;
CREATE FUNCTION wga_community_private.report_chat(p_id text,p_actor text,p_rate text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF p_id IS NULL OR length(p_id)>128 THEN RAISE EXCEPTION 'Invalid report'; END IF;
 PERFORM wga_community_private.take_rate('report',p_rate);
 UPDATE public."ChatMessage" SET "reportedAt"=coalesce("reportedAt",statement_timestamp()),"reportedBy"=coalesce("reportedBy",p_actor,'anonymous'),"hiddenAt"=coalesce("hiddenAt",statement_timestamp()) WHERE id=p_id;
 RETURN true;
END $$;
CREATE FUNCTION wga_community_private.daily_context(p_slug text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE gid text; cid text; d text:=to_char(statement_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD'); seed integer;
BEGIN
 SELECT g.id INTO gid FROM public."Game" g WHERE g.slug=p_slug AND left(g.slug,1)<>'_' AND lower(g.slug) NOT LIKE '%template%';
 IF gid IS NULL THEN RAISE EXCEPTION 'Invalid public game'; END IF;
 seed:=abs(hashtextextended(p_slug||d,0)%1000000000)::integer;
 INSERT INTO public."DailyChallenge"(id,day,seed,"gameId","createdAt") VALUES(gen_random_uuid()::text,d,seed,gid,statement_timestamp())
 ON CONFLICT(day,"gameId") DO UPDATE SET day=excluded.day RETURNING id,"DailyChallenge".seed INTO cid,seed;
 RETURN jsonb_build_object('id',cid,'day',d,'seed',seed);
END $$;
CREATE FUNCTION wga_community_private.submit_score(p_slug text,p_actor text,p_name text,p_score integer,p_mode text,p_daily boolean,p_rate text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE gid text; label text; challenge jsonb; best integer; d text:=to_char(statement_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD');
BEGIN
 IF p_score IS NULL OR p_score NOT BETWEEN 1 AND 2000000000 OR p_name IS NULL OR length(p_name) NOT BETWEEN 1 AND 40
 OR p_mode IS NULL OR p_mode !~ '^[a-zA-Z0-9_-]{1,32}$' OR p_daily IS NULL THEN RAISE EXCEPTION 'Invalid score'; END IF;
 IF NOT p_daily AND p_actor IS NULL THEN RAISE EXCEPTION 'Account required'; END IF;
 PERFORM wga_community_private.take_rate('score',p_rate);
 SELECT g.id INTO gid FROM public."Game" g WHERE g.slug=p_slug AND left(g.slug,1)<>'_' AND lower(g.slug) NOT LIKE '%template%';
 IF gid IS NULL THEN RAISE EXCEPTION 'Invalid public game'; END IF;
 label:=p_name;
 IF p_actor IS NOT NULL THEN SELECT coalesce(nullif(u."displayName",''),'Player') INTO label FROM public."User" u WHERE u.id=p_actor; IF NOT FOUND THEN RAISE EXCEPTION 'Unknown actor'; END IF; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(gid||':'||coalesce(p_actor,p_rate||':'||label)||':'||p_mode||':'||p_daily::text,0));
 IF p_daily THEN
  challenge:=wga_community_private.daily_context(p_slug);
  SELECT max(s.value) INTO best FROM public."DailyChallengeScore" s WHERE s."challengeId"=challenge->>'id'
   AND ((p_actor IS NOT NULL AND s."userId"=p_actor) OR (p_actor IS NULL AND s."userId" IS NULL AND s."playerName"=label));
  IF coalesce(best,0)<p_score THEN INSERT INTO public."DailyChallengeScore"(id,value,"playerName","createdAt","challengeId","userId") VALUES(gen_random_uuid()::text,p_score,left(label,40),statement_timestamp(),challenge->>'id',p_actor); END IF;
 ELSE
  SELECT max(s.value) INTO best FROM public."Score" s WHERE s."gameId"=gid AND s."userId"=p_actor AND s.mode=p_mode;
  IF coalesce(best,0)<p_score THEN INSERT INTO public."Score"(id,"userId","gameId",mode,value,"createdAt") VALUES(gen_random_uuid()::text,p_actor,gid,p_mode,p_score,statement_timestamp()); END IF;
  INSERT INTO public."DailyScore"(id,day,"playerName",score,"gameId","createdAt","updatedAt") VALUES(gen_random_uuid()::text,d,left(label,40),p_score,gid,statement_timestamp(),statement_timestamp())
   ON CONFLICT(day,"gameId","playerName") DO UPDATE SET score=greatest("DailyScore".score,excluded.score),"updatedAt"=statement_timestamp();
 END IF;
 RETURN jsonb_build_object('ok',true,'score',greatest(coalesce(best,0),p_score),'duplicate',coalesce(best,0)>=p_score);
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA wga_community_private FROM PUBLIC,wga_runtime;
GRANT USAGE ON SCHEMA wga_community_private TO wga_runtime;
GRANT EXECUTE ON FUNCTION wga_community_private.chat_messages(text,integer),wga_community_private.post_chat(text,text,text,text,text),
 wga_community_private.report_chat(text,text,text),wga_community_private.daily_context(text),wga_community_private.submit_score(text,text,text,integer,text,boolean,text) TO wga_runtime;
-- No table grants, role attributes, passwords or default read-only settings change.
COMMIT;

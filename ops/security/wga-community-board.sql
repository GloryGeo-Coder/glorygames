-- Apply as migration owner after the established community schema is installed.
BEGIN;
CREATE SCHEMA wga_board;
REVOKE ALL ON SCHEMA wga_board FROM PUBLIC;
CREATE TABLE wga_board.editors (
  actor text PRIMARY KEY REFERENCES public."User"(id) ON DELETE CASCADE
);
CREATE TABLE wga_board.posts (
  id uuid PRIMARY KEY, title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 100),
  body text NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 1800),
  published timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE wga_board.likes (
  post uuid NOT NULL REFERENCES wga_board.posts ON DELETE CASCADE,
  actor text NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  PRIMARY KEY(post,actor)
);
CREATE TABLE wga_board.comments (
  id uuid PRIMARY KEY, post uuid NOT NULL REFERENCES wga_board.posts ON DELETE CASCADE,
  actor text NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 180),
  approved boolean NOT NULL DEFAULT false, created timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON wga_board.posts(published DESC,id);
CREATE INDEX ON wga_board.comments(post,approved,created,id);
CREATE INDEX ON wga_board.comments(created,id) WHERE NOT approved;
ALTER TABLE wga_board.editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE wga_board.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wga_board.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wga_board.comments ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION wga_board.is_editor(p_actor text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT EXISTS(SELECT FROM wga_board.editors WHERE actor=p_actor)
$$;

CREATE FUNCTION wga_board.feed(p_actor text,p_page integer) RETURNS TABLE
(id uuid,title text,body text,published timestamptz,likes bigint,liked boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT p.id,p.title,p.body,p.published,
   (SELECT count(*) FROM wga_board.likes l WHERE l.post=p.id),
   EXISTS(SELECT FROM wga_board.likes l WHERE l.post=p.id AND l.actor=p_actor)
 FROM wga_board.posts p ORDER BY published DESC,id LIMIT 11 OFFSET (greatest(p_page,1)::bigint-1)*10
$$;

CREATE FUNCTION wga_board.replies(p_post uuid,p_page integer) RETURNS TABLE(id uuid,body text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT c.id,c.body FROM wga_board.comments c WHERE c.post=p_post AND c.approved
 ORDER BY c.created DESC,c.id LIMIT 21 OFFSET (greatest(p_page,1)::bigint-1)*20
$$;

CREATE FUNCTION wga_board.pending(p_actor text) RETURNS TABLE(id uuid,title text,body text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT c.id,p.title,c.body FROM wga_board.comments c JOIN wga_board.posts p ON p.id=c.post
 WHERE NOT c.approved AND wga_board.is_editor(p_actor) ORDER BY c.created,c.id LIMIT 50
$$;

CREATE FUNCTION wga_board.respond(p_actor text,p_post uuid,p_request uuid,p_kind text,p_body text,p_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM public."User" WHERE id=p_actor)
 THEN RAISE EXCEPTION 'account required'; END IF;
 IF NOT EXISTS(SELECT FROM wga_board.posts WHERE id=p_post) THEN RAISE EXCEPTION 'unknown post'; END IF;
 IF p_kind='comment' THEN
   PERFORM wga_community_private.take_rate('chat',p_key);
   INSERT INTO wga_board.comments(id,post,actor,body) VALUES(p_request,p_post,p_actor,p_body)
   ON CONFLICT(id) DO NOTHING;
 ELSIF p_kind='like' THEN
   INSERT INTO wga_board.likes VALUES(p_post,p_actor) ON CONFLICT DO NOTHING;
 ELSIF p_kind='unlike' THEN
   DELETE FROM wga_board.likes WHERE post=p_post AND actor=p_actor;
 ELSE RAISE EXCEPTION 'unknown response'; END IF;
END $$;

CREATE FUNCTION wga_board.edit(p_actor text,p_kind text,p_id uuid,p_title text,p_body text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF NOT wga_board.is_editor(p_actor) THEN RAISE EXCEPTION 'editor required'; END IF;
 IF p_kind='publish' THEN
   INSERT INTO wga_board.posts(id,title,body) VALUES(p_id,p_title,p_body) ON CONFLICT(id) DO NOTHING;
 ELSIF p_kind='approve' THEN
   UPDATE wga_board.comments SET approved=true WHERE id=p_id;
 ELSIF p_kind='remove' THEN
   DELETE FROM wga_board.comments WHERE id=p_id;
 ELSE RAISE EXCEPTION 'unknown decision'; END IF;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA wga_board FROM PUBLIC,wga_runtime;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA wga_board FROM PUBLIC,wga_runtime;
GRANT USAGE ON SCHEMA wga_board TO wga_runtime;
GRANT EXECUTE ON FUNCTION wga_board.is_editor(text),wga_board.feed(text,integer),
 wga_board.replies(uuid,integer),wga_board.pending(text),wga_board.respond(text,uuid,uuid,text,text,text),
 wga_board.edit(text,text,uuid,text,text) TO wga_runtime;
COMMIT;

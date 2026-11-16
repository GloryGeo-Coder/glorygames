-- Reviewed candidate only. Do not execute on production before isolated acceptance.
-- The role has no usable password until the owner sets one privately in Neon.
BEGIN;
DO $guard$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'wga_runtime') THEN
    RAISE EXCEPTION 'Runtime role already exists; stop and review instead of changing it';
  END IF;
END
$guard$;
CREATE ROLE wga_runtime LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOREPLICATION NOBYPASSRLS PASSWORD NULL;
DO $connect$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO wga_runtime', current_database());
END
$connect$;
GRANT USAGE ON SCHEMA public TO wga_runtime;
GRANT SELECT ON TABLE public."Game", public."Score", public."DailyScore",
  public."DailyChallenge", public."DailyChallengeScore" TO wga_runtime;
GRANT SELECT (id, email, "displayName", "passwordHash") ON public."User" TO wga_runtime;
ALTER ROLE wga_runtime SET statement_timeout = '15s';
ALTER ROLE wga_runtime SET lock_timeout = '3s';
ALTER ROLE wga_runtime SET idle_in_transaction_session_timeout = '30s';
ALTER ROLE wga_runtime SET default_transaction_read_only = 'on';
DO $verify$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname='wga_runtime' AND
    (rolsuper OR rolinherit OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls))
    OR EXISTS (SELECT FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname='wga_runtime'))
    OR has_schema_privilege('wga_runtime','public','CREATE')
    OR has_database_privilege('wga_runtime',current_database(),'CREATE')
    OR has_table_privilege('wga_runtime','public."ChatMessage"','SELECT')
    OR has_table_privilege('wga_runtime','public."Review"','SELECT')
    OR has_table_privilege('wga_runtime','public."GameSession"','SELECT')
    OR has_table_privilege('wga_runtime','public._prisma_migrations','SELECT')
    OR has_column_privilege('wga_runtime','public."User"','createdAt','SELECT')
    OR has_column_privilege('wga_runtime','public."User"','updatedAt','SELECT')
  THEN RAISE EXCEPTION 'Runtime privilege guard failed; review inherited/PUBLIC privileges'; END IF;
END
$verify$;
COMMIT;

-- Candidate: test in an isolated restore before production approval.
-- Run as the existing database owner. No owner URL belongs in the app.
BEGIN;
DO $guard$
BEGIN
  IF to_regnamespace('wga_session_private') IS NOT NULL THEN
    RAISE EXCEPTION 'Session schema already exists; stop and review';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='wga_runtime'
    AND NOT (rolsuper OR rolinherit OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)) THEN
    RAISE EXCEPTION 'Expected restricted runtime role missing';
  END IF;
END
$guard$;
CREATE SCHEMA wga_session_private;
REVOKE ALL ON SCHEMA wga_session_private FROM PUBLIC;
CREATE TABLE wga_session_private.revoked_tokens (
  fingerprint text PRIMARY KEY CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz NOT NULL
);
CREATE INDEX revoked_tokens_expiry_idx ON wga_session_private.revoked_tokens(expires_at);
ALTER TABLE wga_session_private.revoked_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE wga_session_private.revoked_tokens FROM PUBLIC, wga_runtime;

CREATE FUNCTION wga_session_private.is_revoked(p_fingerprint text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $fn$
BEGIN
  IF p_fingerprint IS NULL OR p_fingerprint !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid session fingerprint' USING ERRCODE='22023';
  END IF;
  RETURN EXISTS (SELECT FROM wga_session_private.revoked_tokens WHERE fingerprint=p_fingerprint);
END
$fn$;

CREATE FUNCTION wga_session_private.revoke(p_fingerprint text, p_exp bigint)
RETURNS boolean LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $fn$
DECLARE v_now timestamptz := clock_timestamp();
BEGIN
  IF p_fingerprint IS NULL OR p_fingerprint !~ '^[0-9a-f]{64}$'
    OR p_exp IS NULL OR p_exp < 0 OR p_exp > extract(epoch FROM v_now)::bigint + 3660 THEN
    RAISE EXCEPTION 'Invalid session revocation' USING ERRCODE='22023';
  END IF;
  -- JWT validation owns expiry. Preserve a five-minute clock-skew margin and
  -- prune at most 1,000 expired fingerprints per acknowledged logout.
  DELETE FROM wga_session_private.revoked_tokens target USING (
    SELECT fingerprint FROM wga_session_private.revoked_tokens
    WHERE expires_at < v_now - interval '5 minutes'
    ORDER BY expires_at LIMIT 1000 FOR UPDATE SKIP LOCKED
  ) expired WHERE target.fingerprint=expired.fingerprint;
  IF to_timestamp(p_exp::double precision) < v_now - interval '5 minutes' THEN RETURN true; END IF;
  INSERT INTO wga_session_private.revoked_tokens(fingerprint,expires_at)
    VALUES (p_fingerprint,to_timestamp(p_exp::double precision))
    ON CONFLICT (fingerprint) DO NOTHING;
  RETURN EXISTS (SELECT FROM wga_session_private.revoked_tokens WHERE fingerprint=p_fingerprint);
END
$fn$;

REVOKE ALL ON FUNCTION wga_session_private.is_revoked(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION wga_session_private.revoke(text,bigint) FROM PUBLIC;
GRANT USAGE ON SCHEMA wga_session_private TO wga_runtime;
GRANT EXECUTE ON FUNCTION wga_session_private.is_revoked(text) TO wga_runtime;
GRANT EXECUTE ON FUNCTION wga_session_private.revoke(text,bigint) TO wga_runtime;
-- No table privileges, role settings, memberships or existing grants change.
COMMIT;

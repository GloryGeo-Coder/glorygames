# WebGameArena runtime database separation

Candidate only: apply `wga-runtime-role.sql` in the isolated acceptance runner
before any production role or environment change. Keep ads, analytics and public
signup/chat/score/review/session writes paused.

The SQL creates `wga_runtime` with no usable password, administrative attributes,
memberships, ownership or write grants. It permits the five catalogue/score
relations and four `User` fields required by existing login/server-side joins.
Unexpected existing roles or effective PUBLIC/admin privileges abort the policy.
No default grant is added for future tables. Temporary PostgreSQL objects retain
the database's existing PUBLIC behaviour; they are not persistent table access.

Both database clients accept only the reviewed `wga_runtime` Neon connection.
Owner connection strings must be removed from **both** Cloudflare production and
build `DATABASE_URL`. Builds generate the Prisma client and read the catalogue;
they do not run owner migrations. No privileged fallback URL is introduced.

The old `admin/sync-games` and `admin/create-game` web routes return a paused
403 response before accessing a key, request, filesystem or database. Catalogue
and schema maintenance belongs in reviewed source releases and owner-operated
Neon maintenance, not a public Worker holding a second owner credential.
`ADMIN_KEY` no longer authorises these routes.

## Acceptance and rollout order

1. Preserve the existing verified/encrypted backup. Run the offline role runner
   on a fresh restore, not on the archive's original database. Confirm its exact
   policy hash, real runtime-session read/denial checks, unchanged records and
   cleanup. The test uses no Neon credentials and no external network.
2. Run application tests and the production build; review hosted current PUBLIC
   and default privileges before the production SQL. The portable restore does
   not reconstruct all original provider grants and cannot replace that review.
3. Review/approve the exact production policy and apply it once. Set the new
   role password privately as owner in Neon; never put it in SQL source/chat.
4. Replace the two Cloudflare secrets privately: runtime uses the pooled URL;
   build uses the direct URL. Both must identify `wga_runtime`. Do not reset the
   owner password or leave it as a fallback in the Worker/build environment.
5. Deploy the reviewed code only once the role and both secret values are ready.
   Before that deployment the existing code can use the restricted role's reads;
   old maintenance writes fail at database grants. After deployment the closed
   maintenance endpoints and owner-URL rejection make the boundary explicit.
6. Verify catalogue, health, historical scores, paused endpoints, rejected owner
   URL handling and an owner-run existing-account login/logout. Record actual
   effective grants/attributes and Cloudflare runtime/build secret types without
   displaying their values. Do not exercise real maintenance writes as a probe.
7. Capture a new backup after the production role is created, including updated
   role/grant recovery instructions. Do not discard the existing recovery copy.

If staged reads fail, halt promotion and investigate using sanitized labels.
Restoring the owner connection is not an automatic rollback of this security
change: it would widen runtime access again and needs a deliberate owner decision.
Keep account/maintenance availability distinct from guest static game delivery.

Sources: [Neon role behaviour](https://neon.com/docs/manage/roles),
[PostgreSQL grants](https://www.postgresql.org/docs/17/sql-grant.html).

# Guest launch and Recycle Rush distribution

WebGameArena remains playable without new account registration. The shared launch
policy closes signup, chat/report/review writes, public daily/global score writes
and gameplay-session collection. Chat reads return an empty paused state. The
daily challenge reader does not create database rows during this hold. Existing
accounts can still sign in/out; account recovery, revocation and abuse controls
need separate acceptance before new registration can reopen.

The layout does not mount Google Analytics, AdSense or the legacy daily-score
submission bridge. AdSense verification metadata and ads.txt remain available.
Optional advertising/analytics need a separate consent and age-treatment review
before activation. The static game-tab bridge keeps scores local by default;
enabling its network option does not bypass the server holds. Old public score
rows remain historical and must not be used for prizes or trusted competition.

No records are deleted, passwords changed, database schema migrated or payment
features added. Reopening is a reviewed code change, not a browser setting.

## Reproducible Basic Launch export

Run from the repository root with a NEW absolute output directory:

```powershell
node apps/web/scripts/export-recycle-crazygames.mjs "<new-output-directory>" --rights-confirmed
node apps/web/scripts/validate-recycle-crazygames.mjs "<new-output-directory>"
```

Use the rights-confirmed switch only after the owner confirms commercial
redistribution rights. Owner attestation was received on 15 November 2026:
Glory Mulopo owns code, characters, artwork and music, Fibre Circle has no game
rights, and no third-party commitments exist. This is owner evidence, not an
independent legal title opinion. Preserve the factual learning credit; the
original own-site game is unchanged by export.

The export removes own-site navigation, score/account parent messages and the
external learning hyperlink. CrazyGames supplies fullscreen; custom fullscreen
buttons are not included. No portal SDK or ads are included in this Basic Launch
candidate. Local saves and game rules are preserved. Static validation covers
hashes, size, relative dependencies, JavaScript syntax and removed network hooks.

Do not publish a candidate merely because static validation passes. Review the
current CrazyGames requirements, mobile/desktop acceptance, covers/video,
developer terms and final upload package. Basic Launch has no advertising revenue;
Full Launch selection and SDK integration are separate work. No account, terms,
submission, revenue commitment or payout setup is authorized by this document.

References checked 15 November 2026:
- https://docs.crazygames.com/requirements/technical/
- https://docs.crazygames.com/requirements/gameplay/
- https://docs.crazygames.com/requirements/game-covers/

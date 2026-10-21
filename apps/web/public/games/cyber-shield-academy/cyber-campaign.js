/* Authored simulated investigations. No command in this file accesses external systems. */
(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CyberCampaign = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const chapters = [
    {
      id: 9, host: 'mail-room', title: 'The Borrowed Sender', bg: 'bg-case-bit.png',
      principle: 'A familiar display name is not proof of identity. Check the actual sender and verify requests through a trusted channel.',
      mission: 'Case BIT is closed, but Bit asks you to protect Beacon, a fictional community learning network. A message claims that its coordinator needs an urgent account payment. Compare the message with the trusted directory and preserve it before choosing a response.',
      objectives: [['connect_mail', 'Connect to mail-room.'], ['mail_read', 'Read message.eml and directory.txt.'], ['mail_review', 'Run MailLens to compare the message headers.'], ['mail_preserve', 'Preserve message.eml.'], ['mail_decision', 'Choose a proportionate response to the suspicious message.']],
      reads: { mail_read: ['message.eml', 'directory.txt'] }, tool: 'MailLens', toolKey: 'mail_review',
      analysis: 'Display name: Beacon Coordinator. Actual sender: payments@beacon-help.invalid. Trusted sender domain: beacon.example. Reply-To and the payment link use beacon-help.invalid. The directory lists a separate verified contact channel.',
      decision: { key: 'mail_decision', requires: ['mail_read', 'mail_review', 'mail_preserve'], choices: [
        ['pay-link', 'Open the payment link and pay', false, 'Urgency and a familiar name do not verify the sender. The actual domain differs from the trusted directory.'],
        ['quarantine-message', 'Quarantine this message and verify with the coordinator', true, 'Preserving the message retains evidence. Quarantine limits exposure while a trusted contact can verify the request.'],
        ['delete-mailbox', 'Delete the whole mailbox', false, 'Deleting unrelated mail destroys useful records and disrupts legitimate work. Contain the suspicious message instead.']
      ] },
      output: { key: 'mail_decision', file: 'quarantine-report.txt', text: 'BEACON MAIL REPORT\nSuspicious message preserved and quarantined. Coordinator contacted using directory details, not the message link.' },
      fs: { '/': { 'message.eml': 'From: Beacon Coordinator <payments@beacon-help.invalid>\nReply-To: payments@beacon-help.invalid\nSubject: urgent account payment\nPlease pay at https://beacon-help.invalid/pay. Training address only.', 'directory.txt': 'Trusted Beacon email domain: beacon.example\nVerify unusual requests using the established coordinator contact in the internal directory.', 'quarantine-report.txt': '' } },
      takeaway: 'You distinguished a sender display name from a trusted identity and preserved the original message.'
    },
    {
      id: 10, host: 'identity-desk', title: 'The Endless Approval', bg: 'bg-terminal-lab.png',
      principle: 'Unexpected MFA prompts should be rejected. Verify the user before account recovery, and revoke suspicious sessions.',
      mission: 'A volunteer receives repeated sign-in approval prompts while away from the terminal. Read the sign-in history and recovery policy, then choose how to protect the account without abandoning MFA.',
      objectives: [['connect_identity', 'Connect to identity-desk.'], ['identity_read', 'Read signins.log and recovery.txt.'], ['identity_review', 'Run AccessReview to inspect the active session.'], ['identity_decision', 'Choose a safe recovery response.'], ['identity_collect', 'Collect identity-report.txt.']],
      reads: { identity_read: ['signins.log', 'recovery.txt'] }, tool: 'AccessReview', toolKey: 'identity_review',
      analysis: 'The volunteer denies starting the sign-ins. A new session follows repeated approval requests. The recovery policy requires identity verification and session revocation; it does not permit disabling MFA for convenience.',
      decision: { key: 'identity_decision', requires: ['identity_read', 'identity_review'], choices: [
        ['approve-prompts', 'Approve a prompt to stop the notifications', false, 'Approving an unexpected prompt may authorise a sign-in you did not initiate. Reject it and verify the incident.'],
        ['disable-mfa', 'Disable MFA for the volunteer', false, 'Removing a protective control leaves the account more exposed. Follow the verified recovery process instead.'],
        ['revoke-and-reset', 'Verify the user, revoke the suspicious session and recover access', true, 'Verified recovery and session revocation address the suspected compromise while retaining MFA protection.']
      ] },
      output: { key: 'identity_decision', file: 'identity-report.txt', text: 'IDENTITY REPORT\nUser verified through established recovery process. Suspicious session revoked; credentials recovered and MFA retained.' },
      fs: { '/': { 'signins.log': '08:10 volunteer denied starting new sign-ins\n08:12 repeated approval requests\n08:14 new session SIM-SESSION-7 created', 'recovery.txt': 'Verify identity through established recovery checks. Revoke suspicious sessions. Recover credentials and retain MFA. Never approve an unexpected prompt to silence it.', 'identity-report.txt': '' } },
      takeaway: 'You kept MFA in place while addressing the suspicious session through verified recovery.'
    },
    {
      id: 11, host: 'access-office', title: 'A Key for Every Door', bg: 'bg-network-map.png',
      principle: 'Least privilege gives each role the access it needs, and no more. Changes should preserve legitimate work.',
      mission: 'A shared volunteer role can edit payroll and delete backups. Compare its task description with the permission table. Restore appropriate access without locking everyone out.',
      objectives: [['connect_access', 'Connect to access-office.'], ['access_read', 'Read roles.txt and permissions.txt.'], ['access_review', 'Run AccessReview to compare role permissions.'], ['access_decision', 'Choose the least-privilege permission change.']],
      reads: { access_read: ['roles.txt', 'permissions.txt'] }, tool: 'AccessReview', toolKey: 'access_review',
      analysis: 'Volunteer task: read the public timetable. Current grants: read timetable, edit payroll, delete backups. Only timetable read access is required for this role.',
      decision: { key: 'access_decision', requires: ['access_read', 'access_review'], choices: [
        ['read-timetable', 'Keep timetable read access; remove payroll and backup grants', true, 'This grants only the access needed for the stated role while leaving the timetable usable.'],
        ['all-admins', 'Make every volunteer an administrator', false, 'Administrator access expands the problem. The role only needs to read the timetable.'],
        ['deny-everyone', 'Remove all access for all roles', false, 'A blanket denial disrupts legitimate work and does not match the role-specific task.']
      ] },
      output: { key: 'access_decision', file: 'access-report.txt', text: 'ACCESS REPORT\nVolunteer role restricted to timetable read access. Payroll editing and backup deletion removed. Change recorded for review.' },
      fs: { '/': { 'roles.txt': 'Volunteer duty: read the public timetable. Payroll is maintained by the finance role. Backup administration belongs to the recovery team.', 'permissions.txt': 'volunteer: timetable=read payroll=edit backups=delete\nfinance: payroll=edit\nrecovery: backups=admin', 'access-report.txt': '' } },
      takeaway: 'You used the role description to remove excess access without disrupting the permitted task.'
    },
    {
      id: 12, host: 'recovery-vault', title: 'The Backup That Matters', bg: 'bg-final-node.png',
      principle: 'A backup is useful only if its integrity and restoration can be checked. Restore into a controlled environment first.',
      mission: 'Beacon has a damaged timetable and two backup snapshots. Compare their recorded signatures with the manifest, choose the verified snapshot, then test a restore in the isolated recovery area.',
      objectives: [['connect_recovery', 'Connect to recovery-vault.'], ['recovery_read', 'Read manifest.txt and restore-plan.txt.'], ['recovery_verify', 'Run RestoreLab to compare both backup signatures.'], ['recovery_decision', 'Choose the verified backup.'], ['recovery_restore', 'Restore backup-clean.snap into the recovery area.']],
      reads: { recovery_read: ['manifest.txt', 'restore-plan.txt'] }, tool: 'RestoreLab', toolKey: 'recovery_verify',
      analysis: 'Manifest expected signature: SIM-VERIFIED-42. backup-clean.snap matches. backup-latest.snap has SIM-MISMATCH-99. These labels are training tokens, not cryptographic hashes. The clean snapshot passes the lab integrity comparison.',
      decision: { key: 'recovery_decision', requires: ['recovery_read', 'recovery_verify'], choices: [
        ['verified-backup', 'Choose backup-clean.snap, which matches the manifest', true, 'A matching integrity record supports using this snapshot for a controlled restore test. Recency alone is insufficient.'],
        ['latest-backup', 'Use the newest snapshot despite the mismatch', false, 'The latest snapshot does not match its expected integrity record. Investigate the mismatch rather than trusting its date.'],
        ['overwrite-live', 'Overwrite live data immediately without a restore test', false, 'Test restoration in the isolated recovery area before returning data to service.']
      ] },
      output: { key: 'recovery_restore', file: 'restore-report.txt', text: 'RESTORE REPORT\nVerified backup restored into isolated recovery area. Timetable records readable; count=48, expected=48. Live data was not overwritten.' },
      fs: { '/': { 'manifest.txt': 'Expected backup signature: SIM-VERIFIED-42\nExpected restored timetable rows: 48\nTraining comparison tokens only.', 'restore-plan.txt': 'Compare both backup signatures. Select the matching snapshot. Use restore backup-clean.snap to test in the isolated recovery area before any live recovery.', 'backup-clean.snap': 'signature=SIM-VERIFIED-42\nrows=48\nstatus=verified-copy', 'backup-latest.snap': 'signature=SIM-MISMATCH-99\nrows=12\nstatus=unverified', 'restore-report.txt': '' } },
      takeaway: 'You checked backup integrity and validated a restore instead of trusting a recent filename.'
    },
    {
      id: 13, host: 'update-station', title: 'Patch with a Plan', bg: 'bg-terminal-lab.png',
      principle: 'Prioritise updates using exposure and impact, with testing, approval and a recovery plan.',
      mission: 'Beacon can perform one controlled maintenance change tonight. Compare two advisories with the service inventory and choose an update plan that addresses the exposed service while keeping a rollback available.',
      objectives: [['connect_update', 'Connect to update-station.'], ['update_read', 'Read advisories.txt and inventory.txt.'], ['update_review', 'Run PatchPlan to prioritise the maintenance change.'], ['update_decision', 'Choose a tested, approved update plan.']],
      reads: { update_read: ['advisories.txt', 'inventory.txt'] }, tool: 'PatchPlan', toolKey: 'update_review',
      analysis: 'SIM-A affects the exposed community portal and has high impact. SIM-B affects an offline wallpaper utility. The portal plan includes staging tests, approval, a maintenance window and a rollback.',
      decision: { key: 'update_decision', requires: ['update_read', 'update_review'], choices: [
        ['wallpaper-first', 'Update the offline wallpaper utility first', false, 'The exposed portal has the higher stated impact and exposure. The offline cosmetic utility is lower priority here.'],
        ['tested-portal', 'Test and approve the portal update with a rollback plan', true, 'This addresses the stated high-impact exposure while retaining change control and a recovery route.'],
        ['unreviewed-update', 'Apply an unreviewed portal update immediately', false, 'Urgency does not remove the need to test, document approval and prepare recovery for this planned change.']
      ] },
      output: { key: 'update_decision', file: 'patch-report.txt', text: 'PATCH REPORT\nSIM-A portal update prioritised. Staging test passed, approval recorded, maintenance window scheduled and rollback retained.' },
      fs: { '/': { 'advisories.txt': 'SIM-A: community portal, high impact, exposed service\nSIM-B: wallpaper utility, cosmetic issue, offline', 'inventory.txt': 'Portal: accessible to community users; staging copy and rollback available\nWallpaper utility: offline workstation only\nMaintenance capacity: one approved change tonight', 'patch-report.txt': '' } },
      takeaway: 'You balanced risk, exposure and recoverability rather than treating every update as equally urgent.'
    },
    {
      id: 14, host: 'segment-hub', title: 'Keep the Clinic Connected', bg: 'bg-network-map.png',
      principle: 'Contain the affected segment while preserving essential services and evidence wherever possible.',
      mission: 'A training kiosk is sending unexpected requests. The clinic and backup network must remain available. Read the routes and service priorities, then test a limited containment rule.',
      objectives: [['connect_segment', 'Connect to segment-hub.'], ['segment_read', 'Read routes.txt and services.txt.'], ['segment_review', 'Run SegmentSim to inspect the routes.'], ['segment_decision', 'Choose the smallest effective containment boundary.']],
      reads: { segment_read: ['routes.txt', 'services.txt'] }, tool: 'SegmentSim', toolKey: 'segment_review',
      analysis: 'Unexpected requests originate from kiosk-net. Clinic-net serves appointments and is not the source. Isolating kiosk-net from the internal segments contains this path while retaining clinic access and responder logging.',
      decision: { key: 'segment_decision', requires: ['segment_read', 'segment_review'], choices: [
        ['shutdown-city', 'Shut down every Beacon network', false, 'The stated evidence identifies one segment. A network-wide shutdown would unnecessarily interrupt clinic appointments.'],
        ['allow-all', 'Allow all traffic while investigating', false, 'Continuing to allow the affected path leaves the unexpected requests uncontained.'],
        ['isolate-kiosk', 'Isolate kiosk-net; retain clinic and responder access', true, 'A limited boundary contains the identified path and keeps essential, unaffected services available.']
      ] },
      output: { key: 'segment_decision', file: 'segment-report.txt', text: 'SEGMENT REPORT\nKiosk segment isolated from internal networks. Clinic appointments remain available. Responder access and logs retained.' },
      fs: { '/': { 'routes.txt': 'kiosk-net -> internal-net: unexpected requests\nclinic-net -> appointments: authorised\nresponder-net -> logs: authorised', 'services.txt': 'Essential service: clinic appointments\nPreserve responder access and logs\nAffected source identified by the lab: kiosk-net', 'segment-report.txt': '' } },
      takeaway: 'You matched containment to the evidence and protected the essential service.'
    },
    {
      id: 15, host: 'privacy-desk', title: 'Only What We Need', bg: 'bg-case-bit.png',
      principle: 'Share the minimum information needed for a purpose. Keep identifiable source evidence within its authorised scope.',
      mission: 'Beacon needs a public count of support requests by district, not a list of residents. Read the sharing brief and sample records, choose the permitted output, then generate and collect a summary.',
      objectives: [['connect_privacy', 'Connect to privacy-desk.'], ['privacy_read', 'Read sharing-brief.txt and residents.csv.'], ['privacy_decision', 'Choose the minimum necessary public data.'], ['privacy_redact', 'Run PrivacyLens to create public-summary.txt.'], ['privacy_collect', 'Collect public-summary.txt.']],
      reads: { privacy_read: ['sharing-brief.txt', 'residents.csv'] }, tool: 'PrivacyLens', toolKey: 'privacy_redact', toolRequires: ['privacy_read', 'privacy_decision'],
      analysis: 'Public summary generated: North=2; South=1. Names, contact tokens and internal notes were excluded. These are fictional district counts for the lab, not a guarantee of anonymity in a real dataset.',
      decision: { key: 'privacy_decision', requires: ['privacy_read'], choices: [
        ['share-all', 'Publish every resident record', false, 'The brief only requires district counts. Names and contact details are unnecessary for that purpose.'],
        ['aggregate-counts', 'Publish district counts without resident details', true, 'District totals meet this task without sharing resident names, contact tokens or internal notes.'],
        ['names-only', 'Publish names but remove the contact column', false, 'Removing one column still exposes unnecessary names. The requested output is aggregate counts.']
      ] },
      output: { key: 'privacy_redact', file: 'public-summary.txt', text: 'BEACON PUBLIC SUMMARY\nNorth: 2 requests\nSouth: 1 request\nExcluded: resident names, contact tokens, internal notes. Fictional training data.' },
      fs: { '/': { 'sharing-brief.txt': 'Purpose: publish counts of support requests by district. Do not publish names, contact details or internal notes. Keep source records within the authorised lab.', 'residents.csv': 'name,district,contact,note\nResident A,North,SIM-CONTACT-A,internal\nResident B,South,SIM-CONTACT-B,internal\nResident C,North,SIM-CONTACT-C,internal', 'public-summary.txt': '' } },
      takeaway: 'You matched the shared output to its purpose and left personal source fields out of the public summary.'
    },
    {
      id: 16, host: 'beacon-response', title: 'Beacon Holds the Line', bg: 'bg-final-node.png',
      principle: 'A response combines evidence, scoped containment, verified recovery and a clear account of what is known.',
      mission: 'Bit returns as your adviser. An unusual kiosk session now threatens Beacon operations. Preserve its timeline, contain the identified path, then compile the earlier recovery and privacy evidence into a final report. Campaign mode has a containment timer; practice is untimed.',
      objectives: [['connect_beacon', 'Connect to beacon-response.'], ['beacon_read', 'Read incident.log and response-plan.txt.'], ['beacon_preserve', 'Preserve incident.log.'], ['beacon_decision', 'Choose the evidence-led containment response.'], ['beacon_report', 'Run ReportKit using the collected Beacon evidence.'], ['submit_academy', 'Submit the final report.']],
      reads: { beacon_read: ['incident.log', 'response-plan.txt'] }, trace: true,
      decision: { key: 'beacon_decision', requires: ['beacon_read', 'beacon_preserve'], choices: [
        ['erase-logs', 'Erase the timeline and restart every service', false, 'Erasing logs loses evidence and a broad restart ignores the identified source. Preserve the timeline and contain the affected path.'],
        ['scoped-response', 'Preserve evidence, isolate the kiosk path and use verified recovery', true, 'The response follows the observed timeline, limits the affected path and uses the verified recovery work from earlier chapters.'],
        ['blame-volunteer', 'Accuse a volunteer without checking the timeline', false, 'An attribution requires evidence. The timeline identifies a session and path, not a person to blame.']
      ] },
      fs: { '/': { 'incident.log': '09:00 kiosk token used outside its task\n09:02 unusual kiosk -> internal requests\n09:04 clinic appointments still healthy\nNo evidence identifying a responsible person.', 'response-plan.txt': 'Preserve incident.log. Contain the kiosk path and protect clinic service. Assemble identity-report.txt, restore-report.txt and public-summary.txt collected earlier, then run ReportKit and submit report.' } },
      takeaway: 'You combined evidence preservation, limited containment, verified recovery and careful reporting.'
    }
  ];
  // Action results remain visible when a player reopens the simulated files.
  const access = chapters.find(ch => ch.id === 11);
  access.output.edits = { 'permissions.txt': 'volunteer: timetable=read payroll=none backups=none\nfinance: payroll=edit\nrecovery: backups=admin' };
  const recovery = chapters.find(ch => ch.id === 12);
  const timetable = 'id,status\n' + Array.from({ length: 48 }, (_, i) => `SIM-${String(i + 1).padStart(3, '0')},restored`).join('\n');
  recovery.fs['/']['backup-clean.snap'] += '\nDATA\n' + timetable;
  recovery.fs['/']['restored-timetable.csv'] = '';
  recovery.output.edits = { 'restored-timetable.csv': timetable };
  const segment = chapters.find(ch => ch.id === 14);
  segment.output.edits = { 'routes.txt': 'kiosk-net -> internal-net: blocked\nclinic-net -> appointments: authorised\nresponder-net -> logs: authorised' };
  const tools = {
    MailLens: { label: 'MailLens', unlock: 9, desc: 'Compares message headers with the trusted directory.' },
    AccessReview: { label: 'AccessReview', unlock: 10, desc: 'Reviews recovery checks and role permissions.' },
    RestoreLab: { label: 'RestoreLab', unlock: 12, desc: 'Compares backup integrity records in the recovery lab.' },
    PatchPlan: { label: 'PatchPlan', unlock: 13, desc: 'Compares update exposure, impact and recovery plans.' },
    SegmentSim: { label: 'SegmentSim', unlock: 14, desc: 'Tests a limited containment boundary.' },
    PrivacyLens: { label: 'PrivacyLens', unlock: 15, desc: 'Creates the permitted summary after a sharing decision.' }
  };
  return { chapters, tools };
});

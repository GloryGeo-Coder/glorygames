(() => {
  'use strict';

  const GAME_SLUG = 'cyber-shield-academy';

  const $ = sel => document.querySelector(sel);
  const terminalOutput = $('#terminalOutput');
  const form = $('#terminalForm');
  const input = $('#cmdInput');
  const compactLayout = window.matchMedia('(max-width: 1160px)');
  const panelTabs = [...document.querySelectorAll('[data-panel]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  let selectedPanel = 'terminal';

  function selectPanel(name, focusTab = false) {
    selectedPanel = name;
    panelTabs.forEach(tab => {
      const active = tab.dataset.panel === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });
    panels.forEach(panel => { panel.hidden = compactLayout.matches && panel.id !== `panel-${name}`; });
  }

  function focusCommand() {
    input.focus({ preventScroll: true });
  }

  function draftCommand(command) {
    selectPanel('terminal');
    input.value = command;
    focusCommand();
  }

  function recallCommand(direction) {
    state.historyIndex = Math.max(0, Math.min(state.history.length, state.historyIndex + direction));
    input.value = state.history[state.historyIndex] || '';
  }

  function resizeAcademy() {
    // Follow the visible area when the software keyboard or browser bars resize it.
    const height = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--academy-height', `${height}px`);
    document.documentElement.setAttribute('data-short-viewport', String(height <= 500));
  }

  function moveFullscreenControl() {
    document.querySelectorAll('#startOverlay .wga-tab-fullscreen, #startOverlay .wga-tab-status')
      .forEach(control => $('#caseMenu').appendChild(control));
  }

  const ui = {
    score: $('#scoreValue'),
    trust: $('#trustValue'),
    trace: $('#traceValue'),
    level: $('#levelValue'),
    mission: $('#missionText'),
    objectives: $('#objectiveList'),
    principle: $('#principleText'),
    map: $('#networkMap'),
    files: $('#fileTree'),
    tools: $('#toolList'),
    badge: $('#connectionBadge'),
    prompt: $('#promptLabel'),
    startOverlay: $('#startOverlay'),
    startBtn: $('#startBtn'),
    overlayStartBtn: $('#overlayStartBtn'),
    hintBtn: $('#hintBtn'),
    muteBtn: $('#muteBtn'),
    resetBtn: $('#resetBtn'),
    submitBtn: $('#submitBtn')
  };

  const safeNotice = 'Training note: every host and tool in this game is simulated. Use these skills only in systems where you have permission.';

  const TOOLS = {
    ScanKit: { label: 'ScanKit', unlock: 1, desc: 'Maps simulated hosts and services.' },
    ProbeLite: { label: 'ProbeLite', unlock: 1, desc: 'Identifies defensive layers in the lab.' },
    PortPatch: { label: 'PortPatch', unlock: 2, desc: 'Solves a simulated service-hardening puzzle.' },
    LogAudit: { label: 'LogAudit', unlock: 3, desc: 'Reviews and preserves security logs.' },
    HashCheck: { label: 'HashCheck', unlock: 4, desc: 'Verifies file integrity by comparing hashes.' },
    ProxyBalance: { label: 'ProxyBalance', unlock: 5, desc: 'Balances simulated proxy load in a lab-safe puzzle.' },
    CryptoLens: { label: 'CryptoLens', unlock: 6, desc: 'Solves toy ciphers used in the story.' },
    ReportKit: { label: 'ReportKit', unlock: 7, desc: 'Builds a final incident report.' }
  };

  const chapters = [
    {
      id: 1,
      title: 'Orientation: ShieldOS',
      host: 'local',
      bg: 'bg-terminal-lab.png',
      principle: 'Ethical hacking starts with authorization, scope, documentation, and safety.',
      mission: 'Join the Cyber Shield group and learn to navigate the training terminal. The first clue about Bit is hidden in the local case files.',
      objectives: [
        ['list_home', 'Use ls to list files in your home directory.'],
        ['read_brief', 'Use cat briefing.txt to read your authorization brief.'],
        ['read_case', 'Use cat case_bit.txt to inspect the first clue.']
      ],
      hint: 'Try: ls, then cat briefing.txt, then cat case_bit.txt.',
      fs: {
        '/home/cadet': {
          'briefing.txt': 'AUTHORIZATION BRIEF\\nScope: Cyber Shield Academy training lab only.\\nGoal: learn defensive investigation skills through simulated UNIX-like commands.\\nRule: document actions, preserve evidence, and never target real systems.\\nCommand tip: use ls, cd, cat, grep, network, status, inventory.',
          'case_bit.txt': 'CASE BIT\\nBit created ShieldOS, then disappeared after warning about a hidden weakness called ORCHID.\\nLast known note: \"Trust the logs. The noisy node is not always the guilty node.\"\\nNext step: open the network map.'
        },
        '/tools': {
          'ScanKit.exe': 'Simulated scanner. Command: run ScanKit',
          'ProbeLite.exe': 'Simulated probe. Command: run ProbeLite'
        }
      }
    },
    {
      id: 2,
      title: 'Recon Without Trespass',
      host: 'atlas-gateway',
      bg: 'bg-network-map.png',
      principle: 'Reconnaissance must stay inside the agreed scope. Scanning without permission is not acceptable.',
      mission: 'Connect to the Atlas Gateway and use safe scan/probe commands to map its simulated defenses.',
      objectives: [
        ['connect_atlas', 'connect atlas-gateway'],
        ['scan_atlas', 'scan atlas-gateway'],
        ['probe_atlas', 'probe atlas-gateway'],
        ['run_portpatch', 'run PortPatch']
      ],
      hint: 'Try: network, connect atlas-gateway, scan atlas-gateway, probe atlas-gateway, run PortPatch.',
      defenses: { firewall: 2, ports: ['22/sim-ssh', '443/sim-web'], proxy: 0 },
      fs: {
        '/': { 'banner.txt': 'ATLAS GATEWAY\\nAuthorized lab node. Use probe results to choose a safe simulated tool.' },
        '/logs': { 'access.log': 'cadet connected under training token CSA-ALLOW-01.' }
      }
    },
    {
      id: 3,
      title: 'Log Integrity',
      host: 'archive-node',
      bg: 'bg-case-bit.png',
      principle: 'Good responders preserve logs and create evidence chains instead of hiding activity.',
      mission: 'Access the archive node, review logs, and preserve the suspicious entry linked to Bit.',
      objectives: [
        ['connect_archive', 'connect archive-node'],
        ['scan_archive', 'scan archive-node'],
        ['cat_logs', 'cat /logs/access.log'],
        ['preserve_logs', 'preserve /logs/access.log']
      ],
      hint: 'Try: connect archive-node, scan archive-node, cd /logs, cat access.log, preserve access.log.',
      defenses: { firewall: 1, ports: ['443/sim-web'], proxy: 0 },
      fs: {
        '/': { 'readme.txt': 'Archive node for training evidence.' },
        '/logs': {
          'access.log': '02:14 user=bit action=commit hash=8fa3\\n02:18 user=orchid action=config-change hash=??\\n02:21 user=bit action=warning \"verify kernel.sig\"'
        },
        '/evidence': { 'chain.txt': 'Evidence chain is empty until you preserve relevant files.' }
      }
    },
    {
      id: 4,
      title: 'Hash Verification',
      host: 'kernel-vault',
      bg: 'bg-terminal-lab.png',
      principle: 'Integrity checks help confirm whether a file was altered.',
      mission: 'The ShieldOS kernel signature may have changed. Verify the signature and analyze the warning file.',
      objectives: [
        ['connect_kernel', 'connect kernel-vault'],
        ['run_hash', 'hash kernel.sig'],
        ['analyze_warning', 'analyze warning.memo'],
        ['download_evidence', 'collect warning.memo']
      ],
      hint: 'Try: connect kernel-vault, ls, cat warning.memo, hash kernel.sig, analyze warning.memo, collect warning.memo.',
      defenses: { firewall: 2, ports: ['22/sim-ssh', '443/sim-web'], proxy: 0 },
      fs: {
        '/': {
          'kernel.sig': 'sha256: SIM-4F77-ORCHID-MISMATCH',
          'warning.memo': 'Bit note: ORCHID is not malware. It is a governance bypass hidden as an update scheduler.'
        }
      }
    },
    {
      id: 5,
      title: 'Proxy Balance Lab',
      host: 'proxy-ring',
      bg: 'bg-proxy-lab.png',
      principle: 'Availability matters. Security teams test resilience in controlled labs, not against real services.',
      mission: 'A simulated proxy buffer blocks the path. Use the lab-safe ProxyBalance puzzle to stabilize it.',
      objectives: [
        ['connect_proxy', 'connect proxy-ring'],
        ['scan_proxy', 'scan proxy-ring'],
        ['probe_proxy', 'probe proxy-ring'],
        ['balance_proxy', 'run ProxyBalance alpha beta gamma']
      ],
      hint: 'Try: connect proxy-ring, scan proxy-ring, probe proxy-ring, run ProxyBalance alpha beta gamma.',
      defenses: { firewall: 2, ports: ['443/sim-web'], proxy: 3 },
      fs: {
        '/': { 'proxy.txt': 'Proxy buffer puzzle: three lab agents named alpha, beta, gamma must be balanced together.' },
        '/logs': { 'proxy.log': 'buffer=high agents=[alpha,beta,gamma] expected=balanced' }
      }
    },
    {
      id: 6,
      title: 'Toy Cipher Trail',
      host: 'cipher-bay',
      bg: 'bg-case-bit.png',
      principle: 'Cryptography is not magic. Use clear assumptions, verify results, and avoid inventing evidence.',
      mission: 'Bit left a toy cipher for the Academy. Decode it to reveal the next server.',
      objectives: [
        ['connect_cipher', 'connect cipher-bay'],
        ['cat_cipher', 'cat cipher.txt'],
        ['run_crypto', 'run CryptoLens cipher.txt'],
        ['collect_cipher', 'collect decoded_note.txt']
      ],
      hint: 'Try: connect cipher-bay, cat cipher.txt, run CryptoLens cipher.txt, cat decoded_note.txt, collect decoded_note.txt.',
      defenses: { firewall: 1, ports: ['443/sim-web'], proxy: 0 },
      fs: {
        '/': {
          'cipher.txt': 'Toy cipher: shift each letter back by 1. psdije-sppu',
          'decoded_note.txt': ''
        }
      }
    },
    {
      id: 7,
      title: 'Containment Timer',
      host: 'orchid-relay',
      bg: 'bg-proxy-lab.png',
      principle: 'Incident response focuses on containment, least privilege, and audited recovery.',
      mission: 'The relay starts a simulated trace timer. Contain the session by reviewing logs and locking a risky token.',
      objectives: [
        ['connect_relay', 'connect orchid-relay'],
        ['run_logaudit', 'run LogAudit'],
        ['lock_token', 'lock token-orchid'],
        ['preserve_relay', 'preserve /logs/session.log']
      ],
      hint: 'Try: connect orchid-relay, run LogAudit, cat /logs/session.log, lock token-orchid, preserve /logs/session.log.',
      trace: true,
      defenses: { firewall: 3, ports: ['22/sim-ssh', '443/sim-web'], proxy: 1 },
      fs: {
        '/': { 'token-orchid': 'STATUS=RISKY\\nprivilege=overbroad\\nowner=unknown' },
        '/logs': { 'session.log': 'relay opened by unknown scheduler. recommended action: lock token-orchid, preserve session.log' }
      }
    },
    {
      id: 8,
      title: 'Root of Trust',
      host: 'root-of-trust',
      bg: 'bg-final-node.png',
      principle: 'The strongest systems combine technical controls with governance, accountability, and review.',
      mission: 'Finish the case by compiling the evidence report. The answer is not a villain; it is a broken approval process.',
      objectives: [
        ['connect_root', 'connect root-of-trust'],
        ['cat_final', 'cat final.txt'],
        ['report', 'run ReportKit'],
        ['submit_case', 'submit report']
      ],
      hint: 'Try: connect root-of-trust, cat final.txt, inventory, run ReportKit, submit report.',
      defenses: { firewall: 1, ports: ['443/sim-web'], proxy: 0 },
      fs: {
        '/': { 'final.txt': 'Bit found that ORCHID bypassed review because emergency updates had weak approval controls. Your report must recommend stronger change management, audit review, and least privilege.' }
      }
    }
  ];

  chapters.push(...window.CyberCampaign.chapters);
  Object.assign(TOOLS, window.CyberCampaign.tools);
  const progress = window.CyberProgress;
  let storage = null;
  try { storage = window.localStorage; } catch {}
  const preferences = progress.preferences(storage);
  let mode = 'campaign', checkpoints = {}, campaignSave = null, practiceSave = null;
  let resumePending = false, saveAvailable = true;
  let mapSignature = '', learningSignature = '', toolsLevel = -1, filesHost = '', practiceFrontier = -1;
  let state;
  let AC = null;
  let master = null;
  let musicTimer = null;
  let ambient = null;

  function freshState() {
    return {
      started: false,
      muted: false,
      score: 0,
      trust: 100,
      trace: 0,
      levelIndex: 0,
      cwd: '/home/cadet',
      connected: 'local',
      rooted: false,
      completed: {},
      evidence: [],
      history: [],
      historyIndex: 0,
      files: {},
      defenses: {},
      unlocked: ['local'],
      commandCount: 0,
      lastCommand: '',
      pendingReport: false,
      caseClosed: false,
      academyClosed: false, practiceComplete: false, retries: 0, hints: {}, mistakes: [], readFiles: [], transcript: [],
      gameOver: false
    };
  }

  function cloneFS(fs) {
    return JSON.parse(JSON.stringify(fs || {}));
  }

  function currentChapter() {
    return chapters[state.levelIndex] || chapters[0];
  }

  function currentFS() {
    return state.files[state.connected] || {};
  }

  function currentDefenses() {
    return state.defenses[state.connected] || { firewall: 0, proxy: 0, ports: [] };
  }

  function pathNormalize(path) {
    if (!path || path === '.') return state.cwd;
    if (path === '~') return '/home/cadet';
    let full = path.startsWith('/') ? path : (state.cwd.replace(/\/$/, '') + '/' + path);
    const parts = [];
    full.split('/').forEach(p => {
      if (!p || p === '.') return;
      if (p === '..') parts.pop();
      else parts.push(p);
    });
    return '/' + parts.join('/');
  }

  function dirAt(path) {
    const fs = currentFS();
    const clean = pathNormalize(path);
    if (clean === '/') return fs['/'] || {};
    return fs[clean] || null;
  }

  function fileAt(path) {
    const clean = pathNormalize(path);
    const dir = clean.includes('/') ? clean.slice(0, clean.lastIndexOf('/')) || '/' : state.cwd;
    const file = clean.split('/').pop();
    const obj = dirAt(dir);
    if (obj && Object.prototype.hasOwnProperty.call(obj, file)) return obj[file];
    return null;
  }

  function fileExists(path) {
    return fileAt(path) !== null;
  }

  function mark(key, points = 75) {
    if (state.completed[key]) return;
    state.completed[key] = true;
    state.score += points;
    sfx('good');
    syncUI();
    checkLevelComplete();
  }

  function line(text = '', cls = '') {
    const div = document.createElement('div');
    div.className = `line ${cls}`.trim();
    state.transcript.push({ text: String(text), cls });
    if (state.transcript.length > 100) state.transcript.shift();
    div.textContent = String(text).replace(/\\n/g, '\n');
    terminalOutput.appendChild(div);
    if (terminalOutput.childElementCount > 180) terminalOutput.firstElementChild.remove();
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function typeLines(lines, cls = '') {
    lines.forEach(l => line(l, cls));
  }

  function clearTerminal() {
    terminalOutput.innerHTML = '';
    state.transcript = [];
  }

  function help() {
    typeLines([
      'Core commands:',
      '  help                 show this help',
      '  briefing             show current mission',
      '  missions             list all chapters',
      '  status               show score, trust, trace, connection',
      '  network              display available lab hosts',
      '  inventory            show tools and evidence',
      '',
      'UNIX-like navigation:',
      '  pwd                  print current directory',
      '  ls [path]            list directory contents',
      '  cd <path>            change directory',
      '  cat <file>           read a file',
      '  grep <term> <file>   search within a file',
      '',
      'Simulated security lab commands:',
      '  connect <host>       connect to an authorized lab host',
      '  scan <host>          map services in the simulated node',
      '  probe <host>         identify defensive layers',
      '  run <tool> [args]    run a simulated tool from your toolkit',
      '  hash <file>          verify a file signature',
      '  analyze <file>       interpret an evidence file',
      '  preserve <file>      preserve a log/evidence file',
      '  collect <file>       add a file to your case evidence',
      '  lock <token>         contain an overprivileged lab token',
      '  submit report        submit the current case report',
      '  decide <choice>      make a mission decision after reviewing evidence',
      '  restore <snapshot>   test an approved recovery snapshot',
      '  hint                 reveal the next hint for the current objective',
      '  debrief              review skills, hints and choices',
      '  retry                retry this chapter from its checkpoint',
      '',
      'Autocomplete: press Tab to complete commands, files, hosts, and tools.'
    ], 'dim');
  }

  function banner() {
    clearTerminal();
    typeLines([
      '  ____      _                 ____  _     _      _     _ ',
      ' / ___|   _| |__   ___ _ __  / ___|| |__ (_) ___| | __| |',
      '| |  | | | | `_ \\ / _ \\ `__| \\___ \\| `_ \\| |/ _ \\ |/ _` |',
      '| |__| |_| | |_) |  __/ |     ___) | | | | |  __/ | (_| |',
      ' \\____\\__, |_.__/ \\___|_|    |____/|_| |_|_|\\___|_|\\__,_|',
      '      |___/                                                ',
      '',
      'Welcome to ShieldOS Terminal Ops. ' + safeNotice,
      'Type help or briefing to begin.'
    ], 'ascii');
  }

  function initialState() {
    const fresh = freshState();
    fresh.muted = preferences.muted;
    chapters.forEach(ch => {
      fresh.files[ch.host] = cloneFS(ch.fs);
      fresh.defenses[ch.host] = { ...(ch.defenses || { firewall: 0, proxy: 0, ports: [] }), scanned: false, probed: false };
    });
    fresh.defenses.local.scanned = true;
    fresh.defenses.local.probed = true;
    fresh.unlocked = ['local'];
    return fresh;
  }

  function hydrate(snapshot) {
    mapSignature = ''; learningSignature = ''; toolsLevel = -1; filesHost = '';
    const fresh = initialState();
    if (snapshot) {
      const restored = progress.snapshot(snapshot, chapters, mode === 'practice');
      const defenseFlags = restored.defenses;
      delete restored.defenses;
      Object.assign(fresh, restored);
      Object.entries(defenseFlags).forEach(([host, flags]) => Object.assign(fresh.defenses[host], flags));
      fresh.historyIndex = fresh.history.length;
      fresh.unlocked = chapters.slice(0, fresh.levelIndex + 1).map(ch => ch.host);
      if (fresh.completed.run_portpatch) { fresh.defenses['atlas-gateway'].firewall = 0; fresh.rooted = fresh.connected === 'atlas-gateway'; }
      if (fresh.completed.balance_proxy) fresh.defenses['proxy-ring'].proxy = 0;
      if (fresh.completed.run_crypto) fresh.files['cipher-bay']['/']['decoded_note.txt'] = 'Decoded note: orchid-root is the final review path. The weakness is governance, not a monster.';
      if (fresh.completed.lock_token) fresh.files['orchid-relay']['/']['token-orchid'] = 'STATUS=LOCKED\nprivilege=disabled\nowner=incident-response';
      chapters.forEach(ch => {
        if (ch.output && fresh.completed[ch.output.key]) {
          fresh.files[ch.host]['/'][ch.output.file] = ch.output.text;
          Object.assign(fresh.files[ch.host]['/'], ch.output.edits || {});
        }
      });
    }
    return fresh;
  }

  function checkpoint() {
    const saved = progress.snapshot(state, chapters, mode === 'practice');
    saved.transcript = []; saved.history = [];
    checkpoints[state.levelIndex] = saved;
  }

  function sessionCaption() {
    const label = mode === 'practice' ? 'Untimed practice · Unranked' : 'Campaign · Case BIT & Beacon';
    return saveAvailable ? label : `${label} · Saving unavailable`;
  }

  function saveProgress() {
    if (!state.started) return;
    const value = { version: 1, state: progress.snapshot(state, chapters, mode === 'practice'), checkpoints };
    if (mode === 'campaign') campaignSave = value; else practiceSave = value;
    preferences.muted = state.muted; preferences.mode = mode;
    saveAvailable = progress.write(storage, progress.keys[mode], value);
    progress.write(storage, progress.keys.preferences, { muted: state.muted, mode });
    const notice = saveAvailable ? 'Progress saved on this browser.' : 'Browser saving is unavailable. Keep this tab open to retain progress.';
    if ($('#saveStatus').textContent !== notice) $('#saveStatus').textContent = notice;
    $('#sessionLabel').textContent = sessionCaption();
  }

  function startGame() {
    const transcript = resumePending ? [...state.transcript] : [];
    state.started = true;
    $('#app').inert = false;
    selectPanel('terminal');
    moveFullscreenControl();
    ui.startOverlay.classList.remove('active');
    banner();
    if (resumePending) {
      line(`Resumed chapter ${currentChapter().id}: ${currentChapter().title}. Earlier evidence and objectives restored.`, 'ok');
      transcript.slice(-30).forEach(row => line(row.text, row.cls));
    }
    briefing();
    if (state.gameOver) line('Containment timed out. Retry this chapter from Case controls, or use untimed practice.', 'warn');
    resumePending = false;
    startMusic();
    if (window.matchMedia('(pointer: fine)').matches) focusCommand();
    syncUI(); saveProgress();
  }

  function setup(load = true) {
    campaignSave = load ? progress.read(storage, progress.keys.campaign, chapters) : null;
    practiceSave = load ? progress.read(storage, progress.keys.practice, chapters, true) : null;
    mode = load && preferences.mode === 'practice' && practiceSave && practiceSave.state.levelIndex <= (campaignSave?.state.levelIndex || 0) ? 'practice' : 'campaign';
    const saved = mode === 'practice' ? practiceSave : campaignSave;
    state = hydrate(saved?.state);
    checkpoints = cloneFS(saved?.checkpoints);
    if (!checkpoints[state.levelIndex]) checkpoint();
    resumePending = !!saved;
    selectPanel('terminal');
    terminalOutput.innerHTML = '';
    syncUI();
    ui.overlayStartBtn.textContent = saved ? 'Continue Investigation' : 'Enter ShieldOS';
    $('#resumeSummary').textContent = saved ? `${mode === 'practice' ? 'Untimed practice' : 'Campaign'} · Chapter ${currentChapter().id} / ${chapters.length} · ${currentChapter().title}` : '16 missions · Saved checkpoints · Untimed practice';
  }

  function retryChapter(ask = true) {
    if (ask && !window.confirm('Retry this chapter? Its current work and points will reset. Earlier chapters and evidence remain.')) return;
    const entry = checkpoints[state.levelIndex];
    if (!entry) return line('This chapter has no checkpoint. Continue the investigation or start a new campaign.', 'warn');
    const learning = { hints: state.hints, mistakes: state.mistakes, retries: state.retries + 1, muted: state.muted };
    state = hydrate(entry);
    Object.assign(state, learning);
    resumePending = false;
    $('#caseActions').open = false;
    startGame();
    line('Chapter checkpoint restored. Earlier chapters and evidence are safe.', 'ok');
    saveProgress();
  }

  function startPractice() {
    if (state.started) saveProgress();
    const index = Number($('#practiceSelect').value || 0);
    const max = campaignSave?.state.levelIndex || (mode === 'campaign' ? state.levelIndex : 0);
    if (!Number.isInteger(index) || index < 0 || index > max) return;
    const entry = campaignSave?.checkpoints[index] || (mode === 'campaign' ? checkpoints[index] : null);
    if (!entry) return;
    mode = 'practice'; checkpoints = { [index]: cloneFS(entry) };
    state = hydrate(entry); state.trace = 0; state.gameOver = false;
    resumePending = false; $('#caseActions').open = false;
    startGame();
    line('UNTIMED PRACTICE: no trace countdown, no leaderboard submissions. Campaign progress stays separate.', 'ok');
    saveProgress();
  }

  function returnToCampaign() {
    if (state.started) saveProgress();
    mode = 'campaign'; checkpoints = cloneFS(campaignSave?.checkpoints);
    state = hydrate(campaignSave?.state);
    if (!checkpoints[state.levelIndex]) checkpoint();
    resumePending = !!campaignSave; $('#caseActions').open = false;
    startGame();
  }

  function debrief() {
    line(`${mode === 'practice' ? 'PRACTICE' : 'CAMPAIGN'} LEARNING REVIEW`, 'story');
    chapters.filter(ch => ch.objectives.every(([key]) => state.completed[key])).forEach(ch => {
      const hintCount = ch.objectives.reduce((sum, [key]) => sum + (state.hints[key] || 0), 0);
      const choices = state.mistakes.filter(key => key.startsWith(`${ch.id}:`)).length;
      line(`${ch.id}. ${ch.title}: ${ch.takeaway || ch.principle} Hints: ${hintCount}; choices to revisit: ${choices}.`, 'ok');
    });
    line(`Chapter retries: ${state.retries}. Use untimed practice to revisit any unlocked chapter.`, 'dim');
  }

  function chapterForHost(host) {
    return chapters.find(ch => ch.host === host);
  }

  function unlockNextHost() {
    const next = chapters[state.levelIndex + 1];
    if (next && !state.unlocked.includes(next.host)) state.unlocked.push(next.host);
  }

  function checkLevelComplete() {
    const ch = currentChapter();
    if (!ch.objectives.every(([key]) => state.completed[key])) return;
    line(`Chapter complete: ${ch.title}`, 'ok');
    line(`Learned: ${ch.takeaway || ch.principle}`, 'story');
    sfx('level');
    if (mode === 'practice') {
      state.practiceComplete = true;
      line('Practice complete. Retry this chapter, choose another unlocked chapter, or return to campaign in Case controls.', 'ok');
    } else if (state.levelIndex < chapters.length - 1) {
      unlockNextHost();
      state.levelIndex += 1;
      $('#practiceSelect').value = String(state.levelIndex);
      $('#panel-mission').scrollTop = 0;
      if (selectedPanel === 'mission') $('#panel-mission').focus({ preventScroll: true });
      $('#learningFeedback').textContent = 'New mission ready. Review its evidence before choosing a response.';
      state.trace = 0;
      checkpoint();
      line(`Next mission: ${currentChapter().title}. Connect to ${currentChapter().host} when ready.`, 'story');
    } else {
      line('ACADEMY COMPLETE: Beacon is protected. Type debrief to review the skills you learned.', 'ok');
    }
    syncUI();
  }

  function briefing() {
    const ch = currentChapter();
    line(`MISSION ${ch.id}: ${ch.title}`, 'story');
    line(ch.mission, 'dim');
    line('Objectives:', 'warn');
    ch.objectives.forEach(([, text]) => line(`  - ${text}`, 'dim'));
    line(`Principle: ${ch.principle}`, 'ok');
  }

  function network() {
    line('Authorized lab network:', 'story');
    chapters.forEach((ch, idx) => {
      const unlocked = state.unlocked.includes(ch.host);
      const active = state.connected === ch.host ? '*' : ' ';
      const status = state.completed[ch.objectives[ch.objectives.length - 1][0]] ? 'complete' : unlocked ? 'available' : 'locked';
      line(`${active} ${ch.host.padEnd(16)} ${status.padEnd(10)} ${ch.title}`, unlocked ? 'ok' : 'dim');
    });
  }

  function status() {
    const d = currentDefenses();
    typeLines([
      `user: cadet`,
      `host: ${state.connected}`,
      `cwd: ${state.cwd}`,
      `score: ${state.score}`,
      `trust: ${state.trust}`,
      `trace: ${state.trace}%`,
      `defense: firewall=${d.firewall || 0}, proxy=${d.proxy || 0}, scanned=${!!d.scanned}, probed=${!!d.probed}`,
      `evidence items: ${state.evidence.length}`
    ], 'dim');
  }

  function inventory() {
    line('Toolkit:', 'story');
    Object.values(TOOLS).forEach(tool => {
      const ready = tool.unlock <= currentChapter().id;
      line(`  ${ready ? '✓' : '·'} ${tool.label.padEnd(13)} ${ready ? tool.desc : 'locked until later chapter'}`, ready ? 'ok' : 'dim');
    });
    line('Evidence:', 'story');
    if (!state.evidence.length) line('  No evidence collected yet.', 'dim');
    state.evidence.forEach(e => line(`  ✓ ${e}`, 'ok'));
  }

  function runLs(args) {
    const path = args[0] || state.cwd;
    const dir = dirAt(path);
    if (!dir) return line(`ls: cannot access ${path}`, 'bad');
    Object.keys(dir).sort().forEach(name => {
      const full = (pathNormalize(path).replace(/\/$/, '') + '/' + name).replace('//','/');
      const isDir = !!dirAt(full);
      line(`${isDir ? 'dir ' : 'file'}  ${name}`, isDir ? 'ok' : 'dim');
    });
    if (state.connected === 'local' && pathNormalize(path) === '/home/cadet') mark('list_home', 50);
  }

  function runCd(args) {
    const path = args[0] || '/home/cadet';
    const dir = dirAt(path);
    if (!dir) return line(`cd: no such directory: ${path}`, 'bad');
    state.cwd = pathNormalize(path);
    line(state.cwd, 'ok');
  }

  function runCat(args) {
    const path = args.join(' ');
    if (!path) return line('cat: missing file', 'bad');
    const content = fileAt(path);
    if (content === null) return line(`cat: ${path}: no such file`, 'bad');
    line(String(content), 'dim');

    const clean = pathNormalize(path);
    const hostChapter = chapterForHost(state.connected);
    Object.entries(hostChapter.reads || {}).forEach(([key, files]) => {
      const name = clean.split('/').pop();
      if (files.includes(name) && !state.readFiles.includes(`${state.connected}:${name}`)) state.readFiles.push(`${state.connected}:${name}`);
      if (files.every(file => state.readFiles.includes(`${state.connected}:${file}`))) mark(key, 100);
    });
    if (state.connected === 'local' && clean.endsWith('/briefing.txt')) mark('read_brief', 100);
    if (state.connected === 'local' && clean.endsWith('/case_bit.txt')) mark('read_case', 120);
    if (state.connected === 'archive-node' && clean.endsWith('/logs/access.log')) mark('cat_logs', 100);
    if (state.connected === 'cipher-bay' && clean.endsWith('/cipher.txt')) mark('cat_cipher', 90);
    if (state.connected === 'root-of-trust' && clean.endsWith('/final.txt')) mark('cat_final', 100);
  }

  function runGrep(args) {
    if (args.length < 2) return line('grep: usage grep <term> <file>', 'bad');
    const [term, ...rest] = args;
    const content = fileAt(rest.join(' '));
    if (content === null) return line(`grep: ${rest.join(' ')}: no such file`, 'bad');
    String(content).split(/\n/).forEach((l, i) => {
      if (l.toLowerCase().includes(term.toLowerCase())) line(`${i+1}: ${l}`, 'ok');
    });
  }

  function connect(args) {
    const host = args[0];
    if (!host) return line('connect: missing host', 'bad');
    if (!state.unlocked.includes(host)) return line(`connect: ${host} is outside current authorization scope.`, 'bad');
    if (!state.files[host]) return line(`connect: unknown lab host ${host}`, 'bad');

    state.connected = host;
    const ch = chapterForHost(host);
    state.cwd = host === 'local' ? '/home/cadet' : '/';
    state.rooted = false;
    line(`Connected to ${host} using training token.`, 'ok');
    sfx('good');

    if (host === 'atlas-gateway') mark('connect_atlas', 80);
    if (host === 'archive-node') mark('connect_archive', 80);
    if (host === 'kernel-vault') mark('connect_kernel', 80);
    if (host === 'proxy-ring') mark('connect_proxy', 80);
    if (host === 'cipher-bay') mark('connect_cipher', 80);
    if (host === 'orchid-relay') { mark('connect_relay', 80); activateTrace(); }
    if (host === 'root-of-trust') mark('connect_root', 80);
    if (ch.id > 8) { mark(ch.objectives[0][0], 80); if (ch.trace && !state.completed.beacon_decision) activateTrace(); }

    syncUI();
  }

  function scan(args) {
    const host = args[0] || state.connected;
    if (host !== state.connected) return line('scan: connect to the host first in this training lab.', 'bad');
    const d = currentDefenses();
    d.scanned = true;
    line(`Scan result for ${host}:`, 'story');
    line(`  services: ${(d.ports || []).join(', ') || 'local-files only'}`, 'dim');
    line(`  firewall layers: ${d.firewall || 0}`, d.firewall ? 'warn' : 'ok');
    line(`  proxy buffers: ${d.proxy || 0}`, d.proxy ? 'warn' : 'ok');
    sfx('good');

    if (host === 'atlas-gateway') mark('scan_atlas', 100);
    if (host === 'archive-node') mark('scan_archive', 100);
    if (host === 'proxy-ring') mark('scan_proxy', 100);
  }

  function probe(args) {
    const host = args[0] || state.connected;
    if (host !== state.connected) return line('probe: connect to the host first.', 'bad');
    const d = currentDefenses();
    if (!d.scanned) return line('probe: run scan first so you know what is in scope.', 'bad');
    d.probed = true;
    line(`Probe result: ${host}`, 'story');
    line(`  recommended simulated tools: ${toolRecommendation(host)}`, 'ok');
    line(`  note: probing is limited to the lab scope and writes an audit event.`, 'dim');

    if (host === 'atlas-gateway') mark('probe_atlas', 100);
    if (host === 'proxy-ring') mark('probe_proxy', 100);
  }

  function toolRecommendation(host) {
    if (host === 'atlas-gateway') return 'PortPatch';
    if (host === 'proxy-ring') return 'ProxyBalance alpha beta gamma';
    if (host === 'orchid-relay') return 'LogAudit';
    return 'LogAudit / HashCheck / ReportKit as needed';
  }

  function canUseTool(name) {
    const tool = TOOLS[name];
    if (!tool) return false;
    return tool.unlock <= currentChapter().id;
  }

  function runTool(args) {
    const toolName = args[0];
    const rest = args.slice(1);
    if (!toolName) return line('run: missing tool name', 'bad');
    const exact = Object.keys(TOOLS).find(t => t.toLowerCase() === toolName.toLowerCase());
    if (!exact) return line(`run: unknown simulated tool ${toolName}`, 'bad');
    if (!canUseTool(exact)) return line(`run: ${exact} is not unlocked yet.`, 'bad');

    const d = currentDefenses();
    const chapter = chapterForHost(state.connected);
    if (Object.hasOwn(window.CyberCampaign.tools, exact)) {
      if (chapter.tool !== exact || chapter.id !== currentChapter().id) return line(`${exact}: this tool has no task on the connected host.`, 'warn');
      const required = chapter.toolRequires || Object.keys(chapter.reads || {});
      if (!required.every(key => state.completed[key])) return line(`${exact}: review the mission evidence and required decision first.`, 'warn');
      line(chapter.analysis, 'ok');
      applyOutput(chapter, chapter.toolKey);
      mark(chapter.toolKey, 130);
      return;
    }

    if (exact === 'ScanKit') return scan([state.connected]);
    if (exact === 'ProbeLite') return probe([state.connected]);

    if (exact === 'PortPatch') {
      if (state.connected !== 'atlas-gateway') return line('PortPatch: this puzzle is for atlas-gateway.', 'bad');
      if (!d.probed) return line('PortPatch: probe the host first.', 'bad');
      d.firewall = Math.max(0, d.firewall - 2);
      d.patched = true;
      line('PortPatch solved the simulated service-hardening puzzle. Admin access is now granted for training review.', 'ok');
      state.rooted = true;
      mark('run_portpatch', 140);
      return;
    }

    if (exact === 'LogAudit') {
      line('LogAudit summary:', 'story');
      line('  suspicious scheduler: orchid', 'warn');
      line('  recommended action: preserve logs, lock risky token, write incident report', 'ok');
      if (state.connected === 'orchid-relay') mark('run_logaudit', 120);
      return;
    }

    if (exact === 'HashCheck') {
      return runHash(rest.length ? rest : ['kernel.sig']);
    }

    if (exact === 'ProxyBalance') {
      if (state.connected !== 'proxy-ring') return line('ProxyBalance: use this only in the proxy-ring lab.', 'bad');
      const wanted = ['alpha', 'beta', 'gamma'];
      const ok = wanted.every(w => rest.includes(w));
      if (!ok) return line('ProxyBalance: provide alpha beta gamma to balance the lab agents.', 'warn');
      d.proxy = 0;
      d.balanced = true;
      line('Proxy buffer stabilized in the controlled lab puzzle. No real traffic was generated.', 'ok');
      mark('balance_proxy', 160);
      return;
    }

    if (exact === 'CryptoLens') {
      const file = rest[0] || 'cipher.txt';
      if (state.connected !== 'cipher-bay' || !fileExists(file)) return line('CryptoLens: cipher.txt is not available here.', 'bad');
      state.files['cipher-bay']['/']['decoded_note.txt'] = 'Decoded note: orchid-root is the final review path. The weakness is governance, not a monster.';
      line('CryptoLens decoded the toy cipher. New file created: decoded_note.txt', 'ok');
      mark('run_crypto', 150);
      return;
    }

    if (exact === 'ReportKit') {
      if (state.connected === 'beacon-response') {
        const required = ['identity-desk:/identity-report.txt', 'recovery-vault:/restore-report.txt', 'privacy-desk:/public-summary.txt', 'beacon-response:/incident.log'];
        if (!state.completed.beacon_decision || !required.every(item => state.evidence.includes(item))) return line('ReportKit: complete containment and collect the identity, restore, public summary and incident evidence first.', 'warn');
        state.pendingReport = true;
        line('Beacon report compiled: verified identity recovery, tested restoration, minimum-data sharing, preserved timeline and scoped containment.', 'ok');
        mark('beacon_report', 200); return;
      }
      if (state.connected !== 'root-of-trust') return line('ReportKit: connect to root-of-trust first.', 'bad');
      const required = ['warning.memo', 'decoded_note.txt', '/logs/session.log'];
      const missing = required.filter(r => !state.evidence.some(e => e.endsWith(r)));
      if (missing.length) return line(`ReportKit: evidence missing: ${missing.join(', ')}`, 'warn');
      state.pendingReport = true;
      line('ReportKit compiled the case report: ORCHID bypassed governance through weak emergency change controls.', 'ok');
      mark('report', 200);
      return;
    }
  }

  function runHash(args) {
    const file = args[0];
    if (!file) return line('hash: missing file', 'bad');
    const content = fileAt(file);
    if (content === null) return line(`hash: ${file}: no such file`, 'bad');
    let sum = 0;
    String(content).split('').forEach(ch => sum = (sum + ch.charCodeAt(0) * 17) % 65535);
    const result = `SIM-${sum.toString(16).toUpperCase().padStart(4,'0')}`;
    line(`${file}: ${result}`, result.includes('4F77') ? 'warn' : 'ok');
    if (state.connected === 'kernel-vault' && pathNormalize(file).endsWith('/kernel.sig')) {
      line('Integrity note: signature contains ORCHID-MISMATCH. Analyze warning.memo next.', 'warn');
      mark('run_hash', 120);
    }
  }

  function analyze(args) {
    const file = args[0];
    if (!file) return line('analyze: missing file', 'bad');
    const content = fileAt(file);
    if (content === null) return line(`analyze: ${file}: no such file`, 'bad');
    line('Analysis:', 'story');
    if (String(content).toLowerCase().includes('governance')) {
      line('  Finding: likely process-control weakness. Recommend change review, least privilege, and audit monitoring.', 'ok');
    } else if (String(content).toLowerCase().includes('orchid')) {
      line('  Finding: ORCHID appears to be a configuration governance bypass, not a magic attack.', 'warn');
    } else {
      line('  Finding: file reviewed. No high-confidence conclusion yet.', 'dim');
    }
    if (state.connected === 'kernel-vault' && pathNormalize(file).endsWith('/warning.memo')) mark('analyze_warning', 130);
  }

  function preserve(args) {
    const file = args[0];
    if (!file) return line('preserve: missing file', 'bad');
    if (!fileExists(file)) return line(`preserve: ${file}: no such file`, 'bad');
    if (!String(fileAt(file)).trim()) return line('preserve: this evidence has not been generated yet.', 'warn');
    const clean = pathNormalize(file);
    const item = `${state.connected}:${clean}`;
    if (!state.evidence.includes(item)) state.evidence.push(item);
    line(`Evidence preserved with audit trail: ${item}`, 'ok');
    if (state.connected === 'archive-node' && clean.endsWith('/logs/access.log')) mark('preserve_logs', 140);
    if (state.connected === 'orchid-relay' && clean.endsWith('/logs/session.log')) mark('preserve_relay', 140);
    if (state.connected === 'mail-room' && clean === '/message.eml') mark('mail_preserve', 140);
    if (state.connected === 'beacon-response' && clean === '/incident.log') mark('beacon_preserve', 140);
    syncUI();
  }

  function collect(args) {
    const file = args[0];
    if (!file) return line('collect: missing file', 'bad');
    if (!fileExists(file)) return line(`collect: ${file}: no such file`, 'bad');
    const clean = pathNormalize(file);
    if (!String(fileAt(file)).trim()) return line('collect: generate or decode this evidence first.', 'warn');
    if (state.connected === 'cipher-bay' && clean === '/decoded_note.txt' && !state.completed.run_crypto) {
      return line('collect: decode the note with CryptoLens before collecting it.', 'warn');
    }
    const item = `${state.connected}:${clean}`;
    if (!state.evidence.includes(item)) state.evidence.push(item);
    line(`Collected training evidence: ${item}`, 'ok');
    if (state.connected === 'kernel-vault' && clean.endsWith('/warning.memo')) mark('download_evidence', 130);
    if (state.connected === 'cipher-bay' && clean.endsWith('/decoded_note.txt')) mark('collect_cipher', 130);
    if (state.connected === 'identity-desk' && clean === '/identity-report.txt') mark('identity_collect', 130);
    if (state.connected === 'privacy-desk' && clean === '/public-summary.txt') mark('privacy_collect', 130);
    syncUI();
  }

  function lockToken(args) {
    const token = args[0];
    if (!token) return line('lock: missing token name', 'bad');
    const content = fileAt(token);
    if (content === null) return line(`lock: ${token}: no such token`, 'bad');
    if (state.connected !== 'orchid-relay' || token !== 'token-orchid') return line('lock: token not in the current containment plan.', 'bad');
    state.files['orchid-relay']['/']['token-orchid'] = 'STATUS=LOCKED\\nprivilege=disabled\\nowner=incident-response';
    state.trace = Math.max(0, state.trace - 25);
    line('Containment complete: token-orchid locked and logged.', 'ok');
    mark('lock_token', 160);
  }

  function decide(args) {
    const chapter = currentChapter(), decision = chapter.decision;
    if (!decision || state.connected !== chapter.host) return line('decide: connect to the current mission host and read its briefing first.', 'warn');
    const choice = decision.choices.find(([id]) => id === args[0]);
    if (!choice) return line('decide: use one of the response options in the Mission panel.', 'warn');
    if (state.completed[decision.key]) return line('This response is already recorded. Retry the chapter to revisit its decision.', 'dim');
    if (!decision.requires.every(key => state.completed[key])) return line('Review and preserve the required evidence before choosing a response.', 'warn');
    line(`Feedback: ${choice[3]}`, choice[2] ? 'ok' : 'warn');
    $('#learningFeedback').textContent = choice[3];
    $('#decisionStatus').textContent = choice[3];
    if (!choice[2]) {
      const key = `${chapter.id}:${choice[0]}`;
      if (!state.mistakes.includes(key)) { state.mistakes.push(key); state.trust = Math.max(0, state.trust - 2); }
      sfx('bad'); return;
    }
    applyOutput(chapter, decision.key);
    if (decision.key === 'beacon_decision') state.trace = 0;
    mark(decision.key, 180);
  }

  function applyOutput(chapter, key) {
    if (chapter.output?.key !== key) return;
    state.files[chapter.host]['/'][chapter.output.file] = chapter.output.text;
    Object.assign(state.files[chapter.host]['/'], chapter.output.edits || {});
    filesHost = '';
  }

  function restoreBackup(args) {
    if (state.connected !== 'recovery-vault' || currentChapter().id !== 12) return line('restore: this task uses the isolated recovery-vault lab.', 'warn');
    if (!state.completed.recovery_decision || args[0] !== 'backup-clean.snap') return line('restore: verify and select backup-clean.snap before testing a restore.', 'warn');
    const chapter = currentChapter();
    applyOutput(chapter, 'recovery_restore');
    const item = `${chapter.host}:/${chapter.output.file}`;
    if (!state.evidence.includes(item)) state.evidence.push(item);
    line(chapter.output.text + '\nThe test report has been added to the evidence chain.', 'ok');
    mark('recovery_restore', 180);
  }

  function submit(args) {
    if (args[0] !== 'report') return line('submit: usage submit report', 'bad');
    if (state.connected === 'beacon-response') {
      if (state.academyClosed) return line('Academy report already closed. Completion reward recorded.', 'dim');
      if (!chapters.every(ch => ch.objectives.every(([key]) => key === 'submit_academy' || state.completed[key]))) return line('submit: finish every investigation and compile the Beacon report first.', 'warn');
      state.academyClosed = true;
      state.score += 500;
      line('BEACON PROTECTED: Bit and the community can trust your evidence-led response.', 'ok');
      mark('submit_academy', 250);
      postScore('game_won'); syncUI(); return;
    }
    if (state.caseClosed) return line('Case already closed. Your completion reward has been recorded.', 'dim');
    const done = chapters.slice(0, 8).every(ch => ch.objectives.every(([key]) => key === 'submit_case' || state.completed[key]));
    if (!state.pendingReport || !done || state.connected !== 'root-of-trust') return line('submit: complete Case BIT and compile the report with ReportKit first.', 'warn');
    state.caseClosed = true;
    line('CASE CLOSED: Bit exposed a governance weakness. Beacon now needs your help in eight new investigations.', 'ok');
    state.score += 500;
    mark('submit_case', 250);
    postScore('case_complete'); syncUI();
  }

  function activateTrace() {
    if (state.trace < 15) state.trace = 15;
    line(mode === 'practice' ? 'Untimed practice: the containment countdown is disabled.' : 'Containment timer active. Review evidence and contain the identified path. Untimed practice is available in Case controls.', 'warn');
  }

  function tickTrace() {
    if (!state.started || state.gameOver || document.hidden || mode === 'practice') return;
    const active = state.connected === 'orchid-relay' && !state.completed.lock_token || state.connected === 'beacon-response' && !state.completed.beacon_decision;
    if (!active) return;
    state.trace = Math.min(100, state.trace + (state.connected === 'beacon-response' ? .4 : 1));
    if (state.trace >= 100) {
      state.gameOver = true;
      state.trust = Math.max(0, state.trust - 20);
      line('Training lockout: containment timer expired. Retry this chapter from Case controls, or use untimed practice.', 'bad');
      postScore('game_over');
    }
    syncUI(); saveProgress();
  }

  function unknown(cmd) {
    const similar = suggestions(cmd)[0];
    line(`Unknown command: ${cmd}${similar ? `. Did you mean ${similar}?` : ''}`, 'bad');
    state.trust = Math.max(0, state.trust - 1);
  }

  function parse(inputText) {
    const parts = inputText.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    return parts.map(p => p.replace(/^"|"$/g, ''));
  }

  function execute(raw) {
    const clean = raw.trim();
    if (!clean || !state.started) return;
    if (state.gameOver && clean.toLowerCase() !== 'retry') return line('Training locked. Use Case controls → Retry Chapter, or try untimed practice.', 'warn');
    state.commandCount++;
    state.lastCommand = clean;
    state.history.push(clean);
    state.historyIndex = state.history.length;
    line(`${promptText()} ${clean}`, 'cmd');

    const [cmdRaw, ...args] = parse(clean);
    const cmd = (cmdRaw || '').toLowerCase();

    const routes = {
      help, clear: clearTerminal, briefing, missions: listMissions, status, network, inventory, hint, debrief,
      retry: () => retryChapter(), decide: () => decide(args), restore: () => restoreBackup(args),
      pwd: () => line(state.cwd, 'ok'),
      ls: () => runLs(args),
      cd: () => runCd(args),
      cat: () => runCat(args),
      grep: () => runGrep(args),
      connect: () => connect(args),
      scan: () => scan(args),
      probe: () => probe(args),
      run: () => runTool(args),
      hash: () => runHash(args),
      analyze: () => analyze(args),
      preserve: () => preserve(args),
      collect: () => collect(args),
      lock: () => lockToken(args),
      submit: () => submit(args)
    };
    if (Object.hasOwn(routes, cmd)) routes[cmd]();
    else unknown(cmd);

    syncUI();
    postScore('live'); saveProgress();
  }

  function listMissions() {
    chapters.forEach(ch => {
      const unlocked = state.unlocked.includes(ch.host);
      line(`${ch.id}. ${ch.title} — ${ch.host} [${unlocked ? 'available' : 'locked'}]`, unlocked ? 'ok' : 'dim');
    });
  }

  function promptText() {
    const host = state.connected || 'local';
    const leaf = state.cwd === '/' ? '/' : state.cwd.split('/').pop();
    return `cadet@${host}:${leaf}$`;
  }

  function syncUI() {
    ui.score.textContent = String(Math.floor(state.score));
    ui.trust.textContent = String(Math.floor(state.trust));
    ui.trace.textContent = mode === 'practice' ? 'Off' : `${Math.floor(state.trace)}%`;
    ui.level.textContent = String(currentChapter().id);
    ui.badge.textContent = state.connected;
    ui.prompt.textContent = promptText();

    const ch = currentChapter();
    $('#missionTitle').textContent = `${ch.id} / ${chapters.length} · ${ch.title}`;
    ui.startBtn.textContent = state.started ? 'Briefing' : 'Start Training';
    ui.mission.textContent = ch.mission;
    ui.principle.textContent = ch.principle;

    ui.objectives.innerHTML = '';
    ch.objectives.forEach(([key, text]) => {
      const li = document.createElement('li');
      li.textContent = text;
      if (state.completed[key]) li.classList.add('done');
      ui.objectives.appendChild(li);
    });

    renderLearning();
    const mapKey = `${state.connected}:${Object.keys(state.completed).join(',')}:${state.unlocked.join(',')}`;
    if (mapKey !== mapSignature) { mapSignature = mapKey; renderMap(); }
    if (filesHost !== state.connected) { filesHost = state.connected; renderFiles(); }
    if (toolsLevel !== state.levelIndex) { toolsLevel = state.levelIndex; renderTools(); }
    ui.muteBtn.textContent = state.muted ? 'Sound Off' : 'Sound On';
    $('#sessionLabel').textContent = sessionCaption();
    $('#returnCampaignBtn').hidden = mode !== 'practice';
    ui.submitBtn.disabled = mode === 'practice';
    ui.resetBtn.textContent = mode === 'practice' ? 'Restart Practice' : 'Reset Campaign';
    const frontier = campaignSave?.state.levelIndex ?? (mode === 'campaign' ? state.levelIndex : 0);
    if (practiceFrontier !== frontier) {
      practiceFrontier = frontier;
      const select = $('#practiceSelect'), selection = select.value;
      select.innerHTML = '';
      chapters.forEach((chapter, i) => {
        const option = document.createElement('option'); option.value = String(i);
        option.textContent = `${chapter.id}. ${chapter.title}${i > frontier ? ' · Locked' : ''}`;
        option.disabled = i > frontier; select.appendChild(option);
      });
      select.value = selection !== '' && Number(selection) <= frontier ? selection : String(frontier);
    }
  }

  function renderLearning() {
    const chapter = currentChapter(), decision = chapter.decision;
    const key = `${chapter.id}:${state.connected}:${Object.keys(state.completed).join(',')}:${state.gameOver}:${mode}`;
    if (key !== learningSignature) {
      learningSignature = key;
      $('#decisionSection').hidden = !decision;
      const focusedChoice = document.activeElement?.dataset.choice;
      $('#decisionOptions').innerHTML = '';
      if (decision) {
        const ready = state.connected === chapter.host && decision.requires.every(id => state.completed[id]);
        $('#decisionStatus').textContent = state.completed[decision.key] ? 'Response recorded. Complete the remaining objectives or continue to the next mission.' : ready ? 'Evidence reviewed. Choose the response that matches the task.' : 'Connect to this mission host and complete the evidence objectives above before choosing.';
        decision.choices.forEach(([id, label]) => {
          const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
          button.dataset.choice = id;
          button.disabled = !ready || !!state.completed[decision.key] || state.gameOver;
          button.addEventListener('click', () => { execute(`decide ${id}`); });
          $('#decisionOptions').appendChild(button);
          if (focusedChoice === id && !button.disabled) button.focus({ preventScroll: true });
        });
      }
    }
    const missing = chapter.objectives.find(([id]) => !state.completed[id]);
    const used = missing ? state.hints[missing[0]] || 0 : 0;
    ui.hintBtn.textContent = missing ? `Hint ${Math.min(3, used + 1)} / 3` : 'Review';
    if (decision && state.completed[decision.key]) $('#learningFeedback').textContent = chapter.takeaway;
  }

  function renderMap() {
    const focusedHost = document.activeElement?.dataset.host;
    ui.map.innerHTML = '';
    chapters.forEach(ch => {
      const button = document.createElement('button');
      const unlocked = state.unlocked.includes(ch.host);
      const complete = ch.objectives.every(([key]) => state.completed[key]);
      button.type = 'button';
      button.className = `node ${unlocked ? 'unlocked' : 'locked'}`;
      button.dataset.host = ch.host;
      button.disabled = !unlocked;
      if (state.connected === ch.host) button.classList.add('connected');
      if (complete) button.classList.add('rooted');
      button.setAttribute('aria-label', `${ch.title}: ${ch.host}, ${complete ? 'complete' : unlocked ? 'available' : 'locked'}`);
      button.setAttribute('aria-pressed', String(state.connected === ch.host));
      button.textContent = ch.host;
      button.title = `${ch.title} — ${ch.host}`;
      button.addEventListener('click', () => {
        execute(`connect ${ch.host}`);
        selectPanel('terminal');
        if (compactLayout.matches) terminalOutput.focus({ preventScroll: true });
      });
      ui.map.appendChild(button);
      if (focusedHost === ch.host) button.focus({ preventScroll: true });
    });
  }

  function renderFiles() {
    ui.files.innerHTML = '';
    Object.entries(currentFS()).sort(([a], [b]) => a.localeCompare(b)).forEach(([dir, files]) => {
      const heading = document.createElement('h3');
      heading.textContent = dir;
      ui.files.appendChild(heading);
      Object.keys(files).forEach(name => {
        const button = document.createElement('button');
        const file = `${dir.replace(/\/$/, '')}/${name}`;
        button.type = 'button';
        button.textContent = name;
        button.title = `Insert cat ${file}`;
        button.setAttribute('aria-label', `Read ${file}: insert command`);
        button.addEventListener('click', () => draftCommand(`cat ${file}`));
        ui.files.appendChild(button);
      });
    });
  }

  function renderTools() {
    ui.tools.innerHTML = '';
    Object.values(TOOLS).forEach(tool => {
      const button = document.createElement('button');
      const ready = tool.unlock <= currentChapter().id;
      button.type = 'button';
      button.className = ready ? 'ready' : 'locked';
      button.disabled = !ready;
      button.textContent = `${ready ? '✓' : '·'} ${tool.label}`;
      const description = document.createElement('small');
      description.textContent = ready ? tool.desc + ' Tap to insert command.' : `Unlocks in chapter ${tool.unlock}.`;
      button.appendChild(description);
      button.addEventListener('click', () => {
        const args = { ProxyBalance: ' alpha beta gamma', CryptoLens: ' cipher.txt', HashCheck: ' kernel.sig' };
        draftCommand(`run ${tool.label}${args[tool.label] || ''}`);
      });
      ui.tools.appendChild(button);
    });
  }

  function allTokens() {
    const commandNames = ['help','clear','briefing','missions','status','network','inventory','pwd','ls','cd','cat','grep','connect','scan','probe','run','hash','analyze','preserve','collect','lock','submit','decide','restore','hint','debrief','retry'];
    const hosts = chapters.map(ch => ch.host);
    const tools = Object.keys(TOOLS);
    const files = [];
    const fs = currentFS();
    Object.entries(fs).forEach(([dir, obj]) => {
      files.push(dir);
      Object.keys(obj).forEach(f => files.push(dir === '/' ? `/${f}` : `${dir}/${f}`, f));
    });
    return [...commandNames, ...hosts, ...tools, ...files, ...(currentChapter().decision?.choices.map(([id]) => id) || []), 'report', 'alpha', 'beta', 'gamma', 'token-orchid'];
  }

  function suggestions(prefix) {
    if (!prefix) return [];
    const p = prefix.toLowerCase();
    return allTokens().filter(t => t.toLowerCase().startsWith(p)).slice(0, 8);
  }

  function autocomplete() {
    const value = input.value;
    const parts = value.split(/\s+/);
    const last = parts[parts.length - 1] || '';
    const command = parts[0].toLowerCase();
    let candidates = allTokens();
    if (parts.length > 1) {
      const files = Object.entries(currentFS()).flatMap(([dir, entries]) =>
        Object.keys(entries).flatMap(name => [name, `${dir.replace(/\/$/, '')}/${name}`]));
      candidates = files;
      if (['connect', 'scan', 'probe'].includes(command)) candidates = state.unlocked;
      else if (command === 'run' && parts.length === 2) candidates = Object.keys(TOOLS).filter(canUseTool);
      else if (command === 'decide') candidates = currentChapter().decision?.choices.map(([id]) => id) || [];
      else if (command === 'cd') candidates = Object.keys(currentFS());
      else if (command === 'submit') candidates = ['report'];
      else if (command === 'run' && parts[1]?.toLowerCase() === 'proxybalance') candidates = ['alpha', 'beta', 'gamma'];
    }
    const match = candidates.find(token => token.toLowerCase().startsWith(last.toLowerCase()));
    if (!match) return;
    parts[parts.length - 1] = match;
    input.value = parts.join(' ') + ' ';
  }

  function hint() {
    const chapter = currentChapter();
    const objective = chapter.objectives.find(([key]) => !state.completed[key]);
    if (!objective) { debrief(); saveProgress(); return; }
    const [key, task] = objective, stage = Math.min(3, (state.hints[key] || 0) + 1);
    state.hints[key] = stage;
    const command = objectiveCommand(chapter, key, task);
    const hints = [chapter.principle, `Focus on: ${task} ${chapter.decision?.key === key ? 'Compare the reviewed evidence with the stated purpose and the effect on legitimate users.' : 'Use the Files and Toolkit panels to insert commands without retyping.'}`, command ? `Try: ${command}` : chapter.hint || 'Read the briefing, compare the source files and choose the response that meets the stated purpose.'];
    line(`Hint ${stage} / 3: ${hints[stage - 1]}`, 'warn');
    $('#learningFeedback').textContent = hints[stage - 1];
    syncUI(); saveProgress();
  }

  function objectiveCommand(chapter, key, task) {
    if (key.startsWith('connect_')) return `connect ${chapter.host}`;
    if (chapter.reads?.[key]) return chapter.reads[key].map(file => `cat ${file}`).join(' → ');
    if (key === chapter.toolKey) return `run ${chapter.tool}`;
    if (key === chapter.decision?.key) return `decide ${chapter.decision.choices.find(choice => choice[2])[0]}`;
    if (key === 'recovery_restore') return 'restore backup-clean.snap';
    if (key === 'mail_preserve') return 'preserve message.eml';
    if (key === 'beacon_preserve') return 'preserve incident.log';
    if (key === 'identity_collect') return 'collect identity-report.txt';
    if (key === 'privacy_collect') return 'collect public-summary.txt';
    if (key === 'beacon_report') return 'run ReportKit';
    if (key === 'submit_academy') return 'submit report';
    if (chapter.id <= 8) return { list_home: 'ls', read_brief: 'cat briefing.txt', read_case: 'cat case_bit.txt' }[key] || task;
    return chapter.hint || task;
  }

  function postScore(scoreMode = 'live') {
    if (mode === 'practice') return;
    const payload = { gameSlug: GAME_SLUG, slug: GAME_SLUG, score: Math.floor(state.score), trust: Math.floor(state.trust), level: currentChapter().id, mode: scoreMode };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(payload.score, { gameSlug: GAME_SLUG }); } catch {}
    if (scoreMode !== 'live') {
      try { window.GG?.submitScore?.(payload.score, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type: 'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type: 'gg:score', ...payload, payload }, '*'); } catch {}
  }

  // Audio: simple synth + ambient hum, starts only after user action.
  function ensureAudio() {
    if (state.muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.13;
      master.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  }

  function tone(freq, dur = 0.08, type = 'sine', gain = 0.04, delay = 0) {
    const ac = ensureAudio();
    if (!ac) return;
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  function sfx(kind) {
    if (kind === 'good') { tone(520,.06,'triangle',.04); tone(820,.08,'sine',.028,.05); }
    if (kind === 'bad') tone(140,.15,'sawtooth',.04);
    if (kind === 'level') { tone(392,.08,'triangle',.05); tone(554,.1,'triangle',.04,.07); tone(784,.12,'sine',.03,.16); }
  }

  function startMusic() {
    if (state.muted || musicTimer) return;
    let step = 0;
    const notes = [196, 247, 294, 330, 392, 330, 294, 247];
    musicTimer = setInterval(() => {
      if (!state.started || state.muted || document.hidden) return;
      const n = notes[step++ % notes.length];
      tone(n, .08, 'triangle', .006);
      tone(n / 2, .14, 'sine', .004, .02);
    }, 270);
  }

  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  function bind() {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const val = input.value;
      input.value = '';
      execute(val);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        autocomplete();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        recallCommand(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        recallCommand(1);
      }
    });

    document.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        draftCommand(btn.dataset.cmd);
      });
    });

    panelTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectPanel(tab.dataset.panel));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % panelTabs.length;
        if (event.key === 'ArrowLeft') next = (index + panelTabs.length - 1) % panelTabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = panelTabs.length - 1;
        if (next !== undefined) { event.preventDefault(); selectPanel(panelTabs[next].dataset.panel, true); }
      });
    });
    compactLayout.addEventListener('change', () => selectPanel(selectedPanel));
    window.addEventListener('resize', resizeAcademy);
    window.visualViewport?.addEventListener('resize', resizeAcademy);
    resizeAcademy();
    $('#completeBtn').addEventListener('click', () => { autocomplete(); focusCommand(); });
    $('#previousBtn').addEventListener('click', () => { recallCommand(-1); focusCommand(); });
    $('#nextBtn').addEventListener('click', () => { recallCommand(1); focusCommand(); });
    ui.startBtn.addEventListener('click', () => {
      if (!state.started) startGame();
      else { selectPanel('mission'); $('#panel-mission').focus({ preventScroll: true }); }
    });
    ui.overlayStartBtn.addEventListener('click', startGame);
    ui.hintBtn.addEventListener('click', () => { selectPanel('terminal'); hint(); });
    $('#retryBtn').addEventListener('click', () => retryChapter());
    $('#startPracticeBtn').addEventListener('click', startPractice);
    $('#overlayPracticeBtn').addEventListener('click', startPractice);
    $('#returnCampaignBtn').addEventListener('click', returnToCampaign);
    $('#debriefBtn').addEventListener('click', () => { selectPanel('terminal'); debrief(); $('#caseActions').open = false; });
    ui.resetBtn.addEventListener('click', () => {
      if (mode === 'practice') { retryChapter(); return; }
      if (!window.confirm('Start a new campaign? This clears saved campaign progress and points on this browser.')) return;
      mode = 'campaign'; campaignSave = null; practiceSave = null; checkpoints = {}; state = initialState(); checkpoint();
      try { storage?.removeItem(progress.keys.practice); } catch {}
      $('#caseActions').open = false; resumePending = false; startGame();
    });
    ui.submitBtn.addEventListener('click', () => postScore('manual_submit'));
    ui.muteBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      if (state.muted) stopMusic(); else startMusic();
      syncUI(); saveProgress();
    });

    window.addEventListener('pagehide', saveProgress);
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveProgress(); });
    window.addEventListener('message', ev => {
      if (ev.origin !== window.location.origin || ev.source !== window.parent) return;
      const data = ev.data || {};
      const type = data.type || data.event;
      if (type === 'GG_MUTE') {
        state.muted = !!(data.payload?.muted ?? data.muted);
        if (state.muted) stopMusic(); else startMusic();
        syncUI(); saveProgress();
      }
      if (type === 'GG_RESTART') retryChapter();
    });

    setInterval(tickTrace, 1000);
  }

  setup();
  bind();
})();
/** DOM-only polish: no collision, balance, save or mesh changes. */
const CHAPTERS = Object.freeze({ garden: 'I · SKY GARDEN', crystal: 'II · CRYSTAL CAVERNS',
  storm: 'III · STORM CITADEL', solar: 'IV · SOLAR SANCTUARY' });

export function createCampaignPresentation({ world, audio, document: doc = globalThis.document,
  reducedMotion = false } = {}) {
  const get = id => doc?.getElementById(id);
  const app = get('app'), music = get('musicVolume'), effects = get('effectsVolume');
  const mute = get('soundBtn'), settings = get('audioSettings');
  const musicValue = get('musicVolumeValue'), effectsValue = get('effectsVolumeValue');
  const status = get('audioStatus'), track = get('audioTrackTitle');
  const chapter = get('chapterLabel');
  let alternating = false;
  if (app) app.dataset.world = world;
  if (chapter) chapter.textContent = CHAPTERS[world] || '';
  const unsubscribe = audio.subscribe(state => {
    const musicPercent = Math.round(state.music * 100), effectsPercent = Math.round(state.effects * 100);
    if (music) music.value = String(musicPercent);
    if (effects) effects.value = String(effectsPercent);
    if (musicValue) musicValue.textContent = `${musicPercent}%`;
    if (effectsValue) effectsValue.textContent = `${effectsPercent}%`;
    if (mute) {
      mute.textContent = state.muted ? 'Enable audio' : 'Mute audio';
      mute.setAttribute('aria-pressed', String(state.muted));
      mute.setAttribute('aria-label', 'Mute game music and sound effects');
    }
    if (track) track.textContent = `${state.battle ? 'Guardian theme' : 'World theme'} · ${state.title}`;
    if (status) {
      const next = state.lastError || (state.muted ? 'Audio muted. Your volume settings are saved.'
        : state.status === 'loading' ? 'Loading music…'
        : !state.unlocked ? 'Music starts when you press Play.'
        : state.mode === 'paused' ? 'Audio paused. Press Continue Adventure to resume.'
        : state.music <= 0 ? 'Music volume is zero. Sound effects have a separate volume.'
        : state.musicPlaying ? 'Music and sound effects are enabled.' : 'Your audio settings are saved.');
      if (status.textContent !== next) status.textContent = next;
    }
  });
  function changeMusic(event) {
    audio.setPreferences({ music: Number(event.target.value) / 100 });
    void audio.unlock();
  }
  function changeEffects(event) {
    audio.setPreferences({ effects: Number(event.target.value) / 100 });
    void audio.unlock();
  }
  function toggleMute() {
    audio.setPreferences({ muted: !audio.state().muted });
    void audio.unlock();
  }
  music?.addEventListener('input', changeMusic);
  effects?.addEventListener('input', changeEffects);
  mute?.addEventListener('click', toggleMute);
  function escapeSettings(event) {
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopPropagation();
    settings.open = false; get('primaryBtn')?.focus();
  }
  settings?.addEventListener('keydown', escapeSettings);
  return {
    setMode(mode) { if (app) app.dataset.mode = mode; },
    emit(event) {
      if (reducedMotion) return;
      const id = ({ relic: 'relicCount', checkpoint: 'questGuide', damage: 'healthCount',
        fall: 'healthCount', 'boss-defeated': 'scoreCount', 'drone-down': 'scoreCount' })[event];
      if (!id) return;
      const target = get(id);
      if (!target?.classList) return;
      alternating = !alternating;
      target.classList.toggle('rewardPulseA', alternating);
      target.classList.toggle('rewardPulseB', !alternating);
    },
    dispose() {
      unsubscribe();
      music?.removeEventListener?.('input', changeMusic);
      effects?.removeEventListener?.('input', changeEffects);
      mute?.removeEventListener?.('click', toggleMute);
      settings?.removeEventListener?.('keydown', escapeSettings);
    },
  };
}

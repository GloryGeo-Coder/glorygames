export class FakeAudioContext {
  constructor() {
    this.state = 'suspended'; this.currentTime = 0; this.destination = {};
    this.sources = []; this.gains = []; this.resumeCalls = 0; this.suspendCalls = 0;
    this.decodeCalls = 0; this.events = new Map();
  }
  param(value = 1) { return { value, automation: [], cancelScheduledValues(at) { this.automation.push(['cancel', at]); },
    setValueAtTime(v, at) { this.value = v; this.automation.push(['set', v, at]); },
    linearRampToValueAtTime(v, at) { this.value = v; this.automation.push(['ramp', v, at]); } }; }
  createGain() { const gain = { gain: this.param(), connect() {}, disconnect() {} }; this.gains.push(gain); return gain; }
  createDynamicsCompressor() { return { threshold: this.param(), knee: this.param(), ratio: this.param(),
    attack: this.param(), release: this.param(), connect() {}, disconnect() {} }; }
  createBufferSource() {
    const source = { buffer: null, loop: false, starts: [], stops: [], connect() {}, disconnect() {},
      start(...args) { this.starts.push(args); }, stop(...args) { this.stops.push(args); this.onended?.(); } };
    this.sources.push(source); return source;
  }
  createBuffer(channels, frames, rate) {
    const data = Array.from({ length: channels }, () => new Float32Array(frames));
    return { duration: frames / rate, getChannelData: i => data[i] };
  }
  async decodeAudioData() { this.decodeCalls++; return { duration: 22 }; }
  resume() { this.resumeCalls++; this.state = 'running'; return Promise.resolve(); }
  suspend() { this.suspendCalls++; this.state = 'suspended'; return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
  addEventListener(type, fn) { this.events.set(type, fn); }
  removeEventListener(type) { this.events.delete(type); }
}
export const nextTurn = () => new Promise(resolve => setTimeout(resolve, 0));
export const memoryStorage = () => {
  const map = new Map();
  return { map, getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, String(v)), removeItem: k => map.delete(k) };
};

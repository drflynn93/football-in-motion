export class Playback {
  constructor(duration, onUpdate, runtime = {}) {
    this.duration = duration; this.onUpdate = onUpdate;
    this.now = runtime.now ?? (() => performance.now());
    this.requestFrame = runtime.requestFrame ?? (callback => requestAnimationFrame(callback));
    this.cancelFrame = runtime.cancelFrame ?? (id => cancelAnimationFrame(id));
    this.time = 0; this.speed = 1; this.manualPaused = false;
    this.inspections = new Set(); this.inactive = false; this.last = null; this.frame = null; this.running = false;
  }
  get paused() { return this.manualPaused || this.inspections.size > 0; }
  advance(now) {
    if (this.last !== null && !this.paused && !this.inactive) this.time = Math.min(this.duration, this.time + Math.max(0, now - this.last) * this.speed);
    this.last = now;
  }
  start() {
    if (this.running) return;
    this.running = true; this.last = this.now();
    this.frame = this.requestFrame(now => this.tick(now));
  }
  tick(now) {
    if (!this.running) return;
    this.advance(now); this.onUpdate(this.time);
    if (this.time < this.duration) this.frame = this.requestFrame(next => this.tick(next));
    else this.running = false;
  }
  togglePause() { this.advance(this.now()); this.manualPaused = !this.manualPaused; }
  inspect(reason, active) {
    this.advance(this.now());
    if (active) this.inspections.add(reason); else this.inspections.delete(reason);
  }
  setInactive(inactive) { this.advance(this.now()); this.inactive = inactive; }
  setSpeed(speed) {
    if (![0.5, 1, 2, 4, 8].includes(Number(speed))) throw new Error('Unsupported playback speed.');
    this.advance(this.now()); this.speed = Number(speed);
  }
  reset() {
    this.stop(); this.time = 0; this.manualPaused = false; this.inspections.clear();
    this.last = null; this.onUpdate(0);
  }
  stop() { this.running = false; this.cancelFrame(this.frame); this.frame = null; this.last = null; }
}

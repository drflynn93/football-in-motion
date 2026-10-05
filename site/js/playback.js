export class Playback {
  constructor(duration, onUpdate) { this.duration = duration; this.onUpdate = onUpdate; this.time = 0; this.speed = 1; this.paused = false; this.last = null; this.frame = null; }
  start() { this.last = null; this.frame = requestAnimationFrame(now => this.tick(now)); }
  tick(now) {
    if (this.last !== null && !this.paused && !document.hidden) this.time = Math.min(this.duration, this.time + (now - this.last) * this.speed);
    this.last = now; this.onUpdate(this.time);
    if (this.time < this.duration) this.frame = requestAnimationFrame(next => this.tick(next));
  }
  togglePause() { this.paused = !this.paused; this.last = null; }
  setSpeed(speed) { this.speed = Number(speed); this.last = null; }
  stop() { cancelAnimationFrame(this.frame); }
}

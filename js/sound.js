// ============================================================
// sound.js — a tiny WebAudio synth. No assets, just vibes.
// ============================================================

export class Sound {
  constructor() {
    this.ctx = null;
    try {
      this.muted = localStorage.getItem("tdt-muted") === "1";
    } catch (e) { this.muted = false; }
  }

  toggleMute() {
    this.muted = !this.muted;
    try { localStorage.setItem("tdt-muted", this.muted ? "1" : "0"); } catch (e) { /* fine */ }
    return this.muted;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx.state === "running";
  }

  blip(freq, { at = 0, dur = 0.08, type = "square", gain = 0.035 } = {}) {
    const t = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  play(name) {
    if (this.muted) return;
    try {
      if (!this.ensure()) return;
    } catch (e) { return; }

    switch (name) {
      case "place":
        this.blip(180, { type: "triangle", dur: 0.07 });
        break;
      case "sell":
        this.blip(300, { type: "triangle" });
        this.blip(220, { at: 0.07, type: "triangle" });
        break;
      case "hire":
        this.blip(440);
        this.blip(660, { at: 0.08 });
        break;
      case "ship": // ka-ching arpeggio
        [523, 659, 784, 1047].forEach((f, i) => this.blip(f, { at: i * 0.07, type: "square", gain: 0.04 }));
        break;
      case "quit": // budget sad trombone
        [392, 330, 262].forEach((f, i) => this.blip(f, { at: i * 0.14, dur: 0.16, type: "sawtooth", gain: 0.03 }));
        break;
      case "event":
        this.blip(880, { dur: 0.05 });
        this.blip(880, { at: 0.1, dur: 0.05 });
        break;
      case "fail":
        [300, 250, 200].forEach((f, i) => this.blip(f, { at: i * 0.1, dur: 0.12, type: "sawtooth", gain: 0.03 }));
        break;
      case "milestone":
        this.blip(784, { type: "sine", gain: 0.05 });
        this.blip(1175, { at: 0.09, type: "sine", gain: 0.05 });
        break;
      case "click":
        this.blip(700, { dur: 0.04, gain: 0.02 });
        break;
    }
  }
}

// ============================================================
// render.js — canvas drawing. Top-down office, emoji actors.
// ============================================================
import { TILE, GRID_W, GRID_H, OBJECT_TYPES } from "./data.js";

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.game = game;
    this.hoverTile = null; // {x, y} in tile coords
    this.buildType = null; // set by UI when in build mode
    this.sellMode = false;
    canvas.width = GRID_W * TILE;
    canvas.height = GRID_H * TILE;
  }

  draw() {
    const { ctx, game } = this;
    const t = performance.now() / 1000;

    // floor
    ctx.fillStyle = "#2a2d3a";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = "#2e3140";
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
      }
    }
    // subtle grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_W; x++) {
      ctx.beginPath(); ctx.moveTo(x * TILE, 0); ctx.lineTo(x * TILE, GRID_H * TILE); ctx.stroke();
    }
    for (let y = 0; y <= GRID_H; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * TILE); ctx.lineTo(GRID_W * TILE, y * TILE); ctx.stroke();
    }

    // walls
    ctx.strokeStyle = "#4a4f63";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, this.canvas.width - 6, this.canvas.height - 6);

    // windows along the top wall (the view is a parking lot, but still)
    ctx.font = "18px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 2; i < GRID_W; i += 4) {
      ctx.fillText("🪟", i * TILE, 10);
    }
    // motivational wall art nobody chose
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillText("HUSTLE ™", (GRID_W - 2.5) * TILE, 11);

    // door on left wall
    const doorY = (GRID_H / 2) * TILE;
    ctx.fillStyle = "#2a2d3a";
    ctx.fillRect(0, doorY - TILE * 0.6, 8, TILE * 1.2);
    ctx.font = "16px serif";
    ctx.fillText("🚪", 14, doorY);

    // objects
    game.objects.forEach((o) => {
      const def = OBJECT_TYPES[o.type];
      const px = o.x * TILE, py = o.y * TILE;
      const cx = px + TILE / 2, cy = py + TILE / 2;
      if (o.type === "desk") {
        // desk surface + occupancy glow
        ctx.fillStyle = o.owner ? "rgba(126,231,135,0.10)" : "rgba(160,120,80,0.12)";
        ctx.beginPath();
        ctx.roundRect(px + 4, py + 4, TILE - 8, TILE - 8, 6);
        ctx.fill();
      } else {
        // amenity rug
        ctx.fillStyle = "rgba(180,139,242,0.10)";
        ctx.beginPath();
        ctx.roundRect(px + 3, py + 3, TILE - 6, TILE - 6, 10);
        ctx.fill();
      }
      ctx.font = "28px serif";
      ctx.fillText(def.emoji, cx, cy);
    });

    // staff
    game.staff.forEach((s) => {
      const working = s.state === "working";
      const bob = working ? Math.sin(t * 6 + s.bobPhase) * 2 : 0;

      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(s.x, s.y + 12, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // body
      ctx.font = "26px serif";
      ctx.fillText(s.emoji, s.x, s.y + bob);

      // mood dot
      const mood = s.mood();
      ctx.fillStyle = mood > 0.6 ? "#7ee787" : mood > 0.3 ? "#e3b341" : "#ff7b72";
      ctx.beginPath();
      ctx.arc(s.x + 11, s.y - 10 + bob, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // need bubble
      const needKey = s.lowestNeed();
      if (s.state === "onBreak" && s.breakNeed) {
        // recharging emote floats up
        const frac = 1 - Math.max(0, s.useTimer) / 2.5;
        const icon = { caffeine: "☕", joy: "🎉", sanity: "😌" }[s.breakNeed];
        ctx.globalAlpha = 0.9 - frac * 0.6;
        ctx.font = "16px serif";
        ctx.fillText(icon, s.x + 8, s.y - 20 - frac * 14);
        ctx.globalAlpha = 1;
        ctx.font = "26px serif";
      } else if (s.needs[needKey] < 28) {
        const icon = { caffeine: "☕", joy: "🎮", sanity: "🧠" }[needKey];
        const by = s.y - 26 + Math.sin(t * 3 + s.bobPhase) * 1.5;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.roundRect(s.x - 12, by - 11, 24, 22, 6);
        ctx.fill();
        ctx.font = "13px serif";
        ctx.fillText(icon, s.x, by + 1);
        ctx.font = "26px serif";
      }
    });

    // vignette for that 'we spent money on lighting' feel
    const vg = ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.height * 0.45,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.height * 1.05
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.28)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // build ghost / sell highlight
    if (this.hoverTile) {
      const { x, y } = this.hoverTile;
      if (this.buildType) {
        const ok = game.canPlace(x, y) && game.cash >= OBJECT_TYPES[this.buildType].cost;
        ctx.fillStyle = ok ? "rgba(126,231,135,0.25)" : "rgba(255,123,114,0.25)";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        ctx.globalAlpha = 0.6;
        ctx.font = "28px serif";
        ctx.fillText(OBJECT_TYPES[this.buildType].emoji, (x + 0.5) * TILE, (y + 0.5) * TILE);
        ctx.globalAlpha = 1;
      } else if (this.sellMode) {
        const obj = game.objAt(x, y);
        if (obj) {
          ctx.strokeStyle = "#ff7b72";
          ctx.lineWidth = 2;
          ctx.strokeRect(x * TILE + 2, y * TILE + 2, TILE - 4, TILE - 4);
        }
      }
    }
  }
}

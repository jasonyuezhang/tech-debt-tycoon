// ============================================================
// main.js — bootstrap, input, game loop.
// ============================================================
import { TILE } from "./data.js";
import { Game } from "./game.js";
import { Renderer } from "./render.js";
import { UI } from "./ui.js";
import { OBJECT_TYPES, fmtMoney } from "./data.js";

const canvas = document.getElementById("game-canvas");
const params = new URLSearchParams(location.search);
const hadSave = Game.hasSave();
const game = (!params.has("demo") && hadSave && Game.load()) || new Game();
const renderer = new Renderer(canvas, game);
const ui = new UI(game, renderer);
game.ui = ui;

if (params.has("demo")) {
  // dev/screenshot mode: a furnished office with a working team
  ["desk:6:4", "desk:6:6", "pingpong:11:3", "nappod:13:3", "zen:11:7", "whiteboard:2:2"]
    .forEach((s) => { const [type, x, y] = s.split(":"); game.place(type, +x, +y, true); });
  game.candidates.slice(0, 4).forEach((c) => { game.cash += c.salary * 2; game.hire(c.id); });
  game.acceptProject(game.available[0].id);
} else if (!params.has("skipsplash")) {
  ui.showSplash(hadSave);
}

// ---------- input ----------
function canvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (canvas.width / rect.width);
  const py = (e.clientY - rect.top) * (canvas.height / rect.height);
  return { px, py, tx: Math.floor(px / TILE), ty: Math.floor(py / TILE) };
}

canvas.addEventListener("mousemove", (e) => {
  const { px, py, tx, ty } = canvasPos(e);
  renderer.hoverTile = { x: tx, y: ty };

  // tooltip: staff first, then objects
  const staffer = game.staff.find((s) => Math.hypot(s.x - px, s.y - py) < 18);
  if (staffer) {
    ui.showTooltip(
      `<b>${staffer.emoji} ${staffer.name}</b><br>
       <span class="tt-sub">${staffer.role.name} · ${fmtMoney(staffer.salary)}/day</span><br>
       <span class="tt-bio">"${staffer.bio}"</span>`,
      e.clientX, e.clientY
    );
    return;
  }
  const obj = game.objAt(tx, ty);
  if (obj && !renderer.buildType) {
    const def = OBJECT_TYPES[obj.type];
    ui.showTooltip(
      `<b>${def.emoji} ${def.name}</b><br><span class="tt-bio">${def.desc}</span>`,
      e.clientX, e.clientY
    );
    return;
  }
  ui.hideTooltip();
});

canvas.addEventListener("mouseleave", () => {
  renderer.hoverTile = null;
  ui.hideTooltip();
});

canvas.addEventListener("click", (e) => {
  const { tx, ty } = canvasPos(e);
  if (renderer.buildType) {
    game.place(renderer.buildType, tx, ty); // stay in build mode for multi-place
    ui.renderPanel();
  } else if (renderer.sellMode) {
    const obj = game.objAt(tx, ty);
    if (obj) game.sell(obj);
  }
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  ui.exitPlacementModes();
  ui.renderPanel();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    ui.exitPlacementModes();
    ui.renderPanel();
  } else if (e.key === " " && !game.modalOpen) {
    e.preventDefault();
    game.speed = game.speed === 0 ? 1 : 0;
    document.querySelectorAll("#speed-controls button").forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.speed) === game.speed)
    );
  }
});

// ---------- loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  game.update(dt * game.speed);
  renderer.draw();
  ui.refresh(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

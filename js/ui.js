// ============================================================
// ui.js — DOM panels, modals, the ticker. All the chrome.
// ============================================================
import { OBJECT_TYPES, fmtMoney, pick } from "./data.js";
import { Sound } from "./sound.js";

const $ = (sel) => document.querySelector(sel);

const FIRE_QUIPS = [
  "Let them go 'pursue other opportunities'",
  "Restructure them out of existence",
  "Offer them a 'founder sabbatical'",
];

export class UI {
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;
    this.sound = new Sound();
    this.tab = "build";
    this.refreshTimer = 0;
    this.lastLogId = null;

    this.panel = $("#panel");
    this.tickerLog = $("#ticker-log");
    this.tooltip = $("#tooltip");
    this.modalBackdrop = $("#modal-backdrop");
    this.modal = $("#modal");

    this.bind();
    this.renderPanel();
  }

  // ---------- bindings ----------
  bind() {
    $("#tabs").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-tab]");
      if (!btn) return;
      this.tab = btn.dataset.tab;
      document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b === btn));
      this.exitPlacementModes();
      this.renderPanel();
    });

    $("#speed-controls").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-speed]");
      if (!btn) return;
      this.game.speed = Number(btn.dataset.speed);
      document.querySelectorAll("#speed-controls button").forEach((b) => b.classList.toggle("active", b === btn));
    });

    $("#btn-raise").addEventListener("click", () => this.game.startPitch());

    const muteBtn = $("#btn-mute");
    muteBtn.textContent = this.sound.muted ? "🔇" : "🔊";
    muteBtn.addEventListener("click", () => {
      muteBtn.textContent = this.sound.toggleMute() ? "🔇" : "🔊";
    });

    // delegated clicks inside the side panel
    this.panel.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const { action, id, type } = el.dataset;
      if (action === "build") {
        this.renderer.sellMode = false;
        this.renderer.buildType = this.renderer.buildType === type ? null : type;
        this.renderPanel();
      } else if (action === "sell-mode") {
        this.renderer.buildType = null;
        this.renderer.sellMode = !this.renderer.sellMode;
        this.renderPanel();
      } else if (action === "hire") {
        this.game.hire(Number(id));
        this.renderPanel();
      } else if (action === "accept") {
        this.game.acceptProject(Number(id));
        this.renderPanel();
      } else if (action === "fire") {
        this.game.fire(Number(id));
        this.renderPanel();
      }
    });
  }

  exitPlacementModes() {
    this.renderer.buildType = null;
    this.renderer.sellMode = false;
  }

  // ---------- per-frame refresh ----------
  refresh(dt) {
    const g = this.game;
    $("#stat-cash").textContent = fmtMoney(g.cash);
    $("#stat-cash").className = g.cash < g.burnRate() * 3 ? "danger" : "";
    $("#stat-hype").textContent = Math.floor(g.hype);
    $("#stat-valuation").textContent = fmtMoney(g.valuation());
    $("#stat-burn").textContent = fmtMoney(g.burnRate());
    $("#stat-equity").textContent = g.equity.toFixed(0);
    $("#stat-day").textContent = g.day;

    const raiseBtn = $("#btn-raise");
    raiseBtn.disabled = !g.canPitch();
    raiseBtn.textContent = g.canPitch() ? "🤑 Raise Round" : `🚫 VCs ghosting (${g.pitchCooldown}d)`;

    // ticker
    const latest = g.log[0];
    if (latest && latest.id !== this.lastLogId) {
      this.lastLogId = latest.id;
      this.renderTicker();
    }

    // periodic panel re-render (progress bars, need bars)
    this.refreshTimer -= dt;
    if (this.refreshTimer <= 0 || g.dirty) {
      this.refreshTimer = 0.5;
      g.dirty = false;
      this.renderPanel();
    }
  }

  renderTicker() {
    this.tickerLog.innerHTML = this.game.log
      .slice(0, 6)
      .map((l, i) => `<div class="ticker-line" style="opacity:${1 - i * 0.15}"><span class="ticker-day">D${l.day}</span> ${l.msg}</div>`)
      .join("");
  }

  // ---------- panels ----------
  renderPanel() {
    const g = this.game;
    if (this.tab === "build") this.panel.innerHTML = this.buildPanel(g);
    else if (this.tab === "hire") this.panel.innerHTML = this.hirePanel(g);
    else if (this.tab === "projects") this.panel.innerHTML = this.projectsPanel(g);
    else this.panel.innerHTML = this.teamPanel(g);
  }

  buildPanel(g) {
    const items = Object.entries(OBJECT_TYPES).map(([key, def]) => {
      const selected = this.renderer.buildType === key;
      const affordable = g.cash >= def.cost;
      return `
        <div class="card ${selected ? "selected" : ""} ${affordable ? "" : "dim"}" data-action="build" data-type="${key}">
          <div class="card-head"><span class="card-emoji">${def.emoji}</span>
            <span class="card-title">${def.name}</span>
            <span class="card-cost">${fmtMoney(def.cost)}</span></div>
          <div class="card-desc">${def.desc}</div>
        </div>`;
    }).join("");
    return `
      <div class="panel-note">Click an item, then click the floor. Right-click to stop. Like IKEA, but the instructions are sarcasm.</div>
      ${items}
      <button class="wide-btn ${this.renderer.sellMode ? "danger-btn" : ""}" data-action="sell-mode">
        ${this.renderer.sellMode ? "🛑 Stop selling" : "🪚 Sell mode (50% refund — 'depreciation')"}
      </button>`;
  }

  hirePanel(g) {
    if (!g.candidates.length) {
      return `<div class="panel-note">The talent pool is empty. New candidates 'circle back' every couple of days.</div>`;
    }
    const cards = g.candidates.map((c) => `
      <div class="card">
        <div class="card-head"><span class="card-emoji">${c.emoji}</span>
          <span class="card-title">${c.name}</span>
          <span class="card-cost">${fmtMoney(c.salary)}/day</span></div>
        <div class="card-sub">${c.role.name} · skill ${"★".repeat(Math.round(c.skill * 3))}${"☆".repeat(Math.max(0, 5 - Math.round(c.skill * 3)))}</div>
        <div class="card-desc">"${c.bio}"</div>
        <div class="card-desc role-desc">${c.role.desc}</div>
        <button class="card-btn" data-action="hire" data-id="${c.id}">Hire (signing bonus ${fmtMoney(c.salary * 2)})</button>
      </div>`).join("");
    return `<div class="panel-note">Candidates self-describe as 'passionate'. The signing bonus is two days' salary, because they negotiated and you panicked.</div>${cards}`;
  }

  projectsPanel(g) {
    const active = g.active.length
      ? g.active.map((p) => {
          const pct = Math.min(100, (p.progress / p.work) * 100);
          return `
          <div class="card">
            <div class="card-head"><span class="card-emoji">🔨</span>
              <span class="card-title">${p.name}</span>
              <span class="card-cost">${fmtMoney(p.payout)}</span></div>
            <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
            <div class="card-sub">${pct.toFixed(0)}% · ${p.bugs} bug${p.bugs === 1 ? "" : "s"} ${p.bugs > 3 ? "🔥" : ""} · assigned: everyone (that's agile, baby)</div>
          </div>`;
        }).join("")
      : `<div class="panel-note">No active projects. The engineers are 'sharpening the saw', which is LinkedIn for napping.</div>`;

    const avail = g.available.map((p) => `
      <div class="card">
        <div class="card-head"><span class="card-emoji">📦</span>
          <span class="card-title">${p.name}</span>
          <span class="card-cost">${fmtMoney(p.payout)}</span></div>
        <div class="card-desc">${p.desc}</div>
        <div class="card-sub">~${p.work} units of 'engineering effort' · +${p.hype} hype</div>
        <button class="card-btn" data-action="accept" data-id="${p.id}">Sign the contract</button>
      </div>`).join("");

    return `
      <div class="panel-section">IN FLIGHT (${g.active.length}/2)</div>${active}
      <div class="panel-section">ON THE TABLE</div>
      ${avail || `<div class="panel-note">No offers right now. Have you tried adding 'AI' to your website?</div>`}`;
  }

  teamPanel(g) {
    if (!g.staff.length) {
      return `<div class="panel-note">You have no employees. The org chart is a single, lonely dot. Check the Hire tab.</div>`;
    }
    const bar = (val, label, icon) => `
      <div class="need-row"><span class="need-icon" title="${label}">${icon}</span>
        <div class="need-bar"><div class="need-fill ${val < 28 ? "low" : ""}" style="width:${val}%"></div></div></div>`;
    const stateLabel = {
      working: "grinding", toDesk: "commuting (8 meters)", toBreak: "self-care-ing",
      onBreak: "recharging", idle: "in a standup about nothing",
    };
    const cards = g.staff.map((s) => `
      <div class="card">
        <div class="card-head"><span class="card-emoji">${s.emoji}</span>
          <span class="card-title">${s.name}</span>
          <span class="card-cost">${fmtMoney(s.salary)}/day</span></div>
        <div class="card-sub">${s.role.name} · ${stateLabel[s.state] || s.state}${s.desk ? "" : " · 🚨 NO DESK"}</div>
        ${bar(s.needs.caffeine, "Caffeine", "☕")}
        ${bar(s.needs.joy, "Joy", "🎮")}
        ${bar(s.needs.sanity, "Sanity", "🧠")}
        <button class="card-btn danger-btn" data-action="fire" data-id="${s.id}">🪓 ${pick(FIRE_QUIPS)} (${fmtMoney(s.salary * 3)} severance)</button>
      </div>`).join("");
    return `<div class="panel-note">${g.staff.length} employees · ${g.quits} have fled. Keep the bars green or learn why severance exists.</div>${cards}`;
  }

  // ---------- tooltip ----------
  showTooltip(html, clientX, clientY) {
    this.tooltip.innerHTML = html;
    this.tooltip.classList.remove("hidden");
    const pad = 14;
    let x = clientX + pad, y = clientY + pad;
    const rect = this.tooltip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth - 8) x = clientX - rect.width - pad;
    if (y + rect.height > window.innerHeight - 8) y = clientY - rect.height - pad;
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  }

  hideTooltip() {
    this.tooltip.classList.add("hidden");
  }

  // ---------- toasts ----------
  toast(msg) {
    const container = $("#toast-container");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.classList.add("show"), 20);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 400);
    }, 4500);
  }

  // ---------- modals ----------
  openModal(html) {
    this.game.modalOpen = true;
    this.modal.innerHTML = html;
    this.modalBackdrop.classList.remove("hidden");
  }

  closeModal() {
    this.game.modalOpen = false;
    this.modalBackdrop.classList.add("hidden");
  }

  showEvent(ev) {
    const g = this.game;
    const desc = typeof ev.desc === "function" ? ev.desc(g) : ev.desc;
    const buttons = ev.choices.map((c, i) => `<button class="modal-btn" data-choice="${i}">${c.label}</button>`).join("");
    this.openModal(`
      <div class="modal-title">⚡ ${ev.title}</div>
      <div class="modal-body">${desc}</div>
      <div class="modal-actions">${buttons}</div>`);
    this.modal.querySelectorAll("[data-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const result = ev.choices[Number(btn.dataset.choice)].effect(g);
        if (g.over) return; // ending modal already shown
        this.openModal(`
          <div class="modal-title">⚡ ${ev.title}</div>
          <div class="modal-body">${result}</div>
          <div class="modal-actions"><button class="modal-btn" id="modal-close">Carry on, I guess</button></div>`);
        this.modal.querySelector("#modal-close").addEventListener("click", () => this.closeModal());
      });
    });
  }

  showPitch(lines) {
    const g = this.game;
    const buttons = lines.map((l, i) => `<button class="modal-btn pitch-btn" data-pitch="${i}">${l.text}</button>`).join("");
    this.openModal(`
      <div class="modal-title">🤑 The Pitch</div>
      <div class="modal-body">You're in a glass conference room at Quaternary Capital. Four partners stare at you. One is on his phone. One is on two phones. Pick your opening line:</div>
      <div class="modal-actions vertical">${buttons}</div>`);
    this.modal.querySelectorAll("[data-pitch]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const result = g.resolvePitch(lines[Number(btn.dataset.pitch)]);
        this.sound.play(result.success ? "ship" : "fail");
        this.openModal(`
          <div class="modal-title">${result.success ? "💰 FUNDED" : "🥀 PASSED"}</div>
          <div class="modal-body">${result.text.replace(/\n/g, "<br>")}</div>
          <div class="modal-actions"><button class="modal-btn" id="modal-close">${result.success ? "Back to burning it" : "Cool cool cool"}</button></div>`);
        this.modal.querySelector("#modal-close").addEventListener("click", () => this.closeModal());
      });
    });
  }

  showEnding(title, text, isWin = false) {
    const g = this.game;
    const stats = `
      <div class="ending-stats">
        <div><b>${g.day}</b> days survived</div>
        <div><b>${g.shipped}</b> products shipped</div>
        <div><b>${fmtMoney(g.stats.raised)}</b> raised from people in vests</div>
        <div><b>${fmtMoney(g.stats.burned)}</b> incinerated on payroll</div>
        <div><b>${fmtMoney(g.stats.peakValuation)}</b> peak (imaginary) valuation</div>
        <div><b>${g.quits}</b> rage-quits witnessed</div>
        <div><b>${g.equity.toFixed(0)}%</b> of your own company still yours</div>
      </div>`;
    this.openModal(`
      <div class="modal-title">${title}</div>
      <div class="modal-body">${text}</div>
      ${stats}
      <div class="modal-actions">
        ${isWin ? `<button class="modal-btn" id="modal-continue">Keep playing (chase the decacorn)</button>` : ""}
        <button class="modal-btn" id="modal-restart">${isWin ? "Retire to a podcast" : "Found another startup (you've learned nothing)"}</button>
      </div>`);
    this.modal.querySelector("#modal-restart").addEventListener("click", () => {
      this.game.constructor.clearSave();
      location.reload();
    });
    const cont = this.modal.querySelector("#modal-continue");
    if (cont) cont.addEventListener("click", () => this.closeModal());
  }

  showSplash(hasSave) {
    this.openModal(`
      <div class="modal-title">🦄 TECH DEBT TYCOON</div>
      <div class="modal-body">
        <p>Congratulations on founding a startup! Here's everything you need to know:</p>
        <ul class="splash-list">
          <li>🖥️ <b>Build desks</b> — engineers can't 'add value' standing up. Well. They have standing desks. You know what we mean.</li>
          <li>🧑‍💼 <b>Hire people</b> — each candidate is passionate, disruptive, and one bad sprint from a podcast.</li>
          <li>📦 <b>Ship projects</b> — clients pay actual money for products like "Uber for Llamas". This is the economy now.</li>
          <li>☕🎮🧠 <b>Keep needs green</b> — under-caffeinated engineers write half the code with twice the bugs, and insane ones quit via Slack emoji.</li>
          <li>🤑 <b>Raise rounds</b> — exchange pieces of your company for runway, using only buzzwords.</li>
        </ul>
        <p><b>Goal:</b> a $1B valuation. <b>Death:</b> $0 on payroll day. <b>Vibe:</b> aggressive but doable.</p>
      </div>
      <div class="modal-actions">
        ${hasSave ? `<button class="modal-btn" id="splash-continue">💾 Continue the grind</button>
                     <button class="modal-btn danger-btn" id="splash-new">🔥 New startup (wipe save)</button>`
                  : `<button class="modal-btn" id="splash-new-fresh">🚀 Let's burn some money</button>`}
      </div>`);
    const cont = this.modal.querySelector("#splash-continue");
    if (cont) cont.addEventListener("click", () => this.closeModal());
    const fresh = this.modal.querySelector("#splash-new-fresh");
    if (fresh) fresh.addEventListener("click", () => this.closeModal());
    const wipe = this.modal.querySelector("#splash-new");
    if (wipe) wipe.addEventListener("click", () => {
      this.game.constructor.clearSave();
      location.reload();
    });
  }
}

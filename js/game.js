// ============================================================
// game.js — core state and simulation loop.
// ============================================================
import {
  TILE, GRID_W, GRID_H, DAY_LENGTH, OBJECT_TYPES, ROLES,
  genCandidate, genProject, uid, uidPeek, setUidFloor, pick, rand, fmtMoney,
  EVENTS, PITCH_LINES, PITCH_SUCCESS, PITCH_FAIL,
  AMBIENT_LINES, BUG_LINES, JOIN_LINES, MILESTONES,
  BROKE_ENDING, UNICORN_ENDING,
} from "./data.js";
import { Staff } from "./staff.js";

const SAVE_KEY = "tech-debt-tycoon-save";

export class Game {
  constructor() {
    this.cash = 30000;
    this.hype = 5;
    this.equity = 100;
    this.day = 1;
    this.dayTime = 0;
    this.speed = 1;
    this.modalOpen = false;
    this.over = false;
    this.won = false;

    this.objects = [];
    this.staff = [];
    this.candidates = Array.from({ length: 4 }, genCandidate);
    this.available = Array.from({ length: 3 }, genProject);
    this.active = [];
    this.shipped = 0;
    this.quits = 0;

    this.log = [];
    this.eventCooldown = 2; // grace period (days) before chaos begins
    this.pitchCooldown = 0;
    this.ambientTimer = 14;
    this.milestoneTimer = 1;
    this.flags = {}; // one-shot milestone keys
    this.stats = { raised: 0, burned: 0, peakValuation: 0, founded: 1 };
    this.dirty = true; // sidebar needs re-render
    this.ui = null;

    // starter office: two desks and the world's most important machine
    this.place("desk", 4, 4, true);
    this.place("desk", 4, 6, true);
    this.place("coffee", 8, 2, true);

    this.ticker("☀️ Welcome to your 'global HQ'. It's a sublet. Hire someone, accept a project, and try not to run out of money.");
  }

  // ---------- helpers ----------
  sfx(name) {
    if (this.ui && this.ui.sound) this.ui.sound.play(name);
  }

  ticker(msg) {
    this.log.unshift({ msg, day: this.day, id: uid() });
    if (this.log.length > 50) this.log.pop();
    this.dirty = true;
  }

  adjustAll(need, delta) {
    this.staff.forEach((s) => {
      s.needs[need] = Math.max(0, Math.min(100, s.needs[need] + delta));
    });
  }

  countType(type) {
    return this.objects.filter((o) => o.type === type).length;
  }

  objAt(x, y) {
    return this.objects.find((o) => o.x === x && o.y === y) || null;
  }

  canPlace(x, y) {
    return x >= 0 && y >= 0 && x < GRID_W && y < GRID_H && !this.objAt(x, y);
  }

  place(type, x, y, free = false) {
    const def = OBJECT_TYPES[type];
    if (!def || !this.canPlace(x, y)) return false;
    if (!free) {
      if (this.cash < def.cost) {
        this.ticker(`💸 You can't afford a ${def.name}. Classic pre-seed moment.`);
        return false;
      }
      this.cash -= def.cost;
    }
    this.objects.push({ id: uid(), type, x, y, owner: null });
    this.sfx("place");
    this.dirty = true;
    return true;
  }

  sell(obj) {
    const idx = this.objects.indexOf(obj);
    if (idx === -1) return;
    const refund = Math.round(OBJECT_TYPES[obj.type].cost * 0.5);
    this.cash += refund;
    if (obj.owner) {
      const s = this.staff.find((st) => st.id === obj.owner);
      if (s) { s.desk = null; s.state = "idle"; s.target = null; }
    }
    this.objects.splice(idx, 1);
    this.sfx("sell");
    this.ticker(`🪑 Sold a ${OBJECT_TYPES[obj.type].name} for ${fmtMoney(refund)}. 'Lean operations.'`);
    this.dirty = true;
  }

  claimDesk(staffer) {
    const desk = this.objects.find((o) => o.type === "desk" && !o.owner);
    if (desk) { desk.owner = staffer.id; return desk; }
    return null;
  }

  findObjectFor(needKey) {
    const matches = this.objects.filter((o) => OBJECT_TYPES[o.type].restores === needKey);
    return matches.length ? pick(matches) : null;
  }

  randomFloorSpot() {
    return {
      x: (1 + Math.random() * (GRID_W - 2)) * TILE,
      y: (1 + Math.random() * (GRID_H - 2)) * TILE,
    };
  }

  outputMult() {
    const wb = 1 + 0.04 * Math.min(this.countType("whiteboard"), 5);
    const scrumCount = this.staff.filter((s) => s.role.key === "scrum").length;
    return wb * Math.pow(0.93, scrumCount);
  }

  bugFactor() {
    return Math.pow(0.88, Math.min(this.countType("server"), 4));
  }

  designerCount() {
    return Math.min(this.staff.filter((s) => s.role.key === "designer" && s.state === "working").length, 4);
  }

  burnRate() {
    return this.staff.reduce((a, s) => a + s.salary, 0);
  }

  valuation() {
    return Math.round(
      Math.max(0, this.cash) * 4 +
      this.hype * this.hype * 100000 +
      this.shipped * 1e6 +
      this.staff.length * 250000
    );
  }

  // ---------- staff ----------
  hire(candidateId) {
    const idx = this.candidates.findIndex((c) => c.id === candidateId);
    if (idx === -1) return;
    const cand = this.candidates[idx];
    const signing = cand.salary * 2;
    if (this.cash < signing) {
      this.ticker(`💸 Can't afford ${cand.name}'s signing bonus (${fmtMoney(signing)}). They laughed. On speakerphone.`);
      return;
    }
    this.cash -= signing;
    this.candidates.splice(idx, 1);
    const s = new Staff(cand);
    this.staff.push(s);
    this.sfx("hire");
    this.ticker(pick(JOIN_LINES).replace("{name}", cand.name));
    if (!this.objects.some((o) => o.type === "desk" && !o.owner)) {
      this.ticker(`⚠️ ${cand.name} has no desk. They're 'working' from the floor. Build more desks.`);
    }
    this.dirty = true;
  }

  fire(staffId) {
    const s = this.staff.find((st) => st.id === staffId);
    if (!s) return;
    const severance = s.salary * 3;
    this.cash -= severance;
    this.removeStaff(s, `🪓 ${s.name} was 'transitioned to an alumni role' (severance: ${fmtMoney(severance)}). The team noticed.`);
    this.adjustAll("joy", -8);
  }

  removeStaff(s, message) {
    const idx = this.staff.indexOf(s);
    if (idx === -1) return;
    if (s.desk) s.desk.owner = null;
    this.staff.splice(idx, 1);
    this.quits++;
    this.sfx("quit");
    this.ticker(message);
    this.dirty = true;
  }

  // ---------- projects ----------
  acceptProject(projectId) {
    const idx = this.available.findIndex((p) => p.id === projectId);
    if (idx === -1) return;
    if (this.active.length >= 2) {
      this.ticker("📦 Two active projects is already one too many. Focus. (Or ship something.)");
      return;
    }
    const p = this.available.splice(idx, 1)[0];
    this.active.push(p);
    this.ticker(`📦 Signed: "${p.name}". The deadline is 'aggressive but doable', which means neither.`);
    this.dirty = true;
  }

  applyWork(amount) {
    const p = this.active[0];
    if (!p) return false;
    p.progress += amount;
    if (p.progress >= p.work) this.completeProject(p);
    return true;
  }

  completeProject(p) {
    const mult = 1 + 0.12 * this.designerCount();
    const pay = Math.round(p.payout * mult);
    this.cash += pay;
    this.hype += p.hype;
    this.shipped++;
    this.active.splice(this.active.indexOf(p), 1);
    this.adjustAll("joy", 12);
    this.sfx("ship");
    const designNote = mult > 1 ? ` (+${Math.round((mult - 1) * 100)}% design premium)` : "";
    this.ticker(`🚀 SHIPPED "${p.name}" for ${fmtMoney(pay)}${designNote}! The launch tweet got 9 likes. One was your mom.`);
    this.dirty = true;
  }

  // ---------- funding ----------
  canPitch() {
    return this.pitchCooldown <= 0 && !this.over;
  }

  startPitch() {
    if (!this.canPitch()) {
      this.ticker(`🚪 The VCs aren't taking your calls for ${this.pitchCooldown} more day(s). 'Circle back' means never.`);
      return;
    }
    const lines = [...PITCH_LINES].sort(() => Math.random() - 0.5).slice(0, 3);
    if (this.ui) this.ui.showPitch(lines);
  }

  resolvePitch(line) {
    const chance = Math.min(0.95, 0.35 + this.hype * 0.012 + line.bonus);
    if (Math.random() < chance) {
      const amount = Math.max(40000, Math.round((this.valuation() * 0.15) / 1000) * 1000);
      const dilution = Math.round(rand(8, 16));
      this.cash += amount;
      this.stats.raised += amount;
      this.equity = Math.max(1, this.equity - dilution);
      this.hype += 4;
      this.pitchCooldown = 5;
      return { success: true, text: `${pick(PITCH_SUCCESS)}\n\n💰 Raised ${fmtMoney(amount)} for ${dilution}% of the company.` };
    } else {
      this.hype = Math.max(0, this.hype - 2);
      this.pitchCooldown = 3;
      return { success: false, text: pick(PITCH_FAIL) };
    }
  }

  // ---------- events ----------
  maybeEvent() {
    if (this.eventCooldown > 0) { this.eventCooldown--; return; }
    if (Math.random() > 0.45) return;
    const eligible = EVENTS.filter((e) => !e.cond || e.cond(this));
    if (!eligible.length) return;
    const ev = pick(eligible);
    this.eventCooldown = 1 + Math.floor(Math.random() * 2);
    this.sfx("event");
    if (this.ui) this.ui.showEvent(ev);
  }

  endGame(title, text) {
    this.over = true;
    Game.clearSave();
    if (this.ui) this.ui.showEnding(title, text);
  }

  checkMilestones() {
    for (const m of MILESTONES) {
      if (!this.flags[m.key] && m.cond(this)) {
        this.flags[m.key] = true;
        this.sfx("milestone");
        if (this.ui) this.ui.toast(m.msg);
        this.ticker(m.msg);
      }
    }
  }

  // ---------- persistence ----------
  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: 1,
        nextId: uidPeek(),
        cash: this.cash, hype: this.hype, equity: this.equity,
        day: this.day, dayTime: this.dayTime,
        shipped: this.shipped, quits: this.quits,
        eventCooldown: this.eventCooldown, pitchCooldown: this.pitchCooldown,
        flags: this.flags, stats: this.stats, won: this.won,
        objects: this.objects,
        staff: this.staff.map((s) => ({
          id: s.id, name: s.name, roleKey: s.role.key, skill: s.skill,
          salary: s.salary, bio: s.bio, emoji: s.emoji,
          x: s.x, y: s.y, needs: s.needs, deskId: s.desk ? s.desk.id : null,
        })),
        candidates: this.candidates.map((c) => ({ ...c, role: undefined, roleKey: c.role.key })),
        available: this.available,
        active: this.active,
        log: this.log.slice(0, 10),
      }));
    } catch (e) { /* private mode / quota — the save is a nice-to-have */ }
  }

  static hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
  }

  static clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* shrug */ }
  }

  static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (d.v !== 1) return null;
      const g = new Game();
      // wipe constructor defaults
      g.objects = d.objects;
      g.log = d.log.map((l) => ({ ...l }));
      Object.assign(g, {
        cash: d.cash, hype: d.hype, equity: d.equity, day: d.day, dayTime: d.dayTime,
        shipped: d.shipped, quits: d.quits, eventCooldown: d.eventCooldown,
        pitchCooldown: d.pitchCooldown, flags: d.flags, stats: d.stats, won: d.won || false,
      });
      g.candidates = d.candidates.map((c) => ({ ...c, role: ROLES[c.roleKey] }));
      g.available = d.available;
      g.active = d.active;
      g.staff = d.staff.map((sd) => {
        const s = new Staff({
          id: sd.id, name: sd.name, role: ROLES[sd.roleKey], skill: sd.skill,
          salary: sd.salary, bio: sd.bio, emoji: sd.emoji,
        });
        s.x = sd.x; s.y = sd.y; s.needs = sd.needs;
        s.desk = g.objects.find((o) => o.id === sd.deskId) || null;
        s.state = "idle";
        return s;
      });
      setUidFloor(d.nextId);
      g.ticker("💾 Save loaded. The technical debt was exactly where you left it.");
      return g;
    } catch (e) {
      return null;
    }
  }

  // ---------- main loop ----------
  update(dt) {
    if (this.over || this.modalOpen || this.speed === 0) return;

    this.dayTime += dt;
    while (this.dayTime >= DAY_LENGTH) {
      this.dayTime -= DAY_LENGTH;
      this.newDay();
      if (this.over || this.modalOpen) return;
    }

    // staff sim (copy: update() can remove members)
    [...this.staff].forEach((s) => s.update(dt, this));

    // bug generation
    this.active.forEach((p) => {
      if (p.progress > 0 && Math.random() < dt * 0.012 * this.bugFactor()) {
        p.bugs++;
        p.work += 12;
        this.ticker(pick(BUG_LINES).replace("{project}", p.name));
      }
    });

    // ambient comedy
    this.ambientTimer -= dt;
    if (this.ambientTimer <= 0) {
      this.ambientTimer = 18 + Math.random() * 25;
      if (this.staff.length) {
        this.ticker(pick(AMBIENT_LINES).replace("{name}", pick(this.staff).name));
      }
    }

    // milestones (cheap check, ~1/s)
    this.milestoneTimer -= dt;
    if (this.milestoneTimer <= 0) {
      this.milestoneTimer = 1;
      this.checkMilestones();
    }

    // win condition
    if (!this.won && this.valuation() >= 1e9) {
      this.won = true;
      this.save();
      if (this.ui) this.ui.showEnding(UNICORN_ENDING.title, UNICORN_ENDING.text, true);
    }
  }

  newDay() {
    this.day++;
    const burn = this.burnRate();
    if (burn > 0) {
      this.cash -= burn;
      this.stats.burned += burn;
      this.ticker(`💸 Payroll day: -${fmtMoney(burn)}. Money well spent. Probably.`);
    }
    this.stats.peakValuation = Math.max(this.stats.peakValuation, this.valuation());
    if (this.pitchCooldown > 0) this.pitchCooldown--;

    // refresh candidate pool
    if (this.day % 2 === 0) {
      while (this.candidates.length < 4) this.candidates.push(genCandidate());
    }
    // refresh project listings
    if (this.available.length < 3 && Math.random() < 0.7) {
      this.available.push(genProject());
    }

    // 10x engineers being 10x engineers
    this.staff.filter((s) => s.role.key === "tenx").forEach((s) => {
      if (Math.random() < 0.12 && this.active[0] && this.active[0].progress > 10) {
        this.active[0].progress *= 0.85;
        this.ticker(`🧙 ${s.name} 'improved' the architecture overnight. Progress on "${this.active[0].name}" mysteriously decreased.`);
      }
    });

    this.maybeEvent();

    if (this.cash < 0) {
      this.endGame(BROKE_ENDING.title, BROKE_ENDING.text);
    } else {
      this.save();
    }
    this.dirty = true;
  }
}

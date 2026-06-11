// ============================================================
// staff.js — employee simulation. Needs, moods, rage-quits.
// ============================================================
import { TILE, GRID_H, pick, QUIT_LINES, BREAK_LINES, IDLE_LINES } from "./data.js";

const MOVE_SPEED = 110; // px/s
const BASE_WORK_RATE = 1.5; // work units/s at skill 1, full mood
const NEED_LOW = 28;

const NEED_DECAY = {
  caffeine: 1.2,
  joy: 0.5,
  sanity: 0.3,
};

const NEED_HINTS = {
  caffeine: "an Espresso Machine",
  joy: "a Ping Pong Table or Arcade",
  sanity: "a Nap Pod or Meditation Corner",
};

export class Staff {
  constructor(cand) {
    this.id = cand.id;
    this.name = cand.name;
    this.role = cand.role;
    this.skill = cand.skill;
    this.salary = cand.salary;
    this.bio = cand.bio;
    this.emoji = cand.emoji;

    // spawn at the door (left wall, middle-ish)
    this.x = TILE * 0.5;
    this.y = TILE * (GRID_H / 2);
    this.desk = null;
    this.state = "idle"; // idle | toDesk | working | toBreak | onBreak
    this.target = null; // {x, y} px
    this.breakObj = null;
    this.breakNeed = null;
    this.useTimer = 0;
    this.idleQuipTimer = 20 + Math.random() * 30;
    this.bobPhase = Math.random() * Math.PI * 2;

    this.needs = {
      caffeine: 70 + Math.random() * 30,
      joy: 70 + Math.random() * 30,
      sanity: 80 + Math.random() * 20,
    };
  }

  mood() {
    return (this.needs.caffeine + this.needs.joy + this.needs.sanity) / 300;
  }

  lowestNeed() {
    let key = "caffeine";
    for (const k of ["joy", "sanity"]) {
      if (this.needs[k] < this.needs[key]) key = k;
    }
    return key;
  }

  atTarget() {
    if (!this.target) return true;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    return dx * dx + dy * dy < 16;
  }

  moveToward(dt) {
    if (!this.target) return;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) return;
    const step = Math.min(MOVE_SPEED * dt, dist);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
  }

  update(dt, game) {
    // --- need decay ---
    const tenxCount = game.staff.filter((s) => s.role.key === "tenx" && s !== this).length;
    this.needs.caffeine -= dt * NEED_DECAY.caffeine;
    // Agile Coaches never lose joy. They love it here. It's unnerving.
    if (this.role.key !== "scrum") {
      this.needs.joy -= dt * NEED_DECAY.joy * (1 + 0.3 * tenxCount);
    }
    const bugLoad = game.active.reduce((a, p) => a + p.bugs, 0);
    this.needs.sanity -= dt * NEED_DECAY.sanity * (1 + Math.min(bugLoad * 0.1, 1));
    for (const k in this.needs) this.needs[k] = Math.max(0, Math.min(100, this.needs[k]));

    // --- rage quit check ---
    if (this.needs.sanity <= 0 || (this.needs.joy <= 0 && this.needs.caffeine <= 0)) {
      if (Math.random() < dt * 0.06) {
        game.removeStaff(this, pick(QUIT_LINES).replace("{name}", this.name));
        return;
      }
    }

    // --- state machine ---
    switch (this.state) {
      case "toBreak": {
        this.moveToward(dt);
        if (this.atTarget()) {
          this.state = "onBreak";
          this.useTimer = 2.5;
        }
        break;
      }
      case "onBreak": {
        this.useTimer -= dt;
        if (this.useTimer <= 0) {
          if (this.breakNeed) this.needs[this.breakNeed] = 95;
          if (Math.random() < 0.25) {
            game.ticker(pick(BREAK_LINES).replace("{name}", this.name));
          }
          this.breakObj = null;
          this.breakNeed = null;
          this.goToDeskOrIdle(game);
        }
        break;
      }
      case "toDesk": {
        this.moveToward(dt);
        if (this.atTarget()) this.state = "working";
        break;
      }
      case "working": {
        if (!this.desk) { this.goToDeskOrIdle(game); break; }
        // need a break?
        const needKey = this.lowestNeed();
        if (this.needs[needKey] < NEED_LOW) {
          if (this.tryBreak(game, needKey)) break;
          // no satisfier in the office — warn the boss (occasionally)
          this.warnTimer = (this.warnTimer ?? 0) - dt;
          if (this.warnTimer <= 0) {
            this.warnTimer = 40 + Math.random() * 30;
            game.ticker(`⚠️ ${this.name} is dangerously close to starting a podcast. Consider buying ${NEED_HINTS[needKey]}.`);
          }
        }
        if (this.needs[needKey] <= 0) this.needs.sanity -= dt * 0.25; // suffering silently

        // produce output
        const caffMult = this.needs.caffeine < NEED_LOW ? 0.4 : 1;
        const moodMult = 0.5 + this.mood() * 0.5;
        const rate = this.skill * this.role.workMult * caffMult * moodMult * game.outputMult() * BASE_WORK_RATE;

        if (this.role.key === "growth") {
          game.hype += dt * 0.022 * this.skill;
        } else if (this.role.workMult > 0) {
          const worked = game.applyWork(rate * dt);
          if (!worked) {
            this.idleQuipTimer -= dt;
            if (this.idleQuipTimer <= 0) {
              this.idleQuipTimer = 35 + Math.random() * 40;
              game.ticker(pick(IDLE_LINES).replace("{name}", this.name));
            }
          }
        }
        break;
      }
      default: { // idle — find a desk or mill around
        if (!this.desk) {
          this.desk = game.claimDesk(this);
        }
        if (this.desk) {
          this.goToDeskOrIdle(game);
        } else {
          // perpetual standup
          if (!this.target || this.atTarget()) {
            this.target = game.randomFloorSpot();
          }
          this.moveToward(dt * 0.4);
          const needKey = this.lowestNeed();
          if (this.needs[needKey] < NEED_LOW) this.tryBreak(game, needKey);
        }
      }
    }
  }

  tryBreak(game, needKey) {
    const obj = game.findObjectFor(needKey);
    if (!obj) return false;
    this.breakObj = obj;
    this.breakNeed = needKey;
    this.target = { x: (obj.x + 0.5) * TILE, y: (obj.y + 0.5) * TILE + 10 };
    this.state = "toBreak";
    return true;
  }

  goToDeskOrIdle(game) {
    if (!this.desk) this.desk = game.claimDesk(this);
    if (this.desk) {
      this.target = { x: (this.desk.x + 0.5) * TILE, y: (this.desk.y + 0.5) * TILE + 14 };
      this.state = "toDesk";
    } else {
      this.state = "idle";
      this.target = null;
    }
  }
}

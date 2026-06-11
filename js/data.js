// ============================================================
// data.js — names, bios, catalogs, events. The comedy payload.
// ============================================================

export const TILE = 48;
export const GRID_W = 18;
export const GRID_H = 11;
export const DAY_LENGTH = 24; // real seconds per in-game day at 1x

let _id = 1;
export const uid = () => _id++;
export const uidPeek = () => _id;
export const setUidFloor = (n) => { if (n > _id) _id = n; };

export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function fmtMoney(n) {
  const sign = n < 0 ? "-" : "";
  n = Math.abs(n);
  if (n >= 1e9) return `${sign}$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${sign}$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e4) return `${sign}$${(n / 1e3).toFixed(1)}k`;
  return `${sign}$${Math.round(n).toLocaleString()}`;
}

// ---------------- Office objects ----------------
export const OBJECT_TYPES = {
  desk: {
    name: "Standing Desk", emoji: "🖥️", cost: 600,
    desc: "Ergonomic enough to silence complaints, wobbly enough to remind everyone who's in charge of the budget. Each employee needs one to 'work'.",
  },
  coffee: {
    name: "Espresso Machine", emoji: "☕", cost: 1200, restores: "caffeine",
    desc: "Converts money into code, with a brief human intermediary step.",
  },
  kombucha: {
    name: "Kombucha Tap", emoji: "🍹", cost: 2500, restores: "caffeine",
    desc: "Tastes like vinegar, signals like equity.",
  },
  pingpong: {
    name: "Ping Pong Table", emoji: "🏓", cost: 1800, restores: "joy",
    desc: "Where sprints go to die.",
  },
  arcade: {
    name: "Retro Arcade", emoji: "🕹️", cost: 3500, restores: "joy",
    desc: "Nothing says 'we're profitable' like a $3,500 Galaga machine. You are not profitable.",
  },
  foosball: {
    name: "Foosball Table", emoji: "⚽", cost: 2200, restores: "joy",
    desc: "Spin to win. The quiet one from infra is suspiciously good. Unsettlingly good.",
  },
  aquarium: {
    name: "Aquarium of Neglect", emoji: "🐠", cost: 3000, restores: "sanity",
    desc: "Three fish. One survivor of the last pivot. His name is Gilfoyle and he judges you.",
  },
  nappod: {
    name: "Nap Pod", emoji: "🛌", cost: 4000, restores: "sanity",
    desc: "Sleeping at work, but make it venture-backed.",
  },
  zen: {
    name: "Meditation Corner", emoji: "🪴", cost: 900, restores: "sanity",
    desc: "A plant and a cushion. The plant is plastic. So is the mindfulness.",
  },
  server: {
    name: "Server Rack", emoji: "🗄️", cost: 5000,
    desc: "On-prem? Bold. The cloud called — it's laughing. Reduces bug rate 12% each (max 4).",
  },
  whiteboard: {
    name: "Whiteboard", emoji: "📋", cost: 400,
    desc: "For architecture diagrams nobody will ever look at again. +4% productivity each (max 5).",
  },
};

// ---------------- Staff roles ----------------
export const ROLES = {
  dev: {
    key: "dev", name: "Software Engineer", emojis: ["🧑‍💻", "👩‍💻", "👨‍💻"],
    salary: [180, 260], workMult: 1,
    desc: "Turns coffee into bugs. Occasionally features.",
  },
  tenx: {
    key: "tenx", name: "10x Engineer", emojis: ["🧙", "🥷"],
    salary: [750, 950], workMult: 6,
    desc: "Ten times the output (self-reported). Comes with a complimentary personality. Drains everyone else's joy just by existing.",
  },
  designer: {
    key: "designer", name: "Designer", emojis: ["🧑‍🎨", "👩‍🎨"],
    salary: [220, 300], workMult: 0.3,
    desc: "Makes it pretty. Boosts project payouts +12% each. Silently judges your font choices.",
  },
  growth: {
    key: "growth", name: "Growth Hacker", emojis: ["🕴️", "💁"],
    salary: [200, 280], workMult: 0,
    desc: "Generates hype instead of code. Nobody knows how. It's best not to ask.",
  },
  scrum: {
    key: "scrum", name: "Agile Coach", emojis: ["🧑‍🏫", "🦸"],
    salary: [280, 340], workMult: 0,
    desc: "Produces nothing, but the team feels organized. Slows everyone down 7% with meetings. You will hire one anyway.",
  },
};

const FIRST_NAMES = [
  "Chad", "Blake", "Skyler", "Zane", "Juniper", "Sage", "Phoenix", "Atlas",
  "Kai", "Brynn", "Tanner", "Madison", "Logan", "Harper", "Quinn", "Dakota",
  "Rowan", "Ember", "Caden", "Aria", "Jett", "Luna", "Bodhi", "Wren",
];
const LAST_NAMES = [
  "Park", "Chen", "Novak", "Okafor", "Lindqvist", "Marsh", "Vega", "Bishop",
  "Stone", "Webb", "Frost", "Hale", "Iyer", "Costa", "Reyes", "Nakamura",
  "Moss", "Delgado", "Becker", "Singh",
];

const BIOS = [
  "Refuses to write tests. Calls production 'the ultimate test environment'.",
  "Has 47 unfinished side projects and will tell you about every one.",
  "Once met a billionaire at a conference. It comes up a lot.",
  "Vim user. You'll know within 30 seconds.",
  "Communicates exclusively via Slack reactions.",
  "Wants to rewrite everything in Rust. Everything. Including the standup.",
  "Left a FAANG job for 'the culture'. Regrets it visibly.",
  "Email signature says 'thought leader'. Unironically.",
  "Believes the blockchain will fix this. Whatever 'this' is.",
  "Last startup pivoted six times and exited via fire sale. 'Great learnings.'",
  "Microdoses optimism.",
  "Says 'let's take this offline' during in-person meetings.",
  "Won a hackathon in 2019. Has been their entire personality since.",
  "Strong opinions about standing desks. Stronger opinions about you.",
  "Codes exclusively between 11 PM and 4 AM. Do not schedule standups.",
  "Lists 'middle-out compression' as a core competency.",
  "Keeps pitching 'SeeFood, but for drinks'. It's a menu.",
  "Owns three mechanical keyboards. Brings all of them.",
  "Quotes their own tweets in meetings.",
  "Refers to lunch as 'a sync'.",
  "Did a TED talk. It was a TEDx. In a library. Four people came.",
  "Negotiated their salary in Dogecoin once. Once.",
  "Describes themselves as 'pre-success'.",
];

export function genCandidate() {
  const r = Math.random();
  let role;
  if (r < 0.45) role = ROLES.dev;
  else if (r < 0.60) role = ROLES.designer;
  else if (r < 0.75) role = ROLES.growth;
  else if (r < 0.88) role = ROLES.tenx;
  else role = ROLES.scrum;

  const skill = role.key === "tenx" ? rand(0.9, 1.4) : rand(0.7, 1.4);
  const salary = Math.round((rand(role.salary[0], role.salary[1]) * (0.7 + skill * 0.3)) / 10) * 10;
  return {
    id: uid(),
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    role,
    skill,
    salary,
    bio: pick(BIOS),
    emoji: pick(role.emojis),
  };
}

// ---------------- Projects ----------------
const PROJECT_TEMPLATES = [
  { name: "NotHotdog 2.0", desc: "An app that identifies whether food is a hot dog. Now with a subscription tier.", work: 140, payout: 9000, hype: 4 },
  { name: "Uber for Llamas", desc: "On-demand llama delivery. The llamas did not consent.", work: 200, payout: 14000, hype: 5 },
  { name: "Blockchain Toothbrush", desc: "Brush-to-earn. Dentists hate it. Everyone hates it.", work: 260, payout: 18000, hype: 6 },
  { name: "AI-Powered Pet Rock", desc: "It's a rock with a Bluetooth chip. The 'AI' is a for-loop.", work: 120, payout: 8000, hype: 4 },
  { name: "Middle-Out SDK", desc: "Optimal tip-to-tip compression efficiency. Don't ask about the whiteboard math.", work: 380, payout: 30000, hype: 9 },
  { name: "JuiceMate Press", desc: "A $700 Wi-Fi juicer for bags you could squeeze by hand.", work: 220, payout: 15000, hype: 5 },
  { name: "DogeWallet Enterprise", desc: "A crypto wallet for Fortune 500 CFOs having a midlife crisis.", work: 300, payout: 22000, hype: 7 },
  { name: "Calendar for Your Calendar", desc: "Meta-scheduling. Schedule time to schedule. B2B SaaS at its purest.", work: 160, payout: 11000, hype: 4 },
  { name: "Smart Fridge OS", desc: "Your fridge will send push notifications. You will regret everything.", work: 280, payout: 19000, hype: 6 },
  { name: "Avocato", desc: "A social network for avocado enthusiasts. The founder also flies planes.", work: 180, payout: 12000, hype: 5 },
  { name: "Mindfulness API", desc: "REST endpoints that return 'om'. The latency is part of the journey.", work: 130, payout: 8500, hype: 4 },
  { name: "Hoolie Phone Firmware", desc: "Contract work on a phone that occasionally catches fire. Ship it anyway.", work: 420, payout: 34000, hype: 8 },
  { name: "Seed-Stage Dating App", desc: "Matches founders with co-founders. Everyone lies about their MRR.", work: 170, payout: 11500, hype: 5 },
  { name: "VR Spreadsheets", desc: "Excel, but you wear a headset and feel nauseous. Enterprise loves it.", work: 340, payout: 26000, hype: 7 },
];

export function genProject() {
  const t = pick(PROJECT_TEMPLATES);
  const scale = rand(0.85, 1.25);
  return {
    id: uid(),
    name: t.name,
    desc: t.desc,
    work: Math.round(t.work * scale),
    payout: Math.round((t.payout * scale) / 500) * 500,
    hype: t.hype,
    progress: 0,
    bugs: 0,
  };
}

// ---------------- Ambient ticker lines ----------------
export const AMBIENT_LINES = [
  "{name} pushed directly to main. Thoughts and prayers.",
  "Someone scheduled a meeting about reducing meetings.",
  "{name} is explaining microservices to the office plant.",
  "The standup has entered its 45th minute.",
  "{name} added 14 npm packages to save 3 lines of code.",
  "Slack is down. Productivity up 400%.",
  "{name} closed a ticket as 'works on my machine'.",
  "A recruiter from Hoolie just messaged your entire team on LinkedIn.",
  "{name} renamed a variable for two hours. It's worse now.",
  "The office thermostat war has claimed another sweater.",
  "{name} starred 23 GitHub repos instead of working. 'Research.'",
  "Someone wrote 'synergy' on the whiteboard. Unprompted.",
  "{name} is A/B testing their own standup updates.",
  "The CI pipeline is red. It has been red since the founding.",
  "{name} proposed a rewrite. Of the rewrite.",
  "Legal asked what the product does. Nobody answered.",
  "{name} has a meeting that could have been an email about an email that could have been nothing.",
  "The roadmap was updated. It is now a roadmap to a different place.",
  "{name} described the codebase as 'load-bearing spaghetti'. Accurate.",
  "Someone deployed on a Friday. Candles have been lit.",
  "{name} is arguing with a linter. The linter is winning.",
  "The 'quick sync' has produced four action items and zero actions.",
];

export const IDLE_LINES = [
  "{name} is polishing their dotfiles. Billable, apparently.",
  "{name} is refactoring code that has no project attached.",
  "{name} is updating their LinkedIn to 'building something new'.",
  "No active projects. {name} is benchmarking keyboard latency.",
];

export const BUG_LINES = [
  "🐛 Bug in {project}: the login button logs users out.",
  "🐛 Bug in {project}: crashes if the user's name contains a vowel.",
  "🐛 Bug in {project}: dark mode permanently on. Some call it a feature.",
  "🐛 Bug in {project}: sends 'OK boomer' to all contacts at midnight.",
  "🐛 Bug in {project}: the loading spinner spins counterclockwise in Australia.",
  "🐛 Bug in {project}: 'delete account' deletes a different account.",
  "🐛 Bug in {project}: timezone math summoned something. It has opinions.",
];

export const QUIT_LINES = [
  "💼 {name} rage-quit to 'pursue a passion project'. It's a podcast.",
  "💼 {name} left to found a competitor. They took the good whiteboard markers.",
  "💼 {name} quit via Slack emoji. Just the 🫡.",
  "💼 {name} joined a 'stealth startup'. It's unemployment.",
  "💼 {name} left for Hoolie. They got a signing bonus and a soul-extraction.",
];

export const BREAK_LINES = [
  "{name} has achieved optimal caffeination. Fear them.",
  "{name} declared ping pong 'basically cardio'.",
  "{name} emerged from the nap pod claiming to have 'solved scaling'.",
  "{name} is on their fourth espresso. The code is getting... creative.",
];

export const JOIN_LINES = [
  "🎉 {name} joined! They've already suggested a rewrite.",
  "🎉 {name} joined and immediately asked about the equity. Awkward.",
  "🎉 {name} joined! Their first commit broke the build. Tradition.",
  "🎉 {name} onboarded in record time by reading zero documentation.",
];

// ---------------- Pitch lines (funding minigame) ----------------
export const PITCH_LINES = [
  { text: "\"We're the Uber of this entire category.\"", bonus: 0.10 },
  { text: "\"AI-first, mobile-second, profit-never.\"", bonus: 0.25 },
  { text: "\"Our TAM is everyone who eats food.\"", bonus: 0.05 },
  { text: "\"We make the world a better place through scalable synergy.\"", bonus: 0.20 },
  { text: "\"Revenue is a vanity metric. We optimize for vibes.\"", bonus: -0.10 },
  { text: "\"Think Amazon, but smaller and losing money faster.\"", bonus: 0.15 },
  { text: "\"It's a platform. Everything is a platform. You're a platform.\"", bonus: 0.10 },
  { text: "\"We'll figure out monetization post-IPO.\"", bonus: 0.0 },
  { text: "\"Our churn is negative if you read the chart upside down.\"", bonus: 0.05 },
  { text: "\"We're pre-revenue, pre-product, and post-doubt.\"", bonus: 0.15 },
];

export const PITCH_SUCCESS = [
  "The partners nodded slowly, which is VC for ecstasy. Term sheet signed on a napkin.",
  "One investor said 'this could be a fund-returner' and another one cried.",
  "They didn't understand the product, which they interpreted as genius.",
  "An associate asked one hard question and was escorted out. The money is yours.",
];

export const PITCH_FAIL = [
  "A partner fell asleep mid-pitch. His snore was somehow condescending.",
  "They passed, but offered to 'stay close to the company'. That means no.",
  "The feedback: 'love the energy, hate everything else'.",
  "They invested in your competitor during your pitch. From the same room.",
];

// ---------------- Events ----------------
export const EVENTS = [
  {
    title: "The Midnight Rewrite",
    cond: (g) => g.staff.some((s) => s.role.key === "tenx"),
    desc: "Your 10x engineer rewrote the entire codebase in a framework released eleven days ago. Nothing works, but it's 'architecturally pure' now.",
    choices: [
      {
        label: "Praise the initiative 👏",
        effect: (g) => {
          if (g.active[0]) g.active[0].progress *= 0.7;
          g.adjustAll("joy", 10);
          return "Morale soars. Progress craters. The 10x engineer has begun a blog series about it.";
        },
      },
      {
        label: "git revert --hard 🔨",
        effect: (g) => {
          g.staff.filter((s) => s.role.key === "tenx").forEach((s) => (s.needs.sanity -= 35));
          return "Reverted. Your 10x engineer is now typing very loudly and updating their résumé in a visible browser tab.";
        },
      },
    ],
  },
  {
    title: "Hoolie Wants To Buy You",
    cond: (g) => g.valuation() > 2e6,
    desc: (g) => `Hoolie — the megacorp whose motto is 'Making the world a better place, legally distinct from other mottos' — offers ${fmtMoney(g.valuation() * 0.6)} to acquire you. It's a lowball and everyone knows it.`,
    choices: [
      {
        label: "Take the money 🏃💨",
        effect: (g) => {
          g.endGame("ACQUIRED 🤝", `You sold for ${fmtMoney(g.valuation() * 0.6 * (g.equity / 100))} (your share, after the VCs took theirs). Your product was shut down 6 weeks later and rebranded as Hoolie Chat+. You now give talks titled 'The Exit Mindset'. Nobody asks follow-up questions.`);
          return "";
        },
      },
      {
        label: "\"We're making the world a better place\" ✊",
        effect: (g) => {
          g.hype += 15;
          g.adjustAll("sanity", -10);
          return "You turned down generational wealth on principle. The team is inspired and quietly terrified. Hoolie announced an identical product the next morning.";
        },
      },
    ],
  },
  {
    title: "Tabs vs. Spaces",
    cond: (g) => g.staff.length >= 3,
    desc: "A civil war has erupted over indentation. Two engineers haven't spoken in days except through increasingly hostile linter configs.",
    choices: [
      {
        label: "Mandate tabs ↹",
        effect: (g) => {
          g.adjustAll("joy", -15);
          return "The spaces faction has begun leaving passive-aggressive code reviews. One of them changed their Slack status to 'exploring options'.";
        },
      },
      {
        label: "Mandate spaces ␣",
        effect: (g) => {
          g.adjustAll("joy", -15);
          return "The tabs faction now indents with a single space, out of spite. The linter is crying.";
        },
      },
    ],
  },
  {
    title: "VC Drive-By",
    desc: "Gauss Manneman — the investor with three commas in his license plate — screeches up in an orange McLaren and offers you $500k. Unsolicited. He's already inside.",
    choices: [
      {
        label: "Take the money 💸",
        effect: (g) => {
          g.cash += 500000;
          g.stats.raised += 500000;
          g.equity = Math.max(1, g.equity - 8);
          g.hype += 5;
          return "He took 8% and the parking spot closest to the door. He's also installed a kegerator 'as a board observer'. He is not on the board.";
        },
      },
      {
        label: "Politely decline 🙅",
        effect: (g) => {
          g.adjustAll("sanity", 10);
          return "He called you 'pre-billionaire-mindset' and did a burnout in the parking lot. The team's respect for you has measurably increased.";
        },
      },
    ],
  },
  {
    title: "PRODUCTION IS DOWN",
    cond: (g) => g.active.length > 0,
    desc: "Everything is on fire. The status page — which is also down — would say 'degraded performance'. A customer found your personal phone number.",
    choices: [
      {
        label: "All hands on deck 🚒",
        effect: (g) => {
          g.adjustAll("sanity", -15);
          return "Fixed in 9 hours. Root cause: someone deployed on a Friday. The someone was you.";
        },
      },
      {
        label: "Blame the intern 👉",
        effect: (g) => {
          g.hype -= 5;
          g.adjustAll("joy", -10);
          return "You don't have an intern. You blamed one anyway. The team noticed. TechCrunch noticed. The fictional intern has a support hashtag now.";
        },
      },
    ],
  },
  {
    title: "Front Page of Hacker News",
    desc: "Someone posted your product to Hacker News. The top comment is someone explaining how they'd build it in a weekend. The second comment corrects the first one's grammar.",
    choices: [
      {
        label: "Ride the wave 🏄",
        effect: (g) => {
          g.hype += 18;
          return "Traffic up 4000%. Sign-ups up 12. A user opened a GitHub issue titled 'why'. You've made it.";
        },
      },
    ],
  },
  {
    title: "The Kombucha Incident",
    desc: "Someone's homebrew kombucha experiment achieved sentience and then achieved explosion. The break room ceiling is... textured now.",
    choices: [
      {
        label: "Pay for cleaning 🧽",
        effect: (g) => {
          g.cash -= 800;
          g.adjustAll("joy", 12);
          return "$800 in damages, but the security footage is the greatest thing anyone has ever seen. Morale has never been higher.";
        },
      },
    ],
  },
  {
    title: "DisruptCon Invitation",
    desc: "Your team is invited to DisruptCon, the conference where keynote speakers say 'journey' 40 times an hour and the Wi-Fi never works.",
    choices: [
      {
        label: "Send everyone 🎪 ($3,000)",
        effect: (g) => {
          g.cash -= 3000;
          g.hype += 12;
          g.adjustAll("joy", 10);
          if (g.active[0]) g.active[0].progress *= 0.92;
          return "The team returned with 47 branded fidget spinners, three sales leads (two are crypto scams), and a group photo with a robot dog.";
        },
      },
      {
        label: "Skip it 🏠",
        effect: (g) => {
          g.adjustAll("joy", -8);
          return "FOMO inflicted. The team spent the day watching the livestream and muttering 'we could have had the robot dog'.";
        },
      },
    ],
  },
  {
    title: "Pivot Pressure",
    desc: "An advisor (equity: 2%, contributions: this) suggests pivoting to 'AI-blockchain-for-climate'. He read about it on a flight.",
    choices: [
      {
        label: "Add 'AI' to the landing page 🤖",
        effect: (g) => {
          g.hype += 8;
          g.adjustAll("sanity", -5);
          return "You changed one word. Valuation up. Three engineers asked what the AI does. You said 'great question' and walked away.";
        },
      },
      {
        label: "Refuse to pivot 🧱",
        effect: (g) => {
          g.hype -= 3;
          g.adjustAll("sanity", 8);
          return "The advisor called you 'un-coachable' and sent a 9-paragraph email with a TED talk attached. The team respects you more.";
        },
      },
    ],
  },
  {
    title: "The Viral Tweet",
    desc: "Your growth hacker posted 'unpopular opinion: shipping is a mindset' and it somehow got 2 million views. You're famous. For nothing.",
    choices: [
      {
        label: "Capitalize immediately 📈",
        effect: (g) => {
          g.hype += 10;
          return "You've been invited on four podcasts. All hosted by the same guy. His name is also a mindset.";
        },
      },
    ],
  },
  {
    title: "Enterprise Customer Interest",
    cond: (g) => g.shipped >= 1,
    desc: "A Fortune 500 company wants to buy your product! They just need SSO, SOC 2, an on-prem deployment, IE11 support, and a 200-page security questionnaire answered by Friday.",
    choices: [
      {
        label: "YES. Yes to all of it 🤝",
        effect: (g) => {
          g.cash += 20000;
          g.adjustAll("sanity", -20);
          return "$20k! The security questionnaire asked if your office has a moat. Your engineers are now SOC 2 'enthusiasts', which is a coping mechanism.";
        },
      },
      {
        label: "We're not enterprise-ready 😌",
        effect: (g) => {
          g.adjustAll("sanity", 5);
          return "You said no to money. The team is shocked, relieved, and slightly worried about payroll. Mostly relieved.";
        },
      },
    ],
  },
];

EVENTS.push(
  {
    title: "The Mandatory Offsite",
    cond: (g) => g.staff.length >= 4,
    desc: "HR (you, wearing a different hat) has scheduled a team-building offsite. The venue offers trust falls, an escape room, and a facilitator named Breeze.",
    choices: [
      {
        label: "Full offsite experience 🧗 ($2,500)",
        effect: (g) => {
          g.cash -= 2500;
          g.adjustAll("joy", 18);
          g.adjustAll("sanity", 8);
          return "Two engineers got stuck in the escape room and refactored their way out through the ventilation logic puzzle. Breeze cried. Morale is up; nobody knows why.";
        },
      },
      {
        label: "'Offsite' = pizza in the break room 🍕 ($120)",
        effect: (g) => {
          g.cash -= 120;
          g.adjustAll("joy", 6);
          return "The team rated it 'better than the real thing'. Breeze left a voicemail. You will not be returning it.";
        },
      },
    ],
  },
  {
    title: "Open Source Drama",
    cond: (g) => g.shipped >= 1,
    desc: "An engineer open-sourced an internal utility. It now has 4,000 stars, 200 issues, one demanding user named xXdev_lord99Xx, and zero contributors.",
    choices: [
      {
        label: "Embrace it — assign maintenance time 🌱",
        effect: (g) => {
          g.hype += 10;
          if (g.active[0]) g.active[0].progress *= 0.95;
          return "Hype is up! xXdev_lord99Xx opened an issue titled 'this library ruined my wedding'. It has 47 thumbs-up.";
        },
      },
      {
        label: "Archive the repo 🪦",
        effect: (g) => {
          g.hype -= 3;
          g.adjustAll("joy", -6);
          return "Archived. A fork named 'YourLib-but-good' appeared within the hour. It's already more popular.";
        },
      },
    ],
  }
);

// ---------------- Milestones (one-shot toasts) ----------------
export const MILESTONES = [
  { key: "first-hire", cond: (g) => g.staff.length >= 1, msg: "🎉 First employee! You're officially 'scaling'." },
  { key: "five-staff", cond: (g) => g.staff.length >= 5, msg: "🏢 5 employees. You now spend 40% of your time on 'culture'." },
  { key: "ten-staff", cond: (g) => g.staff.length >= 10, msg: "🏟️ 10 employees. Someone just suggested an offsite. It begins." },
  { key: "first-ship", cond: (g) => g.shipped >= 1, msg: "🚀 First product shipped! Champagne is not in the budget. Here's kombucha." },
  { key: "cash-100k", cond: (g) => g.cash >= 100000, msg: "💰 $100k in the bank. Somewhere, a VC just sensed it and woke up." },
  { key: "cash-1m", cond: (g) => g.cash >= 1e6, msg: "💰 $1M cash. Your accountant suggests 'not a yacht'. Noted, ignored." },
  { key: "hype-50", cond: (g) => g.hype >= 50, msg: "🔥 50 hype. Strangers now tweet about you angrily. That's brand awareness." },
  { key: "val-10m", cond: (g) => g.valuation() >= 1e7, msg: "🦄 $10M valuation. Your parents still think you 'do computers'." },
  { key: "val-100m", cond: (g) => g.valuation() >= 1e8, msg: "🦄 $100M valuation. Forbes called. It was about an unpaid invoice." },
  { key: "first-quit", cond: (g) => g.quits >= 1, msg: "📝 First rage-quit. Glassdoor review incoming: 'great snacks, however—'" },
  { key: "ship-10", cond: (g) => g.shipped >= 10, msg: "📦 10 products shipped. None of them talk to each other. 'Ecosystem.'" },
];

// ---------------- Endings ----------------
export const BROKE_ENDING = {
  title: "OUT OF RUNWAY 💀",
  text: "The servers are off, the kombucha is warm, and your landlord is converting the office into a Pilates studio. Your post-mortem blog post — 'What I Learned Burning $2M' — got 12 claps on Medium. Three of them were you on different devices.",
};

export const UNICORN_ENDING = {
  title: "🦄 UNICORN STATUS",
  text: "One billion dollars. The valuation is imaginary, the product barely works, and your biggest customer is a company you secretly own — but the number has THREE COMMAS and that's what matters. Gauss Manneman just rang your doorbell. He wants to talk about a decacorn.",
};

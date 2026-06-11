# 🦄 Tech Debt Tycoon

*A startup mismanagement simulator.* Think Two Point Hospital, but the hospital is a software company and every patient is a production incident.

Build out your office, hire engineers with personality disorders, ship products nobody asked for ("Uber for Llamas", "Blockchain Toothbrush"), survive VC drive-bys, and chase a **$1B valuation** before the runway hits zero.

## 🎮 How to play

| Goal | Reach a $1,000,000,000 valuation (the number is imaginary; that's the point) |
|---|---|
| **Lose condition** | Cash below $0 on payroll day. The office becomes a Pilates studio. |

1. **Build** — place desks (employees need one to work), espresso machines, ping pong tables, nap pods. Click an item, click the floor. Right-click / Esc to stop.
2. **Hire** — candidates rotate every couple of days. Engineers write code, designers boost payouts, growth hackers manufacture hype, 10x engineers produce 6x output while destroying morale, and Agile Coaches produce nothing whatsoever. You will hire one anyway.
3. **Projects** — sign contracts, let the team grind through them, collect the payout. Bugs will appear. They always do.
4. **Needs** — keep ☕ caffeine, 🎮 joy, and 🧠 sanity up or people rage-quit via Slack emoji.
5. **Raise rounds** — when you're broke (or greedy), pitch VCs using only buzzwords. Choose wisely: *"AI-first, mobile-second, profit-never"* works better than it should.
6. **Events** — tabs vs. spaces civil wars, acquisition lowballs, production fires. Every choice is wrong; some are funnier.

**Controls:** Space = pause · ▶/⏩ = speed · 🔊 = mute the artisanal chiptune soundscape · hover anything for sarcastic tooltips.

**Extras:** progress autosaves every in-game day (localStorage). Add `?demo` to the URL for a pre-furnished office (handy for screenshots), or `?skipsplash` to skip the intro.

## 🚀 Run locally

No build step, no dependencies, no `node_modules` folder heavier than the sun. It's just static files — but ES modules need an HTTP server (opening `index.html` via `file://` won't work):

```bash
# any of these, from the project folder:
npx serve .
# or
python3 -m http.server 8000
```

Then open http://localhost:8000 (or whatever port it prints).

## 🌍 Publish it

This is a fully static site, so virtually any host works for free. Ranked by effort:

### Option 1: Vercel (recommended)

Zero config — Vercel auto-detects a static site. Two ways:

**CLI:**
```bash
npm i -g vercel    # one-time install
vercel             # deploy a preview, follow the prompts
vercel --prod      # promote to production
```
You'll get a live `*.vercel.app` URL in ~30 seconds. Free tier is more than enough.

**No CLI:** go to [vercel.com/new](https://vercel.com/new), drag the project folder onto the page (or import a GitHub repo). Done.

### Option 2: Netlify Drop (fastest, zero accounts-ish)

Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the folder onto the page. Instant URL.

### Option 3: GitHub Pages (free, good if the code lives on GitHub anyway)

```bash
git init && git add -A && git commit -m "ship it"
gh repo create tech-debt-tycoon --public --source=. --push
```
Then in the repo: **Settings → Pages → Source: main branch, / (root)**. Live at `https://<you>.github.io/tech-debt-tycoon/`.

### Option 4: Cloudflare Pages

[pages.cloudflare.com](https://pages.cloudflare.com) → connect repo or direct upload. Generous free tier, fast global CDN.

**Which one?** For a static game like this they're all equivalent in practice. **Vercel** is the smoothest if you want preview deployments per change and a nice CLI; **Netlify Drop** if you want a URL in the next 20 seconds with zero setup; **GitHub Pages** if the repo is already on GitHub and you never want to think about hosting again.

## 🗂 Project structure

```
index.html        layout: topbar, canvas, sidebar, ticker, modals
style.css         dark mode (we're a tech company, it's the law)
js/
  data.js         names, bios, objects, projects, events — the comedy payload
  game.js         core state + simulation loop
  staff.js        employee FSM: needs, moods, rage-quits
  render.js       canvas drawing (top-down office, emoji actors)
  ui.js           DOM panels, modals, toasts, news ticker
  sound.js        WebAudio synth — zero assets, pure bleeps
  main.js         bootstrap, input handling, rAF loop
```

## 📜 Disclaimers

Any resemblance to actual startups, living or acqui-hired, is statistically inevitable. No Agile Coaches were harmed in the making of this game; they were merely described accurately.

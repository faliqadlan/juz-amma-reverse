<!-- code-agent-template:managed -->
# Project Context

**Status:** Verified  
**Last verified:** 2026-07-17  
**Repository checkpoint:** `/var/www/juz-amma-reverse` — static web app, no build step

---

## Purpose

A static frontend web application for reading and listening to **Juz Amma** (Surahs 78–114 of the Quran) presented in **reverse order** (An-Nas → An-Naba), with Al-Fatihah pinned at the top of the list. Designed to support Quran memorization (murajaah) and background listening workflows.

_Evidence: `README.md` L1–3; `package.json` description field._

---

## Intended Users

Muslim users (Arabic and/or Indonesian/English-speaking) who are memorising Juz Amma and want to listen to or read the Surahs in reverse sequence to reinforce retention.

_Evidence: `README.md` L7–11; UI translations (English, Indonesian) in `app.js` L8._

---

## Current Capabilities and Flows

| Capability | Details | Evidence |
|---|---|---|
| Reverse Surah list | Al-Fatihah (1) + Surahs 114→78, rendered as sidebar items | `app.js` L117–133 |
| Reciter selection | Fetches all reciters from Quran.com API; filters by "Background" or "Murajaah" groups | `app.js` L15–115 |
| Verse display | Arabic (Uthmani script) + English + Indonesian translations per verse | `app.js` L178–232 |
| Bismillah prepend | Inserted visually (not as a verse) and played as separate audio clip before each Surah (except Al-Fatihah and At-Tawbah) | `app.js` L194–272 |
| Audio playback | Per-Surah chapter audio via Quran.com API; native `<audio>` controls | `app.js` L234–284 |
| Verse highlighting | `timeupdate` event syncs timestamp data from API to highlight active verse and auto-scroll | `app.js` L316–344 |
| Auto-play next | When a Surah ends, the next one in reverse list plays; after last Surah, advances to next reciter and restarts | `app.js` L347–371 |
| Session persistence | `localStorage` key `juzAmmaState` persists `filterType`, `reciterId`, `surahId`, `surahIndex`; restored on `init()` | `app.js` L32–60 |

---

## Technology Stack

| Layer | Technology | Evidence |
|---|---|---|
| Markup | HTML5 | `index.html` |
| Styles | Vanilla CSS3, custom properties, glassmorphism, media queries | `index.css` |
| Logic | Vanilla JavaScript (ES2020+, no framework) | `app.js` |
| Fonts | Google Fonts — Inter (UI), Amiri (Arabic) | `index.html` L8–10 |
| External API | Quran.com API v4 — chapters, verses, recitations | `app.js` multiple fetch() calls |
| Dev server | `http-server` (devDependency) | `package.json`; `playwright.config.js` L38 |
| E2E testing | Playwright (`@playwright/test ^1.61.1`), Chromium only | `package.json`; `playwright.config.js` |

---

## Architecture and Entry Points

```
/
├── index.html          # Shell: sidebar + main-content + audio player; loads app.js
├── index.css           # All styles; dark-mode glassmorphism; mobile breakpoint ≤768px
├── app.js              # All application logic (state, fetch, render, event listeners)
├── tests/
│   └── e2e.spec.js     # Playwright E2E spec (4 test cases)
├── playwright.config.js # baseURL=http://127.0.0.1:8080; webServer=http-server
└── package.json        # devDependencies only; no build script
```

**Single-page architecture** — no routing, no bundler, no framework. All state lives in `const state` at module scope in `app.js`. DOM references cached in `const DOM`. `init()` is called once on load.

**Key state fields (`app.js` L1–13):**
- `allReciters`, `reciters` — full and filtered reciter arrays
- `surahs` — `[Al-Fatihah, ...reversedJuzAmma]`
- `selectedReciter` — numeric reciter ID
- `currentSurah` — `{ id, index }` (index = position in `state.surahs`)
- `currentFilterType` — `'all' | 'background' | 'murajaah'`
- `currentTimestamps` — verse timestamp array for active-verse highlighting
- `playingBismillah` — flag to distinguish Bismillah vs chapter audio in `ended` handler
- `currentChapterAudioUrl` — stored to resume after Bismillah finishes

---

## Commands

| Purpose | Command | Evidence | Verification status |
|---|---|---|---|
| Install dependencies | `npm install` | `package.json` devDependencies | Not run in this session |
| Serve locally | `npx serve .` or `npx http-server -p 8080` | `README.md` L28–30; `playwright.config.js` L38 | Not run in this session |
| Run E2E tests | `npx playwright test` | `playwright.config.js`; `tests/e2e.spec.js` | Not run in this session |
| View test report | `npx playwright show-report` | Playwright standard; `playwright-report/` dir present | Not run |
| Build | **None** — static app, no build step | `README.md` L24; no build script in `package.json` | N/A |

_Note: `package.json` `scripts.test` is a placeholder stub and will exit 1. Use `npx playwright test` directly._

---

## Data and Integrations

**External API — Quran.com API v4** (no authentication, no API key in source):

| Endpoint | Purpose |
|---|---|
| `GET /api/v4/resources/recitations?language=en` | Fetch all reciters |
| `GET /api/v4/chapters?language=en` | Fetch all Surah metadata |
| `GET /api/v4/verses/by_chapter/{id}?language=id&translations=33,20&fields=text_uthmani` | Fetch verse text + translations |
| `GET /api/v4/chapter_recitations/{reciterId}/{surahId}` | Fetch chapter audio URL + verse timestamps |
| `GET /api/v4/recitations/{reciterId}/by_chapter/1` | Fetch Bismillah audio |

**Translations hardcoded (`app.js` L8):**
- `en: 20` — English (Saheeh International)
- `id: 33` — Indonesian (Kementerian Agama RI)

**Browser storage:** `localStorage` key `juzAmmaState` (JSON). No server-side storage.

**Audio:** External CDN URLs returned by Quran.com API (typically `verses.quran.com`). Browser autoplay attempted; may be blocked.

---

## CSS Design System (`index.css`)

- **Dark background:** `#0f172a` / `linear-gradient(135deg, #020617, #0f172a)`
- **Accent:** `#38bdf8` (sky blue), hover `#0ea5e9`
- **Glassmorphism:** `backdrop-filter: blur()`, `rgba()` backgrounds, `rgba(255,255,255,0.1)` borders
- **Sidebar:** `350px` wide on desktop; `flex: 0 0 40%` on mobile (stacked)
- **Main content:** `flex: 1` on desktop; `flex: 0 0 60%` on mobile
- **Responsive breakpoint:** `@media (max-width: 768px)` — column layout, `height: 100dvh`
- **Audio player:** `position: absolute; bottom: 2rem` inside `.main-content`

---

## Repository Conventions

- All logic in a single `app.js` — no ES modules, no imports.
- No linting or formatting tooling defined.
- No CI/CD configuration found.
- Git remote: `https://github.com/faliqadlan/juz-amma-reverse.git` (`package.json` L11).

---

## Constraints and Hazards

- **API dependency:** All content from Quran.com API v4. Downtime or breaking changes will break the app. Error handling is `console.error` only — no user-facing error states.
- **Autoplay blocked:** Browsers commonly block `audio.play()` without user interaction. The app catches and logs silently.
- **npm test stub:** Running `npm test` exits with code 1. Tests require `npx playwright test`.
- **Unsanitized innerHTML:** `renderVerses()` injects raw API HTML into `innerHTML` without sanitization. API content is trusted (Quran.com), but is a latent XSS surface.

---

## Proposed Behavior

_(No explicit roadmap found. Noted from recent conversation history.)_

- Mobile responsiveness improvements were the most recent focus (conversations `aa17be1e`, `6263c3d6`).
- Session persistence (resume on reload) was implemented in conversation `684b87c7`.

---

## Superseded Facts

None — this is the initial verified onboarding.

---

## Known Gaps

- No linting, formatting, or pre-commit hooks configured.
- No CI/CD pipeline.
- `package.json` `test` script is a non-functional stub.
- No user-facing error states for API failures.
- E2E tests make real network calls to Quran.com API — not mocked, flaky in offline/CI environments.
- Playwright only targets Chromium; Firefox and WebKit not configured.

---

## Open Questions

- Is there an intention to add offline support (Service Worker / caching)?
- Should translations be user-selectable (currently hardcoded to EN + ID)?
- Is there a plan to add Firefox/WebKit to the Playwright test suite?

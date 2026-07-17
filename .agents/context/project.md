<!-- code-agent-template:managed -->
# Project Context

**Status:** Initialized
**Last verified:** 2026-07-17
**Repository checkpoint:** Base HTML/CSS/JS frontend application

Run `onboard-repository` before relying on this file. Every durable claim must identify repository evidence or a successful command. Preserve the distinction between verified current behavior, proposed behavior, superseded facts, and unknowns.

## Purpose

"Juz Amma Reverse" is a web application that provides a reading and listening experience for Juz Amma (Surahs 78 to 114) of the Quran in reverse order (starting from An-Nas and going backwards to An-Naba), with Al-Fatihah at the very beginning.

## Intended users

Users who want to read, listen, and memorize the final chapters of the Quran (Juz Amma) in reverse order.

## Current capabilities and flows

- **Reciter Selection**: Users can select from a list of reciters fetched from the Quran.com API (`app.js:26`).
- **Reverse Surah Listing**: Displays Surahs from Juz Amma (plus Al-Fatihah) in a sidebar, sorted in reverse order (`app.js:55`).
- **Verse Viewing**: Displays the Arabic text, English translation, and Indonesian translation of the verses for a selected Surah (`app.js:112`).
- **Audio Playback**: Plays the recitation of the selected Surah by the chosen reciter (`app.js:168`).
- **Auto-Play**: Automatically plays the next Surah in the reverse list when the current audio ends (`app.js:204`).

## Technology stack

- **HTML5**: Structure of the application (`index.html`).
- **CSS3 (Vanilla)**: Styling, incorporating CSS variables, glassmorphism effects, flexbox layouts, and custom scrollbars (`index.css`).
- **JavaScript (Vanilla)**: Application logic, state management, and DOM manipulation (`app.js`).
- **Google Fonts**: Inter (sans-serif) and Amiri (Arabic serif).
- **External API**: Quran.com API v4 (fetching reciters, chapters, verses, and audio).

## Architecture and entry points

- `index.html`: The main entry point. Sets up the layout structure with a sidebar for Surah selection and a main content area for verses and audio playback.
- `index.css`: Contains all styles and theme definitions.
- `app.js`: Central logic file. Handles initialization, API data fetching, rendering DOM elements, state management, and event listeners.

## Commands

| Purpose | Command | Evidence | Verification status |
|---|---|---|---|
| Install | None | Static frontend project | Verified |
| Develop | Any local web server (e.g., `npx serve .`) | `index.html` is static | Verified |
| Test | None | No tests found | Verified |
| Lint or format | None | No linters found | Verified |
| Build | None | Static frontend project | Verified |

## Data and integrations

- Integrates with the [Quran.com API v4](https://quran.com/docs/api):
  - Recitations: `https://api.quran.com/api/v4/resources/recitations`
  - Chapters: `https://api.quran.com/api/v4/chapters`
  - Verses (with translations): `https://api.quran.com/api/v4/verses/by_chapter/{id}`
  - Audio: `https://api.quran.com/api/v4/chapter_recitations/{reciter}/{id}`

## Repository conventions

- Uses plain vanilla web technologies (HTML/CSS/JS) without any build step or framework.
- Minimal global state management via a `state` object in `app.js`.
- DOM elements cached in a `DOM` object in `app.js`.

## Constraints and hazards

- The app depends entirely on the availability and structure of the Quran.com API. Breaking changes in the API could break the application.
- `app.js` assumes Mishary Rashid Alafasy's ID is 7 and makes it the default reciter. If the API changes this, the default selection might fail.

## Evidence provenance

- `index.html` structure and font imports.
- `app.js` logic for API requests and DOM rendering.
- `index.css` styling patterns.

## Proposed behavior

None verified. Record only explicit product direction and keep it separate from current behavior.

## Superseded facts

None. Move stale claims here with their replacement evidence instead of silently preserving them.

## Known gaps

- Error handling for API failures is minimal (console.log and basic text updates).

## Open questions

- None at the moment.

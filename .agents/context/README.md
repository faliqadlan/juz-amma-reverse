# Juz Amma Reverse

A static frontend web application designed for reading and listening to **Juz Amma** (Surahs 78–114 of the Quran) presented in **reverse order** (An-Nas → An-Naba), with Al-Fatihah pinned at the top. This application is tailored to support Quran memorization (murajaah) and background listening workflows.

## Features and Capabilities

*   **Reverse Surah List**: Browse and navigate Surahs from 114 down to 78, designed for backwards-progression memorization.
*   **Reciter Selection**: Choose from multiple renowned reciters provided by the Quran.com API, categorized into "Background" and "Murajaah" styles.
*   **Multilingual Translations**: Displays the Arabic text (Uthmani script) alongside English (Saheeh International) and Indonesian (Kemenag RI) translations for every verse.
*   **Audio Playback with Auto-Scroll**: Listen to chapter recitations with active verse highlighting and auto-scrolling synced to the audio.
*   **Continuous Playback**: Automatically advances to the next Surah in the reverse sequence when the current one ends.
*   **Session Persistence**: Remembers your selected reciter, filter preference, and last viewed Surah upon returning to the app.

## Technology Stack

*   **Frontend**: HTML5, Vanilla CSS3 (Custom properties, Glassmorphism, Media queries), Vanilla JavaScript (ES2020+).
*   **Data Source**: [Quran.com API v4](https://api.quran.com/api/v4) (Chapters, Verses, Recitations, Chapter Audio).
*   **Testing**: Playwright for End-to-End (E2E) testing.
*   **Architecture**: Single Page Application (SPA) without bundlers, routers, or frameworks.

## Prerequisites

To run this project locally, you need:
*   [Node.js and npm](https://nodejs.org/) (for serving locally and running tests)
*   A modern web browser (supports HTML5 audio and ES6+)
*   An active internet connection (to fetch data and audio from the Quran.com API)

## Installation and Usage

This project contains no build steps. You can serve the static files directly.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/faliqadlan/juz-amma-reverse.git
    cd juz-amma-reverse
    ```

2.  **Install development dependencies** (Playwright and local server)
    ```bash
    npm install
    ```

3.  **Run the local development server**
    ```bash
    npx http-server -p 8080
    ```
    *Alternatively, you can use `npx serve .` or any standard static file server.*

4.  **Open the app**
    Navigate to `http://127.0.0.1:8080` in your browser.

## Project Structure

```text
/
├── index.html          # Shell: sidebar, main-content, audio player
├── index.css           # Styling: glassmorphism design, responsive breakpoints
├── app.js              # Application logic: state management, API fetches, playback
├── tests/
│   └── e2e.spec.js     # Playwright E2E specifications
├── playwright.config.js # Playwright configuration (Chromium target)
└── package.json        # Project metadata and dev dependencies
```

## Verification and Testing

The project uses Playwright for End-to-End testing.

**To run the tests:**
```bash
npx playwright test
```

**To view the test report:**
```bash
npx playwright show-report
```

*Note: The standard `npm test` script is currently a stub and will exit with an error. Always use the `npx playwright test` command.*

## Limitations and Hazards

*   **API Dependency**: The application completely relies on the Quran.com API v4. Any downtime, rate limiting, or breaking schema changes upstream will break the application.
*   **No User-Facing Errors**: API network failures or blocked audio autoplay events are logged to the console but do not present error UI to the user.
*   **Browser Autoplay Policies**: Modern browsers may block audio auto-play until the user interacts with the page.
*   **Offline Support**: The app lacks a Service Worker or caching mechanism and requires an active internet connection to function.
*   **E2E Test Stability**: E2E tests hit live Quran.com endpoints, making them potentially flaky in offline or CI environments without mocking.

## Contribution Guidance

1. Ensure changes maintain the zero-build-step philosophy.
2. Keep all business logic within `app.js` and styling within `index.css`.
3. Before submitting changes, run `npx playwright test` to ensure core flows (Initial Load, Surah List Order, Verse Display, Audio Playback) remain functional.
4. UI improvements should respect the existing responsive breakpoints (`max-width: 768px`) and the glassmorphism dark-mode aesthetic.

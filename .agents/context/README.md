# Juz Amma Reverse

A web application that provides a reading and listening experience for Juz Amma (Surahs 78 to 114) of the Quran in reverse order (starting from An-Nas and going backwards to An-Naba), with Al-Fatihah included at the very beginning.

## Features

- **Reverse Order Listing**: Browse and read Surahs from the final Juz in reverse order, which is helpful for memorization.
- **Reciter Selection**: Choose from multiple renowned reciters available via the Quran.com API.
- **Translations**: View English and Indonesian translations alongside the Arabic text.
- **Audio Playback**: Listen to the recitation of the selected Surah.
- **Auto-Play Next**: Automatically plays the next Surah in the reverse sequence when the current one finishes.
- **Glassmorphism UI**: Modern aesthetic utilizing glassmorphism and a clean, responsive layout.

## Technologies Used

- HTML5
- CSS3 (Vanilla with custom variables and modern layout techniques)
- JavaScript (Vanilla, no framework)
- Fonts: Google Fonts (Inter and Amiri)
- API: [Quran.com API v4](https://quran.com/docs/api)

## Installation and Usage

This is a static frontend application with no build steps required.

1. Clone or download the repository.
2. Serve the directory using any local web server. For example:
   ```bash
   npx serve .
   ```
   *Alternatively, use the "Live Server" extension in VS Code.*
3. Open the provided local URL in your web browser.

## Limitations

- The application fully relies on the [Quran.com API v4](https://quran.com/docs/api). Any downtime or breaking changes in this API will affect the application's functionality.
- Error handling is basic; API failures will currently be logged to the console with minimal UI indication.

## Acknowledgements

- Data provided by [Quran.com API](https://quran.com/docs/api).

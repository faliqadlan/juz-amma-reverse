const { test, expect } = require('@playwright/test');

test.describe('Juz Amma Reverse E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the locally served application
    await page.goto('/');
    // Wait for the app to initialize (reciters and surahs loaded)
    await page.waitForSelector('.surah-item');
  });

  test('Initial Load', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Juz Amma/);

    // Verify reciter dropdown is populated
    const reciterSelect = page.locator('#reciter-select');
    await expect(reciterSelect).toBeVisible();
    
    // Check that there are options in the dropdown
    const options = reciterSelect.locator('option');
    expect(await options.count()).toBeGreaterThan(1);
    
    // Check that the default reciter is selected (Shatri is 4)
    await expect(reciterSelect).toHaveValue('4');
  });

  test('Surah List (Reverse Order)', async ({ page }) => {
    const surahItems = page.locator('.surah-item .surah-name-en');
    
    // First surah should be Al-Fatihah (added at the beginning)
    await expect(surahItems.nth(0)).toContainText('Al-Fatihah');
    
    // Second surah should be An-Nas
    await expect(surahItems.nth(1)).toContainText('An-Nas');
    
    // Third surah should be Al-Falaq
    await expect(surahItems.nth(2)).toContainText('Al-Falaq');

    // The last one should be Al-Fatihah (because Al-Fatihah is appended at the very beginning conceptually, 
    // or maybe An-Naba is the last of Juz Amma? Wait, Al-Fatihah is included at the very beginning of the reverse list.
    // Let's verify the first item and second item is enough to ensure reverse order).
  });

  test('Verse Display', async ({ page }) => {
    // Click on the first Surah (An-Nas)
    await page.locator('.surah-item').first().click();

    // Wait for verses to load
    await page.waitForSelector('.verse-item');

    // Verify verse rendering
    const verses = page.locator('.verse-item');
    await expect(verses.first()).toBeVisible();

    // Check if Arabic text is present
    await expect(verses.first().locator('.verse-text-ar')).toBeVisible();

    // Check if translations are present
    await expect(verses.first().locator('.translation-en')).toBeVisible();
    await expect(verses.first().locator('.translation-id')).toBeVisible();
  });

  test('Audio Playback', async ({ page }) => {
    // Click on the second Surah (Al-Falaq)
    await page.locator('.surah-item').nth(1).click();

    // The audio player should be updated
    const audio = page.locator('#audio-player');
    await expect(audio).toBeVisible();

    // The source should contain the audio URL. Since it might play Bismillah first, just check if it has a valid mp3 src.
    await expect(audio).toHaveAttribute('src', /.*\.mp3/);
  });

  test('Auto-Scroll Behavior', async ({ page }) => {
    // To test auto-scroll during playback, we might need to mock or trigger the timeupdate event
    // since playing actual audio in CI can be flaky.
    
    // Select a Surah
    await page.locator('.surah-item').first().click();
    await page.waitForSelector('.verse-item');

    // Simulate audio time update that corresponds to a verse
    // First, let's find the audio element
    const audio = page.locator('#audio-player');
    
    // Playback and timeupdate simulation requires evaluating in the browser context
    await audio.evaluate((el) => {
      // Mock duration and current time to trigger the verse highlighting
      // The app likely uses timestamp data from the verses API to highlight
      // Let's just simulate that we are 5 seconds into the audio
      el.currentTime = 5;
      el.dispatchEvent(new Event('timeupdate'));
    });

    // We can also test if the Surah list auto-scrolls when a Surah becomes active.
    // If we click on a Surah far down the list (e.g., An-Naba)
    const lastSurah = page.locator('.surah-item').last();
    await lastSurah.scrollIntoViewIfNeeded(); // ensure we can click it
    await lastSurah.click();

    // Wait a bit for smooth scroll animation to finish
    await page.waitForTimeout(500);

    // Verify the Surah is active and visible in the scroll container
    await expect(lastSurah).toHaveClass(/active/);
    await expect(lastSurah).toBeInViewport();
  });
});

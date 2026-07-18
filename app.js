const state = {
    allReciters: [],
    reciters: [],
    surahs: [],
    selectedReciter: null,
    currentSurah: null,
    currentFilterType: 'all',
    translations: { en: 20, id: 33 },
    currentTimestamps: [],
    currentActiveVerseNum: null,
    playingBismillah: false,
    currentChapterAudioUrl: null,
    loopEnabled: false,
    shuffleEnabled: false,
    playedReciters: []
};

const FILTER_GROUPS = {
    background: [4, 9, 2, 6, 7, 3], // Shatri, Minshawi (Murattal), AbdulBaset (Murattal), Husary, Mishary, Sudais
    murajaah: [12, 7, 8] // Husary (Muallim), Mishary, Minshawi (Mujawwad)
};

const DOM = {
    reciterSelect: document.getElementById('reciter-select'),
    surahList: document.getElementById('surah-list'),
    versesContainer: document.getElementById('verses-container'),
    audioPlayerContainer: document.getElementById('audio-player-container'),
    audioPlayer: document.getElementById('audio-player'),
    nowPlayingTitle: document.getElementById('now-playing-title'),
    currentSurahTitle: document.getElementById('current-surah-title'),
    currentSurahSubtitle: document.getElementById('current-surah-subtitle'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    shuffleToggle: document.getElementById('shuffle-toggle'),
    loopToggle: document.getElementById('loop-toggle')
};

function saveState() {
    localStorage.setItem('juzAmmaState', JSON.stringify({
        filterType: state.currentFilterType,
        reciterId: state.selectedReciter,
        surahId: state.currentSurah ? state.currentSurah.id : null,
        surahIndex: state.currentSurah ? state.currentSurah.index : null,
        loopEnabled: state.loopEnabled,
        shuffleEnabled: state.shuffleEnabled
    }));
}

function updateButtonStates() {
    if (state.loopEnabled) {
        DOM.loopToggle.classList.add('active');
        DOM.loopToggle.setAttribute('aria-pressed', 'true');
    } else {
        DOM.loopToggle.classList.remove('active');
        DOM.loopToggle.setAttribute('aria-pressed', 'false');
    }

    if (state.shuffleEnabled) {
        DOM.shuffleToggle.classList.add('active');
        DOM.shuffleToggle.setAttribute('aria-pressed', 'true');
    } else {
        DOM.shuffleToggle.classList.remove('active');
        DOM.shuffleToggle.setAttribute('aria-pressed', 'false');
    }
}

async function init() {
    const savedState = JSON.parse(localStorage.getItem('juzAmmaState')) || {};
    if (savedState.filterType) state.currentFilterType = savedState.filterType;
    if (savedState.reciterId) state.selectedReciter = Number(savedState.reciterId);
    if (savedState.loopEnabled !== undefined) state.loopEnabled = savedState.loopEnabled;
    if (savedState.shuffleEnabled !== undefined) state.shuffleEnabled = savedState.shuffleEnabled;

    // Set active filter button visually
    DOM.filterBtns.forEach(btn => {
        if (btn.dataset.filter === state.currentFilterType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updateButtonStates();

    await fetchReciters();
    await fetchSurahs();
    
    if (savedState.surahId) {
        selectSurah(savedState.surahId, savedState.surahIndex);
    }
    
    setupEventListeners();
}

async function fetchReciters() {
    try {
        const res = await fetch('https://api.quran.com/api/v4/resources/recitations?language=en');
        const data = await res.json();
        state.allReciters = data.recitations;
        
        renderReciters(state.currentFilterType);
    } catch (err) {
        console.error('Failed to fetch reciters', err);
    }
}

function renderReciters(filterType) {
    if (filterType === 'all') {
        state.reciters = state.allReciters;
    } else if (filterType === 'background') {
        state.reciters = state.allReciters.filter(r => FILTER_GROUPS.background.includes(r.id));
    } else if (filterType === 'murajaah') {
        state.reciters = state.allReciters.filter(r => FILTER_GROUPS.murajaah.includes(r.id));
    }

    DOM.reciterSelect.innerHTML = '';
    state.reciters.forEach(reciter => {
        const option = document.createElement('option');
        option.value = reciter.id;
        option.textContent = `${reciter.translated_name.name} ${reciter.style ? `(${reciter.style})` : ''}`;
        DOM.reciterSelect.appendChild(option);
    });

    let defaultReciterId;
    if (state.selectedReciter && state.reciters.some(r => r.id === state.selectedReciter)) {
        defaultReciterId = state.selectedReciter;
    } else if (filterType === 'background') {
        defaultReciterId = 4; // Shatri
    } else if (filterType === 'murajaah') {
        defaultReciterId = 12; // Husary (Muallim)
    } else {
        defaultReciterId = 4; // Overall default is Shatri
    }

    const defaultReciter = state.reciters.find(r => r.id === defaultReciterId);
    if (defaultReciter) {
        DOM.reciterSelect.value = defaultReciterId;
        state.selectedReciter = defaultReciterId;
    } else if (state.reciters.length > 0) {
        DOM.reciterSelect.value = state.reciters[0].id;
        state.selectedReciter = state.reciters[0].id;
    }
    
    saveState();
}

async function fetchSurahs() {
    try {
        const res = await fetch('https://api.quran.com/api/v4/chapters?language=en');
        const data = await res.json();
        
        // Filter Juz Amma (Surah 78 to 114) and reverse it
        const juzAmma = data.chapters.filter(c => c.id >= 78 && c.id <= 114);
        const reversedJuzAmma = juzAmma.reverse();
        
        // Add Al-Fatihah at the very beginning
        const alFatihah = data.chapters.find(c => c.id === 1);
        state.surahs = [alFatihah, ...reversedJuzAmma];

        renderSurahList();
    } catch (err) {
        console.error('Failed to fetch surahs', err);
    }
}

function renderSurahList() {
    DOM.surahList.innerHTML = '';
    state.surahs.forEach((surah, index) => {
        const div = document.createElement('div');
        div.className = 'surah-item';
        div.dataset.id = surah.id;
        div.dataset.index = index; // for autoplay next
        
        div.innerHTML = `
            <span class="surah-number">${surah.id}</span>
            <span class="surah-name-en">${surah.name_simple}</span>
            <span class="surah-name-ar">${surah.name_arabic}</span>
        `;
        
        div.addEventListener('click', () => selectSurah(surah.id, index));
        DOM.surahList.appendChild(div);
    });
}

async function selectSurah(surahId, listIndex) {
    state.currentSurah = { id: surahId, index: listIndex };
    saveState();
    const surahData = state.surahs.find(s => s.id === surahId);
    
    // Update active class in sidebar
    document.querySelectorAll('.surah-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.surah-item[data-id="${surahId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Update Main Header
    DOM.currentSurahTitle.textContent = `${surahData.name_simple} (${surahData.name_arabic})`;
    DOM.currentSurahSubtitle.textContent = surahData.translated_name.name;

    // Load Data
    DOM.versesContainer.innerHTML = '<div class="loading">Loading verses...</div>';
    await fetchVerses(surahId);
    await loadAudio(surahId);
}

async function fetchVerses(surahId) {
    try {
        // Fetch with Indo and English translations
        const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=id&words=false&translations=${state.translations.id},${state.translations.en}&fields=text_uthmani&per_page=150`);
        const data = await res.json();
        
        renderVerses(data.verses);
    } catch (err) {
        console.error('Failed to fetch verses', err);
        DOM.versesContainer.innerHTML = '<div class="welcome-message">Failed to load verses.</div>';
    }
}

function renderVerses(verses) {
    DOM.versesContainer.innerHTML = '';
    
    // Add Bismillah at the top, except for Al-Fatihah (which has it as verse 1)
    if (state.currentSurah && state.currentSurah.id !== 1) {
        const bismillahHTML = `
            <div class="bismillah-container">
                <div class="bismillah-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
            </div>
        `;
        DOM.versesContainer.insertAdjacentHTML('beforeend', bismillahHTML);
    }

    verses.forEach(verse => {
        const verseNum = verse.verse_number;
        const textUthmani = verse.text_uthmani;
        
        // Match translations safely
        const indo = verse.translations.find(t => t.resource_id === state.translations.id)?.text || '';
        const eng = verse.translations.find(t => t.resource_id === state.translations.en)?.text || '';

        const verseHTML = `
            <div class="verse-item" id="verse-${verseNum}">
                <div class="verse-header">
                    <span class="verse-number">${verseNum}</span>
                </div>
                <div class="verse-text-ar">${textUthmani}</div>
                <div class="verse-translations">
                    <div class="translation-en">
                        <span class="translation-label">English</span>
                        ${eng}
                    </div>
                    <div class="translation-id">
                        <span class="translation-label">Indonesia</span>
                        ${indo}
                    </div>
                </div>
            </div>
        `;
        DOM.versesContainer.insertAdjacentHTML('beforeend', verseHTML);
    });
}

async function loadAudio(surahId) {
    if (!state.selectedReciter) return;
    
    try {
        const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${state.selectedReciter}/${surahId}`);
        const data = await res.json();
        
        if (data.audio_file) {
            state.currentTimestamps = data.audio_file.timestamps || [];
            state.currentActiveVerseNum = null;
            DOM.audioPlayerContainer.style.display = 'flex';
            
            const surahData = state.surahs.find(s => s.id === surahId);
            const reciterSelect = DOM.reciterSelect;
            const reciterName = reciterSelect.options[reciterSelect.selectedIndex].text;
            
            DOM.nowPlayingTitle.textContent = `Surah ${surahData.name_simple} - ${reciterName}`;
            
            state.currentChapterAudioUrl = data.audio_file.audio_url;
            
            // Check if we need to prepend Bismillah
            if (surahId !== 1 && surahId !== 9) {
                try {
                    const bismillahRes = await fetch(`https://api.quran.com/api/v4/recitations/${state.selectedReciter}/by_chapter/1`);
                    const bismillahData = await bismillahRes.json();
                    if (bismillahData.audio_files && bismillahData.audio_files.length > 0) {
                        const bismillahAudioUrl = bismillahData.audio_files[0].url;
                        const bismillahUrlFull = bismillahAudioUrl.startsWith('http') || bismillahAudioUrl.startsWith('//') 
                            ? bismillahAudioUrl 
                            : `https://verses.quran.com/${bismillahAudioUrl}`;
                        
                        state.playingBismillah = true;
                        DOM.audioPlayer.src = bismillahUrlFull;
                        DOM.audioPlayer.play().catch(e => console.log('Auto-play prevented by browser', e));
                        return; // Exit early, chapter audio will play on 'ended'
                    }
                } catch (err) {
                    console.error('Failed to load bismillah audio', err);
                }
            }
            
            state.playingBismillah = false;
            DOM.audioPlayer.src = state.currentChapterAudioUrl;
            
            // Auto play
            DOM.audioPlayer.play().catch(e => console.log('Auto-play prevented by browser', e));
        }
    } catch (err) {
        console.error('Failed to load audio', err);
    }
}

function getNextReciterId() {
    const currentReciterId = state.selectedReciter;
    const reciterIds = state.reciters.map(r => r.id);
    
    if (state.shuffleEnabled) {
        if (!state.playedReciters.includes(currentReciterId)) {
            state.playedReciters.push(currentReciterId);
        }
        
        const unplayed = reciterIds.filter(id => !state.playedReciters.includes(id));
        if (unplayed.length > 0) {
            const randomIndex = Math.floor(Math.random() * unplayed.length);
            return unplayed[randomIndex];
        } else {
            // All reciters played
            if (state.loopEnabled) {
                state.playedReciters = [currentReciterId]; // Start new loop, mark current as played so it's not immediately repeated
                const options = reciterIds.filter(id => id !== currentReciterId);
                const candidates = options.length > 0 ? options : reciterIds;
                const randomIndex = Math.floor(Math.random() * candidates.length);
                return candidates[randomIndex];
            }
            return null; // Stop playback
        }
    } else {
        // Sequential playback
        const currentIndex = reciterIds.indexOf(currentReciterId);
        if (currentIndex !== -1 && currentIndex + 1 < reciterIds.length) {
            return reciterIds[currentIndex + 1];
        } else if (state.loopEnabled) {
            return reciterIds[0];
        }
        return null; // Stop playback
    }
}

function setupEventListeners() {
    // Filter buttons
    DOM.filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            DOM.filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const filter = e.target.dataset.filter;
            state.currentFilterType = filter;
            state.selectedReciter = null; // Reset saved reciter so default applies
            state.playedReciters = []; // Reset played reciters on filter change
            renderReciters(filter);
            
            // Reload audio if surah is selected
            if (state.currentSurah) {
                loadAudio(state.currentSurah.id);
            }
        });
    });

    // Reciter change
    DOM.reciterSelect.addEventListener('change', (e) => {
        state.selectedReciter = Number(e.target.value);
        state.playedReciters = []; // Reset sequence on manual selection
        saveState();
        if (state.currentSurah) {
            // Reload audio for current surah
            loadAudio(state.currentSurah.id);
        }
    });

    // Shuffle toggle
    DOM.shuffleToggle.addEventListener('click', () => {
        state.shuffleEnabled = !state.shuffleEnabled;
        state.playedReciters = []; // Reset sequence when toggled
        updateButtonStates();
        saveState();
    });

    // Loop toggle
    DOM.loopToggle.addEventListener('click', () => {
        state.loopEnabled = !state.loopEnabled;
        updateButtonStates();
        saveState();
    });

    // Auto-scroll follow audio
    DOM.audioPlayer.addEventListener('timeupdate', () => {
        if (state.playingBismillah) return;
        
        if (!state.currentTimestamps || state.currentTimestamps.length === 0) return;
        
        const currentTimeMs = DOM.audioPlayer.currentTime * 1000;
        const currentVerse = state.currentTimestamps.find(
            t => currentTimeMs >= t.timestamp_from && currentTimeMs <= t.timestamp_to
        );
        
        if (currentVerse) {
            const verseNum = currentVerse.verse_key.split(':')[1];
            
            if (state.currentActiveVerseNum !== verseNum) {
                // Remove active class from all verses
                document.querySelectorAll('.verse-item').forEach(el => el.classList.remove('active-verse'));
                
                // Add active class to current verse
                const activeVerseEl = document.getElementById(`verse-${verseNum}`);
                if (activeVerseEl) {
                    activeVerseEl.classList.add('active-verse');
                    
                    // Smooth scroll to the verse
                    activeVerseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    state.currentActiveVerseNum = verseNum;
                }
            }
        }
    });

    // Auto-play next reverse Surah
    DOM.audioPlayer.addEventListener('ended', () => {
        if (state.playingBismillah && state.currentChapterAudioUrl) {
            state.playingBismillah = false;
            DOM.audioPlayer.src = state.currentChapterAudioUrl;
            DOM.audioPlayer.play().catch(e => console.log('Auto-play prevented by browser', e));
            return;
        }

        if (!state.currentSurah) return;
        
        const nextIndex = state.currentSurah.index + 1;
        // Since list is reversed (114 at index 0, 113 at index 1, etc.)
        if (nextIndex < state.surahs.length) {
            const nextSurah = state.surahs[nextIndex];
            selectSurah(nextSurah.id, nextIndex);
        } else {
            // End of Juz Amma reached, switch to next/random reciter and start over
            const nextReciterId = getNextReciterId();
            if (nextReciterId !== null) {
                state.selectedReciter = nextReciterId;
                DOM.reciterSelect.value = nextReciterId;
                saveState();
                selectSurah(state.surahs[0].id, 0); // Start from An-Nas
            }
        }
    });
}

// Start
init();

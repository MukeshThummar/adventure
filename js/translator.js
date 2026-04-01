// ═══════════════════════════════════════════════════════════════
//  MULTI-LANGUAGE TRANSLATOR & SPEECH SYSTEM
// ═══════════════════════════════════════════════════════════════

const TRANSLATOR = {
  currentLanguage: 'en',
  supportedLanguages: {
    'en': { name: 'English', flag: '🇬🇧', code: 'en' },
    // 'hi': { name: 'हिंदी', flag: '🇮🇳', code: 'hi' },
    // 'gu': { name: 'ગુજરાતી', flag: '🇮🇳', code: 'gu' }
  },
  translationCache: {},
  speechEnabled: true,

  // Initialize translator
  init() {
    const saved = localStorage.getItem('selectedLanguage') || 'en';
    this.currentLanguage = saved;
    this.setupLanguageSelector();
    if ('speechSynthesis' in window) {
      this.speechEnabled = true;
    }
  },

  // Setup language selector UI
  setupLanguageSelector() {
    const topBar = document.querySelector('.top-bar');
    if (!topBar) return;

    // Check if already exists
    if (document.getElementById('languageSelector')) return;

    const langSelector = document.createElement('div');
    langSelector.id = 'languageSelector';
    langSelector.className = 'language-selector';
    langSelector.innerHTML = `
      <div class="lang-current">
        <span class="lang-flag" id="currentLangFlag">🇬🇧</span>
        <button type="button" class="lang-toggle-btn" id="langToggleBtn">⚙️</button>
      </div>
      <div class="lang-dropdown" id="langDropdown" style="display:none;">
        ${Object.entries(this.supportedLanguages)
          .map(([code, lang]) => 
            `<button type="button" class="lang-option ${code === this.currentLanguage ? 'active' : ''}" 
              data-lang="${code}" onclick="TRANSLATOR.changeLanguage('${code}')">${lang.flag} ${lang.name}</button>`
          ).join('')}
      </div>
    `;
    topBar.style.position = 'relative';
    topBar.appendChild(langSelector);

    document.getElementById('langToggleBtn').onclick = (e) => {
      e.stopPropagation();
      const dropdown = document.getElementById('langDropdown');
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    };

    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('langDropdown');
      if (dropdown && !e.target.closest('.language-selector')) {
        dropdown.style.display = 'none';
      }
    });

    this.updateLanguageDisplay();
  },

  // Change language
  changeLanguage(langCode) {
    if (!this.supportedLanguages[langCode]) return;
    this.currentLanguage = langCode;
    localStorage.setItem('selectedLanguage', langCode);
    this.updateLanguageDisplay();
    document.getElementById('langDropdown').style.display = 'none';
    showToast(`🌐 Language changed to ${this.supportedLanguages[langCode].name}`, 'correct');
    
    // Re-render current screen with new language
    this.reRenderCurrentScreen();
  },

  // Re-render the currently active screen
  reRenderCurrentScreen() {
    if (typeof STATE === 'undefined') return;
    
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;

    const screenId = activeScreen.id;
    
    // Re-render based on current screen
    try {
      if (screenId === 'quizScreen' && STATE.quiz && STATE.quiz.questions.length > 0) {
        if (typeof renderQuestion === 'function') renderQuestion().catch(e => console.error('Error re-rendering question:', e));
      } else if (screenId === 'learnScreen' && STATE.currentSubject) {
        if (typeof startLearn === 'function') startLearn().catch(e => console.error('Error re-rendering learn:', e));
      } else if (screenId === 'flashScreen' && STATE.flash && STATE.flash.cards.length > 0) {
        if (typeof renderFlash === 'function') renderFlash().catch(e => console.error('Error re-rendering flashcard:', e));
      } else if (screenId === 'grammarScreen' && STATE.gram && STATE.gram.sentences.length > 0) {
        if (typeof renderGramSentence === 'function') renderGramSentence().catch(e => console.error('Error re-rendering grammar:', e));
      } else if (screenId === 'videoScreen' && STATE.slides && STATE.slides.data.length > 0) {
        if (typeof renderSlide === 'function') renderSlide().catch(e => console.error('Error re-rendering slide:', e));
      }
    } catch (error) {
      console.warn('Error re-rendering screen:', error);
    }
  },

  // Update language display
  updateLanguageDisplay() {
    const flag = this.supportedLanguages[this.currentLanguage].flag;
    document.getElementById('currentLangFlag').textContent = flag;
    
    // Update all lang options
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
    });
  },

  // Translate text using MyMemory API (free, no key needed)
  async translate(text, targetLang = null) {
    if (!targetLang) targetLang = this.currentLanguage;
    if (targetLang === 'en' || !text || text.length === 0) return text; // No translation needed

    const cacheKey = `${text}|${targetLang}`;
    if (this.translationCache[cacheKey]) {
      return this.translationCache[cacheKey];
    }

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'LearnAdventure/1.0' }
      });
      
      if (!response.ok) throw new Error('Translation API error');
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData.translatedText) {
        const translated = data.responseData.translatedText;
        this.translationCache[cacheKey] = translated;
        return translated;
      }
    } catch (error) {
      console.warn('Translation error for:', text, error);
    }
    
    return text; // Return original if translation fails
  },

  // Translate multiple texts
  async translateMultiple(texts, targetLang = null) {
    if (!targetLang) targetLang = this.currentLanguage;
    if (targetLang === 'en') return texts;

    return Promise.all(texts.map(text => this.translate(text, targetLang)));
  },

  // Speech synthesis (text-to-speech)
  speak(text, lang = null) {
    if (!this.speechEnabled || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Replace underscores (blanks) with the word "blank"
    let speakText = text.replace(/_+/g, ' blank ');
    // Clean up extra spaces
    speakText = speakText.replace(/\s+/g, ' ').trim();

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = lang || this.getCurrentLanguageCode();
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  },

  // Stop speech
  stopSpeech() {
    if (this.speechEnabled) {
      window.speechSynthesis.cancel();
    }
  },

  // Get current language code for speech
  getCurrentLanguageCode() {
    const langMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'gu': 'gu-IN'
    };
    return langMap[this.currentLanguage] || 'en-US';
  },

  // Add speech button to element
  addSpeechButton(element, text) {
    if (!this.speechEnabled) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'speech-btn';
    btn.innerHTML = '🔊';
    btn.title = 'Hear pronunciation';
    btn.onclick = (e) => {
      e.stopPropagation();
      this.speak(text);
    };
    element.appendChild(btn);
  },

  // Retranslate page content
  async retranslatePageContent() {
    if (this.currentLanguage === 'en') return;

    // Delay to prevent overwhelming the API
    const elements = document.querySelectorAll('[data-translate]');
    for (let elem of elements) {
      const originalText = elem.dataset.translate;
      const translated = await this.translate(originalText);
      elem.textContent = translated;
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  },

  // Mark element for translation
  markForTranslation(element, text) {
    element.setAttribute('data-translate', text);
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TRANSLATOR.init());
  } else {
    TRANSLATOR.init();
  }
});

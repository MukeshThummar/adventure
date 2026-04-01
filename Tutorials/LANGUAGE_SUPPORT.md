# Multi-Language Support with Translation & Speech 🌐

## Overview

Your Learning Adventure app now supports **12 languages** with built-in translation and text-to-speech features using:
- **Google Translator API Alternative**: MyMemory API (free, no API key required)
- **Web Speech API**: Native browser text-to-speech synthesis

---

## ✨ Features Implemented

### 1. **Language Selector**
- Located in the top bar of the app
- Switch between 12 languages instantly
- Language preference is saved locally

### 2. **Automatic Translation**
- Quiz questions translate automatically when you change language
- Quiz answer options translate on-the-fly
- Uses MyMemory translation service (free, no API key)
- Caching system to optimize API calls

### 3. **Text-to-Speech Pronunciation**
- 🔊 Speech button on each question
- Click to hear the question pronounced
- Uses native Web Speech API (no external dependency)
- Supports all 12 languages

### 4. **Supported Languages**

| Code | Language | Flag |
|------|----------|------|
| en | English | 🇬🇧 |
| es | Español | 🇪🇸 |
| fr | Français | 🇫🇷 |
| de | Deutsch | 🇩🇪 |
| it | Italiano | 🇮🇹 |
| pt | Português | 🇵🇹 |
| hi | हिंदी | 🇮🇳 |
| ja | 日本語 | 🇯🇵 |
| ko | 한국어 | 🇰🇷 |
| zh | 中文 | 🇨🇳 |
| ar | العربية | 🇸🇦 |
| ru | Русский | 🇷🇺 |

---

## 🚀 How to Use

### **Changing Language**
1. Click the ⚙️ settings icon on the top bar
2. Select your preferred language from the dropdown
3. Questions and options will automatically translate
4. Your language choice is saved for next session

### **Hearing Pronunciation**
1. During a quiz, you'll see a 🔊 button next to the question
2. Click the 🔊 button to hear the question read aloud
3. Works in all 12 languages
4. Adjustable speech rate and pitch in code

### **Translation Caching**
- Translations are cached locally for better performance
- Similar questions won't be translated twice from API
- Reduces API call overhead

---

## 🔧 Technical Details

### **Files Added/Modified**

#### **New Files**
- `js/translator.js` - Main translation & speech system

#### **Modified Files**
- `index.html` - Added translator script reference
- `js/main.js` - Integrated TRANSLATOR.init() and translation logic to quiz
- `css/main.css` - Added styles for language selector and speech button

### **Architecture**

```
TRANSLATOR (Global Object)
├── currentLanguage: 'en'
├── supportedLanguages: {...}
├── translationCache: {}
├── init()
├── translate(text, targetLang)
├── translateMultiple(texts, targetLang)
├── speak(text, lang)
├── changeLanguage(langCode)
└── addSpeechButton(element, text)
```

### **API Used**
- **Free Translation**: MyMemory API
  - Endpoint: `https://api.mymemory.translated.net/get`
  - No API key required
  - Reliable for educational content

- **Speech Synthesis**: Web Speech API
  - Built into modern browsers
  - No external service needed
  - Offline capable

---

## ⚙️ Configuration

### **Add New Language**
1. Open `js/translator.js`
2. Add to `supportedLanguages` object:
```javascript
'de': { name: 'Deutsch', flag: '🇩🇪', code: 'de' }
```

3. Add language code mapping in `getCurrentLanguageCode()`:
```javascript
'de': 'de-DE'
```

### **Change Translation Service**
To use Google Translate API instead of MyMemory:

1. Modify `translate()` function in `translator.js`
2. Add your Google API key
3. Update API endpoint and request format

```javascript
async translate(text, targetLang) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      q: text,
      target: targetLang
    })
  });
  // ... handle response
}
```

---

## 🎯 Quiz Integration

### **Enhanced Quiz Features**
- Questions auto-translate on language change
- Answer options translate in real-time
- Speech button for each question
- Translation caching reduces latency
- Smooth async handling for better UX

### **Example Usage**
```javascript
// Manually translate text
const translated = await TRANSLATOR.translate(text, 'es');

// Speak text
TRANSLATOR.speak('Hello world', 'en-US');

// Change language
TRANSLATOR.changeLanguage('fr');
```

---

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Translation API | ✅ | ✅ | ✅ | ✅ |
| Web Speech API | ✅ | ⚠️ | ✅ | ✅ |
| Language Selector | ✅ | ✅ | ✅ | ✅ |

**Note**: Web Speech API has limited support in Firefox. Fallback gracefully.

---

## 🔒 Privacy & Data

- **No data stored on servers** - Translation cache is local
- **MyMemory API** - Third-party translation service (check their privacy policy)
- **Speech synthesis** - Done locally in browser, no data sent

---

## 📝 Usage Examples

### **Example 1: Auto-translate Quiz Questions**
```javascript
// In renderQuestion()
if (TRANSLATOR.currentLanguage !== 'en') {
  const translatedQ = await TRANSLATOR.translate(question);
  document.getElementById('qText').textContent = translatedQ;
}
```

### **Example 2: Add Speech to Learning Cards**
```javascript
const btn = document.createElement('button');
btn.className = 'speech-btn';
btn.onclick = () => TRANSLATOR.speak(cardText);
element.appendChild(btn);
```

### **Example 3: Batch Translation**
```javascript
const questions = ['Q1', 'Q2', 'Q3'];
const translated = await TRANSLATOR.translateMultiple(questions, 'es');
```

---

## 🎨 UI Components

### **Language Selector Styling**
- Located in top bar with others controls
- Dropdown shows all 12 languages with flags
- Active language highlighted
- Smooth animations and hover effects

### **Speech Button Styling**
- 🔊 emoji icon
- Blue accent color (var(--accent3))
- Appears next to quiz questions
- Animations on hover and click

---

## 🚨 Known Limitations

1. **Translation Quality**: MyMemory API provides good but not perfect translations
   - Technical terms may not translate perfectly
   - Context-dependent phrases may lose meaning

2. **Speech Synthesis**: Limited voice options in some languages
   - Browser-dependent voice availability
   - Not all languages have native voice support

3. **API Rate Limiting**: MyMemory has usage limits
   - Caching helps reduce API calls
   - Consider upgrading to paid service for high-traffic apps

---

## 🔄 Future Enhancements

- [ ] Implement Google Translate API for better quality (requires API key)
- [ ] Add voice input (speech recognition)
- [ ] Support for more languages
- [ ] Offline translation using WASM
- [ ] Custom pronunciation guides
- [ ] Translation quality rating by users

---

## 📞 Support

For issues or questions about the translation feature, check:
1. Browser console for errors
2. MyMemory API status
3. Web Speech API browser support

---

**Enjoy learning in your preferred language!** 🌍📚

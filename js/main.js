// ═══════════════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════════════
const STATE = {
  player: { name: 'Darsh', avatar: '🧑‍🚀' },
  score: 0,
  lives: 3,
  currentSubject: null,
  quiz: { questions: [], current: 0, correct: 0, wrong: 0 },
  flash: { cards: [], current: 0, flipped: false },
  gram: { sentences: [], current: 0, selected_pos: null, score: 0 },
  slides: { data: [], current: 0 },
  achievements: {}
};

const avatars = ['🧑‍🚀','👩‍🚀','🦸','👧','👦','🧒','🧑‍🎓','🦊','🐱','🐶','🐸','🦁'];

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════
function init() {
  // Initialize translator
  TRANSLATOR.init();

  // Build avatar row
  const ar = document.getElementById('avatarRow');
  avatars.forEach((av, i) => {
    const btn = document.createElement('button');
    btn.className = 'avatar-btn' + (i === 0 ? ' selected' : '');
    btn.textContent = av;
    btn.onclick = () => {
      document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      STATE.player.avatar = av;
    };
    ar.appendChild(btn);
  });

  // Build subject grid
  const sg = document.getElementById('subjectGrid');
  SUBJECTS.forEach(s => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.style.setProperty('--card-color', s.color);
    const savedScore = parseInt(localStorage.getItem('score_' + s.id) || '0');
    const stars = savedScore >= 80 ? '⭐⭐⭐' : savedScore >= 50 ? '⭐⭐' : savedScore >= 20 ? '⭐' : '';
    card.innerHTML = `<span class="icon">${s.icon}</span><div class="label">${s.label.replace('\n','<br>')}</div><div class="stars">${stars}</div>`;
    card.onclick = () => openSubject(s.id);
    sg.appendChild(card);
  });
}

function startAdventure() {
  const name = document.getElementById('playerName').value.trim() || 'Explorer';
  STATE.player.name = name;
  document.getElementById('topAvatar').textContent = STATE.player.avatar;
  document.getElementById('topName').textContent = name;
  updateScoreDisplay();
  showScreen('subjectMap');
}

function openSubject(id) {
  const sub = SUBJECTS.find(s => s.id === id);
  STATE.currentSubject = sub;
  document.getElementById('hubTitle').textContent = sub.icon + ' ' + sub.label.replace('\n', ' ');
  document.getElementById('hubDesc').textContent = sub.desc;
  document.getElementById('hubScore').textContent = STATE.score;
  document.getElementById('hubLives').textContent = '❤️'.repeat(STATE.lives);

  // Build mode grid
  const mg = document.getElementById('modeGrid');
  mg.innerHTML = '';
  const modes = {
    learn: { icon:'📚', label:'Learn', desc:'Study the topic with visual notes' },
    quiz:  { icon:'🎯', label:'Quiz Game', desc:'Answer questions, earn stars!' },
    grammar:{ icon:'🔤', label:'Grammar Hunter', desc:'Label words in sentences!' },
    flashcard:{ icon:'🃏', label:'Flash Cards', desc:'Quick-fire revision' },
    video: { icon:'🎬', label:'Story Time', desc:'Fun animated presentation' },
  };
  (sub.modes || ['learn','quiz','flashcard']).forEach(m => {
    const md = modes[m];
    if (!md) return;
    const card = document.createElement('div');
    card.className = 'mode-card';
    card.innerHTML = `<span class="m-icon">${md.icon}</span><div class="m-label">${md.label}</div><div class="m-desc">${md.desc}</div>`;
    card.onclick = () => startMode(m);
    mg.appendChild(card);
  });

  showScreen('subjectHub');
}

function startMode(mode) {
  const sub = STATE.currentSubject;
  if (mode === 'learn') startLearn().catch(e => console.error('Error starting learn mode:', e));
  else if (mode === 'quiz') startQuiz();
  else if (mode === 'grammar') startGrammar();
  else if (mode === 'flashcard') startFlash();
  else if (mode === 'video') startVideo();
}

// ═══════════════════════════════════════════════════════════════
//  LEARN MODE
// ═══════════════════════════════════════════════════════════════
async function startLearn() {
  const sub = STATE.currentSubject;
  document.getElementById('learnTitle').textContent = sub.icon + ' ' + sub.label.replace('\n',' ');
  const lc = document.getElementById('learnContent');
  lc.innerHTML = '';
  
  const cards = sub.learn || [];
  for (const card of cards) {
    const div = document.createElement('div');
    div.className = 'learn-card';
    
    // Translate title if needed
    let translatedTitle = card.title;
    if (TRANSLATOR.currentLanguage !== 'en') {
      translatedTitle = await TRANSLATOR.translate(card.title);
    }
    
    // Translate content if needed
    let translatedContent = card.content;
    if (TRANSLATOR.currentLanguage !== 'en') {
      translatedContent = await TRANSLATOR.translate(card.content);
    }
    
    const h3 = document.createElement('h3');
    h3.textContent = translatedTitle;
    
    // Add speech button for title
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display:inline-flex;gap:8px;align-items:center';
    const speechBtn = document.createElement('button');
    speechBtn.type = 'button';
    speechBtn.className = 'speech-btn';
    speechBtn.innerHTML = '🔊';
    speechBtn.title = 'Hear the title';
    speechBtn.onclick = () => TRANSLATOR.speak(card.title);
    btnGroup.appendChild(h3);
    btnGroup.appendChild(speechBtn);
    div.appendChild(btnGroup);
    
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = translatedContent;
    div.appendChild(contentDiv);
    
    lc.appendChild(div);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  showScreen('learnScreen');
}

// ═══════════════════════════════════════════════════════════════
//  QUIZ MODE
// ═══════════════════════════════════════════════════════════════
function startQuiz() {
  const sub = STATE.currentSubject;
  const qs = [...(sub.quiz || [])].sort(() => Math.random() - 0.5);
  STATE.quiz = { questions: qs, current: 0, correct: 0, wrong: 0, subScore: 0 };
  STATE.lives = 3;
  document.getElementById('quizScore').textContent = STATE.score;
  document.getElementById('quizLives').textContent = '❤️'.repeat(3);
  showScreen('quizScreen');
  renderQuestion();
}

async function renderQuestion() {
  const q = STATE.quiz;
  const total = q.questions.length;
  if (q.current >= total) { showResult(); return; }

  const curr = q.questions[q.current];
  document.getElementById('qCounter').textContent = `Question ${q.current + 1} of ${total}`;
  document.getElementById('progressBar').style.width = ((q.current / total) * 100) + '%';
  document.getElementById('qTag').textContent = STATE.currentSubject.label.replace('\n', ' ');
  
  // Translate question if needed
  let questionText = curr.q;
  if (TRANSLATOR.currentLanguage !== 'en') {
    questionText = await TRANSLATOR.translate(curr.q);
  }
  const qTextEl = document.getElementById('qText');
  qTextEl.textContent = questionText;
  
  // Add speech button for question
  const qContainer = qTextEl.parentElement;
  const oldSpeechBtn = qContainer.querySelector('.speech-btn');
  if (oldSpeechBtn) oldSpeechBtn.remove();
  
  const speechBtn = document.createElement('button');
  speechBtn.type = 'button';
  speechBtn.className = 'speech-btn';
  speechBtn.innerHTML = '🔊';
  speechBtn.title = 'Hear the question';
  speechBtn.onclick = () => TRANSLATOR.speak(curr.q);
  qContainer.appendChild(speechBtn);
  
  document.getElementById('feedbackBox').classList.remove('show');

  const og = document.getElementById('optionsGrid');
  og.innerHTML = '';
  const shuffled = curr.opts.map((o, i) => ({ o, i })).sort(() => Math.random() - 0.5);
  const correctShuffledIdx = shuffled.findIndex(x => x.i === curr.ans);

  for (const [idx, { o, i }] of Object.entries(shuffled)) {
    let optionText = o;
    if (TRANSLATOR.currentLanguage !== 'en') {
      optionText = await TRANSLATOR.translate(o);
    }
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt-btn';
    btn.innerHTML = `<b>${['A','B','C','D'][idx]}.</b> ${optionText}`;
    btn.onclick = () => selectAnswer(parseInt(idx), i === curr.ans, curr.exp, shuffled);
    og.appendChild(btn);
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

function selectAnswer(selectedIdx, isCorrect, explanation, shuffled) {
  document.querySelectorAll('.opt-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (shuffled[i].i === STATE.quiz.questions[STATE.quiz.current].ans) {
      btn.classList.add('correct');
    } else if (i === selectedIdx && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  const fb = document.getElementById('feedbackBox');
  fb.classList.add('show');

  if (isCorrect) {
    STATE.quiz.correct++;
    STATE.score += 10;
    STATE.quiz.subScore += 10;
    document.getElementById('fIcon').textContent = '🎉';
    document.getElementById('fText').innerHTML = `<b style="color:var(--correct)">Correct! +10 points</b><br>${explanation}`;
    showToast('✅ Correct! +10 points', 'correct');
  } else {
    STATE.quiz.wrong++;
    STATE.lives = Math.max(0, STATE.lives - 1);
    document.getElementById('fIcon').textContent = '💡';
    document.getElementById('fText').innerHTML = `<b style="color:var(--wrong)">Not quite!</b> ${explanation}`;
    showToast('❌ Wrong! Try to learn from this.', 'wrong');
    document.getElementById('quizLives').textContent = '❤️'.repeat(STATE.lives) + '🖤'.repeat(3 - STATE.lives);
  }
  updateScoreDisplay();
}

function nextQuestion() {
  STATE.quiz.current++;
  document.getElementById('feedbackBox').classList.remove('show');
  renderQuestion().catch(e => console.error('Error rendering question:', e));
}

// ═══════════════════════════════════════════════════════════════
//  GRAMMAR MODE
// ═══════════════════════════════════════════════════════════════
function startGrammar() {
  const sub = STATE.currentSubject;
  // Use grammar sentences from English 2 or fallback generic ones
  STATE.gram.sentences = sub.grammarSentences || getGenericGramSentences();
  STATE.gram.current = 0;
  STATE.gram.selected_pos = null;
  STATE.gram.score = 0;

  // Build POS legend
  const pl = document.getElementById('posLegend');
  pl.innerHTML = '';
  POS_DATA.forEach(p => {
    const tag = document.createElement('div');
    tag.className = `pos-tag ${p.pos}`;
    tag.textContent = p.label;
    tag.dataset.pos = p.pos;
    tag.onclick = () => selectPOS(p.pos);
    pl.appendChild(tag);
  });

  // Build POS reference
  const pr = document.getElementById('posReference');
  pr.innerHTML = '';
  POS_DATA.forEach(p => {
    const card = document.createElement('div');
    card.className = 'term-card';
    card.style.borderTop = `3px solid ${p.color}`;
    card.innerHTML = `<div class="term" style="color:${p.color}">${p.label}</div><div class="def">${p.desc}</div><div class="eg">${p.examples}</div>`;
    pr.appendChild(card);
  });

  document.getElementById('gramScore').textContent = STATE.gram.score;
  showScreen('grammarScreen');
  renderGramSentence().catch(e => console.error('Error rendering grammar sentence:', e));
}

function getGenericGramSentences() {
  return [
    {
      sentence:['Wow','!','The','big','dog','runs','very','fast','in','the','park','.'],
      labels:{0:'INTERJECTION',3:'ADJECTIVE',4:'NOUN',5:'VERB',6:'ADVERB',7:'ADVERB',8:'PREPOSITION',10:'NOUN'},
      explanation:'Wow! = interjection • big = adjective • dog,park = nouns • runs = verb • very,fast = adverbs • in = preposition'
    },
    {
      sentence:['She','sings','beautifully','and','dances','gracefully','.'],
      labels:{0:'PRONOUN',1:'VERB',2:'ADVERB',3:'CONJUNCTION',4:'VERB',5:'ADVERB'},
      explanation:'She = pronoun • sings,dances = verbs • beautifully,gracefully = adverbs • and = conjunction'
    },
  ];
}

async function renderGramSentence() {
  const sent = STATE.gram.sentences[STATE.gram.current];
  const area = document.getElementById('gramSentenceArea');
  area.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'sentence-display';

  const title = document.createElement('div');
  title.style.cssText = 'font-size:0.8rem;color:var(--muted);margin-bottom:10px';
  title.textContent = `Sentence ${STATE.gram.current + 1} of ${STATE.gram.sentences.length}`;
  div.appendChild(title);

  const wordDiv = document.createElement('div');
  const fullSentence = sent.sentence.join(' ');
  
  // Add speech button for entire sentence
  const sentenceContainer = document.createElement('div');
  sentenceContainer.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:10px';
  const speechBtn = document.createElement('button');
  speechBtn.type = 'button';
  speechBtn.className = 'speech-btn';
  speechBtn.innerHTML = '🔊';
  speechBtn.title = 'Hear the sentence';
  speechBtn.style.cssText = 'flex-shrink:0';
  speechBtn.onclick = () => TRANSLATOR.speak(fullSentence);
  sentenceContainer.appendChild(speechBtn);
  
  // Translate and display words
  const translatedWords = TRANSLATOR.currentLanguage !== 'en' 
    ? await Promise.all(sent.sentence.map(word => 
        (word === '.' || word === '!' || word === ',') ? Promise.resolve(word) : TRANSLATOR.translate(word)
      ))
    : sent.sentence;
  
  const wordSpans = document.createElement('div');
  translatedWords.forEach((word, idx) => {
    if (word === '.' || word === '!' || word === ',') {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.marginRight = '4px';
      wordSpans.appendChild(span);
      return;
    }
    const token = document.createElement('span');
    token.className = 'word-token';
    token.textContent = word;
    token.dataset.idx = idx;
    token.dataset.word = word;
    if (sent.labels[idx]) {
      token.classList.add('labeled', sent.labels[idx]);
      token.dataset.correct = sent.labels[idx];
    }
    token.onclick = () => labelWord(token, idx);
    wordSpans.appendChild(token);
  });
  
  sentenceContainer.appendChild(wordSpans);
  div.appendChild(sentenceContainer);
  area.appendChild(div);
  document.getElementById('gramFeedback').innerHTML = '';
}

function selectPOS(pos) {
  STATE.gram.selected_pos = pos;
  document.querySelectorAll('.pos-tag').forEach(t => {
    t.classList.toggle('selected', t.dataset.pos === pos);
  });
}

function labelWord(token, idx) {
  if (!STATE.gram.selected_pos) {
    showToast('👆 First select a word type from the legend!', '');
    return;
  }
  const oldClass = token.className.split(' ').find(c => POS_DATA.some(p => p.pos === c));
  if (oldClass) token.classList.remove(oldClass, 'labeled');
  token.classList.add('labeled', STATE.gram.selected_pos);
}

function checkGrammar() {
  const sent = STATE.gram.sentences[STATE.gram.current];
  let correct = 0, total = Object.keys(sent.labels).length;
  document.querySelectorAll('.word-token').forEach(token => {
    const idx = parseInt(token.dataset.idx);
    const expected = sent.labels[idx];
    const labeled = token.className.split(' ').find(c => POS_DATA.some(p => p.pos === c));
    if (expected && labeled === expected) { correct++; token.style.boxShadow = '0 0 10px var(--correct)'; }
    else if (expected) { token.style.boxShadow = '0 0 10px var(--wrong)'; }
  });

  const pts = correct * 5;
  STATE.gram.score += pts;
  STATE.score += pts;
  document.getElementById('gramScore').textContent = STATE.gram.score;
  updateScoreDisplay();

  const fb = document.getElementById('gramFeedback');
  fb.innerHTML = `<div class="learn-card"><h3>${correct}/${total} correct! +${pts} points</h3><p><b>Explanation:</b> ${sent.explanation}</p></div>`;
  showToast(`${correct}/${total} words correct! +${pts} pts`, correct === total ? 'correct' : '');
}

function nextGramSentence() {
  STATE.gram.current = (STATE.gram.current + 1) % STATE.gram.sentences.length;
  renderGramSentence().catch(e => console.error('Error rendering grammar sentence:', e));
}

function showGramHint() {
  const sent = STATE.gram.sentences[STATE.gram.current];
  showToast('💡 ' + sent.explanation.split('•')[0], '');
}

// ═══════════════════════════════════════════════════════════════
//  FLASHCARD MODE
// ═══════════════════════════════════════════════════════════════
function startFlash() {
  const sub = STATE.currentSubject;
  STATE.flash = { cards: [...(sub.flashcards || [])].sort(() => Math.random() - 0.5), current: 0, flipped: false };
  showScreen('flashScreen');
  renderFlash().catch(e => console.error('Error rendering flashcard:', e));
}

async function renderFlash() {
  const f = STATE.flash;
  const card = f.cards[f.current];
  document.getElementById('flashCounter').textContent = `${f.current + 1} / ${f.cards.length}`;
  document.getElementById('flashFrontIcon').textContent = '❓';
  
  // Translate front text
  let translatedFront = card.front;
  if (TRANSLATOR.currentLanguage !== 'en') {
    translatedFront = await TRANSLATOR.translate(card.front);
  }
  document.getElementById('flashFrontText').textContent = translatedFront;
  
  // Translate front sub if exists
  let translatedFrontSub = card.frontSub || '';
  if (translatedFrontSub && TRANSLATOR.currentLanguage !== 'en') {
    translatedFrontSub = await TRANSLATOR.translate(card.frontSub);
  }
  document.getElementById('flashFrontSub').textContent = translatedFrontSub;
  
  // Translate back text
  let translatedBack = card.back;
  if (TRANSLATOR.currentLanguage !== 'en') {
    translatedBack = await TRANSLATOR.translate(card.back);
  }
  document.getElementById('flashBackText').textContent = translatedBack;
  
  // Translate back sub if exists
  let translatedBackSub = card.backSub || '';
  if (translatedBackSub && TRANSLATOR.currentLanguage !== 'en') {
    translatedBackSub = await TRANSLATOR.translate(card.backSub);
  }
  document.getElementById('flashBackSub').textContent = translatedBackSub;
  
  // Remove old speech buttons
  document.querySelectorAll('.flashcard-speech-btn').forEach(btn => btn.remove());
  
  // Add speech buttons to front and back
  const frontContainer = document.getElementById('flashFrontText').parentElement;
  if (frontContainer) {
    const frontBtn = document.createElement('button');
    frontBtn.type = 'button';
    frontBtn.className = 'speech-btn flashcard-speech-btn';
    frontBtn.innerHTML = '🔊';
    frontBtn.title = 'Hear front side';
    frontBtn.onclick = () => TRANSLATOR.speak(card.front);
    frontContainer.appendChild(frontBtn);
  }
  
  document.getElementById('flashcard').classList.remove('flipped');
  f.flipped = false;
}

function flipFlashcard() {
  STATE.flash.flipped = !STATE.flash.flipped;
  document.getElementById('flashcard').classList.toggle('flipped');
}

function nextFlash() {
  STATE.flash.current = (STATE.flash.current + 1) % STATE.flash.cards.length;
  renderFlash().catch(e => console.error('Error rendering flashcard:', e));
}

function prevFlash() {
  STATE.flash.current = (STATE.flash.current - 1 + STATE.flash.cards.length) % STATE.flash.cards.length;
  renderFlash().catch(e => console.error('Error rendering flashcard:', e));
}

// ═══════════════════════════════════════════════════════════════
//  VIDEO / PRESENTATION MODE
// ═══════════════════════════════════════════════════════════════
function startVideo() {
  const sub = STATE.currentSubject;
  STATE.slides = { data: sub.slides || [], current: 0 };
  showScreen('videoScreen');
  renderSlide().catch(e => console.error('Error rendering slide:', e));
  buildSlideDots();
}

async function renderSlide() {
  const slides = STATE.slides.data;
  if (!slides.length) return;
  const s = slides[STATE.slides.current];
  const sc = document.getElementById('slideContent');
  
  // Translate slide title and content
  let translatedTitle = s.title;
  if (TRANSLATOR.currentLanguage !== 'en') {
    translatedTitle = await TRANSLATOR.translate(s.title);
  }
  
  let translatedContent = s.content;
  if (TRANSLATOR.currentLanguage !== 'en') {
    translatedContent = await TRANSLATOR.translate(s.content);
  }
  
  sc.innerHTML = `
    <div class="video-slide active">
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:0.8rem;color:var(--muted)">Slide ${STATE.slides.current + 1} of ${slides.length}</div>
        <div style="display:flex;justify-content:center;align-items:center;gap:8px">
          <h2 style="font-size:1.5rem;margin:10px 0;color:var(--accent1)">${translatedTitle}</h2>
          <button type="button" class="speech-btn" style="font-size:1rem" onclick="TRANSLATOR.speak('${s.title.replace(/'/g, "\\'")}')">🔊</button>
        </div>
      </div>
      <div class="visual-demo">
        <span style="font-size:5rem;animation:${s.anim || 'bounce'} 1s ease infinite">${s.visual}</span>
      </div>
      <div style="margin-top:16px;line-height:1.8;font-size:1.05rem">${translatedContent}</div>
    </div>`;
  document.querySelectorAll('.slide-dot').forEach((d, i) => d.classList.toggle('active', i === STATE.slides.current));
}

function buildSlideDots() {
  const sn = document.getElementById('slideNav');
  sn.innerHTML = '';
  STATE.slides.data.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'slide-dot' + (i === 0 ? ' active' : '');
    btn.onclick = () => { STATE.slides.current = i; renderSlide().catch(e => console.error('Error rendering slide:', e)); };
    sn.appendChild(btn);
  });
}

function nextSlide() {
  if (STATE.slides.current < STATE.slides.data.length - 1) { STATE.slides.current++; renderSlide().catch(e => console.error('Error rendering slide:', e)); }
  else showToast('🎉 Presentation complete! Great learning!', 'correct');
}

function prevSlide() {
  if (STATE.slides.current > 0) { STATE.slides.current--; renderSlide().catch(e => console.error('Error rendering slide:', e)); }
}

// ═══════════════════════════════════════════════════════════════
//  RESULT SCREEN
// ═══════════════════════════════════════════════════════════════
function showResult() {
  const q = STATE.quiz;
  const total = q.questions.length;
  const pct = Math.round((q.correct / total) * 100);
  const stars = pct >= 90 ? '⭐⭐⭐' : pct >= 60 ? '⭐⭐' : '⭐';
  const emoji = pct >= 90 ? '🏆' : pct >= 60 ? '🎉' : '💪';
  const msg = pct >= 90 ? 'Outstanding! You\'re a Star!' : pct >= 60 ? 'Great Job! Keep it up!' : 'Good Try! Review and retry!';

  document.getElementById('resultEmoji').textContent = emoji;
  document.getElementById('resultMsg').textContent = msg;
  document.getElementById('resultStars').textContent = stars;
  document.getElementById('resultScore').textContent = `${q.correct}/${total}`;
  document.getElementById('resultBreakdown').innerHTML = `<span>✅ ${q.correct} Correct</span><span>❌ ${q.wrong} Wrong</span><span>📊 ${pct}%</span>`;

  // Badges
  const badges = [];
  if (pct === 100) badges.push({ icon:'🏆', label:'Perfect!', val:'100%' });
  if (q.correct >= 5) badges.push({ icon:'🔥', label:'On Fire!', val: `${q.correct} Correct!` });
  badges.push({ icon:'⭐', label:'Stars Earned', val: stars });
  badges.push({ icon:STATE.currentSubject.icon, label:'Subject', val: STATE.currentSubject.label.replace('\n',' ') });

  const br = document.getElementById('resultBadges');
  br.innerHTML = badges.map(b => `<div class="achievement"><span class="ach-icon">${b.icon}</span><div class="ach-label">${b.label}</div><div class="ach-val">${b.val}</div></div>`).join('');

  // Save score
  localStorage.setItem('score_' + STATE.currentSubject.id, pct);

  if (pct >= 60) launchConfetti();
  updateScoreDisplay();
  showScreen('resultScreen');
}

// ═══════════════════════════════════════════════════════════════
//  CONFETTI
// ═══════════════════════════════════════════════════════════════
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#FFD700','#FF6B6B','#4ECDC4','#A8E6CF','#FF8B94','#7EC8E3','#9B59B6'];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 8 + 4,
      d: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltAngleInc: Math.random() * 0.07 + 0.05
    });
  }

  let frame = 0;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.9;
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, p.tiltAngle, 0, Math.PI * 2);
      ctx.fill();
      p.y += p.d;
      p.x += Math.sin(frame * 0.01) * 1.5;
      p.tiltAngle += p.tiltAngleInc;
    });
    frame++;
    if (frame < 200) requestAnimationFrame(drawConfetti);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  drawConfetti();
}

// ═══════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goBack(screenId) {
  showScreen(screenId);
  updateScoreDisplay();
}

function updateScoreDisplay() {
  ['totalScore', 'hubScore', 'quizScore'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = STATE.score;
  });
  ['livesDisplay', 'hubLives', 'quizLives'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '❤️'.repeat(Math.max(0, STATE.lives)) + '🖤'.repeat(Math.max(0, 3 - STATE.lives));
  });
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════════
init();

// Welcome animation
window.addEventListener('load', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.style.animation = 'pulse 3s ease-in-out infinite';
});

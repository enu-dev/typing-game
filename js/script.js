/* =====================================================
   TypeCode — js/script.js
   コード × 日本語タイピングゲーム メインスクリプト
   ===================================================== */
'use strict';
(function () {

  /* ====================================================
     AudioEngine — Web Audio API による効果音合成
     ==================================================== */
  const Audio = (() => {
    let ctx = null;
    let enabled = true;

    const getCtx = () => {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    };

    const tone = (freq, dur, type = 'sine', vol = 0.22, delay = 0) => {
      if (!enabled) return;
      try {
        const c  = getCtx();
        const t0 = c.currentTime + delay;
        const osc  = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(vol, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.start(t0);
        osc.stop(t0 + dur);
      } catch (_) {}
    };

    return {
      setEnabled: v => { enabled = !!v; },
      isEnabled:  () => enabled,
      click:   () => tone(1100, 0.04, 'square', 0.12),
      error:   () => tone(160, 0.2, 'sawtooth', 0.15),
      combo:   n  => {
        const base = Math.min(300 + n * 8, 700);
        [0, 0.07, 0.14].forEach((d, i) => tone(base + i * 160, 0.15, 'sine', 0.18, d));
      },
      complete: () => {
        [[523,0],[659,0.12],[784,0.24],[1047,0.36]].forEach(
          ([f, d]) => tone(f, 0.4, 'sine', 0.22, d)
        );
      },
    };
  })();

  /* ====================================================
     ParticleSystem — canvas パーティクル
     ==================================================== */
  const Particles = (() => {
    const canvas = document.getElementById('particle-canvas');
    const ctx    = canvas.getContext('2d');
    let particles = [], raf = null;
    const COLS = ['#00d4ff','#CC785C','#ffffff','#4caf50','#ffd700','#a78bfa'];

    const spawn = (n = 100) => {
      canvas.width  = innerWidth;
      canvas.height = innerHeight;
      const cx = innerWidth / 2, cy = innerHeight * 0.42;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * 14 + 4;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 5,
          r: Math.random() * 5 + 2,
          color: COLS[Math.floor(Math.random() * COLS.length)],
          life: 1, decay: Math.random() * 0.018 + 0.007,
        });
      }
      if (!raf) loop();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0.01);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.38; p.vx *= 0.98; p.life -= p.decay;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      if (particles.length) raf = requestAnimationFrame(loop);
      else { raf = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    };

    return { spawn };
  })();

  /* ====================================================
     ScoreDB — localStorage スコア管理
     ==================================================== */
  const ScoreDB = (() => {
    const K  = 'tgc:scores';
    const KS = 'tgc:settings';

    const load = () => { try { return JSON.parse(localStorage.getItem(K)) || []; } catch { return []; } };

    const save = entry => {
      const s = load();
      s.unshift({ ...entry, date: new Date().toISOString() });
      if (s.length > 60) s.length = 60;
      try { localStorage.setItem(K, JSON.stringify(s)); } catch {}
    };

    const getBest = (mode, lang, diff) =>
      load().filter(s => s.mode === mode && s.lang === lang && s.diff === diff)
            .reduce((b, s) => (!b || s.wpm > b.wpm) ? s : b, null);

    const getRecent = (mode, lang, diff, n = 20) =>
      load().filter(s => s.mode === mode && s.lang === lang && s.diff === diff).slice(0, n);

    const getSettings  = () => { try { return JSON.parse(localStorage.getItem(KS)) || {}; } catch { return {}; } };
    const setSetting   = (k, v) => { const s = getSettings(); s[k] = v; try { localStorage.setItem(KS, JSON.stringify(s)); } catch {} };

    return { save, getBest, getRecent, getSettings, setSetting };
  })();

  /* ====================================================
     GameData — お題選択・型変換
     ==================================================== */
  const GameData = (() => {
    const shuffle = a => {
      const b = [...a];
      for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
      }
      return b;
    };

    const pool = (mode, lang, diff) => {
      const D = WORDS_DATA; // words-data.js のグローバル変数
      if (mode === 'code')     return D.code[lang]?.[diff] || [];
      if (mode === 'japanese') {
        let items = [];
        for (const cat of Object.values(D.japanese)) if (cat[diff]) items.push(...cat[diff]);
        return items;
      }
      if (mode === 'mix')      return D.mix[diff] || [];
      return [];
    };

    const getNext = (mode, lang, diff, excludeId = null) => {
      let p = shuffle(pool(mode, lang, diff));
      if (excludeId) p = p.filter(it => it.id !== excludeId);
      return p[0] || null;
    };

    // 現在セグメントの「タイプ列」を取得
    // 日本語ローマ字はすべて小文字に正規化（data の表記揺れを吸収）
    const typeSeqOf = (item, segIdx) => {
      if (item.segments) {
        const seg = item.segments[segIdx];
        const seq = seg.type === 'ja' ? seg.romaji : seg.text;
        return seg.type === 'ja' ? seq.toLowerCase() : seq;
      }
      if (item.romaji) return item.romaji.toLowerCase();
      return item.text || '';
    };

    // 現在セグメントの「表示テキスト」を取得
    const displayOf = (item, segIdx) => {
      if (item.segments) {
        const seg = item.segments[segIdx];
        return { type: seg.type, text: seg.type === 'ja' ? seg.display : seg.text };
      }
      if (item.romaji) return { type: 'ja', text: item.display };
      return { type: 'code', text: item.text };
    };

    return { getNext, typeSeqOf, displayOf };
  })();

  /* ====================================================
     Engine — タイピングコアロジック
     ==================================================== */
  const Engine = (() => {
    let S = makeState();
    let tick = null;
    const handlers = {};

    function makeState() {
      return {
        mode: 'code', lang: 'javascript', diff: 'easy',
        timerMode: 'race', timeLimit: 60,
        item: null, segIdx: 0, typeSeq: '',
        typed: '', startTime: null,
        totalKeys: 0, correctKeys: 0, errors: 0,
        combo: 0, maxCombo: 0,
        active: false, finished: false,
      };
    }

    const emit = (ev, ...args) => handlers[ev]?.(...args);

    const stats = () => {
      const el   = S.startTime ? (Date.now() - S.startTime) / 1000 : 0;
      const wpm  = el > 0 ? Math.round((S.correctKeys / 5) / (el / 60)) : 0;
      const acc  = S.totalKeys > 0 ? Math.round(S.correctKeys / S.totalKeys * 100) : 100;
      const prog = S.typeSeq.length ? Math.round(S.typed.length / S.typeSeq.length * 100) : 0;
      return {
        wpm, acc, errors: S.errors,
        combo: S.combo, maxCombo: S.maxCombo,
        elapsed: Math.round(el), elapsedRaw: el,
        typed: S.typed, typeSeq: S.typeSeq, segIdx: S.segIdx, item: S.item,
        mode: S.mode, lang: S.lang, diff: S.diff,
        timerMode: S.timerMode,
        timeLeft: S.timerMode !== 'race' ? Math.max(0, S.timeLimit - el) : null,
        progress: prog, finished: S.finished,
      };
    };

    const startTick = () => {
      if (tick) clearInterval(tick);
      tick = setInterval(() => {
        if (!S.active || !S.startTime) return;
        if (S.timerMode !== 'race') {
          const el = (Date.now() - S.startTime) / 1000;
          if (el >= S.timeLimit) { finish(true); return; }
        }
        emit('update', stats());
      }, 100);
    };

    const finish = (timedOut = false) => {
      S.finished = true; S.active = false;
      if (tick) { clearInterval(tick); tick = null; }
      emit('complete', { ...stats(), timedOut });
    };

    const start = (item, opts) => {
      S = makeState();
      Object.assign(S, {
        mode: opts.mode, lang: opts.lang, diff: opts.diff,
        timerMode: opts.timerMode || 'race',
        timeLimit: opts.timeLimit  || 60,
        item, active: true,
        typeSeq: GameData.typeSeqOf(item, 0),
      });
      startTick();
    };

    const processKey = char => {
      if (!S.active || S.finished) return 'ignore';
      const expected = S.typeSeq[S.typed.length];
      if (!S.startTime) S.startTime = Date.now();
      S.totalKeys++;

      if (char === expected) {
        S.typed += char;
        S.correctKeys++;
        S.combo++;
        if (S.combo > S.maxCombo) S.maxCombo = S.combo;
        if (S.combo > 0 && S.combo % 10 === 0) emit('combo', S.combo);

        if (S.typed.length >= S.typeSeq.length) {
          const segs = S.item.segments;
          if (segs && S.segIdx < segs.length - 1) {
            S.segIdx++;
            S.typeSeq = GameData.typeSeqOf(S.item, S.segIdx);
            S.typed = '';
            emit('segment', stats());
            return 'segment-done';
          } else {
            finish(false);
            return 'done';
          }
        }
        emit('update', stats());
        return 'correct';
      } else {
        S.errors++;
        S.combo = 0;
        emit('error');
        emit('update', stats());
        return 'error';
      }
    };

    const stop = () => {
      S.active = false;
      if (tick) { clearInterval(tick); tick = null; }
    };

    return {
      start, stop, processKey, stats,
      on: (ev, fn) => { handlers[ev] = fn; },
    };
  })();

  /* ====================================================
     UI — DOM 操作
     ==================================================== */
  const UI = (() => {
    const el = id => document.getElementById(id);
    const screens = {
      start:  el('screen-start'),
      game:   el('screen-game'),
      result: el('screen-result'),
    };

    // ----- スクリーン切り替え -----
    const showScreen = name => {
      for (const s of Object.values(screens)) s.hidden = true;
      screens[name].hidden = false;
      el('pause-overlay').hidden = true;
    };

    // ----- 文字スパン構築 -----
    let builtSeq = '';
    const buildChars = seq => {
      builtSeq = seq;
      const wrap = el('type-display');
      wrap.dataset.seq = seq;
      wrap.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (let i = 0; i < seq.length; i++) {
        const span = document.createElement('span');
        const ch = seq[i];
        span.className = 'char ' + (i === 0 ? 'current' : 'pending') + (ch === ' ' ? ' space' : '');
        span.textContent = ch === ' ' ? '·' : ch; // · をスペースの代わりに表示
        frag.appendChild(span);
      }
      wrap.appendChild(frag);
    };

    const updateChars = (typed, seq) => {
      const wrap = el('type-display');
      const spans = wrap.children;
      for (let i = 0; i < spans.length; i++) {
        const ch = seq[i];
        const sp = ch === ' ' ? ' space' : '';
        if (i < typed.length)      spans[i].className = 'char correct' + sp;
        else if (i === typed.length) {
          spans[i].className = 'char current' + sp;
          spans[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } else                     spans[i].className = 'char pending' + sp;
      }
    };

    // ----- 日本語表示 -----
    const setJaDisplay = text => {
      const d = el('ja-display');
      d.hidden = !text;
      d.textContent = text || '';
    };

    // ----- ミックスインジケーター -----
    const setMixIndicator = (idx, total, type) => {
      const d = el('mix-indicator');
      d.hidden = false;
      const badge = type === 'ja'
        ? '<span class="mix-badge mix-badge--ja">🇯🇵 日本語</span>'
        : '<span class="mix-badge mix-badge--code">💻 Code</span>';
      d.innerHTML = `${badge} <span>${idx + 1}&nbsp;/&nbsp;${total}</span>`;
    };

    // ----- 統計更新 -----
    const updateStats = st => {
      el('stat-wpm').textContent = st.wpm;
      el('stat-acc').textContent = st.acc + '%';
      el('stat-streak').textContent = st.combo;

      // 時間
      const t = st.timerMode !== 'race' && st.timeLeft !== null
        ? Math.ceil(st.timeLeft) : (st.elapsed || 0);
      el('stat-time').textContent =
        Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');

      // WPM カラー
      const wEl = el('stat-wpm');
      wEl.className = 'stat-val';
      if      (st.wpm >= 120) wEl.classList.add('wpm-super');
      else if (st.wpm >= 60)  wEl.classList.add('wpm-high');

      // プログレスバー
      el('progress-fill').style.width = (st.progress || 0) + '%';
    };

    // ----- シェイク -----
    const shake = () => {
      const wrap = el('typing-area');
      wrap.classList.remove('shake', 'flash-error');
      void wrap.offsetWidth;
      wrap.classList.add('shake', 'flash-error');
      setTimeout(() => wrap.classList.remove('shake', 'flash-error'), 450);
    };

    // ----- コンボオーバーレイ -----
    let comboTm = null;
    const showCombo = n => {
      el('combo-num').textContent = n;
      const ov = el('combo-overlay');
      const inner = ov.querySelector('.combo-inner');
      ov.hidden = false;
      inner.style.animation = 'none';
      void inner.offsetWidth;
      inner.style.animation = '';
      if (comboTm) clearTimeout(comboTm);
      comboTm = setTimeout(() => { ov.hidden = true; }, 720);
    };

    // ----- リザルト -----
    const showResult = (st, isNewBest) => {
      el('result-title').textContent = st.timedOut ? 'Time Up!' : 'Complete!';
      el('result-wpm').textContent   = st.wpm;
      el('result-acc').textContent   = st.acc + '%';
      const e = Math.round(st.elapsedRaw || st.elapsed || 0);
      el('result-time').textContent  = Math.floor(e/60) + ':' + String(e%60).padStart(2,'0');
      el('result-errors').textContent = st.errors;
      el('result-combo').textContent  = st.maxCombo;
      el('result-best-banner').hidden = !isNewBest;
      showScreen('result');
    };

    // ----- 履歴チャート -----
    const drawChart = (canvas, records) => {
      const W = canvas.clientWidth  || 500;
      const H = canvas.clientHeight || 100;
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);
      if (!records || records.length < 2) return;

      const wpms = records.map(r => r.wpm).reverse();
      const max  = Math.max(...wpms, 30);
      const pad  = { t: 12, r: 8, b: 18, l: 28 };
      const gw   = W - pad.l - pad.r;
      const gh   = H - pad.t - pad.b;
      const px   = i => pad.l + (i / (wpms.length - 1)) * gw;
      const py   = v => pad.t + gh * (1 - v / max);

      // グリッド線
      ctx.strokeStyle = 'rgba(46,63,86,0.7)';
      ctx.lineWidth   = 1;
      [0, max].forEach(v => {
        const y = py(v);
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
        ctx.fillStyle = '#4f6480';
        ctx.font = `9px monospace`;
        ctx.fillText(v, 2, y + 3);
      });

      // ライン
      const grad = ctx.createLinearGradient(pad.l, 0, W - pad.r, 0);
      grad.addColorStop(0, '#00a8cc');
      grad.addColorStop(1, '#00d4ff');
      ctx.beginPath();
      ctx.moveTo(px(0), py(wpms[0]));
      for (let i = 1; i < wpms.length; i++) ctx.lineTo(px(i), py(wpms[i]));
      ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      ctx.stroke();

      // 塗りつぶし
      ctx.lineTo(px(wpms.length - 1), py(0));
      ctx.lineTo(px(0), py(0));
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,212,255,0.07)';
      ctx.fill();

      // ドット
      wpms.forEach((v, i) => {
        ctx.beginPath();
        ctx.arc(px(i), py(v), i === wpms.length - 1 ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = i === wpms.length - 1 ? '#00d4ff' : '#005f72';
        ctx.fill();
      });
    };

    // ----- トースト -----
    let toastTm = null;
    const toast = (msg, dur = 2200) => {
      const t = el('toast');
      t.textContent = msg;
      t.classList.add('show');
      if (toastTm) clearTimeout(toastTm);
      toastTm = setTimeout(() => t.classList.remove('show'), dur);
    };

    // ----- ベスト表示 -----
    const showBest = (mode, lang, diff) => {
      const b = ScoreDB.getBest(mode, lang, diff);
      el('start-best').textContent = b ? `ベスト: ${b.wpm} WPM  正確性 ${b.acc}%` : '';
    };

    const setPromptVisible = v => {
      el('click-prompt').classList.toggle('hidden', !v);
    };

    return {
      showScreen, buildChars, updateChars, setJaDisplay, setMixIndicator,
      updateStats, shake, showCombo, showResult, drawChart,
      toast, showBest, setPromptVisible, el,
    };
  })();

  /* ====================================================
     App — イベント統合・状態管理
     ==================================================== */
  const App = (() => {
    let cfg = { mode: 'code', lang: 'javascript', diff: 'easy', timerMode: 'race', timeLimit: 0 };
    let currentItem  = null;
    let started      = false;
    let paused       = false;
    let composing    = false;
    let lastSegIdx   = -1;   // ミックスモードのセグメント変化検出

    // ===== 設定読込 =====
    const loadSettings = () => {
      const s = ScoreDB.getSettings();
      if (s.mode)      cfg.mode      = s.mode;
      if (s.lang)      cfg.lang      = s.lang;
      if (s.diff)      cfg.diff      = s.diff;
      if (s.timerMode) cfg.timerMode = s.timerMode;
      if (s.timeLimit != null) cfg.timeLimit = s.timeLimit;
      Audio.setEnabled(s.sound !== false);
      syncSelectors();
      updateSoundBtns();
    };

    // ===== セレクター同期 =====
    const syncSelectors = () => {
      activate('mode-btns',  '[data-mode]',  `[data-mode="${cfg.mode}"]`);
      activate('lang-btns',  '[data-lang]',  `[data-lang="${cfg.lang}"]`);
      activate('diff-btns',  '[data-diff]',  `[data-diff="${cfg.diff}"]`);
      const timerKey = cfg.timerMode === 'race' ? 'race' : String(cfg.timeLimit);
      activate('timer-btns', '[data-timer]', `[data-timer="${timerKey}"]`);
      UI.el('lang-group').hidden = cfg.mode !== 'code';
    };

    const activate = (parentId, allSel, activeSel) => {
      const p = UI.el(parentId);
      if (!p) return;
      p.querySelectorAll(allSel).forEach(b => b.classList.remove('active'));
      p.querySelector(activeSel)?.classList.add('active');
    };

    const updateSoundBtns = () => {
      const muted = !Audio.isEnabled();
      ['btn-sound-start', 'btn-sound-game'].forEach(id => {
        const b = UI.el(id);
        if (!b) return;
        b.textContent = muted ? '🔇' : '🔊';
        b.classList.toggle('muted', muted);
      });
    };

    // ===== スタート画面イベント =====
    const bindStartScreen = () => {
      UI.el('mode-btns').addEventListener('click', e => {
        const b = e.target.closest('[data-mode]'); if (!b) return;
        cfg.mode = b.dataset.mode;
        ScoreDB.setSetting('mode', cfg.mode);
        syncSelectors();
        UI.showBest(cfg.mode, cfg.lang, cfg.diff);
      });
      UI.el('lang-btns').addEventListener('click', e => {
        const b = e.target.closest('[data-lang]'); if (!b) return;
        cfg.lang = b.dataset.lang;
        ScoreDB.setSetting('lang', cfg.lang);
        syncSelectors();
        UI.showBest(cfg.mode, cfg.lang, cfg.diff);
      });
      UI.el('diff-btns').addEventListener('click', e => {
        const b = e.target.closest('[data-diff]'); if (!b) return;
        cfg.diff = b.dataset.diff;
        ScoreDB.setSetting('diff', cfg.diff);
        syncSelectors();
        UI.showBest(cfg.mode, cfg.lang, cfg.diff);
      });
      UI.el('timer-btns').addEventListener('click', e => {
        const b = e.target.closest('[data-timer]'); if (!b) return;
        if (b.dataset.timer === 'race') { cfg.timerMode = 'race'; cfg.timeLimit = 0; }
        else { cfg.timerMode = 'timed'; cfg.timeLimit = parseInt(b.dataset.timer, 10); }
        ScoreDB.setSetting('timerMode', cfg.timerMode);
        ScoreDB.setSetting('timeLimit', cfg.timeLimit);
        syncSelectors();
      });

      UI.el('btn-start').addEventListener('click', beginGame);
      ['btn-sound-start', 'btn-sound-game'].forEach(id =>
        UI.el(id)?.addEventListener('click', toggleSound)
      );
    };

    // ===== ゲーム開始 =====
    const beginGame = () => {
      const item = GameData.getNext(cfg.mode, cfg.lang, cfg.diff);
      if (!item) { UI.toast('お題が見つかりませんでした。言語または難易度を変更してください。'); return; }
      setupGame(item);
      UI.showScreen('game');
      UI.el('game-input').focus();
    };

    const setupGame = item => {
      currentItem = item;
      started  = false;
      paused   = false;
      lastSegIdx = 0; // 0 に初期化して初回 update で二重ビルドを防ぐ

      const typeSeq = GameData.typeSeqOf(item, 0);
      UI.buildChars(typeSeq);
      UI.el('item-label').textContent = item.label || '';
      updateSegmentUI(item, 0);

      Engine.start(item, {
        mode: cfg.mode, lang: cfg.lang, diff: cfg.diff,
        timerMode: cfg.timerMode, timeLimit: cfg.timeLimit,
      });
      UI.updateStats({ wpm:0, acc:100, combo:0, elapsed:0, elapsedRaw:0,
                       timerMode: cfg.timerMode, timeLeft: cfg.timeLimit || null, progress:0 });
      UI.setPromptVisible(true);
    };

    // セグメントに応じた UI 更新
    const updateSegmentUI = (item, segIdx) => {
      if (item.segments) {
        const seg = item.segments[segIdx];
        UI.setJaDisplay(seg.type === 'ja' ? seg.display : null);
        UI.setMixIndicator(segIdx, item.segments.length, seg.type);
      } else if (item.romaji) {
        UI.setJaDisplay(item.display);
        UI.el('mix-indicator').hidden = true;
      } else {
        UI.setJaDisplay(null);
        UI.el('mix-indicator').hidden = true;
      }
    };

    // ===== キー入力 =====
    const bindInput = () => {
      const input = UI.el('game-input');
      input.addEventListener('compositionstart', () => { composing = true; });
      input.addEventListener('compositionend',   () => { composing = false; input.value = ''; });

      document.addEventListener('keydown', e => {
        const gameVisible = !UI.el('screen-game').hidden;
        if (!gameVisible) {
          // スタート画面での Enter
          if (!UI.el('screen-start').hidden && e.key === 'Enter') beginGame();
          return;
        }
        if (composing) return;

        // 一時停止中
        if (paused) {
          if (e.key === 'Escape') resumeGame();
          return;
        }

        if (e.key === 'Escape') { pauseGame(); return; }
        if (e.key === 'Tab')    { e.preventDefault(); skipItem(); return; }

        // 文字キー以外は無視
        if (e.key.length !== 1) return;
        e.preventDefault();

        // ゲーム未開始なら開始
        if (!started) {
          started = true;
          UI.setPromptVisible(false);
          input.focus();
        }

        const result = Engine.processKey(e.key);
        if (result === 'correct') {
          Audio.click();
        } else if (result === 'error') {
          Audio.error();
          UI.shake();
        } else if (result === 'segment-done') {
          Audio.click();
        }
        // input を常に空に保つ（IME 対策）
        input.value = '';
      });

      // クリックでフォーカス
      UI.el('typing-area').addEventListener('click', () => {
        if (!UI.el('screen-game').hidden) input.focus();
      });

      // フォーカスが外れたら再取得
      input.addEventListener('blur', () => {
        if (!UI.el('screen-game').hidden && !paused) {
          setTimeout(() => { if (!UI.el('screen-game').hidden && !paused) input.focus(); }, 80);
        }
      });
    };

    // ===== ゲームコントロール =====
    const skipItem = () => {
      Engine.stop();
      const next = GameData.getNext(cfg.mode, cfg.lang, cfg.diff, currentItem?.id);
      if (!next) { UI.toast('お題がありません'); return; }
      setupGame(next);
    };

    const pauseGame = () => {
      paused = true;
      Engine.stop();
      UI.el('pause-overlay').hidden = false;
    };

    const resumeGame = () => {
      paused = false;
      UI.el('pause-overlay').hidden = true;
      // 一時停止後のリスタートは同じアイテムで新規スタート
      setupGame(currentItem);
    };

    const quitGame = () => {
      Engine.stop();
      UI.showScreen('start');
      UI.showBest(cfg.mode, cfg.lang, cfg.diff);
    };

    const bindGameControls = () => {
      UI.el('btn-skip').addEventListener('click',  skipItem);
      UI.el('btn-pause').addEventListener('click', pauseGame);
      UI.el('btn-quit').addEventListener('click',  quitGame);
      UI.el('btn-resume').addEventListener('click', resumeGame);
      UI.el('btn-pause-quit').addEventListener('click', () => {
        UI.el('pause-overlay').hidden = true;
        quitGame();
      });
    };

    // ===== エンジンイベント =====
    const bindEngine = () => {
      Engine.on('update', st => {
        UI.updateStats(st);
        UI.updateChars(st.typed, st.typeSeq);

        // ミックスモード: セグメント変化検出
        if (cfg.mode === 'mix' && st.item?.segments && st.segIdx !== lastSegIdx) {
          lastSegIdx = st.segIdx;
          UI.buildChars(st.typeSeq);
          updateSegmentUI(st.item, st.segIdx);
          UI.el('game-input').focus();
        }
      });

      Engine.on('segment', st => {
        // セグメント完了時（次セグメントへ）
        UI.updateStats(st);
      });

      Engine.on('error', () => {});

      Engine.on('combo', n => {
        UI.showCombo(n);
        Audio.combo(n);
      });

      Engine.on('complete', st => {
        const prevBest = ScoreDB.getBest(cfg.mode, cfg.lang, cfg.diff);
        ScoreDB.save({
          wpm: st.wpm, acc: st.acc, errors: st.errors,
          maxCombo: st.maxCombo, elapsed: st.elapsed,
          mode: cfg.mode, lang: cfg.lang, diff: cfg.diff,
        });
        const isNewBest = !prevBest || st.wpm > prevBest.wpm;

        if (!st.timedOut) {
          Particles.spawn(130);
          Audio.complete();
        }

        setTimeout(() => {
          UI.showResult(st, isNewBest);
          const rec = ScoreDB.getRecent(cfg.mode, cfg.lang, cfg.diff, 20);
          const canvas = UI.el('history-canvas');
          UI.drawChart(canvas, rec);
          UI.el('history-empty').hidden = rec.length >= 2;
        }, 350);
      });
    };

    // ===== リザルト画面 =====
    const bindResult = () => {
      UI.el('btn-retry').addEventListener('click', beginGame);
      UI.el('btn-next').addEventListener('click', () => {
        const next = GameData.getNext(cfg.mode, cfg.lang, cfg.diff, currentItem?.id);
        if (!next) { UI.toast('お題がありません'); return; }
        setupGame(next);
        UI.showScreen('game');
        UI.el('game-input').focus();
      });
      UI.el('btn-home').addEventListener('click', () => {
        UI.showScreen('start');
        UI.showBest(cfg.mode, cfg.lang, cfg.diff);
      });
    };

    // ===== サウンド =====
    const toggleSound = () => {
      Audio.setEnabled(!Audio.isEnabled());
      ScoreDB.setSetting('sound', Audio.isEnabled());
      updateSoundBtns();
      if (Audio.isEnabled()) Audio.click();
    };

    // ===== イースターエッグ: Konami Code =====
    (() => {
      const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                      'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      let pos = 0;
      document.addEventListener('keydown', e => {
        if (e.key === KONAMI[pos]) {
          pos++;
          if (pos === KONAMI.length) {
            pos = 0;
            Particles.spawn(300);
            UI.toast('🎉 コナミコマンド発動！パーティクル MAX！');
          }
        } else {
          pos = e.key === KONAMI[0] ? 1 : 0;
        }
      });
    })();

    // ===== 初期化 =====
    const init = () => {
      loadSettings();
      syncSelectors();
      bindStartScreen();
      bindInput();
      bindGameControls();
      bindEngine();
      bindResult();
      UI.showScreen('start');
      UI.showBest(cfg.mode, cfg.lang, cfg.diff);
    };

    return { init };
  })();

  /* ===== 起動 ===== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

})();

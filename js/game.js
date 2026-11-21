// ============================================================
//  Screens, character creation, mode select, and the door game
//
//  Flow:  Start ─ New user ─► Create (P1) ─► Mode
//               └ Old user ──────────────────► Mode
//         Mode ─ Single player ───────────────► Game (1 station)
//              └ Two players ─► Create (P2) ─► Game (2 stations, same guests)
// ============================================================

const STORAGE_KEYS = { 1: 'tamidMixer.bouncer', 2: 'tamidMixer.bouncer2' };
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let player1 = null;
let player2 = null;
let mode = 'single';    // 'single' | 'versus'
let stations = [];      // active Station objects
let draft = null;       // avatar being edited on the create screen
let creatorDone = null; // callback when the create form is submitted

// ---------- storage ----------
function loadPlayer(slot) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS[slot])); } catch { return null; }
}
function savePlayer(slot, p) {
  try { localStorage.setItem(STORAGE_KEYS[slot], JSON.stringify(p)); } catch { /* private mode etc. */ }
}

// ---------- screens ----------
function showScreen(id) {
  if (id !== 'screen-game') stopStations();
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  $('result').classList.add('hidden');
  Music.play(SCREEN_MUSIC[id] === 'game' && mode === 'versus' ? 'versus' : SCREEN_MUSIC[id]);
}

// Which theme plays on each screen (tracks live in js/music.js).
const SCREEN_MUSIC = {
  'screen-start': 'start',
  'screen-create': 'create',
  'screen-mode': 'mode',
  'screen-game': 'game',
}

// ---------- START SCREEN ----------
function refreshStartNote() {
  const saved = loadPlayer(1);
  $('start-hero').innerHTML = renderAvatar(saved || DEFAULT_AVATAR);
  $('start-note').textContent = saved
    ? `Welcome back, ${saved.name}.`
    : 'No saved bouncer on this device yet. Old users will get the default look.';
}
refreshStartNote();
Music.play('start');

$('btn-new').addEventListener('click', () => {
  openCreator(null, {
    title: 'Create your bouncer',
    submit: 'Continue →',
    onDone: p => { player1 = p; savePlayer(1, p); showModeSelect(); },
  });
});
$('btn-old').addEventListener('click', () => {
  player1 = loadPlayer(1) || { ...DEFAULT_AVATAR };
  showModeSelect();
});

// ---------- CREATE SCREEN ----------
function openCreator(existing, { title, submit, onDone }) {
  draft = { ...DEFAULT_AVATAR, ...(existing || {}) };
  if (!existing) draft.name = '';
  creatorDone = onDone;
  $('create-title').textContent = title;
  $('create-submit').textContent = submit;
  $('in-name').value = draft.name;
  $('create-error').textContent = '';
  buildOptionGroups();
  updatePreview();
  showScreen('screen-create');
  $('in-name').focus();
}

function buildOptionGroups() {
  const root = $('option-groups');
  root.innerHTML = '';
  for (const group of AVATAR_OPTIONS) {
    const wrap = document.createElement('div');
    wrap.className = 'group';
    wrap.dataset.key = group.key;
    wrap.innerHTML = `<span class="group-label">${group.label}</span><div class="chips"></div>`;
    const chips = wrap.querySelector('.chips');
    for (const [value, display, title] of group.choices) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = group.swatch ? 'chip swatch' : 'chip';
      if (group.swatch) {
        b.style.background = display;
        b.title = title || '';
        b.setAttribute('aria-label', `${group.label} ${title || value}`);
      } else {
        b.textContent = display;
      }
      b.dataset.value = value;
      b.addEventListener('click', () => {
        draft[group.key] = typeof value === 'number' ? value : String(value);
        refreshChips();
        updatePreview();
      });
      chips.appendChild(b);
    }
    root.appendChild(wrap);
  }
  refreshChips();
}

function refreshChips() {
  document.querySelectorAll('#option-groups .group').forEach(g => {
    const key = g.dataset.key;
    g.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('selected', String(draft[key]) === c.dataset.value);
    });
    if (key === 'bottom') g.classList.toggle('disabled', draft.top === 'dress'); // dress replaces bottoms
  });
}

function updatePreview() {
  $('preview').innerHTML = renderAvatar(draft);
  $('preview-name').textContent = (draft.name || 'Bouncer').toUpperCase();
}

$('in-name').addEventListener('input', e => { draft.name = e.target.value.trim(); updatePreview(); });

$('create-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!draft.name) { $('create-error').textContent = 'Please enter a name.'; return; }
  creatorDone && creatorDone({ ...draft });
});

// ---------- MODE SELECT SCREEN ----------
function showModeSelect() {
  $('mode-greeting').textContent = `${player1.name}, how are you working the door tonight?`;
  $('mode-art-single').innerHTML = renderAvatar(player1);
  const p2 = loadPlayer(2);
  $('mode-art-versus').innerHTML =
    renderAvatar(player1) + '<span class="vs">VS</span>' +
    (p2 ? renderAvatar(p2) : '<div class="silhouette">?</div>');
  showScreen('screen-mode');
}

$('btn-single').addEventListener('click', () => startGame('single'));
$('btn-versus').addEventListener('click', () => {
  openCreator(loadPlayer(2), {
    title: 'Player 2: create your bouncer',
    submit: 'Start Bouncer vs Bouncer →',
    onDone: p => { player2 = p; savePlayer(2, p); startGame('versus'); },
  });
});
$('btn-back-start').addEventListener('click', () => { refreshStartNote(); showScreen('screen-start'); });

// ---------- GAME ----------
const LOCATIONS = {
  front: { label: 'Front of the house', sign: 'TAMID MIXER' },
  back:  { label: 'Back of the house',  sign: 'MIXER · BACK DOOR' },
};

const WEAPON_ICONS = {
  knife: '<svg viewBox="0 0 64 64"><path d="M14 44 L46 16 Q54 10 56 18 L22 50Z" fill="#dfe6ee"/><rect x="4" y="44" width="20" height="9" rx="3" transform="rotate(-40 14 48)" fill="#6b4226"/></svg>',
  spear: '<svg viewBox="0 0 64 64"><line x1="6" y1="58" x2="46" y2="18" stroke="#9a6532" stroke-width="5" stroke-linecap="round"/><path d="M42 12 L60 4 L52 22 L46 22 L42 18Z" fill="#dfe6ee"/></svg>',
  watergun: '<svg viewBox="0 0 64 64"><path d="M6 20 H50 Q60 20 60 28 V32 H40 L36 52 H22 L27 32 H10 Q6 32 6 27Z" fill="#33b5ff"/><rect x="40" y="10" width="14" height="10" rx="3" fill="#ffcc00"/><rect x="2" y="23" width="6" height="5" fill="#ff5fa2"/></svg>',
  nunchucks: '<svg viewBox="0 0 64 64"><rect x="8" y="4" width="10" height="30" rx="4" fill="#3a3a3a" transform="rotate(-15 13 19)"/><rect x="40" y="28" width="10" height="30" rx="4" fill="#3a3a3a" transform="rotate(25 45 43)"/><path d="M17 34 Q28 46 41 30" stroke="#ccc" stroke-width="2.5" stroke-dasharray="3 2" fill="none"/></svg>',
};

// What a REAL ID looks like under black light. Fake IDs show none of this.
const UV_PATTERN = `<svg viewBox="0 0 300 190" preserveAspectRatio="none">
  <g fill="none" stroke="#7dffcf" stroke-width="1.3" opacity=".8">
    <path d="M0 40 Q75 12 150 40 T300 40"/><path d="M0 70 Q75 42 150 70 T300 70"/>
    <path d="M0 100 Q75 72 150 100 T300 100"/><path d="M0 130 Q75 102 150 130 T300 130"/>
    <path d="M0 160 Q75 132 150 160 T300 160"/>
  </g>
  <g transform="translate(232 92)">
    <circle r="38" fill="none" stroke="#ff7bff" stroke-width="3"/>
    <circle r="28" fill="none" stroke="#ff7bff" stroke-width="1.5" stroke-dasharray="4 3"/>
    <path d="M0 -18 L5 -6 L18 -6 L8 2 L12 15 L0 7 L-12 15 L-8 2 L-18 -6 L-5 -6Z" fill="#ff7bff"/>
  </g>
  <text x="14" y="182" fill="#7dffcf" font-size="12" font-weight="700" letter-spacing="3">OFFICIAL · VALID · OFFICIAL · VALID</text>
</svg>`;

const TOOLS = [
  ['id', '🪪', 'Check ID', 'DOB, state/country, photo, ID #, black light'],
  ['phone', '📱', 'TAMID member list', 'Search their name and compare'],
  ['detector', '🔍', 'Metal detector', 'Spear, knife, water gun, nunchucks'],
  ['ask', '💬', 'Ask questions', 'Name, birthday, TAMID Chats…'],
];

// Where people stand. k = -1 is the spot in front of the bouncer; k >= 0 is the line.
function slotPos(k) {
  if (k < 0) return { left: 56, bottom: 6, scale: 1, z: 40, dim: 1 };
  // the line snakes back and to the right toward the horizon
  return {
    left: 71 + k * 2.3 + (k % 2 ? 1.5 : -1.5),
    bottom: 30 + k * 2.9,
    scale: 0.66 * Math.pow(0.9, k),
    z: 30 - k,
    dim: 1 - Math.min(k, 9) * 0.05,
  };
}

// One bouncer working one door. Two of these run side by side in versus mode.
class Station {
  constructor({ player, side, keys, shift, title, onDone }) {
    this.player = player;
    this.side = side;
    this.guests = shift.guests;
    this.roster = shift.roster;
    this.onDone = onDone;
    this.index = 0;
    this.correct = 0;
    this.mistakes = [];
    this.busy = true;
    this.alive = true;
    this.done = false;
    this.used = new Set();
    this.el = this.build(title, keys);
  }

  build(title, keys) {
    const loc = LOCATIONS[this.side];
    const el = document.createElement('div');
    el.className = `station ${this.side}`;
    el.innerHTML = `
      <header class="hud">
        <div class="hud-player">
          <div class="hud-avatar">${renderAvatar(this.player, { head: true })}</div>
          <div><strong>${esc(this.player.name)}</strong><small>${title}</small></div>
        </div>
        <div class="hud-stats">
          <span>Guest <b data-r="guest">1</b>/<b>${this.guests.length}</b></span>
          <span>Correct <b data-r="correct">0</b></span>
          <span>Accuracy <b data-r="acc">–</b></span>
        </div>
      </header>
      <div class="game-layout">
        <div class="scene ${this.side} cam-front" data-r="scene">
          <div class="view view-front">
            <div class="club-wall"></div>
            <div class="club-sign">${loc.sign}</div>
            <div class="club-door"><span>♪</span><span>♫</span><span>♪</span></div>
            <div class="club-floor"></div>
          </div>
          <div class="view view-line">
            <div class="sky"></div>
            <div class="skyline"></div>
            ${this.side === 'back' ? '<div class="dumpster"><span>TRASH</span></div>' : '<div class="string-lights"></div>'}
            <div class="ground"></div>
            <div class="carpet"></div>
            <div class="exit-sign">← EXIT</div>
            <div class="party-sign">${loc.sign} →</div>
            <div class="queue" data-r="queue"></div>
          </div>
          <div class="bouncer-rig">
            <div class="flipper">
              <div class="face face-front">${renderAvatar(this.player)}</div>
              <div class="face face-back">${renderAvatar(this.player, { back: true })}</div>
            </div>
          </div>
          <div class="wand" data-r="wand"></div>
          <div class="scan-result" data-r="scan"></div>
          <div class="speech" data-r="speech"></div>
          <div class="location-tag">${loc.label}</div>
        </div>
        <aside class="side">
          <div class="panel checklist">
            <h2>Checklist</h2>
            ${TOOLS.map(([id, icon, name, sub]) => `
              <button class="check-row" data-tool="${id}" disabled>
                <span class="ic">${icon}</span>
                <span class="txt"><b>${name}</b><small>${sub}</small></span>
                <span class="tick"></span>
              </button>`).join('')}
            <div class="check-row static">
              <span class="ic">🤔</span>
              <span class="txt"><b>${MIN_CHATS}+ TAMID Chats?</b><small>No way to know for sure. Ask, then trust your gut.</small></span>
            </div>
            <details class="reqs"><summary>Who gets in?</summary><ol>${ENTRY_REQUIREMENTS.map(r => `<li>${r}</li>`).join('')}</ol></details>
          </div>
          <div class="actions">
            <button class="btn deny" data-r="deny" disabled>← Deny <kbd>${keys.deny}</kbd></button>
            <button class="btn admit" data-r="admit" disabled>Admit → <kbd>${keys.admit}</kbd></button>
          </div>
          <div class="feedback" data-r="feedback"></div>
          <div class="tool-layer" data-r="layer"></div>
        </aside>
      </div>`;
    this.r = {};
    el.querySelectorAll('[data-r]').forEach(n => { this.r[n.dataset.r] = n; });
    this.r.admit.addEventListener('click', () => this.decide(true));
    this.r.deny.addEventListener('click', () => this.decide(false));
    el.querySelectorAll('.check-row[data-tool]').forEach(b =>
      b.addEventListener('click', () => this.useTool(b.dataset.tool)));
    return el;
  }

  later(fn, ms) { setTimeout(() => { if (this.alive) fn(); }, ms); }
  stop() { this.alive = false; }
  get pct() { return this.correct / this.guests.length; }
  get current() { return this.guests[this.index]; }

  // ----- camera + line -----
  start() {
    this.updateStats();
    this.qEls = this.guests.map((g, i) => {
      const p = document.createElement('div');
      p.className = 'qp';
      p.innerHTML = renderAvatar(g.look);
      this.r.queue.appendChild(p);
      this.place(p, slotPos(i));
      return p;
    });
    // camera starts in front of the bouncer, then swings around behind them
    this.later(() => this.r.scene.classList.replace('cam-front', 'cam-behind'), 500);
    this.later(() => this.nextGuest(), 2600);
  }

  place(p, pos) {
    p.style.left = pos.left + '%';
    p.style.bottom = pos.bottom + '%';
    p.style.transform = `translateX(-50%) scale(${pos.scale})`;
    p.style.zIndex = pos.z;
    p.style.filter = `brightness(${pos.dim})`;
  }

  nextGuest() {
    this.used.clear();
    this.el.querySelectorAll('.check-row').forEach(r => r.classList.remove('done'));
    this.r.scan.className = 'scan-result';
    for (let i = this.index; i < this.guests.length; i++) {
      const p = this.qEls[i];
      p.classList.add('walking');
      this.place(p, slotPos(i - this.index - 1));
    }
    this.later(() => {
      this.qEls.forEach(p => p.classList.remove('walking'));
      const g = this.current;
      this.say(pick([`Hey! I'm ${g.id.name.split(' ')[0]}.`, "I'm on the list!", 'Is this the TAMID Mixer?', 'Hi! Can I get in?']));
      this.busy = false;
      this.setControls(true);
    }, 1100);
  }

  updateStats() {
    const n = this.guests.length;
    this.r.guest.textContent = Math.min(this.index + 1, n);
    this.r.correct.textContent = this.correct;
    this.r.acc.textContent = this.index ? `${Math.round((this.correct / this.index) * 100)}%` : '–';
  }

  setControls(on) {
    this.r.admit.disabled = !on;
    this.r.deny.disabled = !on;
    this.el.querySelectorAll('.check-row[data-tool]').forEach(b => { b.disabled = !on; });
  }

  say(text) {
    this.r.speech.textContent = text;
    this.r.speech.classList.toggle('show', !!text);
  }

  markUsed(tool) {
    this.used.add(tool);
    this.el.querySelector(`.check-row[data-tool="${tool}"]`)?.classList.add('done');
  }

  // ----- tools -----
  useTool(tool) {
    if (this.busy || this.done) return;
    this.markUsed(tool);
    if (tool === 'detector') return this.runDetector();
    if (tool === 'id') return this.openLayer(this.idView());
    if (tool === 'phone') return this.openLayer(this.phoneView());
    if (tool === 'ask') return this.openLayer(this.askView());
  }

  openLayer(node) {
    const layer = this.r.layer;
    layer.innerHTML = '';
    const back = document.createElement('button');
    back.className = 'btn small layer-back';
    back.textContent = '← Back to checklist';
    back.addEventListener('click', () => this.closeLayer());
    layer.append(back, node);
    layer.classList.add('open');
  }

  closeLayer() {
    this.r.layer.classList.remove('open');
    this.r.layer.innerHTML = '';
  }

  idView() {
    const g = this.current, id = g.id;
    const wrap = document.createElement('div');
    wrap.className = 'id-view';
    wrap.innerHTML = `
      <div class="idcard">
        <div class="id-top"><span>${id.origin.toUpperCase()}</span><span>${id.kind.toUpperCase()}</span></div>
        <div class="id-main">
          <div class="id-photo">${renderAvatar(id.photo, { head: true })}</div>
          <dl>
            <dt>Name</dt><dd>${id.name}</dd>
            <dt>Date of birth</dt><dd>${fmtDate(id.dob)}</dd>
            <dt>${id.originType}</dt><dd>${id.origin}</dd>
            <dt>ID number</dt><dd>${id.idNumber}</dd>
          </dl>
        </div>
        ${id.real ? `<div class="uv-layer">${UV_PATTERN}</div>` : ''}
      </div>
      <button class="btn small uv-btn">🔦 Black light: OFF</button>
      <p class="hint">A real ID shows a glowing seal and wave pattern under black light. A fake shows nothing.</p>
      <div class="compare"><div class="compare-photo">${renderAvatar(g.look, { head: true })}</div><span>The person standing<br>in front of you</span></div>`;
    const btn = wrap.querySelector('.uv-btn');
    btn.addEventListener('click', () => {
      const on = wrap.querySelector('.idcard').classList.toggle('uv');
      btn.textContent = `🔦 Black light: ${on ? 'ON' : 'OFF'}`;
      btn.classList.toggle('on', on);
    });
    return wrap;
  }

  phoneView() {
    const wrap = document.createElement('div');
    wrap.className = 'phone';
    wrap.innerHTML = `<div class="phone-notch"></div><div class="phone-screen"></div>`;
    const screen = wrap.querySelector('.phone-screen');

    const showList = (query = '') => {
      screen.innerHTML = `
        <div class="app-head"><span class="app-logo">TAMID</span> Members</div>
        <input class="app-search" placeholder="Search a name…" value="${esc(query)}">
        <ul class="member-list"></ul>`;
      const input = screen.querySelector('.app-search');
      const list = screen.querySelector('.member-list');
      const render = q => {
        const hits = this.roster.filter(m => m.name.toLowerCase().includes(q.trim().toLowerCase()));
        list.innerHTML = hits.length
          ? hits.map(m => `<li><button data-name="${m.name}"><span class="mini">${renderAvatar(m.look, { head: true })}</span><span><b>${m.name}</b><small>${m.year} · ${m.major}</small></span></button></li>`).join('')
          : '<li class="no-results">No members found</li>';
        list.querySelectorAll('button').forEach(b => b.addEventListener('click', () =>
          showProfile(this.roster.find(m => m.name === b.dataset.name), input.value)));
      };
      input.addEventListener('input', () => render(input.value));
      render(query);
      input.focus();
    };

    const showProfile = (m, query) => {
      screen.innerHTML = `
        <button class="app-back">‹ Members</button>
        <div class="profile">
          <div class="profile-photo">${renderAvatar(m.look, { head: true })}</div>
          <h3>${m.name}</h3>
          <p class="member-tag">TAMID member</p>
          <dl>
            <dt>Date of birth</dt><dd>${fmtDate(m.dob)}</dd>
            <dt>From</dt><dd>${m.origin}</dd>
            <dt>Year</dt><dd>${m.year}</dd>
            <dt>Major</dt><dd>${m.major}</dd>
          </dl>
          <p class="about">${m.description}</p>
        </div>`;
      screen.querySelector('.app-back').addEventListener('click', () => showList(query));
    };

    showList();
    return wrap;
  }

  askView() {
    const g = this.current;
    const wrap = document.createElement('div');
    wrap.className = 'ask-view';
    wrap.innerHTML = `<h3>Ask ${g.id.name.split(' ')[0]}…</h3>
      <div class="questions">${QUESTIONS.map(([k, q]) => `<button class="chip" data-q="${k}">${q}</button>`).join('')}</div>
      <div class="transcript"></div>`;
    const log = wrap.querySelector('.transcript');
    wrap.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
      const answer = g.answers[b.dataset.q];
      this.say(answer);
      log.insertAdjacentHTML('afterbegin', `<p><b>You:</b> ${b.textContent}</p><p class="ans"><b>Them:</b> ${answer}</p>`);
    }));
    return wrap;
  }

  runDetector() {
    if (this.scanning) return;
    this.scanning = true;
    this.closeLayer();
    this.say('');
    const wand = this.r.wand, scan = this.r.scan;
    scan.className = 'scan-result';
    wand.className = 'wand sweeping';
    this.later(() => {
      wand.className = 'wand';
      this.scanning = false;
      const w = this.current.weapon;
      scan.innerHTML = w
        ? `<span class="weapon-icon">${WEAPON_ICONS[w]}</span><span><b>BEEP BEEP!</b> Found ${WEAPONS[w]}!</span>`
        : '<span class="ok">✓</span><span><b>All clear.</b> No metal detected.</span>';
      scan.className = `scan-result show ${w ? 'alert' : 'clear'}`;
    }, 1600);
  }

  // ----- decision -----
  decide(admit) {
    if (this.busy || this.done || !this.alive || this.scanning) return;
    this.busy = true;
    this.setControls(false);
    this.closeLayer();
    this.say('');
    this.r.scan.className = 'scan-result';

    const g = this.current;
    const right = admit === g.shouldAdmit;
    if (right) this.correct++;
    else this.mistakes.push({ name: g.id.name, admitted: admit, why: g.reason });

    this.r.feedback.className = `feedback show ${right ? 'good' : 'bad'}`;
    this.r.feedback.textContent = `${right ? '✓ Correct' : '✗ Wrong'}: ${g.reason}`;

    const p = this.qEls[this.index];
    p.classList.add('walking', 'leaving');
    p.style.left = admit ? '118%' : '-20%';

    this.index++;
    this.updateStats();

    this.later(() => {
      p.remove();
      if (this.index < this.guests.length) return this.nextGuest();
      this.done = true;
      this.onDone(this);
    }, 1700);
  }
}

function stopStations() {
  stations.forEach(s => s.stop());
  stations = [];
}

function startGame(newMode) {
  mode = newMode;
  stopStations();
  const shift = generateShift(); // same line + member list for both bouncers
  const box = $('stations');
  box.innerHTML = '';
  box.className = `stations ${mode}`;

  if (mode === 'single') {
    $('mode-label').textContent = 'Single player';
    stations = [new Station({
      player: player1, side: 'front', title: 'Front of the house',
      keys: { deny: '←', admit: '→' }, shift, onDone: showSingleResult,
    })];
  } else {
    $('mode-label').textContent = 'Bouncer vs Bouncer';
    const onDone = s => {
      if (stations.every(st => st.done)) return showVersusResult();
      s.r.feedback.className = 'feedback show wait';
      s.r.feedback.textContent = 'Shift over! Waiting for the other bouncer to finish…';
    };
    stations = [
      new Station({ player: player1, side: 'front', title: 'Player 1 · Front of the house',
        keys: { deny: 'A', admit: 'D' }, shift, onDone }),
      new Station({ player: player2, side: 'back', title: 'Player 2 · Back of the house',
        keys: { deny: '←', admit: '→' }, shift, onDone }),
    ];
  }
  stations.forEach(s => box.appendChild(s.el));
  if (mode === 'versus') box.insertAdjacentHTML('beforeend', '<div class="vs-badge">VS</div>');
  showScreen('screen-game');
  stations.forEach(s => s.start());
}

function mistakeList(s) {
  return s.mistakes.map(m =>
    `<li><b>${m.name}</b>: you ${m.admitted ? 'admitted' : 'denied'} them. ${m.why}</li>`).join('');
}

function showSingleResult(s) {
  const win = s.pct >= WIN_THRESHOLD;
  $('result-title').textContent = win ? 'You win! The party is safe.' : 'You lose. Bad night at the door.';
  $('result-title').className = win ? 'win' : 'lose';
  $('result-score').textContent = `${Math.round(s.pct * 100)}%`;
  $('result-detail').innerHTML =
    `<p>You judged ${s.correct} of ${s.guests.length} guests correctly. You needed ${Math.round(WIN_THRESHOLD * 100)}%.</p>`;
  $('result-mistakes').innerHTML = mistakeList(s);
  $('result').classList.remove('hidden');
  Music.play(win ? 'win' : 'lose');
}

function showVersusResult() {
  const [a, b] = stations;
  const pa = Math.round(a.pct * 100), pb = Math.round(b.pct * 100);
  const winner = pa === pb ? null : (pa > pb ? a : b);
  $('result-title').textContent = winner ? `${winner.player.name} wins!` : "It's a tie!";
  $('result-title').className = winner ? 'win' : '';
  $('result-score').innerHTML = `${pa}% <span class="vs-small">vs</span> ${pb}%`;
  const row = (s, label) => `
    <div class="versus-row ${s === winner ? 'winner' : ''}">
      <strong>${esc(s.player.name)}</strong> <small>${label}</small>
      <span>${s.correct}/${s.guests.length} correct</span>
      ${s.mistakes.length ? `<ul>${mistakeList(s)}</ul>` : '<p class="perfect">No mistakes!</p>'}
    </div>`;
  $('result-detail').innerHTML = `<div class="versus-results">${row(a, 'Front of the house')}${row(b, 'Back of the house')}</div>`;
  $('result-mistakes').innerHTML = '';
  $('result').classList.remove('hidden');
  Music.play('win');
}

// ---------- controls ----------
document.addEventListener('keydown', e => {
  if (!$('screen-game').classList.contains('active') || !$('result').classList.contains('hidden')) return;
  if (e.target.matches('input, textarea')) return; // typing in the member-list search
  const k = e.key.toLowerCase();
  if (mode === 'single') {
    if (k === 'arrowright' || k === 'd') stations[0]?.decide(true);
    if (k === 'arrowleft' || k === 'a') stations[0]?.decide(false);
  } else {
    if (k === 'd') stations[0]?.decide(true);
    if (k === 'a') stations[0]?.decide(false);
    if (k === 'arrowright') stations[1]?.decide(true);
    if (k === 'arrowleft') stations[1]?.decide(false);
  }
  if (k.startsWith('arrow')) e.preventDefault();
});

$('btn-edit').addEventListener('click', () => {
  openCreator(player1, {
    title: 'Edit your bouncer',
    submit: 'Save →',
    onDone: p => { player1 = p; savePlayer(1, p); showModeSelect(); },
  });
});
$('btn-mode').addEventListener('click', showModeSelect);
$('btn-again').addEventListener('click', () => startGame(mode));
$('btn-menu').addEventListener('click', () => { refreshStartNote(); showScreen('screen-start'); });

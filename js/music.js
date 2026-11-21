// ============================================================
//  THEME MUSIC — generated live with the Web Audio API (no audio files).
//
//  Every screen has its own looping track. Music.play(id) crossfades
//  to a new track. Browsers block sound until the player clicks or
//  presses a key, so the first track starts on the first interaction.
//
//  Track format: 16 steps per bar, one chord per bar.
//    patterns: 'x' = hit on that step, '.' = nothing
//    lead: one string per bar, 16 tokens: a note (e.g. 'C5', 'F#4', 'Bb4'),
//          '-' = hold the previous note, '.' = rest
// ============================================================

const TRACKS = {
  start: {
    name: 'Neon Doors', bpm: 104, filter: 4000,
    chords: [['A2', 'min'], ['F2', 'maj'], ['C3', 'maj'], ['G2', 'maj']],
    kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.',
    bass: 'x..x..x.x..x..x.', arp: 'x.x.x.x.x.x.x.x.', pad: true, leadWave: 'triangle',
    lead: [
      'E5 - - . C5 - D5 - E5 - - . A4 - - .',
      'F5 - - . E5 - C5 - A4 - - . . . . .',
      'G5 - - . E5 - C5 - E5 - G5 - - . . .',
      'D5 - - . B4 - G4 - B4 - D5 - - . . .',
    ],
  },
  create: {
    name: 'Dressing Room', bpm: 84, filter: 2200,
    chords: [['F2', 'maj7'], ['E2', 'min7'], ['D2', 'min7'], ['C2', 'maj7']],
    kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
    bass: 'x.......x.....x.', arp: 'x...x...x...x...', arpWave: 'sine', pad: true, leadWave: 'sine', soft: true,
    lead: [
      'A4 - - - C5 - - . E5 - - - . . . .',
      'G4 - - - B4 - - . D5 - - - . . . .',
      'F4 - - - A4 - - . C5 - - - . . . .',
      'E4 - - - G4 - - . B4 - - - . . . .',
    ],
  },
  mode: {
    name: 'Choose Your Shift', bpm: 116, filter: 5000,
    chords: [['C3', 'maj'], ['G2', 'maj'], ['A2', 'min'], ['F2', 'maj']],
    kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
    bass: 'x.x.x.x.x.x.x.x.', arp: '', pad: true, leadWave: 'square',
    lead: [
      'C5 . E5 . G5 . E5 . C5 . E5 . G5 - - .',
      'B4 . D5 . G5 . D5 . B4 . D5 . G5 - - .',
      'C5 . E5 . A5 . E5 . C5 . E5 . A5 - - .',
      'A4 . C5 . F5 . C5 . G5 - - . . . . .',
    ],
  },
  game: {
    // muffled, like hearing the club through the door
    name: 'At the Door', bpm: 122, filter: 1500,
    chords: [['D2', 'min'], ['D2', 'min'], ['Bb1', 'maj'], ['C2', 'maj']],
    kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.',
    bass: 'x.xx..x.x.xx..x.', arp: '', pad: true, leadWave: 'square',
    lead: [
      'D5 - . D5 . . F5 - . . E5 - D5 - . .',
      'A4 - . . . . . . C5 - . D5 - - . .',
      'Bb4 - . Bb4 . . D5 - . . C5 - Bb4 - . .',
      'C5 - . . E5 - . . G5 - - - F5 - E5 -',
    ],
  },
  versus: {
    name: 'Bouncer Showdown', bpm: 132, filter: 3200,
    chords: [['E2', 'min'], ['C2', 'maj'], ['G2', 'maj'], ['D2', 'maj']],
    kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'xxx.xxx.xxx.xxx.',
    bass: 'x.x.x.x.x.x.x.x.', arp: 'xxxxxxxxxxxxxxxx', pad: false, leadWave: 'sawtooth',
    lead: [
      'E5 . E5 . G5 . E5 . B5 - - . A5 . G5 .',
      'E5 . E5 . G5 . E5 . C6 - - . B5 . G5 .',
      'D5 . D5 . G5 . D5 . B5 - - . A5 . G5 .',
      'F#5 . F#5 . A5 . F#5 . D6 - - - - - . .',
    ],
  },
  win: {
    name: "Party's Safe", bpm: 120, filter: 6000,
    chords: [['C3', 'maj'], ['F2', 'maj'], ['G2', 'maj'], ['C3', 'maj']],
    kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.',
    bass: 'x...x...x...x...', arp: 'x.x.x.x.x.x.x.x.', pad: true, leadWave: 'square',
    lead: [
      'C5 . E5 . G5 . C6 - - - - . G5 . C6 .',
      'A5 - - . F5 - - . A5 . C6 . A5 - - .',
      'B5 - - . G5 - - . D6 . B5 . G5 - - .',
      'C6 - - - - - - . . . . . . . . .',
    ],
  },
  lose: {
    name: 'Bad Night', bpm: 70, filter: 1800,
    chords: [['A2', 'min'], ['D2', 'min'], ['E2', 'maj'], ['A2', 'min']],
    kick: 'x.......x.......', snare: '', hat: '',
    bass: 'x.......x.......', arp: '', pad: true, leadWave: 'sine', soft: true,
    lead: [
      'E5 - - - D5 - - - C5 - - - B4 - - -',
      'A4 - - - F4 - - - A4 - - - D5 - - -',
      'B4 - - - G#4 - - - E4 - - - G#4 - - -',
      'A4 - - - - - - - . . . . . . . .',
    ],
  },
};

const Music = (() => {
  const CHORD = { maj: [0, 4, 7], min: [0, 3, 7], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10] };
  const VOLUME = 0.5;
  const MUTE_KEY = 'tamidMixer.muted';

  let ctx = null, master = null, noise = null, timer = null;
  let current = null;   // playing track instance
  let desired = null;   // track id we want (kept until audio is unlocked)
  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch { /* storage blocked */ }

  const midi = name => {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    return base + (Number(m[3]) + 1) * 12;
  };
  const freq = n => 440 * Math.pow(2, (n - 69) / 12);

  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : VOLUME;
    master.connect(comp).connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    timer = setInterval(schedule, 25);
  }

  // ----- instruments -----
  function tone(dest, f, t, dur, wave, vol, attack = 0.01) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function kick(dest, t, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(g).connect(dest);
    o.start(t); o.stop(t + 0.3);
  }
  function noiseHit(dest, t, vol, dur, type, cutoff) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise; f.type = type; f.frequency.value = cutoff;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t); src.stop(t + dur + 0.02);
  }

  // ----- sequencer -----
  function startTrack(id) {
    const def = TRACKS[id];
    const out = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = def.filter;
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.8);
    out.connect(filter).connect(master);
    const lead = def.lead.map(bar => bar.trim().split(/\s+/));
    return { id, def, out, lead, step: 0, next: ctx.currentTime + 0.1, arpIdx: 0 };
  }

  function stopTrack(tr) {
    tr.stopped = true;
    tr.out.gain.cancelScheduledValues(ctx.currentTime);
    tr.out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
    setTimeout(() => tr.out.disconnect(), 2000);
  }

  function playStep(tr, t) {
    const { def, out } = tr;
    const stepDur = 60 / def.bpm / 4;
    const s = tr.step % 16;
    const bar = Math.floor(tr.step / 16) % def.chords.length;
    const [rootName, quality] = def.chords[bar];
    const root = midi(rootName);
    const tones = CHORD[quality];
    const soft = def.soft ? 0.6 : 1;
    const hit = p => p && p[s] === 'x';

    if (hit(def.kick)) kick(out, t, 0.55 * soft);
    if (hit(def.snare)) { noiseHit(out, t, 0.2 * soft, 0.15, 'bandpass', 1800); tone(out, 190, t, 0.08, 'triangle', 0.08 * soft); }
    if (hit(def.hat)) noiseHit(out, t, 0.05 * soft, 0.04, 'highpass', 7000);
    if (hit(def.bass)) tone(out, freq(root), t, stepDur * 1.8, 'sawtooth', 0.13 * soft);
    if (hit(def.arp)) {
      const n = root + 24 + tones[tr.arpIdx++ % tones.length];
      tone(out, freq(n), t, stepDur * 0.9, def.arpWave || 'square', 0.035 * soft);
    }
    if (def.pad && s === 0) {
      tones.forEach(iv => tone(out, freq(root + 12 + iv), t, stepDur * 16, 'triangle', 0.03, 0.08));
    }
    const tokens = tr.lead[bar % tr.lead.length];
    const tok = tokens[s];
    if (tok && tok !== '.' && tok !== '-') {
      let len = 1;
      while (tokens[s + len] === '-') len++;
      tone(out, freq(midi(tok)), t, stepDur * len * 0.95, def.leadWave || 'square', 0.07 * soft);
    }
  }

  function schedule() {
    const tr = current;
    if (!tr || tr.stopped) return;
    const stepDur = 60 / tr.def.bpm / 4;
    while (tr.next < ctx.currentTime + 0.12) {
      playStep(tr, tr.next);
      tr.next += stepDur;
      tr.step++;
    }
  }

  function switchTo(id) {
    if (current && current.id === id) return;
    if (current) stopTrack(current);
    current = startTrack(id);
    showNowPlaying(TRACKS[id].name);
  }

  // ----- public -----
  function play(id) {
    if (!TRACKS[id]) return;
    desired = id;
    if (ctx && ctx.state === 'running') switchTo(id);
  }

  // Browsers only allow audio after a user gesture.
  function unlock() {
    if (!ctx) init();
    if (ctx.state !== 'running') ctx.resume().then(() => desired && switchTo(desired));
    else if (desired) switchTo(desired);
  }
  ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, unlock, { capture: true }));

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* storage blocked */ }
    if (master) master.gain.setTargetAtTime(m ? 0 : VOLUME, ctx.currentTime, 0.05);
    renderToggle();
  }

  function renderToggle() {
    const b = document.getElementById('music-toggle');
    if (!b) return;
    b.textContent = muted ? '🔇 Music off' : '🔊 Music on';
    b.setAttribute('aria-pressed', String(!muted));
  }

  let toastTimer = null;
  function showNowPlaying(name) {
    const el = document.getElementById('now-playing');
    if (!el || muted) return;
    el.textContent = `♪ Now playing: ${name}`;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderToggle();
    document.getElementById('music-toggle')?.addEventListener('click', () => setMuted(!muted));
  });
  renderToggle();

  return { play, setMuted, get muted() { return muted; } };
})();

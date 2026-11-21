// ============================================================
//  Avatar options + SVG renderer (used for the bouncer AND guests)
// ============================================================

const SKIN_TONES = ['#f8dcc8', '#eab995', '#c98d62', '#8f5b3b', '#5a3824'];

const HAIR_COLORS = {
  brown: '#6b4226',
  black: '#1f1a17',
  red: '#b4421f',
  blonde: '#e2bf6a',
};

const TOPS = {
  tee:    { label: 'TAMID Tee',    color: '#1c2d55', tamid: true },
  hoodie: { label: 'TAMID Hoodie', color: '#3f86d6', tamid: true },
  dress:  { label: 'TAMID Dress',  color: '#2753a8', tamid: true },
  plain:  { label: 'Plain shirt',  color: '#888888', tamid: false }, // guests only
};

// Option groups shown on the customization screen.
const AVATAR_OPTIONS = [
  { key: 'gender', label: 'Gender', choices: [
    ['female', 'Female'], ['male', 'Male'], ['nonbinary', 'Non-binary'] ] },
  { key: 'skin', label: 'Skin tone', swatch: true, choices:
    SKIN_TONES.map((c, i) => [i, c]) },
  { key: 'hairColor', label: 'Hair color', swatch: true, choices:
    Object.entries(HAIR_COLORS).map(([k, c]) => [k, c, k]) },
  { key: 'hairTexture', label: 'Hair texture', choices: [
    ['straight', 'Straight'], ['wavy', 'Wavy'], ['curly', 'Curly'] ] },
  { key: 'hairStyle', label: 'Hairstyle', choices: [
    ['down', 'Hair down'], ['ponytail', 'Ponytail'], ['bun', 'Bun'], ['pixie', 'Pixie cut'] ] },
  { key: 'top', label: 'TAMID top / dress', choices: [
    ['tee', 'TAMID Tee'], ['hoodie', 'TAMID Hoodie'], ['dress', 'TAMID Dress'] ] },
  { key: 'bottom', label: 'Bottoms', choices: [
    ['jeans', 'Jeans'], ['skirt', 'Skirt'] ] },
  { key: 'shoes', label: 'Shoes', choices: [
    ['sneakers', 'Sneakers'], ['heels', 'Heels'] ] },
];

const DEFAULT_AVATAR = {
  name: 'Bouncer', gender: 'female', skin: 1, hairColor: 'black',
  hairTexture: 'straight', hairStyle: 'ponytail',
  top: 'tee', bottom: 'jeans', shoes: 'sneakers',
};

// ---------- hair helpers ----------
function circlesAlong(points, r, fill) {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join('');
}

function hairBack(a, c) {
  const curly = a.hairTexture === 'curly';
  const wavy = a.hairTexture === 'wavy';
  switch (a.hairStyle) {
    case 'down': {
      if (curly) {
        const pts = [];
        for (let y = 34; y <= 104; y += 10) pts.push([36, y], [84, y]);
        for (let x = 44; x <= 76; x += 8) pts.push([x, 108]);
        return `<path d="M38,44 Q38,20 60,20 Q82,20 82,44 L84,106 Q60,112 36,106Z" fill="${c}"/>` + circlesAlong(pts, 8, c);
      }
      if (wavy) {
        return `<path d="M39,44 Q38,20 60,20 Q82,20 81,44 Q88,58 82,70 Q88,84 82,96 Q87,104 84,110 Q72,106 60,112 Q48,106 36,110 Q33,104 38,96 Q32,84 38,70 Q32,58 39,44Z" fill="${c}"/>`;
      }
      return `<path d="M39,44 Q38,20 60,20 Q82,20 81,44 L84,108 Q60,113 36,108Z" fill="${c}"/>`;
    }
    case 'ponytail': {
      if (curly) {
        return circlesAlong([[80, 38], [86, 48], [88, 58], [87, 68], [86, 78], [88, 88], [84, 96]], 7, c);
      }
      const tail = wavy
        ? 'M74,34 Q96,40 90,56 Q96,68 88,80 Q94,92 90,102 Q80,96 82,82 Q76,70 82,58 Q80,46 72,42Z'
        : 'M74,34 Q98,42 90,68 Q86,90 92,104 Q78,96 80,70 Q82,52 72,42Z';
      return `<path d="${tail}" fill="${c}"/>`;
    }
    case 'bun':
      return curly
        ? circlesAlong([[54, 22], [66, 22], [60, 15], [60, 26], [53, 15], [67, 15]], 6, c)
        : `<circle cx="60" cy="20" r="11" fill="${c}"/>` +
          (wavy ? `<path d="M50,20 Q60,12 70,20" stroke="rgba(0,0,0,.25)" stroke-width="1.5" fill="none"/>` : '');
    default:
      return '';
  }
}

function hairFront(a, c) {
  const curly = a.hairTexture === 'curly';
  const wavy = a.hairTexture === 'wavy';
  const tied = a.hairStyle === 'ponytail' || a.hairStyle === 'bun';

  if (a.hairStyle === 'pixie') {
    if (curly) {
      const pts = [];
      for (let i = 0; i <= 9; i++) {
        const t = Math.PI + (i * Math.PI) / 9;
        pts.push([+(60 + 20 * Math.cos(t)).toFixed(1), +(42 + 16 * Math.sin(t)).toFixed(1)]);
      }
      return `<path d="M40,46 Q38,24 60,24 Q82,24 80,46 Q72,34 60,34 Q48,34 40,46Z" fill="${c}"/>` + circlesAlong(pts, 5, c);
    }
    return `<path d="M39,48 Q36,23 60,23 Q85,23 81,46 Q78,35 66,33 ${wavy ? 'Q58,40 52,36 Q46,40' : 'Q52,40'} 39,48Z" fill="${c}"/>`;
  }

  if (curly) {
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const t = Math.PI + (i * Math.PI) / 10;
      pts.push([+(60 + 20 * Math.cos(t)).toFixed(1), +(43 + 17 * Math.sin(t)).toFixed(1)]);
    }
    return `<path d="M40,48 Q38,24 60,24 Q82,24 80,48 Q74,35 60,35 Q46,35 40,48Z" fill="${c}"/>` + circlesAlong(pts, tied ? 5 : 6.5, c);
  }
  if (tied) {
    return `<path d="M40,48 Q38,24 60,24 Q82,24 80,48 Q76,32 60,31 Q44,32 40,48Z" fill="${c}"/>`;
  }
  if (wavy) {
    return `<path d="M39,52 Q37,24 60,24 Q83,24 81,52 Q78,42 72,39 Q66,44 60,37 Q54,44 48,39 Q42,42 39,52Z" fill="${c}"/>`;
  }
  return `<path d="M40,50 Q38,24 60,24 Q82,24 80,50 Q74,35 60,35 Q46,35 40,50Z" fill="${c}"/>`;
}

// Back-of-head hair (used when the camera is behind someone).
function hairFromBehind(a, c) {
  const curly = a.hairTexture === 'curly';
  const wavy = a.hairTexture === 'wavy';
  const nape = a.hairStyle === 'pixie' ? 58 : 63;
  let s = `<path d="M39,44 Q39,23 60,23 Q81,23 81,44 Q81,${nape} 60,${nape + 2} Q39,${nape} 39,44Z" fill="${c}"/>`;
  if (curly) {
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const t = (i / 14) * Math.PI * 2;
      pts.push([+(60 + 20 * Math.cos(t)).toFixed(1), +(44 + 19 * Math.sin(t)).toFixed(1)]);
    }
    s += circlesAlong(pts, a.hairStyle === 'pixie' ? 4.5 : 6, c);
  }
  if (a.hairStyle === 'down' || a.hairStyle === 'bun') s += hairBack(a, c);
  if (a.hairStyle === 'ponytail') {
    s += curly
      ? circlesAlong([[60, 54], [60, 64], [61, 74], [59, 84], [60, 94]], 7, c)
      : `<path d="${wavy
        ? 'M55,50 Q60,46 65,50 Q69,60 64,70 Q69,82 63,94 Q60,100 57,94 Q52,82 57,70 Q51,60 55,50Z'
        : 'M55,50 Q60,46 65,50 Q68,74 63,98 Q60,102 57,98 Q52,74 55,50Z'}" fill="${c}"/>`;
    s += `<rect x="55" y="49" width="10" height="4" rx="2" fill="#ff5fa2"/>`;
  }
  return s;
}

// ---------- full avatar ----------
// opts.back  -> draw from behind (camera behind the bouncer)
// opts.head  -> crop to the head and shoulders (ID photos, member list)
function renderAvatar(a, opts = {}) {
  a = { ...DEFAULT_AVATAR, ...a };
  const skin = SKIN_TONES[a.skin] ?? SKIN_TONES[1];
  const hair = HAIR_COLORS[a.hairColor] || HAIR_COLORS.brown;
  const sw = a.gender === 'male' ? 24 : 20;
  const L = 60 - sw, R = 60 + sw;
  const topDef = TOPS[a.top] || TOPS.tee;
  const tc = a.top === 'plain' ? (a.topColor || topDef.color) : topDef.color;
  const isDress = a.top === 'dress';
  const logo = (y, size = 9) =>
    `<text x="60" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${size}" fill="#fff" letter-spacing=".5">TAMID</text>`;

  let s = '';
  s += hairBack(a, hair);

  // legs
  s += `<rect x="45" y="128" width="13" height="74" rx="5" fill="${skin}"/>`;
  s += `<rect x="62" y="128" width="13" height="74" rx="5" fill="${skin}"/>`;

  // shoes
  if (a.shoes === 'heels') {
    const hc = '#a8173f';
    s += `<path d="M44,198 h14 v6 q-7,0 -14,3z" fill="${hc}"/><rect x="56" y="203" width="2.2" height="8" fill="${hc}"/>`;
    s += `<path d="M62,198 h14 v6 q-7,0 -14,3z" fill="${hc}" transform="translate(138,0) scale(-1,1)"/><rect x="61.8" y="203" width="2.2" height="8" fill="${hc}"/>`;
  } else {
    s += `<rect x="41" y="198" width="19" height="10" rx="4" fill="#f5f5f5" stroke="#bbb"/>`;
    s += `<rect x="60" y="198" width="19" height="10" rx="4" fill="#f5f5f5" stroke="#bbb"/>`;
    s += `<rect x="41" y="204" width="19" height="2" fill="#d44"/><rect x="60" y="204" width="19" height="2" fill="#d44"/>`;
  }

  // bottoms
  if (!isDress) {
    if (a.bottom === 'skirt') {
      s += `<path d="M43,126 L77,126 L86,170 L34,170Z" fill="${a.bottomColor || '#2a2a33'}"/>`;
    } else {
      s += `<path d="M43,126 H77 L76,200 H62 L60,146 L58,200 H44Z" fill="${a.bottomColor || '#3d5a8a'}"/>`;
      s += `<path d="M60,130 V146" stroke="rgba(0,0,0,.3)" stroke-width="1"/>`;
    }
  }

  // arms + hands
  s += `<rect x="${L - 8}" y="76" width="9" height="60" rx="4.5" fill="${skin}"/>`;
  s += `<rect x="${R - 1}" y="76" width="9" height="60" rx="4.5" fill="${skin}"/>`;

  // top
  const torso = `M${L},76 Q60,70 ${R},76 L${R - 3},130 L${L + 3},130Z`;
  if (isDress) {
    s += `<path d="M${L + 2},76 Q60,70 ${R - 2},76 L${R - 5},116 L${R + 8},174 L${L - 8},174 L${L + 5},116Z" fill="${tc}"/>`;
    s += `<rect x="${L + 4}" y="113" width="${2 * sw - 8}" height="5" fill="#9fd0ff"/>`;
    if (!opts.back) s += logo(100, 8);
  } else if (a.top === 'hoodie') {
    s += `<rect x="${L - 9}" y="74" width="11" height="60" rx="5" fill="${tc}"/>`;
    s += `<rect x="${R - 2}" y="74" width="11" height="60" rx="5" fill="${tc}"/>`;
    s += `<path d="${torso}" fill="${tc}"/>`;
    s += `<path d="M46,73 Q60,88 74,73" stroke="#2b6bb3" stroke-width="5" fill="none"/>`;
    if (opts.back) {
      s += `<path d="M45,74 Q60,100 75,74Z" fill="#2b6bb3"/>`;
    } else {
      s += `<path d="M56,80 V92 M64,80 V92" stroke="#fff" stroke-width="1.2"/>`;
      s += `<rect x="48" y="112" width="24" height="12" rx="4" fill="#2b6bb3"/>`;
      s += logo(104);
    }
  } else {
    s += `<rect x="${L - 9}" y="74" width="12" height="20" rx="5" fill="${tc}"/>`;
    s += `<rect x="${R - 3}" y="74" width="12" height="20" rx="5" fill="${tc}"/>`;
    s += `<path d="${torso}" fill="${tc}"/>`;
    if (!opts.back) {
      s += `<path d="M53,73 Q60,80 67,73" stroke="rgba(0,0,0,.25)" stroke-width="2" fill="none"/>`;
      if (topDef.tamid) s += logo(102);
    }
  }
  if (opts.back) {
    s += `<text x="60" y="${isDress ? 98 : 108}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="7.5" fill="#fff" letter-spacing=".6">SECURITY</text>`;
  }
  // hands
  s += `<circle cx="${L - 3.5}" cy="137" r="5" fill="${skin}"/><circle cx="${R + 3.5}" cy="137" r="5" fill="${skin}"/>`;

  // neck + head
  s += `<rect x="55" y="60" width="10" height="16" fill="${skin}"/>`;
  if (opts.back) {
    s += `<circle cx="41" cy="48" r="4" fill="${skin}"/><circle cx="79" cy="48" r="4" fill="${skin}"/>`;
    s += `<circle cx="60" cy="46" r="19" fill="${skin}"/>`;
    s += hairFromBehind(a, hair);
    const vb = opts.head ? '28 10 64 78' : '0 0 120 215';
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
  }
  s += `<circle cx="41" cy="48" r="4" fill="${skin}"/><circle cx="79" cy="48" r="4" fill="${skin}"/>`;
  s += `<circle cx="60" cy="46" r="19" fill="${skin}"/>`;
  s += `<circle cx="53" cy="48" r="2.2" fill="#222"/><circle cx="67" cy="48" r="2.2" fill="#222"/>`;
  s += `<circle cx="50" cy="55" r="3" fill="#e46a6a" opacity=".25"/><circle cx="70" cy="55" r="3" fill="#e46a6a" opacity=".25"/>`;
  s += `<path d="M54,56 Q60,61 66,56" stroke="#7a3b2e" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;

  s += hairFront(a, hair);
  if (a.glasses) {
    s += `<g fill="rgba(255,255,255,.15)" stroke="#1b1b1b" stroke-width="1.6"><rect x="46.5" y="44" width="13" height="9" rx="3"/><rect x="60.5" y="44" width="13" height="9" rx="3"/></g>`;
  }

  const vb = opts.head ? '28 10 64 78' : '0 0 120 215';
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${a.name || 'character'}">${s}</svg>`;
}

// ============================================================
//  DOOR CHECKLIST, GUEST GENERATION, AND GUEST ANSWERS
//
//  A guest should be ADMITTED only if ALL of these are true:
//    1. Their ID is real (it glows under the black light)
//    2. They're on the TAMID member list, and the member-list photo
//       and date of birth match the person and their ID
//    3. The metal detector finds no weapons
//    4. They've had 12 or more TAMID Chats (the bouncer must guess)
//
//  Each guest is built from a "type" below, and each type tests a
//  different part of the checklist.
// ============================================================

const TONIGHT = new Date();
TONIGHT.setHours(0, 0, 0, 0);

const GUESTS_PER_SHIFT = 10;
const WIN_THRESHOLD = 0.7; // need 70% of decisions correct to win
const MIN_CHATS = 12;

const ENTRY_REQUIREMENTS = [
  'ID is real: it glows under the black light',
  'On the TAMID member list, with matching photo + date of birth',
  'No weapons: spear, knife, water gun, or nunchucks',
  `${MIN_CHATS}+ TAMID Chats (you'll have to guess)`,
];

const WEAPONS = {
  spear: 'a spear',
  knife: 'a knife',
  watergun: 'a water gun',
  nunchucks: 'nunchucks',
};

// ============================================================
//  THE TAMID MEMBER LIST (from the BET class slideshow)
//
//  chats: each person's number of TAMID Chats, from the
//         TAMID Chat Leaderboard Fall '26. Anyone under 12 is
//         always turned away at the door. (null = unknown, and the
//         game would make one up each shift.)
//  Looks are cartoon versions of each person's photo.
// ============================================================
const TAMID_MEMBERS = [
  { name: 'Arianna Kreider', chats: 16, skin: 0, hairColor: 'brown',  hairTexture: 'wavy',     hairStyle: 'down' },
  { name: 'Steffia George', chats: 14, skin: 2, hairColor: 'black',  hairTexture: 'straight', hairStyle: 'down' },
  { name: 'Thaddius Rozbicki', chats: 12, skin: 0, hairColor: 'brown',  hairTexture: 'curly',    hairStyle: 'pixie' },
  { name: 'Emma Swanson', chats: 12, skin: 0, hairColor: 'brown',  hairTexture: 'straight', hairStyle: 'down' },
  { name: 'Seraphim Rahardjo', chats: 14, skin: 1, hairColor: 'black',  hairTexture: 'straight', hairStyle: 'down' },
  { name: 'Ivan Lau', chats: 8, skin: 1, hairColor: 'black',  hairTexture: 'straight', hairStyle: 'pixie' },
  { name: 'Matthew Tsouknakis', chats: 12, skin: 0, hairColor: 'brown',  hairTexture: 'wavy',     hairStyle: 'pixie' },
  { name: 'Erika Alamo', chats: 44, skin: 2, hairColor: 'black',  hairTexture: 'straight', hairStyle: 'down' },
  { name: 'Breno Faleiro de Moraes', chats: 13, skin: 1, hairColor: 'brown',  hairTexture: 'curly',    hairStyle: 'pixie' },
  { name: 'Elvin Lee', chats: 15, skin: 1, hairColor: 'black',  hairTexture: 'wavy',     hairStyle: 'pixie' },
  { name: 'Lucas Kemper-Tapia', chats: 15, skin: 0, hairColor: 'black',  hairTexture: 'curly',    hairStyle: 'pixie' },
  { name: 'Zélie Saounatsos', chats: 12, skin: 1, hairColor: 'brown',  hairTexture: 'straight', hairStyle: 'down' },
  { name: 'Andrea Murzi', chats: 11, skin: 0, hairColor: 'blonde', hairTexture: 'wavy',     hairStyle: 'down' },
  { name: 'Amanda Núñez Bastos', chats: 13, skin: 1, hairColor: 'brown',  hairTexture: 'straight', hairStyle: 'down' },
  { name: 'Rebecca Griffin', chats: 16, skin: 0, hairColor: 'brown',  hairTexture: 'straight', hairStyle: 'down' },
  { name: 'Sebastian Ahumada', chats: 19, skin: 2, hairColor: 'black',  hairTexture: 'wavy',     hairStyle: 'pixie' },
  { name: 'Shirley Chen', chats: 10, skin: 1, hairColor: 'black',  hairTexture: 'straight', hairStyle: 'down' },
  { name: 'Adarsh Yhenishetty', chats: 12, skin: 3, hairColor: 'black',  hairTexture: 'wavy',     hairStyle: 'pixie' },
  { name: 'Abhinav Lenkala', chats: 10, skin: 2, hairColor: 'black',  hairTexture: 'straight', hairStyle: 'pixie', glasses: true },
  { name: 'Raquel Marino', chats: 13, skin: 1, hairColor: 'brown',  hairTexture: 'wavy',     hairStyle: 'down' },
  { name: 'Ilya Andreychenko', chats: 11, skin: 0, hairColor: 'brown',  hairTexture: 'curly',    hairStyle: 'pixie' },
];

// How often each kind of guest shows up (relative weights).
const GUEST_TYPES = {
  valid:     40, // real member, everything checks out, 12+ chats → ADMIT
  fakeId:    10, // real member but fake ID (nothing under black light) → DENY
  weapon:    12, // real member carrying a weapon → DENY
  lowChats:  12, // real member with fewer than 12 TAMID Chats → DENY
  impostor:   9, // using a member's real ID, but the face doesn't match → DENY
  notMember: 10, // real ID, but not on the member list → DENY
  sameName:   7, // same name as a member, but different person (DOB/photo differ) → DENY
};

const QUESTIONS = [
  ['name', "What's your name?"],
  ['dob', "When's your birthday?"],
  ['from', 'Where are you from?'],
  ['school', "What year are you, and what's your major?"],
  ['chats', 'How many TAMID Chats have you had?'],
];

// ---------- data pools ----------
// Names for people who are NOT in TAMID (members' names are filtered out below).
const FIRST_NAMES = ['Maya', 'Ethan', 'Priya', 'Jordan', 'Leah', 'Noah', 'Ava', 'Daniel', 'Sofia', 'Ari',
  'Chloe', 'Marcus', 'Hannah', 'Kai', 'Zoe', 'Ben', 'Nina', 'Omar', 'Talia', 'Sam', 'Grace', 'Eli',
  'Ruby', 'Leo', 'Isla', 'Dev', 'Mila', 'Jonah', 'Amara', 'Theo'];
const STATES = ['Massachusetts', 'New York', 'California', 'Texas', 'Florida', 'Illinois', 'New Jersey',
  'Pennsylvania', 'Washington', 'Georgia', 'Connecticut', 'Maryland'];
const COUNTRIES = ['Canada', 'India', 'Israel', 'United Kingdom', 'Brazil', 'South Korea', 'Mexico', 'Germany'];
const LAST_NAMES = ['Cohen', 'Patel', 'Nguyen', 'Garcia', 'Levi', 'Kim', 'Johnson', 'Shapiro', 'Rivera',
  'Brooks', 'Katz', 'Okafor', 'Silva', 'Friedman', 'Park', 'Adler', 'Moore', 'Singh', 'Rosen', 'Walsh'];
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const MAJORS = ['Finance', 'Computer Science', 'Economics', 'Marketing', 'Data Science', 'Business Analytics',
  'Mechanical Engineering', 'Psychology', 'Accounting', 'Entrepreneurship'];
const HOBBIES = ['running half-marathons', 'making latte art', 'climbing', 'thrifting', 'playing pickup basketball',
  'baking challah', 'competitive chess', 'DJing house parties', 'film photography', 'cooking way too much pasta'];
const TAMID_THINGS = ['consulting projects', 'the fund track', 'pitch nights', 'general body meetings',
  'TAMID Chats', 'the Israel trip', 'stock pitches'];
const PLAIN_COLORS = ['#c0392b', '#27ae60', '#8e44ad', '#d35400', '#7f8c8d', '#16a085', '#e84393', '#2d3436'];
const BOTTOM_COLORS = ['#3d5a8a', '#2a2a33', '#5b4636', '#2f4f4f', '#6c5b7b'];

// ---------- helpers ----------
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function chance(p) { return Math.random() < p; }
function fmtDate(d) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function weightedPick(weights) {
  const entries = Object.entries(weights);
  let r = Math.random() * entries.reduce((t, [, w]) => t + w, 0);
  for (const [k, w] of entries) { if ((r -= w) < 0) return k; }
  return entries[0][0];
}
function randomDob() {
  return new Date(TONIGHT.getFullYear() - randInt(18, 23), randInt(0, 11), randInt(1, 28));
}

function randomLook() {
  return {
    gender: pick(['female', 'male', 'nonbinary']),
    skin: randInt(0, SKIN_TONES.length - 1),
    hairColor: pick(Object.keys(HAIR_COLORS)),
    hairTexture: pick(['straight', 'wavy', 'curly']),
    hairStyle: pick(['down', 'ponytail', 'bun', 'pixie']),
    top: pick(['tee', 'hoodie', 'dress', 'plain', 'plain']),
    topColor: pick(PLAIN_COLORS),
    bottom: pick(['jeans', 'skirt']),
    bottomColor: pick(BOTTOM_COLORS),
    shoes: pick(['sneakers', 'heels']),
  };
}

// A look that's clearly a different person (different hair color, style, and skin).
function differentLook(look) {
  let l;
  do { l = randomLook(); }
  while (l.hairColor === look.hairColor || l.hairStyle === look.hairStyle || Math.abs(l.skin - look.skin) < 2);
  return l;
}

function makePerson(name) {
  const first = name.split(' ')[0];
  const fromState = chance(0.75);
  const year = pick(YEARS);
  const major = pick(MAJORS);
  return {
    name,
    look: randomLook(),
    dob: randomDob(),
    origin: fromState ? pick(STATES) : pick(COUNTRIES),
    originType: fromState ? 'State' : 'Country',
    year,
    major,
    description: pick([
      `${first} is a ${year.toLowerCase()} studying ${major}. Known for ${pick(HOBBIES)}.`,
      `${major} ${year.toLowerCase()}. Joined TAMID for ${pick(TAMID_THINGS)} and never misses ${pick(TAMID_THINGS)}.`,
      `Ask ${first} about ${pick(HOBBIES)}. Currently working on ${pick(TAMID_THINGS)}.`,
    ]),
  };
}

function makeId(p) {
  return {
    name: p.name,
    dob: p.dob,
    origin: p.origin,
    originType: p.originType,
    kind: p.originType === 'State' ? "Driver's License" : 'Passport',
    idNumber: `${p.origin.slice(0, 2).toUpperCase()}${randInt(1000000, 9999999)}`,
    photo: p.look,
    real: true,
  };
}

function chatAnswer(chats) {
  const vague = 'Way more than 12, trust me.';
  if (chats >= MIN_CHATS) {
    return pick([`${chats}! I love TAMID Chats.`, `${chats}, I think.`, `Hmm… like ${chats}? Maybe ${chats + 1}.`, vague]);
  }
  if (chance(0.5)) return pick([`Like ${chats}? Is that bad?`, `${chats}… I've been busy this semester.`]);
  const fib = randInt(12, 16);
  return pick([`Uh… ${fib}? Yeah. ${fib}.`, 'Exactly 12. Definitely 12.', vague]);
}

// ---------- the real members ----------
// A member's made-up details (birthday, hometown, year, major, outfit) are
// generated from their name, so they stay the same every game.
function hashString(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function withSeed(seedText, fn) {
  const real = Math.random;
  Math.random = seededRandom(hashString(seedText));
  try { return fn(); } finally { Math.random = real; }
}

function buildMember(entry) {
  const p = withSeed(entry.name, () => makePerson(entry.name));
  p.look = {
    ...p.look, gender: 'nonbinary',
    skin: entry.skin, hairColor: entry.hairColor, hairTexture: entry.hairTexture, hairStyle: entry.hairStyle,
    glasses: !!entry.glasses,
  };
  p.chats = entry.chats;
  return p;
}

// ---------- shift generation ----------
function generateShift(n = GUESTS_PER_SHIFT) {
  const roster = TAMID_MEMBERS.map(buildMember).sort((a, b) => a.name.localeCompare(b.name));
  const memberNames = new Set(roster.map(m => m.name));
  const memberFirsts = new Set(roster.map(m => m.name.split(' ')[0]));
  const outsiders = FIRST_NAMES.filter(f => !memberFirsts.has(f));
  const usedOutsiders = new Set();
  const outsiderName = () => {
    let name;
    do { name = `${pick(outsiders)} ${pick(LAST_NAMES)}`; } while (usedOutsiders.has(name) || memberNames.has(name));
    usedOutsiders.add(name);
    return name;
  };

  // Each member shows up at most once per shift.
  const available = [...roster].sort(() => Math.random() - 0.5);
  const takeMember = pred => {
    const i = available.findIndex(pred);
    return i < 0 ? null : available.splice(i, 1)[0];
  };
  const enoughChats = m => m.chats == null || m.chats >= MIN_CHATS;
  const tooFewChats = m => m.chats == null || m.chats < MIN_CHATS;
  const needsEnough = ['valid', 'fakeId', 'weapon'];

  const guests = [];
  for (let i = 0; i < n; i++) {
    let type = weightedPick(GUEST_TYPES);
    let actual, idPerson, member = null;

    if (type !== 'notMember') {
      member = takeMember(needsEnough.includes(type) ? enoughChats : type === 'lowChats' ? tooFewChats : () => true);
      if (!member) {
        // Nobody left who fits this type: use any member and let their real chat count decide.
        member = takeMember(() => true);
        if (member) type = member.chats != null && member.chats < MIN_CHATS ? 'lowChats' : 'valid';
        else type = 'notMember';
      }
    }

    if (type === 'notMember') {
      actual = idPerson = makePerson(outsiderName());
    } else {
      actual = idPerson = member;
      if (type === 'impostor') {
        actual = { ...makePerson(member.name), look: differentLook(member.look) };
        idPerson = member; // they're carrying the real member's ID
      } else if (type === 'sameName') {
        actual = { ...makePerson(member.name), look: differentLook(member.look) };
        while (actual.dob.getTime() === member.dob.getTime()) actual.dob = randomDob();
        idPerson = actual; // their own real ID, which just happens to share the name
      }
    }

    const id = makeId(idPerson);
    if (type === 'fakeId') id.real = false;
    const weapon = type === 'weapon' ? pick(Object.keys(WEAPONS)) : null;
    const isTheMember = member && actual === member;
    const chats = isTheMember && member.chats != null ? member.chats
      : type === 'lowChats' ? randInt(1, 11)
      : needsEnough.includes(type) ? randInt(12, 40) : randInt(0, 30);

    const hes = () => pick(['Um… ', 'Uh, ', 'Hmm… ']);
    const lying = type === 'impostor';
    const answers = {
      name: lying && chance(0.5) ? `${hes()}${id.name}.` : `I'm ${id.name}.`,
      dob: lying
        ? (chance(0.6) ? `${hes()}${fmtDate(randomDob())}?` : `${hes()}${fmtDate(id.dob)}.`)
        : `${fmtDate(id.dob)}.`,
      from: lying && chance(0.5) ? `${hes()}${pick([...STATES, ...COUNTRIES])}?` : `${id.origin}.`,
      school: `${actual.year}, studying ${actual.major}.`,
      chats: chatAnswer(chats),
    };

    const reason = {
      valid: `They're a real member with ${chats} TAMID Chats.`,
      fakeId: 'Their ID was fake. Nothing showed up under the black light.',
      weapon: `They were carrying ${WEAPONS[weapon]}.`,
      lowChats: `They've only had ${chats} TAMID Chats (need ${MIN_CHATS}).`,
      impostor: "They weren't the person on the ID. The photo didn't match their face.",
      notMember: "They're not on the TAMID member list.",
      sameName: 'Same name as a member, but a different person. The photo and birthday on the member list didn\'t match.',
    }[type];

    guests.push({ type, look: actual.look, id, weapon, chats, answers, reason, shouldAdmit: type === 'valid' });
  }

  return { guests, roster };
}

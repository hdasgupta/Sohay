import crypto from 'node:crypto';

const store = new Map();
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function cleanOld() {
  const now = Date.now();
  for (const [id, item] of store) if (item.expiresAt <= now) store.delete(id);
}

export function createCaptcha() {
  cleanOld();
  const id = crypto.randomUUID();
  const answer = Array.from({ length: 6 }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="86" viewBox="0 0 240 86"><rect width="240" height="86" rx="10" fill="#08111f"/><path d="M0 20L240 70M-10 70L230 5M15 85L200 0" stroke="#2764c6" stroke-width="2" opacity=".7"/>${Array.from({length:45},(_,i)=>`<circle cx="${crypto.randomInt(0,240)}" cy="${crypto.randomInt(0,86)}" r="${crypto.randomInt(1,4)}" fill="#${crypto.randomInt(0,0xffffff).toString(16).padStart(6,'0')}" opacity=".55"/>`).join('')}<g transform="translate(16 57) rotate(-3)">${[...answer].map((char,i)=>`<text x="${i*34}" y="${crypto.randomInt(-5,4)}" font-family="monospace" font-size="38" font-weight="900" fill="#e9f3ff" stroke="#203453" stroke-width="1" transform="rotate(${crypto.randomInt(-12,13)} ${i*34} -10)">${char}</text>`).join('')}</g></svg>`;
  store.set(id, { answer, expiresAt: Date.now() + 5 * 60 * 1000 });
  return { id, image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` };
}

export function validateCaptcha(id, answer) {
  const item = store.get(id);
  if (!item || item.expiresAt <= Date.now()) {
    store.delete(id);
    return false;
  }
  const valid = String(answer || '').trim().toUpperCase() === item.answer;
  if (valid) store.delete(id);
  return valid;
}

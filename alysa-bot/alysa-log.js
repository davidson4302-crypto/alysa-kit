'use strict';
// Alysa's unified conversation log.
//
// Every surface Shawn talks to Alysa through — Discord (this bot), the
// Cowork/claude.ai skills, and any future channel he adds (WhatsApp, voice
// line, SMS) — appends turns here and reads recent context from here so Alysa
// has one continuous memory across surfaces. Append-only JSONL, one file per
// day per machine (safe for iCloud/Dropbox/rsync).
//
// Two functions matter:
//   logTurn({ surface, user, direction, text, ... })
//   recall({ hours, maxTurns, surface, user, maxChars }) -> string
//
// Set ALYSA_LOG_DIR env var if you want the log somewhere other than
// ~/Library/Application Support/Alysa/conversations. If Shawn later adds an
// iCloud/Dropbox sync path, point ALYSA_LOG_DIR at it and each machine writes
// its own machine-suffixed file so no merge conflicts occur.

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const LOG_DIR = process.env.ALYSA_LOG_DIR
  || path.join(os.homedir(), 'Library', 'Application Support', 'Alysa', 'conversations');
fs.mkdirSync(LOG_DIR, { recursive: true });

const ALLOWED_SURFACES = new Set([
  'discord', 'cowork', 'claude-ai', 'whatsapp', 'voice-line',
  'imessage', 'sms', 'email', 'other',
]);
const ALLOWED_DIRECTIONS = new Set(['in', 'out']);

const MACHINE = (() => {
  const raw = String(os.hostname() || 'shawn').toLowerCase().split('.')[0];
  return raw || 'shawn';
})();

function ymd(d) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function dayFile(iso) {
  const d = iso ? new Date(iso) : new Date();
  return path.join(LOG_DIR, `${ymd(d)}-${MACHINE}.jsonl`);
}

function dayFilesAllMachines(iso) {
  const d = iso ? new Date(iso) : new Date();
  const day = ymd(d);
  return fs.readdirSync(LOG_DIR)
    .filter((n) => n.startsWith(`${day}-`) && n.endsWith('.jsonl'))
    .sort()
    .map((n) => path.join(LOG_DIR, n));
}

function turnId(payload) {
  const key = [payload.ts, payload.surface, payload.surface_id, payload.direction, payload.text].join('|');
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 16);
}

function logTurn({ surface, user, direction, text, model, surface_id, external_id, ts }) {
  if (!ALLOWED_SURFACES.has(surface)) throw new Error(`unknown surface: ${surface}`);
  if (!ALLOWED_DIRECTIONS.has(direction)) throw new Error(`direction must be in/out, got ${direction}`);
  const clean = String(text || '').trim();
  if (!clean) return '';

  const at = ts || new Date().toISOString();
  const payload = {
    ts: at, surface, surface_id: surface_id || '', user: user || '',
    direction, model: model || '', external_id: external_id || '', text: clean,
  };
  const tid = turnId(payload);
  payload.turn_id = tid;

  for (const existing of dayFilesAllMachines(at)) {
    let raw = '';
    try { raw = fs.readFileSync(existing, 'utf8'); } catch (_) { continue; }
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line);
        if (row.turn_id === tid) return tid;
        if (external_id && row.external_id === external_id && row.surface === surface) {
          return row.turn_id || tid;
        }
      } catch (_) {}
    }
  }
  fs.appendFileSync(dayFile(at), JSON.stringify(payload) + '\n');
  return tid;
}

function recentFiles(hours) {
  const days = Math.max(1, Math.ceil(hours / 24) + 2);
  const out = [];
  const now = new Date();
  const allNames = fs.readdirSync(LOG_DIR).filter((n) => n.endsWith('.jsonl'));
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const day = ymd(d);
    for (const name of allNames.filter((n) => n.startsWith(`${day}-`))) {
      out.push(path.join(LOG_DIR, name));
    }
  }
  return out;
}

function recentTurns({ hours = 48, maxTurns = 200, surface = null, user = null } = {}) {
  const cutoff = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const rows = [];
  for (const file of recentFiles(hours)) {
    let raw = '';
    try { raw = fs.readFileSync(file, 'utf8'); } catch (_) { continue; }
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      let row;
      try { row = JSON.parse(line); } catch (_) { continue; }
      if (!row.ts || row.ts < cutoff) continue;
      if (surface && row.surface !== surface) continue;
      if (user && String(row.user || '').toLowerCase() !== user.toLowerCase()) continue;
      rows.push(row);
    }
  }
  rows.sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  return rows.slice(-maxTurns);
}

function recall({ hours = 168, maxTurns = 200, surface = null, user = null, maxChars = 12000 } = {}) {
  const rows = recentTurns({ hours, maxTurns, surface, user });
  if (!rows.length) return '';
  const lines = rows.map((r) => {
    const who = r.direction === 'out' ? 'Alysa' : (r.user || 'Shawn');
    return `[${r.ts} ${r.surface}] ${who}: ${r.text}`;
  });
  let text = lines.join('\n');
  if (text.length > maxChars) text = text.slice(-maxChars);
  return text;
}

module.exports = { logTurn, recentTurns, recall, LOG_DIR, MACHINE };

'use strict';

// Minimal Playwright uploader for claude.ai skills.
// Fresh implementation for Shawn's kit — no dependency on Jason's own
// upload-skills tool. Same shape: saved session at auth.json, drops a
// zipped skill folder onto claude.ai's Settings → Skills upload input,
// clicks through the "replace existing?" confirm.
//
// Flags:
//   --login       Opens a visible browser; user signs in; session saved.
//   --check       Verifies the saved session still works.
//   --no-archive  Leave uploaded folders in SKILLS_NEW instead of moving.
//   --dry-run     List what would upload; no browser, no changes.
//
// Env:
//   HEADLESS=1              Run without a visible window.
//   SKILLS_NEW=<path>       Source folder (defaults to ./staging).
//   SKILLS_INSTALLED=<path> Archive destination (defaults to ./staging/.installed).
//   CLAUDE_URL=<url>        Override claude.ai base URL.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (err) {
  console.error('Playwright is not installed. Run: npm install && npx playwright install chromium');
  process.exit(1);
}

const HERE = __dirname;
const AUTH_PATH = path.join(HERE, 'auth.json');
const SKILLS_NEW = process.env.SKILLS_NEW || path.join(HERE, 'staging');
const SKILLS_INSTALLED = process.env.SKILLS_INSTALLED || path.join(SKILLS_NEW, '.installed');
const CLAUDE_URL = process.env.CLAUDE_URL || 'https://claude.ai';
const HEADLESS = process.env.HEADLESS === '1';

const flags = new Set(process.argv.slice(2));
const NO_ARCHIVE = flags.has('--no-archive');
const DRY_RUN = flags.has('--dry-run');
const LOGIN_MODE = flags.has('--login');
const CHECK_MODE = flags.has('--check');

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
}

function listSkillFolders(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => path.join(root, d.name))
    .filter((p) => fs.existsSync(path.join(p, 'SKILL.md')));
}

function zipSkillFolder(folder) {
  const name = path.basename(folder);
  const zipPath = path.join(path.dirname(folder), `${name}.zip`);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  const res = spawnSync('zip', ['-r', '-q',
    '-x', '*.DS_Store', '-x', '__pycache__/*', '-x', '.git/*',
    zipPath, name], { cwd: path.dirname(folder) });
  if (res.status !== 0) {
    throw new Error(`zip failed for ${name}: ${res.stderr?.toString() || res.status}`);
  }
  return zipPath;
}

async function openContext(headless) {
  const browser = await chromium.launch({ headless });
  const storageState = fs.existsSync(AUTH_PATH) ? AUTH_PATH : undefined;
  const context = await browser.newContext({ storageState });
  return { browser, context };
}

async function doLogin() {
  log('Opening a browser window. Sign in to claude.ai, then close the window.');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(CLAUDE_URL);
  log('Waiting for you to finish signing in. When you see your logged-in claude.ai, close the browser window.');
  await page.waitForEvent('close', { timeout: 10 * 60 * 1000 }).catch(() => {});
  await context.storageState({ path: AUTH_PATH });
  await browser.close();
  log(`Saved session to ${AUTH_PATH}`);
}

async function doCheck() {
  if (!fs.existsSync(AUTH_PATH)) {
    log('No saved login at auth.json. Run --login first.');
    process.exit(2);
  }
  const { browser, context } = await openContext(true);
  const page = await context.newPage();
  await page.goto(`${CLAUDE_URL}/settings/skills`, { waitUntil: 'domcontentloaded' });
  const url = page.url();
  const isLoginRedirect = /login|sign-in|auth/i.test(url);
  await browser.close();
  if (isLoginRedirect) {
    log('Saved login is no longer valid. Re-run: node upload-skills.js --login');
    process.exit(2);
  }
  log('Saved login is valid.');
}

async function uploadOne(page, zipPath) {
  const name = path.basename(zipPath, '.zip');
  log(`[${name}] uploading ${zipPath}`);

  // Navigate to Settings → Skills. Do this fresh each upload so DOM state
  // isn't reused from a prior success/failure.
  await page.goto(`${CLAUDE_URL}/settings/skills`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});

  // Click "Add" or "Add skill" button.
  const addBtn = page.getByRole('button', { name: /add skill|^add$/i }).first();
  await addBtn.waitFor({ state: 'visible', timeout: 15000 });
  await addBtn.click();

  // Pick the "Upload a skill" menu item.
  const uploadItem = page.getByRole('menuitem', { name: /upload a skill|upload skill/i }).first();
  await uploadItem.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  if (await uploadItem.isVisible().catch(() => false)) {
    await uploadItem.click();
  }

  // Drop the zip on the file input. Playwright can set files on any
  // matching input regardless of visibility.
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(zipPath);

  // Wait for either the "replace/update" confirm dialog or a success signal.
  const confirmBtn = page.getByRole('button', { name: /^(update|replace|confirm|yes|overwrite)$/i }).first();
  try {
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();
  } catch (_) {
    // No confirm shown; treat as a fresh upload (new skill name).
  }

  // Success signal: the skill row appears with today's date. Fall back to
  // waiting for network to settle then checking the row.
  await page.waitForLoadState('networkidle').catch(() => {});
  const row = page.getByText(new RegExp(`^${name}$`, 'i')).first();
  const shown = await row.isVisible({ timeout: 8000 }).catch(() => false);
  if (!shown) {
    const screenshot = path.join(HERE, `error-${name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true }).catch(() => {});
    throw new Error(`Skill row for "${name}" not visible after upload. Screenshot: ${screenshot}`);
  }
  log(`[${name}] upload confirmed`);
}

async function main() {
  if (LOGIN_MODE) return doLogin();
  if (CHECK_MODE) return doCheck();

  const folders = listSkillFolders(SKILLS_NEW);
  if (folders.length === 0) {
    log(`Nothing to upload in ${SKILLS_NEW}.`);
    return;
  }
  log(`Found ${folders.length} skill folder(s) in ${SKILLS_NEW}.`);

  if (DRY_RUN) {
    for (const f of folders) log(`  would upload: ${path.basename(f)}`);
    return;
  }

  if (!fs.existsSync(AUTH_PATH)) {
    log('No saved login at auth.json. Run: node upload-skills.js --login');
    process.exit(2);
  }

  const { browser, context } = await openContext(HEADLESS);
  const page = await context.newPage();

  let ok = 0, fail = 0;
  const failed = [];
  for (const folder of folders) {
    const name = path.basename(folder);
    try {
      const zipPath = zipSkillFolder(folder);
      await uploadOne(page, zipPath);
      if (!NO_ARCHIVE) {
        fs.mkdirSync(SKILLS_INSTALLED, { recursive: true });
        const destFolder = path.join(SKILLS_INSTALLED, name);
        if (fs.existsSync(destFolder)) fs.rmSync(destFolder, { recursive: true, force: true });
        fs.renameSync(folder, destFolder);
        const destZip = path.join(SKILLS_INSTALLED, `${name}.zip`);
        if (fs.existsSync(destZip)) fs.unlinkSync(destZip);
        fs.renameSync(zipPath, destZip);
        log(`[${name}] archived to ${SKILLS_INSTALLED}`);
      }
      ok++;
    } catch (err) {
      log(`[${name}] FAILED: ${err.message}`);
      fail++;
      failed.push(name);
    }
  }

  await browser.close();
  log(`Done. Succeeded: ${ok}/${folders.length}.`);
  if (fail > 0) {
    log(`Failed: ${failed.join(', ')}`);
    process.exit(1);
  }
}

main().catch((err) => {
  log(`FATAL: ${err.stack || err}`);
  process.exit(1);
});

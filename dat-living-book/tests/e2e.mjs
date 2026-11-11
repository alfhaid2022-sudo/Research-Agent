// End-to-end interaction checks. Builds must exist (npm run build).
// Usage: npm run e2e   (starts `vite preview` on port 4317, runs checks, writes screenshots to test-output/)
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

// Playwright is not a project dependency: use any installed copy (local or global via NODE_PATH).
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('Playwright not found. Install it (npm i -D playwright && npx playwright install chromium) to run e2e checks.');
  process.exit(2);
}

const PORT = 4317;
const BASE = `http://localhost:${PORT}/`;
const OUT = new URL('../test-output/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
await new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error('preview did not start')), 20000);
  server.stdout.on('data', (d) => { if (String(d).includes(String(PORT))) { clearTimeout(t); res(); } });
});

process.on('exit', () => server.kill());
const results = [];
let failed = 0;
async function check(name, fn) {
  try { await fn(); results.push(`PASS  ${name}`); }
  catch (e) { failed++; results.push(`FAIL  ${name}\n      ${String(e.message).split('\n')[0]}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const browser = await chromium.launch();
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

await page.goto(BASE);

await check('home renders title and start button', async () => {
  await page.getByRole('heading', { level: 1, name: 'Direct Antiglobulin Test (DAT)' }).waitFor();
  await page.screenshot({ path: OUT + 'desktop-home.png' });
  await page.getByTestId('start').click();
  await page.getByTestId('section-definition').waitFor();
});

await check('source chip opens the cited panel of the original page', async () => {
  await page.locator('.src-line .ref-chip').first().click();
  const dlg = page.locator('dialog.source-dialog');
  await dlg.waitFor({ state: 'visible' });
  const img = dlg.locator('img');
  await img.waitFor();
  await page.waitForFunction(() => { const i = document.querySelector('dialog img'); return i && i.complete && i.naturalWidth > 0; });
  const top = await img.evaluate((el) => el.style.top);
  // term panel y0 = 310, height 180 -> top = -172.2%
  assert(top.startsWith('-172.2'), `unexpected crop offset ${top}`);
  assert((await dlg.locator('h3').innerText()).includes('p. 1 · Term Definition'), 'dialog title wrong');
  await page.screenshot({ path: OUT + 'desktop-source-viewer.png' });
  await page.getByRole('button', { name: 'Close source viewer' }).click();
  await dlg.waitFor({ state: 'hidden' });
});

await check('progressive disclosure + knowledge check completes a section and survives reload', async () => {
  await page.getByRole('button', { name: /Show all/ }).click();
  await page.getByTestId('quiz-q-what').getByRole('button', { name: /coated in vivo/ }).click();
  await page.getByTestId('quiz-q-in-vivo').getByRole('button', { name: /^B In vivo/ }).click();
  await page.getByText('Section complete').waitFor();
  await page.reload();
  await page.getByTestId('section-definition').waitFor();
  const txt = await page.locator('.toc a[href="#section-definition"]').innerText();
  assert(txt.includes('✓'), 'completion tick missing after reload');
  const fb = await page.getByTestId('quiz-q-what').locator('.feedback').innerText();
  assert(fb.startsWith('Correct'), 'saved quiz answer not restored');
});

await check('procedure animation: captions follow steps, positive and check-cell branches', async () => {
  await page.goto(BASE + '#/section/steps');
  await page.getByRole('button', { name: /Show all/ }).click();
  const player = page.locator('.stage-mechanism .player');
  for (let k = 0; k < 6; k++) await player.getByRole('button', { name: 'Next step' }).click();
  assert((await player.locator('.player-caption').innerText()).includes('agglutination, a positive DAT'), 'last caption wrong');
  assert((await player.locator('.svg-result').textContent()).includes('Agglutination'), 'result label missing');
  assert((await player.locator('.player-caption').innerText()).includes('Step 4'), 'source step ref missing');
  await player.screenshot({ path: OUT + 'anim-positive.png' });
  await player.getByText('Cells not coated').click();
  for (let k = 0; k < 7; k++) await player.getByRole('button', { name: 'Next step' }).click();
  assert((await player.locator('.svg-result').textContent()).includes('Check cells agglutinate'), 'check-cell branch missing');
  await player.screenshot({ path: OUT + 'anim-checkcells.png' });
  await player.getByRole('button', { name: 'Previous step' }).click();
  assert((await player.locator('.step-count').innerText()) === 'STEP 7 OF 8' || (await player.locator('.step-count').innerText()).toLowerCase() === 'step 7 of 8', 'back button failed');
});

await check('play + speed auto-advance; reduced motion disables transitions', async () => {
  const player = page.locator('.stage-mechanism .player');
  await player.getByRole('button', { name: 'Go to first step' }).click();
  await player.getByLabel('Playback speed').selectOption('2');
  await player.getByRole('button', { name: 'Play', exact: true }).click();
  await page.waitForTimeout(2600);
  const n = await player.locator('.step-count').innerText();
  assert(!/step 1 of/i.test(n), `did not advance: ${n}`);
  await player.getByRole('button', { name: 'Pause' }).click();
  const tr = await player.locator('svg.scene g[style*="translate"]').first().evaluate((el) => el.style.transition);
  assert(tr && tr !== 'none', 'expected transitions with full motion');
  await page.getByLabel('Motion').selectOption('reduce');
  const tr2 = await player.locator('svg.scene g[style*="translate"]').first().evaluate((el) => el.style.transition);
  assert(tr2 === 'none', `reduced motion still animates: ${tr2}`);
  await page.getByLabel('Motion').selectOption('system');
});

await check('reaction explorer: monospecific specificity', async () => {
  await page.goto(BASE + '#/section/principle');
  await page.getByRole('button', { name: /Show all/ }).click();
  const ex = page.getByTestId('reaction-explorer');
  await ex.getByLabel(/Coating on patient cells/).selectOption('C3d');
  await ex.getByLabel(/AHG reagent added/).selectOption('antiIgG');
  assert((await ex.getByTestId('explorer-result').innerText()) === 'No agglutination', 'C3d + anti-IgG should be negative');
  await ex.getByLabel(/AHG reagent added/).selectOption('antiC3d');
  assert((await ex.getByTestId('explorer-result').innerText()) === 'Agglutination', 'C3d + anti-C3d should be positive');
  await ex.screenshot({ path: OUT + 'explorer.png' });
});

await check('troubleshooter: false negative and failed check cells', async () => {
  await page.goto(BASE + '#/section/results');
  await page.getByRole('button', { name: /Show all/ }).click();
  const t = page.getByTestId('troubleshooter');
  await t.getByLabel('Failure to add AHG').check();
  assert((await t.getByTestId('trouble-class').innerText()) === 'False negative', 'expected false negative');
  assert((await t.getByTestId('trouble-check').innerText()).includes('do NOT agglutinate'), 'check cells should fail');
  await t.getByRole('button', { name: 'Clear errors' }).click();
  await t.getByLabel('Centrifugation').selectOption('over');
  await t.getByLabel('Patient cells').selectOption('none');
  assert((await t.getByTestId('trouble-class').innerText()) === 'False positive', 'expected false positive');
  await t.getByLabel('Centrifugation').selectOption('correct');
  await t.getByLabel('Delay in adding AHG after washing').check();
  assert((await t.getByTestId('trouble-class').innerText()).startsWith('Result not interpretable'), 'delay must be non-directional');
});

await check('classic-patterns flowchart', async () => {
  await page.goto(BASE + '#/section/patterns');
  await page.getByRole('button', { name: /Show all/ }).click();
  const f = page.getByTestId('pattern-flowchart');
  await f.getByRole('button', { name: 'Positive polyspecific DAT' }).click();
  await f.getByRole('button', { name: 'Perform monospecific DAT' }).click();
  await f.getByRole('button', { name: 'Anti-C3', exact: true }).click();
  assert((await f.getByTestId('pattern-result').innerText()).includes('Cold Agglutinin Disease'), 'anti-C3 list wrong');
  await f.getByRole('button', { name: 'Neither' }).click();
  assert((await f.getByTestId('pattern-result').innerText()).includes('Not covered by the source'), 'gap not flagged');
});

await check('detection-limit slider zones', async () => {
  await page.goto(BASE + '#/section/mechanisms');
  await page.getByRole('button', { name: /Show all/ }).click();
  const d = page.getByTestId('detection-limits');
  await d.locator('input[type=range]').fill('50');
  assert((await d.getByTestId('limit-zone').innerText()) === 'Below stated range', 'zone below');
  await d.getByText('C3', { exact: true }).click();
  await d.locator('input[type=range]').fill('800');
  assert((await d.getByTestId('limit-zone').innerText()) === 'Within stated range', 'zone within C3');
});

await check('virtual lab: clean negative run with check cells', async () => {
  await page.goto(BASE + '#/lab');
  const lab = page.getByTestId('virtual-lab');
  await lab.getByRole('button', { name: /Specimen 4/ }).click();
  await lab.getByRole('button', { name: /Wash the red cells/ }).click();
  await lab.getByRole('button', { name: /^Polyspecific/ }).click();
  await lab.getByRole('radio', { name: /stored and handled properly/ }).click();
  await lab.getByRole('button', { name: /add AHG without delay/ }).click();
  await lab.getByRole('button', { name: /as per the laboratory procedure/ }).click();
  await lab.getByRole('button', { name: 'No agglutination' }).click();
  await lab.getByRole('button', { name: /Add antibody-coated reagent cells/ }).click();
  await lab.getByRole('button', { name: /Check cells agglutinate/ }).click();
  const d = lab.getByTestId('lab-debrief');
  await d.waitFor();
  assert((await d.innerText()).includes('no mistakes'), 'clean run should have no mistakes');
  await page.screenshot({ path: OUT + 'desktop-lab-debrief.png', fullPage: true });
});

await check('virtual lab: skipped wash -> false negative caught by check cells', async () => {
  const lab = page.getByTestId('virtual-lab');
  await lab.getByRole('button', { name: 'Run another specimen' }).click();
  await lab.getByRole('button', { name: /Specimen 1/ }).click();
  await lab.getByRole('button', { name: /Skip washing/ }).click();
  await lab.getByRole('button', { name: /^Polyspecific/ }).click();
  await lab.getByRole('radio', { name: /stored and handled properly/ }).click();
  await lab.getByRole('button', { name: /add AHG without delay/ }).click();
  await lab.getByRole('button', { name: /as per the laboratory procedure/ }).click();
  await lab.getByRole('button', { name: 'No agglutination' }).click();
  await lab.getByRole('button', { name: /Add antibody-coated reagent cells/ }).click();
  await lab.getByRole('button', { name: /do not agglutinate/ }).click();
  const txt = await lab.getByTestId('lab-debrief').innerText();
  assert(/false negative/i.test(txt) && txt.includes('under-washing'), 'debrief should name the error');
});

await check('virtual lab: positive polyspecific -> monospecific pattern', async () => {
  const lab = page.getByTestId('virtual-lab');
  await lab.getByRole('button', { name: 'Run another specimen' }).click();
  await lab.getByRole('button', { name: /Specimen 2/ }).click();
  await lab.getByRole('button', { name: /Wash the red cells/ }).click();
  await lab.getByRole('button', { name: /^Polyspecific/ }).click();
  await lab.getByRole('radio', { name: /stored and handled properly/ }).click();
  await lab.getByRole('button', { name: /add AHG without delay/ }).click();
  await lab.getByRole('button', { name: /as per the laboratory procedure/ }).click();
  await lab.getByRole('button', { name: 'Agglutination present' }).click();
  await lab.getByRole('button', { name: 'Anti-C3', exact: true }).click();
  assert((await lab.getByTestId('lab-debrief').innerText()).includes('no mistakes'), 'mono run should be clean');
});

await check('branching case with feedback', async () => {
  await page.goto(BASE + '#/cases');
  const c = page.getByTestId('case-case-silent-tube');
  await c.getByRole('button', { name: 'Report the DAT as negative' }).click();
  assert((await c.locator('.feedback').innerText()).includes('Not yet'), 'wrong-choice feedback missing');
  await c.getByRole('button', { name: 'Try another option' }).click();
  await c.getByRole('button', { name: /Add antibody-coated reagent cells/ }).click();
  await c.getByRole('button', { name: 'Continue' }).click();
  await c.getByRole('button', { name: /Possible technical error/ }).click();
  await c.getByRole('button', { name: 'Continue' }).click();
  await c.getByRole('button', { name: /Whether AHG was actually added/ }).click();
  await c.getByRole('button', { name: 'Finish case' }).click();
  await c.getByText('Case complete.').waitFor();
});

await check('quiz feedback and score', async () => {
  await page.goto(BASE + '#/quiz');
  await page.getByTestId('quiz-q-poly').getByRole('button', { name: /Anti-IgG only/ }).click();
  assert((await page.getByTestId('quiz-q-poly').locator('.feedback').innerText()).startsWith('Not quite'), 'wrong answer feedback');
  assert((await page.getByTestId('quiz-score').innerText()).includes('/ 3 answered'), 'score should count prior answers');
});

await check('flashcards flip and mark known', async () => {
  await page.goto(BASE + '#/flashcards');
  const fc = page.getByTestId('flashcard');
  const front = await fc.innerText();
  await fc.click();
  assert((await fc.innerText()) !== front, 'card did not flip');
  await page.getByRole('button', { name: 'Mark known' }).click();
  await page.getByText('Marked known: 1').waitFor();
});

await check('bookmark persists and search finds content', async () => {
  await page.goto(BASE + '#/section/mechanisms');
  await page.getByTestId('bookmark').click();
  await page.reload();
  await page.goto(BASE + '#/bookmarks');
  await page.locator('main').getByRole('link', { name: /Proximate mechanisms/ }).waitFor();
  await page.getByTestId('search').fill('check cells');
  const n = await page.locator('.search-results li').count();
  assert(n >= 2, `search returned ${n}`);
});

await check('dark theme applies', async () => {
  await page.goto(BASE + '#/section/reaction');
  await page.getByTestId('theme').selectOption('dark');
  assert((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'theme attr');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert(bg === 'rgb(20, 23, 27)', `dark bg ${bg}`);
  await page.getByRole('button', { name: /Show all/ }).click();
  await page.screenshot({ path: OUT + 'desktop-dark-reaction.png', fullPage: false });
  await page.getByTestId('theme').selectOption('light');
});

await check('keyboard: arrow keys step the animation', async () => {
  await page.goto(BASE + '#/section/reaction');
  await page.getByRole('button', { name: /Show all/ }).click();
  const player = page.locator('.stage-mechanism .player');
  await player.getByRole('button', { name: 'Next step' }).focus();
  await page.keyboard.press('ArrowRight');
  assert(/step 2 of/i.test(await player.locator('.step-count').innerText()), 'arrow key did not step');
  await page.keyboard.press('ArrowLeft');
  assert(/step 1 of/i.test(await player.locator('.step-count').innerText()), 'left arrow did not step back');
});

// ---- Mobile ----
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const mp = await m.newPage();
mp.on('pageerror', (e) => errors.push(`mobile pageerror: ${e.message}`));
for (const [route, file] of [['', 'mobile-home.png'], ['#/section/steps', 'mobile-steps.png'], ['#/lab', 'mobile-lab.png'], ['#/section/results', 'mobile-results.png'], ['#/section/patterns', 'mobile-patterns.png']]) {
  await check(`mobile layout has no horizontal overflow: ${route || 'home'}`, async () => {
    await mp.goto(BASE + route);
    await mp.waitForTimeout(250);
    const btn = mp.getByRole('button', { name: /Show all/ });
    if (await btn.count()) await btn.click();
    const over = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert(over <= 1, `overflow ${over}px`);
    await mp.screenshot({ path: OUT + file, fullPage: route === '#/section/steps' });
  });
}
await check('mobile: contents drawer opens and navigates', async () => {
  await mp.goto(BASE);
  await mp.getByRole('button', { name: 'Toggle contents' }).click();
  await mp.locator('.toc a[href="#section-factoids"]').click();
  await mp.getByTestId('section-factoids').waitFor();
  assert(!(await mp.locator('.app.nav-open').count()), 'drawer should close after navigation');
});

await browser.close();
server.kill();

const relevant = errors.filter((e) => !/speechSynthesis|favicon/i.test(e));
results.push(relevant.length ? `FAIL  no runtime errors\n      ${relevant.join('\n      ')}` : 'PASS  no runtime errors');
if (relevant.length) failed++;
console.log(results.join('\n'));
console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots: ${OUT}`);
process.exit(failed ? 1 : 0);

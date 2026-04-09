import { test, expect } from '@playwright/test';

/**
 * Presenter View — UI tests
 * Requires the server to be running: npm start
 */

test.beforeEach(async ({ request, page }) => {
  await request.post('http://localhost:3000/test/reset');
  await page.goto('/');
  // Click body to ensure keyboard events are captured
  await page.locator('body').click();
});

// ─── Layout & Branding ───────────────────────────────────────────────────────

test('presenter view loads and shows intro slide', async ({ page }) => {
  await expect(page.locator('.screen-intro')).toBeVisible();
  await expect(page.locator('.intro-heading')).toContainText('LBS AI Fireside');
});

test('intro slide shows QR code', async ({ page }) => {
  await expect(page.locator('.qr-code-wrapper svg')).toBeVisible();
  await expect(page.locator('.qr-label')).toContainText('Scan');
  await expect(page.locator('.qr-url')).toBeVisible();
});

test('Danaher brand accent colour is applied', async ({ page }) => {
  const presenter = page.locator('.presenter');
  await expect(presenter).toBeVisible();
  const accent = await presenter.evaluate((el) =>
    getComputedStyle(el).getPropertyValue('--accent').trim(),
  );
  expect(accent).toBe('#4000a5');
});

test('slide counter shows "1 of N" on intro', async ({ page }) => {
  await expect(page.locator('.nav-position')).toContainText('1 of');
});

// ─── Navigation ──────────────────────────────────────────────────────────────

test('next arrow button advances to slide 2', async ({ page }) => {
  await page.locator('.nav-arrow.nav-next').click();
  await expect(page.locator('.nav-position')).toContainText('2 of');
});

test('back arrow is disabled on slide 1', async ({ page }) => {
  await expect(page.locator('.nav-arrow.nav-back')).toBeDisabled();
});

test('spacebar advances slide', async ({ page }) => {
  await page.keyboard.press('Space');
  await expect(page.locator('.nav-position')).toContainText('2 of');
});

test('right arrow key advances slide', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.nav-position')).toContainText('2 of');
});

test('left arrow key goes back after advancing', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.nav-position')).toContainText('2 of');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.nav-position')).toContainText('1 of');
});

// ─── Poll Slide ───────────────────────────────────────────────────────────────

test('first poll slide renders question and 4 options', async ({ page }) => {
  await page.keyboard.press('ArrowRight'); // slide 2 = q1 poll
  await expect(page.locator('.screen-poll')).toBeVisible();
  await expect(page.locator('.question-text')).toContainText('How often do you use AI tools');
  await expect(page.locator('.poll-option-row')).toHaveCount(4);
});

test('tally + button increments vote count', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  const firstCount = page.locator('.poll-option-count').first();
  await expect(firstCount).toContainText('0');
  await page.locator('.tally-btn').first().click();
  await expect(firstCount).toContainText('1');
  await page.locator('.tally-btn').first().click();
  await expect(firstCount).toContainText('2');
});

test('show results reveals bar chart and percentages', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  await page.locator('.tally-btn').first().click();
  await page.locator('.tally-btn').first().click();

  await page.getByRole('button', { name: 'Show Results' }).click();

  const barFill = page.locator('.bar-fill').first();
  const width = await barFill.evaluate((el) => (el as HTMLElement).style.width);
  expect(parseFloat(width)).toBeGreaterThan(0);

  await expect(page.locator('.poll-option-pct').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hide Results' })).toBeVisible();
});

test('reset button clears all vote counts to 0', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  for (let i = 0; i < 3; i++) await page.locator('.tally-btn').first().click();
  await expect(page.locator('.poll-option-count').first()).toContainText('3');

  await page.getByRole('button', { name: 'Reset' }).click();

  for (const count of await page.locator('.poll-option-count').all()) {
    await expect(count).toContainText('0');
  }
  await expect(page.locator('.poll-total-votes')).toContainText('0 votes');
});

test('total vote counter updates correctly', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  const btns = page.locator('.tally-btn');
  await btns.nth(0).click();
  await btns.nth(1).click();
  await btns.nth(2).click();
  await expect(page.locator('.poll-total-votes')).toContainText('3 votes');
  await btns.nth(0).click();
  await expect(page.locator('.poll-total-votes')).toContainText('4 votes');
});

// ─── Section Divider ─────────────────────────────────────────────────────────

test('divider slide (slide 4) has dark purple background class', async ({ page }) => {
  // intro(1) → q1(2) → q5(3) → divider(4)
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.presenter')).toHaveClass(/divider-bg/);
});

test('divider slide shows section number, title and duration', async ({ page }) => {
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.divider-number')).toBeVisible();
  await expect(page.locator('.divider-title')).toBeVisible();
  await expect(page.locator('.divider-duration')).toBeVisible();
});

// ─── Discussion Slide ─────────────────────────────────────────────────────────

test('discussion slide (slide 5) shows question text', async ({ page }) => {
  // intro(1) → q1(2) → q5(3) → divider(4) → discussion(5)
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.screen-discussion')).toBeVisible();
  await expect(page.locator('.question-text')).toBeVisible();
});

// ─── Audience Counter ────────────────────────────────────────────────────────

test('audience counter shows connected dot after WS connects', async ({ page }) => {
  const dot = page.locator('.audience-counter-dot');
  await expect(dot).not.toHaveClass(/disconnected/, { timeout: 5000 });
});

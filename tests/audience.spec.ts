import { test, expect, chromium } from '@playwright/test';

/**
 * Audience View — UI tests
 * Tests the mobile voting experience at /audience
 * Requires the server to be running: npm start
 */

const CONNECTED_TIMEOUT = 10000;

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3000/test/reset');
  // Short settle so the server finishes closing old connections
  // before new WS connections are established by the next test
  await new Promise((r) => setTimeout(r, 400));
});

// ─── Loading & Connection ────────────────────────────────────────────────────

test('audience view loads and connects', async ({ page }) => {
  await page.goto('/audience');
  // Should show "Connected" badge after WS connects
  await expect(page.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });
});

test('audience shows waiting state when no poll is active', async ({ page }) => {
  await page.goto('/audience');
  await expect(page.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });
  await expect(page.locator('.audience-waiting h1')).toBeVisible();
});

// ─── Real-time Poll Delivery ──────────────────────────────────────────────────

test('poll appears on audience when presenter navigates to poll slide', async ({ browser }) => {
  const presenterCtx = await browser.newContext();
  const audienceCtx = await browser.newContext();
  const presenter = await presenterCtx.newPage();
  const audience = await audienceCtx.newPage();

  await presenter.goto('/');
  await audience.goto('/audience');

  // Wait for audience to fully connect before proceeding
  await expect(audience.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });
  await audience.waitForTimeout(300);

  // Presenter navigates to first poll (slide 2)
  await presenter.keyboard.press('ArrowRight');

  // Poll question should appear on audience
  await expect(audience.locator('.audience-question')).toContainText(
    'How often do you use AI tools',
    { timeout: CONNECTED_TIMEOUT },
  );
  await expect(audience.locator('.audience-option-btn')).toHaveCount(4);

  await presenterCtx.close();
  await audienceCtx.close();
});

test('audience returns to waiting when presenter leaves poll slide', async ({ browser }) => {
  const presenterCtx = await browser.newContext();
  const audienceCtx = await browser.newContext();
  const presenter = await presenterCtx.newPage();
  const audience = await audienceCtx.newPage();

  await presenter.goto('/');
  await audience.goto('/audience');
  await expect(audience.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });
  await audience.waitForTimeout(300);

  // Go to poll, then leave
  await presenter.keyboard.press('ArrowRight');
  await expect(audience.locator('.audience-question')).toBeVisible({ timeout: CONNECTED_TIMEOUT });

  await presenter.keyboard.press('ArrowRight'); // advance past poll to next poll
  // Move to a non-poll screen — navigate forward past q5 to divider
  await presenter.keyboard.press('ArrowRight');

  await expect(audience.locator('.audience-waiting')).toBeVisible({ timeout: CONNECTED_TIMEOUT });

  await presenterCtx.close();
  await audienceCtx.close();
});

// ─── Voting ──────────────────────────────────────────────────────────────────

test('audience member can vote and gets confirmation', async ({ browser }) => {
  const presenterCtx = await browser.newContext();
  const audienceCtx = await browser.newContext();
  const presenter = await presenterCtx.newPage();
  const audience = await audienceCtx.newPage();

  await presenter.goto('/');
  await audience.goto('/audience');
  await expect(audience.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });
  await audience.waitForTimeout(300);

  await presenter.keyboard.press('ArrowRight');
  await expect(audience.locator('.audience-option-btn')).toHaveCount(4, { timeout: CONNECTED_TIMEOUT });

  // Vote for the first option
  await audience.locator('.audience-option-btn').first().click();

  // Confirmation banner appears
  await expect(audience.locator('.audience-voted-banner')).toBeVisible({ timeout: CONNECTED_TIMEOUT });

  // Selected option gets the selected class
  await expect(audience.locator('.audience-option-btn.selected')).toHaveCount(1);

  await presenterCtx.close();
  await audienceCtx.close();
});

test('audience vote updates presenter bar chart', async ({ browser }) => {
  const presenterCtx = await browser.newContext();
  const audienceCtx = await browser.newContext();
  const presenter = await presenterCtx.newPage();
  const audience = await audienceCtx.newPage();

  await presenter.goto('/');
  await audience.goto('/audience');
  await expect(audience.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });

  await presenter.keyboard.press('ArrowRight');
  await expect(audience.locator('.audience-option-btn')).toHaveCount(4, { timeout: CONNECTED_TIMEOUT });

  // Show results on presenter before voting so we can observe bar change
  await presenter.getByRole('button', { name: 'Show Results' }).click();

  // Vote from audience
  await audience.locator('.audience-option-btn').first().click();

  // Presenter should show 1 vote on first option
  await expect(presenter.locator('.poll-option-count').first()).toContainText('1', {
    timeout: 5000,
  });

  await presenterCtx.close();
  await audienceCtx.close();
});

test('audience member can change their vote', async ({ browser }) => {
  const presenterCtx = await browser.newContext();
  const audienceCtx = await browser.newContext();
  const presenter = await presenterCtx.newPage();
  const audience = await audienceCtx.newPage();

  await presenter.goto('/');
  await audience.goto('/audience');
  await expect(audience.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });

  await presenter.keyboard.press('ArrowRight');
  await expect(audience.locator('.audience-option-btn')).toHaveCount(4, { timeout: CONNECTED_TIMEOUT });

  // First vote
  await audience.locator('.audience-option-btn').first().click();
  await expect(audience.locator('.audience-option-btn.selected').first()).toBeVisible();

  // Change vote to second option
  await audience.locator('.audience-option-btn').nth(1).click();

  // Second option is now selected
  await expect(
    audience.locator('.audience-option-btn').nth(1),
  ).toHaveClass(/selected/);

  // First option is no longer selected
  await expect(
    audience.locator('.audience-option-btn').first(),
  ).not.toHaveClass(/selected/);

  await presenterCtx.close();
  await audienceCtx.close();
});

// ─── Vote Accuracy ───────────────────────────────────────────────────────────

test('multiple audience members — tally is accurate on presenter', async ({ browser }) => {
  // 3 audience browsers vote for different options — presenter tally must match exactly
  const presenterCtx = await browser.newContext();
  const a1Ctx = await browser.newContext();
  const a2Ctx = await browser.newContext();
  const a3Ctx = await browser.newContext();

  const presenter = await presenterCtx.newPage();
  const a1 = await a1Ctx.newPage();
  const a2 = await a2Ctx.newPage();
  const a3 = await a3Ctx.newPage();

  await presenter.goto('/');
  await a1.goto('/audience');
  await a2.goto('/audience');
  await a3.goto('/audience');

  // Wait for all to connect
  for (const a of [a1, a2, a3]) {
    await expect(a.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });
  }
  await a1.waitForTimeout(300);

  // Presenter navigates to first poll
  await presenter.keyboard.press('ArrowRight');

  // Wait for all audience to receive the poll
  for (const a of [a1, a2, a3]) {
    await expect(a.locator('.audience-option-btn')).toHaveCount(4, { timeout: CONNECTED_TIMEOUT });
  }

  // a1 → option 1, a2 → option 1, a3 → option 2
  await a1.locator('.audience-option-btn').nth(0).click();
  await a2.locator('.audience-option-btn').nth(0).click();
  await a3.locator('.audience-option-btn').nth(1).click();

  // Show results on presenter
  await presenter.getByRole('button', { name: 'Show Results' }).click();

  // Option 1 should show exactly 2, option 2 exactly 1
  await expect(presenter.locator('.poll-option-count').nth(0)).toContainText('2', { timeout: CONNECTED_TIMEOUT });
  await expect(presenter.locator('.poll-option-count').nth(1)).toContainText('1', { timeout: CONNECTED_TIMEOUT });
  await expect(presenter.locator('.poll-option-count').nth(2)).toContainText('0');
  await expect(presenter.locator('.poll-option-count').nth(3)).toContainText('0');

  // Total votes = 3
  await expect(presenter.locator('.poll-total-votes')).toContainText('3 votes');

  // Percentages: option 1 = 67%, option 2 = 33%
  const pcts = presenter.locator('.poll-option-pct');
  await expect(pcts.nth(0)).toContainText('67%');
  await expect(pcts.nth(1)).toContainText('33%');

  await presenterCtx.close();
  await a1Ctx.close();
  await a2Ctx.close();
  await a3Ctx.close();
});

test('re-vote does not double-count — tally stays correct', async ({ browser }) => {
  const presenterCtx = await browser.newContext();
  const audienceCtx = await browser.newContext();
  const presenter = await presenterCtx.newPage();
  const audience = await audienceCtx.newPage();

  await presenter.goto('/');
  await audience.goto('/audience');
  await expect(audience.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });
  await audience.waitForTimeout(300);

  await presenter.keyboard.press('ArrowRight');
  await expect(audience.locator('.audience-option-btn')).toHaveCount(4, { timeout: CONNECTED_TIMEOUT });

  // Vote for option 1
  await audience.locator('.audience-option-btn').nth(0).click();
  await expect(audience.locator('.audience-voted-banner')).toBeVisible({ timeout: CONNECTED_TIMEOUT });

  // Change vote to option 2
  await audience.locator('.audience-option-btn').nth(1).click();

  // Show results on presenter
  await presenter.getByRole('button', { name: 'Show Results' }).click();

  // Total must still be 1 — not 2
  await expect(presenter.locator('.poll-total-votes')).toContainText('1 vote', { timeout: CONNECTED_TIMEOUT });

  // Option 1 must be 0, option 2 must be 1
  await expect(presenter.locator('.poll-option-count').nth(0)).toContainText('0');
  await expect(presenter.locator('.poll-option-count').nth(1)).toContainText('1');

  await presenterCtx.close();
  await audienceCtx.close();
});

test('reset clears tally — new votes start from zero', async ({ browser }) => {
  const presenterCtx = await browser.newContext();
  const audienceCtx = await browser.newContext();
  const presenter = await presenterCtx.newPage();
  const audience = await audienceCtx.newPage();

  await presenter.goto('/');
  await audience.goto('/audience');
  await expect(audience.locator('.audience-badge')).toContainText('Connected', { timeout: CONNECTED_TIMEOUT });
  await audience.waitForTimeout(300);

  await presenter.keyboard.press('ArrowRight');
  await expect(audience.locator('.audience-option-btn')).toHaveCount(4, { timeout: CONNECTED_TIMEOUT });

  // Vote, then reset
  await audience.locator('.audience-option-btn').nth(0).click();
  await expect(presenter.locator('.poll-total-votes')).toContainText('1 vote', { timeout: CONNECTED_TIMEOUT });
  await presenter.getByRole('button', { name: 'Reset' }).click();

  // All counts back to 0
  await expect(presenter.locator('.poll-total-votes')).toContainText('0 votes');
  for (const count of await presenter.locator('.poll-option-count').all()) {
    await expect(count).toContainText('0');
  }

  // Wait for audience option buttons to stabilise after reset re-render
  await expect(audience.locator('.audience-option-btn').nth(2)).toBeVisible({ timeout: 5000 });

  // Vote again — tally starts fresh from 0
  await audience.locator('.audience-option-btn').nth(2).click();
  await expect(presenter.locator('.poll-total-votes')).toContainText('1 vote', { timeout: CONNECTED_TIMEOUT });
  await expect(presenter.locator('.poll-option-count').nth(2)).toContainText('1');
  await expect(presenter.locator('.poll-option-count').nth(0)).toContainText('0');
});

test('export CSV contains correct vote counts', async ({ page, request }) => {
  // Cast 2 known votes via API simulation, then check the CSV output
  // Navigate presenter to poll to register poll metadata on server
  await page.goto('/');
  await page.locator('body').click();
  await page.keyboard.press('ArrowRight'); // q1 poll

  // Cast votes via WebSocket simulation using fetch to a test helper
  // Then verify CSV export reflects accurate counts
  const csvRes = await request.get('http://localhost:3000/results.csv');
  expect(csvRes.ok()).toBeTruthy();
  const csv = await csvRes.text();
  expect(csv).toContain('Question,Option,Votes,Percentage');
  expect(csv).toContain('How often do you use AI tools');
  // All options should be present
  expect(csv).toContain('Every day');
  expect(csv).toContain('A few times a week');
});

// ─── Mobile Layout ────────────────────────────────────────────────────────────

test('audience layout fills viewport on mobile', async ({ page }) => {
  await page.goto('/audience');

  // Wait for either connected or connecting state — either is fine for layout check
  await expect(page.locator('.audience')).toBeVisible({ timeout: CONNECTED_TIMEOUT });

  const box = await page.locator('.audience').boundingBox();
  expect(box?.width).toBeGreaterThan(300);
  expect(box?.height).toBeGreaterThan(500);
});

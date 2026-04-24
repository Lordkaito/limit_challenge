import { test, expect } from '@playwright/test';

test.describe('Submission list page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/submissions');
  });

  test('loads the list page and shows submissions', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Submissions' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'submissions table' })).toBeVisible();
  });

  test('shows company names in the table', async ({ page }) => {
    await expect(page.getByText('Acme Corp')).toBeVisible();
    await expect(page.getByText('Globex Inc')).toBeVisible();
    await expect(page.getByText('Initech LLC')).toBeVisible();
  });

  test('filter by status updates URL and filters results', async ({ page }) => {
    // Open status dropdown and select "New"
    await page.getByLabel('Filter by status').click();
    await page.getByRole('option', { name: 'New' }).click();

    // URL should contain status=new
    await expect(page).toHaveURL(/status=new/);

    // Only Acme Corp (status=new) should be visible
    await expect(page.getByText('Acme Corp')).toBeVisible();
    await expect(page.getByText('Globex Inc')).not.toBeVisible();
    await expect(page.getByText('Initech LLC')).not.toBeVisible();
  });

  test('filter by priority updates URL', async ({ page }) => {
    await page.getByLabel('Filter by priority').click();
    await page.getByRole('option', { name: 'High' }).click();
    await expect(page).toHaveURL(/priority=high/);
  });

  test('company search filters by company name', async ({ page }) => {
    await page.getByLabel('Search companies').fill('Acme');
    // Wait for debounce (300ms) + network
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/companySearch=Acme/);
    await expect(page.getByText('Acme Corp')).toBeVisible();
  });

  test('clear all filters button resets URL', async ({ page }) => {
    // Apply a filter first
    await page.getByLabel('Filter by status').click();
    await page.getByRole('option', { name: 'New' }).click();
    await expect(page).toHaveURL(/status=new/);

    // Clear all
    await page.getByRole('button', { name: /clear all/i }).click();
    await expect(page).not.toHaveURL(/status=/);
    await expect(page.getByText('Acme Corp')).toBeVisible();
    await expect(page.getByText('Globex Inc')).toBeVisible();
  });

  test('clicking a table row navigates to detail page', async ({ page }) => {
    // Click on Acme Corp row
    await page.getByRole('button', { name: /view submission for acme corp/i }).click();
    await expect(page).toHaveURL(/\/submissions\/\d+/);
    await expect(page.getByText('Acme Corp')).toBeVisible();
  });
});

test.describe('Submission detail page', () => {
  test('shows all sections for a submission with data', async ({ page }) => {
    // Navigate to list first to find a submission ID
    await page.goto('/submissions');
    await page.getByRole('button', { name: /view submission for globex inc/i }).click();

    // Should show company name as heading
    await expect(page.getByRole('heading', { name: 'Globex Inc' })).toBeVisible();

    // Should show status and priority chips
    await expect(page.getByText('In Review')).toBeVisible();
    await expect(page.getByText('Medium')).toBeVisible();

    // Should show contacts section
    await expect(page.getByText(/contacts/i).first()).toBeVisible();

    // Should show documents section
    await expect(page.getByText(/documents/i).first()).toBeVisible();

    // Should show notes section
    await expect(page.getByText(/notes/i).first()).toBeVisible();
  });

  test('back button returns to list with filter state preserved', async ({ page }) => {
    // Apply a filter on the list
    await page.goto('/submissions?status=in_review');

    // Click on Globex Inc (in_review status, so visible with filter)
    await page.getByRole('button', { name: /view submission for globex inc/i }).click();

    // Verify URL has submission id
    await expect(page).toHaveURL(/\/submissions\/\d+\?status=in_review/);

    // Click back button
    await page.getByRole('link', { name: /back to queue/i }).click();

    // Should be back on list with filter preserved
    await expect(page).toHaveURL(/\/submissions\?status=in_review/);
    await expect(page.getByText('Globex Inc')).toBeVisible();
  });

  test('shows empty states for submission with no contacts/docs/notes', async ({ page }) => {
    // Initech LLC has no contacts, documents, or notes
    await page.goto('/submissions');
    await page.getByRole('button', { name: /view submission for initech llc/i }).click();

    await expect(page.getByText('No contacts recorded')).toBeVisible();
    await expect(page.getByText('No documents attached')).toBeVisible();
    await expect(page.getByText('No notes yet')).toBeVisible();
  });
});

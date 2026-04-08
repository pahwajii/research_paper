import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage.js';
import { AddPaperPage } from '../pages/addPaperPage.js';
import { LibraryPage } from '../pages/libraryPage.js';
import { credentials, samplePaper, initialPapers } from '../utils/testData.js';

const getFilteredPapers = (url, papers) => {
  const params = new URL(url).searchParams;
  const domains = params.get('researchDomain')?.split(',') ?? [];
  const readingStages = params.get('readingStage')?.split(',') ?? [];

  return papers.filter((paper) => {
    const domainMatch = domains.length === 0 || domains.includes(paper.researchDomain);
    const stageMatch = readingStages.length === 0 || readingStages.includes(paper.readingStage);
    return domainMatch && stageMatch;
  });
};

test.describe('Paper CRUD flows', () => {
  test('User can create a paper record', async ({ page }) => {
    let papers = [...initialPapers];

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { name: 'Test User', email: credentials.email } })
      });
    });

    await page.route('**/api/papers*', async (route) => {
      const request = route.request();
      const url = request.url();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getFilteredPapers(url, papers))
        });
      } else if (request.method() === 'POST') {
        const body = JSON.parse(request.postData() || '{}');
        const newPaper = { _id: `paper-${papers.length + 1}`, ...body, paperFileUrl: '', paperFileName: '' };
        papers.push(newPaper);
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newPaper) });
      } else {
        await route.continue();
      }
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
    await expect(page).toHaveURL('http://127.0.0.1:5173/');

    const addPaperPage = new AddPaperPage(page);
    await addPaperPage.fillPaper(samplePaper);
    await addPaperPage.submit();
    await expect(addPaperPage.successMessage).toBeVisible();
  });

  test('User can filter papers by research domain and update reading stage', async ({ page }) => {
    let papers = [...initialPapers];

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { name: 'Test User', email: credentials.email } })
      });
    });

    await page.route('**/api/papers*', async (route) => {
      const request = route.request();
      const url = request.url();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getFilteredPapers(url, papers))
        });
      } else if (request.method() === 'PATCH') {
        const parts = request.url().split('/');
        const paperId = parts[parts.length - 2];
        const body = JSON.parse(request.postData() || '{}');
        papers = papers.map((paper) =>
          paper._id === paperId ? { ...paper, readingStage: body.readingStage } : paper
        );
        const updatedPaper = papers.find((paper) => paper._id === paperId);
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(updatedPaper) });
      } else {
        await route.continue();
      }
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
    await expect(page).toHaveURL('http://127.0.0.1:5173/');

    const libraryPage = new LibraryPage(page);
    await libraryPage.goto();
    await expect(page.getByText('Library Records')).toBeVisible();

    await libraryPage.selectResearchDomain('Computer Science');
    await expect(libraryPage.getPaperTitle('Interactive Data Visualizations')).toBeVisible();
    await expect(page.getByText('AI Ethics in Practice')).not.toBeVisible();

    await libraryPage.updateReadingStage('Interactive Data Visualizations', 'Fully Read');
    await expect(page.getByText('Fully Read')).toBeVisible();
  });
});

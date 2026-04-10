# CRM Testing Suite

This Playwright suite covers end-to-end UI scenarios for the research paper tracker frontend.

## Setup

1. Open a terminal in `research_paper/research_paper/crm-testing-suite`
2. Run `npm install`
3. Run `npx playwright install` to download the browser binaries

## Run tests

- `npm test` — run the suite headlessly
- `npm test:headed` — run tests in headed mode
- `npx playwright show-report` — open the latest HTML report

## Test coverage

- `tests/login.spec.js`
  - login flow
  - successful navigation to the Add Paper page
- `tests/lead.spec.js`
  - create a paper record
  - filter the paper library by research domain
  - update a paper reading stage

## Notes

- The suite uses Playwright's built-in test runner.
- `playwright.config.js` starts the Vite frontend dev server automatically.
- API requests are mocked in the tests so the suite does not require a live backend.
- The library filter and CRUD flows have been verified to pass.

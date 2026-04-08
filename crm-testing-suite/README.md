# CRM Testing Suite

This Playwright suite exercises the research paper CRUD UI in the `frontend` app.

## Setup

1. Open a terminal in `research_paper/crm-testing-suite`
2. Run `npm install`
3. Start tests with `npm test`

## What is covered

- `tests/login.spec.js`: login flow with mocked auth
- `tests/lead.spec.js`: create a paper record, filter by research domain, and update a paper record's stage

## Notes

- The suite uses Playwright's built-in runner.
- The Vite frontend app is started automatically by `playwright.config.js`.
- API requests are mocked so the suite can run without a live backend.

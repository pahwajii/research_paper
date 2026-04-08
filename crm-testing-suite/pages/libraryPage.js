export class LibraryPage {
  constructor(page) {
    this.page = page;
    this.readingStageFilter = page.getByRole('combobox').nth(0);
    this.researchDomainFilter = page.getByRole('combobox').nth(1);
    this.paperTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/library');
  }

  async selectResearchDomain(domain) {
    await this.researchDomainFilter.click();
    await this.page.getByRole('option', { name: domain }).click();
    await this.page.keyboard.press('Escape');
  }

  getRowByTitle(title) {
    return this.page.locator('tr', { hasText: title }).first();
  }

  getPaperTitle(title) {
    return this.page.getByText(title).first();
  }

  async updateReadingStage(title, newStage) {
    const row = this.getRowByTitle(title);
    const stageButton = row.getByRole('combobox').first();
    if (!(await stageButton.count())) {
      const fallback = row.locator('div[role="button"]').first();
      await fallback.click();
    } else {
      await stageButton.click();
    }
    await this.page.getByRole('option', { name: newStage }).click();
  }
}

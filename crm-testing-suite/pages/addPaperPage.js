export class AddPaperPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByLabel('Paper Title');
    this.authorInput = page.getByLabel('First Author Name');
    this.domainSelect = page.getByLabel('Research Domain');
    this.stageSelect = page.getByLabel('Reading Stage');
    this.citationInput = page.getByLabel('Citation Count');
    this.impactSelect = page.getByLabel('Impact Score');
    this.dateInput = page.getByLabel('Date Added');
    this.addButton = page.getByRole('button', { name: /add paper/i });
    this.successMessage = page.getByText(/paper added successfully/i);
  }

  async goto() {
    await this.page.goto('/');
  }

  async fillPaper(paper) {
    await this.titleInput.fill(paper.title);
    await this.authorInput.fill(paper.firstAuthorName);
    await this.domainSelect.click();
    await this.page.getByRole('option', { name: paper.researchDomain }).click();
    await this.stageSelect.click();
    await this.page.getByRole('option', { name: paper.readingStage }).click();
    await this.citationInput.fill(String(paper.citationCount));
    await this.impactSelect.click();
    await this.page.getByRole('option', { name: paper.impactScore }).click();
    await this.dateInput.fill(paper.dateAdded);
  }

  async submit() {
    await this.addButton.click();
  }
}

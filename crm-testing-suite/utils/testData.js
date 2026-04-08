export const credentials = {
  email: 'test.user@example.com',
  password: 'Welcome123!'
};

export const samplePaper = {
  title: 'AI-Driven Paper Tracking',
  firstAuthorName: 'Lakshay Pahwa',
  researchDomain: 'Computer Science',
  readingStage: 'Abstract Read',
  citationCount: 12,
  impactScore: 'High Impact',
  dateAdded: new Date().toISOString().slice(0, 10)
};

export const initialPapers = [
  {
    _id: 'paper-1',
    title: 'Interactive Data Visualizations',
    firstAuthorName: 'Alice Chen',
    researchDomain: 'Computer Science',
    readingStage: 'Abstract Read',
    citationCount: 28,
    impactScore: 'Medium Impact',
    dateAdded: new Date().toISOString().slice(0, 10),
    paperFileUrl: '',
    paperFileName: ''
  },
  {
    _id: 'paper-2',
    title: 'AI Ethics in Practice',
    firstAuthorName: 'Brian Kapoor',
    researchDomain: 'Mathematics',
    readingStage: 'Introduction Done',
    citationCount: 9,
    impactScore: 'High Impact',
    dateAdded: new Date().toISOString().slice(0, 10),
    paperFileUrl: '',
    paperFileName: ''
  }
];

export const RESEARCH_DOMAINS = [
  "Computer Science",
  "Biology",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Social Sciences"
] as const;

export const READING_STAGES = [
  "Abstract Read",
  "Introduction Done",
  "Methodology Done",
  "Results Analyzed",
  "Fully Read",
  "Notes Completed"
] as const;

export const IMPACT_SCORES = [
  "High Impact",
  "Medium Impact",
  "Low Impact",
  "Unknown"
] as const;

export const DATE_FILTERS = [
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last 3 Months", value: "last_3_months" },
  { label: "All Time", value: "all_time" }
] as const;

export type ResearchDomain = (typeof RESEARCH_DOMAINS)[number];
export type ReadingStage = (typeof READING_STAGES)[number];
export type ImpactScore = (typeof IMPACT_SCORES)[number];
export type DateFilterValue = (typeof DATE_FILTERS)[number]["value"];

export interface Paper {
  _id: string;
  title: string;
  firstAuthorName: string;
  researchDomain: ResearchDomain;
  readingStage: ReadingStage;
  readingStageHistory?: Array<{
    readingStage: ReadingStage;
    changedAt: string;
  }>;
  citationCount: number;
  impactScore: ImpactScore;
  dateAdded: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface PaperFormInput {
  title: string;
  firstAuthorName: string;
  researchDomain: ResearchDomain;
  readingStage: ReadingStage;
  citationCount: number;
  impactScore: ImpactScore;
  dateAdded: string;
}

export interface PaperFilters {
  readingStage: ReadingStage[];
  researchDomain: ResearchDomain[];
  impactScore: ImpactScore[];
  dateAdded: DateFilterValue;
}

export interface FunnelPoint {
  readingStage: ReadingStage;
  count: number;
}

export interface ScatterPoint {
  id: string;
  title: string;
  citationCount: number;
  impactScore: ImpactScore;
  researchDomain: ResearchDomain;
}

export type StackedPoint = {
  researchDomain: ResearchDomain;
} & Record<ReadingStage, number>;

export interface SummaryResponse {
  papersByReadingStage: Array<{ readingStage: ReadingStage; count: number }>;
  averageCitationsPerDomain: Array<{ researchDomain: ResearchDomain; averageCitationCount: number }>;
  completionRate: {
    percent: number;
    fullyReadCount: number;
    total: number;
  };
}

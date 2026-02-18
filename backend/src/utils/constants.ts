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

export const DATE_RANGE_PRESETS = [
  "this_week",
  "this_month",
  "last_3_months",
  "all_time"
] as const;

export type ResearchDomain = (typeof RESEARCH_DOMAINS)[number];
export type ReadingStage = (typeof READING_STAGES)[number];
export type ImpactScore = (typeof IMPACT_SCORES)[number];
export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number];

import { FilterQuery } from "mongoose";
import { Paper } from "../models/paper.model";
import {
  DATE_RANGE_PRESETS,
  DateRangePreset,
  IMPACT_SCORES,
  READING_STAGES,
  RESEARCH_DOMAINS
} from "./constants";

const asArray = (value?: string | string[]): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => item.split(","));
  return value.split(",");
};

const parseDateRange = (preset?: string): Date | null => {
  if (!preset || !DATE_RANGE_PRESETS.includes(preset as DateRangePreset)) return null;
  const now = new Date();
  if (preset === "all_time") return null;

  if (preset === "this_week") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const start = new Date(now);
    start.setDate(now.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (preset === "this_month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const start = new Date(now);
  start.setMonth(start.getMonth() - 3);
  return start;
};

export interface PaperQueryInput {
  readingStage?: string | string[];
  researchDomain?: string | string[];
  impactScore?: string | string[];
  dateAdded?: string;
}

export const buildPaperFilter = (query: PaperQueryInput): FilterQuery<Paper> => {
  const readingStages = asArray(query.readingStage).filter((stage) =>
    READING_STAGES.includes(stage as (typeof READING_STAGES)[number])
  );
  const researchDomains = asArray(query.researchDomain).filter((domain) =>
    RESEARCH_DOMAINS.includes(domain as (typeof RESEARCH_DOMAINS)[number])
  );
  const impactScores = asArray(query.impactScore).filter((score) =>
    IMPACT_SCORES.includes(score as (typeof IMPACT_SCORES)[number])
  );

  const filter: FilterQuery<Paper> = {};

  if (readingStages.length > 0) {
    filter.readingStage = { $in: readingStages };
  }
  if (researchDomains.length > 0) {
    filter.researchDomain = { $in: researchDomains };
  }
  if (impactScores.length > 0) {
    filter.impactScore = { $in: impactScores };
  }

  const startDate = parseDateRange(query.dateAdded);
  if (startDate) {
    filter.dateAdded = { $gte: startDate };
  }

  return filter;
};

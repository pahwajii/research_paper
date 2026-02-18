import { Schema, model } from "mongoose";
import {
  IMPACT_SCORES,
  READING_STAGES,
  RESEARCH_DOMAINS,
  ImpactScore,
  ReadingStage,
  ResearchDomain
} from "../utils/constants";

export interface Paper {
  userId: Schema.Types.ObjectId;
  title: string;
  firstAuthorName: string;
  paperFileUrl?: string;
  paperFileName?: string;
  researchDomain: ResearchDomain;
  readingStage: ReadingStage;
  readingStageHistory: Array<{
    readingStage: ReadingStage;
    changedAt: Date;
  }>;
  citationCount: number;
  impactScore: ImpactScore;
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paperSchema = new Schema<Paper>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    firstAuthorName: { type: String, required: true, trim: true },
    paperFileUrl: { type: String, required: false, trim: true },
    paperFileName: { type: String, required: false, trim: true },
    researchDomain: { type: String, enum: RESEARCH_DOMAINS, required: true },
    readingStage: { type: String, enum: READING_STAGES, required: true },
    readingStageHistory: [
      {
        readingStage: { type: String, enum: READING_STAGES, required: true },
        changedAt: { type: Date, required: true }
      }
    ],
    citationCount: { type: Number, required: true, min: 0 },
    impactScore: { type: String, enum: IMPACT_SCORES, required: true },
    dateAdded: { type: Date, required: true }
  },
  { timestamps: true }
);

paperSchema.index({ readingStage: 1 });
paperSchema.index({ researchDomain: 1 });
paperSchema.index({ impactScore: 1 });
paperSchema.index({ dateAdded: -1 });
paperSchema.index({ userId: 1, dateAdded: -1 });

export const PaperModel = model<Paper>("Paper", paperSchema);

import { Router } from "express";
import { Types } from "mongoose";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.middleware";
import { PaperModel } from "../models/paper.model";
import { IMPACT_SCORES, READING_STAGES, RESEARCH_DOMAINS } from "../utils/constants";
import { buildPaperFilter } from "../utils/query";

const router = Router();
const MAX_PAPER_FILE_SIZE = 10 * 1024 * 1024;
const PAPER_SORT_FIELDS = {
  dateAdded: "dateAdded",
  citationCount: "citationCount",
  updatedAt: "updatedAt",
  title: "title",
  firstAuthorName: "firstAuthorName"
} as const;
const PAPER_STRING_SORT_FIELDS = new Set<keyof typeof PAPER_SORT_FIELDS>(["title", "firstAuthorName"]);
type PaperSortField = keyof typeof PAPER_SORT_FIELDS;

router.use(requireAuth);

router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const body = req.body as Record<string, string | undefined>;
    const title = body.title?.trim() ?? "";
    const firstAuthorName = body.firstAuthorName?.trim() ?? "";
    const researchDomain = body.researchDomain ?? "";
    const readingStage = body.readingStage ?? "";
    const citationCount = Number(body.citationCount);
    const impactScore = body.impactScore ?? "";
    const dateAdded = body.dateAdded ? new Date(body.dateAdded) : null;
    const paperFileUrl = body.paperFileUrl?.trim() ?? "";
    const paperFileName = body.paperFileName?.trim() ?? "";

    if (!title || !firstAuthorName) {
      res.status(400).json({ message: "Paper title and first author name are required." });
      return;
    }
    if (!RESEARCH_DOMAINS.includes(researchDomain as (typeof RESEARCH_DOMAINS)[number])) {
      res.status(400).json({ message: "Invalid research domain." });
      return;
    }
    if (!READING_STAGES.includes(readingStage as (typeof READING_STAGES)[number])) {
      res.status(400).json({ message: "Invalid reading stage." });
      return;
    }
    if (!IMPACT_SCORES.includes(impactScore as (typeof IMPACT_SCORES)[number])) {
      res.status(400).json({ message: "Invalid impact score." });
      return;
    }
    if (Number.isNaN(citationCount) || citationCount < 0) {
      res.status(400).json({ message: "Citation count must be 0 or higher." });
      return;
    }
    if (!dateAdded || Number.isNaN(dateAdded.getTime())) {
      res.status(400).json({ message: "Date added is required." });
      return;
    }
    if (paperFileUrl && !paperFileUrl.startsWith("data:application/pdf;base64,")) {
      res.status(400).json({ message: "Attached paper must be a valid PDF." });
      return;
    }
    if (paperFileUrl) {
      const encodedPayload = paperFileUrl.split(",")[1] ?? "";
      const decodedSizeBytes = Buffer.byteLength(encodedPayload, "base64");
      if (decodedSizeBytes > MAX_PAPER_FILE_SIZE) {
        res.status(400).json({ message: "Paper file must be 10MB or smaller." });
        return;
      }
    }

    const paper = await PaperModel.create({
      title,
      firstAuthorName,
      researchDomain,
      readingStage,
      citationCount,
      impactScore,
      dateAdded,
      paperFileUrl: paperFileUrl || undefined,
      paperFileName: paperFileName || undefined,
      readingStageHistory: [
        {
          readingStage,
          changedAt: new Date()
        }
      ],
      userId: new Types.ObjectId(req.user.userId)
    });
    res.status(201).json(paper);
  } catch (error) {
    res.status(400).json({ message: "Failed to create paper", error });
  }
});

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const filter = buildPaperFilter({
      readingStage: req.query.readingStage as string | string[] | undefined,
      researchDomain: req.query.researchDomain as string | string[] | undefined,
      impactScore: req.query.impactScore as string | string[] | undefined,
      dateAdded: req.query.dateAdded as string | undefined
    });
    filter.userId = new Types.ObjectId(req.user.userId);
    const rawSortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "";
    const rawSortOrder = typeof req.query.sortOrder === "string" ? req.query.sortOrder : "";
    const sortBy: PaperSortField = Object.prototype.hasOwnProperty.call(PAPER_SORT_FIELDS, rawSortBy)
      ? (rawSortBy as PaperSortField)
      : "dateAdded";
    const sortOrder: 1 | -1 = rawSortOrder === "asc" ? 1 : -1;
    const sortSpec: Record<string, 1 | -1> = {
      [PAPER_SORT_FIELDS[sortBy]]: sortOrder
    };
    if (sortBy !== "dateAdded") {
      sortSpec.dateAdded = -1;
    }
    sortSpec.createdAt = -1;

    const papersQuery = PaperModel.find(filter).sort(sortSpec);
    if (PAPER_STRING_SORT_FIELDS.has(sortBy)) {
      papersQuery.collation({ locale: "en", strength: 2 });
    }
    const papers = await papersQuery;
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch papers", error });
  }
});

router.patch("/:id/reading-stage", async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { readingStage } = req.body as { readingStage?: string };

    if (!readingStage || !READING_STAGES.includes(readingStage as (typeof READING_STAGES)[number])) {
      res.status(400).json({ message: "Invalid reading stage." });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid paper id." });
      return;
    }

    const updatedPaper = await PaperModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(req.user.userId) },
      {
        $set: { readingStage },
        $push: {
          readingStageHistory: {
            readingStage,
            changedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedPaper) {
      res.status(404).json({ message: "Paper not found." });
      return;
    }

    res.json(updatedPaper);
  } catch (error) {
    res.status(500).json({ message: "Failed to update reading stage", error });
  }
});

export default router;

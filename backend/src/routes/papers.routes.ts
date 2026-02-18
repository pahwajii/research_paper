import { Router } from "express";
import { Types } from "mongoose";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.middleware";
import { PaperModel } from "../models/paper.model";
import { READING_STAGES } from "../utils/constants";
import { buildPaperFilter } from "../utils/query";

const router = Router();
router.use(requireAuth);

router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const paper = await PaperModel.create({
      ...req.body,
      readingStageHistory: [
        {
          readingStage: req.body.readingStage,
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

    const papers = await PaperModel.find(filter).sort({ dateAdded: -1, createdAt: -1 });
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

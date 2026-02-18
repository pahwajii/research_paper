import { Router } from "express";
import { Types } from "mongoose";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.middleware";
import { PaperModel } from "../models/paper.model";
import { READING_STAGES, RESEARCH_DOMAINS } from "../utils/constants";
import { buildPaperFilter } from "../utils/query";

const router = Router();
router.use(requireAuth);

router.get("/funnel", async (req: AuthenticatedRequest, res) => {
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

    const stageCounts = await PaperModel.aggregate<{ _id: string; count: number }>([
      { $match: filter },
      { $group: { _id: "$readingStage", count: { $sum: 1 } } }
    ]);

    const countMap = new Map(stageCounts.map((item) => [item._id, item.count]));
    const funnel = READING_STAGES.map((stage) => ({
      readingStage: stage,
      count: countMap.get(stage) ?? 0
    }));

    res.json(funnel);
  } catch (error) {
    res.status(500).json({ message: "Failed to compute funnel analytics", error });
  }
});

router.get("/scatter", async (req: AuthenticatedRequest, res) => {
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

    const papers = await PaperModel.find(filter, {
      _id: 1,
      title: 1,
      citationCount: 1,
      impactScore: 1,
      researchDomain: 1
    }).sort({ citationCount: -1 });

    const scatter = papers.map((paper) => ({
      id: String(paper._id),
      title: paper.title,
      citationCount: paper.citationCount,
      impactScore: paper.impactScore,
      researchDomain: paper.researchDomain
    }));

    res.json(scatter);
  } catch (error) {
    res.status(500).json({ message: "Failed to compute scatter analytics", error });
  }
});

router.get("/stacked-domain-stage", async (req: AuthenticatedRequest, res) => {
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

    const grouped = await PaperModel.aggregate<{ _id: { domain: string; stage: string }; count: number }>([
      { $match: filter },
      {
        $group: {
          _id: { domain: "$researchDomain", stage: "$readingStage" },
          count: { $sum: 1 }
        }
      }
    ]);

    const groupedMap = new Map<string, Record<string, number>>();
    for (const domain of RESEARCH_DOMAINS) {
      groupedMap.set(domain, {});
    }

    grouped.forEach((entry) => {
      if (!groupedMap.has(entry._id.domain)) {
        groupedMap.set(entry._id.domain, {});
      }
      groupedMap.get(entry._id.domain)![entry._id.stage] = entry.count;
    });

    const result = Array.from(groupedMap.entries()).map(([domain, stageCounts]) => {
      const row: Record<string, string | number> = { researchDomain: domain };
      for (const stage of READING_STAGES) {
        row[stage] = stageCounts[stage] ?? 0;
      }
      return row;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to compute stacked chart analytics", error });
  }
});

router.get("/summary", async (req: AuthenticatedRequest, res) => {
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

    const [stageCounts, avgCitations, totals] = await Promise.all([
      PaperModel.aggregate<{ _id: string; count: number }>([
        { $match: filter },
        { $group: { _id: "$readingStage", count: { $sum: 1 } } }
      ]),
      PaperModel.aggregate<{ _id: string; avgCitationCount: number }>([
        { $match: filter },
        { $group: { _id: "$researchDomain", avgCitationCount: { $avg: "$citationCount" } } },
        { $sort: { _id: 1 } }
      ]),
      PaperModel.aggregate<{ _id: null; total: number; fullyReadCount: number }>([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            fullyReadCount: {
              $sum: {
                $cond: [{ $eq: ["$readingStage", "Fully Read"] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const stageMap = new Map(stageCounts.map((item) => [item._id, item.count]));
    const papersByReadingStage = READING_STAGES.map((stage) => ({
      readingStage: stage,
      count: stageMap.get(stage) ?? 0
    }));

    const averageCitationsPerDomain = RESEARCH_DOMAINS.map((domain) => {
      const domainValue = avgCitations.find((item) => item._id === domain);
      return {
        researchDomain: domain,
        averageCitationCount: domainValue ? Number(domainValue.avgCitationCount.toFixed(2)) : 0
      };
    });

    const total = totals[0]?.total ?? 0;
    const fullyReadCount = totals[0]?.fullyReadCount ?? 0;
    const completionRate = total === 0 ? 0 : Number(((fullyReadCount / total) * 100).toFixed(2));

    res.json({
      papersByReadingStage,
      averageCitationsPerDomain,
      completionRate: {
        percent: completionRate,
        fullyReadCount,
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to compute summary analytics", error });
  }
});

export default router;

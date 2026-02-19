import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  Label,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  getFunnelAnalytics,
  getScatterAnalytics,
  getStackedAnalytics,
  getSummaryAnalytics
} from "../api/client";
import { FilterPanel } from "../components/FilterPanel";
import {
  IMPACT_SCORES,
  PaperFilters,
  ScatterPoint,
  StackedPoint,
  SummaryResponse
} from "../types";

const defaultFilters: PaperFilters = {
  readingStage: [],
  researchDomain: [],
  impactScore: [],
  dateAdded: "all_time"
};

const impactColors: Record<string, string> = {
  "High Impact": "#D32F2F",
  "Medium Impact": "#F9A825",
  "Low Impact": "#1976D2",
  Unknown: "#757575"
};
const impactScoreToAxisValue = IMPACT_SCORES.reduce<Record<string, number>>((acc, score, index) => {
  acc[score] = index + 1;
  return acc;
}, {});
const impactAxisTicks = IMPACT_SCORES.map((_, index) => index + 1);

export const AnalyticsPage = () => {
  const [filters, setFilters] = useState<PaperFilters>(defaultFilters);
  const [funnelData, setFunnelData] = useState<Array<{ readingStage: string; count: number }>>([]);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);
  const [stackedData, setStackedData] = useState<StackedPoint[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [funnel, scatter, stacked, summaryData] = await Promise.all([
          getFunnelAnalytics(filters),
          getScatterAnalytics(filters),
          getStackedAnalytics(filters),
          getSummaryAnalytics(filters)
        ]);
        setFunnelData(funnel);
        setScatterData(scatter);
        setStackedData(stacked);
        setSummary(summaryData);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load analytics.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAnalytics();
  }, [filters]);

  const scatterSeries = useMemo(() => {
    return IMPACT_SCORES.map((impact) => ({
      impact,
      color: impactColors[impact],
      points: scatterData
        .filter((item) => item.impactScore === impact)
        .map((item) => ({
          x: item.citationCount,
          y: impactScoreToAxisValue[item.impactScore],
          title: item.title
        }))
    }));
  }, [scatterData]);
  const visibleFunnelData = useMemo(
    () => funnelData.filter((item) => item.count > 0),
    [funnelData]
  );

  return (
    <Stack spacing={{ xs: 1.5, md: 2 }}>
      <Card className="glass-card">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Reading Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Analyze reading progress, impact, and citation patterns.
          </Typography>
          <FilterPanel filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {isLoading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <Grid container spacing={1.5} alignItems="stretch">
            <Grid size={{ xs: 12, md: 4 }}>
              <Card className="glass-card" sx={{ height: "100%" }}>
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Typography variant="subtitle1">Completion Rate</Typography>
                  <Typography variant="h4" color="primary.main">
                    {summary?.completionRate.percent ?? 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fully Read: {summary?.completionRate.fullyReadCount ?? 0} / {summary?.completionRate.total ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card className="glass-card" sx={{ height: "100%" }}>
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                    Papers by Reading Stage
                  </Typography>
                  <Grid container spacing={0.5}>
                    {summary?.papersByReadingStage.map((item) => (
                      <Grid key={item.readingStage} size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2">
                          <strong>{item.readingStage}:</strong> {item.count}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card className="glass-card">
            <CardContent sx={{ "&:last-child": { pb: 2 } }}>
              <Typography variant="subtitle1" gutterBottom>
                Average Citations per Domain
              </Typography>
              <Grid container spacing={1}>
                {summary?.averageCitationsPerDomain.map((item) => (
                  <Grid key={item.researchDomain} size={{ xs: 12, md: 4 }}>
                    <Typography variant="body2">
                      {item.researchDomain}: {item.averageCitationCount}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={1.5} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card className="glass-card" sx={{ height: "100%" }}>
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Funnel: Reading Stage Counts
                  </Typography>
                  {visibleFunnelData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={285}>
                      <FunnelChart>
                        <Tooltip />
                        <Funnel dataKey="count" data={visibleFunnelData} nameKey="readingStage">
                          {visibleFunnelData.map((entry, index) => (
                            <Cell key={`${entry.readingStage}-${index}`} fill={`hsl(${index * 45}, 70%, 45%)`} />
                          ))}
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No funnel data available for current filters.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card className="glass-card" sx={{ height: "100%" }}>
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Scatter: Citation Count by Impact Score
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    X-axis: Citation Count | Y-axis: Impact Score
                  </Typography>
                  <ResponsiveContainer width="100%" height={285}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 20 }}>
                      <CartesianGrid />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Citation Count"
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                      >
                        <Label
                          value="Citation Count"
                          position="insideBottom"
                          offset={-5}
                          style={{ fontWeight: 700, fontSize: 14 }}
                        />
                      </XAxis>
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Impact Score"
                        allowDecimals={false}
                        ticks={impactAxisTicks}
                        domain={[0.5, IMPACT_SCORES.length + 0.5]}
                        width={105}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => IMPACT_SCORES[Number(value) - 1] ?? ""}
                      >
                        <Label value="Impact Score" angle={-90} position="insideLeft" style={{ fontWeight: 700, fontSize: 14 }} />
                      </YAxis>
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Legend />
                      {scatterSeries.map((series) => (
                        <Scatter
                          key={series.impact}
                          name={series.impact}
                          data={series.points}
                          fill={series.color}
                          line={false}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card className="glass-card">
            <CardContent sx={{ "&:last-child": { pb: 2 } }}>
              <Typography variant="subtitle1" gutterBottom>
                Stacked Bar: Domain vs Reading Stage
              </Typography>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={stackedData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="researchDomain" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {["Abstract Read", "Introduction Done", "Methodology Done", "Results Analyzed", "Fully Read", "Notes Completed"].map(
                    (stage, index) => (
                      <Bar key={stage} dataKey={stage} stackId="stage" fill={`hsl(${index * 40}, 65%, 45%)`} />
                    )
                  )}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
};

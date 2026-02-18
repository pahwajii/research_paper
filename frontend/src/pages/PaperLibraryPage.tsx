import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { getPapers, updatePaperReadingStage } from "../api/client";
import { FilterPanel } from "../components/FilterPanel";
import { Paper, PaperFilters, READING_STAGES, ReadingStage } from "../types";

const defaultFilters: PaperFilters = {
  readingStage: [],
  researchDomain: [],
  impactScore: [],
  dateAdded: "all_time"
};

export const PaperLibraryPage = () => {
  const [filters, setFilters] = useState<PaperFilters>(defaultFilters);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingPaperId, setUpdatingPaperId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getPapers(filters);
        setPapers(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load papers.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPapers();
  }, [filters]);

  const onReadingStageChange = async (paperId: string, readingStage: ReadingStage) => {
    try {
      setUpdatingPaperId(paperId);
      setError("");
      const updatedPaper = await updatePaperReadingStage(paperId, readingStage);
      setPapers((prev) => prev.map((paper) => (paper._id === paperId ? updatedPaper : paper)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update reading stage.");
    } finally {
      setUpdatingPaperId("");
    }
  };

  return (
    <Stack spacing={2}>
      <Card className="glass-card">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Paper Library
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Filter papers by reading stage, domain, impact score, and date added.
          </Typography>
          <FilterPanel filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Library Records</Typography>
            <Chip label={`Total Papers: ${papers.length}`} color="primary" sx={{ fontWeight: 600 }} />
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {isLoading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : (
            <TableContainer sx={{ borderRadius: 2, border: "1px solid rgba(11,92,173,0.12)" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "rgba(11,92,173,0.06)" } }}>
                    <TableCell>Paper Title</TableCell>
                    <TableCell>First Author Name</TableCell>
                    <TableCell>Research Domain</TableCell>
                    <TableCell>Reading Stage</TableCell>
                    <TableCell>Citation Count</TableCell>
                    <TableCell>Impact Score</TableCell>
                    <TableCell>Date Added</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {papers.map((paper) => (
                    <TableRow key={paper._id}>
                      <TableCell>{paper.title}</TableCell>
                      <TableCell>{paper.firstAuthorName}</TableCell>
                      <TableCell>{paper.researchDomain}</TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={paper.readingStage}
                            disabled={updatingPaperId === paper._id}
                            onChange={(event) =>
                              void onReadingStageChange(paper._id, event.target.value as ReadingStage)
                            }
                          >
                            {READING_STAGES.map((stage) => (
                              <MenuItem key={stage} value={stage}>
                                {stage}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>{paper.citationCount}</TableCell>
                      <TableCell>{paper.impactScore}</TableCell>
                      <TableCell>{new Date(paper.dateAdded).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {papers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No papers found for selected filters.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

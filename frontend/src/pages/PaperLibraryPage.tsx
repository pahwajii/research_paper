import {
  Alert,
  Link,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
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
import {
  Paper,
  PaperFilters,
  PAPER_SORT_OPTIONS,
  READING_STAGES,
  ReadingStage,
  SORT_ORDERS,
  PaperSortField,
  SortOrder
} from "../types";

const defaultFilters: PaperFilters = {
  readingStage: [],
  researchDomain: [],
  impactScore: [],
  dateAdded: "all_time"
};

export const PaperLibraryPage = () => {
  const [filters, setFilters] = useState<PaperFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState<PaperSortField>("dateAdded");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingPaperId, setUpdatingPaperId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getPapers(filters, { sortBy, sortOrder });
        setPapers(response);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load papers.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPapers();
  }, [filters, sortBy, sortOrder]);

  const onReadingStageChange = async (paperId: string, readingStage: ReadingStage) => {
    try {
      setUpdatingPaperId(paperId);
      setError("");
      await updatePaperReadingStage(paperId, readingStage);
      const response = await getPapers(filters, { sortBy, sortOrder });
      setPapers(response);
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
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">Library Records</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(event) => setSortBy(event.target.value as PaperSortField)}
                >
                  {PAPER_SORT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                >
                  {SORT_ORDERS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Chip label={`Total Papers: ${papers.length}`} color="primary" sx={{ fontWeight: 600 }} />
            </Stack>
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
                    <TableCell>Attached Paper</TableCell>
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
                      <TableCell>
                        {paper.paperFileUrl ? (
                          <Link href={paper.paperFileUrl} target="_blank" rel="noreferrer">
                            View PDF
                          </Link>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Record only
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {papers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
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

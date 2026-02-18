import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useMemo, useState } from "react";
import { createPaper } from "../api/client";
import { IMPACT_SCORES, PaperFormInput, READING_STAGES, RESEARCH_DOMAINS } from "../types";

const getDefaultForm = (): PaperFormInput => ({
  title: "",
  firstAuthorName: "",
  researchDomain: RESEARCH_DOMAINS[0],
  readingStage: READING_STAGES[0],
  citationCount: 0,
  impactScore: "Unknown",
  dateAdded: new Date().toISOString().slice(0, 10)
});

export const AddPaperPage = () => {
  const [form, setForm] = useState<PaperFormInput>(getDefaultForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const validationError = useMemo(() => {
    if (!form.title.trim()) return "Paper Title is required.";
    if (!form.firstAuthorName.trim()) return "First Author Name is required.";
    if (Number.isNaN(form.citationCount) || form.citationCount < 0) return "Citation Count must be 0 or higher.";
    if (!form.dateAdded) return "Date Added is required.";
    return "";
  }, [form]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");
      await createPaper(form);
      setMessage("Paper added successfully.");
      setForm(getDefaultForm());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add paper.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ letterSpacing: 0.2 }}>
          Add Research Paper
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 700 }}>
          Fill all fields to add a paper to your persistent library.
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2.2}>
            {message ? <Alert severity="success">{message}</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Paper Title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />

            <TextField
              label="First Author Name"
              value={form.firstAuthorName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstAuthorName: event.target.value }))}
              required
            />

            <TextField
              select
              label="Research Domain"
              value={form.researchDomain}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, researchDomain: event.target.value as PaperFormInput["researchDomain"] }))
              }
            >
              {RESEARCH_DOMAINS.map((domain) => (
                <MenuItem key={domain} value={domain}>
                  {domain}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Reading Stage"
              value={form.readingStage}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, readingStage: event.target.value as PaperFormInput["readingStage"] }))
              }
            >
              {READING_STAGES.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Citation Count"
              type="number"
              value={form.citationCount}
              onChange={(event) => setForm((prev) => ({ ...prev, citationCount: Number(event.target.value) }))}
              inputProps={{ min: 0 }}
              required
            />

            <TextField
              select
              label="Impact Score"
              value={form.impactScore}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, impactScore: event.target.value as PaperFormInput["impactScore"] }))
              }
            >
              {IMPACT_SCORES.map((impact) => (
                <MenuItem key={impact} value={impact}>
                  {impact}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Date Added"
              type="date"
              value={form.dateAdded}
              onChange={(event) => setForm((prev) => ({ ...prev, dateAdded: event.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                py: 1.2,
                background: "linear-gradient(135deg, #0B5CAD 0%, #1F8A70 100%)"
              }}
            >
              {isSubmitting ? "Saving..." : "Add Paper"}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

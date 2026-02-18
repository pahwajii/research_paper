import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  DATE_FILTERS,
  IMPACT_SCORES,
  PaperFilters,
  READING_STAGES,
  RESEARCH_DOMAINS
} from "../types";

interface Props {
  filters: PaperFilters;
  onChange: (filters: PaperFilters) => void;
}

const menuProps = {
  PaperProps: {
    style: {
      maxHeight: 300
    }
  }
};

const readMultiValue = (event: SelectChangeEvent<string[]>): string[] => {
  const value = event.target.value;
  return typeof value === "string" ? value.split(",") : value;
};

export const FilterPanel = ({ filters, onChange }: Props) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Reading Stage</InputLabel>
          <Select
            multiple
            value={filters.readingStage}
            onChange={(event) =>
              onChange({
                ...filters,
                readingStage: readMultiValue(event) as PaperFilters["readingStage"]
              })
            }
            input={<OutlinedInput label="Reading Stage" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
            MenuProps={menuProps}
          >
            {READING_STAGES.map((stage) => (
              <MenuItem key={stage} value={stage}>
                {stage}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Research Domain</InputLabel>
          <Select
            multiple
            value={filters.researchDomain}
            onChange={(event) =>
              onChange({
                ...filters,
                researchDomain: readMultiValue(event) as PaperFilters["researchDomain"]
              })
            }
            input={<OutlinedInput label="Research Domain" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
            MenuProps={menuProps}
          >
            {RESEARCH_DOMAINS.map((domain) => (
              <MenuItem key={domain} value={domain}>
                {domain}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Impact Score</InputLabel>
          <Select
            multiple
            value={filters.impactScore}
            onChange={(event) =>
              onChange({
                ...filters,
                impactScore: readMultiValue(event) as PaperFilters["impactScore"]
              })
            }
            input={<OutlinedInput label="Impact Score" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
            MenuProps={menuProps}
          >
            {IMPACT_SCORES.map((impact) => (
              <MenuItem key={impact} value={impact}>
                {impact}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Date Added</InputLabel>
          <Select
            value={filters.dateAdded}
            label="Date Added"
            onChange={(event) =>
              onChange({
                ...filters,
                dateAdded: event.target.value as PaperFilters["dateAdded"]
              })
            }
          >
            {DATE_FILTERS.map((dateFilter) => (
              <MenuItem key={dateFilter.value} value={dateFilter.value}>
                {dateFilter.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

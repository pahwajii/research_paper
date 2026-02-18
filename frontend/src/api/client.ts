import {
  AuthResponse,
  FunnelPoint,
  Paper,
  PaperFilters,
  PaperFormInput,
  PaperSortField,
  SortOrder,
  ScatterPoint,
  StackedPoint,
  SummaryResponse,
  ReadingStage
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
const TOKEN_KEY = "rpt_auth_token";
const USER_KEY = "rpt_auth_user";

const buildQueryParams = (
  filters: PaperFilters,
  sort?: { sortBy?: PaperSortField; sortOrder?: SortOrder }
): string => {
  const params = new URLSearchParams();
  if (filters.readingStage.length > 0) {
    params.set("readingStage", filters.readingStage.join(","));
  }
  if (filters.researchDomain.length > 0) {
    params.set("researchDomain", filters.researchDomain.join(","));
  }
  if (filters.impactScore.length > 0) {
    params.set("impactScore", filters.impactScore.join(","));
  }
  params.set("dateAdded", filters.dateAdded);
  if (sort?.sortBy) {
    params.set("sortBy", sort.sortBy);
  }
  if (sort?.sortOrder) {
    params.set("sortOrder", sort.sortOrder);
  }
  return params.toString();
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem(TOKEN_KEY);
  const isFormDataBody = options?.body instanceof FormData;
  const headers = {
    ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers ?? {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = "/login";
    }
    const text = await response.text();
    try {
      const parsed = JSON.parse(text) as { message?: string };
      throw new Error(parsed.message || `Request failed with status ${response.status}`);
    } catch {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
  }
  return response.json() as Promise<T>;
};

export const signup = (input: { name: string; email: string; password: string }): Promise<AuthResponse> =>
  request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input)
  });

export const login = (input: { email: string; password: string }): Promise<AuthResponse> =>
  request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });

export const createPaper = (input: PaperFormInput): Promise<Paper> =>
  request<Paper>("/papers", {
    method: "POST",
    body: JSON.stringify(input)
  });

export const createPaperWithOptionalFile = (input: PaperFormInput, file?: File | null): Promise<Paper> => {
  if (!file) {
    return createPaper(input);
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read selected PDF file."));
    reader.onload = () => {
      const paperFileUrl = typeof reader.result === "string" ? reader.result : "";
      if (!paperFileUrl) {
        reject(new Error("Failed to process selected PDF file."));
        return;
      }

      request<Paper>("/papers", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          paperFileUrl,
          paperFileName: file.name
        })
      })
        .then(resolve)
        .catch(reject);
    };
    reader.readAsDataURL(file);
  });
};

export const getPapers = (
  filters: PaperFilters,
  sort?: { sortBy?: PaperSortField; sortOrder?: SortOrder }
): Promise<Paper[]> => request<Paper[]>(`/papers?${buildQueryParams(filters, sort)}`);

export const updatePaperReadingStage = (paperId: string, readingStage: ReadingStage): Promise<Paper> =>
  request<Paper>(`/papers/${paperId}/reading-stage`, {
    method: "PATCH",
    body: JSON.stringify({ readingStage })
  });

export const getFunnelAnalytics = (filters: PaperFilters): Promise<FunnelPoint[]> =>
  request<FunnelPoint[]>(`/analytics/funnel?${buildQueryParams(filters)}`);

export const getScatterAnalytics = (filters: PaperFilters): Promise<ScatterPoint[]> =>
  request<ScatterPoint[]>(`/analytics/scatter?${buildQueryParams(filters)}`);

export const getStackedAnalytics = (filters: PaperFilters): Promise<StackedPoint[]> =>
  request<StackedPoint[]>(`/analytics/stacked-domain-stage?${buildQueryParams(filters)}`);

export const getSummaryAnalytics = (filters: PaperFilters): Promise<SummaryResponse> =>
  request<SummaryResponse>(`/analytics/summary?${buildQueryParams(filters)}`);

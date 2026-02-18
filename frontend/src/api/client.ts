import {
  AuthResponse,
  FunnelPoint,
  Paper,
  PaperFilters,
  PaperFormInput,
  ScatterPoint,
  StackedPoint,
  SummaryResponse,
  ReadingStage
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
const TOKEN_KEY = "rpt_auth_token";
const USER_KEY = "rpt_auth_user";

const buildQueryParams = (filters: PaperFilters): string => {
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
  return params.toString();
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
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

export const getPapers = (filters: PaperFilters): Promise<Paper[]> =>
  request<Paper[]>(`/papers?${buildQueryParams(filters)}`);

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

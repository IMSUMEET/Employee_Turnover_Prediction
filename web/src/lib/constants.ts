import type { Band, EmployeeInput } from "./types";

export const DEPARTMENTS = [
  "IT",
  "admin",
  "engineering",
  "finance",
  "logistics",
  "marketing",
  "operations",
  "retail",
  "sales",
  "support",
];

export const SALARY_LEVELS = ["low", "medium", "high"] as const;

export const BAND_META: Record<
  Band,
  { label: string; text: string; bg: string; ring: string; hex: string }
> = {
  high: {
    label: "High risk",
    text: "text-risk-high",
    bg: "bg-risk-high",
    ring: "ring-risk-high/30",
    hex: "#e07856",
  },
  medium: {
    label: "Watch",
    text: "text-risk-med",
    bg: "bg-risk-med",
    ring: "ring-risk-med/30",
    hex: "#e0a458",
  },
  low: {
    label: "Stable",
    text: "text-risk-low",
    bg: "bg-risk-low",
    ring: "ring-risk-low/30",
    hex: "#5b8a72",
  },
};

// A sensible, mid-risk starting point for the single-prediction form.
export const SAMPLE_EMPLOYEE: EmployeeInput = {
  name: "Jordan Rivera",
  department: "sales",
  promoted: 0,
  review: 0.62,
  projects: 3,
  salary: "medium",
  tenure: 5,
  satisfaction: 0.55,
  bonus: 0,
  avg_hrs_month: 186,
};

export const FIELD_HINTS: Record<string, string> = {
  review: "Last evaluation score (0–1)",
  satisfaction: "Survey satisfaction (0–1)",
  tenure: "Years at the company",
  projects: "Active project count",
  avg_hrs_month: "Average hours worked per month",
};

export function bandFromRisk(risk: number): Band {
  if (risk >= 66) return "high";
  if (risk >= 40) return "medium";
  return "low";
}

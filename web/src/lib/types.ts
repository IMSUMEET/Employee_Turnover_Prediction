export type Band = "low" | "medium" | "high";
export type Salary = "low" | "medium" | "high";

export interface EmployeeInput {
  name?: string;
  department: string;
  promoted: number;
  review: number;
  projects: number;
  salary: Salary;
  tenure: number;
  satisfaction: number;
  bonus: number;
  avg_hrs_month: number;
}

export interface Driver {
  feature: string;
  label: string;
  value: number | string;
  impact: number;
  direction: "increases" | "decreases";
}

export interface Prediction {
  name: string | null;
  risk: number;
  will_leave: boolean;
  band: Band;
  drivers: Driver[];
  recommendations: string[];
}

export interface DepartmentStat {
  department: string;
  headcount: number;
  at_risk: number;
  avg_risk: number;
}

export interface BatchAnalytics {
  total: number;
  at_risk: number;
  avg_risk: number;
  bands: Record<Band, number>;
  by_department: DepartmentStat[];
  top_drivers: Driver[];
}

export interface BatchResult {
  predictions: Prediction[];
  analytics: BatchAnalytics;
}

export interface ModelInfo {
  dataset: { rows: number; attrition_rate: number };
  metrics: {
    accuracy: number;
    roc_auc: number;
    precision: number;
    recall: number;
    f1: number;
    cv_accuracy_mean: number;
    cv_accuracy_std: number;
    confusion_matrix: number[][];
  };
  feature_importance: Record<string, number>;
  model_comparison: { model: string; accuracy: number; roc_auc: number; f1: number }[];
  labels: Record<string, string>;
}

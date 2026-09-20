"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import type { ModelInfo } from "@/lib/types";

const tooltipStyle = {
  borderRadius: 16,
  border: "none",
  background: "#f6f1ea",
  boxShadow: "6px 6px 14px rgba(178,162,138,0.45)",
};

export default function InsightsPage() {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .modelInfo()
      .then(setInfo)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (error)
    return (
      <div className="clay-card p-8 text-center text-risk-high">{error}</div>
    );
  if (!info)
    return (
      <div className="grid place-items-center py-20 text-ink-faint">
        Loading model insights…
      </div>
    );

  const m = info.metrics;
  const importance = Object.entries(info.feature_importance)
    .map(([k, v]) => ({ feature: info.labels[k] ?? k, value: v }))
    .sort((a, b) => a.value - b.value);
  const comparison = [...info.model_comparison].sort((a, b) => a.roc_auc - b.roc_auc);
  const cm = m.confusion_matrix;
  const cmLabels = [
    ["True stay", "Predicted leave"],
    ["Predicted stay", "True leave"],
  ];

  return (
    <div className="space-y-6">
      <section className="clay-card p-6 md:p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Model insights
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          The served model is a CatBoost classifier trained on{" "}
          {info.dataset.rows.toLocaleString()} employees (
          {Math.round(info.dataset.attrition_rate * 100)}% attrition rate).
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Accuracy" value={`${(m.accuracy * 100).toFixed(1)}%`} accent="#7c6a9c" />
        <StatCard label="ROC-AUC" value={m.roc_auc.toFixed(3)} accent="#5b8a72" />
        <StatCard label="Precision" value={`${(m.precision * 100).toFixed(1)}%`} />
        <StatCard label="Recall" value={`${(m.recall * 100).toFixed(1)}%`} />
        <StatCard label="F1 score" value={m.f1.toFixed(3)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Feature importance */}
        <div className="clay-card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink">
            What drives attrition
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={importance} layout="vertical" margin={{ left: 8, right: 28 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="feature"
                width={120}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5b5468", fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: "rgba(124,106,156,0.08)" }} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={16} isAnimationActive={false}>
                {importance.map((d, i) => (
                  <Cell key={d.feature} fill={i === importance.length - 1 ? "#e07856" : "#7c6a9c"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Model comparison */}
        <div className="clay-card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink">
            Model selection (ROC-AUC)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparison} layout="vertical" margin={{ left: 8, right: 40 }}>
              <XAxis type="number" domain={[0.5, 1]} hide />
              <YAxis
                type="category"
                dataKey="model"
                width={150}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5b5468", fontSize: 11 }}
              />
              <Tooltip cursor={{ fill: "rgba(124,106,156,0.08)" }} contentStyle={tooltipStyle} />
              <Bar dataKey="roc_auc" radius={[0, 10, 10, 0]} barSize={16} isAnimationActive={false}>
                {comparison.map((d) => (
                  <Cell key={d.model} fill={d.model.includes("served") ? "#e07856" : "#cabfae"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion matrix */}
      <div className="clay-card p-6">
        <h3 className="mb-1 font-display text-lg font-semibold text-ink">
          Confusion matrix
        </h3>
        <p className="mb-4 text-sm text-ink-soft">
          On the held-out test set. Cross-validated accuracy:{" "}
          {(m.cv_accuracy_mean * 100).toFixed(1)}% ± {(m.cv_accuracy_std * 100).toFixed(1)}%.
        </p>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          {cm.flatMap((row, i) =>
            row.map((val, j) => {
              const correct = i === j;
              return (
                <div
                  key={`${i}-${j}`}
                  className="rounded-2xl p-5 text-center shadow-clay-inset"
                  style={{
                    background: correct ? "rgba(91,138,114,0.16)" : "rgba(224,120,86,0.14)",
                  }}
                >
                  <p className="font-display text-3xl font-semibold text-ink">
                    {val.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs font-medium text-ink-faint">
                    {cmLabels[i][j]}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

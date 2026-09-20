"""Train the AttritionIQ model and produce every artifact the app needs.

Outputs
-------
api/app/model_artifacts/model.cbm        - trained CatBoost model (served)
api/app/model_artifacts/metadata.json    - metrics + global feature importance
docs/media/chart_*.png                   - charts used in the README

The served model is CatBoost because it was the strongest single learner in the
original study, and it gives us two things for free that the product needs:
per-prediction probabilities (a real risk score) and native SHAP values (the
"why" behind every prediction) - with no extra dependency.
"""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from catboost import CatBoostClassifier, Pool
from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import OneHotEncoder

from schema import CAT_FEATURES, FEATURES, LABELS, TARGET

# --------------------------------------------------------------------------- #
# Paths & palette
# --------------------------------------------------------------------------- #
ROOT = Path(__file__).resolve().parents[1]
DATA = Path(__file__).with_name("employee_churn_data.csv")
MODEL_DIR = ROOT / "api" / "app" / "model_artifacts"
MEDIA = ROOT / "docs" / "media"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MEDIA.mkdir(parents=True, exist_ok=True)

PAPER = "#f4efe9"
INK = "#2f2a3d"
TERRACOTTA = "#e07856"   # high risk
AMBER = "#e0a458"        # medium
SAGE = "#5b8a72"         # low risk / stable
PLUM = "#7c6a9c"         # accent

plt.rcParams.update(
    {
        "figure.facecolor": PAPER,
        "axes.facecolor": PAPER,
        "savefig.facecolor": PAPER,
        "font.family": "DejaVu Sans",
        "text.color": INK,
        "axes.labelcolor": INK,
        "xtick.color": INK,
        "ytick.color": INK,
        "axes.edgecolor": "#d8cec2",
        "axes.grid": True,
        "grid.color": "#e6ddd1",
        "grid.linewidth": 0.8,
        "axes.spines.top": False,
        "axes.spines.right": False,
    }
)


def _round(x, n=4):
    return float(np.round(x, n))


# --------------------------------------------------------------------------- #
# Load & split
# --------------------------------------------------------------------------- #
def load_data():
    df = pd.read_csv(DATA)
    df[TARGET] = (df[TARGET].astype(str).str.lower() == "yes").astype(int)
    X = df[FEATURES].copy()
    for col in CAT_FEATURES:
        X[col] = X[col].astype(str)
    y = df[TARGET].astype(int)
    return df, X, y


# --------------------------------------------------------------------------- #
# Model comparison (for the README table + model_selection chart)
# --------------------------------------------------------------------------- #
def compare_models(X, y, cat_idx):
    """Benchmark several classifiers on a one-hot encoded copy (CatBoost uses
    the raw categoricals via Pool)."""
    Xtr, Xte, ytr, yte = train_test_split(
        X, y, test_size=0.2, random_state=24, stratify=y
    )

    enc = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    cat_cols = [FEATURES[i] for i in cat_idx]
    num_cols = [c for c in FEATURES if c not in cat_cols]
    Xtr_enc = np.hstack([enc.fit_transform(Xtr[cat_cols]), Xtr[num_cols].values])
    Xte_enc = np.hstack([enc.transform(Xte[cat_cols]), Xte[num_cols].values])

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "K-Nearest Neighbours": KNeighborsClassifier(n_neighbors=5),
        "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=10, random_state=24),
        "Hist Gradient Boosting": HistGradientBoostingClassifier(random_state=24),
    }
    rows = []
    for name, m in models.items():
        m.fit(Xtr_enc, ytr)
        pred = m.predict(Xte_enc)
        proba = m.predict_proba(Xte_enc)[:, 1]
        rows.append(
            {
                "model": name,
                "accuracy": _round(accuracy_score(yte, pred)),
                "roc_auc": _round(roc_auc_score(yte, proba)),
                "f1": _round(f1_score(yte, pred)),
            }
        )
    return rows, (Xtr, Xte, ytr, yte)


# --------------------------------------------------------------------------- #
# Charts
# --------------------------------------------------------------------------- #
def chart_confusion(cm):
    fig, ax = plt.subplots(figsize=(5.2, 4.4))
    ax.imshow(cm, cmap="YlOrBr", alpha=0.85)
    labels = ["Stayed", "Left"]
    ax.set_xticks([0, 1], labels)
    ax.set_yticks([0, 1], labels)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix", fontweight="bold", pad=14)
    total = cm.sum()
    for i in range(2):
        for j in range(2):
            ax.text(
                j, i, f"{cm[i, j]:,}\n{cm[i, j] / total * 100:.1f}%",
                ha="center", va="center", fontsize=13, fontweight="bold",
                color=INK,
            )
    ax.grid(False)
    fig.tight_layout()
    fig.savefig(MEDIA / "chart_confusion.png", dpi=150)
    plt.close(fig)


def chart_roc(yte, proba, auc):
    fpr, tpr, _ = roc_curve(yte, proba)
    fig, ax = plt.subplots(figsize=(5.4, 4.4))
    ax.plot(fpr, tpr, color=TERRACOTTA, lw=3, label=f"CatBoost (AUC = {auc:.3f})")
    ax.plot([0, 1], [0, 1], color="#b9ad9e", lw=1.5, ls="--", label="Random")
    ax.fill_between(fpr, tpr, alpha=0.12, color=TERRACOTTA)
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve", fontweight="bold", pad=14)
    ax.legend(loc="lower right", frameon=False)
    fig.tight_layout()
    fig.savefig(MEDIA / "chart_roc.png", dpi=150)
    plt.close(fig)


def chart_pr(yte, proba):
    prec, rec, _ = precision_recall_curve(yte, proba)
    fig, ax = plt.subplots(figsize=(5.4, 4.4))
    ax.plot(rec, prec, color=SAGE, lw=3)
    ax.fill_between(rec, prec, alpha=0.12, color=SAGE)
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.set_title("Precision-Recall Curve", fontweight="bold", pad=14)
    fig.tight_layout()
    fig.savefig(MEDIA / "chart_pr.png", dpi=150)
    plt.close(fig)


def chart_importance(importances):
    items = sorted(importances.items(), key=lambda kv: kv[1])
    names = [LABELS[k] for k, _ in items]
    vals = [v for _, v in items]
    colors = [TERRACOTTA if v == max(vals) else PLUM for v in vals]
    fig, ax = plt.subplots(figsize=(6.4, 4.6))
    ax.barh(names, vals, color=colors, height=0.62)
    ax.set_xlabel("Relative importance (%)")
    ax.set_title("What drives attrition (global)", fontweight="bold", pad=14)
    for i, v in enumerate(vals):
        ax.text(v + 0.4, i, f"{v:.1f}", va="center", fontsize=10, color=INK)
    ax.grid(axis="y", visible=False)
    fig.tight_layout()
    fig.savefig(MEDIA / "chart_importance.png", dpi=150)
    plt.close(fig)


def chart_model_compare(rows, catboost_row):
    allrows = rows + [catboost_row]
    allrows = sorted(allrows, key=lambda r: r["roc_auc"])
    names = [r["model"] for r in allrows]
    aucs = [r["roc_auc"] for r in allrows]
    colors = [TERRACOTTA if r["model"].startswith("CatBoost") else "#cabfae" for r in allrows]
    fig, ax = plt.subplots(figsize=(6.6, 4.4))
    ax.barh(names, aucs, color=colors, height=0.6)
    ax.set_xlim(0.5, max(aucs) + 0.05)
    ax.set_xlabel("ROC-AUC")
    ax.set_title("Model selection (higher is better)", fontweight="bold", pad=14)
    for i, v in enumerate(aucs):
        ax.text(v + 0.003, i, f"{v:.3f}", va="center", fontsize=10, color=INK)
    ax.grid(axis="y", visible=False)
    fig.tight_layout()
    fig.savefig(MEDIA / "chart_model_compare.png", dpi=150)
    plt.close(fig)


def chart_risk_distribution(proba):
    fig, ax = plt.subplots(figsize=(6.4, 4.0))
    ax.hist(proba * 100, bins=30, color=PLUM, alpha=0.85, edgecolor=PAPER)
    ax.axvline(50, color=TERRACOTTA, lw=2, ls="--", label="Decision threshold")
    ax.set_xlabel("Predicted attrition risk (%)")
    ax.set_ylabel("Employees")
    ax.set_title("Risk score distribution (test set)", fontweight="bold", pad=14)
    ax.legend(frameon=False)
    fig.tight_layout()
    fig.savefig(MEDIA / "chart_risk_distribution.png", dpi=150)
    plt.close(fig)


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main():
    print("Loading data ...")
    df, X, y = load_data()
    cat_idx = [FEATURES.index(c) for c in CAT_FEATURES]
    print(f"  {len(df):,} rows | attrition rate {y.mean() * 100:.1f}%")

    print("Benchmarking baseline models ...")
    compare_rows, (Xtr, Xte, ytr, yte) = compare_models(X, y, cat_idx)

    print("Training CatBoost (served model) ...")
    model = CatBoostClassifier(
        iterations=400,
        depth=6,
        learning_rate=0.05,
        loss_function="Logloss",
        eval_metric="AUC",
        random_seed=24,
        verbose=0,
    )
    train_pool = Pool(Xtr, ytr, cat_features=cat_idx)
    test_pool = Pool(Xte, yte, cat_features=cat_idx)
    model.fit(train_pool)

    proba = model.predict_proba(Xte)[:, 1]
    pred = (proba >= 0.5).astype(int)

    acc = accuracy_score(yte, pred)
    auc = roc_auc_score(yte, proba)
    prec = precision_score(yte, pred)
    rec = recall_score(yte, pred)
    f1 = f1_score(yte, pred)
    cm = confusion_matrix(yte, pred)

    print("Cross-validating ...")
    cv_model = CatBoostClassifier(
        iterations=400, depth=6, learning_rate=0.05, random_seed=24, verbose=0
    )
    # CatBoost + sklearn CV needs encoded cats; reuse a quick ordinal cast.
    X_cv = X.copy()
    for c in CAT_FEATURES:
        X_cv[c] = X_cv[c].astype("category").cat.codes
    cv_scores = cross_val_score(cv_model, X_cv, y, cv=5, scoring="accuracy")

    importances = dict(
        zip(FEATURES, model.get_feature_importance(train_pool))
    )
    importances = {k: _round(v, 2) for k, v in importances.items()}

    catboost_row = {
        "model": "CatBoost (served)",
        "accuracy": _round(acc),
        "roc_auc": _round(auc),
        "f1": _round(f1),
    }

    print("Rendering charts ...")
    chart_confusion(cm)
    chart_roc(yte, proba, auc)
    chart_pr(yte, proba)
    chart_importance(importances)
    chart_model_compare(compare_rows, catboost_row)
    chart_risk_distribution(proba)

    print("Saving model + metadata ...")
    model.save_model(str(MODEL_DIR / "model.cbm"))

    metadata = {
        "features": FEATURES,
        "cat_features": CAT_FEATURES,
        "labels": LABELS,
        "dataset": {
            "rows": int(len(df)),
            "attrition_rate": _round(float(y.mean()), 4),
        },
        "metrics": {
            "accuracy": _round(acc),
            "roc_auc": _round(auc),
            "precision": _round(prec),
            "recall": _round(rec),
            "f1": _round(f1),
            "cv_accuracy_mean": _round(float(cv_scores.mean())),
            "cv_accuracy_std": _round(float(cv_scores.std())),
            "confusion_matrix": cm.tolist(),
        },
        "feature_importance": importances,
        "model_comparison": sorted(
            compare_rows + [catboost_row], key=lambda r: -r["roc_auc"]
        ),
    }
    (MODEL_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2))

    print("\n=== RESULTS ===")
    print(f"Accuracy : {acc:.4f}")
    print(f"ROC-AUC  : {auc:.4f}")
    print(f"Precision: {prec:.4f}  Recall: {rec:.4f}  F1: {f1:.4f}")
    print(f"CV acc   : {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    print("Top drivers:", sorted(importances.items(), key=lambda kv: -kv[1])[:3])
    print("Artifacts written to", MODEL_DIR, "and", MEDIA)


if __name__ == "__main__":
    main()

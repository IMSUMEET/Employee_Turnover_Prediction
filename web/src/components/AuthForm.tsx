"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Wordmark } from "@/components/Logo";
import RiskGauge from "@/components/RiskGauge";
import { useAuth } from "@/lib/auth";

interface Props {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) await login(username, password);
      else await register(username, password);
      router.push("/app/predict");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid w-full overflow-hidden rounded-clay-lg bg-sand-100 shadow-clay md:grid-cols-2"
      >
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between bg-clay-plum p-10 text-white md:flex">
          <Link href="/">
            <span className="text-xl font-bold tracking-tight">
              Attrition<span className="text-sand-200">IQ</span>
            </span>
          </Link>
          <div className="flex flex-col items-center gap-6">
            <RiskGauge risk={isLogin ? 34 : 68} size={190} />
            <p className="text-center text-sm text-white/80">
              Explainable attrition predictions for people teams who&apos;d rather
              retain than replace.
            </p>
          </div>
          <p className="text-xs text-white/60">CatBoost · SHAP · FastAPI · Next.js</p>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-8 md:hidden">
            <Wordmark />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-ink-soft">
            {isLogin
              ? "Log in to score and explain attrition risk."
              : "Start predicting and explaining employee turnover."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Username
              </label>
              <input
                className="clay-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. hr_lead"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Password
              </label>
              <input
                type="password"
                className="clay-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-risk-high/12 px-4 py-3 text-sm font-medium text-risk-high">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="clay-btn clay-btn-primary w-full"
            >
              {loading ? "Please wait…" : isLogin ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            {isLogin ? "New here? " : "Already have an account? "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="font-semibold text-clay-plum hover:underline"
            >
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}

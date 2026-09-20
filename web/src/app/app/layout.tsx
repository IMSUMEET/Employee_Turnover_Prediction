"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Wordmark } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

const tabs = [
  { href: "/app/predict", label: "Predict" },
  { href: "/app/bulk", label: "Bulk analysis" },
  { href: "/app/insights", label: "Model insights" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center text-ink-faint">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16">
      <header className="sticky top-0 z-20 -mx-5 mb-8 bg-sand-100/70 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <Link href="/app/predict">
            <Wordmark size={38} />
          </Link>

          <nav className="hidden rounded-full bg-sand-200 p-1.5 shadow-clay-inset md:flex">
            {tabs.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-sand-100 text-ink shadow-clay-sm"
                      : "text-ink-faint hover:text-ink"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-soft sm:block">
              Hi, <span className="font-semibold text-ink">{user}</span>
            </span>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="clay-btn px-4 py-2 text-sm"
            >
              Log out
            </button>
          </div>
        </div>

        {/* mobile tabs */}
        <nav className="mt-3 flex gap-2 overflow-x-auto md:hidden">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                  active ? "bg-clay-plum text-white shadow-clay-plum" : "bg-sand-200 text-ink-soft"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {children}
    </div>
  );
}

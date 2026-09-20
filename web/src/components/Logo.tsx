export function Mark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-2xl bg-clay-plum shadow-clay-plum"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 17l5-5 4 3 5-7" />
        <path d="M17 8h3v3" />
      </svg>
    </div>
  );
}

export function Wordmark({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Mark size={size} />
      <span className="text-xl font-bold tracking-tight text-ink">
        Attrition<span className="text-clay-plum">IQ</span>
      </span>
    </div>
  );
}

export default function StatCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="clay-card p-5">
      <p className="text-sm text-ink-faint">{label}</p>
      <p
        className="mt-1 font-display text-3xl font-semibold"
        style={{ color: accent ?? "#2f2a3d" }}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>}
    </div>
  );
}

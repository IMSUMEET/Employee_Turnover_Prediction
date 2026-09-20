"use client";

interface Base {
  label: string;
  hint?: string;
}

export function SliderField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  format,
}: Base & {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-ink-soft">{label}</label>
        <span className="rounded-lg bg-sand-200 px-2 py-0.5 text-sm font-semibold text-clay-plum shadow-clay-inset">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="clay-range"
        style={{
          background: `linear-gradient(to right, #7c6a9c ${pct}%, #ded2c0 ${pct}%)`,
        }}
      />
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: Base & {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>
      <input
        type="number"
        className="clay-input"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value || "0"))}
      />
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: Base & {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>
      <select
        className="clay-input capitalize"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ToggleField({
  label,
  value,
  onChange,
}: Base & {
  value: number;
  onChange: (v: number) => void;
}) {
  const on = value === 1;
  return (
    <div className="flex items-center justify-between rounded-2xl bg-sand-200 px-4 py-3 shadow-clay-inset">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <button
        type="button"
        onClick={() => onChange(on ? 0 : 1)}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          on ? "bg-clay-plum" : "bg-sand-400"
        }`}
        aria-pressed={on}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
            on ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export type StatTone = "default" | "ok" | "warn" | "danger";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: StatCardProps) {
  return (
    <div className={`sys-stat sys-stat--${tone}`}>
      <p className="sys-stat__label">{label}</p>
      <p className="sys-stat__value">{value}</p>
      {hint && <p className="sys-stat__hint">{hint}</p>}
    </div>
  );
}

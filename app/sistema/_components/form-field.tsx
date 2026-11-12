import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

// A labelled form control with its error or hint underneath.
export function Field({ label, error, hint, className, children }: FieldProps) {
  return (
    <label className={`sys-field${className ? ` ${className}` : ""}`}>
      <span className="sys-field__label">{label}</span>
      {children}
      {error ? (
        <span className="sys-field__error">{error}</span>
      ) : (
        hint && <span className="sys-field__hint">{hint}</span>
      )}
    </label>
  );
}

// The entries of a labels record, typed, to render a select's options.
export function labelEntries<Key extends string>(
  labels: Record<Key, string>,
): [Key, string][] {
  return Object.entries(labels) as [Key, string][];
}

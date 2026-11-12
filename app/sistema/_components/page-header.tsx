import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="sys-page-header">
      <div>
        {eyebrow && <p className="sys-eyebrow">{eyebrow}</p>}
        <h1 className="sys-page-title">{title}</h1>
        {description && <p className="sys-page-description">{description}</p>}
      </div>
      {actions && <div className="sys-page-actions">{actions}</div>}
    </header>
  );
}

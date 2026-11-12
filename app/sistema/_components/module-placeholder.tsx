import { moduleByHref } from "../_data/modules";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";

interface ModulePlaceholderProps {
  href: string;
}

// Stand-in for the modules still being built: tells what the screen will do.
export function ModulePlaceholder({ href }: ModulePlaceholderProps) {
  const systemModule = moduleByHref(href);
  return (
    <PermissionGate permission={systemModule.permission}>
      <PageHeader
        eyebrow="Próximamente"
        title={systemModule.label}
        description={systemModule.description}
      />
      <section className="sys-card sys-placeholder">
        <h2 className="sys-card__title">Qué vas a encontrar acá</h2>
        <ul className="sys-placeholder__list">
          {systemModule.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </section>
    </PermissionGate>
  );
}

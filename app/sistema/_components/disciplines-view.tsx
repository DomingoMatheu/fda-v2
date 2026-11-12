"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS } from "../_data/labels";
import { phoneHref } from "../_lib/employees";
import { formatDate, formatMoney, fullName, listName } from "../_lib/format";
import { DataTable, type Column } from "./data-table";
import { Modal } from "./modal";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { StatCard } from "./stat-card";
import { FeeStatusBadge } from "./status-badge";
import {
  useDisciplinesView,
  type DisciplineCard,
  type EnrolledMember,
} from "./use-disciplines-view";

const ENROLLED_COLUMNS: Column<EnrolledMember>[] = [
  {
    key: "name",
    header: "Socio",
    render: ({ member }) => (
      <Link
        href={`/sistema/socios/${member.id}`}
        className="sys-discipline__member"
      >
        {listName(member)}
      </Link>
    ),
  },
  {
    key: "number",
    header: "N.º",
    align: "end",
    hideOnMobile: true,
    render: ({ member }) => member.memberNumber,
  },
  {
    key: "category",
    header: "Categoría",
    hideOnMobile: true,
    render: ({ member }) => CATEGORY_LABELS[member.category],
  },
  {
    key: "since",
    header: "Desde",
    hideOnMobile: true,
    render: ({ enrolledAt }) => formatDate(enrolledAt),
  },
  {
    key: "fee",
    header: "Cuota",
    render: ({ feeStatus }) => <FeeStatusBadge status={feeStatus} />,
  },
];

function enrolledLabel(card: DisciplineCard): string {
  const capacity = card.program.capacity;
  return capacity ? `${card.enrolled} de ${capacity}` : String(card.enrolled);
}

function DisciplineTile({
  card,
  onOpen,
}: {
  card: DisciplineCard;
  onOpen: () => void;
}) {
  const { program, photo, coach, phone } = card;
  return (
    <article className="sys-discipline">
      <button type="button" className="sys-discipline__open" onClick={onOpen}>
        <span className="sys-discipline__photo">
          {photo && (
            <Image
              src={photo.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
              className={`photo-cover${photo.imageClassName ? ` ${photo.imageClassName}` : ""}`}
            />
          )}
          <span className="sys-discipline__count">
            <strong>{enrolledLabel(card)}</strong> inscriptos
          </span>
        </span>
        <span className="sys-discipline__name">{program.name}</span>
        <span className="sys-visually-hidden">: ver inscriptos</span>
      </button>
      <dl className="sys-discipline__facts">
        <div>
          <dt>Cuota</dt>
          <dd>{formatMoney(program.monthlyFee)} por mes</dd>
        </div>
        <div>
          <dt>Horario</dt>
          <dd>{program.schedule}</dd>
        </div>
        <div>
          <dt>Responsable</dt>
          <dd>{coach ? fullName(coach) : "A confirmar"}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{phone ? <a href={phoneHref(phone)}>{phone}</a> : "—"}</dd>
        </div>
      </dl>
    </article>
  );
}

function DisciplinesContent() {
  const view = useDisciplinesView();
  const { selected } = view;
  return (
    <>
      <PageHeader
        eyebrow="Deportes"
        title="Disciplinas"
        description="Cuántos hay en cada disciplina, cuánto pagan y quién está a cargo. Tocá una para ver la lista de inscriptos."
      />
      <div className="sys-stats">
        <StatCard
          label="Inscriptos activos"
          value={String(view.totalEnrolled)}
          hint={`En ${view.cards.length} disciplinas`}
        />
        <StatCard
          label="Ingresos mensuales"
          value={formatMoney(view.totalIncome)}
          hint="Cuotas de disciplinas por mes"
          tone="ok"
        />
      </div>
      <div className="sys-discipline__grid">
        {view.cards.map((card) => (
          <DisciplineTile
            key={card.program.id}
            card={card}
            onOpen={() => view.open(card.program.id)}
          />
        ))}
      </div>
      {selected && (
        <Modal title={selected.program.name} onClose={view.close} wide>
          <p className="sys-discipline__modal-summary">
            {selected.enrolled === 1
              ? "1 inscripto activo"
              : `${selected.enrolled} inscriptos activos`}{" "}
            · {formatMoney(selected.monthlyIncome)} por mes ·{" "}
            {selected.program.schedule}
          </p>
          <DataTable
            columns={ENROLLED_COLUMNS}
            rows={view.enrolled}
            rowKey={({ member }) => member.id}
            rowHref={({ member }) => `/sistema/socios/${member.id}`}
            empty="Todavía no hay inscriptos en esta disciplina."
            caption={`Inscriptos en ${selected.program.name}`}
          />
        </Modal>
      )}
    </>
  );
}

export function DisciplinesView() {
  return (
    <PermissionGate permission="members:read">
      <DisciplinesContent />
    </PermissionGate>
  );
}

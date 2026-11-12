import type { ChartSeries } from "../_lib/chart";

export type ReportKey =
  | "recaudacion"
  | "morosidad"
  | "altas-bajas"
  | "disciplinas"
  | "medios-de-pago";

export interface ReportDefinition {
  key: ReportKey;
  label: string;
  title: string;
  description: string;
}

export const REPORTS: ReportDefinition[] = [
  {
    key: "recaudacion",
    label: "Recaudación",
    title: "Recaudación por mes",
    description: "Lo cobrado cada mes del año, recargos por mora incluidos.",
  },
  {
    key: "morosidad",
    label: "Morosidad",
    title: "Morosidad por categoría",
    description:
      "Cómo está cada categoría con sus cuotas. Los vitalicios no pagan cuota y no entran.",
  },
  {
    key: "altas-bajas",
    label: "Altas y bajas",
    title: "Altas y bajas por mes",
    description: "Socios que entraron y que se fueron en cada mes del año.",
  },
  {
    key: "disciplinas",
    label: "Disciplinas",
    title: "Socios por disciplina",
    description: "Inscriptos activos en cada disciplina, de mayor a menor.",
  },
  {
    key: "medios-de-pago",
    label: "Medios de pago",
    title: "Medios de pago",
    description: "Cómo pagan los socios: monto cobrado en el año por medio.",
  },
];

export const REVENUE_SERIES: ChartSeries[] = [
  { label: "Recaudado", tone: "series-1" },
];

export const MOVEMENT_SERIES: ChartSeries[] = [
  { label: "Altas", tone: "series-1" },
  { label: "Bajas", tone: "series-2" },
];

export const DELINQUENCY_SERIES: ChartSeries[] = [
  { label: "Al día", tone: "ok" },
  { label: "En mora", tone: "warn" },
  { label: "Morosos", tone: "danger" },
];

import type { Permission } from "../_types";

export type ModuleIcon =
  | "home"
  | "members"
  | "family"
  | "cash"
  | "receipt"
  | "pool"
  | "staff"
  | "disciplines"
  | "reports"
  | "register"
  | "calendar"
  | "settings";

export interface SystemModule {
  href: string;
  label: string;
  icon: ModuleIcon;
  // Permission needed to see the module; the dashboard is open to everyone.
  permission?: Permission;
  description: string;
  // What the screen will show, listed while the module is being built.
  highlights: string[];
}

export const SYSTEM_MODULES: SystemModule[] = [
  {
    href: "/sistema",
    label: "Inicio",
    icon: "home",
    description: "Cómo viene el mes, de un vistazo.",
    highlights: [
      "Socios activos y porcentaje al día",
      "Cobrado y pendiente del mes",
      "Morosos a contactar, aptos por vencer y cumpleaños",
      "Últimos cobros y actividad reciente",
    ],
  },
  {
    href: "/sistema/socios",
    label: "Socios",
    icon: "members",
    permission: "members:read",
    description: "Buscá por nombre, DNI o número y tenés toda la ficha.",
    highlights: [
      "Buscador y filtros por categoría, estado de cuota y disciplina",
      "Ficha completa con estado de cuenta",
      "Alta de socio con inscripción y primera cuota",
    ],
  },
  {
    href: "/sistema/grupos-familiares",
    label: "Grupos familiares",
    icon: "family",
    permission: "members:read",
    description: "El plan familiar se cobra una sola vez, al titular.",
    highlights: [
      "Titular, plan e integrantes",
      "Cuota y estado del grupo",
      "Aviso cuando el plan no coincide con la edad de los hijos",
    ],
  },
  {
    href: "/sistema/cobranza",
    label: "Cobranza",
    icon: "cash",
    permission: "billing:read",
    description: "Registrás el cobro y el socio queda al día.",
    highlights: [
      "Esperado, cobrado y pendiente del período",
      "Pendientes, cobradas y morosos",
      "Cobro con recargo automático y recordatorio por WhatsApp",
    ],
  },
  {
    href: "/sistema/comprobantes",
    label: "Comprobantes",
    icon: "receipt",
    permission: "billing:read",
    description: "Recibos numerados, listos para imprimir o mandar.",
    highlights: ["Búsqueda por número o socio", "Recibo imprimible"],
  },
  {
    href: "/sistema/caja",
    label: "Caja del día",
    icon: "register",
    permission: "billing:read",
    description: "Lo que entró hoy, por medio de pago, y el cierre de caja.",
    highlights: [
      "Ingresos del día por medio de pago",
      "Otros ingresos: visitantes, alquileres, canon del buffet",
      "Cierre de caja con arqueo e historial",
    ],
  },
  {
    href: "/sistema/temporada",
    label: "Temporada",
    icon: "pool",
    permission: "season:read",
    description: "Portería tipea el DNI y ve verde o rojo.",
    highlights: [
      "Control de ingreso por DNI o número de socio",
      "Carnets de pileta y aptos médicos",
      "Ingresos de hoy",
    ],
  },
  {
    href: "/sistema/reservas",
    label: "Reservas",
    icon: "calendar",
    permission: "bookings:read",
    description: "Quinchos y salón, sin planillas en papel.",
    highlights: [
      "Calendario de disponibilidad de quinchos y salón",
      "Reserva a nombre de un socio con la lista de invitados",
      "Exclusividad y alquiler del salón con su cobro",
    ],
  },
  {
    href: "/sistema/empleados",
    label: "Empleados",
    icon: "staff",
    permission: "staff:read",
    description: "Todo el personal en un lugar.",
    highlights: ["Legajo, puesto y área", "Contratación, horario y estado"],
  },
  {
    href: "/sistema/disciplinas",
    label: "Disciplinas",
    icon: "disciplines",
    permission: "members:read",
    description: "Cuántos hay en cada disciplina y quién está a cargo.",
    highlights: ["Inscriptos por disciplina", "Cuota, horarios y responsable"],
  },
  {
    href: "/sistema/reportes",
    label: "Reportes",
    icon: "reports",
    permission: "reports:read",
    description: "Los números para la comisión directiva.",
    highlights: [
      "Recaudación por mes",
      "Morosidad por categoría",
      "Altas y bajas, socios por disciplina, medios de pago",
    ],
  },
  {
    href: "/sistema/configuracion",
    label: "Configuración",
    icon: "settings",
    permission: "settings:write",
    description: "Lo cambia el club, sin programador.",
    highlights: [
      "Valores de cuotas y recargo por mora",
      "Medios de pago, usuarios y roles",
      "Integraciones",
    ],
  },
];

export function findModule(pathname: string): SystemModule {
  const matches = SYSTEM_MODULES.filter(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );
  return (
    matches.sort((a, b) => b.href.length - a.href.length)[0] ??
    SYSTEM_MODULES[0]
  );
}

export function moduleByHref(href: string): SystemModule {
  return (
    SYSTEM_MODULES.find((module) => module.href === href) ?? SYSTEM_MODULES[0]
  );
}

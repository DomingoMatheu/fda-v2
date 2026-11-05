import {
  CLUB_BILLING_EMAIL,
  CLUB_EMAIL,
  CLUB_HOLIDAY_OPENS,
  CLUB_MEMBERS_PORTAL_LOGIN,
  CLUB_MEMBERS_PORTAL_URL,
  CLUB_OFFICE_HOURS,
  CLUB_PHONE,
} from "./club-info";
import { MEMBERSHIP_FEES, VISITOR_FEES } from "./fees";
import { SCHOOL_WHATSAPP_MESSAGE } from "./school-visits";
import { whatsappUrl } from "./whatsapp";

// Only questions the home page does not answer already: club hours, the
// WhatsApp number, the disciplines and their contacts live in their own
// sections there.

export type FaqBlock =
  | { type: "text"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

export interface FaqLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Faq {
  question: string;
  answer: FaqBlock[];
  links?: FaqLink[];
}

export interface FaqGroup {
  id: string;
  title: string;
  faqs: Faq[];
}

export const FAQ_WHATSAPP_MESSAGE =
  "¡Hola! Tengo una consulta que no encontré en las preguntas frecuentes.";

const whatsappLink = (message: string): FaqLink => ({
  label: `WhatsApp ${CLUB_PHONE}`,
  href: whatsappUrl(CLUB_PHONE, message),
  external: true,
});

const emailLink = (email: string): FaqLink => ({
  label: email,
  href: `mailto:${email}`,
});

const CLUB_EMAIL_LINK = emailLink(CLUB_EMAIL);
const BILLING_EMAIL_LINK = emailLink(CLUB_BILLING_EMAIL);

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "visitas",
    title: "Horarios y visitas",
    faqs: [
      {
        question: "¿Cuál es el horario de Secretaría?",
        answer: [
          {
            type: "table",
            head: ["Día", "Horario"],
            rows: CLUB_OFFICE_HOURS.map((hours) => [
              hours.label,
              hours.schedule,
            ]),
          },
        ],
      },
      {
        question: "¿El club abre los feriados?",
        answer: [
          {
            type: "text",
            text: `Sí. Los feriados el club abre desde las ${CLUB_HOLIDAY_OPENS}. Si querés confirmar el horario de un servicio o una actividad en particular, consultanos antes de venir.`,
          },
        ],
        links: [
          whatsappLink(
            "¡Hola! Quiero confirmar el horario del club para el feriado.",
          ),
        ],
      },
      {
        question: "¿Puedo entrar al club si no soy socio?",
        answer: [
          {
            type: "text",
            text: "Sí. Podés entrar como visitante pagando la entrada que corresponda según tu categoría y las tarifas vigentes.",
          },
        ],
      },
      {
        question: "¿Cuánto sale la entrada de visitante?",
        answer: [
          {
            type: "table",
            head: ["Entrada", "Valor"],
            rows: VISITOR_FEES.map((fee) => [fee.label, fee.amount]),
          },
          {
            type: "text",
            text: "Las tarifas se actualizan seguido: consultá los valores vigentes antes de tu visita.",
          },
        ],
        links: [
          whatsappLink(
            "¡Hola! Quiero consultar el valor de la entrada de visitante.",
          ),
        ],
      },
      {
        question: "¿El club tiene buffet?",
        answer: [{ type: "text", text: "Sí, el club tiene buffet." }],
      },
    ],
  },
  {
    id: "socios",
    title: "Socios y pagos",
    faqs: [
      {
        question: "¿Cuánto cuesta asociarse?",
        answer: [
          {
            type: "text",
            text: "Hay distintas categorías de socio, cada una con su inscripción y su cuota mensual:",
          },
          {
            type: "table",
            head: ["Categoría", "Inscripción", "Cuota mensual"],
            rows: MEMBERSHIP_FEES.map((fee) => [
              fee.category,
              fee.signUp,
              fee.monthly,
            ]),
          },
          {
            type: "list",
            items: [
              "Grupo familiar básico: padres con 1 hijo menor de 5 años o sin hijos.",
              "Grupo familiar pleno: padres con 1 hijo mayor de 5 años o más de un hijo, hasta 17 años.",
            ],
          },
          {
            type: "text",
            text: "Para conocer los valores actualizados y confirmar qué categoría te corresponde, consultá en Secretaría.",
          },
        ],
      },
      {
        question: "¿Cómo me asocio?",
        answer: [
          {
            type: "text",
            text: "Comunicate con Secretaría y contanos si querés asociarte de forma individual o con tu familia, si es para un menor o si sos jubilado. Te orientamos sobre los requisitos, la categoría y los valores vigentes.",
          },
        ],
        links: [whatsappLink("¡Hola! Quiero asociarme al club.")],
      },
      {
        question: "¿Qué medios de pago aceptan?",
        answer: [
          {
            type: "list",
            items: [
              "Efectivo",
              "Tarjeta de débito",
              "Tarjeta de crédito",
              "QR",
              "Transferencia bancaria",
            ],
          },
        ],
      },
      {
        question: "¿Cómo consulto mi deuda?",
        answer: [
          {
            type: "text",
            text: "Podés ver el estado de tu cuenta en el sistema de gestión de socios. Ingresá con estos datos:",
          },
          {
            type: "list",
            items: [
              `Usuario: ${CLUB_MEMBERS_PORTAL_LOGIN.user}`,
              `Clave: ${CLUB_MEMBERS_PORTAL_LOGIN.password}`,
            ],
          },
        ],
        links: [
          {
            label: "Ir al sistema de socios",
            href: CLUB_MEMBERS_PORTAL_URL,
            external: true,
          },
        ],
      },
      {
        question: "¿Cómo envío un comprobante de pago?",
        answer: [
          {
            type: "text",
            text: "Mandalo por correo a Cobranzas, donde también te responden cualquier consulta sobre pagos. Incluí tu nombre y apellido para que podamos identificar el pago.",
          },
        ],
        links: [BILLING_EMAIL_LINK],
      },
    ],
  },
  {
    id: "quinchos",
    title: "Quinchos y cumpleaños",
    faqs: [
      {
        question: "¿Cómo reservo un quincho?",
        answer: [
          {
            type: "text",
            text: "La reserva del quincho no tiene costo. Para hacerla:",
          },
          {
            type: "steps",
            items: [
              "Pedí la planilla de reserva.",
              "Completá el listado con nombre, apellido y DNI de cada invitado que no sea socio.",
              "Presentá la planilla firmada.",
              "Enviá la documentación y, si corresponde, el comprobante de pago.",
              "Confirmá el día y el horario con anticipación.",
            ],
          },
          {
            type: "text",
            text: "La persona socia que reserva tiene que estar presente el día del evento y es responsable del uso del espacio.",
          },
        ],
        links: [
          whatsappLink("¡Hola! Quiero reservar un quincho."),
          CLUB_EMAIL_LINK,
        ],
      },
      {
        question: "¿Puedo festejar un cumpleaños en el quincho?",
        answer: [
          {
            type: "text",
            text: "Sí. Los socios pueden reservar un quincho para cumpleaños y otros eventos. Acordate de presentar con anticipación la planilla de invitados no socios, con nombre, apellido y DNI, y de confirmar la fecha y el horario.",
          },
        ],
      },
      {
        question: "¿Puedo reservar el quincho en exclusiva?",
        answer: [
          {
            type: "text",
            text: "Sí. Para tener el quincho en exclusiva tenés que tener más de 30 invitados no socios y abonar el 50 % del valor de la entrada de visitante correspondiente.",
          },
          {
            type: "text",
            text: "También hay que presentar la planilla firmada con el listado de invitados (nombre, apellido y DNI). La persona socia que reserva tiene que estar presente y es responsable del evento.",
          },
        ],
      },
      {
        question: "¿Cómo consulto la disponibilidad del quincho?",
        answer: [
          {
            type: "text",
            text: "Escribinos por WhatsApp o por correo con la fecha que te interesa y el tipo de evento que querés hacer.",
          },
        ],
        links: [
          whatsappLink(
            "¡Hola! Quiero consultar la disponibilidad del quincho.",
          ),
          CLUB_EMAIL_LINK,
        ],
      },
    ],
  },
  {
    id: "salon",
    title: "Salón de eventos",
    faqs: [
      {
        question: "¿Cómo alquilo el salón?",
        answer: [
          {
            type: "text",
            text: "El salón tiene capacidad para unas 100 a 120 personas y no hace falta ser socio para alquilarlo. Cuenta con:",
          },
          {
            type: "list",
            items: [
              "10 mesas redondas",
              "Sillas",
              "Mantelería",
              "Espacio amplio para decorar",
              "Horno grande",
              "Freezer de uso exclusivo",
              "Parrilleros interiores",
            ],
          },
          {
            type: "text",
            text: "Para consultar disponibilidad, valores y condiciones, escribinos con la fecha del evento y la cantidad aproximada de invitados.",
          },
        ],
        links: [
          whatsappLink("¡Hola! Quiero consultar por el alquiler del salón."),
          CLUB_EMAIL_LINK,
        ],
      },
      {
        question: "¿En qué horarios se puede usar el salón?",
        answer: [
          { type: "text", text: "Hay dos modalidades:" },
          {
            type: "list",
            items: [
              "Horario nocturno: de 21 a 4 h, con estacionamiento gratuito.",
              "Durante el horario del club: con estacionamiento para hasta 10 vehículos.",
            ],
          },
          {
            type: "text",
            text: "Para reservarlo hay que coordinar con anticipación y completar la planilla de invitados.",
          },
        ],
      },
      {
        question: "¿Cómo consulto por un cumpleaños o un evento?",
        answer: [
          {
            type: "text",
            text: "Según el tipo de festejo y la cantidad de invitados, te puede convenir un quincho o el salón. Para orientarte, mandanos por correo:",
          },
          {
            type: "list",
            items: [
              "Fecha del evento",
              "Tipo de celebración",
              "Cantidad aproximada de invitados",
              "Espacio que te interesa usar",
            ],
          },
          {
            type: "text",
            text: "La disponibilidad y las condiciones se confirman al gestionar la reserva.",
          },
        ],
        links: [CLUB_EMAIL_LINK],
      },
    ],
  },
  {
    id: "actividades",
    title: "Deportes y escuelas",
    faqs: [
      {
        question: "¿Cómo empiezo a hacer un deporte o una actividad?",
        answer: [
          {
            type: "steps",
            items: [
              "Comunicate con el profesor o responsable de la disciplina para coordinar tu primera clase. Su contacto está en cada tarjeta de Disciplinas.",
              "Presentá una fotocopia de tu DNI en Secretaría.",
              "Secretaría te pone el sello de ingreso al club, que te habilita para hacer la actividad.",
              "Si decidís seguir, podés asociarte.",
            ],
          },
        ],
        links: [{ label: "Ver disciplinas", href: "/#disciplinas" }],
      },
      {
        question: "¿Hasta cuándo puede reservar una escuela?",
        answer: [
          {
            type: "text",
            text: "Recibimos a instituciones educativas para encuentros y campamentos recreativos, con reservas hasta fines de noviembre, antes de que arranque la temporada de pileta.",
          },
          {
            type: "text",
            text: "Conviene consultar con anticipación: hay que completar una planilla y confirmar la disponibilidad. Escribinos con el nombre de la institución, el tipo de actividad, la cantidad aproximada de participantes y la fecha estimada.",
          },
        ],
        links: [whatsappLink(SCHOOL_WHATSAPP_MESSAGE), CLUB_EMAIL_LINK],
      },
    ],
  },
  {
    id: "consultas",
    title: "Consultas y reclamos",
    faqs: [
      {
        question: "¿Cómo hago un reclamo?",
        answer: [
          {
            type: "text",
            text: "Escribinos por WhatsApp contando qué pasó y, si aplica, la fecha y el sector. Así podemos revisarlo y derivarlo al área correspondiente para que lo evalúe.",
          },
          {
            type: "text",
            text: "Si necesitamos consultarlo con otra área para darte una respuesta correcta, lo revisamos y te mantenemos al tanto por el mismo medio.",
          },
        ],
        links: [whatsappLink("¡Hola! Quiero hacer un reclamo.")],
      },
      {
        question: "¿A qué correo escribo según el tema?",
        answer: [
          {
            type: "text",
            text: "Para consultas generales, escribinos por WhatsApp. Por correo, cada tema tiene su casilla:",
          },
          {
            type: "list",
            items: [
              `Cuotas, deudas y comprobantes: ${CLUB_BILLING_EMAIL}`,
              `Reservas, eventos y visitas institucionales: ${CLUB_EMAIL}`,
            ],
          },
        ],
        links: [
          whatsappLink(FAQ_WHATSAPP_MESSAGE),
          BILLING_EMAIL_LINK,
          CLUB_EMAIL_LINK,
        ],
      },
    ],
  },
];

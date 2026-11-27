export interface AgreementDetail {
  label: string;
  value: string;
}

// Optional data renders only when it is filled in, so an agreement can go live
// with what is known and gain its logo and conditions later. `details` holds
// short label/value rows such as "Quiénes", "Cómo" and "Vigencia".
export interface Agreement {
  id: string;
  name: string;
  fullName: string;
  benefit: string;
  description: string;
  details: AgreementDetail[];
  logo?: string;
  announcementUrl?: string;
}

export const AGREEMENTS: Agreement[] = [
  {
    id: "secyt",
    name: "SECYT",
    fullName: "Sindicato de Empleados de Correo y Telecomunicaciones",
    benefit: "Temporada de pileta",
    description:
      "Los afiliados pueden adquirir la temporada de pileta en el club y disfrutar del verano en familia y con amigos.",
    // TODO: pending from the club: who qualifies, how to claim it and validity.
    details: [],
    logo: "/convenios/secyt.jpg",
    announcementUrl: "https://www.instagram.com/p/Dezmv12oAhz/",
  },
  {
    id: "ate",
    name: "ATE",
    fullName: "Asociación Trabajadores del Estado",
    benefit: "Temporada de pileta",
    description:
      "Renovamos el convenio: los afiliados pueden adquirir la temporada de pileta en el club y disfrutar del verano en familia y con amigos.",
    // TODO: pending from the club: who qualifies, how to claim it and validity.
    details: [],
    logo: "/convenios/ate.jpg",
    announcementUrl: "https://www.instagram.com/p/DgQIBU3RjqV/",
  },
];

export const agreementWhatsappMessage = (agreement: Agreement): string =>
  `¡Hola! Soy afiliado/a de ${agreement.name} y quiero consultar por el convenio con el club.`;

export const NEW_AGREEMENT_WHATSAPP_MESSAGE =
  "¡Hola! Escribo desde una institución / empresa y queremos consultar por un convenio con el club.";

export interface Integration {
  id: string;
  name: string;
  // What it would solve for the club, in one line.
  description: string;
}

export const INTEGRATIONS: Integration[] = [
  {
    id: "mercado-pago",
    name: "Mercado Pago",
    description:
      "El socio paga la cuota con un link o un QR y el pago queda acreditado solo, sin cargarlo a mano.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description:
      "Recordatorios de vencimiento y recibos que llegan al celular del socio sin copiar ni pegar.",
  },
  {
    id: "email",
    name: "Email",
    description:
      "Recibos, avisos de mora y novedades del club por correo, enviados de forma automática.",
  },
  {
    id: "facturacion",
    name: "Facturación electrónica",
    description:
      "La factura de ARCA sale con cada cobro, sin tener que cargarla dos veces.",
  },
  {
    id: "backups",
    name: "Backups",
    description:
      "Copia diaria de toda la información en otro servidor, para no perder nada si se rompe una computadora.",
  },
];

import type { ContactRequest } from "../_types/contact";

const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";

// Web3Forms emails each submission to the inbox this key was created for (the
// club's). The key is public by design: Web3Forms only accepts browser calls.
export const WEB3FORMS_ACCESS_KEY = "0090dbdd-3f71-432f-be6d-5967cd66de58";

const isSuccessResponse = (data: unknown): boolean =>
  typeof data === "object" &&
  data !== null &&
  "success" in data &&
  String(data.success) === "true";

export async function sendContactRequest(
  request: ContactRequest,
): Promise<void> {
  const response = await fetch(CONTACT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `Consulta web: ${request.interes} — ${request.nombre}`,
      replyto: request.email,
      botcheck: request.honeypot !== "",
      Nombre: request.nombre,
      Email: request.email,
      Teléfono: request.telefono || "—",
      "Me interesa": request.interes,
      Mensaje: request.mensaje || "—",
    }),
  });

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok || !isSuccessResponse(data)) {
    throw new Error("Contact request was not accepted");
  }
}

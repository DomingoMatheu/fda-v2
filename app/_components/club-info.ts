// Single source of truth for the club's contact details, used by the
// sections, the footer and the structured data for search engines.

export const CLUB_NAME_PREFIX = "Club S&D F.A.";
export const CLUB_NAME_MAIN = "Domingo Matheu";
export const CLUB_NAME = `${CLUB_NAME_PREFIX} ${CLUB_NAME_MAIN}`;
export const CLUB_SHORT_NAME = "Club Domingo Matheu";

export const CLUB_EMAIL = "clubfabricadearmas@gmail.com";
export const CLUB_BILLING_EMAIL = "cobranzasfar@gmail.com";
export const CLUB_PHONE = "341 356 0193";
export const CLUB_MEMBERS_PORTAL_URL = "https://www.far.myhoost.com/";
// Shared login the club hands out to every member; it is meant to be public.
export const CLUB_MEMBERS_PORTAL_LOGIN = {
  user: "socios",
  password: "far2025",
};

export const CLUB_INSTAGRAM_HANDLE = "clubdomingomatheurosario";
export const CLUB_INSTAGRAM_URL = `https://www.instagram.com/${CLUB_INSTAGRAM_HANDLE}/`;

export const CLUB_ADDRESS = {
  street: "Calle 1209 n° 3350",
  city: "Rosario",
  region: "Santa Fe",
  country: "AR",
};

export const CLUB_GEO = { latitude: -32.996548, longitude: -60.6814769 };
export const CLUB_MAPS_URL = "https://maps.app.goo.gl/xJNqLx5BMPVVyET7A";
export const CLUB_MAP_EMBED_URL = `https://www.google.com/maps?q=${CLUB_GEO.latitude},${CLUB_GEO.longitude}&z=16&output=embed`;

interface OpeningHours {
  label: string;
  schedule: string;
  days: string[];
  opens: string;
  closes: string;
}

export const CLUB_HOURS: OpeningHours[] = [
  {
    label: "Lunes a viernes",
    schedule: "14 a 22 h",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "14:00",
    closes: "22:00",
  },
  {
    label: "Sábados",
    schedule: "9 a 00 h",
    days: ["Saturday"],
    opens: "09:00",
    closes: "24:00",
  },
  {
    label: "Domingos",
    schedule: "9 a 22 h",
    days: ["Sunday"],
    opens: "09:00",
    closes: "22:00",
  },
];

export const CLUB_HOLIDAY_OPENS = "9 h";

interface OfficeHours {
  label: string;
  schedule: string;
}

// Opening hours of the Secretaría, the club's front office.
export const CLUB_OFFICE_HOURS: OfficeHours[] = [
  { label: "Lunes", schedule: "Cerrado" },
  { label: "Martes", schedule: "15 a 19 h" },
  { label: "Miércoles", schedule: "14 a 19 h" },
  { label: "Jueves", schedule: "15 a 19 h" },
  { label: "Viernes", schedule: "14 a 19 h" },
  { label: "Sábados", schedule: "11 a 18 h" },
  { label: "Domingos", schedule: "10 a 15 h" },
];

import type { PaymentMethod } from "../_types";

// Fee schedule keys: family plans plus the individual categories. Lifetime
// members ("vitalicio") pay no monthly fee.
export type FeeScheduleKey =
  "familiar-basico" | "familiar-pleno" | "individual" | "menor" | "jubilado";

export interface ScheduledFee {
  key: FeeScheduleKey;
  label: string;
  signUp: number;
  monthly: number;
}

// Prices of the club's spaces. The hall has a price per slot; an exclusive
// quincho charges each non-member guest a share of the visitor entrance.
export interface BookingRates {
  salonDay: number;
  salonNight: number;
  exclusiveGuestShare: number;
}

export interface SystemSettings {
  fees: ScheduledFee[];
  bookingRates: BookingRates;
  lateFeeRate: number;
  dueDay: number;
  pointOfSale: number;
  paymentMethods: PaymentMethod[];
}

// Day of the month the fees are due.
export const DUE_DAY = 10;

// Mirrors MEMBERSHIP_FEES in app/_components/fees.ts (the prices published
// on the landing). Keep both in sync until the real system serves them.
export const DEFAULT_SETTINGS: SystemSettings = {
  fees: [
    {
      key: "familiar-basico",
      label: "Grupo familiar básico",
      signUp: 88000,
      monthly: 44000,
    },
    {
      key: "familiar-pleno",
      label: "Grupo familiar pleno",
      signUp: 116000,
      monthly: 58000,
    },
    {
      key: "individual",
      label: "Individual / Deportivo",
      signUp: 59000,
      monthly: 29500,
    },
    { key: "menor", label: "Menor", signUp: 33000, monthly: 16500 },
    { key: "jubilado", label: "Jubilado", signUp: 33000, monthly: 16500 },
  ],
  bookingRates: {
    salonDay: 250000,
    salonNight: 380000,
    exclusiveGuestShare: 0.5,
  },
  lateFeeRate: 0.1,
  dueDay: DUE_DAY,
  pointOfSale: 1,
  paymentMethods: ["efectivo", "debito", "credito", "qr", "transferencia"],
};

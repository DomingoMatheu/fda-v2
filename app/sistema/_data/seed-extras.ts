import { VISITOR_FEES } from "@/app/_components/fees";
import { billingMemberId } from "../_lib/billing";
import { DEMO_TODAY, addDays } from "../_lib/clock";
import { formatDate } from "../_lib/format";
import { periodOf } from "../_lib/period";
import { createRandom, type Random } from "../_lib/random";
import type { SystemState } from "../_lib/state";
import type {
  AmountsByMethod,
  Booking,
  BookingGuest,
  BookingSlot,
  CashClosing,
  Fee,
  Member,
  OtherIncome,
  PaymentMethod,
} from "../_types";
import { FEMALE_NAMES, LAST_NAMES, MALE_NAMES } from "./names";
import { EVENT_TYPES, findVenue } from "./venues";

// Bookings, other incomes and past cash closings. They use their own random
// generator, so adding them did not change the members and fees of the seed.

const EXTRAS_SEED = 20261112;
const FIRST_DAY = "2026-11-01";

interface BookingPlan {
  venueId: string;
  date: string;
  slot: BookingSlot;
  status: Booking["status"];
  guests: number;
  exclusive?: boolean;
  // A renter who is not a member (only the hall allows it).
  outsider?: { name: string; phone: string };
}

const BOOKING_PLANS: BookingPlan[] = [
  {
    venueId: "quincho-grande",
    date: "2026-11-01",
    slot: "dia",
    status: "confirmada",
    guests: 9,
  },
  {
    venueId: "quincho-chico",
    date: "2026-11-07",
    slot: "noche",
    status: "confirmada",
    guests: 6,
  },
  {
    venueId: "salon",
    date: "2026-11-08",
    slot: "noche",
    status: "confirmada",
    guests: 0,
    outsider: { name: "Ezequiel Moyano", phone: "341 588 2194" },
  },
  // Today, so the gate has a guest list to check.
  {
    venueId: "quincho-grande",
    date: DEMO_TODAY,
    slot: "dia",
    status: "confirmada",
    guests: 8,
  },
  {
    venueId: "quincho-chico",
    date: "2026-11-14",
    slot: "dia",
    status: "pendiente",
    guests: 5,
  },
  {
    venueId: "quincho-grande",
    date: "2026-11-14",
    slot: "noche",
    status: "confirmada",
    guests: 11,
  },
  {
    venueId: "quincho-grande",
    date: "2026-11-21",
    slot: "dia",
    status: "pendiente",
    guests: 34,
    exclusive: true,
  },
  {
    venueId: "salon",
    date: "2026-11-28",
    slot: "noche",
    status: "pendiente",
    guests: 0,
    outsider: { name: "Agustina Paredes", phone: "341 512 7730" },
  },
  {
    venueId: "quincho-chico",
    date: "2026-11-29",
    slot: "dia",
    status: "cancelada",
    guests: 4,
  },
  {
    venueId: "salon",
    date: "2026-12-05",
    slot: "noche",
    status: "pendiente",
    guests: 10,
  },
  {
    venueId: "quincho-grande",
    date: "2026-12-12",
    slot: "dia",
    status: "confirmada",
    guests: 14,
  },
  {
    venueId: "quincho-chico",
    date: "2026-12-19",
    slot: "noche",
    status: "pendiente",
    guests: 7,
  },
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function guestList(rng: Random, count: number): BookingGuest[] {
  return Array.from({ length: count }, () => ({
    firstName: rng.pick(rng.chance(0.5) ? FEMALE_NAMES : MALE_NAMES),
    lastName: rng.pick(LAST_NAMES),
    documentNumber: String(rng.int(20_000_000, 48_000_000)),
  }));
}

function visitorPrice(label: string): number {
  const fee =
    VISITOR_FEES.find((item) => item.label === label) ?? VISITOR_FEES[0];
  return Number(fee.amount.replace(/\D/g, ""));
}

function buildBookings(
  rng: Random,
  state: SystemState,
): { bookings: Booking[]; fees: Fee[] } {
  const hosts = rng.shuffle(
    state.members.filter(
      (member) =>
        member.status === "activo" &&
        member.phone !== undefined &&
        billingMemberId(member, state.familyGroups) === member.id,
    ),
  );
  const { bookingRates } = state.settings;
  const fees: Fee[] = [];

  const bookings = BOOKING_PLANS.map((plan, index): Booking => {
    const venue = findVenue(plan.venueId);
    const host: Member | undefined = plan.outsider ? undefined : hosts[index];
    const guests = guestList(rng, plan.guests);
    const amount =
      venue?.kind === "salon"
        ? plan.slot === "noche"
          ? bookingRates.salonNight
          : bookingRates.salonDay
        : plan.exclusive
          ? Math.round(
              guests.length *
                visitorPrice("Mayores") *
                bookingRates.exclusiveGuestShare,
            )
          : 0;
    const createdOn = addDays(
      plan.date < DEMO_TODAY ? plan.date : DEMO_TODAY,
      -rng.int(6, 20),
    );
    let feeId: string | undefined;
    if (host && amount > 0) {
      feeId = `cuota-${state.fees.length + fees.length + 1}`;
      fees.push({
        id: feeId,
        memberId: host.id,
        familyGroupId: host.familyGroupId,
        period: periodOf(createdOn),
        concept: "otro",
        description: `Reserva ${venue?.name ?? ""} · ${formatDate(plan.date)}`,
        amount,
        dueDate: plan.date,
        status: plan.status === "cancelada" ? "anulada" : "pendiente",
        createdAt: createdOn,
      });
    }
    return {
      id: `reserva-${index + 1}`,
      venueId: plan.venueId,
      date: plan.date,
      slot: plan.slot,
      memberId: host?.id,
      contactName:
        plan.outsider?.name ?? `${host?.firstName} ${host?.lastName}`,
      contactPhone: plan.outsider?.phone ?? host?.phone,
      eventType: plan.exclusive ? "Cumpleaños" : rng.pick(EVENT_TYPES),
      expectedPeople: plan.guests + rng.int(4, 12),
      guests,
      exclusive: plan.exclusive ?? false,
      status: plan.status,
      amount,
      feeId,
      createdAt: `${createdOn}T${pad(rng.int(15, 19))}:${pad(rng.int(0, 59))}:00`,
      createdByUserId: "u-secretaria",
      notes:
        plan.status === "pendiente" && !plan.outsider
          ? "Falta la planilla de invitados firmada."
          : undefined,
    };
  });
  return { bookings, fees };
}

// Visitors who paid at the gate, the buffet's monthly fee and a deposit for
// the hall rented by someone who is not a member.
function buildIncomes(rng: Random, bookings: Booking[]): OtherIncome[] {
  const incomes: Omit<OtherIncome, "id">[] = [];
  for (let day = FIRST_DAY; day <= DEMO_TODAY; day = addDays(day, 1)) {
    const visitors = rng.int(0, 3);
    for (let index = 0; index < visitors; index++) {
      const fee = rng.pick(VISITOR_FEES);
      const hour = day === DEMO_TODAY ? rng.int(8, 10) : rng.int(14, 20);
      incomes.push({
        at: `${day}T${pad(hour)}:${pad(rng.int(0, 59))}:00`,
        source: "visitante",
        description: `Entrada de visitante (${fee.label.toLowerCase()})`,
        amount: visitorPrice(fee.label),
        method: rng.chance(0.7) ? "efectivo" : "qr",
        registeredByUserId: "u-porteria",
      });
    }
  }
  incomes.push({
    at: "2026-11-02T11:20:00",
    source: "otro",
    description: "Canon mensual del buffet (noviembre)",
    amount: 120000,
    method: "transferencia",
    registeredByUserId: "u-tesoreria",
  });
  // Past rentals were paid in full; upcoming ones left a 50 % deposit.
  for (const rental of bookings.filter((booking) => !booking.memberId)) {
    const isPast = rental.date < DEMO_TODAY;
    incomes.push({
      at: `${addDays(isPast ? rental.date : "2026-11-08", -3)}T17:40:00`,
      source: "alquiler",
      description: `${isPast ? "Alquiler" : "Seña"} del salón, ${rental.contactName}`,
      amount: isPast ? rental.amount : rental.amount / 2,
      method: "transferencia",
      registeredByUserId: "u-secretaria",
      bookingId: rental.id,
    });
  }
  return incomes
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((income, index) => ({ ...income, id: `otro-ingreso-${index + 1}` }));
}

const NO_AMOUNTS: AmountsByMethod = {
  efectivo: 0,
  debito: 0,
  credito: 0,
  qr: 0,
  transferencia: 0,
};

function amountsOfDay(
  state: SystemState,
  incomes: OtherIncome[],
  day: string,
): AmountsByMethod {
  const amounts = { ...NO_AMOUNTS };
  const add = (method: PaymentMethod, amount: number): void => {
    amounts[method] += amount;
  };
  for (const payment of state.payments) {
    if (payment.paidAt.startsWith(day)) add(payment.method, payment.amount);
  }
  for (const income of incomes) {
    if (income.at.startsWith(day)) add(income.method, income.amount);
  }
  return amounts;
}

// Treasury closed the register every day this month; one day the cash came
// up a little short.
function buildClosings(
  state: SystemState,
  incomes: OtherIncome[],
): CashClosing[] {
  const closings: CashClosing[] = [];
  for (let day = FIRST_DAY; day < DEMO_TODAY; day = addDays(day, 1)) {
    const expected = amountsOfDay(state, incomes, day);
    if (Object.values(expected).every((amount) => amount === 0)) continue;
    const short = day === "2026-11-07" ? 500 : 0;
    closings.push({
      id: `cierre-${day}`,
      date: day,
      closedAt: `${day}T21:15:00`,
      closedByUserId: "u-tesoreria",
      expected,
      countedCash: expected.efectivo - short,
      difference: -short,
      notes:
        short > 0 ? "Faltante chico, se revisa con Secretaría." : undefined,
    });
  }
  return closings;
}

export function addSeedExtras(state: SystemState): void {
  const rng = createRandom(EXTRAS_SEED);
  const { bookings, fees } = buildBookings(rng, state);
  state.bookings = bookings;
  state.fees = [...state.fees, ...fees];
  state.incomes = buildIncomes(rng, bookings);
  state.cashClosings = buildClosings(state, state.incomes);
}

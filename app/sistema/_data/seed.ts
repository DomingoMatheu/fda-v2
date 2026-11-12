import {
  billingMemberId,
  receiptNumber,
  scheduleKeyFor,
  scheduledFee,
} from "../_lib/billing";
import { DEMO_TODAY, addDays, isBefore } from "../_lib/clock";
import { formatMoney, fullName } from "../_lib/format";
import {
  periodDueDate,
  periodLabel,
  periodOf,
  periodsBetween,
} from "../_lib/period";
import { checkPoolAccess } from "../_lib/pool-access";
import { createRandom, type Random } from "../_lib/random";
import { slugify } from "../_lib/text";
import type { SystemState } from "../_lib/state";
import type {
  AccessLog,
  ActivityEntry,
  Enrollment,
  FamilyGroup,
  FamilyPlan,
  Fee,
  Gender,
  Member,
  MemberCategory,
  Payment,
  PaymentMethod,
  PoolPass,
  Receipt,
  Season,
} from "../_types";
import { DISCIPLINE_PROGRAMS } from "./disciplines";
import {
  FEMALE_NAMES,
  LAST_NAMES,
  MALE_NAMES,
  PHYSICIANS,
  STREETS,
} from "./names";
import { DEFAULT_SETTINGS, DUE_DAY } from "./settings";

// Builds the demo's starting data. Everything comes from one seeded random
// generator, so every load (server and client) produces the same club.

const SEED = 20261111;
const FIRST_PERIOD = "2026-01";
const CURRENT_PERIOD = periodOf(DEMO_TODAY);
const FIRST_RECEIPT = 4120;
const CURRENT_YEAR = Number(DEMO_TODAY.slice(0, 4));
const PAYMENT_METHODS: PaymentMethod[] = [
  "efectivo",
  "efectivo",
  "debito",
  "transferencia",
  "transferencia",
  "qr",
  "credito",
];
const CASHIER_IDS = ["u-secretaria", "u-tesoreria", "u-tesoreria"];

// Rough DNI numbers by birth year, so documents look right for each age.
const DOCUMENT_BY_YEAR: [number, number][] = [
  [1935, 2_000_000],
  [1950, 8_000_000],
  [1960, 14_000_000],
  [1970, 21_000_000],
  [1980, 28_000_000],
  [1990, 35_000_000],
  [2000, 42_000_000],
  [2010, 50_000_000],
  [2020, 57_000_000],
  [2026, 61_000_000],
];

type PaymentProfile = "puntual" | "atrasado" | "moroso";

interface PaymentDraft {
  memberId: string;
  fees: Fee[];
  paidAt: string;
  method: PaymentMethod;
  surcharge: number;
  registeredByUserId: string;
}

const SEASONS: Season[] = [
  {
    id: "temporada-2025",
    name: "Temporada 2025/2026",
    startsAt: "2025-12-01",
    endsAt: "2026-03-15",
    status: "cerrada",
    memberPassPrice: 52000,
    guestDayPrice: 7000,
  },
  {
    id: "temporada-2026",
    name: "Temporada 2026/2027",
    startsAt: "2026-12-01",
    endsAt: "2027-03-15",
    status: "inscripcion",
    memberPassPrice: 65000,
    guestDayPrice: 9000,
  },
];

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

function randomDate(rng: Random, from: string, to: string): string {
  const [fromTime, toTime] = [from, to].map((date) =>
    Date.parse(`${date}T00:00:00Z`),
  );
  const days = Math.round((toTime - fromTime) / 86_400_000);
  return addDays(from, rng.int(0, Math.max(days, 0)));
}

function laterOf(date: string, other: string): string {
  return isBefore(date, other) ? other : date;
}

function documentFor(
  rng: Random,
  birthYear: number,
  used: Set<string>,
): string {
  const index = DOCUMENT_BY_YEAR.findIndex(([year]) => year >= birthYear);
  const [toYear, toNumber] = DOCUMENT_BY_YEAR[Math.max(index, 1)];
  const [fromYear, fromNumber] = DOCUMENT_BY_YEAR[Math.max(index, 1) - 1];
  const base =
    fromNumber +
    ((birthYear - fromYear) / (toYear - fromYear)) * (toNumber - fromNumber);
  let document = String(Math.round(base) + rng.int(0, 700_000));
  while (used.has(document)) document = String(Number(document) + 1);
  used.add(document);
  return document;
}

function birthDateFor(rng: Random, minAge: number, maxAge: number): string {
  const year = CURRENT_YEAR - rng.int(minAge, maxAge);
  // A few birthdays fall this week, so the dashboard has some to show.
  const monthDay = rng.chance(0.05)
    ? `11-${pad(rng.int(11, 17))}`
    : `${pad(rng.int(1, 12))}-${pad(rng.int(1, 28))}`;
  // Babies cannot be born after today: move them back a year.
  const date = `${year}-${monthDay}`;
  return isBefore(DEMO_TODAY, date) ? `${year - 1}-${monthDay}` : date;
}

function scheduleTime(rng: Random, date: string): string {
  // Payments of today were registered this morning; older ones, in office hours.
  if (date === DEMO_TODAY)
    return `${date}T${pad(rng.int(9, 10))}:${pad(rng.int(0, 25))}:00`;
  return `${date}T${pad(rng.int(14, 19))}:${pad(rng.int(0, 59))}:00`;
}

export function buildSeed(): SystemState {
  const rng = createRandom(SEED);
  const usedDocuments = new Set<string>();
  const members: Member[] = [];
  const familyGroups: FamilyGroup[] = [];
  const familyPlans = new Map<string, FamilyPlan>();
  const holderOf = new Map<string, Member>();

  const createMember = (options: {
    category: MemberCategory;
    minAge: number;
    maxAge: number;
    joinedFrom: string;
    joinedTo: string;
    gender?: Gender;
    lastName?: string;
    familyGroupId?: string;
  }): Member => {
    const gender = options.gender ?? (rng.chance(0.5) ? "F" : "M");
    const firstName = rng.pick(gender === "F" ? FEMALE_NAMES : MALE_NAMES);
    const lastName = options.lastName ?? rng.pick(LAST_NAMES);
    const birthDate = birthDateFor(rng, options.minAge, options.maxAge);
    const isAdult = options.minAge >= 18;
    const member: Member = {
      id: "",
      memberNumber: 0,
      firstName,
      lastName,
      documentType: "DNI",
      documentNumber: documentFor(
        rng,
        Number(birthDate.slice(0, 4)),
        usedDocuments,
      ),
      birthDate,
      gender,
      email: isAdult
        ? `${slugify(firstName)}.${slugify(lastName)}${rng.int(1, 99)}@ejemplo.com`
        : undefined,
      phone: isAdult
        ? `341 ${rng.int(150, 699)} ${rng.int(1000, 9999)}`
        : undefined,
      address: {
        street: rng.pick(STREETS),
        number: String(rng.int(1000, 4800)),
        city: "Rosario",
        province: "Santa Fe",
        postalCode: "2000",
      },
      category: options.category,
      status: "activo",
      joinedAt: laterOf(
        randomDate(rng, options.joinedFrom, options.joinedTo),
        birthDate,
      ),
      familyGroupId: options.familyGroupId,
      preferredPaymentMethod: rng.pick(PAYMENT_METHODS),
    };
    members.push(member);
    return member;
  };

  // Family groups: a holder, usually a spouse and one to three children.
  for (let index = 1; index <= 16; index++) {
    const groupId = `grupo-${pad(index)}`;
    const holder = createMember({
      category: "familiar",
      minAge: 30,
      maxAge: 52,
      joinedFrom: "1995-01-01",
      joinedTo: "2025-12-31",
      familyGroupId: groupId,
    });
    holder.familyRole = "titular";
    holderOf.set(groupId, holder);

    if (rng.chance(0.85)) {
      const spouse = createMember({
        category: "familiar",
        minAge: 30,
        maxAge: 52,
        joinedFrom: holder.joinedAt,
        joinedTo: holder.joinedAt,
        gender: holder.gender === "F" ? "M" : "F",
        familyGroupId: groupId,
      });
      spouse.familyRole = "conyuge";
    }

    const holderAge = CURRENT_YEAR - Number(holder.birthDate.slice(0, 4));
    const childAges = Array.from({ length: rng.pick([1, 1, 2, 2, 2, 3]) }, () =>
      rng.int(0, Math.min(17, holderAge - 22)),
    );
    for (const childAge of childAges) {
      const child = createMember({
        category: "familiar",
        minAge: childAge,
        maxAge: childAge,
        joinedFrom: holder.joinedAt,
        joinedTo: holder.joinedAt,
        lastName: holder.lastName,
        familyGroupId: groupId,
      });
      child.familyRole = "hijo";
    }

    const fitsBasic = childAges.length === 1 && childAges[0] < 5;
    // Two groups keep the basic plan although their children outgrew it, so
    // the family groups screen has a plan mismatch to point out.
    const plan: FamilyPlan = fitsBasic || index % 7 === 4 ? "basico" : "pleno";
    familyPlans.set(groupId, plan);
  }

  for (let index = 0; index < 20; index++) {
    createMember({
      category: "individual",
      minAge: 18,
      maxAge: 64,
      joinedFrom: "1990-01-01",
      joinedTo: "2026-09-30",
    });
  }
  // Recent sign-ups, to show on the dashboard.
  for (let index = 0; index < 3; index++) {
    createMember({
      category: "individual",
      minAge: 18,
      maxAge: 40,
      joinedFrom: "2026-10-20",
      joinedTo: "2026-11-10",
    });
  }
  for (let index = 0; index < 5; index++) {
    createMember({
      category: "menor",
      minAge: 8,
      maxAge: 17,
      joinedFrom: "2014-01-01",
      joinedTo: "2026-06-30",
    });
  }
  for (let index = 0; index < 6; index++) {
    createMember({
      category: "jubilado",
      minAge: 66,
      maxAge: 84,
      joinedFrom: "1975-01-01",
      joinedTo: "2005-12-31",
    });
  }
  for (let index = 0; index < 3; index++) {
    createMember({
      category: "vitalicio",
      minAge: 78,
      maxAge: 88,
      joinedFrom: "1958-01-01",
      joinedTo: "1970-12-31",
    });
  }

  // Member numbers follow seniority: the oldest members have the lowest.
  members.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  let memberNumber = 140;
  for (const member of members) {
    memberNumber += rng.int(1, 24);
    member.memberNumber = memberNumber;
    member.id = `socio-${memberNumber}`;
  }

  for (const [groupId, holder] of holderOf) {
    familyGroups.push({
      id: groupId,
      holderMemberId: holder.id,
      plan: familyPlans.get(groupId) ?? "basico",
      createdAt: holder.joinedAt,
    });
  }
  familyGroups.sort((a, b) => a.id.localeCompare(b.id));

  // Who owes what: most accounts pay on time, some are late, a few owe
  // three months or more.
  const accounts = members.filter(
    (member) => billingMemberId(member, familyGroups) === member.id,
  );
  const profiles = new Map<string, PaymentProfile>();
  for (const account of accounts) {
    const roll = rng.next();
    const profile: PaymentProfile =
      account.category === "vitalicio" || roll < 0.78
        ? "puntual"
        : roll < 0.92
          ? "atrasado"
          : "moroso";
    profiles.set(account.id, profile);
  }

  // Some members left this year and two debtors were suspended.
  const leavers = rng
    .shuffle(accounts.filter(({ category }) => category === "individual"))
    .slice(0, 3);
  for (const member of leavers) {
    member.status = "baja";
    member.leftAt = randomDate(rng, "2026-03-01", "2026-09-30");
  }
  const debtors = accounts.filter(
    (account) =>
      profiles.get(account.id) === "moroso" && account.status === "activo",
  );
  for (const member of debtors.slice(0, 2)) member.status = "suspendido";

  // Disciplines: about half the members take one, some take two.
  const enrollments: Enrollment[] = [];
  for (const member of members) {
    const memberAge = CURRENT_YEAR - Number(member.birthDate.slice(0, 4));
    if (memberAge < 4 || member.category === "vitalicio") continue;
    const roll = rng.next();
    const count = roll < 0.1 ? 2 : roll < 0.65 ? 1 : 0;
    const options = DISCIPLINE_PROGRAMS.filter(
      ({ id }) => id !== "grupo-scout" || memberAge < 18,
    );
    for (const program of rng.shuffle(options).slice(0, count)) {
      enrollments.push({
        id: `inscripcion-${enrollments.length + 1}`,
        memberId: member.id,
        disciplineId: program.id,
        enrolledAt: laterOf(
          randomDate(rng, "2022-03-01", "2026-10-31"),
          member.joinedAt,
        ),
        status: member.status === "baja" ? "baja" : "activa",
      });
    }
  }

  // Fees from January to November, then the payments that settled them.
  const fees: Fee[] = [];
  const paymentDrafts: PaymentDraft[] = [];

  const addFee = (fee: Omit<Fee, "id" | "status" | "createdAt">): Fee => {
    const created: Fee = {
      ...fee,
      id: `cuota-${fees.length + 1}`,
      status: "pendiente",
      createdAt: `${fee.period}-01`,
    };
    fees.push(created);
    return created;
  };

  for (const account of accounts) {
    const household = account.familyGroupId
      ? members.filter(
          ({ familyGroupId }) => familyGroupId === account.familyGroupId,
        )
      : [account];
    const firstPeriod = laterOf(
      `${periodOf(account.joinedAt)}-01`,
      `${FIRST_PERIOD}-01`,
    );
    const lastPeriod = account.leftAt
      ? periodOf(account.leftAt)
      : CURRENT_PERIOD;
    const periods = periodsBetween(periodOf(firstPeriod), lastPeriod);
    const scheduleKey = scheduleKeyFor(account, familyGroups);
    const feesByPeriod = new Map<string, Fee[]>();
    const push = (fee: Fee): void => {
      feesByPeriod.set(fee.period, [
        ...(feesByPeriod.get(fee.period) ?? []),
        fee,
      ]);
    };

    if (scheduleKey && periodOf(account.joinedAt) >= FIRST_PERIOD) {
      const period = periodOf(account.joinedAt);
      push(
        addFee({
          memberId: account.id,
          familyGroupId: account.familyGroupId,
          period,
          concept: "inscripcion",
          description: "Inscripción",
          amount: scheduledFee(DEFAULT_SETTINGS, scheduleKey).signUp,
          dueDate: addDays(account.joinedAt, 10),
        }),
      );
    }

    for (const period of periods) {
      if (scheduleKey) {
        const { monthly } = scheduledFee(DEFAULT_SETTINGS, scheduleKey);
        push(
          addFee({
            memberId: account.id,
            familyGroupId: account.familyGroupId,
            period,
            concept: "cuota-social",
            description: `Cuota social · ${periodLabel(period)}`,
            amount: monthly,
            dueDate: laterOf(
              periodDueDate(period),
              addDays(account.joinedAt, 10),
            ),
          }),
        );
      }
      for (const person of household) {
        const personEnrollments = enrollments.filter(
          (enrollment) =>
            enrollment.memberId === person.id &&
            periodOf(enrollment.enrolledAt) <= period,
        );
        for (const enrollment of personEnrollments) {
          const program = DISCIPLINE_PROGRAMS.find(
            ({ id }) => id === enrollment.disciplineId,
          );
          if (!program) continue;
          const who = account.familyGroupId ? ` (${person.firstName})` : "";
          push(
            addFee({
              memberId: account.id,
              familyGroupId: account.familyGroupId,
              period,
              concept: "cuota-disciplina",
              disciplineId: program.id,
              description: `${program.name}${who} · ${periodLabel(period)}`,
              amount: program.monthlyFee,
              dueDate: laterOf(
                periodDueDate(period),
                addDays(account.joinedAt, 10),
              ),
            }),
          );
        }
      }
    }

    const profile = profiles.get(account.id) ?? "puntual";
    const owedMonths =
      profile === "moroso"
        ? rng.int(3, 6)
        : profile === "atrasado"
          ? rng.int(1, 2)
          : 0;
    const billedPeriods = [...feesByPeriod.keys()].sort();
    const paidPeriods = billedPeriods.slice(
      0,
      billedPeriods.length - owedMonths,
    );

    for (const period of paidPeriods) {
      const periodFees = feesByPeriod.get(period) ?? [];
      const isCurrent = period === CURRENT_PERIOD;
      const day =
        profile === "puntual"
          ? rng.int(1, isCurrent ? 11 : DUE_DAY)
          : rng.int(3, isCurrent ? 11 : 28);
      const paidOn = laterOf(`${period}-${pad(day)}`, account.joinedAt);
      const latePart = periodFees.filter((fee) =>
        isBefore(fee.dueDate, paidOn),
      );
      paymentDrafts.push({
        memberId: account.id,
        fees: periodFees,
        paidAt: scheduleTime(rng, paidOn),
        method: rng.chance(0.8)
          ? account.preferredPaymentMethod
          : rng.pick(PAYMENT_METHODS),
        surcharge: Math.round(
          latePart.reduce((total, fee) => total + fee.amount, 0) *
            DEFAULT_SETTINGS.lateFeeRate,
        ),
        registeredByUserId: rng.pick(CASHIER_IDS),
      });
    }
  }

  // Pool season: about 45 members asked for their pass, most of them paid.
  const season = SEASONS[1];
  const poolPasses: PoolPass[] = [];
  const passHolders = rng
    .shuffle(members.filter(({ status }) => status === "activo"))
    .slice(0, 45);
  for (const member of passHolders) {
    const requestedAt = randomDate(rng, "2026-10-15", "2026-11-10");
    const accountId = billingMemberId(member, familyGroups);
    const fee = addFee({
      memberId: accountId,
      familyGroupId: member.familyGroupId,
      period: periodOf(requestedAt),
      concept: "temporada-pileta",
      description: `Carnet de pileta ${season.name.replace("Temporada ", "")} (${member.firstName})`,
      amount: season.memberPassPrice,
      dueDate: season.startsAt,
    });
    poolPasses.push({
      id: `carnet-${poolPasses.length + 1}`,
      seasonId: season.id,
      memberId: member.id,
      requestedAt,
      feeId: fee.id,
    });
    if (rng.chance(0.65)) {
      const paidOn = addDays(requestedAt, rng.int(0, 4));
      const account = members.find(({ id }) => id === accountId) ?? member;
      paymentDrafts.push({
        memberId: accountId,
        fees: [fee],
        paidAt: scheduleTime(
          rng,
          isBefore(DEMO_TODAY, paidOn) ? DEMO_TODAY : paidOn,
        ),
        method: account.preferredPaymentMethod,
        surcharge: 0,
        registeredByUserId: rng.pick(CASHIER_IDS),
      });
    }
  }

  // Medical clearances last a year. Pass holders mostly have a valid one;
  // some expire soon, some expired and some never brought one.
  const passHolderIds = new Set(passHolders.map(({ id }) => id));
  for (const member of members) {
    const roll = rng.next();
    const hasPass = passHolderIds.has(member.id);
    let issuedAt: string | undefined;
    if (hasPass) {
      if (roll < 0.55) issuedAt = randomDate(rng, "2026-09-01", "2026-11-10");
      else if (roll < 0.67)
        issuedAt = randomDate(rng, "2025-11-14", "2025-12-08");
      else if (roll < 0.85)
        issuedAt = randomDate(rng, "2025-02-01", "2025-10-31");
    } else if (roll < 0.4) {
      issuedAt = randomDate(rng, "2025-01-15", "2026-10-31");
    }
    if (issuedAt) {
      member.medicalClearance = {
        issuedAt,
        expiresAt: addDays(issuedAt, 365),
        physician: rng.pick(PHYSICIANS),
      };
    }
  }

  // Payments get their receipts in chronological order, as a cashier would.
  paymentDrafts.sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  const payments: Payment[] = [];
  const receipts: Receipt[] = [];
  paymentDrafts.forEach((draft, index) => {
    const sequence = FIRST_RECEIPT + index;
    const paymentId = `pago-${sequence}`;
    const receiptId = `recibo-${sequence}`;
    const base = draft.fees.reduce((total, fee) => total + fee.amount, 0);
    for (const fee of draft.fees) {
      fee.status = "paga";
      fee.paymentId = paymentId;
    }
    payments.push({
      id: paymentId,
      memberId: draft.memberId,
      paidAt: draft.paidAt,
      method: draft.method,
      amount: base + draft.surcharge,
      surcharge: draft.surcharge,
      feeIds: draft.fees.map(({ id }) => id),
      receiptId,
      registeredByUserId: draft.registeredByUserId,
    });
    receipts.push({
      id: receiptId,
      number: receiptNumber(DEFAULT_SETTINGS.pointOfSale, sequence),
      issuedAt: draft.paidAt,
      memberId: draft.memberId,
      paymentId,
      items: [
        ...draft.fees.map(({ description, amount }) => ({
          description,
          amount,
        })),
        ...(draft.surcharge > 0
          ? [{ description: "Recargo por mora", amount: draft.surcharge }]
          : []),
      ],
      total: base + draft.surcharge,
      method: draft.method,
    });
  });

  const state: SystemState = {
    members,
    familyGroups,
    enrollments,
    fees,
    payments,
    receipts,
    seasons: SEASONS,
    poolPasses,
    accessLogs: [],
    activity: [],
    settings: DEFAULT_SETTINGS,
  };

  state.accessLogs = buildAccessLogs(rng, state, passHolders);
  state.activity = buildActivity(state);
  return state;
}

// This morning at the gate: a mix of members with and without access and a
// couple of people who are not members.
function buildAccessLogs(
  rng: Random,
  state: SystemState,
  passHolders: Member[],
): AccessLog[] {
  const checked = rng.shuffle(passHolders).map((member) => ({
    member,
    check: checkPoolAccess(member, state, DEMO_TODAY),
  }));
  const others = state.members
    .filter((member) => !passHolders.includes(member))
    .map((member) => ({
      member,
      check: checkPoolAccess(member, state, DEMO_TODAY),
    }));
  // Most people at the gate get in; a few are stopped for a reason.
  const people = [
    ...checked.filter(({ check }) => check.allowed).slice(0, 9),
    ...checked.filter(({ check }) => !check.allowed).slice(0, 4),
    ...rng.shuffle(others).slice(0, 1),
  ];
  const logs: AccessLog[] = people.map(({ member, check }) => {
    return {
      id: "",
      at: "",
      gate: "porteria",
      memberId: member.id,
      documentNumber: member.documentNumber,
      result: check.allowed ? "permitido" : "denegado",
      reason: check.reasons.join(" · ") || undefined,
    };
  });
  for (const documentNumber of ["40123456", "36987001"]) {
    logs.push({
      id: "",
      at: "",
      gate: "porteria",
      documentNumber,
      result: "denegado",
      reason: "No figura como socio",
    });
  }
  return rng.shuffle(logs).map((log, index) => ({
    ...log,
    id: `ingreso-${index + 1}`,
    at: `${DEMO_TODAY}T${pad(8 + Math.floor(index / 6))}:${pad((index % 6) * 9 + rng.int(0, 8))}:00`,
  }));
}

// Recent activity, rebuilt from the data so it matches what the lists show.
function buildActivity(state: SystemState): ActivityEntry[] {
  const nameOf = (memberId: string): string => {
    const member = state.members.find(({ id }) => id === memberId);
    return member ? fullName(member) : "socio";
  };
  const since = addDays(DEMO_TODAY, -3);
  const entries: ActivityEntry[] = [
    ...state.payments
      .filter(({ paidAt }) => !isBefore(paidAt, since))
      .map((payment): ActivityEntry => ({
        id: "",
        at: payment.paidAt,
        kind: "pago",
        userId: payment.registeredByUserId,
        summary: `Cobro a ${nameOf(payment.memberId)} por ${formatMoney(payment.amount)}`,
        memberId: payment.memberId,
      })),
    ...state.members
      .filter(({ joinedAt }) => !isBefore(joinedAt, addDays(DEMO_TODAY, -30)))
      .map((member): ActivityEntry => ({
        id: "",
        at: `${member.joinedAt}T16:20:00`,
        kind: "alta",
        userId: "u-secretaria",
        summary: `Alta de ${fullName(member)} (socio n.º ${member.memberNumber})`,
        memberId: member.id,
      })),
    ...state.poolPasses
      .filter(
        ({ requestedAt }) => !isBefore(requestedAt, addDays(DEMO_TODAY, -5)),
      )
      .map((pass): ActivityEntry => ({
        id: "",
        at: `${pass.requestedAt}T17:05:00`,
        kind: "carnet",
        userId: "u-secretaria",
        summary: `Carnet de pileta para ${nameOf(pass.memberId)}`,
        memberId: pass.memberId,
      })),
  ];
  return entries
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 30)
    .map((entry, index) => ({ ...entry, id: `actividad-${index + 1}` }));
}

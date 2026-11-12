import type { SystemSettings } from "../_data/settings";
import { findProgram } from "../_data/disciplines";
import type {
  AccessLog,
  ActivityEntry,
  Fee,
  MedicalClearance,
  Member,
  MemberStatus,
  NewMemberInput,
  RegisterPaymentInput,
} from "../_types";
import { canEmailNotice } from "./debt-notice";
import {
  billingMemberId,
  memberBalance,
  receiptNumber,
  scheduleKeyFor,
  scheduledFee,
  sumAmounts,
  surchargeFor,
} from "./billing";
import { addDays, DEMO_TODAY } from "./clock";
import { formatMoney, fullName } from "./format";
import { periodDueDate, periodLabel, periodOf } from "./period";
import { activePass, currentSeason } from "./pool-access";
import type { SystemState } from "./state";

// Every change the demo can make. Ids and timestamps come in the action so
// the reducer stays pure.
interface Stamp {
  at: string;
  userId: string;
}

export type SystemAction =
  | (Stamp & {
      type: "registerPayment";
      sequence: number;
      input: RegisterPaymentInput;
    })
  | (Stamp & { type: "addMember"; memberNumber: number; input: NewMemberInput })
  | (Stamp & { type: "issuePoolPass"; memberId: string })
  | (Stamp & {
      type: "recordMedicalClearance";
      memberId: string;
      clearance: MedicalClearance;
    })
  | { type: "recordAccess"; log: Omit<AccessLog, "id"> }
  | (Stamp & {
      type: "setMemberStatus";
      memberId: string;
      status: MemberStatus;
    })
  | (Stamp & { type: "updateSettings"; settings: SystemSettings })
  | (Stamp & { type: "sendDebtNotices"; memberIds: string[] })
  // Puts back what the browser had saved, or the seed when starting over.
  | { type: "replaceState"; state: SystemState };

function withActivity(
  state: SystemState,
  stamp: Stamp,
  entry: Pick<ActivityEntry, "kind" | "summary" | "memberId">,
): ActivityEntry[] {
  const created: ActivityEntry = {
    ...entry,
    id: `actividad-${state.activity.length + 1}`,
    at: stamp.at,
    userId: stamp.userId,
  };
  return [created, ...state.activity];
}

function findMember(state: SystemState, memberId: string): Member | undefined {
  return state.members.find(({ id }) => id === memberId);
}

function registerPayment(
  state: SystemState,
  action: Extract<SystemAction, { type: "registerPayment" }>,
): SystemState {
  const { input, sequence } = action;
  const fees = state.fees.filter(
    ({ id, status }) => input.feeIds.includes(id) && status === "pendiente",
  );
  const member = findMember(state, input.memberId);
  if (fees.length === 0 || !member) return state;

  const paymentId = `pago-${sequence}`;
  const receiptId = `recibo-${sequence}`;
  const surcharge = surchargeFor(fees, DEMO_TODAY, state.settings.lateFeeRate);
  // The payment amount is what the member paid, surcharge included.
  const amount = sumAmounts(fees) + surcharge;
  const items = [
    ...fees.map(({ description, amount: itemAmount }) => ({
      description,
      amount: itemAmount,
    })),
    ...(surcharge > 0
      ? [{ description: "Recargo por mora", amount: surcharge }]
      : []),
  ];

  return {
    ...state,
    fees: state.fees.map((fee) =>
      fees.includes(fee) ? { ...fee, status: "paga", paymentId } : fee,
    ),
    payments: [
      ...state.payments,
      {
        id: paymentId,
        memberId: input.memberId,
        paidAt: action.at,
        method: input.method,
        amount,
        surcharge,
        feeIds: fees.map(({ id }) => id),
        receiptId,
        registeredByUserId: action.userId,
        notes: input.notes,
      },
    ],
    receipts: [
      ...state.receipts,
      {
        id: receiptId,
        number: receiptNumber(state.settings.pointOfSale, sequence),
        issuedAt: action.at,
        memberId: input.memberId,
        paymentId,
        items,
        total: amount,
        method: input.method,
      },
    ],
    activity: withActivity(state, action, {
      kind: "pago",
      summary: `Cobro a ${fullName(member)} por ${formatMoney(amount)}`,
      memberId: member.id,
    }),
  };
}

// A new member gets their number, the sign-up fee, this month's fee and the
// fees of the disciplines they joined.
function addMember(
  state: SystemState,
  action: Extract<SystemAction, { type: "addMember" }>,
): SystemState {
  const { input, memberNumber } = action;
  const { disciplineIds, ...data } = input;
  const id = `socio-${memberNumber}`;
  const familyGroupId =
    input.category === "familiar"
      ? `grupo-${state.familyGroups.length + 1}`
      : undefined;
  const member: Member = {
    ...data,
    id,
    memberNumber,
    status: "activo",
    joinedAt: DEMO_TODAY,
    familyGroupId,
    familyRole: familyGroupId ? "titular" : undefined,
  };
  const familyGroups = familyGroupId
    ? [
        ...state.familyGroups,
        {
          id: familyGroupId,
          holderMemberId: id,
          plan: "basico" as const,
          createdAt: DEMO_TODAY,
        },
      ]
    : state.familyGroups;

  const period = periodOf(DEMO_TODAY);
  const dueDate = addDays(DEMO_TODAY, 10);
  const newFees: Omit<Fee, "id">[] = [];
  const base = {
    memberId: id,
    familyGroupId,
    period,
    dueDate,
    status: "pendiente" as const,
    createdAt: DEMO_TODAY,
  };
  const scheduleKey = scheduleKeyFor(member, familyGroups);
  if (scheduleKey) {
    const fee = scheduledFee(state.settings, scheduleKey);
    newFees.push(
      {
        ...base,
        concept: "inscripcion",
        description: "Inscripción",
        amount: fee.signUp,
      },
      {
        ...base,
        concept: "cuota-social",
        description: `Cuota social · ${periodLabel(period)}`,
        amount: fee.monthly,
      },
    );
  }
  const enrollments = disciplineIds.map((disciplineId, index) => ({
    id: `inscripcion-${state.enrollments.length + index + 1}`,
    memberId: id,
    disciplineId,
    enrolledAt: DEMO_TODAY,
    status: "activa" as const,
  }));
  for (const disciplineId of disciplineIds) {
    const program = findProgram(disciplineId);
    if (!program) continue;
    newFees.push({
      ...base,
      concept: "cuota-disciplina",
      disciplineId,
      description: `${program.name} · ${periodLabel(period)}`,
      amount: program.monthlyFee,
      dueDate:
        periodDueDate(period) < DEMO_TODAY ? dueDate : periodDueDate(period),
    });
  }

  return {
    ...state,
    members: [...state.members, member],
    familyGroups,
    enrollments: [...state.enrollments, ...enrollments],
    fees: [
      ...state.fees,
      ...newFees.map((fee, index) => ({
        ...fee,
        id: `cuota-${state.fees.length + index + 1}`,
      })),
    ],
    activity: withActivity(state, action, {
      kind: "alta",
      summary: `Alta de ${fullName(member)} (socio n.º ${memberNumber})`,
      memberId: id,
    }),
  };
}

function issuePoolPass(
  state: SystemState,
  action: Extract<SystemAction, { type: "issuePoolPass" }>,
): SystemState {
  const member = findMember(state, action.memberId);
  const season = currentSeason(state.seasons);
  if (!member || !season || activePass(member, season, state.poolPasses))
    return state;

  const fee: Fee = {
    id: `cuota-${state.fees.length + 1}`,
    memberId: billingMemberId(member, state.familyGroups),
    familyGroupId: member.familyGroupId,
    period: periodOf(DEMO_TODAY),
    concept: "temporada-pileta",
    description: `Carnet de pileta ${season.name.replace("Temporada ", "")} (${member.firstName})`,
    amount: season.memberPassPrice,
    dueDate: season.startsAt,
    status: "pendiente",
    createdAt: DEMO_TODAY,
  };
  return {
    ...state,
    fees: [...state.fees, fee],
    poolPasses: [
      ...state.poolPasses,
      {
        id: `carnet-${state.poolPasses.length + 1}`,
        seasonId: season.id,
        memberId: member.id,
        requestedAt: DEMO_TODAY,
        feeId: fee.id,
      },
    ],
    activity: withActivity(state, action, {
      kind: "carnet",
      summary: `Carnet de pileta para ${fullName(member)}`,
      memberId: member.id,
    }),
  };
}

// Records an email notice for every debtor picked that has an address.
function sendDebtNotices(
  state: SystemState,
  action: Extract<SystemAction, { type: "sendDebtNotices" }>,
): SystemState {
  const recipients = state.members.filter(
    (member) =>
      action.memberIds.includes(member.id) &&
      canEmailNotice(member, state, DEMO_TODAY),
  );
  if (recipients.length === 0) return state;

  const notices = recipients.map((member, index) => ({
    id: `aviso-${state.notices.length + index + 1}`,
    memberId: member.id,
    channel: "email" as const,
    sentAt: action.at,
    sentByUserId: action.userId,
    email: member.email,
    overdueTotal: memberBalance(member, state, DEMO_TODAY).overdueTotal,
  }));
  const [first] = recipients;
  return {
    ...state,
    notices: [...state.notices, ...notices],
    activity: withActivity(state, action, {
      kind: "aviso",
      summary:
        recipients.length === 1
          ? `Aviso de deuda por correo a ${fullName(first)}`
          : `Aviso de deuda por correo a ${recipients.length} socios`,
      memberId: recipients.length === 1 ? first.id : undefined,
    }),
  };
}

function updateMember(
  state: SystemState,
  memberId: string,
  changes: Partial<Member>,
): Member[] {
  return state.members.map((member) =>
    member.id === memberId ? { ...member, ...changes } : member,
  );
}

const STATUS_SUMMARY: Record<MemberStatus, string> = {
  activo: "Reactivación de",
  suspendido: "Suspensión de",
  baja: "Baja de",
};

export function systemReducer(
  state: SystemState,
  action: SystemAction,
): SystemState {
  switch (action.type) {
    case "registerPayment":
      return registerPayment(state, action);
    case "addMember":
      return addMember(state, action);
    case "issuePoolPass":
      return issuePoolPass(state, action);
    case "recordMedicalClearance": {
      const member = findMember(state, action.memberId);
      if (!member) return state;
      return {
        ...state,
        members: updateMember(state, action.memberId, {
          medicalClearance: action.clearance,
        }),
        activity: withActivity(state, action, {
          kind: "apto",
          summary: `Apto médico de ${fullName(member)}`,
          memberId: member.id,
        }),
      };
    }
    case "recordAccess":
      return {
        ...state,
        accessLogs: [
          ...state.accessLogs,
          { ...action.log, id: `ingreso-${state.accessLogs.length + 1}` },
        ],
      };
    case "setMemberStatus": {
      const member = findMember(state, action.memberId);
      if (!member) return state;
      return {
        ...state,
        members: updateMember(state, action.memberId, {
          status: action.status,
          leftAt: action.status === "baja" ? DEMO_TODAY : undefined,
        }),
        activity: withActivity(state, action, {
          kind: action.status === "baja" ? "baja" : "edicion",
          summary: `${STATUS_SUMMARY[action.status]} ${fullName(member)}`,
          memberId: member.id,
        }),
      };
    }
    case "replaceState":
      return action.state;
    case "sendDebtNotices":
      return sendDebtNotices(state, action);
    case "updateSettings":
      return {
        ...state,
        settings: action.settings,
        activity: withActivity(state, action, {
          kind: "edicion",
          summary: "Cambios en la configuración",
        }),
      };
  }
}

export function nextMemberNumber(members: Member[]): number {
  return (
    members.reduce((max, { memberNumber }) => Math.max(max, memberNumber), 0) +
    1
  );
}

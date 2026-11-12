import { FAMILY_PLAN_LABELS } from "../_data/labels";
import type {
  FamilyGroup,
  FamilyPlan,
  FamilyRole,
  Member,
  MemberFeeStatus,
} from "../_types";
import { memberBalance, scheduledFee } from "./billing";
import { age } from "./format";
import { familyGroupName } from "./member-list";
import type { SystemState } from "./state";

// Family groups ("grupos familiares"): one account, billed to the holder,
// with a plan that depends on the children's ages.

// Children leave the group (and become individual members) at this age.
export const FAMILY_CHILD_MAX_AGE = 17;
// With a single child, the basic plan covers them until this age.
const BASIC_PLAN_CHILD_AGE = 5;

const ROLE_ORDER: Record<FamilyRole, number> = {
  titular: 0,
  conyuge: 1,
  hijo: 2,
  otro: 3,
};

export interface FamilyGroupSummary {
  group: FamilyGroup;
  name: string;
  holder?: Member;
  members: Member[];
  monthlyFee: number;
  feeStatus: MemberFeeStatus;
  overdueTotal: number;
  expectedPlan: FamilyPlan;
  warnings: string[];
}

// Holder first, then the spouse, then the children from the oldest.
export function sortFamily(members: Member[]): Member[] {
  return [...members].sort(
    (a, b) =>
      ROLE_ORDER[a.familyRole ?? "otro"] - ROLE_ORDER[b.familyRole ?? "otro"] ||
      a.birthDate.localeCompare(b.birthDate),
  );
}

export function familyMembers(member: Member, state: SystemState): Member[] {
  if (!member.familyGroupId) return [];
  return sortFamily(
    state.members.filter(
      ({ familyGroupId }) => familyGroupId === member.familyGroupId,
    ),
  );
}

// "Básico": no children, or one child under 5. "Pleno": one child of 5 or
// more, or more than one child.
export function expectedPlan(childAges: number[]): FamilyPlan {
  if (childAges.length === 0) return "basico";
  if (childAges.length === 1 && childAges[0] < BASIC_PLAN_CHILD_AGE)
    return "basico";
  return "pleno";
}

// What Secretaría should fix: a plan that no longer matches the children's
// ages, or children old enough to leave the group.
function planWarnings(
  plan: FamilyPlan,
  childAges: number[],
  adults: Member[],
): string[] {
  const expected = expectedPlan(childAges);
  const warnings = adults.map(
    (child) =>
      `${child.firstName} ya cumplió ${FAMILY_CHILD_MAX_AGE + 1}: pasa a socio individual.`,
  );
  if (expected === plan) return warnings;
  const children =
    childAges.length === 0
      ? "sin hijos menores en el grupo"
      : `${childAges.length === 1 ? "hijo/a de" : "hijos de"} ${childAges.join(", ")} años`;
  return [
    `Tiene plan ${FAMILY_PLAN_LABELS[plan].toLowerCase()} pero le corresponde el ${FAMILY_PLAN_LABELS[expected].toLowerCase()} (${children}).`,
    ...warnings,
  ];
}

export function familyGroupSummaries(
  state: SystemState,
  on: string,
): FamilyGroupSummary[] {
  return state.familyGroups.map((group) => {
    const members = sortFamily(
      state.members.filter(({ familyGroupId }) => familyGroupId === group.id),
    );
    const holder = members.find(({ id }) => id === group.holderMemberId);
    const children = members.filter(({ familyRole }) => familyRole === "hijo");
    const balance = holder && memberBalance(holder, state, on);
    const isMinor = (child: Member): boolean =>
      age(child.birthDate, on) <= FAMILY_CHILD_MAX_AGE;
    const ages = children
      .filter(isMinor)
      .map((child) => age(child.birthDate, on));
    return {
      group,
      name: familyGroupName(group, state.members),
      holder,
      members,
      monthlyFee: scheduledFee(
        state.settings,
        group.plan === "pleno" ? "familiar-pleno" : "familiar-basico",
      ).monthly,
      feeStatus: balance?.status ?? "al-dia",
      overdueTotal: balance?.overdueTotal ?? 0,
      expectedPlan: expectedPlan(ages),
      warnings: planWarnings(
        group.plan,
        ages,
        children.filter((child) => !isMinor(child)),
      ),
    };
  });
}

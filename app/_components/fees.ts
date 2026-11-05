// Current prices, shown in the FAQ. The club updates them often, so this is
// the only place to change when they do.

export interface VisitorFee {
  label: string;
  amount: string;
}

export const VISITOR_FEES: VisitorFee[] = [
  { label: "Mayores", amount: "$9.000" },
  { label: "Menores", amount: "$5.000" },
  { label: "Autos", amount: "$3.000" },
  { label: "Motos", amount: "$2.000" },
];

export interface MembershipFee {
  category: string;
  signUp: string;
  monthly: string;
}

export const MEMBERSHIP_FEES: MembershipFee[] = [
  { category: "Grupo familiar básico", signUp: "$88.000", monthly: "$44.000" },
  { category: "Grupo familiar pleno", signUp: "$116.000", monthly: "$58.000" },
  {
    category: "Individual / Deportivo (mayores de 18 años)",
    signUp: "$59.000",
    monthly: "$29.500",
  },
  { category: "Menor", signUp: "$33.000", monthly: "$16.500" },
  { category: "Jubilado", signUp: "$33.000", monthly: "$16.500" },
];

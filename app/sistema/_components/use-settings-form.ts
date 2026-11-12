"use client";

import { useState } from "react";
import type {
  FeeScheduleKey,
  ScheduledFee,
  SystemSettings,
} from "../_data/settings";
import type { PaymentMethod } from "../_types";
import { useSystem } from "./use-system";

type FeeField = keyof Pick<ScheduledFee, "signUp" | "monthly">;

const MAX_LATE_FEE_PERCENT = 50;
const MAX_DUE_DAY = 28;

interface SettingsForm {
  draft: SystemSettings;
  lateFeePercent: number;
  isDirty: boolean;
  errors: string[];
  setFee: (key: FeeScheduleKey, field: FeeField, value: string) => void;
  setLateFeePercent: (value: string) => void;
  setDueDay: (value: string) => void;
  togglePaymentMethod: (method: PaymentMethod) => void;
  save: () => void;
  discard: () => void;
}

function toNumber(value: string): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function validate(settings: SystemSettings): string[] {
  const errors: string[] = [];
  if (settings.fees.some(({ signUp, monthly }) => signUp <= 0 || monthly <= 0))
    errors.push("Todas las cuotas tienen que tener un valor mayor a cero.");
  const percent = settings.lateFeeRate * 100;
  if (percent < 0 || percent > MAX_LATE_FEE_PERCENT)
    errors.push(
      `El recargo por mora tiene que estar entre 0 y ${MAX_LATE_FEE_PERCENT}%.`,
    );
  if (
    !Number.isInteger(settings.dueDay) ||
    settings.dueDay < 1 ||
    settings.dueDay > MAX_DUE_DAY
  )
    errors.push(
      `El día de vencimiento tiene que ser un número entre 1 y ${MAX_DUE_DAY}.`,
    );
  if (settings.paymentMethods.length === 0)
    errors.push("Dejá habilitado al menos un medio de pago.");
  return errors;
}

// Draft of the settings screen: nothing reaches the store until "Guardar".
export function useSettingsForm(): SettingsForm {
  const { state, updateSettings, notify } = useSystem();
  const [draft, setDraft] = useState<SystemSettings>(state.settings);
  const errors = validate(draft);

  return {
    draft,
    lateFeePercent: Math.round(draft.lateFeeRate * 1000) / 10,
    isDirty: JSON.stringify(draft) !== JSON.stringify(state.settings),
    errors,
    setFee: (key, field, value) =>
      setDraft((current) => ({
        ...current,
        fees: current.fees.map((fee) =>
          fee.key === key ? { ...fee, [field]: toNumber(value) } : fee,
        ),
      })),
    setLateFeePercent: (value) =>
      setDraft((current) => ({
        ...current,
        lateFeeRate: toNumber(value) / 100,
      })),
    setDueDay: (value) =>
      setDraft((current) => ({ ...current, dueDay: toNumber(value) })),
    togglePaymentMethod: (method) =>
      setDraft((current) => ({
        ...current,
        paymentMethods: current.paymentMethods.includes(method)
          ? current.paymentMethods.filter((item) => item !== method)
          : [...current.paymentMethods, method],
      })),
    save: () => {
      if (errors.length > 0) {
        notify(errors[0], "error");
        return;
      }
      updateSettings(draft);
      notify(
        "Guardaste la configuración. Los cobros y las cuotas nuevas ya usan estos valores.",
      );
    },
    discard: () => setDraft(state.settings),
  };
}

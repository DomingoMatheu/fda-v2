"use client";

import { useState, type FormEvent } from "react";
import { INCOME_SOURCE_LABELS } from "../_data/labels";
import { parseAmount } from "../_lib/cash";
import { formatMoney } from "../_lib/format";
import type { IncomeSource, PaymentMethod } from "../_types";
import { useSystem } from "./use-system";

export const INCOME_SOURCES = Object.keys(
  INCOME_SOURCE_LABELS,
) as IncomeSource[];

interface CashIncomeForm {
  source: IncomeSource;
  setSource: (source: IncomeSource) => void;
  description: string;
  setDescription: (description: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  method: PaymentMethod;
  setMethod: (method: PaymentMethod) => void;
  methods: PaymentMethod[];
  error?: string;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

// State of "Registrar otro ingreso": anything that is not a fee payment and
// still goes into today's register (a visitor, a rental, the buffet's fee).
export function useCashIncome(onDone: () => void): CashIncomeForm {
  const { state, registerIncome, notify } = useSystem();
  const methods = state.settings.paymentMethods;
  const [source, setSource] = useState<IncomeSource>("otro");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>(
    methods.includes("efectivo") ? "efectivo" : methods[0],
  );
  const [error, setError] = useState<string>();

  return {
    source,
    setSource,
    description,
    setDescription,
    amount,
    setAmount,
    method,
    setMethod,
    methods,
    error,
    submit: (event) => {
      event.preventDefault();
      const value = parseAmount(amount);
      if (!description.trim()) {
        setError("Contá de qué es el ingreso.");
        return;
      }
      if (value <= 0) {
        setError("Poné un importe mayor a cero.");
        return;
      }
      registerIncome({
        source,
        description: description.trim(),
        amount: value,
        method,
      });
      notify(
        `Ingreso registrado: ${description.trim()} (${formatMoney(value)}).`,
        "success",
      );
      onDone();
    },
  };
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { Toast, ToastTone } from "./system-context";

const TOAST_MS = 4000;

interface Toasts {
  toasts: Toast[];
  notify: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

// Short-lived notices ("Cobro registrado") that close on their own.
export function useToasts(): Toasts {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const dismiss = (id: number): void =>
    setToasts((current) => current.filter((toast) => toast.id !== id));

  const notify = (message: string, tone: ToastTone = "success"): void => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      dismiss(id);
    }, TOAST_MS);
    timers.current.add(timer);
  };

  return { toasts, notify, dismiss };
}

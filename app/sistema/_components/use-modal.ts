"use client";

import { useRef, type RefObject } from "react";
import { useEscapeKey } from "@/app/_components/use-escape-key";
import { useFocusTrap } from "@/app/_components/use-focus-trap";

interface ModalRefs {
  dialogRef: RefObject<HTMLDivElement | null>;
}

// Escape closes the modal; focus stays inside it while it is open and goes
// back to whatever opened it afterwards.
export function useModal(open: boolean, onClose: () => void): ModalRefs {
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(
    typeof document === "undefined"
      ? null
      : (document.activeElement as HTMLElement | null),
  );
  useEscapeKey(open, onClose);
  useFocusTrap(dialogRef, openerRef, open, "input, select, textarea, button");
  return { dialogRef };
}

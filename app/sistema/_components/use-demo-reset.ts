"use client";

import { useState } from "react";
import { useSystem } from "./use-system";

interface DemoReset {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  confirm: () => void;
}

// "Reiniciar demo": asks first, then wipes what this browser saved.
export function useDemoReset(): DemoReset {
  const { resetDemo } = useSystem();
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    confirm: () => {
      resetDemo();
      setIsOpen(false);
    },
  };
}

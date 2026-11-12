"use client";

import { usePathname } from "next/navigation";
import { useRef, type RefObject } from "react";
import { useFocusTrap } from "@/app/_components/use-focus-trap";
import { useMenu } from "@/app/_components/use-menu";
import {
  SYSTEM_MODULES,
  findModule,
  type SystemModule,
} from "../_data/modules";
import { can } from "../_lib/permissions";
import { useSystem } from "./use-system";

interface Shell {
  modules: SystemModule[];
  current: SystemModule;
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  sidebarRef: RefObject<HTMLElement | null>;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

// Navigation state of the system: the modules the user's role can open, the
// one in view and the mobile menu.
export function useShell(): Shell {
  const pathname = usePathname();
  const { user } = useSystem();
  const menu = useMenu();
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(sidebarRef, menuButtonRef, menu.isOpen);

  return {
    modules: SYSTEM_MODULES.filter(
      ({ permission }) => !permission || can(user, permission),
    ),
    current: findModule(pathname),
    isMenuOpen: menu.isOpen,
    toggleMenu: menu.toggle,
    closeMenu: menu.close,
    sidebarRef,
    menuButtonRef,
  };
}

"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CLUB_NAME_MAIN } from "@/app/_components/club-info";
import { ROLE_LABELS } from "../_data/labels";
import { logout } from "../_actions/auth";
import { DEMO_TODAY } from "../_lib/clock";
import { formatDate } from "../_lib/format";
import { Icon } from "./icons";
import { MemberSearch } from "./member-search";
import { useShell } from "./use-shell";
import { useSystem } from "./use-system";

interface SystemShellProps {
  children: ReactNode;
}

export function SystemShell({ children }: SystemShellProps) {
  const { user } = useSystem();
  const {
    modules,
    current,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    sidebarRef,
    menuButtonRef,
  } = useShell();

  return (
    <div className={`sys-app${isMenuOpen ? " is-menu-open" : ""}`}>
      <aside id="sys-sidebar" className="sys-sidebar" ref={sidebarRef}>
        <div className="sys-sidebar__brand">
          <Image src="/escudo-limpio.svg" alt="" width={40} height={40} />
          <div>
            <p className="sys-sidebar__club">{CLUB_NAME_MAIN}</p>
            <p className="sys-sidebar__app">Sistema de gestión</p>
          </div>
          <button
            type="button"
            className="sys-sidebar__close"
            onClick={closeMenu}
            aria-label="Cerrar menú"
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className="sys-nav" aria-label="Módulos del sistema">
          <ul>
            {modules.map((systemModule) => (
              <li key={systemModule.href}>
                <Link
                  href={systemModule.href}
                  className="sys-nav__link"
                  aria-current={systemModule === current ? "page" : undefined}
                  onClick={closeMenu}
                >
                  <Icon name={systemModule.icon} />
                  {systemModule.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sys-sidebar__user">
          <div>
            <p className="sys-sidebar__user-name">{user.name}</p>
            <p className="sys-sidebar__user-role">{ROLE_LABELS[user.role]}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="sys-sidebar__logout">
              <Icon name="logout" />
              Salir
            </button>
          </form>
        </div>
      </aside>
      <button
        type="button"
        className="sys-backdrop"
        onClick={closeMenu}
        aria-label="Cerrar menú"
        tabIndex={-1}
      />
      <div className="sys-main">
        <header className="sys-topbar">
          <button
            type="button"
            className="sys-topbar__menu"
            ref={menuButtonRef}
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="sys-sidebar"
            aria-label="Abrir menú"
          >
            <Icon name="menu" />
          </button>
          <p className="sys-topbar__title">{current.label}</p>
          <MemberSearch />
          <p className="sys-topbar__date" title="La demo usa una fecha fija">
            Hoy {formatDate(DEMO_TODAY)}
          </p>
        </header>
        <main className="sys-content" id="contenido">
          {children}
        </main>
      </div>
    </div>
  );
}

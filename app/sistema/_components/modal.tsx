"use client";

import type { ReactNode } from "react";
import { Icon } from "./icons";
import { useModal } from "./use-modal";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

// Render it only while open: `{isOpen && <Modal … />}`.
export function Modal({
  title,
  onClose,
  children,
  footer,
  wide = false,
}: ModalProps) {
  const { dialogRef } = useModal(true, onClose);
  return (
    <div className="sys-modal">
      <button
        type="button"
        className="sys-modal__backdrop"
        onClick={onClose}
        aria-label="Cerrar"
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        className={`sys-modal__dialog${wide ? " is-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="sys-modal__header">
          <h2 className="sys-modal__title">{title}</h2>
          <button
            type="button"
            className="sys-icon-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </button>
        </header>
        <div className="sys-modal__body">{children}</div>
        {/* Not a <footer>: the landing styles every footer element. */}
        {footer && <div className="sys-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

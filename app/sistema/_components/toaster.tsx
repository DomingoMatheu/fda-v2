"use client";

import { useSystem } from "./use-system";

export function Toaster() {
  const { toasts, dismissToast } = useSystem();
  return (
    <div className="sys-toaster" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`sys-toast sys-toast--${toast.tone}`}>
          <span>{toast.message}</span>
          <button
            type="button"
            className="sys-toast__close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

"use client";

import { formatDate, fullName } from "../_lib/format";
import { Modal } from "./modal";
import { useClearanceForm } from "./use-clearance-form";

interface ClearanceModalProps {
  memberId: string;
  onClose: () => void;
}

export function ClearanceModal({ memberId, onClose }: ClearanceModalProps) {
  const form = useClearanceForm(memberId, onClose);
  const current = form.member?.medicalClearance;

  return (
    <Modal
      title="Cargar apto médico"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="sys-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="sys-clearance-form"
            className="sys-button sys-button--primary"
          >
            Guardar apto
          </button>
        </>
      }
    >
      <form
        id="sys-clearance-form"
        className="sys-form"
        onSubmit={(event) => {
          event.preventDefault();
          form.save();
        }}
      >
        {form.member && (
          <div className="sys-season__modal-member">
            <p className="sys-season__modal-name">{fullName(form.member)}</p>
            <p className="sys-season__muted">
              Socio n.º {form.member.memberNumber}
              {current
                ? ` · Apto actual hasta el ${formatDate(current.expiresAt)}`
                : " · Sin apto cargado"}
            </p>
          </div>
        )}
        <div className="sys-season__form-row">
          <label className="sys-field">
            <span className="sys-field__label">Fecha del apto</span>
            <input
              type="date"
              className="sys-input"
              value={form.issuedAt}
              onChange={(event) => form.setIssuedAt(event.target.value)}
              required
            />
          </label>
          <label className="sys-field">
            <span className="sys-field__label">Vence el</span>
            <input
              type="date"
              className="sys-input"
              value={form.expiresAt}
              onChange={(event) => form.setExpiresAt(event.target.value)}
              required
            />
          </label>
        </div>
        <label className="sys-field">
          <span className="sys-field__label">Médico (opcional)</span>
          <input
            className="sys-input"
            value={form.physician}
            onChange={(event) => form.setPhysician(event.target.value)}
            placeholder="Dra. Gómez"
          />
        </label>
        {form.error && (
          <p className="sys-form__error" role="alert">
            {form.error}
          </p>
        )}
      </form>
    </Modal>
  );
}

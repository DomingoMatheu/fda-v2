"use client";

import { INTEGRATIONS } from "../_data/integrations";
import { PAYMENT_METHOD_LABELS, ROLE_LABELS } from "../_data/labels";
import { USERS } from "../_data/users";
import { formatDateTime } from "../_lib/format";
import type { PaymentMethod } from "../_types";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { Badge } from "./status-badge";
import { useSettingsForm } from "./use-settings-form";
import { useSystem } from "./use-system";

const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

function SettingsContent() {
  const form = useSettingsForm();
  const { user } = useSystem();
  const { draft } = form;

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Configuración"
        description="Los valores que usa el sistema para cobrar. Los cambia el club, sin llamar a un programador."
      />
      <form
        className="sys-settings"
        onSubmit={(event) => {
          event.preventDefault();
          form.save();
        }}
      >
        <section
          className="sys-card sys-settings__section"
          aria-labelledby="sys-settings-fees"
        >
          <h2 id="sys-settings-fees" className="sys-card__title">
            Cuotas por categoría y plan
          </h2>
          <p className="sys-settings__help">
            Lo que paga cada socio al inscribirse y todos los meses. Los
            vitalicios no pagan cuota.
          </p>
          <div className="sys-table-wrap">
            <table className="sys-table sys-settings__fees">
              <thead>
                <tr>
                  <th scope="col">Categoría o plan</th>
                  <th scope="col" className="is-end">
                    Inscripción
                  </th>
                  <th scope="col" className="is-end">
                    Cuota mensual
                  </th>
                </tr>
              </thead>
              <tbody>
                {draft.fees.map((fee) => (
                  <tr key={fee.key}>
                    <th scope="row">{fee.label}</th>
                    <td className="is-end">
                      <label className="sys-settings__money">
                        <span
                          className="sys-settings__money-label"
                          aria-hidden="true"
                        >
                          Inscripción
                        </span>
                        <span aria-hidden="true">$</span>
                        <input
                          className="sys-input"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={500}
                          value={fee.signUp}
                          aria-label={`Inscripción ${fee.label}`}
                          onChange={(event) =>
                            form.setFee(fee.key, "signUp", event.target.value)
                          }
                        />
                      </label>
                    </td>
                    <td className="is-end">
                      <label className="sys-settings__money">
                        <span
                          className="sys-settings__money-label"
                          aria-hidden="true"
                        >
                          Cuota mensual
                        </span>
                        <span aria-hidden="true">$</span>
                        <input
                          className="sys-input"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={500}
                          value={fee.monthly}
                          aria-label={`Cuota mensual ${fee.label}`}
                          onChange={(event) =>
                            form.setFee(fee.key, "monthly", event.target.value)
                          }
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="sys-settings__pair">
          <section
            className="sys-card sys-settings__section"
            aria-labelledby="sys-settings-late"
          >
            <h2 id="sys-settings-late" className="sys-card__title">
              Vencimiento y mora
            </h2>
            <div className="sys-settings__fields">
              <label className="sys-field">
                <span className="sys-field__label">Día de vencimiento</span>
                <input
                  className="sys-input"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={28}
                  value={draft.dueDay}
                  onChange={(event) => form.setDueDay(event.target.value)}
                />
                <span className="sys-settings__help">
                  Las cuotas vencen ese día de cada mes.
                </span>
              </label>
              <label className="sys-field">
                <span className="sys-field__label">Recargo por mora (%)</span>
                <input
                  className="sys-input"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={50}
                  step={0.5}
                  value={form.lateFeePercent}
                  onChange={(event) =>
                    form.setLateFeePercent(event.target.value)
                  }
                />
                <span className="sys-settings__help">
                  Se suma solo al cobrar una cuota vencida.
                </span>
              </label>
            </div>
          </section>

          <section
            className="sys-card sys-settings__section"
            aria-labelledby="sys-settings-methods"
          >
            <h2 id="sys-settings-methods" className="sys-card__title">
              Medios de pago habilitados
            </h2>
            <p className="sys-settings__help">
              Los que aparecen al registrar un cobro.
            </p>
            <div className="sys-settings__methods">
              {PAYMENT_METHODS.map((method) => (
                <label key={method} className="sys-settings__method">
                  <input
                    type="checkbox"
                    checked={draft.paymentMethods.includes(method)}
                    onChange={() => form.togglePaymentMethod(method)}
                  />
                  {PAYMENT_METHOD_LABELS[method]}
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="sys-settings__actions">
          {form.errors.length > 0 && form.isDirty && (
            <p className="sys-form__error" role="alert">
              {form.errors[0]}
            </p>
          )}
          <p className="sys-settings__status" aria-live="polite">
            {form.isDirty ? "Tenés cambios sin guardar." : "Sin cambios."}
          </p>
          <button
            type="button"
            className="sys-button"
            onClick={form.discard}
            disabled={!form.isDirty}
          >
            Descartar
          </button>
          <button
            type="submit"
            className="sys-button sys-button--primary"
            disabled={!form.isDirty}
          >
            Guardar cambios
          </button>
        </div>
      </form>

      <section
        className="sys-card sys-settings__section"
        aria-labelledby="sys-settings-users"
      >
        <h2 id="sys-settings-users" className="sys-card__title">
          Usuarios
        </h2>
        <p className="sys-settings__help">
          Cada persona entra con su usuario y ve solo lo que su rol permite.
        </p>
        <div className="sys-table-wrap">
          <table className="sys-table">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col" className="is-hidden-mobile">
                  Usuario
                </th>
                <th scope="col">Rol</th>
                <th scope="col" className="is-hidden-mobile">
                  Último acceso
                </th>
              </tr>
            </thead>
            <tbody>
              {USERS.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.name}
                    {item.id === user.id && (
                      <span className="sys-settings__you"> (vos)</span>
                    )}
                  </td>
                  <td className="is-hidden-mobile sys-settings__username">
                    {item.username}
                  </td>
                  <td>{ROLE_LABELS[item.role]}</td>
                  <td className="is-hidden-mobile sys-settings__login">
                    {item.lastLoginAt
                      ? formatDateTime(item.lastLoginAt)
                      : "Nunca"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="sys-settings__section"
        aria-labelledby="sys-settings-integrations"
      >
        <h2 id="sys-settings-integrations" className="sys-settings__heading">
          Integraciones
        </h2>
        <ul className="sys-settings__integrations">
          {INTEGRATIONS.map((integration) => (
            <li
              key={integration.id}
              className="sys-card sys-settings__integration"
            >
              <div className="sys-settings__integration-head">
                <h3>{integration.name}</h3>
                <Badge tone="info">Próximamente</Badge>
              </div>
              <p>{integration.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function SettingsView() {
  return (
    <PermissionGate permission="settings:write">
      <SettingsContent />
    </PermissionGate>
  );
}

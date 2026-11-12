"use client";

import { ROLE_LABELS } from "../_data/labels";
import { DEMO_PASSWORD, USERS } from "../_data/users";
import { useLoginForm } from "./use-login-form";

export function LoginForm() {
  const {
    state,
    action,
    pending,
    username,
    password,
    setUsername,
    setPassword,
    fillDemoAccount,
  } = useLoginForm();

  return (
    <div className="sys-login__card">
      <h1 className="sys-login__title">Ingresá al sistema</h1>
      <p className="sys-login__lead">
        Desde cualquier compu o celular, con tu usuario.
      </p>
      <form action={action} className="sys-form">
        <label className="sys-field">
          <span className="sys-field__label">Usuario</span>
          <input
            name="username"
            className="sys-input"
            autoComplete="username"
            autoCapitalize="none"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className="sys-field">
          <span className="sys-field__label">Clave</span>
          <input
            name="password"
            type="password"
            className="sys-input"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {state.error && (
          <p className="sys-form__error" role="alert">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          className="sys-button sys-button--primary sys-button--block"
          disabled={pending}
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <div className="sys-login__demo">
        <p className="sys-eyebrow">Cuentas de demo</p>
        <p>
          Usuario <strong>secretaria</strong>, clave{" "}
          <strong>{DEMO_PASSWORD}</strong>. Probá también los otros roles:
        </p>
        <div className="sys-login__roles">
          {USERS.map((user) => (
            <button
              key={user.id}
              type="button"
              className="sys-chip"
              aria-pressed={username === user.username}
              onClick={() => fillDemoAccount(user.username)}
            >
              {ROLE_LABELS[user.role]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

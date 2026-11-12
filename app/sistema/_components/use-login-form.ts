"use client";

import { useActionState, useState } from "react";
import { login } from "../_actions/auth";
import { DEMO_PASSWORD } from "../_data/users";
import type { LoginState } from "../_types";

interface LoginForm {
  state: LoginState;
  action: (formData: FormData) => void;
  pending: boolean;
  username: string;
  password: string;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  fillDemoAccount: (username: string) => void;
}

export function useLoginForm(): LoginForm {
  const [state, action, pending] = useActionState(login, {});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return {
    state,
    action,
    pending,
    username,
    password,
    setUsername,
    setPassword,
    fillDemoAccount: (demoUsername) => {
      setUsername(demoUsername);
      setPassword(DEMO_PASSWORD);
    },
  };
}

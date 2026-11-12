"use client";

import { useEffect, useRef, type Dispatch } from "react";
import {
  DEMO_STORAGE_KEY,
  loadDemoState,
  saveDemoState,
} from "../_lib/demo-storage";
import type { SystemState } from "../_lib/state";
import type { SystemAction } from "../_lib/system-reducer";

// Restores the demo from the browser once mounted, saves every change and
// follows the changes made in other tabs, so two tabs never overwrite each
// other. The first render always uses the seed, so the server and the client
// agree.
export function useDemoPersistence(
  state: SystemState,
  dispatch: Dispatch<SystemAction>,
): void {
  const restored = useRef(false);
  // The seed of the first render, to check the saved data against.
  const seed = useRef(state);

  // Declared before the restore effect on purpose: on the first commit it
  // runs while `restored` is still false, so the seed never overwrites what
  // the browser had saved.
  useEffect(() => {
    if (restored.current) saveDemoState(state);
  }, [state]);

  useEffect(() => {
    const saved = loadDemoState(seed.current);
    if (saved) dispatch({ type: "replaceState", state: saved });
    restored.current = true;

    const onStorage = (event: StorageEvent): void => {
      if (event.key !== DEMO_STORAGE_KEY) return;
      dispatch({
        type: "replaceState",
        state: loadDemoState(seed.current) ?? seed.current,
      });
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      // React may run this effect again (Strict Mode does on mount): until it
      // restores again, nothing may be saved over the stored data.
      restored.current = false;
    };
  }, [dispatch]);
}

import type { ToastPayload, ToastListener } from "@/types/_root/utils/toastEmitter.types";
// A simple event emitter so non-React files can trigger toasts
let listener: ToastListener | null = null;

export const toastEmitter = {
  // Called once by the global ToastProvider to register itself
  register: (fn: ToastListener) => { listener = fn; },

  // Called by apiClient or any non-React file
  emit: (payload: ToastPayload) => {
    if (listener) listener(payload);
    else console.warn("[Toast] No listener registered yet.", payload);
  },
};
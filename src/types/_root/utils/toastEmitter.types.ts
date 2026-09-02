
export type ToastPayload = {
  title:       string;
  description?: string;
  variant?:    "default" | "destructive";
};
export type ToastListener = (payload: ToastPayload) => void;

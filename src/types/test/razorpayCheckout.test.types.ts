
export interface RazorpayOptions {
  amount?: number;
  handler: (response: Record<string, string>) => void;
  modal: { ondismiss: () => void };
}
export interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (response?: unknown) => void) => void;
}

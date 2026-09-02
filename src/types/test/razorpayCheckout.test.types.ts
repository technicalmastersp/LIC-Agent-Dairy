
export interface RazorpayOptions {
  handler: (response: Record<string, string>) => void;
  modal: { ondismiss: () => void };
}
export interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: () => void) => void;
}

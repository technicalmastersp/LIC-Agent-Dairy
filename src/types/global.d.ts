// Single source of truth for ambient/global type augmentations.
// Keeping every `declare global` block here (rather than scattered next to
// whichever module happens to touch the global) makes them easy to find —
// this file doesn't need to be imported anywhere; TypeScript picks up all
// .d.ts files under the project's `include` globs automatically.

// Used by src/utils/loadRazorpay.ts / src/utils/razorpayCheckout.ts —
// Razorpay's Checkout.js script attaches its constructor to `window` at
// runtime, so there's no npm package types to lean on here.
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export {};

// Dynamically loads the Razorpay Checkout script once, on demand.
// The `Window.Razorpay` ambient type lives in src/types/global.d.ts.
let loadingPromise: Promise<void> | null = null;

export const loadRazorpayScript = (): Promise<void> => {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve();
  }
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    // Neither onload nor onerror is guaranteed to fire if the request just
    // stalls (flaky connection, silently blocked request) — without this,
    // the promise never settles and checkout is stuck on "Processing…" forever.
    const timeoutId = setTimeout(() => {
      loadingPromise = null; // let the next attempt retry instead of reusing this rejection
      reject(new Error("Razorpay checkout script timed out loading. Please check your connection and try again."));
    }, 15000);

    script.onload = () => {
      clearTimeout(timeoutId);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timeoutId);
      loadingPromise = null; // let the next attempt retry instead of reusing this rejection
      reject(new Error("Failed to load Razorpay checkout script."));
    };
    document.body.appendChild(script);
  });

  return loadingPromise;
};
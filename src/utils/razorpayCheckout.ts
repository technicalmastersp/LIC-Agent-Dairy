import { loadRazorpayScript } from "./loadRazorpay";
import siteConfig from "@/config/siteConfig";
import type { RazorpaySuccessResponse, OpenCheckoutOptions } from "@/types/utils/razorpayCheckout.types";
export const openRazorpayCheckout = async (
  options: OpenCheckoutOptions
): Promise<RazorpaySuccessResponse> => {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay checkout script failed to load."));
      return;
    }
    const rzp = new window.Razorpay({
      key: options.order.keyId,
      amount: Math.round(options.order.amount * 100), // paise (rounded: avoids float drift e.g. 0.29*100)
      currency: options.order.currency,
      order_id: options.order.razorpayOrderId,
      name: siteConfig.companyName,
      description: "Subscription plan payment",
      prefill: {
        name: options.userName,
        email: options.userEmail,
        contact: options.userContact,
      },
      handler: (response: RazorpaySuccessResponse) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("PAYMENT_CANCELLED")),
      },
      theme: { color: "#2563eb" },
    });

    // Do NOT reject here. Razorpay keeps the modal open after a failed attempt so the
    // user can retry (another card / UPI). Rejecting would settle the promise early and
    // silently drop a later successful `handler` call -> customer charged, plan not
    // activated, verify never called. The terminal outcomes are `handler` (paid) and
    // `ondismiss` (user closed the modal). Failed attempts are surfaced via onFailure.
    rzp.on("payment.failed", (resp?: unknown) => options.onFailure?.(resp));
    rzp.open();
  });
};
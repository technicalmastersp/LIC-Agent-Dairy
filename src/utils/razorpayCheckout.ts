import { loadRazorpayScript } from "./loadRazorpay";
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
      amount: options.order.amount * 100, // paise
      currency: options.order.currency,
      order_id: options.order.razorpayOrderId,
      name: "LIC Agent Dairy",
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

    rzp.on("payment.failed", () => reject(new Error("PAYMENT_FAILED")));
    rzp.open();
  });
};
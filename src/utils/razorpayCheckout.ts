import { loadRazorpayScript } from "./loadRazorpay";

interface RazorpayOrderInfo {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface OpenCheckoutOptions {
  order: RazorpayOrderInfo;
  userName?: string;
  userEmail?: string;
  userContact?: string;
}

export const openRazorpayCheckout = async (
  options: OpenCheckoutOptions
): Promise<RazorpaySuccessResponse> => {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
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
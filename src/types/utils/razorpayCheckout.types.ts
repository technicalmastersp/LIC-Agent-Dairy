
export interface RazorpayOrderInfo {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}
export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
export interface OpenCheckoutOptions {
  order: RazorpayOrderInfo;
  userName?: string;
  userEmail?: string;
  userContact?: string;
  /** Called on each failed attempt; the modal stays open so the user can retry. */
  onFailure?: (response: unknown) => void;
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./loadRazorpay", () => ({
  loadRazorpayScript: vi.fn().mockResolvedValue(undefined),
}));

const order = {
  razorpayOrderId: "order_1", amount: 999, currency: "INR", keyId: "rzp_test",
};

// Matches window.Razorpay's declared constructor type in loadRazorpay.ts —
// reusing that shape here instead of `any` keeps this test honest about
// what the real constructor options/instance actually look like.
interface RazorpayOptions {
  handler: (response: Record<string, string>) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: () => void) => void;
}

describe("openRazorpayCheckout", () => {
  let RazorpayMock: Mock<(opts: RazorpayOptions) => RazorpayInstance>;

  beforeEach(() => {
    RazorpayMock = vi.fn();
    // window.Razorpay is already declared globally (see loadRazorpay.ts) as
    // `new (options: Record<string, unknown>) => { open, on }` — a vi.fn()
    // mock isn't natively typed as constructable, so one narrow cast
    // through the real declared type (not `any`) bridges that gap.
    window.Razorpay = RazorpayMock as unknown as NonNullable<Window["Razorpay"]>;
  });

  it("resolves with the payment response when checkout succeeds", async () => {
    const successResponse = {
      razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: "sig_1",
    };
    RazorpayMock.mockImplementation((opts) => ({
      open: () => opts.handler(successResponse),
      on: vi.fn(),
    }));

    const { openRazorpayCheckout } = await import("../utils/razorpayCheckout");
    await expect(openRazorpayCheckout({ order })).resolves.toEqual(successResponse);
  });

  it("rejects with PAYMENT_CANCELLED when the modal is dismissed", async () => {
    RazorpayMock.mockImplementation((opts) => ({
      open: () => opts.modal.ondismiss(),
      on: vi.fn(),
    }));

    const { openRazorpayCheckout } = await import("../utils/razorpayCheckout");
    await expect(openRazorpayCheckout({ order })).rejects.toThrow("PAYMENT_CANCELLED");
  });

  it("rejects with PAYMENT_FAILED when Razorpay emits a payment.failed event", async () => {
    RazorpayMock.mockImplementation(() => ({
      open: vi.fn(),
      on: (event: string, cb: () => void) => {
        if (event === "payment.failed") cb();
      },
    }));

    const { openRazorpayCheckout } = await import("../utils/razorpayCheckout");
    await expect(openRazorpayCheckout({ order })).rejects.toThrow("PAYMENT_FAILED");
  });

  it("rejects if window.Razorpay never loaded", async () => {
    delete window.Razorpay;
    const { openRazorpayCheckout } = await import("../utils/razorpayCheckout");
    await expect(openRazorpayCheckout({ order })).rejects.toThrow(
      "Razorpay checkout script failed to load."
    );
  });
});
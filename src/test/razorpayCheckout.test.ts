import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import type { RazorpayOptions, RazorpayInstance } from "@/types/test/razorpayCheckout.test.types";

vi.mock("../utils/loadRazorpay", () => ({
  loadRazorpayScript: vi.fn().mockResolvedValue(undefined),
}));

const order = {
  razorpayOrderId: "order_1", amount: 999, currency: "INR", keyId: "rzp_test",
};

// Matches window.Razorpay's declared constructor type in loadRazorpay.ts —
// reusing that shape here instead of `any` keeps this test honest about
// what the real constructor options/instance actually look like.
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

  it("a failed attempt does NOT settle the promise — a later successful retry still resolves", async () => {
    const successResponse = {
      razorpay_order_id: "order_1", razorpay_payment_id: "pay_2", razorpay_signature: "sig_2",
    };
    const onFailure = vi.fn();
    RazorpayMock.mockImplementation((opts) => {
      const listeners: Record<string, (r: unknown) => void> = {};
      return {
        on: (event: string, cb: (r: unknown) => void) => { listeners[event] = cb; },
        open: () => {
          listeners["payment.failed"]?.({ error: { code: "BAD_REQUEST_ERROR" } }); // attempt 1 fails
          opts.handler(successResponse);                                           // attempt 2 succeeds
        },
      };
    });

    const { openRazorpayCheckout } = await import("../utils/razorpayCheckout");
    await expect(openRazorpayCheckout({ order, onFailure })).resolves.toEqual(successResponse);
    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it("sends an integer paise amount (no float drift)", async () => {
    let captured: RazorpayOptions | undefined;
    RazorpayMock.mockImplementation((opts) => {
      captured = opts;
      return { open: () => opts.modal.ondismiss(), on: vi.fn() };
    });
    const { openRazorpayCheckout } = await import("../utils/razorpayCheckout");
    await expect(openRazorpayCheckout({ order: { ...order, amount: 0.29 } })).rejects.toThrow();
    expect(captured?.amount).toBe(29); // 0.29 * 100 === 28.999999999999996 without Math.round
  });

  it("rejects if window.Razorpay never loaded", async () => {
    delete window.Razorpay;
    const { openRazorpayCheckout } = await import("../utils/razorpayCheckout");
    await expect(openRazorpayCheckout({ order })).rejects.toThrow(
      "Razorpay checkout script failed to load."
    );
  });
});
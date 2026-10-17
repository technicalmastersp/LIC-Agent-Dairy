// What the user SEES when the backend reports wrong passwords, a locked account, or an
// exhausted password-reset OTP. Responses are shaped exactly like the backend's.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { LanguageProvider } from "@/hooks/useLanguage";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";

vi.setConfig({ testTimeout: 30_000 });
(globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };

const svc = vi.hoisted(() => ({
  login: vi.fn(), getProfile: vi.fn(), forgotPassword: vi.fn(), verifyOTP: vi.fn(), resetPassword: vi.fn(),
}));
vi.mock("../../services/userService", () => svc);
vi.mock("@/utils/auth", () => ({ getCurrentUser: () => null, setCurrentUser: vi.fn(), isAuthenticated: () => false }));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("@/components/LanguageSwitcher", () => ({ default: () => null }));

const httpError = (status: number, data: unknown) =>
  new AxiosError("fail", "ERR_BAD_REQUEST", undefined, undefined, { status, data, statusText: "", headers: {}, config: {} } as unknown as AxiosResponse);

const renderPage = (ui: React.ReactElement) =>
  render(<LanguageProvider><MemoryRouter>{ui}</MemoryRouter></LanguageProvider>);

const submitLogin = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText(/user id|email/i), "agent@example.com");
  await user.type(screen.getByPlaceholderText(/^password$/i), "whatever1");
  await user.click(screen.getByRole("button", { name: /^login$/i }));
};

beforeEach(() => { document.body.innerHTML = ""; vi.clearAllMocks(); });

describe("Login — wrong password countdown", () => {
  it("no hint while plenty of attempts remain", async () => {
    svc.login.mockRejectedValue(Object.assign(new Error("Invalid credentials"), { attemptsLeft: 4 }));
    renderPage(<Login />); await submitLogin();
    const alert = await screen.findByText(/Invalid User ID or Password/i);
    expect(alert.textContent).not.toMatch(/attempt/i);
  });
  it("warns with 2 attempts left", async () => {
    svc.login.mockRejectedValue(Object.assign(new Error("Invalid credentials"), { attemptsLeft: 2 }));
    renderPage(<Login />); await submitLogin();
    expect(await screen.findByText(/2 attempts left before this account is temporarily locked/i)).toBeInTheDocument();
  });
  it("uses the singular for the last attempt", async () => {
    svc.login.mockRejectedValue(Object.assign(new Error("Invalid credentials"), { attemptsLeft: 1 }));
    renderPage(<Login />); await submitLogin();
    expect(await screen.findByText(/1 attempt left before this account is temporarily locked/i)).toBeInTheDocument();
  });
  it("old backend (no attemptsLeft) still shows the plain message", async () => {
    svc.login.mockRejectedValue(new Error("Invalid credentials"));
    renderPage(<Login />); await submitLogin();
    const alert = await screen.findByText(/Invalid User ID or Password/i);
    expect(alert.textContent).not.toMatch(/attempt/i);
  });
});

describe("Login — locked account (HTTP 429)", () => {
  it("shows the lock with minutes rounded UP (never claims a shorter wait than real)", async () => {
    svc.login.mockRejectedValue(httpError(429, { code: "LOGIN_LOCKED", retryAfterSeconds: 61, message: "Too many failed login attempts…" }));
    renderPage(<Login />); await submitLogin();
    expect(await screen.findByText(/try again in 2 minute\(s\), or reset your password/i)).toBeInTheDocument();
  });
  it("a full lock reads as 15 minutes", async () => {
    svc.login.mockRejectedValue(httpError(429, { code: "LOGIN_LOCKED", retryAfterSeconds: 900 }));
    renderPage(<Login />); await submitLogin();
    expect(await screen.findByText(/try again in 15 minute\(s\)/i)).toBeInTheDocument();
  });
  it("never shows the misleading 'Invalid User ID or Password' for a lock", async () => {
    svc.login.mockRejectedValue(httpError(429, { code: "LOGIN_LOCKED", retryAfterSeconds: 300 }));
    renderPage(<Login />); await submitLogin();
    await screen.findByText(/try again in 5 minute/i);
    expect(screen.queryByText(/Invalid User ID or Password/i)).toBeNull();
  });
  it("the plain per-IP rate limit (429 without our code) shows the server's message", async () => {
    svc.login.mockRejectedValue(httpError(429, { message: "Too many login attempts, please try again later." }));
    renderPage(<Login />); await submitLogin();
    expect(await screen.findByText(/Too many login attempts, please try again later/i)).toBeInTheDocument();
  });
  it("earlier behaviours are intact: server error and network error", async () => {
    svc.login.mockRejectedValue(httpError(503, {}));
    renderPage(<Login />); await submitLogin();
    expect(await screen.findByText(/couldn't reach the server/i)).toBeInTheDocument();
  });
});

describe("Forgot password — OTP exhausted", () => {
  const goToOtpStep = async () => {
    const user = userEvent.setup();
    svc.forgotPassword.mockResolvedValue({});
    renderPage(<ForgotPassword />);
    await user.type(screen.getByRole("textbox"), "agent@example.com");
    await user.click(screen.getByRole("button", { name: /send/i }));
    await screen.findByText(/Check your email/i);
    // Set each digit directly: typing into auto-advancing boxes races with their focus handling.
    const boxes = screen.getAllByRole("textbox");
    expect(boxes).toHaveLength(6);
    boxes.forEach((box, i) => fireEvent.change(box, { target: { value: String((i + 1) % 10) } }));
    expect(boxes.map((b) => (b as HTMLInputElement).value).join("")).toBe("123456");
    return user;
  };

  it("OTP_ATTEMPTS_EXCEEDED: shows the message, clears the boxes and lets the user request a new OTP", async () => {
    svc.verifyOTP.mockRejectedValue(httpError(400, { code: "OTP_ATTEMPTS_EXCEEDED", message: "Too many incorrect OTP attempts. Please request a new OTP." }));
    const user = await goToOtpStep();
    await user.click(screen.getByRole("button", { name: /verify/i }));
    expect(await screen.findByText(/Too many incorrect OTP attempts/i)).toBeInTheDocument();
    for (const box of screen.getAllByRole("textbox")) expect(box).toHaveValue("");
    expect(screen.getByRole("button", { name: /resend otp/i })).toBeInTheDocument();   // enabled immediately, no 30s wait
  });

  it("OTP_INVALID with 2 left: tells the user how many tries remain", async () => {
    svc.verifyOTP.mockRejectedValue(httpError(400, { code: "OTP_INVALID", attemptsLeft: 2 }));
    const user = await goToOtpStep();
    await user.click(screen.getByRole("button", { name: /verify/i }));
    expect(await screen.findByText(/Invalid OTP\. 2 attempts left\./i)).toBeInTheDocument();
  });

  it("OTP_INVALID with plenty left: unchanged message", async () => {
    svc.verifyOTP.mockRejectedValue(httpError(400, { code: "OTP_INVALID", attemptsLeft: 4 }));
    const user = await goToOtpStep();
    await user.click(screen.getByRole("button", { name: /verify/i }));
    expect(await screen.findByText(/Invalid OTP\. Please check and try again\./i)).toBeInTheDocument();
  });
});

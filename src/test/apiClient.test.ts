import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AxiosInstance } from "axios";

const toastEmitterEmit = vi.fn();
vi.mock("../../utils/toastEmitter", () => ({
  toastEmitter: { emit: toastEmitterEmit },
}));

// apiClient.js reads window.location.href as a plain assignment — jsdom
// lets us read/reset it directly between tests.
const originalLocation = window.location;

beforeEach(() => {
  vi.resetModules();
  toastEmitterEmit.mockClear();
  // jsdom's window.location isn't writable by plain assignment, and
  // deleting/reassigning it needs a real property descriptor rather than
  // an `any` cast — this keeps window.location's actual Location type
  // intact everywhere else in the test.
  Object.defineProperty(window, "location", {
    writable: true,
    configurable: true,
    value: { ...originalLocation, href: "" },
  });
  global.fetch = vi.fn().mockResolvedValue({ ok: true });
});

const importApiClient = async () => (await import("../../api/apiClient.js")).default;

// axios's public AxiosInterceptorManager type doesn't expose `handlers` —
// it's an internal implementation array, not part of the published
// typings — so accessing it needs one narrow, precisely-shaped cast
// rather than `any`. This shape matches exactly what every test below
// constructs as its mock error argument.
interface MockAxiosError {
  response?: { status: number; data?: Record<string, unknown> };
  config: Record<string, unknown>;
}
type RejectedHandler = (error: MockAxiosError) => Promise<never>;
interface InterceptorHandlers {
  handlers: Array<{ rejected: RejectedHandler } | null>;
}

const getRejectedHandler = (client: AxiosInstance): RejectedHandler => {
  const handlers = (client.interceptors.response as unknown as InterceptorHandlers).handlers;
  return handlers[0]!.rejected;
};

describe("apiClient response interceptor", () => {
  it("401 SESSION_INVALIDATED clears the session and redirects with reason=session_ended", async () => {
    const apiClient = await importApiClient();
    const handler = getRejectedHandler(apiClient);

    await expect(
      handler({
        response: { status: 401, data: { code: "SESSION_INVALIDATED", message: "x" } },
        config: {},
      })
    ).rejects.toBeDefined();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({ method: "POST", credentials: "include" })
    );
    expect(window.location.href).toBe("/login?reason=session_ended");
  });

  it("plain 401 shows a session-expired toast and redirects to /login", async () => {
    const apiClient = await importApiClient();
    const handler = getRejectedHandler(apiClient);

    await expect(
      handler({ response: { status: 401, data: { message: "expired" } }, config: {} })
    ).rejects.toBeDefined();

    expect(toastEmitterEmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Session Expired" })
    );
    expect(window.location.href).toBe("/login");
  });

  it("403 SUBSCRIPTION_EXPIRED redirects to /our-plans instead of toasting", async () => {
    const apiClient = await importApiClient();
    const handler = getRejectedHandler(apiClient);

    await expect(
      handler({
        response: { status: 403, data: { code: "SUBSCRIPTION_EXPIRED", message: "x" } },
        config: {},
      })
    ).rejects.toBeDefined();

    expect(window.location.href).toBe("/our-plans?reason=expired");
    expect(toastEmitterEmit).not.toHaveBeenCalled();
  });

  it("403 with no special code shows an Access Denied toast and does not redirect", async () => {
    const apiClient = await importApiClient();
    const handler = getRejectedHandler(apiClient);

    await expect(
      handler({ response: { status: 403, data: { message: "nope" } }, config: {} })
    ).rejects.toBeDefined();

    expect(toastEmitterEmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Access Denied" })
    );
    expect(window.location.href).toBe("");
  });

  it("network error (no response) shows a Network Error toast", async () => {
    const apiClient = await importApiClient();
    const handler = getRejectedHandler(apiClient);

    await expect(handler({ config: {} })).rejects.toBeDefined();
    expect(toastEmitterEmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Network Error" })
    );
  });
});
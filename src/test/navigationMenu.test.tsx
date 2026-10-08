// The logged-in user menu only exists in the DOM once it is opened, so the page
// render tests (which mock Navigation) can't see it. This opens the REAL menu
// and checks the "Referral Program" entry follows the build-time switch.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

const h = vi.hoisted(() => ({
  user: { name: "Test Agent", easyId: "EZ1", role: "user", userPersonalInfo: [{ name: "Test Agent" }] } as Record<string, unknown>,
}));
vi.mock("@/utils/auth", () => ({
  getCurrentUser: () => h.user,
  isAuthenticated: () => true,
  setCurrentUser: vi.fn(),
}));
vi.mock("@/components/NotificationBell", () => ({ default: () => null }));
vi.mock("../../services/userService", () => ({ logoutCurrentUser: vi.fn() }));

(globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
vi.setConfig({ testTimeout: 30_000 });

let unmount: (() => void) | undefined;

async function openUserMenu(flag: boolean) {
  vi.resetModules();
  vi.stubEnv("VITE_REFERRAL_PROGRAM_ENABLED", flag ? "true" : "");
  const { render, screen, cleanup } = await import("@testing-library/react");
  unmount = cleanup;
  const { default: userEvent } = await import("@testing-library/user-event");
  const React = await import("react");
  const { LanguageProvider } = await import("@/hooks/useLanguage");
  const { default: Navigation } = await import("@/components/Navigation");
  render(React.createElement(LanguageProvider, null, React.createElement(MemoryRouter, null, React.createElement(Navigation))));
  await userEvent.setup().click(screen.getByTitle("Test Agent"));
  await screen.findAllByRole("menuitem"); // menu items are in the DOM now
  return document.body.textContent || "";
}

// Unmount through React (never wipe the DOM by hand: the menu lives in a portal
// React still owns). An open Radix menu also leaves `pointer-events: none` on
// <body>, which would block the next case's click.
beforeEach(() => { document.body.removeAttribute("style"); });
afterEach(() => { unmount?.(); document.body.removeAttribute("style"); vi.unstubAllEnvs(); });

describe("user menu", () => {
  it("switch OFF: no Referral Program entry (and nothing wallet-related)", async () => {
    const text = await openUserMenu(false);
    expect(text).toMatch(/Profile/i);                        // the menu really opened
    expect(text).not.toMatch(/referral|wallet|commission/i);
  });
  it("switch ON: the Referral Program entry is back", async () => {
    expect(await openUserMenu(true)).toMatch(/Referral Program/);
  });
});

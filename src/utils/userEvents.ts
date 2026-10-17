// Fired (on window) whenever the cached `currentUser` changes — from this tab
// (utils/auth.ts setCurrentUser) — so context providers can re-read it. Kept in
// its own file, not utils/auth.ts, so a test that mocks "@/utils/auth" with only
// the three functions it needs doesn't break modules that just want the name.
export const USER_UPDATED_EVENT = "pn:user-updated";

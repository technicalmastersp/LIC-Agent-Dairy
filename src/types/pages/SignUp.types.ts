import type { User } from "@/types/utils/auth.types";

// Signup sends a password to the backend; the client-side `User` type
// (auth.ts) intentionally has no password field for the session object,
// so the registration payload needs its own type.
export type SignUpRequest = User & { password: string; termsAccepted: boolean };
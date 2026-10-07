export type CallRequestStatus = "pending" | "no_answer" | "completed" | "cancelled";

export interface AdminCallRequest {
  requestId: string;
  name: string;
  phone: string;
  category: string;
  reason: string;
  status: CallRequestStatus;
  isOpen: boolean;
  isGuest: boolean;
  priority: "high" | "normal";
  submittedDuringHours: boolean;
  expectedCallFrom: string;
  callAttempts: number;
  adminNote?: string | null;
  handledAt?: string | null;
  createdAt: string;
}

export type CallRequestFilter = "open" | "completed" | "cancelled" | "all";

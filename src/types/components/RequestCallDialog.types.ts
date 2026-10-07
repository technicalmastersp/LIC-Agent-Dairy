export interface RequestCallDialogProps {
  /** Element that opens the dialog (rendered with asChild). Omit to control via `open`. */
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called after the server accepts a request (e.g. to refresh "My requests"). */
  onSubmitted?: () => void;
}

export interface CallRequestResult {
  requestId: string;
  openNow: boolean;
  expectedCallFrom: string;
  message: string;
}

export interface CallRequestSummary {
  requestId: string;
  phone: string;
  category: string;
  reason: string;
  status: "pending" | "no_answer" | "completed" | "cancelled";
  expectedCallFrom?: string;
  createdAt?: string;
}

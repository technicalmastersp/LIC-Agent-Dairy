import type { PaymentEntry } from "@/types/components/PaymentHistory.types";

export interface PaymentUpdateRecord {
  recordId?: string;
  name?: string;
  currentPolicy?: {
    policyNumber?: string;
    planAndTerm?: string;
    sumAssured?: string | number;
    modeOfPayment?: string;
    branch?: string;
    lastPaymentDate?: string;
    nextDueDate?: string;
  };
}
export interface PaymentUpdateModalProps {
  record: PaymentUpdateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  /** When set, the modal edits this payment instead of recording a new one. */
  editingPayment?: PaymentEntry | null;
}

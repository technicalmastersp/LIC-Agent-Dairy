
export interface PaymentUpdateRecord {
  recordId?: string;
  name?: string;
  currentPolicy?: {
    policyNumber?: string;
    planAndTerm?: string;
    sumAssured?: string;
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
}

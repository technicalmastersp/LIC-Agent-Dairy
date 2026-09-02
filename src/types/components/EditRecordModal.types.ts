import type { Record as RecordData } from "@/types/Record";

export interface EditRecordModalProps {
  record: RecordData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

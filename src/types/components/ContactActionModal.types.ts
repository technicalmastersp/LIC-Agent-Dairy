
export interface ContactActionModalProps {
  phone?: string;
  name?: string;
  email?: string;
  isOpen: boolean;
  onClose: () => void;
}

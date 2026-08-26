import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";

interface ContactActionModalProps {
  phone?: string;
  name?: string;
  isOpen: boolean;
  onClose: () => void;
}

// The stored number (aadhaarLinkedMobileNumber) has no enforced format
// beyond a max length — see policyRecordSchema.ts — so it's typically a
// bare 10-digit Indian mobile number with no country code. wa.me needs a
// full international number with no leading "+", so this normalizes:
// strip everything but digits, then prepend "91" only if it looks like a
// bare 10-digit local number (already-prefixed numbers are left as-is).
const toWhatsAppNumber = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const ContactActionModal = ({ phone, name, isOpen, onClose }: ContactActionModalProps) => {
  const hasPhone = !!phone && phone.replace(/\D/g, "").length >= 10;

  const handleCall = () => {
    if (!hasPhone) return;
    // tel: links open the device's native dialer app directly.
    window.location.href = `tel:${phone}`;
    onClose();
  };

  const handleWhatsApp = () => {
    if (!hasPhone || !phone) return;
    // wa.me routes to whichever of WhatsApp / WhatsApp Business is
    // installed on the device (or offers install/web fallback if
    // neither is) — there's no reliable way for a webpage to detect
    // which variant is installed, so this is the standard approach.
    const url = `https://wa.me/${toWhatsAppNumber(phone)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-form-header">
            Contact{name ? ` — ${name}` : ""}
          </DialogTitle>
          <DialogDescription>
            {hasPhone ? phone : "No mobile number on file for this record."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
            onClick={handleCall}
            disabled={!hasPhone}
          >
            <Phone className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Call</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50"
            onClick={handleWhatsApp}
            disabled={!hasPhone}
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">WhatsApp</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactActionModal;
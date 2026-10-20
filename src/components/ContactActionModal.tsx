import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, MessageSquare, Mail } from "lucide-react";
import type { ContactActionModalProps } from "@/types/components/ContactActionModal.types";
import { SensitiveValue } from "@/components/SensitiveValue";
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

// sms: wants a dialable number; "+91…" works on both Android and iOS. Same
// normalising as WhatsApp (bare 10-digit → prefix 91), then a leading "+".
const toSmsNumber = (raw: string) => `+${toWhatsAppNumber(raw)}`;

// Deliberately simple shape check — enough to stop a stray value being handed to
// the mail app; the mail app itself rejects anything it can't use.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactActionModal = ({ phone, email, name, isOpen, onClose }: ContactActionModalProps) => {
  const hasPhone = !!phone && phone.replace(/\D/g, "").length >= 10;
  const cleanEmail = (email ?? "").trim();
  const hasEmail = EMAIL_RE.test(cleanEmail);

  const handleCall = () => {
    if (!hasPhone) return;
    // tel: links open the device's native dialer app directly.
    window.location.href = `tel:${phone}`;
    onClose();
  };

  const handleSms = () => {
    if (!hasPhone || !phone) return;
    // sms: opens the device's default messaging app with the number filled in.
    window.location.href = `sms:${toSmsNumber(phone)}`;
    onClose();
  };

  const handleEmail = () => {
    if (!hasEmail) return;
    // mailto: opens the device's default mail app with the address filled in.
    window.location.href = `mailto:${cleanEmail}`;
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
            {hasPhone ? <SensitiveValue field="mobileNumber" value={phone} /> : "No mobile number on file for this record."}
            {hasEmail && (<> · <SensitiveValue field="email" value={cleanEmail} /></>)}
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
            onClick={handleSms}
            disabled={!hasPhone}
          >
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">SMS</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50"
            onClick={handleEmail}
            disabled={!hasEmail}
          >
            <Mail className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">E-Mail</span>
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

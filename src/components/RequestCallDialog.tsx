import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { Phone, Clock, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { createCallRequest } from "../../services/callRequestService";
import {
  BUSINESS_HOURS_LABELS, isTeamAvailableNow,
} from "@/config/businessHours";
import type { RequestCallDialogProps, CallRequestResult } from "@/types/components/RequestCallDialog.types";

// Same topics as the support ticket form, so both reach the team the same way.
const TOPICS = ["Account & Billing", "Policies & Records", "Payments & Referrals", "Security & Data", "Technical", "Other"];
const REASON_MIN = 10;
const REASON_MAX = 500;

// Mirrors normalizeIndianMobile() on the server (utils/callRequestValidation.js).
// The server is the authority; this only gives instant feedback.
const normalizeMobile = (raw: string): string | null => {
  let d = raw.replace(/[\s\-().]/g, "");
  if (d.startsWith("+91")) d = d.slice(3);
  else if (d.startsWith("0091")) d = d.slice(4);
  else if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
};

const RequestCallDialog = ({ trigger, open: openProp, onOpenChange, onSubmitted }: RequestCallDialogProps) => {
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => { onOpenChange?.(v); if (openProp === undefined) setInternalOpen(v); };

  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    phone: currentUser?.mobileNumber ?? "",
    category: "Account & Billing",
    reason: "",
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string; reason?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CallRequestResult | null>(null);

  // Every time the dialog is reopened, start from a clean form (keeping the
  // logged-in user's name/number prefilled) rather than a stale success screen.
  useEffect(() => {
    if (!open) return;
    setStep("form");
    setErrors({});
    setServerError(null);
    setResult(null);
    setForm((p) => ({
      name: currentUser?.name ?? p.name,
      phone: p.phone || currentUser?.mobileNumber || "",
      category: "Account & Billing",
      reason: "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const next: typeof errors = {};
    if (!authenticated && form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!normalizeMobile(form.phone)) next.phone = "Enter a valid 10-digit Indian mobile number.";
    const reason = form.reason.trim();
    if (reason.length < REASON_MIN) next.reason = `Please give a reason (at least ${REASON_MIN} characters).`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep("confirm");
  };

  const send = async () => {
    if (submitting) return; // double-click guard
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await createCallRequest({
        // Always sent: if a logged-in user's session has quietly expired the server
        // treats them as a guest, and still needs a name. (Ignored for valid sessions.)
        name: form.name.trim(),
        phone: normalizeMobile(form.phone),
        category: form.category,
        reason: form.reason.trim(),
      });
      setResult({ ...res.data, message: res.message });
      setStep("done");
      onSubmitted?.();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Something went wrong. Please try again, or email us."
        : "Something went wrong. Please try again, or email us.";
      // Shown inline only — apiClient's global interceptor already raises a toast
      // for 409/429/5xx, so a second one here would just duplicate it.
      setServerError(message);
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  const openNow = isTeamAvailableNow();
  const normalized = normalizeMobile(form.phone);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-form-header">
            <Phone className="w-4 h-4 text-primary" /> Request a call
          </DialogTitle>
          <DialogDescription>
            Leave your number and the reason — our team will call you back. We don't share a direct number.
          </DialogDescription>
        </DialogHeader>

        {/* Business-hours notice — shown on every step so expectations are set up front */}
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs">
          <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-medium text-form-header">
              {openNow ? "We're taking calls now" : "We're outside call hours right now"}
              <span className="font-normal text-muted-foreground"> — calls are placed only in business hours (IST)</span>
            </p>
            {BUSINESS_HOURS_LABELS.map((l) => (
              <p key={l.days} className="text-muted-foreground">{l.days}: {l.hours}</p>
            ))}
          </div>
        </div>

        {step === "form" && (
          <form onSubmit={goConfirm} className="space-y-4" noValidate>
            {serverError && (
              <p role="alert" className="text-xs rounded-md border border-destructive/30 bg-destructive/5 text-destructive px-3 py-2">
                {serverError}
              </p>
            )}

            {authenticated ? (
              <p className="text-xs text-muted-foreground">
                Requesting as <span className="font-medium text-form-header">{currentUser?.name}</span>
              </p>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="rc-name" className="text-xs text-muted-foreground">Your name</Label>
                <Input id="rc-name" value={form.name} onChange={set("name")} maxLength={80} placeholder="Your name" autoComplete="name" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="rc-phone" className="text-xs text-muted-foreground">Mobile number to call</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">+91</span>
                <Input
                  id="rc-phone" type="tel" inputMode="numeric" autoComplete="tel-national"
                  value={form.phone} onChange={set("phone")} maxLength={15}
                  placeholder="98765 43210" className="rounded-l-none"
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rc-topic" className="text-xs text-muted-foreground">What's it about?</Label>
              <select
                id="rc-topic" value={form.category} onChange={set("category")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rc-reason" className="text-xs text-muted-foreground">Reason for the call</Label>
              <Textarea
                id="rc-reason" rows={4} value={form.reason} onChange={set("reason")} maxLength={REASON_MAX}
                placeholder="Briefly tell us what you need help with…" className="resize-none"
              />
              <div className="flex justify-between text-xs">
                <span className="text-destructive">{errors.reason}</span>
                <span className="text-muted-foreground">{form.reason.trim().length}/{REASON_MAX}</span>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary-light">
              Continue
            </Button>
          </form>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm space-y-1.5">
              <p className="text-xs text-muted-foreground">We will call</p>
              <p className="text-lg font-semibold text-form-header tracking-wide">+91 {normalized}</p>
              <p className="text-xs text-muted-foreground">
                Double-check the number — it's the only way we can reach you. A wrong number means a missed call.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" className="sm:flex-1" onClick={() => setStep("form")} disabled={submitting}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Edit
              </Button>
              <Button type="button" className="sm:flex-1 bg-primary hover:bg-primary-light" onClick={send} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Sending…</> : "Yes, request the call"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && result && (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-form-header">Request received</p>
              <p className="text-sm text-muted-foreground">{result.message}</p>
              <p className="text-xs text-muted-foreground">Reference: <span className="font-mono">{result.requestId}</span></p>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestCallDialog;

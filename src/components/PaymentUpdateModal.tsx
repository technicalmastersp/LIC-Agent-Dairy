import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck2, Save, Loader2, AlertTriangle } from "lucide-react";
import { getRecordPayments, addRecordPayment, updateRecordPayment } from "../../services/recordService";
import { convertDateToIndianFormat } from "@/utils/tools";
import type { PaymentUpdateModalProps } from "@/types/components/PaymentUpdateModal.types";
import type { PaymentsPayload, ScheduleItem } from "@/types/components/PaymentHistory.types";
import { SensitiveValue } from "@/components/SensitiveValue";
import { useSensitiveInputClass } from "@/hooks/useSensitiveMask";
import {
  formatMonthKey, todayInputIST, fallbackMonthOptions, formatRupees, STATUS_CHIP, STATUS_LABEL,
} from "@/utils/paymentMonths";
import { useLanguage } from "@/hooks/useLanguage";

const NOTES_MAX = 500;
const num = (s: string) => Number(String(s).replace(/[,₹\s]/g, ""));

// Record a premium payment against a record's current policy — or, when
// `editingPayment` is given, correct one. A single payment can settle several
// due months (e.g. a missed month paid together with the next one, plus a late
// fee). Stored in the payment ledger (backend: policyPaymentsController); the
// server also moves currentPolicy.lastPaymentDate, so due/missed lists follow.
const PaymentUpdateModal = ({ record, isOpen, onClose, onUpdate, editingPayment = null }: PaymentUpdateModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const amountMask = useSensitiveInputClass("paymentAmount");

  const [data, setData] = useState<PaymentsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [paidOn, setPaidOn] = useState("");
  const [months, setMonths] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);
  const [hasExtra, setHasExtra] = useState(false);
  const [extraAmount, setExtraAmount] = useState("");
  const [notes, setNotes] = useState("");

  const isEdit = !!editingPayment;
  const recordId = record?.recordId;

  // Load the schedule every time the modal opens for a record.
  useEffect(() => {
    if (!isOpen || !recordId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getRecordPayments(recordId)
      .then((d: PaymentsPayload) => { if (!cancelled) setData(d); })
      .catch((e) => {
        if (cancelled) return;
        setData(null);
        setLoadError(axios.isAxiosError(e) ? e.response?.data?.message || t('records.couldnTLoadPaymentDetails') : t('records.couldnTLoadPaymentDetails'));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, recordId]);

  // Months the agent can pick: everything not yet paid (+ this payment's own
  // months when editing). With no payment information at all, a sensible window.
  const options: ScheduleItem[] = useMemo(() => {
    if (!data) return [];
    const own = new Set(editingPayment?.coversMonths ?? []);
    const fromSchedule = data.schedule.filter((s) => s.status !== "paid" || own.has(s.month));
    if (data.schedule.length > 0) return fromSchedule;
    return fallbackMonthOptions().map((month) => ({ month, status: "upcoming" as const, paymentId: null }));
  }, [data, editingPayment]);

  // (Re)initialise the form when data arrives or a different payment is edited.
  useEffect(() => {
    if (!isOpen || !data) return;
    setAmountTouched(false);
    if (editingPayment) {
      setPaidOn(editingPayment.paidOn);
      setMonths([...editingPayment.coversMonths]);
      setAmount(editingPayment.amount != null ? String(editingPayment.amount) : "");
      setHasExtra(editingPayment.hasAdditionalCharge);
      setExtraAmount(editingPayment.hasAdditionalCharge ? String(editingPayment.additionalChargeAmount) : "");
      setNotes(editingPayment.source === "legacy" ? "" : editingPayment.notes);
      return;
    }
    setPaidOn(todayInputIST());
    // Pre-select what is owed (missed + this month); if nothing is, the next one.
    const owed = data.summary.unpaidMonths;
    const preset = owed.length ? owed : data.summary.nextUpcomingMonth ? [data.summary.nextUpcomingMonth] : [];
    setMonths(preset);
    setHasExtra(false);
    setExtraAmount("");
    setNotes("");
    setAmount("");
  }, [isOpen, data, editingPayment]);

  // Suggest premium × months until the agent types an amount of their own.
  useEffect(() => {
    if (isEdit || amountTouched || !data?.summary.suggestedPerMonthAmount || months.length === 0) return;
    setAmount(String(Math.round(data.summary.suggestedPerMonthAmount * months.length * 100) / 100));
  }, [months, data, amountTouched, isEdit]);

  if (!record) return null;
  const policy = record.currentPolicy;

  const toggleMonth = (m: string, on: boolean) =>
    setMonths((prev) => (on ? [...new Set([...prev, m])].sort() : prev.filter((x) => x !== m)));

  const total = (num(amount) || 0) + (hasExtra ? num(extraAmount) || 0 : 0);

  const validate = (): string | null => {
    if (!paidOn) return t('records.chooseTheDateThePayment');
    if (paidOn > todayInputIST()) return t('records.paymentDateCanT');
    if (months.length === 0) return t('records.chooseAtLeastOneDue');
    if (!(num(amount) > 0)) return t('records.enterTheAmountPaidGreater');
    if (hasExtra && !(num(extraAmount) > 0)) return t('records.enterTheAdditionalCharge');
    if (notes.length > NOTES_MAX) return `Notes can be at most ${NOTES_MAX} characters.`;
    return null;
  };

  const handleSave = async () => {
    if (!record.recordId) return;
    const problem = validate();
    if (problem) {
      toast({ title: t('records.checkTheDetails'), description: problem, variant: "destructive" });
      return;
    }
    const body = {
      paidOn,
      coversMonths: months,
      amount: num(amount),
      hasAdditionalCharge: hasExtra,
      additionalChargeAmount: hasExtra ? num(extraAmount) : 0,
      notes: notes.trim(),
    };
    setSaving(true);
    try {
      if (editingPayment) await updateRecordPayment(record.recordId, editingPayment.id, body);
      else await addRecordPayment(record.recordId, body);
      toast({
        title: editingPayment ? t('records.paymentUpdated') : t('records.paymentRecorded'),
        description: `${months.length > 1 ? `${months.length} months` : formatMonthKey(months[0])} saved.`,
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast({
        title: t('records.couldnTSavePayment'),
        description: message || t('records.pleaseTryAgain'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-form-header">
            <CalendarCheck2 className="w-5 h-5" />
            <span>{isEdit ? t('records.editPayment2') : t('records.recordPayment2')}{record.name ? ` — ${record.name}` : ""}</span>
          </DialogTitle>
          <DialogDescription>
            {t('records.onePaymentCanSettleMore')}
          </DialogDescription>
        </DialogHeader>

        {/* Read-only policy context */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-table-border bg-muted/20 p-3 text-sm">
          <div><p className="text-xs text-muted-foreground">{t('records.policyNumber')}</p>
            <Badge variant="outline" className="font-mono mt-0.5"><SensitiveValue field="policyNumber" value={policy?.policyNumber} placeholder="N/A" /></Badge></div>
          <div><p className="text-xs text-muted-foreground">{t('records.modeOfPayment2')}</p><p className="font-medium">{policy?.modeOfPayment || "-"}</p></div>
          <div><p className="text-xs text-muted-foreground">{t('records.planTerm2')}</p><p>{policy?.planAndTerm || "-"}</p></div>
          <div><p className="text-xs text-muted-foreground">{t('records.lastPaymentDate2')}</p>
            <p>{policy?.lastPaymentDate ? convertDateToIndianFormat(policy.lastPaymentDate) : "-"}</p></div>
        </div>

        {loading && (
          <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> {" "}{t('records.loadingPaymentDetails')}
          </div>
        )}

        {!loading && loadError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{loadError}</span>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-4">
            {/* Which months this payment settles */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-form-header">{t('records.dueMonthsCovered')}</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {options.map((o) => {
                  const checked = months.includes(o.month);
                  const id = `pay-month-${o.month}`;
                  return (
                    <label key={o.month} htmlFor={id}
                      className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "border-table-border hover:bg-muted/40"}`}>
                      <Checkbox id={id} checked={checked} disabled={saving}
                        onCheckedChange={(v) => toggleMonth(o.month, v === true)} />
                      <span className="flex flex-col leading-tight">
                        <span className="font-medium">{formatMonthKey(o.month)}</span>
                        <span className={`mt-0.5 inline-block rounded border px-1 text-[10px] ${STATUS_CHIP[o.status]}`}>
                          {data.schedule.length ? STATUS_LABEL[o.status] : t('records.choose')}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {options.length === 0 && <p className="text-sm text-muted-foreground">{t('records.everyDueMonthIsAlready')}</p>}
            </fieldset>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="paidOn">{t('records.paymentDate')}</Label>
                <Input id="paidOn" type="date" value={paidOn} max={todayInputIST()}
                  onChange={(e) => setPaidOn(e.target.value)} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payAmount">{t('records.amountPaid')}</Label>
                <Input id="payAmount" type="text" inputMode="decimal" autoComplete="off" placeholder="e.g. 2400"
                  value={amount} disabled={saving} className={amountMask}
                  onChange={(e) => { setAmountTouched(true); setAmount(e.target.value.replace(/[^\d.,]/g, "")); }} />
                {months.length > 1 && <p className="text-xs text-muted-foreground">{t('records.totalForMonthsExcludingAny', { length: months.length })}</p>}
              </div>
            </div>

            <div className="rounded-lg border border-table-border p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="hasExtra" className="font-medium">{t('records.additionalCharge')}</Label>
                  <p className="text-xs text-muted-foreground">{t('records.lateFeeInterestOrAny')}</p>
                </div>
                <Switch id="hasExtra" checked={hasExtra} onCheckedChange={setHasExtra} disabled={saving} />
              </div>
              {hasExtra && (
                <div className="space-y-1.5">
                  <Label htmlFor="extraAmount">{t('records.additionalChargeAmount')}</Label>
                  <Input id="extraAmount" type="text" inputMode="decimal" autoComplete="off" placeholder="e.g. 60"
                    value={extraAmount} disabled={saving} className={amountMask}
                    onChange={(e) => setExtraAmount(e.target.value.replace(/[^\d.,]/g, ""))} />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="payNotes">{t('records.notesOptional')}</Label>
                <span className="text-xs text-muted-foreground">{notes.length}/{NOTES_MAX}</span>
              </div>
              <Textarea id="payNotes" rows={2} maxLength={NOTES_MAX} value={notes} disabled={saving}
                placeholder={t('records.eGCouldnTPay')}
                onChange={(e) => setNotes(e.target.value)} className="resize-none" />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{t('records.totalPaid')}</span>
              <span className="font-semibold text-form-header">
                <SensitiveValue field="paymentAmount" value={total} render={(v) => formatRupees(Number(v))} placeholder="₹0" />
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={saving}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={saving || loading || !data}>
            {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {" "}{t('records.saving2')}</>)
              : (<><Save className="w-4 h-4 mr-2" /> {isEdit ? t('records.saveChanges2') : t('records.savePayment')}</>)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentUpdateModal;

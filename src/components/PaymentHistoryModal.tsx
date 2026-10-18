import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Plus, Pencil, Trash2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { getRecordPayments, deleteRecordPayment } from "../../services/recordService";
import PaymentUpdateModal from "@/components/PaymentUpdateModal";
import { SensitiveValue } from "@/components/SensitiveValue";
import { formatISTDate } from "@/utils/dateFormat";
import { formatMonthKey, formatRupees, STATUS_CHIP, STATUS_LABEL } from "@/utils/paymentMonths";
import type { PaymentEntry, PaymentsPayload } from "@/types/components/PaymentHistory.types";
import type { PaymentUpdateRecord } from "@/types/components/PaymentUpdateModal.types";

const CHIPS_COLLAPSED = 12;

interface Props {
  record: PaymentUpdateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called after a payment is recorded, corrected or deleted, so lists can refresh. */
  onChanged?: () => void;
}

const Money = ({ value }: { value: number | null | undefined }) => (
  <SensitiveValue field="paymentAmount" value={value ?? ""} render={(v) => formatRupees(Number(v))} placeholder="—" />
);

// Full payment history for a record's CURRENT policy: totals, a month-by-month
// paid / missed / due strip, and every payment with its date, covered months,
// amount, additional charge and notes. From here the agent can record, correct
// or delete a payment.
const PaymentHistoryModal = ({ record, isOpen, onClose, onChanged }: Props) => {
  const { toast } = useToast();
  const [data, setData] = useState<PaymentsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentEntry | null>(null);
  const [toDelete, setToDelete] = useState<PaymentEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const recordId = record?.recordId;

  const load = useCallback(async () => {
    if (!recordId) return;
    setLoading(true);
    setError("");
    try {
      setData(await getRecordPayments(recordId));
    } catch (e) {
      setData(null);
      setError(axios.isAxiosError(e) ? e.response?.data?.message || "Couldn't load payment history." : "Couldn't load payment history.");
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    if (isOpen) { setShowAllMonths(false); load(); }
  }, [isOpen, load]);

  if (!record) return null;

  const afterChange = async () => { await load(); onChanged?.(); };

  const confirmDelete = async () => {
    if (!toDelete || !record.recordId) return;
    setDeleting(true);
    try {
      await deleteRecordPayment(record.recordId, toDelete.id);
      toast({ title: "Payment deleted", description: "Its months are shown as unpaid again." });
      setToDelete(null);
      await afterChange();
    } catch (e) {
      toast({
        title: "Couldn't delete payment",
        description: (axios.isAxiosError(e) && e.response?.data?.message) || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const schedule = data?.schedule ?? [];
  const chips = showAllMonths ? schedule : schedule.slice(-CHIPS_COLLAPSED);
  const s = data?.summary;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-form-header">
              <Receipt className="w-5 h-5" />
              <span>Payment History{record.name ? ` — ${record.name}` : ""}</span>
            </DialogTitle>
            <DialogDescription>
              Every premium payment for the current policy{data?.record.modeOfPayment ? ` (${data.record.modeOfPayment})` : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }} disabled={!data}>
              <Plus className="w-4 h-4 mr-1.5" /> Record payment
            </Button>
          </div>

          {loading && (
            <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading payment history…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <span className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}</span>
              <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Retry</Button>
            </div>
          )}

          {!loading && data && s && (
            <div className="space-y-5">
              {/* Totals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Total paid", val: <Money value={s.totalPaid} /> },
                  { label: "Additional charges", val: <Money value={s.totalAdditionalCharges} /> },
                  { label: "Payments recorded", val: s.paymentsCount },
                  { label: "Missed months", val: s.missedCount, warn: s.missedCount > 0 },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg border border-table-border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className={`text-lg font-medium mt-0.5 ${c.warn ? "text-red-600" : "text-form-header"}`}>{c.val}</p>
                  </div>
                ))}
              </div>

              {/* Month strip */}
              {schedule.length > 0 && (
                <section aria-label="Due months">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-form-header">Due months</h3>
                    {schedule.length > CHIPS_COLLAPSED && (
                      <button type="button" className="text-xs text-primary hover:underline" onClick={() => setShowAllMonths((v) => !v)}>
                        {showAllMonths ? "Show recent only" : `Show all ${schedule.length}`}
                      </button>
                    )}
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {chips.map((m) => (
                      <li key={m.month} aria-label={`${formatMonthKey(m.month)}: ${STATUS_LABEL[m.status]}`}
                        className={`rounded-md border px-2 py-1 text-xs ${STATUS_CHIP[m.status]}`}>
                        {formatMonthKey(m.month)} · {STATUS_LABEL[m.status]}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    The current month counts as "due" until it ends. Months before the earliest recorded payment aren't judged.
                  </p>
                </section>
              )}

              {/* Payments */}
              <section aria-label="Payments">
                <h3 className="text-sm font-medium text-form-header mb-2">Payments</h3>
                {data.payments.length === 0 && !data.legacyLastPaymentDate ? (
                  <div className="rounded-lg border border-dashed border-table-border py-8 text-center text-sm text-muted-foreground">
                    No payments recorded yet. Use “Record payment” to add the first one.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-table-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Paid on</TableHead>
                          <TableHead>Covers</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Additional</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="w-[1%]"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="whitespace-nowrap">
                              {formatISTDate(p.paidOn)}
                              {p.source === "legacy" && p.amount == null && <Badge variant="outline" className="ml-1.5 text-[10px]">Earlier date</Badge>}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {p.coversMonths.map((m) => <Badge key={m} variant="secondary" className="text-[10px] font-normal">{formatMonthKey(m)}</Badge>)}
                              </div>
                              {p.coversMonths.length > 1 && <p className="text-[10px] text-muted-foreground mt-0.5">Paid together</p>}
                            </TableCell>
                            <TableCell className="text-right"><Money value={p.amount} /></TableCell>
                            <TableCell className="text-right">
                              {p.hasAdditionalCharge ? <Money value={p.additionalChargeAmount} /> : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="text-right font-medium">{p.amount == null ? "—" : <Money value={p.totalPaid} />}</TableCell>
                            <TableCell className="max-w-[220px] whitespace-pre-wrap break-words text-xs text-muted-foreground">{p.notes || "—"}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 justify-end">
                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit payment of ${formatISTDate(p.paidOn)}`}
                                  onClick={() => { setEditing(p); setFormOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Delete payment of ${formatISTDate(p.paidOn)}`}
                                  onClick={() => setToDelete(p)}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {data.legacyLastPaymentDate && (
                          <TableRow className="bg-muted/20">
                            <TableCell className="whitespace-nowrap">{formatISTDate(data.legacyLastPaymentDate)}</TableCell>
                            <TableCell colSpan={6} className="text-xs text-muted-foreground">
                              Last payment date on this record — no amount or notes were saved for it.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PaymentUpdateModal
        record={record}
        isOpen={formOpen}
        editingPayment={editing}
        onClose={() => setFormOpen(false)}
        onUpdate={afterChange}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && !deleting && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete ? `${toDelete.coversMonths.map(formatMonthKey).join(", ")} will show as unpaid again. ` : ""}
              The record's last payment date will be recalculated. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PaymentHistoryModal;

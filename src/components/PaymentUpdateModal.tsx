import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, CalendarCheck2, Save, Loader2 } from "lucide-react";
import { updateRecord } from "../../services/recordService";
import { convertDateToIndianFormat } from "@/utils/tools";
import type { PaymentUpdateModalProps } from "@/types/components/PaymentUpdateModal.types";

// Loosely-typed on purpose: CurrentMonthDue.tsx, MissedPayments.tsx, and
// UpcomingDuePolicies.tsx each keep their own local `Record` interface
// (identical shape, not shared), so this accepts anything structurally
// compatible rather than importing one page's type into the others.
const PaymentUpdateModal = ({ record, isOpen, onClose, onUpdate }: PaymentUpdateModalProps) => {
  const { toast } = useToast();
  const [lastPaymentDate, setLastPaymentDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset the editable field to the record's current value every time a
  // different record is opened — otherwise a previously-typed date could
  // leak into the next record opened in the same modal instance.
  useEffect(() => {
    if (record?.currentPolicy?.lastPaymentDate) {
      setLastPaymentDate(convertDateToIndianFormat(record.currentPolicy.lastPaymentDate, "input"));
    } else {
      setLastPaymentDate("");
    }
  }, [record, isOpen]);

  if (!record) return null;

  const policy = record.currentPolicy;

  const handleSave = async () => {
    if (!record.recordId) return;
    if (!lastPaymentDate) {
      toast({
        title: "Enter a date",
        description: "Last Payment Date can't be empty.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Partial update — updatePolicyRecord.js flattens nested objects
      // one level deep and only $sets the keys present here, so this
      // touches currentPolicy.lastPaymentDate only. Every other field
      // (policyNumber, sumAssured, nextDueDate, previousPolicy, etc.)
      // is left completely untouched.
      await updateRecord({ currentPolicy: { lastPaymentDate } }, record.recordId);
      toast({
        title: "Payment updated",
        description: "Last Payment Date has been saved.",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update the payment date. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-form-header">
            <CalendarCheck2 className="w-5 h-5" />
            <span>Update Payment{record.name ? ` — ${record.name}` : ""}</span>
          </DialogTitle>
          <DialogDescription>
            Only the Last Payment Date can be changed here. All other policy details are read-only.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-form-header flex items-center gap-2.5 text-base">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              </div>
              <span>Current Policy Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-table-border">
              <Table>
                <TableBody>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="border border-table-border w-1/2">Policy Number</TableHead>
                    <TableCell className="border border-table-border">
                      <Badge variant="outline" className="font-mono">
                        {policy?.policyNumber || "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="border border-table-border">Plan & Term</TableHead>
                    <TableCell className="border border-table-border">{policy?.planAndTerm || "-"}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="border border-table-border">Sum Assured</TableHead>
                    <TableCell className="border border-table-border font-medium text-emerald-700">
                      ₹{policy?.sumAssured || "0"}
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="border border-table-border">Mode of Payment</TableHead>
                    <TableCell className="border border-table-border">{policy?.modeOfPayment || "-"}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="border border-table-border">Branch</TableHead>
                    <TableCell className="border border-table-border">{policy?.branch || "-"}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="border border-table-border">Next Due Date</TableHead>
                    <TableCell className="border border-table-border">
                      {policy?.nextDueDate ? convertDateToIndianFormat(policy.nextDueDate) : "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* The one editable field — visually highlighted so it's
                unmistakable against the read-only table above it. */}
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-3.5 space-y-2 ring-4 ring-primary/10">
              <div className="flex items-center justify-between">
                <Label htmlFor="lastPaymentDate" className="text-form-header font-medium">
                  Last Payment Date
                </Label>
                <Badge className="bg-primary text-primary-foreground text-[10px]">Editable</Badge>
              </div>
              <Input
                id="lastPaymentDate"
                type="date"
                value={lastPaymentDate}
                onChange={(e) => setLastPaymentDate(e.target.value)}
                className="bg-background"
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Payment Date
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentUpdateModal;
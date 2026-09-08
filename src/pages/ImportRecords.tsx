import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileUp, Download, CheckCircle2, AlertTriangle, ArrowLeft,
  Loader2, FileSpreadsheet, Home, PartyPopper,
} from "lucide-react";
import {
  parseExcelFile, downloadImportTemplate, IMPORT_COLUMNS, MAX_IMPORT_ROWS,
  type ImportRow,
} from "@/utils/excelImport";
import { validateImportRow, type ImportRowValidation } from "@/schemas/importRecordSchema";
import { createRecordsBulk } from "../../services/recordService";
import axios from "axios";

type Step = "upload" | "preview" | "done";

const ImportRecords = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [pendingAction, setPendingAction] = useState<"back" | "startOver" | "cancel" | "import" | null>(null);

  // Re-validated on every edit — never trust that a row is still valid
  // just because it validated once, since the preview step lets every
  // field be edited after the initial parse.
  const validations = useMemo(() => {
    const map = new Map<number, ImportRowValidation>();
    for (const row of rows) map.set(row._rowNumber, validateImportRow(row));
    return map;
  }, [rows]);

  const includedRows = rows.filter((r) => !excludedRows.has(r._rowNumber));
  const validCount = includedRows.filter((r) => validations.get(r._rowNumber)?.valid).length;
  const errorCount = includedRows.length - validCount;

  const resetToUpload = () => {
    setStep("upload");
    setRows([]);
    setExcludedRows(new Set());
    setParseError(null);
    setImportedCount(0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const parsed = await parseExcelFile(file);
      setRows(parsed);
      setExcludedRows(new Set());
      setStep("preview");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to read this file.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateCell = (rowNumber: number, key: string, value: string) => {
    setRows((prev) => prev.map((r) => (r._rowNumber === rowNumber ? { ...r, [key]: value } : r)));
  };

  const toggleExcluded = (rowNumber: number) => {
    setExcludedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  };

  const handleImport = async () => {
    if (isSubmitting) return; // guard against double-click firing two bulk-create calls

    const toImport = includedRows.filter((r) => validations.get(r._rowNumber)?.valid);
    if (toImport.length === 0) {
      toast({ title: "Nothing to import", description: "Fix or exclude the rows with errors first.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = toImport.map((row) => ({
        date: new Date().toISOString(),
        insuranceType: (row.insuranceType || "Life Insurance").trim(),
        name: row.name.trim(),
        fatherName: row.fatherName,
        motherName: row.motherName,
        spouseName: row.spouseName,
        address: row.address,
        dateOfBirth: row.dateOfBirth,
        occupation: row.occupation,
        aadhaarLinkedMobileNumber: row.aadhaarLinkedMobileNumber,
        email: row.email,
        aadhaarNumber: row.aadhaarNumber,
        panNumber: row.panNumber,
        currentPolicy: {
          policyNumber: row.policyNumber,
          planAndTerm: row.planAndTerm,
          sumAssured: row.sumAssured,
          modeOfPayment: row.modeOfPayment,
          branch: row.branch,
          lastPaymentDate: row.lastPaymentDate,
        },
        previousPolicy: { policyNumber: "", planAndTerm: "", sumAssured: "", modeOfPayment: "", branch: "", lastPaymentDate: "" },
        familyMembers: [],
      }));

      const result = await createRecordsBulk(payload);
      setImportedCount(result?.count ?? toImport.length);
      setStep("done");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Import failed. Please check your connection and try again."
        : "Import failed. Please check your connection and try again.";

      toast({
        title: "Import failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CONFIRM_COPY: Record<NonNullable<typeof pendingAction>, { title: string; description: string; confirmLabel: string }> = {
    back: {
      title: "Leave this page?",
      description: "You'll lose the file you've reviewed so far — if it hasn't been saved yet.",
      confirmLabel: "Leave",
    },
    startOver: {
      title: "Start over?",
      description: "This discards everything you've reviewed and edited on this file. You'll need to re-upload it.",
      confirmLabel: "Start over",
    },
    cancel: {
      title: "Cancel this import?",
      description: "This discards everything you've reviewed and edited on this file. Nothing will be saved.",
      confirmLabel: "Discard",
    },
    import: {
      title: `Import ${validCount} record${validCount === 1 ? "" : "s"}?`,
      description: "This adds them to your policy records right away. Excluded and error rows will be skipped.",
      confirmLabel: "Import",
    },
  };

  const runConfirmedAction = () => {
    const action = pendingAction;
    setPendingAction(null);
    if (action === "back") navigate("/view-records");
    else if (action === "startOver" || action === "cancel") resetToUpload();
    else if (action === "import") handleImport();
  };

  // Nothing at stake yet on a fresh visit — skip the confirmation rather
  // than asking someone to confirm leaving a page they haven't touched.
  const confirmOrRun = (action: NonNullable<typeof pendingAction>) => {
    if ((action === "back" || action === "startOver" || action === "cancel") && rows.length === 0) {
      if (action === "back") navigate("/view-records");
      else resetToUpload();
      return;
    }
    setPendingAction(action);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => confirmOrRun("back")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Records
          </Button>
        </div>

        {step === "upload" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <FileUp className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl text-form-header">Import from Excel</CardTitle>
              <CardDescription>
                Upload a spreadsheet of policy records — you'll be able to review and fix any issues
                before anything is saved. Up to {MAX_IMPORT_ROWS} records per file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full gap-2" onClick={() => downloadImportTemplate()}>
                <Download className="w-4 h-4" />
                Download blank template
              </Button>

              <label
                htmlFor="excel-upload"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Reading your file…</p>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-form-header">Click to choose a .xlsx or .xls file</p>
                    <p className="text-xs text-muted-foreground">Max 5MB, {MAX_IMPORT_ROWS} rows</p>
                  </>
                )}
                <input
                  id="excel-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isParsing}
                />
              </label>

              {parseError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Only "Name" is required. Family member details and previous-policy history aren't
                covered by import yet — add those afterward from the record's Edit screen.
              </p>
            </CardContent>
          </Card>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="text-sm">{rows.length} rows read</Badge>
                    <Badge className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />{validCount} ready
                    </Badge>
                    {errorCount > 0 && (
                      <Badge variant="destructive" className="text-sm">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />{errorCount} need fixing
                      </Badge>
                    )}
                    {excludedRows.size > 0 && (
                      <Badge variant="outline" className="text-sm">{excludedRows.size} excluded</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => confirmOrRun("startOver")}>
                    Start over
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                {/* Wide review grid — horizontal scroll is expected here, same as
                    spreadsheet software itself; this is a dense edit/review table,
                    not a simple record list. */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-table-header">
                        <TableHead className="w-12 border border-table-border">Row</TableHead>
                        <TableHead className="w-12 border border-table-border">Include</TableHead>
                        <TableHead className="w-28 border border-table-border">Status</TableHead>
                        {IMPORT_COLUMNS.map((col) => (
                          <TableHead key={col.key} className="border border-table-border whitespace-nowrap">
                            {col.header}{col.required && <span className="text-destructive"> *</span>}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => {
                        const validation = validations.get(row._rowNumber);
                        const excluded = excludedRows.has(row._rowNumber);
                        return (
                          <TableRow key={row._rowNumber} className={excluded ? "opacity-50" : ""}>
                            <TableCell className="border border-table-border font-mono text-xs text-muted-foreground">
                              {row._rowNumber}
                            </TableCell>
                            <TableCell className="border border-table-border">
                              <Checkbox checked={!excluded} onCheckedChange={() => toggleExcluded(row._rowNumber)} />
                            </TableCell>
                            <TableCell className="border border-table-border align-top">
                              {validation?.valid ? (
                                <Badge className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 text-xs">
                                  Ready
                                </Badge>
                              ) : (
                                <div className="space-y-1">
                                  <Badge variant="destructive" className="text-xs">
                                    {validation?.errors.length} error{validation && validation.errors.length > 1 ? "s" : ""}
                                  </Badge>
                                  <ul className="text-xs text-destructive space-y-0.5 max-w-[220px]">
                                    {validation?.errors.map((msg, i) => (
                                      <li key={i}>{msg}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </TableCell>
                            {IMPORT_COLUMNS.map((col) => {
                              const fieldError = validation?.fieldErrors[col.key];
                              return (
                                <TableCell key={col.key} className="border border-table-border p-1">
                                  <Input
                                    value={row[col.key] ?? ""}
                                    onChange={(e) => updateCell(row._rowNumber, col.key, e.target.value)}
                                    title={fieldError}
                                    className={`h-8 min-w-[140px] bg-transparent focus-visible:bg-background ${
                                      fieldError
                                        ? "border-destructive focus-visible:border-destructive"
                                        : "border-transparent focus-visible:border-input"
                                    }`}
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => confirmOrRun("cancel")} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={() => confirmOrRun("import")} disabled={isSubmitting || validCount === 0} className="gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isSubmitting ? "Importing…" : `Import ${validCount} record${validCount === 1 ? "" : "s"}`}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-10 pb-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
                <PartyPopper className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-form-header">
                {importedCount} record{importedCount === 1 ? "" : "s"} imported
              </h2>
              <p className="text-sm text-muted-foreground">
                They're now in your records list. You can add family details or previous-policy
                history to any of them from the Edit screen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button variant="outline" onClick={resetToUpload} className="gap-2">
                  <FileUp className="w-4 h-4" />
                  Import more
                </Button>
                <Button onClick={() => navigate("/view-records")} className="gap-2">
                  <Home className="w-4 h-4" />
                  Go to Records
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          {pendingAction && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{CONFIRM_COPY[pendingAction].title}</AlertDialogTitle>
                <AlertDialogDescription>{CONFIRM_COPY[pendingAction].description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Go back</AlertDialogCancel>
                <AlertDialogAction onClick={runConfirmedAction}>
                  {CONFIRM_COPY[pendingAction].confirmLabel}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </main>
  );
};

export default ImportRecords;
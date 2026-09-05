// Client-side Excel import for policy records — ViewRecords.tsx's
// "Import from Excel" button leads here via ImportRecords.tsx.
//
// Parsing happens entirely in the browser (SheetJS/`xlsx`), not on the
// server. An .xlsx file is a zip archive of XML internals, and parsing
// untrusted files of that shape server-side is a real attack surface
// (entity-expansion / zip-bomb style issues). Doing it client-side means
// the browser's own sandbox absorbs that risk, and the server only ever
// receives plain, already-validated JSON — the exact same shape as a
// single manually-added record, going through the same schema.
//
// MUST STAY IN SYNC with MAX_BATCH_SIZE in
// backend/controllers/userController/createRecordController.js — both
// caps exist for the same reason (bound a single bulk-insert's size) and
// should always match.
export const MAX_IMPORT_ROWS = 100;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Column header (exact text expected in the spreadsheet's first row) →
// internal field key. Order here drives both the generated template and
// the preview table. Keep in sync with policyRecordSchema.ts field names.
export const IMPORT_COLUMNS: { key: string; header: string; required: boolean; example: string }[] = [
  { key: "name", header: "Name", required: true, example: "Ramesh Kumar" },
  { key: "insuranceType", header: "Insurance Type", required: false, example: "Life Insurance" },
  { key: "dateOfBirth", header: "Date of Birth", required: false, example: "1985-06-15" },
  { key: "fatherName", header: "Father's Name", required: false, example: "Suresh Kumar" },
  { key: "motherName", header: "Mother's Name", required: false, example: "Sunita Kumar" },
  { key: "spouseName", header: "Spouse's Name", required: false, example: "" },
  { key: "address", header: "Address", required: false, example: "123 MG Road, Pune" },
  { key: "aadhaarLinkedMobileNumber", header: "Mobile Number", required: false, example: "9876543210" },
  { key: "email", header: "Email", required: false, example: "ramesh@example.com" },
  { key: "aadhaarNumber", header: "Aadhaar Number", required: false, example: "123456789012" },
  { key: "panNumber", header: "PAN Number", required: false, example: "ABCDE1234F" },
  { key: "occupation", header: "Occupation", required: false, example: "Business" },
  { key: "policyNumber", header: "Policy Number", required: false, example: "LIC123456789" },
  { key: "planAndTerm", header: "Plan & Term", required: false, example: "Jeevan Anand / 20 years" },
  { key: "sumAssured", header: "Sum Assured", required: false, example: "500000" },
  { key: "modeOfPayment", header: "Mode of Payment", required: false, example: "Yearly" },
  { key: "branch", header: "Branch", required: false, example: "Pune Branch" },
  { key: "lastPaymentDate", header: "Last Payment Date", required: false, example: "2025-01-15" },
];

export const VALID_INSURANCE_TYPES = [
  "Life Insurance",
  "Term Life Insurance",
  "Health Insurance",
  "Family Health Insurance",
  "Vehicle Insurance",
  "Travel Insurance",
  "Other",
];

export type ImportRow = Record<string, string> & { _rowNumber: number };

/**
 * Neutralizes CSV/Excel formula injection. A cell value that starts with
 * =, +, -, @ (after trimming) is interpreted as a formula by Excel/Sheets
 * when the data is later opened there — this app already has a CSV/PDF
 * export elsewhere, so anything imported here could otherwise round-trip
 * into an executable-looking formula for whoever opens that export later.
 * Prefixing with a single quote is Excel's own standard "force text" escape.
 */
export function sanitizeCellValue(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  let value = String(raw).trim();
  if (/^[=+\-@\t\r]/.test(value)) {
    value = `'${value}`;
  }
  return value;
}

/**
 * Normalizes a date-like cell to YYYY-MM-DD (what this app's <input
 * type="date"> fields expect everywhere else). SheetJS can hand back a
 * real JS Date for date-formatted cells, an Excel serial number for
 * loosely-formatted ones, or a plain string — handle all three.
 */
export function normalizeDateCell(raw: unknown): string {
  if (raw === null || raw === undefined || raw === "") return "";

  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return raw.toISOString().slice(0, 10);
  }

  if (typeof raw === "number" && isFinite(raw)) {
    // Excel serial date: days since 1899-12-30.
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = raw * 24 * 60 * 60 * 1000;
    const d = new Date(epoch.getTime() + ms);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }

  const str = sanitizeCellValue(raw);
  const parsed = new Date(str);
  if (str && !isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return str; // leave as-is (unparseable) — row-level validation will flag it
}

const DATE_KEYS = new Set(["dateOfBirth", "lastPaymentDate"]);

/**
 * Reads an uploaded workbook and returns sanitized row objects keyed by
 * IMPORT_COLUMNS' internal field names. Only the first worksheet is read.
 * Throws (with a user-facing message) on anything that isn't a readable
 * spreadsheet — callers should wrap this in try/catch.
 */
export async function parseExcelFile(file: File): Promise<ImportRow[]> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File is too large. Please keep it under ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
  }

  const validExtensions = [".xlsx", ".xls"];
  const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!hasValidExtension) {
    throw new Error("Please upload a .xlsx or .xls file.");
  }

  // Dynamically imported so the (fairly large) SheetJS bundle only loads
  // when someone actually opens the import page, not on every page that
  // happens to import from this file.
  const XLSX = await import("xlsx");

  const buffer = await file.arrayBuffer();
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  } catch {
    throw new Error("Couldn't read this file. Please make sure it's a valid Excel file and try again.");
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("This file doesn't contain any sheets.");
  }
  const sheet = workbook.Sheets[firstSheetName];

  // header: 1 → array-of-arrays (raw rows), so we control the header→key
  // mapping ourselves instead of trusting arbitrary object keys from the
  // sheet.
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: "" });
  if (rawRows.length === 0) {
    throw new Error("This sheet is empty.");
  }

  const headerRow = rawRows[0].map((h) => sanitizeCellValue(h).toLowerCase());
  const columnIndexByKey = new Map<string, number>();
  for (const col of IMPORT_COLUMNS) {
    const idx = headerRow.indexOf(col.header.toLowerCase());
    if (idx !== -1) columnIndexByKey.set(col.key, idx);
  }
  if (!columnIndexByKey.has("name")) {
    throw new Error(`Couldn't find a "Name" column. Please use the provided template and don't rename its headers.`);
  }

  const dataRows = rawRows.slice(1);
  if (dataRows.length > MAX_IMPORT_ROWS) {
    throw new Error(`This file has ${dataRows.length} rows — please split it into batches of ${MAX_IMPORT_ROWS} or fewer.`);
  }

  const rows: ImportRow[] = dataRows.map((rawRow, i) => {
    const row: ImportRow = { _rowNumber: i + 2 } as ImportRow; // +2: 1-indexed, plus header row
    for (const col of IMPORT_COLUMNS) {
      const idx = columnIndexByKey.get(col.key);
      const rawValue = idx !== undefined ? rawRow[idx] : "";
      row[col.key] = DATE_KEYS.has(col.key) ? normalizeDateCell(rawValue) : sanitizeCellValue(rawValue);
    }
    return row;
  });

  return rows;
}

/** Builds and triggers a download of a blank template with the exact
 * headers parseExcelFile expects, plus one example row. */
export async function downloadImportTemplate(): Promise<void> {
  const XLSX = await import("xlsx");
  const headers = IMPORT_COLUMNS.map((c) => c.header);
  const exampleRow = IMPORT_COLUMNS.map((c) => c.example);
  const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
  XLSX.writeFile(workbook, "record-import-template.xlsx");
}
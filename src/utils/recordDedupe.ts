import type { Record } from "@/types/Record";

// The API can occasionally return the same underlying record more than once
// in `recordLists` (e.g. a retried save, or an id collision from the record
// id generator) — that duplication is invisible in the unfiltered table
// (paged out of view) but becomes obvious once a search narrows the list
// down. Collapse to one entry per recordId (falling back to the Mongo _id,
// then a JSON fingerprint) before it ever reaches component state.
export const dedupeRecords = (list: Record[]): Record[] => {
  const seen = new Set<string>();
  const result: Record[] = [];
  for (const record of list) {
    const key = record.recordId || record._id || JSON.stringify(record);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(record);
    }
  }
  return result;
};

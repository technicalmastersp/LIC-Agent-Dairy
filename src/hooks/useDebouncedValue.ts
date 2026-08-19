import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates `delay` ms after
 * the input stops changing. Bind the input itself to the raw, un-debounced
 * state so typing stays instantly responsive — only feed the debounced
 * value into expensive derived work (filters, search, API calls).
 *
 * @example
 *   const [searchTerm, setSearchTerm] = useState("");
 *   const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
 *   // <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
 *   // useMemo(() => expensiveFilter(debouncedSearchTerm), [debouncedSearchTerm]);
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

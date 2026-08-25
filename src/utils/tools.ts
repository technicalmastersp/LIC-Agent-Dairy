export const convertDateToIndianFormat = (date: string | undefined, type?: string) => {
    // Record date fields (createdAt, dateOfBirth, lastPaymentDate, etc.)
    // are optional on the Record type, and several call sites pass them
    // straight through without a fallback — this already returns '' for
    // any falsy input at runtime, so widening the param type to match
    // reality (rather than adding `|| ""` at every call site) is the
    // correct fix.
    if (!date) return '';
    
    if (!type) {
        const d = typeof date === 'string' ? new Date(date) : date;

        if (!(d instanceof Date) || isNaN(d.getTime())) return '';

        const indiaDate = new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            // month: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(d).replace(/ /g, '-');

        return indiaDate;
    } else {
        return date.split("T")[0];
    }
};
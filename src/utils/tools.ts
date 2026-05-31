export const convertDateToIndianFormat = (date: string, type?: string) => {
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
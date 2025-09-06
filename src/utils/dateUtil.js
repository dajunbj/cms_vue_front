export function formatDateToMonth(dateInput) {
    const date = new Date(dateInput);
    if (isNaN(date)) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  }
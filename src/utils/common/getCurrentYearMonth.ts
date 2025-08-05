export function getCurrentYearMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() از 0 شروع می‌شود
  
    return `${year}/${month}`;
}
  
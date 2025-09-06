export function slugify(title: string) {
    return title
      .toLowerCase() // همه حروف کوچیک
      .trim() // حذف فاصله‌های اول و آخر
      .replace(/\s+/g, '-') // فاصله‌ها → "-"
      .replace(/[^\w\u0600-\u06FF\-]+/g, '') // حذف هر چیزی غیر از حروف فارسی، انگلیسی، عدد و "-"
      .replace(/\-+/g, '-'); // اگر چندتا "-" پشت سر هم بود → یکی
}

export default slugify;
  
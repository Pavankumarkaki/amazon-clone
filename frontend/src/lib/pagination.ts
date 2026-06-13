export type PaginationItem = number | "ellipsis";

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PaginationItem[] {
  if (totalPages <= 1) return [1];

  const pages = new Set<number>([1, totalPages, currentPage]);

  for (let offset = 1; offset <= siblingCount; offset += 1) {
    pages.add(currentPage - offset);
    pages.add(currentPage + offset);
  }

  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const items: PaginationItem[] = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i];
    const previous = sorted[i - 1];

    if (i > 0 && page - previous > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  }

  return items;
}

export function clampPage(page, totalPages) {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

export function getTotalPages(totalItems, itemsPerPage) {
  return Math.max(1, Math.ceil(totalItems / itemsPerPage));
}

export function paginateItems(items, currentPage, itemsPerPage) {
  const totalPages = getTotalPages(items.length, itemsPerPage);
  const safePage = clampPage(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;

  return {
    totalPages,
    currentPage: safePage,
    pageItems: items.slice(startIndex, startIndex + itemsPerPage),
    startIndex,
  };
}

export function getPaginationMeta(totalItems, currentPage, itemsPerPage) {
  const totalPages = getTotalPages(totalItems, itemsPerPage);
  const safePage = clampPage(currentPage, totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const end = totalItems === 0 ? 0 : Math.min(safePage * itemsPerPage, totalItems);

  return {
    currentPage: safePage,
    totalPages,
    start,
    end,
  };
}

export function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

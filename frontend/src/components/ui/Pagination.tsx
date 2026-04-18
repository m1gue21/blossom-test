interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const visiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <nav className="flex items-center justify-center gap-1 flex-wrap" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      {page > 3 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">1</button>
          {page > 4 && <span className="px-2 text-gray-500">...</span>}
        </>
      )}

      {visiblePages().map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            p === page
              ? 'bg-rm-green text-black font-bold'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          {p}
        </button>
      ))}

      {page < pages - 2 && (
        <>
          {page < pages - 3 && <span className="px-2 text-gray-500">...</span>}
          <button onClick={() => onPageChange(pages)} className="px-3 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">{pages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </nav>
  );
}

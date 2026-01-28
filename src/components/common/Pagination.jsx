const buildPageWindow = (totalPages, currentPage, maxButtons) => {
    if (totalPages <= 0) return [];

    const safeMax = Math.max(3, maxButtons);
    const current = Math.min(Math.max(0, currentPage), totalPages - 1);

    let start = Math.max(0, current - Math.floor(safeMax / 2));
    let end = start + safeMax - 1;

    if (end > totalPages - 1) {
        end = totalPages - 1;
        start = Math.max(0, end - safeMax + 1);
    }

    const pages = [];
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
};

const Pagination = ({
    page,
    totalPages,
    totalItems,
    disabled,
    onPageChange,
    maxButtons = 5,
}) => {
    if (!Number.isFinite(totalPages) || totalPages <= 1) return null;

    const pages = buildPageWindow(totalPages, page, maxButtons);

    const canPrev = !disabled && page > 0;
    const canNext = !disabled && page < totalPages - 1;

    return (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
                Trang <span className="font-medium text-gray-900">{page + 1}</span> /{' '}
                <span className="font-medium text-gray-900">{totalPages}</span>
                {typeof totalItems === 'number' ? (
                    <>
                        {' '}
                        • Tổng <span className="font-medium text-gray-900">{totalItems}</span>
                    </>
                ) : null}
            </div>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => canPrev && onPageChange(page - 1)}
                    disabled={!canPrev}
                    className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                >
                    Trước
                </button>

                {pages[0] > 0 ? (
                    <>
                        <button
                            type="button"
                            onClick={() => !disabled && onPageChange(0)}
                            disabled={disabled}
                            className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                        >
                            1
                        </button>
                        <span className="px-2 text-gray-500">…</span>
                    </>
                ) : null}

                {pages.map((p) => {
                    const isActive = p === page;
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => !disabled && onPageChange(p)}
                            disabled={disabled}
                            className={
                                isActive
                                    ? 'px-3 py-1 rounded border border-indigo-600 bg-indigo-600 text-sm text-white'
                                    : 'px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 disabled:opacity-50'
                            }
                        >
                            {p + 1}
                        </button>
                    );
                })}

                {pages[pages.length - 1] < totalPages - 1 ? (
                    <>
                        <span className="px-2 text-gray-500">…</span>
                        <button
                            type="button"
                            onClick={() => !disabled && onPageChange(totalPages - 1)}
                            disabled={disabled}
                            className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                        >
                            {totalPages}
                        </button>
                    </>
                ) : null}

                <button
                    type="button"
                    onClick={() => canNext && onPageChange(page + 1)}
                    disabled={!canNext}
                    className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};

export default Pagination;
import { forwardRef, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readDocumentByPage } from '@/services/document.service';
import { useDocumentById } from '@/hooks/useDocument';
import { xorDecode } from '@/utils/function';
import { toast } from 'react-toastify';
import HTMLFlipBook from 'react-pageflip';
import './DocumentReader.css';

const FlipPage = forwardRef(({ pageNumber, src, isLoading }, ref) => {
    return (
        <div className="dr-page" ref={ref}>
            <div
                className="dr-page-inner"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
            >
                {src ? (
                    <img
                        src={src}
                        alt={`Trang ${pageNumber}`}
                        className="dr-page-image"
                        draggable={false}
                    />
                ) : (
                    <div className="dr-page-placeholder">
                        <span>{isLoading ? 'Dang tai trang...' : `Trang ${pageNumber}`}</span>
                    </div>
                )}
                <div className="dr-page-footer">Trang {pageNumber}</div>
            </div>
        </div>
    );
});

FlipPage.displayName = 'FlipPage';

const DocumentReader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const flipBookRef = useRef(null);
    const readerViewportRef = useRef(null);
    const objectUrlsRef = useRef(new Set());
    const imageCacheRef = useRef({});

    const { data: documentData, isLoading: isDocumentLoading } = useDocumentById(id);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageCache, setImageCache] = useState({});
    const [loadingMap, setLoadingMap] = useState({});
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [bookSize, setBookSize] = useState({ width: 760, height: 1064 });
    const [isMobile, setIsMobile] = useState(false);
    const [pageInput, setPageInput] = useState('1');

    const document = documentData?.data?.document || null;
    const hasAccess = documentData?.data?.hasAccess || false;
    const totalPages = useMemo(() => document?.total_pages || 1, [document]);

    const revokeAllObjectUrls = useCallback(() => {
        objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        objectUrlsRef.current.clear();
    }, []);

    const updateBookSize = useCallback(() => {
        const paddingX = window.innerWidth < 768 ? 24 : 52;
        const toolbarHeight = window.innerWidth < 768 ? 220 : 185;
        const maxViewportWidth = Math.max(280, window.innerWidth - paddingX);
        const maxViewportHeight = Math.max(360, window.innerHeight - toolbarHeight);

        const ratio = 1.42;
        let width = Math.min(window.innerWidth < 768 ? maxViewportWidth : maxViewportWidth * 0.46, 860);
        let height = width * ratio;

        if (height > maxViewportHeight) {
            height = maxViewportHeight;
            width = height / ratio;
        }

        setBookSize({
            width: Math.max(260, Math.round(width)),
            height: Math.max(370, Math.round(height)),
        });
        setIsMobile(window.innerWidth < 992);
    }, []);

    const loadPage = useCallback(async (pageNumber) => {
        if (!id || !hasAccess || pageNumber < 1 || pageNumber > totalPages || imageCacheRef.current[pageNumber]) {
            return;
        }

        setLoadingMap((prev) => {
            if (prev[pageNumber]) {
                return prev;
            }

            return { ...prev, [pageNumber]: true };
        });

        try {
            const arrayBuffer = await readDocumentByPage(id, pageNumber);
            const uint8Array = new Uint8Array(arrayBuffer);
            const decodedArray = xorDecode(uint8Array, 23);
            const blob = new Blob([new Uint8Array(decodedArray)], { type: 'image/jpeg' });
            const objectUrl = URL.createObjectURL(blob);

            objectUrlsRef.current.add(objectUrl);
            setImageCache((prev) => ({
                ...prev,
                [pageNumber]: objectUrl,
            }));
        } catch (err) {
            console.error('Loi khi load trang:', err);
            toast.error(`Khong the tai trang ${pageNumber}`);
        } finally {
            setLoadingMap((prev) => ({ ...prev, [pageNumber]: false }));
        }
    }, [hasAccess, id, totalPages]);

    useEffect(() => {
        imageCacheRef.current = imageCache;
    }, [imageCache]);

    useEffect(() => {
        if (!isDocumentLoading && !hasAccess) {
            toast.error('Ban can muon tai lieu truoc khi doc');
            navigate(`/documents/${id}`);
        }
    }, [hasAccess, id, isDocumentLoading, navigate]);

    useEffect(() => {
        updateBookSize();
        window.addEventListener('resize', updateBookSize);
        return () => window.removeEventListener('resize', updateBookSize);
    }, [updateBookSize]);

    useEffect(() => {
        setCurrentPage(1);
        setPageInput('1');
        setZoomLevel(100);
        setImageCache({});
        setLoadingMap({});
        imageCacheRef.current = {};
        revokeAllObjectUrls();
    }, [id, revokeAllObjectUrls]);

    useEffect(() => {
        if (!hasAccess) {
            return;
        }

        const pagesToPreload = [currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
            .filter((page) => page >= 1 && page <= totalPages);

        pagesToPreload.forEach((page) => {
            if (!imageCacheRef.current[page]) {
                loadPage(page);
            }
        });
    }, [currentPage, hasAccess, loadPage, totalPages]);

    const handlePrevPage = useCallback(() => {
        if (currentPage <= 1) {
            return;
        }

        flipBookRef.current?.pageFlip()?.flipPrev();
    }, [currentPage]);

    const handleNextPage = useCallback(() => {
        if (currentPage >= totalPages) {
            return;
        }

        flipBookRef.current?.pageFlip()?.flipNext();
    }, [currentPage, totalPages]);

    const handleJumpPage = useCallback((page) => {
        if (Number.isNaN(page) || page < 1 || page > totalPages) {
            setPageInput(String(currentPage));
            return;
        }

        flipBookRef.current?.pageFlip()?.flip(page - 1);
    }, [currentPage, totalPages]);

    const handleClose = useCallback(() => {
        navigate(`/documents/${id}`);
    }, [id, navigate]);

    const handleZoomIn = useCallback(() => {
        setZoomLevel((prev) => Math.min(prev + 10, 180));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel((prev) => Math.max(prev - 10, 70));
    }, []);

    const handleZoomReset = useCallback(() => {
        setZoomLevel(100);
    }, []);

    const handleToggleFullscreen = useCallback(async () => {
        try {
            if (!window.document.fullscreenElement) {
                await readerViewportRef.current?.requestFullscreen();
            } else {
                await window.document.exitFullscreen();
            }
        } catch {
            toast.error('Khong the chuyen doi fullscreen');
        }
    }, []);

    const handleFlip = useCallback((event) => {
        setCurrentPage(event.data + 1);
    }, []);

    useEffect(() => {
        setPageInput(String(currentPage));
    }, [currentPage]);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(Boolean(window.document.fullscreenElement));
        };

        window.document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => window.document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            const targetTag = e.target?.tagName?.toLowerCase();
            if (targetTag === 'input' || targetTag === 'textarea') {
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrevPage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNextPage();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                if (window.document.fullscreenElement) {
                    window.document.exitFullscreen();
                } else {
                    handleClose();
                }
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                handleZoomIn();
            } else if (e.key === '-' || e.key === '_') {
                e.preventDefault();
                handleZoomOut();
            } else if (e.key === '0') {
                e.preventDefault();
                handleZoomReset();
            } else if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                handleToggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [
        handleClose,
        handleNextPage,
        handlePrevPage,
        handleToggleFullscreen,
        handleZoomIn,
        handleZoomOut,
        handleZoomReset,
    ]);

    useEffect(() => {
        const preventContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        window.document.addEventListener('contextmenu', preventContextMenu);
        return () => window.document.removeEventListener('contextmenu', preventContextMenu);
    }, []);

    useEffect(() => {
        const preventCopyPaste = (e) => {
            if (
                e.key === 'PrintScreen' ||
                (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
                (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
                (e.ctrlKey && (e.key === 'x' || e.key === 'X')) ||
                (e.ctrlKey && (e.key === 'v' || e.key === 'V'))
            ) {
                e.preventDefault();
                return false;
            }
        };

        window.addEventListener('keydown', preventCopyPaste);
        return () => window.removeEventListener('keydown', preventCopyPaste);
    }, []);

    useEffect(() => {
        return () => {
            revokeAllObjectUrls();
        };
    }, [revokeAllObjectUrls]);

    const pageCards = useMemo(() => {
        return Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
                <FlipPage
                    key={pageNumber}
                    pageNumber={pageNumber}
                    src={imageCache[pageNumber]}
                    isLoading={Boolean(loadingMap[pageNumber])}
                />
            );
        });
    }, [imageCache, loadingMap, totalPages]);

    const isCurrentPageLoading = Boolean(loadingMap[currentPage]) && !imageCache[currentPage];

    if (isDocumentLoading) {
        return (
            <div className="dr-loader-screen">
                <div className="dr-loader-box">Dang tai tai lieu...</div>
            </div>
        );
    }

    if (!hasAccess) {
        return null;
    }

    return (
        <div className="dr-shell" ref={readerViewportRef} style={{ userSelect: 'none' }}>
            <div className="dr-background-layer" />

            <header className="dr-toolbar">
                <div className="dr-toolbar-left">
                    <button type="button" className="dr-btn dr-btn-ghost" onClick={handleClose}>
                        Dong
                    </button>
                    <div className="dr-title-group">
                        <p className="dr-kicker">Book Reader</p>
                        <h1 className="dr-title">{document?.title || 'Dang doc tai lieu'}</h1>
                    </div>
                </div>

                <div className="dr-toolbar-right">
                    <div className="dr-zoom-control">
                        <button type="button" className="dr-btn" onClick={handleZoomOut} disabled={zoomLevel <= 70}>
                            -
                        </button>
                        <span className="dr-zoom-value">{zoomLevel}%</span>
                        <button type="button" className="dr-btn" onClick={handleZoomIn} disabled={zoomLevel >= 180}>
                            +
                        </button>
                        <button type="button" className="dr-btn dr-btn-subtle" onClick={handleZoomReset}>
                            100%
                        </button>
                    </div>

                    <button type="button" className="dr-btn dr-btn-subtle" onClick={handleToggleFullscreen}>
                        {isFullscreen ? 'Thu nho' : 'Fullscreen'}
                    </button>
                </div>
            </header>

            <main className="dr-reader-area">
                <div className="dr-book-stage" style={{ transform: `scale(${zoomLevel / 100})` }}>
                    {isCurrentPageLoading && (
                        <div className="dr-overlay-loading">
                            <span>Dang tai trang {currentPage}...</span>
                        </div>
                    )}

                    <HTMLFlipBook
                        ref={flipBookRef}
                        width={bookSize.width}
                        height={bookSize.height}
                        className="dr-flipbook"
                        size="fixed"
                        minWidth={260}
                        maxWidth={900}
                        minHeight={370}
                        maxHeight={1300}
                        drawShadow
                        showCover={false}
                        maxShadowOpacity={0.5}
                        mobileScrollSupport={false}
                        onFlip={handleFlip}
                        usePortrait={isMobile}
                        flippingTime={650}
                        startPage={0}
                        autoSize={false}
                        clickEventForward
                        useMouseEvents
                    >
                        {pageCards}
                    </HTMLFlipBook>
                </div>
            </main>

            <footer className="dr-footer">
                <div className="dr-footer-group">
                    <button
                        type="button"
                        className="dr-btn dr-btn-nav"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        Trang truoc
                    </button>
                    <button
                        type="button"
                        className="dr-btn dr-btn-nav"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Trang tiep
                    </button>
                </div>

                <div className="dr-footer-group">
                    <label htmlFor="document-page" className="dr-page-label">
                        Trang
                    </label>
                    <input
                        id="document-page"
                        type="number"
                        min="1"
                        max={totalPages}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onBlur={() => handleJumpPage(Number.parseInt(pageInput, 10))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleJumpPage(Number.parseInt(pageInput, 10));
                            }
                        }}
                        className="dr-page-input"
                    />
                    <span className="dr-page-total">/ {totalPages}</span>
                </div>

                <div className="dr-hotkeys">
                    <span>Phim tat: Left/Right</span>
                    <span>Zoom: + - 0</span>
                    <span>Fullscreen: F</span>
                    <span>Dong: ESC</span>
                </div>
            </footer>
        </div>
    );
};

export default DocumentReader;

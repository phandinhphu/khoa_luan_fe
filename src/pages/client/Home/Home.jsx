import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAllDocuments } from '@/hooks/useDocument';
import DocumentCard from '@/components/document/DocumentCard';
import Pagination from '@/components/common/Pagination';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(0); // 0-based for Pagination component
    const PAGE_SIZE = 10;

    const { data: response, isLoading, isFetching } = useAllDocuments(page + 1, PAGE_SIZE);

    const documents = useMemo(() => response?.data?.documents || [], [response]);
    const totalItems = response?.total || 0;
    const totalPages = response?.totalPages || 0;

    const filteredDocuments = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        const searched = normalized
            ? documents.filter((doc) => {
                const title = doc?.title?.toLowerCase() || '';
                const copyright = doc?.copyright_status?.toLowerCase() || '';
                return title.includes(normalized) || copyright.includes(normalized);
            })
            : documents;

        const sorted = [...searched];
        if (sortBy === 'az') {
            sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (sortBy === 'borrow') {
            sorted.sort((a, b) => (b.total_borrows || 0) - (a.total_borrows || 0));
        } else {
            sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }

        return sorted;
    }, [documents, query, sortBy]);

    const handleSearch = (value) => {
        setQuery(value);
        setPage(0);

        const trimmed = value.trim();
        if (trimmed) {
            setSearchParams({ q: trimmed });
        } else {
            setSearchParams({});
        }
    };

    const handleSort = (value) => {
        setSortBy(value);
        setPage(0);
    };

    if (isLoading) {
        return <div className="home-loading">Dang tai danh sach tai lieu...</div>;
    }

    if (isFetching) {
        return <div className="home-loading">Dang cap nhat du lieu...</div>;
    }

    return (
        <div className="home-shell">
            <section className="home-hero">
                <div>
                    <p className="home-kicker">
                        <Sparkles size={16} />
                        Kho tri thuc so
                    </p>
                    <h1>Kham pha tai lieu hoc thuat theo cach truc quan hon</h1>
                    <p className="home-subtitle">
                        Tim kiem nhanh, sap xep thong minh va vao doc ngay voi giao dien duoc toi uu cho hoc tap.
                    </p>
                </div>

                <div className="home-stats">
                    <div className="home-stat-card">
                        <span>Tong tai lieu</span>
                        <strong>{totalItems}</strong>
                    </div>
                    <div className="home-stat-card">
                        <span>Dang hien thi</span>
                        <strong>{filteredDocuments.length}</strong>
                    </div>
                </div>
            </section>

            <section className="home-toolbar">
                <div className="home-searchbox">
                    <Search size={18} />
                    <input
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Tim theo tieu de tai lieu hoac tinh trang ban quyen..."
                    />
                </div>

                <div className="home-sortbox">
                    <SlidersHorizontal size={16} />
                    <label htmlFor="sort-by">Sap xep</label>
                    <select id="sort-by" value={sortBy} onChange={(e) => handleSort(e.target.value)}>
                        <option value="newest">Moi nhat</option>
                        <option value="borrow">Pho bien nhat</option>
                        <option value="az">A - Z</option>
                    </select>
                </div>
            </section>

            {filteredDocuments.length === 0 ? (
                <div className="home-empty">
                    <h3>Khong tim thay tai lieu phu hop</h3>
                    <p>Thu doi tu khoa khac hoac xoa bo bo loc hien tai.</p>
                </div>
            ) : (
                <>
                    <section className="home-grid">
                        {filteredDocuments.map((doc) => (
                            <DocumentCard
                                key={doc._id}
                                document={doc}
                                onClick={() => navigate(`/documents/${doc._id}`)}
                            />
                        ))}
                    </section>

                    <section className="home-pagination">
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            disabled={isLoading || isFetching}
                            onPageChange={setPage}
                        />
                    </section>
                </>
            )}
        </div>
    );
};

export default Home;

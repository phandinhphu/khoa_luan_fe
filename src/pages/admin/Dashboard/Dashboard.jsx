import { startTransition, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowRight,
    BookOpenText,
    Clock3,
    Eye,
    FileBarChart,
    FileClock,
    Flame,
    MessageSquareMore,
    RefreshCcw,
    Star,
    TrendingUp,
    UserRoundPlus,
    Users,
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import {
    useDashboardOverview,
    useDashboardTimeline,
    useRecentActivities,
    useTopDocuments,
} from '@/hooks/useDashboard';
import './Dashboard.css';

const RANGE_OPTIONS = [
    { value: 7, label: '7 ngày' },
    { value: 30, label: '30 ngày' },
    { value: 90, label: '90 ngày' },
    { value: 180, label: '180 ngày' },
];

const METRIC_OPTIONS = {
    users: { label: 'Người dùng mới', color: '#0f766e', accent: 'teal' },
    documents: { label: 'Tài liệu mới', color: '#d97706', accent: 'amber' },
    borrows: { label: 'Lượt mượn', color: '#2563eb', accent: 'blue' },
    views: { label: 'Lượt xem', color: '#dc2626', accent: 'rose' },
    forumPosts: { label: 'Bài viết diễn đàn', color: '#7c3aed', accent: 'violet' },
};

const ACTIVITY_CONFIG = {
    document_uploaded: {
        label: 'Tài liệu mới',
        icon: FileClock,
        tone: 'amber',
    },
    document_borrowed: {
        label: 'Mượn tài liệu',
        icon: BookOpenText,
        tone: 'blue',
    },
    document_returned: {
        label: 'Trả tài liệu',
        icon: RefreshCcw,
        tone: 'teal',
    },
    forum_post_created: {
        label: 'Bài viết mới',
        icon: MessageSquareMore,
        tone: 'violet',
    },
};

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(Number(value) || 0);

const formatCompactNumber = (value) => new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
}).format(Number(value) || 0);

const formatRating = (value) => {
    const numericValue = Number(value) || 0;
    return numericValue.toFixed(numericValue % 1 === 0 ? 0 : 1);
};

const formatDateTime = (dateString) => {
    if (!dateString) {
        return 'Chưa có dữ liệu';
    }

    return new Date(dateString).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const formatShortDate = (dateString) => {
    if (!dateString) {
        return 'N/A';
    }

    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const getPercent = (value, total) => {
    if (!total) {
        return 0;
    }

    return Math.round((Number(value) / Number(total)) * 100);
};

const buildDonutStyle = (segments) => {
    let start = 0;
    const safeSegments = segments.filter((segment) => segment.value > 0);

    if (safeSegments.length === 0) {
        return {
            background: 'conic-gradient(#e2e8f0 0deg 360deg)',
        };
    }

    const total = safeSegments.reduce((sum, segment) => sum + segment.value, 0);
    const ranges = safeSegments.map((segment) => {
        const angle = (segment.value / total) * 360;
        const result = `${segment.color} ${start}deg ${start + angle}deg`;
        start += angle;
        return result;
    });

    return {
        background: `conic-gradient(${ranges.join(', ')})`,
    };
};

const buildLinePath = (points, width, height, padding) => {
    if (points.length === 0) {
        return '';
    }

    const values = points.map((point) => Number(point.value) || 0);
    const maxValue = Math.max(...values, 1);
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return points
        .map((point, index) => {
            const x = padding + (chartWidth / Math.max(points.length - 1, 1)) * index;
            const y = padding + chartHeight - ((Number(point.value) || 0) / maxValue) * chartHeight;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
};

const buildAreaPath = (points, width, height, padding) => {
    if (points.length === 0) {
        return '';
    }

    const linePath = buildLinePath(points, width, height, padding);
    const chartWidth = width - padding * 2;
    const baseY = height - padding;
    const lastX = padding + chartWidth;

    return `${linePath} L ${lastX} ${baseY} L ${padding} ${baseY} Z`;
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedDays, setSelectedDays] = useState(7);
    const [activeMetric, setActiveMetric] = useState('views');

    const overviewQuery = useDashboardOverview(selectedDays);
    const timelineQuery = useDashboardTimeline(selectedDays);
    const topDocumentsQuery = useTopDocuments(selectedDays, 5);
    const activitiesQuery = useRecentActivities(8);

    const queries = [overviewQuery, timelineQuery, topDocumentsQuery, activitiesQuery];
    const isInitialLoading = queries.some((query) => query.isLoading && !query.data);
    const hasError = queries.some((query) => query.isError);
    const firstError = queries.find((query) => query.error)?.error;

    const overview = overviewQuery.data?.data || {};
    const timeline = timelineQuery.data?.data || {};
    const topDocuments = topDocumentsQuery.data?.data?.documents || [];
    const activities = activitiesQuery.data?.data?.activities || [];

    const totals = overview.totals || {};
    const documentStats = overview.documents || {};
    const forumStats = overview.forum || {};
    const engagement = overview.engagement || {};
    const growth = overview.growth || {};
    const timelinePoints = timeline.points;
    const groupBy = timeline.period?.groupBy === 'month' ? 'tháng' : 'ngày';

    const selectedMetricConfig = METRIC_OPTIONS[activeMetric];

    const chartPoints = useMemo(() => {
        return (timelinePoints || []).map((point) => ({
            label: point.label,
            value: Number(point[activeMetric]) || 0,
        }));
    }, [activeMetric, timelinePoints]);

    const chartPeak = useMemo(() => {
        return chartPoints.reduce((max, point) => Math.max(max, point.value), 0);
    }, [chartPoints]);

    const chartTotal = useMemo(() => {
        return chartPoints.reduce((sum, point) => sum + point.value, 0);
    }, [chartPoints]);

    // Minimum 72px per data point so labels never overlap; scrolls horizontally when needed
    const svgW = useMemo(() => Math.max(720, chartPoints.length * 72), [chartPoints]);

    const documentSegments = [
        { label: 'Hoàn tất', value: Number(documentStats.done) || 0, color: '#0f766e' },
        { label: 'Đang xử lý', value: Number(documentStats.processing) || 0, color: '#d97706' },
        { label: 'Lỗi', value: Number(documentStats.failed) || 0, color: '#dc2626' },
    ];

    const totalDocumentStatuses = documentSegments.reduce((sum, segment) => sum + segment.value, 0);
    const copiesUsage = totals.totalCopies
        ? Math.min(100, Math.round(((totals.totalCopies - (totals.availableCopies || 0)) / totals.totalCopies) * 100))
        : 0;

    const utilizationTone = totals.totalCopies && totals.activeBorrows > totals.totalCopies * 0.8
        ? 'danger'
        : 'normal';

    const kpiCards = [
        {
            title: 'Người dùng',
            value: formatNumber(totals.users),
            subtitle: `+${formatNumber(growth.newUsers)} trong ${selectedDays} ngày`,
            icon: Users,
            tone: 'teal',
            actionLabel: 'Mở quản lý người dùng',
            path: '/admin/users',
        },
        {
            title: 'Tài liệu',
            value: formatNumber(totals.documents),
            subtitle: `+${formatNumber(growth.newDocuments)} tài liệu mới`,
            icon: FileBarChart,
            tone: 'amber',
            actionLabel: 'Mở kho tài liệu',
            path: '/admin/documents',
        },
        {
            title: 'Đang mượn',
            value: formatNumber(totals.activeBorrows),
            subtitle: `${copiesUsage}% công suất thư viện`,
            icon: BookOpenText,
            tone: utilizationTone === 'danger' ? 'rose' : 'blue',
            actionLabel: 'Xem tài liệu',
            path: '/admin/documents',
        },
        {
            title: 'Quá hạn',
            value: formatNumber(totals.overdueBorrows),
            subtitle: totals.overdueBorrows ? 'Cần ưu tiên xử lý' : 'Chưa có khoản mượn trễ',
            icon: AlertTriangle,
            tone: totals.overdueBorrows ? 'rose' : 'slate',
            actionLabel: 'Rà soát tài liệu',
            path: '/admin/documents',
        },
    ];

    const growthCards = [
        {
            title: 'Lượt xem mới',
            value: formatNumber(growth.newViews),
            icon: Eye,
            path: '/admin/documents',
        },
        {
            title: 'Lượt mượn mới',
            value: formatNumber(growth.newBorrows),
            icon: TrendingUp,
            path: '/admin/documents',
        },
        {
            title: 'Bài viết mới',
            value: formatNumber(growth.newForumPosts),
            icon: MessageSquareMore,
            path: '/admin/forum',
        },
        {
            title: 'Độc giả mới',
            value: formatNumber(growth.newUsers),
            icon: UserRoundPlus,
            path: '/admin/users',
        },
    ];

    const handleRefreshAll = () => {
        queries.forEach((query) => {
            query.refetch();
        });
    };

    if (isInitialLoading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-skeleton dashboard-skeleton-hero" />
                <div className="dashboard-kpi-grid">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={`kpi-skeleton-${index}`} className="dashboard-skeleton dashboard-skeleton-card" />
                    ))}
                </div>
                <div className="dashboard-content-grid">
                    <div className="dashboard-skeleton dashboard-skeleton-chart" />
                    <div className="dashboard-skeleton dashboard-skeleton-side" />
                </div>
                <div className="dashboard-bottom-grid">
                    <div className="dashboard-skeleton dashboard-skeleton-panel" />
                    <div className="dashboard-skeleton dashboard-skeleton-panel" />
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div className="dashboard-hero-copy">
                    <span className="dashboard-section-tag">Bảng điều khiển quản trị</span>
                    <h1>Toàn cảnh thư viện số trong {selectedDays} ngày gần nhất</h1>
                    <p>
                        Theo dõi tăng trưởng người dùng, mức sử dụng tài liệu, trạng thái diễn đàn
                        và các tín hiệu cần xử lý ngay trên cùng một màn hình.
                    </p>
                    <div className="dashboard-range-switcher">
                        {RANGE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={selectedDays === option.value ? 'active' : ''}
                                onClick={() => {
                                    startTransition(() => {
                                        setSelectedDays(option.value);
                                    });
                                }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="dashboard-hero-panel">
                    <div className="dashboard-hero-panel-head">
                        <div>
                            <span className="dashboard-panel-eyebrow">Phiên làm việc</span>
                            <h2>{user?.name || 'Quản trị viên'}</h2>
                        </div>
                        <button type="button" className="dashboard-refresh-btn" onClick={handleRefreshAll}>
                            <RefreshCcw size={16} />
                            Làm mới
                        </button>
                    </div>

                    <div className="dashboard-highlight-list">
                        <button type="button" className="dashboard-highlight-card" onClick={() => navigate('/admin/dashboard')}>
                            <span>Kỳ thống kê</span>
                            <strong>{selectedDays} ngày</strong>
                        </button>
                        <button type="button" className="dashboard-highlight-card" onClick={handleRefreshAll}>
                            <span>Cập nhật đến</span>
                            <strong>{formatDateTime(overview.period?.endDate)}</strong>
                        </button>
                        <button type="button" className="dashboard-highlight-card" onClick={() => navigate('/admin/forum')}>
                            <span>Forum chờ duyệt</span>
                            <strong>{formatNumber(forumStats.pendingPosts)}</strong>
                        </button>
                    </div>

                    <div className="dashboard-growth-strip">
                        {growthCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <button
                                    key={card.title}
                                    type="button"
                                    className="dashboard-growth-card dashboard-growth-button"
                                    onClick={() => navigate(card.path)}
                                >
                                    <Icon size={18} />
                                    <div>
                                        <span>{card.title}</span>
                                        <strong>{card.value}</strong>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {hasError && (
                <div className="dashboard-alert">
                    <div>
                        <strong>Không thể tải đầy đủ dữ liệu dashboard.</strong>
                        <p>{firstError?.message || 'Một số widget có thể đang hiển thị dữ liệu cũ hoặc trống.'}</p>
                    </div>
                    <button type="button" onClick={handleRefreshAll}>
                        Thử lại
                    </button>
                </div>
            )}

            <section className="dashboard-kpi-grid">
                {kpiCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <button
                            key={card.title}
                            type="button"
                            className={`dashboard-kpi-card dashboard-kpi-button tone-${card.tone}`}
                            onClick={() => navigate(card.path)}
                        >
                            <div className="dashboard-kpi-head">
                                <span>{card.title}</span>
                                <div className="dashboard-kpi-icon">
                                    <Icon size={18} />
                                </div>
                            </div>
                            <strong>{card.value}</strong>
                            <p>{card.subtitle}</p>
                            <span className="dashboard-card-link">{card.actionLabel}</span>
                        </button>
                    );
                })}
            </section>

            <section className="dashboard-content-grid">
                <article className="dashboard-panel dashboard-chart-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <span className="dashboard-panel-eyebrow">Timeline tăng trưởng</span>
                            <h2>{selectedMetricConfig.label}</h2>
                        </div>
                        <div className="dashboard-chart-stats">
                            <span>
                                Tổng <strong>{formatCompactNumber(chartTotal)}</strong>
                            </span>
                            <span>
                                Đỉnh <strong>{formatCompactNumber(chartPeak)}</strong>
                            </span>
                            <span>
                                Theo <strong>{groupBy}</strong>
                            </span>
                        </div>
                    </div>

                    <div className="dashboard-chart-switcher">
                        {Object.entries(METRIC_OPTIONS).map(([metric, config]) => (
                            <button
                                key={metric}
                                type="button"
                                className={activeMetric === metric ? `active accent-${config.accent}` : ''}
                                onClick={() => {
                                    startTransition(() => {
                                        setActiveMetric(metric);
                                    });
                                }}
                            >
                                {config.label}
                            </button>
                        ))}
                    </div>

                    {chartPoints.length > 0 ? (
                        <div className="dashboard-chart-shell">
                            <svg
                                viewBox={`0 0 ${svgW} 280`}
                                width={svgW}
                                height={280}
                                className="dashboard-chart-svg"
                                role="img"
                                aria-label={selectedMetricConfig.label}
                            >
                                <defs>
                                    <linearGradient id="dashboardAreaGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor={selectedMetricConfig.color} stopOpacity="0.24" />
                                        <stop offset="100%" stopColor={selectedMetricConfig.color} stopOpacity="0.02" />
                                    </linearGradient>
                                </defs>

                                {[0, 1, 2, 3].map((step) => {
                                    const y = 32 + step * 56;
                                    return (
                                        <line
                                            key={`grid-${step}`}
                                            x1={24}
                                            x2={svgW - 24}
                                            y1={y}
                                            y2={y}
                                            stroke="#dbe4ea"
                                            strokeDasharray="6 6"
                                        />
                                    );
                                })}

                                <path
                                    d={buildAreaPath(chartPoints, svgW, 280, 24)}
                                    fill="url(#dashboardAreaGradient)"
                                />
                                <path
                                    d={buildLinePath(chartPoints, svgW, 280, 24)}
                                    fill="none"
                                    stroke={selectedMetricConfig.color}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {chartPoints.map((point, index) => {
                                    const innerW = svgW - 48;
                                    const x = 24 + (innerW / Math.max(chartPoints.length - 1, 1)) * index;
                                    const y = 24 + 232 - ((point.value || 0) / Math.max(chartPeak, 1)) * 232;
                                    return (
                                        <g key={`${point.label}-${index}`}>
                                            <circle cx={x} cy={y} r="5" fill={selectedMetricConfig.color} />
                                            <text x={x} y="270" textAnchor="middle" className="dashboard-chart-label">
                                                {point.label}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    ) : (
                        <div className="dashboard-empty-state">Chưa có dữ liệu timeline cho khoảng thời gian này.</div>
                    )}
                </article>

                <div className="dashboard-side-stack">
                    <article className="dashboard-panel dashboard-panel-clickable" onClick={() => navigate('/admin/documents')}>
                        <div className="dashboard-panel-header compact">
                            <div>
                                <span className="dashboard-panel-eyebrow">Tình trạng tài liệu</span>
                                <h2>Pipeline xử lý</h2>
                            </div>
                            <span className="dashboard-chip">{formatNumber(totalDocumentStatuses)} tài liệu</span>
                        </div>

                        <div className="dashboard-donut-wrap">
                            <div className="dashboard-donut" style={buildDonutStyle(documentSegments)}>
                                <div>
                                    <strong>{formatNumber(documentStats.done)}</strong>
                                    <span>đã hoàn tất</span>
                                </div>
                            </div>

                            <div className="dashboard-legend-list">
                                {documentSegments.map((segment) => (
                                    <div key={segment.label} className="dashboard-legend-item">
                                        <span className="dashboard-legend-dot" style={{ backgroundColor: segment.color }} />
                                        <div>
                                            <strong>{segment.label}</strong>
                                            <span>
                                                {formatNumber(segment.value)} · {getPercent(segment.value, totalDocumentStatuses)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>

                    <article className="dashboard-panel dashboard-panel-clickable" onClick={() => navigate('/admin/forum')}>
                        <div className="dashboard-panel-header compact">
                            <div>
                                <span className="dashboard-panel-eyebrow">Hiệu suất thư viện</span>
                                <h2>Sử dụng bản sao</h2>
                            </div>
                            <span className={`dashboard-chip ${utilizationTone === 'danger' ? 'danger' : ''}`}>
                                {copiesUsage}% đang sử dụng
                            </span>
                        </div>

                        <div className="dashboard-progress-meta">
                            <span>{formatNumber(totals.availableCopies)} bản sẵn sàng</span>
                            <strong>{formatNumber(totals.totalCopies)} tổng bản sao</strong>
                        </div>
                        <div className="dashboard-progress-bar">
                            <span style={{ width: `${copiesUsage}%` }} />
                        </div>

                        <div className="dashboard-engagement-grid">
                            <article>
                                <Eye size={18} />
                                <div>
                                    <strong>{formatCompactNumber(engagement.views)}</strong>
                                    <span>Lượt xem</span>
                                </div>
                            </article>
                            <article>
                                <Flame size={18} />
                                <div>
                                    <strong>{formatCompactNumber(engagement.favorites)}</strong>
                                    <span>Yêu thích</span>
                                </div>
                            </article>
                            <article>
                                <Star size={18} />
                                <div>
                                    <strong>{formatCompactNumber(engagement.reviews)}</strong>
                                    <span>Đánh giá</span>
                                </div>
                            </article>
                            <article>
                                <TrendingUp size={18} />
                                <div>
                                    <strong>{formatRating(engagement.averageRating)}</strong>
                                    <span>Điểm trung bình</span>
                                </div>
                            </article>
                        </div>

                        <div className="dashboard-rating-row" aria-label="Điểm đánh giá trung bình">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                    key={`rating-star-${index}`}
                                    size={18}
                                    className={(Number(engagement.averageRating) || 0) >= index + 1 ? 'filled' : ''}
                                />
                            ))}
                            <span>{formatRating(engagement.averageRating)} / 5</span>
                        </div>

                        <div className="dashboard-forum-stats">
                            <div>
                                <span>Chờ duyệt</span>
                                <strong>{formatNumber(forumStats.pendingPosts)}</strong>
                            </div>
                            <div>
                                <span>Đã duyệt</span>
                                <strong>{formatNumber(forumStats.approvedPosts)}</strong>
                            </div>
                            <div>
                                <span>Bị từ chối</span>
                                <strong>{formatNumber(forumStats.rejectedPosts)}</strong>
                            </div>
                            <div>
                                <span>Bình luận</span>
                                <strong>{formatNumber(forumStats.comments)}</strong>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            <section className="dashboard-bottom-grid">
                <article className="dashboard-panel">
                    <div className="dashboard-panel-header compact">
                        <div>
                            <span className="dashboard-panel-eyebrow">Tài liệu nổi bật</span>
                            <h2>Xếp hạng tương tác</h2>
                        </div>
                        <span className="dashboard-chip">Top 5</span>
                    </div>

                    <div className="dashboard-document-list">
                        {topDocuments.length > 0 ? (
                            topDocuments.map((document, index) => (
                                <button
                                    key={document._id}
                                    type="button"
                                    className="dashboard-document-card dashboard-document-button"
                                    onClick={() => navigate('/admin/documents')}
                                >
                                    <div className="dashboard-document-main">
                                        <div className="dashboard-rank-badge">#{index + 1}</div>
                                        <div>
                                            <h3>{document.title}</h3>
                                            <p>
                                                {document.file_type || 'Tài liệu'} · {formatNumber(document.borrowCount)} lượt mượn ·{' '}
                                                {formatNumber(document.viewCount)} lượt xem
                                            </p>
                                        </div>
                                    </div>

                                    <div className="dashboard-document-side">
                                        <span>{formatRating(document.averageRating)} ★</span>
                                        <strong>{formatNumber(document.engagementScore)}</strong>
                                    </div>

                                    <div className="dashboard-document-progress">
                                        <span
                                            style={{
                                                width: `${Math.min(100, (Number(document.engagementScore) / Math.max(Number(topDocuments[0]?.engagementScore) || 1, 1)) * 100)}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="dashboard-document-meta">
                                        <span>{formatNumber(document.favoriteCount)} yêu thích</span>
                                        <span>{formatNumber(document.reviewCount)} đánh giá</span>
                                        <span>
                                            {formatNumber(document.availableCopies)}/{formatNumber(document.total_copies)} bản còn lại
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="dashboard-empty-state">Chưa có dữ liệu tài liệu nổi bật.</div>
                        )}
                    </div>
                </article>

                <article className="dashboard-panel">
                    <div className="dashboard-panel-header compact">
                        <div>
                            <span className="dashboard-panel-eyebrow">Hoạt động gần đây</span>
                            <h2>Feed hệ thống</h2>
                        </div>
                        <span className="dashboard-chip">8 sự kiện mới nhất</span>
                    </div>

                    <div className="dashboard-activity-list">
                        {activities.length > 0 ? (
                            activities.map((activity, index) => {
                                const config = ACTIVITY_CONFIG[activity.type] || {
                                    label: 'Hoạt động',
                                    icon: Clock3,
                                    tone: 'slate',
                                };
                                const Icon = config.icon;

                                return (
                                    <button
                                        key={`${activity.type}-${activity.createdAt}-${index}`}
                                        type="button"
                                        className="dashboard-activity-item dashboard-activity-button"
                                        onClick={() => navigate(activity.type === 'forum_post_created' ? '/admin/forum' : '/admin/documents')}
                                    >
                                        <div className={`dashboard-activity-icon tone-${config.tone}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="dashboard-activity-copy">
                                            <div className="dashboard-activity-head">
                                                <strong>{activity.title}</strong>
                                                <span>{formatDateTime(activity.createdAt)}</span>
                                            </div>
                                            <p>
                                                {config.label}
                                                {activity.actor?.name ? ` bởi ${activity.actor.name}` : ''}
                                            </p>
                                            <div className="dashboard-activity-meta">
                                                <span>{activity.status || 'N/A'}</span>
                                                {activity.actor?.email && <span>{activity.actor.email}</span>}
                                                {activity.metadata?.dueDate && (
                                                    <span>Hạn trả {formatShortDate(activity.metadata.dueDate)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="dashboard-empty-state">Chưa có hoạt động gần đây.</div>
                        )}
                    </div>
                </article>
            </section>

            <section className="dashboard-footnote">
                <span>Dữ liệu đang hiển thị theo cửa sổ {selectedDays} ngày.</span>
                <span>
                    Timeline nhóm theo {groupBy} và số liệu được làm mới khi bạn đổi khoảng thời gian hoặc bấm nút làm mới.
                </span>
                <button type="button" className="dashboard-footnote-link" onClick={() => navigate('/admin/forum')}>
                    Ưu tiên xử lý: {formatNumber(forumStats.pendingPosts)} bài chờ duyệt và {formatNumber(totals.overdueBorrows)} lượt mượn quá hạn
                    <ArrowRight size={14} />
                </button>
            </section>
        </div>
    );
};

export default Dashboard;

import React from 'react';
import { CheckCircle, XCircle, Loader2, FileText, Activity } from 'lucide-react';
import ProgressBar from './ProgressBar';

const UploadProgress = ({ 
    fileName, 
    status, 
    progress, 
    totalPages,
    error 
}) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'uploading':
                return <Loader2 className="status-icon spinning" size={24} style={{ color: '#3b82f6' }} />;
            case 'processing':
                return <Activity className="status-icon pulse" size={24} style={{ color: '#f59e0b' }} />;
            case 'completed':
                return <CheckCircle className="status-icon" size={24} style={{ color: '#10b981' }} />;
            case 'error':
                return <XCircle className="status-icon" size={24} style={{ color: '#ef4444' }} />;
            default:
                return <FileText className="status-icon" size={24} style={{ color: '#6b7280' }} />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'uploading':
                return 'Đang tải lên file...';
            case 'processing':
                return `Đang xử lý tài liệu... (${totalPages > 0 ? `${totalPages} trang` : ''})`;
            case 'completed':
                return `Hoàn thành! (${totalPages} trang)`;
            case 'error':
                return error || 'Có lỗi xảy ra';
            default:
                return 'Đang chuẩn bị...';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'uploading':
                return '#3b82f6';
            case 'processing':
                return '#f59e0b';
            case 'completed':
                return '#10b981';
            case 'error':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    return (
        <div className="upload-progress-card" style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: `2px solid ${getStatusColor()}20`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {getStatusIcon()}
                <div style={{ flex: 1 }}>
                    <div style={{ 
                        fontWeight: '600', 
                        fontSize: '14px', 
                        color: '#1f2937',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {fileName}
                    </div>
                    <div style={{ 
                        fontSize: '13px', 
                        color: getStatusColor(),
                        fontWeight: '500'
                    }}>
                        {getStatusText()}
                    </div>
                </div>
            </div>

            {(status === 'uploading' || status === 'processing') && (
                <ProgressBar 
                    progress={progress} 
                    status={status}
                    showPercentage={true}
                    height="10px"
                />
            )}

            {status === 'completed' && (
                <div style={{
                    padding: '12px',
                    backgroundColor: '#10b98120',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#059669',
                    textAlign: 'center',
                    fontWeight: '500'
                }}>
                    ✓ Tài liệu đã được tải lên và xử lý thành công
                </div>
            )}

            {status === 'error' && (
                <div style={{
                    padding: '12px',
                    backgroundColor: '#ef444420',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#dc2626',
                    textAlign: 'center',
                    fontWeight: '500'
                }}>
                    ✗ {error || 'Có lỗi xảy ra trong quá trình xử lý'}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .spinning {
                    animation: spin 1s linear infinite;
                }
                .pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default UploadProgress;

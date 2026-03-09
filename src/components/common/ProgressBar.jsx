import React from 'react';

const ProgressBar = ({ progress, status, showPercentage = true, height = '8px' }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'completed':
                return '#10b981'; // green
            case 'error':
                return '#ef4444'; // red
            case 'processing':
            case 'uploading':
                return '#3b82f6'; // blue
            default:
                return '#6b7280'; // gray
        }
    };

    return (
        <div className="progress-bar-container" style={{ width: '100%' }}>
            <div
                className="progress-bar-track"
                style={{
                    width: '100%',
                    height: height,
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: getStatusColor(),
                        transition: 'width 0.3s ease, background-color 0.3s ease',
                        borderRadius: '9999px',
                    }}
                />
            </div>
            {showPercentage && (
                <div
                    className="progress-percentage"
                    style={{
                        marginTop: '4px',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        textAlign: 'right',
                    }}
                >
                    {progress}%
                </div>
            )}
        </div>
    );
};

export default ProgressBar;

// Copyright Status Enum
export const COPYRIGHT_STATUS = {
    PUBLIC_DOMAIN: 'PUBLIC_DOMAIN',
    OPEN_LICENSE: 'OPEN_LICENSE',
    INTERNAL_USE: 'INTERNAL_USE',
    AUTHOR_PERMISSION: 'AUTHOR_PERMISSION',
    UNKNOWN: 'UNKNOWN',
};

// Copyright Status Labels (Vietnamese)
export const COPYRIGHT_STATUS_LABELS = {
    [COPYRIGHT_STATUS.PUBLIC_DOMAIN]: 'Phạm vi công cộng',
    [COPYRIGHT_STATUS.OPEN_LICENSE]: 'Giấy phép mở',
    [COPYRIGHT_STATUS.INTERNAL_USE]: 'Sử dụng nội bộ',
    [COPYRIGHT_STATUS.AUTHOR_PERMISSION]: 'Có sự cho phép của tác giả',
    [COPYRIGHT_STATUS.UNKNOWN]: 'Không rõ ràng',
};

// Get all copyright status options for select
export const getCopyrightStatusOptions = () => {
    return Object.keys(COPYRIGHT_STATUS).map((key) => ({
        value: COPYRIGHT_STATUS[key],
        label: COPYRIGHT_STATUS_LABELS[COPYRIGHT_STATUS[key]],
    }));
};

// Get copyright status label by value
export const getCopyrightStatusLabel = (status) => {
    return COPYRIGHT_STATUS_LABELS[status] || COPYRIGHT_STATUS_LABELS[COPYRIGHT_STATUS.UNKNOWN];
};

// File type validation
export const ALLOWED_FILE_TYPES = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx'];

export const isValidFileType = (file) => {
    return (
        ALLOWED_FILE_TYPES[file.type] ||
        ALLOWED_FILE_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
};

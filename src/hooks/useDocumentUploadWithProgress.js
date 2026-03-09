import { useState, useCallback, useEffect, useRef } from 'react';
import { uploadDocument, getDocumentStatus } from '../services/document.service';

/**
 * Backend status constants
 * BE returns: 'PROCESSING' | 'DONE' | 'FAILED'
 */
const BE_STATUS = {
    PROCESSING: 'PROCESSING',
    DONE: 'DONE',
    FAILED: 'FAILED',
};

/**
 * Client-side status constants
 * Used for UI rendering
 */
const CLIENT_STATUS = {
    IDLE: 'idle',
    UPLOADING: 'uploading',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error',
};

/**
 * Custom hook for handling document upload with progress tracking
 */
export const useDocumentUploadWithProgress = () => {
    const [uploadState, setUploadState] = useState({
        isUploading: false,
        documentId: null,
        fileName: null,
        status: CLIENT_STATUS.IDLE,
        progress: 0,
        totalPages: 0,
        error: null,
    });

    const pollingIntervalRef = useRef(null);

    // Poll document status
    const pollDocumentStatus = useCallback(async (documentId) => {
        try {
            const response = await getDocumentStatus(documentId);
            const { status, progress, totalPages } = response.data;

            // Map BE status to client status
            let mappedStatus = CLIENT_STATUS.PROCESSING;
            if (status === BE_STATUS.PROCESSING) {
                mappedStatus = CLIENT_STATUS.PROCESSING;
            } else if (status === BE_STATUS.DONE) {
                mappedStatus = CLIENT_STATUS.COMPLETED;
            } else if (status === BE_STATUS.FAILED) {
                mappedStatus = CLIENT_STATUS.ERROR;
            }

            setUploadState(prev => ({
                ...prev,
                status: mappedStatus,
                progress: progress || 0,
                totalPages: totalPages || 0,
            }));

            // Stop polling if completed or error
            if (mappedStatus === CLIENT_STATUS.COMPLETED || mappedStatus === CLIENT_STATUS.ERROR) {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }

                // Mark upload as finished after a short delay
                if (mappedStatus === CLIENT_STATUS.COMPLETED) {
                    setTimeout(() => {
                        setUploadState(prev => ({
                            ...prev,
                            isUploading: false,
                        }));
                    }, 2000);
                } else {
                    setUploadState(prev => ({
                        ...prev,
                        isUploading: false,
                        error: 'Có lỗi xảy ra khi xử lý tài liệu',
                    }));
                }
            }
        } catch (error) {
            console.error('Error polling document status:', error);
            // Continue polling even if there's an error
        }
    }, []);

    // Start upload
    const startUpload = useCallback(async (formData) => {
        try {
            setUploadState({
                isUploading: true,
                documentId: null,
                fileName: formData.file?.name || 'Tài liệu',
                status: CLIENT_STATUS.UPLOADING,
                progress: 0,
                totalPages: 0,
                error: null,
            });

            // Upload the document
            const response = await uploadDocument(formData);
            const documentId = response.document?._id || response._id;

            if (!documentId) {
                throw new Error('Không nhận được ID tài liệu từ server');
            }

            setUploadState(prev => ({
                ...prev,
                documentId,
                status: CLIENT_STATUS.PROCESSING,
                progress: 0,
            }));

            // Start polling for status
            pollingIntervalRef.current = setInterval(() => {
                pollDocumentStatus(documentId);
            }, 2000); // Poll every 2 seconds

            return { success: true, documentId };
        } catch (error) {
            setUploadState({
                isUploading: false,
                documentId: null,
                fileName: formData.file?.name || 'Tài liệu',
                status: CLIENT_STATUS.ERROR,
                progress: 0,
                totalPages: 0,
                error: error.message || 'Có lỗi xảy ra khi tải lên tài liệu',
            });

            return { success: false, error: error.message };
        }
    }, [pollDocumentStatus]);

    // Reset upload state
    const resetUpload = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        setUploadState({
            isUploading: false,
            documentId: null,
            fileName: null,
            status: CLIENT_STATUS.IDLE,
            progress: 0,
            totalPages: 0,
            error: null,
        });
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    return {
        uploadState,
        startUpload,
        resetUpload,
    };
};

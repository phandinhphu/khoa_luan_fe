import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as documentService from '@/services/document.service';
import { borrowDocument, returnDocument } from '@/services/borrow.service';

// ============== CLIENT HOOKS ==============

export const useAllDocuments = () => {
    return useQuery({
        queryKey: ['documents'],
        queryFn: () => documentService.getAllDocuments(),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
    });
}

export const useDocumentById = (documentId) => {
    return useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentService.getDocumentById(documentId),
        enabled: !!documentId,
        refetchOnWindowFocus: false,
        retry: false,
    });
}

export const useBorrowDocument = (documentId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => borrowDocument(documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['document', documentId] });
        },
    });
}

export const useReturnDocument = (documentId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => returnDocument(documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['document', documentId] });
        },
    });
}

// ============== ADMIN HOOKS ==============

/**
 * Hook to fetch all documents with pagination (Admin)
 */
export const useAllDocumentsAdmin = (page = 1, size = 10) => {
    return useQuery({
        queryKey: ['documents-admin', page, size],
        queryFn: () => documentService.getAllDocumentsAdmin(page, size),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        keepPreviousData: true,
    });
};

/**
 * Hook to upload new document (Admin)
 */
export const useUploadDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (documentData) => documentService.uploadDocument(documentData),
        onSuccess: () => {
            // Invalidate documents list to refetch
            queryClient.invalidateQueries({ queryKey: ['documents-admin'] });
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
};

/**
 * Hook to update document (Admin)
 */
export const useUpdateDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ documentId, documentData }) =>
            documentService.updateDocument(documentId, documentData),
        onSuccess: (data, variables) => {
            // Invalidate specific document and documents list
            queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] });
            queryClient.invalidateQueries({ queryKey: ['documents-admin'] });
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
};

/**
 * Hook to delete document (Admin)
 */
export const useDeleteDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (documentId) => documentService.deleteDocument(documentId),
        onSuccess: () => {
            // Invalidate documents list
            queryClient.invalidateQueries({ queryKey: ['documents-admin'] });
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as documentService from '@/services/document.service';
import { borrowDocument, returnDocument } from '@/services/borrow.service';

export const  useAllDocuments = () => {
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
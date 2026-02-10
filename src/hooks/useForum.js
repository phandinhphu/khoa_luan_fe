import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as forumService from '@/services/forum.service';

// ============== PUBLIC HOOKS ==============

/**
 * Hook to fetch all approved posts with pagination
 */
export const useForumPosts = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['forum-posts', page, limit],
        queryFn: () => forumService.getPosts(page, limit),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        keepPreviousData: true,
    });
};

/**
 * Hook to fetch a single post by ID
 */
export const useForumPost = (postId) => {
    return useQuery({
        queryKey: ['forum-post', postId],
        queryFn: () => forumService.getPostById(postId),
        enabled: !!postId,
        refetchOnWindowFocus: false,
        retry: false,
    });
};

/**
 * Hook to fetch comments for a post with pagination
 */
export const usePostComments = (postId, page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['forum-comments', postId, page, limit],
        queryFn: () => forumService.getPostComments(postId, page, limit),
        enabled: !!postId,
        refetchOnWindowFocus: false,
        retry: false,
        keepPreviousData: true,
    });
};

// ============== USER HOOKS ==============

/**
 * Hook to fetch all posts by current user
 */
export const useMyPosts = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['my-posts', page, limit],
        queryFn: () => forumService.getMyPosts(page, limit),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        keepPreviousData: true,
    });
};

/**
 * Hook to create a new post
 */
export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postData) => forumService.createPost(postData),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['my-posts'] });
            toast.success(response.message || 'Bài viết đã được tạo và đang chờ duyệt!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi tạo bài viết');
        },
    });
};

/**
 * Hook to update an existing post
 */
export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, postData }) => forumService.updatePost(postId, postData),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['forum-post', variables.postId] });
            queryClient.invalidateQueries({ queryKey: ['my-posts'] });
            toast.success(response.message || 'Đã cập nhật bài viết!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật bài viết');
        },
    });
};

/**
 * Hook to delete a post
 */
export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId) => forumService.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-posts'] });
            queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
            toast.success('Đã xóa bài viết thành công!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi xóa bài viết');
        },
    });
};

// ============== COMMENT HOOKS ==============

/**
 * Hook to create a comment on a post
 */
export const useCreateComment = (postId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (content) => forumService.createComment(postId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['forum-comments', postId] });
            toast.success('Đã thêm bình luận thành công!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi thêm bình luận');
        },
    });
};

/**
 * Hook to update a comment
 */
export const useUpdateComment = (postId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, content }) => forumService.updateComment(commentId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['forum-comments', postId] });
            toast.success('Đã cập nhật bình luận!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật bình luận');
        },
    });
};

/**
 * Hook to delete a comment
 */
export const useDeleteComment = (postId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId) => forumService.deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['forum-comments', postId] });
            toast.success('Đã xóa bình luận!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi xóa bình luận');
        },
    });
};

// ============== ADMIN HOOKS ==============

/**
 * Hook to fetch pending posts (Admin)
 */
export const usePendingPosts = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['pending-posts', page, limit],
        queryFn: () => forumService.getPendingPosts(page, limit),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        keepPreviousData: true,
    });
};

/**
 * Hook to fetch rejected posts (Admin)
 */
export const useRejectedPosts = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['rejected-posts', page, limit],
        queryFn: () => forumService.getRejectedPosts(page, limit),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        keepPreviousData: true,
    });
};

/**
 * Hook to fetch approved posts (Admin) - reuse public getPosts
 */
export const useApprovedPosts = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['approved-posts', page, limit],
        queryFn: () => forumService.getPosts(page, limit),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        keepPreviousData: true,
    });
};

/**
 * Hook to approve a post (Admin)
 */
export const useApprovePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId) => forumService.approvePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-posts'] });
            queryClient.invalidateQueries({ queryKey: ['approved-posts'] });
            queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
            toast.success('Đã duyệt bài viết!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi duyệt bài viết');
        },
    });
};

/**
 * Hook to reject a post (Admin)
 */
export const useRejectPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, reason }) => forumService.rejectPost(postId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rejected-posts'] });
            queryClient.invalidateQueries({ queryKey: ['pending-posts'] });
            toast.success('Đã từ chối bài viết!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi từ chối bài viết');
        },
    });
};

/**
 * Hook to delete any post (Admin)
 */
export const useDeletePostAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId) => forumService.deletePostAdmin(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approved-posts'] });
            queryClient.invalidateQueries({ queryKey: ['rejected-posts'] });
            queryClient.invalidateQueries({ queryKey: ['pending-posts'] });
            queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
            toast.success('Đã xóa bài viết!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi xóa bài viết');
        },
    });
};

/**
 * Hook to delete any comment (Admin)
 */
export const useDeleteCommentAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId) => forumService.deleteCommentAdmin(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['forum-comments'] });
            toast.success('Đã xóa bình luận!');
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi xóa bình luận');
        },
    });
};

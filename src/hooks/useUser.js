import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import * as userService from '@/services/user.service';
import Context from '@/contexts/Auth/Context';

/**
 * Hook to fetch all users with pagination (Admin)
 */
export const useAllUsers = (page = 1, size = 10) => {
    return useQuery({
        queryKey: ['users', page, size],
        queryFn: () => userService.getAllUsers(page, size),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        keepPreviousData: true, // Giữ data cũ khi chuyển trang
    });
};

/**
 * Hook to fetch user by ID (Admin)
 */
export const useUserById = (userId) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => userService.getUserById(userId),
        enabled: !!userId,
        refetchOnWindowFocus: false,
        retry: false,
    });
};

/**
 * Hook to fetch current user profile (Client)
 */
export const useProfile = () => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: () => userService.getProfile(),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
    });
};

/**
 * Hook to create new user (Admin)
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData) => userService.createUser(userData),
        onSuccess: () => {
            // Invalidate users list to refetch
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

/**
 * Hook to update user (Admin)
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, userData }) => userService.updateUser(userId, userData),
        onSuccess: (data, variables) => {
            // Invalidate specific user and users list
            queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

/**
 * Hook to update user role (Admin)
 */
export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }) => userService.updateUserRole(userId, role),
        onSuccess: (data, variables) => {
            // Invalidate specific user and users list
            queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

/**
 * Hook to delete user (Admin)
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId) => userService.deleteUser(userId),
        onSuccess: () => {
            // Invalidate users list
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

/**
 * Hook to update current user profile (Client)
 */
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { updateUser } = useContext(Context);

    return useMutation({
        mutationFn: (profileData) => userService.updateProfile(profileData),
        onSuccess: (response) => {
            // Invalidate profile to refetch
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            // Update user in context
            if (response.data && updateUser) {
                updateUser(response.data);
            }
        },
    });
};

/**
 * Hook to change password (Client)
 */
export const useChangePassword = () => {
    return useMutation({
        mutationFn: ({ currentPassword, newPassword }) =>
            userService.changePassword(currentPassword, newPassword),
    });
};

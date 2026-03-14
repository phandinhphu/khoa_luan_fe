import { useQuery } from '@tanstack/react-query';
import * as dashboardService from '@/services/dashboard.service';

export const useDashboardOverview = (days = 30) => {
    return useQuery({
        queryKey: ['dashboard-overview', days],
        queryFn: () => dashboardService.getDashboardOverview(days),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        placeholderData: (previousData) => previousData,
    });
};

export const useDashboardTimeline = (days = 30) => {
    return useQuery({
        queryKey: ['dashboard-timeline', days],
        queryFn: () => dashboardService.getDashboardTimeline(days),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        placeholderData: (previousData) => previousData,
    });
};

export const useTopDocuments = (days = 30, limit = 5) => {
    return useQuery({
        queryKey: ['dashboard-top-documents', days, limit],
        queryFn: () => dashboardService.getTopDocuments(days, limit),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
        placeholderData: (previousData) => previousData,
    });
};

export const useRecentActivities = (limit = 10) => {
    return useQuery({
        queryKey: ['dashboard-recent-activities', limit],
        queryFn: () => dashboardService.getRecentActivities(limit),
        enabled: true,
        refetchOnWindowFocus: false,
        retry: false,
    });
};
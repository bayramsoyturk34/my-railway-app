import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const sessionId = localStorage.getItem('sessionId');
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user", sessionId],
    queryFn: async () => {
      if (!sessionId) {
        return null;
      }
      
      try {
        const result = await apiRequest("/api/auth/user", "GET");
        return result;
      } catch (error: any) {
        if (error.message.includes('401')) {
          localStorage.removeItem('sessionId');
          return null;
        }
        throw error;
      }
    },
    enabled: !!sessionId,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes - longer cache
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  const isAuthenticated = !!user && !!sessionId;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch,
  };
}
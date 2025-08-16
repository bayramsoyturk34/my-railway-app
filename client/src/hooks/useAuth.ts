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
    staleTime: 1000 * 60 * 30, // 30 minutes - much longer cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchIntervalInBackground: false
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
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const sessionId = localStorage.getItem('sessionId');
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
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
    // Cookie tabanlı auth - her zaman dene
    enabled: true,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 dakika cache
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    refetchIntervalInBackground: false
  });

  // sessionId veya cookie ile authenticated
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch,
  };
}
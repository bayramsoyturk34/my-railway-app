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
    // Sadece sessionId varsa auth check et
    enabled: !!sessionId,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 dakika cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Mount'da otomatik fetch etme
    refetchInterval: false,
    refetchIntervalInBackground: false,
    throwOnError: false
  });

  // sessionId varsa ve user loaded ise authenticated
  const isAuthenticated = !!sessionId && !!user;

  return {
    user,
    isLoading: sessionId ? isLoading : false, // sessionId yoksa loading yok
    isAuthenticated,
    error,
    refetch,
  };
}
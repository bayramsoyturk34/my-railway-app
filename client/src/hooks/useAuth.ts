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
    // Cookie tabanlı auth - sessionId yoksa da dene
    enabled: true,
    retry: false,
    staleTime: 1000 * 30, // 30 saniye cache (kısa tutuldu)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    // 401 hatası geldiğinde hemen tamamla, loading'de kalmasın
    throwOnError: false
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
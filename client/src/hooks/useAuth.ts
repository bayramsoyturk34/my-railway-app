import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  // SessionId var mı kontrol et - yoksa query'yi çalıştırma
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const result = await apiRequest("/api/auth/user", "GET");
        return result;
      } catch (error: any) {
        if (error.message.includes('401')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!sessionId, // SessionId varsa query'yi çalıştır
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 dakika cache
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    throwOnError: false
  });

  // SessionId yoksa loading false olsun ki uygulama çalışabilsin
  const actualIsLoading = !!sessionId && isLoading;

  // user varsa authenticated
  const isAuthenticated = !!user;

  return {
    user,
    isLoading: actualIsLoading,
    isAuthenticated,
    error,
    refetch,
  };
}
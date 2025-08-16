import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  // Basit bir sessionId kontrolü - cookie'de varsa
  const sessionId = document.cookie
    .split('; ')
    .find(row => row.startsWith('session='))
    ?.split('=')[1];

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
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: !!sessionId, // Sadece sessionId varsa API çağrısı yap
    refetchInterval: false,
    refetchIntervalInBackground: false,
    throwOnError: false,
    enabled: !!sessionId // SessionId yoksa query'yi devre dışı bırak
  });

  // sessionId yoksa direkt false döner
  const isAuthenticated = sessionId ? !!user : false;

  return {
    user,
    isLoading: sessionId ? isLoading : false, // sessionId yoksa loading yok
    isAuthenticated,
    error,
    refetch,
  };
}
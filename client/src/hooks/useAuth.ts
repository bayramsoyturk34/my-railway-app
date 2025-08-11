import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const sessionId = localStorage.getItem('sessionId');
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user", sessionId], // Include sessionId in query key
    queryFn: async () => {
      console.log("🔍 useAuth: Starting auth check...");
      console.log("🔍 useAuth: Session ID:", sessionId);
      
      if (!sessionId) {
        console.log("❌ useAuth: No session ID found");
        return null;
      }
      
      try {
        const result = await apiRequest("/api/auth/user", "GET");
        console.log("✅ useAuth: Auth successful:", result?.email || 'Unknown user');
        return result;
      } catch (error: any) {
        console.log("❌ useAuth: Auth failed:", error.message);
        if (error.message.includes('401')) {
          localStorage.removeItem('sessionId'); // Clear invalid session
          return null;
        }
        throw error;
      }
    },
    enabled: !!sessionId, // Only run query if we have a sessionId
    retry: false,
    staleTime: 1000 * 60, // 1 minute - more frequent checks
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const isAuthenticated = !!user && !!sessionId;
  
  console.log("🔧 useAuth state:", { 
    hasSessionId: !!sessionId,
    hasUser: !!user, 
    isLoading, 
    isAuthenticated,
    userEmail: user?.email
  });

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch,
  };
}
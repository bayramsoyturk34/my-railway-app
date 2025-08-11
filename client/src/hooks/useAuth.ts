import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        console.log("useAuth: Making auth request...");
        const sessionId = localStorage.getItem('sessionId');
        console.log("useAuth: Session ID from localStorage:", sessionId);
        
        if (!sessionId) {
          console.log("useAuth: No session ID found, returning null");
          return null;
        }
        
        const result = await apiRequest("/api/auth/user", "GET");
        console.log("useAuth: Auth request successful:", result);
        return result;
      } catch (error: any) {
        console.log("useAuth: Auth request failed:", error.message);
        if (error.message.includes('401')) {
          return null; // Return null for unauthorized instead of throwing
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  console.log("useAuth debug:", { user, isLoading, isAuthenticated: !!user });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
  };
}
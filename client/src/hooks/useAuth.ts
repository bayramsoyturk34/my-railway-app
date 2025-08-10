import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0, // Disable stale time to always check auth status
    gcTime: 0, // Don't cache auth data
  });

  console.log("useAuth debug:", { user, isLoading, isAuthenticated: !!user });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
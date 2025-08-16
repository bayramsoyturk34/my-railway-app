import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Handle 401 Unauthorized - session expired
    if (res.status === 401) {
      // Cookie will be cleared by server, just redirect
      window.location.href = '/';
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<any> {
  const headers: Record<string, string> = {};
  
  // Add sessionId from localStorage as Authorization header for dev environment
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });



  // Check for errors first
  if (!res.ok) {

    await throwIfResNotOk(res);
    return;
  }

  // Handle successful responses

  
  // Handle 204 No Content
  if (res.status === 204) {

    return {};
  }
  
  // Try to parse JSON for other success statuses
  try {
    const jsonResponse = await res.json();

    return jsonResponse;
  } catch (parseError) {

    return {};
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const sessionId = localStorage.getItem('sessionId');
    const headers: Record<string, string> = {};
    

    
    if (sessionId) {
      headers["Authorization"] = `Bearer ${sessionId}`;

    }
    
    const res = await fetch(queryKey.join("") as string, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30, // 30 min
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

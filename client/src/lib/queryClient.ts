import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Handle 401 Unauthorized - session expired
    if (res.status === 401) {
      console.log('Session expired, clearing localStorage');
      localStorage.removeItem('sessionId');
      // Trigger a re-render by dispatching a storage event
      window.dispatchEvent(new Event('storage'));
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<any> {
  console.log(`API Request: ${method} ${url}`, data);
  
  const sessionId = localStorage.getItem('sessionId');
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log(`API Response: ${res.status} ${res.statusText}`, res);

  await throwIfResNotOk(res);
  
  // Parse JSON response if content-type indicates JSON
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const jsonResponse = await res.json();
    console.log(`API JSON Response:`, jsonResponse);
    return jsonResponse;
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const sessionId = localStorage.getItem('sessionId');
    const headers: Record<string, string> = {};
    
    console.log("Query fetch - Session ID from localStorage:", sessionId);
    
    if (sessionId) {
      headers["Authorization"] = `Bearer ${sessionId}`;
      console.log("Query fetch - Added Authorization header");
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

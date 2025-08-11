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

  console.log(`API Response: ${res.status} ${res.statusText}`);

  // Check for errors first
  if (!res.ok) {
    console.log("❌ Response not OK, throwing error");
    await throwIfResNotOk(res);
    return;
  }

  // Handle successful responses
  console.log("✅ Response OK, processing...");
  
  // Handle 204 No Content
  if (res.status === 204) {
    console.log("✅ No Content Success (204)");
    return {};
  }
  
  // Try to parse JSON for other success statuses
  try {
    const jsonResponse = await res.json();
    console.log(`✅ JSON Response Success:`, jsonResponse);
    return jsonResponse;
  } catch (parseError) {
    console.log("⚠️ Could not parse JSON, returning empty object");
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

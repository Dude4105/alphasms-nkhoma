// Global Fetch Interceptor for Silent Refresh Token Pattern

const originalFetch = window.fetch;

// Helper to decode JWT and check if it's expired or about to expire in the next 10 seconds
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    
    // Decode base64 URL safely
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    const exp = payload.exp;
    if (!exp) return false; // If no exp claim, assume valid
    
    // Check if expired or within 10 seconds of expiry
    return Date.now() >= (exp * 1000) - 10000;
  } catch (e) {
    return true; // Treat invalid tokens as expired
  }
}

// Queue / Promise to deduplicate concurrent refresh requests
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      console.log('[Auth Interceptor] Refreshing access token silently...');
      const res = await originalFetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          console.log('[Auth Interceptor] Token refreshed successfully.');
          refreshPromise = null;
          return data.accessToken;
        }
      }
      throw new Error('Failed to refresh token');
    } catch (err) {
      console.error('[Auth Interceptor] Silent refresh failed:', err);
      refreshPromise = null;
      
      // Clear user session
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // If user is inside a protected route, redirect to login
      const path = window.location.pathname;
      if (path.startsWith('/admin') || path.startsWith('/teacher')) {
        console.warn('[Auth Interceptor] Redirecting to login due to failed refresh.');
        window.location.href = '/login';
      }
      throw err;
    }
  })();

  return refreshPromise;
}

// Monkey-patch window.fetch
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const isBackendRequest = urlString.startsWith(apiUrl);

  // Skip interception for non-backend requests or auth endpoints
  if (!isBackendRequest || urlString.includes('/auth/login') || urlString.includes('/auth/refresh') || urlString.includes('/auth/forgot-password')) {
    // Make sure we still allow credentials for auth endpoints (e.g. to receive the cookie on login)
    const modifiedInit = { ...init };
    if (isBackendRequest) {
      modifiedInit.credentials = 'include';
    }
    return originalFetch(input, modifiedInit);
  }

  // Clone or initialize init options
  const options: RequestInit = { ...(init || {}) };
  options.credentials = 'include'; // Ensure cookies are sent for all backend requests

  let token = localStorage.getItem('accessToken');

  // 1. Silent Refresh BEFORE the request if token is expired
  if (token && isTokenExpired(token)) {
    try {
      token = await refreshAccessToken();
    } catch (e) {
      // If refresh failed, the refreshAccessToken function handles redirect/logout.
      // We return a mock unauthorized response to let the caller fail gracefully.
      return new Response(JSON.stringify({ message: 'Session expired' }), {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Inject or update Authorization header if token exists
  if (token) {
    if (!options.headers) {
      options.headers = {};
    }

    if (options.headers instanceof Headers) {
      options.headers.set('Authorization', `Bearer ${token}`);
    } else if (Array.isArray(options.headers)) {
      // Find and replace or push
      const authIdx = options.headers.findIndex(([k]) => k.toLowerCase() === 'authorization');
      if (authIdx > -1) {
        options.headers[authIdx] = ['Authorization', `Bearer ${token}`];
      } else {
        options.headers.push(['Authorization', `Bearer ${token}`]);
      }
    } else {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  // 2. Execute original request
  let response = await originalFetch(input, options);

  // 3. Fallback Interception: if request returns 401 Unauthorized, try to refresh and retry
  if (response.status === 401) {
    console.warn(`[Auth Interceptor] Received 401 from ${urlString}. Attempting refresh fallback...`);
    try {
      const newToken = await refreshAccessToken();
      
      // Update the Authorization header with the new token
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', `Bearer ${newToken}`);
        } else if (Array.isArray(options.headers)) {
          const authIdx = options.headers.findIndex(([k]) => k.toLowerCase() === 'authorization');
          if (authIdx > -1) {
            options.headers[authIdx] = ['Authorization', `Bearer ${newToken}`];
          } else {
            options.headers.push(['Authorization', `Bearer ${newToken}`]);
          }
        } else {
          options.headers['Authorization'] = `Bearer ${newToken}`;
        }
      }

      // Retry the original request
      console.log(`[Auth Interceptor] Retrying request to ${urlString}...`);
      response = await originalFetch(input, options);
    } catch (e) {
      // Handled by refreshAccessToken
    }
  }

  return response;
};

console.log('[Auth Interceptor] Global fetch interceptor installed.');

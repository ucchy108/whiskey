const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
    const error = new ApiRequestError(response.status, errorBody.error || 'Unknown error');

    const isSessionExpired = response.status === 401;
    const isAuthEndpoint = path.startsWith('/api/auth/');
    if (isSessionExpired && !isAuthEndpoint) {
      localStorage.removeItem('whiskey_user');
      window.location.href = '/login';
    }

    throw error;
  }

  if (response.status === 204) {
    // 204 No Content: void を返す API 向け。ジェネリック型のため型アサーションが必要
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return undefined as unknown as T;
  }

  return response.json();
}

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export interface ApiError {
  error: string;
  details?: unknown;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  let data: unknown = {};
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  }
  if (!res.ok) {
    const msg = (data as ApiError).error
      || (res.status === 401 ? 'Email ou senha incorretos' : 'Erro na requisição');
    const err = new Error(msg) as Error & { status: number; details?: unknown };
    err.status = res.status;
    err.details = (data as ApiError).details;
    throw err;
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

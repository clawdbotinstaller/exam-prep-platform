// Use relative URLs when served from same domain (Worker), absolute for local dev
export const API_URL = import.meta.env.VITE_API_URL || '';

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('session');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() } as HeadersInit,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() } as HeadersInit,
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

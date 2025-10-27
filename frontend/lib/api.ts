
const BASE_URL = "https://your-api-domain.com/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiCall<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

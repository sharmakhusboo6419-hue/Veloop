const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiBaseUrl = configuredApiUrl ? configuredApiUrl.replace(/\/$/, '') : '';

export const apiFetch = (path: string, init?: RequestInit) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return fetch(`${apiBaseUrl}${normalizedPath}`, init);
};

export async function readApiJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();

  if (!contentType.includes('application/json')) {
    throw new Error(
      configuredApiUrl
        ? `API returned a non-JSON response (${response.status}). Check VITE_API_URL and the backend deployment.`
        : 'API returned a non-JSON response. Set VITE_API_URL to the deployed backend URL.'
    );
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`API returned invalid JSON (${response.status}).`);
  }
}

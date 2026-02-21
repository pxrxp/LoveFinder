/**
 * Helper for making API calls.
 *
 * This adds the base URL and handles session cookies so
 * the server knows who is making the request.
 */
const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message: any = { error: res.statusText, statusCode: res.status };

    try {
      const text = await res.json();
      if (text) message = text;
    } catch { }

    const errorMsg = message.message
      ? `${message.statusCode}: ${message.error}\n${message.message}`
      : `${message.statusCode}: ${message.error}`;

    throw new Error(errorMsg);
  }

  return res;
};

const BACKEND_BASE_URL = 'http://192.168.1.70:3000/api/v1/'
// const BACKEND_BASE_URL = 'http://172.25.140.84:3000/api/v1/'

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`${BACKEND_BASE_URL}${endpoint}`);
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
    let message = res.statusText;

    try {
      const text = await res.text();
      if (text) message = text;
    } catch { }

    throw new Error(`HTTP ${res.status}: ${message}`);
  }

  return res;
};


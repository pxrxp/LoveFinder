const BACKEND_BASE_URL = 'http://192.168.1.70:3000/api/v1/'
// const BACKEND_BASE_URL = 'http://172.25.140.84:3000/api/v1/'

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const res = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  console.log(res);

  if (!res.ok) {
    throw new Error('Unauthorized');
  }

  return res;
}

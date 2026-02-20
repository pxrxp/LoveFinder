import { apiFetch } from "@/services/api";

export const login = async (email: string, password: string) => {
  return await apiFetch('auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
export const logout = async () => {
  return await apiFetch('auth/logout', {
    method: 'POST'
  });
}

/**
 * Login and Logout Network Requests.
 * 
 * These simple wrappers call our 'apiFetch' utility to hit the 
 * authentication endpoints on the backend server.
 */
import { apiFetch } from "@/services/api";

export const login = async (email: string, password: string) => {
  return await apiFetch("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};
export const logout = async () => {
  return await apiFetch("auth/logout", {
    method: "POST",
  });
};

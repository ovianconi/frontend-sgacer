// src/utils/auth.js
import { jwtDecode } from 'jwt-decode';

export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

// 🔐 NUEVO: Obtener roles del token
export const getUserRoles = () => {
  const token = getToken();
  if (!token) return [];

  try
  {
    const decoded = jwtDecode(token);
    // Ajusta según el nombre del campo en tu JWT
    const roles = decoded.roles || decoded.authorities || [];
    return Array.isArray(roles) ? roles : [roles];
  } catch (error)
  {
    console.error("Error decoding token:", error);
    return [];
  }
};

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  // 🔍 Detectar expiración o token inválido
  if (response.status === 401 || response.status === 403) {
    // Limpia token y redirige
    localStorage.removeItem("token");
    window.location.href = "/login?expired=true";
    return;
  }

  return response;
}

// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, vistasDisponibles }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // ✅ Chequear si la ruta actual está en las vistas asignadas al usuario
  const tieneAcceso = vistasDisponibles.some((v) => v.path === currentPath);

  if (!tieneAcceso) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return children;
}

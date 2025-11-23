// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import Equipos from "./pages/Equipos";
import MainLayout from "./layouts/MainLayout";
import Tratamientos from "./pages/Tratamientos";
import Paquetes from "./pages/Paquetes";
import Configuracion from "./pages/Configuracion";
import Usuarios from "./pages/Usuarios";
import Roles from "./pages/Roles";
import Personales from "./pages/Personales";
import Asignaciones from "./pages/Asignaciones";
import Sesiones from "./pages/Sesiones";
import Privacidad from "./pages/Privacidad";
import ErrorPage from "./pages/ErrorPage";

export default function App() {
  useEffect(() => {
    document.title = "SGACER";

    const link = document.querySelector("link[rel~='icon']");
    if (link)
    {
      link.href = "/favicon.png";
    } else
    {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.type = "image/png";
      newLink.href = "/favicon.png";
      document.head.appendChild(newLink);
    }
  }, []);
  return (
    <Router>
      <Routes>

        {/* 🔹 Redirección de "/" a "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login sin layout */}
        <Route path="/login" element={<Login />} />

        {/* Página de Política de Privacidad sin layout */}
        <Route path="/privacidad" element={<Privacidad />} />

        {/* Página de Error sin layout */}
        <Route path="/error" element={<ErrorPage />} />

        {/* Rutas protegidas con layout persistente */}
        <Route element={<MainLayout />}>
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/tratamientos" element={<Tratamientos />} />
          <Route path="/personales" element={<Personales />} />
          <Route path="/paquetes" element={<Paquetes />} />
          <Route path="/asignaciones" element={<Asignaciones />} />
          <Route path="/sesiones" element={<Sesiones />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/roles" element={<Roles />} />
        </Route>
        {/* 🔹 Ruta comodín para páginas no existentes */}
        <Route path="*" element={<Navigate to="/error" replace />} />
      </Routes>
    </Router>
  );
}

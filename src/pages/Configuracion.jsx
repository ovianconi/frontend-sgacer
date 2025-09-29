// src/pages/Configuracion.jsx
import { useState } from "react";
import Usuarios from "./Usuarios";
import Roles from "./Roles";
import PageTitle from "../components/PageTitle";
import KeyIcon from '@mui/icons-material/Key';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PageviewIcon from '@mui/icons-material/Pageview';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import RolVistas from "./RolVistas";
import Vistas from "./Vistas";

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState("usuarios");

  return (
    <div className="p-2">
      <PageTitle>Configuración del sistema</PageTitle>
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("usuarios")}
          className={`px-4 py-2 -mb-px font-semibold ${activeTab === "usuarios" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
        >
          <PersonAddIcon color="primary" /> Usuarios
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2 -mb-px font-semibold ${activeTab === "roles" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"
            }`}
        >
          <KeyIcon color="primary" /> Roles
        </button>
        <button
          onClick={() => setActiveTab("vistas")}
          className={`px-4 py-2 -mb-px font-semibold ${activeTab === "vistas" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
        >
          <PageviewIcon color="primary" /> Vistas
        </button>
        <button
          onClick={() => setActiveTab("rolvistas")}
          className={`px-4 py-2 -mb-px font-semibold ${activeTab === "rolvistas" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
        >
          <ContactPageIcon color="primary" /> Rol Vista
        </button>
      </div>

      {/* Contenido de la pestaña */}
      {activeTab === "usuarios" && <Usuarios />}
      {activeTab === "roles" && <Roles />}
      {activeTab === "vistas" && <Vistas />}
      {activeTab === "rolvistas" && <RolVistas />}
    </div>
  );
}

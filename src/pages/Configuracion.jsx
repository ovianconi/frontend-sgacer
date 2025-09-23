// src/pages/Configuracion.jsx
import { useState } from "react";
import Usuarios from "./Usuarios";
import Roles from "./Roles";
import PageTitle from "../components/PageTitle";
import KeyIcon from '@mui/icons-material/Key';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState("usuarios");

  return (
    <div className="p-6">
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
      </div>

      {/* Contenido de la pestaña */}
      {activeTab === "usuarios" ? <Usuarios /> : <Roles />}
    </div>
  );
}

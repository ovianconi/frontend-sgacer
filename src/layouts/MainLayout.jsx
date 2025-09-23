// src/layouts/MainLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { removeToken, getToken } from "../utils/auth";
import { useEffect, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ConstructionIcon from '@mui/icons-material/Construction';
import PersonIcon from '@mui/icons-material/Person';
import VaccinesIcon from '@mui/icons-material/Vaccines';

export default function MainLayout() {
  const navigate = useNavigate();
  const token = getToken();
  const [collapsed, setCollapsed] = useState(true); // Nuevo estado

  useEffect(() => {
    if (!token)
    {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 bg-white shadow-md ${collapsed ? 'w-16' : 'w-64'
          }`}
      >
        {/* Botón para minimizar/maximizar */}
        <div className="flex justify-start p-2 rounded hover:bg-gray-200" >
          <button onClick={toggleSidebar} className="text-blue-500 hover:text-blue-700">
            <MenuIcon />
          </button>
        </div>


        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-2 rounded hover:bg-gray-200"
          >
            <DashboardIcon color="primary" />
            {!collapsed && <span className="ml-2">Dashboard</span>}
          </Link>
          <Link
            to="/clientes"
            className="flex items-center px-4 py-2 rounded hover:bg-gray-200"
          >
            <PeopleIcon color="primary" />
            {!collapsed && <span className="ml-2">Clientes</span>}
          </Link>
          <Link
            to="/equipos"
            className="flex items-center px-4 py-2 rounded hover:bg-gray-200"
          >
            <ConstructionIcon color="primary" />
            {!collapsed && <span className="ml-2">Equipos</span>}
          </Link>
          <Link
            to="/tratamientos"
            className="flex items-center px-4 py-2 rounded hover:bg-gray-200"
          >
            <VaccinesIcon color="primary" />
            {!collapsed && <span className="ml-2">Tratamientos</span>}
          </Link>
          <Link
            to="/personales"
            className="flex items-center px-4 py-2 rounded hover:bg-gray-200"
          >
            <PersonIcon color="primary" />
            {!collapsed && <span className="ml-2">Personales</span>}
          </Link>
          <Link
            to="/paquetes"
            className="flex items-center px-4 py-2 rounded hover:bg-gray-200"
          >
            <InventoryIcon color="primary" />
            {!collapsed && <span className="ml-2">Paquetes</span>}
          </Link>
          <Link
            to="/configuracion"
            className="flex items-center px-4 py-2 rounded hover:bg-gray-200"
          >
            <SettingsIcon color="primary" />
            {!collapsed && <span className="ml-2">Configuración</span>}
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white p-4 shadow">
          <h1 className="text-2xl font-bold">Sistema de Agendamiento</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Outlet, Link, useNavigate } from "react-router-dom";
import { removeToken, getToken } from "../utils/auth";
import { useEffect, useState } from "react";
import * as MuiIcons from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal"; // Importamos el modal
import { apiFetch } from "../utils/api";

export default function MainLayout() {
  const navigate = useNavigate();
  const token = getToken();
  const [collapsed, setCollapsed] = useState(true);
  const [vistas, setVistas] = useState([]);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false); // Estado para el modal de confirmación de cierre

  useEffect(() => {
    if (!token)
    {
      navigate("/login");
    } else
    {
      fetch("http://localhost:8080/api/vistas/disponibles", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("No se pudieron cargar las vistas");
          return res.json();
        })
        .then((data) => setVistas(data))
        .catch((err) => {
          console.error("Error cargando vistas disponibles:", err);
          setVistas([]);
        });
    }
  }, [token, navigate]);

  const handleLogout = () => {
    // Mostramos el modal de confirmación antes de hacer logout
    setShowConfirmLogout(true);
  };

  const confirmLogout = () => {
    removeToken();
    navigate("/login");
    setShowConfirmLogout(false); // Cerramos el modal después de confirmar
  };

  const cancelLogout = () => {
    setShowConfirmLogout(false); // Simplemente cerramos el modal sin hacer nada
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 bg-white shadow-md flex flex-col ${collapsed ? "w-16" : "w-64"}`}
      >
        <a
          onClick={toggleSidebar}
          className="flex items-center px-4 py-2 rounded hover:bg-gray-200 cursor-pointer hover:text-blue-500 text-gray-800"
        >
          {collapsed ? (
            <MenuIcon color="primary" />
          ) : (
            <MenuOpenIcon color="primary" />
          )}
        </a>

        {/* Menú dinámico */}
        <nav className="flex-1 overflow-y-auto space-y-2">
          {vistas.length > 0 ? (
            vistas.map((vista) => {
              const IconComponent = MuiIcons[vista.icono] || MuiIcons["Menu"];
              return (
                <Link
                  key={vista.id}
                  to={vista.path}
                  className="flex items-center px-4 py-2 rounded hover:bg-gray-200"
                >
                  <IconComponent color="primary" />
                  {!collapsed && <span className="ml-2">{vista.nombre}</span>}
                </Link>
              );
            })
          ) : (
            <p className="text-gray-500 text-center p-4 text-sm">
              No tienes permisos para ver secciones
            </p>
          )}
        </nav>

        <a
          onClick={handleLogout}
          className="flex items-center px-4 py-2 rounded hover:bg-gray-200 cursor-pointer hover:text-blue-500 text-gray-800"
        >
          <LogoutIcon color="primary" />
          {!collapsed && <span className="ml-2">Cerrar sesión</span>}
        </a>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 min-w-0">
          {/* ✅ Pasamos vistas como prop al outlet */}
          <Outlet context={{ vistasDisponibles: vistas }} />
        </main>
      </div>

      {/* Modal de Confirmación de Cierre de Sesión */}
      <ConfirmLogoutModal
        open={showConfirmLogout}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { TextField, InputAdornment } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import { API_BASE } from "../utils/apiBase";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [currentDate, setCurrentDate] = useState({ day: "31", month: "NOV" });
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Función para obtener el nombre del mes en español
  const getMonthName = (month) => {
    const months = [
      'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
      'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
    ];
    return months[month];
  };

  // 🔹 Actualizar fecha actual
  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();

    setCurrentDate({
      day: day < 10 ? `0${day}` : day.toString(),
      month: getMonthName(month)
    });
  }, []);

  // 🔹 Detectar si venimos por sesión expirada
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired") === "true")
    {
      setToast("Tu sesión expiró. Iniciá sesión nuevamente.");
    }
  }, [location]);

  // 🔹 Autoocultar toast
  useEffect(() => {
    if (toast)
    {
      const timer = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try
    {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error("Credenciales inválidas");

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/sesiones");
    } catch (err)
    {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-screen flex">
      {/* 🔹 Sección izquierda (azul) - un poco más ancha */}
      <div className="relative flex-[0.3] flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md z-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Iniciar sesión
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <TextField
              variant="outlined"
              label="Usuario"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  )
                }
              }}
            />

            {/* Contraseña */}
            <TextField
              variant="outlined"
              label="Contraseña"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon />
                    </InputAdornment>
                  )
                }
              }}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Entrar
            </button>
          </form>
        </div>

        {/* 🔹 Enlace discreto a la Política de Privacidad */}
        <div className="absolute bottom-4 right-6 text-right">
          <Link
            to="/privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 text-xs hover:text-white transition-colors"
          >
            Política de Privacidad
          </Link>
        </div>

        {/* Toast de sesión expirada */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            {toast}
          </div>
        )}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.4s ease-out;
          }
        `}</style>
      </div>

      {/* 🔹 Sección derecha (blanca) - un poco más fina */}
      <div className="flex-[0.7] flex items-center justify-center bg-white p-8">
        <div className="logo-container">
          <div className="logo">
            <div className="logo-inner">
              <div className="symbol">
                <div className="calendar-icon">
                  <div className="calendar-top">
                    <div className="calendar-month">{currentDate.month}</div>
                  </div>
                  <div className="calendar-day">{currentDate.day}</div>
                  <div className="calendar-lines">
                    <div className="line"></div>
                    <div className="line short"></div>
                  </div>
                </div>
              </div>
              <div className="name">
                <div className="acronym">SGACER</div>
                <div className="full-name">
                  Sistema de Gestión de Agendamientos para Clínicas de Estética y Rehabilitación
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estilos del logo */}
        <style>{`
          .logo-container {
            position: relative;
            width: 100%;
            max-width: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .logo {
            position: relative;
            width: 300px;
            height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(145deg, #ffffff, #e6e9ef);
            border-radius: 30px;
            box-shadow: 0 15px 35px rgba(0, 82, 155, 0.15);
            overflow: hidden;
          }
          .logo::before {
            content: '';
            position: absolute;
            width: 150%;
            height: 150%;
            background: conic-gradient(
                transparent, transparent, transparent, 
                #0078D7, #005A9E, #003D75,
                transparent, transparent, transparent
            );
            animation: rotate 10s linear infinite;
          }
          .logo-inner {
            position: absolute;
            inset: 5px;
            background: white;
            border-radius: 25px;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
          }
          .symbol {
            width: 100px;
            height: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
          }
          .calendar-icon {
            position: relative;
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #0078D7, #005A9E);
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 88, 166, 0.2);
            overflow: hidden;
          }
          .calendar-top {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 20px;
            background: #003D75;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .calendar-month {
            color: gray;
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .calendar-notch {
            width: 12px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            margin: 0 2px;
          }
          .calendar-day {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            font-weight: 700;
            color: white;
            text-align: center;
          }
          .calendar-lines {
            position: absolute;
            bottom: 8px;
            left: 10px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .line {
            height: 2px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 1px;
          }
          .line.short {
            width: 60%;
          }
          .name {
            text-align: center;
            margin-top: 10px;
          }
          .acronym {
            font-size: 32px;
            font-weight: 700;
            color: #005A9E;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          .full-name {
            font-size: 14px;
            color: #5A7D9E;
            font-weight: 500;
            letter-spacing: 0.5px;
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
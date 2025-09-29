import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try
    {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok)
      {
        throw new Error("Credenciales inválidas");
      }

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
      {/* Sección izquierda con formulario */}
      <div className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Iniciar Sesión
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      </div>

      {/* Sección derecha con el logo SGACER */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="logo-container">
          <div className="logo">
            <div className="logo-inner">
              <div className="symbol">
                <div className="calendar-icon">
                  <div className="calendar-top">
                    <div className="calendar-notch"></div>
                    <div className="calendar-notch"></div>
                  </div>
                  <div className="calendar-day">31</div>
                  <div className="calendar-lines">
                    <div className="line"></div>
                    <div className="line short"></div>
                  </div>
                </div>
              </div>
              <div className="name">
                <div className="acronym">SGACER</div>
                <div className="full-name">Sistema de Gestión de Agendamientos para Clínicas de Estética y Rehabilitación</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estilos integrados para el logo */}
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
          
          .calendar-notch {
            width: 12px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            margin: 0 2px;
          }
          
          .calendar-day {
            position: absolute;
            top: 25px;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 28px;
            font-weight: 600;
            color: #0078D7;
          }
          
          .calendar-lines {
            position: absolute;
            bottom: 10px;
            left: 10px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .line {
            height: 3px;
            background: rgba(0, 88, 166, 0.15);
            border-radius: 2px;
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
          
          .tagline {
            font-size: 12px;
            color: #7D95B0;
            margin-top: 8px;
            font-weight: 400;
          }
          
          @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
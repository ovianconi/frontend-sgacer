import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { es } from "date-fns/locale";
import PageTitle from "../components/PageTitle";

// Configuración del localizer con date-fns
const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function Dashboard() {

  const [stats, setStats] = useState({
    clientes: 0,
    paquetes: 0,
  });

  const token = getToken();

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8080/api/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch("http://localhost:8080/api/paquetes", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([clientes, paquetes]) => {
        setStats({
          clientes: clientes.length,
          paquetes: paquetes.length,
        });
      })
      .catch(console.error);
  }, [token]);


  const [tab, setTab] = useState("calendar");

  // 📊 Datos en duro para los gráficos
  const dataSesiones = [
    { mes: "Ene", sesiones: 20 },
    { mes: "Feb", sesiones: 35 },
    { mes: "Mar", sesiones: 25 },
    { mes: "Abr", sesiones: 40 },
  ];

  // 📅 Datos en duro para el calendario
  const eventos = [
    {
      title: "Sesión Facial - Cliente Raquel",
      start: new Date(2025, 8, 15, 10, 0),
      end: new Date(2025, 8, 15, 11, 0),
    },
    {
      title: "Sesión Masajes - Cliente María",
      start: new Date(2025, 8, 16, 14, 0),
      end: new Date(2025, 8, 16, 15, 0),
    },
    {
      title: "Sesión Radio Frecuencia - Cliente Lisa",
      start: new Date(2025, 8, 16, 16, 0),
      end: new Date(2025, 8, 16, 17, 0),
    },
  ];
  const [fechaCalendario, setFechaCalendario] = useState(new Date(2025, 8, 1)); //1 setiembre
  const [vistaCalendario, setVistaCalendario] = useState("month"); // valores: "month", "week", "day"
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const manejarClickEvento = (evento) => {
    setEventoSeleccionado(evento);
  };
  const manejarClickEnDia = (slotInfo) => {
    setFechaCalendario(slotInfo.start); // slotInfo.start es el día clicado
    setVistaCalendario("day");
  };


  return (
    <div className="p-2">
      <PageTitle>Dashboard</PageTitle>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setTab("calendar")}
          className={`px-4 py-2 -mb-px font-semibold ${tab === "calendar"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500"
            }`}
        >
          📅 Calendario
        </button>
        <button
          onClick={() => setTab("stats")}
          className={`px-4 py-2 -mb-px font-semibold ${tab === "stats"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500"
            }`}
        >
          📊 Estadísticas
        </button>
      </div>

      {/* Contenido de pestañas */}
      {tab === "calendar" && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Calendario de sesiones</h3>

          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            date={fechaCalendario}
            onNavigate={(nuevaFecha) => setFechaCalendario(nuevaFecha)}
            view={vistaCalendario} // 👈 vista controlada
            onView={(nuevaVista) => setVistaCalendario(nuevaVista)} // para que los botones del calendario también funcionen
            onSelectEvent={manejarClickEvento}
            onSelectSlot={manejarClickEnDia}
            messages={{
              next: "Sig.",
              previous: "Ant.",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
            }}
          />
        </div>
      )}
      {tab === "stats" && (
        <div>
          {/* Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-gray-500 text-sm">Clientes</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.clientes}</p>
            </div>
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-gray-500 text-sm">Paquetes</h3>
              <p className="text-3xl font-bold text-green-600">{stats.paquetes}</p>
            </div>
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-gray-500 text-sm">Sesiones</h3>
              <p className="text-3xl font-bold text-purple-600">87</p>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Sesiones por mes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataSesiones}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sesiones" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {eventoSeleccionado && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setEventoSeleccionado(null)} // cerrar al hacer clic fuera
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()} // evitar que clic dentro cierre el modal
          >
            <button
              onClick={() => setEventoSeleccionado(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              Detalles del evento
            </h2>
            <p><strong>Título:</strong> {eventoSeleccionado.title}</p>
            <p>
              <strong>Inicio:</strong>{" "}
              {format(eventoSeleccionado.start, "dd/MM/yyyy HH:mm")}
            </p>
            <p>
              <strong>Fin:</strong>{" "}
              {format(eventoSeleccionado.end, "dd/MM/yyyy HH:mm")}
            </p>
            {/* Aquí puedes mostrar más datos si el evento tiene otras propiedades */}
          </div>
        </div>
      )}
    </div>
  );
}
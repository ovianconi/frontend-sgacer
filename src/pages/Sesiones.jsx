// src/pages/Sesiones.jsx
import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format as dfnsFormat, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import PageTitle from "../components/PageTitle";

const locales = { es };

const format = (date, formatStr) => dfnsFormat(date, formatStr, { locale: es });

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function Sesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const token = getToken();

  const loadSesiones = async () => {
    try
    {
      const res = await fetch("http://localhost:8080/api/sesiones", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar sesiones");

      const data = await res.json();
      const events = data.map((s) => ({
        id: s.id,
        title: `${s.tratamiento?.nombre} - ${s.clientePaquete?.cliente?.nombre ?? ""
          } ${s.clientePaquete?.cliente?.apellido ?? ""} (${s.estado})`,
        start: new Date(`${s.fecha}T${s.horaInicio}`),
        end: new Date(`${s.fecha}T${s.horaFin}`),
        resource: s,
      }));

      setSesiones(events);
    } catch (err)
    {
      console.error(err);
      toast.error("No se pudieron cargar las sesiones");
    }
  };

  useEffect(() => {
    loadSesiones();
    const interval = setInterval(loadSesiones, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedSesion(event.resource);
    setModalOpen(true);
  };

  const handleCancelarSesion = async () => {
    if (!selectedSesion) return;
    setLoadingCancel(true);
    try
    {
      const res = await fetch(
        `http://localhost:8080/api/sesiones/${selectedSesion.id}/cancelar`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok)
      {
        let message = "No se pudo cancelar la sesión";
        try
        {
          const errorData = await res.json();
          if (errorData?.message) message = errorData.message;
        } catch (_) { }
        throw new Error(message);
      }

      toast.success("Sesión cancelada correctamente");
      setConfirmModalOpen(false);
      setModalOpen(false);
      await loadSesiones(); // 🔄 Refresca eventos para actualizar color y estado
    } catch (err)
    {
      console.error("Error de red al cancelar:", err);
      toast.error(err.message || "Error de red al cancelar la sesión");
      setConfirmModalOpen(false);
    } finally
    {
      setLoadingCancel(false);
    }
  };

  const handleMarcarUsada = async () => {
    if (!selectedSesion) return;
    try
    {
      const res = await fetch(
        `http://localhost:8080/api/sesiones/${selectedSesion.id}/usar`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok)
      {
        let message = "No se pudo marcar como usada";
        try
        {
          const errorData = await res.json();
          if (errorData?.message) message = errorData.message;
        } catch (_) { }
        throw new Error(message);
      }

      toast.success("Sesión marcada como usada correctamente");
      setModalOpen(false);
      await loadSesiones(); // 🔄 Refrescar calendario
    } catch (err)
    {
      console.error("Error al marcar como usada:", err);
      toast.error(err.message || "Error de red");
    }
  };

  const eventPropGetter = (event) => {
    const estado = event.resource?.estado;
    let backgroundColor = "#9ca3af";

    if (estado === "PENDIENTE") backgroundColor = "#1976D2";
    if (estado === "USADA") backgroundColor = "#22c55e";
    if (estado === "CANCELADA") backgroundColor = "#ef4444";
    if (estado === "PERDIDA") backgroundColor = "#6b7280";

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "8px",
        border: "none",
        padding: "4px",
        fontWeight: "bold",
      },
    };
  };

  return (
    <div className="p-2 ">
      <div className="flex justify-between items-center mb-2">
        <PageTitle>Calendario de Sesiones</PageTitle>
        {/* 🔄 Botón de refresco manual 
        <a
          onClick={loadSesiones}
          className="flex items-center px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-500 hover:text-white"
        >
          <SyncIcon className="hover:bg-blue-500 hover:text-white" />
          <span className="ml-2">Refrescar</span>
        </a> */}
      </div>

      <Calendar
        localizer={localizer}
        events={sesiones}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700, zIndex: 0 }}
        views={["month", "week", "day", "agenda"]}
        defaultView="month"
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        eventPropGetter={eventPropGetter}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
        }}
        onSelectEvent={handleSelectEvent}
      />
      {modalOpen && selectedSesion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Detalle de Sesión</h2>
            <p>
              <strong>Tratamiento:</strong> {selectedSesion.tratamiento?.nombre}
            </p>
            <p>
              <strong>Cliente:</strong>{" "}
              {selectedSesion.clientePaquete?.cliente?.nombre}{" "}
              {selectedSesion.clientePaquete?.cliente?.apellido}
            </p>
            <p>
              <strong>Fecha:</strong> {selectedSesion.fecha}
            </p>
            <p>
              <strong>Hora:</strong> {selectedSesion.horaInicio} -{" "}
              {selectedSesion.horaFin}
            </p>
            <p>
              <strong>Estado:</strong> {selectedSesion.estado}
            </p>

            <div className="flex justify-end gap-2 mt-4">
              {selectedSesion.estado === "PENDIENTE" && (
                <>
                  <button
                    onClick={handleMarcarUsada}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Marcar como usada
                  </button>
                  <button
                    onClick={() => setConfirmModalOpen(true)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Cancelar sesión
                  </button>
                </>
              )}
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-[350px] shadow-lg relative">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Confirmar Cancelación
            </h2>
            <p>¿Estás seguro de que quieres cancelar esta sesión?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                No
              </button>
              <button
                onClick={handleCancelarSesion}
                disabled={loadingCancel}
                className={`bg-red-600 text-white px-3 py-1 rounded ${loadingCancel ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {loadingCancel ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

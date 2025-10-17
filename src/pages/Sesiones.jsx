import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format as dfnsFormat, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import PageTitle from "../components/PageTitle";
import SesionFormModal from "../components/SesionFormModal";
import SyncIcon from '@mui/icons-material/Sync';
import { apiFetch } from "../utils/api";

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

  // ✅ Estado correcto para el modal de creación (objeto con open/date/time)
  const [formModal, setFormModal] = useState({ open: false, date: null, time: null });

  const token = getToken();

  const loadSesiones = async () => {
    try
    {
      const res = await apiFetch("http://localhost:8080/api/sesiones", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar sesiones");

      const data = await res.json();
      const events = data.map((s) => ({
        id: s.id,
        title: `${s.tratamiento?.nombre} - ${s.clientePaquete?.cliente?.nombre ?? ""} ${s.clientePaquete?.cliente?.apellido ?? ""
          } (${s.estado})`,
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
      const res = await apiFetch(
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
      await loadSesiones();
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
      const res = await apiFetch(
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
      await loadSesiones();
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

  // Helper para obtener strings fecha/hora desde un Date
  const toDateStr = (d) => d.toISOString().slice(0, 10);       // YYYY-MM-DD
  const toTimeStr = (d) => d.toTimeString().slice(0, 5);        // HH:mm

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <PageTitle>Calendario de Sesiones</PageTitle>
        {/* 🔄 Botón de refresco manual 
        <a
          onClick={loadSesiones}
          className="flex items-center px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-500 hover:text-white"
        >
          <SyncIcon className="hover:bg-blue-500 hover:text-white" />
          <span className="ml-2">Refrescar</span>
        </a>*/}
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
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={(slotInfo) => {
          const start = slotInfo.start;
          const isMonth = view === "month";

          // Formatear fecha y hora correctamente
          const toDateStr = (d) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"
          const toTimeStr = (d) => d.toTimeString().slice(0, 5); // "HH:mm"

          const dateStr = toDateStr(start);
          const timeStr = isMonth ? "08:00" : toTimeStr(start); // En vista mensual no hay hora real

          setFormModal({
            open: true,
            date: dateStr,
            time: timeStr,
          });
        }}
        // Fallback por si tu versión de RBC no dispara onSelectSlot con un solo clic en vista "month"
        onDrillDown={(clickedDate) => {
          if (view === "month")
          {
            const dateStr = clickedDate.toISOString().slice(0, 10);
            setFormModal({ open: true, date: dateStr, time: "08:00" });
            // Si preferís NO navegar a la vista día, podés controlar la navegación con onView/onNavigate.
          }
        }}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
        }}
      />


      {/* Modal detalle sesión */}
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
              <strong>Hora:</strong> {selectedSesion.horaInicio} - {selectedSesion.horaFin}
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

      {/* Modal confirmación cancelar */}
      {confirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-[350px] shadow-lg relative">
            <h2 className="text-lg font-bold mb-4 text-red-600">Confirmar Cancelación</h2>
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

      {/* Modal para crear nueva sesión */}
      {/* Modal para crear nueva sesión */}
      {formModal.open && (
        <SesionFormModal
          isOpen={formModal.open}
          key={`${formModal.date}-${formModal.time}`} // 👈 Fuerza remount al cambiar fecha/hora
          initialDate={formModal.date}               // "YYYY-MM-DD"
          initialTime={formModal.time}               // "HH:mm"
          onClose={() => setFormModal({ open: false, date: null, time: null })}
          onCreated={loadSesiones}
        />
      )}
    </div>
  );
}

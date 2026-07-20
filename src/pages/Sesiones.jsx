import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format as dfnsFormat, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import PageTitle from "../components/PageTitle";
import SesionFormModal from "../components/SesionFormModal";
import SyncIcon from "@mui/icons-material/Sync";
import { apiFetch } from "../utils/api";
import { API_BASE } from "../utils/apiBase";
import Select from "react-select";

const locales = { es };

const format = (date, formatStr) =>
  dfnsFormat(date, formatStr, { locale: es });

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

  // Modal de creación
  const [formModal, setFormModal] = useState({
    open: false,
    date: null,
    time: null,
  });

  // Filtros aplicados actualmente
  const [filters, setFilters] = useState({
    clienteId: null,
    tratamientoId: null,
    estado: null,
  });

  // Filtros en edición dentro del modal
  const [tempFilters, setTempFilters] = useState({
    clienteId: null,
    tratamientoId: null,
    estado: null,
  });

  // Datos para los combos
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);

  const token = getToken();

  // ==========================
  //   CARGA DE SESIONES
  // ==========================
  const loadSesiones = async (overrideFilters) => {
    try
    {
      const effectiveFilters = overrideFilters || filters;

      const res = await apiFetch(`${API_BASE}/sesiones`, {
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

      // 🔍 Filtro combinado en frontend (cliente + tratamiento + estado)
      const filtered = events.filter((e) => {
        const cId = e.resource.clientePaquete?.cliente?.id;
        const tId = e.resource.tratamiento?.id;
        const estado = e.resource.estado;

        const okCliente = effectiveFilters.clienteId
          ? Number(cId) === Number(effectiveFilters.clienteId)
          : true;

        const okTratamiento = effectiveFilters.tratamientoId
          ? Number(tId) === Number(effectiveFilters.tratamientoId)
          : true;

        const okEstado = effectiveFilters.estado
          ? estado === effectiveFilters.estado
          : true;

        return okCliente && okTratamiento && okEstado;
      });

      setSesiones(filtered);
    } catch (err)
    {
      console.error(err);
      toast.error("No se pudieron cargar las sesiones");
    }
  };

  useEffect(() => {
    loadSesiones();
    const interval = setInterval(() => loadSesiones(), 300000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================
  //   CARGA DE CLIENTES / TRATAMIENTOS
  // ==========================
  const loadClientes = async () => {
    try
    {
      const res = await apiFetch(`${API_BASE}/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClientes(data);
    } catch (err)
    {
      console.error(err);
      toast.error("No se pudieron cargar los clientes");
    }
  };

  const loadTratamientos = async () => {
    try
    {
      const res = await apiFetch(`${API_BASE}/tratamientos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar tratamientos");
      const data = await res.json();
      setTratamientos(data);
    } catch (err)
    {
      console.error(err);
      toast.error("No se pudieron cargar los tratamientos");
    }
  };

  // ==========================
  //   HANDLERS SESIÓN
  // ==========================
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
        `${API_BASE}/sesiones/${selectedSesion.id}/cancelar`,
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
        `${API_BASE}/sesiones/${selectedSesion.id}/usar`,
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

  // ==========================
  //   COLORES DEL CALENDARIO
  // ==========================
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

  // Helpers fecha/hora
  const toDateStr = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
  const toTimeStr = (d) => d.toTimeString().slice(0, 5); // HH:mm

  // ==========================
  //   OPCIONES REACT-SELECT
  // ==========================
  const clienteOptions = clientes.map((c) => ({
    value: c.id,
    label: `${c.nombre} ${c.apellido} | ${c.documento}`,
  }));

  const tratamientoOptions = tratamientos.map((t) => ({
    value: t.id,
    label: t.nombre,
  }));

  const estadoOptions = [
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "USADA", label: "Usada" },
    { value: "CANCELADA", label: "Cancelada" },
    { value: "PERDIDA", label: "Perdida" },
  ];

  // ==========================
  //   RENDER
  // ==========================
  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <PageTitle>Calendario de Agendamientos</PageTitle>

        {/* Filtros activos */}
        {(filters.clienteId || filters.tratamientoId || filters.estado) && (
          <div className="mt-2 mb-2 p-2  text-purple-800 rounded-lg text-sm flex items-center gap-2 flex-wrap shadow-sm">
            <span className="font-semibold">Filtros activos:</span>

            {filters.clienteId && (
              <span className="px-2 py-1 bg-white border border-purple-300 rounded">
                Cliente: {
                  clienteOptions.find(c => Number(c.value) === Number(filters.clienteId))?.label
                }
              </span>
            )}

            {filters.tratamientoId && (
              <span className="px-2 py-1 bg-white border border-purple-300 rounded">
                Tratamiento: {
                  tratamientoOptions.find(t => Number(t.value) === Number(filters.tratamientoId))?.label
                }
              </span>
            )}

            {filters.estado && (
              <span className="px-2 py-1 bg-white border border-purple-300 rounded">
                Estado: {
                  estadoOptions.find(e => e.value === filters.estado)?.label
                }
              </span>
            )}

            {/* Botón para limpiar filtros */}
            <button
              onClick={() => {
                const cleared = { clienteId: null, tratamientoId: null, estado: null };
                setFilters(cleared);
                loadSesiones(cleared);
              }}
              className="ml-auto px-2 py-1 text-purple-800 rounded hover:bg-blue-400 hover:text-white"
            >
              ✖ Limpiar
            </button>
          </div>
        )}



        <div className="flex items-center gap-3">
          {/* 🔍 Botón Filtro */}
          <button
            onClick={async () => {
              await loadClientes();
              await loadTratamientos();
              // Al abrir modal, copiar filtros aplicados a los temporales
              setTempFilters({ ...filters });
              setClienteModalOpen(true);
            }}
            className="flex items-center px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-500 hover:text-white"
          >
            <span className="material-icons">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.386a1 1 0 01-1.414 1.415l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="ml-2">Filtrar</span>
          </button>

          {/* 🔄 Botón Refrescar */}
          <button
            onClick={() => loadSesiones()}
            className="flex items-center px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-500 hover:text-white"
          >
            <SyncIcon />
            <span className="ml-2">Refrescar</span>
          </button>
        </div>
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

          const dateStr = toDateStr(start);
          const timeStr = isMonth ? "08:00" : toTimeStr(start);

          setFormModal({
            open: true,
            date: dateStr,
            time: timeStr,
          });
        }}
        onDrillDown={(clickedDate) => {
          if (view === "month")
          {
            const dateStr = clickedDate.toISOString().slice(0, 10);
            setFormModal({ open: true, date: dateStr, time: "08:00" });
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
              <strong>Profesional:</strong>{" "}
              {selectedSesion.personal?.nombre}{" "}
              {selectedSesion.personal?.apellido}
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

      {/* Modal confirmación cancelar */}
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
                className={`bg-red-600 text-white px-3 py-1 rounded ${loadingCancel
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                  }`}
              >
                {loadingCancel ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nueva sesión */}
      {formModal.open && (
        <SesionFormModal
          isOpen={formModal.open}
          key={`${formModal.date}-${formModal.time}`}
          initialDate={formModal.date}
          initialTime={formModal.time}
          onClose={() =>
            setFormModal({ open: false, date: null, time: null })
          }
          onCreated={loadSesiones}
        />
      )}

      {/* Modal de filtros */}
      {clienteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[420px]">
            <h2 className="text-xl font-bold mb-4">Filtros del Calendario</h2>

            {/* Cliente */}
            <label className="font-semibold">Cliente:</label>
            <Select
              options={clienteOptions}
              value={
                clienteOptions.find(
                  (opt) =>
                    Number(opt.value) ===
                    Number(tempFilters.clienteId)
                ) || null
              }
              onChange={(opt) =>
                setTempFilters((prev) => ({
                  ...prev,
                  clienteId: opt ? opt.value : null,
                }))
              }
              placeholder="Buscar cliente..."
              isClearable
              menuPlacement="auto"
              menuShouldScrollIntoView
              className="mb-4"
            />

            {/* Tratamiento */}
            <label className="font-semibold">Tratamiento:</label>
            <Select
              options={tratamientoOptions}
              value={
                tratamientoOptions.find(
                  (opt) =>
                    Number(opt.value) ===
                    Number(tempFilters.tratamientoId)
                ) || null
              }
              onChange={(opt) =>
                setTempFilters((prev) => ({
                  ...prev,
                  tratamientoId: opt ? opt.value : null,
                }))
              }
              placeholder="Seleccionar tratamiento..."
              isClearable
              className="mb-4"
            />

            {/* Estado */}
            <label className="font-semibold">Estado:</label>
            <Select
              options={estadoOptions}
              value={
                estadoOptions.find(
                  (opt) => opt.value === tempFilters.estado
                ) || null
              }
              onChange={(opt) =>
                setTempFilters((prev) => ({
                  ...prev,
                  estado: opt ? opt.value : null,
                }))
              }
              placeholder="Seleccionar estado..."
              isClearable
              className="mb-6"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  // Aplicar filtros: copiar temp → filters y recargar
                  const newFilters = { ...tempFilters };
                  setFilters(newFilters);
                  setClienteModalOpen(false);
                  loadSesiones(newFilters);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Aplicar filtros
              </button>
              {/* Boton Limpiar
              <button
                onClick={() => {
                  const cleared = {
                    clienteId: null,
                    tratamientoId: null,
                    estado: null,
                  };
                  setTempFilters(cleared);
                  setFilters(cleared);
                  setClienteModalOpen(false);
                  loadSesiones(cleared);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Limpiar
              </button>  */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

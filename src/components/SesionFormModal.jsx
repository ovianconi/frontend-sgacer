// src/components/SesionFormModal.jsx
import { useEffect, useState } from "react";
import Select from "react-select";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import { apiFetch } from "../utils/api";
import { API_BASE } from "../utils/apiBase";

export default function SesionFormModal({ isOpen, initialDate, initialTime, onClose, onCreated }) {
    const [clientes, setClientes] = useState([]);
    const [tratamientos, setTratamientos] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [selectedTratamiento, setSelectedTratamiento] = useState(null);

    const [fecha, setFecha] = useState(initialDate || "");
    const [horaInicio, setHoraInicio] = useState(initialTime || "");
    // ⚠️ horaFin ya no se pide → se mandará null al backend
    const token = getToken();

    // Cargar lista de clientes al abrir modal
    useEffect(() => {
        if (!isOpen) return;

        const loadClientes = async () => {
            try
            {
                const res = await apiFetch(`${API_BASE}/clientes/con-paquetes`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Error al cargar clientes");
                const data = await res.json();
                setClientes(Array.isArray(data.content) ? data.content : data);
            } catch (err)
            {
                console.error(err);
                toast.error("No se pudieron cargar los clientes");
            }
        };
        loadClientes();

        // inicializar campos
        setFecha(initialDate || "");
        setHoraInicio(initialTime || "");
        setSelectedCliente(null);
        setSelectedTratamiento(null);
        setTratamientos([]);
    }, [isOpen, initialDate, initialTime, token]);

    // Cuando selecciono un cliente → cargar tratamientos disponibles
    useEffect(() => {
        if (!selectedCliente) return;

        const loadTratamientos = async () => {
            try
            {
                const res = await apiFetch(
                    `${API_BASE}/clientes/${selectedCliente.value}/tratamientos-disponibles`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!res.ok) throw new Error("Error al cargar tratamientos");
                const data = await res.json();

                // el backend devuelve [{id, nombre, sesionesRestantes}]
                setTratamientos(
                    data.filter(t => t.sesionesRestantes > 0).map((t) => ({
                        value: t.id,
                        label: `${t.nombre} (${t.sesionesRestantes} restantes)`,
                    }))
                );
            } catch (err)
            {
                console.error(err);
                toast.error("No se pudieron cargar tratamientos");
            }
        };

        loadTratamientos();
    }, [selectedCliente, token]);

    const handleSave = async () => {
        if (!selectedCliente || !selectedTratamiento || !fecha || !horaInicio)
        {
            toast.error("Debe completar todos los campos");
            return;
        }

        try
        {
            const res = await apiFetch(`${API_BASE}/sesiones/dto`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clienteId: selectedCliente.value,
                    tratamientoId: selectedTratamiento.value,
                    fecha,
                    horaInicio,
                    horaFin: null, // 👈 dejamos que el backend calcule
                    personalId: null,
                    equipoId: null, // así el backend sabrá que debe hacer autoasignación completa (igual que cuando viene del chatbot).
                }),
            });

            if (!res.ok)
            {
                let message = "Error al crear sesión";
                try
                {
                    const errorData = await res.json();
                    if (errorData?.message) message = errorData.message;
                } catch (_) { }
                throw new Error(message);
            }

            toast.success("Sesión creada correctamente");
            onCreated();
            onClose();
        } catch (err)
        {
            console.error(err);
            toast.error(err.message || "Error al crear sesión");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg relative">
                <h2 className="text-lg font-bold mb-4">Nueva Sesión</h2>

                {/* Cliente */}
                <label className="block mb-2 font-medium">Cliente</label>
                <Select
                    options={clientes.map((c) => ({
                        value: c.id,
                        label: `${c.nombre} ${c.apellido}`,
                    }))}
                    value={selectedCliente}
                    onChange={setSelectedCliente}
                    placeholder="Buscar cliente..."
                    isClearable
                    menuPlacement="auto"
                    menuShouldScrollIntoView
                />

                {/* Tratamiento */}
                <label className="block mb-2 font-medium mt-4">Tratamiento</label>
                <Select
                    options={tratamientos}
                    value={selectedTratamiento}
                    onChange={setSelectedTratamiento}
                    placeholder="Buscar tratamiento..."
                    isClearable
                    menuPlacement="auto"
                    menuShouldScrollIntoView
                    isDisabled={!selectedCliente}
                />

                {/* Fecha */}
                <label className="block mb-2 font-medium mt-4">Fecha</label>
                <input
                    type="date"
                    className="border p-2 rounded w-full"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                />

                {/* Hora inicio */}
                <label className="block mb-2 font-medium mt-4">Hora inicio</label>
                <input
                    type="time"
                    className="border p-2 rounded w-full"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                />

                {/* Botones */}
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

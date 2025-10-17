import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import { apiFetch } from "../utils/api";

export default function PaqueteFormModal({ open, onClose, onSaved, initialData }) {
    const token = getToken();
    const [nombre, setNombre] = useState("");
    const [duracion, setDuracion] = useState(0);
    const [tratamientos, setTratamientos] = useState([]);
    const [seleccion, setSeleccion] = useState([]);

    const api = (url, options = {}) =>
        apiFetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
        });

    useEffect(() => {
        if (!open) return;

        api("http://localhost:8080/api/tratamientos")
            .then((r) => r.json())
            .then((list) => setTratamientos(list || []))
            .catch(console.error);

        if (initialData)
        {
            setNombre(initialData.nombre || "");
            setDuracion(initialData.duracion || 0);
            const sel = (initialData.items || []).map((it) => ({
                value: it.tratamientoId,
                label: `${it.tratamientoNombre}`,
                sesiones: it.sesiones,
            }));
            setSeleccion(sel);
        } else
        {
            setNombre("");
            setDuracion(0);
            setSeleccion([]);
        }
    }, [open, initialData]);

    const options = useMemo(
        () => tratamientos.map((t) => ({
            value: t.id,
            label: `${t.nombre}`,
            searchable: `${t.nombre} ${t.id}`,
        })),
        [tratamientos]
    );

    if (!open) return null;

    const onChangeSelect = (vals) => {
        const mapPrev = new Map(seleccion.map((s) => [s.value, s.sesiones]));
        const next = (vals || []).map((v) => ({
            value: v.value,
            label: v.label,
            sesiones: mapPrev.get(v.value) ?? 1,
        }));
        setSeleccion(next);
    };

    const setSesionesFor = (valueId, sesiones) => {
        setSeleccion((prev) =>
            prev.map((it) => (it.value === valueId ? { ...it, sesiones } : it))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim())
        {
            toast.error("El nombre es obligatorio");
            return;
        }
        if (duracion <= 0)
        {
            toast.error("La duración debe ser mayor a 0 meses");
            return;
        }
        if (seleccion.length === 0)
        {
            toast.error("Seleccione al menos un tratamiento");
            return;
        }
        const items = seleccion.map((s) => ({
            tratamientoId: s.value,
            sesiones: Number(s.sesiones) || 1,
        }));

        const body = JSON.stringify({ nombre, duracion, items });

        try
        {
            const url = initialData
                ? `http://localhost:8080/api/paquetes/${initialData.id}`
                : "http://localhost:8080/api/paquetes";
            const method = initialData ? "PUT" : "POST";

            const res = await api(url, { method, body });
            if (!res.ok)
            {
                toast.error("No se pudo guardar el paquete");
                return;
            }
            toast.success("Paquete guardado");
            onSaved?.();
        } catch (e)
        {
            console.error(e);
            toast.error("Error al guardar");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
                <h2 className="text-lg font-bold mb-4">
                    {initialData ? "Editar Paquete" : "Agregar Paquete"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Duración (meses)</label>
                        <input
                            type="number"
                            min={1}
                            className="border p-2 rounded w-full"
                            value={duracion}
                            onChange={(e) => setDuracion(Number(e.target.value))}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Tratamientos (selección múltiple)
                        </label>
                        <Select
                            isMulti
                            options={options}
                            value={seleccion.map((s) => ({ value: s.value, label: s.label }))}
                            onChange={onChangeSelect}
                            placeholder="Buscar y seleccionar tratamientos..."
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No se encontraron tratamientos"}
                            styles={{
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </div>

                    {seleccion.length > 0 && (
                        <div className="border rounded p-3">
                            <p className="font-medium mb-2">Sesiones por tratamiento</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {seleccion.map((s) => (
                                    <div key={s.value} className="flex items-center gap-3">
                                        <span className="min-w-0 flex-1 truncate">{s.label}</span>
                                        <input
                                            type="number"
                                            min={1}
                                            className="w-24 border p-2 rounded"
                                            value={s.sesiones ?? 1}
                                            onChange={(e) => setSesionesFor(s.value, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            {initialData ? "Actualizar" : "Agregar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

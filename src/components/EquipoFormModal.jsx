// src/components/EquipoFormModal.jsx
import { useEffect, useState } from "react";
import Select from "react-select";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import { apiFetch } from "../utils/api";

export default function EquipoFormModal({ open, onClose, onSubmit, initialData }) {
    const [form, setForm] = useState({ nombre: "", codigo: "", tratamientos: [] });
    const [tratamientos, setTratamientos] = useState([]);
    const token = getToken();

    useEffect(() => {
        if (initialData)
        {
            setForm({
                nombre: initialData.nombre || "",
                codigo: initialData.codigo || "",
                tratamientos: initialData.tratamientos?.map((t) => ({ value: t.id, label: t.nombre })) || [],
            });
        } else
        {
            setForm({ nombre: "", codigo: "", tratamientos: [] });
        }
    }, [initialData]);

    useEffect(() => {
        const loadTratamientos = async () => {
            try
            {
                const res = await apiFetch("http://localhost:8080/api/tratamientos", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Error al cargar tratamientos");
                const data = await res.json();

                if (Array.isArray(data.content))
                {
                    setTratamientos(data.content.map((t) => ({ value: t.id, label: t.nombre })));
                } else if (Array.isArray(data))
                {
                    setTratamientos(data.map((t) => ({ value: t.id, label: t.nombre })));
                }
            } catch (err)
            {
                console.error(err);
                toast.error("No se pudieron cargar los tratamientos");
            }
        };

        loadTratamientos();
    }, [token]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try
        {
            const method = initialData ? "PUT" : "POST";
            const url = initialData
                ? `http://localhost:8080/api/equipos/${initialData.id}`
                : "http://localhost:8080/api/equipos";

            const payload = {
                nombre: form.nombre,
                codigo: form.codigo,
                tratamientos: form.tratamientos.map((t) => ({ id: t.value })),
            };

            const res = await apiFetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Error al guardar equipo");

            toast.success("Equipo guardado correctamente");
            onSubmit();
        } catch (err)
        {
            console.error(err);
            toast.error("Error al guardar equipo");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                    {initialData ? "Editar Equipo" : "Nuevo Equipo"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nombre</label>
                        <input
                            type="text"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            required
                            className="border rounded p-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Código</label>
                        <input
                            type="text"
                            value={form.codigo}
                            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                            required
                            className="border rounded p-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Tratamientos</label>
                        <Select
                            isMulti
                            options={tratamientos}
                            value={form.tratamientos}
                            onChange={(selected) => setForm({ ...form, tratamientos: selected })}
                            placeholder="Seleccione tratamientos..."
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {initialData ? "Actualizar" : "Agregar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

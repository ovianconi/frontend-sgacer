// src/components/TratamientoFormModal.jsx
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";

export default function TratamientoFormModal({ open, onClose, onSubmit, initialData }) {
    const [form, setForm] = useState({ nombre: "", descripcion: "" });
    const token = getToken();

    useEffect(() => {
        if (initialData)
        {
            setForm({
                nombre: initialData.nombre || "",
                descripcion: initialData.descripcion || "",
            });
        } else
        {
            setForm({ nombre: "", descripcion: "" });
        }
    }, [initialData]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try
        {
            const method = initialData ? "PUT" : "POST";
            const url = initialData
                ? `http://localhost:8080/api/tratamientos/${initialData.id}`
                : "http://localhost:8080/api/tratamientos";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Error al guardar tratamiento");

            toast.success("Tratamiento guardado correctamente");
            onSubmit();
        } catch (err)
        {
            console.error(err);
            toast.error("Error al guardar tratamiento");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                    {initialData ? "Editar Tratamiento" : "Nuevo Tratamiento"}
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
                        <label className="block text-sm font-medium">Descripción</label>
                        <textarea
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                            className="border rounded p-2 w-full"
                            rows={3}
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

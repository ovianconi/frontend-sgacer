// src/components/PersonalFormModal.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";

export default function PersonalFormModal({ open, onClose, onSubmit, initialData }) {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        tratamientos: [], // array of { id, nombre, descripcion }
    });

    const [tratamientos, setTratamientos] = useState([]);

    const token = getToken();

    useEffect(() => {
        const loadTratamientos = async () => {
            try
            {
                const res = await fetch(`http://localhost:8080/api/tratamientos?page=0&size=1000`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("No se pudieron cargar tratamientos");
                const data = await res.json();

                // soportar tanto respuesta paginada (data.content) como array directo (data)
                let list = [];
                if (Array.isArray(data))
                {
                    list = data;
                } else if (Array.isArray(data.content))
                {
                    list = data.content;
                }
                setTratamientos(list);
            } catch (err)
            {
                console.error(err);
                toast.error("No se pudieron cargar los tratamientos");
            }
        };
        loadTratamientos();
    }, [token]);

    useEffect(() => {
        if (initialData)
        {
            // initialData.tratamientos may be array of full objects
            setForm({
                nombre: initialData.nombre ?? "",
                apellido: initialData.apellido ?? "",
                correo: initialData.correo ?? "",
                telefono: initialData.telefono ?? "",
                tratamientos: initialData.tratamientos ?? [],
            });
        } else
        {
            setForm({ nombre: "", apellido: "", correo: "", telefono: "", tratamientos: [] });
        }
    }, [initialData]);

    if (!open) return null;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación: al menos un tratamiento
        if (!form.tratamientos || form.tratamientos.length === 0)
        {
            toast.error("Debe seleccionar al menos un tratamiento");
            return;
        }

        // Construir payload: incluir tratamientos como [{ id: X }, ...]
        const payload = {
            nombre: form.nombre,
            apellido: form.apellido,
            correo: form.correo,
            telefono: form.telefono,
            tratamientos: form.tratamientos.map((t) => ({ id: t.id })),
        };

        try
        {
            let res;
            if (initialData && initialData.id)
            {
                res = await fetch(`http://localhost:8080/api/personales/${initialData.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
            } else
            {
                res = await fetch(`http://localhost:8080/api/personales`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok)
            {
                const text = await res.text();
                console.error("Response not ok:", res.status, text);
                throw new Error("Error al guardar personal");
            }

            toast.success("Personal guardado");
            onSubmit();
        } catch (err)
        {
            console.error(err);
            toast.error("Error al guardar personal");
        }
    };

    const selectOptions = tratamientos.map((t) => ({ value: t.id, label: t.nombre, raw: t }));

    const selected = (form.tratamientos || []).map((t) => ({ value: t.id, label: t.nombre }));

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[600px] animate-fadeIn">
                <h2 className="text-lg font-bold mb-4">{initialData ? "Editar Personal" : "Agregar Personal"}</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="text"
                        name="apellido"
                        placeholder="Apellido"
                        value={form.apellido}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                    <input
                        type="email"
                        name="correo"
                        placeholder="Correo"
                        value={form.correo}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                    <input
                        type="text"
                        name="telefono"
                        placeholder="Teléfono"
                        value={form.telefono}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />

                    <div className="col-span-2">
                        <label className="block mb-1">Tratamientos (seleccione al menos 1)</label>
                        <Select
                            isMulti
                            options={selectOptions}
                            value={selected}
                            onChange={(selectedItems) => {
                                // selectedItems = [{value,label},...]
                                const arr = (selectedItems || []).map((s) => {
                                    const raw = tratamientos.find((t) => t.id === s.value);
                                    return raw ? raw : { id: s.value, nombre: s.label };
                                });
                                setForm({ ...form, tratamientos: arr });
                            }}
                            placeholder="Buscar y seleccionar tratamientos..."
                        />
                    </div>

                    <div className="col-span-2 flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {initialData ? "Actualizar" : "Agregar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

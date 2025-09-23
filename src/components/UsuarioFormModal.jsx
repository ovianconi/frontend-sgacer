// src/components/UsuarioFormModal.jsx
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";

export default function UsuarioFormModal({ open, onClose, onSubmit, initialData, roles }) {
    const [form, setForm] = useState({
        username: "",
        password: "",
        rolId: "",
    });

    const token = getToken();

    useEffect(() => {
        if (initialData)
        {
            setForm({
                username: initialData.username || "",
                password: "",
                rolId: initialData.roles?.[0]?.id || "",
            });
        } else
        {
            setForm({ username: "", password: "", rolId: "" });
        }
    }, [initialData]);

    if (!open) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = initialData ? "PUT" : "POST";
        const url = initialData
            ? `http://localhost:8080/api/usuarios/${initialData.id}`
            : "http://localhost:8080/api/usuarios";

        const payload = {
            username: form.username,
            password: form.password || undefined, // si no edita password, no enviar
            rolId: form.rolId,
        };

        try
        {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok)
            {
                toast.success(initialData ? "Usuario actualizado" : "Usuario creado");
                onSubmit();
            } else
            {
                toast.error("Error al guardar usuario");
            }
        } catch (err)
        {
            console.error(err);
            toast.error("Error de conexión");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[500px]">
                <h2 className="text-lg font-bold mb-4">
                    {initialData ? "Editar Usuario" : "Agregar Usuario"}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <input
                        type="text"
                        name="username"
                        placeholder="Usuario"
                        value={form.username}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        {...(!initialData && { required: true })}
                    />
                    <select
                        name="rolId"
                        value={form.rolId}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    >
                        <option value="">Seleccione un rol</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.nombre}
                            </option>
                        ))}
                    </select>

                    <div className="flex justify-end space-x-3 mt-4">
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

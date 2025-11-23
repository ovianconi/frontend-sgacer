import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import { apiFetch } from "../utils/api";
import { API_BASE } from "../utils/apiBase";

export default function UsuarioFormModal({ open, onClose, onSubmit, initialData, roles }) {
    const [form, setForm] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        rolId: "",
    });
    const [touchedConfirm, setTouchedConfirm] = useState(false); // Nuevo estado

    const token = getToken();

    useEffect(() => {
        // Si estamos en modo edición, cargamos los datos iniciales
        if (initialData)
        {
            setForm({
                username: initialData.username || "",
                password: "",
                confirmPassword: "",
                rolId: initialData.roles?.[0]?.id || "",
            });
        } else
        {
            // Si estamos en "crear", reiniciamos el formulario
            setForm({ username: "", password: "", confirmPassword: "", rolId: "" });
        }
        setTouchedConfirm(false); // Resetear "touchedConfirm" cuando cambiemos de estado
    }, [initialData, open]); // Dependemos de `initialData` y `open` para resetear el formulario al abrir

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === "confirmPassword" && !touchedConfirm)
        {
            setTouchedConfirm(true); // Marcar como tocado en cuanto escribe en confirmar contraseña
        }
    };

    const contraseñasNoCoinciden =
        touchedConfirm &&
        form.confirmPassword &&
        form.password !== form.confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword)
        {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        const method = initialData ? "PUT" : "POST";
        const url = initialData
            ? `${API_BASE}/usuarios/${initialData.id}`
            : `${API_BASE}/usuarios`;

        const payload = {
            username: form.username,
            password: form.password || undefined,
            rolId: form.rolId,
        };

        try
        {
            const res = await apiFetch(url, {
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
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirmar Contraseña"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />

                    {/* Mostrar error solo si ya empezó a escribir confirmación y no coinciden */}
                    {contraseñasNoCoinciden && (
                        <div className="text-red-600 text-sm">
                            Las contraseñas no coinciden
                        </div>
                    )}

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

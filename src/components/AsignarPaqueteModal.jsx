// src/components/AsignarPaqueteModal.jsx
import { useEffect, useState } from "react";
import Select from "react-select";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";

export default function AsignarPaqueteModal({ open, onClose, onSubmit, initialData }) {
    const [clientes, setClientes] = useState([]);
    const [paquetes, setPaquetes] = useState([]);
    const [formData, setFormData] = useState({
        clienteId: "",
        paqueteId: "",
        fechaCompra: "",
        fechaValidez: "",
    });

    const token = getToken();

    // cargar clientes y paquetes al abrir modal
    useEffect(() => {
        if (!open) return;

        const loadData = async () => {
            try
            {
                const resClientes = await fetch("http://localhost:8080/api/clientes?size=1000", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const resPaquetes = await fetch("http://localhost:8080/api/paquetes?size=1000", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!resClientes.ok || !resPaquetes.ok) throw new Error("Error al cargar datos");

                const dataClientes = await resClientes.json();
                const dataPaquetes = await resPaquetes.json();

                setClientes(Array.isArray(dataClientes.content) ? dataClientes.content : dataClientes);
                setPaquetes(Array.isArray(dataPaquetes.content) ? dataPaquetes.content : dataPaquetes);
            } catch (err)
            {
                console.error(err);
                toast.error("No se pudieron cargar clientes o paquetes");
            }
        };

        loadData();
    }, [open, token]);

    // resetear formulario cuando se abre
    useEffect(() => {
        if (open)
        {
            if (initialData)
            {
                setFormData({
                    clienteId: initialData.cliente?.id || "",
                    paqueteId: initialData.paquete?.id || "",
                    fechaCompra: initialData.fechaCompra || new Date().toISOString().split("T")[0],
                    fechaValidez: initialData.fechaValidez || "",
                });
            } else
            {
                setFormData({
                    clienteId: "",
                    paqueteId: "",
                    fechaCompra: new Date().toISOString().split("T")[0],
                    fechaValidez: "",
                });
            }
        }
    }, [open, initialData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async () => {
        if (!formData.clienteId || !formData.paqueteId)
        {
            toast.error("Debe seleccionar cliente y paquete");
            return;
        }

        try
        {
            const method = initialData ? "PUT" : "POST";
            const url = initialData
                ? `http://localhost:8080/api/asignaciones/${initialData.id}`
                : "http://localhost:8080/api/asignaciones";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cliente: { id: formData.clienteId },
                    paquete: { id: formData.paqueteId },
                    fechaCompra: formData.fechaCompra,
                    fechaValidez: formData.fechaValidez,
                }),
            });

            if (!res.ok) throw new Error("Error al guardar asignación");

            toast.success("Asignación guardada correctamente");
            onSubmit();
        } catch (err)
        {
            console.error(err);
            toast.error("No se pudo guardar la asignación");
        }
    };

    // Opciones para react-select
    const clienteOptions = clientes.map((c) => ({
        value: c.id,
        label: `${c.nombre} ${c.apellido}`,
    }));

    const paqueteOptions = paquetes.map((p) => ({
        value: p.id,
        label: p.nombre,
    }));

    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[600px] animate-fadeIn">
                <h2 className="text-lg font-bold mb-4">
                    {initialData ? "Editar Asignación" : "Asignar Paquete a Cliente"}
                </h2>

                {/* Cliente */}
                <label className="block mb-2 font-medium">Cliente</label>
                <Select
                    options={clienteOptions}
                    value={clienteOptions.find((c) => c.value === formData.clienteId) || null}
                    onChange={(opt) => setFormData({ ...formData, clienteId: opt?.value || "" })}
                    placeholder="Buscar cliente..."
                    isClearable
                    isMulti={false}
                    menuPlacement="auto"
                    menuShouldScrollIntoView
                />

                {/* Paquete */}
                <label className="block mb-2 font-medium mt-4">Paquete</label>
                <Select
                    options={paqueteOptions}
                    value={paqueteOptions.find((p) => p.value === formData.paqueteId) || null}
                    onChange={(opt) => setFormData({ ...formData, paqueteId: opt?.value || "" })}
                    placeholder="Buscar paquete..."
                    isClearable
                    isMulti={false}
                    menuPlacement="auto"
                    menuShouldScrollIntoView
                />

                {/* Fecha compra */}
                <label className="block mb-2 font-medium mt-4">Fecha de compra</label>
                <input
                    type="date"
                    name="fechaCompra"
                    value={formData.fechaCompra}
                    onChange={handleChange}
                    className="border p-2 rounded w-full mb-4"
                />

                {/* Fecha validez */}
                <label className="block mb-2 font-medium">Fecha de validez</label>
                <input
                    type="date"
                    name="fechaValidez"
                    value={formData.fechaValidez}
                    onChange={handleChange}
                    className="border p-2 rounded w-full mb-4"
                    min={new Date().toISOString().split("T")[0]}
                />

                {/* Botones */}
                <div className="col-span-2 flex justify-end space-x-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {initialData ? "Actualizar" : "Asignar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

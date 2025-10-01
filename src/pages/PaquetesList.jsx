import { useEffect, useMemo, useState } from "react";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import ModalConfirm from "../components/ModalConfirm";
import PaqueteFormModal from "../components/PaqueteFormModal";
import { Input } from 'antd';

const columnHelper = createColumnHelper();

export default function Paquetes() {
    const token = getToken();
    const [rows, setRows] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const api = (url, options = {}) =>
        fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
        });

    const load = () => {
        api("http://localhost:8080/api/paquetes")
            .then((r) => r.json())
            .then(setRows)
            .catch((e) => console.error(e));
    };

    useEffect(() => {
        load();
    }, [token]);

    const columns = useMemo(
        () => [
            columnHelper.accessor("nombre", { header: "Nombre" }),
            columnHelper.accessor("items", {
                header: "Tratamientos (sesiones)",
                cell: (info) =>
                    (info.getValue() || [])
                        .map((it) => `${it.tratamientoNombre} (${it.sesiones})`)
                        .join(", "),
            }),
            columnHelper.accessor("duracion", { header: "Duración" }),
            columnHelper.display({
                id: "acciones",
                header: "Acciones",
                cell: ({ row }) => (
                    <div className="space-x-2">
                        <button
                            className="text-white px-2 py-1 rounded"
                            onClick={() => {
                                setEditing(row.original);
                                setModalOpen(true);
                            }}
                        >
                            ✏️
                        </button>
                        <button
                            className="text-white px-2 py-1 rounded"
                            onClick={() => setDeleteId(row.original.id)}
                        >
                            🗑️
                        </button>
                    </div>
                ),
            }),
        ],
        []
    );

    const table = useReactTable({
        data: rows,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const confirmDelete = async (id) => {
        try
        {
            const res = await api(`http://localhost:8080/api/paquetes/${id}`, { method: "DELETE" });
            if (!res.ok && res.status !== 204)
            {
                toast.error("No se pudo eliminar.");
                return;
            }
            toast.success("Paquete eliminado.");
            load();
        } catch (e)
        {
            console.error(e);
            toast.error("Error eliminando paquete.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Gestión de Paquetes</h3>
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded-full text-lg"
                    onClick={() => {
                        setEditing(null);
                        setModalOpen(true);
                    }}
                    title="Agregar Paquete"
                >
                    +
                </button>
            </div>
            <Input
                placeholder="Buscar paquete..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                allowClear
                className="placeholder-gray-500 placeholder-opacity-100 text-base border p-2 rounded w-full mb-4"
                style={{ fontFamily: 'inherit' }}
            />

            <table className="w-full border-collapse bg-white rounded shadow">
                <thead className="bg-gray-200">
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((h) => (
                                <th
                                    key={h.id}
                                    className="p-2 cursor-pointer select-none"
                                    onClick={h.column.getToggleSortingHandler()}
                                >
                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                    {h.column.getIsSorted() === "asc" && " 🔼"}
                                    {h.column.getIsSorted() === "desc" && " 🔽"}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="border-t hover:bg-gray-50">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="p-2">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
                <div className="space-x-2">
                    {/*<button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        ⏮️ Primera
                    </button>*/}
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        ⬅️ Anterior
                    </button>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Siguiente ➡️
                    </button>
                    {/*<button
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Última ⏭️
                    </button>*/}
                </div>
                <span>
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </span>
                <div className="flex items-center gap-2">
                    <label className="text-sm">Mostrar:</label>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="border rounded p-1 text-sm"
                    >
                        {[5, 10, 20, 50, 100].map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <span className="text-sm">por página</span>
                </div>
            </div>

            <PaqueteFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                initialData={editing}
                onSaved={() => {
                    setModalOpen(false);
                    setEditing(null);
                    load();
                }}
            />

            <ModalConfirm
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => confirmDelete(deleteId)}
                title="Confirmar eliminación"
                message="¿Seguro que desea eliminar este paquete?"
            />
        </div>
    );
}

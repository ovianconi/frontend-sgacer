// src/pages/Personales.jsx
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table";
import PersonalFormModal from "../components/PersonalFormModal";
import ModalConfirm from "../components/ModalConfirm";
import PageTitle from "../components/PageTitle";
import { Input } from 'antd';

export default function Personales() {
    const [personales, setPersonales] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPersonal, setEditingPersonal] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const token = getToken();

    const loadPersonales = async () => {
        try
        {
            const res = await fetch(
                `http://localhost:8080/api/personales?page=${page}&size=5&sort=id,asc`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error("Error al cargar personal");
            const data = await res.json();
            setPersonales(Array.isArray(data.content) ? data.content : []);
            setTotalPages(data.totalPages ?? 1);
        } catch (err)
        {
            console.error(err);
            setPersonales([]);
            toast.error("No se pudieron cargar los personales");
        }
    };

    useEffect(() => {
        loadPersonales();
    }, [token, page]);

    const columns = [
        { accessorKey: "nombre", header: "Nombre" },
        { accessorKey: "apellido", header: "Apellido" },
        { accessorKey: "correo", header: "Correo" },
        { accessorKey: "telefono", header: "Teléfono" },
        {
            accessorKey: "tratamientos",
            header: "Tratamientos",
            cell: ({ row }) =>
                row.original.tratamientos?.length > 0
                    ? row.original.tratamientos.map((t) => t.nombre).join(", ")
                    : "—",
        },
        {
            accessorKey: "acciones",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="space-x-2">
                    <button
                        onClick={() => {
                            setEditingPersonal(row.original);
                            setModalOpen(true);
                        }}
                        className="text-white px-2 py-1 rounded"
                        title="Editar"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => setDeleteId(row.original.id)}
                        className="text-white px-2 py-1 rounded"
                        title="Eliminar"
                    >
                        🗑️
                    </button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: personales ?? [],
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
            const res = await fetch(`http://localhost:8080/api/personales/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok && res.status !== 204)
            {
                toast.error("No se pudo eliminar el personal.");
                return;
            }
            loadPersonales();
            toast.success("Personal eliminado correctamente");
        } catch (err)
        {
            console.error(err);
            toast.error("Error al eliminar personal.");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <PageTitle>Gestión de Personal</PageTitle>
                <button
                    onClick={() => {
                        setEditingPersonal(null);
                        setModalOpen(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-full text-lg"
                    title="Agregar Personal"
                >
                    +
                </button>
            </div>

            <Input
                placeholder="Buscar personal..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                allowClear
                className="placeholder-gray-500 placeholder-opacity-100 text-base border p-2 rounded w-full mb-4"
                style={{ fontFamily: 'inherit' }}
            />

            <table className="w-full border-collapse bg-white rounded shadow">
                <thead className="bg-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="p-2 cursor-pointer select-none"
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() === "asc" && " 🔼"}
                                    {header.column.getIsSorted() === "desc" && " 🔽"}
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
                </div>

                <span>
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {table.getPageCount()}
                </span>
                <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="text-sm text-gray-700">
                        Mostrar:
                    </label>
                    <select
                        id="pageSize"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="border rounded p-1 text-sm"
                    >
                        {[5, 10, 20, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-700">por página</span>
                </div>
            </div>

            <PersonalFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingPersonal(null);
                }}
                onSubmit={() => {
                    setModalOpen(false);
                    setEditingPersonal(null);
                    loadPersonales();
                }}
                initialData={editingPersonal}
            />

            <ModalConfirm
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => confirmDelete(deleteId)}
                title="Confirmar eliminación"
                message="¿Seguro que desea eliminar este personal?"
            />
        </div>
    );
}

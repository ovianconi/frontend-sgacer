// src/pages/Asignaciones.jsx
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
import AsignarPaqueteModal from "../components/AsignarPaqueteModal";
import ModalConfirm from "../components/ModalConfirm";
import { Input } from 'antd';
import { apiFetch } from "../utils/api";
import { API_BASE } from "../utils/apiBase";

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [page] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const token = getToken();

  // Cargar asignaciones
  const loadAsignaciones = async () => {
    try
    {
      const res = await apiFetch(
        `${API_BASE}/asignaciones?page=${page}&size=5&sort=id,desc`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Error al cargar asignaciones");

      const data = await res.json();
      setAsignaciones(Array.isArray(data.content) ? data.content : data);
      setTotalPages(data.totalPages ?? 1);
    } catch (err)
    {
      console.error(err);
      setAsignaciones([]);
      toast.error("No se pudieron cargar las asignaciones");
    }
  };

  useEffect(() => {
    loadAsignaciones();
  }, [page, token]);

  // Columnas de la tabla
  const columns = [
    {
      header: "Cliente",
      accessorFn: (row) =>
        row.cliente ? `${row.cliente.nombre} ${row.cliente.apellido}` : "—",
    },
    {
      header: "Paquete",
      accessorFn: (row) => row.paquete?.nombre ?? "—",
    },
    {
      header: "Fecha de Compra",
      accessorFn: (row) => row.fechaCompra,
    },
    {
      header: "Fecha de Validez",
      accessorFn: (row) => row.fechaValidez,
    },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="space-x-2">
          <button
            onClick={() => {
              setEditing(row.original);
              setModalOpen(true);
            }}
            className="text-white px-2 py-1 rounded"
          >
            ✏️
          </button>
          <button
            onClick={() => setDeleteId(row.original.id)}
            className="text-white px-2 py-1 rounded"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: asignaciones ?? [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Eliminar asignación
  const confirmDelete = async (id) => {
    try
    {
      const res = await apiFetch(`${API_BASE}/asignaciones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) //if (!res.ok && res.status !== 204)
      {
        let message = "No se pudo eliminar la asignación";
        try
        {
          const errorData = await res.json();
          if (errorData?.message)
          {
            message = errorData.message;
          }
        } catch (_)
        {
          /* ignorar si no viene JSON */
        }
        throw new Error(message);
      }

      toast.success("Asignación eliminada correctamente");
      // Aquí refrescas la lista de asignaciones:
      loadAsignaciones();
    } catch (err)
    {
      console.error("Error al eliminar asignación:", err);
      toast.error(err.message || "Error de red al eliminar asignación");
    }
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Asignación de Paquetes</h3>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-full text-lg"
          title="Asignar Paquete"
        >
          +
        </button>
      </div>

      {/* Buscador */}
      <Input
        placeholder="Buscar por cliente o paquete..."
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        allowClear
        className="placeholder-gray-500 placeholder-opacity-100 text-base border p-2 rounded w-full mb-4"
        style={{ fontFamily: 'inherit' }}
      />

      {/* Tabla */}
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

      {/* Paginación */}
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

      {/* Modal de creación/edición */}
      <AsignarPaqueteModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={() => {
          setModalOpen(false);
          setEditing(null);
          loadAsignaciones();
        }}
        initialData={editing}
      />

      {/* Modal confirmación */}
      <ModalConfirm
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => confirmDelete(deleteId)}
        title="Confirmar eliminación"
        message="¿Seguro que desea eliminar esta asignación?"
      />
    </div>
  );
}

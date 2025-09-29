// src/pages/Vistas.jsx
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
import ModalConfirm from "../components/ModalConfirm";
import PageTitle from "../components/PageTitle";
import { Input } from "antd";

export default function Vistas() {
  const [vistas, setVistas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVista, setEditVista] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(0);

  const token = getToken();

  const loadVistas = async () => {
    try
    {
      const res = await fetch("http://localhost:8080/api/vistas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar vistas");
      const data = await res.json();
      setVistas(Array.isArray(data) ? data : []);
    } catch (err)
    {
      console.error(err);
      toast.error("No se pudieron cargar las vistas");
      setVistas([]);
    }
  };


  useEffect(() => {
    loadVistas();
  }, [page]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editVista?.id ? "PUT" : "POST";
    const url = editVista?.id
      ? `http://localhost:8080/api/vistas/${editVista.id}`
      : "http://localhost:8080/api/vistas";

    // Limpiamos rolesPermitidos del payload antes de enviar
    const payload = { ...editVista };
    delete payload.rolesPermitidos;

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

      if (!res.ok) throw new Error("Error al guardar vista");
      toast.success(editVista ? "Vista actualizada" : "Vista agregada");
      setModalOpen(false);
      setEditVista(null);
      await loadVistas();
    } catch (err)
    {
      toast.error(err.message);
    } finally
    {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try
    {
      const res = await fetch(`http://localhost:8080/api/vistas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar vista");
      toast.success("Vista eliminada");
      await loadVistas();
    } catch (err)
    {
      toast.error(err.message);
    }
  };

  const columns = [
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "path", header: "Path" },
    { accessorKey: "icono", header: "Icono" },
    { accessorKey: "descripcion", header: "Descripción" },
    {
      accessorKey: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="space-x-2">
          <button
            onClick={() => {
              setEditVista(row.original);
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
    data: vistas ?? [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Gestión de Vistas</h3>
        <button
          onClick={() => {
            setEditVista({ nombre: "", path: "", icono: "", descripcion: "" });
            setModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-full text-lg"
          title="Agregar Vista"
        >
          +
        </button>
      </div>

      <Input
        placeholder="Buscar vistas..."
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        allowClear
        className="placeholder-gray-500 placeholder-opacity-100 text-base border p-2 rounded w-full mb-4"
        style={{ fontFamily: "inherit" }}
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
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
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
          {vistas.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center p-4 text-gray-500"
              >
                No hay vistas registradas
              </td>
            </tr>
          )}
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

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">
              {editVista?.id ? "Editar Vista" : "Nueva Vista"}
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={editVista?.nombre ?? ""}
                onChange={(e) =>
                  setEditVista({ ...editVista, nombre: e.target.value })
                }
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Path (ej: /sesiones)"
                value={editVista?.path ?? ""}
                onChange={(e) =>
                  setEditVista({ ...editVista, path: e.target.value })
                }
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Icono (ej: CalendarMonth)"
                value={editVista?.icono ?? ""}
                onChange={(e) =>
                  setEditVista({ ...editVista, icono: e.target.value })
                }
                required
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                placeholder="Descripción"
                value={editVista?.descripcion ?? ""}
                onChange={(e) =>
                  setEditVista({ ...editVista, descripcion: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="bg-gray-300 px-3 py-1 rounded"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  {editVista?.id ? "Actualizar" : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmación */}
      <ModalConfirm
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Confirmar eliminación"
        message="¿Seguro que desea eliminar esta vista?"
      />
    </div>
  );
}

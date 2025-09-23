// src/pages/Roles.jsx
import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import ModalConfirm from "../components/ModalConfirm";
import { Input } from 'antd';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  const token = getToken();

  const loadRoles = () => {
    fetch("http://localhost:8080/api/roles", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setRoles)
      .catch(console.error);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "nombre",
        header: "Nombre",
      },
      {
        accessorKey: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="space-x-2">
            <button
              onClick={() => {
                setEditingRol(row.original);
                setNombre(row.original.nombre);
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
    ],
    []
  );

  const table = useReactTable({
    data: roles,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingRol ? "PUT" : "POST";
    const url = editingRol
      ? `http://localhost:8080/api/roles/${editingRol.id}`
      : "http://localhost:8080/api/roles";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre }),
    });

    if (res.ok)
    {
      toast.success(editingRol ? "Rol actualizado" : "Rol agregado");
      setModalOpen(false);
      setEditingRol(null);
      setNombre("");
      loadRoles();
    } else
    {
      toast.error("Error al guardar rol");
    }
  };

  const confirmDelete = async (id) => {
    const res = await fetch(`http://localhost:8080/api/roles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok)
    {
      toast.success("Rol eliminado");
      setDeleteId(null);
      loadRoles();
    } else
    {
      toast.error("Error al eliminar rol");
    }
  };

  return (
    <div >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Gestión de Roles</h3>
        <button
          onClick={() => {
            setEditingRol(null);
            setNombre("");
            setModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-full text-lg"
          title="Agregar Rol"
        >
          +
        </button>
      </div>

      {/* Buscador */}
      <Input
        placeholder="Buscar rol..."
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        allowClear
        className="placeholder-gray-500 placeholder-opacity-100 text-base border p-2 rounded w-full mb-4"
        style={{ fontFamily: 'inherit' }}
      />

      {/* Tabla */}
      <table className="w-full border-collapse bg-white rounded shadow">
        <thead className="bg-gray-200">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="p-2 cursor-pointer select-none"
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

      {/* Modal formulario */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
            <h2 className="text-lg font-bold mb-4">
              {editingRol ? "Editar Rol" : "Agregar Rol"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del rol"
                className="border p-2 rounded w-full"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingRol ? "Actualizar" : "Agregar"}
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
        onConfirm={() => confirmDelete(deleteId)}
        title="Confirmar eliminación"
        message="¿Seguro que desea eliminar este rol?"
      />
    </div>
  );
}

// src/pages/Usuarios.jsx
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import ModalConfirm from "../components/ModalConfirm";
import UsuarioFormModal from "../components/UsuarioFormModal";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Input } from 'antd';
import { apiFetch } from "../utils/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const token = getToken();

  const loadUsuarios = async () => {
    try
    {
      const res = await apiFetch("http://localhost:8080/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsuarios(data);
    } catch (err)
    {
      console.error(err);
    }
  };

  const loadRoles = async () => {
    try
    {
      const res = await apiFetch("http://localhost:8080/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRoles(data);
    } catch (err)
    {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadRoles();
  }, []);

  // columnas de la tabla
  const columns = [
    { accessorKey: "username", header: "Usuario" },
    {
      accessorKey: "roles",
      header: "Rol",
      cell: ({ row }) => row.original.roles?.map((r) => r.nombre).join(", ") || "-",
    },
    {
      accessorKey: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="space-x-2">
          <button
            onClick={() => {
              setEditingUsuario(row.original);
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
    data: usuarios,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // eliminar
  const confirmDelete = async (id) => {
    try
    {
      const res = await apiFetch(`http://localhost:8080/api/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok && res.status !== 204)
      {
        toast.error("No se pudo eliminar el usuario.");
        return;
      }

      loadUsuarios();
      toast.success("Usuario eliminado correctamente");
    } catch (err)
    {
      console.error(err);
      toast.error("Error al eliminar usuario.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Gestión de Usuarios</h3>
        <button
          onClick={() => {
            setEditingUsuario(null);
            setModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-full text-lg"
          title="Agregar Usuario"
        >
          +
        </button>
      </div>

      {/* Buscador */}
      <Input
        placeholder="Buscar usuario..."
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

      {/* Modal formulario */}
      <UsuarioFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUsuario(null);
        }}
        onSubmit={() => {
          setModalOpen(false);
          setEditingUsuario(null);
          loadUsuarios();
        }}
        initialData={editingUsuario}
        roles={roles}
      />

      {/* Modal confirmación */}
      <ModalConfirm
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => confirmDelete(deleteId)}
        title="Confirmar eliminación"
        message="¿Seguro que desea eliminar este usuario?"
      />
    </div>
  );
}

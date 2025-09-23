// src/pages/Clientes.jsx
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
import ClienteFormModal from "../components/ClienteFormModal";
import ModalConfirm from "../components/ModalConfirm";
import PageTitle from "../components/PageTitle";
import { Input } from 'antd';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const token = getToken();

  const loadClientes = () => {
    fetch("http://localhost:8080/api/clientes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setClientes)
      .catch(console.error);
  };

  useEffect(() => {
    loadClientes();
  }, [token]);

  // columnas de la tabla
  const columns = [
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "apellido", header: "Apellido" },
    { accessorKey: "correo", header: "Correo" },
    { accessorKey: "telefono", header: "Teléfono" },
    { accessorKey: "documento", header: "Documento" },
    {
      accessorKey: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="space-x-2">
          <button
            onClick={() => {
              setEditingCliente(row.original);
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
    data: clientes,
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
      const res = await fetch(`http://localhost:8080/api/clientes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok && res.status !== 204)
      {
        toast.error("No se pudo eliminar el cliente.");
        return;
      }

      loadClientes();
      toast.success("Cliente eliminado correctamente");
    } catch (err)
    {
      console.error(err);
      toast.error("Error al eliminar cliente.");
    }
  };

  const handleSave = async (form) => {
    try
    {
      const method = editingCliente ? "PUT" : "POST";
      const url = editingCliente
        ? `http://localhost:8080/api/clientes/${editingCliente.id}`
        : "http://localhost:8080/api/clientes";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok)
      {
        toast.error("Error al guardar el cliente");
        return;
      }

      toast.success(editingCliente ? "Cliente actualizado" : "Cliente agregado");
      setModalOpen(false);
      setEditingCliente(null);
      loadClientes();
    } catch (err)
    {
      console.error(err);
      toast.error("Error de red al guardar cliente");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <PageTitle>Gestión de Clientes</PageTitle>
        <button
          onClick={() => {
            setEditingCliente(null);
            setModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-full text-lg"
          title="Agregar Cliente"
        >
          +
        </button>
      </div>

      {/* Buscador */}
      <Input
        placeholder="Buscar cliente..."
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

      {/* Modal de formulario */}
      <ClienteFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCliente(null);
        }}
        onSubmit={handleSave}   // ahora pasamos la función que guarda
        initialData={editingCliente}
      />

      {/* Modal confirmación */}
      <ModalConfirm
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => confirmDelete(deleteId)}
        title="Confirmar eliminación"
        message="¿Seguro que desea eliminar este cliente?"
      />
    </div>
  );
}

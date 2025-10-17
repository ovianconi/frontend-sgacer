// RolVistas.jsx
import { useState, useEffect } from "react";
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
import { Input } from "antd";
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { apiFetch } from "../utils/api";

export default function RolVistas() {
  const [roles, setRoles] = useState([]);
  const [vistas, setVistas] = useState([]);
  const [selectedRol, setSelectedRol] = useState(null);
  const [selectedVistaIds, setSelectedVistaIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const token = getToken();

  // Cargar roles
  const loadRoles = async () => {
    try
    {
      const res = await apiFetch("http://localhost:8080/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar roles");
      setRoles(await res.json());
    } catch (err)
    {
      toast.error("No se pudieron cargar los roles");
    }
  };

  // Cargar vistas
  const loadVistas = async () => {
    try
    {
      const res = await apiFetch("http://localhost:8080/api/vistas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar vistas");
      setVistas(await res.json());
    } catch (err)
    {
      toast.error("No se pudieron cargar las vistas");
    }
  };

  // Cargar vistas asociadas al rol
  const loadRolVistas = async (rolId) => {
    try
    {
      const res = await apiFetch(`http://localhost:8080/api/roles/${rolId}/vistas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar vistas del rol");
      const data = await res.json();
      setSelectedVistaIds(data.map((vista) => vista.id)); // ✅ solo IDs de vistas
    } catch (err)
    {
      toast.error("No se pudieron cargar las vistas del rol");
    }
  };

  useEffect(() => {
    loadRoles();
    loadVistas();
  }, []);

  const handleOpenModal = (rol) => {
    setSelectedRol(rol);
    loadRolVistas(rol.id);
    setModalOpen(true);
  };

  const toggleVista = (id) => {
    setSelectedVistaIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // Guardar asignaciones
  const handleSave = async () => {
    if (!selectedRol) return;
    setLoading(true);

    try
    {
      const normalizedRol =
        selectedRol.nombre.startsWith("ROLE_")
          ? selectedRol.nombre
          : `ROLE_${selectedRol.nombre}`;

      const res = await apiFetch(
        `http://localhost:8080/api/roles/${selectedRol.id}/vistas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(selectedVistaIds), // 🔥 solo la lista
        }
      );

      if (!res.ok) throw new Error("Error al guardar asignaciones");
      toast.success("Vistas asignadas correctamente");
      setModalOpen(false);
    } catch (err)
    {
      toast.error(err.message);
    } finally
    {
      setLoading(false);
    }
  };

  // 🔹 Definimos columnas para la tabla
  const columns = [
    { accessorKey: "nombre", header: "Rol" },
    {
      accessorKey: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <button
          className="px-3 py-1 rounded hover:bg-blue-500 hover:text-white "
          onClick={() => handleOpenModal(row.original)}
        >
          <DashboardCustomizeIcon className="hover:bg-blue-500 hover:text-white text-lg font-bold" />
          Configurar Vistas
        </button>
      ),
    },
  ];

  // 🔹 Configuración de tabla react-table
  const table = useReactTable({
    data: roles ?? [],
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
      <div className="p-1"></div>
      <h3 className="text-lg font-bold">Asignación de Vista a Roles</h3>
      <div className="px-4 py-3.5 "></div>
      {/* 🔍 Buscador */}
      <Input
        placeholder="Buscar roles..."
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        allowClear
        className="placeholder-gray-500 placeholder-opacity-100 text-base border p-2 rounded w-full mb-4"
        style={{ fontFamily: "inherit" }}
      />

      {/* 📋 Tabla */}
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
                <td key={cell.id} className="p-2 text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {roles.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center p-4 text-gray-500"
              >
                No hay roles registrados
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

      {/* 📌 Modal para configurar vistas */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">
              Vistas de Rol: {selectedRol?.nombre}
            </h2>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {vistas.map((vista) => (
                <label key={vista.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedVistaIds.includes(vista.id)}
                    onChange={() => toggleVista(vista.id)}
                  />
                  <span>{vista.nombre}</span>
                </label>
              ))}
              {vistas.length === 0 && (
                <p className="text-gray-500">No hay vistas registradas</p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

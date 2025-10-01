import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { Suspense, lazy } from "react";

export default function DynamicRoutes({ vistasDisponibles }) {
  return (
    <Routes>
      {vistasDisponibles.map((vista) => {
        // 🔑 Import dinámico según el nombre de la columna "nombre"
        const PageComponent = lazy(() =>
          import(`../pages/${vista.nombre}.jsx`).catch(() => ({
            default: () => <h1>Página {vista.nombre} no encontrada</h1>,
          }))
        );

        return (
          <Route
            key={vista.id}
            path={vista.path}
            element={
              <ProtectedRoute vistasDisponibles={vistasDisponibles}>
                <Suspense fallback={<p>Cargando {vista.nombre}...</p>}>
                  <PageComponent />
                </Suspense>
              </ProtectedRoute>
            }
          />
        );
      })}
    </Routes>
  );
}

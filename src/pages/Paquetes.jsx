// src/pages/Paquetes.jsx
import { useState } from "react";
import PaquetesList from "./PaquetesList";
import Asignaciones from "./Asignaciones";
import PageTitle from "../components/PageTitle";
import EastIcon from '@mui/icons-material/East';
import ArchiveIcon from '@mui/icons-material/Archive';

export default function Paquetes() {
    const [activeTab, setActiveTab] = useState("paquetes");

    return (
        <div className="p-6">
            <PageTitle>Paquetes</PageTitle>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button
                    className={`px-4 py-2 -mb-px font-semibold ${activeTab === "paquetes"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                        }`}
                    onClick={() => setActiveTab("paquetes")}
                >
                    <ArchiveIcon color="primary" /> Paquetes
                </button>
                <button
                    className={`px-4 py-2 -mb-px font-semibold ${activeTab === "asignaciones"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                        }`}
                    onClick={() => setActiveTab("asignaciones")}
                >
                    <EastIcon color="primary" /> Asignaciones
                </button>
            </div>

            {/* Contenido */}
            {activeTab === "paquetes" && <PaquetesList />}
            {activeTab === "asignaciones" && <Asignaciones />}
        </div>
    );
}

// src/pages/ErrorPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./ErrorPage.css"; // Importamos el CSS separado

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="animation-container">
          <div className="calendar">
            <div className="calendar-header"></div>
            <div className="calendar-grid">
              {[...Array(14)].map((_, index) => (
                <div
                  key={index}
                  className="calendar-cell"
                  style={{ animationDelay: `${(index % 3) * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>

          <div className="profile">
            <div className="head">
              <div className="face"></div>
            </div>
          </div>

          <div className="esthetic-lines">
            <div className="line line-1"></div>
            <div className="line line-2"></div>
            <div className="line line-3"></div>
          </div>

          <div className="floating-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>

        <h1 className="error-title">¡Ups! Algo salió mal</h1>
        <p className="error-text">
          Parece que la página que estás buscando no existe u ocurrió un error inesperado.
        </p>

        <button className="error-button" onClick={() => navigate("/login")}>
          Volver al inicio
        </button>
      </div>

      <footer className="error-footer">
        <p>© {new Date().getFullYear()} SGACER </p>
      </footer>
    </div>
  );
}
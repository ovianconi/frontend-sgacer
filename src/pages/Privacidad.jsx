// src/pages/Privacidad.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Privacidad() {
    const navigate = useNavigate();

    // Función para obtener el nombre del mes en español
    const getMonthName = (month) => {
        const months = [
            'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
            'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
        ];
        return months[month];
    };

    // Obtener fecha actual
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const monthName = getMonthName(month);
    const formattedDate = `${day < 10 ? '0' + day : day}/${month + 1 < 10 ? '0' + (month + 1) : month + 1}/${year}`;

    return (
        <div style={styles.container}>
            {/* Elementos decorativos de fondo */}
            <div style={styles.floatingElements}>
                <div style={styles.floatingCircle1}></div>
                <div style={styles.floatingCircle2}></div>
                <div style={styles.floatingCircle3}></div>
            </div>

            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <div style={styles.logo}>
                        <div style={styles.calendarIcon}>
                            <div style={styles.calendarTop}>
                                <div style={styles.calendarMonth}>{monthName}</div>
                            </div>
                            <div style={styles.calendarDay}>{formattedDay}</div>
                        </div>
                        <div style={styles.logoText}>SGACER</div>
                    </div>
                    <p style={styles.tagline}>Sistema de Gestión de Agendamientos</p>
                </div>

                <div style={styles.privacyCard}>
                    <h1 style={styles.title}>Política de Privacidad</h1>
                    <p style={styles.lastUpdated}>Última actualización: {formattedDate}</p>

                    <p style={styles.intro}>
                        Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos,
                        usamos y protegemos tu información al utilizar nuestro servicio.
                    </p>

                    <div style={styles.contentGrid}>
                        <div style={styles.mainContent}>
                            <h2 style={styles.subtitle}>1. Información que recopilamos</h2>
                            <p style={styles.text}>
                                Podemos recopilar información personal como nombre, teléfono, correo electrónico o
                                mensajes enviados a través de WhatsApp para brindar el servicio solicitado.
                            </p>

                            <h2 style={styles.subtitle}>2. Uso de la información</h2>
                            <p style={styles.text}>
                                Usamos la información solo para gestionar reservas, responder consultas y mejorar
                                la experiencia del usuario.
                            </p>

                            <h2 style={styles.subtitle}>3. Compartición de datos</h2>
                            <p style={styles.text}>
                                No compartimos información personal con terceros, salvo cuando sea necesario para
                                brindar el servicio (por ejemplo, proveedores técnicos) o cuando la ley lo requiera.
                            </p>

                            <h2 style={styles.subtitle}>4. Seguridad</h2>
                            <p style={styles.text}>
                                Adoptamos medidas razonables para proteger tu información contra accesos no
                                autorizados o divulgación.
                            </p>

                            <h2 style={styles.subtitle}>5. Contacto</h2>
                            <div style={styles.contactInfo}>
                                <p style={styles.text}>
                                    Si tienes preguntas sobre esta política, puedes escribirnos a:<br />
                                    <strong>
                                        <a href="mailto:ovianconi@fpuna.edu.py" style={styles.emailLink}>
                                            ovianconi@fpuna.edu.py
                                        </a>
                                    </strong>
                                </p>
                            </div>
                        </div>

                        {/* Sidebar con información adicional */}
                        <div style={styles.sidebar}>
                            <div style={styles.sidebarCard}>
                                <h3 style={styles.sidebarTitle}>📋 Tu Información</h3>
                                <p style={styles.sidebarText}>
                                    Controlamos y protegemos tus datos según las normativas vigentes de protección de datos personales.
                                </p>
                            </div>

                            <div style={styles.sidebarCard}>
                                <h3 style={styles.sidebarTitle}>🛡️ Compromiso</h3>
                                <p style={styles.sidebarText}>
                                    Nos comprometemos a mantener la confidencialidad y seguridad de toda la información que nos confíes.
                                </p>
                            </div>

                            <div style={styles.sidebarCard}>
                                <h3 style={styles.sidebarTitle}>⚖️ Transparencia</h3>
                                <p style={styles.sidebarText}>
                                    Creemos en la transparencia sobre cómo utilizamos y protegemos tus datos personales.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={styles.footer}>
                        <p style={styles.footerText}>© {year} SGACER </p>
                        {/*<button
                            onClick={() => navigate(-1)}
                            style={styles.backButton}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 15px rgba(161, 110, 255, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 10px rgba(161, 110, 255, 0.3)';
                            }}
                        >
                            ← Volver atrás
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Inyectar los estilos CSS globales */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                
                @media (max-width: 768px) {
                    .content-grid {
                        grid-template-columns: 1fr !important;
                        gap: 30px !important;
                    }
                    
                    .privacy-card {
                        padding: 30px 20px !important;
                    }
                    
                    .title {
                        font-size: 1.8rem !important;
                    }
                    
                    .logo-text {
                        font-size: 24px !important;
                    }
                    
                    .calendar-icon {
                        width: 45px !important;
                        height: 45px !important;
                    }
                    
                    .floating-circle1,
                    .floating-circle2,
                    .floating-circle3 {
                        display: none !important;
                    }
                }

                @media (max-width: 480px) {
                    .logo {
                        flex-direction: column !important;
                        gap: 10px !important;
                    }
                    
                    .logo-text {
                        font-size: 22px !important;
                    }
                    
                    .title {
                        font-size: 1.6rem !important;
                    }
                    
                    .subtitle {
                        font-size: 1.2rem !important;
                    }
                    
                    .tagline {
                        font-size: 0.9rem !important;
                    }
                }
            `}</style>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0f3ff 0%, #f7e7ff 100%)",
        fontFamily: "'Poppins', sans-serif",
        color: "#333",
        lineHeight: 1.6,
        padding: "20px",
        position: "relative",
        overflow: "hidden",
    },
    floatingElements: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
    },
    floatingCircle1: {
        position: "absolute",
        top: "10%",
        right: "5%",
        width: "120px",
        height: "120px",
        background: "linear-gradient(135deg, rgba(91, 141, 239, 0.1), rgba(161, 110, 255, 0.1))",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite",
    },
    floatingCircle2: {
        position: "absolute",
        bottom: "15%",
        right: "15%",
        width: "80px",
        height: "80px",
        background: "linear-gradient(135deg, rgba(161, 110, 255, 0.1), rgba(91, 141, 239, 0.1))",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite 1s",
    },
    floatingCircle3: {
        position: "absolute",
        top: "40%",
        right: "8%",
        width: "60px",
        height: "60px",
        background: "linear-gradient(135deg, rgba(91, 141, 239, 0.1), rgba(161, 110, 255, 0.1))",
        borderRadius: "50%",
        animation: "float 7s ease-in-out infinite 0.5s",
    },
    contentWrapper: {
        width: "100%",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
    },
    header: {
        textAlign: "center",
        marginBottom: "40px",
        padding: "20px 0",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "10px",
    },
    calendarIcon: {
        width: "50px",
        height: "50px",
        background: "linear-gradient(135deg, #5b8def, #a16eff)",
        borderRadius: "10px",
        position: "relative",
        boxShadow: "0 4px 12px rgba(91, 141, 239, 0.3)",
    },
    calendarTop: {
        height: "15px",
        background: "#4a6fd8",
        borderRadius: "10px 10px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    calendarMonth: {
        color: "white",
        fontSize: "8px",
        fontWeight: "600",
        letterSpacing: "0.5px",
    },
    calendarDay: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "white",
        fontSize: "16px",
        fontWeight: "700",
    },
    logoText: {
        fontSize: "28px",
        fontWeight: "700",
        background: "linear-gradient(90deg, #5b8def, #a16eff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },
    tagline: {
        color: "#666",
        fontSize: "1rem",
        fontWeight: "500",
        margin: 0,
    },
    privacyCard: {
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        padding: "40px",
        animation: "fadeIn 0.8s ease",
    },
    contentGrid: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "40px",
        alignItems: "start",
    },
    mainContent: {
        minWidth: 0,
    },
    sidebar: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    sidebarCard: {
        background: "linear-gradient(135deg, #f8faff, #fdf7ff)",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e0e7ff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },
    sidebarTitle: {
        fontSize: "1rem",
        color: "#5b8def",
        margin: "0 0 10px 0",
        fontWeight: "600",
    },
    sidebarText: {
        fontSize: "0.9rem",
        color: "#666",
        margin: 0,
        lineHeight: 1.5,
    },
    title: {
        fontSize: "2.2rem",
        color: "#3a3a3a",
        marginBottom: "10px",
        textAlign: "center",
    },
    lastUpdated: {
        textAlign: "center",
        color: "#666",
        fontSize: "0.9rem",
        marginBottom: "30px",
        fontWeight: "500",
    },
    intro: {
        fontSize: "1.1rem",
        color: "#555",
        marginBottom: "30px",
        textAlign: "center",
        fontWeight: "500",
    },
    subtitle: {
        fontSize: "1.4rem",
        color: "#5b8def",
        margin: "25px 0 15px 0",
        paddingBottom: "8px",
        borderBottom: "2px solid #e0f3ff",
    },
    text: {
        marginBottom: "15px",
        color: "#555",
    },
    contactInfo: {
        background: "linear-gradient(135deg, #f0f7ff, #f8f0ff)",
        padding: "20px",
        borderRadius: "12px",
        margin: "25px 0",
        borderLeft: "4px solid #5b8def",
    },
    emailLink: {
        color: "#5b8def",
        textDecoration: "none",
        fontWeight: "600",
        transition: "color 0.3s ease",
    },
    footer: {
        textAlign: "center",
        marginTop: "40px",
        paddingTop: "20px",
        borderTop: "1px solid #e0e7ff",
    },
    footerText: {
        color: "#777",
        fontSize: "0.9rem",
        marginBottom: "15px",
    },
    backButton: {
        padding: "10px 20px",
        background: "linear-gradient(90deg, #5b8def, #a16eff)",
        color: "white",
        border: "none",
        borderRadius: "25px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 10px rgba(161, 110, 255, 0.3)",
        fontSize: "1rem",
    },
};
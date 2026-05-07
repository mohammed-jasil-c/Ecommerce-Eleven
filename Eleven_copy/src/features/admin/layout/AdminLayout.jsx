import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Tags,
  Zap,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";

const SIDEBAR_W = 260;
const ACCENT_COLOR = "#2563eb";
const ACCENT_LIGHT = "#dbeafe";
const HOVER_BG = "#f8fafc";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef(null);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock scroll when open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Hover-to-reveal: when mouse hits left 6px edge, open sidebar
  useEffect(() => {
    const onMove = (e) => {
      if (e.clientX <= 6 && !open) {
        if (!hoverTimer.current) {
          hoverTimer.current = setTimeout(() => { setOpen(true); }, 200);
        }
      } else if (e.clientX > SIDEBAR_W + 20) {
        if (hoverTimer.current) {
          clearTimeout(hoverTimer.current);
          hoverTimer.current = null;
        }
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, [open]);

  const navItems = [
    {
      section: "CORE",
      items: [
        { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        { path: "/admin/products", label: "Products", icon: Package },
        { path: "/admin/categories", label: "Categories", icon: Tags },
        { path: "/admin/users", label: "Users", icon: Users },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
      ],
    },
  ];

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const getPageTitle = () => {
    if (location.pathname === "/admin") return "Dashboard";
    if (location.pathname.includes("/admin/users")) return "Users";
    if (location.pathname.includes("/admin/categories/add")) return "Add Category";
    if (location.pathname.includes("/admin/categories")) return "Categories";
    if (location.pathname.includes("/admin/products/add")) return "Add Product";
    if (location.pathname.includes("/admin/products/edit")) return "Edit Product";
    if (location.pathname.includes("/admin/products")) return "Products";
    if (location.pathname.match(/\/admin\/orders\/\d/)) return "Order Details";
    if (location.pathname.includes("/admin/orders")) return "Orders";
    return "Admin";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>

      {/* ═══ Overlay backdrop ═══ */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.2)",
            zIndex: 40,
            cursor: "pointer",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ═══ Sidebar ═══ */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: `${SIDEBAR_W}px`,
          background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
          borderRight: "1px solid #e5e7eb",
          zIndex: 45,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: open ? "8px 0 24px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {/* Header with Logo & Branding */}
        <div
          style={{
            padding: "1.5rem 1.25rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "70px",
          }}
        >
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none",
              flex: 1,
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: `linear-gradient(135deg, ${ACCENT_COLOR}, #1e40af)`,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              E
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "#1f2937",
                  textTransform: "uppercase",
                }}
              >
                Eleven
              </span>
              <span
                style={{
                  fontSize: "0.55rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                }}
              >
                Admin
              </span>
            </div>
          </Link>

          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s ease",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#374151";
              e.currentTarget.style.background = HOVER_BG;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
              e.currentTarget.style.background = "none";
            }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
          {navItems.map((section, idx) => (
            <div key={section.section} style={{ marginBottom: idx === navItems.length - 1 ? "0" : "1.25rem" }}>
              {/* Section Label */}
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  padding: "0.5rem 1rem",
                  marginBottom: "0.5rem",
                }}
              >
                {section.section}
              </p>

              {/* Navigation Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.85rem",
                        padding: "0.7rem 1rem",
                        margin: "0",
                        fontSize: "0.8rem",
                        fontWeight: active ? 600 : 500,
                        color: active ? ACCENT_COLOR : "#6b7280",
                        textDecoration: "none",
                        borderRadius: "8px",
                        background: active ? ACCENT_LIGHT : "transparent",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = HOVER_BG;
                          e.currentTarget.style.color = "#1f2937";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#6b7280";
                        }
                      }}
                    >
                      <Icon
                        size={19}
                        strokeWidth={active ? 2.2 : 1.8}
                        style={{
                          minWidth: "19px",
                          transition: "transform 0.2s ease",
                        }}
                      />
                      <span>{item.label}</span>
                      {active && (
                        <div
                          style={{
                            position: "absolute",
                            right: "1rem",
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: ACCENT_COLOR,
                            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Status Indicator */}
        <div
          style={{
            padding: "1rem 1rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "#f9fafb",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
          <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#6b7280" }}>
            Admin Online
          </span>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: "0.75rem 0.5rem", borderTop: "1px solid #e5e7eb" }}>
          <Link
            to="/"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.65rem 1rem",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "#6b7280",
              textDecoration: "none",
              borderRadius: "8px",
              background: "transparent",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = HOVER_BG;
              e.currentTarget.style.color = "#1f2937";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <ExternalLink size={18} />
            <span>View Store</span>
          </Link>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
          width: "100%",
        }}
      >
        {/* Top Bar */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "0 clamp(1rem, 3vw, 2rem)",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Left: Hamburger + Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <button
              onClick={() => setOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#374151",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s ease",
                borderRadius: "6px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = HOVER_BG;
                e.currentTarget.style.color = "#1f2937";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#374151";
              }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Admin
              </span>
              <ChevronRight size={14} style={{ color: "#d1d5db" }} />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#1f2937",
                }}
              >
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right: View Store + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.55rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "inherit",
                letterSpacing: "0.06em",
                color: "#4b5563",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = ACCENT_COLOR;
                e.currentTarget.style.color = ACCENT_COLOR;
                e.currentTarget.style.background = ACCENT_LIGHT;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.color = "#4b5563";
                e.currentTarget.style.background = "#f3f4f6";
              }}
            >
              <ExternalLink size={15} />
              <span className="admin-topbar-label">View Store</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.55rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "inherit",
                letterSpacing: "0.06em",
                color: "#dc2626",
                background: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "#dc2626";
                e.currentTarget.style.borderColor = "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#dc2626";
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.borderColor = "#fee2e2";
              }}
            >
              <LogOut size={15} />
              <span className="admin-topbar-label">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "clamp(1.25rem, 3vw, 2.5rem)", overflowY: "auto" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: "1rem clamp(1rem, 3vw, 2rem)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f9fafb",
          }}
        >
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#d1d5db", fontWeight: 500 }}>
            © {new Date().getFullYear()} Eleven Admin Panel
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)" }} />
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", fontWeight: 500 }}>
              System Online
            </span>
          </div>
        </footer>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 480px) {
          .admin-topbar-label {
            display: none;
          }
        }

        /* Smooth scrollbar */
        nav::-webkit-scrollbar {
          width: 6px;
        }

        nav::-webkit-scrollbar-track {
          background: transparent;
        }

        nav::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        nav::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
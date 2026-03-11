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
} from "lucide-react";

const SIDEBAR_W = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        // Clear pending open if mouse moved away from edge
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
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
  ];

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const getPageTitle = () => {
    if (location.pathname === "/admin") return "Dashboard";
    if (location.pathname.includes("/admin/users")) return "Users";
    if (location.pathname.includes("/admin/products/add")) return "Add Product";
    if (location.pathname.includes("/admin/products/edit")) return "Edit Product";
    if (location.pathname.includes("/admin/products")) return "Products";
    if (location.pathname.match(/\/admin\/orders\/\d/)) return "Order Details";
    if (location.pathname.includes("/admin/orders")) return "Orders";
    return "Admin";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>

      {/* ═══ Overlay backdrop ═══ */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
            zIndex: 40,
            cursor: "pointer",
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
          background: "#fff",
          borderRight: "1px solid #e5e5e5",
          zIndex: 45,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: open ? "4px 0 20px rgba(0,0,0,0.06)" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.25rem",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "56px",
          }}
        >
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: "#000",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            ELEVEN{" "}
            <span style={{ fontWeight: 300, color: "#999", letterSpacing: "0.12em" }}>
              Admin
            </span>
          </Link>

          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#999",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
          <div style={{ padding: "0 0.6rem" }}>
            <p
              style={{
                fontSize: "0.55rem",
                fontWeight: 500,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#bbb",
                padding: "0 0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              Menu
            </p>

            {navItems.map((item) => {
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
                    gap: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    marginBottom: "2px",
                    fontSize: "0.8rem",
                    fontWeight: active ? 500 : 400,
                    color: active ? "#000" : "#888",
                    textDecoration: "none",
                    borderRadius: "6px",
                    background: active ? "#f5f5f5" : "transparent",
                    transition: "all 0.15s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "#f9f9f9";
                      e.currentTarget.style.color = "#000";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#888";
                    }
                  }}
                >
                  <Icon size={17} strokeWidth={active ? 2 : 1.5} />
                  {item.label}
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "25%",
                        bottom: "25%",
                        width: "3px",
                        background: "#000",
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <button
            onClick={() => { setOpen(false); navigate("/"); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0",
              fontSize: "0.75rem",
              color: "#888",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          >
            <ExternalLink size={15} />
            View Store
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0",
              fontSize: "0.75rem",
              color: "#888",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c41e3a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          >
            <LogOut size={15} />
            Logout
          </button>
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
            borderBottom: "1px solid #e5e5e5",
            padding: "0 clamp(1rem, 3vw, 2rem)",
            height: "56px",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#000",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              transition: "color 0.15s ease",
            }}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#bbb",
              }}
            >
              Admin
            </span>
            <ChevronRight size={12} style={{ color: "#ccc" }} />
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#000",
              }}
            >
              {getPageTitle()}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "clamp(1rem, 3vw, 2rem)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid #f0f0f0",
            padding: "0.75rem clamp(1rem, 3vw, 2rem)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ccc" }}>
            © {new Date().getFullYear()} Eleven Admin
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2d8a4e", display: "inline-block" }} />
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb" }}>
              Online
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
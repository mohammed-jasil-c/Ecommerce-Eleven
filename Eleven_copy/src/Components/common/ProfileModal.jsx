import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Package, MapPin, Lock, LogOut } from "lucide-react";

const ProfileModal = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Delay adding listener so the click that opens the modal isn't immediately caught
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
  const initial = displayName?.charAt(0)?.toUpperCase() || "U";
  const email = user?.email || "";

  const menuItems = [
    { icon: <User size={15} strokeWidth={1.8} />, label: "My Profile", path: "/profile" },
    { icon: <Package size={15} strokeWidth={1.8} />, label: "My Orders", path: "/orders" },
    { icon: <MapPin size={15} strokeWidth={1.8} />, label: "Saved Addresses", path: "/addresses" },
    { icon: <Lock size={15} strokeWidth={1.8} />, label: "Change Password", path: "/change-password" },
  ];

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: "56px",
        right: "clamp(1rem, 4vw, 2.5rem)",
        width: "280px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
        zIndex: 100,
        overflow: "hidden",
        animation: "dropdownSlideIn 0.2s ease-out",
      }}
    >
      {/* Inline keyframe animation */}
      <style>{`
        @keyframes dropdownSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .profile-menu-item:hover {
          background: #f7f7f7 !important;
        }
        .profile-menu-item:active {
          background: #efefef !important;
        }
        .profile-logout-item:hover {
          background: #fef2f2 !important;
        }
        .profile-logout-item:active {
          background: #fee2e2 !important;
        }
      `}</style>

      {/* ─── User Info Header ─── */}
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Avatar */}
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          </div>

          {/* Name & Email */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#111",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              {displayName}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#888",
                margin: "2px 0 0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {email}
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.65rem",
            color: "#22c55e",
            margin: "8px 0 0",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          Signed in
        </p>
      </div>

      {/* ─── Menu Items ─── */}
      <div style={{ padding: "6px 0" }}>
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="profile-menu-item"
            onClick={() => handleNavigation(item.path)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "11px 18px",
              fontSize: "0.8rem",
              fontWeight: 400,
              fontFamily: "inherit",
              color: "#333",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s ease",
              letterSpacing: "0.01em",
            }}
          >
            <span style={{ color: "#555", display: "flex", alignItems: "center" }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "#f0f0f0",
            margin: "4px 0",
          }}
        />

        {/* Logout */}
        <button
          className="profile-logout-item"
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "11px 18px",
            fontSize: "0.8rem",
            fontWeight: 500,
            fontFamily: "inherit",
            color: "#ef4444",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "background 0.15s ease",
            letterSpacing: "0.01em",
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <LogOut size={15} strokeWidth={1.8} />
          </span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
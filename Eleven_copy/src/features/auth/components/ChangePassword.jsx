import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import gsap from "gsap";
import api from "../../../api/apiService";
import { Lock, Eye, EyeOff, Shield, Save } from "lucide-react";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out", delay: 0.15 }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await api.put("/auth/change-password/", {
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      toast.success("Password changed successfully. Please login again.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-body)",
    fontSize: "0.65rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    marginBottom: "0.5rem",
  };

  const inputWrapperStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const toggleBtnStyle = {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--color-text-muted)",
    display: "flex",
    alignItems: "center",
    padding: 0,
    transition: "color 0.15s ease",
  };

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner">
          <div className="hero-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Change Password</span>
          </div>
          <h1>Change Password</h1>
          <div className="hero-sub">
            <div className="divider-gold" style={{ margin: 0, width: "40px" }} />
            <p>Update your account security</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="page-section" style={{ maxWidth: "520px" }}>
        <div
          ref={cardRef}
          className="glass-light"
          style={{ padding: "2.5rem", borderRadius: "var(--radius-lg)", opacity: 0 }}
        >
          {/* Icon */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 1rem",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={28} style={{ color: "var(--color-white)" }} />
            </div>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 400,
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
              }}
            >
              Account Security
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Current Password */}
            <div>
              <label style={labelStyle}>Current Password</label>
              <div style={inputWrapperStyle}>
                <input
                  type={showOld ? "text" : "password"}
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  required
                  className="input-premium"
                  placeholder="Enter current password"
                  style={{ paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  style={toggleBtnStyle}
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={labelStyle}>New Password</label>
              <div style={inputWrapperStyle}>
                <input
                  type={showNew ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  className="input-premium"
                  placeholder="Enter new password"
                  style={{ paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={toggleBtnStyle}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <div style={inputWrapperStyle}>
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  className="input-premium"
                  placeholder="Confirm new password"
                  style={{ paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={toggleBtnStyle}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-premium btn-primary"
              style={{
                width: "100%",
                borderRadius: "var(--radius-sm)",
                marginTop: "0.5rem",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {loading ? (
                  <>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock size={13} /> Update Password
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Security Note */}
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
                letterSpacing: "0.02em",
              }}
            >
              For your security, you'll be required to log in again after changing your password.
              Use a strong password with a mix of letters, numbers, and symbols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
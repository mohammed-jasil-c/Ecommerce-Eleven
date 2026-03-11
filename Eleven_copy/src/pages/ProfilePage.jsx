import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import api from "../api/apiService";
import { toast } from "react-toastify";
import { User, Save } from "lucide-react";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ full_name: "", phone_number: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile/");
        setProfile(res.data);
        setFormData({
          full_name: res.data.full_name || "",
          phone_number: res.data.phone_number || "",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (!loading && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", delay: 0.15 }
      );
    }
  }, [loading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put("/auth/profile/", formData);
      setProfile(res.data);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ═══ LOADING ═══ */
  if (loading) {
    return (
      <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
        <section className="page-hero">
          <div className="hero-inner"><h1>My Profile</h1></div>
        </section>
        <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
          <div
            style={{
              width: "40px", height: "40px",
              border: "3px solid rgba(201,169,110,0.2)",
              borderTopColor: "var(--color-accent)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner">
          <div className="hero-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Profile</span>
          </div>
          <h1>My Profile</h1>
          <div className="hero-sub">
            <div className="divider-gold" style={{ margin: 0, width: "40px" }} />
            <p>Manage your account details</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="page-section" style={{ maxWidth: "600px" }}>
        <div
          ref={cardRef}
          className="glass-light"
          style={{ padding: "2.5rem", borderRadius: "var(--radius-lg)", opacity: 0 }}
        >
          {/* Avatar */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "80px", height: "80px", margin: "0 auto 1rem", borderRadius: "50%",
                background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <User size={32} style={{ color: "var(--color-accent)" }} />
            </div>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 400 }}>
              {profile?.full_name || profile?.email}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Email (read-only) */}
            <div>
              <label
                style={{
                  display: "block", fontFamily: "var(--font-body)", fontSize: "0.65rem",
                  fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--color-text-muted)", marginBottom: "0.5rem",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="input-premium"
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>

            {/* Full Name */}
            <div>
              <label
                style={{
                  display: "block", fontFamily: "var(--font-body)", fontSize: "0.65rem",
                  fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--color-text-muted)", marginBottom: "0.5rem",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input-premium"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                style={{
                  display: "block", fontFamily: "var(--font-body)", fontSize: "0.65rem",
                  fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--color-text-muted)", marginBottom: "0.5rem",
                }}
              >
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="input-premium"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-premium btn-primary"
              style={{
                width: "100%", borderRadius: "var(--radius-sm)", marginTop: "0.5rem",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {saving ? (
                  <>
                    <div
                      style={{
                        width: "14px", height: "14px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Saving...
                  </>
                ) : (
                  <><Save size={13} /> Save Changes</>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
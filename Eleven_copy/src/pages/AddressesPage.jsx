import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import api from "../api/apiService";
import { toast } from "react-toastify";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "", phone: "", address_line: "",
    city: "", state: "", pincode: "", is_default: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const listRef = useRef(null);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/auth/addresses/");
      setAddresses(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  // GSAP entrance for address list
  useEffect(() => {
    if (listRef.current && addresses.length > 0) {
      const cards = listRef.current.querySelectorAll(".addr-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power3.out" }
      );
    }
  }, [addresses.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const resetForm = () => {
    setFormData({ full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "", is_default: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/auth/addresses/${editingId}/`, formData);
        toast.success("Address updated");
      } else {
        await api.post("/auth/addresses/", formData);
        toast.success("Address added");
      }
      resetForm();
      fetchAddresses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address");
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowForm(true);
    // Scroll to form on mobile
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleDelete = async (id) => {
    await api.delete(`/auth/addresses/${id}/`);
    toast.success("Address deleted");
    fetchAddresses();
  };

  const fields = [
    { name: "full_name", label: "Full Name", type: "text", placeholder: "John Doe" },
    { name: "phone", label: "Phone", type: "text", placeholder: "+91 98765 43210" },
    { name: "address_line", label: "Address", type: "text", placeholder: "123 Fashion Avenue" },
    { name: "city", label: "City", type: "text", placeholder: "Mumbai" },
    { name: "state", label: "State", type: "text", placeholder: "Maharashtra" },
    { name: "pincode", label: "Pincode", type: "text", placeholder: "400001" },
  ];

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner">
          <div className="hero-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Addresses</span>
          </div>
          <h1>Saved Addresses</h1>
          <div className="hero-sub">
            <div className="divider-gold" style={{ margin: 0, width: "40px" }} />
            <p>{addresses.length} {addresses.length === 1 ? "address" : "addresses"} saved</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="page-section" style={{ maxWidth: "900px" }}>
        {/* Add button */}
        {!showForm && (
          <div style={{ marginBottom: "2rem", textAlign: "right" }}>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="btn-premium btn-primary"
              style={{ borderRadius: "var(--radius-sm)", fontSize: "0.6rem" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Plus size={13} /> Add New Address
              </span>
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div
            ref={formRef}
            className="glass-light"
            style={{ padding: "2rem", borderRadius: "var(--radius-lg)", marginBottom: "2rem" }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 400, marginBottom: "1.5rem",
              }}
            >
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: "1.25rem" }}>
              {fields.map((field) => (
                <div key={field.name}>
                  <label
                    style={{
                      display: "block", fontFamily: "var(--font-body)", fontSize: "0.65rem",
                      fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
                      color: "var(--color-text-muted)", marginBottom: "0.5rem",
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    className="input-premium"
                  />
                </div>
              ))}
            </div>

            {/* Default checkbox */}
            <label
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem",
                fontSize: "0.8rem", fontFamily: "var(--font-body)", color: "var(--color-text-muted)", cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleChange}
                style={{ accentColor: "var(--color-accent)" }}
              />
              Set as default address
            </label>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleSubmit}
                className="btn-premium btn-primary"
                style={{ borderRadius: "var(--radius-sm)", flex: 1 }}
              >
                <span>{editingId ? "Update Address" : "Save Address"}</span>
              </button>
              <button
                onClick={resetForm}
                style={{
                  flex: 1, padding: "0.75rem", fontSize: "0.6rem",
                  fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.15em",
                  textTransform: "uppercase", color: "var(--color-text-muted)",
                  background: "transparent", border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 && !showForm ? (
          <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
            <div
              style={{
                width: "80px", height: "80px", margin: "0 auto 2rem", borderRadius: "50%",
                background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <MapPin size={32} style={{ color: "var(--color-text-light)" }} />
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.75rem" }}>
              No Saved Addresses
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
              Add a delivery address to speed up checkout.
            </p>
          </div>
        ) : (
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`addr-card address-card ${addr.is_default ? "default" : ""}`}
              >
                {addr.is_default && <span className="default-badge">Default</span>}

                <h4 style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                  {addr.full_name}
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.15rem" }}>
                  {addr.phone}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.15rem" }}>
                  {addr.address_line}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button
                    onClick={() => handleEdit(addr)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.3rem",
                      fontSize: "0.65rem", fontFamily: "var(--font-body)", fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--color-accent)", background: "none", border: "none",
                      cursor: "pointer", transition: "opacity 0.2s ease",
                    }}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.3rem",
                      fontSize: "0.65rem", fontFamily: "var(--font-body)", fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--color-error)", background: "none", border: "none",
                      cursor: "pointer", transition: "opacity 0.2s ease",
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressesPage;
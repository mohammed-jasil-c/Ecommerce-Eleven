import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/apiService";
import { ArrowLeft } from "lucide-react";

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    original_price: "",
    category: "",
    gender: "",
    description: "",
    is_featured: false,
    is_new: false,
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/products/categories/");
      setCategories(res.data.results || res.data);
    } catch (error) {
      console.error("Failed to load categories");
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${productId}/`);
      const product = res.data;
      setFormData({
        name: product.name || "",
        price: product.price || "",
        original_price: product.original_price || "",
        category: product.category?.id || "",
        gender: product.gender || "",
        description: product.description || "",
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        is_active: product.is_active ?? true,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/products/${productId}/update/`, {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      });
      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error.response?.data || error);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem 0.75rem",
    fontSize: "0.85rem",
    fontFamily: "inherit",
    border: "1px solid #e5e5e5",
    outline: "none",
    background: "#fff",
    transition: "border-color 0.15s ease",
  };

  const labelStyle = {
    fontSize: "0.65rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#999",
    marginBottom: "0.4rem",
    display: "block",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div style={{ width: "24px", height: "24px", border: "2px solid #e5e5e5", borderTopColor: "#000", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => navigate("/admin/products")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.75rem",
              fontWeight: 400,
              fontFamily: "inherit",
              color: "#888",
              background: "none",
              border: "none",
              cursor: "pointer",
              marginBottom: "0.75rem",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          >
            <ArrowLeft size={15} /> Back to Products
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.04em" }}>Edit Product</h1>
        </div>

        {/* Form */}
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={labelStyle}>Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="Product Name"
                onFocus={(e) => (e.target.style.borderColor = "#000")} onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required style={inputStyle} placeholder="Price"
                  onFocus={(e) => (e.target.style.borderColor = "#000")} onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
              </div>
              <div>
                <label style={labelStyle}>Original Price (₹)</label>
                <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} style={inputStyle} placeholder="Original Price"
                  onFocus={(e) => (e.target.style.borderColor = "#000")} onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
              </div>
            </div>

            {/* Category and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select Gender</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ ...inputStyle, resize: "vertical" }} placeholder="Description"
                onFocus={(e) => (e.target.style.borderColor = "#000")} onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
            </div>

            {/* Checkboxes */}
            <div style={{ display: "flex", gap: "2rem", borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem", marginBottom: "1.5rem" }}>
              {[
                { name: "is_featured", label: "Featured", checked: formData.is_featured },
                { name: "is_new", label: "New Arrival", checked: formData.is_new },
                { name: "is_active", label: "Active", checked: formData.is_active },
              ].map((cb) => (
                <label key={cb.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name={cb.name}
                    checked={cb.checked}
                    onChange={handleChange}
                    style={{ width: "16px", height: "16px", accentColor: "#000", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "#666" }}>{cb.label}</span>
                </label>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                padding: "0.7rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                fontFamily: "inherit",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                background: "#000",
                color: "#fff",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.5 : 1,
                transition: "opacity 0.15s ease",
              }}
            >
              {saving ? "Updating Product..." : "Update Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/apiService";
import { Upload, X, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const AddCategory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name if user is typing name
      ...(name === "name" && !prev.slug
        ? { slug: value.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^\w-]+/g, "") }
        : {}),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      
      if (formData.image) {
        data.append("image", formData.image);
      }

      await api.post("/products/categories/create/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Category created successfully");
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error creating category:", error);
      const errorMessage = error.response?.data?.name?.[0] || error.response?.data?.slug?.[0] || "Failed to create category";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => navigate("/admin/categories")}
          style={{
            background: "none",
            border: "1px solid #e5e5e5",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#000",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e5"; }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.04em" }}>Add Category</h1>
          <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.25rem" }}>
            Create a new product category
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Basic Info Card */}
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
            Category Details
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem" }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  border: "1px solid #e5e5e5",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={(e) => (e.target.style.borderColor = "#000")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
                placeholder="e.g. Sneakers"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem" }}>
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  border: "1px solid #e5e5e5",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={(e) => (e.target.style.borderColor = "#000")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
                placeholder="e.g. sneakers"
              />
              <p style={{ fontSize: "0.65rem", color: "#999", marginTop: "0.3rem" }}>
                The URL-friendly version of the name. Must be unique.
              </p>
            </div>
          </div>
        </div>

        {/* Media Card */}
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
            Category Image
          </h2>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {preview ? (
              <div style={{ position: "relative", width: "120px", height: "120px", border: "1px solid #e5e5e5" }}>
                <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    width: "24px",
                    height: "24px",
                    background: "#c41e3a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  width: "120px",
                  height: "120px",
                  border: "1px dashed #ccc",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  color: "#666",
                  background: "#fafafa",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.color = "#666"; }}
              >
                <Upload size={20} />
                <span style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Upload
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
          <p style={{ fontSize: "0.65rem", color: "#999", marginTop: "1rem" }}>
            Recommended: 800x800px. Max size: 5MB. Formats: JPG, PNG, WEBP.
          </p>
        </div>

        {/* Submit Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            style={{
              padding: "0.7rem 1.5rem",
              fontSize: "0.75rem",
              fontWeight: 500,
              fontFamily: "inherit",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "transparent",
              color: "#000",
              border: "1px solid #000",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.7rem 1.5rem",
              fontSize: "0.75rem",
              fontWeight: 500,
              fontFamily: "inherit",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: loading ? "#999" : "#000",
              color: "#fff",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s ease"
            }}
          >
            {loading ? (
              <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            ) : (
              <Save size={14} />
            )}
            {loading ? "Saving..." : "Save Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/apiService";
import { ArrowLeft, Upload, X } from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

  const availableColors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Brown", "Gray"];
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    description: "",
    stock: "",
    colors: [],
    sizes: [],
    featured: false,
    new: true,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/products/categories/");
        setCategories(res.data.results || res.data);
      } catch (error) {
        console.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sizes.length) { alert("Please select at least one size."); return; }
    if (!formData.colors.length) { alert("Please select at least one color."); return; }
    if (!formData.stock || parseInt(formData.stock) < 0) { alert("Please enter valid stock."); return; }

    setLoading(true);
    try {
      const productRes = await api.post("/products/create/", {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: formData.category,
        is_featured: formData.featured,
        is_new: formData.new,
        is_active: true,
      });

      const productId = productRes.data.id;

      // Upload Images
      if (images.length > 0) {
        for (let image of images) {
          const imageFormData = new FormData();
          imageFormData.append("product", productId);
          imageFormData.append("image", image);

          await api.post("/products/images/upload/", imageFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }
      }

      // Create Variants
      for (let size of formData.sizes) {
        for (let color of formData.colors) {
          await api.post("/products/variants/create/", {
            product: productId,
            size,
            color,
            stock: parseInt(formData.stock),
          });
        }
      }
      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error(error.response?.data || error);
      alert("Failed to add product. Check console for details.");
    } finally {
      setLoading(false);
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.04em" }}>Add New Product</h1>
        </div>

        {/* Form */}
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={labelStyle}>Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#000")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
              />
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Price (₹)</label>
                <input type="number" name="price" placeholder="0" value={formData.price} onChange={handleChange} required style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#000")} onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
              </div>
              <div>
                <label style={labelStyle}>Original Price (₹)</label>
                <input type="number" name="originalPrice" placeholder="0" value={formData.originalPrice} onChange={handleChange} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#000")} onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
              </div>
            </div>

            {/* Category + Stock */}
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
                <label style={labelStyle}>Stock per Variant</label>
                <input type="number" name="stock" placeholder="0" value={formData.stock} onChange={handleChange} required style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#000")} onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")} />
              </div>
            </div>

            {/* Colors */}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem", marginBottom: "1.25rem" }}>
              <label style={labelStyle}>Colors</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      fontFamily: "inherit",
                      letterSpacing: "0.05em",
                      border: `1px solid ${formData.colors.includes(color) ? "#000" : "#e5e5e5"}`,
                      background: formData.colors.includes(color) ? "#000" : "#fff",
                      color: formData.colors.includes(color) ? "#fff" : "#888",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem", marginBottom: "1.25rem" }}>
              <label style={labelStyle}>Sizes</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      fontFamily: "inherit",
                      letterSpacing: "0.05em",
                      border: `1px solid ${formData.sizes.includes(size) ? "#000" : "#e5e5e5"}`,
                      background: formData.sizes.includes(size) ? "#000" : "#fff",
                      color: formData.sizes.includes(size) ? "#fff" : "#888",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Images Upload - New */}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem", marginBottom: "1.25rem" }}>
              <label style={labelStyle}>Product Images</label>

              <div
                style={{
                  border: "1px dashed #e5e5e5",
                  padding: "2rem",
                  textAlign: "center",
                  background: "#fafafa",
                  cursor: "pointer",
                  marginBottom: "1rem",
                  transition: "border-color 0.15s ease"
                }}
                onClick={() => document.getElementById('imageUpload').click()}
                onMouseEnter={(e) => (e.target.style.borderColor = "#000")}
                onMouseLeave={(e) => (e.target.style.borderColor = "#e5e5e5")}
              >
                <Upload size={24} color="#999" style={{ margin: "0 auto 0.5rem" }} />
                <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>Click to browse or drag and drop images</p>
                <input
                  id="imageUpload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {images.map((file, index) => (
                    <div key={index} style={{ position: "relative", width: "80px", height: "100px" }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", border: "1px solid #e5e5e5" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          background: "#000",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={(e) => (e.target.style.borderColor = "#000")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
              />
            </div>

            {/* Checkboxes */}
            <div style={{ display: "flex", gap: "2rem", borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem", marginBottom: "1.5rem" }}>
              {[
                { name: "featured", label: "Featured", checked: formData.featured },
                { name: "new", label: "New Arrival", checked: formData.new },
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
              disabled={loading}
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
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                transition: "opacity 0.15s ease",
              }}
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/apiService";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/products/categories/");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/products/categories/${categoryId}/delete/`);
        toast.success("Category deleted");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
      }
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div style={{ width: "24px", height: "24px", border: "2px solid #e5e5e5", borderTopColor: "#000", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.04em" }}>Categories</h1>
          <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.25rem" }}>
            Manage product categories for your store
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/categories/add")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1.25rem",
            fontSize: "0.7rem",
            fontWeight: 500,
            fontFamily: "inherit",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "#000",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 0 160px", padding: "0.4rem 0.75rem", fontSize: "0.8rem", fontFamily: "inherit", border: "1px solid #e5e5e5", outline: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "#000")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")}
          >
            {/* Image */}
            <div style={{ height: "160px", background: "#f5f5f5", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {category.image ? (
                <img src={category.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={category.name} />
              ) : (
                <span style={{ fontSize: "0.7rem", color: "#ccc", letterSpacing: "0.1em", textTransform: "uppercase" }}>No Image</span>
              )}
            </div>

            {/* Details */}
            <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 400, color: "#000", marginBottom: "0.35rem" }}>
                {category.name}
              </h3>
              <p style={{ fontSize: "0.7rem", color: "#999", marginBottom: "1rem" }}>
                /{category.slug}
              </p>

              <div style={{ marginTop: "auto", display: "flex", gap: "0.35rem" }}>
                <button
                  onClick={() => deleteCategory(category.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.25rem",
                    padding: "0.45rem",
                    fontSize: "0.6rem",
                    fontWeight: 500,
                    fontFamily: "inherit",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    border: "1px solid #fecaca",
                    background: "#fff",
                    color: "#c41e3a",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#c41e3a"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#c41e3a"; }}
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "#ccc", fontSize: "0.8rem" }}>
          No categories found
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;

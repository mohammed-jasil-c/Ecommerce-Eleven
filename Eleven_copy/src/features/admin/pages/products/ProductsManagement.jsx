import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/apiService";
import { Plus, Pencil, Trash2 } from "lucide-react";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/");
      const data = response.data.results || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${productId}/delete/`);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const getStockStatus = (product) => {
    const totalStock =
      product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
    if (totalStock === 0) return { text: "OUT OF STOCK", color: "#c41e3a", bg: "#fef2f2", border: "#fecaca" };
    if (totalStock < 5) return { text: "LOW STOCK", color: "#b87514", bg: "#fffbeb", border: "#fef3cd" };
    if (totalStock < 10) return { text: "LIMITED", color: "#b87514", bg: "#fffbeb", border: "#fef3cd" };
    return { text: "IN STOCK", color: "#2d8a4e", bg: "#f0fdf4", border: "#d1fae5" };
  };

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
  ];

  const filteredProducts = products
    .filter((product) => {
      const totalStock =
        product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.category?.name === categoryFilter;
      const matchesStock =
        stockFilter === "all"
          ? true
          : stockFilter === "in-stock"
            ? totalStock > 0
            : stockFilter === "out-of-stock"
              ? totalStock === 0
              : stockFilter === "low-stock"
                ? totalStock > 0 && totalStock < 10
                : true;
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc": return (a.name || "").localeCompare(b.name || "");
        case "name-desc": return (b.name || "").localeCompare(a.name || "");
        case "price-low": return (a.price || 0) - (b.price || 0);
        case "price-high": return (b.price || 0) - (a.price || 0);
        case "newest": return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "oldest": return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        default: return 0;
      }
    });

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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.04em" }}>Products</h1>
          <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.25rem" }}>
            Manage your store products and inventory
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/products/add")}
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
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Products", value: products.length, color: "#000" },
          { label: "Out of Stock", value: products.filter((p) => (p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0) === 0).length, color: "#c41e3a" },
          { label: "Low Stock", value: products.filter((p) => { const t = p.variants?.reduce((s, v) => s + v.stock, 0) || 0; return t > 0 && t < 10; }).length, color: "#b87514" },
          { label: "Categories", value: new Set(products.map((p) => p.category?.name).filter(Boolean)).size, color: "#000" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1rem" }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999" }}>{s.label}</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 300, color: s.color, marginTop: "0.25rem" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 0 160px", padding: "0.4rem 0.75rem", fontSize: "0.8rem", fontFamily: "inherit", border: "1px solid #e5e5e5", outline: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "#000")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: "0.4rem 0.5rem", fontSize: "0.75rem", fontFamily: "inherit", border: "1px solid #e5e5e5", outline: "none", background: "#fff" }}>
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
          ))}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} style={{ padding: "0.4rem 0.5rem", fontSize: "0.75rem", fontFamily: "inherit", border: "1px solid #e5e5e5", outline: "none", background: "#fff" }}>
          <option value="all">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "0.4rem 0.5rem", fontSize: "0.75rem", fontFamily: "inherit", border: "1px solid #e5e5e5", outline: "none", background: "#fff" }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name-asc">Name A → Z</option>
          <option value="name-desc">Name Z → A</option>
          <option value="price-low">Price Low → High</option>
          <option value="price-high">Price High → Low</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          const totalStock =
            product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;

          return (
            <div
              key={product.id}
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
              <div style={{ height: "180px", background: "#f5f5f5", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {product.image || product.images?.[0]?.image ? (
                  <img src={product.image || product.images?.[0]?.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                ) : (
                  <span style={{ fontSize: "0.7rem", color: "#ccc", letterSpacing: "0.1em", textTransform: "uppercase" }}>No Image</span>
                )}
              </div>

              {/* Details */}
              <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: "0.25rem" }}>
                  {product.category?.name || "Uncategorized"}
                </p>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 400, color: "#000", marginBottom: "0.35rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: "0.95rem", fontWeight: 400, color: "#000", marginBottom: "0.75rem" }}>
                  ₹{Number(product.price).toLocaleString()}
                </p>

                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.6rem", borderTop: "1px solid #f0f0f0", marginBottom: "0.6rem" }}>
                    <span style={{
                      fontSize: "0.55rem",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "0.15rem 0.4rem",
                      border: `1px solid ${stockStatus.border}`,
                      background: stockStatus.bg,
                      color: stockStatus.color,
                    }}>
                      {stockStatus.text}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#ccc" }}>{totalStock} units</span>
                  </div>

                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
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
                        border: "1px solid #e5e5e5",
                        background: "#fff",
                        color: "#000",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
                    >
                      <Pencil size={11} /> Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
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
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "#ccc", fontSize: "0.8rem" }}>
          No products found
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
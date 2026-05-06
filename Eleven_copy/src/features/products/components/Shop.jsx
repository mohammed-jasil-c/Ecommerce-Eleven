import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import gsap from "gsap";
import ProductCard from "../../../components/ui/ProductCard";
import api from "../../../api/apiService";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ArrowRight,
} from "lucide-react";

const ShopPage = () => {
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const gridRef = useRef(null);
  

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
  if (searchInputRef.current) {
    searchInputRef.current.focus();
  }
}, [products]);

  // Sync Category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    setSelectedCategory(category || "all");
    setCurrentPage(1);
  }, [location.search]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("products/categories/");
        setCategories(res.data || []);
      } catch (error) {
        console.error("Category fetch error:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (products.length === 0) {
      setLoading(true);
}

        const params = new URLSearchParams(location.search);
        params.set("page", currentPage);

        if (selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }

        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch);
        }

        const response = await api.get(`products/?${params.toString()}`);
        const data = response.data;

        setProducts(data.results || []);
        setNextPage(data.next);
        setPrevPage(data.previous);
      } catch (error) {
        console.error("Product fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search, selectedCategory, debouncedSearch, currentPage]);

  // Product grid fade-in
  useEffect(() => {
    if (loading || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll(".product-card");
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all",
      }
    );
  }, [loading, products, currentPage]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    setMobileFilterOpen(false);
  };

  const activeCategoryName =
    selectedCategory === "all"
      ? "All Products"
      : categories.find((c) => c.slug === selectedCategory)?.name || "Collection";

  const searchInputRef = useRef(null);    

  // Loading
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff' }}>
        <p style={{ color: '#999', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Loading
        </p>
      </div>
    );
  }

  // Sidebar content
  const SidebarContent = () => (
    <>
      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.6rem',
          fontWeight: 500,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#000',
          marginBottom: '0.6rem',
        }}>
          Search
        </label>
        <div style={{ position: 'relative' }}>
          <input
  ref={searchInputRef}
  type="text"
  placeholder="Search products..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  style={{
    width: '100%',
    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    border: '1px solid #e5e5e5',
    outline: 'none',
    background: '#fff',
    transition: 'border-color 0.15s ease',
  }}
  onFocus={(e) => (e.target.style.borderColor = '#000')}
  onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
/>
          <Search
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999',
            }}
            size={14}
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.6rem',
          fontWeight: 500,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#000',
          marginBottom: '0.6rem',
        }}>
          Categories
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <button
            onClick={() => handleCategoryChange("all")}
            className={`shop-category-btn ${selectedCategory === "all" ? "active" : ""}`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`shop-category-btn ${selectedCategory === cat.slug ? "active" : ""}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Page Header — clean, minimal */}
      <section style={{ padding: '2rem clamp(1rem, 4vw, 2.5rem) 1.5rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Link
              to="/"
              style={{
                color: '#999',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#000')}
              onMouseLeave={(e) => (e.target.style.color = '#999')}
            >
              Home
            </Link>
            <span style={{ color: '#ccc', fontSize: '0.65rem' }}>/</span>
            <span style={{
              color: '#000',
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {activeCategoryName}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontWeight: 300,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {activeCategoryName}
          </h1>
        </div>
      </section>

      {/* Shop Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 clamp(1rem, 4vw, 2.5rem) 4rem',
        display: 'flex',
        gap: '2.5rem',
      }}>
        {/* Desktop Sidebar */}
        <aside className="hidden md:block" style={{ width: '220px', flexShrink: 0 }}>
          <div className="shop-sidebar" style={{ position: 'sticky', top: '5rem' }}>
            <SidebarContent />
          </div>
        </aside>

        {/* Products */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {products.length > 0 ? (
            <>
              <div
                ref={gridRef}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination — minimal */}
              {(prevPage || nextPage) && (
                <div style={{
                  marginTop: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1.5rem',
                }}>
                  <button
                    disabled={!prevPage}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 400,
                      fontFamily: 'inherit',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: 'none',
                      border: 'none',
                      cursor: prevPage ? 'pointer' : 'not-allowed',
                      opacity: prevPage ? 1 : 0.3,
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    color: '#999',
                  }}>
                    {currentPage}
                  </span>

                  <button
                    disabled={!nextPage}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 400,
                      fontFamily: 'inherit',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: 'none',
                      border: 'none',
                      cursor: nextPage ? 'pointer' : 'not-allowed',
                      opacity: nextPage ? 1 : 0.3,
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.5rem' }}>
                No products found
              </h3>
              <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '2rem', maxWidth: '360px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                Try adjusting your filters or search term.
              </p>
              <button
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter FAB */}
      <button
        className="filter-fab md:hidden"
        onClick={() => setMobileFilterOpen(true)}
        aria-label="Open filters"
      >
        <SlidersHorizontal size={18} />
      </button>

      {/* Mobile Filter Drawer */}
      <div
        className={`filter-drawer-overlay ${mobileFilterOpen ? "open" : ""}`}
        onClick={() => setMobileFilterOpen(false)}
      />
      <div className={`filter-drawer ${mobileFilterOpen ? "open" : ""}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Filters
          </h3>
          <button
            onClick={() => setMobileFilterOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent />
      </div>
    </div>
  );
};

export default ShopPage;
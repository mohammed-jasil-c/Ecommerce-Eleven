import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import api from "../../api/apiService";
import QuickViewModal from "../../features/products/components/QuickViewModal";
import { ArrowRight } from "lucide-react";
import HeroSlider from "./HeroSlider";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: featuredData } = await api.get("products/?is_featured=true&page_size=4");
        const { data: newData } = await api.get("products/?is_new=true&page_size=8");
        const { data: categoriesData } = await api.get("products/categories/");
        setFeaturedProducts(featuredData.results || []);
        setNewProducts(newData.results || []);
        setCategories(categoriesData || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff' }}>
        <p style={{ color: '#999', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Loading
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', color: '#000' }}>

      {/* ═══════ HERO — Editorial Full-Screen ═══════ */}
      <HeroSlider />

      {/* ═══════ CATEGORIES - Pill Style ═══════ */}
      <section style={{ padding: 'clamp(2rem, 6vw, 4rem) 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2.5rem)' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Shop By Category
            </h2>
          </div>

          {/* Horizontal scrollable pills */}
          <div
            className="flex gap-4 overflow-x-auto"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '0.5rem',
            }}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="group flex flex-col items-center gap-2 flex-shrink-0"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  width: '100px',
                }}
              >
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-gray-200 shadow-sm transition-transform duration-300 group-hover:scale-105"
                  style={{ background: '#f5f5f5' }}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#000',
                  textAlign: 'center'
                }}>
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED PRODUCTS ═══════ */}
      <section style={{ padding: 'clamp(2rem, 6vw, 5rem) clamp(1rem, 4vw, 2.5rem)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
            }}
          >
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Trending Now
            </h2>
            <Link
              to="/shop"
              style={{
                fontSize: '0.65rem',
                fontWeight: 400,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#000',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f5f5f5', marginBottom: '0.75rem' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    style={{ transition: 'opacity 0.25s ease' }}
                    onMouseEnter={(e) => (e.target.style.opacity = '0.85')}
                    onMouseLeave={(e) => (e.target.style.opacity = '1')}
                  />
                </div>
                <h3 style={{
                  fontSize: '0.8rem',
                  fontWeight: 400,
                  marginBottom: '0.25rem',
                  lineHeight: 1.4,
                }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: '0.8rem', fontWeight: 400, color: '#666' }}>
                  {formatPrice(product.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ NEW ARRIVALS — Horizontal Scroll ═══════ */}
      <section style={{
        padding: 'clamp(2rem, 6vw, 5rem) 0',
        borderTop: '1px solid #e5e5e5',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2.5rem)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
            }}
          >
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Fresh Drop
            </h2>
            <Link
              to="/new-arrivals"
              style={{
                fontSize: '0.65rem',
                fontWeight: 400,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#000',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div
          className="flex gap-3 overflow-x-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingLeft: 'clamp(1rem, 4vw, 2.5rem)',
            paddingRight: 'clamp(1rem, 4vw, 2.5rem)',
            paddingBottom: '0.5rem',
          }}
        >
          {newProducts.map((product) => (
            <div
              key={product.id}
              className="cursor-pointer"
              onClick={() => handleProductClick(product)}
              style={{ minWidth: '260px', flex: '0 0 260px' }}
            >
              <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f5f5f5', marginBottom: '0.75rem' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  style={{ transition: 'opacity 0.25s ease' }}
                  onMouseEnter={(e) => (e.target.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.target.style.opacity = '1')}
                />
              </div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 400, marginBottom: '0.25rem' }}>
                {product.name}
              </h3>
              <p style={{ fontSize: '0.8rem', fontWeight: 400, color: '#666' }}>
                {formatPrice(product.price)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default HomePage;
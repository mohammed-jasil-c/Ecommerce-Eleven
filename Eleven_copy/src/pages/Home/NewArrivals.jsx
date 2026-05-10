import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowDown } from "lucide-react";
import api from "../../api/apiService";
import ProductCard from "../../Components/ui/ProductCard";

gsap.registerPlugin(ScrollTrigger);

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // Refs for GSAP
  const heroRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroImageRef = useRef(null);
  const introRef = useRef(null);
  const gridHeaderRef = useRef(null);
  const productRefs = useRef([]);
  const ctaRef = useRef(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const { data } = await api.get("/products/?is_new=true&page_size=50");
        const results = data.results || data;
        setProducts(results);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  // Hero animations
  useEffect(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline();

    // Ken Burns on hero image
    if (heroImageRef.current) {
      gsap.fromTo(
        heroImageRef.current,
        { scale: 1.15 },
        { scale: 1, duration: 8, ease: "power1.out" }
      );
    }

    // Text reveal
    if (heroTextRef.current) {
      const children = heroTextRef.current.children;
      tl.fromTo(
        children,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.3,
        }
      );
    }

    return () => tl.kill();
  }, [loading]);

  // Scroll-triggered animations
  useEffect(() => {
    if (loading) return;

    const triggers = [];

    // Intro section
    if (introRef.current) {
      const t = ScrollTrigger.create({
        trigger: introRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(
            introRef.current.children,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }
          );
        },
        once: true,
      });
      triggers.push(t);
    }

    // Grid header
    if (gridHeaderRef.current) {
      const t = ScrollTrigger.create({
        trigger: gridHeaderRef.current,
        start: "top 85%",
        onEnter: () => {
          gsap.fromTo(
            gridHeaderRef.current.children,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
          );
        },
        once: true,
      });
      triggers.push(t);
    }

    // Product cards stagger
    const validRefs = productRefs.current.filter(Boolean);
    if (validRefs.length > 0) {
      validRefs.forEach((el, i) => {
        const t = ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          onEnter: () => {
            gsap.fromTo(
              el,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.5,
                delay: (i % 4) * 0.08,
                ease: "power3.out",
              }
            );
          },
          once: true,
        });
        triggers.push(t);
      });
    }

    // CTA section
    if (ctaRef.current) {
      const t = ScrollTrigger.create({
        trigger: ctaRef.current,
        start: "top 85%",
        onEnter: () => {
          gsap.fromTo(
            ctaRef.current.children,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }
          );
        },
        once: true,
      });
      triggers.push(t);
    }

    return () => triggers.forEach((t) => t.kill());
  }, [loading, activeFilter]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return products;
    return products.filter(
      (p) => p.gender && p.gender.toLowerCase() === activeFilter
    );
  }, [products, activeFilter]);

  const filters = [
    { key: "all", label: "All" },
    { key: "men", label: "Men" },
    { key: "women", label: "Women" },
    { key: "kids", label: "Kids" },
  ];

  const scrollToProducts = () => {
    document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "1px solid #e5e5e5",
            borderTop: "1px solid #000",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            fontSize: "0.65rem",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#999",
          }}
        >
          Loading New Arrivals
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* ═══ HERO — Full Viewport Cinematic ═══ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "100vh",
          minHeight: "600px",
          maxHeight: "900px",
          overflow: "hidden",
          background: "#000",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {/* Background Image with Ken Burns */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          <img
            ref={heroImageRef}
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop"
            alt="New Arrivals Collection"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scale(1.15)",
            }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.1) 100%)",
            }}
          />
        </div>

        {/* Hero Content */}
        <div
          ref={heroTextRef}
          style={{
            position: "relative",
            zIndex: 2,
            padding: "0 clamp(1.5rem, 5vw, 4rem) clamp(3rem, 8vw, 5rem)",
            maxWidth: "800px",
          }}
        >
          {/* Season Tag */}
          <div
            style={{
              fontSize: "0.6rem",
              fontWeight: 500,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "1.5rem",
              opacity: 0,
            }}
          >
            SS26 Collection
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: 300,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#fff",
              lineHeight: 1.05,
              marginBottom: "1.5rem",
              opacity: 0,
            }}
          >
            New
            <br />
            Arrivals
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              maxWidth: "420px",
              marginBottom: "2rem",
              opacity: 0,
            }}
          >
            Discover the latest additions — where contemporary design meets
            exceptional craftsmanship.
          </p>

          {/* CTA Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              opacity: 0,
            }}
          >
            <button
              onClick={scrollToProducts}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.85rem 1.8rem",
                background: "#fff",
                color: "#000",
                border: "none",
                fontFamily: "var(--font-primary)",
                fontSize: "0.65rem",
                fontWeight: 500,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Explore Collection
              <ArrowDown size={14} />
            </button>
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 400,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {products.length} New Pieces
            </span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            right: "clamp(1.5rem, 5vw, 4rem)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            zIndex: 2,
          }}
        >
          <span
            style={{
              writingMode: "vertical-rl",
              fontSize: "0.55rem",
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "rgba(255,255,255,0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "1px",
                height: "40px",
                background: "rgba(255,255,255,0.6)",
                animation: "scrollPulse 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </section>

      {/* ═══ EDITORIAL INTRO ═══ */}
      <section
        style={{
          padding: "clamp(3rem, 8vw, 6rem) var(--page-gutter)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          ref={introRef}
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          {/* Left — Section label */}
          <div style={{ opacity: 0 }}>
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              About This Collection
            </span>
          </div>

          {/* Content */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
              gap: "clamp(2rem, 4vw, 4rem)",
              opacity: 0,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontWeight: 300,
                lineHeight: 1.3,
                letterSpacing: "0.02em",
              }}
            >
              Fresh perspectives in contemporary footwear design.
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 300,
                lineHeight: 1.8,
                color: "var(--color-text-secondary)",
                maxWidth: "480px",
              }}
            >
              Each new arrival is curated with intention — blending innovation
              with timeless aesthetics. From minimalist silhouettes to bold
              statements, our latest collection represents the evolution of
              modern style.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCTS GRID ═══ */}
      <section
        id="products-grid"
        style={{
          padding: "clamp(2.5rem, 6vw, 4rem) var(--page-gutter)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Grid Header — Title + Filters */}
          <div
            ref={gridHeaderRef}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "1.5rem",
              marginBottom: "clamp(2rem, 4vw, 3rem)",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {/* Left */}
            <div style={{ opacity: 0 }}>
              <h2
                style={{
                  fontFamily: "var(--font-primary)",
                  fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
                  fontWeight: 300,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: "0.35rem",
                }}
              >
                Latest Collection
              </h2>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 400,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "Piece" : "Pieces"}
              </p>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.25rem",
                opacity: 0,
              }}
            >
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.65rem",
                    fontWeight: activeFilter === f.key ? 500 : 400,
                    fontFamily: "var(--font-primary)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    background:
                      activeFilter === f.key ? "#000" : "transparent",
                    color: activeFilter === f.key ? "#fff" : "#666",
                    border:
                      activeFilter === f.key
                        ? "1px solid #000"
                        : "1px solid var(--color-border)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== f.key) {
                      e.currentTarget.style.borderColor = "#000";
                      e.currentTarget.style.color = "#000";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== f.key) {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.color = "#666";
                    }
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                gap: "clamp(1rem, 2vw, 1.5rem)",
                rowGap: "clamp(2rem, 4vw, 3rem)",
              }}
            >
              {filteredProducts.map((product, i) => (
                <div
                  key={product.id}
                  ref={(el) => (productRefs.current[i] = el)}
                  style={{ opacity: 0 }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div
              style={{
                textAlign: "center",
                padding: "clamp(3rem, 8vw, 5rem) 1rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "1px",
                  background: "var(--color-border)",
                  margin: "0 auto 2rem",
                }}
              />
              <h3
                style={{
                  fontFamily: "var(--font-primary)",
                  fontSize: "1.2rem",
                  fontWeight: 300,
                  letterSpacing: "0.05em",
                  marginBottom: "0.75rem",
                }}
              >
                No new arrivals found
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "2rem",
                  fontWeight: 300,
                }}
              >
                {activeFilter !== "all"
                  ? `No new arrivals in the ${activeFilter}'s category. Try another filter.`
                  : "Check back soon for our latest releases."}
              </p>
              {activeFilter !== "all" ? (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="btn-premium btn-outline"
                >
                  <span>View All</span>
                </button>
              ) : (
                <Link
                  to="/shop"
                  className="btn-premium btn-primary"
                  style={{ textDecoration: "none" }}
                >
                  <span>Browse All Collections</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      {filteredProducts.length > 0 && (
        <section
          style={{
            padding: "clamp(3rem, 8vw, 5rem) var(--page-gutter)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div
            ref={ctaRef}
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <div style={{ opacity: 0 }}>
              <h3
                style={{
                  fontFamily: "var(--font-primary)",
                  fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                  marginBottom: "0.5rem",
                }}
              >
                Explore the full collection
              </h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 300,
                }}
              >
                Discover more styles across all categories.
              </p>
            </div>
            <Link
              to="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.85rem 2rem",
                background: "#000",
                color: "#fff",
                textDecoration: "none",
                fontFamily: "var(--font-primary)",
                fontSize: "0.65rem",
                fontWeight: 500,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                transition: "opacity 0.2s ease",
                opacity: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              View All Products
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* Keyframe for scroll indicator */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes scrollPulse {
              0% { transform: translateY(-100%); }
              50% { transform: translateY(0); }
              100% { transform: translateY(100%); }
            }
          `,
        }}
      />
    </div>
  );
};

export default NewArrivals;

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "./WishList";
import gsap from "gsap";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Heart,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

const WishlistPage = () => {
  const {
    wishlistItems,
    loading,
    error,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    clearError,
  } = useWishlist();

  const [movingItems, setMovingItems] = useState(new Set());
  const [toast, setToast] = useState(null);
  const gridRef = useRef(null);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMoveToCart = async (item) => {
    setMovingItems((prev) => new Set(prev).add(item.id));
    const result = await moveToCart(item);
    setMovingItems((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    if (result.success) {
      showToast(`${item.name} added to cart`);
    } else {
      showToast(result.message, "error");
    }
  };

  const handleMoveAllToCart = async () => {
    const inStockItems = wishlistItems.filter((item) => item.isInStock);
    if (inStockItems.length === 0) {
      showToast("No items in stock to move to cart", "error");
      return;
    }
    setMovingItems(new Set(inStockItems.map((i) => i.id)));
    for (const item of inStockItems) {
      await moveToCart(item);
    }
    setMovingItems(new Set());
    showToast(`Moved ${inStockItems.length} items to cart`);
  };

  const handleRemove = async (item) => {
    await removeFromWishlist(item.id);
    showToast("Removed from wishlist", "neutral");
  };

  const getInStockCount = () => wishlistItems.filter((item) => item.isInStock).length;

  // GSAP grid entrance
  useEffect(() => {
    if (!loading && gridRef.current && wishlistItems.length > 0) {
      const cards = gridRef.current.querySelectorAll(".wish-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power3.out", delay: 0.15 }
      );
    }
  }, [loading, wishlistItems.length]);

  /* ═══ LOADING ═══ */
  if (loading) {
    return (
      <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
        <section className="page-hero">
          <div className="hero-inner">
            <h1>Your Wishlist</h1>
          </div>
        </section>
        <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
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

  /* ═══ ERROR ═══ */
  if (error) {
    return (
      <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
        <section className="page-hero">
          <div className="hero-inner">
            <h1>Your Wishlist</h1>
          </div>
        </section>
        <div style={{ textAlign: "center", padding: "5rem 1.5rem", maxWidth: "480px", margin: "0 auto" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 1.5rem",
              borderRadius: "50%",
              background: "rgba(239,68,68,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={28} style={{ color: "var(--color-error)" }} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              fontWeight: 400,
              marginBottom: "0.75rem",
            }}
          >
            Something went wrong
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
            {error}
          </p>
          <button
            onClick={clearError}
            className="btn-premium btn-primary"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 50,
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-full)",
            background:
              toast.type === "error"
                ? "var(--color-error)"
                : toast.type === "neutral"
                  ? "var(--color-primary)"
                  : "var(--color-primary)",
            color: "#fff",
            fontSize: "0.8rem",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {toast.type === "success" && <ShoppingBag size={14} />}
          {toast.type === "error" && <AlertCircle size={14} />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", marginLeft: "0.25rem" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner">
          <div className="hero-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Wishlist</span>
          </div>
          <h1>Your Wishlist</h1>
          <div className="hero-sub">
            <div className="divider-gold" style={{ margin: 0, width: "40px" }} />
            <p>
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="page-section">
        {wishlistItems.length > 0 ? (
          <>
            {/* Actions Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "0.75rem",
                marginBottom: "2rem",
              }}
            >
              {getInStockCount() > 0 && (
                <button
                  onClick={handleMoveAllToCart}
                  className="btn-premium btn-primary"
                  style={{ borderRadius: "var(--radius-sm)", fontSize: "0.6rem" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ShoppingBag size={13} /> Move All to Cart
                    <span
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.55rem",
                      }}
                    >
                      {getInStockCount()}
                    </span>
                  </span>
                </button>
              )}
              <button
                onClick={clearWishlist}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.65rem 1.25rem",
                  fontSize: "0.6rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  background: "none",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>

            {/* Product Grid */}
            <div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8"
            >
              {wishlistItems.map((item) => (
                <div key={item.id} className="wish-card group">
                  {/* Image */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      overflow: "hidden",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-surface)",
                      marginBottom: "1rem",
                    }}
                  >
                    <Link to={`/product/${item.productId}`} style={{ display: "block", width: "100%", height: "100%" }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="product-image"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Link>

                    {/* Badges */}
                    <div style={{ position: "absolute", top: "0.875rem", left: "0.875rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {!item.isInStock && (
                        <span
                          style={{
                            padding: "0.3rem 0.85rem",
                            background: "rgba(255,255,255,0.9)",
                            backdropFilter: "blur(8px)",
                            fontSize: "0.55rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            borderRadius: "var(--radius-full)",
                          }}
                        >
                          Out of Stock
                        </span>
                      )}
                      {item.isNew && (
                        <span
                          style={{
                            padding: "0.3rem 0.85rem",
                            background: "var(--color-primary)",
                            color: "#fff",
                            fontSize: "0.55rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            borderRadius: "var(--radius-full)",
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>

                    {/* Remove button (appears on hover) */}
                    <div className="product-card-actions" style={{ top: "0.875rem", right: "0.875rem", bottom: "auto", flexDirection: "column" }}>
                      <button
                        onClick={() => handleRemove(item)}
                        className="product-action-btn"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Add to Cart overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: "auto 0.875rem 0.875rem 0.875rem",
                        opacity: 0,
                        transform: "translateY(8px)",
                        transition: "all 0.3s ease",
                      }}
                      className="group-hover:opacity-100 group-hover:translate-y-0"
                    >
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={!item.isInStock || movingItems.has(item.id)}
                        className="btn-premium btn-primary"
                        style={{
                          width: "100%",
                          borderRadius: "var(--radius-sm)",
                          opacity: item.isInStock ? 1 : 0.4,
                          cursor: item.isInStock ? "pointer" : "not-allowed",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                          {movingItems.has(item.id) ? (
                            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                          ) : (
                            <>
                              <ShoppingBag size={13} />
                              {item.isInStock ? "Add to Cart" : "Unavailable"}
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <Link to={`/product/${item.productId}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "1rem",
                        fontWeight: 500,
                        lineHeight: 1.3,
                        marginBottom: "0.4rem",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {item.name}
                    </h3>
                  </Link>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", fontWeight: 500 }}>
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-light)",
                          textDecoration: "line-through",
                        }}
                      >
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {item.addedAt && (
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.65rem",
                        color: "var(--color-text-light)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <Heart size={11} /> Saved {formatDate(item.addedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ═══ EMPTY STATE ═══ */
          <div style={{ textAlign: "center", padding: "4rem 1.5rem", maxWidth: "480px", margin: "0 auto" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 2rem",
                borderRadius: "50%",
                background: "var(--color-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart size={32} style={{ color: "var(--color-text-light)" }} />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.8rem",
                fontWeight: 400,
                marginBottom: "0.75rem",
              }}
            >
              Your wishlist is empty
            </h2>
            <p
              style={{
                color: "var(--color-text-muted)",
                marginBottom: "2rem",
                lineHeight: 1.7,
                fontSize: "0.9rem",
              }}
            >
              Save your favorite pieces here and watch for price drops and restocks.
            </p>
            <Link
              to="/shop"
              className="btn-premium btn-primary"
              style={{ textDecoration: "none", borderRadius: "var(--radius-sm)", display: "inline-flex" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Explore Collection <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
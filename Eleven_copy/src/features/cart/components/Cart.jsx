import React, { useState, useRef, useEffect } from "react";
import api from "../../../api/apiService";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Gift,
  Package,
} from "lucide-react";

const CartPage = () => {
  const { cartItems, totalPrice, updateCartItem, removeCartItem, clearCart } =
    useCart();

  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const itemsRef = useRef(null);

  const subtotal = totalPrice;
  const shipping = subtotal > 5000 ? 0 : 150;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const finalTotal = subtotal + shipping - discount;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // GSAP entrance
  useEffect(() => {
    if (itemsRef.current && cartItems.length > 0) {
      const cards = itemsRef.current.querySelectorAll(".cart-item");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.15 }
      );
    }
  }, [cartItems.length]);

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    await updateCartItem(itemId, newQuantity);
    setUpdatingItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleRemove = async (itemId) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    await removeCartItem(itemId);
    setUpdatingItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setPromoApplied(true);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    try {
      const { data } = await api.post("/orders/checkout/");
      navigate(`/checkout/${data.order_id}`);
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  /* ═══ EMPTY STATE ═══ */
  if (cartItems.length === 0) {
    return (
      <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
        <section className="page-hero">
          <div className="hero-inner">
            <div className="hero-breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep">/</span>
              <span className="current">Cart</span>
            </div>
            <h1>Shopping Cart</h1>
          </div>
        </section>

        <div style={{ textAlign: "center", padding: "5rem 1.5rem", maxWidth: "480px", margin: "0 auto" }}>
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
            <ShoppingBag size={32} style={{ color: "var(--color-text-light)" }} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.8rem",
              fontWeight: 400,
              marginBottom: "0.75rem",
            }}
          >
            Your cart is empty
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginBottom: "2rem",
              lineHeight: 1.7,
              fontSize: "0.9rem",
            }}
          >
            Looks like you haven't added anything yet. Explore our latest collection.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="btn-premium btn-primary"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Continue Shopping <ArrowRight size={14} />
            </span>
          </button>
        </div>
      </div>
    );
  }

  /* ═══ CART WITH ITEMS ═══ */
  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner">
          <div className="hero-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Shopping Cart</span>
          </div>
          <h1>Shopping Cart</h1>
          <div className="hero-sub">
            <div className="divider-gold" style={{ margin: 0, width: "40px" }} />
            <p>{itemCount} {itemCount === 1 ? "item" : "items"} in your cart</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="page-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT — Cart Items */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                {itemCount} {itemCount === 1 ? "Product" : "Products"}
              </p>
              <button
                onClick={clearCart}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.7rem",
                  color: "var(--color-error)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                }}
              >
                <Trash2 size={13} /> Clear Cart
              </button>
            </div>

            <div ref={itemsRef} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`cart-item premium-card`}
                  style={{
                    padding: "1.25rem",
                    display: "flex",
                    gap: "1.25rem",
                    opacity: updatingItems.has(item.id) ? 0.5 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      background: "var(--color-surface)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.image || "/api/placeholder/150/150"}
                      alt={item.product_name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.35rem" }}>
                      <div>
                        <Link
                          to={`/product/${item.product_id}`}
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "1rem",
                            fontWeight: 500,
                            color: "var(--color-text)",
                            textDecoration: "none",
                            display: "block",
                            lineHeight: 1.3,
                          }}
                        >
                          {item.product_name}
                        </Link>
                        {item.variant && (
                          <p
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--color-text-muted)",
                              marginTop: "0.25rem",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {item.variant}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={updatingItems.has(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.4rem",
                          color: "var(--color-text-light)",
                          transition: "color 0.2s ease",
                          borderRadius: "var(--radius-sm)",
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "0.75rem",
                      }}
                    >
                      {/* Quantity */}
                      <div className="qty-stepper">
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          disabled={updatingItems.has(item.id)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Price */}
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "1rem",
                            fontWeight: 600,
                          }}
                        >
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                            {formatPrice(item.price)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <Link
              to="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                marginTop: "2rem",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                color: "var(--color-text-muted)",
                textDecoration: "none",
                letterSpacing: "0.05em",
                transition: "color 0.2s ease",
              }}
            >
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div style={{ position: "sticky", top: "6rem" }}>
              <div className="glass-light" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.25rem",
                    fontWeight: 400,
                    marginBottom: "1.75rem",
                  }}
                >
                  Order Summary
                </h2>

                {/* Promo */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="input-premium"
                      style={{ flex: 1, padding: "0.6rem 1rem", fontSize: "0.8rem" }}
                    />
                    <button
                      onClick={applyPromo}
                      disabled={!promoCode || promoApplied}
                      className="btn-premium btn-primary"
                      style={{
                        padding: "0.6rem 1.25rem",
                        fontSize: "0.6rem",
                        borderRadius: "var(--radius-sm)",
                        opacity: !promoCode || promoApplied ? 0.4 : 1,
                      }}
                    >
                      <span>Apply</span>
                    </button>
                  </div>
                  {promoApplied && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-success)",
                        marginTop: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <Gift size={14} /> 10% discount applied!
                    </p>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    paddingBottom: "1.5rem",
                    borderBottom: "1px solid var(--color-border)",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Subtotal</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{formatPrice(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Shipping</span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 500,
                        color: shipping === 0 ? "var(--color-success)" : "var(--color-text)",
                      }}
                    >
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--color-success)" }}>
                      <span>Discount (10%)</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                  {shipping > 0 && (
                    <p style={{ fontSize: "0.7rem", color: "var(--color-text-light)", marginTop: "0.25rem" }}>
                      Free shipping on orders above {formatPrice(5000)}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "end",
                    marginBottom: "1.75rem",
                  }}
                >
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Total</span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.75rem",
                      fontWeight: 400,
                    }}
                  >
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                {/* Checkout */}
                <button
                  onClick={handleCheckout}
                  className="btn-premium btn-primary"
                  style={{ width: "100%", borderRadius: "var(--radius-sm)" }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    Proceed to Checkout <ArrowRight size={14} />
                  </span>
                </button>

                {/* Trust Badges */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                    marginTop: "1.75rem",
                    paddingTop: "1.75rem",
                    borderTop: "1px solid var(--color-border)",
                    textAlign: "center",
                  }}
                >
                  {[
                    { icon: <Truck size={16} />, label: "Fast Delivery" },
                    { icon: <ShieldCheck size={16} />, label: "Secure Pay" },
                    { icon: <Package size={16} />, label: "Easy Returns" },
                  ].map((badge) => (
                    <div key={badge.label}>
                      <div style={{ color: "var(--color-accent)", marginBottom: "0.35rem", display: "flex", justifyContent: "center" }}>
                        {badge.icon}
                      </div>
                      <p
                        style={{
                          fontSize: "0.55rem",
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {badge.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
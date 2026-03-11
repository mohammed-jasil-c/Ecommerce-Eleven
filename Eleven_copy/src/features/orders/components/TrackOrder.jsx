import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/context/AuthContext";
import gsap from "gsap";
import api from "../../../api/apiService";
import { Package, ArrowRight, HelpCircle } from "lucide-react";

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const listRef = useRef(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const res = await api.get("/orders/my-orders/");
        setOrders(res.data.results || res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  // GSAP entrance
  useEffect(() => {
    if (!loading && listRef.current && orders.length > 0) {
      const cards = listRef.current.querySelectorAll(".track-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.15 }
      );
    }
  }, [loading, orders.length]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const getStatusClass = (status) => {
    const map = {
      PENDING: "pending", PROCESSING: "processing", SHIPPED: "shipped",
      DELIVERED: "delivered", CANCELLED: "cancelled",
    };
    return map[status] || "pending";
  };

  /* ═══ LOADING ═══ */
  if (loading) {
    return (
      <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
        <section className="page-hero">
          <div className="hero-inner"><h1>Track Orders</h1></div>
        </section>
        <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
          <div
            style={{
              width: "40px", height: "40px",
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

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner">
          <div className="hero-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Track Orders</span>
          </div>
          <h1>Your Orders</h1>
          <div className="hero-sub">
            <div className="divider-gold" style={{ margin: 0, width: "40px" }} />
            <p>View your order history and track recent purchases</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="page-section" style={{ maxWidth: "900px" }}>
        {!user ? (
          /* Not logged in */
          <div style={{ textAlign: "center", padding: "4rem 1.5rem", maxWidth: "480px", margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.75rem" }}>
              Please Login
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
              Please login to view your order history.
            </p>
            <Link
              to="/login"
              className="btn-premium btn-primary"
              style={{ textDecoration: "none", borderRadius: "var(--radius-sm)", display: "inline-flex" }}
            >
              <span>Login</span>
            </Link>
          </div>
        ) : orders.length === 0 ? (
          /* Empty */
          <div style={{ textAlign: "center", padding: "4rem 1.5rem", maxWidth: "480px", margin: "0 auto" }}>
            <div
              style={{
                width: "80px", height: "80px", margin: "0 auto 2rem", borderRadius: "50%",
                background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Package size={32} style={{ color: "var(--color-text-light)" }} />
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: 400, marginBottom: "0.75rem" }}>
              No Orders Yet
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", lineHeight: 1.7, fontSize: "0.9rem" }}>
              You haven't placed any orders yet.
            </p>
            <Link
              to="/shop"
              className="btn-premium btn-primary"
              style={{ textDecoration: "none", borderRadius: "var(--radius-sm)", display: "inline-flex" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Start Shopping <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        ) : (
          <>
            <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {orders.map((order) => (
                <div key={order.id} className="track-card premium-card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.25rem" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 500, marginBottom: "0.3rem" }}>
                        Order #{order.id}
                      </h3>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={`status-badge ${getStatusClass(order.status)}`} style={{ marginBottom: "0.25rem", display: "inline-block" }}>
                        {order.status}
                      </span>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 600 }}>
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  {order.status !== "cancel" && order.status !== "cancelled" && order.status !== "refunded" && (
                    <div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                        <div style={{ position: "absolute", top: "12px", left: "10%", right: "10%", height: "2px", background: "#f0f0f0", zIndex: 0 }} />

                        {/* Step 1: Placed */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                          <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--color-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", border: "3px solid #fff", boxShadow: "0 0 0 1px #e5e5e5" }}>
                            ✓
                          </div>
                          <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginTop: "0.5rem", color: "#000" }}>Placed</span>
                        </div>

                        <div style={{ position: "absolute", top: "12px", left: "10%", width: "40%", height: "2px", background: ["shipped", "delivered"].includes(order.status?.toLowerCase()) ? "var(--color-accent)" : "transparent", zIndex: 0, transition: "width 0.5s ease" }} />

                        {/* Step 2: Shipped */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                          <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: ["shipped", "delivered"].includes(order.status?.toLowerCase()) ? "var(--color-accent)" : "#f5f5f5", color: ["shipped", "delivered"].includes(order.status?.toLowerCase()) ? "#fff" : "#ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", border: "3px solid #fff", boxShadow: "0 0 0 1px #e5e5e5", transition: "all 0.3s ease" }}>
                            {["shipped", "delivered"].includes(order.status?.toLowerCase()) ? "✓" : "2"}
                          </div>
                          <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginTop: "0.5rem", color: ["shipped", "delivered"].includes(order.status?.toLowerCase()) ? "#000" : "#999" }}>Shipped</span>
                        </div>

                        <div style={{ position: "absolute", top: "12px", left: "50%", width: "40%", height: "2px", background: order.status?.toLowerCase() === "delivered" ? "var(--color-accent)" : "transparent", zIndex: 0, transition: "width 0.5s ease" }} />

                        {/* Step 3: Delivered */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                          <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: order.status?.toLowerCase() === "delivered" ? "var(--color-accent)" : "#f5f5f5", color: order.status?.toLowerCase() === "delivered" ? "#fff" : "#ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", border: "3px solid #fff", boxShadow: "0 0 0 1px #e5e5e5", transition: "all 0.3s ease" }}>
                            {order.status?.toLowerCase() === "delivered" ? "✓" : "3"}
                          </div>
                          <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginTop: "0.5rem", color: order.status?.toLowerCase() === "delivered" ? "#000" : "#999" }}>Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="btn-premium btn-primary"
                      style={{ flex: 1, borderRadius: "var(--radius-sm)", fontSize: "0.6rem" }}
                    >
                      <span>View Order Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Help */}
            <div
              className="premium-card"
              style={{
                marginTop: "2rem",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem", color: "var(--color-accent)" }}>
                <HelpCircle size={24} />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 400, marginBottom: "0.5rem" }}>
                Need Help with Your Order?
              </h3>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
                Contact our customer support for any questions.
              </p>
              <Link
                to="/contact"
                style={{
                  display: "inline-flex",
                  padding: "0.7rem 1.75rem",
                  fontSize: "0.6rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  transition: "all 0.25s ease",
                }}
              >
                Contact Support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
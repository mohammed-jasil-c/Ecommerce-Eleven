import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import api from "../../../api/apiService";
import { Package, ArrowRight } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const listRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
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
    fetchOrders();
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (!loading && listRef.current && orders.length > 0) {
      const cards = listRef.current.querySelectorAll(".order-card");
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
          <div className="hero-inner"><h1>Your Orders</h1></div>
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
            <span className="current">Orders</span>
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
        {orders.length === 0 ? (
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
              You haven't placed any orders yet. Discover something you love.
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
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {orders.map((order) => (
              <div key={order.id} className="order-card premium-card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 500, marginBottom: "0.3rem",
                      }}
                    >
                      Order #{order.id}
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 600, marginTop: "0.5rem",
                      }}
                    >
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="btn-premium btn-primary"
                    style={{ flex: 1, borderRadius: "var(--radius-sm)", fontSize: "0.6rem" }}
                  >
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => navigate(`/track-order/${order.id}`)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      fontSize: "0.6rem",
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--color-text)",
                      background: "transparent",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  >
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
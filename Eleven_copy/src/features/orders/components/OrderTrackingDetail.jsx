import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/context/AuthContext";
import api from "../../../api/apiService";
import { HelpCircle } from "lucide-react";

const OrderTrackingDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        if (user) {
          const res = await api.get(`/orders/${orderId}/`);
          setOrder(res.data);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
        <section className="page-hero">
          <div className="hero-inner"><h1>Track Order</h1></div>
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

  if (!order) {
    return (
      <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
        <section className="page-hero">
          <div className="hero-inner"><h1>Order Not Found</h1></div>
        </section>
        <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
            The order you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="btn-premium btn-primary"
            style={{ borderRadius: "var(--radius-sm)", display: "inline-flex" }}
          >
            <span>Back to Orders</span>
          </button>
        </div>
      </div>
    );
  }

  const status = order.status?.toLowerCase() || 'pending';

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner">
          <div className="hero-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <Link to="/orders">Orders</Link>
            <span className="sep">/</span>
            <span className="current">Track Order Form</span>
          </div>
          <h1>Track Order Details</h1>
          <div className="hero-sub">
            <div className="divider-gold" style={{ margin: 0, width: "40px" }} />
            <p>Tracking progress for Order #{order.id?.slice(0, 8)}...</p>
          </div>
        </div>
      </section>

      <div className="page-section" style={{ maxWidth: "900px" }}>

        <div className="premium-card track-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 500, marginBottom: "0.4rem" }}>
                Order #{order.id}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className={`status-badge ${status}`} style={{ marginBottom: "0.25rem", display: "inline-block", textTransform: 'uppercase' }}>
                {status}
              </span>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", fontWeight: 600 }}>
                {formatPrice(order.total_amount)}
              </p>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div style={{ padding: "1.5rem 0", marginBottom: "1rem", marginTop: "1rem" }}>
            {(status === "cancel" || status === "cancelled" || status === "refunded") ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ fontSize: "1.2rem", color: "#e11d48", fontWeight: "bold", textTransform: "uppercase" }}>
                  Order {status}
                </p>
                <p style={{ fontSize: "0.9rem", color: "#888", marginTop: "0.5rem" }}>
                  This order has been {status} and will not be shipped.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative", alignItems: "center" }}>
                <div style={{ position: "absolute", top: "25px", left: "12%", right: "12%", height: "3px", background: "#f0f0f0", zIndex: 0 }} />

                {/* Step 1: Placed */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--color-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", border: "5px solid #fff", boxShadow: "0 0 0 1px #e5e5e5" }}>
                    ✓
                  </div>
                  <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginTop: "0.8rem", color: "#000" }}>Placed</span>
                  <span style={{ fontSize: "0.6rem", color: "#999", marginTop: "0.2rem" }}>Confirmed</span>
                </div>

                <div style={{ position: "absolute", top: "25px", left: "12%", width: "38%", height: "3px", background: ["shipped", "delivered"].includes(status) ? "var(--color-accent)" : "transparent", zIndex: 0, transition: "width 0.5s ease" }} />

                {/* Step 2: Shipped */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: ["shipped", "delivered"].includes(status) ? "var(--color-accent)" : "#f5f5f5", color: ["shipped", "delivered"].includes(status) ? "#fff" : "#ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", border: "5px solid #fff", boxShadow: "0 0 0 1px #e5e5e5", transition: "all 0.3s ease" }}>
                    {["shipped", "delivered"].includes(status) ? "✓" : "2"}
                  </div>
                  <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginTop: "0.8rem", color: ["shipped", "delivered"].includes(status) ? "#000" : "#999" }}>Shipped</span>
                  <span style={{ fontSize: "0.6rem", color: "#999", marginTop: "0.2rem" }}>In Transit</span>
                </div>

                <div style={{ position: "absolute", top: "25px", auto: "0", left: "50%", width: "38%", height: "3px", background: status === "delivered" ? "var(--color-accent)" : "transparent", zIndex: 0, transition: "width 0.5s ease" }} />

                {/* Step 3: Delivered */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: status === "delivered" ? "var(--color-accent)" : "#f5f5f5", color: status === "delivered" ? "#fff" : "#ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", border: "5px solid #fff", boxShadow: "0 0 0 1px #e5e5e5", transition: "all 0.3s ease" }}>
                    {status === "delivered" ? "✓" : "3"}
                  </div>
                  <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginTop: "0.8rem", color: status === "delivered" ? "#000" : "#999" }}>Delivered</span>
                  <span style={{ fontSize: "0.6rem", color: "#999", marginTop: "0.2rem" }}>At Destination</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1.5rem", marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              style={{
                padding: "0.8rem 2rem",
                fontSize: "0.7rem",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#000",
                background: "transparent",
                border: "1px solid #e5e5e5",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.color = "var(--color-accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#000"; }}
            >
              View Full Order Summary
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="premium-card border border-gray-200" style={{ padding: "2rem", textAlign: "center", background: "#fcfcfa" }}>
          <div style={{ display: "flex", justifyItems: "center", justifyContent: "center", color: "var(--color-accent)", marginBottom: "1rem" }}>
            <HelpCircle size={28} />
          </div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 500, marginBottom: "0.5rem" }}>
            Need Help?
          </h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            If you have any questions or issues regarding the shipping status of this order, please reach out to our team.
          </p>
          <Link
            to="/contact"
            style={{
              display: "inline-block",
              padding: "0.7rem 1.5rem",
              fontSize: "0.7rem",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#000",
              border: "1px solid #000",
              borderRadius: "var(--radius-sm)",
              textDecoration: "none"
            }}
          >
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderTrackingDetail;
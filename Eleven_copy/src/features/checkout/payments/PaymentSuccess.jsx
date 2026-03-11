import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../../cart/context/CartContext";
import api from "../../../api/apiService";
import {
  CheckCircle2,
  Package,
  Truck,
  Receipt,
  Download,
  ShoppingBag,
  Clock,
  MapPin,
  Copy,
  Check,
} from "lucide-react";

/* ═══════════════════════════════
   Confetti
   ═══════════════════════════════ */
const Confetti = () => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = ["#000", "#555", "#888", "#bbb", "#ddd", "#333"];
    const newPieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${3 + Math.random() * 2}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: `${6 + Math.random() * 6}px`,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 50 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="animate-confetti"
          style={{
            position: "absolute",
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
};

/* ═══════════════════════════════
   Detail Row
   ═══════════════════════════════ */
const DetailRow = ({ icon: Icon, label, value, highlight = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.85rem 0",
      borderBottom: "1px solid var(--color-border)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div
        style={{
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: highlight ? "var(--color-primary)" : "var(--color-surface)",
          color: highlight ? "var(--color-white)" : "var(--color-text-secondary)",
        }}
      >
        <Icon size={14} />
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.04em",
          color: "var(--color-text-secondary)",
        }}
      >
        {label}
      </span>
    </div>
    <span
      style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: highlight ? "var(--color-primary)" : "var(--color-text)",
        letterSpacing: "0.02em",
        textTransform: highlight ? "uppercase" : "none",
      }}
    >
      {value}
    </span>
  </div>
);

/* ═══════════════════════════════
   Payment Success
   ═══════════════════════════════ */
const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const { fetchCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}/`);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    fetchCart();

    // Hide confetti after 4 seconds
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [orderId]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
        <section className="page-hero">
          <div className="hero-inner">
            <h1>Confirming Order</h1>
          </div>
        </section>
        <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "2px solid var(--color-border)",
              borderTopColor: "var(--color-primary)",
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
      {showConfetti && <Confetti />}

      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner" style={{ textAlign: "center" }}>
          {/* Success Icon */}
          <div
            style={{
              width: "72px",
              height: "72px",
              margin: "0 auto 1.5rem",
              background: "var(--color-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "successPop 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <CheckCircle2 size={32} style={{ color: "#fff" }} />
          </div>

          <h1 style={{ textAlign: "center" }}>Payment Successful</h1>
          <div className="hero-sub" style={{ justifyContent: "center" }}>
            <div className="divider-gold" style={{ margin: 0, width: "40px" }} />
            <p>Thank you for your purchase</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="page-section" style={{ maxWidth: "680px" }}>

        {/* Order ID Banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            background: "var(--color-primary)",
            color: "var(--color-white)",
            marginBottom: "0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Receipt size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
            <span
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Order ID
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                padding: "0.25rem 0.75rem",
              }}
            >
              {orderId?.slice(-8).toUpperCase()}
            </code>
            <button
              onClick={handleCopyOrderId}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
                transition: "color 0.15s ease",
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Details Card */}
        <div
          className="glass-light"
          style={{ padding: "1.5rem 1.25rem", borderTop: "none" }}
        >
          {/* Detail Rows */}
          <div style={{ marginBottom: "1.5rem" }}>
            <DetailRow icon={Clock} label="Order Date" value={new Date().toLocaleDateString()} />
            <DetailRow icon={Receipt} label="Payment Method" value={order?.payment_method === "cod" ? "Cash on Delivery" : "Card (Stripe)"} />
            <DetailRow icon={Package} label="Order Status" value={order?.status || "Confirmed"} highlight />
            <DetailRow icon={Truck} label="Estimated Delivery" value="3–5 Business Days" />
            <DetailRow icon={MapPin} label="Shipping To" value={order?.shipping_address || "Registered Address"} />
          </div>

          {/* Total */}
          <div
            style={{
              padding: "1.25rem",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-secondary)",
                }}
              >
                Order Total
              </span>
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 300,
                  letterSpacing: "0.02em",
                }}
              >
                ₹{Number(order?.total_amount || 0).toFixed(2)}
              </span>
            </div>
            <p
              style={{
                fontSize: "0.6rem",
                color: "var(--color-text-muted)",
                textAlign: "right",
                marginTop: "0.25rem",
                letterSpacing: "0.04em",
              }}
            >
              Including taxes and shipping
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Link
              to="/shop"
              className="btn-premium btn-primary"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <ShoppingBag size={13} /> Continue Shopping
              </span>
            </Link>

            <button
              onClick={() => window.print()}
              className="btn-premium btn-outline"
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <Download size={13} /> Download Receipt
              </span>
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
            marginTop: "2rem",
          }}
        >
          <Link
            to="/orders"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
          >
            View all orders
          </Link>
          <Link
            to="/"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
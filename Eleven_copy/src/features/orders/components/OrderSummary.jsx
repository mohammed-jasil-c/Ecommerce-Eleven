import { useEffect, useState } from "react";
import api from "../../../api/apiService";
import { Package } from "lucide-react";

const OrderSummary = ({ orderId }) => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}/`);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div
        className="glass-light"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            margin: "0 auto",
            border: "2px solid var(--color-border)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginTop: "1rem",
          }}
        >
          Loading order...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-primary)",
        color: "var(--color-white)",
        padding: "2rem",
        border: "1px solid var(--color-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Package size={16} style={{ color: "rgba(255,255,255,0.7)" }} />
        </div>
        <div>
          <p
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "0.2rem",
            }}
          >
            Order #{order.id.slice(-8)}
          </p>
          <h3
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Order Summary
          </h3>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {order.items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingBottom: "1rem",
              borderBottom: index < order.items.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}
          >
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                {item.product}
              </p>
              <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>
                Qty: {item.quantity} · {item.size} · {item.color}
              </p>
            </div>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap" }}>
              ₹{item.price * item.quantity}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.12)", margin: "1.25rem 0" }} />

      {/* Total */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Total Due
        </span>
        <span style={{ fontSize: "1.6rem", fontWeight: 300, letterSpacing: "0.02em" }}>
          ₹{order.total_amount}
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;
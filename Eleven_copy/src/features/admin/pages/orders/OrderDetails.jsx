import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api/apiService";
import { ArrowLeft } from "lucide-react";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) return;
        const response = await api.get(`/orders/admin/${orderId}/`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setOrderDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div style={{ width: "24px", height: "24px", border: "2px solid #e5e5e5", borderTopColor: "#000", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📦</p>
          <h2 style={{ fontSize: "1rem", fontWeight: 400, marginBottom: "1rem" }}>Order Not Found</h2>
          <button
            onClick={() => navigate("/admin/orders")}
            style={{
              padding: "0.5rem 1.5rem",
              fontSize: "0.7rem",
              fontWeight: 500,
              fontFamily: "inherit",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "#000",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(price));

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem" }}>
        <button
          onClick={() => navigate("/admin/orders")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.75rem",
            fontWeight: 400,
            fontFamily: "inherit",
            color: "#888",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
        >
          <ArrowLeft size={15} /> Back to Orders
        </button>

        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: "0.2rem" }}>
            Status
          </p>
          <p style={{ fontSize: "1rem", fontWeight: 400, textTransform: "capitalize" }}>
            {orderDetails.status?.replace("_", " ")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Items */}
        <div className="lg:col-span-2">
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.25rem" }}>
            <h2 style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f0f0f0" }}>
              Items ({orderDetails.items?.length || 0})
            </h2>

            {orderDetails.items?.length > 0 ? (
              orderDetails.items.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 400, color: "#000" }}>
                      {item.variant?.product_name || "Product"}
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "#bbb", marginTop: "0.15rem" }}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 400, color: "#000" }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: "#ccc", textAlign: "center", padding: "2rem 0", fontSize: "0.8rem" }}>
                No items found
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Order Info */}
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.25rem" }}>
            <h2 style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f0f0f0" }}>
              Order Details
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.7rem", color: "#999" }}>Order ID</span>
                <span style={{ fontSize: "0.8rem", color: "#000" }}>#{orderDetails.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.7rem", color: "#999" }}>Date</span>
                <span style={{ fontSize: "0.8rem", color: "#000" }}>{formatDate(orderDetails.created_at)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: "0.7rem", color: "#999" }}>Total Amount</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 400, color: "#000" }}>
                  {formatPrice(orderDetails.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.25rem" }}>
            <h2 style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f0f0f0" }}>
              Customer
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <p style={{ fontSize: "0.65rem", color: "#bbb", marginBottom: "0.15rem" }}>Name</p>
                <p style={{ fontSize: "0.85rem", color: "#000" }}>
                  {orderDetails.user?.name || orderDetails.user?.email}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.65rem", color: "#bbb", marginBottom: "0.15rem" }}>Email</p>
                <p style={{ fontSize: "0.85rem", color: "#000" }}>
                  {orderDetails.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
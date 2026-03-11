import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/apiService";
import { Search, Eye, Trash2, RefreshCw } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/admin/all/");
      const formattedOrders = response.data.map((order) => ({
        id: order.id,
        orderId: order.id,
        date: order.created_at,
        status: order.status,
        items: order.items || [],
        total: Number(order.total_amount),
        customerName: order.user?.name || order.user?.email,
        customerEmail: order.user?.email,
        originalOrder: order,
      }));
      formattedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/update/${orderId}/`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order.");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/orders/admin/delete/${orderId}/`);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete order");
    }
  };

  const viewOrderDetails = (order) => {
    navigate(`/admin/orders/${order.id}`, {
      state: { orderDetails: order.originalOrder },
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending_payment: { color: "#b87514", bg: "#fffbeb", border: "#fef3cd" },
      confirmed: { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
      processing: { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
      shipped: { color: "#4338ca", bg: "#eef2ff", border: "#c7d2fe" },
      delivered: { color: "#2d8a4e", bg: "#f0fdf4", border: "#d1fae5" },
      cancelled: { color: "#c41e3a", bg: "#fef2f2", border: "#fecaca" },
      refunded: { color: "#888", bg: "#f9fafb", border: "#e5e5e5" },
    };
    return styles[status?.toLowerCase()] || styles.refunded;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      String(order.id).toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.customerEmail?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div style={{ width: "24px", height: "24px", border: "2px solid #e5e5e5", borderTopColor: "#000", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.04em" }}>Orders</h1>
          <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.25rem" }}>
            Manage and track customer orders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1rem",
            fontSize: "0.7rem",
            fontWeight: 400,
            fontFamily: "inherit",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#888",
            background: "none",
            border: "1px solid #e5e5e5",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "0 0 200px" }}>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.45rem 0.75rem 0.45rem 2rem",
              fontSize: "0.8rem",
              fontFamily: "inherit",
              border: "1px solid #e5e5e5",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#000")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
          />
          <Search size={13} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "#ccc" }} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "0.45rem 0.75rem",
            fontSize: "0.75rem",
            fontFamily: "inherit",
            border: "1px solid #e5e5e5",
            outline: "none",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="all">All Status</option>
          <option value="pending_payment">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                {["Order", "Customer", "Amount", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", background: "#fafafa" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const s = getStatusStyle(order.status);
                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid #f5f5f5" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#666" }}>#{order.id}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 400, color: "#000" }}>{order.customerName}</p>
                      <p style={{ fontSize: "0.65rem", color: "#bbb" }}>{order.customerEmail}</p>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 400, color: "#000" }}>
                      {formatPrice(order.total)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        fontSize: "0.55rem",
                        fontWeight: 500,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "0.2rem 0.5rem",
                        border: `1px solid ${s.border}`,
                        background: s.bg,
                        color: s.color,
                      }}>
                        {order.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#999" }}>
                      {formatDate(order.date)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={["delivered", "refunded", "cancelled"].includes(order.status)}
                          title={["delivered", "refunded", "cancelled"].includes(order.status) ? "Status cannot be changed" : "Update Status"}
                          style={{
                            padding: "0.3rem 0.5rem",
                            fontSize: "0.65rem",
                            fontFamily: "inherit",
                            border: "1px solid #e5e5e5",
                            outline: "none",
                            background: ["delivered", "refunded", "cancelled"].includes(order.status) ? "#f9fafb" : "#fff",
                            color: ["delivered", "refunded", "cancelled"].includes(order.status) ? "#999" : "#000",
                            cursor: ["delivered", "refunded", "cancelled"].includes(order.status) ? "not-allowed" : "pointer",
                          }}
                        >
                          <option value="pending_payment">Pending Payment</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          <button
                            onClick={() => viewOrderDetails(order)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.2rem",
                              padding: "0.3rem 0.5rem",
                              fontSize: "0.6rem",
                              fontWeight: 500,
                              fontFamily: "inherit",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              border: "1px solid #e5e5e5",
                              background: "#fff",
                              color: "#000",
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={11} /> View
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.2rem",
                              padding: "0.3rem 0.5rem",
                              fontSize: "0.6rem",
                              fontWeight: 500,
                              fontFamily: "inherit",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              border: "1px solid #fecaca",
                              background: "#fff",
                              color: "#c41e3a",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#ccc", fontSize: "0.8rem" }}>
              No orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
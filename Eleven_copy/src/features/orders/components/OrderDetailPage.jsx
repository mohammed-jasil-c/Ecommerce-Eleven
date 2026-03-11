import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/apiService";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}/`);
        setOrder(res.data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await api.post(`/orders/cancel/${order.id}/`);

      // Update local state instead of reloading page
      setOrder((prev) => ({
        ...prev,
        status: "CANCELLED",
      }));

    } catch (error) {
      console.error("Cancel error:", error);
      alert("Unable to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 text-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 text-center">
        <p>Order not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">

        <h1 className="text-2xl font-semibold mb-6">
          Order #{order.id}
        </h1>

        {/* Order Info */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Payment Status:</strong> {order.payment_status}</p>
          <p className="mt-2 text-lg font-semibold">
            Total: {formatPrice(order.total_amount)}
          </p>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">
              Shipping Address
            </h2>
            <p>{order.shipping_address.full_name}</p>
            <p>{order.shipping_address.phone}</p>
            <p>{order.shipping_address.address_line}</p>
            <p>
              {order.shipping_address.city},{" "}
              {order.shipping_address.state} -{" "}
              {order.shipping_address.pincode}
            </p>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Items</h2>

          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-gray-100 py-4 last:border-0"
              >
                <div className="flex items-center gap-4">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-16 h-20 object-cover rounded-md bg-gray-50 border border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-100">
                      No Image
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 line-clamp-1">{item.product_name}</h3>
                    <div className="text-xs text-gray-500 mt-1 flex gap-2 items-center">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.size && item.color && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1.5">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic">No items found.</p>
          )}
        </div>

        {/* Retry Payment */}
        {order.payment_status === "FAILED" && (
          <button
            onClick={() => navigate(`/orders/retry/${order.id}`)}
            className="bg-black text-white px-6 py-2 rounded mr-3"
          >
            Retry Payment
          </button>
        )}

        {/* Track Order */}
        <button
          onClick={() => navigate(`/track-order/${order.id}`)}
          className="bg-black text-white px-6 py-2 rounded mr-3 mb-6"
        >
          Track Order
        </button>

        {/* Cancel Order */}
        {["PENDING", "PROCESSING"].includes(order.status) && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="bg-red-600 text-white px-6 py-2 rounded"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}

      </div>
    </div>
  );
};

export default OrderDetailPage;
import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { Lock } from "lucide-react";

import api from "../../../api/apiService";

const StripeCheckout = ({ orderId, addressId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!addressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    setLoading(true);

    try {
      await api.put(`/orders/address/${orderId}/`, { address_id: addressId });
    } catch (err) {
      console.error("Address error:", err);
      toast.error(err.response?.data?.error || "Failed to attach address.");
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?order_id=${orderId}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      <button
        disabled={!stripe || loading}
        className="btn-premium btn-primary"
        style={{
          width: "100%",
          marginTop: "1.5rem",
          opacity: !stripe || loading ? 0.6 : 1,
          cursor: !stripe || loading ? "not-allowed" : "pointer",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              Processing...
            </>
          ) : (
            <>
              <Lock size={13} />
              Pay Now
            </>
          )}
        </span>
      </button>
    </form>
  );
};

export default StripeCheckout;
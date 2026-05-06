import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../api/apiService";
import StripeProvider from "../../checkout/payments/StripeProvider";
import StripeCheckout from "../../checkout/payments/StripeCheckout";
import OrderSummary from "./OrderSummary";
import { Lock, CreditCard, ChevronLeft, Shield, MapPin, Truck, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/* ─── Loading Skeleton ─── */
const PaymentSkeleton = () => (
  <div style={{ background: "#fff", minHeight: "100vh" }}>
    <section className="page-hero">
      <div className="hero-inner">
        <div className="hero-breadcrumb">
          <span style={{ background: "#eee", width: "40px", height: "10px", display: "inline-block" }} />
          <span className="sep">/</span>
          <span style={{ background: "#eee", width: "60px", height: "10px", display: "inline-block" }} />
        </div>
        <h1>Checkout</h1>
      </div>
    </section>

    <div className="page-section" style={{ maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              margin: "0 auto 1rem",
              border: "2px solid #e5e5e5",
              borderTopColor: "#000",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#999",
          }}>
            Initializing secure checkout...
          </p>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Error State ─── */
const ErrorState = ({ error, onRetry }) => (
  <div style={{ background: "#fff", minHeight: "100vh" }}>
    <section className="page-hero">
      <div className="hero-inner">
        <h1>Checkout Error</h1>
      </div>
    </section>

    <div className="page-section" style={{ maxWidth: "520px" }}>
      <div
        className="glass-light"
        style={{ padding: "2.5rem", textAlign: "center" }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 1.5rem",
            background: "var(--color-error)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 300 }}>!</span>
        </div>

        <p style={{
          fontSize: "0.85rem",
          color: "var(--color-text-secondary)",
          marginBottom: "2rem",
          lineHeight: 1.6,
        }}>
          {error}
        </p>

        <button
          onClick={onRetry}
          className="btn-premium btn-primary"
          style={{ width: "100%" }}
        >
          <span>Try Again</span>
        </button>
      </div>
    </div>
  </div>
);

/* ─── Checkout Page ─── */
const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "", phone: "", address_line: "",
    city: "", state: "", pincode: "", is_default: false,
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState("stripe"); // 'stripe' or 'cod'
  const [processingCOD, setProcessingCOD] = useState(false);

  useEffect(() => {
    const initCheckout = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch user addresses
        const addrRes = await api.get("/auth/addresses/");
        const fetchedAddresses = addrRes.data.results || addrRes.data;
        setAddresses(fetchedAddresses);

        // Auto-select default or first address
        if (fetchedAddresses.length > 0) {
          const defaultAddr = fetchedAddresses.find(a => a.is_default);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : fetchedAddresses[0].id);
        } else {
          setShowAddressForm(true);
        }

        // 2. Initialize Stripe intent
        const intentRes = await api.post(`/orders/pay/${orderId}/`);
        setClientSecret(intentRes.data.client_secret);

      } catch (err) {
        setError(
          err.response?.data?.error ||
          "Failed to initialize checkout. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    if (orderId) initCheckout();
  }, [orderId]);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSaveAddress = async () => {
    try {
      const res = await api.post("/auth/addresses/", formData);
      toast.success("Address added successfully");
      setShowAddressForm(false);

      const newAddr = res.data;
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);

      setFormData({ full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "", is_default: false });
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const handleCODConfirm = async () => {
    if (!selectedAddressId) {
      toast.error("Please add and select a delivery address.");
      return;
    }

    setProcessingCOD(true);
    try {
      await api.post(`/orders/cod/${orderId}/`, { address_id: selectedAddressId });
      navigate(`/payment-success?order_id=${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to confirm COD order.");
      setProcessingCOD(false);
    }
  };

  if (loading) return <PaymentSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  if (!clientSecret) return <PaymentSkeleton />;

  const addressFields = [
    { name: "full_name", label: "Full Name", type: "text", placeholder: "John Doe" },
    { name: "phone", label: "Phone", type: "text", placeholder: "+91 98765 43210" },
    { name: "address_line", label: "Address", type: "text", placeholder: "123 Fashion Ave" },
    { name: "city", label: "City", type: "text", placeholder: "Mumbai" },
    { name: "state", label: "State", type: "text", placeholder: "Maharashtra" },
    { name: "pincode", label: "Pincode", type: "text", placeholder: "400001" },
  ];

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh", paddingBottom: "4rem" }}>
      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner">
          <div className="hero-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <Link to="/cart">Cart</Link>
            <span className="sep">/</span>
            <span className="current">Checkout</span>
          </div>
          <h1>Checkout</h1>
          <div className="hero-sub">
            <div className="divider-gold" style={{ margin: 0, width: "40px" }} />
            <p>Secure payment & delivery</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div
        className="page-section checkout-grid-container"
        style={{
          maxWidth: "1200px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2rem",
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .checkout-grid-container {
              display: grid !important;
              grid-template-columns: 1fr 420px !important;
              gap: 3rem !important;
              align-items: start !important;
            }
          }
        `}</style>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

          {/* 1. SHIPPING ADDRESS */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  background: "var(--color-surface)",
                  padding: "0.5rem",
                  borderRadius: "50%",
                }}
              >
                <MapPin size={18} style={{ color: "var(--color-text-secondary)" }} />
              </div>
              <h2 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)" }}>
                1. Delivery Address
              </h2>
            </div>

            {/* Address Selection */}
            {!showAddressForm && addresses.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    style={{
                      padding: "1.25rem",
                      border: selectedAddressId === addr.id
                        ? "2px solid var(--color-accent)"
                        : "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      background: selectedAddressId === addr.id ? "var(--color-surface)" : "transparent",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ marginTop: "0.15rem", color: selectedAddressId === addr.id ? "var(--color-accent)" : "var(--color-text-muted)" }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                        {addr.full_name} {addr.is_default && <span style={{ fontSize: "0.6rem", background: "var(--color-accent)", color: "#fff", padding: "0.1rem 0.4rem", borderRadius: "10px", marginLeft: "0.5rem" }}>Default</span>}
                      </h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                        {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                        <br />
                        Phone: {addr.phone}
                      </p>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowAddressForm(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "1rem",
                    background: "transparent",
                    border: "1px dashed var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    justifyContent: "center",
                    marginTop: "0.5rem",
                  }}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>
            )}

            {/* Add Address Form */}
            {showAddressForm && (
              <div className="glass-light" style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem" }}>Add New Delivery Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {addressFields.map((field) => (
                    <div key={field.name}>
                      <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleAddressChange}
                        className="input-premium"
                        style={{ padding: "0.75rem", fontSize: "0.8rem" }}
                      />
                    </div>
                  ))}
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--color-text-muted)", cursor: "pointer", marginBottom: "1.5rem" }}>
                  <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleAddressChange} />
                  Set as my default address
                </label>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button onClick={handleSaveAddress} className="btn-premium btn-primary" style={{ padding: "0.75rem", fontSize: "0.75rem", flex: 1 }}>
                    <span>Save Address</span>
                  </button>
                  {addresses.length > 0 && (
                    <button onClick={() => setShowAddressForm(false)} style={{ flex: 1, border: "1px solid var(--color-border)", background: "transparent", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", cursor: "pointer", color: "var(--color-text-secondary)" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. PAYMENT METHOD */}
          <div style={{ opacity: selectedAddressId ? 1 : 0.4, pointerEvents: selectedAddressId ? "auto" : "none", transition: "opacity 0.3s ease" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ background: "var(--color-surface)", padding: "0.5rem", borderRadius: "50%" }}>
                <CreditCard size={18} style={{ color: "var(--color-text-secondary)" }} />
              </div>
              <h2 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)" }}>
                2. Payment Method
              </h2>
            </div>

            {/* Payment Options Toggle */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
              <button
                onClick={() => setPaymentMethod("stripe")}
                style={{
                  padding: "1.25rem",
                  border: paymentMethod === "stripe" ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: paymentMethod === "stripe" ? "var(--color-surface)" : "var(--color-white)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease"
                }}
              >
                <CreditCard size={24} style={{ color: paymentMethod === "stripe" ? "var(--color-accent)" : "var(--color-text-muted)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Credit / Debit Card</span>
              </button>

              <button
                onClick={() => setPaymentMethod("cod")}
                style={{
                  padding: "1.25rem",
                  border: paymentMethod === "cod" ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: paymentMethod === "cod" ? "var(--color-surface)" : "var(--color-white)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease"
                }}
              >
                <Truck size={24} style={{ color: paymentMethod === "cod" ? "var(--color-accent)" : "var(--color-text-muted)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Cash on Delivery</span>
              </button>
            </div>

            {/* Payment Content */}
            <div className="glass-light" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
              {paymentMethod === "stripe" ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--color-border)" }}>
                    <Lock size={14} style={{ color: "var(--color-text-secondary)" }} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Secure Card Payment</span>
                  </div>
                  <StripeProvider clientSecret={clientSecret}>
                    <StripeCheckout orderId={orderId} addressId={selectedAddressId} />
                  </StripeProvider>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ width: "48px", height: "48px", background: "var(--color-surface)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                    <Truck size={20} style={{ color: "var(--color-text-secondary)" }} />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>Pay on Delivery</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "2rem", maxWidth: "300px", margin: "0 auto 2rem", lineHeight: 1.5 }}>
                    You will pay the courier in cash when your order is delivered. Please make sure to have the exact amount ready.
                  </p>
                  <button
                    onClick={handleCODConfirm}
                    disabled={processingCOD}
                    className="btn-premium btn-primary"
                    style={{ width: "100%", opacity: processingCOD ? 0.7 : 1 }}
                  >
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      {processingCOD ? "Processing..." : "Complete Order (COD)"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer Trust Badges */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Lock size={12} style={{ color: "var(--color-text-muted)" }} />
                <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>End-to-end encrypted</span>
              </div>
              <span style={{ color: "var(--color-border)", fontSize: "0.6rem" }}>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Shield size={12} style={{ color: "var(--color-text-muted)" }} />
                <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>PCI DSS Compliant</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN — Order Summary */}
        <div style={{ position: "sticky", top: "2rem" }}>
          <OrderSummary orderId={orderId} />
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
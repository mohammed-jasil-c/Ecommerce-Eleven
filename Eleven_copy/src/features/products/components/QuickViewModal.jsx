import React, { useState, useMemo } from "react";
import { X, Heart, ShoppingBag, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../cart/context/CartContext";
import { useWishlist } from "../../wishlist/components/WishList";
import { useAuth } from "../../auth/context/AuthContext";
import { toast } from "react-toastify";
import api from "../../../api/apiService";

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const variants = product?.variants || [];

  const availableSizes = useMemo(() => {
    const sizes = [...new Set(variants.map((v) => v.size))];
    return sizes.sort();
  }, [variants]);

  if (!isOpen || !product) return null;

  const productImage =
    product?.image ||
    product?.images?.[0]?.image ||
    product?.images?.[0] ||
    "https://via.placeholder.com/400x500?text=No+Image";

  const currentVariant = selectedVariant || variants[0];

  const isInStock = (variant) => variant && variant.stock > 0;

  const wishlisted = isInWishlist(currentVariant?.id || product.id);

  const handleSizeSelect = (size) => {
    const variant = variants.find(
      (v) => v.size === size && (!selectedVariant || v.color === selectedVariant.color)
    );
    if (variant) setSelectedVariant(variant);
  };

  const getPriceDisplay = () => {
    if (currentVariant?.price) return `₹${currentVariant.price}`;

    if (product.price) return `₹${product.price}`;

    const prices = variants.map((v) => v.price).filter(Boolean);

    if (prices.length > 1) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return `₹${min} - ₹${max}`;
    }

    return "Price on request";
  };

  const handleAction = async (actionType) => {
  if (!user) {
    toast.error(`Please login to ${actionType === "buy" ? "buy" : "add items"}`);
    return;
  }

  const variantToAdd = currentVariant;

  if (!variantToAdd) {
    toast.error("No variants available for this product");
    return;
  }

  if (!isInStock(variantToAdd)) {
    toast.error("Selected item is out of stock");
    return;
  }

  // ADD TO CART
  if (actionType === "add") {

    setIsAddingToCart(true);

    const response = await addToCart(variantToAdd.id, quantity);

    setIsAddingToCart(false);

    if (response?.success) {
      toast.success("Added to cart");
    } else {
      toast.error(response?.message || "Failed to add item");
    }

    return;
  }

  // BUY NOW (DIRECT ORDER)
  if (actionType === "buy") {

    try {
      setIsBuyingNow(true);

      const res = await api.post("/orders/buy-now/", {
        variant_id: variantToAdd.id,
        quantity: quantity
      });

      const orderId = res.data.order_id;

      onClose();

      // go to payment page
      navigate(`/checkout/${orderId}`);

    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create order");
    } finally {
      setIsBuyingNow(false);
    }

  }
};
  const handleWishlist = async () => {
    if (!user) {
      toast.error("Please login to use wishlist");
      return;
    }

    const variantId = currentVariant?.id || product.id;

    const result = await toggleWishlist(variantId);

    if (result?.success !== false) {
      const nowWishlisted = isInWishlist(variantId);
      toast.success(nowWishlisted ? "Added to wishlist" : "Removed from wishlist");
    } else {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      {/* Backdrop (fixed, no scroll, dark blur) */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      ></div>

      {/* Modal Container: fixed to viewport, absolute center */}
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
        style={{ animation: 'slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto relative w-full flex flex-col md:flex-row bg-white overflow-hidden shadow-2xl"
          style={{
            maxWidth: "960px",
            // Limit max height to viewport, subtract padding
            maxHeight: "max(500px, 90vh)",
            // Sharp corners for Zara aesthetic
            borderRadius: "0px",
            // Slim, elegant border
            border: "1px solid var(--color-border)",
            display: "flex", // Keep flex layout
          }}
        >
          {/* Close Button: elegant circular hover */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur hover:bg-black hover:text-white transition-colors duration-300 rounded-full"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          {/* Left: Product Image (Hidden on very small screens, 50% on md+) */}
          <div
            className="hidden md:block w-full md:w-1/2 relative bg-neutral-100"
          >
            <img
              src={productImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          {/* Right: Product Details (Scrollable content area) */}
          <div
            className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar relative"
          >
            <div className="my-auto w-full">
              {/* Category */}
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  marginBottom: "1rem",
                }}
              >
                {product.category?.name || "Ready to wear"}
              </p>

              {/* Title */}
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: 300,
                  letterSpacing: "0.02em",
                  lineHeight: 1.2,
                  marginBottom: "0.5rem",
                  fontFamily: "var(--font-primary)",
                }}
              >
                {product.name}
              </h2>

              {/* Price */}
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 400,
                  marginBottom: "2rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {getPriceDisplay()}
              </p>

              {/* Divider */}
              <div style={{ height: "1px", background: "var(--color-border)", marginBottom: "2rem" }}></div>

              {/* Description */}
              <p
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  color: "var(--color-text-secondary)",
                  marginBottom: "2.5rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {product.description || "Premium material and expert craftsmanship."}
              </p>

              {/* Sizes */}
              {availableSizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
                      Select Size
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const variant = variants.find((v) => v.size === size);
                      const isSelected = currentVariant?.size === size;
                      const hasStock = variant && variant.stock > 0;

                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          disabled={!hasStock}
                          className="relative overflow-hidden transition-all duration-200"
                          style={{
                            minWidth: "48px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: isSelected ? 500 : 400,
                            border: isSelected ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                            background: isSelected ? "var(--color-primary)" : "transparent",
                            color: isSelected ? "var(--color-white)" : (hasStock ? "var(--color-text)" : "var(--color-text-muted)"),
                            cursor: hasStock ? "pointer" : "not-allowed",
                          }}
                        >
                          {size}
                          {!hasStock && (
                            <div style={{
                              position: "absolute",
                              width: "150%",
                              height: "1px",
                              background: "var(--color-border)",
                              transform: "rotate(-45deg)",
                            }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex gap-3">
                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAction("add")}
                    disabled={!currentVariant || !isInStock(currentVariant) || isAddingToCart || isBuyingNow}
                    className="btn-premium btn-outline"
                    style={{ flex: 1, padding: "1rem", height: "54px" }}
                  >
                    {isAddingToCart ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        <div style={{ width: "14px", height: "14px", border: "2px solid var(--color-border)", borderTopColor: "var(--color-text)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                        Adding...
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
                        <ShoppingBag size={15} strokeWidth={1.5} /> Add to Cart
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleWishlist}
                    className="btn-premium btn-outline"
                    style={{ width: "54px", height: "54px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                    title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart size={18} strokeWidth={1.5} fill={wishlisted ? "var(--color-primary)" : "none"} className={wishlisted ? "text-primary" : ""} />
                  </button>
                </div>

                {/* Buy Now */}
                <button
                  onClick={() => handleAction("buy")}
                  disabled={!currentVariant || !isInStock(currentVariant) || isAddingToCart || isBuyingNow}
                  className="btn-premium btn-primary"
                  style={{ width: "100%", padding: "1rem", height: "54px" }}
                >
                  {isBuyingNow ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      Processing...
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
                      Buy Now
                    </span>
                  )}
                </button>
              </div>

              {/* View Details Link */}
              <div className="text-center md:text-left mt-2 border-t border-gray-100 pt-6">
                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    fontWeight: 500,
                  }}
                  className="hover:text-black hover:underline underline-offset-4"
                >
                  View full product details →
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }
      `}</style>
    </>
  );
};

export default QuickViewModal;
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../features/cart/context/CartContext";
import { useWishlist } from "../../features/wishlist/components/WishList";
import { useAuth } from "../../features/auth/context/AuthContext";
import { toast } from "sonner";
import { ShoppingBag, Heart, Eye, Check } from "lucide-react";
import QuickViewModal from "../../features/products/components/QuickViewModal";
import api from "../../api/apiService";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const productImage =
    product?.image ||
    product?.images?.[0]?.image ||
    product?.images?.[0] ||
    "https://via.placeholder.com/400x500?text=No+Image";

  const variants = product?.variants || [];

  const availableSizes = useMemo(() => {
    const sizes = [...new Set(variants.map((v) => v.size))];
    return sizes.sort();
  }, [variants]);

  const currentVariant = selectedVariant || variants[0];

  const isInStock = (variant) => variant && variant.stock > 0;

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

  const handleSizeSelect = (size) => {
    const variant = variants.find(
      (v) => v.size === size && (!selectedVariant || v.color === selectedVariant.color)
    );
    if (variant) setSelectedVariant(variant);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    const variantToAdd = selectedVariant || variants[0];

    if (!variantToAdd) {
      toast.error("No variants available for this product");
      return;
    }

    if (!isInStock(variantToAdd)) {
      toast.error("Selected variant is out of stock");
      return;
    }

    setIsAdding(true);
    const response = await addToCart(variantToAdd.id, 1);
    setIsAdding(false);

    if (response?.success) {
      toast.success(
        <div className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          <span>Added to cart — {product.name} ({variantToAdd.size})</span>
        </div>
      );
    } else {
      toast.error(response?.message || "Failed to add item to cart");
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to buy items");
      return;
    }

    const variantToBuy = selectedVariant || variants[0];

    if (!variantToBuy) {
      toast.error("No variants available for this product");
      return;
    }

    if (!isInStock(variantToBuy)) {
      toast.error("Selected variant is out of stock");
      return;
    }

    try {
      setIsBuying(true);
      const res = await api.post("/orders/buy-now/", {
        variant_id: variantToBuy.id,
        quantity: 1
      });
      const orderId = res.data.order_id;
      navigate(`/checkout/${orderId}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to initialize checkout");
    } finally {
      setIsBuying(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to save items to wishlist");
      return;
    }

    const variantToWishlist = currentVariant;

    if (!variantToWishlist) {
      toast.error("No variant available");
      return;
    }

    const result = await toggleWishlist(variantToWishlist.id);

    if (result?.success !== false) {
      const nowWishlisted = isInWishlist(variantToWishlist.id);
      toast.success(nowWishlisted ? "Added to wishlist" : "Removed from wishlist");
    } else {
      toast.error("Something went wrong");
    }
  };

  const wishlisted = isInWishlist(currentVariant?.id);

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <div
        className="product-card group"
        style={{
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        <Link
          to={`/product/${product.id}`}
          style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
        >
          {/* Image */}
          <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#f5f5f5' }}>
            <img
              src={productImage}
              alt={product.name}
              className="product-image w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />

            {/* Hover actions — minimal */}
            <div className="product-card-actions">
              <button
                onClick={handleWishlist}
                className={`product-action-btn ${wishlisted ? "wishlisted" : ""}`}
                title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleQuickView}
                className="product-action-btn"
                title="Quick view"
              >
                <Eye size={15} />
              </button>
            </div>

            {/* Out of Stock */}
            {currentVariant && !isInStock(currentVariant) && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255,255,255,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#999',
                }}>
                  Out of Stock
                </span>
              </div>
            )}

            {/* Badges — minimal text */}
            <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {product.is_new && (
                <span style={{
                  fontSize: '0.55rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#000',
                  background: '#fff',
                  padding: '0.2rem 0.5rem',
                }}>
                  New
                </span>
              )}
              {product.discount_percentage > 0 && (
                <span style={{
                  fontSize: '0.55rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  color: '#c41e3a',
                  background: '#fff',
                  padding: '0.2rem 0.5rem',
                }}>
                  -{product.discount_percentage}%
                </span>
              )}
            </div>
          </div>

          {/* Product Info — minimal */}
          <div style={{ padding: '0.75rem 0 0' }}>
            <h3 style={{
              fontSize: '0.8rem',
              fontWeight: 400,
              lineHeight: 1.4,
              marginBottom: '0.25rem',
            }}>
              {product.name}
            </h3>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: 400,
              color: '#666',
            }}>
              {getPriceDisplay()}
            </p>
          </div>
        </Link>

        {/* Size & Add to Cart */}
        <div style={{ padding: '0.5rem 0 0.5rem' }}>
          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div className="flex flex-wrap gap-1">
                {availableSizes.map((size) => {
                  const variant = variants.find((v) => v.size === size);
                  const isSelected = currentVariant?.size === size;
                  const hasStock = variant && variant.stock > 0;

                  return (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSizeSelect(size);
                      }}
                      disabled={!hasStock}
                      style={{
                        minWidth: '34px',
                        height: '30px',
                        padding: '0 0.35rem',
                        fontSize: '0.65rem',
                        fontWeight: isSelected ? 500 : 400,
                        fontFamily: 'inherit',
                        border: isSelected ? '1px solid #000' : '1px solid #e5e5e5',
                        cursor: hasStock ? 'pointer' : 'not-allowed',
                        background: '#fff',
                        color: hasStock ? '#000' : '#ccc',
                        textDecoration: hasStock ? 'none' : 'line-through',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.25rem', width: '100%', marginTop: '0.5rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={!currentVariant || !isInStock(currentVariant) || isAdding || isBuying}
              style={{
                flex: 1,
                padding: '0.65rem 0.25rem',
                fontSize: '0.6rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: '#fff',
                color: '#000',
                border: '1px solid #000',
                cursor: !currentVariant || !isInStock(currentVariant) ? 'not-allowed' : 'pointer',
                opacity: !currentVariant || !isInStock(currentVariant) ? 0.3 : 1,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
              onMouseEnter={(e) => { if (!e.target.disabled) { e.target.style.background = '#000'; e.target.style.color = '#fff'; } }}
              onMouseLeave={(e) => { if (!e.target.disabled) { e.target.style.background = '#fff'; e.target.style.color = '#000'; } }}
            >
              {isAdding ? "Adding..." : <><ShoppingBag size={12} /> Bag</>}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!currentVariant || !isInStock(currentVariant) || isAdding || isBuying}
              style={{
                flex: 1,
                padding: '0.65rem 0.25rem',
                fontSize: '0.6rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: '#000',
                color: '#fff',
                border: '1px solid #000',
                cursor: !currentVariant || !isInStock(currentVariant) ? 'not-allowed' : 'pointer',
                opacity: !currentVariant || !isInStock(currentVariant) ? 0.3 : 1,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
              onMouseEnter={(e) => { if (!e.target.disabled) e.target.style.background = '#333'; }}
              onMouseLeave={(e) => { if (!e.target.disabled) e.target.style.background = '#000'; }}
            >
              {isBuying ? "Processing..." : "Buy Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductCard;
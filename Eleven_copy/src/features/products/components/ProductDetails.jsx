import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import api from "../../../api/apiService";
import { useCart } from "../../cart/context/CartContext";
import { useWishlist } from "../../wishlist/components/WishList";
import { useAuth } from "../../auth/context/AuthContext";
import { toast } from "sonner";

import { ShoppingBag, Heart, ArrowLeft, Check } from "lucide-react";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Contexts
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Action Loaders
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Refs for GSAP
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}/`);
        setProduct(res.data);
      } catch (error) {
        console.error("Product detail error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Entrance animation
  useEffect(() => {
    if (loading || !product) return;

    const tl = gsap.timeline({ delay: 0.1 });

    // Image slide in from left
    if (imageRef.current) {
      tl.fromTo(
        imageRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
      );
    }

    // Info cascade in from bottom
    if (infoRef.current) {
      const items = infoRef.current.querySelectorAll(".detail-item");
      tl.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power3.out",
        },
        "-=0.6"
      );
    }

    return () => tl.kill();
  }, [loading, product]);

  const images = product?.images || [];
  const variants = useMemo(() => product?.variants || [], [product?.variants]);

  const uniqueSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size))].sort(),
    [variants]
  );

  const availableColorsForSize = useMemo(() => {
    if (selectedSize) {
      return [
        ...new Set(
          variants.filter((v) => v.size === selectedSize).map((v) => v.color)
        ),
      ];
    }
    return [...new Set(variants.map((v) => v.color))];
  }, [selectedSize, variants]);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.size === selectedSize && v.color === selectedColor),
    [selectedColor, selectedSize, variants]
  );

  useEffect(() => {
    if (variants.length > 0 && uniqueSizes.length === 1 && !selectedSize) {
      setSelectedSize(uniqueSizes[0]);
    }
  }, [selectedSize, uniqueSizes, variants.length]);

  useEffect(() => {
    if (
      variants.length > 0 &&
      selectedSize &&
      availableColorsForSize.length === 1 &&
      !selectedColor
    ) {
      setSelectedColor(availableColorsForSize[0]);
    }
  }, [availableColorsForSize, selectedColor, selectedSize, variants.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white">
        <h2 className="text-2xl font-light mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-xs uppercase tracking-widest border-b border-black pb-1">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isInStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const wishlisted = isInWishlist(selectedVariant?.id || product.id);

  /* ─── Actions ─── */

  const handleAction = async (actionType) => {
    if (!user) {
      toast.error(`Please login to ${actionType === "buy" ? "buy" : "add items"}`);
      return;
    }

    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color first");
      // highlight the sections briefly
      gsap.fromTo('.size-color-selector', { x: -5 }, { x: 5, duration: 0.05, yoyo: true, repeat: 5, clearProps: "x" });
      return;
    }

    if (!selectedVariant) {
      toast.error("This combination is currently unavailable");
      return;
    }

    if (!isInStock) {
      toast.error("This item is out of stock");
      return;
    }

    if (actionType === "add") {
      setIsAddingToCart(true);
      const response = await addToCart(selectedVariant.id, 1);
      setIsAddingToCart(false);

      if (response?.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            <span>Added to cart</span>
          </div>
        );
      } else {
        toast.error(response?.message || "Failed to add item to cart");
      }
      return;
    }

    if (actionType === "buy") {
      try {
        setIsBuyingNow(true);
        const res = await api.post("/orders/buy-now/", {
          variant_id: selectedVariant.id,
          quantity: 1
        });
        const orderId = res.data.order_id;
        navigate(`/checkout/${orderId}`);
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to initialize checkout");
      } finally {
        setIsBuyingNow(false);
      }
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error("Please login to use your wishlist");
      return;
    }
    const variantId = selectedVariant?.id || product.id;
    const result = await toggleWishlist(variantId);
    if (result?.success !== false) {
      const nowWishlisted = isInWishlist(variantId);
      toast.success(nowWishlisted ? "Added to wishlist" : "Removed from wishlist");
    } else {
      toast.error("Something went wrong");
    }
  };

  // Pricing Logic
  const priceDisplay = selectedVariant?.price || product.price;

  return (
    <div
      ref={containerRef}
      className="bg-white min-h-screen"
      style={{
        padding: 'clamp(2rem, 5vw, 4rem) max(1.5rem, calc((100vw - 1400px) / 2))',
      }}
    >
      {/* Breadcrumb */}
      <div className="detail-item mb-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors"
          style={{ textDecoration: 'none' }}
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-start">
        {/* LEFT — IMAGES */}
        <div ref={imageRef} className="sticky top-24">
          <div
            className="image-zoom bg-neutral-100 relative overflow-hidden"
            style={{
              aspectRatio: '3/4',
              maxHeight: '80vh'
            }}
          >
            <img
              src={images[activeImage]?.image || "/placeholder.jpg"}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105 cursor-crosshair"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 custom-scrollbar">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setActiveImage(index);
                    if (imageRef.current) {
                      const mainImg = imageRef.current.querySelector('.image-zoom img');
                      gsap.fromTo(mainImg, { opacity: 0.6, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.4 });
                    }
                  }}
                  className="flex-shrink-0 relative overflow-hidden transition-all duration-300"
                  style={{
                    width: '72px',
                    height: '96px',
                    border: activeImage === index ? '1px solid black' : '1px solid transparent',
                    opacity: activeImage === index ? 1 : 0.5,
                  }}
                >
                  <img src={img.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — DETAILS */}
        <div ref={infoRef} className="flex flex-col pt-2 md:pt-10">

          {/* Category */}
          <div className="detail-item">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">
              {product.category?.name || "Ready to Wear"}
            </p>
          </div>

          {/* Title */}
          <div className="detail-item">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-4">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="detail-item flex items-end gap-3 mb-8">
            <span className="text-2xl font-mono tracking-tight">
              ₹{priceDisplay}
            </span>
            {product.original_price && product.original_price > priceDisplay && (
              <>
                <span className="text-sm text-neutral-400 line-through mb-1">
                  ₹{product.original_price}
                </span>
                <span className="text-xs font-medium bg-red-600 text-white px-2 py-1 mb-1">
                  {Math.round(((product.original_price - priceDisplay) / product.original_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="detail-item h-[1px] bg-neutral-200 w-full mb-8" />

          {/* Description */}
          <div className="detail-item mb-10">
            <p className="text-sm text-neutral-600 leading-relaxed font-light">
              {product.description || "Premium material and expert craftsmanship. Elevate your wardrobe with this essential piece."}
            </p>
          </div>

          <div className="size-color-selector">
            {/* SIZE SELECT */}
            {uniqueSizes.length > 0 && (
              <div className="detail-item mb-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs uppercase tracking-[0.15em] font-medium">Select Size</p>
                  {/* Optional: <button className="text-[10px] text-neutral-500 underline underline-offset-2 uppercase tracking-wider">Size Guide</button> */}
                </div>

                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        id={`size-${size}`}
                        className="relative transition-all duration-200 flex items-center justify-center text-xs"
                        style={{
                          width: '48px',
                          height: '48px',
                          border: isSelected ? '1px solid black' : '1px solid #e5e5e5',
                          background: isSelected ? 'black' : 'transparent',
                          color: isSelected ? 'white' : 'black',
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COLOR SELECT */}
            {availableColorsForSize.length > 0 && selectedSize && (
              <div className="detail-item mb-8">
                <p className="text-xs uppercase tracking-[0.15em] font-medium mb-3">
                  Select Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColorsForSize.map((color) => {
                    const isSelected = selectedColor === color;
                    // check if this specific variant exists
                    const variantExists = variants.find(v => v.size === selectedSize && v.color === color);
                    const hasStock = variantExists ? variantExists.stock > 0 : false;

                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        disabled={!variantExists} // Disable if combo doesn't exist
                        className="relative px-5 h-12 text-xs transition-all duration-200 overflow-hidden"
                        style={{
                          border: isSelected ? '1px solid black' : '1px solid #e5e5e5',
                          background: isSelected ? 'black' : 'transparent',
                          color: isSelected ? 'white' : (variantExists ? 'black' : '#a3a3a3'),
                          cursor: variantExists ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {color}
                        {!hasStock && variantExists && (
                          <div style={{
                            position: "absolute",
                            top: '50%', left: '-10%', right: '-10%',
                            height: "1px",
                            background: "#e5e5e5",
                            transform: "rotate(-15deg)",
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="detail-item mb-8 h-4">
            {selectedSize && selectedColor && (
              <p className={`text-xs uppercase tracking-widest flex items-center gap-2 ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? 'bg-green-600' : 'bg-red-600'}`} />
                {isInStock ? "In Stock" : "Out of Stock"}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="detail-item flex flex-col gap-3">
            <div className="flex gap-3">
              {/* ADD TO CART */}
              <button
                onClick={() => handleAction("add")}
                disabled={isAddingToCart || isBuyingNow || (selectedVariant && !isInStock)}
                className="flex-1 h-14 border border-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
                ) : (
                  <><ShoppingBag size={16} strokeWidth={1.5} /> Add to Bag</>
                )}
              </button>

              {/* WISHLIST */}
              <button
                onClick={handleWishlist}
                className="w-14 h-14 border border-black flex items-center justify-center hover:bg-neutral-50 transition-colors"
              >
                <Heart size={20} strokeWidth={1.5} fill={wishlisted ? 'black' : 'none'} className={wishlisted ? 'text-black' : ''} />
              </button>
            </div>

            {/* BUY NOW */}
            <button
              onClick={() => handleAction("buy")}
              disabled={isAddingToCart || isBuyingNow || (selectedVariant && !isInStock)}
              className="w-full h-14 bg-black text-white flex items-center justify-center text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBuyingNow ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Buy it Now"
              )}
            </button>
          </div>

          {/* Delivery Info */}
          <div className="detail-item mt-10 pt-6 border-t border-neutral-100 flex flex-col gap-4">
            <p className="text-xs text-neutral-500 uppercase tracking-widest flex justify-between">
              <span>Standard Delivery</span>
              <span>3-5 Business Days</span>
            </p>
            <p className="text-xs text-neutral-500 uppercase tracking-widest flex justify-between">
              <span>Express Delivery</span>
              <span>1-2 Business Days</span>
            </p>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
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
    </div>
  );
};

export default ProductDetails;

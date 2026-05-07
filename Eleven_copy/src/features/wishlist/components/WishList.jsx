import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../../api/apiService";
import { useAuth } from "../../auth/context/AuthContext";
import { useCart } from "../../cart/context/CartContext";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { fetchCart } = useCart(); // ✅ get fetchCart from cart context
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch Wishlist
  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get("/wishlist/view/");

      const formatted = data.map((item) => ({
        id: item.id,
        variantId: item.variant_id,
        productId: item.product_id,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        addedAt: item.created_at,
        isInStock: item.stock > 0,
      }));

      setWishlistItems(formatted);
    } catch (err) {
      console.error(err);
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  // ✅ Add To Wishlist
  const addToWishlist = async (variantId) => {
    try {
      setError(null);
      await api.post("/wishlist/add/", { variant: variantId });
      await fetchWishlist();
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.error || "Item already in wishlist");
      return { success: false };
    }
  };

  // ✅ Remove From Wishlist
  const removeFromWishlist = async (wishlistId) => {
    try {
      await api.delete(`/wishlist/remove/${wishlistId}/`);
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove item");
      return { success: false };
    }
  };

  // ✅ Move To Cart — now refreshes cart context
  const moveToCart = async (wishlistItem) => {
    try {
      await api.post(`/wishlist/move-to-cart/${wishlistItem.id}/`);

      // Remove from wishlist state
      setWishlistItems((prev) =>
        prev.filter((item) => item.id !== wishlistItem.id)
      );

      // ✅ Refresh cart so CartPage shows the new item immediately
      await fetchCart();

      return { success: true, message: "Item moved to cart" };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Failed to move item" };
    }
  };

  // ✅ Toggle wishlist by variantId
  const toggleWishlist = async (variantId) => {
    const existing = wishlistItems.find((item) => item.variantId === variantId);

    if (existing) {
      return await removeFromWishlist(existing.id);
    } else {
      return await addToWishlist(variantId);
    }
  };

  const isInWishlist = (variantId) =>
    wishlistItems.some((item) => item.variantId === variantId);

  const getWishlistCount = () => wishlistItems.length;

  const clearWishlist = async () => {
    try {
      await api.delete("/wishlist/clear/");
      setWishlistItems([]);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.error || "Failed to clear wishlist");
      return { success: false };
    }
  };

  const clearError = () => setError(null);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        getWishlistCount,
        moveToCart,
        clearWishlist,
        fetchWishlist,
        clearError,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

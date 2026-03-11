import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../../api/apiService";
import { useCallback } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);

  // Listen for login/logout (token changes) via storage events
  const [token, setToken] = useState(localStorage.getItem("access"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("access"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // -------------------------
  // Fetch Cart
  // -------------------------
  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart(null);
      return;
    }

    try {
      const res = await api.get("/cart/");
      setCart({ ...res.data });
    } catch (error) {
      console.error("Cart fetch failed", error);
      setCart(null);
    }
  }, [token]);

  // -------------------------
  // Add To Cart
  // -------------------------
  const addToCart = async (variantId, quantity = 1) => {
  try {
    await api.post("/cart/add/", { variant_id: variantId, quantity });

    const res = await api.get("/cart/");
    setCart(res.data);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || "Add failed",
    };
  }
};
  // -------------------------
  // Update Cart Item
  // -------------------------
  const updateCartItem = async (itemId, quantity) => {
    try {
      await api.patch(`/cart/item/${itemId}/`, { quantity });
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  // -------------------------
  // Remove Cart Item
  // -------------------------
  const removeCartItem = async (itemId) => {
    try {
      await api.delete(`/cart/item/${itemId}/delete/`);
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  // -------------------------
  // Clear Cart
  // -------------------------
  const clearCart = async () => {
    try {
      await api.delete("/cart/clear/");
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  // -------------------------
  // Derived Values
  // -------------------------
  const cartItems = cart?.items || [];
  const cartCount = cart?.total_quantity || 0;
  const totalPrice = cart?.total_price || 0;

  useEffect(() => {
  if (token) {
    fetchCart();
  }
}, [token, fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartCount,
        totalPrice,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
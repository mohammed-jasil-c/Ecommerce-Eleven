import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { CartProvider } from "./features/cart/context/CartContext";
import { WishlistProvider } from "./features/wishlist/components/WishList";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins globally
gsap.registerPlugin(ScrollTrigger);

// Shared Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProfileModal from "./components/common/ProfileModal";
import PageTransition from "./Components/common/PageTransition";
import Preloader from "./Components/common/Preloader";

// Auth Feature
import ProtectedRoute from "./features/auth/guards/ProtectedRoute";
import AdminRoute from "./features/auth/guards/AdminRoute";
import PublicRoute from "./features/auth/guards/PublicRoute";
import Login from "./features/auth/components/Login";
import Registration from "./features/auth/components/Registration";
import { useBlockCheck } from "./features/auth/utils/handleLogin";
import { useAuth } from "./features/auth/context/AuthContext";
import ChangePasswordPage from "./features/auth/components/ChangePassword.jsx";

// Pages
import HomePage from "./pages/Home/HomePage";
import NewArrivals from "./pages/Home/NewArrivals";
import NotFound from "./pages/NotFound/NotFound";
import AboutPage from "./pages/About";
import Contact from "./pages/Contact";
import ProfilePage from "./pages/profilePage.jsx";
import AddressesPage from "./pages/AddressesPage.jsx";

// Product Feature
import ShopPage from "./features/products/components/Shop";
import ProductDetails from "./features/products/components/ProductDetails";
import CategoryProducts from "./features/products/components/CategoryProducts";
import CheckoutPage from "./features/orders/components/CheckoutPage.jsx";
import PaymentSuccess from "./features/checkout/payments/PaymentSuccess.jsx";

// Cart & Wishlist Features
import CartPage from "./features/cart/components/Cart";
import WishlistPage from "./features/wishlist/components/WishlistPage";

// Order Feature
import OrdersPage from "./features/orders/components/OrdersPage.jsx";
import TrackOrder from "./features/orders/components/TrackOrder";
import OrderTrackingDetail from "./features/orders/components/OrderTrackingDetail";
import OrderDetailPage from "./features/orders/components/OrderDetailPage.jsx";

// Admin Feature
import AdminLayout from "./features/admin/layout/AdminLayout";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import UserManagement from "./features/admin/pages/users/UserManagement";
import ProductManagement from "./features/admin/pages/products/ProductsManagement";
import AddProduct from "./features/admin/pages/products/AddProducts";
import EditProduct from "./features/admin/pages/products/EditProducts";
import OrderManagement from "./features/admin/pages/orders/OrderManagement";
import OrderDetails from "./features/admin/pages/orders/OrderDetails";

// Layout component to handle conditional rendering
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Only show Navbar for non-admin routes */}
      {!isAdminRoute && <Navbar />}
      <main className={`min-h-screen ${!isAdminRoute ? "pt-16" : ""}`}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      {/* Only show Footer for non-admin routes */}
      {!isAdminRoute && <Footer />}
    </>
  );
};

function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  useBlockCheck();
  return (
    <>
      {/* Preloader on initial load */}
      {!preloaderDone && (
        <Preloader onComplete={() => setPreloaderDone(true)} />
      )}

      <AppLayout>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<PublicRoute> <Login /></PublicRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          <Route path="/register" element={<Registration />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/category/:categoryId" element={<CategoryProducts />} />
          <Route
            path="/checkout/:orderId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment-success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route path="profile" element={<ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>} />
          <Route
            path="/addresses"
            element={
              <ProtectedRoute>
                <AddressesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/track-order/:orderId" element={<OrderTrackingDetail />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Routes — nested under AdminLayout sidebar */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:productId" element={<EditProduct />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />
          </Route>


          {/* 404 route should be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>

      </AppLayout>


      {/* Toaster for notifications */}
      <Toaster position="bottom-right" richColors />
    </>
  );
}

export default App;
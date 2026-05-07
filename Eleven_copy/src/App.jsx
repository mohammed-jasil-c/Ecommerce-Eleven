import React, { useState, Suspense, lazy } from "react";
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
const ChangePasswordPage = lazy(() => import("./features/auth/components/ChangePassword.jsx"));

// Pages
const HomePage = lazy(() => import("./pages/Home/HomePage"));
const NewArrivals = lazy(() => import("./pages/Home/NewArrivals"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const AboutPage = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const ProfilePage = lazy(() => import("./pages/profilePage.jsx"));
const AddressesPage = lazy(() => import("./pages/AddressesPage.jsx"));

// Product Feature
const ShopPage = lazy(() => import("./features/products/components/Shop"));
const ProductDetails = lazy(() => import("./features/products/components/ProductDetails"));
const CategoryProducts = lazy(() => import("./features/products/components/CategoryProducts"));
const CheckoutPage = lazy(() => import("./features/orders/components/CheckoutPage.jsx"));
const PaymentSuccess = lazy(() => import("./features/checkout/payments/PaymentSuccess.jsx"));

// Cart & Wishlist Features
const CartPage = lazy(() => import("./features/cart/components/Cart"));
const WishlistPage = lazy(() => import("./features/wishlist/components/WishlistPage"));

// Order Feature
const OrdersPage = lazy(() => import("./features/orders/components/OrdersPage.jsx"));
const TrackOrder = lazy(() => import("./features/orders/components/TrackOrder"));
const OrderTrackingDetail = lazy(() => import("./features/orders/components/OrderTrackingDetail"));
const OrderDetailPage = lazy(() => import("./features/orders/components/OrderDetailPage.jsx"));

// Admin Feature
const AdminLayout = lazy(() => import("./features/admin/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./features/admin/pages/AdminDashboard"));
const UserManagement = lazy(() => import("./features/admin/pages/users/UserManagement"));
const CategoryManagement = lazy(() => import("./features/admin/pages/categories/CategoryManagement"));
const AddCategory = lazy(() => import("./features/admin/pages/categories/AddCategory"));
const ProductManagement = lazy(() => import("./features/admin/pages/products/ProductsManagement"));
const AddProduct = lazy(() => import("./features/admin/pages/products/AddProducts"));
const EditProduct = lazy(() => import("./features/admin/pages/products/EditProducts"));
const OrderManagement = lazy(() => import("./features/admin/pages/orders/OrderManagement"));
const OrderDetails = lazy(() => import("./features/admin/pages/orders/OrderDetails"));

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
        <Suspense fallback={<Preloader />}><Routes>
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
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="categories/add" element={<AddCategory />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:productId" element={<EditProduct />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />
          </Route>


          {/* 404 route should be last */}
          <Route path="*" element={<NotFound />} />
        </Routes></Suspense>

      </AppLayout>


      {/* Toaster for notifications */}
      <Toaster position="bottom-right" richColors />
    </>
  );
}

export default App;
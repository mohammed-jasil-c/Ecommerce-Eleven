$base = "c:\Users\Mohammed Jasil c\OneDrive\Desktop\Eleven-frontend\Eleven\ecommerce\src"

# Ensure target directories exist
$dirs = @(
    "$base\pages\Home",
    "$base\pages\NotFound"
)
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}

# 1. Api -> api
Copy-Item "$base\Api\Apipage.jsx" "$base\api\apiService.js" -Force

# 2. Context -> features
Copy-Item "$base\Context\AuthContext.jsx" "$base\features\auth\context\AuthContext.jsx" -Force
Copy-Item "$base\Context\CartContext.jsx" "$base\features\cart\context\CartContext.jsx" -Force
Copy-Item "$base\Context\ProtectedRoute.jsx" "$base\features\auth\guards\ProtectedRoute.jsx" -Force
Copy-Item "$base\Context\HandileLogin.jsx" "$base\features\auth\utils\handleLogin.js" -Force
Copy-Item "$base\Context\WishList.jsx" "$base\features\wishlist\components\WishList.jsx" -Force

# 3. Pages/Auth -> features/auth
Copy-Item "$base\Pages\Auth\Login.jsx" "$base\features\auth\components\Login.jsx" -Force
Copy-Item "$base\Pages\Auth\Registration.jsx" "$base\features\auth\components\Registration.jsx" -Force
Copy-Item "$base\Pages\Auth\AdminRoute.jsx" "$base\features\auth\guards\AdminRoute.jsx" -Force
Copy-Item "$base\Pages\Auth\PublicRoute.jsx" "$base\features\auth\guards\PublicRoute.jsx" -Force

# 4. Cart -> features/cart & features/wishlist
Copy-Item "$base\Pages\NonAuth\Cart\Cart.jsx" "$base\features\cart\components\Cart.jsx" -Force
Copy-Item "$base\Pages\NonAuth\Cart\wishlist.jsx" "$base\features\wishlist\components\WishlistPage.jsx" -Force

# 5. Products -> features/products
Copy-Item "$base\Pages\NonAuth\Products\ProductDetails.jsx" "$base\features\products\components\ProductDetails.jsx" -Force
Copy-Item "$base\Pages\NonAuth\Products\CategoryProducts.jsx" "$base\features\products\components\CategoryProducts.jsx" -Force
Copy-Item "$base\Pages\NonAuth\shop\Shop.jsx" "$base\features\products\components\Shop.jsx" -Force
Copy-Item "$base\Pages\NonAuth\BuyNow.jsx" "$base\features\products\components\BuyNow.jsx" -Force

# 6. Orders -> features/orders
Copy-Item "$base\Pages\NonAuth\TrackOrder.jsx" "$base\features\orders\components\TrackOrder.jsx" -Force
Copy-Item "$base\Pages\NonAuth\OrderTrackingDetail.jsx" "$base\features\orders\components\OrderTrackingDetail.jsx" -Force

# 7. Checkout -> features/checkout
Copy-Item "$base\Pages\CheckoutPage.jsx" "$base\features\checkout\components\CheckoutPage.jsx" -Force

# 8. Payments -> features/checkout/payments
Copy-Item "$base\payments\StripeCheckout.jsx" "$base\features\checkout\payments\StripeCheckout.jsx" -Force
Copy-Item "$base\payments\StripeProvider.jsx" "$base\features\checkout\payments\StripeProvider.jsx" -Force

# 9. Shared components
Copy-Item "$base\Components\Footer.jsx" "$base\components\layout\Footer.jsx" -Force
Copy-Item "$base\Components\Navbar\Navbar.jsx" "$base\components\layout\Navbar.jsx" -Force
Copy-Item "$base\Components\ProductCard.jsx" "$base\components\ui\ProductCard.jsx" -Force
Copy-Item "$base\Common\ProfileModal.jsx" "$base\components\common\ProfileModal.jsx" -Force

# 10. Admin -> features/admin
Copy-Item "$base\Components\Admin\Layout\AdminLayout.jsx" "$base\features\admin\layout\AdminLayout.jsx" -Force
Copy-Item "$base\Components\Admin\Layout\AdminHeader.jsx" "$base\features\admin\layout\AdminHeader.jsx" -Force
Copy-Item "$base\Components\Admin\Layout\AdminFooter.jsx" "$base\features\admin\layout\AdminFooter.jsx" -Force
Copy-Item "$base\Components\Admin\pages\Admin Pages\AdminDashbord.jsx" "$base\features\admin\pages\AdminDashboard.jsx" -Force
Copy-Item "$base\Components\Admin\pages\Admin Pages\Users\UserManagment.jsx" "$base\features\admin\pages\users\UserManagement.jsx" -Force
Copy-Item "$base\Components\Admin\pages\Admin Pages\Products\ProductsManagment.jsx" "$base\features\admin\pages\products\ProductsManagement.jsx" -Force
Copy-Item "$base\Components\Admin\pages\Admin Pages\Products\AddProducts.jsx" "$base\features\admin\pages\products\AddProducts.jsx" -Force
Copy-Item "$base\Components\Admin\pages\Admin Pages\Products\EditProducts.jsx" "$base\features\admin\pages\products\EditProducts.jsx" -Force
Copy-Item "$base\Components\Admin\pages\Admin Pages\Order\OrderManagment.jsx" "$base\features\admin\pages\orders\OrderManagement.jsx" -Force
Copy-Item "$base\Components\Admin\pages\Admin Pages\Order\OrderDetails.jsx" "$base\features\admin\pages\orders\OrderDetails.jsx" -Force
Copy-Item "$base\Components\Admin\pages\Non Auth\Unauthorized.jsx" "$base\features\admin\pages\Unauthorized.jsx" -Force

# 11. Static pages
Copy-Item "$base\Pages\NonAuth\Home\HomePage.jsx" "$base\pages\Home\HomePage.jsx" -Force
Copy-Item "$base\Pages\NonAuth\Home\NewArrivals.jsx" "$base\pages\Home\NewArrivals.jsx" -Force
Copy-Item "$base\Pages\NonAuth\About.jsx" "$base\pages\About.jsx" -Force
Copy-Item "$base\Pages\NonAuth\Contact.jsx" "$base\pages\Contact.jsx" -Force
Copy-Item "$base\Pages\NonAuth\NotFound\NotFound.jsx" "$base\pages\NotFound\NotFound.jsx" -Force

Write-Output "SUCCESS: All files copied!"

# Production Deployment Guide - Eleven E-Commerce

## Overview
This guide covers the setup and deployment of the Eleven E-Commerce full-stack application to production:
- **Frontend**: React (Vite) deployed on Vercel
- **Backend**: Django (Gunicorn + Nginx) on AWS EC2
- **Domain**: https://11eleven.duckdns.org

---

## ✅ Frontend Configuration (Vercel)

### 1. **vercel.json** - SPA Routing Setup

The `vercel.json` file configures Vercel to:
- Redirect all routes to `index.html` (SPA routing)
- Pass environment variables to the build process
- Set correct build command and output directory

**Key Features:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This fixes the 404 NOT_FOUND error on routes like `/login`, `/products`, etc.

### 2. **Environment Variables** (`.env`)

Update these in Vercel Dashboard:

```
VITE_API_URL=https://11eleven.duckdns.org/api
VITE_API_TIMEOUT=10000
VITE_AUTH_TOKEN_KEY=access
VITE_REFRESH_TOKEN_KEY=refresh
VITE_GOOGLE_CLIENT_ID=108022282210-anutpje6t4hotelih3spcp6ufjjh7i6f.apps.googleusercontent.com
VITE_MEDIA_URL=https://11eleven.duckdns.org/media/
VITE_FRONTEND_URL=https://ecommerce-eleven.vercel.app
```

### 3. **Axios Configuration** (Already Fixed)

File: `src/api/apiService.js`

```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,  // Uses environment variable
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});
```

**Why this works:**
- `VITE_API_URL` is set to `https://11eleven.duckdns.org/api`
- All API calls automatically prefix this base URL
- Example: `api.get("/products/")` → `https://11eleven.duckdns.org/api/products/`

### 4. **Google OAuth Setup** (Already Configured)

File: `src/main.jsx`

```javascript
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    {/* App components */}
  </GoogleOAuthProvider>
);
```

**To fix Google login:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select your project
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URIs:
   - `https://ecommerce-eleven.vercel.app`
   - `https://ecommerce-eleven.vercel.app/login`
5. Copy the Client ID and set as `VITE_GOOGLE_CLIENT_ID` in Vercel

---

## 🔧 Backend Configuration (Django)

### 1. **Django URLs** (Already Prefixed with `/api/`)

File: `Eleven-backend/eleven/urls.py`

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),      # ✅ /api/auth/*
    path('api/products/', include('apps.products.urls')),   # ✅ /api/products/*
    path('api/cart/', include('apps.cart.urls')),          # ✅ /api/cart/*
    path('api/orders/', include('apps.orders.urls')),      # ✅ /api/orders/*
    path('api/wishlist/', include('apps.wishlist.urls')),  # ✅ /api/wishlist/*
]
```

### 2. **CORS Configuration** (Required for Production)

File: `Eleven-backend/eleven/settings.py`

**Current setup** (for development):
```python
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
    if DEBUG else "",
)
```

**For Production**, set in `.env`:
```
CORS_ALLOWED_ORIGINS=https://ecommerce-eleven.vercel.app,https://11eleven.duckdns.org
ALLOWED_HOSTS=11eleven.duckdns.org,your-aws-domain.com
DEBUG=False
```

### 3. **Nginx Configuration** (Example for AWS)

Your Nginx should have this `location /api/` block:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;
}
```

---

## 📋 API Endpoints (All Working Correctly)

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/google/` - Google OAuth login
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Refresh access token

### Products
- `GET /api/products/` - List products with filters
- `GET /api/products/?is_featured=true` - Featured products
- `GET /api/products/?is_new=true` - New products
- `GET /api/products/categories/` - Product categories

### Cart
- `GET /api/cart/` - Get user cart
- `POST /api/cart/add/` - Add item to cart
- `DELETE /api/cart/remove/{id}/` - Remove item from cart

### Orders
- `GET /api/orders/my-orders/` - User orders
- `POST /api/orders/checkout/` - Create order
- `POST /api/orders/buy-now/` - Buy now

### Wishlist
- `GET /api/wishlist/view/` - Get wishlist
- `POST /api/wishlist/add/` - Add to wishlist
- `DELETE /api/wishlist/remove/` - Remove from wishlist

---

## 🚀 Deployment Steps

### Step 1: Vercel Deployment

1. **Push to GitHub:**
   ```bash
   cd Eleven_copy
   git add .
   git commit -m "feat: Add vercel.json and production env variables"
   git push
   ```

2. **Deploy to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your GitHub repo
   - Add environment variables in Settings
   - Deploy

### Step 2: Backend Production Setup (AWS)

1. **Update `.env` on AWS:**
   ```bash
   DEBUG=False
   CORS_ALLOWED_ORIGINS=https://ecommerce-eleven.vercel.app,https://11eleven.duckdns.org
   ALLOWED_HOSTS=11eleven.duckdns.org,your-domain.com
   ```

2. **Restart Django/Gunicorn:**
   ```bash
   systemctl restart gunicorn
   systemctl restart nginx
   ```

3. **Test API endpoints:**
   ```bash
   curl https://11eleven.duckdns.org/api/products/
   ```

---

## 🔍 Troubleshooting

### 404 Error on Route `/login`
**Cause:** SPA routing not configured
**Fix:** Ensure `vercel.json` is in root directory with rewrites configuration

### API Returns 404 Not Found
**Cause:** API base URL is incorrect
**Fix:** Verify `VITE_API_URL=https://11eleven.duckdns.org/api` in environment

### Google Login: `client_id is not set correctly`
**Cause:** Missing or incorrect `VITE_GOOGLE_CLIENT_ID`
**Fix:** 
1. Set `VITE_GOOGLE_CLIENT_ID` in Vercel environment variables
2. Add `https://ecommerce-eleven.vercel.app` to Google OAuth redirect URIs

### CORS Error: "No 'Access-Control-Allow-Origin' header"
**Cause:** Vercel domain not in Django's CORS_ALLOWED_ORIGINS
**Fix:** Add `https://ecommerce-eleven.vercel.app` to backend `.env` CORS_ALLOWED_ORIGINS

### Images Not Loading
**Cause:** `VITE_MEDIA_URL` points to localhost
**Fix:** Update to `https://11eleven.duckdns.org/media/` in all environments

---

## ✨ Summary

| Component | Fix Applied | Status |
|-----------|------------|--------|
| SPA Routing | Added `vercel.json` with rewrites | ✅ |
| API Base URL | Updated to `https://11eleven.duckdns.org/api` | ✅ |
| Axios Config | Using `import.meta.env.VITE_API_URL` | ✅ |
| Google OAuth | Configured `VITE_GOOGLE_CLIENT_ID` | ✅ |
| Django URLs | All prefixed with `/api/` | ✅ |
| Environment Vars | Production URLs configured | ✅ |
| CORS | Needs backend `.env` update | ⏳ |
| Media URLs | Updated to production domain | ✅ |

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Django logs: `journalctl -u gunicorn -n 50`
3. Test API directly: `curl https://11eleven.duckdns.org/api/products/`
4. Check browser DevTools Network tab for CORS errors

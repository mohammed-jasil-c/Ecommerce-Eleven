"""
URL configuration for eleven project.
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health_check(request):
    return JsonResponse({
        "status": "ok",
        "service": "Eleven API",
        "version": "1.0",
    })


urlpatterns = [
    path('', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path('api/products/', include('apps.products.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
]

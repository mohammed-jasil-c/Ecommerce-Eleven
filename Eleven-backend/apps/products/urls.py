from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    ProductCreateView,
    ProductUpdateView,
    ProductDeleteView,
    CategoryListView,
    ProductVariantCreateView,
    ProductImageCreateView,
)

urlpatterns = [
    # Categories
    path("categories/", CategoryListView.as_view(), name="category-list"),

    # Product CRUD
    path("create/", ProductCreateView.as_view(), name="product-create"),
    path("<uuid:pk>/update/", ProductUpdateView.as_view(), name="product-update"),
    path("<uuid:pk>/delete/", ProductDeleteView.as_view(), name="product-delete"),

    # Variants
    path("variants/create/", ProductVariantCreateView.as_view(), name="variant-create"),

    # Images
    path("images/upload/", ProductImageCreateView.as_view(), name="image-upload"),

    # Product Detail
    path("<uuid:pk>/", ProductDetailView.as_view(), name="product-detail"),

    # Product List (Search + Filter + Sort + Pagination)
    path("", ProductListView.as_view(), name="product-list"),
]
# apps/wishlist/urls.py

from django.urls import path
from .views import (
    AddToWishlistView,
    MyWishlistView,
    RemoveFromWishlistView,
    ClearWishlistView,
    CheckWishlistView,
    WishlistCountView,
    MoveToCartView,
)

urlpatterns = [
    path("add/", AddToWishlistView.as_view()),
    path("view/", MyWishlistView.as_view()),
    path("remove/<uuid:wishlist_id>/", RemoveFromWishlistView.as_view()),
    path("clear/", ClearWishlistView.as_view()),
    path("check/<uuid:variant_id>/", CheckWishlistView.as_view()),
    path("count/", WishlistCountView.as_view()),
    path("move-to-cart/<uuid:wishlist_id>/", MoveToCartView.as_view()),
]
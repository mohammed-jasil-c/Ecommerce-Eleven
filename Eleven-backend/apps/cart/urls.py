from django.urls import path
from .views import (
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveCartItemView,
    ClearCartView,
    CartSummaryView,
)

urlpatterns = [
    path("", CartView.as_view()),
    path("add/", AddToCartView.as_view()),
    path("item/<uuid:item_id>/", UpdateCartItemView.as_view()),
    path("item/<uuid:item_id>/delete/", RemoveCartItemView.as_view()),
    path("clear/", ClearCartView.as_view()),
    path("summary/", CartSummaryView.as_view()),
]
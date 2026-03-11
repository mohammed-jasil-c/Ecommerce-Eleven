from django.urls import path
from .views import (
    BuyNowView,
    CancelOrderView,
    CheckoutView,
    MyOrdersView,
    OrderDetailView,
    AdminOrderListView,
    UpdateOrderStatusView,
    CreateStripePaymentIntentView,
    RefundOrderView,
    RetryPaymentView,
    stripe_webhook,
    AdminOrderDetailView,
    AttachOrderAddressView,
    ConfirmCODView
)

urlpatterns = [
    # ADMIN ROUTES FIRST
    path("admin/all/", AdminOrderListView.as_view(), name="admin-orders"),
    path("admin/update/<uuid:order_id>/", UpdateOrderStatusView.as_view(), name="update-order-status"),
    path("admin/refund/<uuid:order_id>/", RefundOrderView.as_view(), name="refund-order"),
    path("admin/<uuid:order_id>/", AdminOrderDetailView.as_view(), name="admin-order-detail"),

    # USER ORDER FLOW
    path("buy-now/", BuyNowView.as_view(), name="buy-now"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("my-orders/", MyOrdersView.as_view(), name="my-orders"),
    path("cancel/<uuid:order_id>/", CancelOrderView.as_view(), name="cancel-order"),
    path("pay/<uuid:order_id>/", CreateStripePaymentIntentView.as_view(), name="create-payment-intent"),
    path("retry/<uuid:order_id>/", RetryPaymentView.as_view(), name="retry-payment"),
    path("address/<uuid:order_id>/", AttachOrderAddressView.as_view(), name="attach-address"),
    path("cod/<uuid:order_id>/", ConfirmCODView.as_view(), name="confirm-cod"),
    path("webhook/", stripe_webhook, name="stripe-webhook"),

    # GENERIC UUID ALWAYS LAST
    path("<uuid:order_id>/", OrderDetailView.as_view(), name="order-detail"),
]
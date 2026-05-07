from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Cart, CartItem
from .serializers import CartSerializer
from apps.products.models import ProductVariant


def parse_quantity(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.prefetch_related(
            "items__variant__product__images"
        ).get_or_create(user=request.user)

        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        variant_id = request.data.get("variant_id")
        quantity = parse_quantity(request.data.get("quantity", 1))

        if quantity is None or quantity <= 0:
            return Response(
                {"error": "Quantity must be a positive integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        variant = get_object_or_404(ProductVariant, id=variant_id)

        if variant.stock < quantity:
            return Response(
                {"error": "Not enough stock"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart, created = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
        )

        if not created:
            new_quantity = cart_item.quantity + quantity
            if variant.stock < new_quantity:
                return Response(
                    {"error": "Not enough stock"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity = new_quantity
        else:
            cart_item.quantity = quantity

        cart_item.save()

        return Response({"message": "Added to cart"})


class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        quantity = parse_quantity(request.data.get("quantity", 1))

        if quantity is None:
            return Response(
                {"error": "Quantity must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user
        )

        if quantity <= 0:
            item.delete()
            return Response({"message": "Item removed"})

        if item.variant.stock < quantity:
            return Response(
                {"error": "Not enough stock"},
                status=status.HTTP_400_BAD_REQUEST
            )

        item.quantity = quantity
        item.save()

        return Response({"message": "Item updated"})


class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user
        )

        item.delete()
        return Response({"message": "Item removed"})


class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        return Response({"message": "Cart cleared"})


class CartSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)

        # Single query with proper joins
        items = list(cart.items.select_related("variant__product").all())

        total_quantity = sum(item.quantity for item in items)
        total_price = sum(item.variant.product.price * item.quantity for item in items)

        return Response({
            "total_items": len(items),
            "total_quantity": total_quantity,
            "total_price": total_price,
        })

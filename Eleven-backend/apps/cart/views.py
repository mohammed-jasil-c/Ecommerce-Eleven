from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import F

from .models import Cart, CartItem
from .serializers import CartSerializer
from apps.products.models import ProductVariant


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)

        cart = Cart.objects.prefetch_related(
            "items__variant__product"
        ).get(user=request.user)

        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        variant_id = request.data.get("variant_id")
        quantity = request.data.get("quantity", 1)

        variant = get_object_or_404(ProductVariant, id=variant_id)

        cart, created = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
        )

        if not created:
            cart_item.quantity += int(quantity)
        else:
            cart_item.quantity = int(quantity)

        cart_item.save()

        return Response({"message": "Added to cart"})
    
class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        quantity = int(request.data.get("quantity", 1))

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

        total_quantity = sum(item.quantity for item in cart.items.all())
        total_price = sum(item.variant.price * item.quantity for item in cart.items.all())

        return Response({
            "total_items": cart.items.count(),
            "total_quantity": total_quantity,
            "total_price": total_price,
        })                    
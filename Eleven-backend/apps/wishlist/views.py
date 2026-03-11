from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Wishlist
from .serializers import WishlistSerializer
from apps.products.models import ProductVariant
from apps.cart.models import Cart, CartItem


class MyWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist = Wishlist.objects.filter(
            user=request.user
        ).select_related(
            "variant",
            "variant__product"
        ).prefetch_related(
            "variant__product__images"
        )

        serializer = WishlistSerializer(wishlist, many=True)
        return Response(serializer.data)


class AddToWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        variant_id = request.data.get("variant")

        if not variant_id:
            return Response(
                {"error": "Variant ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        variant = get_object_or_404(ProductVariant, id=variant_id)

        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            variant=variant
        )

        if not created:
            return Response(
                {"error": "Item already in wishlist"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = WishlistSerializer(wishlist_item)
        return Response(
            {"message": "Added to wishlist", "item": serializer.data},
            status=status.HTTP_201_CREATED
        )


class RemoveFromWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, wishlist_id):
        wishlist_item = get_object_or_404(
            Wishlist,
            id=wishlist_id,
            user=request.user
        )

        wishlist_item.delete()
        return Response({"message": "Removed from wishlist"})


class ClearWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        Wishlist.objects.filter(user=request.user).delete()
        return Response({"message": "Wishlist cleared"})


class CheckWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, variant_id):
        exists = Wishlist.objects.filter(
            user=request.user,
            variant_id=variant_id
        ).exists()

        return Response({"is_in_wishlist": exists})


class WishlistCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Wishlist.objects.filter(user=request.user).count()
        return Response({"count": count})


class MoveToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, wishlist_id):
        wishlist_item = get_object_or_404(
            Wishlist,
            id=wishlist_id,
            user=request.user
        )

        variant = wishlist_item.variant

        if variant.stock <= 0:
            return Response(
                {"error": "Out of stock"},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, _ = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={"quantity": 1}
        )

        if not created:
            cart_item.quantity += 1
            cart_item.save()

        wishlist_item.delete()

        return Response({"message": "Item moved to cart"})
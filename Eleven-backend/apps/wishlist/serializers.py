from rest_framework import serializers
from .models import Wishlist


class WishlistSerializer(serializers.ModelSerializer):
    variant_id = serializers.CharField(source="variant.id", read_only=True)
    product_id = serializers.CharField(source="variant.product.id", read_only=True)
    name = serializers.CharField(source="variant.product.name", read_only=True)
    price = serializers.DecimalField(
        source="variant.product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    stock = serializers.IntegerField(source="variant.stock", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = [
            "id",
            "variant_id",
            "product_id",
            "name",
            "price",
            "stock",
            "image",
            "created_at",
        ]

    def get_image(self, obj):
        first_image = obj.variant.product.images.first()
        if first_image and first_image.image:
            return first_image.image.url
        return None
from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    product_image = serializers.SerializerMethodField()
    size = serializers.CharField(source="variant.size", read_only=True)
    color = serializers.CharField(source="variant.color", read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "product_image",
            "price",
            "quantity",
            "subtotal",
            "size",
            "color",
        ]

    def get_product_image(self, obj):
        image_obj = obj.variant.product.images.first()
        if image_obj and image_obj.image:
             return image_obj.image.url
        return None

    def get_subtotal(self, obj):
        return obj.price * obj.quantity


from django.contrib.auth import get_user_model

User = get_user_model()

class OrderUserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="full_name", read_only=True)

    class Meta:
        model = User
        fields = ["email", "name"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = OrderUserSerializer(read_only=True)
    shipping_address = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "total_amount",
            "status",
            "payment_status",
            "payment_method",
            "shipping_address",
            "created_at",
            "items",
        ]

    def get_shipping_address(self, obj):
        if obj.shipping_address:
            return f"{obj.shipping_address.address_line}, {obj.shipping_address.city}, {obj.shipping_address.state} - {obj.shipping_address.pincode}"
        return None
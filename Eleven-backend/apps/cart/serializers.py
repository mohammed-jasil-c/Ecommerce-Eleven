from rest_framework import serializers
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="variant.product.name",
        read_only=True
    )

    size = serializers.CharField(source="variant.size", read_only=True)
    color = serializers.CharField(source="variant.color", read_only=True)

    price = serializers.DecimalField(
        source="variant.product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    image = serializers.SerializerMethodField()   
    subtotal = serializers.SerializerMethodField()
    

    class Meta:
        model = CartItem
        fields = [
            "id",
            "variant",
            "product_name",
            "size",
            "color",
            "price",
            "quantity",
            "subtotal",
            "image",
            
        ]
        
    def get_image(self, obj):
        first_image = obj.variant.product.images.first()
        if first_image and first_image.image:
            return first_image.image.url
        return None    

    def get_subtotal(self, obj):
        return obj.variant.product.price * obj.quantity
    
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total_items",
            "total_quantity",
            "total_price",
        ]

    def get_total_price(self, obj):
        return sum(
            item.variant.product.price * item.quantity
            for item in obj.items.all()
        )

    def get_total_quantity(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_total_items(self, obj):
        return obj.items.count()    
    
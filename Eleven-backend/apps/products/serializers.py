from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVariant



class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image"]

    def get_image(self, obj):
        if obj.image:
            url = obj.image.url if hasattr(obj.image, "url") else str(obj.image)
            if "/upload/" in url and "f_auto,q_auto" not in url:
                url = url.replace("/upload/", "/upload/f_auto,q_auto/")
            return url
        return None

class ProductImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "product", "image"]


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "product", "size", "color", "stock"]



class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image"]

    def get_image(self, obj):
        if obj.image:
            url = obj.image.url
            if "/upload/" in url and "f_auto,q_auto" not in url:
                url = url.replace("/upload/", "/upload/f_auto,q_auto/")
            return url
        return None


class CategoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image"]



class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "original_price",
            "discount_percentage",
            "category",
            "gender",
            "is_featured",
            "is_new",
            "is_active",
            "images",
            "variants",
            "created_at",
        ]

    def get_discount_percentage(self, obj):
        if obj.original_price and obj.original_price > obj.price:
            return round(
                ((obj.original_price - obj.price) / obj.original_price) * 100
            )
        return 0

class ProductListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    discount_percentage = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "original_price",
            "discount_percentage",
            "image",
            "category",
            "gender",
            "is_featured",
            "is_new",
            "variants",
            "created_at",
        ]

    def get_image(self, obj):
        first_image = obj.images.first()
        return first_image.image.url if first_image else None

    def get_discount_percentage(self, obj):
        if obj.original_price and obj.original_price > obj.price:
            return round(
                ((obj.original_price - obj.price) / obj.original_price) * 100
            )
        return 0



class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class ProductMiniSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "price", "image"]

    def get_image(self, obj):
        first_image = obj.images.first()
        return first_image.image.url if first_image else None
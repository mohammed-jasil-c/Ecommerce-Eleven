from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.filters import OrderingFilter, SearchFilter

from decimal import Decimal, InvalidOperation
from django.shortcuts import get_object_or_404

from .models import Product, Category, ProductVariant, ProductImage
from .serializers import (
    ProductSerializer,
    ProductCreateUpdateSerializer,
    CategorySerializer,
    CategoryCreateSerializer,
    ProductListSerializer,
    ProductVariantSerializer,
    ProductImageUploadSerializer
)
from .pagination import ProductPagination
from apps.accounts.permissions import IsAdminUserRole


def parse_decimal_query(value, field_name):
    try:
        amount = Decimal(value)
    except (InvalidOperation, TypeError):
        raise ValidationError({field_name: "Enter a valid decimal value."})

    if amount < 0:
        raise ValidationError({field_name: "Value must be greater than or equal to 0."})

    return amount


class ProductListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = ProductPagination
    filter_backends = [OrderingFilter, SearchFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["price", "created_at", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images", "variants")
        )
        categories = self.request.GET.getlist("category")
        if categories:
            queryset = queryset.filter(category__slug__in=categories)
        gender = self.request.GET.get("gender")
        if gender:
            queryset = queryset.filter(gender=gender.lower())
        is_featured = self.request.GET.get("is_featured")
        if is_featured:
            queryset = queryset.filter(is_featured=is_featured.lower() == "true")
        is_new = self.request.GET.get("is_new")
        if is_new:
            queryset = queryset.filter(is_new=is_new.lower() == "true")
        min_price = self.request.GET.get("min_price")
        max_price = self.request.GET.get("max_price")
        if min_price:
            queryset = queryset.filter(price__gte=parse_decimal_query(min_price, "min_price"))
        if max_price:
            queryset = queryset.filter(price__lte=parse_decimal_query(max_price, "max_price"))
        size = self.request.GET.get("size")
        color = self.request.GET.get("color")
        if size:
            queryset = queryset.filter(variants__size__iexact=size)
        if color:
            queryset = queryset.filter(variants__color__iexact=color)
        in_stock = self.request.GET.get("in_stock")
        if in_stock and in_stock.lower() == "true":
            queryset = queryset.filter(variants__stock__gt=0)
        return queryset.distinct()


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        product = get_object_or_404(
            Product.objects.select_related("category")
            .prefetch_related("images", "variants"),
            pk=pk, is_active=True
        )
        serializer = ProductSerializer(product)
        return Response(serializer.data)


class ProductCreateView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        serializer = ProductCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductUpdateView(APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductCreateUpdateSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDeleteView(APIView):
    permission_classes = [IsAdminUserRole]

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response({"message": "Product deleted"}, status=status.HTTP_204_NO_CONTENT)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all().order_by("name")
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class CategoryCreateView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        serializer = CategoryCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDeleteView(APIView):
    permission_classes = [IsAdminUserRole]

    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        category.delete()
        return Response({"message": "Category deleted"}, status=status.HTTP_204_NO_CONTENT)


class ProductVariantCreateView(CreateAPIView):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAdminUserRole]


class ProductImageCreateView(CreateAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageUploadSerializer
    permission_classes = [IsAdminUserRole]

    def post(self, request, *args, **kwargs):
        product_id = self.kwargs.get("pk") or request.data.get("product")
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        data = request.data.copy()
        data["product"] = product_id
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

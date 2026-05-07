from django.contrib import admin
from .models import Category, Product, ProductVariant, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "gender", "price", "is_featured", "is_new", "is_active", "created_at")
    list_filter = ("category", "gender", "is_featured", "is_new", "is_active")
    search_fields = ("name", "description")
    list_editable = ("is_featured", "is_new", "is_active")
    inlines = [ProductImageInline, ProductVariantInline]

    fieldsets = (
        (None, {
            "fields": ("name", "description", "category", "gender"),
        }),
        ("Pricing", {
            "fields": ("price", "original_price"),
        }),
        ("Status", {
            "fields": ("is_featured", "is_new", "is_active"),
        }),
    )


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "size", "color", "stock")
    list_filter = ("size", "color")
    search_fields = ("product__name",)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "image")
    search_fields = ("product__name",)
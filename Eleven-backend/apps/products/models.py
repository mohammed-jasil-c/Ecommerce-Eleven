import uuid
from django.db import models
from cloudinary.models import CloudinaryField


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    image = CloudinaryField("image")

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()

    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
        db_index=True
    )

    is_featured = models.BooleanField(default=False, db_index=True)
    is_new = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = CloudinaryField("image")
    
    def __str__(self):
        return  self.product.name


class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    size = models.CharField(max_length=20)
    color = models.CharField(max_length=50)
    stock = models.PositiveIntegerField(default=0)
    
    def __str__(self):
            return f"{self.product.name} - {self.size} - {self.color}"

    class Meta:
        unique_together = ("product", "size", "color")
        
        
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import ProductVariant         

class Order(models.Model):
    STATUS_CHOICES = [
    ("pending_payment", "Pending Payment"),
    ("confirmed", "Confirmed"),
    ("processing", "Processing"),
    ("shipped", "Shipped"),
    ("delivered", "Delivered"),
    ("cancelled", "Cancelled"),
    ("refunded", "Refunded"),

]   
    PAYMENT_STATUS = [
    ("pending", "Pending"),
    ("paid", "Paid"),
    ("failed", "Failed"),
    ("refunded", "Refunded"),
]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    shipping_address = models.ForeignKey(
        "accounts.Address",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )
    payment_method = models.CharField(max_length=20, default="stripe") # 'stripe' or 'cod'

    created_at = models.DateTimeField(auto_now_add=True)
    
    payment_status = models.CharField(
    max_length=20,
    default="pending"
    
)

    def __str__(self):
        return f"{self.id} - {self.user.email}"
    
class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()    
    
    
class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment"
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    status = models.CharField(
        max_length=20,
        default="pending"
    )

    transaction_id = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)        
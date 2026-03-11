import uuid
from django.db import models
from django.conf import settings
from apps.products.models import ProductVariant


class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} Cart"
    
class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items"
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "variant")    
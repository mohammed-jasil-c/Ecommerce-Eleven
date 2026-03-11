import uuid
from django.db import models
from django.conf import settings
from apps.products.models import ProductVariant


class Wishlist(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlists"
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="wishlist_items"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "variant"],
                name="unique_user_variant_wishlist"
            )
        ]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["variant"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.variant.product.name}"

    @property
    def product(self):
        """
        Shortcut to access product from variant.
        """
        return self.variant.product
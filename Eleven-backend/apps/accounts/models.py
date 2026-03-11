from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "ADMIN")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):

    username = None
    email = models.EmailField(unique=True)

    # Role System
    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("USER", "User"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="USER")

    # Profile Fields
    full_name = models.CharField(max_length=150, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)

    # Account Control
    is_blocked = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
    
class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")

    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)

    address_line = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Ensure only one default address per user
        if self.is_default:
            Address.objects.filter(user=self.user).update(is_default=False)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} - {self.city}"   
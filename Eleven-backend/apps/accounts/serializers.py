from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from .models import Address

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "full_name"]

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        full_name = validated_data.pop("full_name", "")
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=full_name,
        )
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="full_name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "role",
            "is_blocked",
            "is_active",
            "date_joined",
        ]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = "__all__"
        read_only_fields = ["user"]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_number",
            "role",
            "is_blocked",
        ]
        read_only_fields = ["email", "role", "is_blocked"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
    UpdateAPIView,
    DestroyAPIView,
)

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import Address
from .permissions import IsAdminUserRole
from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
    AdminUserSerializer,
    AddressSerializer,
    ChangePasswordSerializer,
)
from .email_service import send_welcome_email

User = get_user_model()


class LoginView(APIView):

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)

        # Block check — prevent blocked users from logging in
        if user.is_blocked:
            return Response(
                {"error": "Your account has been blocked. Please contact support."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        response = Response({
            "access": str(access),
            "refresh": str(refresh),
        })

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax"
        )

        return response


class Register(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Send welcome email (non-blocking)
            send_welcome_email(user)

            return Response(
                {"message": "User registered successfully"},
                status=201
            )

        return Response(serializer.errors, status=400)


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "No refresh token"}, status=400)

        try:
            refresh = RefreshToken(refresh_token)

            new_access = refresh.access_token

            user_id = refresh["user_id"]
            user = User.objects.get(id=user_id)

            refresh.blacklist()

            new_refresh = RefreshToken.for_user(user)

            response = Response({
                "access": str(new_access),
                "refresh": str(new_refresh),
            })

            response.set_cookie(
                key="refresh_token",
                value=str(new_refresh),
                httponly=True,
                secure=False,
                samesite="Lax"
            )

            return response

        except Exception as e:
            return Response({"error": str(e)}, status=400)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        response = Response({"message": "Logged out"})
        response.delete_cookie("refresh_token")
        return response


class AdminOnlyView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        return Response({
            "message": "Welcome Admin",
            "user": request.user.email
        })


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListView(ListAPIView):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole]


class AdminUserDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]


class AdminUserUpdateView(UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]


class AdminUserDeleteView(DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]


class AddressListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user

            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            if not user.check_password(old_password):
                return Response(
                    {"error": "Old password is incorrect."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                validate_password(new_password, user)
            except Exception as e:
                return Response(
                    {"error": e.messages},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Set new password
            user.set_password(new_password)
            user.save()

            return Response({"message": "Password changed successfully."})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"error": "Google credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Verify the Google ID token
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )

            email = idinfo.get("email")
            if not email:
                return Response(
                    {"error": "Email not found in Google token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Find or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "full_name": idinfo.get("name", ""),
                    "first_name": idinfo.get("given_name", ""),
                    "last_name": idinfo.get("family_name", ""),
                    "is_verified": True,
                },
            )

            if created:
                user.set_unusable_password()
                user.save()
                # Send welcome email for new Google users
                send_welcome_email(user)

            # Block check
            if user.is_blocked:
                return Response(
                    {"error": "Your account has been blocked. Please contact support."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Issue JWT tokens (same as LoginView)
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            response = Response({
                "access": str(access),
                "refresh": str(refresh),
            })

            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=False,
                samesite="Lax",
            )

            return response

        except ValueError as e:
            return Response(
                {"error": f"Invalid Google token: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
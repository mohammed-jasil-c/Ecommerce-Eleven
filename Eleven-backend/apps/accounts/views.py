from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.serializers import RegisterSerializer
from .email_service import send_welcome_email


class LoginView(APIView):

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        response = Response({
            "access": str(access)
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

            # Send welcome email
            send_welcome_email(user)

            return Response(
                {"message": "User registered successfully"},
                status=201
            )

        return Response(serializer.errors, status=400)   


from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model

User = get_user_model()

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
                "access": str(new_access)
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


from rest_framework.permissions import IsAuthenticated
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except:
                pass

        response = Response({"message": "Logged out"})
        response.delete_cookie("refresh_token")
        return response
    
    
from .permissions import IsAdminUserRole
class AdminOnlyView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        return Response({
            "message": "Welcome Admin",
            "user": request.user.email
        })


from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

User = get_user_model()

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
 
from rest_framework.generics import ListAPIView
from .serializers import AdminUserSerializer, ProfileSerializer

User = get_user_model()
class AdminUserListView(ListAPIView):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole] 
    


from rest_framework.generics import (
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView
)
from rest_framework.permissions import IsAdminUser
from .models import User
from .serializers import AdminUserSerializer

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
    


from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Address
from .serializers import AddressSerializer


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
    
    

from django.contrib.auth.password_validation import validate_password
from .serializers import ChangePasswordSerializer


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
    
        
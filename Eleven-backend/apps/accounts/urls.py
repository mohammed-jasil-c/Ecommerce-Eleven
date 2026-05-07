from django.urls import path
from .views import ( 
                    AddressDetailView,
                    AddressListCreateView,
                    AdminUserListView,
                    ChangePasswordView, 
                    LoginView, ProfileView, 
                    RefreshView, LogoutView , 
                    AdminOnlyView, 
                    Register,
                    AdminUserDeleteView,
                    AdminUserDetailView,
                    AdminUserUpdateView,
                    GoogleLoginView) 

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("register/", Register.as_view()),
    path("refresh/", RefreshView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("admin/", AdminOnlyView.as_view()), 
    path("profile/", ProfileView.as_view()),
    path("addresses/", AddressListCreateView.as_view()),
    path("addresses/<int:pk>/", AddressDetailView.as_view()),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    
    # Admin-only endpoint to list all users
    path("users/", AdminUserListView.as_view()),
    path("users/<int:pk>/", AdminUserDetailView.as_view()),
    path("users/<int:pk>/update/", AdminUserUpdateView.as_view()),
    path("users/<int:pk>/delete/", AdminUserDeleteView.as_view()),

    # Google OAuth
    path("google/", GoogleLoginView.as_view()),
]
    
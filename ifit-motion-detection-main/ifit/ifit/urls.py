
from django.contrib import admin
from django.urls import path, include
from app.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', RegisterView.as_view(), name='register'),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path('api/login/', LoginView.as_view(), name='login'), 
    path('api/user/', UserProfileView.as_view(), name='user_profile'),
    path('api/logout/', LogoutView.as_view(), name='logout'),  # Fixed URL
]


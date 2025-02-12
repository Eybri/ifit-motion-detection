
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


    # path('',include('users.urls')),
    # path('api/users/', UserView.as_view(), name='users'),

    # path('users/', UserListView.as_view(), name='fetch_users'),
    # path('user/<int:user_id>/', UserProfileView.as_view(), name='fetch_user'),
    # path('user/update/', UpdateProfileView.as_view(), name='update_profile'),
    
    # path('videos/upload/', VideoUploadView.as_view(), name='upload_video'),
    # path('videos/', VideoListView.as_view(), name='fetch_videos'),
    # path('videos/user/<int:user_id>/', UserVideosView.as_view(), name='fetch_user_videos'),
]

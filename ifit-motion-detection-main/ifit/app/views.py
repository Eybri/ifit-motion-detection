from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import *
from .serializer import *

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.calculate_bmi()  # Ensure BMI calculation
            return Response(
                {"message": "User created successfully", "user": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)

        if user:
            update_last_login(None, user)
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Login successful",
                "user": {
                    "email": user.email,
                    "username": user.username
                },
                "token": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response({'user': serializer.data})
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Received Refresh Token:", request.data.get("refresh"))
        print("Authorization Header:", request.headers.get("Authorization"))

        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token required"}, status=400)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({"message": "Logout successful"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

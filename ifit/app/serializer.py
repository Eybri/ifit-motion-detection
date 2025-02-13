from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError
from .models import *

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'password', 'age', 'gender', 'height', 'weight', 'bmi', 'is_admin']

    def create(self, validated_data):
        if CustomUser.objects.filter(email=validated_data['email']).exists():
            raise ValidationError({"email": "Email already exists."})
        user = CustomUser.objects.create_user(**validated_data)  # Ensure password is hashed
        user.calculate_bmi()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password)  # Authenticate using email
        if not user or not user.is_active:
            raise serializers.ValidationError("Invalid email or password")

        # update_last_login(None, user)  # Update last login timestamp
        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }
    
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, data):
        """
        Ensure the refresh token is valid before blacklisting.
        """
        try:
            RefreshToken(data["refresh"])  # Validate token
        except Exception:
            raise serializers.ValidationError("Invalid or expired refresh token.")
        return data


from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(
        max_length=10, 
        choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], 
        null=True
    )
    height = models.FloatField(null=True, blank=True)  # in cm
    weight = models.FloatField(null=True, blank=True)  # in kg
    bmi = models.FloatField(null=True, blank=True)
    is_admin = models.BooleanField(default=False)

    # Set email as the login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Django requires at least one extra field

    def calculate_bmi(self):
        if self.height and self.weight:
            height_m = self.height / 100  # Convert cm to meters
            self.bmi = round(self.weight / (height_m ** 2), 2)
            self.save()

    def __str__(self):
        return self.email
    
class Video(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    video_file = models.FileField(upload_to='videos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title



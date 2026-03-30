from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Address(models.Model):
    STATE_CHOICES = [
        ('Andhra Pradesh', 'Andhra Pradesh'), ('Arunachal Pradesh', 'Arunachal Pradesh'), ('Assam', 'Assam'), 
        ('Bihar', 'Bihar'), ('Chhattisgarh', 'Chhattisgarh'), ('Goa', 'Goa'), ('Gujarat', 'Gujarat'), 
        ('Haryana', 'Haryana'), ('Himachal Pradesh', 'Himachal Pradesh'), ('Jharkhand', 'Jharkhand'), 
        ('Karnataka', 'Karnataka'), ('Kerala', 'Kerala'), ('Madhya Pradesh', 'Madhya Pradesh'), 
        ('Maharashtra', 'Maharashtra'), ('Manipur', 'Manipur'), ('Meghalaya', 'Meghalaya'), 
        ('Mizoram', 'Mizoram'), ('Nagaland', 'Nagaland'), ('Odisha', 'Odisha'), ('Punjab', 'Punjab'), 
        ('Rajasthan', 'Rajasthan'), ('Sikkim', 'Sikkim'), ('Tamil Nadu', 'Tamil Nadu'), 
        ('Telangana', 'Telangana'), ('Tripura', 'Tripura'), ('Uttar Pradesh', 'Uttar Pradesh'), 
        ('Uttarakhand', 'Uttarakhand'), ('West Bengal', 'West Bengal'), 
        ('Andaman and Nicobar Islands', 'Andaman and Nicobar Islands'), ('Chandigarh', 'Chandigarh'), 
        ('Dadra and Nagar Haveli and Daman and Diu', 'Dadra and Nagar Haveli and Daman and Diu'), 
        ('Delhi', 'Delhi'), ('Jammu and Kashmir', 'Jammu and Kashmir'), ('Ladakh', 'Ladakh'), 
        ('Lakshadweep', 'Lakshadweep'), ('Puducherry', 'Puducherry')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses', null=True, blank=True)
    name = models.CharField(max_length=100, help_text="e.g. Home, Office", blank=True, null=True)
    recipient_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20)
    
    flat_house_no = models.CharField(max_length=255, blank=True, null=True)
    building_apartment = models.CharField(max_length=255, blank=True, null=True)
    area_street_village = models.CharField(max_length=255)
    landmark = models.CharField(max_length=255, blank=True, null=True)
    
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, choices=STATE_CHOICES)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=50, default='India')
    
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.recipient_name}"

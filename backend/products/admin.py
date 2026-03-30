from django.contrib import admin
from .models import Product, ProductImage, ProductSize, Category, Review

def safe_register(model):
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass

safe_register(Category)
safe_register(Product)
safe_register(ProductImage)
safe_register(ProductSize)
safe_register(Review)

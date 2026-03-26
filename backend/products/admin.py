from django.contrib import admin
from .models import Product, ProductImage, ProductVariant, Category, Review

admin.site.register(Product)
admin.site.register(ProductImage)
admin.site.register(ProductVariant)
admin.site.register(Category)
admin.site.register(Review)

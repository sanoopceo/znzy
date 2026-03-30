from django.db import models
from django.utils.text import slugify
import uuid

class Category(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    is_footwear = models.BooleanField(default=False, help_text="Set to True if this category uses footwear sizes")
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Original base price")
    stock = models.PositiveIntegerField(default=0, help_text="Total stock (aggregated or main)")
    main_image = models.ImageField(upload_to='products/main/', blank=True, null=True)
    rating = models.DecimalField(max_digits=7, decimal_places=2, default=0.0)
    numReviews = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # Promotional Flags
    is_bestseller = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)
    is_archive_sale = models.BooleanField(default=False)
    discount_percentage = models.IntegerField(default=0, help_text="Percentage off base price")
    collection_name = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Summer 2024")
    display_order = models.IntegerField(default=0)
    
    share_id = models.CharField(max_length=50, unique=True, blank=True, help_text="Unique ID for Instagram funnels")
    size_guide_html = models.TextField(blank=True, null=True, help_text="HTML for size guide/mapping (inch/cm or EU/US)")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.share_id:
            self.share_id = str(uuid.uuid4().hex)[:10]
        super().save(*args, **kwargs)

    @property
    def discounted_price(self):
        """Calculates discounted price if archive sale is active"""
        if self.is_archive_sale and self.discount_percentage > 0:
            discount = (self.price * self.discount_percentage) / 100
            return self.price - discount
        return self.price

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='side_images')
    image = models.ImageField(upload_to='products/side/', blank=True, null=True)
    alt_text = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} Side Image"

class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')
    size = models.CharField(max_length=50, help_text="e.g., S, M, L, XL")
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - {self.size} ({self.stock})"

# Alias for backward compatibility / transition period
ProductVariant = ProductSize

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name} - {self.rating} stars"

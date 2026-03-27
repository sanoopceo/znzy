from rest_framework import serializers
from .models import Product, ProductImage, ProductVariant, Category, Review

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = '__all__'
        
    def get_user_name(self, obj):
        return obj.user.first_name or obj.user.username

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image', 'image_url', 'alt_text', 'is_primary']

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    numReviews = serializers.SerializerMethodField()
    price = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_category_name(self, obj):
        return obj.category.name

    def get_rating(self, obj):
        reviews = obj.reviews.all()
        if len(reviews) > 0:
            return sum([r.rating for r in reviews]) / len(reviews)
        return 0

    def get_numReviews(self, obj):
        return len(obj.reviews.all())


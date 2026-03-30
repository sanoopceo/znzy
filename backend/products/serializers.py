from rest_framework import serializers
from .models import Product, ProductImage, ProductSize, Category, Review


def resolve_image(image_field, request=None):
    """
    Smart resolver that handles:
    - External URLs stored as ImageField name (from seeder)
    - Real uploaded files (returns absolute URL via request)
    - None / empty
    """
    if not image_field:
        return None
    name = getattr(image_field, 'name', None) or str(image_field)
    if name and (name.startswith('http://') or name.startswith('https://')):
        return name
    if image_field:
        try:
            if request:
                return request.build_absolute_uri(image_field.url)
            return image_field.url
        except Exception:
            return None
    return None


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
        return obj.user.first_name if obj.user else "Anonymous"


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text']

    def get_image(self, obj):
        return resolve_image(obj.image, self.context.get('request'))


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    side_images = ProductImageSerializer(many=True, read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)
    category_name = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    numReviews = serializers.SerializerMethodField()

    discounted_price = serializers.ReadOnlyField()
    original_price = serializers.ReadOnlyField(source='price')

    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_main_image(self, obj):
        return resolve_image(obj.main_image, self.context.get('request'))

    def get_category_name(self, obj):
        return obj.category.name if obj.category else "Uncategorized"

    def get_rating(self, obj):
        reviews = obj.reviews.all()
        if len(reviews) > 0:
            return sum([r.rating for r in reviews]) / len(reviews)
        return 0

    def get_numReviews(self, obj):
        return obj.reviews.count()


class ProductListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for product listings.
    Returns only essential info: name, price, thumbnail, id, and sale info.
    """
    category_name = serializers.SerializerMethodField()
    discounted_price = serializers.ReadOnlyField()
    original_price = serializers.ReadOnlyField(source='price')
    main_image = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    numReviews = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'original_price', 'discounted_price', 
            'main_image', 'category_name', 'is_new', 
            'is_bestseller', 'is_archive_sale', 'discount_percentage',
            'rating', 'numReviews'
        ]

    def get_rating(self, obj):
        reviews = obj.reviews.all()
        if len(reviews) > 0:
            return sum([r.rating for r in reviews]) / len(reviews)
        return 0

    def get_numReviews(self, obj):
        return obj.reviews.count()

    def get_main_image(self, obj):
        return resolve_image(obj.main_image, self.context.get('request'))

    def get_category_name(self, obj):
        return obj.category.name if obj.category else "Uncategorized"

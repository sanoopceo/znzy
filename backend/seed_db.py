import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Product, Category, ProductVariant, ProductImage

def seed():
    # 1. Create Categories
    clothing, _ = Category.objects.get_or_create(name='Clothing', slug='clothing')
    footwear, _ = Category.objects.get_or_create(name='Footwear', slug='footwear', is_footwear=True)

    # 2. Products Data
    products_data = [
        {
            'category': clothing,
            'name': 'Obsidian Hoodie',
            'price': 120.00,
            'description': 'Expertly crafted from heavy-weight organic cotton, this piece defines the modern silhouette.',
            'images': ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1556821840-3a63f95609a8?w=800&q=80'],
            'variants': [{'size': 'S', 'color': 'Obsidian Black', 'stock': 10}, {'size': 'M', 'color': 'Obsidian Black', 'stock': 15}]
        },
        {
            'category': clothing,
            'name': 'Core Trench Coat',
            'price': 295.00,
            'description': 'A timeless classic redesigned for the modern individual.',
            'images': ['https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80'],
            'variants': [{'size': 'M', 'color': 'Beige', 'stock': 5}]
        },
        {
            'category': footwear,
            'name': 'Minimalist Oxford',
            'price': 180.00,
            'description': 'Clean lines and premium leather for the ultimate everyday footwear.',
            'images': ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'],
            'variants': [{'size': '42', 'color': 'Black', 'stock': 8}]
        },
        {
            'category': clothing,
            'name': 'Silk Draped Blouse',
            'price': 150.00,
            'description': 'Elegant and fluid, this blouse is a staple for sophisticated wear.',
            'images': ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'],
            'variants': [{'size': 'S', 'color': 'White', 'stock': 12}]
        }
    ]

    for p_data in products_data:
        product, created = Product.objects.get_or_create(
            name=p_data['name'],
            defaults={
                'category': p_data['category'],
                'base_price': p_data['price'],
                'description': p_data['description']
            }
        )
        if created:
            print(f"Created product: {product.name}")
            # Add images
            for i, img_url in enumerate(p_data['images']):
                ProductImage.objects.create(
                    product=product,
                    image_url=img_url,
                    is_primary=(i == 0)
                )

        # Add variants
        for v_data in p_data['variants']:
            ProductVariant.objects.get_or_create(
                product=product,
                size=v_data['size'],
                color=v_data['color'],
                defaults={'stock': v_data['stock']}
            )

    print("Seeding complete.")

if __name__ == '__main__':
    seed()

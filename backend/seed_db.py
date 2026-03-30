import os
import django
import random

# Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Product, ProductImage, ProductSize, Category

def seed_products():
    print("Seeding Premium Products Collection...")
    
    # Create Categories
    streetwear, _ = Category.objects.get_or_create(name='Streetwear')
    luxe, _ = Category.objects.get_or_create(name='Luxe Essentials')
    outerwear, _ = Category.objects.get_or_create(name='Outerwear')
    
    products_db = [
        {
            'name': 'Midnight Bomber Jacket',
            'category': outerwear,
            'price': 8500,
            'description': 'A heavy-duty, premium embroidered bomber with industrial zippers and satin lining.',
            'main': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
            'sides': [
                'https://images.unsplash.com/photo-1544022613-e8ec9a16eb5f?w=800&q=80',
                'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'
            ]
        },
        {
            'name': 'Acid Wash Graphic Tee',
            'category': streetwear,
            'price': 2400,
            'description': 'Oversized fit, 280 GSM heavy cotton with distressed edges and vintage screenprint.',
            'main': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80']
        },
        {
            'name': 'Noir Cargo Pants',
            'category': streetwear,
            'price': 4200,
            'description': 'Multi-pocket tactical cargos with adjustable drawcords and techwear silhouette.',
            'main': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80']
        },
        {
            'name': 'Ghost White Hoodie',
            'category': luxe,
            'price': 5500,
            'description': 'Ultra-soft French Terrry with tonal embroidery and oversized structured hood.',
            'main': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80']
        },
        {
            'name': 'Chrome Logo Hoodie',
            'category': streetwear,
            'price': 5800,
            'description': 'Reflective chrome logo print on heavyweight black cotton. Nighttime essential.',
            'main': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1509948910842-8ecd040339d4?w=800&q=80']
        },
        {
            'name': 'Luxe Silk Button Down',
            'category': luxe,
            'price': 6800,
            'description': 'Hand-dyed heavy silk with a fluid drape. Perfect for editorial looks.',
            'main': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80']
        },
        {
            'name': 'Distressed Denim Vest',
            'category': streetwear,
            'price': 4800,
            'description': 'Raw edge denim with custom patch work and metal hardware. Limited edition.',
            'main': 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80']
        },
        {
            'name': 'Oversized Puffer Coat',
            'category': outerwear,
            'price': 14000,
            'description': 'Arctic grade down fill with a matte finish and high neck closure.',
            'main': 'https://images.unsplash.com/photo-1539533377285-bb41855ef216?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80']
        },
        {
            'name': 'Velvet Track Jacket',
            'category': luxe,
            'price': 7200,
            'description': 'Deep burgundy velvet with gold side stripes. High-fashion sports luxury.',
            'main': 'https://images.unsplash.com/photo-1544022613-e8ec9a16eb5f?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80']
        },
        {
            'name': 'Industrial Belted Trench',
            'category': outerwear,
            'price': 18000,
            'description': 'Technical gabardine with industrial buckle system and removable lining.',
            'main': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1544923246-77307dd654ca?w=800&q=80']
        },
        {
            'name': 'Zenith Mesh Jersey',
            'category': streetwear,
            'price': 3200,
            'description': 'Breathable athletic mesh with holographic decals and relaxed silhouette.',
            'main': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80']
        },
        {
            'name': 'Obsidian Leather Biker',
            'category': luxe,
            'price': 22000,
            'description': 'Genuine lambskin leather. Asymmetrical zip with custom silver hardware.',
            'main': 'https://images.unsplash.com/photo-1521223890158-f9f7c3d20bd1?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80']
        },
        {
            'name': 'Phantom Cargo Shorts',
            'category': streetwear,
            'price': 3500,
            'description': 'Nylon tech shorts with 6 tactical pockets and reflective trim.',
            'main': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80']
        },
        {
            'name': 'Crimson Overcoat',
            'category': luxe,
            'price': 15500,
            'description': 'Sharp tailored wool coat in a bold deep red. Editorial statement piece.',
            'main': 'https://images.unsplash.com/photo-1539533377285-bb41855ef216?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1544022613-e8ec9a16eb5f?w=800&q=80']
        },
        {
            'name': 'Apex Tech Windbreaker',
            'category': outerwear,
            'price': 12000,
            'description': 'The ultimate outer shell. Modular pockets, taped seams, and fully waterproof exterior.',
            'main': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
            'sides': ['https://images.unsplash.com/photo-1544022613-e8ec9a16eb5f?w=800&q=80']
        }
    ]

    for p_data in products_db:
        # Create Product
        product, created = Product.objects.get_or_create(
            name=p_data['name'],
            defaults={
                'category': p_data['category'],
                'price': p_data['price'],
                'description': p_data['description'],
                'is_active': True,
                'is_new': True,
                'main_image': p_data['main']
            }
        )
        
        if created:
            print(f"Adding: {product.name}")
            # Add Side Images
            for side in p_data['sides']:
                ProductImage.objects.get_or_create(
                    product=product,
                    image=side
                )
            
            # Create Sizes
            sizes = ['S', 'M', 'L', 'XL']
            for s_name in sizes:
                ProductSize.objects.get_or_create(
                    product=product,
                    size=s_name,
                    defaults={'stock': random.randint(5, 50)}
                )

    print("Seeding Complete. Catalog initialized with 15 premium products.")

if __name__ == '__main__':
    seed_products()

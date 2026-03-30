"""
Backfill script: Retroactively set size_label on existing OrderItems.
For orders where variant IS set, copies the size name.
For orders where a product has only ONE size, assigns that size.
Run with: .\\venv\\Scripts\\python backfill_sizes.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from orders.models import OrderItem

fixed = 0
skipped = 0

for item in OrderItem.objects.select_related('variant', 'product').all():
    if item.size_label:
        skipped += 1
        continue
    
    if item.variant:
        # Variant FK exists — just copy the size name
        item.size_label = item.variant.size
        item.save(update_fields=['size_label'])
        print(f"  Fixed #{item.id} (via FK): {item.size_label}")
        fixed += 1
    elif item.product:
        # Try: if product has exactly one size, assign it
        sizes = list(item.product.sizes.all())
        if len(sizes) == 1:
            item.size_label = sizes[0].size
            item.save(update_fields=['size_label'])
            print(f"  Fixed #{item.id} (single size): {item.size_label}")
            fixed += 1
        else:
            print(f"  Cannot fix #{item.id} — product '{item.product.name}' has {len(sizes)} sizes, cannot guess")
            skipped += 1

print(f"\n✅ Done. Fixed: {fixed} | Skipped/Unknown: {skipped}")

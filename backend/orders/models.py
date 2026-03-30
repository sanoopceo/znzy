from django.db import models
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, help_text="Null for guest checkout")
    shipping_address = models.ForeignKey('users.Address', on_delete=models.SET_NULL, null=True, blank=True)
    guest_email = models.EmailField(null=True, blank=True)
    
    payment_method = models.CharField(max_length=50, choices=[('COD', 'Cash on Delivery'), ('CARD', 'Card/Stripe/Razorpay')], default='COD')
    tax_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shipping_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    delivered_at = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True)
    variant = models.ForeignKey('products.ProductSize', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    qty = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.CharField(max_length=255, null=True, blank=True)
    size_label = models.CharField(max_length=20, null=True, blank=True, help_text="Text fallback for size")

    def __str__(self):
        return str(self.name)

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('order_update', 'Order Update'),
        ('success', 'Success'),
        ('error', 'Error'),
        ('system', 'System'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='order_update')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} for {self.user.email}"

@receiver(pre_save, sender=Order)
def update_order_status_notification(sender, instance, **kwargs):
    if instance.id:
        try:
            previous_order = Order.objects.get(id=instance.id)
            if previous_order.status != instance.status and instance.user:
                Notification.objects.create(
                    user=instance.user,
                    title=f"Order Status Updated: {instance.status}",
                    message=f"Your order #{instance.id} is now {instance.status}. Check your profile for details.",
                    type='order_update'
                )
        except Order.DoesNotExist:
            pass

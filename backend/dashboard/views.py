from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count
from products.models import Product
from products.serializers import ProductSerializer
from orders.models import Order
from users.models import User
from cms.models import HomepageSection
from .permissions import IsAdminUser
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getAdminOverview(request):
    """
    Summary stats for the admin dashboard.
    """
    total_revenue = Order.objects.filter(is_paid=True).aggregate(Sum('total_price'))['total_price__sum'] or 0.0
    total_orders = Order.objects.count()
    total_users = User.objects.count()
    total_products = Product.objects.count()
    
    # Recent orders
    recent_orders_qs = Order.objects.all().order_by('-created_at')[:5]
    recent_orders_data = []
    for o in recent_orders_qs:
        recent_orders_data.append({
            'id': o.id,
            'user': o.user.email if o.user else o.guest_email,
            'total': float(o.total_price),
            'status': o.status,
            'created_at': o.created_at
        })

    # Sales by day (last 7 days)
    sales_over_time = []
    for i in range(7):
        date = (datetime.now() - timedelta(days=i)).date()
        daily_revenue = Order.objects.filter(created_at__date=date, is_paid=True).aggregate(Sum('total_price'))['total_price__sum'] or 0.0
        sales_over_time.append({'date': str(date), 'revenue': float(daily_revenue)})
    
    return Response({
        'stats': {
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'total_users': total_users,
            'total_products': total_products
        },
        'recent_orders': recent_orders_data,
        'sales_over_time': sales_over_time[::-1]
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getAdminOrders(request):
    """
    List of all orders for the admin.
    """
    orders = Order.objects.all().order_by('-created_at')
    data = []
    for o in orders:
        data.append({
            'id': o.id,
            'user': {
                 'email': o.user.email if o.user else o.guest_email,
                 'name': o.user.first_name if o.user else 'Guest'
            },
            'total_price': float(o.total_price),
            'is_paid': o.is_paid,
            'status': o.status,
            'created_at': o.created_at
        })
    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateOrderStatus(request, pk):
    """
    Update order status from the dashboard.
    """
    try:
        order = Order.objects.get(id=pk)
        data = request.data
        status_val = data.get('status')
        if status_val:
            order.status = status_val
            if status_val == 'Delivered':
                 order.delivered_at = datetime.now()
            order.save()
            return Response({'detail': f'Order {pk} status updated to {status_val}'})
        return Response({'detail': 'Status not provided'}, status=status.HTTP_400_BAD_REQUEST)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getAdminOrderDetail(request, pk):
    """
    Returns full nested order detail for admin view modal.
    Includes user, shipping address, all items with size/image, and summary.
    """
    try:
        order = Order.objects.get(id=pk)
        u = order.user

        # User info
        user_data = {
            'name': f"{u.first_name} {u.last_name}".strip() if u else 'Guest',
            'email': u.email if u else order.guest_email,
            'phone': getattr(u, 'phone', None) if u else None,
        }

        # Shipping address
        addr = order.shipping_address
        address_data = None
        if addr:
            address_data = {
                'recipient_name': addr.recipient_name,
                'street': addr.street,
                'city': addr.city,
                'state': addr.state,
                'postal_code': addr.postal_code,
                'phone_number': addr.phone_number,
            }

        # Order items with full details
        items_data = []
        subtotal = 0
        for item in order.items.all():
            product = item.product
            size_name = (
                item.variant.size if item.variant
                else item.size_label or 'N/A'
            )

            # Resolve image URL
            img_url = None
            if product and product.main_image:
                name = getattr(product.main_image, 'name', '') or ''
                if name.startswith('http://') or name.startswith('https://'):
                    img_url = name
                elif name:
                    img_url = request.build_absolute_uri(product.main_image.url)

            item_total = float(item.price) * item.qty
            subtotal += item_total
            items_data.append({
                'id': item.id,
                'name': item.name,
                'image': img_url,
                'size': size_name,
                'qty': item.qty,
                'price': float(item.price),
                'total': item_total,
            })

        return Response({
            'id': order.id,
            'created_at': order.created_at.isoformat(),
            'status': order.status,
            'is_paid': order.is_paid,
            'paid_at': order.paid_at.isoformat() if order.paid_at else None,
            'payment_method': order.payment_method,
            'user': user_data,
            'shipping_address': address_data,
            'items': items_data,
            'subtotal': subtotal,
            'shipping_price': float(order.shipping_price),
            'total_price': float(order.total_price),
        })
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getAdminUsers(request):
    """
    List of all users for admin dashboard.
    """
    users = User.objects.all().order_by('-date_joined')
    data = []
    for u in users:
        data.append({
            'id': u.id,
            'email': u.email,
            'name': f"{u.first_name} {u.last_name}".strip() or u.username,
            'isAdmin': u.is_staff,
            'date_joined': u.date_joined
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getAdminProducts(request):
    """
    Fetch all products (including inactive) for admin inventory hub with pagination.
    """
    products = Product.objects.all().order_by('-created_at')
    
    page = request.query_params.get('page', 1)
    page_size = 20 # Default: 20 products per page
    
    from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
    paginator = Paginator(products, page_size)
    
    try:
        products_page = paginator.page(page)
    except PageNotAnInteger:
        products_page = paginator.page(1)
    except EmptyPage:
        products_page = paginator.page(paginator.num_pages)
        
    serializer = ProductSerializer(products_page, many=True, context={'request': request})
    return Response({
        'products': serializer.data,
        'page': products_page.number,
        'pages': paginator.num_pages,
        'count': paginator.count
    })

def parse_bool(value, default=None):
    if value is None: return default
    if isinstance(value, bool): return value
    return str(value).lower() == 'true'

@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    """
    Create a new product with images.
    """
    data = request.data
    files = request.FILES
    try:
        if not data.get('name') or not data.get('price'):
             return Response({'detail': 'Name and price required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from products.models import Category, ProductImage
        category_name = data.get('category', 'Uncategorized')
        category, _ = Category.objects.get_or_create(name=category_name)

        product = Product.objects.create(
            name=data.get('name'),
            price=float(data.get('price', 0)),
            description=data.get('description', ''),
            category=category,
            stock=int(data.get('stock', 0)),
            is_active=parse_bool(data.get('is_active'), True),
            main_image=files.get('main_image'),
            is_archive_sale=parse_bool(data.get('is_archive_sale'), False),
            is_new=parse_bool(data.get('is_new'), True),
            is_bestseller=parse_bool(data.get('is_bestseller'), False),
            discount_percentage=int(data.get('discount_percentage', 0)),
            collection_name=data.get('collection_name', '')
        )
        
        # Handle Side Images
        side_images = files.getlist('side_images')
        for img in side_images:
            ProductImage.objects.create(product=product, image=img)
            
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request, pk):
    """
    Update product details and images. Supports partial updates via FormData.
    """
    try:
        product = Product.objects.get(id=pk)
        data = request.data
        files = request.FILES
        
        # Only update fields that are actually in the request
        if 'name' in data: product.name = data.get('name')
        if 'price' in data: product.price = float(data.get('price'))
        if 'description' in data: product.description = data.get('description')
        if 'stock' in data: product.stock = int(data.get('stock'))
        
        # Booleans need special handling from FormData strings
        if 'is_new' in data: product.is_new = parse_bool(data.get('is_new'))
        if 'is_bestseller' in data: product.is_bestseller = parse_bool(data.get('is_bestseller'))
        if 'is_archive_sale' in data: product.is_archive_sale = parse_bool(data.get('is_archive_sale'))
        if 'is_active' in data: product.is_active = parse_bool(data.get('is_active'))
        
        if 'discount_percentage' in data: product.discount_percentage = int(data.get('discount_percentage'))
        if 'collection_name' in data: product.collection_name = data.get('collection_name')
        
        if files.get('main_image'):
            product.main_image = files.get('main_image')
            
        category_name = data.get('category')
        if category_name:
             from products.models import Category
             category, _ = Category.objects.get_or_create(name=category_name)
             product.category = category
             
        product.save()

        # Handle New Side Images if any
        side_images = files.getlist('side_images')
        if side_images:
            from products.models import ProductImage
            for img in side_images:
                ProductImage.objects.create(product=product, image=img)

        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteProduct(request, pk):
    """
    Delete a product.
    """
    try:
        product = Product.objects.get(id=pk)
        product.delete()
        return Response({'detail': 'Product deleted successfully'})
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteSideImage(request, product_pk, image_pk):
    """
    Delete a specific side image.
    """
    try:
        from products.models import ProductImage
        img = ProductImage.objects.get(id=image_pk, product_id=product_pk)
        img.delete()
        return Response({'detail': 'Side image deleted'})
    except ProductImage.DoesNotExist:
        return Response({'detail': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

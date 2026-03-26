from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem
from products.models import Product, ProductVariant
from users.models import Address
from .serializers import OrderSerializer
from datetime import datetime

@api_view(['POST'])
def addOrderItems(request):
    user = request.user if request.user.is_authenticated else None
    data = request.data
    orderItems = data.get('orderItems')

    if orderItems and len(orderItems) == 0:
        return Response({'detail': 'No Order Items'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Create Order
        order = Order.objects.create(
            user=user,
            guest_email=data.get('guest_email') if not user else None,
            payment_method=data.get('paymentMethod', 'COD'),
            tax_price=data.get('taxPrice', 0.0),
            shipping_price=data.get('shippingPrice', 0.0),
            total_price=data.get('totalPrice', 0.0)
        )

        # Shipping Address logic
        shipping_address_id = data.get('shippingAddressId')
        if shipping_address_id and user:
            address = Address.objects.get(id=shipping_address_id, user=user)
            order.shipping_address = address
        else:
            shipping_data = data.get('shippingAddress', {})
            if shipping_data:
                # Create unafilliated address or affiliated to user
                address = Address.objects.create(
                    user=user,
                    name=shipping_data.get('name', 'Shipping'),
                    recipient_name=shipping_data.get('recipient_name', ''),
                    street=shipping_data.get('street', ''),
                    city=shipping_data.get('city', ''),
                    state=shipping_data.get('state', ''),
                    postal_code=shipping_data.get('postal_code', ''),
                    country=shipping_data.get('country', ''),
                    phone_number=shipping_data.get('phone_number', '')
                )
                order.shipping_address = address
        order.save()

        # Create order items and set order to orderItem relationship
        for i in orderItems:
            product = Product.objects.get(id=i['product'])
            variant = None
            if i.get('variant'):
                variant = ProductVariant.objects.get(id=i['variant'])
            
            item = OrderItem.objects.create(
                product=product,
                order=order,
                name=product.name,
                qty=i['qty'],
                price=i['price'],
                image_url=i.get('image', ''),
                variant=variant
            )

            # Update stock
            if variant:
                variant.stock -= item.qty
                variant.save()

        serializer = OrderSerializer(order, many=False)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user = request.user
    orders = user.order_set.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getOrderById(request, pk):
    user = request.user if request.user.is_authenticated else None
    guest_email = request.query_params.get('guest_email')
    
    try:
        order = Order.objects.get(id=pk)
        
        # Security logic for viewing order
        if user and user.is_staff:
            pass # Admin can view any order
        elif order.user == user and user is not None:
            pass # Authorized user
        elif order.user is None and order.guest_email == guest_email and guest_email is None:
            return Response({'detail': 'Not authorized to view this order'}, status=status.HTTP_400_BAD_REQUEST)
        elif order.user is None and order.guest_email == guest_email:
             pass # Guest checkout match
        else:
            return Response({'detail': 'Not authorized to view this order'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrderSerializer(order, many=False)
        return Response(serializer.data)
    except Exception as e:
        return Response({'detail': 'Order does not exist'}, status=status.HTTP_400_BAD_REQUEST)

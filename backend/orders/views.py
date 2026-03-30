from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem, Notification
from products.models import Product, ProductSize
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
            try:
                address = Address.objects.get(id=shipping_address_id, user=user)
                order.shipping_address = address
            except Address.DoesNotExist:
                pass # Fallback to manual entry if ID not found

        if not order.shipping_address:
            shipping_data = data.get('shippingAddress', {})
            if shipping_data:
                # Normalization
                recipient_name = (shipping_data.get('recipient_name') or '').strip()
                phone_number = (shipping_data.get('phone_number') or '').strip()
                flat_house_no = (shipping_data.get('flat_house_no') or '').strip()
                building_apartment = (shipping_data.get('building_apartment') or '').strip()
                area_street_village = (shipping_data.get('area_street_village') or shipping_data.get('street') or '').strip()
                landmark = (shipping_data.get('landmark') or '').strip()
                city = (shipping_data.get('city') or '').strip()
                state = (shipping_data.get('state') or '').strip()
                postal_code = (shipping_data.get('postal_code') or '').strip()
                country = (shipping_data.get('country') or 'India').strip()

                # Deduplication logic
                address = None
                if user:
                    address = Address.objects.filter(
                        user=user,
                        recipient_name__iexact=recipient_name,
                        phone_number__iexact=phone_number,
                        flat_house_no__iexact=flat_house_no,
                        building_apartment__iexact=building_apartment,
                        area_street_village__iexact=area_street_village,
                        city__iexact=city,
                        state__iexact=state,
                        postal_code__iexact=postal_code
                    ).first()

                if not address:
                    # Create new if doesn't exist
                    address = Address.objects.create(
                        user=user,
                        name=shipping_data.get('name', 'Shipping'),
                        recipient_name=recipient_name,
                        phone_number=phone_number,
                        flat_house_no=flat_house_no,
                        building_apartment=building_apartment,
                        area_street_village=area_street_village,
                        landmark=landmark,
                        city=city,
                        state=state,
                        postal_code=postal_code,
                        country=country
                    )
                
                order.shipping_address = address
        order.save()

        # Create order items and set order to orderItem relationship
        try:
            for i in orderItems:
                try:
                    product = Product.objects.select_related('category').get(id=i['product'])
                except Product.DoesNotExist:
                     return Response(
                         {'detail': f'Product with ID {i["product"]} does not exist.'}, 
                         status=status.HTTP_400_BAD_REQUEST
                     )

                variant = None
                size_label = i.get('size', '')

                raw_variant = i.get('variant')
                if raw_variant:
                    # Try to resolve as an integer FK first
                    try:
                        variant = ProductSize.objects.get(id=int(raw_variant))
                        size_label = variant.size  # Always sync the label from the FK
                    except (ProductSize.DoesNotExist, ValueError, TypeError):
                        # If it's a string like 'S', try to match by size name on the product
                        try:
                            variant = ProductSize.objects.get(product=product, size=str(raw_variant))
                            size_label = variant.size
                        except ProductSize.DoesNotExist:
                            pass  # variant stays None, size_label is preserved as text

                item = OrderItem.objects.create(
                    product=product,
                    order=order,
                    name=product.name,
                    qty=i['qty'],
                    price=i['price'],
                    image_url=i.get('image', ''),
                    variant=variant,
                    size_label=size_label
                )

                # Update stock
                if variant:
                    if variant.stock < item.qty:
                        # Rollback is handled by order.delete() in except block
                        raise Exception(f'Not enough stock for {product.name} ({variant.size}).')
                    variant.stock -= item.qty
                    variant.save()
        except Exception as e:
            # Delete order if item creation fails to maintain consistency
            order.delete()
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrderSerializer(order, many=False)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user = request.user
    orders = user.order_set.all().order_by('-created_at')
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

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateOrderToPaid(request, pk):
    try:
        order = Order.objects.get(id=pk)
        order.is_paid = True
        order.paid_at = datetime.now()
        order.save()
        
        if order.user:
            Notification.objects.create(
                user=order.user,
                title="Payment Received",
                message=f"We have received payment for Order #{order.id}. Thank you!",
                type='success'
            )
        return Response('Order was paid')
    except:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getNotifications(request):
    user = request.user
    notifications = user.notifications.all().order_by('-created_at')
    return Response([{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat()
    } for n in notifications])

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def markNotificationAsRead(request, pk):
    try:
        notification = request.user.notifications.get(id=pk)
        notification.is_read = True
        notification.save()
        return Response({'detail': 'Marked as read'})
    except:
        return Response({'detail': 'Notification not found'}, status=status.HTTP_400_BAD_REQUEST)

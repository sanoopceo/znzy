from rest_framework import serializers
from .models import Order, OrderItem
from users.serializers import UserSerializer, AddressSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField(read_only=True)
    shipping_address = serializers.SerializerMethodField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_items(self, obj):
        items = obj.items.all()
        serializer = OrderItemSerializer(items, many=True)
        return serializer.data

    def get_shipping_address(self, obj):
        try:
            address = AddressSerializer(obj.shipping_address, many=False).data
        except:
            address = False
        return address

    def get_user(self, obj):
        try:
            user = UserSerializer(obj.user, many=False).data
        except:
            user = False
        return user

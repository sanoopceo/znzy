from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import make_password
from rest_framework import status
from .models import User, Address
from .serializers import UserSerializer, UserSerializerWithToken, AddressSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        serializer = UserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['POST'])
def registerUser(request):
    data = request.data
    try:
        user = User.objects.create(
            first_name=data.get('name', ''),
            username=data.get('email'),
            email=data.get('email'),
            password=make_password(data.get('password'))
        )
        serializer = UserSerializerWithToken(user, many=False)
        return Response(serializer.data)
    except Exception as e:
        message = {'detail': 'User with this email already exists'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    serializer = UserSerializerWithToken(user, many=False)

    data = request.data
    user.first_name = data.get('name', user.first_name)
    user.username = data.get('email', user.email)
    user.email = data.get('email', user.email)

    if data.get('password') != '':
        user.password = make_password(data.get('password'))
    
    user.save()
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def userAddresses(request):
    if request.method == 'GET':
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data
        address = Address.objects.create(
            user=request.user,
            name=data.get('name', 'Home'),
            recipient_name=data.get('recipient_name', ''),
            street=data.get('street', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            postal_code=data.get('postal_code', ''),
            country=data.get('country', ''),
            phone_number=data.get('phone_number', '')
        )
        serializer = AddressSerializer(address, many=False)
        return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteAddress(request, pk):
    try:
        address = Address.objects.get(id=pk, user=request.user)
        address.delete()
        return Response('Address deleted')
    except:
        return Response({'detail': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

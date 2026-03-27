from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Category, Review, ProductImage
from .serializers import ProductSerializer, CategorySerializer, ProductImageSerializer
from django.db.models import Q

@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword')
    category_slug = request.query_params.get('category')
    
    products = Product.objects.filter(is_active=True)
    
    if query:
        products = products.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
        
    if category_slug:
        products = products.filter(category__slug=category_slug)
        
    serializer = ProductSerializer(products, many=True)
    return Response({'products': serializer.data})

@api_view(['GET'])
def getProduct(request, identifier):
    try:
        if identifier.isdigit():
            product = Product.objects.get(id=identifier, is_active=True)
        else:
            product = Product.objects.get(share_id=identifier, is_active=True)
            
        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def getCategories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    user = request.user
    product = Product.objects.get(id=pk)
    data = request.data

    # 1 - Review already exists
    alreadyExists = product.reviews.filter(user=user).exists()
    if alreadyExists:
        return Response({'detail': 'Product already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

    # 2 - No Rating or 0
    if data.get('rating') == 0 or not data.get('rating'):
        return Response({'detail': 'Please select a rating'}, status=status.HTTP_400_BAD_REQUEST)

    # 3 - Create review
    review = Review.objects.create(
        user=user,
        product=product,
        rating=data.get('rating'),
        comment=data.get('comment', '')
    )

    return Response('Review Added')
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
        data = request.data

        product.name = data.get('name', product.name)
        product.base_price = data.get('price', product.base_price)
        product.description = data.get('description', product.description)
        
        category_name = data.get('category')
        if category_name:
            category = Category.objects.filter(name=category_name).first()
            if category:
                product.category = category

        product.save()
        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def uploadImage(request):
    data = request.data
    product_id = data.get('product_id')
    
    if not product_id:
        return Response({'detail': 'Product ID required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(id=product_id)
        image = request.FILES.get('image')
        
        if not image:
             return Response({'detail': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        product_image = ProductImage.objects.create(
            product=product,
            image=image,
            is_primary=data.get('is_primary', 'false').lower() == 'true'
        )
        
        serializer = ProductImageSerializer(product_image, many=False)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteImage(request, pk):
    try:
        image = ProductImage.objects.get(id=pk)
        image.delete()
        return Response({'detail': 'Image deleted successfully'})
    except ProductImage.DoesNotExist:
        return Response({'detail': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

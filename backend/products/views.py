from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Category, Review, ProductImage, ProductSize
from .serializers import ProductSerializer, CategorySerializer, ProductImageSerializer, ProductSizeSerializer, ReviewSerializer
from django.db.models import Q
import uuid

@api_view(['GET'])
def searchSuggestions(request):
    query = request.query_params.get('q', '')
    if len(query) < 2:
        return Response([])
    
    products = Product.objects.filter(
        Q(name__icontains=query) | Q(description__icontains=query),
        is_active=True
    ).distinct()[:8]
    
    from .serializers import ProductListSerializer
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword')
    category_slug = request.query_params.get('category')
    is_new = request.query_params.get('is_new')
    is_bestseller = request.query_params.get('is_bestseller')
    is_archive_sale = request.query_params.get('is_archive_sale')
    collection = request.query_params.get('collection')
    
    products = Product.objects.filter(is_active=True)
    
    if query:
        products = products.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
        
    if category_slug:
        products = products.filter(category__slug=category_slug)

    if is_new:
        products = products.filter(is_new=True)
    if is_bestseller:
        products = products.filter(is_bestseller=True)
    if is_archive_sale:
        products = products.filter(is_archive_sale=(is_archive_sale.lower() == 'true'))
    if collection:
        products = products.filter(collection_name__icontains=collection)

    # Filtration: Price Range
    min_price = request.query_params.get('min_price')
    max_price = request.query_params.get('max_price')
    if min_price:
        products = products.filter(price__gte=min_price)
    if max_price:
        products = products.filter(price__lte=max_price)

    # Filtration: Stock Status
    stock_status = request.query_params.get('stock') # 'in_stock' or 'out_of_stock'
    if stock_status == 'in_stock':
        # Consider a product in stock if any of its sizes have stock > 0
        products = products.filter(sizes__stock__gt=0).distinct()
    elif stock_status == 'out_of_stock':
        # More complex: all sizes must be 0? Or common stock is 0?
        # Let's use the product.stock field if that's aggregated, or use sizes.
        products = products.filter(stock=0)

    # Optimization: select_related for category
    products = products.select_related('category').order_by('-created_at')
        
    # Pagination
    limit = request.query_params.get('limit')
    offset = request.query_params.get('offset')
    page = request.query_params.get('page', 1)
    page_size = int(request.query_params.get('page_size', 12)) # Default 12

    if limit and offset:
         # Limit/Offset support
         limit = int(limit)
         offset = int(offset)
         paginated_products = products[offset:offset+limit]
         
         from .serializers import ProductListSerializer
         serializer = ProductListSerializer(paginated_products, many=True, context={'request': request})
         return Response({
             'products': serializer.data,
             'count': products.count()
         })
    else:
        # Standard Page pagination
        from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
        paginator = Paginator(products, page_size)
        try:
            products_page = paginator.page(page)
        except PageNotAnInteger:
            products_page = paginator.page(1)
        except EmptyPage:
            products_page = paginator.page(paginator.num_pages)

        from .serializers import ProductListSerializer
        serializer = ProductListSerializer(products_page, many=True, context={'request': request})
        
        return Response({
            'products': serializer.data,
            'page': products_page.number,
            'pages': paginator.num_pages,
            'count': paginator.count
        })

@api_view(['GET'])
def getProduct(request, identifier):
    """
    Fetches a single product by either its integer ID or its share_id (slug-like).
    Returns 404 JSON response instead of crashing.
    """
    try:
        if identifier.isdigit():
            product = Product.objects.get(id=int(identifier), is_active=True)
        else:
            product = Product.objects.get(share_id=identifier, is_active=True)
            
        serializer = ProductSerializer(product, many=False, context={'request': request})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response(
            {'detail': f'Product with identifier "{identifier}" not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'detail': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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
        rating=int(data.get('rating', 5)),
        comment=data.get('comment', '')
    )

    # 4 - Update product summary
    reviews = product.reviews.all()
    product.numReviews = reviews.count()

    total = 0
    for r in reviews:
        total += r.rating

    product.rating = total / reviews.count()
    product.save()

    serializer = ReviewSerializer(review, many=False)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
        data = request.data

        product.name = data.get('name', product.name)
        product.price = data.get('price', product.price)
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

@api_view(['GET'])
def getProductSizes(request, pk):
    try:
        product = Product.objects.get(id=pk)
        sizes = ProductSize.objects.filter(product=product)
        serializer = ProductSizeSerializer(sizes, many=True)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProductSizes(request, pk):
    """
    Expects a list or dictionary with 'sizes' list: 
    [{"size": "S", "stock": 10}, ...] OR {"sizes": [{"size": "S", "stock": 10}, ...]}
    """
    try:
        product = Product.objects.get(id=pk)
        data = request.data
        
        # Handle dict with 'sizes' key
        if isinstance(data, dict) and 'sizes' in data:
            data = data['sizes']

        if not isinstance(data, list):
             return Response({'detail': 'Expected a list of size objects or a dictionary with "sizes" key'}, status=status.HTTP_400_BAD_REQUEST)

        updated_sizes = []
        errors = []

        for s_data in data:
            size_name = s_data.get('size')
            stock_val = s_data.get('stock')

            if size_name is None:
                errors.append({'detail': 'Size name is required for all entries'})
                continue

            if stock_val is None:
                errors.append({'size': size_name, 'detail': 'Stock value is required'})
                continue

            try:
                stock_val = int(stock_val)
                if stock_val < 0:
                    errors.append({'size': size_name, 'detail': 'Stock must be >= 0'})
                    continue
            except (ValueError, TypeError):
                errors.append({'size': size_name, 'detail': 'Stock must be a number'})
                continue

            # Instructions: "Size must exist"
            # I will check if it exists, if not, I'll report error OR create it?
            # Re-reading: "Ensure update logic correctly updates size-wise inventory"
            # "Validate: Size must exist"
            # If I should ONLY update existing sizes:
            try:
                size_obj = ProductSize.objects.get(product=product, size=size_name)
                size_obj.stock = stock_val
                size_obj.save()
                updated_sizes.append(size_name)
            except ProductSize.DoesNotExist:
                errors.append({'size': size_name, 'detail': 'Size does not exist for this product'})

        if errors:
            return Response({
                'detail': 'Errors occurred during update',
                'updated': updated_sizes,
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Sizes updated successfully', 'updated': updated_sizes})
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

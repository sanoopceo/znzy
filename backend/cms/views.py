from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Page, PageVersion, ReusableBlock, HomepageSection
from products.models import Product
from dashboard.permissions import IsAdminUser

# --- HOMEPAGE / PUBLIC CMS ---

@api_view(['GET'])
@permission_classes([AllowAny])
def getHomepageContent(request):
    """
    Public API to get homepage content sections.
    """
    sections = HomepageSection.objects.filter(is_active=True).order_by('order')
    data = []
    
    from products.serializers import ProductSerializer
    
    for sec in sections:
        items = []
        # Support for product-based sections
        if sec.section_type in ['bestsellers', 'featured', 'trending', 'new_arrivals']:
             qs = Product.objects.filter(is_active=True).prefetch_related('images', 'side_images')
             if sec.section_type == 'bestsellers':
                 qs = qs.filter(is_bestseller=True)
             elif sec.section_type == 'featured':
                 qs = qs.filter(is_featured=True)
             elif sec.section_type == 'trending':
                 qs = qs.filter(is_trending=True)
             elif sec.section_type == 'new_arrivals':
                 qs = qs.order_by('-created_at')
             
             # Use serializer for consistency
             products = qs.order_by('display_order')[:4]
             items = ProductSerializer(products, many=True, context={'request': request}).data
        
        data.append({
            'title': sec.title,
            'subtitle': sec.subtitle,
            'type': sec.section_type,
            'image_url': sec.image_url,
            'cta_text': sec.cta_text,
            'cta_link': sec.cta_link,
            'items': items
        })
        
    return Response(data)

# --- PAGE BUILDER / ADMIN CMS ---

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def pages_collection(request):
    if request.method == 'GET':
        pages = Page.objects.all().order_by('-updated_at')
        return Response([{'id': p.id, 'title': p.title, 'slug': p.slug, 'is_published': p.is_published} for p in pages])
    
    elif request.method == 'POST':
        data = request.data
        page = Page.objects.create(
            title=data.get('title'),
            slug=data.get('slug'),
            content_json=data.get('content_json', {}),
            created_by=request.user
        )
        return Response({'id': page.id, 'detail': 'Page created'}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def page_detail(request, pk):
    try:
        page = Page.objects.get(id=pk)
    except Page.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            'id': page.id,
            'title': page.title,
            'slug': page.slug,
            'content_json': page.content_json,
            'is_published': page.is_published
        })
    
    elif request.method == 'PUT':
        data = request.data
        page.title = data.get('title', page.title)
        page.content_json = data.get('content_json', page.content_json)
        page.save()
        return Response({'detail': 'Page updated'})
    
    elif request.method == 'DELETE':
        page.delete()
        return Response(status=status.HTTP_24_NO_CONTENT)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_page_by_slug(request, slug):
    try:
        page = Page.objects.get(slug=slug, is_published=True)
        return Response({
            'title': page.title,
            'content_json': page.content_json
        })
    except Page.DoesNotExist:
        return Response({'detail': 'Page not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def publish_page(request, pk):
    try:
        page = Page.objects.get(id=pk)
        page.is_published = True
        page.save()
        return Response({'detail': 'Page published'})
    except Page.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

# Stub views for block and versioning to satisfy URL resolver
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def create_page_version(request): return Response({'detail': 'Not implemented'}, status=501)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_page_versions(request, page_id): return Response([], status=200)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def restore_page_version(request, version_id): return Response({'detail': 'Not implemented'}, status=501)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def blocks_collection(request): return Response([], status=200)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_asset(request): return Response({'detail': 'Not implemented'}, status=501)

from django.core.cache import cache
from django.db.models import Max
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Page, PageVersion, ReusableBlock
from .permissions import IsSuperUser
from .serializers import PageSerializer, PageVersionSerializer, ReusableBlockSerializer


def _next_version_number(page):
    max_version = page.versions.aggregate(max_value=Max('version_number'))['max_value'] or 0
    return max_version + 1


def _cache_key(slug):
    return f"cms_page_{slug}"


def _create_version_snapshot(page):
    PageVersion.objects.create(
        page=page,
        content_json=page.content_json,
        version_number=_next_version_number(page),
    )


@api_view(['GET', 'POST'])
def pages_collection(request):
    if request.method == 'GET':
        if not request.user.is_authenticated or not request.user.is_superuser:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        pages = Page.objects.all().order_by('-updated_at')
        serializer = PageSerializer(pages, many=True)
        return Response(serializer.data)

    if not request.user.is_authenticated or not request.user.is_superuser:
        return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    serializer = PageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    page = serializer.save(created_by=request.user)
    _create_version_snapshot(page)
    return Response(PageSerializer(page).data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsSuperUser])
def update_page(request, pk):
    page = get_object_or_404(Page, pk=pk)
    serializer = PageSerializer(page, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    updated_page = serializer.save()
    _create_version_snapshot(updated_page)
    cache.delete(_cache_key(updated_page.slug))
    return Response(PageSerializer(updated_page).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_page_by_slug(request, slug):
    cache_key = _cache_key(slug)
    use_cache = not (request.user.is_authenticated and request.user.is_superuser)
    if use_cache:
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

    page = get_object_or_404(Page, slug=slug)
    if not page.is_published and not (request.user.is_authenticated and request.user.is_superuser):
        return Response({'detail': 'Page not found'}, status=status.HTTP_404_NOT_FOUND)

    data = PageSerializer(page).data
    if page.is_published:
        cache.set(cache_key, data, timeout=60 * 10)
    return Response(data)


@api_view(['POST'])
@permission_classes([IsSuperUser])
def publish_page(request, pk):
    page = get_object_or_404(Page, pk=pk)
    page.is_published = True
    page.save(update_fields=['is_published', 'updated_at'])
    cache.delete(_cache_key(page.slug))
    return Response({'detail': 'Page published', 'page_id': page.id})


@api_view(['POST'])
@permission_classes([IsSuperUser])
def create_page_version(request):
    serializer = PageVersionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    page = serializer.validated_data['page']
    content_json = serializer.validated_data.get('content_json', page.content_json)
    version = PageVersion.objects.create(
        page=page,
        content_json=content_json,
        version_number=_next_version_number(page),
    )
    return Response(PageVersionSerializer(version).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsSuperUser])
def list_page_versions(request, page_id):
    versions = PageVersion.objects.filter(page_id=page_id).order_by('-version_number')
    serializer = PageVersionSerializer(versions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsSuperUser])
def restore_page_version(request, version_id):
    version = get_object_or_404(PageVersion, pk=version_id)
    page = version.page
    page.content_json = version.content_json
    page.save(update_fields=['content_json', 'updated_at'])
    _create_version_snapshot(page)
    cache.delete(_cache_key(page.slug))
    return Response(PageSerializer(page).data)


@api_view(['GET', 'POST'])
def blocks_collection(request):
    if request.method == 'GET':
        blocks = ReusableBlock.objects.all()
        serializer = ReusableBlockSerializer(blocks, many=True)
        return Response(serializer.data)

    if not request.user.is_authenticated or not request.user.is_superuser:
        return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ReusableBlockSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    block = serializer.save()
    return Response(ReusableBlockSerializer(block).data, status=status.HTTP_201_CREATED)
from django.shortcuts import render

# Create your views here.

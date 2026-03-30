from django.urls import path
from . import views


urlpatterns = [
    path('homepage/', views.getHomepageContent, name='cms-homepage'),
    path('pages/', views.pages_collection, name='cms-pages'),
    path('pages/<int:pk>/', views.page_detail, name='cms-page-detail'),
    path('pages/<slug:slug>/', views.get_page_by_slug, name='cms-page-by-slug'),
    path('pages/<int:pk>/publish/', views.publish_page, name='cms-page-publish'),
    path('page-versions/', views.create_page_version, name='cms-page-version-create'),
    path('page-versions/<int:page_id>/', views.list_page_versions, name='cms-page-version-list'),
    path('page-versions/restore/<int:version_id>/', views.restore_page_version, name='cms-page-version-restore'),
    path('blocks/', views.blocks_collection, name='cms-blocks'),
    path('assets/upload/', views.upload_asset, name='cms-asset-upload'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.getAdminOverview, name='admin-overview'),
    path('orders/', views.getAdminOrders, name='admin-orders'),
    path('orders/<str:pk>/detail/', views.getAdminOrderDetail, name='admin-order-detail'),
    path('orders/<str:pk>/status/', views.updateOrderStatus, name='admin-order-status-update'),
    path('users/', views.getAdminUsers, name='admin-users'),
    path('products/', views.getAdminProducts, name='admin-products'),
    path('products/create/', views.createProduct, name='admin-product-create'),
    path('products/<str:pk>/update/', views.updateProduct, name='admin-product-update'),
    path('products/<str:pk>/delete/', views.deleteProduct, name='admin-product-delete'),
    path('products/<str:product_pk>/side-images/<str:image_pk>/delete/', views.deleteSideImage, name='admin-product-side-image-delete'),
]

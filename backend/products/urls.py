from django.urls import path
from . import views

urlpatterns = [
    path('', views.getProducts, name="products"),
    path('search/suggestions/', views.searchSuggestions, name="search-suggestions"),
    path('categories/', views.getCategories, name="categories"),
    path('<str:identifier>/', views.getProduct, name="product"),
    path('<str:pk>/reviews/', views.createProductReview, name="create-review"),
    path('<str:pk>/sizes/', views.getProductSizes, name="product-sizes"),
    path('<str:pk>/sizes/update/', views.updateProductSizes, name="update-product-sizes"),
    path('update/<str:pk>/', views.updateProduct, name="update-product"),
    path('upload/', views.uploadImage, name="upload-image"),
    path('image-delete/<str:pk>/', views.deleteImage, name="delete-image"),
]

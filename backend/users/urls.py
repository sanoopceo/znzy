from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', views.registerUser, name='register'),
    path('profile/', views.getUserProfile, name='users-profile'),
    path('profile/update/', views.updateUserProfile, name='users-profile-update'),
    path('addresses/', views.userAddresses, name='users-addresses'),
    path('addresses/<str:pk>/update/', views.updateAddress, name='users-address-update'),
    path('addresses/<str:pk>/', views.deleteAddress, name='users-address-delete'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.addOrderItems, name='orders-add'),
    path('myorders/', views.getMyOrders, name='myorders'),
    path('notifications/', views.getNotifications, name='notifications'),
    path('notifications/<str:pk>/read/', views.markNotificationAsRead, name='notification-read'),
    path('<str:pk>/pay/', views.updateOrderToPaid, name='pay'),
    path('<str:pk>/', views.getOrderById, name='user-order'),
]

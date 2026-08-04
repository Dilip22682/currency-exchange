from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/currencies/', views.api_currencies, name='api_currencies'),
    path('api/rates/', views.api_latest_rates, name='api_rates'),
    path('api/convert/', views.api_convert, name='api_convert'),
    path('api/historical/', views.api_historical, name='api_historical'),
    path('api/recent/', views.api_recent_conversions, name='api_recent'),
]
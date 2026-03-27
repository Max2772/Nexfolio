from django.urls import path

from . import views

app_name = 'stock_market'

urlpatterns = [
    path('stock_market/', views.StockMarket.as_view(), name='stocks'),
]

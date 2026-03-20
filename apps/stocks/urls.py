from django.urls import path

from . import views

app_name = 'stocks'

urlpatterns = [
    path('stocks/', views.StocksView.as_view(), name='stocks'),
]

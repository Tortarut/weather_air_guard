from django.urls import path
from .views import get_cities, get_air_quality

urlpatterns = [
    path('api/cities/<str:city_name>/', get_cities),
    path('api/air_quality/<str:lat>/<str:lon>/', get_air_quality),
]

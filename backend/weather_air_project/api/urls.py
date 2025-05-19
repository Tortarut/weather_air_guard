from django.urls import path
from .views import get_cities, get_air_quality, bookmarked_cities, delete_bookmarked_city

urlpatterns = [
    path('api/cities/<str:city_name>/', get_cities),
    path('api/air_quality/<str:lat>/<str:lon>/', get_air_quality),
    path('api/bookmarks/', bookmarked_cities, name='bookmarked-cities'),
    path('api/bookmarks/<int:city_id>/', delete_bookmarked_city, name='delete-bookmarked-city'),
]

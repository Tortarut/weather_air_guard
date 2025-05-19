from rest_framework import serializers
from .models import BookmarkedCity
 
class BookmarkedCitySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookmarkedCity
        fields = ['id', 'name', 'lat', 'lon', 'created_at']
        read_only_fields = ['id', 'created_at'] 
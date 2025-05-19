from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class BookmarkedCity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarked_cities')
    name = models.CharField(max_length=100)
    lat = models.FloatField()
    lon = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'name', 'lat', 'lon')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

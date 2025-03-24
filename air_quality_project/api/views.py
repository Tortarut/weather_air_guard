import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
import os
from air_quality_project.settings import API_KEY

API_KEY = API_KEY

@api_view(['GET'])
def get_cities(request, city_name):
    """Получение списка городов по названию"""
    print(API_KEY)
    location_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_name}&limit=5&appid={API_KEY}"
    response = requests.get(location_url)
    if response.status_code != 200:
        return Response({"error": "Ошибка получения координат"}, status=400)
    
    cities = response.json()
    if not cities:
        return Response({"error": "Город не найден"}, status=404)

    # Преобразуем информацию о городах в удобный формат
    city_list = []
    for city in cities:
        city_info = {
            "name": city["name"],
            "country": city.get("country", "Неизвестная страна"),
            "lat": city["lat"],
            "lon": city["lon"]
        }
        city_list.append(city_info)

    return Response(city_list)


@api_view(['GET'])
def get_air_quality(request, lat, lon):
    """Получение данных о качестве воздуха и погоде по координатам"""
    try:
        lat, lon = float(lat), float(lon)  # Преобразуем строки в float
    except ValueError:
        return Response({"error": "Неверный формат координат"}, status=400)

    # Получаем данные о качестве воздуха
    air_quality_url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
    air_quality_response = requests.get(air_quality_url)
    if air_quality_response.status_code != 200:
        return Response({"error": "Ошибка получения данных о качестве воздуха"}, status=400)
    
    air_quality_data = air_quality_response.json()

    # Получаем данные о погоде
    weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    weather_response = requests.get(weather_url)
    if weather_response.status_code != 200:
        return Response({"error": "Ошибка получения данных о погоде"}, status=400)

    weather_data = weather_response.json()

    # Собираем все данные в один ответ
    result = {
        "air_quality": air_quality_data,
        "weather": weather_data
    }

    return Response(result)

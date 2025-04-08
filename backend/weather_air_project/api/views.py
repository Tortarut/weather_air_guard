import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
import os
from weather_air_project.settings import API_KEY

API_KEY = API_KEY

def generate_health_recommendations(data):
    recommendations = {}
    
    # Извлекаем данные о качестве воздуха
    air_quality = data.get('air_quality', {}).get('list', [{}])[0]
    aqi = air_quality.get('main', {}).get('aqi', 1)
    components = air_quality.get('components', {})
    pm2_5 = components.get('pm2_5', 0)
    pm10 = components.get('pm10', 0)
    co = components.get('co', 0)
    no2 = components.get('no2', 0)
    o3 = components.get('o3', 0)
    so2 = components.get('so2', 0)
    nh3 = components.get('nh3', 0)
    
    # Извлекаем данные о погоде
    weather_data = data.get('weather', {})
    main_weather = weather_data.get('main', {})
    temp = main_weather.get('temp', 0)
    feels_like = main_weather.get('feels_like', 0)
    humidity = main_weather.get('humidity', 0)
    pressure = main_weather.get('pressure', 0)
    visibility = weather_data.get('visibility', 10000)  # в метрах
    wind_speed = weather_data.get('wind', {}).get('speed', 0)
    wind_gust = weather_data.get('wind', {}).get('gust', 0)
    weather_desc = weather_data.get('weather', [{}])[0].get('description', '').lower()
    
    # Рекомендации по качеству воздуха
    if aqi <= 2:
        recommendations['aqi'] = "Отличное качество воздуха! Идеальное время для прогулок и проветривания помещений."
    elif aqi == 3:
        recommendations['aqi'] = "Удовлетворительное качество воздуха. У чувствительных людей возможен лёгкий дискомфорт."
        if pm2_5 > 20:
            recommendations['pm2_5'] = "Повышенное содержание PM2.5. Людям с болезнями лёгких следует сократить время на улице."
        if pm10 > 25:
            recommendations['pm10'] = "Повышенное содержание PM10. Избегайте длительного нахождения у оживлённых дорог."
    elif aqi == 4:
        recommendations['aqi'] = "Плохое качество воздуха. Ограничьте пребывание на улице, особенно при проблемах с дыханием."
        recommendations['aqi_extra'] = "Держите окна закрытыми для защиты от загрязнённого воздуха."
    elif aqi == 5:
        recommendations['aqi'] = "Очень плохое качество воздуха! Рекомендуется оставаться в помещении."
        recommendations['aqi_extra'] = "Используйте очиститель воздуха. При выходе на улицу надевайте респиратор."
    
    # Рекомендации по конкретным загрязнителям
    if co > 500:
        recommendations['co'] = "Высокий уровень CO. Избегайте нахождения рядом с автотрассами и в гаражах."
    if no2 > 50:
        recommendations['no2'] = "Повышенный NO₂. Астматикам следует соблюдать осторожность."
    if o3 > 50:
        recommendations['o3'] = "Высокий уровень озона. Снизьте физическую активность на открытом воздухе днём."
    if so2 > 20:
        recommendations['so2'] = "Повышенный SO₂. Может раздражать дыхательные пути."
    if nh3 > 5:
        recommendations['nh3'] = "Повышенный аммиак. Избегайте промышленных зон и сельхозпредприятий."
    
    # Рекомендации по погоде
    if temp - feels_like > 3:
        recommendations['feels_like'] = f"Ощущается как {feels_like:.1f}°C при фактических {temp:.1f}°C. Учтите это при выборе одежды."
    
    if temp < 0:
        recommendations['temp'] = "Мороз! Тёплая одежда обязательна, защищайте кожу от обморожения."
    elif temp < 10:
        recommendations['temp'] = "Холодно. Наденьте тёплую куртку, шапку и перчатки."
    elif temp > 25:
        recommendations['temp'] = "Жарко. Носите лёгкую одежду, головной убор и пейте больше воды."
    elif temp > 30:
        recommendations['temp'] = "Сильная жара! Избегайте солнца с 11 до 16 часов, опасайтесь теплового удара."
    
    if humidity > 80:
        recommendations['humidity'] = "Высокая влажность. Одежда сохнет медленно, возможна духота."
    elif humidity < 30:
        recommendations['humidity'] = "Сухой воздух. Используйте увлажнитель, пейте больше жидкости."
    
    if wind_speed > 15:
        recommendations['wind_speed'] = "Очень сильный ветер! Будьте осторожны на открытых пространствах."
    elif wind_speed > 10:
        recommendations['wind_speed'] = "Сильный ветер. Закрепите незакреплённые предметы, наденьте ветровку."
    elif wind_speed > 5:
        recommendations['wind_speed'] = "Умеренный ветер. Возьмите ветровку или головной убор."
    
    if wind_gust > 15:
        recommendations['wind_gust'] = "Ожидаются сильные порывы ветра! Будьте осторожны."
    
    # Рекомендации по видимости
    if visibility < 1000:
        recommendations['visibility'] = "Очень плохая видимость! Будьте крайне осторожны на дорогах."
        if 'fog' in weather_desc:
            recommendations['visibility_fog'] = "Сильный туман. Используйте противотуманные фары, снизьте скорость."
    elif visibility < 3000:
        recommendations['visibility'] = "Пониженная видимость. Водителям следует соблюдать осторожность."
    elif visibility < 5000:
        recommendations['visibility'] = "Умеренная видимость. Будьте внимательны при переходе дорог."
    
    # Рекомендации по атмосферному давлению
    if pressure < 980:
        recommendations['pressure'] = "Низкое атмосферное давление. Метеозависимые люди могут испытывать недомогание."
    elif pressure > 1030:
        recommendations['pressure'] = "Высокое атмосферное давление. Возможны головные боли у чувствительных людей."
    
    # Рекомендации по погодным явлениям
    if 'rain' in weather_desc:
        recommendations['weather_desc'] = "Ожидается дождь. Возьмите зонт и наденьте водонепроницаемую обувь."
    elif 'snow' in weather_desc:
        recommendations['weather_desc'] = "Ожидается снег. Выбирайте нескользящую обувь и тёплую одежду."
    elif 'thunderstorm' in weather_desc:
        recommendations['weather_desc'] = "Гроза! Избегайте открытых пространств и высоких объектов."
    elif 'drizzle' in weather_desc:
        recommendations['weather_desc'] = "Морось. Дороги могут быть скользкими, будьте осторожны."
    elif 'overcast' in weather_desc or 'clouds' in weather_desc:
        recommendations['weather_desc'] = "Пасмурно. Возможно, вам не хватает солнечного света - рассмотрите приём витамина D."
    elif 'clear' in weather_desc:
        recommendations['weather_desc'] = "Ясно. Не забудьте солнцезащитный крем в солнечные часы."
    return recommendations

@api_view(['GET'])
def get_cities(request, city_name):
    """Получение списка городов по названию"""
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
    print(lat, lon)
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
        "weather": weather_data,
        "recommendations": generate_health_recommendations({"air_quality": air_quality_data, 
                                                            "weather": weather_data,})
    }
    print(result)
    
    return Response(result)

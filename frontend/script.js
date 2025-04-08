async function fetchCities() {
    let cityName = document.getElementById("city-input").value;
    let response = await fetch(`http://127.0.0.1:8000/api/cities/${cityName}/`);
    let data = await response.json();
    let cityList = document.getElementById("city-list");
    cityList.innerHTML = "";

    if (data.error) {
        alert(data.error);
        return;
    }

    data.forEach((city, index) => {
        let option = document.createElement("option");
        option.value = index;
        option.innerText = `${city.name}, ${city.country}`;
        cityList.appendChild(option);
    });
}

async function fetchAirQuality() {
    let cityIndex = document.getElementById("city-list").value;
    let response = await fetch(`http://127.0.0.1:8000/api/cities/${document.getElementById("city-input").value}/`);
    let data = await response.json();
    let city = data[cityIndex];

    let airQualityResponse = await fetch(`http://127.0.0.1:8000/api/air_quality/${city.lat}/${city.lon}/`);
    let airQualityData = await airQualityResponse.json();
    
    displayData(city, airQualityData);
}

function displayData(city_value, data) {
    console.log(city_value)
    let air = data.air_quality.list[0].components;
    let weather = data.weather.main;
    let wind = data.weather.wind;
    let clouds = data.weather.clouds;
    let sys = data.weather.sys;
    let visibility = data.weather.visibility;
    let weather_desc = data.weather.weather[0].description;
    let rec = data.recommendations;

    function renderItem(label, value, key = null) {
        let recommendation = key && rec[key] ? `<p class="recommendation">${rec[key]}</p>` : "";
        return `<div class="data-item"><strong>${label}:</strong> ${value} ${recommendation}</div>`;
    }

    let resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <div class="data-section">
            <h2>🌍 Город: ${city_value.name}, ${city_value.country}</h2>
        </div>

        <div class="data-section">
            <h2>💨 Качество воздуха</h2>
            ${renderItem("AQI (Индекс качества воздуха)", data.air_quality.list[0].main.aqi, "aqi")}
            ${renderItem("CO (Угарный газ)", air.co + " µg/m³", "co")}
            ${renderItem("NO₂ (Диоксид азота)", air.no2 + " µg/m³", "no2")}
            ${renderItem("O₃ (Озон)", air.o3 + " µg/m³", "o3")}
            ${renderItem("SO₂ (Диоксид серы)", air.so2 + " µg/m³", "so2")}
            ${renderItem("PM2.5 (Тонкие частицы)", air.pm2_5 + " µg/m³", "pm2_5")}
            ${renderItem("PM10 (Грубые частицы)", air.pm10 + " µg/m³", "pm10")}
            ${renderItem("NH₃ (Аммиак)", air.nh3 + " µg/m³", "nh3")}
        </div>

        <div class="data-section">
            <h2>⛅️ Погода</h2>
            ${renderItem("Температура", weather.temp + "°C", "temp")}
            ${renderItem("Ощущается как", weather.feels_like + "°C", "feels_like")}
            ${renderItem("Давление", weather.pressure + " hPa", "pressure")}
            ${renderItem("Влажность", weather.humidity + "%", "humidity")}
        </div>

        <div class="data-section">
            <h2>🌬 Ветер</h2>
            ${renderItem("Скорость ветра", wind.speed + " м/с", "wind_speed")}
            ${renderItem("Порывы ветра", wind.gust + " м/с", "wind_gust")}
        </div>

        <div class="data-section">
            <h2>☁️ Облачность</h2>
            ${renderItem("Облачность", clouds.all + "%")}
        </div>

        <div class="data-section">
            <h2>👀 Видимость</h2>
            ${renderItem("Видимость", visibility + " м", "visibility")}
        </div>

        <div class="data-section">
            <h2>🌦 Погодные условия</h2>
            ${renderItem("Описание", weather_desc, "weather_desc")}
        </div>

        <div class="data-section">
            <h2>🌅 Солнце</h2>
            ${renderItem("Восход", new Date(sys.sunrise * 1000).toLocaleTimeString())}
            ${renderItem("Закат", new Date(sys.sunset * 1000).toLocaleTimeString())}
        </div>
    `;
}

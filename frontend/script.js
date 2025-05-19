// --- AUTH & USER STATE ---
const API_BASE = 'http://127.0.0.1:8000';
let accessToken = localStorage.getItem('accessToken') || null;
let username = localStorage.getItem('username') || null;

function setAuth(token, user) {
    accessToken = token;
    username = user;
    if (token) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('username', user);
    } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
    }
    updateAuthUI();
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const addBookmarkBtn = document.getElementById('add-bookmark-btn');
    const bookmarksSection = document.getElementById('bookmarks-section');

    if (accessToken) {
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            const greeting = document.getElementById('user-greeting');
            if (greeting) greeting.innerText = `Привет, ${username}!`;
        }
        if (addBookmarkBtn) addBookmarkBtn.style.display = '';
        if (bookmarksSection) bookmarksSection.style.display = '';
        
        // Независимо от наличия DOM-элемента — пробуем загрузить закладки
        fetchBookmarks();
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        if (addBookmarkBtn) addBookmarkBtn.style.display = 'none';
        if (bookmarksSection) bookmarksSection.style.display = 'none';
    }
}



function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = '';
}
function showLogin() {
    document.getElementById('login-form').style.display = '';
    document.getElementById('register-form').style.display = 'none';
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();  // 👈 здесь мы читаем тело ОДИН РАЗ

        if (res.ok) {
            setAuth(data.access, username);
            closeModal('loginModal'); // 👈 закрытие модального окна ПРИ УСПЕХЕ
        } else {
            alert(data.detail || 'Ошибка входа! Проверьте логин и пароль.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Ошибка при попытке входа. Попробуйте позже.');
    }
}

async function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const password2 = document.getElementById('register-password2').value;
    
    if (password !== password2) {
        alert('Пароли не совпадают!');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            alert('Регистрация успешна! Теперь войдите.');
            closeModal('registerModal');
            // Clear form
            document.getElementById('register-username').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-password2').value = '';
            // Open login modal
            openModal('loginModal');
        } else {
            alert(data.detail || 'Ошибка регистрации. Проверьте введенные данные.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Ошибка при попытке регистрации. Попробуйте позже.');
    }
}

function logout() {
    setAuth(null, null);
    updateAuthUI();
}

// --- BOOKMARKS ---
async function addBookmark() {
    if (!accessToken) return;
    let cityIndex = document.getElementById('city-list').value;
    let response = await fetch(`${API_BASE}/api/cities/${document.getElementById('city-input').value}/`);
    let data = await response.json();
    let city = data[cityIndex];
    if (!city) return alert('Сначала выберите город!');
    
    // Сохраняем название города как одну строку
    const cityName = `${city.name}, ${city.country}`;
    
    const res = await fetch(`${API_BASE}/api/bookmarks/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({ 
            name: cityName,
            lat: city.lat, 
            lon: city.lon 
        })
    });
    if (res.ok) {
        alert('Город добавлен в закладки!');
        fetchBookmarks();
    } else {
        alert('Ошибка добавления в закладки!');
    }
}

async function fetchBookmarks() {
    if (!accessToken) return;
    const res = await fetch(`${API_BASE}/api/bookmarks/`, {
        headers: { 'Authorization': 'Bearer ' + accessToken }
    });
    if (res.ok) {
        const data = await res.json();
        renderBookmarks(data);
    } else {
        document.getElementById('bookmarks-list').innerHTML = '<li>Ошибка загрузки закладок</li>';
    }
}

function renderBookmarks(bookmarks) {
    const list = document.getElementById('bookmarks-list');
    list.innerHTML = '';
    if (bookmarks.length === 0) {
        list.innerHTML = '<li>Нет закладок</li>';
        return;
    }
    bookmarks.forEach(bm => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><b>${bm.name}</b></span>
            <div class="bookmark-buttons">
                <button onclick="showBookmarkData(${bm.lat}, ${bm.lon}, '${bm.name}')">Показать</button>
                <button onclick="deleteBookmark(${bm.id})">Удалить</button>
            </div>
        `;
        list.appendChild(li);
    });
}

async function deleteBookmark(id) {
    if (!accessToken) return;
    const res = await fetch(`${API_BASE}/api/bookmarks/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + accessToken }
    });
    if (res.ok) {
        fetchBookmarks();
    } else {
        alert('Ошибка удаления!');
    }
}

async function showBookmarkData(lat, lon, cityName) {
    try {
        let airQualityResponse = await fetch(`${API_BASE}/api/air_quality/${lat}/${lon}/`);
        let airQualityData = await airQualityResponse.json();
        // Передаем название города как есть, без разделения
        displayData({ name: cityName, country: '', lat, lon }, airQualityData);
        // Закрываем модальное окно закладок
        closeModal('bookmarksModal');
    } catch (error) {
        console.error('Error fetching bookmark data:', error);
        alert('Ошибка при получении данных. Попробуйте позже.');
    }
}

// --- CITY SEARCH & AIR QUALITY (как было) ---
async function fetchCities() {
    let cityName = document.getElementById("city-input").value;
    let response = await fetch(`${API_BASE}/api/cities/${cityName}/`);
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
    let response = await fetch(`${API_BASE}/api/cities/${document.getElementById("city-input").value}/`);
    let data = await response.json();
    let city = data[cityIndex];

    let airQualityResponse = await fetch(`${API_BASE}/api/air_quality/${city.lat}/${city.lon}/`);
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

    // Функция для проверки значения и замены на "Нет данных" если undefined/null
    function getValue(value) {
        return value !== undefined && value !== null ? value : "Нет данных";
    }

    function renderItem(label, value, key = null) {
        // Обрабатываем значение
        const displayValue = getValue(value);
        // Обрабатываем рекомендацию
        const recommendation = key && rec[key] ? `<p class="recommendation">${rec[key]}</p>` : "";
        return `<div class="data-item"><strong>${label}:</strong> ${displayValue} ${recommendation}</div>`;
    }

    let resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <div class="data-section">
            <h2>🌍 Город: ${city_value.name}, ${city_value.country}</h2>
        </div>

        <div class="data-section">
            <h2>💨 Качество воздуха</h2>
            ${renderItem("AQI (Индекс качества воздуха)", data.air_quality.list[0].main.aqi, "aqi")}
            ${renderItem("CO (Угарный газ)", air.co ? air.co + " µg/m³" : "Нет данных", "co")}
            ${renderItem("NO₂ (Диоксид азота)", air.no2 ? air.no2 + " µg/m³" : "Нет данных", "no2")}
            ${renderItem("O₃ (Озон)", air.o3 ? air.o3 + " µg/m³" : "Нет данных", "o3")}
            ${renderItem("SO₂ (Диоксид серы)", air.so2 ? air.so2 + " µg/m³" : "Нет данных", "so2")}
            ${renderItem("PM2.5 (Тонкие частицы)", air.pm2_5 ? air.pm2_5 + " µg/m³" : "Нет данных", "pm2_5")}
            ${renderItem("PM10 (Грубые частицы)", air.pm10 ? air.pm10 + " µg/m³" : "Нет данных", "pm10")}
            ${renderItem("NH₃ (Аммиак)", air.nh3 ? air.nh3 + " µg/m³" : "Нет данных", "nh3")}
        </div>

        <div class="data-section">
            <h2>⛅️ Погода</h2>
            ${renderItem("Температура", weather.temp ? weather.temp + "°C" : "Нет данных", "temp")}
            ${renderItem("Ощущается как", weather.feels_like ? weather.feels_like + "°C" : "Нет данных", "feels_like")}
            ${renderItem("Давление", weather.pressure ? weather.pressure + " hPa" : "Нет данных", "pressure")}
            ${renderItem("Влажность", weather.humidity ? weather.humidity + "%" : "Нет данных", "humidity")}
        </div>

        <div class="data-section">
            <h2>🌬 Ветер</h2>
            ${renderItem("Скорость ветра", wind.speed ? wind.speed + " м/с" : "Нет данных", "wind_speed")}
            ${renderItem("Порывы ветра", wind.gust ? wind.gust + " м/с" : "Нет данных", "wind_gust")}
        </div>

        <div class="data-section">
            <h2>☁️ Облачность</h2>
            ${renderItem("Облачность", clouds.all ? clouds.all + "%" : "Нет данных")}
        </div>

        <div class="data-section">
            <h2>👀 Видимость</h2>
            ${renderItem("Видимость", visibility ? visibility + " м" : "Нет данных", "visibility")}
        </div>

        <div class="data-section">
            <h2>🌦 Погодные условия</h2>
            ${renderItem("Описание", weather_desc ? weather_desc : "Нет данных", "weather_desc")}
        </div>

        <div class="data-section">
            <h2>🌅 Солнце</h2>
            ${renderItem("Восход", sys.sunrise ? new Date(sys.sunrise * 1000).toLocaleTimeString() : "Нет данных")}
            ${renderItem("Закат", sys.sunset ? new Date(sys.sunset * 1000).toLocaleTimeString() : "Нет данных")}
        </div>
    `;
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Очищаем поля формы при закрытии
        if (id === 'loginModal') {
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
        } else if (id === 'registerModal') {
            document.getElementById('register-username').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-password2').value = '';
        }
    }
}

// Закрытие при клике вне модального окна
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}
  
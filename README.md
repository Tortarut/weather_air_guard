
# Weather Air Guard

Проект выполнили студенты группы ИКБО-11-23: Сафаров А.А. и Комков Д.Д.

**Weather Air Guard** — это веб-приложение для мониторинга и отображения погодных условий и качества воздуха в реальном времени. Проект построен на основе Django REST Framework (DRF) и использует HTML/CSS/JS для фронтенда. Все компоненты контейнеризированы с использованием Docker и управляются через Docker Compose.

## 🔧 Стек технологий

- **Backend:** Django REST Framework (DRF)
- **Frontend:** HTML, CSS, JavaScript
- **Контейнеризация:** Docker, Docker Compose

## 📦 Структура проекта

- `backend/` — исходный код на DRF (модели, сериализаторы, представления, urls)
- `frontend/` — HTML/CSS/JS файлы
- `compose.yaml` — файл конфигурации Docker Compose
- `Dockerfile` — описание контейнеров

## 🚀 Как запустить проект

Убедитесь, что у вас установлены **Docker** и **Docker Compose**.

### 1. Сборка контейнеров

```bash
docker compose build
```

### 2. Запуск контейнеров

```bash
docker compose up
```

### 3. Остановка контейнеров

```bash
docker compose down
```

## 🌐 Доступ к приложению

После запуска приложение будет доступно по адресу:

```
http://localhost:5500/
```
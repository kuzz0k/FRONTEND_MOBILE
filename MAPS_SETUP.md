# Настройка Google Maps для React Native

## Шаги для получения API ключей:

### 1. Создание проекта в Google Cloud Console
1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Maps API для вашего проекта

### 2. Получение API ключей
1. Перейдите в раздел "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "API Key"
3. Создайте два ключа:
   - Один для Android (с ограничением на Android apps)
   - Один для iOS (с ограничением на iOS apps)

### 3. Настройка API ключей
1. Для Android ключа:
   - Добавьте ограничение "Android apps"
   - Добавьте package name вашего приложения
   - Добавьте SHA-1 сертификат отпечаток

2. Для iOS ключа:
   - Добавьте ограничение "iOS apps"
   - Добавьте Bundle ID вашего приложения

### 4. Обновление app.json
Замените `YOUR_ANDROID_API_KEY` и `YOUR_IOS_API_KEY` в файле `app.json` на ваши реальные ключи.

### 5. Включите необходимые API
В Google Cloud Console убедитесь, что включены:
- Maps SDK for Android
- Maps SDK for iOS
- Places API (если планируете использовать)

## Для тестирования без API ключей
Карта будет работать в режиме разработки, но в продакшене потребуются настоящие API ключи.

## Альтернатива - OpenStreetMap
Если не хотите использовать Google Maps, можно заменить на OpenStreetMap, который не требует API ключей.

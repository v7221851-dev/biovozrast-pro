# Настройка endpoint для загрузки изображений

## Текущая ситуация

Изображения генерируются на клиенте в base64, но для автоматического подтягивания в соцсетях нужен публичный URL.

## Решение: Установить PHP или настроить Python обработчик

### Вариант 1: Установить PHP-FPM (рекомендуется)

```bash
# На сервере
apt update
apt install php-fpm php-cli
systemctl enable php8.1-fpm
systemctl start php8.1-fpm

# Обновить Nginx конфигурацию для использования PHP-FPM
```

### Вариант 2: Настроить Python обработчик

Установить `fcgiwrap` для работы Python CGI скриптов:

```bash
# На сервере
apt install fcgiwrap
systemctl enable fcgiwrap
systemctl start fcgiwrap
```

### Вариант 3: Использовать простой Node.js сервер (если Node.js установлен)

Создать простой Express сервер для обработки загрузок.

## Текущий статус

- ✅ Python скрипт создан: `/var/www/html/app/api/upload-share-image.py`
- ✅ Директория для изображений создана: `/var/www/html/app/share-images/`
- ⚠️ Нужно установить PHP-FPM или настроить fcgiwrap для работы endpoint

## Проверка работы

После настройки endpoint можно протестировать:

```bash
curl -X POST https://app.medicinetest.ru/api/upload-share-image \
  -F "image=@test.png" \
  -F "age=30" \
  -F "bioAge=25.5"
```

Должен вернуть JSON с полем `url` содержащим публичный URL изображения.

# Настройка серверного endpoint для загрузки изображений

## Проблема

Сейчас изображения генерируются на клиенте в base64, но соцсети не всегда могут получить доступ к base64 в мета-тегах. Для автоматического подтягивания изображения нужен публичный URL.

## Решение 1: Endpoint для загрузки изображений (рекомендуется)

### На сервере создать PHP скрипт `/var/www/html/app/api/upload-share-image.php`:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No image file']);
    exit;
}

$file = $_FILES['image'];
$uploadDir = '/var/www/html/app/share-images/';
$allowedTypes = ['image/png', 'image/jpeg'];

// Создаем директорию, если не существует
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Генерируем уникальное имя файла
$fileName = 'share_' . time() . '_' . uniqid() . '.png';
$filePath = $uploadDir . $fileName;

// Проверяем тип файла
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type']);
    exit;
}

// Перемещаем файл
if (move_uploaded_file($file['tmp_name'], $filePath)) {
    $publicUrl = 'https://app.medicinetest.ru/share-images/' . $fileName;
    echo json_encode(['url' => $publicUrl]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to upload file']);
}
?>
```

### Настроить Nginx для обработки `/api/upload-share-image`:

Добавить в конфигурацию `app-medicinetest`:

```nginx
location /api/upload-share-image {
    try_files $uri =404;
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root/api/upload-share-image.php;
    include fastcgi_params;
}

location /share-images/ {
    alias /var/www/html/app/share-images/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## Решение 2: Серверная генерация изображений (альтернатива)

Создать endpoint `/api/share-image` который генерирует изображение по параметрам из URL.

### Преимущества:
- Не нужно хранить файлы на сервере
- Изображение генерируется динамически
- Меньше места на диске

### Недостатки:
- Требует серверную библиотеку для генерации изображений (GD, ImageMagick)
- Может быть медленнее при большом количестве запросов

## Рекомендация

Использовать **Решение 1** (загрузка изображений), так как:
- Проще в реализации
- Изображения кешируются браузером
- Меньше нагрузка на сервер при генерации

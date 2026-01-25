#!/bin/bash
# Простой скрипт для загрузки изображений через Nginx upload module
# Альтернативный вариант без PHP/Python

# Этот скрипт можно использовать как fallback
# Основной вариант - использовать Python скрипт или установить PHP

echo "Content-Type: application/json"
echo ""

# Простая заглушка - в реальности нужен обработчик multipart/form-data
echo '{"error": "Upload handler not configured. Please install PHP or configure Python handler"}'

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Серверный скрипт для загрузки изображений для шаринга
Использование: запустить через fcgiwrap (CGI)
"""

import os
import sys
import json
import cgi
import cgitb
import hashlib
from datetime import datetime
from pathlib import Path

# Включаем обработку ошибок для CGI
cgitb.enable()

# Настройки
UPLOAD_DIR = Path('/var/www/html/app/share-images')
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def main():
    # Устанавливаем заголовки
    print("Content-Type: application/json; charset=utf-8")
    print("")
    
    if os.environ.get('REQUEST_METHOD') != 'POST':
        print(json.dumps({'error': 'Method not allowed'}))
        sys.exit(0)
    
    # Создаем директорию, если не существует
    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        UPLOAD_DIR.chmod(0o755)
    except Exception as e:
        print(json.dumps({'error': f'Cannot create upload directory: {str(e)}'}))
        sys.exit(0)
    
    try:
        # Парсим multipart/form-data
        form = cgi.FieldStorage()
        
        if 'image' not in form:
            print(json.dumps({'error': 'No image file'}))
            sys.exit(0)
        
        file_item = form['image']
        
        if not hasattr(file_item, 'filename') or not file_item.filename:
            print(json.dumps({'error': 'No file uploaded'}))
            sys.exit(0)
        
        # Читаем файл
        file_data = file_item.file.read()
        
        # Проверяем размер
        if len(file_data) > MAX_FILE_SIZE:
            print(json.dumps({'error': 'File too large'}))
            sys.exit(0)
        
        # Генерируем уникальное имя файла
        age = form.getvalue('age', '0')
        bio_age = form.getvalue('bioAge', '0')
        hash_str = hashlib.md5(f"{age}_{bio_age}_{datetime.now().timestamp()}".encode()).hexdigest()[:12]
        filename = f'share_{hash_str}.png'
        filepath = UPLOAD_DIR / filename
        
        # Сохраняем файл
        with open(filepath, 'wb') as f:
            f.write(file_data)
        
        # Устанавливаем права
        os.chmod(filepath, 0o644)
        
        # Возвращаем публичный URL
        protocol = 'https' if os.environ.get('HTTPS') == 'on' or os.environ.get('HTTP_X_FORWARDED_PROTO') == 'https' else 'http'
        host = os.environ.get('HTTP_HOST', 'app.medicinetest.ru')
        public_url = f"{protocol}://{host}/share-images/{filename}"
        
        print(json.dumps({'url': public_url}))
        
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(json.dumps({'error': f'Server error: {str(e)}'}))
        sys.exit(0)

if __name__ == '__main__':
    main()

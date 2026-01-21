# Настройка отправки отзывов в Google Sheets

## Шаг 1: Создание Google Sheet

1. Откройте [Google Sheets](https://sheets.google.com)
2. Создайте новый лист
3. В первой строке добавьте заголовки:
   - A1: `Дата и время`
   - B1: `Оценка`
   - C1: `Отзыв`
   - D1: `Возраст`
   - E1: `Пол`
   - F1: `Биологический возраст`

## Шаг 2: Создание Google Apps Script

1. В Google Sheet: **Расширения** → **Apps Script**
2. Удалите весь код по умолчанию
3. Вставьте следующий код:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    const row = [
      new Date().toLocaleString('ru-RU'),
      data.rating || '',
      data.feedback || '',
      data.age || '',
      data.gender || '',
      data.biologicalAge || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Сохраните проект (Ctrl+S или Cmd+S)
5. Нажмите **Развернуть** → **Новое развертывание**
6. Выберите тип: **Веб-приложение**
7. Настройки:
   - **Описание**: "Feedback Form Handler"
   - **Выполнять от имени**: "Меня"
   - **У кого есть доступ**: "Все"
8. Нажмите **Развернуть**
9. Скопируйте **URL веб-приложения**

## Шаг 3: Настройка в React приложении

1. Создайте файл `.env` в папке `frontend/`:
```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

2. Или установите переменную окружения при деплое на Vercel/Netlify

## Альтернативный способ (без переменных окружения)

Можно также вставить URL напрямую в код `googleSheets.ts`:

```typescript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## Тестирование

После настройки отзывы будут автоматически отправляться в Google Sheet при заполнении формы.

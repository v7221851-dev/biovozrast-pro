// Утилита для отправки отзывов в Google Sheets

interface FeedbackData {
  rating: number;
  feedback: string;
  timestamp: string;
  age?: number;
  gender?: string;
  biologicalAge?: number;
}

/**
 * Отправка отзыва в Google Sheets через Google Apps Script Web App
 * 
 * Инструкция по настройке:
 * 1. Создайте Google Sheet
 * 2. Создайте Google Apps Script проект
 * 3. Вставьте код из GOOGLE_SHEETS_SETUP.md
 * 4. Разверните как Web App
 * 5. Скопируйте URL и вставьте в переменную GOOGLE_SCRIPT_URL ниже
 * 
 * Или создайте файл .env в папке frontend/ с:
 * VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
 */
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

export async function sendFeedbackToGoogleSheets(data: FeedbackData): Promise<boolean> {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('Google Script URL не настроен. Отзыв не будет отправлен.');
    return false;
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script требует no-cors для работы из браузера
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // С no-cors мы не получим ответ, но запрос отправится
    return true;
  } catch (error) {
    console.error('Ошибка при отправке отзыва:', error);
    return false;
  }
}

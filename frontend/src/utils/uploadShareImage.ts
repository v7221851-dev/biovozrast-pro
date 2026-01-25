import type { TestData, Results } from '../types';

/**
 * Загружает изображение на сервер и возвращает публичный URL
 * Для работы нужен серверный endpoint /api/upload-share-image
 */
/**
 * Загружает изображение на сервер и возвращает публичный URL
 * Для работы нужен серверный endpoint /api/upload-share-image
 * 
 * ВАЖНО: Для автоматического подтягивания изображения в соцсетях
 * изображение должно быть доступно по публичному URL.
 * 
 * Если серверный endpoint не настроен, функция вернет base64 (fallback),
 * но соцсети могут не подтянуть такое изображение автоматически.
 */
export async function uploadShareImageToServer(
  imageDataUrl: string,
  testData: TestData,
  results: Results
): Promise<string> {
  try {
    // Конвертируем base64 в Blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    // Создаем FormData
    const formData = new FormData();
    formData.append('image', blob, `bioage_${testData.age}_${results.integral.toFixed(1)}.png`);
    formData.append('age', testData.age.toString());
    formData.append('bioAge', results.integral.toFixed(1));
    formData.append('difference', results.difference.toFixed(1));

    // Загружаем на сервер
    const apiUrl = import.meta.env.PROD 
      ? 'https://app.medicinetest.ru/api/upload-share-image'
      : '/api/upload-share-image';
    
    const uploadResponse = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.warn('Ошибка загрузки изображения на сервер:', errorText);
      throw new Error('Ошибка загрузки изображения на сервер');
    }

    const data = await uploadResponse.json();
    
    // Проверяем, что получили валидный URL
    if (data.url && data.url.startsWith('http')) {
      return data.url; // Возвращаем публичный URL
    } else {
      throw new Error('Неверный формат ответа от сервера');
    }
  } catch (error) {
    console.warn('Не удалось загрузить изображение на сервер, используем base64 (fallback):', error);
    // Fallback: возвращаем base64, если загрузка не удалась
    // ВАЖНО: Соцсети могут не подтянуть base64 автоматически
    return imageDataUrl;
  }
}

/**
 * Альтернативный вариант: использовать серверный endpoint для генерации изображения
 * Сервер генерирует изображение по параметрам из URL
 */
export function generateShareImageUrl(testData: TestData, results: Results): string {
  const params = new URLSearchParams({
    age: testData.age.toString(),
    bioAge: results.integral.toFixed(1),
    difference: results.difference.toFixed(1),
    gender: testData.gender,
  });
  
  return `${window.location.origin}/api/share-image?${params.toString()}`;
}

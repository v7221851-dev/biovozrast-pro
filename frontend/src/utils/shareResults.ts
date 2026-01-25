import type { TestData, Results } from '../types';

/**
 * Генерирует текст для шаринга результатов
 */
export function generateShareText(testData: TestData, results: Results): string {
  const diff = results.difference;
  const age = testData.age;
  const bioAge = results.integral.toFixed(1);
  
  const baseText = `Мой биологический возраст - а у тебя?\n\nПройди тест и сравни разницу между реальным возрастом и паспортным!\n\nМой результат: ${bioAge} лет (паспортный: ${age} лет)`;
  
  if (diff < 0) {
    return `${baseText}\n\nЯ моложе своего возраста на ${Math.abs(diff).toFixed(1)} лет! ✨`;
  } else if (diff === 0) {
    return `${baseText}\n\nМой биологический возраст соответствует паспортному!`;
  } else {
    return `${baseText}\n\nРазница: ${diff.toFixed(1)} лет`;
  }
}

/**
 * Генерирует URL для шаринга в VK
 */
export function shareToVK(testData: TestData, results: Results, _imageUrl?: string): void {
  const text = generateShareText(testData, results);
  // VK автоматически подтянет изображение из og:image мета-тега
  const shareUrl = window.location.href.includes('localhost') 
    ? 'https://app.medicinetest.ru' 
    : window.location.href;
  const url = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Мой биологический возраст - а у тебя?')}&description=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=600,height=400');
}

/**
 * Генерирует URL для шаринга в Telegram
 */
export function shareToTelegram(testData: TestData, results: Results, _imageUrl?: string): void {
  const text = generateShareText(testData, results);
  // Telegram автоматически подтянет изображение из og:image мета-тега
  const shareUrl = window.location.href.includes('localhost') 
    ? 'https://app.medicinetest.ru' 
    : window.location.href;
  const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=600,height=400');
}

/**
 * Генерирует URL для шаринга в WhatsApp
 */
export function shareToWhatsApp(testData: TestData, results: Results, _imageUrl?: string): void {
  const text = generateShareText(testData, results);
  // WhatsApp автоматически подтянет изображение из og:image мета-тега
  const shareUrl = window.location.href.includes('localhost') 
    ? 'https://app.medicinetest.ru' 
    : window.location.href;
  const url = `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + shareUrl)}`;
  window.open(url, '_blank');
}

/**
 * Генерирует URL для шаринга в TikTok
 * TikTok не имеет прямого API для шаринга, поэтому используем копирование текста
 */
export async function shareToTikTok(testData: TestData, results: Results, _imageUrl?: string): Promise<void> {
  const text = generateShareText(testData, results);
  try {
    // Копируем текст в буфер обмена
    await copyToClipboard(testData, results);
    // Пытаемся открыть TikTok (работает на мобильных устройствах)
    const tiktokUrl = 'https://www.tiktok.com/upload';
    window.open(tiktokUrl, '_blank');
    // Показываем уведомление
    alert('Текст скопирован в буфер обмена! Добавьте скачанное изображение и текст при создании видео.');
  } catch (error) {
    // Fallback: просто открываем TikTok
    window.open('https://www.tiktok.com/upload', '_blank');
    alert('Откройте TikTok и вставьте текст вручную:\n\n' + text);
  }
}

/**
 * Копирует текст в буфер обмена
 */
export async function copyToClipboard(testData: TestData, results: Results): Promise<void> {
  const text = generateShareText(testData, results);
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
    document.body.removeChild(textArea);
  }
}

/**
 * Генерирует изображение баннера для шаринга (используя Canvas API)
 */
export async function generateShareImage(testData: TestData, results: Results): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630; // Стандартный размер для Open Graph
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Не удалось создать контекст canvas'));
      return;
    }

    // Фон - градиент
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3B46EE');
    gradient.addColorStop(1, '#5B66F0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Заголовок - более привлекательный
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Мой биологический возраст', canvas.width / 2, 100);
    ctx.font = '36px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('а у тебя?', canvas.width / 2, 150);

    // Основной результат - крупнее и заметнее
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 140px Arial, sans-serif';
    ctx.fillText(`${results.integral.toFixed(1)}`, canvas.width / 2, 280);
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.fillText('лет', canvas.width / 2, 320);

    // Паспортный возраст
    ctx.font = '32px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(`Паспортный: ${testData.age} лет`, canvas.width / 2, 370);

    // Разница - с эмодзи и цветом
    const diff = results.difference;
    if (diff < 0) {
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 52px Arial, sans-serif';
      ctx.fillText(`✨ Моложе на ${Math.abs(diff).toFixed(1)} лет! ✨`, canvas.width / 2, 440);
    } else if (diff === 0) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 52px Arial, sans-serif';
      ctx.fillText('Соответствует паспортному', canvas.width / 2, 440);
    } else {
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 52px Arial, sans-serif';
      ctx.fillText(`Разница: ${diff.toFixed(1)} лет`, canvas.width / 2, 440);
    }

    // Призыв к действию
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText('Пройди тест и сравни!', canvas.width / 2, 500);

    // Подпись внизу
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText('app.medicinetest.ru', canvas.width / 2, 580);

    // Конвертируем в base64
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      } else {
        reject(new Error('Не удалось создать изображение'));
      }
    }, 'image/png');
  });
}

import type { TestData, Results } from '../types';

/**
 * Обновляет Open Graph мета-теги для автоматического подтягивания изображения при шаринге
 */
export function updateMetaTagsForSharing(testData: TestData, results: Results, imageUrl: string): void {
  const diff = results.difference;
  const age = testData.age;
  const bioAge = results.integral.toFixed(1);
  
  // Генерируем описание для превью
  let description = `Мой биологический возраст: ${bioAge} лет (паспортный: ${age} лет)`;
  if (diff < 0) {
    description += `. Я моложе своего возраста на ${Math.abs(diff).toFixed(1)} лет! ✨`;
  } else if (diff === 0) {
    description += `. Мой биологический возраст соответствует паспортному!`;
  } else {
    description += `. Разница: ${diff.toFixed(1)} лет`;
  }
  description += ` Пройди тест и сравни разницу между реальным возрастом и паспортным!`;

  // Функция для обновления или создания мета-тега
  const setMetaTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // Обновляем Open Graph теги
  setMetaTag('og:title', 'Мой биологический возраст - а у тебя?');
  setMetaTag('og:description', description);
  setMetaTag('og:image', imageUrl);
  setMetaTag('og:image:width', '1200');
  setMetaTag('og:image:height', '630');
  setMetaTag('og:image:type', 'image/png');
  setMetaTag('og:url', window.location.href);
  setMetaTag('og:type', 'website');

  // Twitter Card теги (для совместимости)
  const setTwitterTag = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="twitter:${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', `twitter:${name}`);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  setTwitterTag('card', 'summary_large_image');
  setTwitterTag('title', 'Мой биологический возраст - а у тебя?');
  setTwitterTag('description', description);
  setTwitterTag('image', imageUrl);
}

import { useState, useEffect } from 'react';
import { TagIcon, ChatBubbleLeftRightIcon, ArrowPathIcon, ClipboardDocumentListIcon, SparklesIcon, CheckCircleIcon, ChartBarIcon, ExclamationTriangleIcon, ArrowDownTrayIcon, ShareIcon, ClipboardIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { ResultsGauge } from '../ResultsGauge';
import type { Results, TestData } from '../../types';
import { getResultDescription } from '../../utils/resultDescription';
import { sendFeedbackToGoogleSheets } from '../../utils/googleSheets';
import { shareToVK, shareToTelegram, shareToWhatsApp, shareToTikTok, copyToClipboard, generateShareImage } from '../../utils/shareResults';
import { updateMetaTagsForSharing } from '../../utils/updateMetaTags';
import { analyzePhenoAgeDeviations, analyzeVoitenkoDeviations } from '../../utils/analyzeDeviations';
import { uploadShareImageToServer } from '../../utils/uploadShareImage';
// generatePDFReport импортируется динамически для избежания проблем с загрузкой jsPDF

interface Step4ResultsProps {
  testData: TestData;
  results: Results;
  onRestart: () => void;
}

export const Step4Results: React.FC<Step4ResultsProps> = ({ testData, results, onRestart }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [showPhenoDeviations, setShowPhenoDeviations] = useState(false);
  const [showVoitenkoDeviations, setShowVoitenkoDeviations] = useState(false);

  const description = getResultDescription(results, testData.age);

  // Генерируем изображение для шаринга при монтировании компонента
  useEffect(() => {
    generateShareImage(testData, results)
      .then(async (imageDataUrl) => {
        // Пытаемся загрузить изображение на сервер для получения публичного URL
        try {
          const publicUrl = await uploadShareImageToServer(imageDataUrl, testData, results);
          setShareImageUrl(publicUrl);
          // Обновляем мета-теги с публичным URL
          updateMetaTagsForSharing(testData, results, publicUrl);
        } catch (error) {
          // Если загрузка не удалась, используем base64 (fallback)
          console.warn('Не удалось загрузить изображение на сервер, используем base64:', error);
          setShareImageUrl(imageDataUrl);
          updateMetaTagsForSharing(testData, results, imageDataUrl);
        }
      })
      .catch((error) => {
        console.error('Ошибка генерации изображения для шаринга:', error);
      });

    // Сбрасываем мета-теги при размонтировании
    return () => {
      // Можно добавить сброс, если нужно
    };
  }, [testData, results]);

  const bgColorClass = {
    success: 'bg-green-50 border-green-500',
    info: 'bg-blue-50 border-blue-500',
    warning: 'bg-orange-50 border-orange-500',
  }[description.type];

  const textColorClass = {
    success: 'text-green-800',
    info: 'text-blue-800',
    warning: 'text-orange-800',
  }[description.type];

  const handleSubmitFeedback = async () => {
    try {
      await sendFeedbackToGoogleSheets({
        rating,
        feedback,
        timestamp: new Date().toISOString(),
        age: testData.age,
        gender: testData.gender,
        biologicalAge: results.integral,
      });

      alert('Спасибо за ваш отзыв!');
      setShowFeedback(false);
      setFeedback('');
      setRating(0);
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      alert('Произошла ошибка при отправке отзыва. Попробуйте позже.');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="step-heading">
        <span className="flex items-center justify-center gap-3">
          <TagIcon className="w-8 h-8 text-primary" />
          Шаг 4: Ваши результаты
        </span>
      </h2>

      {/* Спидометр */}
      <ResultsGauge value={results.integral} passportAge={testData.age} />

      {/* Описание результатов */}
      <div className={`${bgColorClass} border-l-4 p-6 rounded-lg flex items-start gap-4`}>
        {description.iconName === 'sparkles' && <SparklesIcon className="w-6 h-6 flex-shrink-0 mt-1" />}
        {description.iconName === 'check' && <CheckCircleIcon className="w-6 h-6 flex-shrink-0 mt-1" />}
        {description.iconName === 'chart' && <ChartBarIcon className="w-6 h-6 flex-shrink-0 mt-1" />}
        {description.iconName === 'warning' && <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0 mt-1" />}
        <p className={`${textColorClass} leading-relaxed text-base`}>
          {description.text}
        </p>
      </div>

      {/* Детальная информация */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-6 h-6 text-primary" />
          Детальная информация о методах оценки
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">PhenoAge (Yale University)</h4>
            <p className="text-base text-gray-600 mb-2">
              Оценка: <span className="font-semibold text-gray-800">{results.phenoAge.toFixed(1)} лет</span>
            </p>
            <p className="text-base text-gray-600 mb-2">
              Разница с паспортом: <span className="font-semibold text-gray-800">
                {(results.phenoAge - testData.age).toFixed(1)} лет
              </span>
            </p>
            <p className="text-base text-gray-700 mb-3 leading-relaxed">
              Этот метод анализирует 9 маркеров крови для оценки риска смертности и темпов старения на клеточном уровне.
            </p>
            
            {/* Выпадающий список с отклонениями */}
            {(() => {
              const deviations = analyzePhenoAgeDeviations(testData);
              if (deviations.length > 0) {
                return (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <button
                      onClick={() => setShowPhenoDeviations(!showPhenoDeviations)}
                      className="w-full flex items-center justify-between text-base text-gray-700 hover:text-primary transition-colors"
                    >
                      <span className="font-medium">
                        Показатели вне нормы ({deviations.length})
                      </span>
                      {showPhenoDeviations ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </button>
                    {showPhenoDeviations && (
                      <div className="mt-3 space-y-3">
                        {deviations.map((dev, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${
                              dev.status === 'high'
                                ? 'bg-red-50 border-red-400'
                                : 'bg-orange-50 border-orange-400'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="font-semibold text-base text-gray-800">{dev.name}</span>
                              <span className="text-base text-gray-600 ml-2">
                                {dev.value} (норма: {dev.normal})
                              </span>
                            </div>
                            <p className="text-base text-gray-700 mt-1 leading-relaxed">{dev.impact}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-base text-green-600 flex items-center gap-1">
                    <CheckCircleIcon className="w-5 h-5" />
                    Все показатели в пределах нормы
                  </p>
                </div>
              );
            })()}
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">Метод Войтенко (НИИ Геронтологии)</h4>
            <p className="text-base text-gray-600 mb-2">
              Оценка: <span className="font-semibold text-gray-800">{results.voitenko.toFixed(1)} лет</span>
            </p>
            <p className="text-base text-gray-600 mb-2">
              Разница с паспортом: <span className="font-semibold text-gray-800">
                {(results.voitenko - testData.age).toFixed(1)} лет
              </span>
            </p>
            <p className="text-base text-gray-700 mb-3 leading-relaxed">
              Этот метод оценивает функциональные резервы сердечно-сосудистой системы и вестибулярного аппарата.
            </p>
            
            {/* Выпадающий список с отклонениями */}
            {(() => {
              const deviations = analyzeVoitenkoDeviations(testData);
              if (deviations.length > 0) {
                return (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <button
                      onClick={() => setShowVoitenkoDeviations(!showVoitenkoDeviations)}
                      className="w-full flex items-center justify-between text-base text-gray-700 hover:text-primary transition-colors"
                    >
                      <span className="font-medium">
                        Показатели вне нормы ({deviations.length})
                      </span>
                      {showVoitenkoDeviations ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </button>
                    {showVoitenkoDeviations && (
                      <div className="mt-3 space-y-3">
                        {deviations.map((dev, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${
                              dev.status === 'high'
                                ? 'bg-red-50 border-red-400'
                                : 'bg-orange-50 border-orange-400'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="font-semibold text-base text-gray-800">{dev.name}</span>
                              <span className="text-base text-gray-600 ml-2">
                                {dev.value} (норма: {dev.normal})
                              </span>
                            </div>
                            <p className="text-base text-gray-700 mt-1 leading-relaxed">{dev.impact}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-base text-green-600 flex items-center gap-1">
                    <CheckCircleIcon className="w-5 h-5" />
                    Все показатели в пределах нормы
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Блок шаринга результатов */}
      {!showFeedback && !showShare && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowShare(true)}
            className="quiz-button-action flex items-center gap-2"
          >
            <ShareIcon className="w-5 h-5" />
            Поделиться результатами
          </button>
        </div>
      )}

      {/* Панель шаринга */}
      {showShare && (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShareIcon className="w-6 h-6 text-primary" />
            Поделиться в социальных сетях
          </h3>

          <div className="flex justify-center items-center gap-4 mb-4 flex-wrap">
            <button
              onClick={() => shareToVK(testData, results, shareImageUrl || undefined)}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110"
              title="Поделиться в ВКонтакте"
            >
              <svg className="w-7 h-7 text-[#0077FF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.084-1.076-1.571 0-1.571 0s-.525.33-1.32.33c-1.32 0-2.64-1.056-2.64-3.36 0-2.304 1.32-3.36 2.64-3.36.795 0 1.32.33 1.32.33s.487-1.076 1.571 0c1.186 1.202 2.05 1.727 2.05 1.727s.33.165.33.495v1.32c0 .33-.165.495-.495.495z" />
              </svg>
            </button>

            <button
              onClick={() => shareToTelegram(testData, results, shareImageUrl || undefined)}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110"
              title="Поделиться в Telegram"
            >
              <svg className="w-7 h-7 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.276c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.12l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
            </button>

            <button
              onClick={() => shareToWhatsApp(testData, results)}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110"
              title="Поделиться в WhatsApp"
            >
              <svg className="w-7 h-7 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </button>

            <button
              onClick={() => shareToTikTok(testData, results, shareImageUrl || undefined)}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110"
              title="Поделиться в TikTok"
            >
              <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* Кнопка скачивания изображения */}
            <button
              onClick={async () => {
                setGeneratingImage(true);
                try {
                  const imageDataUrl = await generateShareImage(testData, results);
                  // Создаем ссылку для скачивания
                  const link = document.createElement('a');
                  link.href = imageDataUrl;
                  link.download = `bioage_${testData.age}_${results.integral.toFixed(1)}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  alert('Изображение скачано! Добавьте его к посту в социальных сетях вместе с текстом.');
                } catch (error) {
                  console.error('Ошибка генерации изображения:', error);
                  alert('Не удалось создать изображение. Попробуйте позже.');
                } finally {
                  setGeneratingImage(false);
                }
              }}
              disabled={generatingImage}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-primary bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {generatingImage ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Скачать изображение для поста
                </>
              )}
            </button>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    await copyToClipboard(testData, results);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  } catch (error) {
                    console.error('Ошибка копирования:', error);
                    alert('Не удалось скопировать текст');
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${copySuccess
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <ClipboardIcon className="w-5 h-5" />
                {copySuccess ? 'Скопировано!' : 'Копировать текст'}
              </button>
              <button
                onClick={() => setShowShare(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Основные действия: Компактное расположение кнопок */}
      {!showFeedback && !showShare && (
        <div className="flex flex-col items-center gap-3">
          {/* Первая строка: Скачать отчет и Оставить отзыв */}
          <div className="flex justify-center gap-3 w-full max-w-md">
            <button
              onClick={async () => {
                try {
                  // Динамический импорт для избежания проблем с загрузкой
                  const { generatePDFReport } = await import('../../utils/generateReport');
                  generatePDFReport(testData, results);
                } catch (error) {
                  console.error('Ошибка при скачивании отчета:', error);
                  alert('Произошла ошибка при генерации отчета. Попробуйте обновить страницу.');
                }
              }}
              className="flex-1 quiz-button-action flex items-center justify-center gap-2"
              title="Скачать PDF отчет"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Скачать отчет</span>
              <span className="sm:hidden">Отчет</span>
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              className="flex-1 quiz-button-action flex items-center justify-center gap-2"
              title="Оставить отзыв"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Оставить отзыв</span>
              <span className="sm:hidden">Отзыв</span>
            </button>
          </div>
        </div>
      )}

      {/* Текст со ссылкой для повторного прохождения теста */}
      {!showFeedback && !showShare && (
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onRestart}
            className="text-primary hover:text-primary/80 underline text-2xl transition-colors"
          >
            Пройти тест заново
          </button>
        </div>
      )}

      {showFeedback && (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />
            Ваш отзыв
          </h3>
          <p className="text-base text-gray-600 mb-4">
            Пожалуйста, оцените полезность нашего сервиса
          </p>

          <div className="mb-4">
            <label className="block text-base font-semibold mb-2">Оценка (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-base font-semibold mb-2">Ваш комментарий</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Поделитесь своими впечатлениями..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg 
                       focus:border-primary focus:ring-4 focus:ring-primary/10 
                       transition-all outline-none min-h-[100px]"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmitFeedback}
              className="quiz-button-action"
              disabled={rating === 0}
            >
              Отправить
            </button>
            <button
              onClick={() => {
                setShowFeedback(false);
                setFeedback('');
                setRating(0);
              }}
              className="px-6 py-3 border-2 border-gray-300 rounded-[30px] hover:bg-gray-100 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

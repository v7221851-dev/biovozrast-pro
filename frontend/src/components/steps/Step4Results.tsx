import { useState } from 'react';
import { TagIcon, ChatBubbleLeftRightIcon, ArrowPathIcon, ClipboardDocumentListIcon, SparklesIcon, CheckCircleIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ResultsGauge } from '../ResultsGauge';
import type { Results, TestData } from '../../types';
import { getResultDescription } from '../../utils/resultDescription';
import { sendFeedbackToGoogleSheets } from '../../utils/googleSheets';

interface Step4ResultsProps {
  testData: TestData;
  results: Results;
  onRestart: () => void;
}

export const Step4Results: React.FC<Step4ResultsProps> = ({ testData, results, onRestart }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const description = getResultDescription(results, testData.age);

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
            <p className="text-sm text-gray-500">
              Этот метод анализирует 9 маркеров крови для оценки риска смертности и темпов старения на клеточном уровне.
            </p>
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
            <p className="text-sm text-gray-500">
              Этот метод оценивает функциональные резервы сердечно-сосудистой системы и вестибулярного аппарата.
            </p>
          </div>
        </div>
      </div>

      {/* Форма отзывов */}
      {!showFeedback ? (
        <div className="flex justify-center">
          <button
            onClick={() => setShowFeedback(true)}
            className="quiz-button-action flex items-center gap-2"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Оставить отзыв
          </button>
        </div>
      ) : (
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

      {/* Кнопка перезапуска */}
      <div className="flex justify-center pt-8 border-t border-gray-200">
        <button
          onClick={onRestart}
          className="quiz-button-action flex items-center gap-2"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Пройти тест заново
        </button>
      </div>
    </div>
  );
};

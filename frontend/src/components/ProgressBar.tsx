import { SparklesIcon, BeakerIcon, BoltIcon, TagIcon, CheckCircleIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  const steps = [
    { label: 'Профиль', icon: SparklesIcon },
    { label: 'Анализ крови', icon: BeakerIcon },
    { label: 'Физические тесты', icon: BoltIcon },
    { label: 'Результаты', icon: TagIcon },
  ];

  return (
    <div className="mb-8">
      {/* Прогресс бар */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Индикатор шага */}
      <div className="text-center text-gray-600 text-lg font-medium mb-6">
        Шаг: <strong className="text-primary text-xl">{currentStep}/{totalSteps}</strong>
      </div>

      {/* Визуальные индикаторы шагов */}
      <div className="grid grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          let status: 'completed' | 'current' | 'pending';
          const Icon = step.icon;

          if (stepNum < currentStep) {
            status = 'completed';
          } else if (stepNum === currentStep) {
            status = 'current';
          } else {
            status = 'pending';
          }

          return (
            <div
              key={stepNum}
              className={`text-center text-base flex flex-col items-center gap-2 ${status === 'completed'
                ? 'text-gray-800 font-semibold'
                : status === 'current'
                  ? 'text-primary font-semibold'
                  : 'text-gray-400'
                }`}
            >
              {status === 'completed' && <CheckCircleIcon className="w-6 h-6" />}
              {status === 'current' && <ArrowPathIcon className="w-6 h-6" />}
              {status === 'pending' && <ClockIcon className="w-6 h-6" />}
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span>{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

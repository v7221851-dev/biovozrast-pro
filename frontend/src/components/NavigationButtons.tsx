import type { ReactNode } from 'react';

interface NavigationButtonsProps {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string | ReactNode;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onNext,
  onBack,
  nextLabel = 'Далее →',
  nextDisabled = false,
  showBack = false,
}) => {
  if (showBack && onBack) {
    return (
      <div className="flex justify-between md:justify-end items-center gap-4 mt-12 pt-8 border-t border-gray-200">
        <button
          onClick={onBack}
          className="quiz-button-secondary"
          aria-label="Назад"
        >
          ←
        </button>
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="quiz-button-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-initial"
        >
          {nextLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center md:justify-end mt-8">
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="quiz-button-primary disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
      >
        {nextLabel}
      </button>
    </div>
  );
};

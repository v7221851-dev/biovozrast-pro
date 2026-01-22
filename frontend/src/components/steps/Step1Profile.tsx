import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { NavigationButtons } from '../NavigationButtons';
import type { UserProfile } from '../../types';

interface Step1ProfileProps {
  data: UserProfile;
  onNext: (data: UserProfile) => void;
}

export const Step1Profile: React.FC<Step1ProfileProps> = ({ data, onNext }) => {
  const [formData, setFormData] = useState<UserProfile>(data);

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <div className="space-y-8">
      <h2 className="step-heading">
        <span className="flex items-center justify-center gap-3">
          <SparklesIcon className="w-8 h-8 text-primary" />
          Шаг 1: Ваш профиль
        </span>
      </h2>
      <p className="step-description">
        Пожалуйста, укажите основную информацию о себе
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="form-label">
            Ваш пол:
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({
              ...formData,
              gender: e.target.value as 'Мужской' | 'Женский'
            })}
            className="form-select"
          >
            <option value="Мужской">Мужской</option>
            <option value="Женский">Женский</option>
          </select>
        </div>

        <div>
          <label className="form-label">
            Ваш возраст:
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={formData.age}
            onChange={(e) => {
              const ageValue = parseInt(e.target.value);
              if (!isNaN(ageValue) && ageValue >= 1 && ageValue <= 120) {
                setFormData({ ...formData, age: ageValue });
              } else if (e.target.value === '') {
                setFormData({ ...formData, age: 35 });
              }
            }}
            className="form-input"
          />
          <p className="form-hint mt-2">Укажите ваш паспортный возраст</p>
        </div>
      </div>

      <NavigationButtons
        onNext={handleNext}
      />
    </div>
  );
};

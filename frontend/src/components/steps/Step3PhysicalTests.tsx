import { useState } from 'react';
import { BoltIcon, HeartIcon, CloudIcon, ScaleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { NavigationButtons } from '../NavigationButtons';
import type { PhysicalTestData } from '../../types';

interface Step3PhysicalTestsProps {
  data: PhysicalTestData;
  onNext: (data: PhysicalTestData) => void;
  onBack: () => void;
}

export const Step3PhysicalTests: React.FC<Step3PhysicalTestsProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState<PhysicalTestData>(data);

  const updateValue = (key: keyof PhysicalTestData, value: number) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="space-y-8">
      <h2 className="step-heading">
        <span className="flex items-center justify-center gap-3">
          <BoltIcon className="w-8 h-8 text-primary" />
          Шаг 3: Физические тесты
        </span>
      </h2>
      <p className="step-description">
        Выполните простые тесты для оценки функциональных резервов организма
      </p>

      {/* Сердечно-сосудистая система */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold flex items-center gap-3">
          <HeartIcon className="w-6 h-6 text-red-500" />
          Сердечно-сосудистая система
        </h3>
        <div className="bg-blue-50 border-l-4 border-primary p-5 rounded-lg">
          <p className="text-base text-gray-700">
            <strong>Артериальное давление</strong> — измерьте давление в спокойном состоянии
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">
              Систолическое давление (верхнее, мм рт.ст.)
            </label>
            <input
              type="number"
              min="90"
              max="200"
              value={formData.sbp}
              onChange={(e) => updateValue('sbp', parseInt(e.target.value) || 120)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">
              Диастолическое давление (нижнее, мм рт.ст.)
            </label>
            <input
              type="number"
              min="60"
              max="120"
              value={formData.dbp}
              onChange={(e) => updateValue('dbp', parseInt(e.target.value) || 80)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Дыхательная система */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold flex items-center gap-3">
          <CloudIcon className="w-6 h-6 text-blue-500" />
          Дыхательная система
        </h3>
        <div className="bg-blue-50 border-l-4 border-primary p-5 rounded-lg">
          <p className="text-base text-gray-700">
            <strong>Тест задержки дыхания</strong> — сделайте глубокий вдох и задержите дыхание на максимальное время. Засеките секунды.
          </p>
        </div>
        <div>
          <label className="form-label">
            Задержка дыхания (секунды)
          </label>
          <input
            type="range"
            min="5"
            max="120"
            value={formData.bht}
            onChange={(e) => updateValue('bht', parseInt(e.target.value))}
            className="w-full h-3"
          />
          <div className="text-center text-primary font-semibold mt-3 text-xl">
            {formData.bht} секунд
          </div>
        </div>
      </div>

      {/* Вестибулярный аппарат */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold flex items-center gap-3">
          <ScaleIcon className="w-6 h-6 text-purple-500" />
          Вестибулярный аппарат
        </h3>
        <div className="bg-blue-50 border-l-4 border-primary p-5 rounded-lg">
          <p className="text-base text-gray-700">
            <strong>Тест балансировки</strong> — встаньте на одну ногу, закройте глаза. Засеките время до потери равновесия.
          </p>
        </div>
        <div>
          <label className="form-label">
            Балансировка на одной ноге (секунды)
          </label>
          <input
            type="range"
            min="1"
            max="120"
            value={formData.sb}
            onChange={(e) => updateValue('sb', parseInt(e.target.value))}
            className="w-full h-3"
          />
          <div className="text-center text-primary font-semibold mt-3 text-xl">
            {formData.sb} секунд
          </div>
        </div>
      </div>

      {/* Антропометрические данные */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-green-500" />
          Антропометрические данные
        </h3>
        <div>
          <label className="form-label">
            Ваш вес (кг)
          </label>
          <input
            type="number"
            min="40"
            max="160"
            value={formData.bw}
            onChange={(e) => updateValue('bw', parseInt(e.target.value) || 75)}
            className="form-input"
          />
          <p className="form-hint mt-2">Укажите ваш текущий вес</p>
        </div>
      </div>

      <NavigationButtons
        onNext={() => onNext(formData)}
        onBack={onBack}
        showBack={true}
        nextLabel={
          <span className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Получить результаты
          </span>
        }
      />
    </div>
  );
};

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
  const [bhtInput, setBhtInput] = useState<string>(data.bht.toString());
  const [sbInput, setSbInput] = useState<string>(data.sb.toString());
  const [bwInput, setBwInput] = useState<string>(data.bw > 0 ? data.bw.toString() : '');

  const updateValue = (key: keyof PhysicalTestData, value: number) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleBhtChange = (value: string) => {
    setBhtInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 5 && numValue <= 120) {
      updateValue('bht', numValue);
    }
  };

  const handleSbChange = (value: string) => {
    setSbInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 120) {
      updateValue('sb', numValue);
    }
  };

  const handleBwChange = (value: string) => {
    setBwInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 10 && numValue <= 250) {
      updateValue('bw', numValue);
    } else if (value === '') {
      updateValue('bw', 0);
    }
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
          <div className="flex items-center gap-3 mt-2">
            <input
              type="range"
              min="5"
              max="120"
              value={formData.bht}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateValue('bht', val);
                setBhtInput(val.toString());
              }}
              className="flex-1 h-3"
            />
            <input
              type="text"
              inputMode="numeric"
              value={bhtInput}
              onChange={(e) => handleBhtChange(e.target.value)}
              className="form-input w-24 text-center"
              placeholder="5"
            />
            <span className="text-primary font-semibold text-sm whitespace-nowrap">сек</span>
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
          <div className="flex items-center gap-3 mt-2">
            <input
              type="range"
              min="1"
              max="120"
              value={formData.sb}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateValue('sb', val);
                setSbInput(val.toString());
              }}
              className="flex-1 h-3"
            />
            <input
              type="text"
              inputMode="numeric"
              value={sbInput}
              onChange={(e) => handleSbChange(e.target.value)}
              className="form-input w-24 text-center"
              placeholder="1"
            />
            <span className="text-primary font-semibold text-sm whitespace-nowrap">сек</span>
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
            min="10"
            max="250"
            value={bwInput}
            onChange={(e) => handleBwChange(e.target.value)}
            className="form-input"
            placeholder="10-250"
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

import { useState } from 'react';
import { BeakerIcon } from '@heroicons/react/24/outline';
import { NavigationButtons } from '../NavigationButtons';
import type { BloodTestData } from '../../types';

interface Step2BloodTestProps {
  data: BloodTestData;
  onNext: (data: BloodTestData) => void;
  onBack: () => void;
}

export const Step2BloodTest: React.FC<Step2BloodTestProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState<BloodTestData>(data);
  const [crpInput, setCrpInput] = useState<string>(data.crp > 0 ? data.crp.toString() : '');

  const updateValue = (key: keyof BloodTestData, value: number) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="space-y-8">
      <h2 className="step-heading">
        <span className="flex items-center justify-center gap-3">
          <BeakerIcon className="w-8 h-8 text-primary" />
          Шаг 2: Результаты анализа крови
        </span>
      </h2>
      <p className="step-description">
        Введите показатели из вашего последнего анализа крови. Если у вас нет результатов, используйте значения по умолчанию.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Левая колонка */}
        <div className="space-y-6">
          <div>
            <label className="form-label">
              Альбумин (г/л)
            </label>
            <p className="form-description">Белок плазмы крови. Норма: 35-50 г/л</p>
            <input
              type="range"
              min="30"
              max="55"
              step="0.1"
              value={formData.alb}
              onChange={(e) => updateValue('alb', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-primary font-semibold mt-2 text-lg">
              {formData.alb.toFixed(1)} г/л
            </div>
          </div>

          <div>
            <label className="form-label">
              Креатинин (мкмоль/л)
            </label>
            <p className="form-description">Показатель функции почек</p>
            <input
              type="range"
              min="30"
              max="150"
              step="0.1"
              value={formData.creat}
              onChange={(e) => updateValue('creat', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-primary font-semibold mt-2 text-lg">
              {formData.creat.toFixed(1)} мкмоль/л
            </div>
          </div>

          <div>
            <label className="form-label">
              Глюкоза (ммоль/л)
            </label>
            <p className="form-description">Уровень сахара в крови. Норма: 3.9-5.9 ммоль/л</p>
            <input
              type="range"
              min="3"
              max="15"
              step="0.1"
              value={formData.gluc}
              onChange={(e) => updateValue('gluc', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-primary font-semibold mt-2 text-lg">
              {formData.gluc.toFixed(1)} ммоль/л
            </div>
          </div>

          <div>
            <label className="form-label">
              С-реактивный белок (СРБ) (мг/л)
            </label>
            <p className="form-description">Маркер воспаления. Норма: &lt; 3 мг/л</p>
            <input
              type="text"
              inputMode="decimal"
              value={crpInput}
              onChange={(e) => {
                const value = e.target.value;
                // Разрешаем пустое значение, точку, запятую и цифры
                // Проверяем формат: может быть пустым, или число с точкой/запятой
                if (value === '') {
                  setCrpInput('');
                  updateValue('crp', 0);
                } else {
                  // Заменяем запятую на точку для единообразия
                  const normalizedValue = value.replace(',', '.');
                  // Проверяем, что это валидное число от 0 до 200
                  const numValue = parseFloat(normalizedValue);
                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 200) {
                    // Проверяем формат: разрешаем только одну точку и максимум 2 знака после точки
                    const parts = normalizedValue.split('.');
                    if (parts.length <= 2 && (parts[1] === undefined || parts[1].length <= 2)) {
                      setCrpInput(normalizedValue);
                      updateValue('crp', numValue);
                    } else if (parts.length === 1) {
                      // Целое число
                      setCrpInput(normalizedValue);
                      updateValue('crp', numValue);
                    }
                  } else if (normalizedValue === '.' || normalizedValue === ',') {
                    // Разрешаем ввод одной точки/запятой
                    setCrpInput('.');
                  }
                }
              }}
              placeholder="0.00"
              className="form-input"
            />
            <p className="form-hint mt-2">Диапазон: от 0 до 200,00 мг/л</p>
          </div>
        </div>

        {/* Правая колонка */}
        <div className="space-y-6">
          <div>
            <label className="form-label">
              Лимфоциты (%)
            </label>
            <p className="form-description">Клетки иммунной системы. Норма: 19-37%</p>
            <input
              type="range"
              min="5"
              max="60"
              step="0.1"
              value={formData.lymph}
              onChange={(e) => updateValue('lymph', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-primary font-semibold mt-2 text-lg">
              {formData.lymph.toFixed(1)}%
            </div>
          </div>

          <div>
            <label className="form-label">
              MCV (фл)
            </label>
            <p className="form-description">Средний объем эритроцита. Норма: 80-100 фл</p>
            <input
              type="range"
              min="70"
              max="110"
              step="0.1"
              value={formData.mcv}
              onChange={(e) => updateValue('mcv', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-primary font-semibold mt-2 text-lg">
              {formData.mcv.toFixed(1)} фл
            </div>
          </div>

          <div>
            <label className="form-label">
              RDW (%)
            </label>
            <p className="form-description">Ширина распределения эритроцитов. Норма: 11.5-14.5%</p>
            <input
              type="range"
              min="10"
              max="20"
              step="0.1"
              value={formData.rdw}
              onChange={(e) => updateValue('rdw', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-primary font-semibold mt-2 text-lg">
              {formData.rdw.toFixed(1)}%
            </div>
          </div>

          <div>
            <label className="form-label">
              Щелочная фосфатаза (Ед/л)
            </label>
            <p className="form-description">Фермент. Норма: 20-140 Ед/л</p>
            <input
              type="range"
              min="30"
              max="150"
              step="0.1"
              value={formData.alp}
              onChange={(e) => updateValue('alp', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-primary font-semibold mt-2 text-lg">
              {formData.alp.toFixed(1)} Ед/л
            </div>
          </div>

          <div>
            <label className="form-label">
              Лейкоциты (×10⁹/л)
            </label>
            <p className="form-description">Белые кровяные клетки. Норма: 4.0-9.0 ×10⁹/л</p>
            <input
              type="range"
              min="2"
              max="15"
              step="0.1"
              value={formData.wbc}
              onChange={(e) => updateValue('wbc', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-primary font-semibold mt-2 text-lg">
              {formData.wbc.toFixed(1)} ×10⁹/л
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons
        onNext={() => onNext(formData)}
        onBack={onBack}
        showBack={true}
      />
    </div>
  );
};

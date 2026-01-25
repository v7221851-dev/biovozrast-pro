import { useState, useEffect } from 'react';
import { BeakerIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ProgressBar } from './components/ProgressBar';
import { Step1Profile } from './components/steps/Step1Profile';
import { Step2BloodTest } from './components/steps/Step2BloodTest';
import { Step3PhysicalTests } from './components/steps/Step3PhysicalTests';
import { Step4Results } from './components/steps/Step4Results';
import type { TestData, TestStep, Results } from './types';
import { calculatePhenoAge, calculateVoitenko, calculateIntegralAge } from './utils/calculations';

const initialTestData: TestData = {
  gender: 'Мужской',
  age: 0, // Будет заполнено пользователем
  alb: 45.0,
  creat: 80.0,
  gluc: 5.0,
  crp: 0, // Будет заполнено пользователем
  lymph: 30.0,
  mcv: 90.0,
  rdw: 13.0,
  alp: 65.0,
  wbc: 6.0,
  sbp: 120,
  dbp: 80,
  bht: 45,
  sb: 20,
  bw: 0,
};

const STORAGE_KEY = 'bioage_test_data';
const STORAGE_STEP_KEY = 'bioage_current_step';
const STORAGE_RESULTS_KEY = 'bioage_results';

function App() {
  // Восстановление данных из localStorage при загрузке
  const [testData, setTestData] = useState<TestData>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Проверяем, что все обязательные поля присутствуют
        return { ...initialTestData, ...parsed };
      } catch (e) {
        console.error('Ошибка восстановления данных:', e);
        return initialTestData;
      }
    }
    return initialTestData;
  });
  
  const [results, setResults] = useState<Results | null>(() => {
    const savedResults = localStorage.getItem(STORAGE_RESULTS_KEY);
    if (savedResults) {
      try {
        return JSON.parse(savedResults);
      } catch (e) {
        console.error('Ошибка восстановления результатов:', e);
        return null;
      }
    }
    return null;
  });

  // Восстанавливаем шаг
  const [currentStep, setCurrentStep] = useState<TestStep>(() => {
    const savedStep = localStorage.getItem(STORAGE_STEP_KEY);
    const savedResults = localStorage.getItem(STORAGE_RESULTS_KEY);
    // Если есть результаты, показываем шаг 4
    if (savedResults) {
      try {
        JSON.parse(savedResults);
        return 4;
      } catch (e) {
        // Если результаты повреждены, используем сохраненный шаг
      }
    }
    return (savedStep ? parseInt(savedStep, 10) : 1) as TestStep;
  });

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testData));
  }, [testData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_STEP_KEY, currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    if (results) {
      localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(results));
    }
  }, [results]);

  // Скролл к верху при смене шага
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleStep1Next = (data: Partial<TestData>) => {
    setTestData({ ...testData, ...data });
    setCurrentStep(2);
  };

  const handleStep2Next = (data: Partial<TestData>) => {
    setTestData({ ...testData, ...data });
    setCurrentStep(3);
  };

  const handleStep3Next = (data: Partial<TestData>) => {
    const updatedData = { ...testData, ...data };
    setTestData(updatedData);

    // Расчеты
    const phenoAge = calculatePhenoAge(
      updatedData.age,
      updatedData.alb,
      updatedData.creat,
      updatedData.gluc,
      updatedData.crp,
      updatedData.lymph,
      updatedData.mcv,
      updatedData.rdw,
      updatedData.alp,
      updatedData.wbc
    );

    const voitenko = calculateVoitenko(
      updatedData.gender,
      updatedData.sbp,
      updatedData.dbp,
      updatedData.bht,
      updatedData.sb,
      updatedData.bw
    );

    if (phenoAge && voitenko) {
      const integral = calculateIntegralAge(phenoAge, voitenko);
      const difference = integral - updatedData.age;

      setResults({
        phenoAge,
        voitenko,
        integral,
        difference,
      });
      setCurrentStep(4);
    }
  };

  const handleRestart = () => {
    // Очищаем кеш при перезапуске
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_STEP_KEY);
    localStorage.removeItem(STORAGE_RESULTS_KEY);
    
    setCurrentStep(1);
    setTestData(initialTestData);
    setResults(null);
  };

  const handleClose = () => {
    // Получаем домен из переменной окружения или используем значение по умолчанию
    const tildaDomain = import.meta.env.VITE_TILDA_DOMAIN || 'https://medicinetest.ru';
    // Если мы в iframe, отправляем сообщение родительскому окну
    if (window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'close-iframe' }, '*');
        // Также пытаемся закрыть через редирект родительского окна
        if (window.top) {
          window.top.location.href = tildaDomain;
        }
      } catch (e) {
        // Если нет доступа к parent, просто редиректим текущее окно
        window.location.href = tildaDomain;
      }
    } else {
      // Если не в iframe, просто редиректим
      window.location.href = tildaDomain;
    }
  };

  return (
    <div className="quiz-container relative">
      {/* Кнопка закрытия в правом верхнем углу */}
      <button
        onClick={handleClose}
        className="close-button"
        aria-label="Закрыть опрос"
        title="Закрыть опрос"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      {/* Заголовок */}
      <h1 className="text-center text-5xl font-bold mb-6 mt-8 flex items-center justify-center gap-3">
        <BeakerIcon className="w-12 h-12 text-primary" />
        Биологический возраст
      </h1>
      <p className="text-center text-gray-600 mb-10 text-xl max-w-2xl mx-auto leading-relaxed">
        В алгоритме используются два научных метода: PhenoAge от Йельского Университета (США) и Методика Войтенко от НИИ Геронтологии (Россия).
      </p>

      {/* Прогресс бар */}
      <ProgressBar currentStep={currentStep} totalSteps={4} />

      {/* Шаги теста */}
      {currentStep === 1 && (
        <Step1Profile
          data={{
            gender: testData.gender,
            age: testData.age,
          }}
          onNext={handleStep1Next}
        />
      )}

      {currentStep === 2 && (
        <Step2BloodTest
          data={{
            alb: testData.alb,
            creat: testData.creat,
            gluc: testData.gluc,
            crp: testData.crp,
            lymph: testData.lymph,
            mcv: testData.mcv,
            rdw: testData.rdw,
            alp: testData.alp,
            wbc: testData.wbc,
          }}
          onNext={handleStep2Next}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <Step3PhysicalTests
          data={{
            sbp: testData.sbp,
            dbp: testData.dbp,
            bht: testData.bht,
            sb: testData.sb,
            bw: testData.bw,
          }}
          onNext={handleStep3Next}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && results && (
        <Step4Results
          testData={testData}
          results={results}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;

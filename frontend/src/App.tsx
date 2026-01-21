import { useState, useEffect } from 'react';
import { BeakerIcon } from '@heroicons/react/24/outline';
import { ProgressBar } from './components/ProgressBar';
import { Step1Profile } from './components/steps/Step1Profile';
import { Step2BloodTest } from './components/steps/Step2BloodTest';
import { Step3PhysicalTests } from './components/steps/Step3PhysicalTests';
import { Step4Results } from './components/steps/Step4Results';
import type { TestData, TestStep, Results } from './types';
import { calculatePhenoAge, calculateVoitenko, calculateIntegralAge } from './utils/calculations';

const initialTestData: TestData = {
  gender: 'Мужской',
  age: 35,
  alb: 45.0,
  creat: 80.0,
  gluc: 5.0,
  crp: 1.0,
  lymph: 30.0,
  mcv: 90.0,
  rdw: 13.0,
  alp: 65.0,
  wbc: 6.0,
  sbp: 120,
  dbp: 80,
  bht: 45,
  sb: 20,
  bw: 75,
};

function App() {
  const [currentStep, setCurrentStep] = useState<TestStep>(1);
  const [testData, setTestData] = useState<TestData>(initialTestData);
  const [results, setResults] = useState<Results | null>(null);

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
    setCurrentStep(1);
    setTestData(initialTestData);
    setResults(null);
  };

  return (
    <div className="quiz-container">
      {/* Заголовок */}
      <h1 className="text-center text-5xl font-bold mb-6 mt-8 flex items-center justify-center gap-3">
        <BeakerIcon className="w-12 h-12 text-primary" />
        Биологический возраст
      </h1>
      <p className="text-center text-gray-600 mb-10 text-xl max-w-2xl mx-auto leading-relaxed">
        Тест для определения вашего биологического возраста. В алгоритме используются два научных метода: PhenoAge от Йельского Университета (США) и Методика Войтенко от НИИ Геронтологии (Россия).
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

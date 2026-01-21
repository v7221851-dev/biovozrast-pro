// Типы данных для теста

export interface UserProfile {
  gender: 'Мужской' | 'Женский';
  age: number;
}

export interface BloodTestData {
  alb: number;      // Альбумин
  creat: number;   // Креатинин
  gluc: number;    // Глюкоза
  crp: number;     // СРБ
  lymph: number;   // Лимфоциты
  mcv: number;     // MCV
  rdw: number;     // RDW
  alp: number;     // Щелочная фосфатаза
  wbc: number;     // Лейкоциты
}

export interface PhysicalTestData {
  sbp: number;     // Систолическое давление
  dbp: number;     // Диастолическое давление
  bht: number;     // Задержка дыхания
  sb: number;      // Балансировка
  bw: number;      // Вес
}

export interface TestData extends UserProfile, BloodTestData, PhysicalTestData { }

export interface Results {
  phenoAge: number;
  voitenko: number;
  integral: number;
  difference: number;
}

export type TestStep = 1 | 2 | 3 | 4;

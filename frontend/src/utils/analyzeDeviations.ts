import type { TestData } from '../types';

export interface Deviation {
  name: string;
  value: string;
  normal: string;
  status: 'high' | 'low' | 'normal';
  impact: string; // Как это влияет на биологический возраст
}

/**
 * Анализирует отклонения показателей от нормы для метода PhenoAge
 */
export function analyzePhenoAgeDeviations(testData: TestData): Deviation[] {
  const deviations: Deviation[] = [];

  // Альбумин (норма: 35-50 г/л)
  if (testData.alb < 35) {
    deviations.push({
      name: 'Альбумин',
      value: `${testData.alb.toFixed(1)} г/л`,
      normal: '35-50 г/л',
      status: 'low',
      impact: 'Низкий альбумин может указывать на проблемы с питанием или печенью, что ускоряет старение',
    });
  } else if (testData.alb > 50) {
    deviations.push({
      name: 'Альбумин',
      value: `${testData.alb.toFixed(1)} г/л`,
      normal: '35-50 г/л',
      status: 'high',
      impact: 'Повышенный альбумин обычно не критичен, но может указывать на обезвоживание',
    });
  }

  // Креатинин (норма зависит от пола)
  const creatNormal = testData.gender === 'Мужской' ? { min: 62, max: 106 } : { min: 44, max: 80 };
  if (testData.creat < creatNormal.min) {
    deviations.push({
      name: 'Креатинин',
      value: `${testData.creat.toFixed(1)} мкмоль/л`,
      normal: `${creatNormal.min}-${creatNormal.max} мкмоль/л`,
      status: 'low',
      impact: 'Низкий креатинин может указывать на снижение мышечной массы, что связано со старением',
    });
  } else if (testData.creat > creatNormal.max) {
    deviations.push({
      name: 'Креатинин',
      value: `${testData.creat.toFixed(1)} мкмоль/л`,
      normal: `${creatNormal.min}-${creatNormal.max} мкмоль/л`,
      status: 'high',
      impact: 'Повышенный креатинин может указывать на проблемы с почками, что ускоряет биологическое старение',
    });
  }

  // Глюкоза (норма: 3.9-5.9 ммоль/л)
  if (testData.gluc < 3.9) {
    deviations.push({
      name: 'Глюкоза',
      value: `${testData.gluc.toFixed(1)} ммоль/л`,
      normal: '3.9-5.9 ммоль/л',
      status: 'low',
      impact: 'Низкая глюкоза может указывать на проблемы с метаболизмом',
    });
  } else if (testData.gluc > 5.9) {
    deviations.push({
      name: 'Глюкоза',
      value: `${testData.gluc.toFixed(1)} ммоль/л`,
      normal: '3.9-5.9 ммоль/л',
      status: 'high',
      impact: 'Повышенная глюкоза ускоряет старение сосудов и тканей, негативно влияет на биологический возраст',
    });
  }

  // СРБ (норма: < 3 мг/л)
  if (testData.crp > 3) {
    deviations.push({
      name: 'С-реактивный белок (СРБ)',
      value: `${testData.crp.toFixed(2)} мг/л`,
      normal: '< 3 мг/л',
      status: 'high',
      impact: 'Повышенный СРБ указывает на воспаление в организме, что значительно ускоряет биологическое старение',
    });
  }

  // Лимфоциты (норма: 19-37%)
  if (testData.lymph < 19) {
    deviations.push({
      name: 'Лимфоциты',
      value: `${testData.lymph.toFixed(1)}%`,
      normal: '19-37%',
      status: 'low',
      impact: 'Низкие лимфоциты могут указывать на ослабление иммунной системы, что связано со старением',
    });
  } else if (testData.lymph > 37) {
    deviations.push({
      name: 'Лимфоциты',
      value: `${testData.lymph.toFixed(1)}%`,
      normal: '19-37%',
      status: 'high',
      impact: 'Повышенные лимфоциты могут указывать на воспалительные процессы',
    });
  }

  // MCV (норма: 80-100 фл)
  if (testData.mcv < 80) {
    deviations.push({
      name: 'MCV (средний объем эритроцита)',
      value: `${testData.mcv.toFixed(1)} фл`,
      normal: '80-100 фл',
      status: 'low',
      impact: 'Низкий MCV может указывать на дефицит железа или другие проблемы',
    });
  } else if (testData.mcv > 100) {
    deviations.push({
      name: 'MCV (средний объем эритроцита)',
      value: `${testData.mcv.toFixed(1)} фл`,
      normal: '80-100 фл',
      status: 'high',
      impact: 'Повышенный MCV может указывать на дефицит витаминов группы B',
    });
  }

  // RDW (норма: 11.5-14.5%)
  if (testData.rdw < 11.5) {
    deviations.push({
      name: 'RDW (ширина распределения эритроцитов)',
      value: `${testData.rdw.toFixed(1)}%`,
      normal: '11.5-14.5%',
      status: 'low',
      impact: 'Низкий RDW обычно не критичен',
    });
  } else if (testData.rdw > 14.5) {
    deviations.push({
      name: 'RDW (ширина распределения эритроцитов)',
      value: `${testData.rdw.toFixed(1)}%`,
      normal: '11.5-14.5%',
      status: 'high',
      impact: 'Повышенный RDW часто связан с общим износом организма и ускоренным старением',
    });
  }

  // Щелочная фосфатаза (норма: 20-140 Ед/л)
  if (testData.alp < 20) {
    deviations.push({
      name: 'Щелочная фосфатаза',
      value: `${testData.alp.toFixed(1)} Ед/л`,
      normal: '20-140 Ед/л',
      status: 'low',
      impact: 'Низкая щелочная фосфатаза может указывать на проблемы с костями или печенью',
    });
  } else if (testData.alp > 140) {
    deviations.push({
      name: 'Щелочная фосфатаза',
      value: `${testData.alp.toFixed(1)} Ед/л`,
      normal: '20-140 Ед/л',
      status: 'high',
      impact: 'Повышенная щелочная фосфатаза может указывать на проблемы с печенью или костями',
    });
  }

  // Лейкоциты (норма: 4.0-9.0 ×10⁹/л)
  if (testData.wbc < 4.0) {
    deviations.push({
      name: 'Лейкоциты',
      value: `${testData.wbc.toFixed(1)} ×10⁹/л`,
      normal: '4.0-9.0 ×10⁹/л',
      status: 'low',
      impact: 'Низкие лейкоциты могут указывать на ослабление иммунной системы',
    });
  } else if (testData.wbc > 9.0) {
    deviations.push({
      name: 'Лейкоциты',
      value: `${testData.wbc.toFixed(1)} ×10⁹/л`,
      normal: '4.0-9.0 ×10⁹/л',
      status: 'high',
      impact: 'Повышенные лейкоциты указывают на воспаление, что ускоряет биологическое старение',
    });
  }

  return deviations;
}

/**
 * Анализирует отклонения показателей от нормы для метода Войтенко
 */
export function analyzeVoitenkoDeviations(testData: TestData): Deviation[] {
  const deviations: Deviation[] = [];

  // Систолическое давление (норма: 90-140 мм рт.ст.)
  if (testData.sbp < 90) {
    deviations.push({
      name: 'Систолическое давление',
      value: `${testData.sbp} мм рт.ст.`,
      normal: '90-140 мм рт.ст.',
      status: 'low',
      impact: 'Низкое давление может указывать на слабость сердечно-сосудистой системы',
    });
  } else if (testData.sbp > 140) {
    deviations.push({
      name: 'Систолическое давление',
      value: `${testData.sbp} мм рт.ст.`,
      normal: '90-140 мм рт.ст.',
      status: 'high',
      impact: 'Повышенное давление значительно ускоряет старение сердечно-сосудистой системы',
    });
  }

  // Диастолическое давление (норма: 60-90 мм рт.ст.)
  if (testData.dbp < 60) {
    deviations.push({
      name: 'Диастолическое давление',
      value: `${testData.dbp} мм рт.ст.`,
      normal: '60-90 мм рт.ст.',
      status: 'low',
      impact: 'Низкое диастолическое давление может указывать на проблемы с сосудами',
    });
  } else if (testData.dbp > 90) {
    deviations.push({
      name: 'Диастолическое давление',
      value: `${testData.dbp} мм рт.ст.`,
      normal: '60-90 мм рт.ст.',
      status: 'high',
      impact: 'Повышенное диастолическое давление ускоряет износ сердечно-сосудистой системы',
    });
  }

  // Задержка дыхания (хороший результат: > 40 секунд)
  if (testData.bht < 40) {
    deviations.push({
      name: 'Задержка дыхания',
      value: `${testData.bht} сек`,
      normal: '> 40 сек',
      status: 'low',
      impact: 'Короткая задержка дыхания указывает на снижение функциональных резервов дыхательной системы',
    });
  }

  // Балансировка (хороший результат: > 20 секунд)
  if (testData.sb < 20) {
    deviations.push({
      name: 'Балансировка на одной ноге',
      value: `${testData.sb} сек`,
      normal: '> 20 сек',
      status: 'low',
      impact: 'Плохая балансировка указывает на снижение функциональных резервов вестибулярного аппарата и координации',
    });
  }

  // Вес - проверка на разумные границы (без расчета ИМТ, так как нет роста)
  // Используем общие рекомендации: нормальный вес для взрослого человека обычно 50-100 кг
  // Но это очень приблизительно, поэтому используем более широкие границы
  if (testData.bw < 40) {
    deviations.push({
      name: 'Вес',
      value: `${testData.bw} кг`,
      normal: '40-120 кг (приблизительно)',
      status: 'low',
      impact: 'Очень низкий вес может указывать на недостаток мышечной массы, что связано со старением',
    });
  } else if (testData.bw > 120) {
    deviations.push({
      name: 'Вес',
      value: `${testData.bw} кг`,
      normal: '40-120 кг (приблизительно)',
      status: 'high',
      impact: 'Избыточный вес создает дополнительную нагрузку на сердечно-сосудистую систему и ускоряет старение',
    });
  }

  return deviations;
}

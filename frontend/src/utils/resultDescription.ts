import type { Results } from '../types';

export interface ResultDescription {
  text: string;
  type: 'success' | 'info' | 'warning';
  iconName?: 'sparkles' | 'check' | 'chart' | 'warning';
}

export function getResultDescription(
  results: Results,
  passportAge: number
): ResultDescription {
  const { integral, difference } = results;
  const diffAbs = Math.abs(difference);

  if (difference < -5) {
    return {
      type: 'success',
      iconName: 'sparkles',
      text: `Поздравляем! Ваш биологический возраст (${integral.toFixed(1)} лет) значительно меньше паспортного (${passportAge} лет). Разница составляет ${diffAbs.toFixed(1)} лет. Это отличный показатель! Ваш организм стареет медленнее, чем в среднем для вашего возраста. Продолжайте вести здоровый образ жизни, правильно питаться и регулярно заниматься физическими упражнениями.`
    };
  }

  if (difference < 0) {
    return {
      type: 'info',
      iconName: 'check',
      text: `Хорошие новости! Ваш биологический возраст (${integral.toFixed(1)} лет) немного меньше паспортного (${passportAge} лет). Разница составляет ${diffAbs.toFixed(1)} лет. Это говорит о том, что ваш организм находится в хорошем состоянии. Рекомендуется поддерживать текущий образ жизни и регулярно проходить медицинские обследования.`
    };
  }

  if (difference <= 5) {
    return {
      type: 'info',
      iconName: 'chart',
      text: `Ваш биологический возраст (${integral.toFixed(1)} лет) близок к паспортному (${passportAge} лет). Разница составляет ${diffAbs.toFixed(1)} лет. Это нормальный показатель. Рекомендуется обратить внимание на образ жизни: улучшить питание, увеличить физическую активность, нормализовать сон и снизить уровень стресса.`
    };
  }

  return {
    type: 'warning',
    iconName: 'warning',
    text: `Ваш биологический возраст (${integral.toFixed(1)} лет) превышает паспортный (${passportAge} лет) на ${diffAbs.toFixed(1)} лет. Это может указывать на ускоренное старение организма. Рекомендуется: 1) Пройти комплексное медицинское обследование; 2) Пересмотреть образ жизни (питание, физическая активность); 3) Обратиться к специалистам для разработки индивидуальной программы оздоровления.`
  };
}

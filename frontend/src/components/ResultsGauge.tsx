interface ResultsGaugeProps {
  value: number;
  passportAge: number;
}

export const ResultsGauge: React.FC<ResultsGaugeProps> = ({ value, passportAge }) => {
  const maxAge = 100;
  const currentValue = Math.min(value, maxAge);
  const passportPosition = (passportAge / maxAge) * 100;
  const currentPosition = (currentValue / maxAge) * 100;

  const isGood = value < passportAge;
  const difference = Math.abs(value - passportAge);

  return (
    <div className="flex flex-col items-center justify-center my-12 w-full max-w-2xl mx-auto">
      {/* Основное значение */}
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-primary mb-2">{value.toFixed(1)}</div>
        <div className="text-2xl text-gray-500">лет</div>
      </div>

      {/* Горизонтальная диаграмма */}
      <div className="w-full space-y-6">
        {/* Шкала биологического возраста */}
        <div className="relative">
          <div className="text-base text-gray-600 mb-3 font-semibold">
            Биологический возраст
          </div>

          {/* Фон шкалы */}
          <div className="relative w-full h-12 bg-gray-200 rounded-lg overflow-hidden">
            {/* Заполненная часть до текущего значения */}
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-lg transition-all duration-500"
              style={{ width: `${currentPosition}%` }}
            />

            {/* Индикатор паспортного возраста (вертикальная линия) */}
            <div
              className="absolute top-0 h-full w-1 bg-red-500 z-10"
              style={{ left: `${passportPosition}%`, transform: 'translateX(-50%)' }}
            />

            {/* Текущее значение (маркер) */}
            <div
              className="absolute top-0 h-full w-2 bg-primary-dark z-20 rounded"
              style={{ left: `${currentPosition}%`, transform: 'translateX(-50%)' }}
            />
          </div>

          {/* Подписи под шкалой */}
          <div className="flex justify-between mt-2 text-base text-gray-500">
            <span>0</span>
            <span className="font-semibold text-red-600">Паспорт: {passportAge} лет</span>
            <span>100</span>
          </div>
        </div>

        {/* Информация о разнице */}
        <div className={`text-center p-4 rounded-lg ${isGood
          ? 'bg-green-50 border-2 border-green-200'
          : 'bg-orange-50 border-2 border-orange-200'
          }`}>
          <div className={`text-lg font-semibold mb-1 ${isGood ? 'text-green-700' : 'text-orange-700'
            }`}>
            {isGood ? '✓ Моложе паспорта' : '⚠ Старше паспорта'}
          </div>
          {difference > 0.1 && (
            <div className={`text-base ${isGood ? 'text-green-600' : 'text-orange-600'
              }`}>
              Разница: {difference.toFixed(1)} лет
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

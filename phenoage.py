import math

def calculate_phenoage(age, albumin, creatinine, glucose, crp, lymph_pct, mcv, rdw, alp, wbc):
    """Ядро расчетов PhenoAge"""
    try:
        # Линейная комбинация (xb)
        xb = (-19.907 
              - 0.0336 * albumin 
              + 0.0095 * creatinine 
              + 0.1953 * glucose 
              + 0.0954 * math.log(crp) 
              - 0.0120 * lymph_pct 
              + 0.0268 * mcv 
              + 0.3306 * rdw 
              + 0.0019 * alp 
              + 0.0554 * wbc 
              + 0.0804 * age)
        
        gamma = 0.0076927
        exp_xb = math.exp(xb)
        m = 1 - math.exp((-exp_xb * (math.exp(120 * gamma) - 1)) / gamma)
        
        pheno_age = 141.50 + (math.log(-0.00553 * math.log(1 - m))) / 0.090165
        return round(pheno_age, 2)
    except Exception as e:
        return f"Ошибка: {e}"

def print_scientific_rationale():
    """Вывод научного обоснования модели"""
    print("\n" + "="*60)
    print("       ПОЧЕМУ ЭТОМУ РЕЗУЛЬТАТУ МОЖНО ДОВЕРЯТЬ?")
    print("="*60)
    print("Модель PhenoAge (Йельский университет, 2018) — это не просто")
    print("математика, а признанный стандарт в геронтологии:")
    print("\n1. ОГРОМНАЯ БАЗА ДАННЫХ:")
    print("   Алгоритм обучен на данных NHANES — десятилетиях наблюдений")
    print("   за десятками тысяч людей. Это исключает случайные выводы.")
    print("\n2. ПРОГНОЗ 'ЗАПАСА ПРОЧНОСТИ':")
    print("   В отличие от паспорта, PhenoAge предсказывает риск развития")
    print("   возрастных заболеваний (диабет, рак, Альцгеймер).")
    print("\n3. КЛЮЧЕВЫЕ МАРКЕРЫ СТАРЕНИЯ:")
    print("   Модель учитывает воспаление (СРБ), метаболизм (глюкоза) и")
    print("   иммунное старение (лимфоциты), а не просто внешние признаки.")
    print("\n4. ЭТО ДИНАМИЧЕСКИЙ ПОКАЗАТЕЛЬ:")
    print("   Ваш биовозраст — это 'спидометр'. В отличие от даты рождения,")
    print("   на него можно влиять через диету, сон и нагрузки.")
    print("="*60)

def get_input(prompt, unit):
    while True:
        try:
            val = float(input(f"{prompt:.<40} ({unit}): ").replace(',', '.'))
            if val <= 0 and "СРБ" not in prompt:
                print(" ! Значение должно быть больше 0.")
                continue
            return val
        except ValueError:
            print(" ! Пожалуйста, введите число.")

# --- ОСНОВНОЙ ЦИКЛ
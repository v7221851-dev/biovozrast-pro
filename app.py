import streamlit as st
import math
import pandas as pd
import plotly.graph_objects as go
from fpdf import FPDF
from datetime import datetime
import os

# 1. Настройка страницы
st.set_page_config(page_title="Integral BioAge Pro", page_icon="🧬", layout="wide")

# 2. Логика расчетов

def calculate_phenoage(age, albumin, creatinine, glucose, crp, lymph_pct, mcv, rdw, alp, wbc):
    """Расчет по модели Levine (PhenoAge)"""
    try:
        crp_mg_dl = crp / 10 if crp > 0 else 0.01
        xb = (-19.907 - 0.0336 * albumin + 0.0095 * creatinine + 0.1953 * glucose 
              + 0.0954 * math.log(crp_mg_dl) - 0.0120 * lymph_pct + 0.0268 * mcv 
              + 0.3306 * rdw + 0.0019 * alp + 0.0554 * wbc + 0.0804 * age)
        gamma = 0.0076927
        m = 1 - math.exp((-math.exp(xb) * (math.exp(120 * gamma) - 1)) / gamma)
        return round(141.50 + (math.log(-0.00553 * math.log(1 - m))) / 0.090165, 2)
    except: return None

def calculate_voitenko(gender, sbp, dbp, bht, sb, bw):
    """Расчет по методике Войтенко"""
    try:
        if gender == "Мужской":
            # Формула для мужчин
            ba = 26.985 + 0.215 * sbp - 0.155 * bht - 0.57 * sb + 0.445 * bw
        else:
            # Формула для женщин
            ba = -1.18 + 0.012 * sbp + 0.012 * dbp - 0.057 * bht - 0.50 * sb + 0.248 * bw
        return round(ba, 2)
    except: return None

# 3. Функция генерации PDF
def create_pdf(name, gender, age, ba_p, ba_v, combined, diff, markers):
    pdf = FPDF()
    pdf.add_page()
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    font_path = os.path.join(base_dir, "fonts", "DejaVuSans.ttf")
    
    if os.path.exists(font_path) and os.path.getsize(font_path) > 100000:
        pdf.add_font("DejaVu", "", font_path)
        pdf.add_font("DejaVu", "B", font_path)
        pdf.set_font("DejaVu", size=12)
        font_family = "DejaVu"
    else:
        st.error("Ошибка шрифта в PDF.")
        return None

    pdf.set_font(font_family, style='B', size=16)
    pdf.cell(200, 10, txt="Интегральный отчет: Биологический возраст", ln=True, align='C')
    pdf.set_font(font_family, size=10)
    pdf.cell(200, 10, txt=f"Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')}", ln=True, align='C')
    pdf.ln(10)
    
    pdf.set_font(font_family, size=12)
    pdf.cell(200, 10, txt=f"Пользователь: {name} ({gender})", ln=True)
    pdf.cell(200, 10, txt=f"Паспортный возраст: {age} лет", ln=True)
    pdf.ln(5)
    
    # Сводная таблица
    pdf.set_fill_color(230, 230, 230)
    pdf.set_font(font_family, style='B', size=12)
    pdf.cell(95, 10, txt="Метод оценки", border=1, fill=True)
    pdf.cell(95, 10, txt="Результат", border=1, ln=True, fill=True)
    
    pdf.set_font(font_family, size=11)
    results = [
        ("Биохимия (PhenoAge)", f"{ba_p} л."),
        ("Тесты (Войтенко)", f"{ba_v} л."),
        ("ИНТЕГРАЛЬНЫЙ ВОЗРАСТ", f"{combined} л."),
        ("Разница с паспортом", f"{diff} л.")
    ]
    for l, v in results:
        pdf.cell(95, 10, txt=l, border=1)
        pdf.cell(95, 10, txt=v, border=1, ln=True)
        
    return pdf.output()

# 4. Интерфейс в формате теста
st.title("🧬 Интегральный расчет биологического возраста")
st.markdown("### Пройдите тест для определения вашего биологического возраста")

# Инициализация session state для шагов теста
if 'test_step' not in st.session_state:
    st.session_state.test_step = 1
if 'test_data' not in st.session_state:
    st.session_state.test_data = {}

# Функция для отображения прогресса
def show_progress(current_step, total_steps=4):
    progress = current_step / total_steps
    st.progress(progress)
    steps = ["👤 Профиль", "🩸 Анализ крови", "🏃 Физические тесты", "📊 Результаты"]
    cols = st.columns(total_steps)
    for i, (col, step_name) in enumerate(zip(cols, steps)):
        if i + 1 < current_step:
            col.markdown(f"✅ **{step_name}**")
        elif i + 1 == current_step:
            col.markdown(f"🔄 **{step_name}**")
        else:
            col.markdown(f"⏳ {step_name}")

# Шаг 1: Профиль
if st.session_state.test_step == 1:
    show_progress(1)
    st.markdown("---")
    st.markdown("### 👤 Шаг 1: Ваш профиль")
    st.markdown("Пожалуйста, укажите основную информацию о себе")
    
    col1, col2 = st.columns(2)
    with col1:
        u_name = st.text_input("**Как вас зовут?**", value=st.session_state.test_data.get('name', ''), 
                               placeholder="Введите ваше имя")
        gender_val = st.session_state.test_data.get('gender', 'Мужской')
        gender_index = 0 if gender_val == "Мужской" else 1
        u_gender = st.selectbox("**Ваш пол:**", ["Мужской", "Женский"], index=gender_index)
    with col2:
        u_age = st.number_input("**Сколько вам лет?**", min_value=18, max_value=100, 
                                value=st.session_state.test_data.get('age', 35),
                                help="Укажите ваш паспортный возраст")
    
    st.session_state.test_data['name'] = u_name
    st.session_state.test_data['gender'] = u_gender
    st.session_state.test_data['age'] = u_age
    
    col1, col2, col3 = st.columns([1, 1, 1])
    with col3:
        if st.button("Далее →", type="primary", use_container_width=True):
            if u_name and u_name.strip():
                st.session_state.test_step = 2
                st.rerun()
            else:
                st.warning("Пожалуйста, введите ваше имя")

# Шаг 2: Анализ крови
elif st.session_state.test_step == 2:
    show_progress(2)
    st.markdown("---")
    st.markdown("### 🩸 Шаг 2: Результаты анализа крови")
    st.markdown("Введите показатели из вашего последнего анализа крови. Если у вас нет результатов, используйте значения по умолчанию.")
    
    st.markdown("#### 📋 Основные биохимические показатели")
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("**Альбумин** — белок плазмы крови")
        alb = st.slider("Альбумин (г/л)", 30.0, 55.0, 
                       value=st.session_state.test_data.get('alb', 45.0),
                       help="Норма: 35-50 г/л")
        
        st.markdown("**Креатинин** — показатель функции почек")
        creat = st.slider("Креатинин (мкмоль/л)", 30.0, 150.0, 
                         value=st.session_state.test_data.get('creat', 80.0),
                         help="Норма: 62-106 мкмоль/л (мужчины), 44-80 мкмоль/л (женщины)")
        
        st.markdown("**Глюкоза** — уровень сахара в крови")
        gluc = st.slider("Глюкоза (ммоль/л)", 3.0, 15.0, 
                        value=st.session_state.test_data.get('gluc', 5.0),
                        help="Норма: 3.9-5.9 ммоль/л")
        
        st.markdown("**С-реактивный белок (СРБ)** — маркер воспаления")
        crp = st.number_input("СРБ (мг/л)", 0.0, 50.0, 
                             value=st.session_state.test_data.get('crp', 1.0),
                             help="Норма: < 3 мг/л")
    
    with col2:
        st.markdown("**Лимфоциты** — клетки иммунной системы")
        lymph = st.slider("Лимфоциты (%)", 5.0, 60.0, 
                         value=st.session_state.test_data.get('lymph', 30.0),
                         help="Норма: 19-37%")
        
        st.markdown("**MCV** — средний объем эритроцита")
        mcv = st.slider("MCV (фл)", 70.0, 110.0, 
                       value=st.session_state.test_data.get('mcv', 90.0),
                       help="Норма: 80-100 фл")
        
        st.markdown("**RDW** — ширина распределения эритроцитов")
        rdw = st.slider("RDW (%)", 10.0, 20.0, 
                       value=st.session_state.test_data.get('rdw', 13.0),
                       help="Норма: 11.5-14.5%")
        
        st.markdown("**Щелочная фосфатаза** — фермент")
        alp = st.slider("Щелочная фосфатаза (Ед/л)", 30.0, 150.0, 
                       value=st.session_state.test_data.get('alp', 65.0),
                       help="Норма: 20-140 Ед/л")
        
        st.markdown("**Лейкоциты** — белые кровяные клетки")
        wbc = st.slider("Лейкоциты (×10⁹/л)", 2.0, 15.0, 
                       value=st.session_state.test_data.get('wbc', 6.0),
                       help="Норма: 4.0-9.0 ×10⁹/л")
    
    st.session_state.test_data.update({
        'alb': alb, 'creat': creat, 'gluc': gluc, 'crp': crp,
        'lymph': lymph, 'mcv': mcv, 'rdw': rdw, 'alp': alp, 'wbc': wbc
    })
    
    col1, col2, col3 = st.columns([1, 1, 1])
    with col1:
        if st.button("← Назад", use_container_width=True):
            st.session_state.test_step = 1
            st.rerun()
    with col3:
        if st.button("Далее →", type="primary", use_container_width=True):
            st.session_state.test_step = 3
            st.rerun()

# Шаг 3: Физические тесты
elif st.session_state.test_step == 3:
    show_progress(3)
    st.markdown("---")
    st.markdown("### 🏃 Шаг 3: Физические тесты")
    st.markdown("Выполните простые тесты для оценки функциональных резервов организма")
    
    st.markdown("#### 💓 Сердечно-сосудистая система")
    st.markdown("**Артериальное давление**")
    st.info("Измерьте давление в спокойном состоянии")
    col1, col2 = st.columns(2)
    with col1:
        sbp = st.number_input("Систолическое давление (верхнее, мм рт.ст.)", 
                             min_value=90, max_value=200, 
                             value=st.session_state.test_data.get('sbp', 120),
                             help="Норма: 90-140 мм рт.ст.")
    with col2:
        dbp = st.number_input("Диастолическое давление (нижнее, мм рт.ст.)", 
                             min_value=60, max_value=120, 
                             value=st.session_state.test_data.get('dbp', 80),
                             help="Норма: 60-90 мм рт.ст.")
    
    st.markdown("#### 🫁 Дыхательная система")
    st.markdown("**Тест задержки дыхания**")
    st.info("Сделайте глубокий вдох и задержите дыхание на максимальное время. Засеките секунды.")
    bht = st.slider("Задержка дыхания (секунды)", 5, 120, 
                   value=st.session_state.test_data.get('bht', 45),
                   help="Хороший результат: > 40 секунд")
    
    st.markdown("#### ⚖️ Вестибулярный аппарат")
    st.markdown("**Тест балансировки**")
    st.info("Встаньте на одну ногу, закройте глаза. Засеките время до потери равновесия.")
    sb = st.slider("Балансировка на одной ноге (секунды)", 1, 120, 
                  value=st.session_state.test_data.get('sb', 20),
                  help="Хороший результат: > 20 секунд")
    
    st.markdown("#### 📏 Антропометрические данные")
    bw = st.number_input("Ваш вес (кг)", min_value=40, max_value=160, 
                        value=st.session_state.test_data.get('bw', 75),
                        help="Укажите ваш текущий вес")
    
    st.session_state.test_data.update({
        'sbp': sbp, 'dbp': dbp, 'bht': bht, 'sb': sb, 'bw': bw
    })
    
    col1, col2, col3 = st.columns([1, 1, 1])
    with col1:
        if st.button("← Назад", use_container_width=True):
            st.session_state.test_step = 2
            st.rerun()
    with col3:
        if st.button("📊 Получить результаты", type="primary", use_container_width=True):
            st.session_state.test_step = 4
            st.rerun()

# Шаг 4: Результаты
else:
    show_progress(4)
    st.markdown("---")
    
    # Получаем данные из session_state
    u_name = st.session_state.test_data.get('name', 'Пользователь')
    u_gender = st.session_state.test_data.get('gender', 'Мужской')
    u_age = st.session_state.test_data.get('age', 35)
    alb = st.session_state.test_data.get('alb', 45.0)
    creat = st.session_state.test_data.get('creat', 80.0)
    gluc = st.session_state.test_data.get('gluc', 5.0)
    crp = st.session_state.test_data.get('crp', 1.0)
    lymph = st.session_state.test_data.get('lymph', 30.0)
    mcv = st.session_state.test_data.get('mcv', 90.0)
    rdw = st.session_state.test_data.get('rdw', 13.0)
    alp = st.session_state.test_data.get('alp', 65.0)
    wbc = st.session_state.test_data.get('wbc', 6.0)
    sbp = st.session_state.test_data.get('sbp', 120)
    dbp = st.session_state.test_data.get('dbp', 80)
    bht = st.session_state.test_data.get('bht', 45)
    sb = st.session_state.test_data.get('sb', 20)
    bw = st.session_state.test_data.get('bw', 75)

# 5. Основная область: Расчеты и Визуализация (только для шага 4)
if st.session_state.test_step == 4:
    st.markdown("### 📊 Ваши результаты")
    st.markdown(f"**{u_name}**, вот результаты анализа вашего биологического возраста:")
    
    ba_pheno = calculate_phenoage(u_age, alb, creat, gluc, crp, lymph, mcv, rdw, alp, wbc)
    ba_voitenko = calculate_voitenko(u_gender, sbp, dbp, bht, sb, bw)

    if ba_pheno and ba_voitenko:
        # Интегральный возраст — среднее двух моделей
        ba_integral = round((ba_pheno + ba_voitenko) / 2, 2)
        u_diff = round(ba_integral - u_age, 1)

        # Метрики
        st.markdown("#### 📈 Показатели биологического возраста")
        m1, m2, m3 = st.columns(3)
        m1.metric("PhenoAge (Кровь)", f"{ba_pheno} лет", 
                 help="Оценка на основе биохимических маркеров")
        m2.metric("Войтенко (Тесты)", f"{ba_voitenko} лет", 
                 help="Оценка на основе функциональных тестов")
        m3.metric("Интегральный результат", f"{ba_integral} лет", 
                 delta=f"{u_diff} л.", delta_color="inverse",
                 help="Среднее значение двух методов")

        # Главный график
        st.markdown("#### 🎯 Визуализация результатов")
        fig = go.Figure(go.Indicator(
            mode = "gauge+number",
            value = ba_integral,
            title = {'text': f"Ваш интегральный возраст: {ba_integral} лет", 'font': {'size': 24}},
            gauge = {
                'axis': {'range': [None, 100], 'tickwidth': 1},
                'bar': {'color': "#636EFA"},
                'threshold': {'line': {'color': "red", 'width': 4}, 'thickness': 0.75, 'value': u_age}
            }
        ))
        st.plotly_chart(fig, use_container_width=True)

        # Резюме
        st.markdown("#### 💡 Интерпретация результатов")
        if u_diff <= -2:
            st.success(f"✨ **Превосходно!** Ваш биологический возраст на {abs(u_diff)} лет меньше паспортного. Отличная синергия показателей! Вы поддерживаете организм на высоком уровне.")
        elif u_diff <= 0:
            st.success(f"✨ **Отлично!** Ваш биологический возраст на {abs(u_diff)} лет меньше паспортного. Продолжайте в том же духе!")
        elif u_diff <= 2:
            st.info(f"📊 **Нормально.** Ваш биологический возраст близок к паспортному (разница {u_diff} лет). Есть потенциал для улучшения.")
        else:
            st.warning(f"⚠️ **Требует внимания.** Ваш биологический возраст выше паспортного на {u_diff} лет. Рекомендуется обратить внимание на образ жизни и здоровье.")

        # Детальная информация
        with st.expander("📋 Детальная информация о методах оценки"):
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("**PhenoAge (Yale University)**")
                st.write(f"- Оценка: {ba_pheno} лет")
                st.write(f"- Разница с паспортом: {round(ba_pheno - u_age, 1)} лет")
                st.write("Этот метод анализирует 9 маркеров крови для оценки риска смертности и темпов старения на клеточном уровне.")
            with col2:
                st.markdown("**Метод Войтенко (НИИ Геронтологии)**")
                st.write(f"- Оценка: {ba_voitenko} лет")
                st.write(f"- Разница с паспортом: {round(ba_voitenko - u_age, 1)} лет")
                st.write("Этот метод оценивает функциональные резервы сердечно-сосудистой системы и вестибулярного аппарата.")

        # PDF Кнопка
        st.markdown("---")
        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            if st.button("📄 Сформировать PDF отчет", type="primary", use_container_width=True):
                m_list = {"СРБ": crp, "Глюкоза": gluc, "Давление": f"{sbp}/{dbp}", "Баланс": f"{sb} сек"}
                pdf_out = create_pdf(u_name, u_gender, u_age, ba_pheno, ba_voitenko, ba_integral, u_diff, m_list)
                if pdf_out:
                    st.download_button("💾 Скачать отчет", data=bytes(pdf_out), 
                                     file_name=f"Integral_Age_{u_name}.pdf",
                                     use_container_width=True)
        
        # Кнопка для нового теста
        st.markdown("---")
        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            if st.button("🔄 Пройти тест заново", use_container_width=True):
                st.session_state.test_step = 1
                st.session_state.test_data = {}
                st.rerun()

# 6. Научный блок (показывается на всех шагах)
if st.session_state.test_step < 4:
    st.divider()
    st.markdown("### 🔬 О методологии")
    st.write("""
    Данная модель объединяет два фундаментальных подхода к оценке биологического возраста:
    1. **PhenoAge (Yale University):** Оценивает риск смертности и темпы старения на клеточном уровне через 9 маркеров крови.
    2. **Метод Войтенко (НИИ Геронтологии):** Проверенная временем система оценки функциональных резервов сердечно-сосудистой системы и вестибулярного аппарата.
    
    **Интегральный показатель** считается более устойчивым к краткосрочным колебаниям состояния организма.
    """)
elif st.session_state.test_step == 4:
    st.divider()
    st.markdown("### 🔬 О методологии синтеза")
    st.write("""
    Данная модель объединяет два фундаментальных подхода к долголетию:
    1. **PhenoAge (Yale University):** Оценивает риск смертности и темпы старения на клеточном уровне через 9 маркеров крови.
    2. **Метод Войтенко (НИИ Геронтологии):** Проверенная временем советская система оценки функциональных резервов сердечно-сосудистой системы и вестибулярного аппарата.

    **Интегральный показатель** считается более устойчивым к краткосрочным колебаниям состояния организма.
    """)
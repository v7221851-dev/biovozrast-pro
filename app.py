import streamlit as st
import math
import pandas as pd
import plotly.graph_objects as go
from fpdf import FPDF
from datetime import datetime
import os

# 1. Настройка страницы
st.set_page_config(
    page_title="Integral BioAge Pro", 
    page_icon="🧬", 
    layout="wide",
    initial_sidebar_state="collapsed"
)

# CSS стили для улучшения UX
st.markdown("""
<style>
    /* Основные стили контейнера */
    .main-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
    }
    
    /* Улучшенные карточки */
    .test-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        margin: 1.5rem 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    /* Заголовки */
    h1 {
        text-align: center;
        color: #1f2937;
        margin-bottom: 0.5rem;
    }
    
    h2, h3 {
        color: #374151;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    
    /* Кнопки */
    .stButton > button {
        border-radius: 8px;
        padding: 0.75rem 2rem;
        font-weight: 600;
        transition: all 0.3s;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    /* Поля ввода */
    .stTextInput > div > div > input,
    .stNumberInput > div > div > input,
    .stSelectbox > div > div > select {
        border-radius: 8px;
        border: 2px solid #e5e7eb;
        padding: 0.75rem;
    }
    
    .stTextInput > div > div > input:focus,
    .stNumberInput > div > div > input:focus {
        border-color: #636EFA;
        box-shadow: 0 0 0 3px rgba(99, 110, 250, 0.1);
    }
    
    /* Слайдеры */
    .stSlider > div > div {
        padding: 1rem 0;
    }
    
    /* Прогресс бар */
    .stProgress > div > div > div {
        background: linear-gradient(90deg, #636EFA 0%, #8B5CF6 100%);
        border-radius: 10px;
    }
    
    /* Метрики */
    [data-testid="stMetricValue"] {
        font-size: 2rem;
        font-weight: 700;
    }
    
    /* Отступы для контента */
    .content-section {
        padding: 1.5rem 0;
    }
    
    /* Результаты */
    .result-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        margin: 2rem 0;
    }
    
    /* Форма отзывов */
    .feedback-form {
        background: #f9fafb;
        padding: 2rem;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
        margin: 2rem 0;
    }
    
    /* Адаптивность */
    @media (max-width: 768px) {
        .main-container {
            padding: 1rem;
        }
        
        .test-card {
            padding: 1.5rem;
        }
    }
    
    /* Скрытие элементов Streamlit */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# 2. Логика расчетов с кэшированием для оптимизации

@st.cache_data
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

@st.cache_data
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

# 4. Функция для получения текста описания результатов
def get_result_description(ba_integral, u_age, u_diff, ba_pheno, ba_voitenko):
    """Генерирует подробное описание результатов"""
    
    if u_diff <= -3:
        status = "Превосходно"
        emoji = "🌟"
        color = "success"
        main_text = f"""
        **{emoji} Поздравляем, {status.lower()}!**
        
        Ваш биологический возраст составляет **{ba_integral} лет**, что на **{abs(u_diff)} лет меньше** вашего паспортного возраста ({u_age} лет). 
        Это выдающийся результат, который говорит о том, что ваш организм функционирует на уровне человека значительно моложе вас.
        
        **Что это означает:**
        
        Вы демонстрируете отличные показатели здоровья на клеточном и функциональном уровнях. Ваши биохимические маркеры крови (PhenoAge: {ba_pheno} лет) и функциональные резервы организма (метод Войтенко: {ba_voitenko} лет) работают в синергии, создавая мощный эффект омоложения.
        
        **Ваши сильные стороны:**
        
        - ✅ Отличное состояние сердечно-сосудистой системы
        - ✅ Эффективная работа иммунной системы
        - ✅ Хорошие метаболические показатели
        - ✅ Высокие функциональные резервы организма
        
        **Рекомендации:**
        
        Продолжайте поддерживать текущий образ жизни! Ваши привычки явно работают на вас. Рекомендуется:
        - Регулярно проходить профилактические обследования
        - Поддерживать текущий уровень физической активности
        - Следить за качеством сна и питания
        """
    elif u_diff <= -1:
        status = "Отлично"
        emoji = "✨"
        color = "success"
        main_text = f"""
        **{emoji} {status}!**
        
        Ваш биологический возраст **{ba_integral} лет** меньше паспортного на **{abs(u_diff)} лет**. 
        Это отличный результат, показывающий, что вы моложе своих лет!
        
        **Анализ показателей:**
        
        - **PhenoAge (биохимия):** {ba_pheno} лет — ваши клетки работают эффективно
        - **Метод Войтенко (функциональные тесты):** {ba_voitenko} лет — хорошие резервы организма
        
        **Что это значит:**
        
        Ваш организм демонстрирует здоровое старение. Биохимические процессы протекают оптимально, а функциональные системы работают слаженно. Это говорит о правильном образе жизни и хорошей генетической предрасположенности.
        
        **Рекомендации для поддержания результата:**
        
        - Продолжайте регулярные физические нагрузки
        - Поддерживайте сбалансированное питание
        - Управляйте стрессом
        - Регулярно проходите медицинские обследования
        """
    elif u_diff <= 2:
        status = "Нормально"
        emoji = "📊"
        color = "info"
        main_text = f"""
        **{emoji} {status}**
        
        Ваш биологический возраст **{ba_integral} лет** близок к паспортному ({u_age} лет). 
        Разница составляет {u_diff} лет, что находится в пределах нормы.
        
        **Детальный анализ:**
        
        - **PhenoAge:** {ba_pheno} лет
        - **Метод Войтенко:** {ba_voitenko} лет
        
        **Интерпретация:**
        
        Ваш биологический возраст соответствует паспортному, что является нормальным показателем. Однако есть потенциал для улучшения! Небольшие изменения в образе жизни могут помочь вам "омолодить" свой биологический возраст.
        
        **Рекомендации для улучшения:**
        
        🏃 **Физическая активность:**
        - Регулярные кардиотренировки (150 минут в неделю)
        - Силовые упражнения 2-3 раза в неделю
        - Ежедневная ходьба не менее 10,000 шагов
        
        🥗 **Питание:**
        - Средиземноморская диета или её элементы
        - Ограничение обработанных продуктов
        - Достаточное потребление воды (30 мл на 1 кг веса)
        
        😴 **Сон и восстановление:**
        - 7-9 часов качественного сна ежедневно
        - Регулярный режим сна и бодрствования
        - Техники релаксации (медитация, йога)
        
        🧘 **Управление стрессом:**
        - Практики осознанности
        - Хобби и увлечения
        - Социальные связи
        """
    else:
        status = "Требует внимания"
        emoji = "⚠️"
        color = "warning"
        main_text = f"""
        **{emoji} {status}**
        
        Ваш биологический возраст **{ba_integral} лет** превышает паспортный на **{u_diff} лет**. 
        Это сигнал о том, что стоит обратить внимание на образ жизни и здоровье.
        
        **Анализ показателей:**
        
        - **PhenoAge:** {ba_pheno} лет
        - **Метод Войтенко:** {ba_voitenko} лет
        
        **Что это означает:**
        
        Организм стареет быстрее, чем должен. Это может быть связано с различными факторами: образом жизни, питанием, уровнем стресса, недостатком физической активности или наличием хронических заболеваний.
        
        **Важно понимать:**
        
        Это не приговор, а возможность для позитивных изменений! Биологический возраст можно улучшить, изменив образ жизни. Многие исследования показывают, что даже в зрелом возрасте можно "омолодить" свой биологический возраст на несколько лет.
        
        **Рекомендации для улучшения:**
        
        🏥 **Медицинское обследование:**
        - Консультация с врачом для выявления возможных проблем
        - Полный анализ крови и мочи
        - Проверка гормонального фона
        - Оценка сердечно-сосудистой системы
        
        🏃 **Физическая активность (приоритет):**
        - Начните с умеренных нагрузок (ходьба, плавание)
        - Постепенно увеличивайте интенсивность
        - Добавьте силовые тренировки
        - Цель: 150-300 минут активности в неделю
        
        🥗 **Питание:**
        - Консультация с диетологом
        - Уменьшение сахара и обработанных продуктов
        - Увеличение овощей, фруктов, цельнозерновых
        - Контроль порций
        - Интервальное голодание (после консультации с врачом)
        
        😴 **Сон:**
        - Установите режим: ложитесь и вставайте в одно время
        - Создайте ритуал перед сном
        - Оптимизируйте спальное место
        - Ограничьте экраны за 2 часа до сна
        
        🧘 **Стресс-менеджмент:**
        - Техники дыхания и медитации
        - Регулярные перерывы в работе
        - Хобби и увлечения
        - При необходимости — работа с психологом
        
        **Начните с малого:**
        
        Не пытайтесь изменить всё сразу. Выберите 2-3 наиболее важных пункта и начните с них. Малые, но постоянные изменения дают лучшие результаты, чем радикальные перемены.
        """
    
    return main_text, color

# 5. Интерфейс в формате теста с улучшенным UX
st.markdown('<div class="main-container">', unsafe_allow_html=True)

st.title("🧬 Интегральный расчет биологического возраста")
st.markdown('<p style="text-align: center; color: #6b7280; font-size: 1.1rem; margin-bottom: 2rem;">Пройдите тест для определения вашего биологического возраста</p>', unsafe_allow_html=True)

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
    st.markdown('<div class="content-section">', unsafe_allow_html=True)
    st.markdown("---")
    st.markdown("### 👤 Шаг 1: Ваш профиль")
    st.markdown('<p style="color: #6b7280; margin-bottom: 2rem;">Пожалуйста, укажите основную информацию о себе</p>', unsafe_allow_html=True)
    
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
    
    st.markdown('</div>', unsafe_allow_html=True)

# Шаг 2: Анализ крови
elif st.session_state.test_step == 2:
    show_progress(2)
    st.markdown('<div class="content-section">', unsafe_allow_html=True)
    st.markdown("---")
    st.markdown("### 🩸 Шаг 2: Результаты анализа крови")
    st.markdown('<p style="color: #6b7280; margin-bottom: 2rem;">Введите показатели из вашего последнего анализа крови. Если у вас нет результатов, используйте значения по умолчанию.</p>', unsafe_allow_html=True)
    
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
    
    st.markdown('</div>', unsafe_allow_html=True)

# Шаг 3: Физические тесты
elif st.session_state.test_step == 3:
    show_progress(3)
    st.markdown('<div class="content-section">', unsafe_allow_html=True)
    st.markdown("---")
    st.markdown("### 🏃 Шаг 3: Физические тесты")
    st.markdown('<p style="color: #6b7280; margin-bottom: 2rem;">Выполните простые тесты для оценки функциональных резервов организма</p>', unsafe_allow_html=True)
    
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
    
    st.markdown('</div>', unsafe_allow_html=True)

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

# 6. Основная область: Расчеты и Визуализация (только для шага 4)
if st.session_state.test_step == 4:
    st.markdown('<div class="content-section">', unsafe_allow_html=True)
    
    st.markdown("### 📊 Ваши результаты")
    st.markdown(f'<p style="font-size: 1.1rem; color: #374151; margin-bottom: 2rem;">**{u_name}**, вот результаты анализа вашего биологического возраста:</p>', unsafe_allow_html=True)
    
    ba_pheno = calculate_phenoage(u_age, alb, creat, gluc, crp, lymph, mcv, rdw, alp, wbc)
    ba_voitenko = calculate_voitenko(u_gender, sbp, dbp, bht, sb, bw)

    if ba_pheno and ba_voitenko:
        # Интегральный возраст — среднее двух моделей
        ba_integral = round((ba_pheno + ba_voitenko) / 2, 2)
        u_diff = round(ba_integral - u_age, 1)

        # Метрики с улучшенным дизайном
        st.markdown("#### 📈 Показатели биологического возраста")
        m1, m2, m3 = st.columns(3)
        with m1:
            st.markdown('<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; color: white; text-align: center;">', unsafe_allow_html=True)
            st.metric("PhenoAge", f"{ba_pheno} лет", help="Оценка на основе биохимических маркеров")
            st.markdown('</div>', unsafe_allow_html=True)
        
        with m2:
            st.markdown('<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: 12px; color: white; text-align: center;">', unsafe_allow_html=True)
            st.metric("Войтенко", f"{ba_voitenko} лет", help="Оценка на основе функциональных тестов")
            st.markdown('</div>', unsafe_allow_html=True)
        
        with m3:
            st.markdown('<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: 12px; color: white; text-align: center;">', unsafe_allow_html=True)
            st.metric("Интегральный", f"{ba_integral} лет", delta=f"{u_diff} л.", delta_color="inverse", help="Среднее значение двух методов")
            st.markdown('</div>', unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Главный график
        st.markdown("#### 🎯 Визуализация результатов")
        fig = go.Figure(go.Indicator(
            mode = "gauge+number",
            value = ba_integral,
            title = {'text': f"Ваш интегральный возраст: {ba_integral} лет", 'font': {'size': 24}},
            gauge = {
                'axis': {'range': [None, 100], 'tickwidth': 1},
                'bar': {'color': "#636EFA"},
                'steps': [
                    {'range': [0, u_age], 'color': "lightgray"},
                    {'range': [u_age, 100], 'color': "gray"}
                ],
                'threshold': {'line': {'color': "red", 'width': 4}, 'thickness': 0.75, 'value': u_age}
            }
        ))
        fig.update_layout(height=400, margin=dict(l=20, r=20, t=40, b=20))
        st.plotly_chart(fig, use_container_width=True)

        # Подробное описание результатов
        st.markdown("---")
        st.markdown("#### 💡 Подробная интерпретация результатов")
        
        description_text, color_type = get_result_description(ba_integral, u_age, u_diff, ba_pheno, ba_voitenko)
        
        if color_type == "success":
            st.markdown(f'<div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 2rem; border-radius: 8px; margin: 1rem 0;">{description_text}</div>', unsafe_allow_html=True)
        elif color_type == "info":
            st.markdown(f'<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 2rem; border-radius: 8px; margin: 1rem 0;">{description_text}</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 2rem; border-radius: 8px; margin: 1rem 0;">{description_text}</div>', unsafe_allow_html=True)

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
        
        # Форма для отзывов
        st.markdown("---")
        st.markdown("#### 💬 Поделитесь своим мнением")
        st.markdown('<p style="color: #6b7280; margin-bottom: 1rem;">Ваш отзыв поможет нам улучшить сервис и будет полезен другим пользователям.</p>', unsafe_allow_html=True)
        
        with st.form("feedback_form", clear_on_submit=True):
            col1, col2 = st.columns(2)
            with col1:
                feedback_name = st.text_input("Ваше имя (необязательно)", placeholder="Как к вам обращаться?")
            with col2:
                feedback_rating = st.selectbox("Оцените полезность теста", 
                                               ["⭐⭐⭐⭐⭐ Отлично", "⭐⭐⭐⭐ Хорошо", "⭐⭐⭐ Нормально", "⭐⭐ Плохо", "⭐ Очень плохо"])
            
            feedback_text = st.text_area("Ваш отзыв или предложение", 
                                        placeholder="Что вам понравилось? Что можно улучшить? Ваши впечатления от теста...",
                                        height=120)
            
            submitted = st.form_submit_button("📤 Отправить отзыв", type="primary", use_container_width=True)
            
            if submitted:
                if feedback_text.strip():
                    # Здесь можно добавить сохранение в файл или базу данных
                    st.success("✅ Спасибо за ваш отзыв! Ваше мнение очень важно для нас.")
                    # В будущем можно добавить: сохранение в файл, отправку на email, базу данных
                else:
                    st.warning("Пожалуйста, оставьте комментарий в поле отзыва.")
        
        # Кнопка для нового теста
        st.markdown("---")
        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            if st.button("🔄 Пройти тест заново", use_container_width=True):
                st.session_state.test_step = 1
                st.session_state.test_data = {}
                st.rerun()
        
        st.markdown('</div>', unsafe_allow_html=True)

# 7. Научный блок (показывается на всех шагах)
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

# Закрытие основного контейнера
st.markdown('</div>', unsafe_allow_html=True)
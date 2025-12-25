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

# 4. Интерфейс (Боковая панель)
st.title("🧬 Интегральный расчет биологического возраста")

with st.sidebar:
    st.header("👤 Профиль и данные")
    u_name = st.text_input("Имя", "Ввести имя")
    u_gender = st.selectbox("Пол", ["Мужской", "Женский"])
    u_age = st.number_input("Возраст в паспорте", 18, 100, 35)
    
    st.divider()
    tab_blood, tab_phys = st.tabs(["🩸 Анализ крови", "🏃 Тесты"])
    
    with tab_blood:
        # Маркеры для PhenoAge
        alb = st.slider("Альбумин (г/л)", 30.0, 55.0, 45.0)
        creat = st.slider("Креатинин (мкмоль/л)", 30.0, 150.0, 80.0)
        gluc = st.slider("Глюкоза (ммоль/л)", 3.0, 15.0, 5.0)
        crp = st.number_input("СРБ (мг/л)", 0.0, 50.0, 1.0)
        lymph = st.slider("Лимфоциты (%)", 5.0, 60.0, 30.0)
        mcv = st.slider("MCV (фл)", 70.0, 110.0, 90.0)
        rdw = st.slider("RDW (%)", 10.0, 20.0, 13.0)
        alp = st.slider("Щел. фосфатаза", 30.0, 150.0, 65.0)
        wbc = st.slider("Лейкоциты", 2.0, 15.0, 6.0)

    with tab_phys:
        # Данные для Войтенко
        sbp = st.number_input("Сист. АД (верхнее)", 90, 200, 120)
        dbp = st.number_input("Диаст. АД (нижнее)", 60, 120, 80)
        bht = st.slider("Задержка дыхания (сек)", 5, 120, 45)
        sb = st.slider("Балансировка (сек)", 1, 120, 20)
        bw = st.number_input("Вес (кг)", 40, 160, 75)

# 5. Основная область: Расчеты и Визуализация

ba_pheno = calculate_phenoage(u_age, alb, creat, gluc, crp, lymph, mcv, rdw, alp, wbc)
ba_voitenko = calculate_voitenko(u_gender, sbp, dbp, bht, sb, bw)

if ba_pheno and ba_voitenko:
    # Интегральный возраст — среднее двух моделей
    ba_integral = round((ba_pheno + ba_voitenko) / 2, 2)
    u_diff = round(ba_integral - u_age, 1)

    # Метрики
    m1, m2, m3 = st.columns(3)
    m1.metric("PhenoAge (Кровь)", f"{ba_pheno}")
    m2.metric("Войтенко (Тесты)", f"{ba_voitenko}")
    m3.metric("Интегральный результат", f"{ba_integral}", delta=f"{u_diff} л.", delta_color="inverse")

    # Главный график
    fig = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = ba_integral,
        title = {'text': "Ваш интегральный возраст", 'font': {'size': 24}},
        gauge = {
            'axis': {'range': [None, 100], 'tickwidth': 1},
            'bar': {'color': "#636EFA"},
            'threshold': {'line': {'color': "red", 'width': 4}, 'thickness': 0.75, 'value': u_age}
        }
    ))
    st.plotly_chart(fig, use_container_width=True)

    # Резюме
    if u_diff <= 0:
        st.success(f"✨ Итоговый индекс: вы моложе паспорта на {abs(u_diff)} л. Отличная синергия показателей!")
    else:
        st.warning(f"⚠️ Итоговый индекс: выше паспортного на {u_diff} л. Обратите внимание на слабые зоны.")

    # PDF Кнопка
    if st.button("📄 Сформировать полный PDF отчет"):
        m_list = {"СРБ": crp, "Глюкоза": gluc, "Давление": f"{sbp}/{dbp}", "Баланс": f"{sb} сек"}
        pdf_out = create_pdf(u_name, u_gender, u_age, ba_pheno, ba_voitenko, ba_integral, u_diff, m_list)
        if pdf_out:
            st.download_button("💾 Скачать отчет", data=bytes(pdf_out), file_name=f"Integral_Age_{u_name}.pdf")

# 6. Научный блок
st.divider()
st.markdown("### 🔬 О методологии синтеза")
st.write("""
Данная модель объединяет два фундаментальных подхода к долголетию:
1. **PhenoAge (Yale University):** Оценивает риск смертности и темпы старения на клеточном уровне через 9 маркеров крови.
2. **Метод Войтенко (НИИ Геронтологии):** Проверенная временем советская система оценки функциональных резервов сердечно-сосудистой системы и вестибулярного аппарата.

**Интегральный показатель** считается более устойчивым к краткосрочным колебаниям состояния организма.
""")
import streamlit as st
import math
import pandas as pd
import plotly.graph_objects as go
from fpdf import FPDF
from datetime import datetime
import os

# 1. Настройка страницы
st.set_page_config(page_title="PhenoAge Pro", page_icon="🧬", layout="wide")

# 2. Логика расчета PhenoAge
def calculate_phenoage(age, albumin, creatinine, glucose, crp, lymph_pct, mcv, rdw, alp, wbc):
    try:
        crp_mg_dl = crp / 10 if crp > 0 else 0.01
        xb = (-19.907 - 0.0336 * albumin + 0.0095 * creatinine + 0.1953 * glucose 
              + 0.0954 * math.log(crp_mg_dl) - 0.0120 * lymph_pct + 0.0268 * mcv 
              + 0.3306 * rdw + 0.0019 * alp + 0.0554 * wbc + 0.0804 * age)
        gamma = 0.0076927
        m = 1 - math.exp((-math.exp(xb) * (math.exp(120 * gamma) - 1)) / gamma)
        return round(141.50 + (math.log(-0.00553 * math.log(1 - m))) / 0.090165, 2)
    except:
        return None

# 3. Функция генерации PDF
def create_pdf(name, age, bio_age, diff, markers):
    pdf = FPDF()
    pdf.add_page()
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    font_path = os.path.join(base_dir, "fonts", "DejaVuSans.ttf")
    
    # Проверка на корректность файла шрифта (должен быть > 100 КБ)
    if os.path.exists(font_path) and os.path.getsize(font_path) > 100000:
        pdf.add_font("DejaVu", "", font_path)
        pdf.add_font("DejaVu", "B", font_path)
        pdf.set_font("DejaVu", size=12)
        font_family = "DejaVu"
    else:
        st.error("Файл шрифта поврежден. Пожалуйста, скачайте его заново по ссылке из инструкции.")
        return None

    pdf.set_font(font_family, style='B', size=16)
    pdf.cell(200, 10, txt="Отчет PhenoAge: Анализ биологического возраста", ln=True, align='C')
    pdf.set_font(font_family, size=10)
    pdf.cell(200, 10, txt=f"Дата расчета: {datetime.now().strftime('%d.%m.%Y %H:%M')}", ln=True, align='C')
    pdf.ln(10)
    
    pdf.set_font(font_family, size=12)
    pdf.cell(200, 10, txt=f"Пользователь: {name}", ln=True)
    pdf.ln(5)
    
    # Таблица основных результатов
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font(font_family, style='B', size=12)
    pdf.cell(95, 10, txt="Параметр", border=1, fill=True)
    pdf.cell(95, 10, txt="Значение", border=1, ln=True, fill=True)
    
    pdf.set_font(font_family, size=12)
    for l, v in [("Паспортный возраст", f"{age} лет"), ("Биологический возраст", f"{bio_age} лет"), ("Разница", f"{diff} л.")]:
        pdf.cell(95, 10, txt=l, border=1)
        pdf.cell(95, 10, txt=v, border=1, ln=True)
    
    pdf.ln(10)
    pdf.set_font(font_family, style='B', size=12)
    pdf.cell(200, 10, txt="Введенные показатели биохимии:", ln=True)
    pdf.set_font(font_family, size=10)
    for key, val in markers.items():
        pdf.cell(100, 8, txt=f"{key}", border=1)
        pdf.cell(90, 8, txt=f"{val}", border=1, ln=True)
        
    return pdf.output()

# 4. Интерфейс (Боковая панель)
st.title("🧬 PhenoAge: Анализатор биологического возраста")

with st.sidebar:
    st.header("📋 Данные анализа")
    name = st.text_input("Ваше имя", "Владимир")
    age = st.number_input("Возраст в паспорте", 18, 100, 35)
    st.divider()
    alb = st.slider("Альбумин (г/л)", 30.0, 55.0, 45.0)
    creat = st.slider("Креатинин (мкмоль/л)", 30.0, 150.0, 80.0)
    gluc = st.slider("Глюкоза (ммоль/л)", 3.0, 15.0, 5.0)
    crp = st.number_input("СРБ (мг/л)", 0.0, 50.0, 1.0)
    lymph = st.slider("Лимфоциты (%)", 5.0, 60.0, 30.0)
    mcv = st.slider("MCV (фл)", 70.0, 110.0, 90.0)
    rdw = st.slider("RDW (%)", 10.0, 20.0, 13.0)
    alp = st.slider("Щел. фосфатаза", 30.0, 150.0, 65.0)
    wbc = st.slider("Лейкоциты", 2.0, 15.0, 6.0)

# 5. Расчет и уведомления
bio_age = calculate_phenoage(age, alb, creat, gluc, crp, lymph, mcv, rdw, alp, wbc)

if bio_age:
    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(go.Figure(go.Indicator(mode="gauge+number", value=age, title={'text':"Паспортный",'font':{'color':"#1f77b4"}}, gauge={'bar':{'color':"#1f77b4"}})).update_layout(height=300))
    with c2:
        st.plotly_chart(go.Figure(go.Indicator(mode="gauge+number", value=bio_age, title={'text':"Биологический",'font':{'color':"#2ca02c"}}, gauge={'bar':{'color':"#2ca02c"},'threshold':{'line':{'color':"red",'width':4},'value':age}})).update_layout(height=300))

    diff = round(bio_age - age, 1)
    
    # Возвращенный блок уведомлений
    if diff <= 0:
        st.success(f"✨ Великолепно! Вы моложе своего календарного возраста на {abs(diff)} л. Ваши темпы старения ниже среднестатистических.")
    else:
        st.warning(f"⚠️ Внимание: ваш биологический возраст выше календарного на {diff} л. Это может указывать на ускоренные темпы старения.")

    # Кнопка формирования отчета
    if st.button("📄 Сформировать PDF отчет"):
        m_dict = {"Альбумин": alb, "Креатинин": creat, "Глюкоза": gluc, "СРБ": crp, "Лимфоциты %": lymph, "MCV": mcv, "RDW": rdw, "Щел. фосфатаза": alp, "Лейкоциты": wbc}
        pdf_b = create_pdf(name, age, bio_age, diff, m_dict)
        if pdf_b:
            st.download_button("💾 Сохранить PDF на диск", data=bytes(pdf_b), file_name=f"PhenoAge_Report_{datetime.now().strftime('%Y%m%d')}.pdf", mime="application/pdf")

# 6. Полный блок обоснования
st.divider()
st.markdown("### 🔬 Научное обоснование и точность модели")
st.write("""
**Почему этому расчёту можно доверять?**
* **Обучение:** Модель PhenoAge обучена на огромном массиве данных **NHANES** (США) с использованием машинного обучения и валидирована на десятках тысяч людей.
* **Маркеры:** В расчёте используются **9 специфических биомаркеров**, которые комплексно отражают состояние печени, почек, метаболизма и иммунной системы.
* **Клиническая значимость:** Доказано, что PhenoAge предсказывает реальные риски возраст-зависимых заболеваний лучше, чем календарный возраст.
""")

with st.expander("📝 Как интерпретировать показатели?"):
    st.write("""
    - **СРБ и Лейкоциты:** Маркеры системного воспаления. Чем они ниже, тем медленнее биологические часы.
    - **Глюкоза:** Избыток сахара ускоряет старение сосудов и тканей.
    - **Альбумин:** Высокий уровень говорит о хорошем питании клеток и работе печени.
    - **RDW:** Показатель вариабельности эритроцитов; его рост часто связан с общим износом организма.
    """)
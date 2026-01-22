import { jsPDF } from 'jspdf';
import type { TestData, Results } from '../types';
import { getResultDescription } from './resultDescription';

// Функция для загрузки шрифта с поддержкой кириллицы
// Для jsPDF 4.0.0 нужно использовать готовый шрифт в формате, который понимает библиотека
async function loadCyrillicFont(doc: jsPDF): Promise<boolean> {
  try {
    // Пробуем загрузить из public папки
    const fontUrl = '/DejaVuSans.ttf';
    const response = await fetch(fontUrl);
    
    if (!response.ok) {
      console.warn('Шрифт не найден в public, используем стандартный');
      return false;
    }
    
    const fontData = await response.arrayBuffer();
    const fontBase64 = btoa(
      String.fromCharCode(...new Uint8Array(fontData))
    );
    
    // Для jsPDF 4.0.0 используем правильный метод добавления шрифта
    // Важно: имя файла должно совпадать с именем в addFont
    const fontFileName = 'DejaVuSans.ttf';
    
    // Добавляем файл в виртуальную файловую систему
    doc.addFileToVFS(fontFileName, fontBase64);
    
    // Добавляем шрифт с правильными параметрами
    // Для jsPDF 4.0.0 нужно указать правильный формат
    try {
      doc.addFont(fontFileName, 'DejaVu', 'normal');
      doc.addFont(fontFileName, 'DejaVu', 'bold');
      console.log('Шрифт успешно загружен');
      return true;
    } catch (fontError) {
      console.error('Ошибка при добавлении шрифта:', fontError);
      // Пробуем альтернативный метод для jsPDF 4.0.0
      // Возможно, нужно использовать другой формат имени
      try {
        doc.addFont(fontFileName, 'DejaVuSans', 'normal');
        doc.addFont(fontFileName, 'DejaVuSans', 'bold');
        return true;
      } catch (altError) {
        console.error('Альтернативный метод также не сработал:', altError);
        return false;
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке шрифта:', error);
    return false;
  }
}

// Вспомогательная функция для установки шрифта
function setFont(doc: jsPDF, fontFamily: string, style: 'normal' | 'bold' = 'normal'): void {
  try {
    doc.setFont(fontFamily, style);
  } catch {
    // Fallback на helvetica
    doc.setFont('helvetica', style);
  }
}

export async function generatePDFReport(testData: TestData, results: Results): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Загружаем шрифт с поддержкой кириллицы
    const fontLoaded = await loadCyrillicFont(doc);
    // Пробуем разные варианты имени шрифта
    let fontFamily = 'helvetica';
    if (fontLoaded) {
      // Пробуем разные варианты имени
      try {
        doc.setFont('DejaVu', 'normal');
        fontFamily = 'DejaVu';
        console.log('Используется шрифт: DejaVu');
      } catch {
        try {
          doc.setFont('DejaVuSans', 'normal');
          fontFamily = 'DejaVuSans';
          console.log('Используется шрифт: DejaVuSans');
        } catch {
          console.warn('Не удалось использовать кастомный шрифт, используем helvetica');
          fontFamily = 'helvetica';
        }
      }
    }
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Цвета
    const primaryColor = [59, 70, 238]; // #3B46EE
    const grayColor = [128, 128, 128];
    const darkGrayColor = [64, 64, 64];

    // Заголовок
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    setFont(doc, fontFamily, 'bold');
    doc.text('Отчет о биологическом возрасте', pageWidth / 2, 25, { align: 'center' });

    yPosition = 50;

    // Дата генерации
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFontSize(10);
    setFont(doc, fontFamily, 'normal');
    const dateStr = new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Дата расчета: ${dateStr}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Данные пользователя
    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2]);
    doc.setFontSize(14);
    setFont(doc, fontFamily, 'bold');
    doc.text('Данные пользователя', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    setFont(doc, fontFamily, 'normal');
    doc.text(`Пол: ${testData.gender}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Паспортный возраст: ${testData.age} лет`, margin, yPosition);
    yPosition += 15;

    // Основные результаты
    doc.setFontSize(14);
    setFont(doc, fontFamily, 'bold');
    doc.text('Основные результаты', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    setFont(doc, fontFamily, 'normal');
    
    // Таблица результатов
    const resultsData = [
      ['Параметр', 'Значение'],
      ['Биологический возраст (интегральный)', `${results.integral.toFixed(1)} лет`],
      ['PhenoAge (Yale University)', `${results.phenoAge.toFixed(1)} лет`],
      ['Метод Войтенко (НИИ Геронтологии)', `${results.voitenko.toFixed(1)} лет`],
      ['Разница с паспортным возрастом', `${results.difference > 0 ? '+' : ''}${results.difference.toFixed(1)} лет`],
    ];

    // Рисуем таблицу
    const colWidths = [120, 60];
    const rowHeight = 8;
    const startX = margin;
    let currentY = yPosition;

    // Заголовок таблицы
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, currentY - 6, colWidths[0] + colWidths[1], rowHeight, 'F');
    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2]);
    setFont(doc, fontFamily, 'bold');
    doc.text(resultsData[0][0], startX + 2, currentY);
    doc.text(resultsData[0][1], startX + colWidths[0] + 2, currentY);
    currentY += rowHeight;

    // Данные таблицы
    setFont(doc, fontFamily, 'normal');
    for (let i = 1; i < resultsData.length; i++) {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = margin;
      }
      doc.rect(startX, currentY - 6, colWidths[0] + colWidths[1], rowHeight, 'S');
      doc.text(resultsData[i][0], startX + 2, currentY);
      doc.text(resultsData[i][1], startX + colWidths[0] + 2, currentY);
      currentY += rowHeight;
    }

    yPosition = currentY + 10;

    // Описание результатов
    const description = getResultDescription(results, testData.age);
    
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    setFont(doc, fontFamily, 'bold');
    doc.text('Интерпретация результатов', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    setFont(doc, fontFamily, 'normal');
    const descriptionLines = doc.splitTextToSize(description.text, pageWidth - 2 * margin);
    doc.text(descriptionLines, margin, yPosition);
    yPosition += descriptionLines.length * 5 + 10;

    // Детальная информация о методах
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    setFont(doc, fontFamily, 'bold');
    doc.text('Детальная информация о методах оценки', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    setFont(doc, fontFamily, 'bold');
    doc.text('PhenoAge (Yale University)', margin, yPosition);
    yPosition += 6;
    setFont(doc, fontFamily, 'normal');
    doc.setFontSize(10);
    const phenoAgeDesc = doc.splitTextToSize(
      'Этот метод анализирует 9 маркеров крови для оценки риска смертности и темпов старения на клеточном уровне.',
      pageWidth - 2 * margin
    );
    doc.text(phenoAgeDesc, margin, yPosition);
    yPosition += phenoAgeDesc.length * 5 + 8;

    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(11);
    setFont(doc, fontFamily, 'bold');
    doc.text('Метод Войтенко (НИИ Геронтологии)', margin, yPosition);
    yPosition += 6;
    setFont(doc, fontFamily, 'normal');
    doc.setFontSize(10);
    const voitenkoDesc = doc.splitTextToSize(
      'Этот метод оценивает функциональные резервы сердечно-сосудистой системы и вестибулярного аппарата.',
      pageWidth - 2 * margin
    );
    doc.text(voitenkoDesc, margin, yPosition);
    yPosition += voitenkoDesc.length * 5 + 10;

    // Введенные данные (если есть место)
    if (yPosition < pageHeight - 100) {
      doc.setFontSize(14);
      setFont(doc, fontFamily, 'bold');
      doc.text('Введенные показатели', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      setFont(doc, fontFamily, 'normal');
      
      const bloodData = [
        ['Альбумин', `${testData.alb} г/л`],
        ['Креатинин', `${testData.creat} мкмоль/л`],
        ['Глюкоза', `${testData.gluc} ммоль/л`],
        ['СРБ', `${testData.crp} мг/л`],
        ['Лимфоциты', `${testData.lymph} %`],
        ['MCV', `${testData.mcv} фл`],
        ['RDW', `${testData.rdw} %`],
        ['Щелочная фосфатаза', `${testData.alp} Ед/л`],
        ['Лейкоциты', `${testData.wbc} ×10⁹/л`],
      ];

      const physicalData = [
        ['Систолическое давление', `${testData.sbp} мм рт.ст.`],
        ['Диастолическое давление', `${testData.dbp} мм рт.ст.`],
        ['Задержка дыхания', `${testData.bht} сек`],
        ['Балансировка', `${testData.sb} сек`],
        ['Вес', `${testData.bw} кг`],
      ];

      const dataColWidths = [100, 80];
      const dataRowHeight = 6;
      let dataY = yPosition;

      setFont(doc, fontFamily, 'bold');
      doc.text('Биохимические показатели крови:', margin, dataY);
      dataY += 6;
      setFont(doc, fontFamily, 'normal');

      bloodData.forEach(([label, value]) => {
        if (dataY > pageHeight - 20) {
          doc.addPage();
          dataY = margin;
        }
        doc.text(label, margin, dataY);
        doc.text(value, margin + dataColWidths[0], dataY);
        dataY += dataRowHeight;
      });

      dataY += 3;
      setFont(doc, fontFamily, 'bold');
      doc.text('Физические показатели:', margin, dataY);
      dataY += 6;
      setFont(doc, fontFamily, 'normal');

      physicalData.forEach(([label, value]) => {
        if (dataY > pageHeight - 20) {
          doc.addPage();
          dataY = margin;
        }
        doc.text(label, margin, dataY);
        doc.text(value, margin + dataColWidths[0], dataY);
        dataY += dataRowHeight;
      });
    }

    // Футер на каждой странице
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(
        `Страница ${i} из ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Сохранение файла
    const fileName = `PhenoAge_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error);
    alert('Произошла ошибка при генерации отчета. Попробуйте позже или обновите страницу.');
  }
}

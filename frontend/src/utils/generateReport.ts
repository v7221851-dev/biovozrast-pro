import { jsPDF } from 'jspdf';
import type { TestData, Results } from '../types';
import { getResultDescription } from './resultDescription';

export function generatePDFReport(testData: TestData, results: Results): void {
  try {
    const doc = new jsPDF();
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
  doc.setFont('helvetica', 'bold');
  doc.text('Отчет о биологическом возрасте', pageWidth / 2, 25, { align: 'center' });

  yPosition = 50;

  // Дата генерации
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  doc.text('Данные пользователя', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Пол: ${testData.gender}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Паспортный возраст: ${testData.age} лет`, margin, yPosition);
  yPosition += 15;

  // Основные результаты
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Основные результаты', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
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
  doc.setFont('helvetica', 'bold');
  doc.text(resultsData[0][0], startX + 2, currentY);
  doc.text(resultsData[0][1], startX + colWidths[0] + 2, currentY);
  currentY += rowHeight;

  // Данные таблицы
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  doc.text('Интерпретация результатов', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const descriptionLines = doc.splitTextToSize(description.text, pageWidth - 2 * margin);
  doc.text(descriptionLines, margin, yPosition);
  yPosition += descriptionLines.length * 5 + 10;

  // Детальная информация о методах
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Детальная информация о методах оценки', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PhenoAge (Yale University)', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  doc.text('Метод Войтенко (НИИ Геронтологии)', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
    doc.text('Введенные показатели', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
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

    doc.setFont('helvetica', 'bold');
    doc.text('Биохимические показатели крови:', margin, dataY);
    dataY += 6;
    doc.setFont('helvetica', 'normal');

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
    doc.setFont('helvetica', 'bold');
    doc.text('Физические показатели:', margin, dataY);
    dataY += 6;
    doc.setFont('helvetica', 'normal');

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

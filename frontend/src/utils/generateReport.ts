import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TestData, Results } from '../types';
import { getResultDescription } from './resultDescription';

// Инициализируем pdfmake с шрифтами
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

// Функция для загрузки кастомного шрифта DejaVu Sans с поддержкой кириллицы
async function loadDejaVuFont(): Promise<void> {
  try {
    const fontUrl = '/DejaVuSans.ttf';
    const response = await fetch(fontUrl);
    
    if (!response.ok) {
      console.warn('Не удалось загрузить DejaVu Sans, используем стандартные шрифты');
      return;
    }
    
    const fontData = await response.arrayBuffer();
    // Для pdfmake нужен base64 в формате data URI или просто base64 строка
    const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontData)));
    
    // Регистрируем шрифт в pdfmake
    // pdfmake ожидает base64 строку для каждого варианта шрифта
    (pdfMake as any).fonts = {
      ...(pdfMake as any).fonts,
      DejaVuSans: {
        normal: fontBase64,
        bold: fontBase64, // Используем тот же шрифт для bold
        italics: fontBase64,
        bolditalics: fontBase64,
      },
    };
    
    console.log('✅ Шрифт DejaVu Sans успешно загружен и зарегистрирован');
  } catch (error) {
    console.warn('Ошибка при загрузке шрифта, используем стандартные шрифты:', error);
  }
}

export async function generatePDFReport(testData: TestData, results: Results): Promise<void> {
  try {
    // Загружаем кастомный шрифт
    await loadDejaVuFont();
    
    // Определяем используемый шрифт
    const fontFamily = (pdfMake as any).fonts?.DejaVuSans ? 'DejaVuSans' : 'Roboto';
    
    // Цвета
    const primaryColor = '#3B46EE';
    const grayColor = '#808080';
    const darkGrayColor = '#404040';
    
    // Дата генерации
    const dateStr = new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Описание результатов
    const description = getResultDescription(results, testData.age);
    
    // Определение документа
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: fontFamily,
        fontSize: 11,
        color: darkGrayColor,
      },
      header: {
        margin: [0, 0, 0, 20],
        fillColor: primaryColor,
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: 'Отчет о биологическом возрасте',
                color: '#ffffff',
                fontSize: 20,
                bold: true,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              }
            ]
          ]
        },
        layout: 'noBorders',
      },
      content: [
        // Дата расчета
        {
          text: `Дата расчета: ${dateStr}`,
          fontSize: 10,
          color: grayColor,
          alignment: 'center',
          margin: [0, 0, 0, 15],
        },
        
        // Данные пользователя
        {
          text: 'Данные пользователя',
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 8],
        },
        {
          text: `Пол: ${testData.gender}`,
          fontSize: 11,
          margin: [0, 0, 0, 5],
        },
        {
          text: `Паспортный возраст: ${testData.age} лет`,
          fontSize: 11,
          margin: [0, 0, 0, 15],
        },
        
        // Основные результаты
        {
          text: 'Основные результаты',
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 8],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Параметр', bold: true, fillColor: '#f0f0f0' },
                { text: 'Значение', bold: true, fillColor: '#f0f0f0' }
              ],
              [
                'Биологический возраст (интегральный)',
                `${results.integral.toFixed(1)} лет`
              ],
              [
                'PhenoAge (Yale University)',
                `${results.phenoAge.toFixed(1)} лет`
              ],
              [
                'Метод Войтенко (НИИ Геронтологии)',
                `${results.voitenko.toFixed(1)} лет`
              ],
              [
                'Разница с паспортным возрастом',
                `${results.difference > 0 ? '+' : ''}${results.difference.toFixed(1)} лет`
              ],
            ]
          },
          margin: [0, 0, 0, 15],
        },
        
        // Интерпретация результатов
        {
          text: 'Интерпретация результатов',
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 8],
        },
        {
          text: description.text,
          fontSize: 10,
          margin: [0, 0, 0, 15],
        },
        
        // Детальная информация о методах
        {
          text: 'Детальная информация о методах оценки',
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 8],
        },
        {
          text: 'PhenoAge (Yale University)',
          fontSize: 11,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        {
          text: 'Этот метод анализирует 9 маркеров крови для оценки риска смертности и темпов старения на клеточном уровне.',
          fontSize: 10,
          margin: [0, 0, 0, 10],
        },
        {
          text: 'Метод Войтенко (НИИ Геронтологии)',
          fontSize: 11,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        {
          text: 'Этот метод оценивает функциональные резервы сердечно-сосудистой системы и вестибулярного аппарата.',
          fontSize: 10,
          margin: [0, 0, 0, 15],
        },
        
        // Введенные показатели
        {
          text: 'Введенные показатели',
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 8],
        },
        {
          text: 'Биохимические показатели крови:',
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        {
          ul: [
            `Альбумин: ${testData.alb.toFixed(1)} г/л`,
            `Креатинин: ${testData.creat.toFixed(1)} мкмоль/л`,
            `Глюкоза: ${testData.gluc.toFixed(1)} ммоль/л`,
            `СРБ: ${testData.crp.toFixed(1)} мг/л`,
            `Лимфоциты: ${testData.lymph.toFixed(1)} %`,
            `MCV: ${testData.mcv.toFixed(1)} фл`,
            `RDW: ${testData.rdw.toFixed(1)} %`,
            `Щелочная фосфатаза: ${testData.alp.toFixed(1)} Ед/л`,
            `Лейкоциты: ${testData.wbc.toFixed(1)} ×10⁹/л`,
          ],
          fontSize: 10,
          margin: [0, 0, 0, 10],
        },
        {
          text: 'Физические показатели:',
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        {
          ul: [
            `Систолическое давление: ${testData.sbp} мм рт.ст.`,
            `Диастолическое давление: ${testData.dbp} мм рт.ст.`,
            `Задержка дыхания: ${testData.bht} сек`,
            `Балансировка: ${testData.sb} сек`,
            `Вес: ${testData.bw} кг`,
          ],
          fontSize: 10,
          margin: [0, 0, 0, 15],
        },
      ],
      footer: function(currentPage: number, pageCount: number) {
        return {
          text: `Страница ${currentPage} из ${pageCount}`,
          fontSize: 8,
          color: grayColor,
          alignment: 'center',
          margin: [0, 10, 0, 0],
        };
      },
    };
    
    // Генерируем и скачиваем PDF
    const pdfDoc = (pdfMake as any).createPdf(docDefinition);
    const fileName = `PhenoAge_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdfDoc.download(fileName);
    
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error);
    alert('Произошла ошибка при генерации отчета. Попробуйте позже или обновите страницу.');
  }
}

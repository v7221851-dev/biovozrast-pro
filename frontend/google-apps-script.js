// Код для Google Apps Script
// Скопируйте этот код в Google Apps Script (Расширения → Apps Script в Google Sheets)

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Добавляем строку с данными
    const row = [
      new Date().toLocaleString('ru-RU', {
        timeZone: 'Europe/Moscow',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      data.rating || '',
      data.feedback || '',
      data.age || '',
      data.gender || '',
      data.biologicalAge || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Функция для тестирования (опционально)
function test() {
  const testData = {
    rating: 5,
    feedback: 'Тестовый отзыв',
    age: 35,
    gender: 'Мужской',
    biologicalAge: 48.1
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  doPost(mockEvent);
}

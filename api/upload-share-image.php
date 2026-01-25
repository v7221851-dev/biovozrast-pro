<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No image file or upload error']);
    exit;
}

$file = $_FILES['image'];
$uploadDir = __DIR__ . '/../share-images/';
$allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

// Создаем директорию, если не существует
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Генерируем уникальное имя файла на основе параметров
$age = isset($_POST['age']) ? intval($_POST['age']) : 0;
$bioAge = isset($_POST['bioAge']) ? floatval($_POST['bioAge']) : 0;
$hash = md5($age . '_' . $bioAge . '_' . time());
$fileName = 'share_' . $hash . '.png';
$filePath = $uploadDir . $fileName;

// Проверяем тип файла
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type: ' . $mimeType]);
    exit;
}

// Проверяем размер файла (макс 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large']);
    exit;
}

// Перемещаем файл
if (move_uploaded_file($file['tmp_name'], $filePath)) {
    // Устанавливаем правильные права
    chmod($filePath, 0644);
    
    // Определяем базовый URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host;
    
    $publicUrl = $baseUrl . '/share-images/' . $fileName;
    echo json_encode(['url' => $publicUrl]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to upload file']);
}
?>

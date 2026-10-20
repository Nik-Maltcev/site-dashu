<?php
// Shared-hosting gateway to the existing DASHU consultation backend.
// Credentials, photographs and conversations are never persisted here.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function fail_request($status, $message) {
    http_response_code($status);
    echo json_encode(array('error' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'POST') {
    header('Allow: GET, POST');
    fail_request(405, 'Метод не поддерживается.');
}

$body = null;
if ($method === 'POST') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $originHost = parse_url($origin, PHP_URL_HOST);
    $originPort = parse_url($origin, PHP_URL_PORT);
    $originScheme = parse_url($origin, PHP_URL_SCHEME);
    $originAuthority = strtolower((string)$originHost . ($originPort ? ':' . $originPort : ''));
    if (!in_array($originScheme, array('http', 'https'), true) ||
        $originAuthority !== strtolower($_SERVER['HTTP_HOST'] ?? '')) {
        fail_request(403, 'Открой консультацию на сайте DASHU.');
    }
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
        fail_request(415, 'Нужен JSON-запрос.');
    }
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 2400000) {
        fail_request(413, 'Фото слишком большое. Попробуй другой снимок.');
    }
    $input = fopen('php://input', 'rb');
    $body = stream_get_contents($input, 2400001);
    fclose($input);
    if ($body === false || strlen($body) > 2400000) {
        fail_request(413, 'Фото слишком большое. Попробуй другой снимок.');
    }
    if (!is_array(json_decode($body, true)) || json_last_error() !== JSON_ERROR_NONE) {
        fail_request(400, 'Не удалось прочитать запрос.');
    }
}

if (!function_exists('curl_init')) {
    fail_request(503, 'Консультация временно недоступна. Попробуй чуть позже.');
}

// This is a fixed, owner-controlled backend, never a client-supplied URL.
$backend = 'https://dashu-showcase-one.vercel.app';
$curl = curl_init($backend . '/api/stylist');
curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 44,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_HTTPHEADER => array('Content-Type: application/json', 'Origin: ' . $backend),
));
if ($method === 'POST') {
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
}
$response = curl_exec($curl);
$status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);
if ($response === false || $status < 200 || $status >= 600 ||
    !is_array(json_decode($response, true)) || json_last_error() !== JSON_ERROR_NONE) {
    fail_request(502, 'Стилист сейчас не отвечает. Попробуй ещё раз — твой вопрос сохранён.');
}
if ($status === 429) {
    header('Retry-After: 600');
}
http_response_code($status);
echo $response;

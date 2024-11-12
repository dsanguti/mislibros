<?php

// Mostrar errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cambiar CORS y protocolo a HTTP para pruebas locales
header('Access-Control-Allow-Origin: http://localhost:5173'); // HTTP en vez de HTTPS
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de sesión
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', 'false'); // Cambiar a false para desarrollo sin HTTPS
ini_set('session.cookie_lifetime', '86400'); // Mantiene la sesión por un día

// Establecer la ruta de almacenamiento de la sesión
session_save_path('/Applications/XAMPP/xamppfiles/htdocs/backendMisLibros/api/sessions');
session_set_cookie_params([
    'lifetime' => 86400,           // Mantiene la sesión por un día
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,              // Cambiar a false si usas HTTP
    'httponly' => true,
    'samesite' => 'None'
]);

// Iniciar sesión
session_name("PHPSESSID");
session_start();

// Log de sesión para diagnóstico
error_log('Acceso a sagas.php. PHPSESSID recibido: ' . ($_COOKIE['PHPSESSID'] ?? 'Sin cookie de sesión'));
error_log('Nombre de la sesión actual: ' . session_name());
error_log('ID de sesión actual en sagas.php después de iniciar: ' . session_id());

// Verificar si la sesión está activa
if (!isset($_SESSION['user_id'])) {
    error_log("Usuario no autenticado en sagas.php.");
    echo json_encode(["error" => "Usuario no autenticado."]);
    exit();
}

// Conectar a la base de datos
require 'connect.php';

// Consultar la base de datos
$stmt = $pdo->prepare("
    SELECT saga, coverSaga 
    FROM books 
    WHERE saga IS NOT NULL AND saga != '' AND userid = :userid
    GROUP BY saga
");
$stmt->execute(['userid' => $_SESSION['user_id']]);
$sagas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Log para verificar resultados
error_log('Sagas obtenidas en sagas.php: ' . print_r($sagas, true));

// Respuesta en formato JSON
echo json_encode($sagas);
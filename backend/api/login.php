<?php

// Mostrar errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cambiar CORS y protocolo a HTTP para pruebas locales
header('Access-Control-Allow-Origin: http://localhost:5173'); // HTTP en vez de HTTPS
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
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
error_log('Iniciando sesión...');
session_start();

// Verificar si la cookie PHPSESSID está presente
if (!isset($_COOKIE['PHPSESSID'])) {
    error_log('Cookie PHPSESSID no encontrada en login.php.');
} else {
    error_log('Cookie PHPSESSID encontrada: ' . $_COOKIE['PHPSESSID']);
}

// Conectar a la base de datos
require 'connect.php';

$data = json_decode(file_get_contents("php://input"), true);
$user = $data['user'] ?? '';
$password = $data['password'] ?? '';

// Verificar si los datos están vacíos
if (empty($user) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Usuario o contraseña vacíos."]);
    exit;
}

// Consulta a la base de datos para autenticar al usuario
$stmt = $pdo->prepare("SELECT * FROM users WHERE user = :user");
$stmt->execute(['user' => $user]);
$userData = $stmt->fetch(PDO::FETCH_ASSOC);

// Verificar credenciales
if ($userData && password_verify($password, $userData['password'])) {
    // Almacenar información del usuario en la sesión
    $_SESSION['user_id'] = $userData['id'];
    $_SESSION['username'] = $userData['user'];

    // Registrar el ID de usuario guardado en la sesión para confirmación
    error_log('ID de usuario guardado en la sesión en login.php: ' . $_SESSION['user_id']);
    error_log('Sesión iniciada con éxito. ID de usuario: ' . $_SESSION['user_id']);

    // Responder con los datos del usuario y token
    echo json_encode([
        "status" => "success",
        "id" => $_SESSION['user_id'],
        "name" => $userData['name'],
        "lastname" => $userData['lastname'],
        "mail" => $userData['mail'],
        "token" => bin2hex(random_bytes(16)) // Genera un token (opcional)
    ]);
} else {
    error_log('Error de autenticación para el usuario: ' . $user);
    echo json_encode(["status" => "error", "message" => "Credenciales incorrectas."]);
}

// Cerrar la conexión a la base de datos
$pdo = null;
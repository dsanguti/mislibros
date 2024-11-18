<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true"); // Asegúrate de que esto esté incluido


// Configuración de la sesión
session_set_cookie_params([
    'lifetime' => 86400, // Mantiene la sesión por un día
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false, // Cambiar a true si usas HTTPS
    'httponly' => true,
    'samesite' => 'None'
]);

// Iniciar sesión
session_name("PHPSESSID");
error_log('ID de sesión actual en login.php antes de iniciar: ' . session_id());
session_start();
error_log('ID de sesión actual en login.php después de iniciar: ' . session_id());
// Al inicio del archivo login.php o después de iniciar la sesión
error_log('Encabezados recibidos en login.php: ' . print_r(getallheaders(), true));
error_log('Cookies recibidas en login.php: ' . print_r($_COOKIE, true));

// Resto de tu código en login.php...


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
if (headers_sent()) {
    error_log("Encabezados enviados correctamente en login.php");
} else {
    error_log("No se han enviado encabezados en login.php");
}

if (!empty($_SESSION['user_id'])) {
    error_log("La sesión contiene el ID de usuario: " . $_SESSION['user_id']);
} else {
    error_log("La sesión no tiene un ID de usuario establecido.");
}

error_log("Estado actual de las cookies enviadas:");
foreach (headers_list() as $header) {
    if (stripos($header, 'Set-Cookie') !== false) {
        error_log("Cookie enviada: $header");
    }
}

// Cerrar la conexión a la base de datos
$pdo = null;
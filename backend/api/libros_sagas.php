<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: http://localhost:5173"); // Cambia esto si necesitas otro origen
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Configuración de la sesión
session_set_cookie_params([
    'lifetime' => 86400, // Mantener la sesión por un día
    'path' => '/',
    'domain' => 'localhost', // Asegura compatibilidad con subdominios (ajusta si es necesario)
    'secure' => false, // Cambia a true si usas HTTPS
    'httponly' => true, // Previene acceso desde JavaScript
    'samesite' => 'None', // Necesario para solicitudes de origen cruzado
]);

// Iniciar sesión
session_name("PHPSESSID");
session_start();

// Registrar todas las cookies recibidas
error_log('Cookies recibidas en sagas.php: ' . print_r($_COOKIE, true));
// Al inicio del archivo sagas.php o después de verificar la sesión
error_log('Encabezados recibidos en sagas.php: ' . print_r(getallheaders(), true));
error_log('Cookies recibidas en sagas.php: ' . print_r($_COOKIE, true));

// Resto de tu código en sagas.php...

// Verificar el valor específico de PHPSESSID
if (isset($_COOKIE['PHPSESSID'])) {
    error_log('PHPSESSID recibido en sagas.php: ' . $_COOKIE['PHPSESSID']);
} else {
    error_log('PHPSESSID no recibido en sagas.php.');
}

// Log para diagnosticar sesión actual
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

// Comprobamos si se ha pasado el parámetro saga
if (isset($_GET['saga'])) {
    $saga = $_GET['saga'];

    // Consulta SQL para obtener los libros de la saga especificada
    $stmt = $pdo->prepare("SELECT * FROM books WHERE saga = :saga");
    $stmt->execute(['saga' => $saga]);

    // Obtenemos los resultados y los devolvemos en formato JSON
    $libros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($libros);
} else {
    // Si no se pasa el parámetro saga, devolvemos un error
    http_response_code(400);
    echo json_encode(['error' => 'No se ha proporcionado una saga']);
}
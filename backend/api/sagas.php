<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: http://localhost:5173"); // Cambia esto si necesitas otro origen
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Si es una solicitud OPTIONS (preflight), responder inmediatamente
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

// Log para diagnosticar sesión actual
error_log('Nombre de la sesión actual: ' . session_name());
error_log('ID de sesión actual en generos.php después de iniciar: ' . session_id());

// Verificar si la sesión está activa
if (!isset($_SESSION['user_id'])) {
    error_log("Usuario no autenticado en generos.php.");
    echo json_encode(["error" => "Usuario no autenticado."]);
    exit();
}

// Conectar a la base de datos
require 'connect.php';

try {
    // Consultar la base de datos
    $stmt = $pdo->prepare("SELECT genero, coverGenero FROM books WHERE genero IS NOT NULL AND genero != '' AND user_id = :user_id GROUP BY genero");
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    $generos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log para verificar resultados
    error_log('Géneros obtenidos en generos.php: ' . print_r($generos, true));

    // Respuesta en formato JSON
    echo json_encode($generos);
} catch (Exception $e) {
    // Log de errores
    error_log('Error en generos.php: ' . $e->getMessage());
    echo json_encode(["error" => "Error al obtener los géneros."]);
}
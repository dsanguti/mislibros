<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Iniciar sesión
session_start();

// Verificar autenticación
if (!isset($_SESSION['user_id'])) {
    error_log("Usuario no autenticado en Generos.php.");
    echo json_encode(["error" => "Usuario no autenticado."]);
    exit();
}

// Conectar a la base de datos
require 'connect.php';

try {
    $stmt = $pdo->prepare("
        SELECT genero, coverGenero 
        FROM books 
        WHERE genero IS NOT NULL AND genero != '' AND user_id = :user_id
        GROUP BY genero
    ");
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    $generos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    error_log('Géneros obtenidos en Generos.php: ' . print_r($generos, true));

    echo json_encode($generos);
} catch (Exception $e) {
    error_log('Error en Generos.php: ' . $e->getMessage());
    echo json_encode(["error" => "Error al obtener los géneros."]);
}
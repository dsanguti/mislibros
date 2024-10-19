<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Si es una solicitud OPTIONS, devuelves una respuesta vacía con los encabezados apropiados
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    exit(0); 
}

include 'connect.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['user']) && isset($data['password'])) {
    $user = $data['user'];
    $password = $data['password'];

    // Buscar el usuario en la base de datos
    $stmt = $pdo->prepare("SELECT * FROM users WHERE user = ?");
    $stmt->execute([$user]);
    $userData = $stmt->fetch();

    // Log para depuración de la contraseña y el hash
    error_log('Contraseña ingresada: ' . $password);
    error_log('Hash en la base de datos: ' . $userData['password']);

    // Verificar si el usuario existe y si la contraseña es correcta
    if ($userData && password_verify($password, $userData['password'])) {
        // Autenticación exitosa
        echo json_encode([
            'status' => 'success',
            'id' => $userData['id'],
            'name' => $userData['name'],
            'lastname' => $userData['lastname'],
            'mail' => $userData['mail']
        ]);
    } else {
        // Error de autenticación
        echo json_encode(['status' => 'error', 'message' => 'Credenciales incorrectas']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Faltan campos']);
}
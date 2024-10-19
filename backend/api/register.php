<?php

// Incluye tu archivo de conexión
include 'connect.php';

// Datos de ejemplo (cámbialos según necesites)
$username = 'juan';   // Nombre de usuario
$password = 'melilla';    // Contraseña
$name = 'juan';          // Nombre del usuario
$lastname = 'perez';    // Apellido del usuario
$mail = 'juanillo@gmail.com'; // Email del usuario

// Hash de la contraseña
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Inserta el usuario en la base de datos
try {
    $stmt = $pdo->prepare("INSERT INTO users (user, password, name, lastname, mail) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$username, $hashedPassword, $name, $lastname, $mail]);
    echo "Usuario registrado con éxito.";
} catch (PDOException $e) {
    echo "Error al registrar usuario: " . $e->getMessage();
}
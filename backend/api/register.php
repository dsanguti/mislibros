<?php

// Incluye tu archivo de conexión
include 'connect.php';

// Datos de ejemplo (cámbialos según necesites)
$username = 'dani';   // Nombre de usuario
$password = 'melilla';    // Contraseña
$name = 'dani';          // Nombre del usuario
$lastname = 'guti';    // Apellido del usuario
$mail = 'danielillo@gmail.com'; // Email del usuario

// Validar el formato del email (opcional pero recomendado)
if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    die("Correo electrónico no válido");
}

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
?>
<?php
$host = 'localhost';  // Cambia si tu servidor es diferente
$dbname = 'mislibros';
$username = 'root';  // Usuario por defecto en XAMPP
$password = '';  // Dejar vacío si no tienes contraseña

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("La conexión a la base de datos falló: " . $e->getMessage());
}
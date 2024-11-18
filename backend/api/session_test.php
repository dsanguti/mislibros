<?php
// Mostrar errores de PHP
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configuración de sesiones
ini_set('session.save_path', '/Applications/XAMPP/xamppfiles/temp');
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', 'false'); // Cambia a 'true' si usas HTTPS

// Iniciar la sesión
session_start();

// Guardar un valor de prueba en la sesión
$_SESSION['test'] = 'Session test value';

echo "Session ID: " . session_id() . "<br>";
echo "Session path: " . ini_get('session.save_path') . "<br>";
echo "Session test value: " . $_SESSION['test'];
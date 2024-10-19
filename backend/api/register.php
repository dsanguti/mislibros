<?php

// Hash de la contraseña
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
echo "Hash de la contraseña: " . $hashedPassword;
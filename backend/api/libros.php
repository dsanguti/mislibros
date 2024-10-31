<?php
// libros.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'connect.php';

// Verificar si el parámetro 'saga' fue proporcionado
if (isset($_GET['saga'])) {
    $saga = $conn->real_escape_string($_GET['saga']);
    $sql = "SELECT * FROM books WHERE saga = '$saga'";

    $result = $conn->query($sql);
    $libros = [];

    if ($result->num_rows > 0) {
        // Obtener los libros y agregar cada uno al arreglo $libros
        while ($row = $result->fetch_assoc()) {
            $libros[] = [
                'id' => $row['id'],
                'titulo' => $row['titulo'],
                'sinopsis' => $row['sinopsis'],
                'autor' => $row['autor'],
                'genero' => $row['genero'],
                'cover' => $row['file']  // Imagen o portada del libro
            ];
        }
        // Respuesta JSON con los libros de la saga
        echo json_encode($libros);
    } else {
        // Si no hay libros para la saga solicitada
        echo json_encode(['mensaje' => 'No se encontraron libros para esta saga.']);
    }
} else {
    // Si el parámetro 'saga' no está en la solicitud
    echo json_encode(['mensaje' => 'Saga no especificada.']);
}

$conn->close();
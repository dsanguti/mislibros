<h1> <font color= #18abc2> Mis Libros, tu biblioteca siempre a mano. </font></h1>

<h3><font color= #74e0ec> Descripción del proyecto</h3></font>
El siguiente proyecto es una aplicación web de una biblioteca virtual, será el mismo usuario el que vaya subiendo sus libros que tenga en formato digital. Bien arrastrando el archivo o añadiendo el archivo desde la ventana y rellenando un formulario de adición. Del mismo modo el usuario podrá añadir o modificar los géneros y sagas de los que se pueden componer su biblioteca. 
<h3><font color= #74e0ec> Secciones</h3></font>

📚 **Secciones principales:**

- 🏠 **Inicio**: Página principal de la aplicación. Vendrá el listado de todos los libros de la biblioteca del usuario, y se podrá realizar búsqueda de cualquier libro.

- 📑 **Sagas**: Sección donde se filtrarán los libros por sagas. Tiene un carrusel con las sagas, y al hacer clic en una saga del carrusel, saldrá el listado de libros de dicha saga.

- 📖 **Géneros**: Sección donde se filtrarán los libros por su género. Tiene un carrusel con los géneros, y al hacer clic en un género del carrusel, saldrá el listado de libros de dicho género.

- ⭐ **StarWars**: Sección donde se relacionan los libros que sean de starwars. En el formulario de creación de libros o de añadir libros, vendrá un campo para decir si dicho libros es o no de starwars.

- 🎨 **Comics**: Sección donde saldrán los sólo los comics. En el formulario de añadir libros a la biblioteca, vendrá un campo para decir si ese libro es un comic o no.

- ⚙️ **Gestor**: Panel de administración y gestión. Vendrá en esta sección para poder añadir un libro a la biblioteca, o si ya está el libro para poder modificicarlo. También podremos eliminar libros de la biblioteca, así como poder cambiar el tema a oscuro o light.

<h3><font color= #74e0ec>  Stack Tecnológico</h3> </font>
La aplicación es desarrollada para la parte del frontend en REACT, el backend con NODE.js y con base de datos mysql.

<h3><font color= #74e0ec>  Base de datos</h3> </font>
La base de datos consta de las siguientes tablas.

- La tabla "books" con campos: id, titulo, autor, sinopsis, file, cover, starwars, comics, user_id, saga_id, id_genero.

- La tabla "genero" con campos: id, nombre, coverGenero.

- La tabla "sagas" con campos: id, nombre, coverSaga, user_id.

- La tabla "users" con campos: id, user, password, name, lastname, mail, profile.

Las relaciones entre las tablas serían: 
- books.user_id → users.id
- books.saga_id → sagas.id
- books.id_genero → genero.id
- sagas.user_id → users.id
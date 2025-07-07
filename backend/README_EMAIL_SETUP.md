# Configuración del Sistema de Verificación por Email

## Resumen del sistema

- **Tu cuenta**: Configuras UNA cuenta de Gmail para enviar todos los emails
- **Usuarios**: Pueden registrarse con cualquier email (Gmail, Outlook, Yahoo, etc.)
- **Funcionamiento**: Todos los emails se envían DESDE tu cuenta Gmail

## Pasos para configurar

### 1. Configurar Gmail

1. **Habilitar la verificación en dos pasos** en tu cuenta de Gmail
2. **Generar una contraseña de aplicación**:
   - Ve a [myaccount.google.com](https://myaccount.google.com)
   - Seguridad > Verificación en dos pasos > Contraseñas de aplicación
   - Selecciona "Correo" y genera una contraseña de 16 caracteres
   - Guarda esta contraseña

### 2. Configurar las variables de entorno

1. Crea el archivo `.env` en la carpeta `backend`:

   ```bash
   touch .env
   ```

2. Añade la siguiente configuración:

   ```env
   # Configuración de la base de datos
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=mislibros

   # JWT Secret (cambia por una clave segura)
   JWT_SECRET=miClaveSecretaSuperSegura2024

   # TU CUENTA GMAIL (desde donde se envían todos los emails)
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop

   # Puerto del servidor
   PORT=8001
   ```

### 3. Probar el sistema

1. Reinicia el servidor backend
2. Crea un nuevo usuario desde la sección de administración
3. Verifica que se envíe el email de confirmación
4. Haz clic en el enlace de verificación
5. Intenta iniciar sesión con el usuario verificado

## Flujo del sistema

1. **Admin crea usuario** → Se genera token de verificación
2. **Se envía email** → Desde tu cuenta Gmail al email del usuario
3. **Usuario verifica** → Hace clic en el enlace (24h de validez)
4. **Usuario activado** → Puede iniciar sesión

## Ejemplo de uso

```env
# Tu configuración
EMAIL_USER=miempresa@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Usuarios que se registran:**

- `usuario1@yahoo.com` → Recibe email DESDE `miempresa@gmail.com`
- `usuario2@outlook.com` → Recibe email DESDE `miempresa@gmail.com`
- `usuario3@gmail.com` → Recibe email DESDE `miempresa@gmail.com`

## Solución de problemas

### Error: "Error al enviar email"

- Verifica que las credenciales de Gmail sean correctas
- Asegúrate de que la verificación en dos pasos esté habilitada
- Usa la contraseña de aplicación, no tu contraseña normal
- Verifica que "Acceso de aplicaciones menos seguras" esté deshabilitado

### Error: "Token de verificación inválido"

- El token puede haber expirado (24 horas)
- El usuario ya puede estar verificado
- Verifica que el enlace sea correcto

### Error: "Cuenta no verificada"

- El usuario debe verificar su email antes de poder iniciar sesión
- Revisa la carpeta de spam del email
- Solicita un nuevo registro si el token expiró

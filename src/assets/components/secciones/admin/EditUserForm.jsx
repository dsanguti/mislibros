import { useContext, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Admin.module.css";
import { AuthContext } from "../../autenticacion/AuthProvider";
import { useTheme } from "../../hooks/useTheme";
import EyesClosed from "../../icons/EyesClosed";
import EyesOpen from "../../icons/EyesOpen";
import { API_ENDPOINTS } from "../../../../config/api";

const EditUserForm = ({
  user,
  onClose,
  onUpdate,
  canEditProfile = true,
  isAdminEdit = false,
}) => {
  const { updateUser } = useContext(AuthContext);
  const { getCurrentTheme, setThemeMode, saveUserThemePreference } = useTheme();

  const [formData, setFormData] = useState({
    id: user.id,
    user: user.user,
    password: "", // Inicializar vacío para no mostrar la contraseña hasheada
    name: user.name,
    lastname: user.lastname,
    mail: user.mail,
    profile: user.profile,
    theme: user.theme || getCurrentTheme(), // Agregar campo de tema
    verificado: isAdminEdit ? (user.is_verified ? "1" : "0") : undefined, // Campo de verificación solo para admin
  });

  console.log("EditUserForm inicializado con:", {
    userTheme: user.theme,
    getCurrentTheme: getCurrentTheme(),
    formDataTheme: formData.theme,
  });

  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [originalTheme] = useState(user.theme || getCurrentTheme());
  const [isThemeChanged, setIsThemeChanged] = useState(false);

  const validatePassword = (password) => {
    if (!password) return []; // Si no hay contraseña, no mostrar errores

    const errors = [];

    if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Debe contener al menos una mayúscula");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Debe contener al menos una minúscula");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Debe contener al menos un número");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Debe contener al menos un carácter especial");
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => {
      const newFormData = {
        ...prevFormData,
        [name]: value,
      };

      console.log("formData actualizado:", newFormData);
      return newFormData;
    });

    if (name === "password") {
      setIsPasswordChanged(true);
      const errors = validatePassword(value);
      setPasswordError(errors.length > 0 ? errors.join(", ") : "");
    }

    // Marcar que el tema ha cambiado pero no aplicarlo aún
    if (name === "theme") {
      console.log("Tema seleccionado:", value);
      setIsThemeChanged(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCancel = () => {
    // Si el tema cambió pero se cancela, restaurar el tema original
    if (isThemeChanged) {
      console.log("Restaurando tema original:", originalTheme);
      setThemeMode(originalTheme);
      saveUserThemePreference(originalTheme);
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    console.log("Estado completo al enviar:", {
      user: user,
      formData: formData,
      userTheme: user.theme,
      formDataTheme: formData.theme,
    });

    // Obtener el valor actual del tema del formulario
    const form = e.target;
    const themeSelect = form.querySelector('select[name="theme"]');
    const currentThemeValue = themeSelect ? themeSelect.value : formData.theme;

    // Verificar si se han hecho cambios
    // Si el tema del usuario es undefined/null, comparar directamente con el valor del formulario
    const currentUserTheme = user.theme;
    const newUserTheme = currentThemeValue;

    console.log("Comparando temas:", {
      currentUserTheme,
      newUserTheme,
      userThemeOriginal: user.theme,
      formDataTheme: formData.theme,
      currentThemeValue,
      areDifferent: newUserTheme !== currentUserTheme,
    });

    const hasChanges =
      formData.user !== user.user ||
      formData.name !== user.name ||
      formData.lastname !== user.lastname ||
      formData.mail !== user.mail ||
      formData.profile !== user.profile ||
      (isAdminEdit && formData.verificado !== (user.is_verified ? "1" : "0")) ||
      newUserTheme !== currentUserTheme ||
      (isPasswordChanged && formData.password);

    console.log("Verificación de cambios:", {
      user: formData.user !== user.user,
      name: formData.name !== user.name,
      lastname: formData.lastname !== user.lastname,
      mail: formData.mail !== user.mail,
      profile: formData.profile !== user.profile,
      verificado: isAdminEdit
        ? formData.verificado !== (user.is_verified ? "1" : "0")
        : false,
      theme: newUserTheme !== currentUserTheme,
      password: isPasswordChanged && formData.password,
      hasChanges,
    });

    if (!hasChanges) {
      toast.info("No se han realizado cambios", {
        autoClose: 2000,
      });
      onClose();
      return;
    }

    // Solo validar la contraseña si se ha cambiado
    if (isPasswordChanged) {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        toast.error("La contraseña no cumple con los requisitos de seguridad");
        return;
      }
    }

    if (!token) {
      toast.error("No tienes permiso para editar usuarios.", {
        autoClose: 3000,
      });
      return;
    }

    try {
      // Preparar los datos para enviar
      const dataToSend = {
        id: formData.id,
        user: formData.user,
        name: formData.name,
        lastname: formData.lastname,
        mail: formData.mail,
        profile: formData.profile,
        theme: currentThemeValue,
      };

      // Solo incluir el campo verificado si es edición desde admin
      if (isAdminEdit) {
        dataToSend.verificado = formData.verificado;
      }

      // Solo incluir la contraseña si se ha cambiado
      if (isPasswordChanged && formData.password) {
        dataToSend.password = formData.password;
      }

      console.log("Enviando petición de actualización:", dataToSend);

      const response = await fetch(API_ENDPOINTS.UPDATE_USER, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
        credentials: "include",
      });

      console.log("Respuesta recibida - Status:", response.status);
      console.log("Respuesta recibida - Headers:", response.headers);

      const result = await response.json();
      console.log("Datos de respuesta:", result);

      if (response.ok) {
        console.log("Respuesta exitosa, mostrando toast de éxito");

        // Aplicar el tema solo si se guardó exitosamente
        if (isThemeChanged) {
          console.log("Aplicando tema guardado:", currentThemeValue);
          setThemeMode(currentThemeValue);
          saveUserThemePreference(currentThemeValue);
        }

        toast.success("Usuario actualizado correctamente.", {
          autoClose: 1000,
        });

        // NO actualizar el localStorage ni el contexto de autenticación cuando es edición desde admin
        // Solo actualizar si es edición del propio perfil del usuario
        if (!isAdminEdit) {
          // Actualizar el localStorage con los nuevos datos del usuario
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const updatedUser = {
            ...currentUser,
            ...result.user,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          console.log("Usuario actualizado en localStorage:", updatedUser);

          // Actualizar el contexto de autenticación
          if (typeof updateUser === "function") {
            console.log("Actualizando contexto de autenticación...");
            updateUser(result.user);
            console.log("Contexto de autenticación actualizado:", result.user);
          }
        } else {
          console.log(
            "Edición desde admin - NO actualizando contexto de autenticación"
          );
        }

        // Forzar una recarga del contexto de autenticación sin redirección
        console.log("Actualizando contexto de autenticación...");

        if (typeof onUpdate === "function") {
          console.log("Llamando a onUpdate");
          onUpdate();
        }

        setTimeout(() => {
          if (typeof onClose === "function") {
            console.log("Cerrando formulario");
            onClose();
          }
        }, 2000);

        // Verificar que la autenticación permanezca activa
        setTimeout(() => {
          const finalToken = localStorage.getItem("token");
          const finalUser = localStorage.getItem("user");
          console.log(
            "Estado final - Token:",
            finalToken ? "PRESENTE" : "AUSENTE"
          );
          console.log(
            "Estado final - User:",
            finalUser ? "PRESENTE" : "AUSENTE"
          );
        }, 500);

        // Verificar el estado de autenticación después de la actualización
        console.log(
          "Token después de actualización:",
          localStorage.getItem("token")
        );
        console.log("Estado de autenticación después de actualización:", {
          token: !!localStorage.getItem("token"),
          user: JSON.parse(localStorage.getItem("user") || "null"),
        });

        // Solución temporal: forzar la autenticación
        console.log("Forzando autenticación...");
        const currentToken = localStorage.getItem("token");
        const currentUserData = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        if (currentToken && currentUserData) {
          console.log("Datos de autenticación válidos, forzando estado...");
          // Simular un pequeño delay para asegurar que el contexto se actualice
          setTimeout(() => {
            console.log("Verificando estado después del delay...");
          }, 100);
        }

        return;
      }

      if (!response.ok) {
        console.log("Error en respuesta:", response.status, result);

        // Si es un error de autenticación (401), no mostrar toast y dejar que el sistema maneje la redirección
        if (response.status === 401) {
          console.error("Error de autenticación:", result.error);
          return;
        }

        // Si es un error de permisos (403), mostrar el mensaje pero no redirigir
        if (response.status === 403) {
          toast.error(
            result.error || "No tienes permisos para realizar esta acción",
            {
              autoClose: 3000,
            }
          );
          return;
        }

        toast.error(result.error || "Error al actualizar el usuario", {
          autoClose: 3000,
        });
        return;
      }
    } catch (err) {
      console.error("Error al actualizar el usuario:", err);
      console.error("Detalles del error:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
      toast.error("Hubo un problema al actualizar el usuario.", {
        autoClose: 3000,
      });
    }
  };

  return (
    <div className={style.formContainer}>
      <h2 className={style.myTittleForm}>Editar Mi Perfil</h2>

      <form className={style.formEdit} onSubmit={handleSubmit}>
        <div className={style.formGroup}>
          <label className={style.labelForm}>Usuario:</label>
          <input
            type="text"
            name="user"
            value={formData.user}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label className={style.labelForm}>Contraseña:</label>
          <div className={style.passwordInputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Dejar vacío para mantener la contraseña actual"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={style.togglePasswordButton}
            >
              {showPassword ? <EyesOpen /> : <EyesClosed />}
            </button>
          </div>
          {formData.password && passwordError && (
            <div className={style.errorMessage}>{passwordError}</div>
          )}
        </div>

        <div className={style.formGroup}>
          <label className={style.labelForm}>Nombre:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label className={style.labelForm}>Apellido:</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label className={style.labelForm}>Email:</label>
          <input
            type="email"
            name="mail"
            value={formData.mail}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label className={style.labelForm}>Perfil:</label>
          <select
            name="profile"
            value={formData.profile}
            onChange={handleChange}
            required
            disabled={!canEditProfile}
            className={!canEditProfile ? style.disabledField : ""}
          >
            <option value="Consulta">Consulta</option>
            <option value="Editar">Editar</option>
            <option value="Admin">Admin</option>
          </select>
          {!canEditProfile && (
            <small className={style.disabledNote}>
              El perfil solo puede ser modificado por un administrador
            </small>
          )}
        </div>

        {isAdminEdit && (
          <div className={style.formGroup}>
            <label className={style.labelForm}>Verificado:</label>
            <select
              name="verificado"
              value={formData.verificado}
              onChange={handleChange}
              required
            >
              <option value="0">No</option>
              <option value="1">Sí</option>
            </select>
          </div>
        )}

        <div className={style.formGroup}>
          <label className={style.labelForm}>Tema de la aplicación:</label>
          <select
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            required
          >
            <option value="light">Tema Claro</option>
            <option value="dark">Tema Oscuro</option>
          </select>
          <small className={style.disabledNote}>
            Selecciona tu tema preferido para la aplicación
          </small>
        </div>

        <div className={style.buttonContainer}>
          <button className={style.buttonFormCancel} onClick={handleCancel}>
            Cancelar
          </button>
          <button
            className={style.buttonFormEdit}
            type="submit"
            disabled={isPasswordChanged && passwordError !== ""}
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;

import { useContext, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Admin.module.css";
import { AuthContext } from "../../autenticacion/AuthProvider";
import EyesClosed from "../../icons/EyesClosed";
import EyesOpen from "../../icons/EyesOpen";

const EditUserForm = ({ user, onClose, onUpdate, canEditProfile = true }) => {
  const { updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    id: user.id,
    user: user.user,
    password: "", // Inicializar vacío para no mostrar la contraseña hasheada
    name: user.name,
    lastname: user.lastname,
    mail: user.mail,
    profile: user.profile,
  });

  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

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
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      setIsPasswordChanged(true);
      const errors = validatePassword(value);
      setPasswordError(errors.length > 0 ? errors.join(", ") : "");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Verificar si se han hecho cambios
    const hasChanges =
      formData.user !== user.user ||
      formData.name !== user.name ||
      formData.lastname !== user.lastname ||
      formData.mail !== user.mail ||
      formData.profile !== user.profile ||
      (isPasswordChanged && formData.password);

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
      };

      // Solo incluir la contraseña si se ha cambiado
      if (isPasswordChanged && formData.password) {
        dataToSend.password = formData.password;
      }

      console.log("Enviando petición de actualización:", dataToSend);

      const response = await fetch("http://localhost:8001/api/update_user", {
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
        toast.success("Usuario actualizado correctamente.", {
          autoClose: 1000,
        });

        // Actualizar el localStorage con los nuevos datos del usuario
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          ...result.user,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("Usuario actualizado en localStorage:", updatedUser);

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

        // Actualizar el contexto de autenticación
        if (typeof updateUser === "function") {
          console.log("Actualizando contexto de autenticación...");
          updateUser(result.user);
          console.log("Contexto de autenticación actualizado:", result.user);
        }

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

        <div className={style.buttonContainer}>
          <button className={style.buttonFormCancel} onClick={onClose}>
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

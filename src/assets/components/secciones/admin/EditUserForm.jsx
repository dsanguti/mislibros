import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "../../../css/Admin.module.css";

const EditUserForm = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: user.id,
    user: user.user,
    password: user.password,
    name: user.name,
    lastname: user.lastname,
    mail: user.mail,
    profile: user.profile,
  });

  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    // Validar la contraseña antes de enviar
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      toast.error("La contraseña no cumple con los requisitos de seguridad");
      return;
    }

    if (!token) {
      toast.error("No tienes permiso para editar usuarios.", {
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8001/api/update_user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Error al actualizar el usuario", {
          autoClose: 3000,
        });
        return;
      }

      toast.success("Usuario actualizado correctamente.", { autoClose: 1000 });

      if (typeof onUpdate === "function") onUpdate();
      setTimeout(() => {
        if (typeof onClose === "function") onClose();
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar el usuario:", err);
      toast.error("Hubo un problema al actualizar el usuario.", {
        autoClose: 3000,
      });
    }
  };

  return (
    <div className={style.formContainer}>
      <h2 className={style.myTittleForm}>Editar Usuario</h2>

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
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={style.togglePasswordButton}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
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
          >
            <option value="Consulta">Consulta</option>
            <option value="Editar">Editar</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className={style.buttonContainer}>
          <button className={style.buttonFormCancel} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={style.buttonFormEdit}
            type="submit"
            disabled={passwordError !== ""}
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;

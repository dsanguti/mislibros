import { useState } from "react";
import { toast } from "react-toastify";
import style from "../../../css/Admin.module.css";
import EyesClosed from "../../icons/EyesClosed.jsx";
import EyesOpen from "../../icons/EyesOpen.jsx";

const AddUserForm = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    user: "",
    password: "",
    name: "",
    lastname: "",
    mail: "",
    profile: "Consulta",
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

    // Validar la contraseña antes de enviar
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      toast.error("La contraseña no cumple con los requisitos de seguridad");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

      const response = await fetch("http://localhost:8001/api/add_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el usuario");
      }

      await response.json();
      toast.success(
        "Usuario creado correctamente. El usuario ya puede iniciar sesión."
      );
      onAdd();
      onClose();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className={style.formContainer}>
      <h2 className={style.myTittleForm}>Añadir Nuevo Usuario</h2>
      <form onSubmit={handleSubmit} className={style.formEdit}>
        <div className={style.formGroup}>
          <label htmlFor="user">Usuario:</label>
          <input
            type="text"
            id="user"
            name="user"
            value={formData.user}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="password">Contraseña:</label>
          <div className={style.passwordInputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
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
              {showPassword ? <EyesOpen /> : <EyesClosed />}
            </button>
          </div>
          {formData.password && passwordError && (
            <div className={style.errorMessage}>{passwordError}</div>
          )}
        </div>

        <div className={style.formGroup}>
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="lastname">Apellido:</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="mail">Email:</label>
          <input
            type="email"
            id="mail"
            name="mail"
            value={formData.mail}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="profile">Perfil:</label>
          <select
            id="profile"
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
          <button
            type="button"
            onClick={onClose}
            className={style.cancelButton}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={style.buttonFormEdit}
            disabled={passwordError !== ""}
          >
            Crear Usuario
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;

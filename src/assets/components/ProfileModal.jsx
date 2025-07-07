import { toast } from "react-toastify";
import { useAuth } from "./autenticacion/UseAuth";
import Modal from "./Modal";
import EditUserForm from "./secciones/admin/EditUserForm";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleUpdate = () => {
    toast.success("Perfil actualizado correctamente");

    // Si el usuario cambió su propio perfil, cerrar sesión para que se actualice el contexto
    setTimeout(() => {
      logout();
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    onClose();
  };

  if (!user) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <EditUserForm
        user={user}
        onClose={handleClose}
        onUpdate={handleUpdate}
        canEditProfile={false}
      />
    </Modal>
  );
};

export default ProfileModal;

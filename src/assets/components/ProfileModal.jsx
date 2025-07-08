
import { useAuth } from "./autenticacion/UseAuth";
import Modal from "./Modal";
import EditUserForm from "./secciones/admin/EditUserForm";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const handleUpdate = () => {
    

    // Cerrar el modal después de un breve delay
    setTimeout(() => {
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

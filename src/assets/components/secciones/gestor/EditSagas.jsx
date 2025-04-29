import { useCallback, useEffect, useState } from "react";
import styles from "../../../css/Gestor.module.css";
import { useAuth } from "../../autenticacion/UseAuth";
import AddSaga_Icon from "../../icons/AddSaga_Icon";
import DeleteIcon from "../../icons/Delete_Icon";
import EditIcon from "../../icons/Edit_Icon";
import AddSagaForm from "./AddSagaForm";
import DeleteSagaForm from "./DeleteSagaForm";
import EditSagaForm from "./EditSagaForm";
const EditSagas = () => {
  const [sagas, setSagas] = useState([]);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSaga, setSelectedSaga] = useState(null);
  const { token } = useAuth();

  const fetchSagas = useCallback(async () => {
    try {
      if (!token) {
        setError("No hay token de autenticación");
        return;
      }

      const response = await fetch("http://localhost:8001/api/sagas", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Estado de la respuesta:", response.status);

      if (response.status === 403) {
        setError(
          "Token expirado o inválido. Por favor, inicie sesión nuevamente"
        );
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.error || "Error al cargar las sagas");
      }

      const data = await response.json();
      console.log("Sagas cargadas:", data);
      setSagas(data);
    } catch (error) {
      setError(error.message || "Error al cargar las sagas");
      console.error("Error completo:", error);
    }
  }, [token, setError, setSagas]);

  useEffect(() => {
    // Intentamos cargar las sagas reales, pero si falla usamos datos de prueba
    fetchSagas().catch(() => {
      console.log("Usando datos de prueba");
      setSagas([
        { id: 1, nombre: "Saga de prueba 1" },
        { id: 2, nombre: "Saga de prueba 2" },
      ]);
    });
  }, [fetchSagas]);

  const handleEditClick = (saga) => {
    console.log("Editando saga:", saga);
    setSelectedSaga(saga);
    setShowEditModal(true);
  };

  const handleDeleteClick = (saga) => {
    console.log("Eliminando saga:", saga);
    setSelectedSaga(saga);
    setShowDeleteModal(true);
  };

  const handleAddClick = () => {
    console.log("Abriendo modal de añadir saga");
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowAddModal(false);
    setSelectedSaga(null);
  };

  const handleUpdate = (updatedSaga) => {
    // Implementa la lógica para actualizar la saga en el estado
    console.log("Actualizando saga:", updatedSaga);
    setSagas((prevSagas) =>
      prevSagas.map((saga) => (saga.id === updatedSaga.id ? updatedSaga : saga))
    );
    handleCloseModal();
  };

  return (
    <div className={styles.container}>
      <div className={styles.tittle}>
        <h3>Gestionar Sagas</h3>
        <p>Añadiendo funcionalidad paso a paso. Ahora con iconos.</p>
      </div>

      <div className={styles.AddSagaIcon} onClick={handleAddClick}>
        <AddSaga_Icon />
      </div>

      <div className={styles.sectionCards}>
        {sagas.map((saga) => (
          <div
            key={saga.id}
            className={`${styles.card} ${styles.sagaCard}`}
            style={{
              backgroundImage: saga.coverSaga
                ? `url(${saga.coverSaga})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "relative",
            }}
          >
            {!saga.coverSaga && (
              <div className={styles.iconPlaceholder}>
                {saga.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={styles.cardOverlay}>
              <p className={styles.generoText}>{saga.nombre}</p>
              <div className={styles.cardActions}>
                <button
                  className={styles.actionButtonEdit}
                  onClick={() => handleEditClick(saga)}
                  title="Editar saga"
                >
                  <EditIcon />
                </button>
                <button
                  className={styles.actionButtonDelete}
                  onClick={() => handleDeleteClick(saga)}
                  title="Eliminar saga"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className={`${styles.alert} ${styles.error}`}>{error}</div>
      )}

      {/* Modal de edición */}
      {showEditModal && selectedSaga && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={handleCloseModal}>
              ×
            </button>
            <EditSagaForm
              saga={selectedSaga}
              onClose={handleCloseModal}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      )}

      {/* Modal de eliminación */}
      {showDeleteModal && selectedSaga && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={handleCloseModal}>
              ×
            </button>
            <DeleteSagaForm
              saga={selectedSaga}
              onClose={handleCloseModal}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      )}

      {/* Modal de añadir saga */}
      {showAddModal && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={handleCloseModal}>
              ×
            </button>
            <AddSagaForm onClose={handleCloseModal} onUpdate={handleUpdate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSagas;

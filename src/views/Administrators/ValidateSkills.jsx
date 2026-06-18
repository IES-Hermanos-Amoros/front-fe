import React, { useState, useEffect, useCallback, useMemo } from "react";
import { sendRequest, confirmation, showAlert } from "../../utils/functions";
import ListCRUD from "../../components/List/ListCRUD";

const ValidateSkills = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // FETCH DATA (Skills no verificadas)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // El endpoint que te pide el enunciado
      const res = await sendRequest("GET", null, "/skills/unverified");
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Error al cargar aptitudes");
      }
    } catch (err) {
      setError(err.message || "Error al cargar aptitudes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ACCIÓN MASIVA: VALIDAR
  const handleMassiveValidation = async () => {
    if (selectedIds.length === 0)
      return showAlert("No hay registros seleccionados", "warning");

    const confirmado = await confirmation(
      `¿Deseas validar las ${selectedIds.length} aptitudes seleccionadas?`,
    );
    if (!confirmado) return;

    // Preparamos el payload igual que en el Dummy
    const payload = {
      ids: selectedIds,
      updates: { FCTM_skill_verified: true }, // El campo que queremos cambiar
    };

    // Endpoint que debes crear en el backend: /skills/bulk-verify
    const res = await sendRequest("PATCH", payload, "/skills/bulk-verify");

    if (res.success) {
      showAlert("Aptitudes validadas correctamente", "success");
      setSelectedIds([]); // Limpiamos la selección
      fetchData(); // Recargamos la tabla (las validadas ya no saldrán porque el GET es de unverified)
    } else {
      showAlert(res.message, "error");
    }
  };

  // ACCIÓN MASIVA: ELIMINAR
  const handleMassiveDelete = async () => {
    if (selectedIds.length === 0)
      return showAlert("No hay registros seleccionados", "warning");

    const confirmado = await confirmation(
      `¿Deseas eliminar las ${selectedIds.length} aptitudes seleccionadas? Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;

    const payload = { ids: selectedIds };
    const res = await sendRequest("DELETE", payload, "/skills/bulk-delete");

    if (res.success) {
      showAlert("Aptitudes eliminadas correctamente", "success");
      setSelectedIds([]);
      fetchData();
    } else {
      showAlert(res.message, "error");
    }
  };

  // CONFIGURACIÓN DE COLUMNAS
  const columnas = useMemo(
    () => [
      //{ key: "_id", encabezado: "ID" },
      {
        key: "FCTM_skill_name",
        encabezado: "Aptitud, Habilidad, Tecnología...",
      },
      {
        key: "FCTM_skill_verified",
        encabezado: "Estado",
        render: () => (
          <span className="badge bg-warning text-dark">Pendiente</span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      {loading && 
                 <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              }
      {!loading && error && <p className="text-danger">{error}</p>}
      {!loading && !error && (
        <ListCRUD
          title="Validar Aptitudes"
          datos={data}
          columnas={columnas}
          tableId="validate-skills"
          mostrarCheckBox={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        >
          <div className="d-flex gap-2 mb-2">
            {/* BOTÓN DE VALIDACIÓN: Solo habilitado si hay algo seleccionado */}
            <button
              className={`btn ${selectedIds.length > 0 ? "btn-success" : "btn-secondary disabled"}`}
              onClick={handleMassiveValidation}
            >
              <i className="bi bi-check-all me-1"></i>
              Validar Seleccionadas ({selectedIds.length})
            </button>

            {/* BOTÓN DE ELIMINACIÓN */}
            <button
              className={`btn ${selectedIds.length > 0 ? "btn-danger" : "btn-secondary disabled"}`}
              onClick={handleMassiveDelete}
            >
              <i className="bi bi-trash me-1"></i>
              Eliminar Seleccionadas ({selectedIds.length})
            </button>
          </div>
        </ListCRUD>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="alert alert-info">
          No hay aptitudes pendientes de validación.
        </div>
      )}
    </>
  );
};

export default ValidateSkills;

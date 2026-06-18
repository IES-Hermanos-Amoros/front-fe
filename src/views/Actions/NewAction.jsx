import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ShowHeader from "../../components/Show/ShowHeader";
import ShowEditableForm from "../../components/Show/ShowEditableForm";
import { sendRequest, showAlert } from "../../utils/functions";
import useEnumStore from "../../store/enumStore";
import useUserStore from "../../store/userStore";

const NewAction = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const companyId = location.state?.companyId || null;
  const returnPath = companyId ? `/companies/${companyId}` : "/companies";

  const getEnumArray = useEnumStore((state) => state.getEnumArray);
  const enums = useEnumStore((state) => state.enums);
  const user = useUserStore((state) => state.user);

  const currentUserId =
    user?._id || user?.id || user?.user?._id || user?.user?.id || "";

  const actionTypeOptions = useMemo(() => {
    const actionTypes = getEnumArray("ACTION_TYPE") || [];
    return actionTypes.map((item) => ({ _id: item, nombre: item }));
  }, [enums, getEnumArray]);

  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [data, setData] = useState({
    FCTM_action_title: "",
    FCTM_action_type: actionTypeOptions[0]?._id || "VISITA",
    FCTM_action_datetime: nowLocal,
    FCTM_action_notes: "",
  });
  const [files, setFiles] = useState([]);

  const actionFields = [
    {
      key: "FCTM_action_title",
      label: "Título de la acción",
      type: "text",
      required: true,
    },
    {
      key: "FCTM_action_type",
      label: "Tipo de acción",
      type: "select",
      options: actionTypeOptions,
      optionValue: "_id",
      optionLabel: "nombre",
      required: true,
    },
    {
      key: "FCTM_action_datetime",
      label: "Fecha y hora",
      type: "datetime-local",
      required: true,
    },
    {
      key: "FCTM_action_notes",
      label: "Observaciones",
      type: "textarea",
    },
  ];

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    setFiles((prevFiles) => {
      const merged = [...prevFiles];
      const existingKeys = new Set(
        prevFiles.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
      );

      selectedFiles.forEach((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!existingKeys.has(key)) {
          merged.push(file);
          existingKeys.add(key);
        }
      });

      if (merged.length > 10) {
        showAlert("Solo puedes adjuntar un máximo de 10 archivos", "error");
        return merged.slice(0, 10);
      }

      return merged;
    });

    e.target.value = "";
  };

  // --- NUEVA FUNCIÓN PARA ELIMINAR UN ARCHIVO ---
  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    if (!companyId) {
      showAlert("No se recibió la empresa asociada para crear la acción", "error");
      return;
    }

    if (
      !data.FCTM_action_title?.trim() ||
      !data.FCTM_action_type ||
      !data.FCTM_action_datetime
    ) {
      showAlert("Completa todos los campos obligatorios", "error");
      return;
    }

    const formData = new FormData();
    formData.append("FCTM_action_title", data.FCTM_action_title.trim());
    formData.append("FCTM_action_type", data.FCTM_action_type);
    formData.append("FCTM_action_datetime", data.FCTM_action_datetime);
    formData.append("FCTM_action_notes", data.FCTM_action_notes || "");
    formData.append("user_Id", companyId);

    if (currentUserId) {
      formData.append("FCTM_created_by", currentUserId);
    }

    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await sendRequest("POST", formData, "/actions");

    if (res.success) {
      navigate(returnPath);
    } else {
      showAlert(res.message, "error");
    }
  };

  return (
    <section className="dashboard section">
      <ShowHeader title="Nueva Acción" onBack={() => navigate(returnPath)} />

      <ShowEditableForm
        formTitle="Alta de Acción"
        formId="actionForm"
        data={data}
        fields={actionFields}
        isEditing={true}
        hideEditButton={true}
        onSave={handleSave}
        onCancel={() => navigate(returnPath)}
        onChange={handleChange}
      />

      <div className="card p-3 mt-3 shadow-sm">
        <h5>Documentos adjuntos</h5>
        <p className="text-muted small mb-2">
          Puedes adjuntar varios archivos (máximo 10).
        </p>
        <input
          type="file"
          multiple
          className="form-control"
          onChange={handleFileChange}
        />
        
        {/* LISTADO MODIFICADO CON BOTÓN DE ELIMINAR */}
        {files.length > 0 && (
          <ul className="list-group mt-3 mb-0">
            {files.map((file, index) => (
              <li 
                key={`${file.name}-${index}`} 
                className="list-group-item d-flex justify-content-between align-items-center py-2"
              >
                <span className="text-truncate me-3" style={{ maxWidth: '80%' }}>
                  {file.name}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger border-0"
                  onClick={() => handleRemoveFile(index)}
                  title="Eliminar archivo"
                >
                  &times; {/* Una "X" simple, puedes cambiarlo por un icono de papelera si usas FontAwesome */}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default NewAction;
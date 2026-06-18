import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  sendRequest,
  showAlert,
  confirmation, // Añadido para preguntar antes de borrar
  normalizeFromApi,
  normalizeToApi,
  getBackendHost,
  formatDateDDMMYYYYHHmm
} from "../../utils/functions";

import ShowHeader from "../../components/Show/ShowHeader";
import ShowEditableForm from "../../components/Show/ShowEditableForm";
import ListCRUD from "../../components/List/ListCRUD";

const camposNoEditables = [
  { key: "creadoPor", label: "Usuario" },  
  { key: "creadoPorPerfil", label: "Perfil" }
];

const ACTION_FIELDS = [
  { key: "FCTM_action_title", label: "Título de la Acción", type: "text" },
  { key: "FCTM_action_datetime", label: "Fecha y Hora", type: "date" },
  {
    key: "FCTM_action_type",
    label: "Tipo de Acción",
    type: "select",
    options: [
      { _id: "VISITA", nombre: "Visita" },
      { _id: "LLAMADA", nombre: "Llamada" },
      { _id: "EMAIL", nombre: "Email" },
      { _id: "REUNION", nombre: "Reunión" }
    ],
    optionValue: "_id",
    optionLabel: "nombre"
  },
  { key: "FCTM_action_notes", label: "Notas / Observaciones", type: "textarea" },
];

const normalizationConfig = [
  { field: "FCTM_action_datetime", type: "date" }
];

const ShowAction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hostAPI = getBackendHost();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  
  // --- NUEVOS ESTADOS PARA DOCUMENTOS ---
  const [files, setFiles] = useState([]);

  const fetchAction = useCallback(async () => {
    setLoading(true);
    const res = await sendRequest("GET", null, `/actions/${id}`);

    if (res.success) {
      const normalized = normalizeFromApi(res.data, normalizationConfig);
      normalized.creadoPor = res.data.FCTM_created_by?.SAO_name
      normalized.creadoPorPerfil = res.data.FCTM_created_by?.SAO_profile
      setData(normalized);
      setOriginalData(normalized);
    } else {
      showAlert(res.message || "Error al cargar la acción", "error");
      navigate(-1);
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => { fetchAction(); }, [fetchAction]);

  // --- NUEVA FUNCIÓN PARA ELIMINAR DOCUMENTO EXISTENTE ---
  const handleDeleteDocument = useCallback(async (docId) => {
    const confirmado = await confirmation("¿Seguro que quieres eliminar este documento?");
    if (!confirmado) return;

    // Se envía el query param actionId en lugar de companyId para que el backend lo desvincule correctamente de la acción
    const res = await sendRequest("DELETE", undefined, `/documents/${docId}?actionId=${id}`);

    if (res.success) {
      showAlert("Documento eliminado y desvinculado", "success");
      await fetchAction(); 
    } else {
      showAlert(res.message || "Error al eliminar", "error");
    }
  }, [id, fetchAction]);

  // --- NUEVA FUNCIÓN PARA DETECTAR CAMBIOS EN EL INPUT FILE ---
  const handleFileChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 10) {
      showAlert('Solo puedes subir un máximo de 10 documentos', 'error');
      return;
    }

    setFiles(selectedFiles);
  }, []);

  // --- NUEVA FUNCIÓN PARA SUBIR LOS ARCHIVOS SELECCIONADOS ---
  const handleUploadDocs = useCallback(async () => {
    if (files.length === 0) {
      showAlert('Debes seleccionar al menos un archivo', 'error');
      return;
    }

    if (files.length > 10) {
      showAlert('No puedes subir más de 10 archivos a la vez', 'error');
      return;
    }

    // Creación del FormData requerido por el middleware upload.array
    const formData = new FormData();
    
    // 1. Adjuntamos los archivos
    files.forEach(file => formData.append('files', file));
    
    // 2. Adjuntamos los datos actuales de la acción para que el backend tenga el contexto
    formData.append('FCTM_action_title', data?.FCTM_action_title || '');
    formData.append('FCTM_action_type', data?.FCTM_action_type || '');
    formData.append('FCTM_action_datetime', data?.FCTM_action_datetime || '');
    formData.append('FCTM_action_notes', data?.FCTM_action_notes || '');
    
    // Si guardas el creador en el estado de la acción, inclúyelo también
    if (data?.FCTM_created_by) {
      formData.append('FCTM_created_by', data.FCTM_created_by);
    }

    // 3. Enviamos la petición directamente al endpoint PATCH de la acción
    const res = await sendRequest('PATCH', formData, `/actions/${id}`);

    if (res.success) {
      showAlert('Documentos subidos correctamente', 'success');
      setFiles([]); // Limpiamos el listado temporal de archivos elegidos
      
      // Sincronizamos el estado local con la respuesta ya populada del backend
      const updated = normalizeFromApi(res.data, normalizationConfig);
      setData(updated);
      setOriginalData(updated);
    } else {
      showAlert(res.message || 'Error al subir documentos', 'error');
    }
  }, [files, id, data]);

  // --- REFACTOR: Columnas envueltas en useMemo incluyendo la acción de borrar ---
  const columnasDocuments = useMemo(() => [
    { key: "FCTM_document_name", encabezado: "Nombre" },
    { key: "FCTM_document_type", encabezado: "Tipo" },
    {
      key: "FCTM_document_url",
      encabezado: "Descarga",
      render: row =>
        row?.FCTM_document_url ? (
          <a href={hostAPI + row.FCTM_document_url} target="_blank" rel="noopener noreferrer">
            <i className="bi bi-download"></i>
          </a>
        ) : "No disponible"
    },
    {
      key: "FCTM_inserted_date",
      encabezado: "Fecha",
      render: row => formatDateDDMMYYYYHHmm(row.FCTM_inserted_date)
    },
    {
      key: "__delete",
      encabezado: "Borrar",
      render: (row) => (
        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteDocument(row._id)}>
          <i className="bi bi-trash"></i>
        </button>
      )
    }
  ], [hostAPI, handleDeleteDocument]);

  const handleSave = async () => {
    const payload = normalizeToApi(data, normalizationConfig);
    delete payload.FCTM_documents;

    const res = await sendRequest("PATCH", payload, `/actions/${id}`);

    if (res.success) {
      const updated = normalizeFromApi(res.data, normalizationConfig);
      setData(updated);
      setOriginalData(updated);
      setIsEditing(false);
      showAlert("Acción actualizada correctamente", "success");
    } else {
      showAlert(res.message, "error");
    }
  };

  if (loading) return <p className="p-4 text-center">Cargando...</p>;
  if (!data) return null;

  return (
    <section className="dashboard section">
      <ShowHeader
        title={`Detalle de Acción: ${data.FCTM_action_title || ""}`}
        onBack={() => navigate(-1)}
      />

      <ShowEditableForm
        formTitle="Acción Creada por"
        formId="saoForm"
        data={data}
        fields={camposNoEditables}
        hideEditButton={true}
      />

      <ShowEditableForm
        formTitle="Datos de la Acción"
        formId="actionForm"
        data={data}
        fields={ACTION_FIELDS}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={() => { setData(originalData); setIsEditing(false); }}
        onChange={(field, value) => setData(prev => ({ ...prev, [field]: value }))}
      />

      {/* --- INTEGRACIÓN DE GESTIÓN DE DOCUMENTOS (Igual a ShowCompany) --- */}
      <ListCRUD 
        title="Documentos" 
        datos={data.FCTM_documents || []} 
        columnas={columnasDocuments}
      >
        <button className="btn btn-primary text-nowrap" onClick={handleUploadDocs}>                  
          Adjuntar Docs.
        </button>
        <input
          type="file"
          multiple
          className="form-control form-control-sm"
          onChange={handleFileChange}
        />
      </ListCRUD>
    </section>
  );
};

export default ShowAction;
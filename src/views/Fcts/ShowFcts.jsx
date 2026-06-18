import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sendRequest, showAlert, confirmation, formatDateDDMMYYYY, getBackendHost } from "../../utils/functions";

import ShowHeader from "../../components/Show/ShowHeader";
import ShowEditableForm from "../../components/Show/ShowEditableForm";
import ListCRUD from "../../components/List/ListCRUD";
import RatingStars from "../../components/RatingStars";

import useUserStore from "../../store/userStore";

// --- CONFIGURACIÓN DE CAMPOS ---

// Campos SAO (Solo lectura)
const SAO_fields = [
  { key: "SAO_fct_id", label: "ID FCT", type: "text" },
  { key: "SAO_student_course", label: "Curso Alumno", type: "text" },
  { key: "SAO_student_id", label: "NIA", type: "text" },
  { key: "SAO_student_fullname", label: "Alumno", type: "text" },
  { key: "SAO_company_id", label: "CIF Empresa", type: "text" },
  { key: "SAO_company_name", label: "Empresa", type: "text" },
  { key: "SAO_company_city", label: "Localidad", type: "text" },
  { key: "SAO_workcenter_name", label: "Centro de Trabajo", type: "text" },
  { key: "SAO_workcenter_phone", label: "Teléfono Centro", type: "text" },
  { key: "SAO_workcenter_manager", label: "Responsable Centro", type: "text" },
  {
    key: "SAO_workcenter_manager_id",
    label: "ID Responsable Centro",
    type: "text",
  },
  { key: "SAO_workcenter_email", label: "Email Centro", type: "email" },
  { key: "SAO_teacher_id", label: "NIF Profesor", type: "text" },
  { key: "SAO_teacher_fullname", label: "Tutor Curso", type: "text" },
  { key: "SAO_instructor_id", label: "ID Instructor Empresa", type: "text" },
  { key: "SAO_instructor_name", label: "Instructor Empresa", type: "text" },
  { key: "SAO_period", label: "Curso / Periodo", type: "text" },
  { key: "SAO_dates", label: "Fechas", type: "text" },
  { key: "SAO_schedule", label: "Horario", type: "text" },
  { key: "SAO_hours", label: "Horas", type: "text" },
  { key: "SAO_department", label: "Departamento", type: "text" },
  { key: "SAO_type", label: "Tipo FCT", type: "text" },
  { key: "SAO_Authorization", label: "Autorización", type: "text" },
  { key: "SAO_Erasmus", label: "Erasmus", type: "text" },
  { key: "SAO_termination_date", label: "Fecha Finalización", type: "text" },
  {
    key: "SAO_instructor_assessment",
    label: "Valoración Instructor",
    type: "text",
  },
  { key: "SAO_variation", label: "Variación", type: "text" },
  { key: "SAO_link", label: "Enlace", type: "text" },
  { key: "SAO_amount", label: "Importe", type: "text" },
  { key: "SAO_observation", label: "Observaciones SAO", type: "textarea" },
];

// Campos FCTM (Editables)
const FCTM_fields = [
  { key: "FCTM_ies_instructor", label: "Tutor IES", type: "text" },
  { key: "FCTM_notes", label: "Notas Internas", type: "textarea" },
];

const ShowFcts = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [documentData, setDocumentData] = useState([]);
  const [files, setFiles] = useState([]);
  const user = useUserStore(state => state.user); 
  const hostAPI = getBackendHost();

  // --- GESTIÓN DE PERMISOS ---
  const userRole = user?.user?.profile || user?.profile;
  const userId = user?.user?.id || user?.id;
  // Comprobamos si el usuario logueado es la propia empresa que se está visualizando
  //const isOwner = userId === id;
  // ADMINISTRADOR, PROFESOR o la propia EMPRESA logueada
  const canEditAndManage = useMemo(() => {
    return ["ADMINISTRADOR", "PROFESOR"].includes(userRole)// || isOwner;
  }, [userRole]);
  //}, [userRole, isOwner]);

  // --- CARGA DE DATOS ---
  const fetchFct = useCallback(async () => {
    setLoading(true);
    const res = await sendRequest("GET", null, `/fct/${id}`);

    if (res.success) {
      console.log("Datos de FCT:", res.data); // Debug
      // Asegurar que FCTM_documents existe
      if (!res.data.FCTM_documents) {
        res.data.FCTM_documents = [];
      }
      setData(res.data);
      setOriginalData(res.data);

      // Los documentos ya vienen populados desde el backend
      const docs = res.data.FCTM_documents || [];
      const sortedDocuments = [...docs].sort(
        (a, b) => new Date(b.FCTM_inserted_date) - new Date(a.FCTM_inserted_date)
      );
      setDocumentData(sortedDocuments);
    } else {
      showAlert(res.message, "error");
    }
    setLoading(false);
  }, [id]);

  // --- GUARDADO ---
  const handleSave = async () => {
    // Filtramos para enviar solo lo que empieza por FCTM_ (opcional, según backend)
    const payload = {};
    Object.keys(data).forEach((key) => {
      if (key.startsWith("FCTM_")) payload[key] = data[key];
    });

    const res = await sendRequest("PATCH", payload, `/fct/${id}`);

    if (res.success) {
      setData(res.data);
      setOriginalData(res.data);
      setIsEditing(false);
      showAlert("FCT actualizada correctamente", "success");
    } else {
      showAlert(res.message, "error");
    }
  };

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setData(originalData);
    setIsEditing(false);
  };

  // --- MANEJO DE DOCUMENTOS ---
  const columnasDocuments = [
    { key: 'FCTM_document_name', encabezado: 'Nombre' },
    { key: 'FCTM_document_type', encabezado: 'Tipo' },
    {
      key: 'FCTM_document_url',
      encabezado: 'Descarga',
      render: row => {
        if (!row || !row.FCTM_document_url) return 'No disponible';
        const url = row.FCTM_document_url;
        return (
          <a href={hostAPI + url} target="_blank" rel="noopener noreferrer">
            <i className="bi bi-download"></i>
          </a>
        );
      },
    },
    {
      key: 'FCTM_inserted_date',
      encabezado: 'Fecha',
      render: row => formatDateDDMMYYYY(row.FCTM_inserted_date),
    },
    {
      key: '__delete',
      encabezado: 'Eliminar',
      render: row => (
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDeleteDocument(row._id)}
          title="Eliminar Documento"
        >
          <i className="bi bi-trash"></i>
        </button>
      ),
    },
  ];

  const handleDeleteDocument = async docId => {
    const confirmado = await confirmation('¿Seguro que quieres eliminar este documento?');
    if (!confirmado) return;

    const res = await sendRequest('DELETE', undefined, `/documents/${docId}?fctId=${encodeURIComponent(id)}`);

    if (res.success) {
      showAlert('Documento eliminado correctamente', 'success');
      fetchFct();
    } else {
      showAlert(res.message, 'error');
    }
  };

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 10) {
      showAlert('Solo puedes subir un máximo de 10 documentos', 'error');
      return;
    }
    setFiles(selectedFiles);
  };

  const handleUploadDocs = async () => {
    if (files.length === 0) {
      showAlert('Debes seleccionar al menos un archivo', 'error');
      return;
    }

    // Asegurar que FCTM_documents existe
    const currentDocs = data.FCTM_documents || [];

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    formData.append('FCTM_document_type', 'GENERAL');
    formData.append('fctId', id);

    const res = await sendRequest('POST', formData, '/documents/upload');

    if (res.success) {
      showAlert('Documentos subidos correctamente', 'success');
      const newDocIds = Array.isArray(res.data)
        ? res.data.map(d => d._id)
        : [res.data._id];
      const updatedDocuments = [...currentDocs, ...newDocIds];

      const patchRes = await sendRequest(
        'PATCH',
        { FCTM_documents: updatedDocuments },
        `/fct/${id}`
      );

      if (patchRes.success) {
        setData(prev => ({ ...prev, FCTM_documents: updatedDocuments }));
        setFiles([]);
        fetchFct();
      }
    } else {
      showAlert(res.message, 'error');
    }
  };

  // --- MANEJO DE RESEÑAS ---
  const handleDeleteReview = useCallback(
    async (reviewId) => {
      const confirmed = await confirmation(
        "¿Seguro que quieres eliminar esta reseña?",
      );
      if (!confirmed) return;

      const res = await sendRequest(
        "DELETE",
        undefined,
        `/reviews/${reviewId}?fctId=${encodeURIComponent(id)}`,
      );

      if (res.success) {
        await fetchFct(); // Recargar para actualizar la lista
      } else {
        showAlert(res.message || "Error al eliminar reseña", "error");
      }
    },
    [id, fetchFct],
  );

  // --- CONFIGURACIÓN DE COLUMNAS PARA RESEÑAS ---
  const columnasReviews = useMemo(
    () => [
      { key: "FCTM_review_title", encabezado: "Título" },
      {
        key: "FCTM_review_rating",
        encabezado: "Calificación",
        render: (row) => <RatingStars rating={row.FCTM_review_rating} />,
      },
      {
        key: "FCTM_user_id",
        encabezado: "Autor",
        render: (row) =>
          row.FCTM_user_id?.SAO_fullname ||
          `${row.FCTM_user_id?.SAO_name || ""} ${row.FCTM_user_id?.SAO_surname || ""}`.trim() ||
          "Desconocido",
      },
      {
        key: "FCTM_review_text",
        encabezado: "Comentario",
        render: (row) => {
          const text = row.FCTM_review_text || "";
          return text.length > 80 ? text.substring(0, 80) + "..." : text;
        },
      },
      {
        key: "FCTM_review_date",
        encabezado: "Fecha",
        render: (row) => formatDateDDMMYYYY(row.FCTM_review_date),
      },
      {
        key: "__show",
        encabezado: "Ver",
        render: (row) => (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              navigate(`/reviews/${row._id}`, { state: { fctId: id } })
            }
            title="Ver reseña"
          >
            <i className="bi bi-search"></i>
          </button>
        ),
      },
      {
        key: "__delete",
        encabezado: "Eliminar",
        render: (row) => (
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDeleteReview(row._id)}
            title="Eliminar reseña"
          >
            <i className="bi bi-trash"></i>
          </button>
        ),
      },
    ],
    [navigate, id, handleDeleteReview],
  );

  // --- FILTRADO DE RESEÑAS VALIDADAS ---
  const reviewsValidadas = useMemo(() => {
    //ERROR
    //if (!data?.reviews) return [];
    if (!data?.FCTM_reviews) return [];

    //ERROR
    //const validadas = data.reviews.filter(
    const validadas = data.FCTM_reviews.filter(
      //ERROR (rev) => true, // Mostrar todas para debug
      (rev) => rev.FCTM_review_verified === true,
    );
    return validadas.sort(
      (a, b) => new Date(b.FCTM_review_date) - new Date(a.FCTM_review_date),
    );
  }, [data]);

  useEffect(() => {
    fetchFct();
  }, [fetchFct]);

  if (loading) return <p className="p-5 text-center">Cargando FCT...</p>;
  if (!data) return <p className="p-5 text-center">No se encontró la FCT</p>;

  return (
    <section className="dashboard section">
      <ShowHeader
        title={`FCT: ${data.SAO_student_fullname || "Detalle"}`}
        onBack={() => navigate("/fcts")}
      />

      {/* SECCIÓN SAO: Siempre bloqueada */}
      <ShowEditableForm
        formTitle="Información de SAO (Solo Lectura)"
        formId="saoForm"
        data={data}
        fields={SAO_fields}
        hideEditButton={true} // Forzamos que no aparezca el botón de editar
      />

      {/* SECCIÓN FCTM: Editable */}
      <ShowEditableForm
        formTitle="Gestión de Tutoría"
        formId="fctmForm"
        data={data}
        fields={FCTM_fields}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={handleChange}
        hideEditButton={!canEditAndManage}
      />

      {/* SECCIÓN DOCUMENTOS - Solo visible al editar (igual que JobOffer) */}
      {/*isEditing && (
        <div className="card p-3 mt-3">
          <h5>Adjuntar Documentos</h5>
          <input
            type="file"
            multiple
            className="form-control"
            onChange={handleFileChange}
          />
          <button className="btn btn-primary mt-2" onClick={handleUploadDocs}>
            Adjuntar Docs.
          </button>
        </div>
      )*/}

      {/* Tabla de Documentos Relacionados - Justo después de Adjuntar */}      
      <ListCRUD
        title="Documentos Relacionados"
        datos={documentData}
        columnas={columnasDocuments}
      >
        {canEditAndManage && (<>
        <button className="btn btn-primary text-nowrap" onClick={handleUploadDocs}>                  
            Adjuntar Docs.
          </button>
          <input
            type="file"
            multiple
            className="form-control form-control-sm"
            onChange={handleFileChange}
          />
          </>)}
      </ListCRUD>
      

      {/* SECCIÓN RESEÑAS */}
      <ListCRUD
        title="Reseñas"
        datos={reviewsValidadas}
        columnas={columnasReviews}
      >
        <button
          className="btn btn-primary"
          onClick={() => navigate("/reviews/new", { state: { fctId: id } })}
        >
          Nueva Reseña
        </button>
      </ListCRUD>
    </section>
  );
};

export default ShowFcts;

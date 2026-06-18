import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  sendRequest,
  showAlert,
  confirmation,
  normalizeFromApi,
  normalizeToApi,
  pickFCTMFields,
  formatDateDDMMYYYY,
  ensureSkills,
  validateStrongPassword,
  externLogout,
  getBackendHost
} from "../../utils/functions";

import ShowHeader from "../../components/Show/ShowHeader";
import ShowEditableForm from "../../components/Show/ShowEditableForm";
import ListCRUD from "../../components/List/ListCRUD";
import UserAvatarUploader from "../../components/User/UserAvatarUploader";
import SectionChangePassword from "../../components/User/SectionChangePassword";
import useSkillStore from "../../store/skillStore";
import useCategoryStore from "../../store/categoryStore";
import useUserStore from "../../store/userStore";
import { useStatsStore } from "../../store/useStatsStore";
import BarChart from "../../components/Charts/BarChart";
import PieChart from "../../components/Charts/PieChart";
import RadarChart from "../../components/Charts/RadarChart";
import HorizontalBarChart from "../../components/Charts/HorizontalBarChart";
import StatsLayout from "../../components/Charts/StatsLayout";

// --- HELPERS DE MERGE ---
const mergeSkillOptions = (storeSkills = [], entitySkills = []) => {
  const merged = [...storeSkills];
  const seen = new Set(storeSkills.map(s => s._id));
  entitySkills.forEach(skill => {
    if (skill?._id && skill.FCTM_skill_name && !seen.has(skill._id)) {
      merged.push(skill);
      seen.add(skill._id);
    }
  });
  return merged;
};

const mergeCategoryOptions = (storeCategories = [], entityCategories = []) => {
  const merged = [...storeCategories];
  const seen = new Set(storeCategories.map(c => c._id));
  entityCategories.forEach(cat => {
    if (cat?._id && cat.FCTM_category_name && !seen.has(cat._id)) {
      merged.push(cat);
      seen.add(cat._id);
    }
  });
  return merged;
};

// --- CAMPOS ---
const camposSAO = [
  { key: "SAO_id", label: "ID Interno SAO" },
  { key: "SAO_username", label: "CIF" },
  { key: "SAO_registryDate", label: "Fecha de Registro", type: "date" },
  { key: "SAO_accessDate", label: "Último Acceso", type: "date" },
  { key: "SAO_name", label: "Nombre / Razón Social" },
  { key: "SAO_organization", label: "Organización / Centro" },
  { key: "SAO_group", label: "Grupo / Curso" },
  { key: "SAO_email", label: "E-mail" },
  { key: "SAO_phone", label: "Teléfono de Contacto" }
];

const buildCamposFCTM = (skillOptions, categoryOptions) => [
  {
    key: "FCTM_company_category",
    label: "Familias Profesionales",
    type: "select-multi",
    options: categoryOptions,
    optionValue: "_id",
    optionLabel: "FCTM_category_name"
  },
  {
    key: "FCTM_skills",
    label: "Aptitudes/Tecnologías",
    type: "select-multi-creatable",
    options: skillOptions,
    optionValue: "_id",
    optionLabel: "FCTM_skill_name"
  },
  {
    key: "FCTM_company_openToHire",
    label: "Interesada en contratar",
    type: "select",
    options: [
      { _id: true, nombre: "Sí" },
      { _id: false, nombre: "No" }
    ]
  },
  { key: "FCTM_company_other_contact", label: "Otro contacto", type: "text" },
  { key: "FCTM_company_observations", label: "Observaciones", type: "textarea" }
];

const buildNormalizationConfig = (skillOptions, categoryOptions) => [
  {
    field: "FCTM_company_category",
    options: categoryOptions,
    optionValue: "_id",
    optionLabel: "FCTM_category_name",
    type: "multi"
  },
  {
    field: "FCTM_skills",
    options: skillOptions,
    optionValue: "_id",
    optionLabel: "FCTM_skill_name",
    type: "multi"
  }
];

const ShowCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hostAPI = getBackendHost()

  // STORES
  const skillOptionsStore = useSkillStore(state => state.skills);
  const cargarSkills = useSkillStore(state => state.cargarSkills);
  const categoriesStore = useCategoryStore(state => state.categories);
  const cargarCategorias = useCategoryStore(state => state.cargarCategorias);
  const user = useUserStore(state => state.user);
  const clearUser = useUserStore(state => state.clearUser);
  const { stats, isLoadingStats } = useStatsStore(); //Estadísticas

  // --- GESTIÓN DE PERMISOS ---
  const userRole = user?.user?.profile || user?.profile;
  const userId = user?.user?.id || user?.id;
  // Comprobamos si el usuario logueado es la propia empresa que se está visualizando
  const isOwnCompany = userId === id;
  // ADMINISTRADOR, PROFESOR o la propia EMPRESA logueada
  const canEditAndManage = useMemo(() => {
    return ["ADMINISTRADOR", "PROFESOR"].includes(userRole) || isOwnCompany;
  }, [userRole, isOwnCompany]);

  // Únicamente ADMINISTRADOR o PROFESOR
  const canCreateActions = useMemo(() => {
    return ["ADMINISTRADOR", "PROFESOR"].includes(userRole);
  }, [userRole]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [documentData, setDocumentData] = useState([]);
  const [files, setFiles] = useState([]);
  
  const [passwordData, setPasswordData] = useState(null);

  useEffect(() => {
    cargarSkills();
    cargarCategorias();
  }, [cargarSkills, cargarCategorias]);

  const currentSkillOptions = useMemo(() => 
    mergeSkillOptions(skillOptionsStore, originalData?.FCTM_skills || []),
    [skillOptionsStore, originalData]
  );

  const currentCategoryOptions = useMemo(() => 
    mergeCategoryOptions(categoriesStore, originalData?.FCTM_company_category || []),
    [categoriesStore, originalData]
  );

  const camposFCTM = useMemo(() => 
    buildCamposFCTM(currentSkillOptions, currentCategoryOptions),
    [currentSkillOptions, currentCategoryOptions]
  );

  const normalizationConfig = useMemo(() => 
    buildNormalizationConfig(currentSkillOptions, currentCategoryOptions),
    [currentSkillOptions, currentCategoryOptions]
  );

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    const res = await sendRequest("GET", null, `/companies/${id}`);

    if (res.success) {
      const config = buildNormalizationConfig(
        mergeSkillOptions(skillOptionsStore, res.data.FCTM_skills || []),
        mergeCategoryOptions(categoriesStore, res.data.FCTM_company_category || [])
      );

      const normalized = normalizeFromApi(res.data, config);
      setData(normalized);
      setOriginalData(normalized);

      const companyDocuments = res.data?.FCTM_documents || [];
      /*let loadedDocuments = [];

      if (companyDocuments.length > 0) {
        const firstItem = companyDocuments[0];
        if (firstItem && typeof firstItem === 'object' && firstItem._id) {
          loadedDocuments = companyDocuments;
        } else {
          const promises = companyDocuments.map(id => sendRequest('GET', null, `/documents/${id}`));
          const responses = await Promise.all(promises);
          loadedDocuments = responses.filter(r => r.success).map(r => r.data);
        }
      }*/

      setDocumentData(companyDocuments);
      const avatarDoc = companyDocuments.find(doc => doc?.FCTM_document_type === 'AVATAR');
      setAvatarUrl(avatarDoc?.FCTM_document_url || companyDocuments?.[0]?.FCTM_document_url || "");
    } else {
      showAlert("Error al cargar la empresa", "error");
    }
    setLoading(false);
  }, [id, skillOptionsStore, categoriesStore]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  const handleSave = async () => {
    try {
      const skillIds = await ensureSkills(data.FCTM_skills);
      const fctmOnly = pickFCTMFields(data);
      const payload = normalizeToApi(fctmOnly, normalizationConfig);

      const isChangingPassword = !!passwordData;

      if (isChangingPassword) {
        const currentPassword = passwordData.password?.trim() || "";
        const newPassword = passwordData.newPassword?.trim() || "";
        const repeatPassword = passwordData.repeatPassword?.trim() || "";

        if (!currentPassword || !newPassword || !repeatPassword) {
          showAlert("Para cambiar la contraseña, debe rellenar los 3 campos", "error");
          return;
        }

        if (!validateStrongPassword(newPassword)) {
          showAlert(
            "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial",
            "error"
          );
          return;
        }

        if (newPassword !== repeatPassword) {
          showAlert("La nueva contraseña y su repetición no coinciden", "error");
          return;
        }

        payload.password = currentPassword;
        payload.newPassword = newPassword;
      }

      const finalPayload = {
        ...payload,
        FCTM_skills: skillIds
      };

      const res = await sendRequest("PATCH", finalPayload, `/companies/${id}`);

      if (res.success) {
        if (isChangingPassword) {
          await externLogout(clearUser, navigate);
          return;
        }

        const config = buildNormalizationConfig(
          mergeSkillOptions(skillOptionsStore, res.data.FCTM_skills || []),
          mergeCategoryOptions(categoriesStore, res.data.FCTM_company_category || [])
        );
        const normalized = normalizeFromApi(res.data, config);
        
        setData(normalized);
        setOriginalData(normalized);
        setPasswordData(null);
        setIsEditing(false);
        cargarSkills(); 
      } else {
        showAlert(res.message || "Error al guardar los cambios", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error crítico al procesar la solicitud", "error");
    }
  };

  const handleDeleteJobOffer = useCallback(async (jobOfferId) => {
    const confirmed = await confirmation("¿Eliminar oferta?");
    if (!confirmed) return;
    const res = await sendRequest("DELETE", null, `/joboffers/${jobOfferId}?companyId=${id}`);
    if (res.success) await fetchCompany();
    else showAlert("Error al eliminar", "error");
  }, [id, fetchCompany]);

  const columnasOfertas = useMemo(() => [
    { key: "FCTM_job_title", encabezado: "Título" },
    { key: "FCTM_job_status", encabezado: "Estado" },
    {
      key: "__show",
      encabezado: "Ver",
      render: (row) => (
        <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/joboffers/${row._id}`, { state: { companyId: id } })}>
          <i className="bi bi-search"></i>
        </button>
      )
    },
    {
      key: "__delete",
      encabezado: "Borrar",
      render: (row) => (
        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteJobOffer(row._id)}>
          <i className="bi bi-trash"></i>
        </button>
      )
    }
  ], [navigate, id, handleDeleteJobOffer]);

  const handleDeleteDocument = useCallback(async (docId) => {    
    const confirmado = await confirmation("¿Seguro que quieres eliminar este documento?");    
    if (!confirmado) return;
    
    const res = await sendRequest("DELETE", undefined, `/documents/${docId}?companyId=${id}`);

    if (res.success) {
      showAlert("Documento eliminado y desvinculado", "success");
      await fetchCompany(); 
    } else {
      showAlert(res.message || "Error al eliminar", "error");
    }
  }, [id, fetchCompany]);

  const handleFileChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 10) {
      showAlert('Solo puedes subir un máximo de 10 documentos', 'error');
      return;
    }

    setFiles(selectedFiles);
  }, []);

  const handleUploadDocs = useCallback(async () => {
    if (files.length === 0) {
      showAlert('Debes seleccionar al menos un archivo', 'error');
      return;
    }

    if (files.length > 10) {
      showAlert('No puedes subir más de 10 archivos a la vez', 'error');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('companyId', id);
    formData.append('FCTM_document_type', 'CONVENIO');

    const res = await sendRequest('POST', formData, '/documents/upload');

    if (res.success) {
      showAlert('Documentos subidos correctamente', 'success');
      setFiles([]);
      await fetchCompany();
    } else {
      showAlert(res.message || 'Error al subir documentos', 'error');
    }
  }, [files, fetchCompany, id]);

  const columnasDocumentos = useMemo(() => [
    { key: "FCTM_document_name", encabezado: "Nombre del Documento" },
    { 
      key: "FCTM_inserted_date", 
      encabezado: "Fecha",
      render: (row) => formatDateDDMMYYYY(row.FCTM_inserted_date) 
    },
    {
      key: 'FCTM_document_url',
      encabezado: 'Descarga',
      render: row => {
        if (!row || !row.FCTM_document_url) return 'No disponible'
        const url = row.FCTM_document_url
        return (
          <a href={hostAPI + url} target="_blank" rel="noopener noreferrer">
            <i className="bi bi-download"></i> {/* Icono de descarga */}
          </a>
        )
      },
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
  ], [handleDeleteDocument]);

  const handleDeleteAction = useCallback(async (actionId) => {
    const confirmed = await confirmation("¿Seguro que quieres eliminar esta acción y desvincularla de la empresa?");
    if (!confirmed) return;

    const res = await sendRequest("DELETE", null, `/actions/${actionId}?companyId=${id}`);

    if (res.success) {
      showAlert("Acción eliminada y desvinculada de la empresa", "success");
      await fetchCompany(); 
    } else {
      showAlert(res.message || "Error al eliminar la acción", "error");
    }
  }, [id, fetchCompany]);

  const columnasAcciones = useMemo(() => [
    { key: "FCTM_action_title", encabezado: "Título" },
    { key: "FCTM_action_type", encabezado: "Tipo" },
    //{ key: "FCTM_created_by", encabezado: "Creada por" },
    {
      key: "CreadaPor",
      encabezado: "Creada por",
      render: (row) => row.FCTM_created_by?.SAO_name + " (" + row.FCTM_created_by?.SAO_profile + ")" || "",
    },
    {
      key: "FCTM_action_datetime",
      encabezado: "Fecha y hora",
      render: (row) => formatDateDDMMYYYY(row.FCTM_action_datetime),
    },
    {
      key: "FCTM_documents",
      encabezado: "Adjuntos",
      render: (row) => row?.FCTM_documents?.length || 0,
    },
    {
      key: "__show",
      encabezado: "Ver",
      render: (row) => (
        <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/actions/${row._id}`)}>
          <i className="bi bi-search"></i>
        </button>
      )
    },
    {
      key: "__delete",
      encabezado: "Borrar",
      render: (row) => (
        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAction(row._id)}>
          <i className="bi bi-trash"></i>
        </button>
      )
    }
  ], [navigate, handleDeleteAction]);

  const handleChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  
  const handleCancel = () => { 
    setData(originalData); 
    setPasswordData(null); 
    setIsEditing(false); 
  };

  if (loading) return <p>Cargando información...</p>;
  if (!data) return <p>Empresa no encontrada.</p>;

  return (
    <section className="dashboard section">
      <ShowHeader title={`EMPRESA: ${data?.SAO_name || "Empresa"}`} onBack={() => navigate("/companies")} />
      
      <UserAvatarUploader userId={id} avatarUrl={avatarUrl} onUploadSuccess={fetchCompany} showUploadAction={canEditAndManage} />

      {/* 🚀 SOLUCIÓN: Condicional con llaves, apertura de etiqueta correcta y validación de carga */}
      {canEditAndManage && !isLoadingStats && (stats?.habilidadesAlumnos?.length > 0 || stats?.alumnadoPorLocalidad?.length > 0) && (
        <StatsLayout>
          <RadarChart 
            title="Top 10 Habilidades Alumnos" 
            data={stats.habilidadesAlumnos || []} 
          />
          <HorizontalBarChart 
            title="Alumnado por Localidad" 
            data={stats.alumnadoPorLocalidad || []}           
          />
        </StatsLayout>
      )}

      <ShowEditableForm
        formTitle="Datos de SAO"
        formId="saoForm"
        data={data}
        fields={camposSAO}
        hideEditButton
      />
      
      <ShowEditableForm
        formTitle="Gestión de Datos FCTM"
        formId="fctmForm"
        data={data}
        fields={camposFCTM}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={handleChange}
        hideEditButton={!canEditAndManage} 
      />

      {canEditAndManage && (
        <SectionChangePassword
          isEditing={isEditing}
          onChange={setPasswordData}
        />
      )}

      <ListCRUD 
        title="Ofertas Relacionadas" 
        datos={data.FCTM_job_offers || []} 
        columnas={columnasOfertas}
      >
        {canEditAndManage && (
          <button className="btn btn-primary" onClick={() => navigate("/joboffers/new", { state: { companyId: id } })}>
            Nueva Oferta
          </button>
        )}
      </ListCRUD>

      {/* --- CAMBIO: Tabla de Documentación oculta si no es Admin, Profesor o su propia Empresa --- */}
      {canEditAndManage && (
        <ListCRUD 
          title="Documentación de Empresa (Convenios, etc.)" 
          datos={documentData} 
          columnas={columnasDocumentos}
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
      )}

      {/* --- CAMBIO: Tabla de Acciones Relacionadas oculta si no es Admin, Profesor o su propia Empresa --- */}
      {canCreateActions && (
        <ListCRUD title="Acciones Relacionadas" datos={data.FCTM_actions || []} columnas={columnasAcciones}>          
            <button className="btn btn-primary" onClick={() => navigate("/actions/new", { state: { companyId: id } })}>
              Nueva Acción
            </button>          
        </ListCRUD>
      )}
    </section>
  );
};

export default ShowCompany;
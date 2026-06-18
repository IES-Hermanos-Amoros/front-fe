import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  sendRequest,
  showAlert,
  formatDateDDMMYYYYHHmm,
  getBackendHost,
  normalizeFromApi,
  normalizeToApi,
  ensureSkills,
  validateStrongPassword, // IMPORTANTE: Importar validación
  confirmation,
  externLogout
} from "../../utils/functions";

import ShowHeader from "../../components/Show/ShowHeader";
import ShowEditableForm from "../../components/Show/ShowEditableForm";
import ListCRUD from "../../components/List/ListCRUD";
import UserAvatarUploader from "../../components/User/UserAvatarUploader";
import SectionChangePassword from "../../components/User/SectionChangePassword"; // IMPORTANTE: Importar sección
import useSkillStore from "../../store/skillStore";
import useCategoryStore from "../../store/categoryStore";
import useUserStore from "../../store/userStore";
import { useStatsStore } from "../../store/useStatsStore";
import BarChart from "../../components/Charts/BarChart";
import PieChart from "../../components/Charts/PieChart";
import RadarChart from "../../components/Charts/RadarChart";
import HorizontalBarChart from "../../components/Charts/HorizontalBarChart";
import StatsLayout from "../../components/Charts/StatsLayout";

/* =========================
   MERGE HELPERS
========================= */
const mergeSkillOptions = (storeSkills = [], entitySkills = []) => {
  const merged = [...storeSkills];
  const seen = new Set(storeSkills.map(s => s._id));
  entitySkills.forEach(skill => {
    if (skill?._id && !seen.has(skill._id)) {
      merged.push(skill);
      seen.add(skill._id);
    }
  });
  return merged;
};

const mergeCategoryOptions = (storeCats = [], entityCats = []) => {
  const merged = [...storeCats];
  const seen = new Set(storeCats.map(c => c._id));
  entityCats.forEach(cat => {
    if (cat?._id && !seen.has(cat._id)) {
      merged.push(cat);
      seen.add(cat._id);
    }
  });
  return merged;
};

/* =========================
   SAO FIELDS
========================= */
const SAO_fields = [
  { key: "SAO_id", label: "SAO ID", type: "text" },
  { key: "SAO_username", label: "NIA", type: "text" },
  { key: "SAO_registryDate", label: "Register Date", type: "date" },
  { key: "SAO_accessDate", label: "Access Date", type: "date" },
  { key: "SAO_name", label: "Name", type: "text" },
  { key: "SAO_organization", label: "Organization", type: "text" },
  { key: "SAO_group", label: "Group", type: "text" },
  { key: "SAO_email", label: "Email", type: "text" },
  { key: "SAO_phone", label: "Phone", type: "text" },
  { key: "SAO_student_id", label: "Student ID", type: "text" },
  { key: "SAO_student_socialNumber", label: "Social Number", type: "text" },
  { key: "SAO_student_city", label: "City", type: "text" },
  { key: "SAO_student_state", label: "State", type: "text" },
  { key: "SAO_student_address", label: "Address", type: "text" }
];

/* =========================
   FCTM FIELDS (FACTORY)
========================= */
const buildFCTMFields = (skillOptions, categoryOptions) => [
  { key: "FCTM_student_observations", label: "Observaciones", type: "text" },
  { key: "FCTM_student_other_contact", label: "Contacto Alternativo", type: "text" },
  {
    key: "FCTM_student_openToWork",
    label: "¿Buscando Empleo?",
    type: "select",
    options: [
      { _id: true, nombre: "Sí" },
      { _id: false, nombre: "No" }
    ],
    optionValue: "_id",
    optionLabel: "nombre"
  },
  {
    key: "FCTM_company_category",
    label: "Categorías",
    type: "select-multi",
    options: categoryOptions,
    optionValue: "_id",
    optionLabel: "FCTM_category_name"
  },
  {
    key: "FCTM_skills",
    label: "Skills",
    type: "select-multi-creatable",
    options: skillOptions,
    optionValue: "_id",
    optionLabel: "FCTM_skill_name"
  }
];

const ShowStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const skillOptionsStore = useSkillStore(state => state.skills);
  const cargarSkills = useSkillStore(state => state.cargarSkills);
  const categoriesStore = useCategoryStore(state => state.categories);
  const cargarCategorias = useCategoryStore(state => state.cargarCategorias);
  const clearUser = useUserStore(state => state.clearUser);
  const user = useUserStore(state => state.user);

  const [data, setData] = useState(null);
  const [file, setFile] = useState(null); // Para un único archivo
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [passwordData, setPasswordData] = useState(null); // NUEVO
  const hostAPI = getBackendHost();
  const { stats, isLoadingStats } = useStatsStore(); //Estadísticas

   // --- GESTIÓN DE PERMISOS ---
  const userRole = user?.user?.profile || user?.profile;
  const userId = user?.user?.id || user?.id;

  // Comprobamos si el usuario logueado es el propio alumno que se está visualizando
  const isOwnStudent = userId === id;

  // ADMINISTRADOR, PROFESOR o la propia EMPRESA logueada
  const canEditAndManage = useMemo(() => {
    return ["ADMINISTRADOR", "PROFESOR"].includes(userRole) || isOwnStudent;
  }, [userRole, isOwnStudent]);
  
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

  const normalizationConfig = useMemo(() => [
    {
      field: "FCTM_company_category",
      options: currentCategoryOptions,
      optionValue: "_id",
      optionLabel: "FCTM_category_name",
      type: "multi"
    },
    {
      field: "FCTM_skills",
      options: currentSkillOptions,
      optionValue: "_id",
      optionLabel: "FCTM_skill_name",
      type: "multi"
    }
  ], [currentSkillOptions, currentCategoryOptions]);

  const FCTM_fields = useMemo(
    () => buildFCTMFields(currentSkillOptions, currentCategoryOptions),
    [currentSkillOptions, currentCategoryOptions]
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; // Tomamos solo el primero
    if (selectedFile) {
      // Opcional: Validar que sea PDF
      if (selectedFile.type !== "application/pdf") {
        showAlert("Por favor, selecciona un archivo PDF", "error");
        e.target.value = null; // Limpiar input
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDelete = async docId => {
      const confirmado = await confirmation(
        '¿Seguro que quieres eliminar este documento?'
      )
      if (!confirmado) return
  
      const res = await sendRequest('DELETE', undefined, `/documents/${docId}?userId=${id}`)
  
      if (res.success) {
        fetchStudent()
      } else {
        showAlert(res.message, 'error')
      }
    }

  const handleUploadCV = async () => {
    if (!file) {
      showAlert("Debes seleccionar un archivo primero", "error");
      return;
    }

    const formData = new FormData();    
    formData.append("files", file); 
    formData.append("type", "CURRÍCULUM VITAE"); // Identificador para el CV
    formData.append("name", "Currículum de " + data?.SAO_name);    
    formData.append("userId", id);

    // En lugar de meter el array entero, inyéctalos uno a uno:
    const perfiles = ['ADMINISTRADOR', 'PROFESOR', 'EMPRESA'];
    perfiles.forEach(perfil => {
      formData.append("visible_to_profiles", perfil); 
    });

    // 3. ¡IMPORTANTE! Llama a la ruta /documents/upload
    const res = await sendRequest('POST', formData, '/documents/upload')

    if(res.success){
      setFile(null);
      fetchStudent();
    } else {
      showAlert(res.message, 'error')
    }
  
  }

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    const res = await sendRequest("GET", null, `/students/${id}`);

    if (res.success) {
      const baseData = {
        ...res.data
      };

      const responseConfig = [
        {
          field: "FCTM_company_category",
          options: mergeCategoryOptions(categoriesStore, res.data.FCTM_company_category || []),
          optionValue: "_id",
          optionLabel: "FCTM_category_name",
          type: "multi"
        },
        {
          field: "FCTM_skills",
          options: mergeSkillOptions(skillOptionsStore, res.data.FCTM_skills || []),
          optionValue: "_id",
          optionLabel: "FCTM_skill_name",
          type: "multi"
        }
      ];

      const normalized = normalizeFromApi(baseData, responseConfig);
      setData(normalized);
      setOriginalData(normalized);

      const avatarDoc = res.data?.FCTM_documents?.find(d => d.FCTM_document_type === "AVATAR");
      setAvatarUrl(avatarDoc?.FCTM_document_url || "");
    } else {
      showAlert(res.message, "error");
    }
    setLoading(false);
  }, [id, skillOptionsStore, categoriesStore]);

  useEffect(() => { fetchStudent(); }, [fetchStudent]);

  /* =========================
     HANDLE SAVE (CON PASSWORD)
  ========================= */
  const handleSave = async () => {
    try {
      // 1. Procesar skills
      const skillIds = await ensureSkills(data.FCTM_skills);

      // 2. Normalizar datos
      const payloadNormalizado = normalizeToApi(data, normalizationConfig);

      // 3. Lógica de Password integrada
      const isChangingPassword = !!passwordData;
      if (isChangingPassword) {
        const currentPassword = passwordData.password?.trim() || "";
        const newPassword = passwordData.newPassword?.trim() || "";
        const repeatPassword = passwordData.repeatPassword?.trim() || "";

        console.log({
          current: passwordData.password,
          newPassword: passwordData.newPassword,
          repeatPassword: passwordData.repeatPassword
        });

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

        payloadNormalizado.password = currentPassword;
        payloadNormalizado.newPassword = newPassword;
      }

      const finalPayload = {
        ...payloadNormalizado,
        FCTM_skills: skillIds
      };

      const res = await sendRequest("PATCH", finalPayload, `/students/${id}`);

      if (res.success) {
        if (isChangingPassword) {
          await externLogout(clearUser, navigate);
          return;
        }

        cargarSkills();
        await fetchStudent();
        setPasswordData(null); // Reset password data
        setIsEditing(false);
      } else {
        showAlert(res.message, "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error al procesar la solicitud", "error");
    }
  };

  const handleChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleCancel = () => { 
    setData(originalData); 
    setPasswordData(null); // Reset password data
    setIsEditing(false); 
  };

  const columnasDocuments = [
    { key: "FCTM_document_name", encabezado: "Nombre" },
    { key: "FCTM_document_type", encabezado: "Tipo" },
    {
      key: "FCTM_document_url",
      encabezado: "Descarga",
      render: row =>
        row?.FCTM_document_url ? (          
          <a href={hostAPI + row.FCTM_document_url} target="_blank" rel="noopener noreferrer">
            <i className="bi bi-download"></i> {/* Icono de descarga */}
          </a>
        ) : "No disponible"
    },
    {
      key: "FCTM_inserted_date",
      encabezado: "Fecha",
      render: row => formatDateDDMMYYYYHHmm(row.FCTM_inserted_date)
    },
    {
      key: '__delete',
      encabezado: 'Eliminar',
      render: row => (
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDelete(row._id)}
          title="Eliminar Documento"
        >
          <i className="bi bi-trash"></i>
        </button>
      ),
    }
  ];

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>No se encontraron datos</p>;

  return (
    <section className="dashboard section">
      <ShowHeader title={`ALUMNO: ${data?.SAO_username || "Alumno"}`} onBack={() => navigate("/students")} />
      
      <UserAvatarUploader userId={id} avatarUrl={avatarUrl} onUploadSuccess={fetchStudent} showUploadAction={canEditAndManage} />

      {/* 🚀 SOLUCIÓN: Condicional correcto usando llaves y validando que existan datos */}
      {canEditAndManage && !isLoadingStats && stats?.tecnologiasDemandadas?.length > 0 && (
        <StatsLayout>
          <PieChart 
            title="Top 10 Tecnologías más Demandadas" 
            data={stats.tecnologiasDemandadas} 
          />        
        </StatsLayout>
      )}

      <ShowEditableForm
        formTitle="Información SAO"
        formId="saoForm"
        data={data}
        fields={SAO_fields}
        hideEditButton={true}
      />

      <ShowEditableForm
        formTitle="Datos FCTM"
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

      <SectionChangePassword
        isEditing={isEditing}
        onChange={setPasswordData}
      />

      {isEditing && (
        <div className="card p-3 mt-3 shadow-sm">
          <h5>Adjuntar Currículum Vitae</h5>
          <p className="text-muted small">Formatos permitidos: PDF (Máx. 1 archivo)</p>

          <input
            type="file"
            accept=".pdf" // Restringe la selección en el explorador de archivos
            className="form-control"
            onChange={handleFileChange}
          />

          <button 
            className="btn btn-primary mt-2" 
            onClick={handleUploadCV}
            disabled={!file} // Deshabilitar si no hay archivo seleccionado
          >
            <i className="bi bi-cloud-upload me-2"></i> Subir C.V.
          </button>
        </div>
      )}

      {data.FCTM_documents?.length > 0 && (
        <ListCRUD title="Documentos" datos={data.FCTM_documents} columnas={columnasDocuments} />
      )}
    </section>
  );
};

export default ShowStudent;
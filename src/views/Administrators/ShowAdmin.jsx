import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  sendRequest,
  showAlert,
  normalizeFromApi,
  normalizeToApi,
  pickFCTMFields,
  validateStrongPassword, // ✅ Importamos validación
  externLogout
} from "../../utils/functions";

import useCategoryStore from "../../store/categoryStore";
import useUserStore from "../../store/userStore";

import ShowHeader from "../../components/Show/ShowHeader";
import ShowEditableForm from "../../components/Show/ShowEditableForm";
import UserAvatarUploader from "../../components/User/UserAvatarUploader";
import SectionChangePassword from "../../components/User/SectionChangePassword"; // ✅ Importamos sección

import { useStatsStore } from "../../store/useStatsStore";
import BarChart from "../../components/Charts/BarChart";
import PieChart from "../../components/Charts/PieChart";
import RadarChart from "../../components/Charts/RadarChart";
import HorizontalBarChart from "../../components/Charts/HorizontalBarChart";
import StatsLayout from "../../components/Charts/StatsLayout";

const SAO_FIELDS = [
  { key: "SAO_username", label: "NIF", type: "text" },
  { key: "SAO_registryDate", label: "Fecha de Registro", type: "date" },
  { key: "SAO_accessDate", label: "Último Acceso", type: "date" },
  { key: "SAO_name", label: "Nombre Completo", type: "text" },
  { key: "SAO_organization", label: "Organización / Centro", type: "text" },
  { key: "SAO_group", label: "Grupo / Clase", type: "text" },
  { key: "SAO_email", label: "Correo Electrónico", type: "email" },
  { key: "SAO_phone", label: "Teléfono de Contacto", type: "text" }
];

const ShowAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const categories = useCategoryStore((state) => state.categories);
  const cargarCategorias = useCategoryStore((state) => state.cargarCategorias);
  const clearUser = useUserStore((state) => state.clearUser);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [passwordData, setPasswordData] = useState(null); // ✅ Nuevo estado para password
  const { stats, isLoadingStats } = useStatsStore(); //Estadísticas

  // ✅ 1. Asegurar options siempre válidas
  const safeCategories = useMemo(() => categories || [], [categories]);

  const normalizationConfig = useMemo(() => [
    {
      field: "FCTM_company_category",
      options: safeCategories,
      optionValue: "_id",
      optionLabel: "FCTM_category_name",
      type: "multi"
    },
    { field: "SAO_registryDate", type: "date" },
    { field: "SAO_accessDate", type: "date" }
  ], [safeCategories]);

  const FCTM_FIELDS = useMemo(() => [
    { key: "FCTM_contact_email", label: "Email de Contacto", type: "email" },
    {
      key: "FCTM_company_category",
      label: "Categorías",
      type: "select-multi",
      options: safeCategories,
      optionValue: "_id",
      optionLabel: "FCTM_category_name"
    }
  ], [safeCategories]);

  // ✅ 2. Fetch admin SOLO cuando categorías están listas
  const fetchAdmin = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const res = await sendRequest("GET", null, `/administrators/${id}`);

    if (res.success) {
      const normalized = normalizeFromApi(res.data, normalizationConfig);

      setData(normalized);
      setOriginalData(normalized);
      setAvatarUrl(res.data?.FCTM_documents?.[0]?.FCTM_document_url || "");
    } else {
      showAlert(res.message, "error");
    }

    setLoading(false);
  }, [id, normalizationConfig]);

  // ✅ 3. Cargar categorías + admin en orden correcto
  useEffect(() => {
    const init = async () => {
      await cargarCategorias();
    };
    init();
  }, [cargarCategorias]);

  useEffect(() => {
    if (categories?.length > 0) {
      fetchAdmin();
    }
  }, [categories, fetchAdmin]);

  const handleSave = async () => {
    const fctmOnly = pickFCTMFields(data);
    const payload = normalizeToApi(fctmOnly, normalizationConfig);

    // ✅ Lógica de Password integrada
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

    const res = await sendRequest("PATCH", payload, `/administrators/${id}`);

    if (res.success) {
      if (isChangingPassword) {
        await externLogout(clearUser, navigate);
        return;
      }

      const normalized = normalizeFromApi(res.data, normalizationConfig);
      setData(normalized);
      setOriginalData(normalized);
      setPasswordData(null); // Limpiamos datos de password
      setIsEditing(false);
    } else {
      showAlert(res.message, "error");
    }
  };

  const handleChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setData(originalData);
    setPasswordData(null); // Limpiamos datos de password al cancelar
    setIsEditing(false);
  };

  if (loading) return <p>Cargando datos...</p>;
  if (!id) return <p>Falta el id del administrador en la URL.</p>;
  if (!data) return <p>No se encontraron datos del administrador.</p>;

  return (
    <section className="dashboard section">
      <ShowHeader
        title={`ADMINISTRADOR: ${data?.SAO_name || "Administrador"}`}
        onBack={() => navigate(-1)}
      />

      <UserAvatarUploader
        userId={id}
        avatarUrl={avatarUrl}
        onUploadSuccess={fetchAdmin}
      />

      <StatsLayout>
        <BarChart 
          title="Convenios por Curso" 
          labels={stats.conveniosPorCurso.labels} 
          values={stats.conveniosPorCurso.data} 
        />

        <BarChart 
          title="F.E. por Curso" 
          labels={stats.fctPorCurso.labels} 
          values={stats.fctPorCurso.data} 
          color="#3498db" 
        />
      </StatsLayout>

      <StatsLayout>
        <PieChart 
          title="Top 10 Tecnologías más Demandadas" 
          data={stats.tecnologiasDemandadas} 
        />

        <RadarChart 
            title="Top 10 Habilidades Alumnos" 
            data={stats.habilidadesAlumnos} 
          />

        <HorizontalBarChart 
          title="Alumnado por Localidad" 
          data={stats.alumnadoPorLocalidad}           
        />
      </StatsLayout>

      <ShowEditableForm
        formTitle="Información de SAO"
        formId="adminSaoForm"
        data={data}
        fields={SAO_FIELDS}
        hideEditButton={true}
      />

      <ShowEditableForm
        formTitle="Datos Adicionales"
        formId="adminFctmForm"
        data={data}
        fields={FCTM_FIELDS}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={handleChange}
      />

      {/* ✅ Nueva sección de password */}
      <SectionChangePassword
        isEditing={isEditing}
        onChange={setPasswordData}
      />
    </section>
  );
};

export default ShowAdmin;
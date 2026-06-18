import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { sendRequest, showAlert } from "../../utils/functions";
import ShowHeader from "../../components/Show/ShowHeader";
import ShowEditableForm from "../../components/Show/ShowEditableForm";
import useUserStore from "../../store/userStore";

const FCTM_FIELDS = [
  {
    key: "FCTM_review_title",
    label: "Título",
    type: "text",
    required: true,
  },
  {
    key: "FCTM_review_rating",
    label: "Calificación",
    type: "star",
    required: true,
  },
  {
    key: "FCTM_review_text",
    label: "Comentario",
    type: "textarea",
    required: true,
  },
];

const ShowReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useUserStore((state) => state.user);
  // Id del usuario logueado: se usa para FCTM_user_id al guardar, sin mostrarlo en pantalla.
  const loggedUserId = useMemo(() => {
    return user?._id || user?.id || user?.user?._id || user?.user?.id || null;
  }, [user]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const userRole = user?.user?.profile || user?.profile;
  const isOwner = useMemo(() => {
    if (!data || !loggedUserId) return false;    
    return data.FCTM_user_id._id === loggedUserId; 
  }, [data, loggedUserId]);

  const canEditAndManage = useMemo(() => {
    return ["ADMINISTRADOR", "PROFESOR"].includes(userRole) || isOwner;
  }, [userRole, isOwner]);


  // Carga inicial de la reseña por ID para modo Show/Edit.
  const fetchReview = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await sendRequest("GET", null, `/reviews/${id}`);

    if (res.success) {      
      setData(res.data);
      setOriginalData(res.data);
    } else {
      showAlert(res.message, "error");
    }

    setLoading(false);
  }, [id]);

  const handleSave = async () => {
    const rating = Number(data?.FCTM_review_rating);

    if (!data?.FCTM_review_title?.trim()) {
      showAlert("El titulo es obligatorio", "error");
      return;
    }

    if (!data?.FCTM_review_text?.trim()) {
      showAlert("El comentario es obligatorio", "error");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      showAlert("La calificacion debe estar entre 1 y 5", "error");
      return;
    }

    if (!loggedUserId) {
      showAlert("No se pudo identificar al usuario logueado", "error");
      return;
    }

    // Solo enviamos los campos de negocio requeridos en la edición de reseñas.
    const payload = {
      FCTM_review_title: data.FCTM_review_title,
      FCTM_review_rating: rating,
      FCTM_review_text: data.FCTM_review_text,
      FCTM_user_id: loggedUserId,
    };

    const res = await sendRequest("PATCH", payload, `/reviews/${id}`);

    if (res.success) {
      showAlert("Modificacion de la reseña pendiente de validación", "success");

      const updatedReview = res.data?.review || res.data;
      setData(updatedReview);
      setOriginalData(updatedReview);
      setIsEditing(false);
    } else {
      showAlert(res.message, "error");
    }
  };

  const handleChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setData(originalData);
    setIsEditing(false);
  };

  const handleBack = () => {
    if (location.state?.returnPath) {
      navigate(location.state.returnPath);
      return;
    }

    navigate(-1);
  };

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  if (loading) return <p className="p-5 text-center">Cargando reseña...</p>;
  if (!data) return <p className="p-5 text-center">No se encontro la reseña</p>;

  const currentRating = Number(data?.FCTM_review_rating) || 0;

  return (
    <section className="dashboard section">
      <ShowHeader
        title={`Opinión de '${data?.FCTM_user_id?.SAO_name}'`}
        onBack={handleBack}
      />

      {data?.FCTM_review_verified === false && (
        <div className="alert alert-warning my-3 d-flex align-items-center mx-1" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>
            <strong>Atención:</strong> Modificación de reseña pendiente de validación por un administrador.
          </div>
        </div>
      )}

      <ShowEditableForm
        formTitle="Información de la Reseña"
        formId="reviewForm"
        data={data}
        fields={FCTM_FIELDS}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={handleChange}
        hideEditButton={!canEditAndManage}
      />
    </section>
  );
};

export default ShowReview;

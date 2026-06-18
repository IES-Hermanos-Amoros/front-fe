import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { sendRequest, showAlert } from '../../utils/functions'
import ShowHeader from '../../components/Show/ShowHeader'
import ShowEditableForm from '../../components/Show/ShowEditableForm'
import useUserStore from '../../store/userStore'

const NewReview = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useUserStore((state) => state.user)
  const loading = useUserStore((state) => state.loading)
  const fetchUser = useUserStore((state) => state.fetchUser)

  const fctId = location.state?.fctId || null
  const returnPath = fctId ? `/fcts/${fctId}` : '/'

  useEffect(() => {
    if (!user) {
      fetchUser()
    }
  }, [user, fetchUser])

  if (loading) {
    return <p className="p-5 text-center">Cargando usuario...</p>
  }

  const [data, setData] = useState({
    FCTM_review_title: '',
    FCTM_review_text: '',
    FCTM_review_rating: 0,
  })

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!data.FCTM_review_title.trim()) {
      showAlert('Por favor, introduce un título para la reseña.', 'error')
      return
    }

    if (data.FCTM_review_rating < 1 || data.FCTM_review_rating > 5) {
      showAlert('Por favor, selecciona una calificación de 1 a 5 estrellas.', 'error')
      return
    }

    if (!data.FCTM_review_text.trim()) {
      showAlert('Por favor, introduce un comentario para la reseña.', 'error')
      return
    }

    if (!user?.user?.id) {
      showAlert('No se ha podido identificar al usuario. Recarga la página.', 'error')
      return
    }

    const payload = {
      ...data,
      FCTM_user_id: user.user.id,
      FCTM_review_verified: false,
      fctId
    }

    const res = await sendRequest('POST', payload, '/reviews')
    if (res.success) {
      navigate(returnPath)
    }
  }

  const FCTM_fields = [
    {
      key: 'FCTM_review_title',
      label: 'Título',
      type: 'text',
      required: true
    },
    {
      key: 'FCTM_review_rating',
      label: 'Calificación',
      type: 'star',
      required: true
    },
    {
      key: 'FCTM_review_text',
      label: 'Comentario',
      type: 'textarea',
      required: true
    }
  ]

  return (
    <section className="dashboard section">
      <ShowHeader
        title="Nueva Reseña"
        onBack={() => navigate(returnPath)}
      />

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Tu reseña quedará pendiente de validación antes de ser publicada.
      </div>

      <ShowEditableForm
        formTitle="Información de la Reseña"
        formId="reviewForm"
        data={data}
        fields={FCTM_fields}
        isEditing={true}
        hideEditButton={true}
        onSave={handleSave}
        onCancel={() => navigate(returnPath)}
        onChange={handleChange}
      />
    </section>
  )
}

export default NewReview
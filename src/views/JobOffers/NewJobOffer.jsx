import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { sendRequest, showAlert } from '../../utils/functions'
import ShowHeader from '../../components/Show/ShowHeader'
import ShowEditableForm from '../../components/Show/ShowEditableForm'
import useEnumStore from '../../store/enumStore'
import useSkillStore from '../../store/skillStore'

const NewJobOffer = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const companyId = location.state?.companyId || null
  const returnPath = companyId ? `/companies/${companyId}` : '/joboffers'

  // =========================
  // ENUMS (ZUSTAND)
  // =========================
  const enums = useEnumStore((state) => state.enums)
  const getEnumArray = useEnumStore((state) => state.getEnumArray)

  const jobStatusOptions = useMemo(() => {
    const statusArray = getEnumArray("JOB_STATUS") || []
    return statusArray.map(item => ({
      _id: item,
      nombre: item
    }))
  }, [enums, getEnumArray])

  // =========================
  // SKILLS (ZUSTAND)
  // =========================
  const skillOptions = useSkillStore((state) => state.skills)
  const cargarSkills = useSkillStore((state) => state.cargarSkills)

  useEffect(() => {
    cargarSkills()
  }, [cargarSkills])

  // =========================
  // STATE
  // =========================
  const today = new Date().toISOString().split("T")[0]

  const [data, setData] = useState({
    FCTM_job_title: '',
    FCTM_job_description: '',
    FCTM_job_requirements: '',
    FCTM_job_start_date: today,
    FCTM_job_end_date: '',
    FCTM_job_observations: '',
    FCTM_job_salary: '',
    FCTM_job_status: 'ACTIVA',
    FCTM_skills: []
  })

  // =========================
  // FORM FIELDS
  // =========================
  const jobOfferFields = [
    { key: 'FCTM_job_title', label: 'Título de la oferta', type: 'text', required: true },
    { key: 'FCTM_job_description', label: 'Descripción', type: 'textarea', required: true },
    { key: 'FCTM_job_requirements', label: 'Requisitos', type: 'textarea' },
    { key: 'FCTM_job_start_date', label: 'Fecha de inicio', type: 'date', required: true },
    { key: 'FCTM_job_end_date', label: 'Fecha de cierre', type: 'date' },
    { key: 'FCTM_job_observations', label: 'Observaciones', type: 'textarea' },
    { key: 'FCTM_job_salary', label: 'Salario', type: 'text' },
    {
      key: 'FCTM_job_status',
      label: 'Estado',
      type: 'select',
      options: jobStatusOptions,
      optionValue: '_id',
      optionLabel: 'nombre',
    },
    {
      key: 'FCTM_skills',
      label: 'Aptitudes/Tecnologías',
      type: 'select-multi-creatable',
      options: skillOptions,
      optionValue: '_id',
      optionLabel: 'FCTM_skill_name'
    }
  ]

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (field, value) => {
    if (field === 'FCTM_job_salary') {
      if (value === '' || /^[\d.,]+$/.test(value)) {
        setData(prev => ({ ...prev, [field]: value }))
      }
    } else {
      setData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSave = async () => {
    // VALIDACIONES
    if (
      !data.FCTM_job_title ||
      !data.FCTM_job_description ||
      !data.FCTM_job_start_date ||
      !data.FCTM_job_status
    ) {
      showAlert('Por favor, completa todos los campos obligatorios.', 'error')
      return
    }

    if (data.FCTM_job_salary && !/^[\d.,]+$/.test(data.FCTM_job_salary)) {
      showAlert('El salario solo puede contener números, comas y puntos.', 'error')
      return
    }

    try {
      // =========================
      // 1. EXTRAER SKILL NAMES
      // =========================
      const rawSkills = Array.isArray(data.FCTM_skills) ? data.FCTM_skills : []

      let skillNames = rawSkills.map(s => {
        let name = null

        if (typeof s === "string") name = s
        else if (s.label) name = s.label
        else if (s.FCTM_skill_name) name = s.FCTM_skill_name

        return name ? name.trim().toUpperCase() : null
      }).filter(Boolean)

      // 🔥 Deduplicar
      skillNames = [...new Set(skillNames)]

      // =========================
      // 2. ENSURE SKILLS
      // =========================
      let skillIds = []

      if (skillNames.length > 0) {
        const resSkills = await sendRequest("POST", { names: skillNames }, "/skills/ensure")

        if (!resSkills.success) {
          showAlert("Error gestionando las aptitudes asociadas", "error")
          return
        }

        skillIds = resSkills.data
      }

      // =========================
      // 3. PAYLOAD FINAL
      // =========================
      const payload = {
        ...data,
        FCTM_skills: skillIds,
        ...(companyId && { companyId })
      }

      // =========================
      // 4. GUARDAR
      // =========================
      const res = await sendRequest('POST', payload, '/joboffers')

      if (res.success) {
        // 🔥 refrescar store (para futuras pantallas)
        await cargarSkills()

        navigate(returnPath)
      } else {
        showAlert(res.message, 'error')
      }

    } catch (err) {
      console.error("Error al guardar la oferta de trabajo:", err)
      showAlert("Error interno al guardar la oferta", "error")
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <section className="dashboard section">
      <ShowHeader
        title="Nueva Oferta de Trabajo"
        onBack={() => navigate(returnPath)}
      />

      <ShowEditableForm
        formTitle="Alta de Oferta de Trabajo"
        formId="jobOfferForm"
        data={data}
        fields={jobOfferFields}
        isEditing={true}
        hideEditButton={true}
        onSave={handleSave}
        onCancel={() => navigate(returnPath)}
        onChange={handleChange}
      />
    </section>
  )
}

export default NewJobOffer
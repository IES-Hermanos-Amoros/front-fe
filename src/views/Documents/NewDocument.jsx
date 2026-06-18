import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { showAlert, normalizeToApi } from '../../utils/functions'
import axios from 'axios'
import ShowHeader from '../../components/Show/ShowHeader'
import ShowEditableForm from '../../components/Show/ShowEditableForm'
import useEnumStore from '../../store/enumStore'


const excludedDocumentTypes = ['CURRÍCULUM VITAE', 'AVATAR'];
const excludedProfiles = ['ADMINISTRADOR', 'PROFESOR'];
// Tipos de documento
/*const documentTypes = [
  { _id: 'GENERAL', nombre: 'GENERAL' },
  { _id: 'MANUAL', nombre: 'MANUAL' },
  { _id: 'DECRETO/ORDEN/CURRÍCULUM', nombre: 'DECRETO/ORDEN/CURRÍCULUM' },
  { _id: 'CURRÍCULUM VITAE', nombre: 'CURRÍCULUM VITAE' },
  { _id: 'OTRO', nombre: 'OTRO' },
  { _id: 'AVATAR', nombre: 'AVATAR' },
]*/
/*
// Perfiles de usuario visibles
const userProfiles = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'PROFESOR', label: 'Profesor' },
  { value: 'ALUMNO', label: 'Alumno' },
  { value: 'EMPRESA', label: 'Empresa' },
]*/



const NewDocument = () => {
  const navigate = useNavigate()
  // =========================
  // ENUMS (ZUSTAND)
  // =========================
  const enums = useEnumStore((state) => state.enums)
  const getEnumArray = useEnumStore((state) => state.getEnumArray)

  const documentTypes = useMemo(() => {
    const statusArray = getEnumArray("DOCUMENT_TYPE") || []
    return statusArray
      .filter(item => !excludedDocumentTypes.includes(item))
      .map(item => ({ _id: item, nombre: item }))
  }, [enums, getEnumArray])
  
  const userProfiles = useMemo(() => {
      const statusArray = getEnumArray("USER_PROFILES") || []
      return statusArray
        .filter(item => !excludedProfiles.includes(item))
        .map(item => ({
          value: item,
          label: item
        }))
    }, [enums, getEnumArray])

    

  // Configuración de normalización
  const normalizationConfig = [
    {
      field: 'visible_to_profiles',
      options: userProfiles,
      optionValue: 'value',
      optionLabel: 'label',
      type: 'multi',
    },
    {
      field: 'type',
      options: documentTypes,
      optionValue: '_id',
      optionLabel: 'nombre',
      type: 'single',
    },
  ]

  // Campos para ShowEditableForm
  const FCTM_fields = [
    { key: 'name', label: 'Nombre', type: 'text', required: true },
    { key: 'description', label: 'Descripción', type: 'text' },
    {
      key: 'type',
      label: 'Tipo',
      type: 'select',
      options: documentTypes,
      optionValue: '_id',
      optionLabel: 'nombre',
      required: true,
    },
    {
      key: 'visible_to_profiles',
      label: 'Perfiles que pueden ver (Además de ADMINISTRADOR y PROFESOR) ',
      type: 'select-multi',
      options: userProfiles,
      optionValue: 'value',
      optionLabel: 'label',
      required: false,
    },
  ]

  const [data, setData] = useState({
    name: '',
    description: '',
    type: 'GENERAL',
    visible_to_profiles: [], 
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  // Guardar documento
  const handleSave = async () => {
    if (!file) {
      showAlert('Debes adjuntar un archivo.', 'error')
      return
    }
    setLoading(true)
    try {
      const normalized = normalizeToApi(data, normalizationConfig)
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('type', normalized.type || data.type)

      /*const perfiles = normalized.visible_to_profiles || []
      perfiles.forEach(p => formData.append('visible_to_profiles', p))*/
      // Lógica de Perfiles: Forzamos ADMINISTRADOR y PROFESOR siempre
      const seleccionados = normalized.visible_to_profiles || []
      // El Set elimina duplicados automáticamente si el usuario ya los había marcado
      const perfilesFinales = [...new Set(['ADMINISTRADOR', 'PROFESOR', ...seleccionados])]
      perfilesFinales.forEach(p => {
        formData.append('visible_to_profiles', p)
      })


      formData.append('files', file)

      const response = await axios.post('/documents/upload', formData)
      showAlert(
        response.data?.msg || 'Documento creado correctamente',
        'success'
      )
      navigate('/documents')
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        err.message ||
        'Error al crear documento'
      showAlert(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="dashboard section">
      <ShowHeader
        title="Nuevo Documento"
        onBack={() => navigate('/documents')}
      />

      <ShowEditableForm
        formTitle="Información del Documento"
        formId="documentForm"
        data={data}
        fields={FCTM_fields}
        isEditing={true}
        hideEditButton={true}
        onSave={handleSave}
        onCancel={() => navigate('/documents')}
        onChange={handleChange}
      />

      {/* Input file fuera de ShowEditableForm porque requiere e.target.files, no e.target.value */}
      <div className="card mt-3">
        <div className="card-header">
          <strong>Archivo adjunto</strong>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">
              Adjuntar archivo (PDF, DOC, etc.){' '}
              <span className="text-danger">*</span>
            </label>
            <input
              type="file"
              className="form-control"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={e => setFile(e.target.files[0] || null)}
              disabled={loading}
            />
            {file && (
              <small className="text-muted mt-1 d-block">
                Seleccionado: {file.name}
              </small>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewDocument

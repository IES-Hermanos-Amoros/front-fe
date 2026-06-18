import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  getBackendHost, 
  sendRequest, 
  showAlert, 
  normalizeFromApi, 
  normalizeToApi 
} from '../../utils/functions'

import ShowHeader from '../../components/Show/ShowHeader'
import ShowEditableForm from '../../components/Show/ShowEditableForm'
import useEnumStore from '../../store/enumStore'
import useUserStore from "../../store/userStore";

const excludedDocumentTypes = [];
const excludedProfiles = ['ADMINISTRADOR', 'PROFESOR'];

const formatDateDDMMYYYYHHmm = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

const ShowDocument = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useUserStore(state => state.user);
  // =========================
  // ENUMS (ZUSTAND)
  // =========================
  const enums = useEnumStore((state) => state.enums)
  const getEnumArray = useEnumStore((state) => state.getEnumArray)
  const cargarEnums = useEnumStore((state) => state.cargarEnums)

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
      .map(item => ({ value: item, label: item }))
  }, [enums, getEnumArray])

  // =========================
  // CONFIGURACIÓN DE NORMALIZACIÓN
  // Sacamos FCTM_document_type de aquí para evitar que destructure el string original en un objeto
  // =========================
  const normalizationConfig = useMemo(() => [
    {
      field: 'FCTM_visible_to_profiles',
      options: userProfiles,
      optionValue: 'value',
      optionLabel: 'label',
      type: 'multi',
    }
  ], [userProfiles])

  // =========================
  // DEFINICIÓN DE CAMPOS
  // =========================
  const camposLecturaFijos = [
    /*{ key: 'computed_url', label: 'URL del documento (Enlace)', type: 'text' },*/
    { key: 'computed_created_by', label: 'Quién creó el documento', type: 'text' },
    { key: 'computed_created_at', label: 'Fecha de creación', type: 'text' },
    { key: 'computed_updated_at', label: 'Fecha de actualización', type: 'text' },
    /*{ key: 'computed_relations', label: 'Relacionado con', type: 'text' }*/
  ]

  const camposEditablesFCTM = [
    { key: 'FCTM_document_name', label: 'Nombre', type: 'text', required: true },
    { key: 'FCTM_document_description', label: 'Descripción', type: 'textarea' },
    {
      key: 'FCTM_document_type',
      label: 'Tipo',
      type: 'select',
      options: documentTypes,
      optionValue: '_id', // Coincide con el String puro de la base de datos
      optionLabel: 'nombre',
      required: true,
    },
    {
      key: 'FCTM_visible_to_profiles',
      label: 'Perfiles que pueden ver (Además de ADMINISTRADOR y PROFESOR)',
      type: 'select-multi',
      options: userProfiles,
      optionValue: 'value',
      optionLabel: 'label',
      required: false,
    },
  ]

  // =========================
  // ESTADOS
  // =========================
  const [documentoRaw, setDocumentoRaw] = useState(null)
  const [data, setData] = useState(null)
  const [originalData, setOriginalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

   // --- GESTIÓN DE PERMISOS ---
  const userRole = user?.user?.profile || user?.profile;    
  // ADMINISTRADOR, PROFESOR o la propia EMPRESA logueada
  const canEditAndManage = useMemo(() => {
    return ["ADMINISTRADOR", "PROFESOR"].includes(userRole);
  }, [userRole]);

  // =========================
  // LÓGICA DE RELACIONES
  // =========================
  const getRelationText = useCallback((doc) => {
    if (!doc) return 'Sin relación'
    if (doc.FCTM_relacion_id) {
      if (typeof doc.FCTM_relacion_id === 'string') return doc.FCTM_relacion_id
      return doc.FCTM_relacion_id.SAO_name || doc.FCTM_relacion_id.FCTM_job_title || doc.FCTM_relacion_id._id || 'Sin relación'
    }

    const related = []
    if (doc.oferta_relacionada?.length) doc.oferta_relacionada.forEach(i => related.push(i?.FCTM_job_title || 'Oferta'))
    if (doc.usuarios_relacionados?.length) doc.usuarios_relacionados.forEach(i => related.push(i?.SAO_name || 'Usuario'))
    if (doc.acciones_relacionadas?.length) doc.acciones_relacionadas.forEach(i => related.push(i?.FCTM_action_title || i?.FCTM_action_type || 'Acción'))
    if (doc.fct_relacionada?.length) doc.fct_relacionada.forEach(() => related.push('FCT'))

    return related.length ? related.join(' | ') : 'Sin relación'
  }, [])

  // =========================
  // CARGA DE DATOS
  // =========================
  const fetchDoc = useCallback(async () => {
    setLoading(true)
    
    // Forzamos carga síncrona de los enumerados globales
    await cargarEnums()

    const res = await sendRequest('GET', null, `/documents/${id}`)

    if (res.success && res.data) {
      const doc = res.data
      setDocumentoRaw(doc)

      // Ejecutamos normalización controlada (solo procesará el array de perfiles)
      const normalized = normalizeFromApi(doc, normalizationConfig)

      // ASIGNACIÓN MANUAL FORZADA: Garantizamos que sea el string puro lo que se guarde en el estado
      normalized.FCTM_document_type = doc.FCTM_document_type || '';

      const hostFileUrl = doc.FCTM_document_url ? getBackendHost() + doc.FCTM_document_url : ''
      
      normalized.computed_url = hostFileUrl
      normalized.computed_created_by = doc.FCTM_document_created_by?.SAO_name || '-'
      normalized.computed_created_at = formatDateDDMMYYYYHHmm(doc.FCTM_inserted_date)
      normalized.computed_updated_at = formatDateDDMMYYYYHHmm(doc.FCTM_updated_date || doc.FCTM_inserted_date)
      normalized.computed_relations = getRelationText(doc)

      if (Array.isArray(normalized.FCTM_visible_to_profiles)) {
        normalized.FCTM_visible_to_profiles = normalized.FCTM_visible_to_profiles.filter(
          p => !excludedProfiles.includes(p)
        )
      }

      setData(normalized)
      setOriginalData(normalized)
    } else {
      showAlert(res.message || 'No se pudo cargar el documento', 'error')
    }
    setLoading(false)
  }, [id, normalizationConfig, getRelationText, cargarEnums])

  useEffect(() => {
    fetchDoc()
  }, [fetchDoc])

  // =========================
  // EVENTOS
  // =========================
  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setData(originalData)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!data.FCTM_document_name?.trim()) {
      showAlert('El nombre del documento es obligatorio.', 'error')
      return
    }

    try {
      const normalizedPayload = normalizeToApi(data, normalizationConfig)

      const seleccionados = normalizedPayload.FCTM_visible_to_profiles || []
      const perfilesFinales = [...new Set(['ADMINISTRADOR', 'PROFESOR', ...seleccionados])]

      const payload = {
        FCTM_document_name: data.FCTM_document_name.trim(),
        FCTM_document_description: data.FCTM_document_description?.trim() || '',
        FCTM_document_type: data.FCTM_document_type, // Enviamos el String puro directamente al backend
        FCTM_visible_to_profiles: perfilesFinales
      }

      const res = await sendRequest('PATCH', payload, `/documents/${id}`)

      if (res.success) {
        showAlert('Documento actualizado correctamente', 'success')
        setIsEditing(false)
        await fetchDoc() 
      } else {
        showAlert(res.message || 'Error al guardar los cambios', 'error')
      }
    } catch (err) {
      console.error(err)
      showAlert('Error crítico al procesar la actualización', 'error')
    }
  }

  if (loading) return <div className="text-center my-5">Cargando...</div>
  if (!data) return <div className="alert alert-danger m-4">Documento no encontrado</div>

  return (
    <section className="dashboard section">
      <ShowHeader
        title={`Ficha del documento: ${originalData?.FCTM_document_name || ''}`}
        onBack={() => navigate('/documents')}
      />

      <ShowEditableForm
        formTitle="Metadatos y Ubicación del Archivo"
        formId="documentFixedForm"
        data={data}
        fields={camposLecturaFijos}
        hideEditButton={true}
      />

      <div className="card mt-3 mb-4 shadow-sm">
        <div className="card-body d-flex align-items-center justify-content-between">
          <div>
            <strong>Acceso directo al archivo adjunto:</strong>
            <span className="text-muted small ms-2">Los archivos físicos son inmutables y no pueden sobrescribirse desde aquí.</span>
          </div>
          <a
            href={data?.computed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-primary"
          >
            <i className="bi bi-box-arrow-up-right me-1"></i> Abrir Documento en pestaña nueva
          </a>
        </div>
      </div>

      <ShowEditableForm
        formTitle="Gestión de Datos del Documento"
        formId="documentEditableForm"
        data={data}
        fields={camposEditablesFCTM}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={handleChange}
        hideEditButton={!canEditAndManage}
      />
    </section>
  )
}

export default ShowDocument
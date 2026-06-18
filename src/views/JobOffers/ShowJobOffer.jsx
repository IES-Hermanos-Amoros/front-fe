import { useState, useEffect, useCallback, useMemo } from 'react'
import { sendRequest, confirmation, showAlert, formatDateDDMMYYYYHHmm, getBackendHost, normalizeFromApi, normalizeToApi, ensureSkills } from '../../utils/functions'
import ListCRUD from "../../components/List/ListCRUD"
import { useNavigate, useParams, useLocation } from 'react-router-dom'

import ShowHeader from '../../components/Show/ShowHeader'
import ShowEditableForm from '../../components/Show/ShowEditableForm'

import useEnumStore from '../../store/enumStore'
import useSkillStore from '../../store/skillStore'
import useUserStore from "../../store/userStore";

const SAO_FIELDS = [
  { key: 'empresa_nombre', label: 'Empresa', type: 'text' },
  { key: 'empresa_ciudad', label: 'Ciudad / Ubicación', type: 'text' },
]

const buildJobOfferFields = (jobStatusOptions, skillOptions) => [
  {
    key: 'FCTM_job_title',
    label: 'Título de la oferta',
    type: 'text',
    required: true,
  },
  {
    key: 'FCTM_job_description',
    label: 'Descripción',
    type: 'textarea',
    required: true,
  },
  { key: 'FCTM_job_requirements', label: 'Requisitos', type: 'textarea' },
  {
    key: 'FCTM_job_start_date',
    label: 'Fecha de inicio',
    type: 'date',
    required: true,
  },
  { key: 'FCTM_job_end_date', label: 'Fecha de cierre', type: 'date' },
  { key: 'FCTM_job_salary', label: 'Salario', type: 'text' },

  {
    key: 'FCTM_job_status',
    label: 'Estado',
    type: 'select',
    options: jobStatusOptions,
    optionValue: '_id',
    optionLabel: 'nombre',
  },
  // Campo de Aptitudes (SKILLS) con opciones dinámicas desde store
  {
    key: "FCTM_skills",
    label: "Aptitudes Demandadas",
    type: "select-multi-creatable", //NEW SKILLS
    options: skillOptions,
    optionValue: "_id",
    optionLabel: "FCTM_skill_name"
  },

  { key: 'FCTM_job_observations', label: 'Observaciones', type: 'textarea' },
]

const normalizationConfig = [
  { field: "FCTM_job_start_date", type: "date" },
  { field: "FCTM_job_end_date", type: "date" }
];

const ShowJobOffer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const readOnly = location.state?.readOnly || false
  const companyId = location.state?.companyId || null
  const returnPath = companyId ? `/companies/${companyId}` : '/joboffers'
  const user = useUserStore(state => state.user);

  //ENUM STORE
  const cargarEnums = useEnumStore(state => state.cargarEnums)
  const getEnumArray = useEnumStore(state => state.getEnumArray)
  const enums = useEnumStore(state => state.enums)
  const cargarSkills = useSkillStore(state => state.cargarSkills)
  const skillOptions = useSkillStore(state => state.skills)


  // Cargar enums y skills
  useEffect(() => {
    cargarEnums()
    cargarSkills()
  }, [cargarEnums, cargarSkills])

  const jobStatusOptions =
    getEnumArray('JOB_STATUS')?.map(item => ({
      _id: item,
      nombre: item,
    })) || []

  const jobOfferFields = buildJobOfferFields(jobStatusOptions, skillOptions)

  const [data, setData] = useState(null) // Datos del JobOffer cargado desde API
  const [documentData, setDocumentData] = useState([]) //Datos del Documents cargado desde API
  const [loading, setLoading] = useState(true) // Controla estado de carga
  const [isEditing, setIsEditing] = useState(false) // Modo SHOW / EDIT
  const [originalData, setOriginalData] = useState(null)
  const [files, setFiles] = useState([])
  const hostAPI = getBackendHost()

  // --- GESTIÓN DE PERMISOS ---
  const userRole = user?.user?.profile || user?.profile;
  const userId = user?.user?.id || user?.id;
  
  // Comprobamos si el usuario logueado es la empresa propietaria de esta oferta
  // Usamos res.data.empresa._id (que guardaste en el fetch) o como venga en tu objeto original
  const isOwner = useMemo(() => {
    if (!data || !userId) return false;
    
    // Si en normalizedData guardaste el objeto completo de la empresa, o si prefieres 
    // mapear el ID en el fetch (ver paso 2), lo comparamos aquí:
    console.log("INFO DATA EMPRESA: ", data.empresa._id)
    return data.empresa._id === userId; 
  }, [data, userId]);

  // ADMINISTRADOR, PROFESOR o la propia EMPRESA logueada
  // Se recalculará automáticamente en cuanto 'userRole' o 'isOwner' cambien (tras el fetch)
  const canEditAndManage = useMemo(() => {
    return ["ADMINISTRADOR", "PROFESOR"].includes(userRole) || isOwner;
  }, [userRole, isOwner]);


  const columnasDocuments = [
    { key: 'FCTM_document_name', encabezado: 'Nombre' },
    { key: 'FCTM_document_type', encabezado: 'Tipo' },
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
      key: 'FCTM_inserted_date',
      encabezado: 'Fecha ',
      render: row => formatDateDDMMYYYYHHmm(row.FCTM_inserted_date),
    },
    // Solo mostrar botón eliminar si readOnly es false
    ...(!readOnly
      ? [
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
          },
        ]
      : []),
  ]

  const fetchJobOffer = useCallback(async () => {
    setLoading(true);

    const res = await sendRequest("GET", null, `/joboffers/${id}`);

    if (res.success) {
      let normalizedData = normalizeFromApi(res.data, normalizationConfig);

      // ✅ Aplanar empresa si existe
      if (res.data.empresa) {
        normalizedData = {
          ...normalizedData,
          empresa_nombre: res.data.empresa.SAO_name,
          empresa_ciudad: res.data.empresa.SAO_company_city,
        };
      }

      //Obtener usuario que creó la oferta
      console.log("JOB OFFER INFOOOO: ", normalizedData)

      // ✅ Guardar en los estados locales de la oferta
      setData(normalizedData);
      setOriginalData(normalizedData);

      // ✅ Asignar directamente los documentos (el backend ya los devuelve poblados y ordenados)
      if (res.data.FCTM_documents && res.data.FCTM_documents.length > 0) {
        setDocumentData(res.data.FCTM_documents);
      } else {
        setDocumentData([]);
      }

    } else {
      console.error("Error al cargar joboffer:", res.message);
      showAlert(res.message || "Error al cargar la oferta", "error");
    }

    setLoading(false);
  }, [id]);

  const handleDelete_OLD = async docId => {
    const confirmado = await confirmation(
      '¿Seguro que quieres eliminar este documento?'
    )
    if (!confirmado) return

    const res = await sendRequest('DELETE', undefined, `/documents/${docId}`)

    if (res.success) {
      const updatedDocuments = data.FCTM_documents.filter(
        item => item !== docId
      )
      const patchRes = await sendRequest(
        'PATCH',
        { FCTM_documents: updatedDocuments },
        `/joboffers/${id}`
      )

      if (patchRes.success) {
        //showAlert('Documento eliminado y oferta actualizada', 'success')

        setData(prev => ({
          ...prev,
          FCTM_documents: updatedDocuments,
        }))

        //fetchJobOffer()
      } else {
        showAlert('Error actualizando la oferta: ' + patchRes.message, 'error')
      }
    } else {
      showAlert(res.message, 'error')
    }
  }

  const handleDelete = async docId => {
    const confirmado = await confirmation(
      '¿Seguro que quieres eliminar este documento?'
    )
    if (!confirmado) return

    // 1. Borramos el documento del servidor
    const res = await sendRequest('DELETE', undefined, `/documents/${docId}`)

    if (res.success) {
      // 2. Filtramos la lista de IDs originales que tiene la oferta de trabajo
      // Nos aseguramos de comparar strings usando ._id o el propio item si viniera plano
      const originalDocs = data.FCTM_documents || [];
      const updatedDocuments = originalDocs.filter(item => {
        const idString = typeof item === 'object' ? item._id : item;
        return idString !== docId;
      });

      // 3. Desvinculamos el documento de la oferta mediante un PATCH
      const patchRes = await sendRequest(
        'PATCH',
        { FCTM_documents: updatedDocuments },
        `/joboffers/${id}`
      )

      if (patchRes.success) {
        // 4. Actualizamos de golpe AMBOS estados locales para sincronizar la UI
        setData(prev => ({
          ...prev,
          FCTM_documents: updatedDocuments,
        }))

        // Filtramos también el estado visual de la tabla (objetos completos)
        setDocumentData(prevDocs => prevDocs.filter(doc => doc._id !== docId));
        
        // OPCIONAL: Si quieres re-confirmar con el backend que todo está sincronizado
        // fetchJobOffer() 
      } else {
        showAlert('Error actualizando la oferta: ' + patchRes.message, 'error')
      }
    } else {
      showAlert(res.message, 'error')
    }
  }

//CAMBIOS PARA LA PRECARGA DE FECHAS
const handleSave = async () => {
    try {
      // 1. Procesamos las skills para obtener los IDs
      const skillIds = await ensureSkills(data.FCTM_skills);

      // 2. Construimos el payload manualmente (evita enviar empresa_nombre y empresa_ciudad)
      // Esto soluciona el Error 500 y asegura el formato de las fechas
      const finalPayload = {
        FCTM_job_title: data.FCTM_job_title,
        FCTM_job_description: data.FCTM_job_description,
        FCTM_job_requirements: data.FCTM_job_requirements || "",
        FCTM_job_salary: data.FCTM_job_salary || "",
        FCTM_job_status: data.FCTM_job_status,
        FCTM_job_observations: data.FCTM_job_observations || "",
        FCTM_skills: skillIds,
        FCTM_job_start_date: data.FCTM_job_start_date, 
        FCTM_job_end_date: data.FCTM_job_end_date || null
      };

      const res = await sendRequest("PATCH", finalPayload, `/joboffers/${id}`);

      if (res.success) {
        // 3. Refrescamos datos y cerramos edición
        // Usamos un pequeño delay y fetchJobOffer para que la precarga de fechas sea perfecta
        setTimeout(() => {
          fetchJobOffer();
          setIsEditing(false);
          //showAlert("Cambios guardados con éxito", "success");
        }, 500);
      } else {
        showAlert(res.message, "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error guardando", "error");
    }
  };

  const handleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCancel = () => {
    setData(originalData)
    setIsEditing(false)
  }

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files)

    if (selectedFiles.length > 10) {
      showAlert('Solo puedes subir un máximo de 10 documentos', 'error')
      return
    }

    setFiles(selectedFiles)
  }
 

  const handleUploadDocs = async () => {
    if (files.length === 0) {
      showAlert('Debes seleccionar al menos un archivo', 'error')
      return
    }

    const formData = new FormData()

    // 1. Cambia 'documents' por 'files' para que coincida con el middleware: upload.array("files", 10)
    for (const file of files) {
      formData.append('files', file)
    }

    // 2. Agrega los datos adicionales al formData (Multer los recibirá en req.body)
    formData.append('FCTM_document_type', 'GENERAL')
    formData.append('visible_to_profiles', 'ADMINISTRADOR, PROFESOR, ALUMNO')
    formData.append('jobOfferId', id)
    // Nota: No envíes createdBy aquí si lo asignas en el backend desde req.user.id

    // 3. ¡IMPORTANTE! Llama a la ruta /documents/upload
    const res = await sendRequest('POST', formData, '/documents/upload')

    if (res.success) {
      showAlert('Documentos subidos correctamente', 'success')

      // 4. Actualiza la oferta con los nuevos IDs
      const newDocIds = Array.isArray(res.data)
        ? res.data.map(d => d._id)
        : [res.data._id]
      const updatedDocuments = [...(data.FCTM_documents || []), ...newDocIds]

      const patchRes = await sendRequest(
        'PATCH',
        { FCTM_documents: updatedDocuments },
        `/joboffers/${id}`
      )

      if (patchRes.success) {
        setData(prev => ({ ...prev, FCTM_documents: updatedDocuments }))
        setFiles([])
        fetchJobOffer()
      }
    } else {
      showAlert(res.message, 'error')
    }
  }

  useEffect(() => {
    fetchJobOffer()
  }, [fetchJobOffer])

  if (loading) return <p>Cargando datos...</p>
  if (!data) return <p>No se encontraron datos</p>

  return (
    <section className="dashboard section">
      <ShowHeader
        title={`Ficha de ${data?.FCTM_job_title || 'JobOffer'}`}
        onBack={() => navigate(returnPath)}
      />

      <ShowEditableForm
        formTitle="Información de SAO"
        formId="jobOfferSaoForm"
        data={data}
        fields={SAO_FIELDS}
        hideEditButton={true}
      />

      <ShowEditableForm
        formTitle="Información de la Oferta de Trabajo"
        formId="ftcmForm"
        data={data}
        fields={jobOfferFields}
        isEditing={isEditing && !readOnly} // si readOnly, nunca permitir editar
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={handleChange}
        hideEditButton={readOnly} // Si readOnly es true, ocultamos el botón de editar
      />

      {/*isEditing && !readOnly && (
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
      
    </section>
  )
}

export default ShowJobOffer
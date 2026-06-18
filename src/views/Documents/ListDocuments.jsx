import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import {
  sendRequest,
  getBackendHost,
  formatDateDDMMYYYYHHmm,
  showAlert,
} from '../../utils/functions'
import Swal from 'sweetalert2'
import useUserStore from '../../store/userStore'
import './ListDocuments.css'
import ListCRUD from '../../components/List/ListCRUD'

const ListDocuments = () => {  
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = useUserStore(state => state.user)
  const navigate = useNavigate();

  // Identificadores del usuario actual
  const userId = user?._id || user?.id || user?.user?._id || user?.user?.id || null
  
  //console.log("USER EN LISTDOC", user.user)

  // Extraemos el perfil para validar permisos especiales de borrado
  const userProfile = user?.user?.profile || null

  const canCreateDocuments = useMemo(() => {
      return ["ADMINISTRADOR", "PROFESOR"].includes(userProfile);
    }, [userProfile]);

  const handleDelete = async row => {
    const confirm = await Swal.fire({
      title: '¿Eliminar documento?',
      text: 'Esta acción no se puede deshacer. ¿Seguro que quieres eliminar el documento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (!confirm.isConfirmed) return
    try {
      const res = await sendRequest('DELETE', null, `/documents/${row._id}`)
      if (res.success) {
        showAlert('Documento eliminado correctamente', 'success')
        fetchData()
      }
    } catch (err) {
      showAlert('Error al eliminar el documento', 'error')
    }
  }

  const hostAPI = getBackendHost()

  const handleDownload = async row => {
    try {
      const url = `${hostAPI}/documents/${row._id}/download`

      const response = await axios({
        url,
        method: 'GET',
        responseType: 'blob',
        withCredentials: true,
      })

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', row.FCTM_document_name || 'archivo')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Error en la descarga:', err)

      if (err.response && err.response.status === 404) {
        showAlert('El archivo no existe en el servidor', 'error')
      } else {
        showAlert('Error al intentar descargar el archivo', 'error')
      }
    }
  }

  // Fetch de documentos
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await sendRequest('GET', null, '/documents')
      if (res.success) setDocumentos(res.data)
      else setError(res.message || 'Error al cargar documentos')
    } catch (err) {
      setError(err.message || 'Error al cargar documentos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const colDocumentos_old = useMemo(() => [
    { key: 'FCTM_document_name', encabezado: 'Nombre' },
    { key: 'FCTM_document_description', 
      encabezado: 'Descripción',
      render: row => row.FCTM_document_description && row.FCTM_document_description.length > 60 
                ? `${row.FCTM_document_description.substring(0, 60)}...` 
                : row.FCTM_document_description || '-' 
    },
    { key: 'FCTM_document_type', encabezado: 'Tipo' },
    {
      key: 'related_to',
      encabezado: 'Relacionado con',
      render: row => {
        const relations = []

        if (row.oferta_relacionada && row.oferta_relacionada.length > 0) {
          row.oferta_relacionada.forEach(oferta => {
            relations.push(
              <div
                key={`offer-${oferta._id}`}
                className="badge bg-primary me-1"
                title="Oferta de Trabajo"
              >
                <i className="bi bi-briefcase me-1"></i>
                {oferta.FCTM_job_title}{' '}
                {oferta.empresa ? `(${oferta.empresa.SAO_name})` : ''}
              </div>
            )
          })
        }

        if (row.usuarios_relacionados && row.usuarios_relacionados.length > 0) {
          row.usuarios_relacionados.forEach(user => {
            let badgeClass = 'bg-secondary'
            let iconClass = 'bi-person'

            if (user.SAO_profile === 'ALUMNO') {
              badgeClass = 'bg-success'
              iconClass = 'bi-mortarboard'
            } else if (user.SAO_profile === 'PROFESOR') {
              badgeClass = 'bg-info text-dark'
              iconClass = 'bi-person-badge'
            }

            relations.push(
              <div
                key={`user-${user._id}`}
                className={`badge ${badgeClass} me-1`}
                title={user.SAO_profile}
              >
                <i className={`bi ${iconClass} me-1`}></i>
                {user.SAO_name}
              </div>
            )
          })
        }

        if (row.acciones_relacionadas && row.acciones_relacionadas.length > 0) {
          row.acciones_relacionadas.forEach(accion => {
            relations.push(
              <div
                key={`action-${accion._id}`}
                className="badge bg-warning text-dark me-1"
                title="Acción"
              >
                <i className="bi bi-activity me-1"></i>
                {accion.FCTM_action_title || accion.FCTM_action_type}
              </div>
            )
          })
        }

        return relations.length > 0 ? (
          <div className="d-flex flex-wrap gap-1">{relations}</div>
        ) : (
          <span className="text-muted small">Sin relación</span>
        )
      },
    },
    {
      key: 'FCTM_inserted_date',
      encabezado: 'Fecha Subida',
      render: row => (
        <span className="small">
          {formatDateDDMMYYYYHHmm(row.FCTM_inserted_date)}
        </span>
      ),
    },
    {
      key: 'FCTM_document_created_by',
      encabezado: 'Subido por',
      render: row =>
        row.FCTM_document_created_by ? (
          row.FCTM_document_created_by.SAO_name
         ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      key: 'FCTM_document_url',
      encabezado: 'Acciones',
      render: row => {
        if (!row || !row.FCTM_document_url)
          return <span className="text-muted">-</span>

        // LÓGICA DE PERMISOS DE BORRADO:
        // Caso A: El usuario es el creador del documento.
        const esCreador = row.FCTM_document_created_by && 
          (row.FCTM_document_created_by._id === userId || row.FCTM_document_created_by === userId);
        
        // Caso B: El usuario ostenta un rol privilegiado de gestión.
        const esRolGestion = userProfile === 'ADMINISTRADOR' || userProfile === 'PROFESOR';

        // Puede eliminar si cumple cualquiera de las dos condiciones
        const puedeEliminar = esCreador || esRolGestion;

        return (
          <div className="d-flex gap-2">
            <a href={hostAPI + row.FCTM_document_url} 
                title="Descargar documento"
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-success"
            >
              <i className="bi bi-download"></i>
            </a>            
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => navigate(`/documents/${row._id}`)}
              title="Ver documento"
            >
              <i className="bi bi-search"></i>
            </button>
            
            {puedeEliminar && (
              <button
                onClick={() => handleDelete(row)}
                className="btn btn-sm btn-outline-danger"
                title="Eliminar documento"
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        )
      },
    },
  ], [userId, userProfile, hostAPI, navigate]); // Añadidos "userProfile" y "navigate" a las dependencias del useMemo

  const colDocumentos = useMemo(() => [
    { key: 'FCTM_document_name', encabezado: 'Nombre', primary: true },
    { key: 'FCTM_document_description', 
      encabezado: 'Descripción',
      accessorFn: row => row.FCTM_document_description && row.FCTM_document_description.length > 60 
                ? `${row.FCTM_document_description.substring(0, 60)}...` 
                : row.FCTM_document_description || '-' ,
      render: row => row.FCTM_document_description && row.FCTM_document_description.length > 60 
                ? `${row.FCTM_document_description.substring(0, 60)}...` 
                : row.FCTM_document_description || '-' 
    },
    { key: 'FCTM_document_type', encabezado: 'Tipo', primary: true },
    {
      id: 'related_to', // Usamos un id explícito para columnas complejas con accessorFn
      encabezado: 'Relacionado con',
      
      // 🔍 SOLUCIÓN BÚSQUEDA: Mapeamos los datos anidados a un string plano e invisible que TanStack pueda rastrear
      accessorFn: row => {
        const terminosBusqueda = [];
        
        if (row.oferta_relacionada?.length > 0) {
          row.oferta_relacionada.forEach(o => {
            terminosBusqueda.push(o.FCTM_job_title);
            if (o.empresa?.SAO_name) terminosBusqueda.push(o.empresa.SAO_name);
          });
        }
        
        if (row.usuarios_relacionados?.length > 0) {
          row.usuarios_relacionados.forEach(u => terminosBusqueda.push(u.SAO_name));
        }
        
        if (row.acciones_relacionadas?.length > 0) {
          row.acciones_relacionadas.forEach(a => terminosBusqueda.push(a.FCTM_action_title || a.FCTM_action_type));
        }

        if (row.fcts_relacionadas?.length > 0) {
          row.fcts_relacionadas.forEach(f => {
            terminosBusqueda.push(f.SAO_student_name);
            terminosBusqueda.push(f.SAO_company_name);
          });
        }
        
        return terminosBusqueda.join(' ');
      },

      // Mantienes tu renderizado visual idéntico con los badges e iconos correspondientes
      render: row => {
        const relations = []

        // 1. RELACIÓN: OFERTAS DE TRABAJO
        if (row.oferta_relacionada && row.oferta_relacionada.length > 0) {
          row.oferta_relacionada.forEach(oferta => {
            relations.push(
              <div
                key={`offer-${oferta._id}`}
                className="badge bg-primary me-1"
                title="Oferta de Trabajo"
              >
                <i className="bi bi-briefcase me-1"></i>
                {oferta.FCTM_job_title}{' '}
                {oferta.empresa ? `(${oferta.empresa.SAO_name})` : ''}
              </div>
            )
          })
        }

        // 2. RELACIÓN: USUARIOS DIRECTOS
        if (row.usuarios_relacionados && row.usuarios_relacionados.length > 0) {
          row.usuarios_relacionados.forEach(user => {
            let badgeClass = 'bg-secondary'
            let iconClass = 'bi-person'

            if (user.SAO_profile === 'ALUMNO') {
              badgeClass = 'bg-success'
              iconClass = 'bi-mortarboard'
            } else if (user.SAO_profile === 'PROFESOR') {
              badgeClass = 'bg-info text-dark'
              iconClass = 'bi-person-badge'
            }

            relations.push(
              <div
                key={`user-${user._id}`}
                className={`badge ${badgeClass} me-1`}
                title={user.SAO_profile}
              >
                <i className={`bi ${iconClass} me-1`}></i>
                {user.SAO_name}
              </div>
            )
          })
        }

        // 3. RELACIÓN: ACCIONES
        if (row.acciones_relacionadas && row.acciones_relacionadas.length > 0) {
          row.acciones_relacionadas.forEach(accion => {
            relations.push(
              <div
                key={`action-${accion._id}`}
                className="badge bg-warning text-dark me-1"
                title="Acción"
              >
                <i className="bi bi-activity me-1"></i>
                {accion.FCTM_action_title || accion.FCTM_action_type}
              </div>
            )
          })
        }

        // 🚀 4. NUEVA RELACIÓN: PRÁCTICAS EN EMPRESA (FCTs)
        if (row.fcts_relacionadas && row.fcts_relacionadas.length > 0) {
          row.fcts_relacionadas.forEach(fct => {
            relations.push(
              <div
                key={`fct-${fct._id || fct.SAO_fct_id}`}
                className="badge text-white me-1" 
                style={{ backgroundColor: '#6f42c1' }}
                title={`FCT ID: ${fct.SAO_fct_id}`}
              >
                <i className="bi bi-file-earmark-text me-1"></i>
                FCT: {fct.SAO_student_name} ➔ {fct.SAO_company_name}
              </div>
            )
          })
        }

        return relations.length > 0 ? (
          <div className="d-flex flex-wrap gap-1">{relations}</div>
        ) : (
          <span className="text-muted small">Sin relación</span>
        )
      },
    },
    {
      id: 'FCTM_inserted_date', // Cambiamos key por id explícito para asegurar compatibilidad con sorting
      encabezado: 'Fecha Subida',
      
      // ⏳ SOLUCIÓN ORDENACIÓN: Pasamos la fecha como objeto Date puro para que TanStack ordene de forma cronológica exacta
      accessorFn: row => row.FCTM_inserted_date ? new Date(row.FCTM_inserted_date) : null,
      
      sortingFn: 'datetime', // Fuerza a TanStack a clasificarlo como fecha cronológica
      
      render: row => (
        <span className="small">
          {formatDateDDMMYYYYHHmm(row.FCTM_inserted_date)}
        </span>
      ),
    },
    {
      key: 'FCTM_document_created_by',
      encabezado: 'Subido por',
      accessorFn: row =>
        row.FCTM_document_created_by ? (
          row.FCTM_document_created_by.SAO_name
         ) : (
          <span className="text-muted">-</span>
        ),
      render: row =>
        row.FCTM_document_created_by ? (
          row.FCTM_document_created_by.SAO_name
         ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      key: 'FCTM_document_url',
      encabezado: 'Acciones',
      render: row => {
        if (!row || !row.FCTM_document_url)
          return <span className="text-muted">-</span>

        const esCreador = row.FCTM_document_created_by && 
          (row.FCTM_document_created_by._id === userId || row.FCTM_document_created_by === userId);
        
        const esRolGestion = userProfile === 'ADMINISTRADOR' || userProfile === 'PROFESOR';
        const puedeEliminar = esCreador || esRolGestion;

        return (
          <div className="d-flex gap-2">
            <a href={hostAPI + row.FCTM_document_url} 
                title="Descargar documento"
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-success"
            >
              <i className="bi bi-download"></i>
            </a>            
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => navigate(`/documents/${row._id}`)}
              title="Ver documento"
            >
              <i className="bi bi-search"></i>
            </button>
            
            {puedeEliminar && (
              <button
                onClick={() => handleDelete(row)}
                className="btn btn-sm btn-outline-danger"
                title="Eliminar documento"
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        )
      },
    },
  ], [userId, userProfile, hostAPI, navigate]);

  return (
    <>
          {loading && 
                 <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              }
          {!loading && error && <p className="text-danger">{error}</p>}
          {!loading && !error && documentos.length === 0 && (
              <p className="text-muted">No hay documetos disponibles</p>
          )}
          {!loading && !error && (
            <ListCRUD
              title="Repositorio Documental"
              datos={documentos}
              columnas={colDocumentos}
              tableId="documentos"
            >
              {canCreateDocuments && 
                <button className="btn btn-primary" onClick={() => navigate("/documents/new")}>
                  Nuevo Documento
                </button>
              }
            </ListCRUD>
          )}
    </>
  )
}

export default ListDocuments
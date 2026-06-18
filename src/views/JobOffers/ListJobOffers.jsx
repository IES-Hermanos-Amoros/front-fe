import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { sendRequest, confirmation, showAlert, stringToColor, formatDateDDMMYYYY } from '../../utils/functions'
import { useNavigate } from 'react-router-dom'
import ListCRUD from '../../components/List/ListCRUD'


const ListJobOffers = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // =======================
  // COLUMNAS MEMORIZADAS
  // =======================
  const columnas = useMemo(
    () => [
      { key: 'FCTM_job_title', encabezado: 'Título', primary: true },

      {
        key: 'FCTM_job_start_date',
        encabezado: 'Fec.Ini',
        accessorFn: row => row.FCTM_job_start_date ? new Date(row.FCTM_job_start_date).getTime() : 0,
        render: row => formatDateDDMMYYYY(row.FCTM_job_start_date),
      },

      {
        key: 'FCTM_job_end_date',
        encabezado: 'Fec.Fin',
        accessorFn: row => row.FCTM_job_end_date ? new Date(row.FCTM_job_end_date).getTime() : 0,
        render: row => formatDateDDMMYYYY(row.FCTM_job_end_date),
      },

      {
        key: 'empresa',
        encabezado: 'Empresa',
        primary: true,
        accessorFn: row => row.empresa?.SAO_name || '',
        render: row => row.empresa?.SAO_name || '-',
      },

      {
        key: 'localidad',
        encabezado: 'Localidad',
        accessorFn: row => row.empresa?.SAO_company_city || '',
        render: row => row.empresa?.SAO_company_city || '-',
      },

      { key: 'FCTM_job_status', encabezado: 'Estado' },

      // Familias Profesionales (SKILLS) 
      {
        key: "FCTM_skills",
        encabezado: "Aptitudes Demandadas",
        accessorFn: row =>
          Array.isArray(row.FCTM_skills)
            ? row.FCTM_skills
                .filter(s => s && s.FCTM_skill_name)
                .map(s => s.FCTM_skill_name)
                .join(" ")
            : "",
        render: row => (
          <div className="d-flex flex-wrap gap-1">
            {Array.isArray(row.FCTM_skills) && row.FCTM_skills.length > 0 ? (
              row.FCTM_skills
                .filter(skill => skill && skill.FCTM_skill_name) // ⭐ FILTRAMOS LOS MALOS
                .map(skill => {
                  const bgColor = stringToColor(skill.FCTM_skill_name)
                  return (
                    <span
                      key={skill._id}
                      className="badge rounded-pill text-dark"
                      style={{
                        backgroundColor: bgColor,
                        border: '1px solid rgba(0,0,0,0.1)',
                        fontSize: '0.75rem'
                      }}
                    >
                      {skill.FCTM_skill_name}
                    </span>
                  )
                })
            ) : (
              <span className="text-muted small">-</span>
            )}
          </div>
        )
      },

      {
        key: '__show',
        encabezado: 'Acciones',
        render: row => (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => navigate(`/jobOffers/${row._id}`, { state: { readOnly: true } })}
          >
            <i className="bi bi-search"></i>
          </button>
        ),
      },
    ],
    [navigate]
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await sendRequest('GET', null, '/jobOffers')

      if (res.success) {
        // Normalizamos los datos para asegurar que FCTM_skills siempre sea un array de objetos con FCTM_skill_name
        /*const normalized = res.data.map(item => ({
          ...item,
          FCTM_skills: Array.isArray(item.FCTM_skills)
            ? item.FCTM_skills
                .map(s => {
                  if (typeof s === "string") {
                    return skillOptions.find(opt => opt._id === s)
                  }
                  if (s && s.FCTM_skill_name) return s
                  return null
                })
                .filter(Boolean)
            : []
        }))

        setData(normalized)*/
        setData(res.data)
      } else {
        setError(res.message || 'Error al cargar las ofertas')
      }

    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // =======================
  // RENDER
  // =======================
  return (
    <>
      {loading && 
                 <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              }
      {!loading && error && <p className="text-danger">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="text-muted">No hay ofertas disponibles</p>
      )}

      {!loading && !error && data.length > 0 && (
        <ListCRUD 
          title={'Gestión de Ofertas de Trabajo'}
          datos={data}
          columnas={columnas}       
        />
      )}
    </>
  )
}

export default ListJobOffers

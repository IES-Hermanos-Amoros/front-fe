import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { sendRequest } from '../../utils/functions'
import { useNavigate } from 'react-router-dom'
import ListCRUD from "../../components/List/ListCRUD";

// anyos disponibles
const academicYearOptions = [
  { value: '20/21', label: '20/21' },
  { value: '21/22', label: '21/22' },
  { value: '22/23', label: '22/23' },
  { value: '24/25', label: '24/25' },
  { value: '25/26', label: '25/26' }
]

const defaultAcademicYear = import.meta.env.VITE_CURSO || ''

const filtersConfig = [
  {
    key: 'academicYear',
    label: 'Año académico',
    options: academicYearOptions,
    optionValue: 'value',
    optionLabel: 'label'
  }
]

const toSaoAcademicYear = (academicYear) => {
  if (!academicYear) return ''
  const [start, end] = academicYear.split('/')
  if (!start || !end) return ''
  return `20${start}-20${end}`
}

const ListFcts = () => {
  const [fcts, setFcts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ◄ MODIFICACIÓN AQUÍ: Intentar recuperar el filtro del selector guardado, si no, usar el por defecto de las variables de entorno
  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem('rt_state_listado_de_f.e.');
    return saved ? (JSON.parse(saved).externalFilters || { academicYear: defaultAcademicYear }) : { academicYear: defaultAcademicYear };
  });

  const navigate = useNavigate();

  // filtrar datos segun el filtro
  const filteredData = useMemo(() => {
    let result = fcts

    if (filters.academicYear) {
      const saoAcademicYear = toSaoAcademicYear(filters.academicYear)
      result = result.filter((row) =>
        row.SAO_period?.includes(saoAcademicYear)
      )
    }

    return result
  }, [fcts, filters])
  

  const columnas = useMemo(
    () => [
      { key: 'SAO_student_id', encabezado: 'NIA', primary: true },
      { key: 'SAO_student_fullname', encabezado: 'Alumno', primary: true },
      { key: 'SAO_company_name', encabezado: 'Empresa' },
      { key: 'SAO_company_city', encabezado: 'Localidad' },
      { key: 'SAO_company_center_name', encabezado: 'Centro de Trabajo' },
      { key: 'SAO_instructor_name', encabezado: 'Instructor Empresa' },
      { key: 'SAO_teacher_fullname', encabezado: 'Tutor Curso' },
      { key: 'FCTM_ies_instructor', encabezado: 'Tutor IES' },
      { key: 'SAO_dates', encabezado: 'Fechas' },
      { key: 'SAO_hours', encabezado: 'Horas' },
      { key: 'SAO_period', encabezado: 'Curso / Periodo' },
      {
            key: "__show",
            encabezado: "Acciones",
            render: (row) => (
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/fcts/${row._id}`)}
                    title="Ver ficha"
                >
                    <i className="bi bi-search"></i>
                </button>
            )
        }
    ],
    [navigate] // ◄ Añadido navigate como buena práctica en las dependencias
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await sendRequest('GET', null, '/fct')
      if (res.success) {
        setFcts(res.data)
      } else {
        setError(res.message || 'Error al cargar FCTs')
      }
    } catch (err) {
      setError(err.message || 'Error al cargar FCTs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <>            
            {loading && 
                 <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              }
            {!loading && error && <p className="text-danger">{error}</p>}
            {!loading && !error && fcts.length === 0 && (
                <p className="text-muted">No hay F.E. disponibles</p>
            )}
            {!loading && !error && fcts.length > 0 && (                
                <ListCRUD
                  title="Listado de F.E."
                  datos={filteredData}
                  columnas={columnas}
                  tableId="fcts"                          
                  filters={filters}
                  onFilterChange={setFilters}
                  filtersConfig={filtersConfig}
                >                          
                </ListCRUD>
            )}
        </>
  )
}

export default ListFcts
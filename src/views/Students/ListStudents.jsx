import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { sendRequest, stringToColor, confirmation, showAlert, selectorDark } from '../../utils/functions'
import { useNavigate } from 'react-router-dom'
import ListCRUD from '../../components/List/ListCRUD'
import Select from 'react-select'
import useSkillStore from "../../store/skillStore";
import { useTranslation } from 'react-i18next'


const ListStudents = () => {

  const { t } = useTranslation()

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Estados para multiselección y actualización masiva
  const [selectedIds, setSelectedIds] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const skillOptionsStore = useSkillStore(state => state.skills);
  const cargarSkills = useSkillStore(state => state.cargarSkills);

  // Transforma las skills del store al formato { value, label }
  const formattedSkills = useMemo(() => {
    return skillOptionsStore.map(skill => ({
      value: skill._id,
      label: skill.FCTM_skill_name
    }));
  }, [skillOptionsStore]);

    // Fetch de alumnos
  const fetchData = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
          const res = await sendRequest('GET', null, '/students');
          if (res.success) setStudents(res.data);
          else setError(res.message || 'Error al cargar alumnos');
      } catch (err) {
          setError(err.message || 'Error al cargar alumnos');
      } finally {
          setLoading(false);
      }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch de skills para el multiselector
  useEffect(() => {
    /*const fetchSkills = async () => {
      try {
        const res = await sendRequest('GET', null, '/skills');
        if (res.success) {
          const options = res.data.map(skill => ({
            value: skill._id,
            label: skill.FCTM_skill_name
          }));
          setSkillOptions(options);
        }
      } catch (error) {
        console.error("Error al obtener aptitudes", error);
      }
    };
    fetchSkills();*/
    cargarSkills()
  }, [cargarSkills]);

  // Función para acción masiva
  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return showAlert(t("No hay alumnos seleccionados"), "warning");
    if (selectedSkills.length === 0) return showAlert(t("Debes seleccionar al menos una aptitud"), "warning");

    const confirmado = await confirmation(t('¿Añadir {{skills}} aptitudes a {{num}} alumnos?', { skills: selectedSkills.length, num: selectedIds.length }));
    if (!confirmado) return;

    const skillsIds = selectedSkills.map(skill => skill.value);

    const payload = {
      ids: selectedIds,
      skills: skillsIds
    };

    const res = await sendRequest("PATCH", payload, "/students/bulk-update");

    if (res.success) {
      showAlert(t("Aptitudes actualizadas correctamente"), "success");
      //cargarSkills(); // Recargar aptitudes para actualizar el store
      setSelectedIds([]);
      setSelectedSkills([]);
      fetchData();
    } else {
      showAlert(res.message, "error");
    }
  };

  const colStudents = [
    { key: "SAO_username", encabezado: "NIA", primary: true },
    { key: "SAO_name", encabezado: "Nombre", primary: true },
    { key: "SAO_student_city", encabezado: "Localidad" },
    { key: "SAO_email", encabezado: "E-mail" },
    { key: "SAO_phone", encabezado: "Teléfono" },
    { key: "SAO_student_socialNumber", encabezado: "NUSS" },
        {
          key: "FCTM_skills",
          encabezado: "Aptitudes",
          accessorFn: row => row.FCTM_skills?.map(skill => skill.FCTM_skill_name).join(" ") || "",
          render: row => (
            <div className="d-flex flex-wrap gap-1">
              {row.FCTM_skills?.length > 0 ? (
                row.FCTM_skills.map((skill) => {
                  const bgColor = stringToColor(skill.FCTM_skill_name);
                  return (
                    <span
                      key={skill._id}
                      className="badge rounded-pill text-dark"
                      style={{ backgroundColor: bgColor, border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.75rem' }}
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
      key:"Actions", encabezado:"Acciones",
      render: (row) => (
        <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => verFicha(row._id)}
        title={t('Ver ficha')}
      >
        <i className="bi bi-search"></i>
      </button>
        
      )
    }
  ]
//  VER ESTUDIANTE POR ID 
  function verFicha(id) {
    navigate(`/students/${id}`)
  }

  return (
    <>            
            {loading && 
                 <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              }
            {!loading && error && <p className="text-danger">{error}</p>}
            {!loading && !error && students.length === 0 && (
                <p className="text-muted">{t('No hay alumnos disponibles')}</p>
            )}
            {!loading && !error && students.length > 0 && (                
                <ListCRUD
                  title="Listado de Alumnos"
                  datos={students}
                  columnas={colStudents}
                  tableId="alumnos"
                  mostrarCheckBox
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                >                          
                  <div className="d-flex flex-wrap gap-2 mb-3 align-items-end">
                    {selectedIds.length > 0 && (
                      <>
                        <div style={{ minWidth: '300px' }}>
                          <label className="form-label fw-bold small mb-1">{t('Aptitudes')}</label>
                          <Select
                            isMulti
                            options={formattedSkills}
                            value={selectedSkills}
                            onChange={setSelectedSkills}
                            placeholder={t('Selecciona aptitudes...')}
                            noOptionsMessage={() => t('No hay más aptitudes')}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            styles={selectorDark}
                          />
                        </div>
                        <button className="btn btn-warning" onClick={handleBulkUpdate}>
                          <i className="bi bi-pencil-square me-1"></i>
                          {t('Actualizar')} ({selectedIds.length})
                        </button>
                      </>
                    )}
                  </div>
                </ListCRUD>
            )}
        </>
  )
}

export default ListStudents

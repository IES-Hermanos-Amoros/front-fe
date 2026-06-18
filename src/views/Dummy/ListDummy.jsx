import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sendRequest, confirmation, showAlert, stringToColor } from '../../utils/functions';
import { useNavigate } from 'react-router-dom';
import ListCRUD from "../../components/List/ListCRUD";

const categoryOptions = [
  { _id: "69a82074499df1aec1d2477e", FCTM_category_name: "AGRO-JARDINERIA Y COMPOSICIONES FLORALES" },
  { _id: "69a82074499df1aec1d2477f", FCTM_category_name: "DESARROLLO DE APLICACIONES WEB" },
  { _id: "69a82074499df1aec1d24780", FCTM_category_name: "EDUCACIÓN INFANTIL" },
  { _id: "69a82074499df1aec1d24781", FCTM_category_name: "GESTIÓN FORESTAL Y DEL MEDIO NATURAL" },
  { _id: "69a82074499df1aec1d24782", FCTM_category_name: "INTEGRACIÓN SOCIAL" },
  { _id: "69a82074499df1aec1d24783", FCTM_category_name: "PRODUCCIÓN AGROECOLÓGICA" },
  { _id: "69a82074499df1aec1d24784", FCTM_category_name: "SISTEMAS MICROINFORMÁTICOS Y REDES" }
];

const skillOptions = [
  { _id: "69bd6bb2e1aa8f195c71c305", FCTM_skill_name: "ADAPTABILIDAD" },
  { _id: "69bd6bb2e1aa8f195c71c31d", FCTM_skill_name: "ADMINISTRACIÓN DE SISTEMAS" },
  { _id: "69bd6bb2e1aa8f195c71c339", FCTM_skill_name: "ADOBE ILLUSTRATOR" },
  { _id: "69bd6bb2e1aa8f195c71c338", FCTM_skill_name: "ADOBE PHOTOSHOP" },
  { _id: "69bd6bb2e1aa8f195c71c341", FCTM_skill_name: "AGRICULTURA ECOLÓGICA" },
  { _id: "69bd6bb2e1aa8f195c71c320", FCTM_skill_name: "ANGULAR" },
  { _id: "69bd6bb2e1aa8f195c71c32b", FCTM_skill_name: "ANÁLISIS DE DATOS" },
  { _id: "69bd6bb2e1aa8f195c71c32e", FCTM_skill_name: "ATENCIÓN AL CLIENTE" },
  { _id: "69bd6bb2e1aa8f195c71c322", FCTM_skill_name: "AWS" },
  { _id: "69bd6bb2e1aa8f195c71c323", FCTM_skill_name: "AZURE" },
  { _id: "69bd6bb2e1aa8f195c71c344", FCTM_skill_name: "BOTÁNICA" },
  { _id: "69bd6bb2e1aa8f195c71c325", FCTM_skill_name: "C#" },
  { _id: "69bd6bb2e1aa8f195c71c326", FCTM_skill_name: "C++" },
  { _id: "69bd6bb2e1aa8f195c71c316", FCTM_skill_name: "CIBERSEGURIDAD" },
  { _id: "69bd6bb2e1aa8f195c71c315", FCTM_skill_name: "CLOUD COMPUTING" },
  { _id: "69bd6bb2e1aa8f195c71c301", FCTM_skill_name: "COMUNICACIÓN EFECTIVA" },
  { _id: "69bd6bb2e1aa8f195c71c332", FCTM_skill_name: "CONTENT MARKETING" },
  { _id: "69bd6bb2e1aa8f195c71c345", FCTM_skill_name: "CONTROL DE PLAGAS" },
  { _id: "69bd6bb2e1aa8f195c71c308", FCTM_skill_name: "CREATIVIDAD" },
  { _id: "69bd6bb2e1aa8f195c71c310", FCTM_skill_name: "CSS3" },
  { _id: "69bd6bb2e1aa8f195c71c329", FCTM_skill_name: "DESARROLLO DE NEGOCIO" },
  { _id: "69bd6bb2e1aa8f195c71c30b", FCTM_skill_name: "DESARROLLO WEB" },
  { _id: "69bd6bb2e1aa8f195c71c335", FCTM_skill_name: "DISEÑO GRÁFICO" },
  { _id: "69bd6bb2e1aa8f195c71c33b", FCTM_skill_name: "DOCENCIA" },
  { _id: "69bd6bb2e1aa8f195c71c318", FCTM_skill_name: "DOCKER" },
  { _id: "69bd6bb2e1aa8f195c71c334", FCTM_skill_name: "E-COMMERCE" },
  { _id: "69bd6bb2e1aa8f195c71c33c", FCTM_skill_name: "E-LEARNING" },
  { _id: "69bd6bb2e1aa8f195c71c33a", FCTM_skill_name: "EDICIÓN DE VÍDEO" },
  { _id: "69bd6bb2e1aa8f195c71c30a", FCTM_skill_name: "EMPATÍA" },
  { _id: "69bd6bb2e1aa8f195c71c328", FCTM_skill_name: "ESTRATEGIA DE NEGOCIO" },
  { _id: "69bd6bb2e1aa8f195c71c337", FCTM_skill_name: "FIGMA" },
  { _id: "69bd6bb2e1aa8f195c71c343", FCTM_skill_name: "GESTIÓN AMBIENTAL" },
  { _id: "69bd6bb2e1aa8f195c71c327", FCTM_skill_name: "GESTIÓN DE PROYECTOS" },
  { _id: "69bd6bb2e1aa8f195c71c303", FCTM_skill_name: "GESTIÓN DEL TIEMPO" },
  { _id: "69bd6bb2e1aa8f195c71c347", FCTM_skill_name: "GESTIÓN FORESTAL" },
  { _id: "69bd6bb2e1aa8f195c71c317", FCTM_skill_name: "GIT" },
  { _id: "69bd6bb2e1aa8f195c71c333", FCTM_skill_name: "GOOGLE ANALYTICS" },
  { _id: "69bd6bb2e1aa8f195c71c309", FCTM_skill_name: "HABLAR EN PÚBLICO" },
  { _id: "69bd6bb2e1aa8f195c71c30f", FCTM_skill_name: "HTML5" },
  { _id: "69bd6bb2e1aa8f195c71c33e", FCTM_skill_name: "INTEGRACIÓN SOCIAL" },
  { _id: "69bd6bb2e1aa8f195c71c31a", FCTM_skill_name: "INTELIGENCIA ARTIFICIAL" },
  { _id: "69bd6bb2e1aa8f195c71c307", FCTM_skill_name: "INTELIGENCIA EMOCIONAL" },
  { _id: "69bd6bb2e1aa8f195c71c33d", FCTM_skill_name: "INTERVENCIÓN SOCIAL" },
  { _id: "69bd6bb2e1aa8f195c71c348", FCTM_skill_name: "JARDINERÍA" },
  { _id: "69bd6bb2e1aa8f195c71c30e", FCTM_skill_name: "JAVA" },
  { _id: "69bd6bb2e1aa8f195c71c30c", FCTM_skill_name: "JAVASCRIPT" },
  { _id: "69bd6bb2e1aa8f195c71c319", FCTM_skill_name: "KUBERNETES" },
  { _id: "69bd6bb2e1aa8f195c71c2ff", FCTM_skill_name: "LIDERAZGO" },
  { _id: "69bd6bb2e1aa8f195c71c31b", FCTM_skill_name: "MACHINE LEARNING" },
  { _id: "69bd6bb2e1aa8f195c71c32f", FCTM_skill_name: "MARKETING DIGITAL" },
  { _id: "69bd6bb2e1aa8f195c71c306", FCTM_skill_name: "NEGOCIACIÓN" },
  { _id: "69bd6bb2e1aa8f195c71c312", FCTM_skill_name: "NODE.JS" },
  { _id: "69bd6bb2e1aa8f195c71c314", FCTM_skill_name: "NOSQL" },
  { _id: "69bd6bb2e1aa8f195c71c340", FCTM_skill_name: "ORIENTACIÓN LABORAL" },
  { _id: "69bd6bb2e1aa8f195c71c342", FCTM_skill_name: "PAISAJISMO" },
  { _id: "69bd6bb2e1aa8f195c71c304", FCTM_skill_name: "PENSAMIENTO CRÍTICO" },
  { _id: "69bd6bb2e1aa8f195c71c324", FCTM_skill_name: "PHP" },
  { _id: "69bd6bb2e1aa8f195c71c32a", FCTM_skill_name: "PLANIFICACIÓN ESTRATÉGICA" },
  { _id: "69bd6bb2e1aa8f195c71c33f", FCTM_skill_name: "PSICOLOGÍA" },
  { _id: "69bd6bb2e1aa8f195c71c30d", FCTM_skill_name: "PYTHON" },
  { _id: "69bd6bb2e1aa8f195c71c311", FCTM_skill_name: "REACT" },
  { _id: "69bd6bb2e1aa8f195c71c32c", FCTM_skill_name: "RECURSOS HUMANOS" },
  { _id: "69bd6bb2e1aa8f195c71c31e", FCTM_skill_name: "REDES DE COMPUTADORES" },
  { _id: "69bd6bb2e1aa8f195c71c302", FCTM_skill_name: "RESOLUCIÓN DE PROBLEMAS" },
  { _id: "69bd6bb2e1aa8f195c71c331", FCTM_skill_name: "SEM" },
  { _id: "69bd6bb2e1aa8f195c71c330", FCTM_skill_name: "SEO" },
  { _id: "69bd6bb2e1aa8f195c71c31c", FCTM_skill_name: "SOPORTE TÉCNICO" },
  { _id: "69bd6bb2e1aa8f195c71c346", FCTM_skill_name: "SOSTENIBILIDAD" },
  { _id: "69bd6bb2e1aa8f195c71c313", FCTM_skill_name: "SQL" },
  { _id: "69bd6bb2e1aa8f195c71c300", FCTM_skill_name: "TRABAJO EN EQUIPO" },
  { _id: "69bd6bb2e1aa8f195c71c31f", FCTM_skill_name: "TYPESCRIPT" },
  { _id: "69bd6bb2e1aa8f195c71c336", FCTM_skill_name: "UI/UX" },
  { _id: "69bd6bb2e1aa8f195c71c32d", FCTM_skill_name: "VENTAS" },
  { _id: "69bd6bb2e1aa8f195c71c321", FCTM_skill_name: "VUE.JS" }
];

const filtersConfig = [
  {
    key: "category",
    label: "Familias profesionales",
    options: categoryOptions,
    optionValue: "_id",
    optionLabel: "FCTM_category_name"
  },
  {
    key: "skill",
    label: "Skills",
    options: skillOptions,
    optionValue: "_id",
    optionLabel: "FCTM_skill_name"
  }
];

const ListDummy = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});

  // NUEVO: Estado para controlar los IDs seleccionados desde el padre
  const [selectedIds, setSelectedIds] = useState([]);

  // NUEVO: Filtrado de datos basadp en los filtros seleccionados
  const [globalFilter, setGlobalFilter] = useState('');

  const filteredData = useMemo(() => {
    let result = data;

    // CATEGORY
    if (filters.category) {
      result = result.filter(row =>
        row.FCTM_category?.some(cat =>
          (cat._id || cat) === filters.category
        )
      );
    }

    // SKILL
    if (filters.skill) {
      result = result.filter(row =>
        row.FCTM_skills?.some(skill =>
          (skill._id || skill) === filters.skill
        )
      );
    }

    // Filtrado por buscador
    if (globalFilter) {
      const target = globalFilter.toLowerCase()
      result = result.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(target)
        )
      )
    }

    return result;
  }, [data, filters, globalFilter]);

  // NUEVO: Función para acción masiva (ejemplo: cambiar tipo a "OTRO")
  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return showAlert("No hay registros seleccionados", "warning");
    
    const confirmado = await confirmation(`¿Cambiar tipo a 'OTRO' para ${selectedIds.length} registros?`);
    if (!confirmado) return;

    // Aquí llamarías a tu API: sendRequest("PATCH", { ids: selectedIds, type: "OTRO" }, "/dummy/bulk-update")
    // Preparamos el payload con los IDs y el nuevo valor
      const payload = {
        ids: selectedIds, // El array de strings que ya tienes
        updates: { FCTM_dummy_type: "OTRO" } // El campo que quieres cambiar
      };

      // Endpoint dedicado: /dummy/bulk-update
      const res = await sendRequest("PATCH", payload, "/dummy/bulk-update");

        if (res.success) {
        showAlert("Registros actualizados correctamente", "success");
        setSelectedIds([]); // Limpiamos la selección
        fetchData();        // Recargamos la tabla para ver los cambios
      } else {
        showAlert(res.message, "error");
      }
  };


  // =======================
  // COLUMNAS MEMORIZADAS
  // =======================
  const columnas = useMemo(() => [
    //{ key: "_id", encabezado: "#" },
    { key: "SAO_id", encabezado: "SAO ID" },
    { key: "SAO_username", encabezado: "SAO Username" },
    { key: "SAO_email", encabezado: "SAO Email" },
    { key: "FCTM_dummy_observations", encabezado: "Observaciones" },
    { key: "FCTM_dummy_other_contact", encabezado: "Otro Contacto" },
    { key: "FCTM_dummy_description", encabezado: "Descripción" },
    {
      key: "FCTM_dummy_type",
      encabezado: "Tipo de Dato",
      filterType: "select",
      filterOptions: ["A", "B", "C"],
    },
    {
      key: "FCTM_category",
      encabezado: "Familias Profesionales",
      accessorFn: row => row.FCTM_category?.map(cat => cat.FCTM_category_name).join(" ") || "",
      render: row => (
        <div className="d-flex flex-wrap gap-1">
          {row.FCTM_category?.length > 0 ? (
            row.FCTM_category.map((cat) => {
              const bgColor = stringToColor(cat.FCTM_category_name);
              return (
                <span
                  key={cat._id}
                  className="badge rounded-pill text-dark"
                  style={{ backgroundColor: bgColor, border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.75rem' }}
                >
                  {cat.FCTM_category_name}
                </span>
              )
            })
          ) : (
            <span className="text-muted small">Sin categorías</span>
          )}
        </div>
      )
    },
    {
      key: "__show",
      encabezado: "Ver",
      render: row => (
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => navigate(`/dummy/${row._id}`)}
          title="Ver ficha"
        >
          <i className="bi bi-search"></i>
        </button>
      )
    },
    {
      key: "__delete",
      encabezado: "Eliminar",
      render: row => (
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDelete(row._id)}
          title="Eliminar dato"
        >
          <i className="bi bi-trash"></i>
        </button>
      )
    }
  ], [navigate]);

  // =======================
  // ELIMINAR DATO
  // =======================
  const handleDelete = async id => {
    const confirmado = await confirmation("¿Seguro que quieres eliminar este dato?");
    if (!confirmado) return;
    const res = await sendRequest("DELETE", undefined, `/dummy/${id}`);
    if (res.success) fetchData();
    else showAlert(res.message,"error");
  };

  // =======================
  // FETCH DATA
  // =======================
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendRequest("GET", null, "/dummy");
      if (res.success) setData(res.data);
      else setError(res.message || "Error al cargar datos");
    } catch (err) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    console.log("IDs seleccionados: ", selectedIds);
  }, [selectedIds]);

  // =======================
  // RENDER
  // =======================
  return (
    <>
      {loading && <p>Cargando datos...</p>}
      {!loading && error && <p className="text-danger">{error}</p>}
      {!loading && !error && data.length === 0 && <p className="text-muted">No hay datos disponibles</p>}
      {!loading && !error && data.length > 0 && (
        <ListCRUD
          title="Datos Dummy CRUD"
          datos={filteredData}
          columnas={columnas}
          tableId="dummy"
          mostrarCheckBox
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          filters={filters}
          onFilterChange={setFilters}
          filtersConfig={filtersConfig}   // 👈 CLAVE
          // Pasamos el estado del filtro a listcrud
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        >
          {/* ENVOLVEMOS LOS BOTONES EN UN DIV CON GAP */}
          <div className="d-flex gap-2"> 
            <button
              className="btn btn-success"
              onClick={() => navigate('/dummy/new')}
            >
              <i className="bi bi-plus-lg me-1"></i> Añadir Dato
            </button>

            {/* BOTÓN DE ACCIÓN MASIVA: Solo se muestra o habilita si hay selección */}
            {selectedIds.length > 0 && (
              <button className="btn btn-warning" onClick={handleBulkUpdate}>
                <i className="bi bi-pencil-square me-1"></i> Cambiar Tipo ({selectedIds.length})
              </button>
            )}
          </div>
        </ListCRUD>
      )}
    </>
  );
};

export default ListDummy;
import React, { useRef, useEffect, useState } from 'react';
import $, { event } from "jquery";
import 'datatables.net';
import 'datatables.net-responsive';
import language from 'datatables.net-plugins/i18n/es-ES.mjs';
import './GenericTable.css'; // tu CSS personalizado

const GenericTable = ({
  tableTitle = '',
  datos = [],
  columnas = [],
  onShow = null,
  onDelete = null,
  mostrarCheckbox = false // 👈 nuevo parámetro opcional (por defecto false)
}) => {

  console.log(datos)

  const tableRef = useRef();
  const [selectedIds, setSelectedIds] = useState([]); // 👈 ESTADO INTERNO Y PERSISTENTE

  // Inicialización de DataTables
  const initDataTable = () => {
    const $el = $(tableRef.current);

    if ($.fn.DataTable.isDataTable($el)) {
      $el.DataTable().clear().destroy();
    }

    const mobileLanguage = {
        ...language, // mantiene todas las traducciones existentes
        paginate: {
            first: '<i class="fas fa-angle-double-left"></i>',
            previous: '<i class="fas fa-angle-left"></i>',
            next: '<i class="fas fa-angle-right"></i>',
            last: '<i class="fas fa-angle-double-right"></i>'
        }
    };

    $el.DataTable({
      responsive: true,       // Row Collapse para móviles
      stateSave: false,
      language:mobileLanguage,
      autoWidth: false,       // Respetar anchos CSS
      columnDefs: [
        { targets: '_all', className: 'dt-head-center dt-body-center' }
      ]
    });

    // Limpieza al desmontar
    return () => {
      if ($.fn.DataTable.isDataTable($el)) {
        $el.DataTable().clear().destroy();
      }
    };
  };


  // 1️⃣ Engancha eventos DELEGADOS a los checkbox (sobreviven a destroy/init)
  const attachCheckboxEvents = () => {
    const $table = $(tableRef.current);

    $table.off("change", ".generic-checkbox");
    $table.on("change", ".generic-checkbox", function () {
      const id = $(this).attr("data-id");
      const isChecked = this.checked;

      setSelectedIds(prev =>
        isChecked ? [...prev, id] : prev.filter(x => x !== id)
      );
    });
  };

  // 2️⃣ Reaplica los checks según selectedIds internamente
  const reapplyChecks = () => {
    const $table = $(tableRef.current);
    $table.find(".generic-checkbox").each(function () {
      const id = $(this).attr("data-id");
      if (selectedIds.includes(id)) {
        $(this).prop("checked", true);
      }
    });
  };

  useEffect(() => {
    initDataTable();
    //Nuevo para gestión de checkbox
    if(mostrarCheckbox){
      attachCheckboxEvents();
      reapplyChecks();
    }
    //-------------------------------
  }, [datos]);

  // Cada vez que los datos cambien se reaplican los checks sin perder
  useEffect(() => {
    if(mostrarCheckbox){
      reapplyChecks();
    }
  }, [datos, selectedIds]);

  //OPCIONAL
  // Exponer a consola para debug si quieres ver seleccionados
  useEffect(()=>{
        if(mostrarCheckbox){
          if(selectedIds.length) console.log("🔐 Seleccionados:", selectedIds)
          }
  }, [selectedIds])

  return (
    <div className="card recent-sales overflow-auto">
      <div className="card-body">
        <h5 className="card-title">{tableTitle}</h5>
        <table
          ref={tableRef}
          className="table table-borderless table-hover align-middle text-center datatable dtr-inline"
        >
          <thead className="table-light">
            <tr>
              {/* 👇 Checkbox como PRIMERA columna si está activado */}
              {mostrarCheckbox && <th><input className='generic-checkbox' type="checkbox" disabled /></th>}

              {columnas.map((col) => (
                <th key={col.key}>{col.encabezado}</th>
              ))}
              {/* Mostrar cabecera solo si las funciones existen */}
              {onShow && <th>Info</th>}
              {onDelete && <th>Borrar</th>}
            </tr>
          </thead>
          <tbody>
            {datos.map((elem) => (
              <tr key={elem._id}>
                {/* 👇 Checkbox como PRIMERA columna si está activado */}
                {mostrarCheckbox && <th><input className='generic-checkbox' type="checkbox" data-id={elem._id} /></th>}

                {columnas.map((col) => (
                  <td key={col.key}>{elem[col.key]}</td>
                ))}

                {/* Mostrar botones SOLO si las funciones existen */}
                {onShow && (
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => onShow(elem._id)}
                    >
                      <i className="fa-sharp fa-solid fa-magnifying-glass fa-rotate-90 fa-1xs"></i>
                    </button>
                  </td>
                )}

                {onDelete && (
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(elem._id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenericTable;
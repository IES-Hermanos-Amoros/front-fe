import React, { useMemo } from "react";
import ReactTableTanstack from "./ReactTableTanstack";
import ReactTableToolBar from "./ReactTableToolBar";

const ListCRUD = ({
  title = "",
  datos = [],
  columnas = [],
  tableProps = {},
  mobileMode = "card",
  mostrarCheckBox = false,
  selectedIds = [],
  onSelectionChange,
  filters = {},
  onFilterChange,
  filtersConfig = [],
  children,
  globalFilter,
  setGlobalFilter,
}) => {

  const datosFiltrados = useMemo(() => {
    if (!globalFilter) return datos;

    const target = globalFilter.toLowerCase();
    return datos.filter(fila => {
      return Object.values(fila).some(val => 
        String(val).toLowerCase().includes(target)
      );
    });
  }, [datos, globalFilter]);
  
  return (
    // 1. Contenedor plano sin rejillas intermedias de Bootstrap para clonar el ancho exacto de ShowEditableForm
    <div className="w-100 mb-4" style={{ display: 'block' }}>
      
      {/* 2. El Toolbar actúa como la cabeza del bloque */}
      <ReactTableToolBar 
        data={datosFiltrados} 
        columns={columnas}
        title={title} 
        filters={filters}
        onFilterChange={onFilterChange}
        filtersConfig={filtersConfig}
      >
        {children}
      </ReactTableToolBar>

      {/* 3. La tabla Tanstack se acopla inmediatamente debajo */}
      <ReactTableTanstack
        tableTitle={title}
        datos={datos}
        columnas={columnas}
        mobileMode={mobileMode}
        mostrarCheckBox={mostrarCheckBox}
        selectedIds={selectedIds} 
        onSelectionChange={onSelectionChange} 
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        externalFilters={filters} // ◄ Enviamos los filtros a TanStack para que se guarden en sessionStorage
        onExternalFiltersChange={onFilterChange}
        {...tableProps}
      />
    </div>
  );
};

export default ListCRUD;
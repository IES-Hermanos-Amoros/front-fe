import React, { useState } from "react";
import ReactTableTanstack from "./ReactTableTanstack";
import DataGridToolbar from "../DataGridToolbar";

const ListCRUD = ({
  title = "",
  datos = [],
  columnas = [],
  mobileMode = "card",
  mostrarCheckBox = false,
  tableId = "default",
  children,
}) => {

  const [selectedIds, setSelectedIds] = useState([]);
  const [tableFilters, setTableFilters] = useState({});

  return (
    <section className="dashboard section">
      <div className="row mb-2">
        <div className="col-12">{children}</div>
      </div>

      <DataGridToolbar
        tableTitle={title}
        data={datos}
        columns={columnas}
        selectedIds={selectedIds}
        onFilterChange={setTableFilters}
        onDeleteSelected={ids => console.log("Eliminar seleccionados:", ids)}
        onNew={() => console.log("Nuevo")}
        onResetFilters={() => setTableFilters({})}
      />

      <ReactTableTanstack
        tableId={tableId}
        tableTitle=""
        datos={datos}
        columnas={columnas}
        mobileMode={mobileMode}
        mostrarCheckBox={mostrarCheckBox}
        onSelectionChange={setSelectedIds}
        filters={tableFilters} // filtros desde toolbar
      />
    </section>
  );
};

export default ListCRUD;
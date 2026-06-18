import React from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./DataGridToolbar.css";

const DataGridToolbar = ({
  tableTitle = "",
  data = [],
  columns = [],
  selectedIds = [],
  onFilterChange = null,
  onDeleteSelected = null,
  onNew = null,
  onResetFilters = null,
}) => {

  const exportExcel = () => {
    const rows = data.map(row => {
      const obj = {};
      columns.forEach(col => { if(col.key) obj[col.encabezado] = row[col.key]; });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tableTitle || "Tabla");
    XLSX.writeFile(wb, `${tableTitle}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const headers = columns.filter(c => c.key).map(c => c.encabezado);
    const rows = data.map(row => columns.filter(c => c.key).map(c => row[c.key]));
    autoTable(doc, { head: [headers], body: rows });
    doc.save(`${tableTitle}.pdf`);
  };

  return (
    <div className="dg-toolbar">
      <div className="dg-toolbar-left"><h2>{tableTitle}</h2></div>
      <div className="dg-toolbar-right">
        {onNew && <button className="btn" onClick={onNew}>Nuevo</button>}
        {onDeleteSelected && (
          <button className="btn danger" disabled={selectedIds.length===0} onClick={() => onDeleteSelected(selectedIds)}>Eliminar</button>
        )}
        {onResetFilters && <button className="btn" onClick={onResetFilters}>Reset</button>}
        <select onChange={e => onFilterChange && onFilterChange({ tipoDato: e.target.value })}>
          <option value="">Todos</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
        <button className="btn" onClick={exportExcel}>Excel</button>
        <button className="btn" onClick={exportPDF}>PDF</button>
      </div>
    </div>
  )
};

export default DataGridToolbar;
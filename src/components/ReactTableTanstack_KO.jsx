import { useState, useEffect, Fragment } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import useTableStore from "../store/tableStore";
import './ReactTableTanstack.css';

const ReactTableTanstack = ({
  tableId = 'default',
  tableTitle = '',
  datos = [],
  columnas = [],
  mobileMode = 'card',
  mostrarCheckBox = false,
  onSelectionChange = null,
  filters = {}, // filtros desde Toolbar
}) => {

  const tableState = useTableStore(state => state.tables[tableId] || {});
  const setTableState = useTableStore(state => state.setTableState);

  const [globalFilter, setGlobalFilter] = useState(tableState.globalFilter || '');
  const [pagination, setPagination] = useState(tableState.pagination || { pageIndex:0, pageSize:5 });
  const [sorting, setSorting] = useState(tableState.sorting || []);
  const [columnFilters, setColumnFilters] = useState(tableState.columnFilters || []);
  const [expandedRows, setExpandedRows] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set(tableState.selectedIds || []));

  useEffect(() => {
    setTableState(tableId, { globalFilter, pagination, sorting, columnFilters, selectedIds:[...selectedIds] });
  }, [globalFilter, pagination, sorting, columnFilters, selectedIds]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // =============== ROW EXPAND
  const toggleRow = id => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  // =============== SELECTION
  const toggleSelection = id => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if(newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      if(onSelectionChange) onSelectionChange([...newSet]);
      return newSet;
    });
  };

  // =============== COLUMNAS
  const cols = [
    ...(mostrarCheckBox ? [{ id:'_checkbox', header:'', cell:()=>null }] : []),
    ...columnas.map(col => ({
      accessorFn: col.accessorFn ? col.accessorFn : undefined,
      accessorKey: !col.accessorFn && !col.render ? col.key : undefined,
      id: col.id || col.key,
      header: col.encabezado,
      cell: info => col.render ? col.render(info.row.original) : info.getValue(),
    })),
  ];

  const table = useReactTable({
    data: datos.filter(row => !filters.tipoDato || row.FCTM_dummy_type === filters.tipoDato),
    columns: cols,
    state: { globalFilter, pagination, sorting, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // =============== RENDER
  if(isMobile && mobileMode==='card'){
    return (
      <div className="rt-card">
        <div className="rt-card-body">
          <h1>{tableTitle}</h1>
          <input className="searchInput" placeholder="Buscar..." value={globalFilter} onChange={e=>setGlobalFilter(e.target.value)} />
          <div className="cardsContainer">
            {table.getRowModel().rows.map(row => {
              const expanded = expandedRows[row.id] || false;
              const selected = selectedIds.has(row.original._id);
              let longPressTimer = null;
              const handleMouseDown = () => { longPressTimer=setTimeout(()=>toggleSelection(row.original._id),500); }
              const handleMouseUp = () => clearTimeout(longPressTimer);
              return (
                <div key={row.id} className={`card ${selected?'card-selected':''}`}
                     onClick={()=>toggleRow(row.id)}
                     onMouseDown={mostrarCheckBox?handleMouseDown:undefined}
                     onMouseUp={mostrarCheckBox?handleMouseUp:undefined}
                     onTouchStart={mostrarCheckBox?handleMouseDown:undefined}
                     onTouchEnd={mostrarCheckBox?handleMouseUp:undefined}>
                  {row.getVisibleCells().map(cell=>(
                    <div key={cell.id}>
                      <strong>{flexRender(cell.column.columnDef.header, cell.getContext())}:</strong>{' '}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
          <div className="pagination">
            <button onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}>◀</button>
            <span>Página {table.getState().pagination.pageIndex+1} de {table.getPageCount()}</span>
            <button onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}>▶</button>
            <select value={table.getState().pagination.pageSize} onChange={e=>table.setPageSize(Number(e.target.value))}>
              {[5,10,20,50].map(s=><option key={s} value={s}>Mostrar {s}</option>)}
            </select>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rt-card">
      <div className="rt-card-body">
        <h1>{tableTitle}</h1>
        <input className="searchInput" placeholder="Buscar..." value={globalFilter} onChange={e=>setGlobalFilter(e.target.value)} />
        <table className="table">
          <thead>
            {table.getHeaderGroups().map(hg=>(
              <tr key={hg.id}>
                {mostrarCheckBox && <th></th>}
                {hg.headers.map(h=>(
                  <th key={h.id} onClick={h.column.getToggleSortingHandler()} style={{cursor:'pointer'}}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{
                      asc:' 🔼',
                      desc:' 🔽',
                    }[h.column.getIsSorted()]??null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row=>{
              const selected = selectedIds.has(row.original._id);
              return (
                <Fragment key={row.id}>
                  <tr className={selected?'row-selected':''}>
                    {mostrarCheckBox && <td><input type="checkbox" checked={selected} onChange={()=>toggleSelection(row.original._id)} /></td>}
                    {row.getVisibleCells().map(cell=><td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}>◀</button>
          <span>Página {table.getState().pagination.pageIndex+1} de {table.getPageCount()}</span>
          <button onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}>▶</button>
          <select value={table.getState().pagination.pageSize} onChange={e=>table.setPageSize(Number(e.target.value))}>
            {[5,10,20,50].map(s=><option key={s} value={s}>Mostrar {s}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

export default ReactTableTanstack;
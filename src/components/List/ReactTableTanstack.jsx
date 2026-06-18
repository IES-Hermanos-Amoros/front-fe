import { useState, useEffect, Fragment } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import './ReactTableTanstack.css'

const ReactTableTanstack = ({
  tableTitle = '',
  datos = [],
  columnas = [],
  mobileMode = 'card', 
  mostrarCheckBox = false,
  selectedIds = [], 
  onSelectionChange = null,
  globalFilter: globalFilterProp,
  setGlobalFilter: setGlobalFilterProp,
  externalFilters = {}, 
  onExternalFiltersChange = null, // ◄ Opcional: Para limpiar selectores desde aquí si se pasa
}) => {

  const { t } = useTranslation();

  // 1. Clave única basada en el título de la tabla para diferenciar almacenes en SessionStorage
  // (usa el título original, sin traducir, para no perder el estado al cambiar de idioma)
  const sessionKey = `rt_state_${tableTitle.toLowerCase().replace(/\s+/g, '_')}`;

  // 2. Intentar recuperar estados previos guardados antes de montar el componente
  const savedState = JSON.parse(sessionStorage.getItem(sessionKey)) || {};

  // 3. Inicialización de estados con fallback al valor recuperado de sesión o por defecto
  const [internalFilter, setInternalFilter] = useState(() => savedState.filter || '');
  const [pagination, setPagination] = useState(() => savedState.pagination || { pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState(() => savedState.sorting || []);

  const [expandedRows, setExpandedRows] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const actualFilter = globalFilterProp !== undefined ? globalFilterProp : internalFilter;

  const handleFilterChange = (value) => {
    if (typeof setGlobalFilterProp === 'function') {
      setGlobalFilterProp(value);
    } else {
      setInternalFilter(value);
    }
  };

  // ◄ FUNCIÓN NUEVA: Limpiar todos los filtros y el almacenamiento
  const handleClearAllFilters = () => {
    // 1. Limpiar búsqueda de texto (global filter)
    handleFilterChange('');
    
    // 2. Restablecer paginación y ordenación locales
    setPagination({ pageIndex: 0, pageSize: 5 });
    setSorting([]);
    
    // 3. Si el padre nos pasa la función para cambiar los selectores, los vaciamos
    if (typeof onExternalFiltersChange === 'function') {
      onExternalFiltersChange({});
    }

    // 4. Fulminar el registro en el sessionStorage
    sessionStorage.removeItem(sessionKey);
  };

  // 4. EFECTO CRUCIAL: Escuchar cambios de estados y persistirlos en el sessionStorage de forma automática
  useEffect(() => {
    const stateToSave = {
      filter: actualFilter,
      pagination,
      sorting,
      externalFilters 
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(stateToSave));
  }, [actualFilter, pagination, sorting, sessionKey, externalFilters]); 

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const toggleRow = id =>
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))

  const toggleSelection = id => {
    if (!onSelectionChange) return;
    
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(item => item !== id)
      : [...selectedIds, id];
    
    onSelectionChange(newSelection);
  };

  const cols = [
    ...(mostrarCheckBox
      ? [{ id: '_checkbox', header: '', cell: ({ row }) => null, enableSorting: false }]
      : []),
    ...columnas.map(col => ({
      ...col,
      accessorFn: col.accessorFn ? col.accessorFn : undefined,
      accessorKey: (!col.accessorFn && !col.render) ? col.key : undefined,
      id: col.id || col.key,
      header: typeof col.encabezado === 'string' ? t(col.encabezado) : col.encabezado,
      // meta.primary marca las columnas "clave" que se ven en la tarjeta colapsada (móvil)
      meta: { ...(col.meta || {}), primary: !!col.primary },
      cell: info =>
        col.render
          ? col.render(info.row.original)
          : info.getValue(),
    })),
  ]

  const table = useReactTable({
    data: datos,
    columns: cols,
    state: { globalFilter: actualFilter, pagination, sorting }, 
    onGlobalFilterChange: handleFilterChange,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualFiltering: false,
  })

  /* =======================
     MODO MOBILE CARD
  ======================= */
  if (isMobile && mobileMode === 'card') {
    return (
      <div className="rt-card">
        <div className="rt-card-body">
          <h1>{t(tableTitle)}</h1>

          {/* Contenedor de búsqueda + botón de limpiar */}
          <div className="d-flex gap-2 mb-3">
            <input
              className="searchInput flex-grow-1"
              placeholder={t('Buscar...')}
              value={actualFilter ?? ''}
              onChange={(e) => {handleFilterChange(e.target.value);}}
            />
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={handleClearAllFilters}
              title={t('Limpiar todos los filtros y ordenación')}
            >
              <i className="bi bi-trash3"></i>
            </button>
          </div>

          <div className="cardsContainer">
            {table.getRowModel().rows.map(row => {
              const expanded = expandedRows[row.id] || false
              const selected = selectedIds.includes(row.original._id);

              let longPressTimer = null
              const handleMouseDown = () => {
                longPressTimer = setTimeout(() => toggleSelection(row.original._id), 500)
              }
              const handleMouseUp = () => clearTimeout(longPressTimer)

              // Celdas de datos (sin la columna de checkbox)
              const dataCells = row.getVisibleCells()
                .filter(cell => cell.column.id !== '_checkbox')

              // Cabecera = columnas marcadas como "primary"; si no hay ninguna,
              // las 2 primeras que no sean la columna de acciones (fallback)
              const marked = dataCells.filter(c => c.column.columnDef.meta?.primary)
              const headCells = marked.length > 0
                ? marked
                : dataCells.filter(c => !['__show', 'Actions'].includes(c.column.id)).slice(0, 2)
              const headIds = new Set(headCells.map(c => c.column.id))
              const bodyCells = dataCells.filter(c => !headIds.has(c.column.id))

              return (
                <div
                  key={row.id}
                  className={`card ${selected ? 'card-selected' : ''} ${expanded ? 'card-expanded' : ''}`}
                  onMouseDown={mostrarCheckBox ? handleMouseDown : undefined}
                  onMouseUp={handleMouseUp}
                  onTouchStart={mostrarCheckBox ? handleMouseDown : undefined}
                  onTouchEnd={handleMouseUp}
                >
                  <div
                    className="card-head"
                    role="button"
                    aria-expanded={expanded}
                    onClick={() => toggleRow(row.id)}
                  >
                    <div className="card-head-fields">
                      {headCells.map(cell => (
                        <div key={cell.id} className="card-field">
                          <strong>{flexRender(cell.column.columnDef.header, cell.getContext())}:</strong>{' '}
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ))}
                    </div>
                    {bodyCells.length > 0 && (
                      <i className={`bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'} card-toggle-icon`}></i>
                    )}
                  </div>

                  {expanded && bodyCells.length > 0 && (
                    <div className="card-details">
                      {bodyCells.map(cell => (
                        <div key={cell.id} className="card-field">
                          <strong>{flexRender(cell.column.columnDef.header, cell.getContext())}:</strong>{' '}
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="pagination">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              ◀
            </button>
            <span>
              {t('Página')} {table.getState().pagination.pageIndex + 1} {t('de')} {table.getPageCount()}
            </span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              ▶
            </button>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{t('Mostrar')} {size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )
  }

  /* =======================
     DESKTOP + ROW COLLAPSE
  ======================= */
  return (
    <div className="rt-card">
      <div className="rt-card-body">
        <h1>{t(tableTitle)}</h1>

        {/* Contenedor de búsqueda + botón de limpiar */}
        <div className="d-flex gap-2 mb-3 align-items-center" style={{ maxWidth: '400px' }}>
          <input
            className="searchInput m-0"
            placeholder={t('Buscar...')}
            value={actualFilter ?? ''}
            onChange={(e) => {handleFilterChange(e.target.value);}}
          />
          <button
            className="btn btn-outline-danger d-flex align-items-center justify-content-center"
            type="button"
            style={{ height: '38px', width: '42px' }}
            onClick={handleClearAllFilters}
            title={t('Limpiar todos los filtros y ordenación')}
          >
            <i className="bi bi-trash3"></i>
          </button>
        </div>

        <table className="table">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {mostrarCheckBox && (
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        table.getPaginationRowModel().rows.length > 0 &&
                        table.getPaginationRowModel().rows.every(row => selectedIds.includes(row.original._id))
                      }
                      onChange={(e) => {
                        const idsPagina = table.getPaginationRowModel().rows.map(r => r.original._id);
                        if (e.target.checked) {
                          const nuevosIds = [...new Set([...selectedIds, ...idsPagina])];
                          onSelectionChange(nuevosIds);
                        } else {
                          const nuevosIds = selectedIds.filter(id => !idsPagina.includes(id));
                          onSelectionChange(nuevosIds);
                        }
                      }}
                    />
                  </th>
                )}
                {hg.headers.map(h => (
                  <th key={h.id}
                      className={`col-${h.column.id}`}
                      onClick={h.column.getToggleSortingHandler()}
                      style={{ cursor: h.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() && (
                      <span>
                        {{
                          asc: <i className="bi bi-sort-up text-primary"></i>,
                          desc: <i className="bi bi-sort-down-alt text-primary"></i>,
                        }[h.column.getIsSorted()] ?? <i className="bi bi-arrow-down-up"></i>}
                      </span>
                      )}
                    </div>
                </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(row => {
              const expanded = expandedRows[row.id] || false
              const selected = selectedIds.includes(row.original._id);

              return (
                <Fragment key={row.id}>
                  <tr onClick={() => isMobile && toggleRow(row.id)}
                      className={selected ? 'row-selected' : ''}>
                    {mostrarCheckBox && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSelection(row.original._id)}
                        />
                      </td>
                    )}
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={`col-${cell.column.id}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>

                  {isMobile && expanded && (
                    <tr>
                      <td colSpan={columnas.length + (mostrarCheckBox ? 1 : 0)}
                          className="rowCollapseExpanded">
                        {row.getVisibleCells().map(cell => (
                          <div key={cell.id}>
                            <strong>{flexRender(cell.column.columnDef.header, cell.getContext())}:</strong>{' '}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            ◀
          </button>
          <span>
            {t('Página')} {table.getState().pagination.pageIndex + 1} {t('de')} {table.getPageCount()}
          </span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            ▶
          </button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size}>{t('Mostrar')} {size}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default ReactTableTanstack;
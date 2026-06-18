import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sendRequest, confirmation, showAlert } from '../../utils/functions';
import ListCRUD from "../../components/List/ListCRUD";

const ValidateReviews = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectIds, setSelectIds] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await sendRequest('GET', null, '/reviews/unverified');
            
            const resultData = res.data || res;

            if (Array.isArray(resultData)) {
                setData(resultData);
            } else {
                setData([]);
            }
        } catch (err) {
            setError(err.message || 'Error al cargar reseñas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleBulkVerify = async () => {
        if (selectIds.length === 0) 
            return showAlert('No hay reseñas seleccionadas', 'warning');

        const confirmado = await confirmation(
            `¿Desea validar ${selectIds.length} reseñas?`
        );
        if (!confirmado) return;

        const res = await sendRequest(
            'PATCH',
            { ids: selectIds },
            `/reviews/bulk-update`
        );

        if (res.success || res.status === 200) {
            showAlert('Reseñas validadas correctamente', 'success');
            setSelectIds([]);
            fetchData();
        } else {
            showAlert(res.message, 'error');
        }
    };

    const handleAllDelete = async () => {
        if (selectIds.length === 0) 
            return showAlert('No hay reseñas seleccionadas', 'warning');

        const confirmado = await confirmation(
            `¿Desea eliminar ${selectIds.length} reseñas? Esta acción no se puede deshacer.`
        );
        if (!confirmado) return;

        const res = await sendRequest(
            'DELETE',
            { ids: selectIds },
            `/reviews/all-delete`
        );

        if (res.success || res.status === 200) {
            showAlert('Reseñas eliminadas correctamente', 'success');
            setSelectIds([]);
            fetchData();
        } else {
            showAlert(res.message, 'error');
        }
    };

    const columnas = useMemo(() => [
        { key: 'FCTM_review_title', encabezado: 'Título' },
        {
            key: 'FCTM_review_text',
            encabezado: 'Comentario',
            render: (row) => {
                const fullText = row.FCTM_review_text || "";
                const truncatedText =
                    fullText.length > 50
                        ? fullText.substring(0, 50) + "..."
                        : fullText;

                return (
                    <span title={fullText} style={{ cursor: 'pointer', color: '#007bff' }}>
                    {truncatedText}
                </span>
                );
            }
        },
        { key: 'FCTM_review_rating', encabezado: 'Puntuación', render: (row) => <span>{row.FCTM_review_rating} / 5</span> }
    ], []);

    return (
        <>
            {loading && 
                 <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              }
            {!loading && error && <p className='text-danger'>{error}</p>}

            {!loading && (
                <ListCRUD
                    title="Validación de reseñas"
                    datos={data}                // CAMBIO 3: Usar 'datos' (con S) si ListCRUD es el estándar de tu proyecto
                    columnas={columnas}
                    tableId="reviews"
                    mostrarCheckBox={true}
                    selectedIds={selectIds}
                    onSelectionChange={setSelectIds}
                >
                    <div className="mb-3">
                        <button
                            className="btn btn-primary me-2"
                            onClick={handleBulkVerify}
                            disabled={selectIds.length === 0}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Validar seleccionadas ({selectIds.length})
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleAllDelete}
                            disabled={selectIds.length === 0}
                        >
                            <i className="bi bi-trash me-2"></i>
                            Eliminar seleccionadas ({selectIds.length})
                        </button>
                    </div>
                </ListCRUD>
            )}
        </>
    );
};

export default ValidateReviews
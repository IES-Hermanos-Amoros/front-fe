import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sendRequest, formatDateDDMMYYYY } from '../../utils/functions';
import { useNavigate } from 'react-router-dom';
import ListCRUD from "../../components/List/ListCRUD";
import RatingStars from "../../components/RatingStars";


const ListReviews = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Columnas clavadas al estilo de la tabla de empresas
    const columnas = useMemo(() => [
        {
            key: 'empresa_nombre',
            encabezado: 'Empresa' ,
            primary: true,
            // Esto le da al buscador el string exacto por el cual filtrar en minúsculas/mayúsculas
            accessorFn: row => row.empresa_nombre || '',
            render: row => row.empresa_nombre || '-'
        },
        { 
            key: 'FCTM_review_title', 
            encabezado: 'Título' 
        },
        {
            key: "FCTM_review_rating",
            encabezado: "Calificación",
            primary: true,
            render: (row) => <RatingStars rating={row.FCTM_review_rating} />,
        },
        { 
            key: 'alumno_nombre', 
            encabezado: 'Autor' 
        },
        { 
            key: 'FCTM_review_text', 
            encabezado: 'Comentario',
            render: row => row.FCTM_review_text && row.FCTM_review_text.length > 60 
                ? `${row.FCTM_review_text.substring(0, 60)}...` 
                : row.FCTM_review_text || '-'
        },
        { 
            key: 'FCTM_inserted_date', 
            encabezado: 'Fecha',
            accessorFn: row => row.FCTM_inserted_date ? new Date(row.FCTM_inserted_date).getTime() : 0,
            render: row => row.FCTM_inserted_date ? formatDateDDMMYYYY(row.FCTM_inserted_date) : '-'
        },
        {
            key: '__show',
            encabezado: 'Acciones', // O "Ver", como lo tengáis en empresas
            render: (row) => (
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/reviews/${row._id}`)}
                    title="Ver reseña completa"
                >
                    <i className="bi bi-search"></i>
                </button>
            )
        }
    ], [navigate]);

    // Carga de datos del backend
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await sendRequest('GET', null, '/reviews/reviews');
            if (res.success) {
                setData(res.data);
            } else {
                setError(res.message || 'Error al cargar las reseñas');
            }
        } catch (err) {
            setError(err.message || 'Error al cargar las reseñas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    return (
        <>
            {loading && 
                 <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              }
            {!loading && error && <p className="text-danger">{error}</p>}
            {!loading && !error && data.length === 0 && (
                <p className="text-muted">No hay reseñas disponibles</p>
            )}
            {!loading && !error && data.length > 0 && (
                <ListCRUD
                    title="Reseñas del Sistema"
                    datos={data}
                    columnas={columnas}
                    tableId="reviews_globales"
                    mostrarCheckBox={false} // Cambia a true si empresas lleva selección masiva
                />
            )}
        </>
    );
};

export default ListReviews;
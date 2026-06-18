import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendRequest, promptCredentials } from '../../utils/functions';
import ReactTableTanstack from '../../components/List/ReactTableTanstack';
import CircularProgress from '../../components/CircularProgress';
import useSocketProgress from '../../hooks/useSocketProgress';
import "./ListSaoSync.css";

const ListSaoSync = ({
    endpointSync,         // ENDPOINT para obtener datos de SAO
    endpointApply,        // ENDPOINT para insertar/actualizar en MongoDB
    columnas,             // columnas dinámicas
    title,                // Título de la tabla
    mappingFunction,       // función para transformar datos al formato de la tabla
    verCheckTodasFCTs = false
}) => {

    const { t } = useTranslation();

    const [items, setItems] = useState([]);               // Datos transformados para la tabla
    const [loading, setLoading] = useState(false);       // Loading para fetch
    const [resetKey, setResetKey] = useState(0);         // Reset visual del componente
    const [dataToSync, setDataToSync] = useState(null);  // JSON original recibido del backend
    const [applyLoading, setApplyLoading] = useState(false); // Loading para aplicar cambios

    // 🔑 Pasamos resetKey para recrear el socket al resetear
    const { progress, message: progressMessage, resetProgress } = useSocketProgress(resetKey);

    // 1. Decidimos qué mensaje mostrar en el spinner
    const loadingMessage = applyLoading ? t('Aplicando cambios en la base de datos...') : progressMessage;
        // 2. ¿Estamos en un proceso crítico de carga?
    const isProcessing = loading || applyLoading;

    // --------------------------------------------------------
    // 1) CARGAR DATOS SAO
    // --------------------------------------------------------
    const fetchData = async () => {
        const credentials = await promptCredentials(verCheckTodasFCTs);
        if (!credentials) return;

        setLoading(true);
        resetProgress();           // 🔹 reset visual de la barra de progreso
        setResetKey(prev => prev + 1);  // 🔹 fuerza recrear socket

        const res = await sendRequest("POST", credentials, endpointSync);

        setLoading(false);

        if (res.success) {
            setDataToSync(res.data);

            const transformed = mappingFunction(res.data);
            setItems(transformed);

        } else {
            // Solo resetear si no viene skipComponentReset
            if (!res.skipComponentReset) {
                setItems([]);
                setDataToSync(null);
                setLoading(false);
                setApplyLoading(false);
                setResetKey(prev => prev + 1); // 🔹 recrea socket
            }
            console.error("Error al cargar datos:", res.message);
        }
    };

    // --------------------------------------------------------
    // 2) APLICAR CAMBIOS EN MONGODB
    // --------------------------------------------------------
    const applyChanges = async () => {
        if (!dataToSync) return;

        setApplyLoading(true);

        const res = await sendRequest(
            "POST",
            dataToSync,
            endpointApply,
            true      // skipComponentReset
        );

        setApplyLoading(false);

        if (res.success) {
            // Reset completo tras éxito
            setItems([]);
            setDataToSync(null);
            setResetKey(prev => prev + 1); // 🔹 recrea socket
        } else {
            // No tocamos items ni dataToSync si hay error
            console.error("Error al aplicar cambios:", res.message);
        }
    };

    const itemsWithTooltip = items.map(c => {
        const labelClass =
            c.status === "New" ? "label-new" :
            c.status === "Updated" ? "label-updated" : "";

        return {
            ...c,
            status: (
                <span key={c._id}
                    title={c.statusTooltip || ""}
                    className={`status-label ${labelClass}`}
                >
                    {c.status}
                </span>
            )
        };
    });

    return (
        <div key={resetKey}>
            <section className='dashboard section'>
                <div className="row mb-3">
                    <div className="col-12">
                        <button className="btn btn-success" onClick={fetchData} disabled={isProcessing}>
                            {loading ? t('Cargando...') : t('Cargar')}
                        </button>
                        &nbsp;
                        <button
                            className="btn btn-primary"
                            disabled={!dataToSync || isProcessing}
                            onClick={applyChanges}
                        >
                            {applyLoading ? t('Aplicando...') : t('Aplicar Cambios')}
                        </button>
                    </div>
                </div>

                {/*(loading) && ( 
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <CircularProgress progress={progress} />
                        <p style={{ marginTop: "10px" }}>{progressMessage}</p>
                    </div>
                )*/}
                {/*isProcessing && ( 
                    <div style={{ marginTop: "40px", textAlign: "center", padding: "20px" }}>
                        <CircularProgress progress={progress} />
                        <h4 style={{ marginTop: "20px" }}>{loadingMessage}</h4>
                        <p className="text-muted">Por favor, espera a que finalice el proceso.</p>
                    </div>
                )*/}
                {/*isProcessing && ( 
                    <div style={{ marginTop: "40px", textAlign: "center", padding: "20px" }}>                        
                        <CircularProgress progress={applyLoading ? undefined : progress} />
                        
                        <h4 style={{ marginTop: "20px" }}>{loadingMessage}</h4>
                        {applyLoading && <p className="text-muted">Esto puede tardar unos segundos...</p>}
                    </div>
                )*/}
                {isProcessing && (
                    <div style={{ marginTop: "40px", textAlign: "center", padding: "20px" }}>
                        
                        {applyLoading ? (
                            /* --- ESTADO 1: APLICANDO CAMBIOS (Spinner Infinito) --- */
                            <div className="spinner-container">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">{t('Cargando...')}</span>
                                </div>
                            </div>
                        ) : (
                            /* --- ESTADO 2: CARGANDO DATOS (Barra Progresiva) --- */
                            <CircularProgress progress={progress} />
                        )}

                        <h4 style={{ marginTop: "20px" }}>{loadingMessage}</h4>
                        
                        {applyLoading && (
                            <p className="text-muted">{t('Esto puede tardar unos segundos...')}</p>
                        )}
                    </div>
                )}


                {!isProcessing && items.length === 0 && (
                    <p>{t('No hay datos disponibles.')}</p>
                )}

                {!isProcessing && items.length > 0 && (
                    <ReactTableTanstack
                        tableTitle={title}
                        datos={itemsWithTooltip}
                        columnas={columnas}
                    />
                )}
            </section>
        </div>
    );
};

export default ListSaoSync;

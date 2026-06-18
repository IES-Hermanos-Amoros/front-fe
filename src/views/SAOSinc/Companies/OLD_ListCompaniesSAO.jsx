import React, { useState } from 'react';
import { sendRequest, promptCredentials } from '../../../utils/functions';
import GenericTable from '../../../components/GenericTable';
import CircularProgress from '../../../components/CircularProgress';
import useSocketProgress from '../../../hooks/useSocketProgress';
import "./OLD_ListCompaniesSAO.css";

const ListCompaniesSAO = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [companiesToSync, setCompaniesToSync] = useState(null); // 🔵 JSON original
    const [applyLoading, setApplyLoading] = useState(false); // 🟡 Para botón "Aplicar cambios"

    // Hook de progreso por socket, se reinicia cuando resetKey cambia
    const { progress, message: progressMessage, resetProgress } = useSocketProgress(resetKey);

    const fetchCompanies = async () => {
        const credentials = await promptCredentials();
        if (!credentials) return; // Cancelado por usuario

        setLoading(true);
        resetProgress(); // Reset visual del progreso
        const res = await sendRequest("POST", credentials, "/api/v2/sao/companies_sinc", false);
        setLoading(false);

        if (res.success) {
            // 🔵 Guardamos el JSON original para sincronizar más tarde
            setCompaniesToSync(res.data);
            const { newCompanies, updatedCompanies } = res.data;

            const companiesData = [
                ...newCompanies.map(c => ({ ...c, _id: c.SAO_id, status: 'Nueva', statusTooltip: '' })),
                ...updatedCompanies.map(c => ({
                    ...c,
                    _id: c.SAO_id,
                    status: 'Actualizada',
                    statusTooltip: c.SAO_MODIFIED_FIELDS.map(f => f.field).join(', ')
                }))
            ];

            setCompanies(companiesData);
        } else {
            // Reset a valores iniciales
            //setCompaniesToSync(null);
            //setCompanies([]);
            //setLoading(false);
            //setApplyLoading(false);

            // Reiniciar el componente COMPLETO y progreso
            //setResetKey(prev => prev + 1);
            // 🟢 SOLO RESETEAR EL COMPONENTE SI NO ES APLICAR CAMBIOS
            if (!res.skipComponentReset) {

                setCompaniesToSync(null);
                setCompanies([]);
                setLoading(false);
                setApplyLoading(false);

                // Reiniciar el componente COMPLETO y progreso
                setResetKey(prev => prev + 1);
            }

            console.error("Error al cargar empresas:", res.message);
        }
    };

 // --------------------------------------------------------
    // 2) APLICAR CAMBIOS EN MONGODB
    // --------------------------------------------------------
    const applyChanges = async () => {
        if (!companiesToSync) return;

        //const credentials = await promptCredentials();
        //if (!credentials) return;

        setApplyLoading(true);

        const res = await sendRequest(
            "POST",
            companiesToSync, // body = JSON original
            "/api/v2/sao/companies",
            true   
        );

        setApplyLoading(false);

        if (res.success) {
            //showAlert("Cambios aplicados correctamente en MongoDB");

            // Reset total
            setCompanies([]);
            setCompaniesToSync(null);
            setResetKey(prev => prev + 1);
        } else {
            //alert("Error al aplicar cambios");
            console.error(res.message);
            
        }
    };


    const columnas = [
        { key:"_id", encabezado: "#" } ,
        { key: "SAO_name", encabezado: "Nombre" },
        { key: "status", encabezado: "Tipo" },        
        { key: "SAO_company_city", encabezado: "Ciudad" },
        { key: "SAO_company_state", encabezado: "Provincia" },
        { key: "SAO_company_activity", encabezado: "Actividad" },
    ];

    const companiesWithTooltip = companies.map(c => {
        const labelClass =
            c.status === "Nueva" ? "label-new" :
            c.status === "Actualizada" ? "label-updated" : "";

        return {
            ...c,
            status: (
                <span
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
                        <button className="btn btn-success" onClick={fetchCompanies} disabled={loading}>
                            {loading ? "Cargando..." : "Cargar Empresas"}
                        </button>
                        &nbsp; 
                        {/* 🔵 BOTÓN APLICAR CAMBIOS */}
                        <button
                            className="btn btn-primary"
                            disabled={!companiesToSync || loading || applyLoading}
                            onClick={applyChanges}
                        >
                            {applyLoading ? "Aplicando..." : "Aplicar Cambios"}
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        {loading && (
                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <CircularProgress progress={progress} />
                                <p style={{ marginTop: "10px" }}>{progressMessage}</p>
                            </div>
                        )}

                        {companies.length === 0 && !loading && <p>No hay empresas disponibles.</p>}

                        {companies.length > 0 && (
                            <GenericTable
                                key={companiesWithTooltip.length}
                                tableTitle="Empresas sincronizadas"
                                datos={companiesWithTooltip}
                                columnas={columnas}
                            />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ListCompaniesSAO;

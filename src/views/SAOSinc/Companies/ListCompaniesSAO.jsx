import ListSaoSync from "../ListSaoSync";

const columnasCompanies = [
    { key:"_id", encabezado: "#" },
    { key: "SAO_name", encabezado: "Nombre" },
    { key: "status", encabezado: "Tipo" },
    { key: "SAO_company_city", encabezado: "Ciudad" },
    { key: "SAO_company_state", encabezado: "Provincia" },
    { key: "SAO_company_activity", encabezado: "Actividad" },
];

const mapCompanies = (data) => {
    const { newCompanies, updatedCompanies } = data;

    return [
        ...newCompanies.map(c => ({
            ...c, _id: c.SAO_id, status: "New", statusTooltip: ""
        })),
        ...updatedCompanies.map(c => ({
            ...c,
            _id: c.SAO_id,
            status: "Updated",
            statusTooltip: c.SAO_MODIFIED_FIELDS.map(f => f.field).join(", ")
        }))
    ];
};

export default function ListCompaniesSAO() {
    return (
        <ListSaoSync
            endpointSync="/sao/companies_sinc"
            endpointApply="/sao/companies"
            columnas={columnasCompanies}
            title="Empresas sincronizadas"
            mappingFunction={mapCompanies}
        />
    );
}

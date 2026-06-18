import ListSaoSync from "../ListSaoSync";

const columnasFcts = [
    { key:"_id", encabezado: "#" },
    { key: "SAO_company_name", encabezado: "Empresa" },
    { key: "status", encabezado: "Tipo" },
    { key: "SAO_workcenter_city", encabezado: "Localidad" },
    { key: "SAO_student_name", encabezado: "Alumno" },
    { key: "SAO_teacher_name", encabezado: "Tutor" },    
];

const mapFcts = (data) => {
    const { newFCT, updatedFCT } = data;

    return [
        ...newFCT.map(c => ({
            ...c, _id: c.SAO_fct_id, status: "New", statusTooltip: ""
        })),
        ...updatedFCT.map(c => ({
            ...c,
            _id: c.SAO_fct_id,
            status: "Updated",
            statusTooltip: c.SAO_MODIFIED_FIELDS.map(f => f.field).join(", ")
        }))
    ];
};

export default function ListFctsSAO() {
    return (
        <ListSaoSync
            endpointSync="/sao/fcts_sinc"
            endpointApply="/sao/fcts"
            columnas={columnasFcts}
            title="FCTs sincronizadas"
            mappingFunction={mapFcts}
            verCheckTodasFCTs = {true}
        />
    );
}

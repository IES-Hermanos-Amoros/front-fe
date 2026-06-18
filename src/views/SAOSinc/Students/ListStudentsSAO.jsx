import ListSaoSync from "../ListSaoSync";

const columnasStudents = [
    { key:"_id", encabezado: "#" },
    { key: "SAO_name", encabezado: "Nombre" },
    { key: "status", encabezado: "Tipo" },
    { key: "SAO_student_city", encabezado: "Ciudad" },
    { key: "SAO_student_state", encabezado: "Provincia" },
    { key: "SAO_id", encabezado: "NIA" },
];

const mapStudents = (data) => {
    const { newStudents, updatedStudents } = data;

    return [
        ...newStudents.map(c => ({
            ...c, _id: c.SAO_id, status: "New", statusTooltip: ""
        })),
        ...updatedStudents.map(c => ({
            ...c,
            _id: c.SAO_id,
            status: "Updated",
            statusTooltip: c.SAO_MODIFIED_FIELDS.map(f => f.field).join(", ")
        }))
    ];
};

export default function ListStudentsSAO() {
    return (
        <ListSaoSync
            endpointSync="/sao/students_sinc"
            endpointApply="/sao/students"
            columnas={columnasStudents}
            title="Alumnos sincronizados"
            mappingFunction={mapStudents}
        />
    );
}

import ListSaoSync from "../ListSaoSync";

const columnasTeachers = [
    { key:"_id", encabezado: "#" },
    { key: "SAO_name", encabezado: "Nombre" },
    { key: "status", encabezado: "Tipo" },
    { key: "SAO_profile", encabezado: "Perfil" },
    { key: "SAO_organization", encabezado: "Familia" },
    { key: "SAO_username", encabezado: "NIF" },    
];

const mapTeachers = (data) => {
    const { newTeachers, updatedTeachers } = data;

    return [
        ...newTeachers.map(c => ({
            ...c, _id: c.SAO_id, status: "New", statusTooltip: ""
        })),
        ...updatedTeachers.map(c => ({
            ...c,
            _id: c.SAO_id,
            status: "Updated",
            statusTooltip: c.SAO_MODIFIED_FIELDS.map(f => f.field).join(", ")
        }))
    ];
};

export default function ListTeachersSAO() {
    return (
        <ListSaoSync
            endpointSync="/sao/teachers_sinc"
            endpointApply="/sao/teachers"
            columnas={columnasTeachers}
            title="Profesores/Administradores sincronizados"
            mappingFunction={mapTeachers}
        />
    );
}

import axios from "axios"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import i18n from "../i18n"



export const sendRequest = async (method, params, url, skipComponentReset = false, redir = '', mostrarMensaje = true) => {
    let res = {
        success: false,
        status: null,
        data: null,
        message: ""
    };

    try {

        console.log(method)
        console.log(url);
        console.log(params);

        const response = await axios({
            method,
            url,
            data: params,
            // withCredentials: true
        });

        console.log(response);

        // Caso éxito
        res.success = true;
        res.status = response.status;
        res.data = response.data.data ?? response.data;
        res.message = response.data.msg ?? response.data.message ?? "Operación exitosa";

        /*if (method !== "GET" && res.message && mostrarMensaje) {
            await showAlert(res.message, "success");
        }*/

        if (redir) {
            setTimeout(() => window.location.href = redir, 500);
        }

    } catch (error) {

        console.log("ERROR:");
        console.log(error);
        console.log(".......................");

        // Tabla de mensajes útiles según HTTP status
        const httpStatusMessages = {
            400: "Solicitud incorrecta (400)",
            401: "No autorizado (401)",
            403: "Acceso prohibido (403)",
            404: "Recurso no encontrado (404)",
            500: "Error interno del servidor (500)"
        };

        // --- Caso 1: El servidor respondió con código 4xx o 5xx ---
        if (error.response) {
            res.status = error.response.status;

            const backendMsg =
                error.response.data?.msg ||
                error.response.data?.message ||
                error.response.data?.error ||
                error.response.data?.error?.message ||
                error.response.data?.err ||
                error.response.data?.err?.message;
            
            //console.log("backendMsg:", backendMsg);
            
                // Obtén mensaje genérico según el código HTTP
            const genericMsg = httpStatusMessages[error.response.status] || "Error inesperado del servidor";

            // Combina el genérico con el detalle del backend si existe
            res.message = backendMsg ? `${genericMsg}:\n ${backendMsg}` : genericMsg;

            /*res.message =
                backendMsg ||
                httpStatusMessages[error.response.status] ||
                "Error inesperado del servidor";*/

            res.data = error.response.data;
        }

        // --- Caso 2: No hubo respuesta del servidor ---
        else if (error.request) {
            res.message = "El servidor no responde. Verifica tu conexión.";
        }

        // --- Caso 3: Error al preparar la solicitud ---
        else {
            res.message = error.message || "Error inesperado";
        }

        if(mostrarMensaje){
          showAlert(res.message, "error");
        }

        if (redir) {
            setTimeout(() => window.location.href = redir, 500);
        }
    }

    res.skipComponentReset = skipComponentReset;

    return res;
};

export function showAlert(msg, icon = "success") {

    const MySwal = withReactContent(Swal)

    return MySwal.fire({

        // i18n.t devuelve la propia clave si no hay traducción, por lo que los
        // mensajes dinámicos del backend se muestran tal cual
        title: typeof msg === 'string' ? i18n.t(msg) : msg,
        icon,

        confirmButtonText: i18n.t("Aceptar"),

        buttonsStyling: false,

        customClass: {
            popup: "fctm-modal",
            confirmButton: "fctm-btn"
        }

    })
}


export const confirmation = async (
  title = "¿Seguro que quieres eliminar este dato?"
) => {
  const result = await Swal.fire({
    title: typeof title === 'string' ? i18n.t(title) : title,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: i18n.t("Aceptar"),
    cancelButtonText: i18n.t("Cancelar"),
    buttonsStyling: false,
    customClass: {
      popup: "fctm-modal",
      confirmButton: "fctm-btn",
      cancelButton: "fctm-btn-cancel",
      actions: "swal2-actions" // <--- Forzamos la clase del contenedor
    }
  });

  return result.isConfirmed;
};

export const promptCredentials = async (mostrarCheckTodasFCTs = false) => {
    const MySwal = withReactContent(Swal);

    const { value: formValues } = await MySwal.fire({
        title: 'Autenticación SAO',
        html: `
            <div style="position: relative; margin-bottom: 10px;">
                <input id="swal-username" class="swal2-input custom-input" placeholder="Usuario" style="margin: 0; width: 100%;">
            </div>
            
            <div style="position: relative;">
                <input id="swal-password" type="password" class="swal2-input custom-input" placeholder="Contraseña" style="margin: 0; width: 100%;">
                <i id="toggle-password-icon" class="bi bi-eye-slash" 
                   style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); cursor: pointer; z-index: 10; font-size: 1.2rem; color: #666;">
                </i>
            </div>
            
            ${
                mostrarCheckTodasFCTs
                    ? `
                    <div style="margin-top: 15px; text-align: left;">
                        <label style="display: flex; align-items: center; cursor: pointer; gap: 10px; font-size: 0.9rem; justify-content: flex-start;">
                            <input id="swal-todasFCTs" type="checkbox" style="margin: 0; width: auto; height: auto;">
                            <span style="color: #555;">Sincronizar Todas las FCTs (solo admin.)</span>
                        </label>
                    </div>
                    `
                    : ''
            }
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const toggleIcon = document.getElementById('toggle-password-icon');
            const passwordInput = document.getElementById('swal-password');

            if (toggleIcon && passwordInput) {
                toggleIcon.addEventListener('click', () => {
                    const isPassword = passwordInput.type === 'password';
                    passwordInput.type = isPassword ? 'text' : 'password';
                    toggleIcon.classList.toggle('bi-eye');
                    toggleIcon.classList.toggle('bi-eye-slash');
                });
            }
        },
        preConfirm: () => {
            const username = document.getElementById('swal-username').value;
            const password = document.getElementById('swal-password').value;
            const todasFCTs = mostrarCheckTodasFCTs
                ? document.getElementById('swal-todasFCTs').checked
                : false;

            if (!username || !password) {
                Swal.showValidationMessage('Por favor ingresa usuario y contraseña');
                return false;
            }

            return { username, password, todasFCTs };
        }
    });

    if (!formValues) return null;
    return formValues;
};



export const normalizeFromApi = (data, configs = []) => {
  let normalized = { ...data };

    // Definimos la lógica de fecha internamente para usarla cuando se necesite
    const formatToInputDate = (value) => {
        if (!value || typeof value !== "string") return "";
        return value.includes("T") ? value.split("T")[0] : value;
    };

  configs.forEach(config => {
    const {
      field,
      options = [],
      optionValue = "_id",
      optionLabel = "label",
      type = "single"
    } = config;

    if (!normalized[field]) {
      normalized[field] = type === "multi" ? [] : null;
      return;
    }


    // --- NUEVA LÓGICA PARA FECHAS ---
    if (type === "date") {
      normalized[field] = formatToInputDate(normalized[field]);
      return;
    }

    if (type === "multi") {
      normalized[field] = normalized[field]
        .map(item => {

          // 🔥 Soporta ID simple o objeto populado
          const id = typeof item === "object" && item !== null
            ? item[optionValue]
            : item;

          const match = options.find(opt => opt[optionValue] === id);

          return match
            ? { value: match[optionValue], label: match[optionLabel] }
            : null;
        })
        .filter(Boolean);

    } else {
      const item = normalized[field];

      const id = typeof item === "object" && item !== null
        ? item[optionValue]
        : item;

      const match = options.find(opt => opt[optionValue] === id);

      normalized[field] = match
        ? { value: match[optionValue], label: match[optionLabel] }
        : null;
    }
  });

  return normalized;
};


export const normalizeToApi = (data, configs = []) => {
  let normalized = { ...data };

  configs.forEach(config => {
    const { field, type = "single" } = config;

    // SI EL CAMPO NO ESTÁ EN LOS DATOS QUE QUEREMOS ENVIAR, NO HACEMOS NADA
    if (!(field in normalized)) {
      return; 
    }

    if (!normalized[field]) {
      normalized[field] = type === "multi" ? [] : null;
      return;
    }

    if (type === "date") {
      // date input gives "YYYY-MM-DD" string — send as-is, Mongoose parses it
      return;
    }

    if (type === "multi") {
      normalized[field] = normalized[field].map(item => item.value);
    } else {
      normalized[field] = normalized[field]?.value || null;
    }
  });

  return normalized;
};

export const pickFCTMFields = (data) => {
  return Object.keys(data)
    .filter(key => key.startsWith("FCTM_"))
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});
};

export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Tonos desaturados (S 30%, L 89%): chips tipo "tag" sobrios y armoniosos,
  // legibles con texto oscuro en ambos temas
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 30%, 89%)`;
};


export const formatDateDDMMYYYY = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export const formatDateDDMMYYYYHHmm = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false // Fuerza el formato de 24 horas
  }).replace(",", ""); // Opcional: elimina la coma que separa fecha y hora en algunos navegadores
};

/**
 * Genera la URL base del backend combinando el protocolo y el host de entorno.
 * @returns {string} URL completa (ej: https://api.tuweb.com)
 */
export const getBackendHost = () => {
    const host = import.meta.env.VITE_BASE_URL_BACKEND || '';
    // Intentamos obtener el protocolo, con un fallback a 'https' si la constante no existe
    const protocol = typeof __DEV_SERVER_PROTOCOL__ !== 'undefined' 
        ? __DEV_SERVER_PROTOCOL__ 
        : 'https';

    // Aseguramos que el protocolo termine en ://
    //const formattedProtocol = protocol.endsWith('://') ? protocol : `${protocol}://`;
    
    return `${protocol}${host}`;
};

export const validateStrongPassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

  return strongPasswordRegex.test(password);
};

export const extractSkillNames = (skills) => {
  if (!skills) return [];

  return skills.map(s => {
    let name = null;

    if (typeof s === "string") name = s;
    else if (s.label) name = s.label;
    else if (s.FCTM_skill_name) name = s.FCTM_skill_name;

    return name ? name.trim().toUpperCase() : null;
  }).filter(Boolean);
};

export const ensureSkills = async (skills) => {

  const names = extractSkillNames(skills);

  const res = await sendRequest(
    "POST",
    { names },
    "/skills/ensure",
    false,
    "",
    false
  );

  if (!res.success) {
    throw new Error("Error ensuring skills");
  }

  return res.data; // ids
};



export const getProfilePath = (userRole, userId) => {
    switch (userRole) {
        case 'ADMINISTRADOR': return `/administrators/${userId}`;
        case 'PROFESOR':      return `/teachers/${userId}`;
        case 'ALUMNO':        return `/students/${userId}`;
        case 'EMPRESA':       return `/companies/${userId}`;
        default:              return '/dashboard';
    }
};


/**
 * Realiza el logout en el servidor y ejecuta las limpiezas locales.
 * @param {Function} clearUser - La función del store (Zustand) para limpiar datos.
 * @param {Function} navigate - La función de navegación de React Router.
 */
export const externLogout = async (clearUser, navigate) => {
    // 1. Llamada al servidor (usando tu sendRequest ya existente)
    // Pasamos mostrarMensaje=false porque solemos poner un Swal antes o no queremos ruido
    const res = await sendRequest("POST", null, "/auth/logout", false, "", false);

    if (res?.success) {
        // ◄ NUEVO: Limpiar por completo el sessionStorage del navegador (filtros, búsqueda, paginación...)
        sessionStorage.clear();

        // 2. Limpiar el store de Zustand
        if (typeof clearUser === 'function') {
            clearUser();
        }

        // 3. Redirigir al login o raíz
        if (typeof navigate === 'function') {
            navigate('/');
        }
        return true;
    }
    
    return false;
};


// src/utils/selectStyles.js (o dentro de functions.js)
export const selectorDark = {
  menuPortal: base => ({ ...base, zIndex: 9999 }),
  control: (base) => ({
    ...base,
    backgroundColor: "var(--bs-body-bg)",
    color: "var(--bs-body-color)",
    borderColor: "var(--bs-border-color)",
    "&:hover": {
      borderColor: "var(--bs-border-color)"
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--bs-body-bg)",
    border: "1px solid var(--bs-border-color)"
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected 
      ? "#0d6efd" 
      : isFocused 
      ? "var(--bs-tertiary-bg)" 
      : "transparent",
    color: isSelected 
      ? "white" 
      : "var(--bs-body-color)",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#0d6efd",
      color: "white"
    }
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "var(--bs-tertiary-bg)",
    border: "1px solid var(--bs-border-color)"
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--bs-body-color)",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--bs-body-color)",
    "&:hover": {
      backgroundColor: "rgba(220, 53, 69, 0.2)",
      color: "#dc3545",
    },
  }),
  input: (base) => ({
    ...base,
    color: "var(--bs-body-color)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--bs-body-color)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--bs-secondary-color)"
  })
};
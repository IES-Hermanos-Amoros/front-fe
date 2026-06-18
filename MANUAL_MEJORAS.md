# 📘 Manual de mejoras — Frontend (F.E. Manager)

Registro técnico de **todo lo modificado en el frontend** respecto a la versión
original entregada por el profesor. El manual del **backend** (Swagger + auditoría de
seguridad) está en su propio repositorio (`fe-manager-backend`).

> **Filosofía de trabajo:** tocar el mínimo de archivos y líneas, no romper nada de lo
> que ya funcionaba y mantener los *rollbacks* sencillos (casi todo se desactiva
> quitando un `import`). No se añadieron librerías nuevas salvo las de i18n.

---

## 1. Multilenguaje (Castellano / Valenciano / Inglés)

La app original estaba solo en castellano con los textos escritos directamente en el
código. Ahora es totalmente multiidioma.

- **Librerías**: `i18next` + `react-i18next` (configuración en `src/i18n/index.js`).
- **Estrategia "clave = texto en castellano"**: `t('Empresas')` busca esa frase en el
  diccionario del idioma activo. Si no hay traducción, devuelve la propia frase en
  castellano → **nunca se ve una clave técnica ni un texto roto**.
- **3 diccionarios** en `src/i18n/locales/`: `es.json`, `en.json`, `va.json`.
  Tras la revisión final, los tres tienen **paridad total de claves (357 cada uno)**.
- **Persistencia**: el idioma se guarda en `localStorage("lang")` y se refleja en
  `<html lang>`.
- **Selector de idioma**: componente `LanguageSelector.jsx`, presente en la cabecera y
  en el login.
- **Cobertura**: menú lateral, cabeceras de tabla, fichas, formularios, alertas
  (SweetAlert), botones de exportar, paginación, footer, páginas legales, módulo de
  Sincronización SAO y el dashboard completo.
- **Gráficas (ECharts)**: títulos, leyendas, series e indicadores de radar también se
  traducen; las gráficas se reinician al cambiar de idioma (`useEffect([t])` +
  `chart.dispose()`).
- **Textos que vienen de la base de datos** (enums, estados): se pasan por `t(valor)`;
  si el valor no está como clave, se muestra el original.

### Cómo se tradujeron los listados, fichas y alertas con pocos archivos

- **Listados**: tocando solo `ReactTableTanstack.jsx` y `ReactTableToolBar.jsx` se
  traducen todas las tablas (cabeceras, buscador, paginación, exportación). La
  `sessionKey` sigue usando el título original sin traducir para no perder los filtros
  guardados al cambiar de idioma.
- **Fichas y formularios**: con `ShowHeader.jsx`, `ShowEditableForm.jsx` y
  `ShowReadonlyForm.jsx` se cubren casi todas las fichas.
- **Alertas**: `utils/functions.js` pasa los mensajes de `showAlert`/`confirmation` por
  `i18n.t()` de forma central; basta con añadir la frase como clave en los diccionarios
  para traducir un aviso, sin tocar la vista.

---

## 2. Rediseño visual moderno (re-skin sobre Bootstrap)

Capa de estilo nueva **sin modificar la lógica ni la estructura HTML**: todo vive en
`src/styles/theme-modern.css` y se activa/desactiva con un único `import`.

- **Paleta "teal" profesional** (`#0f766e` claro / `#14b8a6` oscuro) definida con
  variables CSS `--tm-*`; cambiar todos los colores desde un único sitio.
- **Tipografía Inter**, tarjetas con borde fino + sombra mínima ("hairline"), botones,
  formularios, dropdowns, tablas y scrollbar reestilizados.
- **Modo claro/oscuro intacto**: los colores se definen también para
  `[data-bs-theme='dark']`.
- **Marca y sidebar**: logo nuevo (cuadrado teal con birrete + "F.E. Manager"), marca
  movida del header al sidebar, iconos con significado en cada apartado del menú.
- **Sidebar inteligente**: en escritorio se pliega dejando una franja con una pastilla
  teal que "respira"; al pasar el ratón o recibir foco por teclado se despliega como
  capa flotante sin empujar el contenido. En móvil/tablet hay un botón de menú y un
  overlay para cerrarlo.
- **Login profesional**: fondo oscuro con resplandor teal, logo en contenedor
  redondeado, inputs y botón con gradiente, subtítulo institucional.
- **Animaciones suaves** (solo `transform`/`opacity`, respetando
  `prefers-reduced-motion`): entrada escalonada del contenido y aparición de dropdowns.
- **Modo oscuro del sidebar corregido**: usa `#2a3042` (mismo tono que header y
  tarjetas) en lugar del gris-verdoso anterior, que destacaba más claro que el resto.

> *Rollback:* quitar el `import './styles/theme-modern.css'` de `App.jsx`.

---

## 3. Accesibilidad

- **Enlace "Saltar al contenido principal"** (`skip-link`) que aparece al pulsar `Tab`.
- **Indicador de foco visible** global (`:focus-visible`) para navegación por teclado.
- **Soporte de `prefers-reduced-motion`**: si el sistema tiene las animaciones
  desactivadas, no se reproducen.
- **`<html lang="es">`** y `<title>` corregidos (antes `lang="en"`).
- Todo en `src/styles/a11y.css`.

---

## 4. Páginas legales + banner de cookies

- **Tres páginas públicas** (sin login): Política de Privacidad, Aviso Legal y Política
  de Cookies (`src/views/Legal/LegalPage.jsx`), con contenido real adaptado a lo que hace
  la app y disponible en los 3 idiomas.
- **Banner de cookies** (`CookieBanner.jsx`): guarda la decisión en
  `localStorage("cookie_consent")` y no vuelve a aparecer.
- **Enlaces en el footer** a las tres páginas.

---

## 5. Listados y tablas

- **Barra de herramientas reordenada** (`ReactTableToolBar.css`): título, filtros y
  exportación comparten la primera fila; los controles de **edición masiva** caen a su
  propia fila cuando aparecen, en lugar de apelotonarse. Responsive a < 992 px.
- **Botones de exportación discretos** (borde fino + punto de color) y botón de "limpiar
  filtros" en estilo fantasma.
- **Columnas que ya no se parten en dos líneas**: CIF (Empresas), NIA y Localidad
  (Alumnado) y NIA en Gestión F.E. Se logró con una clase `col-<columna>` en cada celda
  y una regla `white-space: nowrap` específica.
- **Tablas anchas domadas**: cabeceras en una línea, zebra sutil, textos largos que
  parten en vez de provocar scroll horizontal, chips/badges más sobrios.

### Bug corregido: dropdowns de edición masiva ocultos

Al seleccionar varias filas aparecían los desplegables de actualización masiva
(`react-select`), pero sus opciones quedaban **tapadas por la tabla** (contexto de
apilamiento `z-index`). **Solución (3 líneas):** añadir `menuPortalTarget={document.body}`
a los selectores de Empresas y Alumnado, para que el menú se renderice en un portal sobre
el `<body>`. No se añadió ninguna librería.

---

## 6. Tarjetas móviles desplegables (sin cortar contenido)

**Problema:** en móvil, las tarjetas mostraban todos los campos a la vez y, en la versión
original, se recortaban con una altura fija (`maxHeight`) cuando un campo era largo
(nombre, descripción…), perdiendo información.

**Solución:** tarjeta **desplegable de verdad**, sin alturas fijas:

- **Cabecera siempre visible** con los **campos clave** de cada sección + una flecha
  (chevron) para desplegar. Tocar la cabecera muestra/oculta el resto.
- **Detalle** (resto de campos, incluida la acción "Ver ficha") solo al desplegar.
- Sin `maxHeight` → **nada se corta**; los textos largos parten de línea
  (`overflow-wrap: anywhere`).

**Campos clave por sección** (visibles colapsados): se marcan con `primary: true` en la
definición de columnas de cada vista. Si una vista no marca ninguno, el componente usa
por defecto las dos primeras columnas (excluyendo "Acciones").

| Sección | Campos visibles colapsados |
|---|---|
| Empresas | CIF + Nombre |
| Alumnos | NIA + Nombre |
| Gestión F.E. | NIA + Alumno |
| Ofertas de Trabajo | Título + Empresa |
| Reseñas | Empresa + Calificación (estrellas) |
| Documentos | Nombre + Tipo |

**Archivos tocados:** `src/components/List/ReactTableTanstack.jsx` (separa celdas
primarias de secundarias; `meta.primary` viaja desde la columna; reutiliza el
`toggleRow`/`expandedRows` existente), `ReactTableTanstack.css` (`.card-head`,
`.card-details`, `.card-toggle-icon`, `.card-field` con `overflow-wrap`) y las 6 vistas
de listado (`primary: true` en 2 columnas de cada una).

---

## 7. Fichas de detalle a 2 columnas

Los formularios de detalle (empresa, alumno, profesor…) muestran los campos en **2
columnas en pantallas ≥ 992 px** (clase `detail-form-grid` en `theme-modern.css`). Los
campos de texto largo (textarea) y la valoración por estrellas ocupan el ancho completo.
En móvil se ven en una sola columna.

---

## 8. Revisión final de idiomas (paridad y avisos)

Auditoría completa de los diccionarios y de las cadenas de la app:

- **Paridad de claves**: `es.json` tenía 221 claves frente a 289 de `en/va`. Se
  sincronizaron; ahora los tres tienen **357 claves exactas**.
- **Clave duplicada `"Acciones"`**: aparecía dos veces en los tres JSON; eliminada.
- **Clave muerta `"Open menu"`**: el `aria-label` del botón de menú móvil estaba escrito
  a fuego; se renombró a `"Abrir menú"` y se conectó con `t()` en `Header.jsx` (también
  se traduce para lectores de pantalla).
- **69 mensajes traducidos**: avisos de `showAlert`/`confirmation` de texto fijo
  (documentos, reseñas, aptitudes, contraseñas, ofertas…) que salían en castellano en
  inglés/valenciano. Como esas funciones ya pasan el texto por `i18n.t()`, bastó con
  añadir las claves a los diccionarios (sin tocar código de las vistas).

> *Pendiente opcional:* 5 diálogos de confirmación usan plantillas con número interpolado
> (`` `¿Desea validar ${n} reseñas?` ``); para traducirlos habría que migrarlos a la
> interpolación de i18next (`t('¿Desea validar {{n}} reseñas?', { n })`) en cada vista.

---

## Archivos nuevos creados

```
src/i18n/index.js                       Configuración de i18next
src/i18n/locales/es.json | en.json | va.json   Diccionarios de idioma
src/components/LanguageSelector.jsx     Selector de idioma
src/styles/theme-modern.css             Tema visual completo
src/styles/a11y.css                     Estilos de accesibilidad
src/views/Legal/LegalPage.jsx           Páginas legales (3 en 1)
src/views/Legal/legalPage.css           Estilos de las páginas legales
src/components/CookieBanner.jsx         Banner de cookies
```

## Rollback por bloque

| Bloque | Cómo desactivarlo |
|---|---|
| Legal + cookies | Quitar de `App.jsx` los 2 imports, las 3 rutas y `<CookieBanner />`, y el `<nav className="legal-links">` del Footer |
| Accesibilidad | Quitar `import './styles/a11y.css'` de `App.jsx` y el `skip-link` de `PrivateLayout.jsx` |
| Re-skin visual | Quitar `import './styles/theme-modern.css'` de `App.jsx` (1 línea) |
| Multilenguaje | Quitar `import './i18n'` de `main.jsx` y `<LanguageSelector />` del Header (los `t('...')` devuelven el texto en castellano) |

---

Proyecto académico — IES Hermanos Amorós · 2DAW · Curso 2025-2026.

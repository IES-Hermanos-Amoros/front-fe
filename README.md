# F.E. Manager — Frontend

Aplicación web del proyecto **F.E. Manager**, desarrollada en **React 19 + Vite 7** para gestionar las prácticas en empresa (FCT) del IES Hermanos Amorós.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + Vite 7 |
| UI | Bootstrap 5 + tema personalizado (`theme-modern.css`) |
| Tablas | TanStack React Table v8 |
| Selects | react-select |
| Internacionalización | i18next + react-i18next (ES / EN / VA) |
| Gráficas | Apache ECharts |
| Comunicación en tiempo real | Socket.IO client |
| HTTPS | Certificados locales (Vite proxy) |

---

## Puesta en marcha

### 1. Requisitos previos

- Node.js ≥ 20
- Backend corriendo en `https://localhost:3016`
- Certificados SSL en `certs/` (mismos que el backend)

### 2. Variables de entorno

```bash
# .env  (ya incluye los valores por defecto para desarrollo local)
VITE_API_URL=https://localhost:3016/api/v2
```

### 3. Instalar dependencias y arrancar

```bash
npm install
npm run dev    # Desarrollo — https://localhost:5173
npm run build  # Build de producción → dist/
```

---

## Estructura del proyecto

```
front-fctm-develop/
├── src/
│   ├── components/
│   │   ├── List/
│   │   │   ├── ReactTableTanstack.jsx   # Tabla universal con cards móvil
│   │   │   ├── ReactTableTanstack.css   # Estilos de tabla y columnas
│   │   │   └── ReactTableToolBar.css    # Estilos de la barra de herramientas
│   │   ├── Show/
│   │   │   ├── ShowReadonlyForm.jsx     # Formulario de detalle (solo lectura)
│   │   │   └── ShowEditableForm.jsx     # Formulario de detalle (edición)
│   │   ├── Dashboard/                   # Widgets del panel de control
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── views/
│   │   ├── Companies/                   # Gestión de empresas
│   │   ├── Students/                    # Gestión de alumnado
│   │   ├── Teachers/                    # Gestión de profesorado
│   │   ├── FCT/                         # Gestión de convenios F.E.
│   │   ├── JobOffers/                   # Ofertas de empleo
│   │   ├── Reviews/                     # Valoraciones
│   │   ├── SAOSinc/                     # Sincronización con SAO
│   │   └── Dashboard.jsx
│   ├── i18n/
│   │   ├── i18n.js                      # Configuración i18next
│   │   └── locales/
│   │       ├── es.json                  # Castellano (base)
│   │       ├── en.json                  # Inglés
│   │       └── va.json                  # Valenciano
│   └── styles/
│       └── theme-modern.css             # Tema teal + modo oscuro
├── public/
├── index.html
└── vite.config.js
```

---

## 📋 Registro de cambios respecto a la versión original

> Esta sección documenta **todo lo que se ha añadido o modificado** sobre la base
> que entregó el profesor. Está organizado por áreas. La filosofía de trabajo fue
> **tocar los mínimos archivos y líneas posibles**, sin romper nada de lo que ya
> funcionaba, y mantener siempre los rollbacks sencillos (basta con quitar un import).
>
> Existe además el documento [`MANUAL_MEJORAS.md`](./MANUAL_MEJORAS.md) (en este
> repositorio) con la explicación técnica detallada de cada cambio del frontend.

### Resumen rápido

| Bloque | Qué se hizo |
|--------|------------|
| 🌐 Multilenguaje | App completa traducible a Castellano / Valenciano / Inglés (i18next) |
| 🎨 Rediseño visual | Tema moderno "teal" sobre Bootstrap, sin tocar la lógica |
| ♿ Accesibilidad | Skip-link, foco visible, `prefers-reduced-motion`, `lang` correcto |
| 📄 Legal + cookies | Páginas de Privacidad / Aviso Legal / Cookies + banner de consentimiento |
| 📊 Listados y tablas | Toolbar reordenada, columnas que no se parten, dropdowns visibles |
| 📱 Responsive | Sidebar móvil, tarjetas que ya no cortan el contenido |
| 🗂️ Fichas de detalle | Formularios a 2 columnas en escritorio |
| 📈 Dashboard | Panel demo totalmente traducido (widgets + gráficas) |

---

### 1. 🌐 Multilenguaje (Castellano / Valenciano / Inglés)

La app original estaba **solo en castellano** y con textos escritos directamente en
el código. Ahora es totalmente multiidioma.

- **Librería**: `i18next` + `react-i18next` (configuración en `src/i18n/index.js`).
- **Estrategia "clave = texto en castellano"**: `t('Empresas')` busca esa frase en el
  JSON del idioma activo. Si no encuentra traducción, devuelve la propia frase en
  castellano → **nunca se ve un texto roto ni una clave técnica**.
- **3 diccionarios**: `src/i18n/locales/es.json`, `en.json` y `va.json`.
- **Persistencia**: el idioma se guarda en `localStorage("lang")` y se refleja en el
  atributo `<html lang>`.
- **Selector de idioma**: nuevo componente `LanguageSelector.jsx`, colocado tanto en
  la cabecera como en la pantalla de login.
- **Cobertura**: menú lateral, cabeceras, fichas, formularios, alertas (SweetAlert),
  botones de exportar, paginación de tablas, footer, páginas legales, módulo de
  Sincronización SAO y el dashboard completo.
- **Gráficas ECharts**: los títulos, leyendas, series e indicadores de radar también
  se traducen; las gráficas se reinician al cambiar de idioma para repintarse en el
  idioma nuevo (`useEffect([t])` + `chart.dispose()`).
- **Textos que vienen de la base de datos** (enums, estados): se pasan por `t(valor)`
  añadiendo el valor exacto como clave; si no está, se muestra el original.

### 2. 🎨 Rediseño visual moderno (re-skin sobre Bootstrap)

Se aplicó una capa de estilo nueva **sin modificar la lógica ni el HTML estructural**:
todo vive en `src/styles/theme-modern.css` y se activa/desactiva con un único import.

- **Paleta "teal" profesional** (`#0f766e` en claro / `#14b8a6` en oscuro), definida con
  variables CSS `--tm-*` para poder cambiar todos los colores desde un solo sitio.
- **Tipografía Inter**, tarjetas con borde fino + sombra mínima ("hairline"), botones,
  formularios, dropdowns, tablas y scrollbar reestilizados.
- **Modo claro / oscuro intacto**: los colores se definen también para
  `[data-bs-theme='dark']`, así que el modo oscuro sigue funcionando solo.
- **Marca y sidebar**: logo nuevo (cuadrado teal con icono de birrete + "F.E. Manager"),
  marca movida del header al sidebar, iconos con significado en cada apartado del menú
  (Empresas, Alumnos, Ofertas, Documental, F.E., Reseñas, Sincronización, Validaciones).
- **Sidebar inteligente**: en escritorio se pliega dejando una franja con una pastilla
  teal que "respira"; al pasar el ratón o recibir foco por teclado se despliega como
  capa flotante sin empujar el contenido. En móvil/tablet hay un botón de menú y un
  overlay para cerrarlo.
- **Login profesional**: fondo oscuro con resplandor teal, logo en contenedor redondeado,
  inputs y botón con gradiente, subtítulo institucional.
- **Animaciones suaves** (solo `transform`/`opacity`, respetando `prefers-reduced-motion`):
  entrada escalonada del contenido y aparición de los desplegables.
- **Modo oscuro del sidebar corregido**: usa `#2a3042` (mismo tono que header y tarjetas)
  en lugar del gris-verdoso anterior, que destacaba más claro que el resto.

### 3. ♿ Accesibilidad

- **Enlace "Saltar al contenido principal"** (`skip-link`) que aparece al pulsar `Tab`.
- **Indicador de foco visible** global (`:focus-visible`) para navegación por teclado.
- **Soporte de `prefers-reduced-motion`**: quien tenga las animaciones desactivadas en
  su sistema no las verá.
- **`<html lang="es">`** y `<title>` corregidos (antes `lang="en"`).
- Todo en `src/styles/a11y.css`.

### 4. 📄 Páginas legales + banner de cookies

- **Tres páginas públicas** (visibles sin login): Política de Privacidad, Aviso Legal y
  Política de Cookies (`src/views/Legal/LegalPage.jsx`), con contenido real adaptado a lo
  que hace la app y disponible en los 3 idiomas.
- **Banner de cookies** (`CookieBanner.jsx`): guarda la decisión en
  `localStorage("cookie_consent")` y no vuelve a aparecer.
- **Enlaces en el footer** a las 3 páginas.

### 5. 📊 Listados y tablas (mejoras de la tabla universal)

- **Barra de herramientas reordenada** (`ReactTableToolBar.css`): título, filtros y
  botones de exportación comparten la primera fila; los controles de **edición masiva**
  caen a su propia fila cuando aparecen, en lugar de apelotonarse.
- **Botones de exportación discretos** (borde fino + punto de color verde/rojo) y botón
  de "limpiar filtros" en estilo fantasma.
- **Columnas que ya no se parten en dos líneas**: CIF (Empresas), NIA y Localidad
  (Alumnado) y NIA en Gestión F.E. Se logró añadiendo una clase `col-<columna>` a cada
  celda y una regla `white-space: nowrap` específica.
- **Tablas anchas domadas**: cabeceras en una línea, zebra sutil para seguir filas
  largas, textos muy largos que parten en vez de provocar scroll horizontal, chips/badges
  más sobrios.

### 6. 🐛 Bug corregido: dropdowns de edición masiva ocultos

Al seleccionar varias filas aparecían los desplegables de actualización masiva
(`react-select`), pero **sus opciones quedaban tapadas por la tabla**. El menú sí existía
en el DOM, pero un contexto de apilamiento (`z-index`) lo pintaba por debajo.

**Solución (mínima, 3 líneas)**: añadir `menuPortalTarget={document.body}` a los selectores
de Empresas y Alumnado, para que el menú se renderice en un portal directamente sobre el
`<body>` y escape del apilamiento de la tabla. No se añadió ninguna librería.

### 7. 📱 Responsive y tarjetas móviles desplegables

- **Punto de corte unificado** a `992 px` (antes mezclaba 768 y 992 según el sitio).
- **Tarjetas desplegables**: en móvil, cada tarjeta muestra colapsada solo los **campos
  clave** de su sección y, al tocarla (chevron), despliega el resto. Antes la versión
  original recortaba el contenido con una altura fija (`maxHeight`) cuando un campo era
  largo; ahora **no se corta nada** y los textos largos parten de línea
  (`overflow-wrap`). Campos clave por sección:

  | Sección | Colapsado |
  |---|---|
  | Empresas | CIF + Nombre |
  | Alumnos | NIA + Nombre |
  | Gestión F.E. | NIA + Alumno |
  | Ofertas | Título + Empresa |
  | Reseñas | Empresa + Calificación (estrellas) |
  | Documentos | Nombre + Tipo |

  Se marcan con `primary: true` en las columnas de cada vista; el detalle (resto de
  campos + "Ver ficha") aparece al desplegar.
- **Media query actualizada** en `ReactTableTanstack.css` (de `767.98px` a `991.98px`).

### 8. 🗂️ Fichas de detalle a 2 columnas

Los formularios de detalle (empresa, alumno, profesor…) muestran los campos en
**2 columnas en pantallas ≥ 992 px** (clase `detail-form-grid`). Los campos de texto largo
(textarea) y la valoración por estrellas ocupan el ancho completo. En móvil se ven en una
sola columna, como antes.

### 9. 📈 Dashboard demo traducido por completo

El panel de control de demostración venía con todos sus textos en inglés (era una plantilla).
Se tradujeron **todos los widgets** (Informes, Ventas recientes, Tráfico web, Más vendidos,
Noticias, Informe de presupuesto), sus filtros ("Hoy / Este mes / Este año") y el contenido
de las gráficas, en los 3 idiomas.

---

### Archivos nuevos y modificados

**Archivos nuevos creados:**

```
src/i18n/index.js                       Configuración de i18next
src/i18n/locales/es.json                Diccionario castellano
src/i18n/locales/en.json                Diccionario inglés
src/i18n/locales/va.json                Diccionario valenciano
src/components/LanguageSelector.jsx     Selector de idioma
src/styles/theme-modern.css             Tema visual completo
src/styles/a11y.css                     Estilos de accesibilidad
src/views/Legal/LegalPage.jsx           Páginas legales (3 en 1)
src/views/Legal/legalPage.css           Estilos de las páginas legales
src/components/CookieBanner.jsx         Banner de cookies
```

**Principales archivos modificados:**

```
index.html                              lang="es" + título institucional
src/main.jsx                            Carga de i18n
src/App.jsx                             Imports de tema/a11y, rutas legales, banner
src/components/Header.jsx               Selector de idioma + botón de menú móvil
src/components/Footer.jsx               Enlaces legales + textos traducibles
src/components/SideBar.jsx              Marca, iconos y overlay móvil
src/components/Logo.jsx                 Nueva marca gráfica
src/layouts/PrivateLayout.jsx          Skip-link de accesibilidad
src/components/List/ReactTableTanstack.jsx   Clases por columna, breakpoint, tarjetas
src/components/List/ReactTableTanstack.css   nowrap por columna, media query
src/components/List/ReactTableToolBar.jsx    Traducción de toolbar y export
src/components/List/ReactTableToolBar.css    Reordenado y responsive
src/components/Show/ShowEditableForm.jsx     Traducción + grid 2 columnas
src/components/Show/ShowReadonlyForm.jsx     Traducción + grid 2 columnas
src/components/Show/ShowHeader.jsx           Traducción de cabecera de ficha
src/utils/functions.js                  Traducción central de alertas, chips sobrios
src/views/Companies/ListCompanies.jsx   i18n + dropdown portal
src/views/Students/ListStudents.jsx     i18n + dropdown portal
src/views/SAOSinc/ListSaoSync.jsx       i18n del módulo de sincronización
src/components/Dashboard.jsx + widgets  Dashboard traducido
src/components/Charts/*.jsx             Títulos de gráficas traducibles
```

> Los archivos con sufijo `OLD_` o `_KO` son versiones antiguas conservadas como
> referencia; no se usan en la app.

---

## Idiomas disponibles

| Código | Idioma | Estado |
|--------|--------|--------|
| `es` | Castellano | Completo (idioma base) |
| `en` | Inglés | Completo |
| `va` | Valenciano | Completo |

El selector de idioma está en la barra de navegación superior. El idioma se persiste en `localStorage`.

---

## Notas de desarrollo

- El tema visual está centralizado en `src/styles/theme-modern.css`. Para cambiar colores globales modificar las variables CSS `--tm-*`.
- Las tablas usan `sessionStorage` para persistir filtros y paginación entre navegaciones.
- En desarrollo, Vite proxifica las peticiones a la API para evitar problemas CORS.

---

## Licencia

Proyecto académico — IES Hermanos Amorós · 2DAW · Curso 2025-2026.

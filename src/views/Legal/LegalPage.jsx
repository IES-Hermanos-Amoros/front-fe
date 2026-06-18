import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './legalPage.css'

// Contenido de las tres páginas legales en los tres idiomas de la app.
// Se selecciona por i18n.language con fallback a castellano. El contenido
// refleja la finalidad real de la aplicación (F.E. Manager: gestión de la
// Formación en Empresa / FCT del IES Hermanos Amorós, sincronizada con SAO).

const TABLA_COOKIES = {
    es: {
        cols: ['Nombre', 'Tipo', 'Finalidad', 'Duración'],
        rows: [
            ['jwt', 'Técnica (httpOnly)', 'Mantener la sesión iniciada de forma segura', '1 hora'],
            ['SAOtoken', 'Técnica (httpOnly)', 'Sincronización con la plataforma SAO de la GVA', 'Sesión']
        ],
        colsLocal: ['Clave', 'Finalidad'],
        rowsLocal: [
            ['theme', 'Recordar el modo claro/oscuro elegido'],
            ['lang', 'Recordar el idioma seleccionado'],
            ['a11y_*', 'Recordar las preferencias de accesibilidad (zoom, contraste, etc.)'],
            ['cookie_consent', 'Recordar su decisión sobre este aviso de cookies']
        ]
    },
    en: {
        cols: ['Name', 'Type', 'Purpose', 'Duration'],
        rows: [
            ['jwt', 'Technical (httpOnly)', 'Keep your session securely signed in', '1 hour'],
            ['SAOtoken', 'Technical (httpOnly)', 'Synchronization with the GVA SAO platform', 'Session']
        ],
        colsLocal: ['Key', 'Purpose'],
        rowsLocal: [
            ['theme', 'Remember the chosen light/dark mode'],
            ['lang', 'Remember the selected language'],
            ['a11y_*', 'Remember accessibility preferences (zoom, contrast, etc.)'],
            ['cookie_consent', 'Remember your decision about this cookie notice']
        ]
    },
    va: {
        cols: ['Nom', 'Tipus', 'Finalitat', 'Duració'],
        rows: [
            ['jwt', 'Tècnica (httpOnly)', 'Mantindre la sessió iniciada de forma segura', '1 hora'],
            ['SAOtoken', 'Tècnica (httpOnly)', 'Sincronització amb la plataforma SAO de la GVA', 'Sessió']
        ],
        colsLocal: ['Clau', 'Finalitat'],
        rowsLocal: [
            ['theme', 'Recordar el mode clar/fosc triat'],
            ['lang', "Recordar l'idioma seleccionat"],
            ['a11y_*', "Recordar les preferències d'accessibilitat (zoom, contrast, etc.)"],
            ['cookie_consent', 'Recordar la seua decisió sobre este avís de cookies']
        ]
    }
}

const CookieTable = ({ cols, rows }) => (
    <div className="table-responsive">
        <table className="table table-bordered legal-table">
            <thead>
                <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i}>
                        {r.map((celda, j) => (
                            <td key={j}>{j === 0 ? <code>{celda}</code> : celda}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)

const CONTENIDOS = {
    es: {
        privacidad: {
            titulo: 'Política de Privacidad',
            icono: 'bi bi-shield-lock',
            cuerpo: (
                <>
                    <h2>1. Responsable del tratamiento</h2>
                    <p>El responsable del tratamiento de los datos personales recogidos en esta plataforma es el <strong>IES Hermanos Amorós</strong> (Villena, Alicante), centro educativo dependiente de la Conselleria de Educación de la Generalitat Valenciana.</p>
                    <h2>2. Finalidad del tratamiento</h2>
                    <p><strong>F.E. Manager</strong> es una aplicación de gestión de la Formación en Empresa (F.E. / FCT). Los datos se tratan exclusivamente para:</p>
                    <ul>
                        <li>Gestionar las prácticas formativas del alumnado en empresas colaboradoras.</li>
                        <li>Coordinar al profesorado tutor y a los administradores del centro.</li>
                        <li>Gestionar ofertas de trabajo, reseñas y documentación asociada a las prácticas.</li>
                        <li>Sincronizar la información con la plataforma oficial SAO de la Generalitat Valenciana (foremp.edu.gva.es).</li>
                    </ul>
                    <h2>3. Datos tratados</h2>
                    <ul>
                        <li><strong>Alumnado:</strong> datos identificativos, académicos y de contacto necesarios para la gestión de las prácticas.</li>
                        <li><strong>Profesorado y administradores:</strong> datos identificativos y de contacto profesional.</li>
                        <li><strong>Empresas:</strong> datos identificativos, de contacto y de las plazas formativas ofertadas.</li>
                        <li><strong>Documentos:</strong> ficheros subidos a la plataforma relacionados con la gestión de las prácticas.</li>
                    </ul>
                    <h2>4. Base jurídica</h2>
                    <p>El tratamiento se basa en el cumplimiento de una misión realizada en interés público en el ámbito educativo (art. 6.1.e RGPD) y, cuando proceda, en el consentimiento de la persona interesada (art. 6.1.a RGPD).</p>
                    <h2>5. Destinatarios</h2>
                    <p>Los datos pueden comunicarse a la Conselleria de Educación a través de la plataforma SAO. No se realizan otras cesiones a terceros ni transferencias internacionales de datos.</p>
                    <h2>6. Conservación</h2>
                    <p>Los datos se conservarán durante el curso académico vigente y los plazos exigidos por la normativa educativa y administrativa aplicable.</p>
                    <h2>7. Derechos</h2>
                    <p>Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad dirigiéndose a la secretaría del IES Hermanos Amorós, así como presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
                </>
            )
        },
        'aviso-legal': {
            titulo: 'Aviso Legal',
            icono: 'bi bi-file-earmark-text',
            cuerpo: (
                <>
                    <h2>1. Titularidad</h2>
                    <p>Esta plataforma, <strong>F.E. Manager</strong>, es titularidad del <strong>IES Hermanos Amorós</strong> (Villena, Alicante), que la pone a disposición de su comunidad educativa (alumnado, profesorado, administradores y empresas colaboradoras) para la gestión de la Formación en Empresa (F.E. / FCT).</p>
                    <h2>2. Condiciones de uso</h2>
                    <ul>
                        <li>El acceso requiere credenciales personales e intransferibles. El usuario es responsable de su custodia.</li>
                        <li>La plataforma debe utilizarse únicamente para las finalidades educativas y de gestión descritas.</li>
                        <li>Queda prohibido introducir contenidos ilícitos, ofensivos o que vulneren derechos de terceros, así como cualquier intento de acceso no autorizado.</li>
                    </ul>
                    <h2>3. Propiedad intelectual</h2>
                    <p>Los contenidos, logotipos y código de la plataforma pertenecen al centro o a sus legítimos titulares. Los documentos subidos por los usuarios siguen siendo propiedad de sus autores, que conceden al centro el derecho de uso necesario para la gestión de las prácticas.</p>
                    <h2>4. Responsabilidad</h2>
                    <p>El centro no se hace responsable del mal uso de la plataforma ni de los contenidos introducidos por los usuarios. La información mostrada procedente del SAO tiene carácter informativo; los datos oficiales son los que constan en la plataforma de la Conselleria.</p>
                    <h2>5. Legislación aplicable</h2>
                    <p>Estas condiciones se rigen por la legislación española. Cualquier controversia se someterá a los juzgados y tribunales competentes.</p>
                </>
            )
        },
        cookies: {
            titulo: 'Política de Cookies',
            icono: 'bi bi-cookie',
            cuerpo: (
                <>
                    <h2>1. ¿Qué son las cookies?</h2>
                    <p>Las cookies son pequeños ficheros que el navegador almacena al utilizar una web. Esta plataforma utiliza únicamente <strong>cookies técnicas</strong>, imprescindibles para su funcionamiento, y almacenamiento local para recordar sus preferencias. <strong>No se utilizan cookies publicitarias, de análisis ni de terceros.</strong></p>
                    <h2>2. Cookies utilizadas</h2>
                    <CookieTable cols={TABLA_COOKIES.es.cols} rows={TABLA_COOKIES.es.rows} />
                    <h2>3. Almacenamiento local (localStorage)</h2>
                    <CookieTable cols={TABLA_COOKIES.es.colsLocal} rows={TABLA_COOKIES.es.rowsLocal} />
                    <h2>4. Gestión de cookies</h2>
                    <p>Las cookies técnicas no requieren consentimiento, ya que sin ellas la plataforma no puede funcionar (no es posible iniciar sesión). Puede eliminarlas o bloquearlas desde la configuración de su navegador, si bien en tal caso no podrá utilizar la aplicación.</p>
                </>
            )
        }
    },

    en: {
        privacidad: {
            titulo: 'Privacy Policy',
            icono: 'bi bi-shield-lock',
            cuerpo: (
                <>
                    <h2>1. Data controller</h2>
                    <p>The controller of the personal data collected on this platform is <strong>IES Hermanos Amorós</strong> (Villena, Alicante), a public school under the Department of Education of the Generalitat Valenciana.</p>
                    <h2>2. Purpose of processing</h2>
                    <p><strong>F.E. Manager</strong> is an application for managing Work Placements (F.E. / FCT). Data is processed exclusively to:</p>
                    <ul>
                        <li>Manage student work placements in partner companies.</li>
                        <li>Coordinate tutoring teachers and school administrators.</li>
                        <li>Manage job offers, reviews and documentation related to placements.</li>
                        <li>Synchronize information with the official SAO platform of the Generalitat Valenciana (foremp.edu.gva.es).</li>
                    </ul>
                    <h2>3. Data processed</h2>
                    <ul>
                        <li><strong>Students:</strong> identification, academic and contact data required to manage placements.</li>
                        <li><strong>Teachers and administrators:</strong> identification and professional contact data.</li>
                        <li><strong>Companies:</strong> identification and contact data, and details of the placements offered.</li>
                        <li><strong>Documents:</strong> files uploaded to the platform related to placement management.</li>
                    </ul>
                    <h2>4. Legal basis</h2>
                    <p>Processing is based on the performance of a task carried out in the public interest in the educational field (art. 6.1.e GDPR) and, where applicable, on the consent of the data subject (art. 6.1.a GDPR).</p>
                    <h2>5. Recipients</h2>
                    <p>Data may be communicated to the Department of Education through the SAO platform. No other transfers to third parties or international data transfers take place.</p>
                    <h2>6. Retention</h2>
                    <p>Data is kept for the current academic year and for the periods required by applicable educational and administrative regulations.</p>
                    <h2>7. Rights</h2>
                    <p>You may exercise your rights of access, rectification, erasure, objection, restriction and portability by contacting the IES Hermanos Amorós administration office, and you may file a complaint with the Spanish Data Protection Agency (www.aepd.es).</p>
                </>
            )
        },
        'aviso-legal': {
            titulo: 'Legal Notice',
            icono: 'bi bi-file-earmark-text',
            cuerpo: (
                <>
                    <h2>1. Ownership</h2>
                    <p>This platform, <strong>F.E. Manager</strong>, is owned by <strong>IES Hermanos Amorós</strong> (Villena, Alicante), which makes it available to its educational community (students, teachers, administrators and partner companies) for the management of Work Placements (F.E. / FCT).</p>
                    <h2>2. Terms of use</h2>
                    <ul>
                        <li>Access requires personal, non-transferable credentials. Users are responsible for keeping them safe.</li>
                        <li>The platform must be used solely for the educational and management purposes described.</li>
                        <li>It is forbidden to upload unlawful or offensive content or content that infringes third-party rights, as well as any attempt of unauthorized access.</li>
                    </ul>
                    <h2>3. Intellectual property</h2>
                    <p>The contents, logos and code of the platform belong to the school or their rightful owners. Documents uploaded by users remain the property of their authors, who grant the school the right of use needed to manage the placements.</p>
                    <h2>4. Liability</h2>
                    <p>The school is not responsible for misuse of the platform or for content uploaded by users. Information displayed from SAO is for information purposes; official data is the data held on the Department of Education platform.</p>
                    <h2>5. Applicable law</h2>
                    <p>These terms are governed by Spanish law. Any dispute will be submitted to the competent courts.</p>
                </>
            )
        },
        cookies: {
            titulo: 'Cookie Policy',
            icono: 'bi bi-cookie',
            cuerpo: (
                <>
                    <h2>1. What are cookies?</h2>
                    <p>Cookies are small files stored by your browser when you use a website. This platform only uses <strong>technical cookies</strong>, essential for it to work, and local storage to remember your preferences. <strong>No advertising, analytics or third-party cookies are used.</strong></p>
                    <h2>2. Cookies used</h2>
                    <CookieTable cols={TABLA_COOKIES.en.cols} rows={TABLA_COOKIES.en.rows} />
                    <h2>3. Local storage</h2>
                    <CookieTable cols={TABLA_COOKIES.en.colsLocal} rows={TABLA_COOKIES.en.rowsLocal} />
                    <h2>4. Managing cookies</h2>
                    <p>Technical cookies do not require consent, since the platform cannot work without them (signing in would not be possible). You can delete or block them in your browser settings, although in that case you will not be able to use the application.</p>
                </>
            )
        }
    },

    va: {
        privacidad: {
            titulo: 'Política de Privacitat',
            icono: 'bi bi-shield-lock',
            cuerpo: (
                <>
                    <h2>1. Responsable del tractament</h2>
                    <p>El responsable del tractament de les dades personals recollides en esta plataforma és l'<strong>IES Hermanos Amorós</strong> (Villena, Alacant), centre educatiu dependent de la Conselleria d'Educació de la Generalitat Valenciana.</p>
                    <h2>2. Finalitat del tractament</h2>
                    <p><strong>F.E. Manager</strong> és una aplicació de gestió de la Formació en Empresa (F.E. / FCT). Les dades es tracten exclusivament per a:</p>
                    <ul>
                        <li>Gestionar les pràctiques formatives de l'alumnat en empreses col·laboradores.</li>
                        <li>Coordinar el professorat tutor i els administradors del centre.</li>
                        <li>Gestionar ofertes de treball, ressenyes i documentació associada a les pràctiques.</li>
                        <li>Sincronitzar la informació amb la plataforma oficial SAO de la Generalitat Valenciana (foremp.edu.gva.es).</li>
                    </ul>
                    <h2>3. Dades tractades</h2>
                    <ul>
                        <li><strong>Alumnat:</strong> dades identificatives, acadèmiques i de contacte necessàries per a la gestió de les pràctiques.</li>
                        <li><strong>Professorat i administradors:</strong> dades identificatives i de contacte professional.</li>
                        <li><strong>Empreses:</strong> dades identificatives, de contacte i de les places formatives oferides.</li>
                        <li><strong>Documents:</strong> fitxers pujats a la plataforma relacionats amb la gestió de les pràctiques.</li>
                    </ul>
                    <h2>4. Base jurídica</h2>
                    <p>El tractament es basa en el compliment d'una missió realitzada en interés públic en l'àmbit educatiu (art. 6.1.e RGPD) i, quan corresponga, en el consentiment de la persona interessada (art. 6.1.a RGPD).</p>
                    <h2>5. Destinataris</h2>
                    <p>Les dades poden comunicar-se a la Conselleria d'Educació a través de la plataforma SAO. No es realitzen altres cessions a tercers ni transferències internacionals de dades.</p>
                    <h2>6. Conservació</h2>
                    <p>Les dades es conservaran durant el curs acadèmic vigent i els terminis exigits per la normativa educativa i administrativa aplicable.</p>
                    <h2>7. Drets</h2>
                    <p>Pot exercir els seus drets d'accés, rectificació, supressió, oposició, limitació i portabilitat dirigint-se a la secretaria de l'IES Hermanos Amorós, així com presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (www.aepd.es).</p>
                </>
            )
        },
        'aviso-legal': {
            titulo: 'Avís Legal',
            icono: 'bi bi-file-earmark-text',
            cuerpo: (
                <>
                    <h2>1. Titularitat</h2>
                    <p>Esta plataforma, <strong>F.E. Manager</strong>, és titularitat de l'<strong>IES Hermanos Amorós</strong> (Villena, Alacant), que la posa a disposició de la seua comunitat educativa (alumnat, professorat, administradors i empreses col·laboradores) per a la gestió de la Formació en Empresa (F.E. / FCT).</p>
                    <h2>2. Condicions d'ús</h2>
                    <ul>
                        <li>L'accés requerix credencials personals i intransferibles. L'usuari és responsable de la seua custòdia.</li>
                        <li>La plataforma ha d'utilitzar-se únicament per a les finalitats educatives i de gestió descrites.</li>
                        <li>Queda prohibit introduir continguts il·lícits, ofensius o que vulneren drets de tercers, així com qualsevol intent d'accés no autoritzat.</li>
                    </ul>
                    <h2>3. Propietat intel·lectual</h2>
                    <p>Els continguts, logotips i codi de la plataforma pertanyen al centre o als seus legítims titulars. Els documents pujats pels usuaris continuen sent propietat dels seus autors, que concedixen al centre el dret d'ús necessari per a la gestió de les pràctiques.</p>
                    <h2>4. Responsabilitat</h2>
                    <p>El centre no es fa responsable del mal ús de la plataforma ni dels continguts introduïts pels usuaris. La informació mostrada procedent del SAO té caràcter informatiu; les dades oficials són les que consten en la plataforma de la Conselleria.</p>
                    <h2>5. Legislació aplicable</h2>
                    <p>Estes condicions es regixen per la legislació espanyola. Qualsevol controvèrsia se sotmetrà als jutjats i tribunals competents.</p>
                </>
            )
        },
        cookies: {
            titulo: 'Política de Cookies',
            icono: 'bi bi-cookie',
            cuerpo: (
                <>
                    <h2>1. Què són les cookies?</h2>
                    <p>Les cookies són xicotets fitxers que el navegador emmagatzema quan s'utilitza una web. Esta plataforma utilitza únicament <strong>cookies tècniques</strong>, imprescindibles per al seu funcionament, i emmagatzematge local per a recordar les seues preferències. <strong>No s'utilitzen cookies publicitàries, d'anàlisi ni de tercers.</strong></p>
                    <h2>2. Cookies utilitzades</h2>
                    <CookieTable cols={TABLA_COOKIES.va.cols} rows={TABLA_COOKIES.va.rows} />
                    <h2>3. Emmagatzematge local</h2>
                    <CookieTable cols={TABLA_COOKIES.va.colsLocal} rows={TABLA_COOKIES.va.rowsLocal} />
                    <h2>4. Gestió de cookies</h2>
                    <p>Les cookies tècniques no requerixen consentiment, ja que sense elles la plataforma no pot funcionar (no és possible iniciar sessió). Pot eliminar-les o bloquejar-les des de la configuració del seu navegador, si bé en eixe cas no podrà utilitzar l'aplicació.</p>
                </>
            )
        }
    }
}

function LegalPage({ tipo }) {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()

    // Contenido en el idioma activo, con fallback a castellano
    const lang = CONTENIDOS[i18n.language] ? i18n.language : 'es'
    const contenido = CONTENIDOS[lang][tipo] || CONTENIDOS[lang]['aviso-legal']

    // Al entrar directamente por URL no se monta el Header (y con él DarkMode),
    // así que aplicamos aquí el tema guardado para respetar claro/oscuro.
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
        document.querySelector('body').setAttribute('data-bs-theme', savedTheme)
    }, [])

    return (
        <div className="legal-wrapper">
            <div className="card legal-card">
                <div className="legal-header">
                    <i className={`${contenido.icono} legal-icon`} aria-hidden="true"></i>
                    <h1>{contenido.titulo}</h1>
                    <p className="legal-subtitle">F.E. Manager — IES Hermanos Amorós</p>
                </div>

                <div className="legal-body">
                    {contenido.cuerpo}
                </div>

                <div className="legal-footer">
                    <nav className="legal-nav" aria-label={t('Aviso Legal')}>
                        <Link to="/legal/privacidad">{t('Política de Privacidad')}</Link>
                        <Link to="/legal/aviso-legal">{t('Aviso Legal')}</Link>
                        <Link to="/legal/cookies">{t('Política de Cookies')}</Link>
                    </nav>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate(-1)}
                    >
                        <i className="bi bi-arrow-left" aria-hidden="true"></i> {t('Volver')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LegalPage

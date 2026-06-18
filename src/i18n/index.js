import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import es from './locales/es.json'
import en from './locales/en.json'
import va from './locales/va.json'

// Estrategia "clave = texto en castellano": si una clave no está traducida,
// i18next devuelve la propia clave, por lo que la app nunca muestra textos
// rotos y se puede traducir de forma incremental.
i18n
    .use(initReactI18next)
    .init({
        resources: {
            es: { translation: es },
            en: { translation: en },
            va: { translation: va }
        },
        lng: localStorage.getItem('lang') || 'es',
        fallbackLng: 'es',
        // Las claves son frases con puntos y espacios ("Gestión F.E.")
        keySeparator: false,
        nsSeparator: false,
        interpolation: { escapeValue: false }
    })

document.documentElement.lang = i18n.language

i18n.on('languageChanged', (lng) => {
    try {
        localStorage.setItem('lang', lng)
    } catch {}
    document.documentElement.lang = lng
})

export default i18n

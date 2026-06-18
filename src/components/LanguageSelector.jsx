import React from 'react'
import { useTranslation } from 'react-i18next'

const IDIOMAS = [
    { code: 'es', label: 'Castellano' },
    { code: 'va', label: 'Valencià' },
    { code: 'en', label: 'English' }
]

function LanguageSelector() {
    const { t, i18n } = useTranslation()
    const current = i18n.language || 'es'

    return (
        <div className="dropdown language-selector ms-2">
            <button
                className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
                type="button"
                data-bs-toggle="dropdown"
                aria-label={t('Seleccionar idioma')}
            >
                <i className="bi bi-translate" aria-hidden="true"></i>
                <span className="text-uppercase">{current}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
                {IDIOMAS.map(({ code, label }) => (
                    <li key={code}>
                        <button
                            type="button"
                            className={`dropdown-item${current === code ? ' active' : ''}`}
                            onClick={() => i18n.changeLanguage(code)}
                        >
                            {label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default LanguageSelector

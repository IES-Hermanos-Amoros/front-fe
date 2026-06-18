import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Banner de consentimiento de cookies. La app solo usa cookies técnicas
// (jwt, SAOtoken) y localStorage de preferencias, por lo que el banner es
// informativo: ambas opciones registran la decisión en localStorage.
function CookieBanner() {
    const { t } = useTranslation()
    const [consent, setConsent] = useState(() => {
        try {
            return localStorage.getItem('cookie_consent')
        } catch {
            return null
        }
    })

    if (consent) return null

    const decide = (value) => {
        try {
            localStorage.setItem('cookie_consent', value)
        } catch {}
        setConsent(value)
    }

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label={t('Política de Cookies')}
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                borderTop: '1px solid var(--bs-border-color)',
                boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.12)',
                padding: '1rem 1.5rem'
            }}
        >
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-3">
                <i className="bi bi-cookie fs-4" aria-hidden="true" style={{ color: 'var(--second)' }}></i>
                <p className="m-0" style={{ maxWidth: '640px', fontSize: '0.9rem' }}>
                    {t('Este sitio utiliza cookies técnicas imprescindibles para su funcionamiento y almacenamiento local para recordar sus preferencias.')}{' '}
                    <Link to="/legal/cookies" style={{ color: 'var(--second)' }}>
                        {t('Más información')}
                    </Link>
                </p>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => decide('rejected')}
                    >
                        {t('Rechazar')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => decide('accepted')}
                    >
                        {t('Aceptar')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CookieBanner

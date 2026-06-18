import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './footer.css';

function Footer() {
    const { t } = useTranslation()

    return (
        <footer id="footer" className="footer">
            <div className="copyright">
                &copy; Copyright{''}
                <strong>
                    <span> IES Hermanos Amorós</span>
                </strong>
                . {t('Todos los derechos reservados')}
            </div>
            <div className="credits">
                {t('Diseñado por')} <a href="#">HA</a>
            </div>
            <nav className="legal-links" aria-label={t('Aviso Legal')}>
                <Link to="/legal/privacidad">{t('Política de Privacidad')}</Link>
                <span aria-hidden="true"> · </span>
                <Link to="/legal/aviso-legal">{t('Aviso Legal')}</Link>
                <span aria-hidden="true"> · </span>
                <Link to="/legal/cookies">{t('Política de Cookies')}</Link>
            </nav>
        </footer>
    );
}

export default Footer;
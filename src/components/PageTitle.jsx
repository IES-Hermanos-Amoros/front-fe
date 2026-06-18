import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './pageTitle.css'

function PageTitle({ page }) {
  const { t } = useTranslation()

  return (
    <div className="pagetitle">
        <h1>{page}</h1>
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
            <li className="breadcrumb-item">
                <Link to="/dashboard" aria-label={t('Inicio')}>
                <i className="bi bi-house-door"></i>
                </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">{page}</li>
            </ol>
        </nav>
    </div>
  );
}

export default PageTitle
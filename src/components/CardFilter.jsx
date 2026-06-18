import React from 'react'
import { useTranslation } from 'react-i18next';

function CardFilter({ filterChange }) {
  const { t } = useTranslation();
  return (
    <div className="filter">
      <a className="icon" href="#" data-bs-toggle="dropdown">
        <i className="bi bi-three-dots"></i>
      </a>
      <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
        <li className="dropdown-header text-start">
          <h6>{t('Filtrar')}</h6>
        </li>
        <li>
          <a className="dropdown-item" onClick={() => filterChange('Hoy')}>
            {t('Hoy')}
          </a>
        </li>
        <li>
          <a
            className="dropdown-item"
            onClick={() => filterChange('Este mes')}
          >
            {t('Este mes')}
          </a>
        </li>
        <li>
          <a
            className="dropdown-item"
            onClick={() => filterChange('Este año')}
          >
            {t('Este año')}
          </a>
        </li>
      </ul>
    </div>
  )
}

export default CardFilter
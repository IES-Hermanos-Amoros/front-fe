import React from 'react'
import { useTranslation } from 'react-i18next'
import './header.css'
import SearchBar from './SearchBar'
import Nav from './Nav'
import DarkMode from './DarkMode/DarkMode'
import AccessibilityControl from "./AccesibilityControl";
import LanguageSelector from './LanguageSelector'

function Header() {
  const { t } = useTranslation()

  const toggleMobileSidebar = () => {
    document.body.classList.toggle('sidebar-mobile-open');
  };

  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      {/* Botón menú solo visible en móvil/tablet (<1200px) */}
      <button
        className="d-xl-none tm-mobile-menu-btn"
        onClick={toggleMobileSidebar}
        aria-label={t('Abrir menú')}
      >
        <i className="bi bi-list"></i>
      </button>
      {/* {nav} */}
      <Nav />
      {/* {idioma} */}
      <LanguageSelector />
      {/* {dark mode} */}
      <DarkMode />
      <AccessibilityControl />
    </header>
  )
}

export default Header
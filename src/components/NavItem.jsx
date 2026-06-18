import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'


function NavItem({nav}) {
  const { t } = useTranslation()

  return (
    <li className='nav-item'>
      <NavLink
        to={nav.path}
        className={({ isActive }) =>
          isActive ? 'nav-link' : 'nav-link collapsed'
        }
      >
        <i className={nav.icon}></i>
        <span>{t(nav.name)}</span>
      </NavLink>
    </li>
  )
}

export default NavItem
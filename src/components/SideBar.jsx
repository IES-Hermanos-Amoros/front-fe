import React from 'react';
import './sideBar.css';
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import navList from '../data/navItem';
import NavItem from './NavItem';
import Logo from './Logo';
import useUserStore from '../store/userStore'; // Importamos el store

function SideBar() {

    const { t } = useTranslation();
    const user = useUserStore(state => state.user);
    const userRole = user?.user?.profile;
    //console.log("USER ROLE: ", userRole)
    // --- LÓGICA DE FILTRADO DEL MENÚ PRINCIPAL ---
    const filteredNavList = navList.filter(nav => {
        
        // Si el rol es EMPRESA, definimos qué rutas NO puede ver
        if (userRole === 'EMPRESA') {
            const forbiddenPaths = ['/companies','/joboffers','/reviews']; 
            return !forbiddenPaths.includes(nav.path);
        }

        // Si el rol es ALUMNO, definimos qué rutas NO puede ver
        if (userRole === 'ALUMNO') {
            const forbiddenPaths = ['/students'];
            return !forbiddenPaths.includes(nav.path);
        }

        // El ADMINISTRADOR y PROFESOR ven todo por defecto (true)
        return true;
    });

const closeMobileSidebar = () => document.body.classList.remove('sidebar-mobile-open');

return (
    <>
    <div className="tm-sidebar-overlay" onClick={closeMobileSidebar} />
    <aside id="sidebar" className="sidebar">
        {/* Marca de la app (antes en el Header) */}
        <div className="sidebar-brand">
            <Logo />
        </div>
        <ul className="sidebar-nav" id="sidebar-nav">
            {/*<li className="nav-item">
                <a className="nav-link" href="/">
                    <i className="bi bi-grid"></i>
                    <span>Panel de Control</span>
                </a>
            </li>*/}

            <li className='nav-heading'>F.E. Manager</li>

                {/* Renderizamos solo lo permitido */}
                {filteredNavList.map(nav => (
                <NavItem key={nav._id} nav={nav}/>
                ))}

                {/*navList.map(nav=>(
                    <NavItem key={nav._id} nav={nav}/>
                ))*/}

            {/* 🛡️ SECCIÓN RESTRINGIDA: Solo ADMINISTRADOR */}
            {userRole === 'ADMINISTRADOR' && (
            <>

            <li className='nav-heading'>{t('Administración')}</li>
            <li className="nav-item">
                <a
                    className="nav-link collapsed"
                    data-bs-target="#components-nav"
                    data-bs-toggle="collapse"
                    href="#"
                >
                    <i className="bi bi-arrow-repeat"></i>
                    <span>{t('Sincronización con SAO')}</span>
                    <i className="bi bi-chevron-down ms-auto"></i>
                </a>

                <ul
                    id="components-nav"
                    className="nav-content collapse"
                    data-bs-parent="#sidebar-nav"
                >
                    <li>                       
                        <NavLink
                                to="/sinc/profesores">
                                
                            <i className="bi bi-circle"></i>
                            <span>{t('Admin/Profesorado')}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sinc/alumnos">
                            <i className="bi bi-circle"></i>
                            <span>{t('Alumnado')}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sinc/empresas">
                            <i className="bi bi-circle"></i>
                            <span>{t('Empresas')}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sinc/fcts">
                            <i className="bi bi-circle"></i>
                            <span>{t('Gestión F.E.')}</span>
                        </NavLink>
                    </li>
                </ul>
            </li>
            <li className="nav-item">
                <a
                    className="nav-link collapsed"
                    data-bs-target="#components-nav-validations"
                    data-bs-toggle="collapse"
                    href="#"
                >
                    <i className="bi bi-patch-check"></i>
                    <span>{t('Validaciones')}</span>
                    <i className="bi bi-chevron-down ms-auto"></i>
                </a>

                <ul
                    id="components-nav-validations"
                    className="nav-content collapse"
                    data-bs-parent="#sidebar-nav"
                >
                    <li>                       
                        <NavLink
                                to="/administrators/validate/reviews">
                                
                            <i className="bi bi-circle"></i>
                            <span>{t('Reseñas')}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/administrators/validate/skills">
                            <i className="bi bi-circle"></i>
                            <span>{t('Aptitudes')}</span>
                        </NavLink>
                    </li>
                </ul>
            </li>

           </>)}

           
        </ul>
    </aside>
    </>
)
}

export default SideBar
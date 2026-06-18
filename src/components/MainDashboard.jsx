import React from 'react'
import './mainDashboard.css'
import PageTitle from './PageTitle'
import Dashboard from './Dashboard'
import AppRouter from '../routes/AppRouter'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'


function MainDashboard() {

  const { t } = useTranslation()
  const location = useLocation()
  const pageTitle = t(getPageTitle(location.pathname))

  function getPageTitle(pathname) {
    const routes = {
      '/': 'Inicio',
      '/companies':'Empresas',
      '/users': 'Usuarios',
      '/students': 'Alumnos',
      '/joboffers': 'Ofertas de Trabajo',
      '/documents': 'Documentos',
      '/dummy': 'Datos Dummy de Ejemplo',
      '/actions': 'Acciones',
      '/fcts': 'Gestión F.E.',
      '/reviews': 'Reseñas',
      '/teachers': 'Perfil',
      '/administrators': 'Perfil',
      '/sinc/empresas': 'Sincronizar Empresas con SAO',
      '/sinc/alumnos': 'Sincronizar Alumnos con SAO',
      '/sinc/profesores': "Sincronizar Profesores - Administradores con SAO",
      '/sinc/fcts':'Sincronizar F.E.',
      '/administrators/validate/reviews':'Validar Reseñas',
      '/administrators/validate/skills':'Validar Aptitudes'
    }
    // Coincidencia exacta o, para rutas con id (/companies/123...),
    // el título de su sección
    const base = '/' + pathname.split('/')[1]
    return routes[pathname] || routes[base] || 'Inicio'
  }

  return (
    <main id='main' className='main'>
        <PageTitle page={pageTitle} />
        <AppRouter />
    </main>
  )
}

export default MainDashboard
import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import Header from "../components/Header"
import SideBar from "../components/SideBar"
import MainDashboard from "../components/MainDashboard"
import Footer from "../components/Footer"
import BackToTop from "../components/BackToTop"

import useUserStore from "../store/userStore"

export default function PrivateLayout() {

  const { t } = useTranslation()

  const fetchUser = useUserStore(state => state.fetchUser)
  const loading = useUserStore(state => state.loading)
  const user = useUserStore(state => state.user)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

    // ⏳ mientras comprueba cookie
  if (loading) {
    return <p>{t('Cargando usuario...')}</p>
  }

  // ❌ no logueado → redirigir
  if (!user) {
    return <Navigate to="/" replace />
  }

  // ✅ logueado → layout normal

  return (
    <>
      <a href="#main" className="skip-link">{t('Saltar al contenido principal')}</a>
      <Header />
      <SideBar />
      <MainDashboard />
      <Footer />
      <BackToTop />
    </>
  )
}
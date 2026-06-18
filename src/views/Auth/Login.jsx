import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { sendRequest, showAlert } from '../../utils/functions'
import useUserStore from "../../store/userStore"
import LanguageSelector from '../../components/LanguageSelector'

const Login = () => {

  const { t } = useTranslation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [buttonText, setButtonText] = useState('Entrando...')
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  // ✅ Zustand
  const fetchUser = useUserStore(state => state.fetchUser)


  const handleSubmit = async e => {
    e.preventDefault()

    if (!username || !password) {
      showAlert(t('Por favor, rellene todos los campos'), 'error')
      return
    }

    setLoading(true)

    const res = await sendRequest(
      'POST',
      { username, password },
      '/auth/login'
    )

    console.log('res data de auth/login: ', res.data)


    // ===========================
    // LOGIN NORMAL OK
    // ===========================

    if (res.success && res.data?.status === 'SUCCESS') {

      // ✅ MUY IMPORTANTE
      await fetchUser()

      setLoading(false)

      switch (res.data.user.profile) {

        case 'ADMINISTRADOR':
          navigate('/administrators/' + res.data.user._id)
          break

        case 'PROFESOR':
          navigate('/teachers/' + res.data.user._id)
          break

        case 'ALUMNO':
          navigate('/students/' + res.data.user._id)
          break

        case 'EMPRESA':
          navigate('/companies/' + res.data.user._id)
          break

        default:
          navigate('/companies')

      }

      return
    }


    // ===========================
    // LOGIN CON SAO
    // ===========================

    if (
      res.data &&
      ['SAO_NEWUSER_FCTM_REQUIRED', 'SAO_REQUIRED', 'FIRST_LOGIN'].includes(
        res.data.status
      )
    ) {

      setButtonText('Autenticando con SAO...')

      const saoRes = await sendRequest(
        'POST',
        { username, password },
        '/sao/login'
      )

      if (!saoRes.success) {
        setLoading(false)
        showAlert(saoRes.message || 'Error autenticando con SAO', 'error')
        return
      }


      // ===========================
      // NUEVO USUARIO SAO
      // ===========================

      if (res.data.status === 'SAO_NEWUSER_FCTM_REQUIRED') {

        setButtonText('Insertando Usuario...')

        const regRes = await sendRequest(
          'POST',
          saoRes.data,
          '/auth/register-from-sao'
        )

        if (!regRes.success) {
          setLoading(false)
          showAlert(regRes.message || 'Error registrando usuario', 'error')
          return
        }

        const userIdMongo = regRes.data.userId

        setLoading(false)

        navigate(
          '/auth/password-setup',
          {
            state: {
              saoData: saoRes.data,
              userIdMongo
            }
          }
        )

        return
      }


      // ===========================
      // PRIMER LOGIN
      // ===========================

      if (
        ['SAO_REQUIRED', 'FIRST_LOGIN'].includes(
          res.data.status
        )
      ) {

        setLoading(false)

        const userIdMongo = res.data.userId

        navigate(
          '/auth/password-setup',
          {
            state: {
              saoData: saoRes.data,
              userIdMongo
            }
          }
        )

        return
      }
    }


    setLoading(false)

    showAlert(
      res.message || 'Error desconocido',
      'error'
    )
  }



  return (

    <div className="auth-wrapper">

      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <LanguageSelector />
      </div>

      <div className="card auth-card">

        <div className="auth-header">
          <i className="bi bi-shield-lock auth-logo"></i>
          <h2 className="auth-title">
            {t('Acceso F.E. Manager')}
          </h2>
          <p className="auth-subtitle">
            {t('Gestión de la Formación en Empresa')} · IES Hermanos Amorós
          </p>
        </div>


        <form
          onSubmit={handleSubmit}
          className="auth-body"
        >

          <div className="auth-group">

            <label>{t('Usuario')}</label>

            <div className="auth-input-group">

              <i className="bi bi-person auth-input-icon"></i>

              <input
                type="text"
                className="auth-input"
                value={username}
                onChange={e =>
                  setUsername(e.target.value)
                }
                required
              />

            </div>

          </div>



          <div className="auth-group">

            <label>{t('Contraseña')}</label>

            <div className="auth-input-group">

              <i className="bi bi-lock auth-input-icon"></i>

              <input
                type={showPassword ? "text" : "password"} // ← Cambio dinámico
                className="auth-input"
                value={password}
                onChange={e =>
                  setPassword(e.target.value)
                }
                required
              />
              {/* Icono del ojo */}
              <i 
                className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} auth-input-icon-right`} 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  cursor: 'pointer', 
                  position: 'absolute', 
                  right: '15px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
              />

            </div>

          </div>



          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? t(buttonText) : t('Entrar')}
          </button>



          <div className="auth-links">
            <Link to="/auth/check-email-recovery">
              {t('¿Olvidaste la contraseña?')}
            </Link>
          </div>


          <p className="auth-footer">
            {t('Si es la primera vez que accede, deberá autenticarse con sus credenciales de SAO FCT')}
          </p>

        </form>

      </div>

    </div>

  )
}

export default Login
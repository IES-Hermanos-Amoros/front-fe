import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { sendRequest, showAlert, validateStrongPassword } from '../../utils/functions'
//import "../../styles/auth.css"


const PasswordSetup = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const saoData = location.state?.saoData || {}
  const userIdMongo = location.state?.userIdMongo || null

  const initialEmail =
    saoData.SAO_email || saoData.FCTM_contact_email || saoData.email || ''

  const [email, setEmail] = useState(initialEmail)
  const [emailRep, setEmailRep] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordRep, setNewPasswordRep] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordRep, setShowPasswordRep] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()

    if (!newPassword || !newPasswordRep || !email || !emailRep) {
      showAlert('Todos los campos son obligatorios', 'error')
      return
    }

    if(!validateStrongPassword(newPassword)) {
      showAlert('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial', 'error')
      return
    }

    if (newPassword !== newPasswordRep) {
      showAlert('Las contraseñas no coinciden', 'error')
      return
    }

    if (email !== emailRep) {
      showAlert('Los emails no coinciden', 'error')
      return
    }

    if(!userIdMongo) {
      showAlert('Error: No se ha podido identificar al usuario. Por favor, inicia sesión de nuevo.', 'error')
      navigate('/')
      return
    }

    setLoading(true)

    const res = await sendRequest(
      'POST',
      {
        userId: userIdMongo,
        newPassword,
        newPasswordRep,
        email,
        emailRep
      },
      '/auth/complete-first-login'
    )

    setLoading(false)

    if (res.data?.status === 'EMAIL_VERIFICATION_REQUIRED') {
      //showAlert('Contraseña actualizada correctamente', 'success')
      navigate('/verify-email-info', { state: { emailContacto: email } })
    }
  }

  return (
    <div className="auth-wrapper">

      <div className="card auth-card">

        <div className="auth-header">
          <i className="bi bi-key auth-logo"></i>
          <h2 className="auth-title">Completar Registro</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-body">

          <div className="auth-group">
            <label>Nueva contraseña</label>

            <div className="auth-input-group">
              <i className="bi bi-lock auth-input-icon"></i>

              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
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

          <div className="auth-group">
            <label>Repetir contraseña</label>

            <div className="auth-input-group">
              <i className="bi bi-shield-lock auth-input-icon"></i>
              <input
                type={showPasswordRep ? "text" : "password"}
                className="auth-input"
                value={newPasswordRep}
                onChange={e => setNewPasswordRep(e.target.value)}
                required
              />
              <i 
                className={`bi ${showPasswordRep ? 'bi-eye' : 'bi-eye-slash'} auth-input-icon-right`} 
                onClick={() => setShowPasswordRep(!showPasswordRep)}
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

          <div className="auth-group">
            <label>Email de contacto</label>

            <div className="auth-input-group">
              <i className="bi bi-envelope auth-input-icon"></i>

              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-group">
            <label>Repetir Email</label>

            <div className="auth-input-group">
              <i className="bi bi-shield-lock auth-input-icon"></i>

              <input
                type="email"
                className="auth-input"
                value={emailRep}
                onChange={e => setEmailRep(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>

        </form>

      </div>

    </div>
  )
}

export default PasswordSetup
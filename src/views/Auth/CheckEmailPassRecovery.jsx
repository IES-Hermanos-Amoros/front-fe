import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendRequest, showAlert } from '../../utils/functions'
//import './auth.css'

const CheckEmailPassRecovery = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()

    if (!email) {
      showAlert('Por favor, introduce tu email de contacto', 'error')
      return
    }

    setLoading(true)

    const res = await sendRequest('POST', { email }, '/auth/request-password-recovery')

    setLoading(false)

    if (res.success) {
      setEmailSent(true)
    }
  }

  return (
    <div className="auth-wrapper">

      <div className="card auth-card">

        <div className="auth-header">
          <i className="bi bi-envelope-open auth-logo"></i>
          <h2 className="auth-title">Recuperar contraseña</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-body">

          {!emailSent && (
            <p className="auth-footer">
              Introduce tu email de contacto registrado en FCT Manager. Te enviaremos un enlace para restablecer tu contraseña.
            </p>
          )}

          {emailSent && (
            <p className="auth-footer">
              Si el email existe, hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
            </p>
          )}

          {!emailSent && (
            <div className="auth-group">
              <label>Email de contacto</label>

              <div className="auth-input-group">
                <i className="bi bi-envelope auth-input-icon"></i>

                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>
          )}

          {!emailSent && (
            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Recuperar contraseña'}
            </button>
          )}

          {emailSent && (
            <button
              type="button"
              className="auth-btn"
              onClick={() => setEmailSent(false)}
            >
              Enviar de nuevo
            </button>
          )}

          <div className="auth-links">
            <Link to="/">Volver al login</Link>
          </div>

        </form>

      </div>

    </div>
  )
}

export default CheckEmailPassRecovery

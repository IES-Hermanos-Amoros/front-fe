import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { sendRequest } from '../../utils/functions';
//import "../../styles/auth.css"


const VerifyEmailPage = ({ mensajeInformativo = false }) => {
  const { emailToken } = useParams();
  const location = useLocation()
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading | success | error | info
  const [message, setMessage] = useState('');

  const emailContacto = location.state?.emailContacto || ""

  useEffect(() => {

    // ✅ MODO INFORMATIVO
    if (mensajeInformativo) {
      setStatus('info');
      setMessage(
        `Se ha enviado un correo a su email de contacto recién configurado (${emailContacto}) para completar la validación del registro.\nA continuación, por favor revise su bandeja de entrada y siga las instrucciones del correo para verificar su email.`
      );
      return;
    }

    // ✅ MODO NORMAL (verificación con token)

    const verifyEmail = async () => {
      setStatus('loading');

      const res = await sendRequest(
        'GET',
        null,
        `/auth/verify-email/${emailToken}`
      );

      if (res.success) {
        if (res.data.status === 'EMAIL_VERIFIED') {
          setStatus('success');
          setMessage(
            res.data.message || 'Correo verificado correctamente.'
          );

          setTimeout(() => navigate('/'), 3000);
        } else {
          setStatus('error');
          setMessage(
            res.data.message || 'Error al verificar el correo'
          );
        }
      } else {
        setStatus('error');
        setMessage(
          res.message || 'Error al verificar el correo'
        );
      }
    };

    verifyEmail();

  }, [emailToken, navigate, mensajeInformativo]);



  return (
    <div className="auth-wrapper">

      <div className="card auth-card auth-verify-card">

        {/* INFO */}
        {status === 'info' && (
          <div className="auth-body auth-center">
            <h2 className="auth-title">Validación pendiente</h2>
            <p className="auth-message">{message}</p>
          </div>
        )}

        {/* LOADING */}
        {status === 'loading' && (
          <div className="auth-body auth-center">
            <p className="auth-loading">
              ⏳ Verificando tu correo...
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {status === 'success' && (
          <div className="auth-body auth-center">
            <h2 className="auth-title">
              Correo verificado ✅
            </h2>
            <p className="auth-message">{message}</p>
            <p className="auth-note">
              Redirigiendo al login...
            </p>
          </div>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <div className="auth-body auth-center">
            <h2 className="auth-title">
              Error ❌
            </h2>
            <p className="auth-message">{message}</p>
            <p className="auth-note">
              Por favor, intenta de nuevo o contacta con soporte.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};

export default VerifyEmailPage;
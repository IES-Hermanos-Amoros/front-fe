import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import fs from 'fs';
import crypto from 'crypto'
import dotenv from 'dotenv';

dotenv.config(); // <<< CARGA .env

const HTTPS = process.env.VITE_USE_HTTPS == 1

let httpsConfig = null
let useHTTPS = false

function isCertificateValid(certPath) {
  try {
    const certPEM = fs.readFileSync(certPath, 'utf-8')
    const cert = new crypto.X509Certificate(certPEM)

    const now = new Date()
    const validFrom = new Date(cert.validFrom)
    const validTo = new Date(cert.validTo)

    if (now < validFrom || now > validTo) {
      console.warn(`⚠️ Certificado expirado o aún no válido: ${validFrom} - ${validTo}`)
      return false
    }

    console.log(`✅ Certificado válido: ${validFrom} - ${validTo}`)
    return true
  } catch (err) {
    console.error(`❌ Error leyendo certificado: ${err.message}`)
    return false
  }
}


//CONFIGURACIÓN
if (HTTPS) {
  try {
    const certPath = process.env.VITE_HTTPS_CRT_SSL;
    const keyPath = process.env.VITE_HTTPS_KEY_SSL;

    if (!isCertificateValid(certPath)) {
      console.warn('⚠️ Certificado inválido, se usará HTTP')
    } else {
      const cert = fs.readFileSync(certPath);
      const key = fs.readFileSync(keyPath);
      httpsConfig = { cert, key };
      console.log('🚀 Dev server en HTTPS');
      useHTTPS = true
    }
  } catch (err) {
    console.warn('⚠️ No se pudo levantar HTTPS, usando HTTP:', err.message);
  }
}


//EXPORTACIÓN
export default defineConfig({
  plugins: [react(), svgr()],
    server: {
    https: httpsConfig,
    port: 5173
  },
  define: {
    __DEV_SERVER_PROTOCOL__: JSON.stringify(useHTTPS ? 'https' : 'http')
  },
  optimizeDeps: {
    exclude: ['react-router-dom']
  }
})

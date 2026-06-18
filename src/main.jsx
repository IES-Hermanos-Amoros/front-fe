import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import axios from "axios"
let host = import.meta.env.VITE_BASE_URL_BACKEND

const protocol = __DEV_SERVER_PROTOCOL__  // 'http' o 'https'
host = `${protocol}${host}`

window.axios = axios
window.axios.defaults.baseURL = host
window.axios.defaults.headers.common["Accept"] = "application/json"
//window.axios.defaults.headers.common["Content-Type"] = "application/json" --> Para que funcione el envío de req.files (formData - multipart)
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest"
window.axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
)

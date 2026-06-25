import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Opción 1: Si usas la URL limpia sin puerto, fuerza el transporte 'websocket'
// Opción 2: Si la limpia te sigue fallando, añade explícitamente el puerto del back (:3016)
let host = import.meta.env.VITE_BASE_URL_BACKEND_SOCKET; 
const protocol = __DEV_SERVER_PROTOCOL__; // 'http' o 'https'
host = `${protocol}${host}`; 

// TRUCO: Si en producción (Vercel) notas que se corta, puedes forzar el puerto 3016 solo para el socket:
// if (!host.includes('localhost') && !host.includes(':3016')) { host = "https://fe-back.norwayeast.cloudapp.azure.com:3016"; }

export default function useSocketProgress(resetSignal) {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");
    const socketRef = useRef(null);

    useEffect(() => {
        // Configuramos opciones críticas para que atraviese proxies y firewalls
        socketRef.current = io(host, { 
            reconnection: true,
            transports: ['websocket'], // 🔑 CRUCIAL: Evita 'polling'. Conecta directo por WebSocket puro
            forceNew: true,
            withCredentials: true
        });

        // Debugger rápido para el profesor en la consola del navegador:
        socketRef.current.on("connect", () => console.log("⚡ Socket conectado con éxito al backend!"));
        socketRef.current.on("connect_error", (err) => console.error("❌ Error de Socket:", err.message));

        const handleProgress = (data) => {
            if (!data) return;
            if (typeof data.progress === "number") setProgress(data.progress);
            if (typeof data.message === "string") setMessage(data.message);
        };

        socketRef.current.on("progress-update", handleProgress);

        return () => {
            if (socketRef.current) {
                socketRef.current.off("progress-update", handleProgress);
                socketRef.current.disconnect();
            }
        };
    }, [resetSignal]);

    const resetProgress = () => {
        setProgress(0);
        setMessage("");
    };

    return { progress, message, resetProgress };
}

/*
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

let host = import.meta.env.VITE_BASE_URL_BACKEND_SOCKET;
const protocol = __DEV_SERVER_PROTOCOL__  // 'http' o 'https'
host = `${protocol}${host}`

export default function useSocketProgress(resetSignal) {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");
    const socketRef = useRef(null);

    useEffect(() => {
        // Crear un socket NUEVO cada vez que resetSignal cambie
        socketRef.current = io(host, { reconnection: true });

        const handleProgress = (data) => {
            if (!data) return;
            if (typeof data.progress === "number") setProgress(data.progress);
            if (typeof data.message === "string") setMessage(data.message);
        };

        socketRef.current.on("progress-update", handleProgress);

        // Cleanup: desconectar socket y quitar listener
        return () => {
            if (socketRef.current) {
                socketRef.current.off("progress-update", handleProgress);
                socketRef.current.disconnect();
            }
        };
    }, [resetSignal]); // 🔑 reconecta el socket al cambiar resetSignal

    const resetProgress = () => {
        setProgress(0);
        setMessage("");
    };

    return { progress, message, resetProgress };
}
*/
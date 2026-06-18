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

import React, { useEffect } from "react";
import Moon from './Moon.svg?react';
import Sun from './Sun.svg?react';
import "./DarkMode.css";

const DarkMode = () => {
    const setDarkMode = () => {
        document.querySelector("body").setAttribute("data-bs-theme", "dark");
        localStorage.setItem("theme", "dark");
        // Despachamos un evento para avisar a los componentes que escuchen activos
        window.dispatchEvent(new Event("themeChange"));
    }

    const setLightMode = () => {
        document.querySelector("body").setAttribute("data-bs-theme", "light");
        localStorage.setItem("theme", "light");
        window.dispatchEvent(new Event("themeChange"));
    }

    const toggleTheme = (e) => {
        if (e.target.checked) setDarkMode();
        else setLightMode();
    }

    // Al cargar la web, recuperamos el modo guardado
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const checkbox = document.getElementById("darkmode-toggle");
        
        if (savedTheme === "dark") {
            if (checkbox) checkbox.checked = true;
            document.querySelector("body").setAttribute("data-bs-theme", "dark");
        } else {
            document.querySelector("body").setAttribute("data-bs-theme", "light");
        }
    }, []);

    return (
        <div className='dark_mode'>
            <input
                className='dark_mode_input'
                type='checkbox'
                id='darkmode-toggle'
                onChange={toggleTheme}
            />
            <label className='dark_mode_label' htmlFor='darkmode-toggle'>
                <Sun />
                <Moon />
            </label>
        </div>
    );
};

export default DarkMode;
import React from 'react';
import { Link } from "react-router-dom";
//import './logo.css';
const curso = import.meta.env.VITE_CURSO;


// Marca de la aplicación. Vive en la parte superior del sidebar;
// el botón de colapso (hamburguesa) está en el Header.
function Logo () {
    return (
        <div className="logo d-flex align-items-center">
            <span className="logo-mark" aria-hidden="true">
                <i className="bi bi-mortarboard-fill"></i>
            </span>
            <span className="logo-text">
                <span className="logo-accent">F.E.</span>
                <span className="logo-name">Manager</span>
                <span className="logo-badge">{curso}</span>
            </span>
        </div>
    );
}

export default Logo;

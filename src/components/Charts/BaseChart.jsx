import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

const BaseChart = ({ option, style, ...props }) => {
  // Inicializamos el estado leyendo el atributo actual del body
  const [currentTheme, setCurrentTheme] = useState(() => {
    return document.querySelector("body")?.getAttribute("data-bs-theme") || "light";
  });

  useEffect(() => {
    const handleThemeChange = () => {
      const activeTheme = document.querySelector("body")?.getAttribute("data-bs-theme") || "light";
      setCurrentTheme(activeTheme);
    };

    // Escuchamos el evento global
    window.addEventListener("themeChange", handleThemeChange);
    
    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <ReactECharts
            theme={currentTheme} // ◄ NUEVO: Le inyecta 'light' o 'dark' dinámicamente
            option={option}
            style={{ height: '400px', width: '100%', ...style }}
            notMerge={true} // Obligatorio para recalcular ejes y colores limpios
            lazyUpdate={true}
            {...props}
        />
      </div>
    </div>
  );
};

export default BaseChart;
import React from 'react';

const StatsLayout = ({ children }) => {
  // Convertimos los hijos en un array para poder contar cuántos hay de forma segura
  const childrenArray = React.Children.toArray(children);
  const totalChildren = childrenArray.length;

  return (
    <div className="row">
      {childrenArray.map((child, index) => {
        // 🚀 LÓGICA DINÁMICA: Si solo hay 1 gráfico, toma col-12. Si hay más, se dividen en col-lg-6.
        const columnClass = totalChildren === 1 
          ? "col-12 mb-4" 
          : "col-lg-6 col-md-12 mb-4";

        return (
          <div key={index} className={columnClass}>
            <div className="h-100">
              {child}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsLayout;
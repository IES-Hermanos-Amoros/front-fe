import React from "react";
import { useTranslation } from "react-i18next";

const ShowHeader = ({ title, onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="d-flex align-items-center mb-3 show-header">
      {onBack && (
        <button className="btn btn-outline-secondary me-2" onClick={onBack}>
          {t('Volver')}
        </button>
      )}
      <h2 className="m-0">{typeof title === 'string' ? t(title) : title}</h2>
    </div>
  );
};

export default ShowHeader;
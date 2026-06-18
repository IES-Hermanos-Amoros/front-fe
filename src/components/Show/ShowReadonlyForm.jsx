import React from "react";
import { useTranslation } from "react-i18next";

const ShowReadonlyForm = ({ data, fields }) => {
  const { t } = useTranslation();

  return (
    <div className="card mb-4">
      <div className="card-header">
        <strong>{t('Datos SAO (solo lectura)')}</strong>
      </div>

      <div className="card-body detail-form-grid">

        {fields.map((field) => {
          const {
            key,
            label,
            type = "text",
            options = [],
            optionValue = "_id",
            optionLabel = "nombre"
          } = field

          return (
            <div className="mb-3" key={key}>
              <label className="form-label">{typeof label === 'string' ? t(label) : label}</label>

              {(() => {
                  if (type === "select") {
                    return (
                      <select
                        className="form-select"
                        value={
                          typeof data[key] === "object" && data[key] !== null
                            ? data[key][optionValue]
                            : data[key] || ""
                        }
                        onChange={e => onChange(key, e.target.value)}
                        disabled={!isEditing}
                        required
                      >
                        <option value="">-- Selecciona --</option>

                        {options.map(opt => (
                          <option
                            key={opt[optionValue]}
                            value={opt[optionValue]}
                          >
                            {opt[optionLabel]}
                          </option>
                        ))}
                      </select>
                    )
                  }

                  if (type === "textarea") {
                    return (
                      <textarea
                        className="form-control"
                        value={
                          typeof data[key] === "object" && data[key] !== null
                            ? data[key][optionLabel] || ""
                            : data[key] || ""
                        }
                        onChange={e => onChange(key, e.target.value)}
                        required
                        readOnly={!isEditing}
                        rows={4}
                      />
                    )
                  }

                  // Por defecto: input normal
                  return (
                    <input
                      className="form-control"
                      type={type}
                      value={
                        typeof data[key] === "object" && data[key] !== null
                          ? data[key][optionLabel] || ""
                          : data[key] || ""
                      }
                      onChange={e => onChange(key, e.target.value)}
                      required
                      readOnly={!isEditing}
                    />
                  )
                })()}

            </div>
          )
        })}

        {/*<div className="mb-3">
          <label className="form-label">SAO ID</label>
          <input
            type="text"
            className="form-control"
            value={data.SAO_id || ""}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Usuario</label>
          <input
            type="text"
            className="form-control"
            value={data.SAO_username || ""}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={data.SAO_email || ""}
            readOnly
          />
        </div>*/}
      </div>
    </div>
  );
};

export default ShowReadonlyForm;
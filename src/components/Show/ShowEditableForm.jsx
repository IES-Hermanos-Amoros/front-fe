import { color } from "echarts";
import React, { useState } from "react"
import Select from "react-select"
import CreatableSelect from "react-select/creatable"
import { useTranslation } from "react-i18next"
import { formatDateDDMMYYYY, selectorDark } from "../../utils/functions"

const getPrimitiveFieldValue = (data, key, optionLabel) => {
  if (typeof data[key] === "object" && data[key] !== null) {
    return data[key][optionLabel] || ""
  }
  return data[key] ?? ""
}

const formatInputDateValue = value => {
  if (!value || typeof value !== "string") return ""
  return value.includes("T") ? value.split("T")[0] : value
}

const ShowEditableForm = ({
  formTitle,
  formId,
  data,
  fields,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  hideEditButton = false   // <-- NUEVO
}) => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault(); // evitamos recarga
    if (onSave) onSave();
  };



  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>{typeof formTitle === 'string' ? t(formTitle) : formTitle}</strong>

        {/* ===== BOTONERA (MISMA ORGANIZACIÓN QUE TENÍAS) ===== */}

        {/* MODO SHOW */}
        {!isEditing && !hideEditButton && (
          <button className="btn btn-primary" onClick={onEdit}>
            {t('Editar')}
          </button>
        )}

        {/* MODO EDIT */}
        {isEditing && (
          <div className="d-flex gap-2">
            <button
              type="submit"
              form={formId}
              className="btn btn-success"
            >
              {t('Guardar')}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              {t('Cancelar')}
            </button>
          </div>
        )}
      </div>

      <div className="card-body">
        <form id={formId} onSubmit={handleSubmit} className="detail-form-grid">

          {fields.map((field) => {
          const {
            key,
            label,
            type = "text",
            options = [],
            optionValue = "_id",
            optionLabel = "nombre",
            required = false
          } = field

          return (
            <div className="mb-3" key={key}>
              <label className="form-label">
                {typeof label === 'string' ? t(label) : label} {required && <span className="text-danger">*</span>}
              </label>
              {(() => {
                  if (type === "select") {
                    return (
                      <select
                        className="form-select"
                        value={
                          typeof data[key] === "object" && data[key] !== null
                            ? data[key][optionValue]
                            : data[key] ?? ""
                        }
                        onChange={e => onChange(key, e.target.value)}
                        disabled={!isEditing}
                        required={required}
                      >
                        <option value="">{t('-- Selecciona --')}</option>

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
                            : data[key] ?? ""
                        }
                        onChange={e => onChange(key, e.target.value)}
                        required={required}
                        readOnly={!isEditing}
                        rows={4}
                      />
                    )
                  }

                  if (type === "star") {
                    const [hover, setHover] = useState(0)
                    
                    const currentValue = data[key] ?? 0
                    
                    return (
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => isEditing && onChange(key, star)}
                            onMouseEnter={() => isEditing && setHover(star)}
                            onMouseLeave={() => isEditing && setHover(0)}
                            style={{
                              cursor: isEditing ? 'pointer' : 'default',
                              fontSize: '1.5rem',
                              color: star <= (hover || currentValue) ? '#ffc107' : '#dee2e6'
                            }}
                          >
                            <i className={`bi ${star <= (hover || currentValue) ? 'bi-star-fill' : 'bi-star'}`}></i>
                          </span>
                        ))}
                      </div>
                    )
                  }

                  if (type === "select-multi") {
                    // React-select multiselect con chips
                    return (
                      <Select
                        options={options.map(opt => ({ value: opt[optionValue], label: opt[optionLabel] }))}
                        isMulti
                        value={data[key] || []}
                        onChange={(selected) => onChange(key, selected)}
                        placeholder={`${t('Selecciona')} ${t(label)}...`}
                        closeMenuOnSelect={false}
                        isDisabled={!isEditing}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={selectorDark}
                      />
                    );
                  }

                  if (type === "select-multi-creatable") {
                    const selectOptions = options.map(opt => ({
                      value: opt[optionValue],
                      label: opt[optionLabel],
                      original: opt
                    }));

                    const value = (data[key] || []).map(v => {
                      if (v.value && v.label) return v;

                      // 1. Caso: Objeto con ID (vienen de base de datos)
                      if (v[optionValue]) {
                        return {
                          value: v[optionValue],
                          label: v[optionLabel],
                          original: v
                        };
                      }

                      // 2. CASO NUEVO: Objeto sin ID pero con nombre (recién creados localmente)
                      if (v[optionLabel]) {
                        return {
                          value: v[optionLabel], // Usamos el nombre como value temporal
                          label: v[optionLabel]
                        };
                      }

                      if (typeof v === "string") {
                        return { value: v, label: v };
                      }

                      return v;
                    });
  
                    return (
                      <CreatableSelect
                        isMulti
                        options={selectOptions}
                        value={value}
                        isDisabled={!isEditing}
                        placeholder={`${t('Selecciona')} ${t(label)}...`}
                        closeMenuOnSelect={false}

                        onChange={(selected) => {

                          const parsed = selected.map(s => {

                            // existente
                            if (s.original) return s.original;

                            // existente sin original
                            if (s.value && options.find(o => o[optionValue] === s.value)) {
                              return options.find(o => o[optionValue] === s.value);
                            }

                            // nueva skill
                            return {
                              [optionLabel]: s.label
                            };

                          });

                          onChange(key, parsed);

                        }}

                        formatCreateLabel={(input) => `${t('Añadir')} "${input}"`}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={selectorDark}
                      />
                    );
                  }

                  if (type === "date") {
                    const rawValue = getPrimitiveFieldValue(data, key, optionLabel)

                    if (!isEditing) {
                      return (
                        <input
                          className="form-control"
                          type="text"
                          value={formatDateDDMMYYYY(rawValue)}
                          readOnly
                        />
                      )
                    }

                    return (
                      <input
                        className="form-control"
                        type="date"
                        value={formatInputDateValue(rawValue)}
                        onChange={e => onChange(key, e.target.value)}
                        required={required}
                        readOnly={!isEditing}
                      />
                    )
                  }

                  // Por defecto: input normal
                  return (
                    <input
                      className="form-control"
                      type={type}
                      value={getPrimitiveFieldValue(data, key, optionLabel)}
                      onChange={e => onChange(key, e.target.value)}
                      required={required}
                      readOnly={!isEditing}
                    />
                  )
                })()}

            </div>
          )
        })}

         
        </form>
      </div>
    </div>
  );
};

export default ShowEditableForm;

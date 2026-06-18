import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useUserStore from "../store/userStore"

const AccessibilityControl = () => {
  const { t } = useTranslation()
  const user = useUserStore(state => state.user)

  const getUserId = () => {
    return (
      user?.user?.id || user?.user?._id || user?.id || user?._id || 'global'
    )
  }

  const readPref = (base, fallback) => {
    try {
      const uid = getUserId()
      const perKey = `a11y_${uid}_${base}`
      const per = localStorage.getItem(perKey)
      if (per !== null && per !== undefined) return per
      const g = localStorage.getItem(`a11y_${base}`)
      if (g !== null && g !== undefined) return g
    } catch {}
    return fallback
  }

  const [zoom, setZoom] = useState(() => {
    try {
      return parseInt(readPref('zoom', '100'), 10);
    } catch {
      return 100;
    }
  });

  const [highContrast, setHighContrast] = useState(() => {
    try {
      return readPref('contrast', 'false') === 'true';
    } catch {
      return false;
    }
  });

  const [colorblindMode, setColorblindMode] = useState(() => {
    try {
      return readPref('colorblind', 'none') || 'none';
    } catch {
      return 'none';
    }
  });

  const [readableMode, setReadableMode] = useState(() => {
    try {
      return readPref('readable', 'false') === 'true';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      const key = `a11y_${getUserId()}_zoom`
      if (localStorage.getItem(key) !== String(zoom)) localStorage.setItem(key, String(zoom));
    } catch {}
    document.documentElement.style.fontSize = `${zoom}%`;
  }, [zoom]);

  useEffect(() => {
    try {
      const key = `a11y_${getUserId()}_contrast`
      if (localStorage.getItem(key) !== String(highContrast)) localStorage.setItem(key, String(highContrast));
    } catch {}
    document.body.classList.toggle('a11y-high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    try {
      const key = `a11y_${getUserId()}_colorblind`
      if (localStorage.getItem(key) !== colorblindMode) localStorage.setItem(key, colorblindMode);
    } catch {}
    document.body.classList.remove('a11y-protanopia', 'a11y-deuteranopia', 'a11y-tritanopia');
    if (colorblindMode && colorblindMode !== 'none') {
      document.body.classList.add(`a11y-${colorblindMode}`);
    }
    return () => {
      document.body.classList.remove('a11y-protanopia', 'a11y-deuteranopia', 'a11y-tritanopia');
    };
  }, [colorblindMode]);

  useEffect(() => {
    try {
      const key = `a11y_${getUserId()}_readable`
      if (localStorage.getItem(key) !== String(readableMode)) localStorage.setItem(key, String(readableMode));
    } catch {}
    document.body.classList.toggle('a11y-readable', readableMode);
  }, [readableMode]);

  useEffect(() => {
    try {
      const uid = getUserId()
      const prefix = `a11y_${uid}_`
      const z = localStorage.getItem(prefix + 'zoom')
      setZoom(z !== null ? parseInt(z, 10) : parseInt(readPref('zoom', '100'), 10))
      const hc = localStorage.getItem(prefix + 'contrast')
      setHighContrast(hc !== null ? hc === 'true' : readPref('contrast', 'false') === 'true')
      const cb = localStorage.getItem(prefix + 'colorblind')
      setColorblindMode(cb !== null ? cb : readPref('colorblind', 'none'))
      const rd = localStorage.getItem(prefix + 'readable')
      setReadableMode(rd !== null ? rd === 'true' : readPref('readable', 'false') === 'true')
    } catch {}
  }, [user?.user?.id])



  const changeZoom = (amount) => {
    const newZoom = Math.max(100, Math.min(150, zoom + amount));
    setZoom(newZoom);
  };

  const clearAccessibilityClasses = () => {
    document.body.classList.remove(
      'a11y-high-contrast',
      'a11y-readable',
      'a11y-protanopia',
      'a11y-deuteranopia',
      'a11y-tritanopia'
    )
  }

  const resetAccessibility = () => {
    setZoom(100);
    setHighContrast(false);
    setReadableMode(false);
    setColorblindMode('none');
    clearAccessibilityClasses();
    try {
      const prefix = `a11y_${getUserId()}_`
      localStorage.removeItem(prefix + 'zoom')
      localStorage.removeItem(prefix + 'contrast')
      localStorage.removeItem(prefix + 'readable')
      localStorage.removeItem(prefix + 'colorblind')
      localStorage.removeItem('a11y_zoom')
      localStorage.removeItem('a11y_contrast')
      localStorage.removeItem('a11y_readable')
      localStorage.removeItem('a11y_colorblind')
    } catch {}
  };

  return (
    <div className="dropdown accessibility-control">
      <button className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-label={t('Abrir opciones de accesibilidad')}>
        <i className="bi bi-universal-access"></i>
      </button>
      <ul className="dropdown-menu p-3" style={{ width: '240px' }} onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
        <li>
          <label className="form-label small">{t('Tamaño de letra')}</label>
          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-sm btn-outline-primary" onClick={() => changeZoom(-10)} disabled={zoom <= 100} aria-label={t('Reducir texto')}>A-</button>
            <span className="align-self-center fw-bold">{zoom}%</span>
            <button className="btn btn-sm btn-outline-primary" onClick={() => changeZoom(10)} disabled={zoom >= 150} aria-label={t('Aumentar texto')}>A+</button>
          </div>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="contrast-toggle" onChange={() => setHighContrast(!highContrast)} checked={highContrast} />
            <label className="form-check-label" htmlFor="contrast-toggle">{t('Alto contraste')}</label>
          </div>
        </li>
        <li>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="readable-toggle" onChange={() => setReadableMode(!readableMode)} checked={readableMode} />
            <label className="form-check-label" htmlFor="readable-toggle">{t('Modo lectura')}</label>
          </div>
        </li>
        <li>
          <label className="form-label small">{t('Visión de color')}</label>
          <select className="form-select form-select-sm" value={colorblindMode} onChange={(e) => setColorblindMode(e.target.value)}>
            <option value="none">{t('Normal')}</option>
            <option value="protanopia">{t('Protanopía')}</option>
            <option value="deuteranopia">{t('Deuteranopía')}</option>
            <option value="tritanopia">{t('Tritanopía')}</option>
          </select>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="btn btn-outline-secondary btn-sm w-100" onClick={resetAccessibility}>{t('Restablecer')}</button>
        </li>
      </ul>
    </div>
  );
};

export default AccessibilityControl;
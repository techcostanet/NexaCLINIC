import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, MoonStar, Check, Sparkles } from 'lucide-react';
import { THEME_MODES, THEMES, getStoredTheme, applyTheme } from '../../utils/themeManager';

/**
 * ThemeToggle — Seletor Oficial de Temas do Nex-Ai CLINIC
 * Permite alternar entre os 3 modos visuais:
 * 1. Claro (Padrão)
 * 2. Suave (Nível 1 - Noturno Slate)
 * 3. OLED  (Nível 2 - Noturno Pitch Black)
 */
export default function ThemeToggle({ variant = 'compact', showLabel = false, style = {} }) {
  const [currentTheme, setCurrentTheme] = useState(getStoredTheme());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e?.detail?.theme) {
        setCurrentTheme(e.detail.theme);
      } else {
        setCurrentTheme(getStoredTheme());
      }
    };

    window.addEventListener('nexaclinic-theme-changed', handleThemeChange);
    return () => window.removeEventListener('nexaclinic-theme-changed', handleThemeChange);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (mode) => {
    applyTheme(mode);
    setCurrentTheme(mode);
    setIsOpen(false);
  };

  const getThemeIcon = (mode, size = 16) => {
    switch (mode) {
      case THEME_MODES.DARK_DIM:
        return <Moon size={size} color="#38bdf8" />;
      case THEME_MODES.DARK_BLACK:
        return <MoonStar size={size} color="#10b981" />;
      default:
        return <Sun size={size} color="#f59e0b" />;
    }
  };

  const currentThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  // Variante 1: Segmented Control (Ideal para ModuleSelector, Config e cabeçalhos de tela cheia)
  if (variant === 'segmented') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--surface-muted, #f1f5f9)',
          padding: '3px',
          borderRadius: '10px',
          gap: '3px',
          border: '1px solid var(--border-color, #e2e8f0)',
          ...style
        }}
        title="Alternar modo visual (Claro, Suave ou OLED)"
      >
        {THEMES.map((theme) => {
          const isActive = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.35rem 0.65rem',
                border: 'none',
                borderRadius: '7px',
                backgroundColor: isActive ? 'var(--card-bg, #ffffff)' : 'transparent',
                color: isActive ? 'var(--text-primary, #0f172a)' : 'var(--text-secondary, #64748b)',
                fontSize: '0.75rem',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {getThemeIcon(theme.id, 14)}
              <span>{theme.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variante 2: Compact Dropdown (Ideal para Navbar e cantos de tela)
  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.42rem 0.65rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color, #e2e8f0)',
          backgroundColor: 'var(--card-bg, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: '600',
          transition: 'all 0.15s ease',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))'
        }}
        title={`Tema: ${currentThemeObj.label} (Clique para alterar)`}
      >
        {getThemeIcon(currentTheme, 16)}
        {showLabel && <span>{currentThemeObj.label}</span>}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '210px',
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.15))',
            padding: '6px',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              fontSize: '0.68rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: 'var(--text-muted, #94a3b8)',
              letterSpacing: '0.05em'
            }}
          >
            Modo Visual
          </div>

          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelect(theme.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isSelected ? 'var(--surface-muted, #f1f5f9)' : 'transparent',
                  color: isSelected ? 'var(--text-primary, #0f172a)' : 'var(--text-secondary, #475569)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.12s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getThemeIcon(theme.id, 16)}
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: isSelected ? '700' : '500' }}>
                      {theme.label}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)' }}>
                      {theme.subLabel}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <Check size={14} color="var(--primary-color, #0891b2)" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

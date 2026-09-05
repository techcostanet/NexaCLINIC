import React, { useState } from 'react';

/**
 * NexAiBrand — Componente Oficial de Branding da Plataforma Nex-Ai CLINIC
 * Renderiza o logotipo vetorial prismático e a marca com o termo "Ai"
 * estilizado no gradiente vibrante do Antigravity IDE.
 */
export default function NexAiBrand({
  size = 'md',
  suffix = 'CLINIC',
  showIcon = true,
  showSubtitle = false,
  subtitle = 'Inteligência Clínica & Gestão Integrada',
  light = false,
  style = {},
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      fontSize: '1rem',
      iconSize: 22,
      subFontSize: '0.65rem',
      gap: '0.4rem',
      aiGlow: '6px'
    },
    md: {
      fontSize: '1.25rem',
      iconSize: 28,
      subFontSize: '0.75rem',
      gap: '0.5rem',
      aiGlow: '8px'
    },
    lg: {
      fontSize: '1.75rem',
      iconSize: 38,
      subFontSize: '0.85rem',
      gap: '0.65rem',
      aiGlow: '10px'
    },
    xl: {
      fontSize: '2.25rem',
      iconSize: 48,
      subFontSize: '0.95rem',
      gap: '0.85rem',
      aiGlow: '14px'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;
  const textColor = light ? '#ffffff' : '#0f172a';
  const subtitleColor = light ? '#cbd5e1' : '#64748b';

  return (
    <div
      className={`nexai-brand ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        flexDirection: showSubtitle ? 'column' : 'row',
        alignItems: showSubtitle ? 'center' : 'center',
        gap: showSubtitle ? '0.2rem' : currentSize.gap,
        userSelect: 'none',
        ...style
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: currentSize.gap }}>
        {showIcon && (
          <svg
            width={currentSize.iconSize}
            height={currentSize.iconSize}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              flexShrink: 0,
              filter: isHovered 
                ? 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.65)) drop-shadow(0 0 6px rgba(6, 182, 212, 0.5))' 
                : 'drop-shadow(0 2px 6px rgba(99, 102, 241, 0.35))',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'scale(1.05) rotate(2deg)' : 'scale(1) rotate(0deg)'
            }}
          >
            <defs>
              <linearGradient id="antigravityGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="30%" stopColor="#3b82f6" />
                <stop offset="65%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="antigravityGradFacet" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </linearGradient>
              <radialGradient id="antigravityCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base Hexagonal Shield */}
            <polygon
              points="24,2 44,12 44,36 24,46 4,36 4,12"
              fill="url(#antigravityGradMain)"
              rx="4"
            />
            {/* Top Crystal Facet */}
            <polygon
              points="24,4 42,13 24,24 6,13"
              fill="url(#antigravityGradFacet)"
            />
            {/* Left Prism Facet */}
            <polygon
              points="6,15 24,24 24,43 6,34"
              fill="#000000"
              fillOpacity="0.15"
            />
            {/* Right Prism Facet */}
            <polygon
              points="24,24 42,15 42,34 24,43"
              fill="#ffffff"
              fillOpacity="0.12"
            />
            {/* Center Core Spark / Nebula */}
            <circle
              cx="24"
              cy="24"
              r="8"
              fill="url(#antigravityCenterGlow)"
              style={{
                mixBlendMode: 'overlay',
                animation: isHovered ? 'pulse 1.5s infinite' : 'none'
              }}
            />
            {/* Pulsing Central Cross/Core */}
            <path
              d="M24 16 L24 32 M16 24 L32 24"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />
          </svg>
        )}

        <div style={{ display: 'inline-flex', alignItems: 'baseline', lineHeight: 1 }}>
          {/* Prefix "Nex-" */}
          <span
            style={{
              fontSize: currentSize.fontSize,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: textColor,
              transition: 'color 0.2s ease'
            }}
          >
            Nex-
          </span>

          {/* Core "Ai" — Antigravity Gradient */}
          <span
            style={{
              fontSize: currentSize.fontSize,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 30%, #8b5cf6 65%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: isHovered
                ? `drop-shadow(0 0 ${currentSize.aiGlow} rgba(139, 92, 246, 0.75))`
                : `drop-shadow(0 0 4px rgba(99, 102, 241, 0.35))`,
              transition: 'filter 0.3s ease',
              marginRight: suffix ? '0.25em' : '0'
            }}
          >
            Ai
          </span>

          {/* Suffix (e.g. "CLINIC" or ".ASSIST") */}
          {suffix && (
            <span
              style={{
                fontSize: currentSize.fontSize,
                fontWeight: suffix.startsWith('.') ? 700 : 800,
                letterSpacing: suffix.startsWith('.') ? '-0.02em' : '0.04em',
                color: suffix.startsWith('.') ? '#6366f1' : textColor,
                opacity: suffix.startsWith('.') ? 0.9 : 1
              }}
            >
              {suffix}
            </span>
          )}
        </div>
      </div>

      {/* Slogan Opcional */}
      {showSubtitle && (
        <span
          style={{
            fontSize: currentSize.subFontSize,
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: subtitleColor,
            marginTop: '0.15rem'
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

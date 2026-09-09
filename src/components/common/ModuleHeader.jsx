import React from 'react';

/**
 * ModuleHeader — Componente Oficial de Cabeçalho de Módulos do Nex-Ai CLINIC
 * 
 * Diretrizes do Padrão Ouro:
 * 1. O logo global "Nex-Ai" vive exclusivamente na Navbar superior.
 * 2. O cabeçalho foca no nome do módulo (.RECEPTION, .MED, .ASSIST, etc.) com ponto colorido de destaque.
 * 3. O seletor de Unidade reside unicamente na Navbar superior (sem duplicação no cabeçalho).
 * 4. Ações no canto direito são reservadas para botões de contexto de tela (ex: TV, atalhos rápidos).
 */
export default function ModuleHeader({
  icon: Icon,
  title = '',
  subtitle = '',
  gradient = 'linear-gradient(135deg, #4f46e5, #3b82f6)',
  dotColor = '#4f46e5',
  actions = null,
  style = {}
}) {
  const isDotPrefixed = title.startsWith('.');
  const displayTitle = isDotPrefixed ? title.slice(1) : title;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '0.5rem',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {Icon && (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              flexShrink: 0
            }}
          >
            <Icon size={25} color="#fff" />
          </div>
        )}
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              lineHeight: 1.2
            }}
          >
            {isDotPrefixed && (
              <span style={{ color: dotColor, fontWeight: 900, marginRight: '2px' }}>
                .
              </span>
            )}
            <span>{displayTitle}</span>
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                margin: '0.2rem 0 0 0',
                lineHeight: 1.3
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {actions}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { useUnit } from '../../contexts/UnitContext';
import { Building2, MapPin, Globe, ChevronDown } from 'lucide-react';

export default function UnitSelector({ compact = false, showLabel = true }) {
  const { 
    units, 
    activeUnitId, 
    activeUnit, 
    isConsolidated, 
    canSwitchUnits, 
    setActiveUnitId,
    allowedUnitIds,
    isSuperAdmin
  } = useUnit();

  if (!canSwitchUnits && !isSuperAdmin) {
    const currentUnit = activeUnit || units[0];
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '4px 8px' : '6px 12px',
          borderRadius: '10px',
          backgroundColor: currentUnit?.badgeBg || '#eef2ff',
          color: currentUnit?.badgeText || '#4338ca',
          border: `1px solid ${currentUnit?.badgeBorder || '#c7d2fe'}`,
          fontSize: compact ? '0.78rem' : '0.84rem',
          fontWeight: '700'
        }}
        title={`Unidade física de operação: ${currentUnit?.name}`}
      >
        <MapPin size={compact ? 13 : 15} color={currentUnit?.color || '#4f46e5'} />
        <span>{currentUnit?.shortName || currentUnit?.name}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {showLabel && (
        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
          Filial:
        </span>
      )}
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <select
          value={activeUnitId}
          onChange={(e) => setActiveUnitId(e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            padding: compact ? '5px 28px 5px 26px' : '6px 32px 6px 30px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            backgroundColor: isConsolidated ? '#f8fafc' : activeUnit?.badgeBg || '#ffffff',
            color: isConsolidated ? '#334155' : activeUnit?.badgeText || '#1e293b',
            fontSize: compact ? '0.78rem' : '0.84rem',
            fontWeight: '700',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
          title="Alternar unidade ou visualizar dados consolidados do grupo"
        >
          {(isSuperAdmin || allowedUnitIds.includes('all')) && (
            <option value="all">🌐 Todas (Consolidado)</option>
          )}
          {units
            .filter(u => isSuperAdmin || allowedUnitIds.includes(u.id) || allowedUnitIds.includes('all'))
            .map(u => (
              <option key={u.id} value={u.id}>
                🏢 {u.name}
              </option>
            ))}
        </select>
        <div style={{ position: 'absolute', left: '8px', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
          {isConsolidated ? (
            <Globe size={14} color="#6366f1" />
          ) : (
            <Building2 size={14} color={activeUnit?.color || '#4f46e5'} />
          )}
        </div>
        <div style={{ position: 'absolute', right: '8px', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
          <ChevronDown size={14} color="#64748b" />
        </div>
      </div>
    </div>
  );
}

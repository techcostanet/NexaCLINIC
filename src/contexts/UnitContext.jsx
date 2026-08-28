import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export const SYSTEM_UNITS = [
  {
    id: 'betim',
    code: 'BTM',
    name: 'Unidade Betim - MG',
    shortName: 'Betim',
    city: 'Betim',
    state: 'MG',
    color: '#4f46e5',
    badgeBg: '#eef2ff',
    badgeText: '#4338ca',
    badgeBorder: '#c7d2fe'
  },
  {
    id: 'taguatinga',
    code: 'TAG',
    name: 'Unidade Taguatinga - DF',
    shortName: 'Taguatinga',
    city: 'Taguatinga',
    state: 'DF',
    color: '#059669',
    badgeBg: '#ecfdf5',
    badgeText: '#065f46',
    badgeBorder: '#a7f3d0'
  }
];

const UnitContext = createContext(null);

export function UnitProvider({ children, currentUser }) {
  // Check if current user is SuperAdmin or has global access
  const isSuperAdmin = useMemo(() => {
    if (!currentUser) return false;
    const email = (currentUser.email || '').toLowerCase().trim();
    const role = (currentUser.role || '').toLowerCase().trim();
    return (
      email === 'contato@techcosta.net' ||
      email === 'admin@dialize.com.br' ||
      role === 'admin' ||
      role === 'master' ||
      currentUser.isAdmin === true
    );
  }, [currentUser]);

  // Determine which units the current user can access
  const allowedUnitIds = useMemo(() => {
    if (!currentUser) return ['betim'];
    if (isSuperAdmin) return ['all', 'betim', 'taguatinga'];

    if (Array.isArray(currentUser.allowedUnits) && currentUser.allowedUnits.length > 0) {
      if (currentUser.allowedUnits.includes('*') || currentUser.allowedUnits.includes('all')) {
        return ['all', 'betim', 'taguatinga'];
      }
      return currentUser.allowedUnits;
    }

    if (currentUser.primaryUnit) {
      if (currentUser.primaryUnit === 'all') return ['all', 'betim', 'taguatinga'];
      return [currentUser.primaryUnit];
    }

    if (currentUser.unitId) {
      return [currentUser.unitId];
    }

    // Padrão seguro para usuários existentes
    return ['betim'];
  }, [currentUser, isSuperAdmin]);

  const canSwitchUnits = allowedUnitIds.length > 1;

  // Active Unit State
  const [activeUnitId, setActiveUnitIdState] = useState(() => {
    const saved = localStorage.getItem('nexa_active_unit');
    if (saved && (saved === 'all' || SYSTEM_UNITS.some(u => u.id === saved))) {
      return saved;
    }
    return 'all';
  });

  // Keep activeUnit valid for current user
  useEffect(() => {
    if (!isSuperAdmin && !allowedUnitIds.includes('all')) {
      if (!allowedUnitIds.includes(activeUnitId)) {
        const fallback = allowedUnitIds[0] || 'betim';
        setActiveUnitIdState(fallback);
        localStorage.setItem('nexa_active_unit', fallback);
      }
    }
  }, [currentUser, allowedUnitIds, activeUnitId, isSuperAdmin]);

  const setActiveUnitId = (unitId) => {
    setActiveUnitIdState(unitId);
    try {
      localStorage.setItem('nexa_active_unit', unitId);
    } catch (e) {
      console.warn('Erro ao salvar nexa_active_unit no localStorage:', e);
    }
  };

  const activeUnit = useMemo(() => {
    if (activeUnitId === 'all') return null;
    return SYSTEM_UNITS.find(u => u.id === activeUnitId) || SYSTEM_UNITS[0];
  }, [activeUnitId]);

  const getUnitMeta = (unitId) => {
    if (!unitId || unitId === 'all') return null;
    const cleanId = String(unitId).toLowerCase().trim();
    return SYSTEM_UNITS.find(u => u.id === cleanId || u.code.toLowerCase() === cleanId) || SYSTEM_UNITS[0];
  };

  /**
   * Helper para verificar se um item individual pertence à unidade ativa.
   * Se não possui unidade explícita, atribui com segurança à unidade 'betim' (retrocompatibilidade).
   */
  const matchItemUnit = (item) => {
    if (!item) return false;
    if (activeUnitId === 'all') return true;
    if (Array.isArray(item.units)) {
      return item.units.includes(activeUnitId) || (activeUnitId === 'betim' && item.units.includes('btm')) || (activeUnitId === 'taguatinga' && item.units.includes('tag'));
    }

    // Branch field resolution: priority to dedicated unitId / filial / branch / unidade fields
    let branchVal = item.unitId || item.filial || item.branch || item.unidade;
    
    // Only check item.unit if it matches a known clinic branch name, since in inventory items 'unit' represents the unit of measure (e.g. 'UNIDADE', 'FRASCO', 'CX')
    if (!branchVal && item.unit) {
      const uLower = String(item.unit).toLowerCase().trim();
      if (['betim', 'btm', 'taguatinga', 'tag', 'all'].includes(uLower)) {
        branchVal = item.unit;
      }
    }

    // If no explicit branch is set:
    if (!branchVal) {
      // General inventory catalog items without specific clinic lock are available across clinics
      if (item.category || item.minStock !== undefined || item.currentStock !== undefined || item.barcode || item.subgroup) {
        return true;
      }
      branchVal = 'betim';
    }

    const cleanUnit = String(branchVal).toLowerCase().trim();
    if (cleanUnit === 'all' || cleanUnit === '*') return true;
    if (activeUnitId === 'betim') return cleanUnit === 'betim' || cleanUnit === 'btm';
    if (activeUnitId === 'taguatinga') return cleanUnit === 'taguatinga' || cleanUnit === 'tag';
    return cleanUnit === activeUnitId;
  };

  /**
   * Helper para filtrar arrays de dados (Financeiro, Estoque, Pacientes, etc.)
   * Garante retrocompatibilidade: registros sem unitId são tratados como 'betim'.
   */
  const filterByActiveUnit = (items = []) => {
    if (!Array.isArray(items)) return [];
    if (activeUnitId === 'all') return items;
    return items.filter(matchItemUnit);
  };

  const value = {
    units: SYSTEM_UNITS,
    activeUnitId,
    activeUnit,
    isConsolidated: activeUnitId === 'all',
    allowedUnitIds,
    canSwitchUnits,
    isSuperAdmin,
    setActiveUnitId,
    getUnitMeta,
    matchItemUnit,
    filterByActiveUnit
  };

  return (
    <UnitContext.Provider value={value}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (!context) {
    // Fallback seguro caso usado fora do provider
    return {
      units: SYSTEM_UNITS,
      activeUnitId: 'all',
      activeUnit: null,
      isConsolidated: true,
      allowedUnitIds: ['all', 'betim', 'taguatinga'],
      canSwitchUnits: true,
      isSuperAdmin: true,
      setActiveUnitId: () => {},
      getUnitMeta: (id) => SYSTEM_UNITS.find(u => u.id === id) || SYSTEM_UNITS[0],
      filterByActiveUnit: (items) => items
    };
  }
  return context;
}

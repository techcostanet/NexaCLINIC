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
    
    const email = (currentUser.email || '').toLowerCase().trim();
    // Gestoras com acesso às 2 unidades
    if (email === 'anacg@nexa.com' || email === 'jsoares@nexa.com' || currentUser.role === 'gestor') {
      return ['all', 'betim', 'taguatinga'];
    }

    if (Array.isArray(currentUser.allowedUnits) && currentUser.allowedUnits.length > 0) {
      if (currentUser.allowedUnits.includes('*') || currentUser.allowedUnits.includes('all')) {
        return ['all', 'betim', 'taguatinga'];
      }
      return currentUser.allowedUnits;
    }

    if (currentUser.primaryUnit) {
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
   * Helper para filtrar arrays de dados (Financeiro, Estoque, Pacientes)
   * Garante retrocompatibilidade: registros sem unitId são tratados como 'betim'.
   */
  const filterByActiveUnit = (items = [], unitField = 'unitId') => {
    if (!Array.isArray(items)) return [];
    if (activeUnitId === 'all') return items;

    return items.filter(item => {
      if (!item) return false;
      const itemUnit = item[unitField] || item.filial || 'betim';
      return String(itemUnit).toLowerCase().trim() === activeUnitId;
    });
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

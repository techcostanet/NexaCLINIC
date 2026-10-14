import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X, UserX } from 'lucide-react';

export default function SearchableEmployeeSelect({
  value = '',
  employees = [],
  onChange,
  hasCpf = false,
  placeholder = 'Vincular colaborador...'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 280 });

  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  // Colaborador atualmente selecionado
  const selectedEmployee = useMemo(() => {
    return employees.find(e => e.id === value) || null;
  }, [employees, value]);

  // Lista filtrada e ordenada
  const filteredEmployees = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(emp => {
      const name = (emp.name || '').toLowerCase();
      const cpf = (emp.cpf || '').replace(/\D/g, '');
      const cpfFormatted = (emp.cpf || '').toLowerCase();
      const code = String(emp.registration || emp.code || '').toLowerCase();
      const qDigits = q.replace(/\D/g, '');

      return name.includes(q) || 
             cpfFormatted.includes(q) || 
             (qDigits && cpf.includes(qDigits)) || 
             code.includes(q);
    });
  }, [employees, searchQuery]);

  // Abrir e calcular posição na tela
  const handleToggle = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      const top = openUpwards ? (rect.top - dropdownHeight - 4) : (rect.bottom + 4);
      let left = rect.left;
      const width = Math.max(rect.width, 300);

      // Não deixar vazar para a direita
      if (left + width > window.innerWidth - 12) {
        left = window.innerWidth - width - 12;
      }
      if (left < 12) left = 12;

      setCoords({ top, left, width });
    }

    setSearchQuery('');
    setIsOpen(true);
  };

  // Foco no input de busca ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  // Fechar ao clicar fora ou rolar página
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        triggerRef.current && triggerRef.current.contains(e.target) ||
        menuRef.current && menuRef.current.contains(e.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (empId) => {
    if (onChange) onChange(empId);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      {/* Botão Gatilho */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.4rem',
          padding: '0.3rem 0.55rem',
          borderRadius: '6px',
          border: hasCpf ? '1px solid #cbd5e1' : '1px solid #f59e0b',
          backgroundColor: hasCpf ? '#f8fafc' : '#fffbeb',
          color: hasCpf ? '#334155' : '#92400e',
          fontSize: '0.72rem',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s ease',
          outline: 'none',
          boxSizing: 'border-box'
        }}
        title={selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.cpf || 'sem CPF'})` : placeholder}
      >
        <span style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontWeight: selectedEmployee ? 600 : 500,
          flex: 1
        }}>
          {selectedEmployee 
            ? `${selectedEmployee.name}` 
            : placeholder}
        </span>
        <ChevronDown size={12} style={{ flexShrink: 0, opacity: 0.7 }} />
      </button>

      {/* Dropdown via Portal para não sofrer overflow do container */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'inherit'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho de Busca */}
          <div style={{
            padding: '0.5rem',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Search size={14} color="#64748b" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar nome, CPF ou matrícula..."
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '0.75rem',
                color: '#0f172a',
                padding: '0.2rem 0'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: '#94a3b8'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Opção de Desvincular se houver alguém selecionado */}
          {value && (
            <button
              type="button"
              onClick={() => handleSelect('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.65rem',
                backgroundColor: '#fff5f5',
                border: 'none',
                borderBottom: '1px solid #fee2e2',
                color: '#dc2626',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <UserX size={13} />
              Desvincular colaborador
            </button>
          )}

          {/* Lista com Rolagem */}
          <div style={{
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '0.25rem 0'
          }}>
            {filteredEmployees.length === 0 ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.75rem'
              }}>
                Nenhum colaborador encontrado
              </div>
            ) : (
              filteredEmployees.map(emp => {
                const isSelected = emp.id === value;
                return (
                  <div
                    key={emp.id}
                    onClick={() => handleSelect(emp.id)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                      borderLeft: isSelected ? '3px solid #10b981' : '3px solid transparent',
                      transition: 'background-color 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? '#065f46' : '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {emp.name}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        CPF: {emp.cpf || 'Sem CPF'} {emp.registration ? `• Matrícula: ${emp.registration}` : ''}
                      </span>
                    </div>

                    {isSelected && (
                      <Check size={14} color="#10b981" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé Informativo */}
          <div style={{
            padding: '0.35rem 0.6rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.66rem',
            color: '#94a3b8'
          }}>
            <span>Ordem alfabética (A-Z)</span>
            <span>{filteredEmployees.length} resultado(s)</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

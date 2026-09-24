import React, { useState, useMemo, useRef } from 'react';
import { Gift, X, Printer, Download, Search, MessageCircle, Calendar, Sparkles, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { normalizeSectorName } from '../../data/hrConstants';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function BirthdayMuralModal({
  isOpen,
  onClose,
  birthdays = [],
  employees = [],
  sectors = [],
  onOpenEmployee
}) {
  const today = new Date();
  const todayDay = today.getDate();
  const currentRealMonth = today.getMonth();
  const currentRealYear = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentRealMonth);
  const [selectedYear, setSelectedYear] = useState(currentRealYear);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'today' | 'upcoming' | 'past'
  const printRef = useRef(null);

  if (!isOpen) return null;

  const isCurrentMonthView = selectedMonth === currentRealMonth && selectedYear === currentRealYear;
  const isFutureMonthView = selectedYear > currentRealYear || (selectedYear === currentRealYear && selectedMonth > currentRealMonth);
  const isPastMonthView = selectedYear < currentRealYear || (selectedYear === currentRealYear && selectedMonth < currentRealMonth);

  const selectedMonthName = MONTH_NAMES[selectedMonth];

  // Navegação entre meses
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    setSelectedMonth(currentRealMonth);
    setSelectedYear(currentRealYear);
  };

  // Filtrar aniversariantes do mês selecionado
  const activeBirthdays = useMemo(() => {
    if (employees && employees.length > 0) {
      return employees.filter(e => {
        if (e.status === 'Inativo') return false;
        if (!e.birthDate) return false;
        const parts = e.birthDate.split('-');
        if (parts.length < 2) return false;
        const bMonth = parseInt(parts[1], 10) - 1;
        return bMonth === selectedMonth;
      }).map(e => {
        const parts = e.birthDate.split('-');
        const day = parseInt(parts[2], 10);
        return {
          id: e.id,
          name: e.name,
          photo: e.photo,
          day,
          role: e.role,
          sectorId: e.sectorId,
          phone: e.phone,
          email: e.email,
          birthDate: e.birthDate
        };
      }).sort((a, b) => a.day - b.day);
    }

    if (isCurrentMonthView) {
      return birthdays;
    }
    return [];
  }, [employees, birthdays, selectedMonth, isCurrentMonthView]);

  // Enriquecer dados dos aniversariantes
  const enrichedBirthdays = useMemo(() => {
    return activeBirthdays.map(b => {
      const isToday = isCurrentMonthView && b.day === todayDay;
      const isUpcoming = isCurrentMonthView ? b.day > todayDay : isFutureMonthView;
      const isPast = isCurrentMonthView ? b.day < todayDay : isPastMonthView;
      const sectorObj = sectors.find(s => s.id === b.sectorId);
      const sectorName = sectorObj ? normalizeSectorName(sectorObj.name) : 'Geral';
      return {
        ...b,
        isToday,
        isUpcoming,
        isPast,
        sectorName
      };
    }).sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return a.day - b.day;
    });
  }, [activeBirthdays, isCurrentMonthView, isFutureMonthView, isPastMonthView, todayDay, sectors]);

  // Métricas rápidas
  const todaysCount = enrichedBirthdays.filter(b => b.isToday).length;
  const upcomingCount = enrichedBirthdays.filter(b => b.isUpcoming).length;
  const pastCount = enrichedBirthdays.filter(b => b.isPast).length;

  // Filtragem da lista
  const filteredList = enrichedBirthdays.filter(b => {
    const matchesSearch = (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.sectorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(b.day).includes(searchTerm);
    if (!matchesSearch) return false;

    if (filterType === 'today') return b.isToday;
    if (filterType === 'upcoming') return b.isUpcoming;
    if (filterType === 'past') return b.isPast;
    return true;
  });

  // Handler de WhatsApp
  const handleWhatsAppWish = (emp) => {
    if (!emp.phone) {
      alert(`O colaborador(a) ${emp.name} não possui número de telefone cadastrado na ficha.`);
      return;
    }
    const cleanPhone = emp.phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length === 10 || cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
    const message = `Olá ${emp.name}! 🎉 Em nome de toda a equipe da clínica, desejamos a você um Feliz Aniversário! Muita saúde, paz e realizações neste novo ciclo! 🎂✨`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Handler de Impressão Direta
  const handlePrint = () => {
    window.print();
  };

  // Exportação em PDF comemorativo
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Topo Comemorativo
      doc.setFillColor(236, 72, 153);
      doc.rect(0, 0, pageWidth, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(`🎂 MURAL DE ANIVERSARIANTES • ${selectedMonthName.toUpperCase()} / ${selectedYear}`, pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Total de Aniversariantes do Mês: ${enrichedBirthdays.length} colaboradores`, 14, 32);
      doc.text(`Emitido em: ${today.toLocaleDateString('pt-BR')}`, pageWidth - 14, 32, { align: 'right' });

      const tableData = enrichedBirthdays.map((b, index) => [
        String(index + 1),
        `Dia ${b.day} ${b.isToday ? '🎉 (HOJE!)' : ''}`,
        b.name,
        b.role || 'Geral',
        b.sectorName || 'Geral',
        b.phone || '-'
      ]);

      doc.autoTable({
        startY: 38,
        head: [['#', 'Dia', 'Colaborador', 'Cargo', 'Setor', 'Telefone']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [219, 39, 119],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: 51
        },
        alternateRowStyles: {
          fillColor: [253, 242, 248]
        },
        styles: {
          cellPadding: 3,
          overflow: 'linebreak'
        }
      });

      doc.save(`Mural_Aniversariantes_${selectedMonthName}_${selectedYear}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF de aniversariantes:', err);
      alert('Não foi possível gerar o PDF de aniversariantes.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem'
    }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #birthday-print-area, #birthday-print-area * {
            visibility: visible;
          }
          #birthday-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            padding: 10px !important;
          }
          .birthday-list-scroll {
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .only-print {
            display: block !important;
          }
        }
        @media screen {
          .only-print {
            display: none;
          }
        }
      `}</style>

      <div 
        ref={printRef}
        id="birthday-print-area"
        style={{
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '880px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #e2e8f0)',
          overflow: 'hidden'
        }}
      >
        {/* Top Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color, #f1f5f9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(236,72,153,0.3)'
            }}>
              <Gift size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#831843', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🎂 Mural de Aniversariantes
              </h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#be185d', fontWeight: '600' }}>
                Celebrações de {selectedMonthName} de {selectedYear} • {enrichedBirthdays.length} colaboradores
              </p>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                borderRadius: '8px',
                border: '1px solid #f472b6',
                backgroundColor: '#ffffff',
                color: '#db2777',
                cursor: 'pointer'
              }}
              title="Imprimir Mural para Quadro de Avisos"
            >
              <Printer size={15} /> Imprimir
            </button>
            <button
              onClick={handleExportPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#db2777',
                color: '#ffffff',
                cursor: 'pointer'
              }}
              title="Baixar lista em PDF"
            >
              <Download size={15} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#831843',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Header exclusivo para Impressão A4 */}
        <div className="only-print" style={{ padding: '1rem', borderBottom: '2px solid #db2777', marginBottom: '1rem', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#831843', textTransform: 'uppercase' }}>
            🎂 Mural de Aniversariantes • {selectedMonthName} de {selectedYear}
          </h1>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
            Nex-Ai CLINIC • Homenagem aos Aniversariantes do Mês ({enrichedBirthdays.length} colaboradores)
          </p>
        </div>

        {/* Barra de Navegação de Mês & Ano */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.5rem',
          backgroundColor: '#fdf2f8',
          borderBottom: '1px solid #fbcfe8',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={17} style={{ color: '#db2777' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#831843' }}>Período:</span>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#be185d' }}>
              {selectedMonthName} / {selectedYear}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                border: '1px solid #f472b6',
                backgroundColor: '#ffffff',
                color: '#db2777',
                cursor: 'pointer'
              }}
              title="Mês Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '8px',
                border: '1px solid #f472b6',
                backgroundColor: '#ffffff',
                color: '#831843',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '8px',
                border: '1px solid #f472b6',
                backgroundColor: '#ffffff',
                color: '#831843',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {[currentRealYear - 1, currentRealYear, currentRealYear + 1, currentRealYear + 2].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                border: '1px solid #f472b6',
                backgroundColor: '#ffffff',
                color: '#db2777',
                cursor: 'pointer'
              }}
              title="Próximo Mês"
            >
              <ChevronRight size={16} />
            </button>

            {!isCurrentMonthView && (
              <button
                type="button"
                onClick={handleResetToCurrentMonth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #db2777',
                  backgroundColor: '#db2777',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
                title="Voltar ao mês atual"
              >
                <RotateCcw size={13} /> Mês Atual
              </button>
            )}
          </div>
        </div>

        {/* Metric Badges */}
        <div className="no-print" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          padding: '1rem 1.5rem',
          backgroundColor: 'var(--bg-body, #f8fafc)',
          borderBottom: '1px solid var(--border-color, #e2e8f0)'
        }}>
          <div style={{ backgroundColor: '#ffffff', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #fbcfe8', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#9d174d', fontWeight: '700', display: 'block' }}>Total do Mês</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#be185d' }}>{enrichedBirthdays.length}</span>
          </div>
          <div style={{ backgroundColor: todaysCount > 0 ? '#fdf2f8' : '#ffffff', padding: '0.6rem 0.8rem', borderRadius: '10px', border: todaysCount > 0 ? '2px solid #ec4899' : '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#be185d', fontWeight: '700', display: 'block' }}>🎉 Hoje</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#db2777' }}>{todaysCount}</span>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700', display: 'block' }}>
              {isFutureMonthView ? 'Próximos' : 'Próximos'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0284c7' }}>{upcomingCount}</span>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', display: 'block' }}>
              {isPastMonthView ? 'Comemorados' : 'Já Comemorados'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#64748b' }}>{pastCount}</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="no-print" style={{
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-color, #e2e8f0)'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por colaborador, cargo ou dia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                fontSize: '0.82rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-body, #ffffff)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Sub-tabs / Filters */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[
              { id: 'all', label: `Todos (${enrichedBirthdays.length})` },
              { id: 'today', label: `🎉 Hoje (${todaysCount})` },
              { id: 'upcoming', label: `Próximos (${upcomingCount})` },
              { id: 'past', label: `Anteriores (${pastCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: filterType === tab.id ? '1px solid #ec4899' : '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: filterType === tab.id ? '#fdf2f8' : 'transparent',
                  color: filterType === tab.id ? '#be185d' : 'var(--text-secondary, #475569)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Birthday List */}
        <div 
          className="birthday-list-scroll"
          style={{
            flex: '1',
            overflowY: 'auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}
        >
          {filteredList.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: 'var(--text-muted, #94a3b8)'
            }}>
              <Gift size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.3, color: '#ec4899' }} />
              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>
                Nenhum aniversariante encontrado em {selectedMonthName} de {selectedYear} com os filtros selecionados.
              </p>
            </div>
          ) : (
            filteredList.map((b) => (
              <div
                key={b.id || b.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: b.isToday ? '#fdf2f8' : 'var(--bg-card, #ffffff)',
                  border: b.isToday ? '1.5px solid #f472b6' : '1px solid var(--border-color, #e2e8f0)',
                  boxShadow: b.isToday ? '0 4px 12px rgba(236,72,153,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Left: Avatar + Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: b.isToday ? '#ec4899' : '#fdf2f8',
                    color: b.isToday ? '#ffffff' : '#db2777',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: b.isToday ? '0 2px 6px rgba(236,72,153,0.3)' : 'none'
                  }}>
                    {b.photo ? (
                      <img src={b.photo} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      b.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        onClick={() => onOpenEmployee && onOpenEmployee(b.id || b.name)}
                        style={{
                          fontWeight: '800',
                          fontSize: '0.9rem',
                          color: b.isToday ? '#be185d' : 'var(--text-primary, #0f172a)',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        title="Ver ficha cadastral"
                      >
                        {b.name}
                      </span>
                      {b.isToday && (
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          backgroundColor: '#ec4899',
                          color: '#ffffff',
                          fontWeight: '800',
                          fontSize: '0.72rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}>
                          <Sparkles size={11} /> HOJE!
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>
                      {b.role || 'Geral'} • {b.sectorName}
                    </div>
                  </div>
                </div>

                {/* Right: Day Badge & WhatsApp Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '8px',
                    backgroundColor: b.isToday ? '#fbcfe8' : '#e2e8f0',
                    color: b.isToday ? '#831843' : '#334155',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    textAlign: 'center'
                  }}>
                    Dia {b.day}
                  </div>

                  <div className="no-print">
                    <button
                      onClick={() => handleWhatsAppWish(b)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 2px 4px rgba(37,211,102,0.2)'
                      }}
                      title="Enviar felicitações via WhatsApp"
                    >
                      <MessageCircle size={14} /> Parabéns
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="no-print" style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-body, #f8fafc)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <span>✨ Nex-Ai CLINIC • Gestão Humanizada de Pessoas</span>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: '#ffffff',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

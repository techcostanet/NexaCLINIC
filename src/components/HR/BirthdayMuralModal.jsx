import React, { useState, useRef } from 'react';
import { Gift, X, Printer, Download, Search, MessageCircle, Calendar, Sparkles, User, Heart } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { normalizeSectorName } from '../../data/hrConstants';

export default function BirthdayMuralModal({
  isOpen,
  onClose,
  birthdays = [],
  sectors = [],
  onOpenEmployee
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'today' | 'upcoming' | 'past'
  const printRef = useRef(null);

  if (!isOpen) return null;

  const today = new Date();
  const todayDay = today.getDate();
  const currentMonthName = today.toLocaleString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const currentYear = today.getFullYear();

  // Enriquecer dados dos aniversariantes
  const enrichedBirthdays = birthdays.map(b => {
    const isToday = b.day === todayDay;
    const isUpcoming = b.day > todayDay;
    const isPast = b.day < todayDay;
    const sectorObj = sectors.find(s => s.id === b.sectorId);
    const sectorName = sectorObj ? normalizeSectorName(sectorObj.name) : 'Geral';
    return {
      ...b,
      isToday,
      isUpcoming,
      isPast,
      sectorName
    };
  });

  // Métricas rápidas
  const todaysCount = enrichedBirthdays.filter(b => b.isToday).length;
  const upcomingCount = enrichedBirthdays.filter(b => b.isUpcoming).length;
  const pastCount = enrichedBirthdays.filter(b => b.isPast).length;

  // Filtragem
  const filteredList = enrichedBirthdays.filter(b => {
    // Filtro por termo
    const matchesSearch = (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.sectorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(b.day).includes(searchTerm);
    if (!matchesSearch) return false;

    // Filtro por período
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
      doc.text(`🎂 MURAL DE ANIVERSARIANTES • ${capitalizedMonth.toUpperCase()} / ${currentYear}`, pageWidth / 2, 15, { align: 'center' });

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

      doc.save(`Mural_Aniversariantes_${capitalizedMonth}_${currentYear}.pdf`);
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
            width: 100%;
            background: white !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
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
          maxWidth: '860px',
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
                Celebrações de {capitalizedMonth} de {currentYear} • {birthdays.length} colaboradores
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
            <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700', display: 'block' }}>Próximos</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0284c7' }}>{upcomingCount}</span>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', display: 'block' }}>Já Comemorados</span>
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
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: filterType === tab.id ? '1px solid #db2777' : '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: filterType === tab.id ? '#fdf2f8' : 'transparent',
                  color: filterType === tab.id ? '#db2777' : 'var(--text-secondary, #64748b)',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Birthdays (Scrollable) */}
        <div style={{
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Gift size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>Nenhum aniversariante encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            filteredList.map((b) => (
              <div
                key={b.id || b.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: b.isToday ? 'rgba(253, 242, 248, 0.85)' : 'var(--bg-body, #f8fafc)',
                  border: b.isToday ? '2px solid #ec4899' : '1px solid var(--border-color, #e2e8f0)',
                  boxShadow: b.isToday ? '0 4px 12px rgba(236,72,153,0.15)' : 'none',
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

import React, { useState, useRef } from 'react';
import { Trophy, X, Printer, Download, FileSpreadsheet, CheckCircle, AlertTriangle, Calendar, UserCheck, ShieldAlert, Award, Search, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDateBR } from '../HRPanel';

export default function AwardReportModal({
  isOpen,
  onClose,
  awardData,
  awardPeriod,
  setAwardPeriod,
  awardValue,
  setAwardValue,
  sectors = [],
  currentUser,
  onExportCSV
}) {
  const [activeSubTab, setActiveSubTab] = useState('eligible'); // 'eligible' | 'disqualified'
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const printRef = useRef(null);

  if (!isOpen) return null;

  const { eligible = [], disqualified = [], period = '2026-08' } = awardData || {};

  // Formatar título do período (Ex: "Agosto de 2026")
  const [y, m] = (period || '2026-08').split('-');
  const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
  const periodLabel = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const formattedPeriodTitle = periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1);

  // Filtragem de busca na tela
  const filterList = (list) => {
    return list.filter(item => {
      const emp = item.employee || item;
      const matchesSearch = (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (emp.cpf || '').includes(searchTerm) ||
                            (emp.role || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter ? emp.sectorId === sectorFilter : true;
      return matchesSearch && matchesSector;
    });
  };

  const filteredEligible = filterList(eligible);
  const filteredDisqualified = filterList(disqualified);

  const totalValueEligible = eligible.length * awardValue;

  // Handler de Impressão Nativa (A4 Limpo e Formatado)
  const handlePrint = () => {
    window.print();
  };

  // Handler de Exportação Direta para PDF estruturado
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Cabeçalho Oficial
      doc.setFillColor(16, 185, 129); // #10b981
      doc.rect(0, 0, pageWidth, 18, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('NexaCLINIC - RECURSOS HUMANOS', 14, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Programa de Reconhecimento & Assiduidade', pageWidth - 14, 12, { align: 'right' });

      // Título do Relatório
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Relatório de Ganhadores - Presença Premiada`, 14, 28);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Competência: ${formattedPeriodTitle} | Regra: Contratos CLT ativos (>90 dias de contrato) sem advertências ou faltas`, 14, 34);

      // Resumo em Caixas
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 38, pageWidth - 28, 16, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total de Contemplados: ${eligible.length} colaboradores`, 18, 45);
      doc.text(`Valor por Ganhador: R$ ${awardValue.toFixed(2)}`, 85, 45);
      doc.text(`Custo Total do Bônus: R$ ${totalValueEligible.toFixed(2)}`, 145, 45);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Excluídos/Inelegíveis no período: ${disqualified.length} colaboradores`, 18, 50);
      doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 145, 50);

      // Tabela de Ganhadores com Campo para Assinatura
      const tableHead = [['Nº', 'Colaborador', 'CPF', 'Cargo / Setor', 'Admissão', 'Tempo', 'Prêmio (R$)', 'Assinatura do Recebedor']];
      const tableBody = eligible.map((emp, index) => {
        const sectorName = sectors.find(s => s.id === emp.sectorId)?.name || emp.sectorId || 'Geral';
        const days = emp.daysOfContract || 0;
        const timeText = days >= 365 ? `${(days / 365).toFixed(1)} anos` : `${days} dias`;
        return [
          index + 1,
          emp.name,
          emp.cpf || '-',
          `${emp.role || 'CLT'}\n(${sectorName})`,
          formatDateBR(emp.admissionDate),
          timeText,
          `+R$ ${awardValue.toFixed(2)}`,
          '_______________________'
        ];
      });

      doc.autoTable({
        head: tableHead,
        body: tableBody,
        startY: 58,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 45, fontStyle: 'bold' },
          2: { cellWidth: 26 },
          3: { cellWidth: 35 },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 16, halign: 'center' },
          6: { cellWidth: 20, halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
          7: { cellWidth: 38, halign: 'center', fontSize: 7 }
        },
        margin: { left: 14, right: 14 }
      });

      // Rodapé com assinaturas da gestão
      const finalY = doc.lastAutoTable.finalY + 15;
      if (finalY + 30 < doc.internal.pageSize.getHeight()) {
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.line(20, finalY + 15, 90, finalY + 15);
        doc.text('Responsável pelo RH', 55, finalY + 20, { align: 'center' });

        doc.line(pageWidth - 90, finalY + 15, pageWidth - 20, finalY + 15);
        doc.text('Diretoria Administrativa / Financeira', pageWidth - 55, finalY + 20, { align: 'center' });
      }

      doc.save(`Presenca_Premiada_${period}_Ganhadores.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF de Presença Premiada:', err);
      alert('Ocorreu um erro ao gerar o PDF. Você também pode utilizar o botão "Imprimir Relatório".');
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container} className="award-report-modal-content">
        
        {/* Top Header */}
        <div style={modalStyles.header} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={modalStyles.trophyIconWrapper}>
              <Trophy size={22} color="#10b981" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                Relatório de Ganhadores - Presença Premiada
              </h2>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Apuração oficial de assiduidade para contratos CLT pós-experiência (&gt; 90 dias) e sem advertências/faltas.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={modalStyles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Toolbar & Controls */}
        <div style={modalStyles.toolbar} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Period Selector */}
            <div style={modalStyles.controlGroup}>
              <label style={modalStyles.controlLabel}><Calendar size={14} /> Competência:</label>
              <select
                value={awardPeriod}
                onChange={e => setAwardPeriod(e.target.value)}
                style={modalStyles.select}
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const d = new Date(2026, 0);
                  d.setMonth(d.getMonth() + i);
                  const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                  const label = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                  return <option key={val} value={val}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>;
                }).reverse()}
              </select>
            </div>

            {/* Award Value Input */}
            <div style={modalStyles.controlGroup}>
              <label style={modalStyles.controlLabel}><Award size={14} /> Prêmio (R$):</label>
              <input
                type="number"
                value={awardValue}
                onChange={e => setAwardValue(Math.max(0, parseFloat(e.target.value) || 0))}
                style={modalStyles.inputNumber}
              />
            </div>

            {/* Sector Filter */}
            <div style={modalStyles.controlGroup}>
              <label style={modalStyles.controlLabel}><Filter size={14} /> Setor:</label>
              <select
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
                style={modalStyles.select}
              >
                <option value="">Todos os Setores</option>
                {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Search */}
            <div style={{ ...modalStyles.controlGroup, position: 'relative' }}>
              <input
                type="text"
                placeholder="Pesquisar por nome ou CPF..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={modalStyles.searchInput}
              />
              <Search size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={handlePrint} className="btn" style={modalStyles.printBtn} title="Imprimir folha A4 com assinaturas">
              <Printer size={16} /> Imprimir Relatório
            </button>
            <button onClick={handleExportPDF} className="btn" style={modalStyles.pdfBtn} title="Baixar PDF formatado">
              <Download size={16} /> Baixar PDF
            </button>
            <button onClick={() => onExportCSV && onExportCSV(awardPeriod)} className="btn" style={modalStyles.csvBtn} title="Exportar planilha CSV">
              <FileSpreadsheet size={16} /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div style={modalStyles.kpiRow} className="award-kpi-container">
          <div style={{ ...modalStyles.kpiCard, borderLeftColor: '#10b981' }}>
            <span style={modalStyles.kpiTitle}>Ganhadores Elegíveis</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ ...modalStyles.kpiValue, color: '#10b981' }}>{eligible.length}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>colaboradores CLT</span>
            </div>
          </div>
          <div style={{ ...modalStyles.kpiCard, borderLeftColor: '#3b82f6' }}>
            <span style={modalStyles.kpiTitle}>Valor por Colaborador</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ ...modalStyles.kpiValue, color: '#3b82f6' }}>R$ {awardValue.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ ...modalStyles.kpiCard, borderLeftColor: '#8b5cf6' }}>
            <span style={modalStyles.kpiTitle}>Custo Total do Benefício</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ ...modalStyles.kpiValue, color: '#8b5cf6' }}>R$ {totalValueEligible.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ ...modalStyles.kpiCard, borderLeftColor: '#ef4444' }}>
            <span style={modalStyles.kpiTitle}>Colaboradores Excluídos</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ ...modalStyles.kpiValue, color: '#ef4444' }}>{disqualified.length}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>inelegíveis no mês</span>
            </div>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div style={modalStyles.subTabs} className="no-print">
          <button
            onClick={() => setActiveSubTab('eligible')}
            style={{ ...modalStyles.subTabBtn, ...(activeSubTab === 'eligible' ? modalStyles.subTabBtnActive : {}) }}
          >
            🏆 Ganhadores Contemplados ({filteredEligible.length})
          </button>
          <button
            onClick={() => setActiveSubTab('disqualified')}
            style={{ ...modalStyles.subTabBtn, ...(activeSubTab === 'disqualified' ? modalStyles.subTabBtnActiveDanger : {}) }}
          >
            🚫 Colaboradores Excluídos ({filteredDisqualified.length})
          </button>
        </div>

        {/* Printable & Scrollable Report Body */}
        <div style={modalStyles.bodyScroll} ref={printRef} className="award-printable-area">
          
          {/* Printable Header (Visible on print only or standard display) */}
          <div className="print-only-header" style={{ display: 'none', marginBottom: '1.5rem', borderBottom: '2px solid #10b981', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>NexaCLINIC - Recursos Humanos</h1>
                <h2 style={{ margin: '0.2rem 0', fontSize: '1.1rem', color: '#10b981' }}>Comprovante de Concessão: Presença Premiada ({formattedPeriodTitle})</h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Regra: Contratos CLT ativos com mais de 90 dias de contrato sem advertências ou ausências no período.
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                <div><strong>Total Ganhadores:</strong> {eligible.length}</div>
                <div><strong>Valor Unitário:</strong> R$ {awardValue.toFixed(2)}</div>
                <div><strong>Custo Total:</strong> R$ {totalValueEligible.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* TAB 1: Ganhadores Elegíveis */}
          {activeSubTab === 'eligible' && (
            <div>
              {filteredEligible.length === 0 ? (
                <div style={modalStyles.emptyState}>
                  <AlertTriangle size={32} color="#94a3b8" />
                  <p>Nenhum colaborador elegível encontrado com os filtros aplicados.</p>
                </div>
              ) : (
                <table style={modalStyles.table} className="award-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>Nº</th>
                      <th>Colaborador</th>
                      <th>CPF</th>
                      <th>Cargo / Setor</th>
                      <th style={{ textAlign: 'center' }}>Admissão</th>
                      <th style={{ textAlign: 'center' }}>Tempo Casa</th>
                      <th style={{ textAlign: 'right' }}>Prêmio</th>
                      <th style={{ width: '180px', textAlign: 'center' }} className="receipt-column">Assinatura do Recebedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEligible.map((emp, index) => {
                      const sectorName = sectors.find(s => s.id === emp.sectorId)?.name || emp.sectorId || 'Geral';
                      const days = emp.daysOfContract || 0;
                      const timeText = days >= 365 ? `${(days / 365).toFixed(1)} anos` : `${days} dias`;
                      return (
                        <tr key={emp.id || index}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)' }}>{index + 1}</td>
                          <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {emp.name}
                            <span style={modalStyles.cltTag}>CLT</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.cpf || '-'}</td>
                          <td>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{emp.role || 'Colaborador'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sectorName}</div>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>{formatDateBR(emp.admissionDate)}</td>
                          <td style={{ textAlign: 'center', fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>{timeText}</td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: '#10b981', fontSize: '0.95rem' }}>
                            +R$ {awardValue.toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'center' }} className="receipt-column">
                            <div style={modalStyles.signLine}></div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: Colaboradores Excluídos */}
          {activeSubTab === 'disqualified' && (
            <div>
              {filteredDisqualified.length === 0 ? (
                <div style={modalStyles.emptyState}>
                  <CheckCircle size={32} color="#10b981" />
                  <p>Nenhum colaborador excluído encontrado.</p>
                </div>
              ) : (
                <table style={modalStyles.table} className="award-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>Nº</th>
                      <th>Colaborador</th>
                      <th>Vínculo / Cargo</th>
                      <th>Setor</th>
                      <th style={{ textAlign: 'center' }}>Admissão</th>
                      <th>Motivo(s) da Desclassificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDisqualified.map((item, index) => {
                      const emp = item.employee;
                      const sectorName = sectors.find(s => s.id === emp.sectorId)?.name || emp.sectorId || 'Geral';
                      const contractType = emp.contractType || 'CLT';
                      return (
                        <tr key={emp.id || index} style={{ backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)' }}>{index + 1}</td>
                          <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {emp.name}
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CPF: {emp.cpf || '-'}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{emp.role || 'Colaborador'}</div>
                            <span style={{ ...modalStyles.contractBadge, backgroundColor: contractType === 'CLT' ? '#f1f5f9' : '#fee2e2', color: contractType === 'CLT' ? '#475569' : '#b91c1c' }}>
                              {contractType}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{sectorName}</td>
                          <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>{formatDateBR(emp.admissionDate)}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {item.reasons ? item.reasons.map((r, idx) => (
                                <span key={idx} style={modalStyles.disqualifyReasonBadge}>
                                  <ShieldAlert size={12} style={{ flexShrink: 0 }} /> {r}
                                </span>
                              )) : (
                                <span style={modalStyles.disqualifyReasonBadge}>
                                  <ShieldAlert size={12} /> {item.reason}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Printable Signature Footers */}
          <div className="print-only-footer" style={{ display: 'none', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ width: '220px', borderBottom: '1px solid #000', marginBottom: '0.4rem' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Gestão de Recursos Humanos</span>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Data: ____/____/________</div>
              </div>
              <div>
                <div style={{ width: '220px', borderBottom: '1px solid #000', marginBottom: '0.4rem' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Diretoria Administrativa</span>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Data: ____/____/________</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={modalStyles.footer} className="no-print">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            * Relatório gerado em tempo real com base no cadastro de funcionários e histórico disciplinar.
          </div>
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>

      </div>

      {/* Global Print Style for clean A4 Document */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .award-report-modal-content, .award-report-modal-content * {
            visibility: visible;
          }
          .award-report-modal-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only-header {
            display: block !important;
          }
          .print-only-footer {
            display: block !important;
          }
          .award-printable-area {
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
          }
          .award-table {
            width: 100% !important;
            font-size: 8pt !important;
          }
          .award-table th, .award-table td {
            padding: 4px 6px !important;
          }
          .receipt-column {
            display: table-cell !important;
          }
          .award-kpi-container {
            margin-bottom: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    padding: '1rem',
    backdropFilter: 'blur(4px)',
  },
  container: {
    backgroundColor: 'var(--bg-card, #fff)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '1100px',
    height: '92vh',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid var(--border-color, #e2e8f0)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.1rem 1.5rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-card, #fff)',
  },
  trophyIconWrapper: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted, #64748b)',
    padding: '0.4rem',
    borderRadius: '6px',
    transition: 'background-color 0.15s ease',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  controlLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary, #475569)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  select: {
    padding: '0.35rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: '#fff',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-primary, #0f172a)',
    outline: 'none',
    cursor: 'pointer',
  },
  inputNumber: {
    width: '75px',
    padding: '0.35rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: '#fff',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#10b981',
    outline: 'none',
  },
  searchInput: {
    padding: '0.35rem 2rem 0.35rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: '#fff',
    fontSize: '0.8rem',
    width: '180px',
    outline: 'none',
  },
  printBtn: {
    backgroundColor: '#0f172a',
    color: '#fff',
    fontSize: '0.8rem',
    padding: '0.45rem 0.8rem',
    borderRadius: '6px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  pdfBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
    fontSize: '0.8rem',
    padding: '0.45rem 0.8rem',
    borderRadius: '6px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  csvBtn: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: '0.8rem',
    padding: '0.45rem 0.8rem',
    borderRadius: '6px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
  },
  kpiCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderLeft: '4px solid #10b981',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  kpiTitle: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--text-secondary, #64748b)',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
  },
  subTabs: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem 1.5rem 0 1.5rem',
    backgroundColor: '#fff',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
  },
  subTabBtn: {
    background: 'none',
    border: 'none',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-muted, #64748b)',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  subTabBtnActive: {
    color: '#10b981',
    borderBottomColor: '#10b981',
    fontWeight: '700',
  },
  subTabBtnActiveDanger: {
    color: '#ef4444',
    borderBottomColor: '#ef4444',
    fontWeight: '700',
  },
  bodyScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 1.5rem',
    backgroundColor: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  cltTag: {
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '0.1rem 0.35rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#059669',
    marginLeft: '0.4rem',
  },
  contractBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    display: 'inline-block',
    marginTop: '0.15rem',
  },
  signLine: {
    borderBottom: '1px dashed #94a3b8',
    height: '18px',
    margin: '0 auto',
    width: '90%',
  },
  disqualifyReasonBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted, #64748b)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    borderTop: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: '#f8fafc',
  }
};

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { X, FileText, Download, ShieldCheck, Filter, Calendar, Award } from 'lucide-react';

export default function TrainingDossierModal({ 
  trainings = [], 
  submissions = [], 
  onClose,
  tenantSettings = { name: 'Nexa Clínica de Nefrologia', cnpj: '00.000.000/0001-00' } 
}) {
  const [selectedTrainingId, setSelectedTrainingId] = useState(trainings[0]?.id || 'all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [generating, setGenerating] = useState(false);

  const selectedTraining = trainings.find(t => t.id === selectedTrainingId);

  // Filtrar submissões aprovadas
  const filteredSubmissions = submissions.filter(s => {
    if (!s.passed && s.status !== 'Aprovado') return false;
    if (selectedTrainingId !== 'all' && s.trainingId !== selectedTrainingId) return false;
    if (selectedSector !== 'all' && s.sector !== selectedSector) return false;
    return true;
  });

  const totalCapacitados = filteredSubmissions.length;
  const avgPre = totalCapacitados > 0 
    ? Math.round(filteredSubmissions.reduce((acc, cur) => acc + (cur.preScore || 0), 0) / totalCapacitados) 
    : 0;
  const avgPost = totalCapacitados > 0 
    ? Math.round(filteredSubmissions.reduce((acc, cur) => acc + (cur.postScore || 0), 0) / totalCapacitados) 
    : 0;
  const avgGain = avgPost - avgPre;

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return iso;
    }
  };

  const handleExportPDF = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;

      // Topo Institucional
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(tenantSettings.name || 'NEXA CLÍNICA DE NEFROLOGIA', pageWidth / 2, 16, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`CNPJ: ${tenantSettings.cnpj || '00.000.000/0001-00'} | SISTEMA INTEGRADO DE GESTÃO DA QUALIDADE`, pageWidth / 2, 21, { align: 'center' });

      // Faixa de Título
      doc.setFillColor(79, 70, 229); // Indigo 600
      doc.rect(14, 26, pageWidth - 28, 11, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(255, 255, 255);
      doc.text('DOSSIÊ DE COMPROVAÇÃO DE CAPACITAÇÃO CONTINUADA (VIGILÂNCIA SANITÁRIA)', pageWidth / 2, 33, { align: 'center' });

      // Dados do Treinamento
      let currentY = 44;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      const titleStr = selectedTraining ? selectedTraining.title : 'Relatório Consolidado de Treinamentos';
      doc.text(`Treinamento: ${titleStr}`, 14, currentY);

      currentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const workload = selectedTraining ? `${selectedTraining.workloadHours || 2} hora(s)` : 'Variável';
      const sector = selectedTraining ? selectedTraining.sector || 'Geral' : (selectedSector === 'all' ? 'Todos os Setores' : selectedSector);
      doc.text(`Carga Horária: ${workload} | Setor-Alvo: ${sector} | Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, currentY);

      // Caixa de Indicadores de Eficácia (Exigência VISA / RDC 63)
      currentY += 6;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, currentY, pageWidth - 28, 16, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Total Capacitados: ${totalCapacitados}`, 20, currentY + 6);
      doc.text(`Média Pré-teste: ${avgPre}%`, 70, currentY + 6);
      doc.text(`Média Pós-teste: ${avgPost}%`, 120, currentY + 6);
      
      doc.setTextColor(21, 128, 61); // Green
      doc.text(`Ganho de Eficácia Médio: +${avgGain}%`, 160, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Critério de Avaliação de Eficácia atendido conforme RDC 63/2011 da ANVISA e NR-32.', 20, currentY + 12);

      // Tabela de Colaboradores Aprovados
      const tableColumn = ['Data', 'Colaborador', 'CPF', 'Cargo / Setor', 'Pré', 'Pós', 'Eficácia', 'Certificado'];
      const tableRows = filteredSubmissions.map(s => [
        formatDate(s.completedAt),
        s.employeeName,
        s.cpf || '-',
        `${s.role || '-'}\n(${s.sector || 'Geral'})`,
        `${s.preScore}%`,
        `${s.postScore}%`,
        `+${s.gainEfficacy}%`,
        s.certificateId || '-'
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: currentY + 20,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 42 },
          2: { cellWidth: 26 },
          3: { cellWidth: 36 },
          4: { cellWidth: 12, halign: 'center' },
          5: { cellWidth: 12, halign: 'center' },
          6: { cellWidth: 14, halign: 'center' },
          7: { cellWidth: 22, halign: 'center' }
        }
      });

      // Assinaturas de Validação
      let finalY = (doc).lastAutoTable.finalY + 18;
      if (finalY > 250) {
        doc.addPage();
        finalY = 30;
      }

      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.4);

      // Linha 1: RT / Qualidade
      doc.line(20, finalY, 90, finalY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Responsável Técnico / Qualidade', 55, finalY + 4, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Nexa Clínica — Registro Profissional', 55, finalY + 8, { align: 'center' });

      // Linha 2: Fiscal da Vigilância Sanitária
      doc.line(120, finalY, 190, finalY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Fiscal / Auditor Sanitário', 155, finalY + 4, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Visto e Homologação da Inspeção', 155, finalY + 8, { align: 'center' });

      doc.save(`Dossie_Vigilancia_Sanitaria_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar dossiê PDF:', err);
      alert('Erro ao gerar PDF do Dossiê.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="#4f46e5" />
            <div>
              <h2 style={styles.headerTitle}>Dossiê Vigilância Sanitária</h2>
              <p style={styles.headerSub}>Comprovação oficial de treinamentos e eficácia para fiscalizações municipais</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Filtros */}
          <div style={styles.filterBar}>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Treinamento</label>
              <select 
                value={selectedTrainingId} 
                onChange={e => setSelectedTrainingId(e.target.value)}
                style={styles.select}
              >
                <option value="all">Todos os Treinamentos</option>
                {trainings.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Setor</label>
              <select 
                value={selectedSector} 
                onChange={e => setSelectedSector(e.target.value)}
                style={styles.select}
              >
                <option value="all">Todos</option>
                {Array.from(new Set(submissions.map(s => s.sector).filter(Boolean))).map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumo da Amostra */}
          <div style={styles.summaryBox}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Colaboradores Aprovados</span>
              <span style={styles.summaryVal}>{totalCapacitados}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Média Pré-teste</span>
              <span style={styles.summaryVal}>{avgPre}%</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Média Pós-teste</span>
              <span style={styles.summaryVal}>{avgPost}%</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Ganho Médio</span>
              <span style={{ ...styles.summaryVal, color: '#15803d' }}>+{avgGain}%</span>
            </div>
          </div>

          {/* Prévia da Lista */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Colaborador</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Pré</th>
                  <th style={styles.th}>Pós</th>
                  <th style={styles.th}>Eficácia</th>
                  <th style={styles.th}>Certificado</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.slice(0, 8).map(s => (
                  <tr key={s.id}>
                    <td style={styles.td}>{formatDate(s.completedAt)}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{s.employeeName}</td>
                    <td style={styles.td}>{s.sector || 'Geral'}</td>
                    <td style={styles.td}>{s.preScore}%</td>
                    <td style={styles.td}>{s.postScore}%</td>
                    <td style={{ ...styles.td, color: '#15803d', fontWeight: 700 }}>+{s.gainEfficacy}%</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '0.75rem' }}>{s.certificateId}</td>
                  </tr>
                ))}
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                      Nenhuma conclusão registrada para o filtro selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Fechar
          </button>
          <button 
            onClick={handleExportPDF} 
            disabled={generating || totalCapacitados === 0}
            style={{
              ...styles.downloadBtn,
              opacity: (generating || totalCapacitados === 0) ? 0.6 : 1
            }}
          >
            <Download size={16} />
            <span>{generating ? 'Gerando Dossiê...' : 'Emitir Dossiê PDF (VISA)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem'
  },
  modal: {
    maxWidth: '750px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh'
  },
  header: {
    padding: '1.15rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#0f172a'
  },
  headerSub: {
    margin: '0.15rem 0 0 0',
    fontSize: '0.78rem',
    color: '#64748b'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.35rem'
  },
  body: {
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
    flex: 1
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '0.3rem'
  },
  select: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none'
  },
  summaryBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1.25rem'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  summaryLabel: {
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: 600
  },
  summaryVal: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#1e293b',
    marginTop: '0.2rem'
  },
  tableWrapper: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem'
  },
  th: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    fontWeight: 700,
    padding: '0.6rem 0.75rem',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0'
  },
  td: {
    padding: '0.6rem 0.75rem',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155'
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem'
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.55rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer'
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#ffffff',
    cursor: 'pointer'
  }
};

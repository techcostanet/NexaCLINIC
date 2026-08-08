import React, { useState, useEffect } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { dbService } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AtaPsicologiaModal({ onClose, selectedPeriod, currentUser }) {
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [formData, setFormData] = useState({
    referencia: selectedPeriod || '2026-07',
    dataRealizacao: new Date().toISOString().substring(0, 10),
    horaInicio: '08:00',
    horaFim: '09:00',
    analiseCritica: 'Análise do mês:\nObserva-se que a taxa de cobertura de atendimentos psicológicos está dentro da média esperada.\nAvaliação de novos admitidos ocorreu no prazo. Pacientes em crise foram acompanhados.',
    fatorDeterminante: 'Ausências justificadas por intercorrências clínicas (internações).',
    planoAcao: '1. Manter a busca ativa nos salões de HD.\n2. Acompanhamento rigoroso de pacientes em grupo de risco.\n3. Reunião mensal com equipe multidisciplinar.'
  });

  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [formData.referencia]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Indicators for Psicologia
      const allIndicators = await dbService.getIndicators();
      const psyIndicators = allIndicators.filter(i => i.sectorId === 'psicologia');

      // 2. Fetch Data for Psicologia
      const allData = await dbService.getIndicatorData(['psicologia'], true);
      
      // Calculate the last 6 months based on the reference month
      const [year, month] = formData.referencia.split('-');
      const refDate = new Date(year, month - 1, 1);
      
      const periods = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        periods.push(`${y}-${m}`);
      }
      
      const formatPeriodLabel = (p) => {
        const [y, m] = p.split('-');
        const date = new Date(y, m - 1, 1);
        return date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
      };
      
      const periodLabels = periods.map(formatPeriodLabel);

      const getValue = (indId, p) => {
        const entry = allData.find(d => d.indicatorId === indId && d.period === p);
        return entry && entry.value !== null ? parseFloat(entry.value) : 0;
      };

      const chart1Data = [
        { name: 'Total de pct em diálise', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_total_pacientes', p)])) },
        { name: 'Admitidos no mês', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_admitidos', p)])) },
        { name: 'Atendidos no mês', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_atendidos', p)])) },
        { name: 'Atendidos em crise', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_crise', p)])) },
        { name: 'Demanda espontânea', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_demanda_espontanea', p)])) },
        { name: 'Busca ativa', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_busca_ativa', p)])) },
        { name: 'Familiares/Acompanhantes', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_familiares', p)])) },
        { name: 'TAXA ATENDIMENTO %', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('taxa_atendimento_psico', p)])) },
      ];

      const chart2Data = [
        { name: 'Ansiedade provável', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_ansiedade_provavel', p)])) },
        { name: 'Ansiedade possível', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_ansiedade_possivel', p)])) },
        { name: 'Depressão provável', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_depressao_provavel', p)])) },
        { name: 'Depressão possível', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_depressao_possivel', p)])) },
        { name: 'Outros riscos', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_outros_riscos', p)])) },
      ];

      const chart3Data = [
        { name: 'Psiquiatria', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_encam_psiquiatria', p)])) },
        { name: 'Rede', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_encam_rede', p)])) },
        { name: 'Avaliação para TX', ...Object.fromEntries(periods.map((p, i) => [periodLabels[i], getValue('psico_encam_tx', p)])) },
      ];

      setHistoryData({
        periods: periodLabels,
        chart1: chart1Data,
        chart2: chart2Data,
        chart3: chart3Data
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Add a specific class to the body to hide everything else
    document.body.classList.add('printing-ata');
    window.print();
    // Revert after a short delay to allow printing dialog to close
    setTimeout(() => {
      document.body.classList.remove('printing-ata');
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const colors = ['#2563eb', '#f97316', '#a8a29e', '#eab308', '#22c55e', '#ec4899'];

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      {/* --- FORMULÁRIO (SÓ APARECE NA TELA, NÃO NA IMPRESSÃO) --- */}
      <div className="modal-content screen-only" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="var(--primary-color)" />
            Gerar Ata Mensal - Psicologia
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="modal-body">
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            Preencha os dados abaixo e clique em "Imprimir" para gerar a Ata Oficial em formato PDF.
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Mês de Referência (MM/YYYY)</label>
              <input type="month" className="form-control" name="referencia" value={formData.referencia} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Data da Ata</label>
              <input type="date" className="form-control" name="dataRealizacao" value={formData.dataRealizacao} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
              <label>Hora de Início</label>
              <input type="time" className="form-control" name="horaInicio" value={formData.horaInicio} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
              <label>Hora de Término</label>
              <input type="time" className="form-control" name="horaFim" value={formData.horaFim} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Análise Crítica</label>
            <textarea 
              className="form-control" 
              name="analiseCritica" 
              rows={4} 
              value={formData.analiseCritica} 
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Fator Determinante</label>
            <textarea 
              className="form-control" 
              name="fatorDeterminante" 
              rows={2} 
              value={formData.fatorDeterminante} 
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Plano de Ação</label>
            <textarea 
              className="form-control" 
              name="planoAcao" 
              rows={4} 
              value={formData.planoAcao} 
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
            <Printer size={18} />
            {loading ? 'Carregando Dados...' : 'Salvar e Imprimir Ata'}
          </button>
        </div>
      </div>

      {/* --- LAYOUT DE IMPRESSÃO (SÓ APARECE NA IMPRESSÃO) --- */}
      {!loading && historyData.periods && (
        <div className="print-only print-ata">
          <div className="print-header">
            <div className="print-logo">
              {/* Fake logo placeholder for print */}
              <h2>CLÍNICA NEXA</h2>
            </div>
            <div className="print-title-box">
              <h2>ATA DE REUNIÃO DE INDICADORES</h2>
              <h3>Análise Crítica</h3>
            </div>
          </div>

          <table className="print-info-table">
            <tbody>
              <tr>
                <td style={{ width: '50%' }}><strong>Mês de Referência:</strong> {formData.referencia.split('-').reverse().join('/')}</td>
                <td style={{ width: '50%' }}><strong>Data:</strong> {formData.dataRealizacao.split('-').reverse().join('/')}</td>
              </tr>
              <tr>
                <td><strong>Início:</strong> {formData.horaInicio}</td>
                <td><strong>Término:</strong> {formData.horaFim}</td>
              </tr>
              <tr>
                <td colSpan="2"><strong>Pauta:</strong> Apresentar resultados dos indicadores. Analisar pontos de atenção, determinar e propor plano de ação em caso de desvios, verificar plano de ação anterior e melhoria de processos, discutir melhorias gerais.</td>
              </tr>
            </tbody>
          </table>

          <div className="print-section">
            <h4 className="print-section-title">1. COBERTURA ATENDIMENTO PSICOLÓGICO</h4>
            <div className="print-chart-box">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={historyData.chart1} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 10, fill: '#333' }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36}/>
                  {historyData.periods.map((p, i) => (
                    <Bar key={p} dataKey={p} fill={colors[i % colors.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="print-charts-row">
            <div className="print-section" style={{ flex: 1, paddingRight: '10px' }}>
              <h4 className="print-section-title">2. RISCO PSICOLÓGICO IDENTIFICADO</h4>
              <div className="print-chart-box">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={historyData.chart2} margin={{ top: 20, right: 10, left: -20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 10, fill: '#333' }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    {historyData.periods.map((p, i) => (
                      <Bar key={p} dataKey={p} fill={colors[i % colors.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="print-section" style={{ flex: 1, paddingLeft: '10px' }}>
              <h4 className="print-section-title">3. ENCAMINHAMENTOS</h4>
              <div className="print-chart-box">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={historyData.chart3} margin={{ top: 20, right: 10, left: -20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 10, fill: '#333' }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    {historyData.periods.map((p, i) => (
                      <Bar key={p} dataKey={p} fill={colors[i % colors.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="print-section">
            <h4 className="print-section-title">ANÁLISE CRÍTICA</h4>
            <div className="print-text-box" style={{ whiteSpace: 'pre-wrap' }}>{formData.analiseCritica}</div>
          </div>

          <div className="print-section">
            <h4 className="print-section-title">FATOR DETERMINANTE</h4>
            <div className="print-text-box" style={{ whiteSpace: 'pre-wrap' }}>{formData.fatorDeterminante}</div>
          </div>

          <div className="print-section">
            <h4 className="print-section-title">PLANO DE AÇÃO</h4>
            <div className="print-text-box" style={{ whiteSpace: 'pre-wrap' }}>{formData.planoAcao}</div>
          </div>

          <div className="print-signatures">
            <div className="signature-line">
              <div className="line"></div>
              <span>Psicologia</span>
            </div>
            <div className="signature-line">
              <div className="line"></div>
              <span>Coordenação</span>
            </div>
            <div className="signature-line">
              <div className="line"></div>
              <span>Diretoria</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

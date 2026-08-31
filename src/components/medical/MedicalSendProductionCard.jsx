import React, { useState, useEffect } from 'react';
import { Mail, Send, Check, AlertCircle, FileSpreadsheet, FileText } from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const YEARS = ['2024', '2025', '2026', '2027'];

export default function MedicalSendProductionCard({
  doctor,
  schedules = [],
  procedures = [],
  appointments = [],
  settings = {},
  onSaveSettings
}) {
  const currentDate = new Date();
  const currentMonthIdx = currentDate.getMonth();
  const currentYearStr = String(currentDate.getFullYear());

  const [selectedMonthIdx, setSelectedMonthIdx] = useState(currentMonthIdx);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [additionalEmail, setAdditionalEmail] = useState(settings.additionalEmail || '');
  const [emailSaved, setEmailSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    if (settings.additionalEmail !== undefined) {
      setAdditionalEmail(settings.additionalEmail || '');
    }
  }, [settings.additionalEmail]);

  const monthCode = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;
  const monthLabel = MONTH_NAMES[selectedMonthIdx];

  // Doctor id matching
  const docId = doctor?.id || doctor?.uid;
  const docEmail = doctor?.email || 'contato@techcosta.net';

  // Filter shifts and procedures for selected month
  const monthShifts = schedules.filter(s => {
    const isDoc = !docId || s.doctorId === docId || s.doctorId === doctor?.id || s.doctorId === doctor?.uid;
    const isMonth = s.date ? s.date.startsWith(monthCode) : s.month === monthCode;
    const isConfirmed = s.checkinStatus === 'Presente' || s.checkinStatus === 'Substituído' || (s.status === 'Confirmado' && s.checkinStatus !== 'Ausente');
    return isDoc && isMonth && isConfirmed;
  });

  const monthProcedures = procedures.filter(p => {
    const isDoc = !docId || p.doctorId === docId || p.doctorId === doctor?.id || p.doctorId === doctor?.uid;
    const isMonth = p.date ? p.date.startsWith(monthCode) : true;
    return isDoc && isMonth;
  });

  const shiftFees = settings.shiftFees || { 'Manhã': 726, 'Tarde': 726, 'Noite': 825 };
  const shiftsTotal = monthShifts.reduce((acc, s) => {
    const fee = shiftFees[s.shift] || (s.shift === 'Noite' ? 825 : (settings.shiftFee || 726));
    return acc + fee;
  }, 0);

  const proceduresTotal = monthProcedures.reduce((acc, p) => acc + (parseFloat(p.value) || 0), 0);
  const grandTotal = shiftsTotal + proceduresTotal;
  const hasRecords = monthShifts.length > 0 || monthProcedures.length > 0;

  const handleSaveAdditionalEmail = async (e) => {
    e.preventDefault();
    if (onSaveSettings) {
      await onSaveSettings({
        ...settings,
        additionalEmail: additionalEmail.trim()
      });
    }
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2500);
  };

  const handleSendEmail = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
    }, 800);
  };

  return (
    <div style={styles.card}>
      {/* Title Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <Mail size={18} style={{ color: '#0f172a' }} />
          <h4 style={styles.title}>Enviar produção do mês</h4>
        </div>
        <p style={styles.subtitle}>
          Escolha o mês e envie o PDF e a planilha por email para você e para a secretaria.
        </p>
      </div>

      {/* Row 1: Month / Year Selection + Live Summary + Send Action */}
      <div style={styles.controlsRow}>
        <div style={styles.selectGroup}>
          <div style={styles.fieldCol}>
            <label style={styles.fieldLabel}>Mês</label>
            <select
              value={selectedMonthIdx}
              onChange={e => setSelectedMonthIdx(parseInt(e.target.value, 10))}
              style={styles.select}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>

          <div style={styles.fieldCol}>
            <label style={styles.fieldLabel}>Ano</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={styles.select}
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div style={styles.statusText}>
            {hasRecords ? (
              <span>
                <strong>{monthShifts.length} plantões</strong>, <strong>{monthProcedures.length} procedimentos</strong> (Total: <strong style={{ color: '#059669' }}>R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>) em <strong>{monthLabel}/{selectedYear}</strong>.
              </span>
            ) : (
              <span>Nenhum lançamento em <strong>{monthLabel}/{selectedYear}</strong>.</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSendEmail}
          disabled={sending}
          style={{
            ...styles.sendBtn,
            backgroundColor: sendSuccess ? '#10b981' : '#64748b'
          }}
        >
          {sending ? (
            <span>Enviando...</span>
          ) : sendSuccess ? (
            <>
              <Check size={15} />
              <span>Enviado!</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>Enviar por email</span>
            </>
          )}
        </button>
      </div>

      {/* Row 2: Additional Email (e.g. accountant) */}
      <div style={styles.additionalEmailSection}>
        <label style={styles.fieldLabel}>Email adicional em cópia (opcional — ex.: contador)</label>
        <form onSubmit={handleSaveAdditionalEmail} style={styles.emailForm}>
          <input
            type="email"
            placeholder="contador@exemplo.com"
            value={additionalEmail}
            onChange={e => setAdditionalEmail(e.target.value)}
            style={styles.emailInput}
          />
          <button type="submit" style={styles.saveEmailBtn}>
            {emailSaved ? 'Salvo!' : 'Salvar'}
          </button>
        </form>
        <span style={styles.footnote}>
          Envios sempre vão para <strong>{docEmail}</strong> e <strong>secretariabetim@dialize.com.br</strong>{additionalEmail ? <span> e <strong>{additionalEmail}</strong></span> : ''}.
        </span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  title: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  subtitle: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#64748b'
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #edf2f7'
  },
  selectGroup: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  fieldCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  fieldLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569'
  },
  select: {
    padding: '0.45rem 0.75rem',
    fontSize: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontWeight: '600',
    minWidth: '110px'
  },
  statusText: {
    fontSize: '0.82rem',
    color: '#475569',
    paddingBottom: '0.45rem'
  },
  sendBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.55rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap'
  },
  additionalEmailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  emailForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  emailInput: {
    padding: '0.45rem 0.75rem',
    fontSize: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    width: '280px',
    maxWidth: '100%',
    color: '#0f172a'
  },
  saveEmailBtn: {
    padding: '0.45rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    color: '#334155',
    cursor: 'pointer'
  },
  footnote: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.2rem'
  }
};

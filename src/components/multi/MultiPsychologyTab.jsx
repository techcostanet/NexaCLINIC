import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, Plus, Search, Filter, Calendar, User, Save, X, 
  Printer, CheckCircle2, AlertCircle, Clock, FileText 
} from 'lucide-react';
import { dbService } from '../../firebase';
import { getPsychologyRecords, savePsychologyRecord } from '../../services/firebase/multiService';

export default function MultiPsychologyTab({ unitId = 'betim', currentUser = null }) {
  const [records, setRecords] = useState([]);
  const [clinicPatients, setClinicPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    patientId: '',
    nomePaciente: '',
    data: new Date().toISOString().substring(0, 10),
    tipoAtendimento: 'Rotina',
    humorAfeto: 'Eutímico',
    adesaoTratamento: 'Boa',
    evolucaoTexto: '',
    conduta: '',
    responsavel: currentUser?.name || 'Psicologia',
    crp: ''
  });

  useEffect(() => {
    loadData();
  }, [unitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, pats] = await Promise.all([
        getPsychologyRecords(unitId),
        dbService.getPatients(unitId)
      ]);
      setRecords(recs || []);
      setClinicPatients(pats || []);
    } catch (e) {
      console.warn('Erro ao carregar dados de psicologia:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!patientSearch || patientSearch.length < 2) return [];
    const s = patientSearch.toLowerCase();
    return clinicPatients.filter(p => (p.name || p.nome || '').toLowerCase().includes(s)).slice(0, 8);
  }, [clinicPatients, patientSearch]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (r.nomePaciente || '').toLowerCase().includes(s) || (r.tipoAtendimento || '').toLowerCase().includes(s);
    });
  }, [records, searchTerm]);

  const handleSelectPatient = (p) => {
    setFormData(prev => ({
      ...prev,
      patientId: p.id,
      nomePaciente: p.name || p.nome
    }));
    setPatientSearch(p.name || p.nome);
    setShowPatientDropdown(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.nomePaciente) {
      alert('Selecione ou informe o paciente.');
      return;
    }
    try {
      await savePsychologyRecord(formData, currentUser);
      setShowModal(false);
      loadData();
    } catch (e) {
      alert('Erro ao salvar evolução psicológica.');
    }
  };

  return (
    <div style={styles.container}>
      {/* BARRA DE AÇÕES */}
      <div style={styles.actionsBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Buscar por paciente ou tipo de atendimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData({
              id: '',
              patientId: '',
              nomePaciente: '',
              data: new Date().toISOString().substring(0, 10),
              tipoAtendimento: 'Rotina',
              humorAfeto: 'Eutímico',
              adesaoTratamento: 'Boa',
              evolucaoTexto: '',
              conduta: '',
              responsavel: currentUser?.name || 'Psicologia',
              crp: ''
            });
            setPatientSearch('');
            setShowModal(true);
          }}
          style={styles.btnPrimary}
        >
          <Plus size={16} />
          Evolução
        </button>
      </div>

      {/* LISTA DE REGISTROS */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Carregando evoluções da Psicologia...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhuma evolução psicológica cadastrada. Clique em "+ Evolução" para registrar o primeiro atendimento.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Humor</th>
                  <th style={styles.th}>Adesão</th>
                  <th style={styles.th}>Profissional</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => (
                  <tr key={item.id} style={styles.trBody}>
                    <td style={styles.td}>
                      {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : 'Hoje'}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {item.nomePaciente}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{item.tipoAtendimento}</span>
                    </td>
                    <td style={styles.td}>{item.humorAfeto}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: item.adesaoTratamento === 'Boa' ? '#dcfce7' : '#fee2e2',
                        color: item.adesaoTratamento === 'Boa' ? '#166534' : '#991b1b'
                      }}>
                        {item.adesaoTratamento}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {item.responsavel}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE NOVA EVOLUÇÃO */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Brain size={22} color="#7c3aed" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                  Evolução Psicológica
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} style={styles.btnClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* BUSCA DE PACIENTE */}
              <div style={{ position: 'relative' }}>
                <label style={styles.label}>Paciente (Base Central da Clínica) *</label>
                <input
                  type="text"
                  required
                  placeholder="Digite o nome do paciente..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  style={styles.input}
                />
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div style={styles.dropdown}>
                    {filteredPatients.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        style={styles.dropdownItem}
                      >
                        {p.name || p.nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={styles.label}>Data</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Tipo de Atendimento</label>
                  <select
                    value={formData.tipoAtendimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoAtendimento: e.target.value }))}
                    style={styles.select}
                  >
                    <option value="Rotina">Rotina de Diálise</option>
                    <option value="Triagem">Triagem Inicial</option>
                    <option value="Acolhimento em Crise">Acolhimento em Crise</option>
                    <option value="Familiar">Atendimento Familiar</option>
                    <option value="Transplante">Avaliação para Transplante</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={styles.label}>Humor / Afeto</label>
                  <select
                    value={formData.humorAfeto}
                    onChange={(e) => setFormData(prev => ({ ...prev, humorAfeto: e.target.value }))}
                    style={styles.select}
                  >
                    <option value="Eutímico">Eutímico</option>
                    <option value="Ansioso">Ansioso</option>
                    <option value="Depressivo">Depressivo</option>
                    <option value="Lábil">Lábil</option>
                    <option value="Irritado">Irritado</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Adesão ao Tratamento</label>
                  <select
                    value={formData.adesaoTratamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, adesaoTratamento: e.target.value }))}
                    style={styles.select}
                  >
                    <option value="Boa">Boa adesão</option>
                    <option value="Regular">Adesão regular</option>
                    <option value="Baixa">Baixa adesão / Resistência</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.label}>Evolução Psicológica</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Relato da sessão, queixas emocionais, enfrentamento da doença renal e dinâmica familiar..."
                  value={formData.evolucaoTexto}
                  onChange={(e) => setFormData(prev => ({ ...prev, evolucaoTexto: e.target.value }))}
                  style={styles.textarea}
                />
              </div>

              <div>
                <label style={styles.label}>Conduta / Encaminhamentos</label>
                <textarea
                  rows={2}
                  placeholder="Orientações, agendamento de retorno, articulação com Serviço Social ou Psiquiatria..."
                  value={formData.conduta}
                  onChange={(e) => setFormData(prev => ({ ...prev, conduta: e.target.value }))}
                  style={styles.textarea}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  <Save size={16} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    padding: '0.85rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #e2e8f0)',
    flex: '1 1 260px',
    maxWidth: '420px'
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    width: '100%',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.85rem'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.825rem',
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #1e293b)',
    fontWeight: '500',
    fontSize: '0.825rem',
    cursor: 'pointer'
  },
  tableCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden'
  },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  trHead: { backgroundColor: 'var(--bg-surface, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' },
  th: { padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary, #64748b)' },
  trBody: { borderBottom: '1px solid var(--border-color, #f1f5f9)' },
  td: { padding: '0.85rem 1rem', fontSize: '0.85rem', verticalAlign: 'middle' },
  badge: { fontSize: '0.72rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155' },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem'
  },
  modal: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '640px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-surface, #f8fafc)'
  },
  btnClose: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' },
  input: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '0.875rem' },
  select: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '0.875rem' },
  textarea: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '0.875rem', fontFamily: 'inherit' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', zIndex: 20, maxHeight: '180px', overflowY: 'auto' },
  dropdownItem: { padding: '0.6rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }
};

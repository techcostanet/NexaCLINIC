import React, { useState, useEffect, useMemo } from 'react';
import { 
  HeartHandshake, Plus, Search, Filter, Download, Share2, 
  Edit3, Trash2, Printer, Eye, AlertTriangle, CheckCircle2, 
  ExternalLink, Phone, MapPin, Bus, DollarSign, Home, UserCheck,
  Calendar, Copy, Check, QrCode, X
} from 'lucide-react';
import { 
  getSocialAnamneses, deleteSocialAnamnese, exportSocialAnamnesesToExcel 
} from '../../services/firebase/multiService';
import { calcularAlertasVulnerabilidade } from '../../utils/socialAnamnesisQuestions';
import SocialAnamneseForm from './SocialAnamneseForm';
import SocialAnamnesePatientView from './SocialAnamnesePatientView';

export default function MultiSocialTab({ unitId = 'betim', currentUser = null }) {
  const [anamneses, setAnamneses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurno, setFilterTurno] = useState('all');
  const [filterVulnerabilidade, setFilterVulnerabilidade] = useState('all');
  
  // Modais
  const [selectedAnamnese, setSelectedAnamnese] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPatientKiosk, setShowPatientKiosk] = useState(false);
  const [kioskData, setKioskData] = useState(null);
  const [shareModalItem, setShareModalItem] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    loadData();
  }, [unitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSocialAnamneses(unitId);
      setAnamneses(data || []);
    } catch (err) {
      console.warn('Erro ao carregar anamneses sociais:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deseja realmente remover o registro social de "${name}"?`)) return;
    try {
      await deleteSocialAnamnese(id, currentUser);
      setAnamneses(prev => prev.filter(x => x.id !== id));
    } catch (e) {
      alert('Erro ao excluir registro.');
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    let total = anamneses.length;
    let prioritarios = 0;
    let alimentar = 0;
    let transporte = 0;
    let contato = 0;

    anamneses.forEach(a => {
      const als = calcularAlertasVulnerabilidade(a);
      if (a.statusAcompanhamento === 'Prioritário' || als.some(x => x.gravidade === 'critica' || x.gravidade === 'alta')) {
        prioritarios++;
      }
      if (a.dificuldadeAlimentos === 'Sim' || a.dificuldadeAlimentos === 'Às vezes') {
        alimentar++;
      }
      if (a.dificuldadeTransporte === 'Sim' || a.dificuldadeTransporte === 'Às vezes') {
        transporte++;
      }
      if (a.gostariaConversar === 'Sim') {
        contato++;
      }
    });

    return { total, prioritarios, alimentar, transporte, contato };
  }, [anamneses]);

  // Filtros
  const filteredList = useMemo(() => {
    return anamneses.filter(a => {
      // Busca
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const nome = (a.nomeCompleto || '').toLowerCase();
        const tel = (a.telefonePrincipal || '').toLowerCase();
        const cid = (a.cidade || '').toLowerCase();
        const bai = (a.bairro || '').toLowerCase();
        if (!nome.includes(s) && !tel.includes(s) && !cid.includes(s) && !bai.includes(s)) {
          return false;
        }
      }

      // Turno
      if (filterTurno !== 'all') {
        if (!a.escalaTurno || !a.escalaTurno.includes(filterTurno)) return false;
      }

      // Vulnerabilidade
      if (filterVulnerabilidade !== 'all') {
        const als = calcularAlertasVulnerabilidade(a);
        if (filterVulnerabilidade === 'sem_renda' && !als.some(x => x.tipo === 'renda')) return false;
        if (filterVulnerabilidade === 'alimentar' && !als.some(x => x.tipo === 'alimento')) return false;
        if (filterVulnerabilidade === 'transporte' && !als.some(x => x.tipo === 'transporte')) return false;
        if (filterVulnerabilidade === 'risco' && !als.some(x => x.tipo === 'adesao')) return false;
        if (filterVulnerabilidade === 'contato' && !als.some(x => x.tipo === 'contato')) return false;
      }

      return true;
    });
  }, [anamneses, searchTerm, filterTurno, filterVulnerabilidade]);

  const handleExport = () => {
    exportSocialAnamnesesToExcel(filteredList, `Anamnese_Social_${unitId}_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  const getShareLink = (item) => {
    const base = window.location.origin;
    const patId = item.patientId || item.id || 'novo';
    return `${base}/?anamnese_social=${patId}`;
  };

  const handleCopyShareLink = (item) => {
    const link = getShareLink(item);
    const msg = `Olá, ${item.nomeCompleto || 'Paciente'}! A equipe de Serviço Social da clínica preparou um formulário para atualizar seus dados e entender suas necessidades sociais. Por favor, acesse o link abaixo para responder:\n\n${link}`;
    navigator.clipboard.writeText(msg);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Se estiver no modo quiosque / preenchimento paciente no tablet
  if (showPatientKiosk) {
    return (
      <SocialAnamnesePatientView
        initialData={kioskData}
        onFinished={() => {
          setShowPatientKiosk(false);
          loadData();
        }}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* 5 CARDS KPI NO TOPO */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#ede9fe', color: '#7c3aed' }}>
            <HeartHandshake size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.total}</div>
            <div style={styles.kpiLabel}>Cadastrados</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.prioritarios}</div>
            <div style={styles.kpiLabel}>Prioritários</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#ffedd5', color: '#ea580c' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.alimentar}</div>
            <div style={styles.kpiLabel}>Alimentos</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Bus size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.transporte}</div>
            <div style={styles.kpiLabel}>Transporte</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <Phone size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.contato}</div>
            <div style={styles.kpiLabel}>Contato</div>
          </div>
        </div>
      </div>

      {/* BARRA DE AÇÕES E FILTROS (RÓTULOS CONCISOS DE 1 TERMO) */}
      <div style={styles.actionsBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Buscar por paciente, telefone, bairro ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={filterTurno}
            onChange={(e) => setFilterTurno(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Turno</option>
            <option value="1º turno">1º Turno</option>
            <option value="2º turno">2º Turno</option>
            <option value="3º turno">3º Turno</option>
          </select>

          <select
            value={filterVulnerabilidade}
            onChange={(e) => setFilterVulnerabilidade(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Vulnerabilidade</option>
            <option value="sem_renda">Sem Renda</option>
            <option value="alimentar">Alimentos</option>
            <option value="transporte">Transporte</option>
            <option value="risco">Risco Continuidade</option>
            <option value="contato">Quer Conversar</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            style={styles.btnSecondary}
            title="Exportar para Excel (.xlsx)"
          >
            <Download size={15} />
            Exportar
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedAnamnese(null);
              setShowFormModal(true);
            }}
            style={styles.btnPrimary}
          >
            <Plus size={16} />
            Anamnese
          </button>
        </div>
      </div>

      {/* TABELA DE ANAMNESES */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Carregando registros do Serviço Social...
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhuma anamnese social encontrada com os filtros selecionados.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Cidade</th>
                  <th style={styles.th}>Turno</th>
                  <th style={styles.th}>Renda</th>
                  <th style={styles.th}>Vulnerabilidades</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const alertas = calcularAlertasVulnerabilidade(item);
                  return (
                    <tr key={item.id} style={styles.trBody}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {item.nomeCompleto}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
                          <span>{item.telefonePrincipal || 'Sem telefone'}</span>
                          {item.origemPreenchimento === 'paciente' && (
                            <span style={styles.badgeViaPaciente}>Via Paciente</span>
                          )}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div>{item.cidade || 'Betim'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {item.bairro || item.ubsReferencia || ''}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.badgeTurno}>
                          {item.escalaTurno ? item.escalaTurno.split('–')[0].trim() : 'HD'}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          {item.salaTratamento || 'Sala 01'}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                          {item.rendaFamiliar ? item.rendaFamiliar.split('a')[0].trim() : 'Não inf.'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {item.situacaoMoradia || ''}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '240px' }}>
                          {alertas.length === 0 ? (
                            <span style={styles.badgeEstavel}>Regular</span>
                          ) : (
                            alertas.map((al, idx) => (
                              <span key={idx} style={{
                                ...styles.badgeAlerta,
                                backgroundColor: al.gravidade === 'critica' ? '#fee2e2' : al.gravidade === 'alta' ? '#ffedd5' : '#fef9c3',
                                color: al.gravidade === 'critica' ? '#991b1b' : al.gravidade === 'alta' ? '#9a3412' : '#854d0e'
                              }}>
                                {al.rotulo}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span style={{
                          ...styles.badgeStatus,
                          backgroundColor: item.statusAcompanhamento === 'Prioritário' ? '#fee2e2' : item.statusAcompanhamento === 'Concluído' ? '#dcfce7' : '#ede9fe',
                          color: item.statusAcompanhamento === 'Prioritário' ? '#991b1b' : item.statusAcompanhamento === 'Concluído' ? '#166534' : '#6d28d9'
                        }}>
                          {item.statusAcompanhamento || 'Triagem'}
                        </span>
                      </td>

                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAnamnese(item);
                              setShowFormModal(true);
                            }}
                            style={styles.btnAction}
                            title="Editar anamnese completa"
                          >
                            <Edit3 size={15} color="#7c3aed" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setShareModalItem(item)}
                            style={styles.btnAction}
                            title="Compartilhar link com paciente (WhatsApp)"
                          >
                            <Share2 size={15} color="#0284c7" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.nomeCompleto)}
                            style={styles.btnAction}
                            title="Remover anamnese"
                          >
                            <Trash2 size={15} color="#dc2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL EDITÁVEL DO SERVIÇO SOCIAL */}
      {showFormModal && (
        <SocialAnamneseForm
          anamnese={selectedAnamnese}
          unitId={unitId}
          currentUser={currentUser}
          onClose={() => setShowFormModal(false)}
          onSaved={() => {
            setShowFormModal(false);
            loadData();
          }}
          onOpenPatientMode={(data) => {
            setShowFormModal(false);
            setKioskData(data);
            setShowPatientKiosk(true);
          }}
        />
      )}

      {/* MODAL DE COMPARTILHAMENTO DE LINK (WHATSAPP / QR CODE) */}
      {shareModalItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.shareCard}>
            <div style={styles.shareHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Share2 size={20} color="#7c3aed" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Compartilhar com Paciente</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShareModalItem(null)} 
                style={styles.btnClose}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Envie o link abaixo para <strong>{shareModalItem.nomeCompleto}</strong> responder pelo celular via WhatsApp:
              </p>

              <div style={styles.linkDisplayBox}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {getShareLink(shareModalItem)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleCopyShareLink(shareModalItem)}
                  style={styles.btnCopy}
                >
                  <Copy size={16} />
                  {copiedText ? 'Copiado para Área de Transferência!' : 'Copiar Mensagem WhatsApp'}
                </button>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>
                  Prévia da Mensagem:
                </div>
                <div style={{ fontSize: '0.78rem', color: '#334155', whiteSpace: 'pre-line' }}>
                  {`Olá, ${shareModalItem.nomeCompleto}! A equipe de Serviço Social da clínica preparou um formulário para atualizar seus dados e entender suas necessidades sociais. Por favor, acesse o link abaixo para responder:\n\n${getShareLink(shareModalItem)}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem'
  },
  kpiCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    border: '1px solid var(--border-color, #e2e8f0)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
  },
  kpiIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiVal: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-primary, #0f172a)',
    lineHeight: 1.1
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary, #64748b)',
    marginTop: '0.2rem'
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  selectFilter: {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.825rem',
    cursor: 'pointer'
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
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
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  trHead: {
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    borderBottom: '1px solid var(--border-color, #e2e8f0)'
  },
  th: {
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-secondary, #64748b)',
    letterSpacing: '0.05em'
  },
  trBody: {
    borderBottom: '1px solid var(--border-color, #f1f5f9)',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.85rem',
    verticalAlign: 'middle'
  },
  badgeViaPaciente: {
    fontSize: '0.68rem',
    fontWeight: '600',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8'
  },
  badgeTurno: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#334155'
  },
  badgeEstavel: {
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px',
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  badgeAlerta: {
    fontSize: '0.7rem',
    fontWeight: '600',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px'
  },
  badgeStatus: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px'
  },
  btnAction: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  modalOverlay: {
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
  shareCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden'
  },
  shareHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-surface, #f8fafc)'
  },
  btnClose: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary, #64748b)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  linkDisplayBox: {
    padding: '0.75rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    border: '1px solid #cbd5e1'
  },
  btnCopy: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.875rem',
    border: 'none',
    cursor: 'pointer'
  }
};

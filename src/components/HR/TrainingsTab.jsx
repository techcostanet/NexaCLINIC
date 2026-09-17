import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Plus, Search, Filter, QrCode, Edit2, Trash2, 
  Award, CheckCircle2, AlertTriangle, Clock, ExternalLink, FileText, 
  ShieldCheck, ArrowUpRight, TrendingUp, Users, RefreshCw
} from 'lucide-react';
import { 
  getTrainings, 
  createTraining, 
  updateTraining, 
  deleteTraining, 
  getTrainingSubmissions,
  syncNephrologyTrainings
} from '../../services/firebase/hrService';
import TrainingModal from './TrainingModal';
import TrainingQrModal from './TrainingQrModal';
import TrainingDossierModal from './TrainingDossierModal';
import CertificateView from '../training/CertificateView';

export default function TrainingsTab({ currentUser }) {
  const [trainings, setTrainings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sub-abas: 'catalogo' | 'participacoes' | 'reciclagem'
  const [subTab, setSubTab] = useState('catalogo');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Modais
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedForQr, setSelectedForQr] = useState(null);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trnList, subList] = await Promise.all([
        getTrainings(),
        getTrainingSubmissions()
      ]);
      setTrainings(trnList || []);
      setSubmissions(subList || []);
    } catch (e) {
      console.error('Erro ao carregar dados de treinamentos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTraining = async (formData) => {
    try {
      if (formData.id) {
        await updateTraining(formData.id, formData);
      } else {
        await createTraining(formData);
      }
      setShowTrainingModal(false);
      setEditingTraining(null);
      await loadData();
    } catch (e) {
      console.error('Erro ao salvar treinamento:', e);
      alert('Erro ao salvar treinamento.');
    }
  };

  const handleDeleteTraining = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este treinamento?')) {
      try {
        await deleteTraining(id);
        await loadData();
      } catch (e) {
        console.error('Erro ao excluir:', e);
      }
    }
  };

  const handleSyncTemplates = async () => {
    if (window.confirm('Deseja sincronizar os 15 treinamentos oficiais de nefrologia no banco de dados?')) {
      setLoading(true);
      try {
        const res = await syncNephrologyTrainings();
        alert(`Sincronização concluída com sucesso! ${res.count} treinamentos oficiais atualizados.`);
        await loadData();
      } catch (e) {
        console.error('Erro ao sincronizar:', e);
        alert('Erro ao sincronizar modelos de treinamento.');
      } finally {
        setLoading(false);
      }
    }
  };

  // KPIs
  const totalTrainings = trainings.length;
  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter(s => s.passed || s.status === 'Aprovado');
  const approvalRate = totalSubmissions > 0 
    ? Math.round((approvedSubmissions.length / totalSubmissions) * 100) 
    : 100;
  const avgEfficacy = approvedSubmissions.length > 0
    ? Math.round(approvedSubmissions.reduce((acc, cur) => acc + (cur.gainEfficacy || 0), 0) / approvedSubmissions.length)
    : 0;

  // Reciclagem: Submissões vencidas ou vencendo em 30 dias
  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const expiringSubmissions = submissions.filter(s => {
    if (!s.expiresAt) return false;
    const expMs = new Date(s.expiresAt).getTime();
    return expMs - nowMs <= thirtyDaysMs;
  });

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return iso;
    }
  };

  // Filtragem de Participações
  const filteredSubmissions = submissions.filter(s => {
    const matchSearch = !searchTerm || 
      (s.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.cpf || '').includes(searchTerm) ||
      (s.trainingTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchSector = sectorFilter === 'Todos' || s.sector === sectorFilter;
    const matchStatus = statusFilter === 'Todos' || 
      (statusFilter === 'Aprovado' && (s.passed || s.status === 'Aprovado')) ||
      (statusFilter === 'Reprovado' && (!s.passed && s.status !== 'Aprovado'));
    return matchSearch && matchSector && matchStatus;
  });

  return (
    <div style={styles.container}>
      {/* KPIs Superiores */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>Treinamentos</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#eef2ff' }}>
              <GraduationCap size={18} color="#4f46e5" />
            </div>
          </div>
          <span style={styles.kpiValue}>{totalTrainings}</span>
          <span style={styles.kpiSub}>Módulos cadastrados</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>Conclusões</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#f0fdf4' }}>
              <CheckCircle2 size={18} color="#16a34a" />
            </div>
          </div>
          <span style={styles.kpiValue}>{totalSubmissions}</span>
          <span style={styles.kpiSub}>{approvedSubmissions.length} aprovados</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>Aprovação</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#fdf2f8' }}>
              <Award size={18} color="#db2777" />
            </div>
          </div>
          <span style={styles.kpiValue}>{approvalRate}%</span>
          <span style={styles.kpiSub}>Taxa média de acerto</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>Eficácia</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#f0fdfa' }}>
              <TrendingUp size={18} color="#0d9488" />
            </div>
          </div>
          <span style={{ ...styles.kpiValue, color: '#0d9488' }}>+{avgEfficacy}%</span>
          <span style={styles.kpiSub}>Ganho Pré vs. Pós</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>Reciclagem</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#fffbeb' }}>
              <Clock size={18} color="#d97706" />
            </div>
          </div>
          <span style={{ ...styles.kpiValue, color: expiringSubmissions.length > 0 ? '#d97706' : '#10b981' }}>
            {expiringSubmissions.length}
          </span>
          <span style={styles.kpiSub}>A vencer ou vencidos</span>
        </div>
      </div>

      {/* Barra de Sub-abas e Ações Rápidas */}
      <div style={styles.navBar}>
        <div style={styles.subTabs}>
          <button 
            onClick={() => setSubTab('catalogo')}
            style={{ ...styles.subTabBtn, ...(subTab === 'catalogo' ? styles.subTabBtnActive : {}) }}
          >
            Catálogo ({trainings.length})
          </button>
          <button 
            onClick={() => setSubTab('participacoes')}
            style={{ ...styles.subTabBtn, ...(subTab === 'participacoes' ? styles.subTabBtnActive : {}) }}
          >
            Participações ({submissions.length})
          </button>
          <button 
            onClick={() => setSubTab('reciclagem')}
            style={{ ...styles.subTabBtn, ...(subTab === 'reciclagem' ? styles.subTabBtnActive : {}) }}
          >
            Reciclagem ({expiringSubmissions.length})
          </button>
        </div>

        <div style={styles.actionButtons}>
          <button 
            onClick={handleSyncTemplates}
            style={styles.dossierBtn}
            title="Sincronizar os 15 treinamentos oficiais de nefrologia no banco"
          >
            <RefreshCw size={15} />
            <span>Sincronizar</span>
          </button>
          <button 
            onClick={() => setShowDossierModal(true)}
            style={styles.dossierBtn}
          >
            <FileText size={16} />
            <span>Dossiê VISA</span>
          </button>
          <button 
            onClick={() => {
              setEditingTraining(null);
              setShowTrainingModal(true);
            }}
            style={styles.primaryBtn}
          >
            <Plus size={16} />
            <span>Treinamento</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DA SUB-ABA 1: CATÁLOGO */}
      {subTab === 'catalogo' && (
        <div style={styles.catalogGrid}>
          {trainings.map(t => {
            const trnSubmissions = submissions.filter(s => s.trainingId === t.id);
            const trnApproved = trnSubmissions.filter(s => s.passed || s.status === 'Aprovado');

            return (
              <div key={t.id} style={styles.trainingCard}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardSectorTag}>{t.sector || 'Geral'}</span>
                  <span style={{
                    ...styles.statusTag,
                    backgroundColor: t.status === 'Ativo' ? '#dcfce7' : '#f1f5f9',
                    color: t.status === 'Ativo' ? '#166534' : '#64748b'
                  }}>
                    {t.status}
                  </span>
                </div>

                <h3 style={styles.cardTitle}>{t.title}</h3>
                <p style={styles.cardDesc}>{t.description}</p>

                <div style={styles.cardMeta}>
                  <span style={styles.metaItem}>
                    <Clock size={12} /> {t.workloadHours || 2}h
                  </span>
                  <span style={styles.metaItem}>
                    <ShieldCheck size={12} /> Mín: {t.minPassingScore || 70}%
                  </span>
                  <span style={styles.metaItem}>
                    <Users size={12} /> {trnApproved.length} certificados
                  </span>
                </div>

                <div style={styles.cardActions}>
                  <button 
                    onClick={() => {
                      setSelectedForQr(t);
                      setShowQrModal(true);
                    }}
                    style={styles.cardActionBtn}
                    title="Gerar Link e QR Code de Divulgação"
                  >
                    <QrCode size={15} />
                    <span>Divulgar</span>
                  </button>
                  <button 
                    onClick={() => {
                      setEditingTraining(t);
                      setShowTrainingModal(true);
                    }}
                    style={styles.cardActionBtn}
                    title="Editar Treinamento"
                  >
                    <Edit2 size={15} />
                    <span>Editar</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteTraining(t.id)}
                    style={{ ...styles.cardActionBtn, color: '#ef4444' }}
                    title="Excluir Treinamento"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          {trainings.length === 0 && !loading && (
            <div style={styles.emptyCard}>
              <GraduationCap size={36} color="#94a3b8" />
              <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                Nenhum treinamento cadastrado. Clique no botão "+ Treinamento" para iniciar.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 2: PARTICIPAÇÕES & AUDITORIA */}
      {subTab === 'participacoes' && (
        <div style={styles.tableCard}>
          {/* Barra de Filtros */}
          <div style={styles.filterRow}>
            <div style={styles.searchBox}>
              <Search size={16} color="#64748b" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por colaborador, CPF ou treinamento..."
                style={styles.searchInput}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                value={sectorFilter} 
                onChange={e => setSectorFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="Todos">Setor: Todos</option>
                {Array.from(new Set(submissions.map(s => s.sector).filter(Boolean))).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="Todos">Status: Todos</option>
                <option value="Aprovado">Aprovados</option>
                <option value="Reprovado">Reprovados</option>
              </select>
            </div>
          </div>

          {/* Tabela de Participações */}
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Colaborador</th>
                  <th style={styles.th}>CPF</th>
                  <th style={styles.th}>Treinamento</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Pré</th>
                  <th style={styles.th}>Pós</th>
                  <th style={styles.th}>Eficácia</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Certificado</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(s => {
                  const trn = trainings.find(t => t.id === s.trainingId);
                  const isApp = s.passed || s.status === 'Aprovado';

                  return (
                    <tr key={s.id} style={styles.tr}>
                      <td style={styles.td}>{formatDate(s.completedAt)}</td>
                      <td style={{ ...styles.td, fontWeight: 700, color: '#0f172a' }}>{s.employeeName}</td>
                      <td style={{ ...styles.td, fontSize: '0.8rem', color: '#64748b' }}>{s.cpf || '-'}</td>
                      <td style={{ ...styles.td, fontWeight: 500 }}>{s.trainingTitle}</td>
                      <td style={styles.td}>{s.sector || 'Geral'}</td>
                      <td style={styles.td}>{s.preScore}%</td>
                      <td style={{ ...styles.td, fontWeight: 700 }}>{s.postScore}%</td>
                      <td style={{ ...styles.td, color: '#15803d', fontWeight: 800 }}>+{s.gainEfficacy}%</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusTag,
                          backgroundColor: isApp ? '#dcfce7' : '#fee2e2',
                          color: isApp ? '#15803d' : '#b91c1c'
                        }}>
                          {isApp ? 'Aprovado' : 'Reprovado'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        {isApp ? (
                          <button 
                            onClick={() => setViewingCertificate({ submission: s, training: trn })}
                            style={styles.certBtn}
                            title="Visualizar e Imprimir Certificado Oficial"
                          >
                            <Award size={14} />
                            <span>Certificado</span>
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={10} style={styles.emptyTd}>
                      Nenhuma participação localizada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 3: MATRIZ DE RECICLAGEM */}
      {subTab === 'reciclagem' && (
        <div style={styles.tableCard}>
          <div style={styles.reciclagemBanner}>
            <Clock size={20} color="#d97706" />
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>Controle de Reciclagem Anual & Validades</h4>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#b45309' }}>
                Conforme exigência sanitária, capacitações obrigatórias (como NR-32 e PGRSS) devem ser recicladas a cada 12 meses.
              </p>
            </div>
          </div>

          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Colaborador</th>
                  <th style={styles.th}>Treinamento</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Última Realização</th>
                  <th style={styles.th}>Vencimento</th>
                  <th style={styles.th}>Situação</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => {
                  const trn = trainings.find(t => t.id === s.trainingId);
                  const expDate = s.expiresAt ? new Date(s.expiresAt) : null;
                  const isExpired = expDate && expDate.getTime() < nowMs;
                  const isExpiringSoon = expDate && expDate.getTime() - nowMs <= thirtyDaysMs;

                  let situationTag = { text: 'Em dia', bg: '#dcfce7', color: '#15803d' };
                  if (isExpired) {
                    situationTag = { text: 'Vencido', bg: '#fee2e2', color: '#b91c1c' };
                  } else if (isExpiringSoon) {
                    situationTag = { text: 'A Vencer', bg: '#fef3c7', color: '#b45309' };
                  }

                  return (
                    <tr key={s.id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: 700 }}>{s.employeeName}</td>
                      <td style={styles.td}>{s.trainingTitle}</td>
                      <td style={styles.td}>{s.sector || 'Geral'}</td>
                      <td style={styles.td}>{formatDate(s.completedAt)}</td>
                      <td style={styles.td}>{formatDate(s.expiresAt)}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusTag,
                          backgroundColor: situationTag.bg,
                          color: situationTag.color
                        }}>
                          {situationTag.text}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button 
                          onClick={() => {
                            if (trn) {
                              setSelectedForQr(trn);
                              setShowQrModal(true);
                            }
                          }}
                          style={styles.reciclarLinkBtn}
                        >
                          <RefreshCw size={12} />
                          <span>Link Reciclagem</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modais */}
      {showTrainingModal && (
        <TrainingModal 
          training={editingTraining}
          onSave={handleSaveTraining}
          onClose={() => {
            setShowTrainingModal(false);
            setEditingTraining(null);
          }}
        />
      )}

      {showQrModal && selectedForQr && (
        <TrainingQrModal 
          training={selectedForQr}
          onClose={() => {
            setShowQrModal(false);
            setSelectedForQr(null);
          }}
        />
      )}

      {showDossierModal && (
        <TrainingDossierModal 
          trainings={trainings}
          submissions={submissions}
          onClose={() => setShowDossierModal(false)}
        />
      )}

      {viewingCertificate && (
        <CertificateView 
          submission={viewingCertificate.submission}
          training={viewingCertificate.training}
          onClose={() => setViewingCertificate(null)}
        />
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '1rem'
  },
  kpiCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '12px',
    padding: '1.15rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  kpiTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem'
  },
  kpiLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#64748b'
  },
  kpiIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiValue: {
    fontSize: '1.65rem',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.15
  },
  kpiSub: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    marginTop: '0.2rem'
  },
  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.5rem'
  },
  subTabs: {
    display: 'flex',
    gap: '0.5rem'
  },
  subTabBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0.55rem 0.9rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer'
  },
  subTabBtnActive: {
    color: '#4f46e5',
    borderBottomColor: '#4f46e5',
    fontWeight: 700
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  dossierBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.5rem 0.9rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem'
  },
  trainingCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  cardSectorTag: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px'
  },
  statusTag: {
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: '10px'
  },
  cardTitle: {
    margin: '0.2rem 0 0.4rem 0',
    fontSize: '1rem',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.3
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '0 0 1rem 0',
    lineHeight: 1.4,
    flex: 1
  },
  cardMeta: {
    display: 'flex',
    gap: '0.75rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.65rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: 600
  },
  cardActions: {
    display: 'flex',
    gap: '0.4rem'
  },
  cardActionBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.45rem',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer'
  },
  emptyCard: {
    gridColumn: '1 / -1',
    backgroundColor: '#ffffff',
    border: '1px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  tableCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  filterRow: {
    padding: '0.85rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem',
    backgroundColor: '#f8fafc'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.75rem',
    flex: 1,
    maxWidth: '420px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.82rem',
    width: '100%',
    color: '#0f172a'
  },
  filterSelect: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.7rem',
    fontSize: '0.8rem',
    color: '#334155',
    outline: 'none'
  },
  tableScroll: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem'
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: 700,
    padding: '0.65rem 0.9rem',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '0.65rem 0.9rem',
    color: '#334155'
  },
  certBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    border: '1px solid #c7d2fe',
    borderRadius: '6px',
    padding: '0.3rem 0.65rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  emptyTd: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b'
  },
  reciclagemBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#fffbeb',
    borderBottom: '1px solid #fef3c7',
    padding: '0.85rem 1.25rem'
  },
  reciclarLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer'
  }
};

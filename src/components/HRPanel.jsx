import React, { useState, useEffect } from 'react';
import { dbService, authService } from '../firebase';
import { 
  Users, UserPlus, Shield, Lock, Unlock, Edit2, Trash2, Plus, X, 
  Search, FileText, UploadCloud, Download, Calendar, ShieldAlert,
  CheckCircle2, AlertTriangle, Eye, Award, Check, UserCheck, HelpCircle,
  Gift, Bus, ArrowUp, ArrowDown, ArrowUpDown, Move, Settings, Save, 
  RotateCcw, ChevronLeft, ChevronRight, Maximize2, Minimize2
} from 'lucide-react';

const DEFAULT_DASHBOARD_LAYOUT = [
  { id: 'total_employees', title: 'Total de Funcionários', size: 'small' },
  { id: 'turnover', title: 'Turnover (Mensal)', size: 'small' },
  { id: 'absenteeism', title: 'Absenteísmo (Mensal)', size: 'small' },
  { id: 'warnings_kpi', title: 'Advertências Registradas', size: 'small' },
  { id: 'experience_kpi', title: 'Em Experiência', size: 'small' },
  { id: 'birthdays', title: 'Aniversariantes do Mês', size: 'small' },
  { id: 'warnings_list', title: 'Últimas Advertências', size: 'small' },
  { id: 'vaccines_list', title: 'Próximas Vacinações Vencendo', size: 'small' },
  { id: 'absences_list', title: 'Últimas Ausências / Faltas', size: 'small' },
  { id: 'expiring_contracts', title: 'Contratos em Experiência', size: 'small' },
  { id: 'presenca_premiada', title: 'Presença Premiada', size: 'small' },
];

import { useHRLogic } from './HR/hooks/useHRLogic';

export default function HRPanel({ currentUser }) {
  const logic = useHRLogic(currentUser);
  const {
    activeTab,
    setActiveTab,
    employees,
    setEmployees,
    usersList,
    setUsersList,
    sectors,
    setSectors,
    auditLogs,
    setAuditLogs,
    loading,
    setLoading,
    actionLoading,
    setActionLoading,
    message,
    setMessage,
    operatorEmail,
    setOperatorEmail,
    searchTerm,
    setSearchTerm,
    filterSector,
    setFilterSector,
    filterStatus,
    setFilterStatus,
    sortConfig,
    setSortConfig,
    dashboardLayout,
    setDashboardLayout,
    isCustomizingDashboard,
    setIsCustomizingDashboard,
    showEmpModal,
    setShowEmpModal,
    editingEmp,
    setEditingEmp,
    empActiveTab,
    setEmpActiveTab,
    empForm,
    setEmpForm,
    showUserModal,
    setShowUserModal,
    editingUser,
    setEditingUser,
    userForm,
    setUserForm,
    tempPasswordMessage,
    setTempPasswordMessage,
    newDep,
    setNewDep,
    newWarning,
    setNewWarning,
    newVaccine,
    setNewVaccine,
    newDoc,
    setNewDoc,
    newAbsence,
    setNewAbsence,
    csvData,
    setCsvData,
    csvErrors,
    setCsvErrors,
    showImportPreview,
    setShowImportPreview,
    transportVouchers,
    setTransportVouchers,
    showVoucherModal,
    setShowVoucherModal,
    editingVoucher,
    setEditingVoucher,
    voucherForm,
    setVoucherForm,
    awardValue,
    setAwardValue,
    fetchData,
    showAlert,
    logAuditAction,
    formatCpf,
    handleOpenEmpAdd,
    handleOpenEmpEdit,
    handleSaveEmployee,
    handleDeleteEmployee,
    handleOpenVoucherAdd,
    handleOpenVoucherEdit,
    handleSaveVoucher,
    handleDeleteVoucher,
    handlePhotoUpload,
    handleDocBase64Upload,
    handleAddDependent,
    handleAddWarning,
    handleAddVaccine,
    handleAddDocument,
    handleAddAbsence,
    handleOpenUserAdd,
    handleOpenUserEdit,
    handleSaveUser,
    handleResetPassword,
    handleToggleUserStatus,
    handleDeleteUser,
    handleDownloadTemplate,
    handleCsvUpload,
    handleConfirmCsvImport,
    downloadCsv,
    handleExportFullCadaster,
    handleExportBirthdays,
    handleExportWarnings,
    handleSaveDashboardLayout,
    handleResetDashboardLayout,
    handleMoveCard,
    handleChangeCardSize,
    handleOpenEmpByName,
    handleSort,
    renderSortIcon,
    getFilteredEmployees,
    getRecentWarnings,
    getUpcomingVaccines,
    isEmployeeInProbation,
    getExpiringContracts,
    getPresencaPremiadaData,
    calculateCurrentMonthMetrics,
    getBirthdaysThisMonth,
    birthdaysThisMonth,
    filteredEmployees,
    recentWarnings,
    upcomingVaccines,
    expiringContracts,
    presencaPremiada,
    turnover,
    absenteeism,
    recentAbsences
  } = logic;

  return (
    <div style={styles.container}>
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaHR - Recursos Humanos & Governança</h1>
          <p style={styles.subtitle}>Gerenciamento completo de equipe, controle de permissões de usuários, central de arquivos e logs de auditoria.</p>
        </div>
      </div>

      {/* Primary Tabs */}
      <div style={styles.tabsWrapper}>
        <button onClick={() => setActiveTab('dashboard')} style={{ ...styles.tabBtn, ...(activeTab === 'dashboard' ? styles.tabBtnActive : {}) }}>
          Painel de Controle
        </button>
        <button onClick={() => setActiveTab('employees')} style={{ ...styles.tabBtn, ...(activeTab === 'employees' ? styles.tabBtnActive : {}) }}>
          <Users size={16} /> Funcionários ({employees.filter(e => e.status !== 'Inativo').length})
        </button>
        <button onClick={() => setActiveTab('transport')} style={{ ...styles.tabBtn, ...(activeTab === 'transport' ? styles.tabBtnActive : {}) }}>
          <Bus size={16} /> Vale-Transporte
        </button>
        <button onClick={() => setActiveTab('reports')} style={{ ...styles.tabBtn, ...(activeTab === 'reports' ? styles.tabBtnActive : {}) }}>
          <FileText size={16} /> Relatórios & Importação
        </button>
        <button onClick={() => setActiveTab('audit')} style={{ ...styles.tabBtn, ...(activeTab === 'audit' ? styles.tabBtnActive : {}) }}>
          Auditoria & Logs
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light)`, border: `1px solid var(--${message.type}-color)` }}>
          <ShieldAlert size={18} color={`var(--${message.type}-color)`} />
          <span style={{ color: `var(--${message.type}-color)`, fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Carregando módulo de RH...</div>
      ) : (
        <>
          {/* TAB 1: Dashboard / KPIs */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Header Bar with Layout Customization Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 Painel de Controle Operacional
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    Reorganize e altere o tamanho das caixas conforme sua necessidade de gestão. Padrão inicial em tamanho pequeno.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setIsCustomizingDashboard(!isCustomizingDashboard)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      backgroundColor: isCustomizingDashboard ? '#ec4899' : 'var(--bg-body)',
                      color: isCustomizingDashboard ? '#fff' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Settings size={15} /> {isCustomizingDashboard ? 'Concluir Organização' : '⚙️ Organizar Caixas'}
                  </button>
                  {isCustomizingDashboard && (
                    <>
                      <button 
                        onClick={() => handleSaveDashboardLayout(dashboardLayout)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        <Save size={15} /> Salvar Layout
                      </button>
                      <button 
                        onClick={handleResetDashboardLayout}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: 'var(--bg-body)', color: 'var(--danger-color)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                      >
                        <RotateCcw size={15} /> Restaurar Padrão
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Grid Container */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1rem',
                alignItems: 'stretch'
              }}>
                {dashboardLayout.map((card, index) => {
                  const getSpanStyle = (sz) => {
                    if (sz === 'medium') return { gridColumn: 'span 2' };
                    if (sz === 'large') return { gridColumn: 'span 3' };
                    return { gridColumn: 'span 1' }; // default small
                  };

                  return (
                    <div 
                      key={card.id} 
                      style={{
                        ...getSpanStyle(card.size),
                        position: 'relative',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-card)',
                        border: isCustomizingDashboard ? '2px dashed #ec4899' : '1px solid var(--border-color)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Controls overlay in customizing mode */}
                      {isCustomizingDashboard && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(236,72,153,0.08)', padding: '0.35rem 0.5rem', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <button disabled={index === 0} onClick={() => handleMoveCard(index, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1 }} title="Mover para esquerda/cima"><ChevronLeft size={16} /></button>
                            <button disabled={index === dashboardLayout.length - 1} onClick={() => handleMoveCard(index, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: index === dashboardLayout.length - 1 ? 0.3 : 1 }} title="Mover para direita/baixo"><ChevronRight size={16} /></button>
                            <span style={{ fontWeight: '700', color: '#ec4899' }}>Pos. {index + 1}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ fontWeight: '600' }}>Tamanho:</span>
                            <select value={card.size || 'small'} onChange={e => handleChangeCardSize(card.id, e.target.value)} style={{ fontSize: '0.75rem', padding: '0.15rem 0.3rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              <option value="small">Pequeno (1 Col)</option>
                              <option value="medium">Médio (2 Col)</option>
                              <option value="large">Grande (3 Col)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Card Content Renderers */}
                      {card.id === 'total_employees' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                          <span style={styles.kpiLabel}>Total de Funcionários</span>
                          <span style={{ ...styles.kpiVal, color: '#ec4899' }}>{employees.filter(e => e.status !== 'Inativo').length}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Colaboradores ativos ({employees.length} total no banco)</span>
                        </div>
                      )}

                      {card.id === 'turnover' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                          <span style={styles.kpiLabel}>Turnover (Mensal)</span>
                          <span style={{ ...styles.kpiVal, color: '#10b981' }}>{turnover.toFixed(2)}%</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Índice de rotatividade</span>
                        </div>
                      )}

                      {card.id === 'absenteeism' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                          <span style={styles.kpiLabel}>Absenteísmo (Mensal)</span>
                          <span style={{ ...styles.kpiVal, color: '#3b82f6' }}>{absenteeism.toFixed(2)}%</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Faltas não justificadas</span>
                        </div>
                      )}

                      {card.id === 'warnings_kpi' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                          <span style={styles.kpiLabel}>Advertências Registradas</span>
                          <span style={{ ...styles.kpiVal, color: '#ef4444' }}>{recentWarnings.length}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total de advertências</span>
                        </div>
                      )}

                      {card.id === 'experience_kpi' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                          <span style={styles.kpiLabel}>Em Experiência</span>
                          <span style={{ ...styles.kpiVal, color: '#f59e0b' }}>
                            {employees.filter(e => isEmployeeInProbation(e)).length}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Contratos probatórios</span>
                        </div>
                      )}

                      {card.id === 'birthdays' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
                            <Gift size={16} /> 🎂 Aniversariantes do Mês ({birthdaysThisMonth.length})
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                            {birthdaysThisMonth.length === 0 ? (
                              <p style={styles.noDataMini}>Sem aniversariantes este mês.</p>
                            ) : (
                              birthdaysThisMonth.slice(0, 5).map((b, idx) => (
                                <div key={idx} onClick={() => handleOpenEmpByName(b.id || b.name)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-body)', cursor: 'pointer', border: '1px solid var(--border-color)' }} title={`Clique para abrir a ficha de ${b.name}`}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#db2777', overflow: 'hidden', fontSize: '0.7rem' }}>
                                    {b.photo ? <img src={b.photo} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : b.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#ec4899', textDecoration: 'underline' }}>{b.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dia {b.day} ({b.role})</div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {card.id === 'warnings_list' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>⚠️ Últimas Advertências</h3>
                          <div style={styles.listWrapper}>
                            {recentWarnings.length === 0 ? (
                              <p style={styles.noDataMini}>Nenhuma advertência recente.</p>
                            ) : (
                              recentWarnings.slice(0, 4).map((w, idx) => (
                                <div key={idx} style={styles.listItem}>
                                  <div>
                                    <strong onClick={() => handleOpenEmpByName(w.empName)} style={{ color: '#ec4899', cursor: 'pointer', textDecoration: 'underline' }} title={`Abrir ficha de ${w.empName}`}>{w.empName}</strong> - {w.motive}
                                    <span style={styles.listSubText}>{w.text}</span>
                                  </div>
                                  <span style={styles.listBadge}>{new Date(w.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {card.id === 'vaccines_list' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>💉 Próximas Vacinações</h3>
                          <div style={styles.listWrapper}>
                            {upcomingVaccines.length === 0 ? (
                              <p style={styles.noDataMini}>Sem vacinas com validade próxima.</p>
                            ) : (
                              upcomingVaccines.slice(0, 4).map((v, idx) => (
                                <div key={idx} style={styles.listItem}>
                                  <div>
                                    <strong onClick={() => handleOpenEmpByName(v.empName)} style={{ color: '#ec4899', cursor: 'pointer', textDecoration: 'underline' }} title={`Abrir ficha de ${v.empName}`}>{v.empName}</strong> - {v.name}
                                    <span style={styles.listSubText}>Lote: {v.lot || '-'}</span>
                                  </div>
                                  <span style={{ ...styles.listBadge, backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                    Vence: {new Date(v.expiryDate).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {card.id === 'absences_list' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>📅 Últimas Ausências</h3>
                          <div style={styles.listWrapper}>
                            {recentAbsences.length === 0 ? (
                              <p style={styles.noDataMini}>Nenhuma ausência registrada.</p>
                            ) : (
                              recentAbsences.slice(0, 4).map((abs, idx) => (
                                <div key={idx} style={styles.listItem}>
                                  <div>
                                    <strong onClick={() => handleOpenEmpByName(abs.empName)} style={{ color: '#ec4899', cursor: 'pointer', textDecoration: 'underline' }} title={`Abrir ficha de ${abs.empName}`}>{abs.empName}</strong> - {abs.type} ({abs.hours}h)
                                    <span style={styles.listSubText}>{abs.motive || 'Sem observação'}</span>
                                  </div>
                                  <span style={{ 
                                    ...styles.listBadge, 
                                    backgroundColor: abs.type === 'Falta Injustificada' ? '#fee2e2' : '#f1f5f9',
                                    color: abs.type === 'Falta Injustificada' ? '#991b1b' : '#475569' 
                                  }}>
                                    {new Date(abs.date).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {card.id === 'expiring_contracts' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>⏳ Contratos em Experiência</h3>
                          <div style={styles.listWrapper}>
                            {expiringContracts.length === 0 ? (
                              <p style={styles.noDataMini}>Nenhum contrato em experiência no período.</p>
                            ) : (
                              expiringContracts.slice(0, 4).map((e, idx) => {
                                const target = e.expTargetDate ? e.expTargetDate : new Date(new Date(e.admissionDate).getTime() + 90 * 24 * 60 * 60 * 1000);
                                return (
                                  <div key={idx} style={styles.listItem}>
                                    <div>
                                      <strong onClick={() => handleOpenEmpEdit(e)} style={{ color: '#ec4899', cursor: 'pointer', textDecoration: 'underline' }} title={`Abrir ficha de ${e.name}`}>{e.name}</strong>
                                      <span style={styles.listSubText}>{e.role} {e.expStageLabel ? `• ${e.expStageLabel}` : ''}</span>
                                    </div>
                                    <span style={{ ...styles.listBadge, backgroundColor: '#fef3c7', color: '#d97706' }}>
                                      Vence: {target.toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {card.id === 'presenca_premiada' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              🏆 Presença Premiada
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Prêmio: R$</span>
                              <input 
                                type="number" 
                                value={awardValue} 
                                onChange={e => setAwardValue(Math.max(0, parseFloat(e.target.value) || 0))}
                                style={{ width: '55px', padding: '0.1rem 0.2rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                            <span style={{ color: '#10b981', fontWeight: '700' }}>Elegíveis: {presencaPremiada.eligible.length}</span>
                            <span style={{ color: '#ef4444', fontWeight: '700' }}>Excluídos: {presencaPremiada.disqualified.length}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '120px', overflowY: 'auto' }}>
                            {presencaPremiada.eligible.slice(0, 4).map(emp => (
                              <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '4px', backgroundColor: 'rgba(16,185,129,0.05)' }}>
                                <span onClick={() => handleOpenEmpEdit(emp)} style={{ fontWeight: '600', color: '#ec4899', cursor: 'pointer', textDecoration: 'underline' }}>{emp.name}</span>
                                <span style={{ fontWeight: '700', color: '#10b981' }}>+R$ {awardValue.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: Vale-Transporte */}
          {activeTab === 'transport' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-color)' }}>Benefício de Vale-Transporte (VT)</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configuração de itinerários, controle de recargas e simulação de descontos em folha de pagamento.</p>
                </div>
                <button onClick={handleOpenVoucherAdd} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#ec4899' }}>
                  <Plus size={16} /> Nova Concessão
                </button>
              </div>

              {/* VT Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#ec4899', display: 'flex', flexDirection: 'column' }}>
                  <span style={styles.kpiLabel}>Total de Beneficiários</span>
                  <span style={styles.kpiVal}>{transportVouchers.length}</span>
                </div>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#10b981', display: 'flex', flexDirection: 'column' }}>
                  <span style={styles.kpiLabel}>Custo Bruto Mensal VT</span>
                  <span style={styles.kpiVal}>
                    R$ {transportVouchers.reduce((acc, curr) => acc + ((parseFloat(curr.dailyCost) || 0) * (parseInt(curr.daysCount) || 0)), 0).toFixed(2)}
                  </span>
                </div>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#3b82f6', display: 'flex', flexDirection: 'column' }}>
                  <span style={styles.kpiLabel}>Desconto Consolidado em Folha</span>
                  <span style={styles.kpiVal}>
                    R$ {transportVouchers.reduce((acc, curr) => {
                      const emp = employees.find(e => e.id === curr.employeeId);
                      const sal = emp ? parseFloat(emp.salary) || 0 : 0;
                      const maxDiscount = sal * 0.06;
                      const totalCost = (parseFloat(curr.dailyCost) || 0) * (parseInt(curr.daysCount) || 0);
                      const actualDiscount = Math.min(maxDiscount, totalCost);
                      return acc + actualDiscount;
                    }, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                overflowX: 'auto'
              }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Funcionário</th>
                      <th>Cargo / Setor</th>
                      <th>Itinerário / Rota</th>
                      <th>Tarifa Diária</th>
                      <th>Dias Recarga</th>
                      <th>Valor Carga</th>
                      <th>Desconto Salarial (6%)</th>
                      <th>Cartão</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transportVouchers.length === 0 ? (
                      <tr><td colSpan="9" style={styles.noDataCell}>Nenhuma concessão de vale-transporte configurada.</td></tr>
                    ) : (
                      transportVouchers.map((v) => {
                        const emp = employees.find(e => e.id === v.employeeId);
                        const empName = emp ? emp.name : 'Desconhecido';
                        const empRole = emp ? emp.role : '-';
                        const empSector = emp ? (sectors.find(s => s.id === emp.sectorId)?.name || emp.sectorId) : '-';
                        const sal = emp ? parseFloat(emp.salary) || 0 : 0;
                        const maxDiscount = sal * 0.06;
                        const totalCost = (parseFloat(v.dailyCost) || 0) * (parseInt(v.daysCount) || 0);
                        const actualDiscount = Math.min(maxDiscount, totalCost);

                        return (
                          <tr key={v.id}>
                            <td style={{ fontWeight: '600' }}>{empName}</td>
                            <td>{empRole} ({empSector})</td>
                            <td>
                              <div style={{ fontWeight: '500' }}>{v.route}</div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.cardType} - {v.cardNumber || 'Sem cartão'}</span>
                            </td>
                            <td>R$ {parseFloat(v.dailyCost || 0).toFixed(2)}</td>
                            <td style={{ fontWeight: '700' }}>{v.daysCount} dias</td>
                            <td style={{ color: '#10b981', fontWeight: '700' }}>R$ {totalCost.toFixed(2)}</td>
                            <td style={{ color: '#ef4444', fontWeight: '600' }}>
                              R$ {actualDiscount.toFixed(2)}
                              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                                ({maxDiscount > totalCost ? 'Desconto integral' : 'Limite 6% atingido'})
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '12px', 
                                fontSize: '0.75rem', 
                                fontWeight: '700',
                                backgroundColor: '#f1f5f9',
                                color: '#475569'
                              }}>
                                {v.cardType}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleOpenVoucherEdit(v)} style={styles.actionEditBtn}>
                                  Editar
                                </button>
                                <button onClick={() => handleDeleteVoucher(v.id)} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Employees Directory */}
          {activeTab === 'employees' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.filtersBar}>
                <div style={styles.searchWrapper}>
                  <Search size={18} style={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar funcionário por nome ou CPF..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
                <div style={{ ...styles.selectsWrapper, display: 'flex', gap: '0.5rem' }}>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}>
                    <option value="active">Apenas Ativos ({employees.filter(e => e.status !== 'Inativo').length})</option>
                    <option value="inactive">Inativos / Demitidos ({employees.filter(e => e.status === 'Inativo').length})</option>
                    <option value="all">Todos os Registros ({employees.length})</option>
                  </select>
                  <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={styles.filterSelect}>
                    <option value="">Todos os Setores</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <button onClick={handleOpenEmpAdd} style={styles.addBtn}>
                  <Plus size={16} /> Novo Funcionário
                </button>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Nome">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          Funcionário {renderSortIcon('name')}
                        </div>
                      </th>
                      <th onClick={() => handleSort('cpf')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por CPF">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          CPF {renderSortIcon('cpf')}
                        </div>
                      </th>
                      <th onClick={() => handleSort('role')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Cargo">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          Setor / Cargo {renderSortIcon('role')}
                        </div>
                      </th>
                      <th onClick={() => handleSort('contractType')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Contrato">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          Tipo Contrato {renderSortIcon('contractType')}
                        </div>
                      </th>
                      <th onClick={() => handleSort('admissionDate')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Admissão">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          Admissão {renderSortIcon('admissionDate')}
                        </div>
                      </th>
                      <th onClick={() => handleSort('warnings')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Pendências">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          Pendências {renderSortIcon('warnings')}
                        </div>
                      </th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={styles.noDataCell}>Nenhum funcionário cadastrado ou encontrado.</td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => {
                        const warnCount = emp.warnings?.length || 0;
                        const docCount = emp.documents?.length || 0;
                        return (
                          <tr key={emp.id}>
                            <td onClick={() => handleOpenEmpEdit(emp)} style={{ cursor: 'pointer' }} title={`Clique para abrir a ficha de ${emp.name}`}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                                {emp.photo ? (
                                  <img src={emp.photo} alt={emp.name} style={styles.tablePhoto} />
                                ) : (
                                  <div style={styles.tablePhotoPlaceholder}>{emp.name.charAt(0)}</div>
                                )}
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ fontWeight: '700', color: emp.status === 'Inativo' ? 'var(--text-muted)' : '#ec4899', textDecoration: 'underline' }}>{emp.name}</div>
                                    {emp.status === 'Inativo' && (
                                      <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '700' }}>Inativo</span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{emp.cpf}</td>
                            <td>
                              <div style={{ fontWeight: '600' }}>{emp.role}</div>
                              <span style={styles.categoryBadge}>{sectors.find(s => s.id === emp.sectorId)?.name || emp.sectorId}</span>
                            </td>
                            <td>{emp.contractType}</td>
                            <td>{emp.admissionDate ? new Date(emp.admissionDate).toLocaleDateString('pt-BR') : '-'}</td>
                            <td>
                              {warnCount > 0 && <span style={{ ...styles.badgeCritical, marginRight: '0.25rem' }}>{warnCount} Adv.</span>}
                              {docCount > 0 && <span style={styles.badgeNormal}>{docCount} Docs</span>}
                              {warnCount === 0 && docCount === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhuma</span>}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button onClick={() => handleOpenEmpEdit(emp)} style={styles.actionEditBtn} title="Abrir Ficha do Funcionário">Ficha</button>
                                <button onClick={() => handleDeleteEmployee(emp)} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)', borderColor: 'rgba(239,68,68,0.2)' }}>Excluir</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Reports & Import */}
          {activeTab === 'reports' && (
            <div style={styles.reportsGrid}>
              <div style={styles.kpiSection}>
                <h3>⬇️ Exportar Relatórios do RH</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Baixe as listagens operacionais em formato compatível com o Excel (CSV).</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button onClick={handleExportFullCadaster} style={styles.downloadReportBtn}>
                    <Download size={16} /> Cadastro Geral de Funcionários
                  </button>
                  <button onClick={handleExportBirthdays} style={styles.downloadReportBtn}>
                    <Download size={16} /> Aniversariantes do Mês
                  </button>
                  <button onClick={handleExportWarnings} style={styles.downloadReportBtn}>
                    <Download size={16} /> Histórico de Advertências Disciplinares
                  </button>
                </div>
              </div>

              <div style={styles.kpiSection}>
                <h3>⬆️ Importador em Lote (CSV)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Importe fichas de funcionários em lote. Faça o download do modelo abaixo antes do envio.</p>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <button onClick={handleDownloadTemplate} style={{ ...styles.txBtn, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Download size={16} /> Baixar Modelo CSV
                  </button>
                  
                  <input type="file" accept=".csv" onChange={handleCsvUpload} id="csv-upload-input" style={{ display: 'none' }} />
                  <label htmlFor="csv-upload-input" className="btn btn-primary" style={{ backgroundColor: '#ec4899', cursor: 'pointer', margin: 0 }}>
                    <UploadCloud size={16} /> Enviar CSV
                  </label>
                </div>

                {showImportPreview && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '1rem', backgroundColor: '#fafafa' }}>
                    <h4>Preview de Importação ({csvData.length} linhas detectadas)</h4>
                    {csvErrors.length > 0 ? (
                      <div style={styles.warningBanner}>
                        <AlertTriangle size={18} />
                        <span>Erros de validação encontrados:</span>
                        <ul style={{ fontSize: '0.8rem', paddingLeft: '1.25rem' }}>
                          {csvErrors.map((err, idx) => <li key={idx}>Linha {err.line} ({err.item}): {err.message}</li>)}
                        </ul>
                      </div>
                    ) : (
                      <div style={{ ...styles.alert, backgroundColor: 'var(--success-light)', color: 'var(--success-color)', border: '1px solid var(--success-color)' }}>
                        <CheckCircle2 size={18} />
                        <span>Tudo pronto! Nenhuma falha detectada. Pronto para importar.</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                      <button onClick={() => setShowImportPreview(false)} className="btn btn-secondary">Cancelar</button>
                      <button onClick={handleConfirmCsvImport} disabled={csvErrors.length > 0} className="btn btn-primary" style={{ backgroundColor: 'var(--success-color)' }}>
                        Confirmar Carga
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Audit Logs */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: '700' }}>Log de Auditoria de Governança</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registra automaticamente alterações cruciais (LGPD / Segurança)</span>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Operador</th>
                      <th>Ação Executada</th>
                      <th>Histórico / Alterações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(log => (
                        <tr key={log.id}>
                          <td>{new Date(log.date).toLocaleString('pt-BR')}</td>
                          <td style={{ fontWeight: '600' }}>
                            {log.operator === 'rh@clinica.com' ? 'Ana Carolina Cerqueira Gonzaga' : log.operator}
                          </td>
                          <td><span style={styles.categoryBadge}>{log.action}</span></td>
                          <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', maxWidth: '350px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {log.details}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Employee Modal (Ficha Completa) */}
      {showEmpModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '850px', width: '95%' }}>
            <div style={styles.modalHeader}>
              <h2>{editingEmp ? `Ficha: ${empForm.name}` : 'Cadastrar Funcionário'}</h2>
              <button onClick={() => setShowEmpModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            {/* Modal Internal Tabs */}
            <div style={styles.wizardStepsBar}>
              <div onClick={() => setEmpActiveTab('pessoais')} style={{ ...styles.wizardStep, ...(empActiveTab === 'pessoais' ? styles.wizardStepActive : {}) }}>1. Pessoais</div>
              <div onClick={() => setEmpActiveTab('contato')} style={{ ...styles.wizardStep, ...(empActiveTab === 'contato' ? styles.wizardStepActive : {}) }}>2. Contato</div>
              <div onClick={() => setEmpActiveTab('profissionais')} style={{ ...styles.wizardStep, ...(empActiveTab === 'profissionais' ? styles.wizardStepActive : {}) }}>3. Contratos</div>
              <div onClick={() => setEmpActiveTab('bancarios')} style={{ ...styles.wizardStep, ...(empActiveTab === 'bancarios' ? styles.wizardStepActive : {}) }}>4. Bancários</div>
              <div onClick={() => setEmpActiveTab('dependentes')} style={{ ...styles.wizardStep, ...(empActiveTab === 'dependentes' ? styles.wizardStepActive : {}) }}>5. Dependentes ({empForm.dependents.length})</div>
              <div onClick={() => setEmpActiveTab('warnings')} style={{ ...styles.wizardStep, ...(empActiveTab === 'warnings' ? styles.wizardStepActive : {}) }}>6. Adv. ({empForm.warnings.length})</div>
              <div onClick={() => setEmpActiveTab('vaccines')} style={{ ...styles.wizardStep, ...(empActiveTab === 'vaccines' ? styles.wizardStepActive : {}) }}>7. Vacinas ({empForm.vaccinations.length})</div>
              <div onClick={() => setEmpActiveTab('documents')} style={{ ...styles.wizardStep, ...(empActiveTab === 'documents' ? styles.wizardStepActive : {}) }}>8. Arquivos ({empForm.documents.length})</div>
              <div onClick={() => setEmpActiveTab('absences')} style={{ ...styles.wizardStep, ...(empActiveTab === 'absences' ? styles.wizardStepActive : {}) }}>9. Ausências ({empForm.absences ? empForm.absences.length : 0})</div>
            </div>

            <form onSubmit={handleSaveEmployee} style={styles.modalForm}>
              <div style={{ maxHeight: '55vh', overflowY: 'auto', padding: '0.25rem' }}>
                
                {/* SUBTAB 1: Pessoais */}
                {empActiveTab === 'pessoais' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Photo Upload area */}
                    <div style={styles.photoUploadContainer}>
                      <div style={styles.photoPreviewWrapper}>
                        {empForm.photo ? (
                          <img src={empForm.photo} alt="Foto" style={styles.photoPreview} />
                        ) : (
                          <div style={styles.photoPlaceholder}><Users size={32} color="var(--text-muted)" /></div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Foto de Crachá</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} id="emp-photo-upload" style={{ display: 'none' }} />
                        <label htmlFor="emp-photo-upload" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'inline-block' }}>Carregar Imagem</label>
                        {empForm.photo && <button type="button" onClick={() => setEmpForm(f => ({ ...f, photo: '' }))} className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Remover</button>}
                      </div>
                    </div>

                    <div style={styles.formGrid}>
                      <div className="form-group">
                        <label>Nome Completo *</label>
                        <input type="text" className="form-control" required value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>CPF *</label>
                        <input type="text" className="form-control" required value={empForm.cpf} onChange={e => setEmpForm({ ...empForm, cpf: formatCpf(e.target.value) })} />
                      </div>
                      <div className="form-group">
                        <label>Data de Nascimento *</label>
                        <input type="date" className="form-control" required value={empForm.birthDate} onChange={e => setEmpForm({ ...empForm, birthDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Gênero</label>
                        <select className="form-control" value={empForm.gender} onChange={e => setEmpForm({ ...empForm, gender: e.target.value })}>
                          <option value="Feminino">Feminino</option>
                          <option value="Masculino">Masculino</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>RG</label>
                        <input type="text" className="form-control" value={empForm.rg} onChange={e => setEmpForm({ ...empForm, rg: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Nome da Mãe</label>
                        <input type="text" className="form-control" value={empForm.motherName} onChange={e => setEmpForm({ ...empForm, motherName: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: Contato */}
                {empActiveTab === 'contato' && (
                  <div style={styles.formGrid}>
                    <div className="form-group">
                      <label>Telefone Contato</label>
                      <input type="text" className="form-control" placeholder="(00) 00000-0000" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>E-mail Pessoal</label>
                      <input type="email" className="form-control" placeholder="nome@provedor.com" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Endereço Completo</label>
                      <input type="text" className="form-control" placeholder="Rua, número, bairro..." value={empForm.address} onChange={e => setEmpForm({ ...empForm, address: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Cidade</label>
                      <input type="text" className="form-control" value={empForm.city} onChange={e => setEmpForm({ ...empForm, city: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>CEP</label>
                      <input type="text" className="form-control" placeholder="00000-000" value={empForm.cep} onChange={e => setEmpForm({ ...empForm, cep: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: Profissionais */}
                {empActiveTab === 'profissionais' && (
                  <div style={styles.formGrid}>
                    <div className="form-group">
                      <label>Cargo / Função *</label>
                      <input type="text" className="form-control" required placeholder="Ex: Enfermeira" value={empForm.role} onChange={e => setEmpForm({ ...empForm, role: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Setor de Trabalho *</label>
                      <select className="form-control" value={empForm.sectorId} onChange={e => setEmpForm({ ...empForm, sectorId: e.target.value })}>
                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Data de Admissão *</label>
                      <input type="date" className="form-control" required value={empForm.admissionDate} onChange={e => setEmpForm({ ...empForm, admissionDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Tipo de Contrato</label>
                      <select className="form-control" value={empForm.contractType} onChange={e => setEmpForm({ ...empForm, contractType: e.target.value })}>
                        <option value="CLT">CLT</option>
                        <option value="PJ">PJ</option>
                        <option value="Experiência">Experiência (90 dias)</option>
                        <option value="Temporário">Temporário</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Salário Base (R$)</label>
                      <input type="number" className="form-control" value={empForm.salary} onChange={e => setEmpForm({ ...empForm, salary: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Número CNH</label>
                      <input type="text" className="form-control" value={empForm.cnhNumber} onChange={e => setEmpForm({ ...empForm, cnhNumber: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Vencimento CNH</label>
                      <input type="date" className="form-control" value={empForm.cnhExpiry} onChange={e => setEmpForm({ ...empForm, cnhExpiry: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: Bancários */}
                {empActiveTab === 'bancarios' && (
                  <div style={styles.formGrid}>
                    <div className="form-group">
                      <label>Banco</label>
                      <input type="text" className="form-control" placeholder="Ex: Itaú" value={empForm.bankName} onChange={e => setEmpForm({ ...empForm, bankName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Agência</label>
                      <input type="text" className="form-control" placeholder="1234" value={empForm.bankAgency} onChange={e => setEmpForm({ ...empForm, bankAgency: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Conta Corrente / Salário</label>
                      <input type="text" className="form-control" placeholder="12345-6" value={empForm.bankAccount} onChange={e => setEmpForm({ ...empForm, bankAccount: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* SUBTAB 5: Dependentes */}
                {empActiveTab === 'dependentes' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Nome do Dependente</label>
                        <input type="text" className="form-control" value={newDep.name} onChange={e => setNewDep({ ...newDep, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Parentesco</label>
                        <select className="form-control" value={newDep.relationship} onChange={e => setNewDep({ ...newDep, relationship: e.target.value })}>
                          <option value="Filho(a)">Filho(a)</option>
                          <option value="Cônjuge">Cônjuge</option>
                          <option value="Pai/Mãe">Pai/Mãe</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Data Nascimento</label>
                        <input type="date" className="form-control" value={newDep.birthDate} onChange={e => setNewDep({ ...newDep, birthDate: e.target.value })} />
                      </div>
                      <button type="button" onClick={handleAddDependent} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Adicionar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Grau Parentesco</th>
                          <th>Nascimento</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empForm.dependents.length === 0 ? (
                          <tr><td colSpan="4" style={styles.noDataCell}>Nenhum dependente cadastrado.</td></tr>
                        ) : (
                          empForm.dependents.map((dep, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '600' }}>{dep.name}</td>
                              <td>{dep.relationship}</td>
                              <td>{new Date(dep.birthDate).toLocaleDateString('pt-BR')}</td>
                              <td>
                                <button type="button" onClick={() => setEmpForm(f => ({ ...f, dependents: f.dependents.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                  Remover
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB 9: Ausências / Faltas */}
                {empActiveTab === 'absences' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Data *</label>
                        <input type="date" className="form-control" value={newAbsence.date} onChange={e => setNewAbsence({ ...newAbsence, date: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Tipo de Ausência</label>
                        <select className="form-control" value={newAbsence.type} onChange={e => setNewAbsence({ ...newAbsence, type: e.target.value })}>
                          <option value="Falta Injustificada">Falta Injustificada</option>
                          <option value="Falta Justificada">Falta Justificada</option>
                          <option value="Atraso">Atraso</option>
                          <option value="Licença Médica">Licença Médica</option>
                          <option value="Folga">Folga</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Horas Perdidas</label>
                        <input type="number" className="form-control" placeholder="8" value={newAbsence.hours} onChange={e => setNewAbsence({ ...newAbsence, hours: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Motivo / Observação</label>
                        <input type="text" className="form-control" placeholder="Atestado, problemas pessoais..." value={newAbsence.motive} onChange={e => setNewAbsence({ ...newAbsence, motive: e.target.value })} />
                      </div>
                      <button type="button" onClick={handleAddAbsence} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Registrar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Tipo</th>
                          <th>Horas</th>
                          <th>Motivo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!empForm.absences || empForm.absences.length === 0 ? (
                          <tr><td colSpan="5" style={styles.noDataCell}>Nenhuma ausência registrada.</td></tr>
                        ) : (
                          empForm.absences.map((abs, idx) => (
                            <tr key={idx}>
                              <td>{new Date(abs.date).toLocaleDateString('pt-BR')}</td>
                              <td>
                                <span style={{
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  backgroundColor: abs.type === 'Falta Injustificada' ? '#fee2e2' : '#f1f5f9',
                                  color: abs.type === 'Falta Injustificada' ? '#991b1b' : '#475569'
                                }}>
                                  {abs.type}
                                </span>
                              </td>
                              <td style={{ fontWeight: '600' }}>{abs.hours}h</td>
                              <td>{abs.motive || '-'}</td>
                              <td>
                                <button type="button" onClick={() => setEmpForm(f => ({ ...f, absences: f.absences.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                  Remover
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB 6: Advertências */}
                {empActiveTab === 'warnings' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1.5fr 2fr 1fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Data</label>
                        <input type="date" className="form-control" value={newWarning.date} onChange={e => setNewWarning({ ...newWarning, date: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Motivo</label>
                        <select className="form-control" value={newWarning.motive} onChange={e => setNewWarning({ ...newWarning, motive: e.target.value })}>
                          <option value="Atraso Injustificado">Atraso Injustificado</option>
                          <option value="Falta Injustificada">Falta Injustificada</option>
                          <option value="Insubordinação">Insubordinação</option>
                          <option value="Uso Inadequado de EPI">Uso Inadequado de EPI</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Teor/Descrição</label>
                        <input type="text" className="form-control" value={newWarning.text} onChange={e => setNewWarning({ ...newWarning, text: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Anexar Assinado</label>
                        <input type="file" onChange={e => handleDocBase64Upload(e, 'warning')} style={{ fontSize: '0.75rem' }} />
                      </div>
                      <button type="button" onClick={handleAddWarning} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Registrar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Motivo</th>
                          <th>Descrição</th>
                          <th>Arquivo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empForm.warnings.length === 0 ? (
                          <tr><td colSpan="5" style={styles.noDataCell}>Nenhuma advertência registrada.</td></tr>
                        ) : (
                          empForm.warnings.map((w, idx) => (
                            <tr key={idx}>
                              <td>{new Date(w.date).toLocaleDateString('pt-BR')}</td>
                              <td style={{ fontWeight: '600' }}>{w.motive}</td>
                              <td>{w.text}</td>
                              <td>
                                {w.docUrl ? (
                                  <a href={w.docUrl} download={`advertencia-${empForm.name}-${w.date}.png`} style={{ color: '#ec4899', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Download size={14} /> Baixar Anexo
                                  </a>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>Sem anexo</span>
                                )}
                              </td>
                              <td>
                                <button type="button" onClick={() => setEmpForm(f => ({ ...f, warnings: f.warnings.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB 7: Vacinas */}
                {empActiveTab === 'vaccines' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Vacina</label>
                        <select className="form-control" value={newVaccine.name} onChange={e => setNewVaccine({ ...newVaccine, name: e.target.value })}>
                          <option value="Hepatite B">Hepatite B</option>
                          <option value="Dupla Adulto (dT - Tétano/Difteria)">Dupla Adulto (dT - Tétano/Difteria)</option>
                          <option value="Tríplice Viral (Sarampo/Caxumba/Rubéola)">Tríplice Viral (Sarampo/Caxumba/Rubéola)</option>
                          <option value="Influenza (Gripe)">Influenza (Gripe)</option>
                          <option value="COVID-19 Bivalente">COVID-19 Bivalente</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Dose</label>
                        <input type="text" className="form-control" placeholder="1ª Dose, Reforço" value={newVaccine.dose} onChange={e => setNewVaccine({ ...newVaccine, dose: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Aplicação</label>
                        <input type="date" className="form-control" value={newVaccine.date} onChange={e => setNewVaccine({ ...newVaccine, date: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Próxima Dose</label>
                        <input type="date" className="form-control" value={newVaccine.expiryDate} onChange={e => setNewVaccine({ ...newVaccine, expiryDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Lote</label>
                        <input type="text" className="form-control" placeholder="Lote" value={newVaccine.lot} onChange={e => setNewVaccine({ ...newVaccine, lot: e.target.value })} />
                      </div>
                      <button type="button" onClick={handleAddVaccine} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Registrar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Vacina</th>
                          <th>Dose</th>
                          <th>Aplicação</th>
                          <th>Lote</th>
                          <th>Próxima Dose</th>
                          <th>Validade</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empForm.vaccinations.length === 0 ? (
                          <tr><td colSpan="7" style={styles.noDataCell}>Nenhuma vacina registrada.</td></tr>
                        ) : (
                          empForm.vaccinations.map((vac, idx) => {
                            const valInfo = getExpiryStatus(vac.expiryDate);
                            return (
                              <tr key={idx}>
                                <td style={{ fontWeight: '600' }}>{vac.name}</td>
                                <td>{vac.dose}</td>
                                <td>{new Date(vac.date).toLocaleDateString('pt-BR')}</td>
                                <td>{vac.lot || '-'}</td>
                                <td>{vac.expiryDate ? new Date(vac.expiryDate).toLocaleDateString('pt-BR') : '-'}</td>
                                <td>
                                  {vac.expiryDate ? (
                                    <span style={{ fontWeight: '700', color: valInfo.color }}>{valInfo.text}</span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Definitiva</span>
                                  )}
                                </td>
                                <td>
                                  <button type="button" onClick={() => setEmpForm(f => ({ ...f, vaccinations: f.vaccinations.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                    Remover
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB 8: Central de Documentos / Arquivos */}
                {empActiveTab === 'documents' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Nome do Arquivo *</label>
                        <input type="text" className="form-control" placeholder="Ex: CPF Assinado, Diploma" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Categoria</label>
                        <select className="form-control" value={newDoc.category} onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}>
                          <option value="Identidade (RG)">Identidade (RG)</option>
                          <option value="CPF">CPF</option>
                          <option value="Diploma">Diploma</option>
                          <option value="ASO (Admissional)">ASO (Admissional)</option>
                          <option value="ASO (Periódico)">ASO (Periódico)</option>
                          <option value="Carteira Profissional">Carteira Profissional</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Vencimento (se houver)</label>
                        <input type="date" className="form-control" value={newDoc.expiryDate} onChange={e => setNewDoc({ ...newDoc, expiryDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Arquivo</label>
                        <input type="file" onChange={e => handleDocBase64Upload(e, 'doc')} style={{ fontSize: '0.75rem' }} />
                      </div>
                      <button type="button" onClick={handleAddDocument} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Registrar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Documento</th>
                          <th>Categoria</th>
                          <th>Validade</th>
                          <th>Download / Arquivo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empForm.documents.length === 0 ? (
                          <tr><td colSpan="5" style={styles.noDataCell}>Nenhum documento arquivado.</td></tr>
                        ) : (
                          empForm.documents.map((docItem, idx) => {
                            const valInfo = getExpiryStatus(docItem.expiryDate);
                            return (
                              <tr key={idx}>
                                <td style={{ fontWeight: '600' }}>{docItem.name}</td>
                                <td>{docItem.category}</td>
                                <td>
                                  {docItem.expiryDate ? (
                                    <span style={{ fontWeight: '700', color: valInfo.color }}>
                                      {new Date(docItem.expiryDate).toLocaleDateString('pt-BR')} ({valInfo.text})
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Vitalício</span>
                                  )}
                                </td>
                                <td>
                                  {docItem.fileUrl ? (
                                    <a href={docItem.fileUrl} download={`${empForm.name}-${docItem.name}.png`} style={{ color: '#ec4899', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <Download size={14} /> Baixar
                                    </a>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Sem arquivo</span>
                                  )}
                                </td>
                                <td>
                                  <button type="button" onClick={() => setEmpForm(f => ({ ...f, documents: f.documents.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                    Excluir
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowEmpModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#ec4899' }}>
                  {actionLoading ? 'Salvando...' : 'Salvar Dados do Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vale-Transporte Modal */}
      {showVoucherModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>{editingVoucher ? 'Editar Concessão de VT' : 'Nova Concessão de Vale-Transporte'}</h2>
              <button onClick={() => setShowVoucherModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveVoucher} style={styles.modalForm}>
              <div className="form-group">
                <label>Funcionário *</label>
                <select className="form-control" required value={voucherForm.employeeId} onChange={e => setVoucherForm({ ...voucherForm, employeeId: e.target.value })}>
                  {employees.filter(emp => emp.status !== 'Inativo').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Itinerário / Rota de Ônibus *</label>
                <input type="text" className="form-control" required placeholder="Ex: 302B - Industrial/Centro" value={voucherForm.route} onChange={e => setVoucherForm({ ...voucherForm, route: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Tarifa Diária (R$) *</label>
                  <input type="number" step="0.05" className="form-control" required value={voucherForm.dailyCost} onChange={e => setVoucherForm({ ...voucherForm, dailyCost: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Dias de Carga *</label>
                  <input type="number" className="form-control" required value={voucherForm.daysCount} onChange={e => setVoucherForm({ ...voucherForm, daysCount: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Tipo do Cartão</label>
                  <select className="form-control" value={voucherForm.cardType} onChange={e => setVoucherForm({ ...voucherForm, cardType: e.target.value })}>
                    <option value="BetimCARD">BetimCARD</option>
                    <option value="BHBus">BHBus</option>
                    <option value="Ótimo">Ótimo</option>
                    <option value="Transcon">Transcon</option>
                    <option value="Vale-Pedágio">Vale-Pedágio</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Número do Cartão</label>
                  <input type="text" className="form-control" placeholder="00012345" value={voucherForm.cardNumber} onChange={e => setVoucherForm({ ...voucherForm, cardNumber: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Desconto Salarial (%)</label>
                <input type="number" className="form-control" value={voucherForm.discountPercent} onChange={e => setVoucherForm({ ...voucherForm, discountPercent: e.target.value })} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Desconto padrão de 6% sobre o salário base.</span>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-color)', margin: '1rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Valor Total da Carga Mensal:</span>
                  <strong style={{ color: '#10b981' }}>
                    R$ {((parseFloat(voucherForm.dailyCost) || 0) * (parseInt(voucherForm.daysCount) || 0)).toFixed(2)}
                  </strong>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowVoucherModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#ec4899' }}>
                  {actionLoading ? 'Salvando...' : 'Confirmar Concessão'}
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  tabsWrapper: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    color: '#ec4899',
    borderBottomColor: '#ec4899',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9rem',
  },
  warningBanner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backgroundColor: 'var(--danger-light)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--danger-color)',
    fontSize: '0.875rem',
    borderLeft: '4px solid var(--danger-color)',
    fontWeight: '600',
  },
  filtersBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '0.625rem 0.625rem 0.625rem 2.5rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    fontSize: '0.875rem',
  },
  selectsWrapper: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterSelect: {
    padding: '0.625rem 1.75rem 0.625rem 0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  txBtn: {
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: '#fff',
    border: '1px solid #ec4899',
    color: '#ec4899',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: '#ec4899',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'filter 0.15s ease',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    boxShadow: 'var(--shadow-sm)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
  },
  noDataCell: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
  },
  categoryBadge: {
    fontSize: '0.725rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  badgeCritical: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger-color)',
    fontWeight: '700',
  },
  badgeNormal: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'var(--success-light)',
    color: 'var(--success-color)',
    fontWeight: '700',
  },
  actionEditBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  tablePhoto: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid var(--border-color)',
    flexShrink: 0,
  },
  tablePhotoPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    color: '#ec4899',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    border: '1.5px solid rgba(236, 72, 153, 0.1)',
    flexShrink: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '480px',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  modalForm: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: '1rem',
  },
  wizardStepsBar: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#f8fafc',
    flexWrap: 'wrap',
  },
  wizardStep: {
    flex: '1 1 auto',
    textAlign: 'center',
    padding: '0.75rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
  },
  wizardStepActive: {
    color: '#ec4899',
    borderBottomColor: '#ec4899',
  },
  photoUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
  },
  photoPreviewWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--border-color)',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  // Dashboard elements
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  kpiCard: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderLeft: '4px solid #ec4899',
    borderRadius: 'var(--border-radius-sm)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-sm)',
  },
  kpiLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiVal: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginTop: '0.25rem',
  },
  dashboardSplitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  kpiSection: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
  },
  listWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.5rem',
    fontSize: '0.85rem',
  },
  listSubText: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem',
  },
  listBadge: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  noDataMini: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '1rem 0',
  },
  // Reports
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  downloadReportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: '#fff',
    fontWeight: '600',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
  },
  expiryLabel: {
    fontSize: '0.8rem',
  }
};

// Expiry checker
const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return { text: 'N/A', color: 'var(--text-muted)' };
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: 'Expirado', color: '#ef4444' };
  }
  if (diffDays <= 60) {
    return { text: `Vence em ${diffDays}d`, color: '#f59e0b' };
  }
  return { text: `Válido (${diffDays}d)`, color: 'var(--success-color)' };
};

import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../firebase';
import { 
  Megaphone, Search, Plus, Filter, Mail, CheckCircle2, AlertTriangle, 
  Clock, User, RefreshCw, Layers, Sparkles, Building2, Eye, Trash2, 
  Edit3, Link as LinkIcon, ChevronRight, MessageSquare, Send, Check,
  Activity, ShieldAlert, HeartPulse, Stethoscope, ArrowRight, UserCheck
} from 'lucide-react';

export default function AssistPanel({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyUnread, setOnlyUnread] = useState(false);

  // Modais
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEmailSimulatorModal, setShowEmailSimulatorModal] = useState(false);
  const [showLinkPatientModal, setShowLinkPatientModal] = useState(false);
  const [showReadersModal, setShowReadersModal] = useState(false);
  const [selectedPostForReaders, setSelectedPostForReaders] = useState(null);
  const [selectedPostForLink, setSelectedPostForLink] = useState(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [editingPost, setEditingPost] = useState(null);

  // Formulário de Novo Comunicado
  const [postForm, setPostForm] = useState({
    title: '',
    message: '',
    category: 'Internação',
    urgency: 'Urgente',
    patientId: '',
    patientName: '',
    room: 'Salão 1',
    shift: '1º Turno'
  });

  // Simulador de Ingestão de E-mail
  const [emailForm, setEmailForm] = useState({
    from: 'enfermagem.plantao@nexaclinic.med.br',
    subject: 'Internação - Adair Praxedes Moreno',
    body: 'Bom dia equipe,\n\nInformamos que o paciente Adair Praxedes Moreno foi internado ontem à noite no Hospital Municipal com febre persistente e calafrios. A sessão de hemodiálise de hoje foi suspensa.\n\nAtenciosamente,\nEnfª Mariana Costa'
  });
  const [parsedEmailResult, setParsedEmailResult] = useState(null);

  // Carregar dados e escutar em tempo real
  useEffect(() => {
    let unsubscribe = () => {};
    fetchData();

    if (dbService.subscribeToAssistPosts) {
      unsubscribe = dbService.subscribeToAssistPosts((livePosts) => {
        if (livePosts && Array.isArray(livePosts)) {
          setPosts(prev => {
            const pList = patients && patients.length > 0 ? patients : [];
            return dbService.autoLinkAssistPosts ? dbService.autoLinkAssistPosts(livePosts, pList) : livePosts;
          });
        }
      });
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [patients]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postList, patientList] = await Promise.all([
        dbService.getAssistPosts(),
        dbService.getPatients()
      ]);
      const resolvedPatients = patientList || [];
      const autoLinkedPosts = dbService.autoLinkAssistPosts ? dbService.autoLinkAssistPosts(postList || [], resolvedPatients) : (postList || []);
      setPosts(autoLinkedPosts);
      setPatients(resolvedPatients);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar dados do Feed Assistencial.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Categorias disponíveis
  const categories = [
    { id: 'Internação', label: 'Internação', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '🔴' },
    { id: 'Alta', label: 'Alta Hospitalar', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: '🟢' },
    { id: 'Transferência', label: 'Transferência', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: '🔵' },
    { id: 'Intercorrência', label: 'Intercorrência', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '🟡' },
    { id: 'Nutrição', label: 'Nutrição', color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', icon: '🥗' },
    { id: 'Psicologia', label: 'Psicologia', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: '🧠' },
    { id: 'Serviço Social', label: 'Serviço Social', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', icon: '🤝' },
    { id: 'Óbito', label: 'Óbito', color: '#374151', bg: '#f3f4f6', border: '#d1d5db', icon: '⚫' },
    { id: 'Geral', label: 'Aviso Geral', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', icon: 'ℹ️' }
  ];

  const getCategoryMeta = (catName) => {
    return categories.find(c => c.id === catName) || categories[categories.length - 1];
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = posts.length;
    const internacoes = posts.filter(p => p.category === 'Internação').length;
    const altas = posts.filter(p => p.category === 'Alta').length;
    const intercorrencias = posts.filter(p => p.category === 'Intercorrência').length;
    const pendentes = posts.filter(p => p.status === 'pending_link' || !p.patientId).length;
    return { total, internacoes, altas, intercorrencias, pendentes };
  }, [posts]);

  // Lista Filtrada
  const filteredPosts = useMemo(() => {
    const userId = currentUser?.id || currentUser?.uid || currentUser?.email || 'user';
    const userName = currentUser?.name || currentUser?.email || 'Profissional';

    return posts.filter(post => {
      // Busca texto
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchTitle = post.title?.toLowerCase().includes(term);
        const matchMsg = post.message?.toLowerCase().includes(term);
        const matchPat = post.patientName?.toLowerCase().includes(term);
        const matchAuthor = post.author?.toLowerCase().includes(term);
        if (!matchTitle && !matchMsg && !matchPat && !matchAuthor) return false;
      }

      // Salão
      if (selectedRoom !== 'all') {
        if (post.room !== selectedRoom) return false;
      }

      // Turno
      if (selectedShift !== 'all') {
        if (post.shift !== selectedShift) return false;
      }

      // Categoria
      if (selectedCategory !== 'all') {
        if (post.category !== selectedCategory) return false;
      }

      // Apenas não lidos
      if (onlyUnread) {
        const readBy = Array.isArray(post.readBy) ? post.readBy : [];
        const hasRead = readBy.some(r => r.userId === userId || r.name === userName);
        if (hasRead) return false;
      }

      return true;
    });
  }, [posts, searchTerm, selectedRoom, selectedShift, selectedCategory, onlyUnread, currentUser]);

  // Pacientes filtrados para o modal de autocomplete / vínculo
  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm) return patients.slice(0, 8);
    const term = patientSearchTerm.toLowerCase();
    return patients.filter(p => 
      p.name?.toLowerCase().includes(term) || 
      p.cpf?.includes(term) ||
      p.room?.toLowerCase().includes(term)
    ).slice(0, 10);
  }, [patients, patientSearchTerm]);

  // Ações de Criação/Edição
  const handleOpenCreateModal = (patient = null) => {
    setEditingPost(null);
    setPatientSearchTerm(patient ? patient.name : '');
    setPostForm({
      title: patient ? `Comunicado - ${patient.name}` : '',
      message: '',
      category: 'Internação',
      urgency: 'Urgente',
      patientId: patient ? patient.id : '',
      patientName: patient ? patient.name : '',
      room: patient ? (patient.room || 'Salão 1') : 'Salão 1',
      shift: patient ? (patient.shift || '1º Turno') : '1º Turno'
    });
    setShowPostModal(true);
  };

  const handleOpenEditModal = (post) => {
    setEditingPost(post);
    setPatientSearchTerm(post.patientName || '');
    setPostForm({
      title: post.title || '',
      message: post.message || '',
      category: post.category || 'Geral',
      urgency: post.urgency || 'Informativo',
      patientId: post.patientId || '',
      patientName: post.patientName || '',
      room: post.room || 'Salão 1',
      shift: post.shift || '1º Turno'
    });
    setShowPostModal(true);
  };

  const handleSelectPatient = (patient) => {
    setPostForm(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      room: patient.room || prev.room,
      shift: patient.shift || prev.shift,
      title: prev.title || `Comunicado - ${patient.name}`
    }));
    setPatientSearchTerm(patient.name);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!postForm.message.trim()) {
      showAlert('Por favor, digite o conteúdo do comunicado.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title: postForm.title || `${postForm.category} - ${postForm.patientName || 'Aviso'}`,
        message: postForm.message.trim(),
        category: postForm.category,
        urgency: postForm.urgency,
        patientId: postForm.patientId || null,
        patientName: postForm.patientName || null,
        room: postForm.room || 'Geral',
        shift: postForm.shift || 'Geral',
        source: 'native',
        status: postForm.patientId ? 'published' : 'pending_link',
        author: currentUser?.name || 'Profissional NexaCLINIC',
        authorRole: currentUser?.role || 'Assistencial',
        createdAt: editingPost ? editingPost.createdAt : new Date().toISOString()
      };

      if (editingPost) {
        await dbService.updateAssistPost(editingPost.id, payload);
        showAlert('Comunicado atualizado com sucesso!', 'success');
      } else {
        await dbService.createAssistPost(payload);
        showAlert('Comunicado publicado com sucesso no Feed Assistencial!', 'success');
      }

      setShowPostModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao salvar comunicado.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja remover este comunicado?')) return;
    setActionLoading(true);
    try {
      await dbService.deleteAssistPost(postId);
      showAlert('Comunicado removido com sucesso.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao excluir comunicado.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRead = async (postId) => {
    try {
      const updatedReadBy = await dbService.toggleAssistPostRead(postId, currentUser);
      if (updatedReadBy) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, readBy: updatedReadBy } : p));
      }
    } catch (err) {
      console.error('Erro ao marcar ciente:', err);
    }
  };

  const handleLinkPatient = async (patient) => {
    if (!selectedPostForLink || !patient) return;
    setActionLoading(true);
    try {
      await dbService.linkPatientToPost(selectedPostForLink.id, patient);
      showAlert(`Comunicado vinculado com sucesso ao paciente ${patient.name}!`, 'success');
      setShowLinkPatientModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao vincular paciente.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Ingestão / Simulação de E-mail
  const handleRunEmailAI = () => {
    if (!emailForm.body.trim()) return;
    const parsed = dbService.parseIncomingEmail(emailForm, patients);
    setParsedEmailResult(parsed);
  };

  const handleApproveEmailIngestion = async () => {
    if (!parsedEmailResult) return;
    setActionLoading(true);
    try {
      await dbService.createAssistPost(parsedEmailResult);
      showAlert('E-mail processado e integrado com sucesso ao Feed Assistencial!', 'success');
      setShowEmailSimulatorModal(false);
      setParsedEmailResult(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao processar e-mail.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const hasUserRead = (post) => {
    const userId = currentUser?.id || currentUser?.uid || currentUser?.email || 'user';
    const userName = currentUser?.name || currentUser?.email || 'Profissional';
    const readBy = Array.isArray(post.readBy) ? post.readBy : [];
    return readBy.some(r => r.userId === userId || r.name === userName);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div style={styles.container}>
      {/* Mensagem Toast */}
      {message.text && (
        <div style={{
          ...styles.alertToast,
          backgroundColor: message.type === 'success' ? '#10b981' : message.type === 'warning' ? '#f59e0b' : '#ef4444'
        }}>
          {message.text}
        </div>
      )}

      {/* Header / Hero */}
      <div style={styles.heroSection}>
        <div style={styles.heroLeft}>
          <div style={styles.heroIconBadge}>
            <Megaphone size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={styles.heroTitle}>NexaASSIST</h1>
              <span style={styles.liveBadge}>
                <span style={styles.pulseDot}></span> Em Tempo Real
              </span>
            </div>
            <p style={styles.heroSubtitle}>
              Mural inteligente de comunicação assistencial rápida, categorização clínica e histórico consolidado do paciente.
            </p>
          </div>
        </div>

        <div style={styles.heroActions}>
          <button 
            onClick={() => handleOpenCreateModal()}
            style={styles.primaryBtn}
          >
            <Plus size={18} />
            <span>Novo Comunicado Rápido</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid var(--primary-color)' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total de Comunicados</span>
            <Layers size={18} color="var(--primary-color)" />
          </div>
          <div style={styles.kpiValue}>{kpis.total}</div>
          <div style={styles.kpiFootnote}>Histórico completo do sistema</div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #ef4444' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Internações Ativas</span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#ef4444' }}>{kpis.internacoes}</div>
          <div style={styles.kpiFootnote}>Pacientes hospitalizados</div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Altas Hospitalares</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#10b981' }}>{kpis.altas}</div>
          <div style={styles.kpiFootnote}>Retornos à clínica confirmados</div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Intercorrências</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#f59e0b' }}>{kpis.intercorrencias}</div>
          <div style={styles.kpiFootnote}>Alertas e eventos clínicos</div>
        </div>

        {kpis.pendentes > 0 && (
          <div style={{ ...styles.kpiCard, borderLeft: '4px solid #ea580c', backgroundColor: '#fff7ed' }}>
            <div style={styles.kpiHeader}>
              <span style={{ ...styles.kpiLabel, color: '#c2410c' }}>Vínculo Pendente</span>
              <LinkIcon size={18} color="#ea580c" />
            </div>
            <div style={{ ...styles.kpiValue, color: '#ea580c' }}>{kpis.pendentes}</div>
            <div style={{ ...styles.kpiFootnote, color: '#9a3412' }}>Vieram de e-mail sem match</div>
          </div>
        )}
      </div>

      {/* Barra de Filtros Inteligentes */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text"
            placeholder="Buscar por paciente, assunto, texto ou autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>×</button>
          )}
        </div>

        <div style={styles.filterSelects}>
          {/* Filtro de Salão */}
          <select 
            value={selectedRoom} 
            onChange={(e) => setSelectedRoom(e.target.value)}
            style={styles.selectInput}
          >
            <option value="all">🏢 Todos os Salões</option>
            <option value="Salão 1">Salão 1</option>
            <option value="Salão 2">Salão 2</option>
            <option value="Salão 3">Salão 3</option>
            <option value="DP">Diálise Peritoneal (DP)</option>
            <option value="Geral">Geral / Administrativo</option>
          </select>

          {/* Filtro de Turno */}
          <select 
            value={selectedShift} 
            onChange={(e) => setSelectedShift(e.target.value)}
            style={styles.selectInput}
          >
            <option value="all">⏰ Todos os Turnos</option>
            <option value="1º Turno">1º Turno (Manhã)</option>
            <option value="2º Turno">2º Turno (Tarde)</option>
            <option value="3º Turno">3º Turno (Noite)</option>
          </select>

          {/* Botão de não lidos */}
          <button 
            onClick={() => setOnlyUnread(!onlyUnread)}
            style={{
              ...styles.filterToggleBtn,
              backgroundColor: onlyUnread ? '#ecfdf5' : '#f3f4f6',
              color: onlyUnread ? '#047857' : 'var(--text-secondary)',
              borderColor: onlyUnread ? '#10b981' : '#e5e7eb'
            }}
          >
            <Eye size={16} />
            <span>Apenas Sem Meu Ciente</span>
          </button>

          <button onClick={fetchData} style={styles.refreshBtn} title="Atualizar feed">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Pílulas de Categoria */}
      <div style={styles.categoryPills}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            ...styles.categoryPill,
            backgroundColor: selectedCategory === 'all' ? 'var(--primary-color)' : '#fff',
            color: selectedCategory === 'all' ? '#fff' : 'var(--text-primary)',
            borderColor: selectedCategory === 'all' ? 'var(--primary-color)' : '#e5e7eb'
          }}
        >
          Todos ({posts.length})
        </button>

        {categories.map(cat => {
          const count = posts.filter(p => p.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
              style={{
                ...styles.categoryPill,
                backgroundColor: isSelected ? cat.color : cat.bg,
                color: isSelected ? '#fff' : cat.color,
                borderColor: cat.border,
                fontWeight: isSelected ? '700' : '500'
              }}
            >
              <span>{cat.icon} {cat.label}</span>
              <span style={{
                ...styles.pillBadge,
                backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#fff',
                color: isSelected ? '#fff' : cat.color
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* FEED DE COMUNICADOS */}
      {loading ? (
        <div style={styles.emptyState}>
          <RefreshCw size={32} color="var(--primary-color)" className="spin" />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Carregando comunicados assistenciais...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div style={styles.emptyState}>
          <Megaphone size={48} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
          <h3 style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>Nenhum comunicado encontrado</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
            Não há comunicados correspondentes aos filtros selecionados.
          </p>
          <button onClick={() => handleOpenCreateModal()} style={styles.primaryBtn}>
            <Plus size={16} />
            <span>Criar Primeiro Comunicado</span>
          </button>
        </div>
      ) : (
        <div style={styles.feedTimeline}>
          {filteredPosts.map(post => {
            const catMeta = getCategoryMeta(post.category);
            const isRead = hasUserRead(post);
            const readersCount = Array.isArray(post.readBy) ? post.readBy.length : 0;
            const isPending = post.status === 'pending_link' || !post.patientId;

            return (
              <div 
                key={post.id} 
                style={{
                  ...styles.postCard,
                  borderLeft: `5px solid ${catMeta.color}`,
                  backgroundColor: post.urgency === 'Urgente' ? '#fffafb' : '#fff'
                }}
              >
                {/* Cabeçalho do Card */}
                <div style={styles.cardHeader}>
                  <div style={styles.cardMetaLeft}>
                    <span style={{
                      ...styles.catBadge,
                      backgroundColor: catMeta.bg,
                      color: catMeta.color,
                      borderColor: catMeta.border
                    }}>
                      {catMeta.icon} {post.category}
                    </span>

                    {post.urgency === 'Urgente' && (
                      <span style={styles.urgentBadge}>
                        <AlertTriangle size={12} /> Urgente
                      </span>
                    )}

                    {post.source === 'email' ? (
                      <span style={styles.sourceBadgeEmail} title="Recebido automaticamente via lista de e-mail (assistencia@...)">
                        <Mail size={12} /> Via E-mail
                      </span>
                    ) : (
                      <span style={styles.sourceBadgeNative} title="Criado diretamente no NexaCLINIC">
                        <Sparkles size={12} /> NexaCLINIC
                      </span>
                    )}

                    {post.room && post.room !== 'Geral' && (
                      <span style={styles.roomBadge}>
                        <Building2 size={12} /> {post.room} {post.shift ? `• ${post.shift}` : ''}
                      </span>
                    )}
                  </div>

                  <div style={styles.cardMetaRight}>
                    <span style={styles.dateLabel}>
                      <Clock size={13} style={{ marginRight: '4px' }} />
                      {formatDate(post.createdAt)}
                    </span>

                    {/* Ações do autor/admin */}
                    <div style={styles.cardActions}>
                      <button 
                        onClick={() => handleOpenEditModal(post)} 
                        style={styles.cardActionBtn} 
                        title="Editar comunicado"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)} 
                        style={{ ...styles.cardActionBtn, color: '#ef4444' }} 
                        title="Excluir comunicado"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bloco de Paciente Vinculado / Alerta de Vínculo Pendente */}
                {post.patientId && post.patientName ? (
                  <div style={styles.patientBanner}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} color="var(--primary-color)" />
                      <span style={styles.patientNameHighlight}>{post.patientName}</span>
                    </div>
                    <div style={styles.patientSubinfo}>
                      <span>{post.room}</span>
                      <span>•</span>
                      <span>{post.shift}</span>
                    </div>
                  </div>
                ) : isPending ? (
                  <div style={styles.pendingPatientBanner}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={16} color="#c2410c" />
                      <span style={{ color: '#9a3412', fontSize: '0.85rem', fontWeight: '600' }}>
                        Paciente não vinculado automaticamente
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedPostForLink(post);
                        setPatientSearchTerm('');
                        setShowLinkPatientModal(true);
                      }}
                      style={styles.linkPatientBtn}
                    >
                      <LinkIcon size={14} />
                      <span>Associar Paciente</span>
                    </button>
                  </div>
                ) : null}

                {/* Conteúdo da Mensagem */}
                <div style={styles.cardBody}>
                  {post.title && post.title !== post.patientName && (
                    <h4 style={styles.postTitle}>{post.title}</h4>
                  )}
                  <p style={styles.postMessage}>{post.message}</p>
                </div>

                {/* Rodapé: Autor e Controle de "Ciente" */}
                <div style={styles.cardFooter}>
                  <div style={styles.authorInfo}>
                    <div style={styles.authorAvatar}>
                      {post.author ? post.author.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <div style={styles.authorName}>{post.author}</div>
                      <div style={styles.authorRole}>{post.authorRole || 'Assistencial'}</div>
                    </div>
                  </div>

                  <div style={styles.footerRight}>
                    {/* Visualizar leitores */}
                    {readersCount > 0 && (
                      <button 
                        onClick={() => {
                          setSelectedPostForReaders(post);
                          setShowReadersModal(true);
                        }}
                        style={styles.readersListBtn}
                        title="Ver quem já deu ciente neste comunicado"
                      >
                        <UserCheck size={14} color="#059669" />
                        <span>{readersCount} {readersCount === 1 ? 'ciente' : 'cientes'}</span>
                      </button>
                    )}

                    {/* Botão Dar Ciente */}
                    <button 
                      onClick={() => handleToggleRead(post.id)}
                      style={{
                        ...styles.readToggleBtn,
                        backgroundColor: isRead ? '#ecfdf5' : '#f9fafb',
                        color: isRead ? '#047857' : 'var(--text-secondary)',
                        borderColor: isRead ? '#10b981' : '#d1d5db'
                      }}
                      title={isRead ? 'Você já confirmou ciente (clique para desfazer)' : 'Confirmar que você leu este comunicado'}
                    >
                      <CheckCircle2 size={16} color={isRead ? '#10b981' : '#9ca3af'} />
                      <span>{isRead ? 'Ciente Registrado' : 'Dar Ciente'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: NOVO / EDITAR COMUNICADO */}
      {showPostModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={20} color="var(--primary-color)" />
                <h3 style={styles.modalTitle}>
                  {editingPost ? 'Editar Comunicado Assistencial' : 'Novo Comunicado Rápido'}
                </h3>
              </div>
              <button onClick={() => setShowPostModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <form onSubmit={handleSavePost} style={styles.modalForm}>
              {/* Seleção Rápida de Categoria */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Categoria do Comunicado:</label>
                <div style={styles.categorySelectGrid}>
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setPostForm(prev => ({
                          ...prev,
                          category: cat.id,
                          urgency: cat.id === 'Internação' || cat.id === 'Intercorrência' || cat.id === 'Óbito' ? 'Urgente' : 'Informativo'
                        }));
                      }}
                      style={{
                        ...styles.catSelectBtn,
                        backgroundColor: postForm.category === cat.id ? cat.color : cat.bg,
                        color: postForm.category === cat.id ? '#fff' : cat.color,
                        borderColor: cat.border,
                        fontWeight: postForm.category === cat.id ? '700' : '500'
                      }}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paciente com Autocomplete */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Paciente Relacionado (Opcional):</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    placeholder="Digite o nome ou CPF para buscar o paciente..."
                    value={patientSearchTerm}
                    onChange={(e) => {
                      setPatientSearchTerm(e.target.value);
                      if (!e.target.value) {
                        setPostForm(prev => ({ ...prev, patientId: '', patientName: '' }));
                      }
                    }}
                    style={styles.modalInput}
                  />
                  {patientSearchTerm && !postForm.patientId && filteredPatients.length > 0 && (
                    <div style={styles.patientDropdown}>
                      {filteredPatients.map(pat => (
                        <div 
                          key={pat.id} 
                          onClick={() => handleSelectPatient(pat)}
                          style={styles.patientDropdownItem}
                        >
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{pat.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            CPF: {pat.cpf || 'N/A'} • {pat.room || 'Sem salão'} ({pat.shift || 'Turno N/A'})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {postForm.patientName && (
                  <div style={styles.selectedPatientBadge}>
                    <span>Vinculado a: <strong>{postForm.patientName}</strong></span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setPostForm(prev => ({ ...prev, patientId: '', patientName: '' }));
                        setPatientSearchTerm('');
                      }}
                      style={styles.removeLinkBtn}
                    >
                      Remover Vínculo
                    </button>
                  </div>
                )}
              </div>

              {/* Salão, Turno e Urgência */}
              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Salão:</label>
                  <select 
                    value={postForm.room}
                    onChange={(e) => setPostForm(prev => ({ ...prev, room: e.target.value }))}
                    style={styles.modalInput}
                  >
                    <option value="Salão 1">Salão 1</option>
                    <option value="Salão 2">Salão 2</option>
                    <option value="Salão 3">Salão 3</option>
                    <option value="DP">Diálise Peritoneal (DP)</option>
                    <option value="Geral">Geral / Administrativo</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Turno:</label>
                  <select 
                    value={postForm.shift}
                    onChange={(e) => setPostForm(prev => ({ ...prev, shift: e.target.value }))}
                    style={styles.modalInput}
                  >
                    <option value="1º Turno">1º Turno (Manhã)</option>
                    <option value="2º Turno">2º Turno (Tarde)</option>
                    <option value="3º Turno">3º Turno (Noite)</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Urgência:</label>
                  <select 
                    value={postForm.urgency}
                    onChange={(e) => setPostForm(prev => ({ ...prev, urgency: e.target.value }))}
                    style={styles.modalInput}
                  >
                    <option value="Informativo">ℹ️ Informativo</option>
                    <option value="Atenção">🟡 Atenção</option>
                    <option value="Urgente">🔴 Urgente</option>
                  </select>
                </div>
              </div>

              {/* Texto do Comunicado */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Conteúdo da Mensagem / Notícia:</label>
                <textarea 
                  rows={4}
                  placeholder="Ex: Paciente internado ontem no Hospital Regional devido a quadro de febre. Sessões suspensas temporariamente..."
                  value={postForm.message}
                  onChange={(e) => setPostForm(prev => ({ ...prev, message: e.target.value }))}
                  style={styles.modalTextarea}
                  required
                />
              </div>

              {/* Ações */}
              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowPostModal(false)}
                  style={styles.modalCancelBtn}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  style={styles.modalSubmitBtn}
                >
                  {actionLoading ? 'Salvando...' : editingPost ? 'Atualizar Comunicado' : 'Publicar no Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SIMULADOR & LEITOR DE E-MAILS DA CONTA ESPELHO */}
      {showEmailSimulatorModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '750px' }}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#8b5cf6" />
                <h3 style={styles.modalTitle}>Leitor & Ingestão Inteligente de E-mails (IA)</h3>
              </div>
              <button onClick={() => setShowEmailSimulatorModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div style={styles.infoCallout}>
                <Mail size={24} color="#6366f1" />
                <div style={{ fontSize: '0.85rem', color: '#3730a3', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong>Servidor Titan IMAP Configurado:</strong>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '700' }}>
                      🟢 Conexão Ativa (SSL/TLS)
                    </span>
                  </div>
                  <div style={{ marginTop: '0.35rem', fontSize: '0.8rem' }}>
                    <code>integracao@dialize.com.br</code> • IMAP: <code>imap.titan.email:993</code> • POP: <code>pop.titan.email:995</code>
                  </div>
                </div>
              </div>

              {/* Botões de Modelos Rápidos para Teste */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Modelos Rápidos (Exemplos Reais da Clínica):
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailForm({
                        from: 'Márcia Alves Teixeira <enfermagembetim7@dialize.com.br>',
                        subject: 'INFECÇÃO ALEXANDRE JOSE DE PAULA',
                        body: 'ATB: Ceftazidima 2g/vancomicina 1g com lok, por 14 dias\nMedico: ISABELA\nRealizado coleta de Hemocultura 1ª E 2ª amostra, hemograma e PCR.'
                      });
                      setParsedEmailResult(null);
                    }}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #c7d2fe', backgroundColor: '#f5f3ff', color: '#4338ca', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ✉️ E-mail Real Titan (Enfª Márcia - Infecção)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailForm({
                        from: 'Enfermagem Betim <assistencia.betim@dialize.com.br>',
                        subject: 'INTERNAÇÃO - ADAIR PRAXEDES MORENO',
                        body: 'Bom dia equipe,\n\nInformamos que o paciente Adair Praxedes Moreno foi internado ontem à noite no Hospital Municipal com quadro de febre e suspeita de infecção no cateter. Sessão de hoje suspensa na clínica.'
                      });
                      setParsedEmailResult(null);
                    }}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#b91c1c', cursor: 'pointer', fontWeight: '600' }}
                  >
                    🔴 Internação (Adair Moreno)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailForm({
                        from: 'Dr. Lucas Nefrologista <medicos.betim@dialize.com.br>',
                        subject: 'ALTA HOSPITALAR - ADAO LUCIANO DIAS',
                        body: 'Boa tarde,\n\nPaciente Adão Luciano Dias recebeu alta hoje do Hospital Regional e retornará às sessões regulares no 1º Turno (Salão 3).'
                      });
                      setParsedEmailResult(null);
                    }}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', color: '#047857', cursor: 'pointer', fontWeight: '600' }}
                  >
                    🟢 Alta Hospitalar (Adão Luciano)
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Remetente:</label>
                <input 
                  type="text" 
                  value={emailForm.from}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, from: e.target.value }))}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Assunto do E-mail:</label>
                <input 
                  type="text" 
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Corpo do E-mail:</label>
                <textarea 
                  rows={5}
                  value={emailForm.body}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
                  style={styles.modalTextarea}
                />
              </div>

              <button 
                type="button" 
                onClick={handleRunEmailAI}
                style={styles.aiProcessBtn}
              >
                <Sparkles size={16} />
                <span>Processar E-mail com IA (Extrair Entidades)</span>
              </button>

              {/* Resultado do Processamento */}
              {parsedEmailResult && (
                <div style={styles.aiResultCard}>
                  <div style={styles.aiResultHeader}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <strong style={{ color: '#065f46' }}>Extração e Reconhecimento Realizados:</strong>
                  </div>

                  <div style={styles.aiResultGrid}>
                    <div>
                      <span style={styles.aiLabel}>Paciente Identificado:</span>
                      <div style={{ fontWeight: '700', color: parsedEmailResult.patientName ? '#047857' : '#c2410c' }}>
                        {parsedEmailResult.patientName || '⚠️ Não identificado com certeza'}
                      </div>
                      {parsedEmailResult.matchConfidence > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          Confiança: {(parsedEmailResult.matchConfidence * 100).toFixed(0)}% ({parsedEmailResult.matchType})
                        </div>
                      )}
                    </div>

                    <div>
                      <span style={styles.aiLabel}>Categoria Classificada:</span>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        {parsedEmailResult.category}
                      </div>
                    </div>

                    <div>
                      <span style={styles.aiLabel}>Urgência Detectada:</span>
                      <div style={{ fontWeight: '700', color: parsedEmailResult.urgency === 'Urgente' ? '#ef4444' : '#10b981' }}>
                        {parsedEmailResult.urgency}
                      </div>
                    </div>

                    <div>
                      <span style={styles.aiLabel}>Salão / Turno:</span>
                      <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {parsedEmailResult.room} ({parsedEmailResult.shift})
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={styles.aiLabel}>Texto Limpo para o Feed:</span>
                    <div style={styles.aiCleanTextPreview}>
                      {parsedEmailResult.message}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setParsedEmailResult(null)}
                      style={styles.modalCancelBtn}
                    >
                      Descartar
                    </button>
                    <button 
                      onClick={handleApproveEmailIngestion}
                      disabled={actionLoading}
                      style={styles.approveIngestBtn}
                    >
                      <Check size={16} />
                      <span>{actionLoading ? 'Publicando...' : 'Aprovar & Inserir no Feed'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSOCIAR PACIENTE MANUALMENTE */}
      {showLinkPatientModal && selectedPostForLink && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LinkIcon size={20} color="var(--primary-color)" />
                <h3 style={styles.modalTitle}>Associar Paciente ao Comunicado</h3>
              </div>
              <button onClick={() => setShowLinkPatientModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Selecione o paciente correspondente a este comunicado:
              </p>

              <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedPostForLink.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedPostForLink.message}</div>
              </div>

              <input 
                type="text"
                placeholder="Buscar paciente por nome ou CPF..."
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
                style={styles.modalInput}
                autoFocus
              />

              <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                {filteredPatients.map(pat => (
                  <div 
                    key={pat.id}
                    onClick={() => handleLinkPatient(pat)}
                    style={styles.patientLinkItem}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{pat.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {pat.room || 'Sem salão'} • {pat.shift || 'Turno N/A'} • CPF: {pat.cpf || 'N/A'}
                      </div>
                    </div>
                    <button style={styles.selectPatientBtn}>
                      <span>Vincular</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO DE QUEM DEU CIENTE */}
      {showReadersModal && selectedPostForReaders && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} color="#10b981" />
                <h3 style={styles.modalTitle}>Confirmações de Ciente</h3>
              </div>
              <button onClick={() => setShowReadersModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Profissionais que confirmaram a leitura deste comunicado:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {Array.isArray(selectedPostForReaders.readBy) && selectedPostForReaders.readBy.length > 0 ? (
                  selectedPostForReaders.readBy.map((r, idx) => (
                    <div key={idx} style={styles.readerRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={styles.readerAvatar}>{r.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{r.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.role || 'Profissional'}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '500' }}>
                        {formatDate(r.readAt)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>
                    Nenhuma confirmação de ciente registrada até o momento.
                  </div>
                )}
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
    padding: '1.5rem',
    maxWidth: '1300px',
    margin: '0 auto'
  },
  alertToast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '0.75rem 1.5rem',
    color: '#fff',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    fontWeight: '500',
    animation: 'slideIn 0.3s ease-out'
  },
  heroSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    backgroundColor: '#fff',
    padding: '1.5rem 2rem',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid var(--border-color)',
    marginBottom: '1.5rem'
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  heroIconBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, #ec4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(236, 72, 153, 0.25)'
  },
  heroTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0
  },
  heroSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: '0.35rem 0 0 0',
    maxWidth: '550px'
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    border: '1px solid #a7f3d0'
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  heroActions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f5f3ff',
    color: '#6d28d9',
    border: '1px solid #ddd6fe',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  kpiCard: {
    backgroundColor: '#fff',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid var(--border-color)'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  kpiLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  kpiValue: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '0.5rem 0 0.25rem 0'
  },
  kpiFootnote: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    marginBottom: '1rem'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    flex: '1 1 300px',
    position: 'relative'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.875rem',
    color: 'var(--text-primary)'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  filterSelects: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  selectInput: {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  filterToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  refreshBtn: {
    padding: '0.55rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryPills: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '0.75rem',
    marginBottom: '1rem'
  },
  categoryPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.85rem',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '0.8rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  },
  pillBadge: {
    padding: '0.1rem 0.4rem',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '700'
  },
  feedTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid var(--border-color)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '0.75rem'
  },
  cardMetaLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  catBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid'
  },
  urgentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #fca5a5'
  },
  sourceBadgeEmail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },
  sourceBadgeNative: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    backgroundColor: '#f5f3ff',
    color: '#7c3aed',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #ddd6fe'
  },
  roomBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #bbf7d0'
  },
  cardMetaRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  dateLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  cardActionBtn: {
    background: 'none',
    border: 'none',
    padding: '0.3rem',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  patientBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.5rem 0.85rem',
    marginBottom: '0.75rem'
  },
  patientNameHighlight: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'var(--text-primary)'
  },
  patientSubinfo: {
    display: 'flex',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  pendingPatientBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    border: '1px dashed #fdba74',
    borderRadius: '8px',
    padding: '0.5rem 0.85rem',
    marginBottom: '0.75rem'
  },
  linkPatientBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#ea580c',
    color: '#fff',
    border: 'none',
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cardBody: {
    marginBottom: '1rem'
  },
  postTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 0.35rem 0'
  },
  postMessage: {
    fontSize: '0.925rem',
    color: '#374151',
    lineHeight: '1.5',
    margin: 0,
    whiteSpace: 'pre-line'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #f3f4f6'
  },
  authorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  authorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem'
  },
  authorName: {
    fontSize: '0.825rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  authorRole: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)'
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  readersListBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'none',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#059669',
    cursor: 'pointer'
  },
  readToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '3rem 1.5rem',
    textAlign: 'center',
    border: '1px dashed #d1d5db'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)'
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  modalForm: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  formLabel: {
    fontSize: '0.825rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  modalInput: {
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%'
  },
  modalTextarea: {
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    resize: 'vertical'
  },
  categorySelectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '0.5rem'
  },
  catSelectBtn: {
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.75rem',
    cursor: 'pointer',
    textAlign: 'center'
  },
  patientDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    marginTop: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  patientDropdownItem: {
    padding: '0.6rem 0.85rem',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer'
  },
  selectedPatientBadge: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#065f46',
    marginTop: '0.35rem'
  },
  removeLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #f3f4f6'
  },
  modalCancelBtn: {
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  modalSubmitBtn: {
    padding: '0.65rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--primary-color)',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer'
  },
  infoCallout: {
    display: 'flex',
    gap: '0.75rem',
    backgroundColor: '#eef2ff',
    border: '1px solid #c7d2fe',
    borderRadius: '8px',
    padding: '0.85rem',
    marginBottom: '1rem',
    alignItems: 'center'
  },
  aiProcessBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#6d28d9',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    width: '100%',
    marginTop: '0.5rem'
  },
  aiResultCard: {
    marginTop: '1.25rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '1rem'
  },
  aiResultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.75rem'
  },
  aiResultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.75rem',
    backgroundColor: '#fff',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #dcfce7'
  },
  aiLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  aiCleanTextPreview: {
    backgroundColor: '#fff',
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #dcfce7',
    fontSize: '0.85rem',
    color: '#1f2937',
    marginTop: '0.25rem',
    whiteSpace: 'pre-line'
  },
  approveIngestBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#059669',
    color: '#fff',
    border: 'none',
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  patientLinkItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.65rem 0.85rem',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer'
  },
  selectPatientBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  readerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #f3f4f6'
  },
  readerAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700'
  }
};

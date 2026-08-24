import React, { useState, useEffect, useMemo, useRef } from 'react';
import { dbService } from '../firebase';
import { 
  Megaphone, Search, Plus, Clock, User, RefreshCw, Building2, 
  Trash2, Edit3, AlertTriangle, List, LayoutList, LayoutGrid, X,
  Calendar, MessageSquare
} from 'lucide-react';
import DialysisScheduleTab from './assist/DialysisScheduleTab';

const isSamePosts = (a, b) => {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].id !== b[i].id || 
      a[i].patientId !== b[i].patientId || 
      a[i].updatedAt !== b[i].updatedAt
    ) {
      return false;
    }
  }
  return true;
};

export default function AssistPanel({ currentUser }) {
  const [activeAssistTab, setActiveAssistTab] = useState('escala'); // 'escala' | 'mural'
  const [posts, setPosts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const patientsRef = useRef([]);

  // Modo de Visualização: 'compact' | 'normal' | 'grid'
  const [viewMode, setViewMode] = useState('normal');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [datePreset, setDatePreset] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modais
  const [showPostModal, setShowPostModal] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [editingPost, setEditingPost] = useState(null);

  // Formulário de Comunicado
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

  // Categorias clínicas oficiais
  const categories = [
    { id: 'Internação', label: 'Internação', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '🔴' },
    { id: 'Alta', label: 'Alta', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: '🟢' },
    { id: 'Intercorrência', label: 'Intercorrência', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '🟡' },
    { id: 'Transferência', label: 'Transferência', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: '🔵' },
    { id: 'Nutrição', label: 'Nutrição', color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', icon: '🥗' },
    { id: 'Psicologia', label: 'Psicologia', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: '🧠' },
    { id: 'Serviço Social', label: 'Serviço Social', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', icon: '🤝' },
    { id: 'Óbito', label: 'Óbito', color: '#374151', bg: '#f3f4f6', border: '#d1d5db', icon: '⚫' },
    { id: 'Geral', label: 'Geral', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', icon: 'ℹ️' }
  ];

  const getCategoryMeta = (catName) => {
    return categories.find(c => c.id === catName) || categories[categories.length - 1];
  };

  // Checagem de Permissão: Apenas o autor ou admin pode editar/excluir
  const isUserAdmin = (user) => {
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return (
      role === 'admin' || 
      role === 'master' || 
      role === 'gestor' || 
      email === 'contato@techcosta.net' || 
      email === 'admin@dialize.com.br' ||
      user.isAdmin === true
    );
  };

  const canManagePost = (post) => {
    if (!currentUser || !post) return false;
    if (isUserAdmin(currentUser)) return true;

    // Comparação por UID do autor
    if (post.authorId && (post.authorId === currentUser.uid || post.authorId === currentUser.id)) {
      return true;
    }

    // Comparação por E-mail do autor
    if (post.authorEmail && currentUser.email && post.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      return true;
    }

    // Comparação por Nome do autor
    if (post.author && currentUser.name) {
      const pAuthor = post.author.trim().toLowerCase();
      const uName = currentUser.name.trim().toLowerCase();
      if (pAuthor === uName || pAuthor.includes(uName) || uName.includes(pAuthor)) {
        return true;
      }
    }

    return false;
  };

  // Carregar dados na montagem e escutar em tempo real
  useEffect(() => {
    let unsubscribe = () => {};

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [postList, patientList] = await Promise.all([
          dbService.getAssistPosts(),
          dbService.getPatients()
        ]);
        const resolvedPatients = patientList || [];
        patientsRef.current = resolvedPatients;
        setPatients(resolvedPatients);

        const rawPosts = postList || [];
        const autoLinked = dbService.autoLinkAssistPosts 
          ? dbService.autoLinkAssistPosts(rawPosts, resolvedPatients) 
          : rawPosts;
        setPosts(prev => isSamePosts(prev, autoLinked) ? prev : autoLinked);
      } catch (err) {
        console.error('Erro ao carregar dados do Feed Assistencial:', err);
        showAlert('Erro ao carregar comunicados.', 'danger');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    if (dbService.subscribeToAssistPosts) {
      unsubscribe = dbService.subscribeToAssistPosts((livePosts) => {
        if (livePosts && Array.isArray(livePosts)) {
          const currentPatients = patientsRef.current || [];
          const autoLinked = dbService.autoLinkAssistPosts 
            ? dbService.autoLinkAssistPosts(livePosts, currentPatients) 
            : livePosts;
          setPosts(prev => isSamePosts(prev, autoLinked) ? prev : autoLinked);
        }
      });
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const fetchData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [postList, patientList] = await Promise.all([
        dbService.getAssistPosts(),
        dbService.getPatients()
      ]);
      const resolvedPatients = patientList || [];
      patientsRef.current = resolvedPatients;
      setPatients(resolvedPatients);

      const rawPosts = postList || [];
      const autoLinked = dbService.autoLinkAssistPosts 
        ? dbService.autoLinkAssistPosts(rawPosts, resolvedPatients) 
        : rawPosts;
      setPosts(prev => isSamePosts(prev, autoLinked) ? prev : autoLinked);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao atualizar dados do Feed.', 'danger');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Filtragem por Período de Data
  const dateFilteredPosts = useMemo(() => {
    if (datePreset === 'all') return posts;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return posts.filter(post => {
      if (!post.createdAt) return false;
      const postDate = new Date(post.createdAt);
      if (isNaN(postDate.getTime())) return true;

      if (datePreset === 'today') {
        return postDate >= startOfToday;
      }
      if (datePreset === 'yesterday') {
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        return postDate >= startOfYesterday && postDate < startOfToday;
      }
      if (datePreset === '7days') {
        const past7 = new Date(startOfToday);
        past7.setDate(past7.getDate() - 7);
        return postDate >= past7;
      }
      if (datePreset === '30days') {
        const past30 = new Date(startOfToday);
        past30.setDate(past30.getDate() - 30);
        return postDate >= past30;
      }
      if (datePreset === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return postDate >= startOfMonth;
      }
      if (datePreset === 'custom') {
        if (customStartDate && postDate < new Date(`${customStartDate}T00:00:00`)) return false;
        if (customEndDate && postDate > new Date(`${customEndDate}T23:59:59`)) return false;
        return true;
      }
      return true;
    });
  }, [posts, datePreset, customStartDate, customEndDate]);

  // Contagens por categoria baseadas no período
  const categoryCounts = useMemo(() => {
    const counts = { all: dateFilteredPosts.length };
    categories.forEach(c => {
      counts[c.id] = dateFilteredPosts.filter(p => p.category === c.id).length;
    });
    return counts;
  }, [dateFilteredPosts]);

  // Lista Filtrada
  const filteredPosts = useMemo(() => {
    return dateFilteredPosts.filter(post => {
      // Categoria selecionada
      if (selectedCategory !== 'all' && post.category !== selectedCategory) {
        return false;
      }

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

      return true;
    });
  }, [dateFilteredPosts, selectedCategory, searchTerm, selectedRoom, selectedShift]);

  // Pacientes filtrados para o modal de autocomplete
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
    if (!canManagePost(post)) {
      showAlert('Acesso restrito: você só pode editar comunicados criados por você mesmo.', 'warning');
      return;
    }

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
        status: 'published',
        author: editingPost ? editingPost.author : (currentUser?.name || 'Profissional NexaCLINIC'),
        authorEmail: editingPost ? editingPost.authorEmail : (currentUser?.email || ''),
        authorId: editingPost ? editingPost.authorId : (currentUser?.uid || currentUser?.id || ''),
        authorRole: editingPost ? editingPost.authorRole : (currentUser?.role || 'Assistencial'),
        createdAt: editingPost ? editingPost.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
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

  const handleDeletePost = async (post) => {
    if (!canManagePost(post)) {
      showAlert('Acesso restrito: você só pode excluir comunicados criados por você mesmo.', 'warning');
      return;
    }

    if (!window.confirm('Tem certeza que deseja remover este comunicado?')) return;
    setActionLoading(true);
    try {
      await dbService.deleteAssistPost(post.id);
      showAlert('Comunicado removido com sucesso.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao excluir comunicado.', 'danger');
    } finally {
      setActionLoading(false);
    }
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
      {/* Toast Alert */}
      {message.text && (
        <div style={{
          ...styles.alertToast,
          backgroundColor: message.type === 'success' ? '#10b981' : message.type === 'warning' ? '#f59e0b' : '#ef4444'
        }}>
          {message.text}
        </div>
      )}

      {/* Hero Header Padronizado com NexaSTOCK e NexaHR */}
      <div style={styles.heroSection}>
        <div style={styles.heroLeft}>
          <div style={styles.heroIconBadge}>
            <Megaphone size={28} color="#fff" />
          </div>
          <div>
            <h1 style={styles.heroTitle}>NexaASSIST</h1>
            <p style={styles.heroSubtitle}>
              Gestão assistencial de enfermagem, mapa de leitos por salões e mural clínico.
            </p>
          </div>
        </div>

        <div style={styles.heroActions}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '3px', borderRadius: '12px', gap: '4px' }}>
            <button
              onClick={() => setActiveAssistTab('escala')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: activeAssistTab === 'escala' ? '700' : '500',
                fontSize: '0.85rem',
                backgroundColor: activeAssistTab === 'escala' ? '#ffffff' : 'transparent',
                color: activeAssistTab === 'escala' ? '#4f46e5' : '#ffffff',
                boxShadow: activeAssistTab === 'escala' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Calendar size={16} />
              <span>Escala</span>
            </button>
            <button
              onClick={() => setActiveAssistTab('mural')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: activeAssistTab === 'mural' ? '700' : '500',
                fontSize: '0.85rem',
                backgroundColor: activeAssistTab === 'mural' ? '#ffffff' : 'transparent',
                color: activeAssistTab === 'mural' ? '#4f46e5' : '#ffffff',
                boxShadow: activeAssistTab === 'mural' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <MessageSquare size={16} />
              <span>Mural</span>
            </button>
          </div>

          <button 
            onClick={() => handleOpenCreateModal()}
            style={styles.primaryBtn}
          >
            <Plus size={18} />
            <span>Novo Comunicado</span>
          </button>
        </div>
      </div>

      {activeAssistTab === 'escala' ? (
        <DialysisScheduleTab
          currentUser={currentUser}
          onOpenPostModalWithPatient={(pData) => handleOpenCreateModal(pData)}
        />
      ) : (
        <>
          {/* Grade de Cards de Categorias (Sem cortes nos nomes) */}
          <div style={styles.compactCategoryGrid}>
            {/* Card Todos */}
            <div
              onClick={() => setSelectedCategory('all')}
              style={{
                ...styles.compactCategoryCard,
                borderColor: selectedCategory === 'all' ? 'var(--primary-color)' : 'var(--border-color)',
                backgroundColor: selectedCategory === 'all' ? '#f5f3ff' : '#fff',
                boxShadow: selectedCategory === 'all' ? '0 0 0 2px rgba(109, 40, 217, 0.2), 0 2px 6px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.03)'
              }}
              title="Exibir todos os comunicados"
            >
              <div style={styles.compactCardLeft}>
                <span style={{ fontSize: '0.95rem' }}>📋</span>
                <span style={{ 
                  ...styles.compactCardLabel, 
                  fontWeight: selectedCategory === 'all' ? '700' : '600',
                  color: selectedCategory === 'all' ? 'var(--primary-color)' : 'var(--text-primary)'
                }}>
                  Todos
                </span>
              </div>
              <span style={{
                ...styles.compactCardBadge,
                backgroundColor: selectedCategory === 'all' ? 'var(--primary-color)' : '#f3f4f6',
                color: selectedCategory === 'all' ? '#fff' : 'var(--text-secondary)'
              }}>
                {categoryCounts.all}
              </span>
            </div>

            {/* Cards por Categoria (Nomes Completos) */}
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                  style={{
                    ...styles.compactCategoryCard,
                    borderColor: isSelected ? cat.color : 'var(--border-color)',
                    backgroundColor: isSelected ? cat.bg : '#fff',
                    boxShadow: isSelected ? `0 0 0 2px ${cat.border}, 0 2px 6px rgba(0,0,0,0.04)` : '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                  title={`Filtrar por ${cat.label}`}
                >
                  <div style={styles.compactCardLeft}>
                    <span style={{ fontSize: '0.9rem' }}>{cat.icon}</span>
                    <span style={{ 
                      ...styles.compactCardLabel, 
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? cat.color : 'var(--text-primary)'
                    }}>
                      {cat.label}
                    </span>
                  </div>
                  <span style={{
                    ...styles.compactCardBadge,
                    backgroundColor: isSelected ? cat.color : '#f3f4f6',
                    color: isSelected ? '#fff' : count > 0 ? 'var(--text-primary)' : '#9ca3af'
                  }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Barra de Filtros e Modos de Visualização */}
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
              {/* Seletor de Modo de Visualização (Compacta / Normal / Grade) */}
              <div style={styles.viewModeGroup}>
                <button
                  onClick={() => setViewMode('compact')}
                  style={{
                    ...styles.viewModeBtn,
                    backgroundColor: viewMode === 'compact' ? 'var(--primary-color)' : '#fff',
                    color: viewMode === 'compact' ? '#fff' : 'var(--text-secondary)',
                    borderColor: viewMode === 'compact' ? 'var(--primary-color)' : '#e5e7eb'
                  }}
                  title="Visualização Compacta (Lista Ágil)"
                >
                  <List size={15} />
                  <span style={{ fontSize: '0.78rem' }}>Compacta</span>
                </button>

                <button
                  onClick={() => setViewMode('normal')}
                  style={{
                    ...styles.viewModeBtn,
                    backgroundColor: viewMode === 'normal' ? 'var(--primary-color)' : '#fff',
                    color: viewMode === 'normal' ? '#fff' : 'var(--text-secondary)',
                    borderColor: viewMode === 'normal' ? 'var(--primary-color)' : '#e5e7eb'
                  }}
                  title="Visualização Normal (Cards Padrão)"
                >
                  <LayoutList size={15} />
                  <span style={{ fontSize: '0.78rem' }}>Normal</span>
                </button>

                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    ...styles.viewModeBtn,
                    backgroundColor: viewMode === 'grid' ? 'var(--primary-color)' : '#fff',
                    color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                    borderColor: viewMode === 'grid' ? 'var(--primary-color)' : '#e5e7eb'
                  }}
                  title="Visualização em Grade (Colunas / Mural)"
                >
                  <LayoutGrid size={15} />
                  <span style={{ fontSize: '0.78rem' }}>Grade</span>
                </button>
              </div>

              {/* Filtro de Período / Data */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <select 
                  value={datePreset} 
                  onChange={(e) => setDatePreset(e.target.value)}
                  style={styles.selectInput}
                  title="Período de referência dos comunicados"
                >
                  <option value="all">📅 Todos</option>
                  <option value="today">📅 Hoje</option>
                  <option value="yesterday">📅 Ontem</option>
                  <option value="7days">📅 7 Dias</option>
                  <option value="30days">📅 30 Dias</option>
                  <option value="month">📅 Este Mês</option>
                  <option value="custom">📅 Personalizado</option>
                </select>

                {datePreset === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input 
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      style={{ ...styles.selectInput, padding: '0.45rem' }}
                      title="Data Inicial"
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>até</span>
                    <input 
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      style={{ ...styles.selectInput, padding: '0.45rem' }}
                      title="Data Final"
                    />
                  </div>
                )}
              </div>

              <select 
                value={selectedRoom} 
                onChange={(e) => setSelectedRoom(e.target.value)}
                style={styles.selectInput}
              >
                <option value="all">🏢 Todos os Salões</option>
                <option value="Salão 1">Salão 1</option>
                <option value="Salão 2">Salão 2</option>
                <option value="Salão 3">Salão 3</option>
              </select>

              <select 
                value={selectedShift} 
                onChange={(e) => setSelectedShift(e.target.value)}
                style={styles.selectInput}
              >
                <option value="all">⏰ Todos os Turnos</option>
                <option value="1º Turno">1º Turno</option>
                <option value="2º Turno">2º Turno</option>
                <option value="3º Turno">3º Turno</option>
              </select>
            </div>
          </div>

          {/* Estado de Carregamento */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <RefreshCw size={32} color="var(--primary-color)" className="animate-spin" />
              <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Carregando comunicados...
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={styles.emptyContainer}>
              <Megaphone size={48} color="#d1d5db" />
              <h3 style={styles.emptyTitle}>Nenhum comunicado encontrado</h3>
              <p style={styles.emptyDesc}>
                {searchTerm || selectedCategory !== 'all' || selectedRoom !== 'all' || selectedShift !== 'all'
                  ? 'Tente ajustar os filtros acima para encontrar registros.'
                  : 'Nenhum comunicado clínico registrado no momento.'}
              </p>
              <button 
                onClick={() => handleOpenCreateModal()}
                style={{ ...styles.primaryBtn, marginTop: '1rem' }}
              >
                <Plus size={16} />
                <span>Registrar Comunicado</span>
              </button>
            </div>
          ) : (
            <div style={
              viewMode === 'compact' 
                ? styles.postsContainerCompact 
                : viewMode === 'grid' 
                ? styles.postsContainerGrid 
                : styles.postsContainerNormal
            }>
              {filteredPosts.map(post => {
                const catMeta = getCategoryMeta(post.category);
                const canManage = canManagePost(post);

                if (viewMode === 'compact') {
                  return (
                    <div 
                      key={post.id} 
                      style={{
                        ...styles.compactRow,
                        borderLeftColor: catMeta.color
                      }}
                    >
                      <div style={styles.compactRowLeft}>
                        <span 
                          style={{
                            ...styles.categoryTag,
                            backgroundColor: catMeta.bg,
                            color: catMeta.color,
                            borderColor: catMeta.border,
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.7rem'
                          }}
                        >
                          {catMeta.icon} {catMeta.label}
                        </span>
                        
                        {post.patientName && (
                          <span style={styles.compactPatientBadge}>
                            <User size={12} />
                            <strong>{post.patientName}</strong>
                          </span>
                        )}

                        <span style={styles.compactMessageText}>
                          {post.message}
                        </span>
                      </div>

                      <div style={styles.compactRowRight}>
                        {(post.room || post.shift) && (
                          <span style={styles.compactMetaBadge}>
                            {post.room} {post.shift && `• ${post.shift}`}
                          </span>
                        )}
                        <span style={styles.compactDateBadge}>
                          <Clock size={11} />
                          {formatDate(post.createdAt)}
                        </span>
                        <span style={styles.compactAuthorBadge}>
                          {post.author || 'Equipe'}
                        </span>

                        {canManage && (
                          <div style={styles.compactActions}>
                            <button 
                              onClick={() => handleOpenEditModal(post)} 
                              style={styles.compactActionBtn}
                              title="Editar comunicado"
                            >
                              <Edit3 size={13} color="var(--primary-color)" />
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post)} 
                              style={styles.compactActionBtn}
                              title="Excluir comunicado"
                            >
                              <Trash2 size={13} color="#ef4444" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={post.id} 
                    style={{
                      ...styles.postCard,
                      borderTopColor: catMeta.color,
                      borderTopWidth: '4px'
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.cardHeaderBadges}>
                        <span 
                          style={{
                            ...styles.categoryTag,
                            backgroundColor: catMeta.bg,
                            color: catMeta.color,
                            borderColor: catMeta.border
                          }}
                        >
                          {catMeta.icon} {catMeta.label}
                        </span>

                        {post.urgency === 'Urgente' && (
                          <span style={styles.urgencyTag}>
                            <AlertTriangle size={12} />
                            Urgente
                          </span>
                        )}
                      </div>

                      <div style={styles.headerRightArea}>
                        <div style={styles.postDate}>
                          <Clock size={13} />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>

                        {canManage && (
                          <div style={styles.cardActions}>
                            <button 
                              onClick={() => handleOpenEditModal(post)}
                              style={styles.iconBtn}
                              title="Editar comunicado"
                            >
                              <Edit3 size={15} color="var(--text-secondary)" />
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post)}
                              style={styles.iconBtn}
                              title="Excluir comunicado"
                            >
                              <Trash2 size={15} color="#ef4444" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {post.patientName && (
                      <div style={styles.patientInfoBox}>
                        <div style={styles.patientNameWrapper}>
                          <User size={15} color="var(--primary-color)" />
                          <span style={styles.patientNameText}>{post.patientName}</span>
                        </div>
                        {(post.room || post.shift) && (
                          <div style={styles.locationBadge}>
                            <Building2 size={13} />
                            <span>{post.room}</span>
                            {post.shift && <span>• {post.shift}</span>}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={styles.cardBody}>
                      {post.title && post.title !== post.patientName && !post.title.startsWith(`${post.category} -`) && (
                        <h4 style={styles.postTitle}>{post.title}</h4>
                      )}
                      <p style={styles.postMessage}>{post.message}</p>
                    </div>

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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}


      {/* MODAL: COMUNICADO (Criar / Editar) */}
      {showPostModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={20} color="var(--primary-color)" />
                <h3 style={styles.modalTitle}>
                  {editingPost ? 'Editar Comunicado' : 'Novo Comunicado'}
                </h3>
              </div>
              <button onClick={() => setShowPostModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <form onSubmit={handleSavePost} style={styles.modalForm}>
              {/* Seleção de Categoria */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Categoria:</label>
                <div style={styles.categorySelectGrid}>
                  {categories.map(cat => (
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
                <label style={styles.formLabel}>Paciente:</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    placeholder="Digite o nome ou CPF..."
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
                    <option value="DP">DP</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Turno:</label>
                  <select 
                    value={postForm.shift}
                    onChange={(e) => setPostForm(prev => ({ ...prev, shift: e.target.value }))}
                    style={styles.modalInput}
                  >
                    <option value="1º Turno">1º Turno</option>
                    <option value="2º Turno">2º Turno</option>
                    <option value="3º Turno">3º Turno</option>
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

              {/* Mensagem */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Mensagem:</label>
                <textarea 
                  rows={4}
                  placeholder="Descreva o comunicado ou ocorrência clínica..."
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
                  {actionLoading ? 'Salvando...' : editingPost ? 'Atualizar' : 'Publicar'}
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
    padding: '1.5rem',
    maxWidth: '1280px',
    margin: '0 auto'
  },
  alertToast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    color: '#fff',
    padding: '0.85rem 1.25rem',
    borderRadius: '10px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    zIndex: 9999,
    fontSize: '0.875rem',
    fontWeight: '600',
    animation: 'slideIn 0.3s ease-out'
  },
  heroSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap',
    gap: '1.25rem'
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
    background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(236, 72, 153, 0.25)',
    flexShrink: 0
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
    maxWidth: '580px'
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ec4899',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)',
    transition: 'all 0.15s ease'
  },
  compactCategoryGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
    alignItems: 'center'
  },
  compactCategoryCard: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.65rem',
    padding: '0.5rem 0.85rem',
    borderRadius: '10px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    flex: '1 1 auto',
    minWidth: 'fit-content'
  },
  compactCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem'
  },
  compactCardLabel: {
    fontSize: '0.82rem',
    whiteSpace: 'nowrap'
  },
  compactCardBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '12px',
    minWidth: '20px',
    textAlign: 'center'
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#fff',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    marginBottom: '1.25rem',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f9fafb',
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    flex: '1 1 230px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem',
    color: 'var(--text-primary)'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.1rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  filterSelects: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  viewModeGroup: {
    display: 'inline-flex',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  viewModeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.65rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.15s ease'
  },
  selectInput: {
    padding: '0.45rem 0.65rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    fontSize: '0.82rem',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  dateInput: {
    padding: '0.4rem 0.55rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  refreshBtn: {
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  feedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '1rem'
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.15rem 1.35rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid var(--border-color)',
    transition: 'all 0.15s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.65rem'
  },
  cardMetaLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    flexWrap: 'wrap'
  },
  catBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    border: '1px solid'
  },
  urgentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #fecaca'
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
    gap: '0.65rem'
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
    gap: '0.2rem'
  },
  cardActionBtn: {
    background: 'none',
    border: 'none',
    padding: '0.25rem',
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
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    marginBottom: '0.65rem'
  },
  patientNameHighlight: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  patientSubinfo: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    gap: '0.35rem'
  },
  cardBody: {
    marginBottom: '0.75rem',
    flex: 1
  },
  postTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 0.35rem 0'
  },
  postMessage: {
    fontSize: '0.88rem',
    lineHeight: '1.5',
    color: '#374151',
    margin: 0,
    whiteSpace: 'pre-line'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.65rem',
    borderTop: '1px solid #f3f4f6'
  },
  authorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  authorAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  authorName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  authorRole: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)'
  },
  /* Tabela Compacta */
  compactTableContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  compactTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  compactTheadRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  compactTh: {
    padding: '0.65rem 0.85rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  compactTr: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.15s ease'
  },
  compactTd: {
    padding: '0.6rem 0.85rem',
    fontSize: '0.82rem',
    verticalAlign: 'middle'
  },
  compactCatPill: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px',
    border: '1px solid',
    whiteSpace: 'nowrap'
  },
  compactUrgentBadge: {
    marginLeft: '0.3rem',
    fontSize: '0.65rem'
  },
  compactMessageText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#374151',
    fontSize: '0.82rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    backgroundColor: '#fff',
    borderRadius: '12px',
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
    borderRadius: '12px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #f3f4f6'
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    lineHeight: 1
  },
  modalForm: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  formRow: {
    display: 'flex',
    gap: '0.75rem'
  },
  formLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  modalInput: {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  modalTextarea: {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  categorySelectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '0.4rem'
  },
  catSelectBtn: {
    padding: '0.45rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.75rem',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease'
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
    maxHeight: '180px',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  patientDropdownItem: {
    padding: '0.55rem 0.75rem',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer'
  },
  selectedPatientBadge: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '0.35rem 0.65rem',
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
    gap: '0.65rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #f3f4f6'
  },
  modalCancelBtn: {
    padding: '0.55rem 1.15rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  modalSubmitBtn: {
    padding: '0.55rem 1.35rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--primary-color)',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer'
  }
};

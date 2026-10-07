import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Save, Printer, Share2, CheckCircle2, AlertTriangle, User,
  Calendar, Phone, MapPin, Home, Bus, DollarSign, HeartHandshake,
  FileText, Shield, ExternalLink, RefreshCw, Sparkles, Check
} from 'lucide-react';
import { 
  CIDADES_ATENDIDAS, TIPOS_TRATAMENTO, ESCALAS_TURNO, SALAS_TRATAMENTO,
  ESTADOS_CIVIS, NIVEIS_ESCOLARIDADE, PESSOAS_APOIO, QUANTIDADE_MORADORES,
  FAIXAS_RENDA_FAMILIAR, SITUACOES_MORADIA, CONDICOES_ESGOTAMENTO,
  BENEFICIOS_SOCIAIS, MEIOS_TRANSPORTE, OPCOES_SIM_NAO, OPCOES_SIM_NAO_PARCIAL,
  OPCOES_NAO_SIM_AS_VEZES, OPCOES_DIFICULDADE_TRATAMENTO, OPCOES_GOSTARIA_CONVERSAR,
  OPCOES_STATUS_ACOMPANHAMENTO, INITIAL_SOCIAL_ANAMNESE, calcularAlertasVulnerabilidade
} from '../../utils/socialAnamnesisQuestions';
import { saveSocialAnamnese } from '../../services/firebase/multiService';
import { dbService } from '../../firebase';

export default function SocialAnamneseForm({
  anamnese = null,
  initialPatient = null,
  unitId = 'betim',
  currentUser = null,
  onClose,
  onSaved,
  onOpenPatientMode
}) {
  const [formData, setFormData] = useState(INITIAL_SOCIAL_ANAMNESE);
  const [clinicPatients, setClinicPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('identificacao'); // 'identificacao' | 'tratamento' | 'social' | 'moradia' | 'acesso' | 'parecer'

  // Carrega motor central de pacientes da clínica
  useEffect(() => {
    let isMounted = true;
    async function loadPatients() {
      try {
        const list = await dbService.getPatients(unitId);
        if (isMounted) setClinicPatients(list || []);
      } catch (err) {
        console.warn('Erro ao carregar pacientes:', err);
      }
    }
    loadPatients();
    return () => { isMounted = false; };
  }, [unitId]);

  // Inicializa com registro existente ou paciente selecionado
  useEffect(() => {
    if (anamnese) {
      setFormData({ ...INITIAL_SOCIAL_ANAMNESE, ...anamnese });
    } else if (initialPatient) {
      applyPatientToForm(initialPatient);
    } else {
      setFormData({
        ...INITIAL_SOCIAL_ANAMNESE,
        unitId: unitId || 'betim',
        responsavelTecnico: currentUser?.name || 'Serviço Social'
      });
    }
  }, [anamnese, initialPatient, unitId, currentUser]);

  const applyPatientToForm = (p) => {
    setFormData(prev => ({
      ...prev,
      patientId: p.id || '',
      unitId: p.unitId || unitId || 'betim',
      nomeCompleto: p.name || p.nome || '',
      dataNascimento: p.birthDate || p.dataNascimento || p.data_nascimento || '',
      telefonePrincipal: p.phone || p.telefone || p.telefonePrincipal || '',
      telefoneSecundario: p.phoneSecondary || p.telefoneSecundario || '',
      endereco: p.address || p.endereco || '',
      bairro: p.neighborhood || p.bairro || '',
      cidade: p.city || p.cidade || 'Betim',
      ubsReferencia: p.ubs || p.ubsReferencia || '',
      tipoTratamento: p.tipoTratamento || 'Hemodiálise – HD',
      escalaTurno: p.escalaTurno || p.shift || '1º turno – Segunda / Quarta / Sexta',
      salaTratamento: p.salaTratamento || p.sala || 'Sala 01',
      responsavelTecnico: currentUser?.name || 'Serviço Social'
    }));
    setPatientSearch(p.name || p.nome || '');
    setShowPatientDropdown(false);
  };

  const filteredPatients = useMemo(() => {
    if (!patientSearch || patientSearch.length < 2) return [];
    const term = patientSearch.toLowerCase();
    return clinicPatients.filter(p => {
      const name = (p.name || p.nome || '').toLowerCase();
      const cpf = (p.cpf || '').replace(/\D/g, '');
      return name.includes(term) || cpf.includes(term);
    }).slice(0, 10);
  }, [clinicPatients, patientSearch]);

  const alertas = useMemo(() => {
    return calcularAlertasVulnerabilidade(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.nomeCompleto) {
      alert('Por favor, informe o nome do paciente.');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveSocialAnamnese(formData, currentUser);
      if (onSaved) onSaved(saved);
      if (onClose) onClose();
    } catch (err) {
      console.error('Erro ao salvar anamnese:', err);
      alert('Erro ao salvar anamnese social.');
    } finally {
      setSaving(false);
    }
  };

  const getPatientShareLink = () => {
    const base = window.location.origin;
    const patParam = formData.patientId || formData.id || 'novo';
    return `${base}/?anamnese_social=${patParam}`;
  };

  const handleCopyLink = () => {
    const link = getPatientShareLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="social-anamnese-modal-overlay" style={styles.overlay}>
      <div className="social-anamnese-modal" style={styles.modal}>
        {/* CABEÇALHO */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.headerIcon}>
              <HeartHandshake size={24} color="#7c3aed" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={styles.title}>Anamnese Social</h2>
                <span style={styles.badgeVersion}>RDC 11/2014</span>
                {formData.origemPreenchimento === 'paciente' && (
                  <span style={styles.badgeOrigem}>Preenchido pelo Paciente</span>
                )}
              </div>
              <p style={styles.subtitle}>
                Formulário oficial do Serviço Social para acompanhamento e suporte ao paciente renal crônico
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={handleCopyLink} 
              style={styles.btnSecondary}
              title="Copiar link para enviar via WhatsApp"
            >
              <Share2 size={15} />
              {copiedLink ? 'Copiado!' : 'Link'}
            </button>
            <button 
              type="button" 
              onClick={handlePrint} 
              style={styles.btnSecondary}
              title="Imprimir prontuário social"
            >
              <Printer size={15} />
              Imprimir
            </button>
            {onOpenPatientMode && (
              <button 
                type="button" 
                onClick={() => onOpenPatientMode(formData)} 
                style={styles.btnSecondary}
                title="Modo Totem / Paciente"
              >
                <ExternalLink size={15} />
                Paciente
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose} 
              style={styles.btnClose}
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ALERTA DE VULNERABILIDADES IDENTIFICADAS */}
        {alertas.length > 0 && (
          <div style={styles.alertBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: '#b91c1c' }}>
              <AlertTriangle size={18} />
              <span>Vulnerabilidades Identificadas:</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
              {alertas.map((al, idx) => (
                <span key={idx} style={{
                  ...styles.alertBadge,
                  backgroundColor: al.gravidade === 'critica' ? '#fee2e2' : al.gravidade === 'alta' ? '#ffedd5' : '#fef9c3',
                  color: al.gravidade === 'critica' ? '#991b1b' : al.gravidade === 'alta' ? '#9a3412' : '#854d0e',
                  borderColor: al.gravidade === 'critica' ? '#fca5a5' : al.gravidade === 'alta' ? '#fdba74' : '#fde047'
                }}>
                  {al.rotulo}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* MOTOR DE BUSCA / VÍNCULO DE PACIENTE DA CLÍNICA */}
        <div style={styles.patientPickerCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={styles.fieldLabel}>
              <User size={15} />
              Vincular Paciente (Prontuário Central da Clínica)
            </label>
            {formData.patientId && (
              <span style={styles.badgeLinked}>
                <Check size={12} /> Vinculado ao Sistema
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Digite o nome ou CPF para buscar na base central de pacientes..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setShowPatientDropdown(true);
              }}
              onFocus={() => setShowPatientDropdown(true)}
              style={styles.inputSearch}
            />
            {showPatientDropdown && filteredPatients.length > 0 && (
              <div style={styles.dropdown}>
                {filteredPatients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => applyPatientToForm(p)}
                    style={styles.dropdownItem}
                  >
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {p.name || p.nome}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      CPF: {p.cpf || 'Não inf.'} • Cidade: {p.city || p.cidade || 'Betim'} • Turno: {p.shift || p.escalaTurno || '1º'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS DO FORMULÁRIO */}
        <div style={styles.tabsBar}>
          <button
            type="button"
            onClick={() => setActiveTab('identificacao')}
            style={activeTab === 'identificacao' ? styles.tabActive : styles.tab}
          >
            1. Identificação
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tratamento')}
            style={activeTab === 'tratamento' ? styles.tabActive : styles.tab}
          >
            2. Tratamento
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            style={activeTab === 'social' ? styles.tabActive : styles.tab}
          >
            3. Perfil Social
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('moradia')}
            style={activeTab === 'moradia' ? styles.tabActive : styles.tab}
          >
            4. Socioeconômico
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('acesso')}
            style={activeTab === 'acesso' ? styles.tabActive : styles.tab}
          >
            5. Acesso & Apoio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parecer')}
            style={activeTab === 'parecer' ? styles.tabActive : styles.tab}
          >
            6. Parecer Técnico
          </button>
        </div>

        {/* CORPO DO FORMULÁRIO (RENDERIZADO POR ABA PARA USABILIDADE IMPECÁVEL) */}
        <form onSubmit={handleSave} style={styles.formBody}>
          {/* ABA 1: IDENTIFICAÇÃO */}
          {activeTab === 'identificacao' && (
            <div style={styles.sectionGrid}>
              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Nome completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nomeCompleto}
                  onChange={(e) => handleChange('nomeCompleto', e.target.value)}
                  style={styles.input}
                  placeholder="Nome do paciente"
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Data de nascimento *</label>
                <input
                  type="date"
                  required
                  value={formData.dataNascimento}
                  onChange={(e) => handleChange('dataNascimento', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Telefone principal *</label>
                <input
                  type="text"
                  required
                  value={formData.telefonePrincipal}
                  onChange={(e) => handleChange('telefonePrincipal', e.target.value)}
                  style={styles.input}
                  placeholder="(31) 90000-0000"
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Telefone secundário</label>
                <input
                  type="text"
                  value={formData.telefoneSecundario}
                  onChange={(e) => handleChange('telefoneSecundario', e.target.value)}
                  style={styles.input}
                  placeholder="(31) 90000-0000"
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Cidade onde reside *</label>
                <select
                  required
                  value={formData.cidade}
                  onChange={(e) => handleChange('cidade', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione a cidade</option>
                  {CIDADES_ATENDIDAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Endereço completo *</label>
                <input
                  type="text"
                  required
                  value={formData.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  style={styles.input}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Bairro *</label>
                <input
                  type="text"
                  required
                  value={formData.bairro}
                  onChange={(e) => handleChange('bairro', e.target.value)}
                  style={styles.input}
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Unidade Básica de Saúde / Posto de referência *</label>
                <input
                  type="text"
                  required
                  value={formData.ubsReferencia}
                  onChange={(e) => handleChange('ubsReferencia', e.target.value)}
                  style={styles.input}
                  placeholder="Nome da UBS de referência"
                />
              </div>
            </div>
          )}

          {/* ABA 2: TRATAMENTO */}
          {activeTab === 'tratamento' && (
            <div style={styles.sectionGrid}>
              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Qual é o seu tipo de tratamento? *</label>
                <div style={styles.radioGroup}>
                  {TIPOS_TRATAMENTO.map(t => (
                    <label key={t} style={formData.tipoTratamento === t ? styles.radioCardSelected : styles.radioCard}>
                      <input
                        type="radio"
                        name="tipoTratamento"
                        checked={formData.tipoTratamento === t}
                        onChange={() => handleChange('tipoTratamento', t)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Qual é a sua escala e turno? *</label>
                <select
                  required
                  value={formData.escalaTurno}
                  onChange={(e) => handleChange('escalaTurno', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione escala e turno</option>
                  {ESCALAS_TURNO.map(et => <option key={et} value={et}>{et}</option>)}
                </select>
              </div>

              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Em qual sala realiza o tratamento? *</label>
                <div style={styles.radioGroup}>
                  {SALAS_TRATAMENTO.map(s => (
                    <label key={s} style={formData.salaTratamento === s ? styles.radioCardSelected : styles.radioCard}>
                      <input
                        type="radio"
                        name="salaTratamento"
                        checked={formData.salaTratamento === s}
                        onChange={() => handleChange('salaTratamento', s)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: PERFIL SOCIAL */}
          {activeTab === 'social' && (
            <div style={styles.sectionGrid}>
              <div>
                <label style={styles.fieldLabel}>Estado civil *</label>
                <select
                  required
                  value={formData.estadoCivil}
                  onChange={(e) => handleChange('estadoCivil', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione</option>
                  {ESTADOS_CIVIS.map(ec => <option key={ec} value={ec}>{ec}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Escolaridade *</label>
                <select
                  required
                  value={formData.escolaridade}
                  onChange={(e) => handleChange('escolaridade', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione</option>
                  {NIVEIS_ESCOLARIDADE.map(ne => <option key={ne} value={ne}>{ne}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Atualmente trabalha? *</label>
                <div style={styles.radioGroup}>
                  {OPCOES_SIM_NAO.map(op => (
                    <label key={op} style={formData.trabalhaAtualmente === op ? styles.radioCardSelected : styles.radioCard}>
                      <input
                        type="radio"
                        name="trabalhaAtualmente"
                        checked={formData.trabalhaAtualmente === op}
                        onChange={() => handleChange('trabalhaAtualmente', op)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Necessita de ajuda para atividades do dia a dia? *</label>
                <div style={styles.radioGroup}>
                  {OPCOES_SIM_NAO_PARCIAL.map(op => (
                    <label key={op} style={formData.ajudaAtividades === op ? styles.radioCardSelected : styles.radioCard}>
                      <input
                        type="radio"
                        name="ajudaAtividades"
                        checked={formData.ajudaAtividades === op}
                        onChange={() => handleChange('ajudaAtividades', op)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Possui familiar, cuidador ou pessoa de referência? *</label>
                <div style={styles.radioGroup}>
                  {OPCOES_SIM_NAO.map(op => (
                    <label key={op} style={formData.possuiCuidador === op ? styles.radioCardSelected : styles.radioCard}>
                      <input
                        type="radio"
                        name="possuiCuidador"
                        checked={formData.possuiCuidador === op}
                        onChange={() => handleChange('possuiCuidador', op)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Quem é sua principal pessoa de apoio? *</label>
                <select
                  required
                  value={formData.pessoaApoio}
                  onChange={(e) => handleChange('pessoaApoio', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione</option>
                  {PESSOAS_APOIO.map(pa => <option key={pa} value={pa}>{pa}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Quantas pessoas moram na residência, incluindo você? *</label>
                <select
                  required
                  value={formData.pessoasResidencia}
                  onChange={(e) => handleChange('pessoasResidencia', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione quantidade</option>
                  {QUANTIDADE_MORADORES.map(qm => <option key={qm} value={qm}>{qm}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ABA 4: SOCIOECONÔMICO & MORADIA */}
          {activeTab === 'moradia' && (
            <div style={styles.sectionGrid}>
              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Qual é aproximadamente a renda familiar mensal? *</label>
                <select
                  required
                  value={formData.rendaFamiliar}
                  onChange={(e) => handleChange('rendaFamiliar', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione a faixa de renda</option>
                  {FAIXAS_RENDA_FAMILIAR.map(fr => <option key={fr} value={fr}>{fr}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Qual é a situação da moradia? *</label>
                <select
                  required
                  value={formData.situacaoMoradia}
                  onChange={(e) => handleChange('situacaoMoradia', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione</option>
                  {SITUACOES_MORADIA.map(sm => <option key={sm} value={sm}>{sm}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Possui água encanada? *</label>
                <div style={styles.radioGroup}>
                  {OPCOES_SIM_NAO.map(op => (
                    <label key={op} style={formData.aguaEncanada === op ? styles.radioCardSelected : styles.radioCard}>
                      <input
                        type="radio"
                        name="aguaEncanada"
                        checked={formData.aguaEncanada === op}
                        onChange={() => handleChange('aguaEncanada', op)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Qual é a condição de esgotamento sanitário? *</label>
                <select
                  required
                  value={formData.esgotamentoSanitario}
                  onChange={(e) => handleChange('esgotamentoSanitario', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione</option>
                  {CONDICOES_ESGOTAMENTO.map(ce => <option key={ce} value={ce}>{ce}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Recebe algum benefício atualmente? *</label>
                <select
                  required
                  value={formData.recebeBeneficio}
                  onChange={(e) => handleChange('recebeBeneficio', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione</option>
                  {BENEFICIOS_SOCIAIS.map(bs => <option key={bs} value={bs}>{bs}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Já contribuiu para o INSS? *</label>
                <select
                  required
                  value={formData.contribuiuInss}
                  onChange={(e) => handleChange('contribuiuInss', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                  <option value="Não sabe informar">Não sabe informar</option>
                </select>
              </div>
            </div>
          )}

          {/* ABA 5: ACESSO AO TRATAMENTO & VULNERABILIDADE */}
          {activeTab === 'acesso' && (
            <div style={styles.sectionGrid}>
              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Qual é o principal meio de transporte utilizado para chegar ao tratamento? *</label>
                <select
                  required
                  value={formData.transporteTratamento}
                  onChange={(e) => handleChange('transporteTratamento', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione o meio de transporte</option>
                  {MEIOS_TRANSPORTE.map(mt => <option key={mt} value={mt}>{mt}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Possui dificuldade para chegar ao tratamento? *</label>
                <div style={styles.radioGroup}>
                  {OPCOES_NAO_SIM_AS_VEZES.map(op => (
                    <label key={op} style={formData.dificuldadeTransporte === op ? styles.radioCardSelected : styles.radioCard}>
                      <input
                        type="radio"
                        name="dificuldadeTransporte"
                        checked={formData.dificuldadeTransporte === op}
                        onChange={() => handleChange('dificuldadeTransporte', op)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>A renda atual é suficiente para as necessidades básicas da família? *</label>
                <div style={styles.radioGroup}>
                  {OPCOES_SIM_NAO_PARCIAL.map(op => (
                    <label key={op} style={formData.rendaSuficiente === op ? styles.radioCardSelected : styles.radioCard}>
                      <input
                        type="radio"
                        name="rendaSuficiente"
                        checked={formData.rendaSuficiente === op}
                        onChange={() => handleChange('rendaSuficiente', op)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Existe dificuldade para comprar alimentos? *</label>
                <div style={styles.radioGroup}>
                  {OPCOES_NAO_SIM_AS_VEZES.map(op => (
                    <label key={op} style={formData.dificuldadeAlimentos === op ? styles.radioCardSelected : styles.radioCard}>
                      <input
                        type="radio"
                        name="dificuldadeAlimentos"
                        checked={formData.dificuldadeAlimentos === op}
                        onChange={() => handleChange('dificuldadeAlimentos', op)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Existe alguma situação familiar, financeira ou social que possa dificultar a continuidade do tratamento? *</label>
                <select
                  required
                  value={formData.dificuldadeTratamento}
                  onChange={(e) => handleChange('dificuldadeTratamento', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione</option>
                  {OPCOES_DIFICULDADE_TRATAMENTO.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Gostaria de conversar com o Serviço Social? *</label>
                <select
                  required
                  value={formData.gostariaConversar}
                  onChange={(e) => handleChange('gostariaConversar', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecione</option>
                  {OPCOES_GOSTARIA_CONVERSAR.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>

              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Deseja informar alguma situação importante?</label>
                <textarea
                  rows={3}
                  value={formData.situacaoImportante}
                  onChange={(e) => handleChange('situacaoImportante', e.target.value)}
                  style={styles.textarea}
                  placeholder="Relato livre do paciente sobre particularidades, medos, apoios ou dificuldades..."
                />
              </div>
            </div>
          )}

          {/* ABA 6: PARECER TÉCNICO & CONDUTA PRIVATIVA DO SERVIÇO SOCIAL */}
          {activeTab === 'parecer' && (
            <div style={styles.sectionGrid}>
              <div style={styles.gridFull}>
                <div style={styles.internalNotice}>
                  <Shield size={16} color="#7c3aed" />
                  <span>
                    Seção privativa da equipe de Serviço Social para registro de intervenções, visitas e encaminhamentos.
                  </span>
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Assistente Social Responsável</label>
                <input
                  type="text"
                  value={formData.responsavelTecnico}
                  onChange={(e) => handleChange('responsavelTecnico', e.target.value)}
                  style={styles.input}
                  placeholder="Nome do(a) profissional"
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Registro CRESS</label>
                <input
                  type="text"
                  value={formData.cressResponsavel}
                  onChange={(e) => handleChange('cressResponsavel', e.target.value)}
                  style={styles.input}
                  placeholder="Ex: CRESS/MG 14.892"
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Status do Acompanhamento</label>
                <select
                  value={formData.statusAcompanhamento}
                  onChange={(e) => handleChange('statusAcompanhamento', e.target.value)}
                  style={styles.select}
                >
                  {OPCOES_STATUS_ACOMPANHAMENTO.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div style={styles.gridFull}>
                <label style={styles.fieldLabel}>Parecer Técnico / Conduta Social</label>
                <textarea
                  rows={5}
                  value={formData.parecerTecnico}
                  onChange={(e) => handleChange('parecerTecnico', e.target.value)}
                  style={styles.textarea}
                  placeholder="Descreva a avaliação técnica, demandas identificadas, orientações previdenciárias (INSS/BPC), encaminhamentos para rede socioassistencial (CRAS/CREAS) e plano de intervenção..."
                />
              </div>
            </div>
          )}

          {/* RODAPÉ DO FORMULÁRIO COM AÇÕES */}
          <div style={styles.footer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {activeTab === 'identificacao' && 'Passo 1 de 6'}
                {activeTab === 'tratamento' && 'Passo 2 de 6'}
                {activeTab === 'social' && 'Passo 3 de 6'}
                {activeTab === 'moradia' && 'Passo 4 de 6'}
                {activeTab === 'acesso' && 'Passo 5 de 6'}
                {activeTab === 'parecer' && 'Passo 6 de 6'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={styles.btnSecondary}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={styles.btnPrimary}
              >
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modal: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '920px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-surface, #f8fafc)'
  },
  headerIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary, #0f172a)',
    margin: 0
  },
  subtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary, #64748b)',
    margin: 0,
    marginTop: '0.15rem'
  },
  badgeVersion: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: '#ede9fe',
    color: '#6d28d9'
  },
  badgeOrigem: {
    fontSize: '0.7rem',
    fontWeight: '600',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8'
  },
  alertBanner: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff1f2',
    borderBottom: '1px solid #fecdd3'
  },
  alertBadge: {
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    border: '1px solid transparent'
  },
  patientPickerCard: {
    padding: '1rem 1.5rem',
    backgroundColor: 'var(--surface-muted, #f8fafc)',
    borderBottom: '1px solid var(--border-color, #e2e8f0)'
  },
  badgeLinked: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  inputSearch: {
    width: '100%',
    padding: '0.65rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.875rem'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.25rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '1px solid var(--border-color, #cbd5e1)',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    zIndex: 50,
    maxHeight: '220px',
    overflowY: 'auto'
  },
  dropdownItem: {
    padding: '0.65rem 0.9rem',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border-color, #f1f5f9)',
    transition: 'background-color 0.15s ease'
  },
  tabsBar: {
    display: 'flex',
    overflowX: 'auto',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    padding: '0 1rem'
  },
  tab: {
    padding: '0.75rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary, #64748b)',
    fontSize: '0.825rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s ease'
  },
  tabActive: {
    padding: '0.75rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#7c3aed',
    fontSize: '0.825rem',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid #7c3aed'
  },
  formBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem'
  },
  gridFull: {
    gridColumn: '1 / -1'
  },
  fieldLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1e293b)',
    marginBottom: '0.35rem'
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.875rem'
  },
  select: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  radioGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  radioCard: {
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    fontSize: '0.825rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--text-primary, #1e293b)'
  },
  radioCardSelected: {
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    border: '1.5px solid #7c3aed',
    backgroundColor: '#f5f3ff',
    color: '#6d28d9',
    fontWeight: '600',
    fontSize: '0.825rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
  },
  internalNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 0.9rem',
    borderRadius: '8px',
    backgroundColor: '#ede9fe',
    color: '#5b21b6',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-surface, #f8fafc)'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
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
  btnClose: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary, #64748b)',
    cursor: 'pointer',
    padding: '0.35rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

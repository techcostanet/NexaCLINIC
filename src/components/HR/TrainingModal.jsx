import React, { useState } from 'react';
import { 
  X, Plus, Trash2, BookOpen, Video, FileText, CheckCircle2, 
  HelpCircle, Save, Sparkles, Layers, Award
} from 'lucide-react';
import { STANDARD_SECTORS } from '../../data/hrConstants';
import { DEFAULT_TRAININGS } from '../../services/firebase/hrService';

const PRESET_TEMPLATES = [
  ...DEFAULT_TRAININGS,
  {
    id: 'trn-humanizacao',
    title: 'Atendimento Humanizado & Acolhimento na Saúde',
    description: 'Princípios da Política Nacional de Humanização (PNH), escuta qualificada, empatia e desescalonamento de conflitos.',
    sector: 'Recepcao',
    workloadHours: 2,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 3,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Coordenação de Atendimento & Ouvidoria',
    instructorRole: 'Gestão de Experiência do Paciente',
    textContent: `### 1. Diretrizes do Acolhimento Humanizado
O acolhimento não é apenas uma postura voluntária, mas uma tecnologia de cuidado essencial para garantir a dignidade de pacientes crônicos e seus familiares em ambiente de nefrologia e hemodiálise.

### 2. Postura e Comunicação Não-Violenta (CNV)
- Praticar a escuta empática sem julgamentos precoces.
- Reconhecer a sobrecarga emocional do paciente renal em terapia dialítica contínua.
- Informar de forma clara sobre atrasos ou fluxos assistenciais, evitando jargões técnicos.`,
    preTestQuestions: [
      {
        id: 'hum-pre-1',
        question: 'O acolhimento na recepção clínica é definido como:',
        options: ['Uma triagem rápida de documentos apenas', 'Uma postura ética de escuta qualificada e responsabilização pelo paciente', 'Um favor prestado pelo colaborador', 'Uma rotina administrativa sem impacto clínico'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'hum-post-1',
        question: 'Quando um acompanhante ou paciente demonstra ansiedade ou irritação na espera, qual a conduta indicada?',
        options: ['Ignorar e pedir para aguardar em silêncio', 'Escutar com empatia, explicar a situação com clareza e acolher suas dúvidas com respeito', 'Chamar imediatamente a segurança sem dialogar', 'Dizer que a clínica não tem culpa'],
        correctIndex: 1,
        explanation: 'A escuta ativa e a transparência são as melhores ferramentas para mediar conflitos na saúde.'
      }
    ]
  },
  {
    id: 'trn-lgpd',
    title: 'LGPD & Sigilo de Prontuários e Dados Clínicos',
    description: 'Segurança da informação em saúde, proteção de dados sensíveis e conformidade com a Lei 13.709/2018.',
    sector: 'Geral',
    workloadHours: 2,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 3,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'DPO & Comitê de Governança Digital',
    instructorRole: 'Encarregado de Proteção de Dados',
    textContent: `### 1. Dados Pessoais Sensíveis na Saúde
Dados de saúde, prontuários, laudos e histórico de exames são classificados pela LGPD como Dados Sensíveis, exigindo máxima proteção contra vazamentos, fotos indevidas e acessos não autorizados.

### 2. Boas Práticas Indispensáveis
- Nunca compartilhar senhas de acesso a sistemas hospitalares.
- É estritamente proibido fotografar telas de computador, receituários ou prontuários físicos.
- Bloquear a tela do computador sempre que se ausentar da estação de trabalho.`,
    preTestQuestions: [
      {
        id: 'lgpd-pre-1',
        question: 'Dados sobre a saúde e diagnóstico de um paciente são considerados:',
        options: ['Dados públicos de livre consulta', 'Dados pessoais comuns', 'Dados pessoais sensíveis com proteção jurídica rigorosa', 'Dados comerciais'],
        correctIndex: 2
      }
    ],
    postTestQuestions: [
      {
        id: 'lgpd-post-1',
        question: 'É permitido fotografar o prontuário ou tela com dados de um paciente para enviar via WhatsApp pessoal?',
        options: ['Sim, para qualquer colega', 'Não, é vedado o compartilhamento de prontuários em redes sociais não homologadas pela clínica', 'Sim, se apagar depois', 'Apenas com autorização verbal'],
        correctIndex: 1,
        explanation: 'O vazamento de dados de saúde fere a LGPD e o sigilo profissional garantido pelo Código de Ética.'
      }
    ]
  }
];

export default function TrainingModal({ training, onSave, onClose }) {
  const isEditing = !!training?.id;
  const [activeTab, setActiveTab] = useState('basico'); // 'basico' | 'conteudo' | 'pre' | 'pos'

  const [formData, setFormData] = useState(() => {
    if (training) {
      return {
        ...training,
        preTestQuestions: training.preTestQuestions || [],
        postTestQuestions: training.postTestQuestions || []
      };
    }
    return {
      title: '',
      description: '',
      sector: 'Geral',
      workloadHours: 2,
      validityMonths: 12,
      minPassingScore: 70,
      minDurationMinutes: 5,
      status: 'Ativo',
      contentType: 'text',
      videoUrl: '',
      documentUrl: '',
      textContent: '',
      instructorName: '',
      instructorRole: '',
      preTestQuestions: [
        {
          id: 'pre-' + Date.now(),
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0
        }
      ],
      postTestQuestions: [
        {
          id: 'pos-' + Date.now(),
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: ''
        }
      ]
    };
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyTemplate = (tmpl) => {
    if (window.confirm(`Deseja carregar o modelo "${tmpl.title}"? Os campos serão preenchidos automaticamente.`)) {
      setFormData({
        ...tmpl,
        id: formData.id // preserva id se estiver editando
      });
      setErrorMsg('');
    }
  };

  const handleAddQuestion = (type) => {
    const newQ = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      ...(type === 'post' ? { explanation: '' } : {})
    };
    if (type === 'pre') {
      setFormData(prev => ({ ...prev, preTestQuestions: [...prev.preTestQuestions, newQ] }));
    } else {
      setFormData(prev => ({ ...prev, postTestQuestions: [...prev.postTestQuestions, newQ] }));
    }
  };

  const handleRemoveQuestion = (type, index) => {
    if (type === 'pre') {
      const list = [...formData.preTestQuestions];
      list.splice(index, 1);
      setFormData(prev => ({ ...prev, preTestQuestions: list }));
    } else {
      const list = [...formData.postTestQuestions];
      list.splice(index, 1);
      setFormData(prev => ({ ...prev, postTestQuestions: list }));
    }
  };

  const handleQuestionChange = (type, qIndex, field, value) => {
    const listKey = type === 'pre' ? 'preTestQuestions' : 'postTestQuestions';
    const list = [...formData[listKey]];
    list[qIndex] = { ...list[qIndex], [field]: value };
    setFormData(prev => ({ ...prev, [listKey]: list }));
  };

  const handleOptionChange = (type, qIndex, optIndex, value) => {
    const listKey = type === 'pre' ? 'preTestQuestions' : 'postTestQuestions';
    const list = [...formData[listKey]];
    const options = [...list[qIndex].options];
    options[optIndex] = value;
    list[qIndex] = { ...list[qIndex], options };
    setFormData(prev => ({ ...prev, [listKey]: list }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Informe o título do treinamento.');
      setActiveTab('basico');
      return;
    }
    if (formData.postTestQuestions.length === 0) {
      setErrorMsg('Adicione pelo menos 1 questão no Pós-teste de fixação.');
      setActiveTab('pos');
      return;
    }
    onSave(formData);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Topo do Modal */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.headerTitle}>
              {isEditing ? 'Editar Treinamento' : 'Novo Treinamento'}
            </h2>
            <p style={styles.headerSub}>
              Configuração do módulo didático, pré/pós-testes de eficácia e certificação.
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={22} />
          </button>
        </div>

        {/* Barra de Seleção de Templates Rápidos */}
        <div style={styles.templateBar}>
          <span style={styles.templateLabel}>
            <Sparkles size={14} color="#6366f1" /> Modelos Prontos:
          </span>
          <div style={styles.templateButtons}>
            {PRESET_TEMPLATES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleApplyTemplate(t)}
                style={styles.templateBtn}
                title={t.description}
              >
                {t.title.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Abas do Formulário */}
        <div style={styles.tabsNav}>
          <button 
            type="button"
            onClick={() => setActiveTab('basico')} 
            style={{ ...styles.tabNavBtn, ...(activeTab === 'basico' ? styles.tabNavBtnActive : {}) }}
          >
            Básico
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('conteudo')} 
            style={{ ...styles.tabNavBtn, ...(activeTab === 'conteudo' ? styles.tabNavBtnActive : {}) }}
          >
            Conteúdo
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('pre')} 
            style={{ ...styles.tabNavBtn, ...(activeTab === 'pre' ? styles.tabNavBtnActive : {}) }}
          >
            Pré-teste ({formData.preTestQuestions?.length || 0})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('pos')} 
            style={{ ...styles.tabNavBtn, ...(activeTab === 'pos' ? styles.tabNavBtnActive : {}) }}
          >
            Pós-teste ({formData.postTestQuestions?.length || 0})
          </button>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div style={styles.errorBanner}>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} style={styles.body}>
          
          {/* ABA 1: DADOS BÁSICOS */}
          {activeTab === 'basico' && (
            <div style={styles.tabPane}>
              <div style={styles.formRow}>
                <div style={{ flex: 2 }}>
                  <label style={styles.label}>Título</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: NR-32 & Biossegurança Hospitalar"
                    style={styles.input}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Setor</label>
                  <select 
                    value={formData.sector} 
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    style={styles.select}
                  >
                    <option value="Geral">Geral (Todos)</option>
                    {STANDARD_SECTORS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Descrição</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Resumo dos objetivos e exigências sanitárias deste treinamento"
                  style={styles.textarea}
                  rows={2}
                />
              </div>

              <div style={styles.grid4}>
                <div>
                  <label style={styles.label}>Carga Horária (h)</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={120}
                    value={formData.workloadHours} 
                    onChange={e => setFormData({ ...formData, workloadHours: parseInt(e.target.value, 10) || 1 })}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Reciclagem (Meses)</label>
                  <input 
                    type="number" 
                    min={0} 
                    max={36}
                    value={formData.validityMonths} 
                    onChange={e => setFormData({ ...formData, validityMonths: parseInt(e.target.value, 10) || 0 })}
                    style={styles.input}
                    title="0 para sem validade"
                  />
                </div>
                <div>
                  <label style={styles.label}>Nota Mínima (%)</label>
                  <input 
                    type="number" 
                    min={50} 
                    max={100}
                    value={formData.minPassingScore} 
                    onChange={e => setFormData({ ...formData, minPassingScore: parseInt(e.target.value, 10) || 70 })}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Tempo Mínimo (min)</label>
                  <input 
                    type="number" 
                    min={0} 
                    max={60}
                    value={formData.minDurationMinutes} 
                    onChange={e => setFormData({ ...formData, minDurationMinutes: parseInt(e.target.value, 10) || 0 })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Instrutor / RT</label>
                  <input 
                    type="text" 
                    value={formData.instructorName || ''} 
                    onChange={e => setFormData({ ...formData, instructorName: e.target.value })}
                    placeholder="Ex: Enfª Ana Carolina Cerqueira Gonzaga"
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Cargo / Órgão</label>
                  <input 
                    type="text" 
                    value={formData.instructorRole || ''} 
                    onChange={e => setFormData({ ...formData, instructorRole: e.target.value })}
                    placeholder="Ex: Responsável Técnico / CCIH"
                    style={styles.input}
                  />
                </div>
                <div style={{ width: '130px' }}>
                  <label style={styles.label}>Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={styles.select}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Arquivado">Arquivado</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: CONTEÚDO DIDÁTICO */}
          {activeTab === 'conteudo' && (
            <div style={styles.tabPane}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Tipo de Conteúdo Principal</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <label style={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="contentType" 
                      value="text" 
                      checked={formData.contentType === 'text'} 
                      onChange={() => setFormData({ ...formData, contentType: 'text' })}
                    />
                    <span>Texto Didático / Diretrizes</span>
                  </label>
                  <label style={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="contentType" 
                      value="video" 
                      checked={formData.contentType === 'video'} 
                      onChange={() => setFormData({ ...formData, contentType: 'video' })}
                    />
                    <span>Vídeo Incorporado (YouTube/Drive)</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Link do Vídeo (Opcional)</label>
                <input 
                  type="url" 
                  value={formData.videoUrl || ''} 
                  onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Texto e Tópicos de Ensino</label>
                <textarea 
                  value={formData.textContent || ''} 
                  onChange={e => setFormData({ ...formData, textContent: e.target.value })}
                  placeholder="Escreva as diretrizes, tópicos e instruções que o colaborador deverá ler antes da prova..."
                  style={styles.textarea}
                  rows={8}
                />
              </div>
            </div>
          )}

          {/* ABA 3: PRÉ-TESTE */}
          {activeTab === 'pre' && (
            <div style={styles.tabPane}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Questões para medir o conhecimento prévio antes do treinamento.
                </span>
                <button 
                  type="button" 
                  onClick={() => handleAddQuestion('pre')}
                  style={styles.addQBtn}
                >
                  <Plus size={15} />
                  <span>Adicionar Questão</span>
                </button>
              </div>

              <div style={styles.questionsContainer}>
                {formData.preTestQuestions.map((q, qIdx) => (
                  <div key={q.id || qIdx} style={styles.qCard}>
                    <div style={styles.qCardHeader}>
                      <span style={styles.qNumBadge}>Questão {qIdx + 1}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveQuestion('pre', qIdx)}
                        style={styles.delQBtn}
                        title="Remover questão"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={styles.subLabel}>Enunciado</label>
                      <input 
                        type="text" 
                        value={q.question} 
                        onChange={e => handleQuestionChange('pre', qIdx, 'question', e.target.value)}
                        placeholder="Digite o enunciado da pergunta..."
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.optionsGrid}>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} style={styles.optRow}>
                          <input 
                            type="radio" 
                            name={`pre-correct-${qIdx}`} 
                            checked={q.correctIndex === optIdx}
                            onChange={() => handleQuestionChange('pre', qIdx, 'correctIndex', optIdx)}
                            title="Marcar como alternativa correta"
                          />
                          <span style={styles.optLetterTag}>{String.fromCharCode(65 + optIdx)}</span>
                          <input 
                            type="text" 
                            value={opt} 
                            onChange={e => handleOptionChange('pre', qIdx, optIdx, e.target.value)}
                            placeholder={`Alternativa ${String.fromCharCode(65 + optIdx)}`}
                            style={styles.inputOpt}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 4: PÓS-TESTE */}
          {activeTab === 'pos' && (
            <div style={styles.tabPane}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Questões de fixação para aprovação e emissão do certificado.
                </span>
                <button 
                  type="button" 
                  onClick={() => handleAddQuestion('post')}
                  style={styles.addQBtn}
                >
                  <Plus size={15} />
                  <span>Adicionar Questão</span>
                </button>
              </div>

              <div style={styles.questionsContainer}>
                {formData.postTestQuestions.map((q, qIdx) => (
                  <div key={q.id || qIdx} style={styles.qCard}>
                    <div style={styles.qCardHeader}>
                      <span style={styles.qNumBadge}>Questão {qIdx + 1}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveQuestion('post', qIdx)}
                        style={styles.delQBtn}
                        title="Remover questão"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={styles.subLabel}>Enunciado</label>
                      <input 
                        type="text" 
                        value={q.question} 
                        onChange={e => handleQuestionChange('post', qIdx, 'question', e.target.value)}
                        placeholder="Digite o enunciado da pergunta de fixação..."
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.optionsGrid}>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} style={styles.optRow}>
                          <input 
                            type="radio" 
                            name={`post-correct-${qIdx}`} 
                            checked={q.correctIndex === optIdx}
                            onChange={() => handleQuestionChange('post', qIdx, 'correctIndex', optIdx)}
                            title="Marcar como alternativa correta"
                          />
                          <span style={styles.optLetterTag}>{String.fromCharCode(65 + optIdx)}</span>
                          <input 
                            type="text" 
                            value={opt} 
                            onChange={e => handleOptionChange('post', qIdx, optIdx, e.target.value)}
                            placeholder={`Alternativa ${String.fromCharCode(65 + optIdx)}`}
                            style={styles.inputOpt}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <label style={styles.subLabel}>Justificativa / Gabarito Comentado</label>
                      <input 
                        type="text" 
                        value={q.explanation || ''} 
                        onChange={e => handleQuestionChange('post', qIdx, 'explanation', e.target.value)}
                        placeholder="Explicação da resposta correta para o colaborador..."
                        style={styles.input}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rodapé de Ações */}
          <div style={styles.footer}>
            <button 
              type="button" 
              onClick={onClose} 
              style={styles.cancelBtn}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={styles.saveBtn}
            >
              <Save size={16} />
              <span>{isEditing ? 'Atualizar Treinamento' : 'Salvar Treinamento'}</span>
            </button>
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem'
  },
  modal: {
    maxWidth: '820px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '94vh'
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
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#0f172a'
  },
  headerSub: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.8rem',
    color: '#64748b'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  templateBar: {
    padding: '0.6rem 1.5rem',
    backgroundColor: '#eef2ff',
    borderBottom: '1px solid #e0e7ff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    overflowX: 'auto'
  },
  templateLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#4338ca',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    whiteSpace: 'nowrap'
  },
  templateButtons: {
    display: 'flex',
    gap: '0.4rem'
  },
  templateBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #c7d2fe',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#3730a3',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  tabsNav: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    padding: '0 1.5rem'
  },
  tabNavBtn: {
    padding: '0.75rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer'
  },
  tabNavBtnActive: {
    color: '#4f46e5',
    borderBottomColor: '#4f46e5',
    fontWeight: 700
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '0.6rem 1.5rem',
    fontSize: '0.82rem',
    fontWeight: 600
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column'
  },
  tabPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '0.35rem'
  },
  subLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    marginBottom: '0.25rem'
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none'
  },
  select: {
    width: '100%',
    padding: '0.65rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#ffffff'
  },
  textarea: {
    width: '100%',
    padding: '0.65rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: '#334155',
    cursor: 'pointer'
  },
  addQBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    border: '1px solid #c7d2fe',
    borderRadius: '6px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  questionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  qCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem'
  },
  qCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  qNumBadge: {
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#4f46e5',
    textTransform: 'uppercase'
  },
  delQBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.2rem'
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  optRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  optLetterTag: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#334155',
    flexShrink: 0
  },
  inputOpt: {
    flex: 1,
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    color: '#0f172a',
    boxSizing: 'border-box'
  },
  footer: {
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem'
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.6rem 1.15rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer'
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    padding: '0.6rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#ffffff',
    cursor: 'pointer'
  }
};

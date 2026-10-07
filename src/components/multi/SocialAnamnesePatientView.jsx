import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, CheckCircle2, ArrowRight, ArrowLeft, Send, 
  HelpCircle, ShieldCheck, User, Phone, MapPin, Home, AlertCircle
} from 'lucide-react';
import { 
  CIDADES_ATENDIDAS, TIPOS_TRATAMENTO, ESCALAS_TURNO, SALAS_TRATAMENTO,
  ESTADOS_CIVIS, NIVEIS_ESCOLARIDADE, PESSOAS_APOIO, QUANTIDADE_MORADORES,
  FAIXAS_RENDA_FAMILIAR, SITUACOES_MORADIA, CONDICOES_ESGOTAMENTO,
  BENEFICIOS_SOCIAIS, MEIOS_TRANSPORTE, OPCOES_SIM_NAO, OPCOES_SIM_NAO_PARCIAL,
  OPCOES_NAO_SIM_AS_VEZES, OPCOES_DIFICULDADE_TRATAMENTO, OPCOES_GOSTARIA_CONVERSAR,
  INITIAL_SOCIAL_ANAMNESE
} from '../../utils/socialAnamnesisQuestions';
import { saveSocialAnamnese, getSocialAnamneseByPatientId } from '../../services/firebase/multiService';
import { dbService } from '../../firebase';

export default function SocialAnamnesePatientView({
  patientId = null,
  initialData = null,
  onFinished,
  standalone = false
}) {
  const [formData, setFormData] = useState(INITIAL_SOCIAL_ANAMNESE);
  const [step, setStep] = useState(1); // 1 a 5
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        if (initialData) {
          setFormData({ ...INITIAL_SOCIAL_ANAMNESE, ...initialData });
        } else if (patientId && patientId !== 'novo') {
          // Busca anamnese pré-existente ou dados do paciente
          const existing = await getSocialAnamneseByPatientId(patientId);
          if (existing) {
            setFormData({ ...INITIAL_SOCIAL_ANAMNESE, ...existing });
          } else {
            const pat = await dbService.getPatientById(patientId);
            if (pat) {
              setFormData(prev => ({
                ...prev,
                patientId: pat.id,
                unitId: pat.unitId || 'betim',
                nomeCompleto: pat.name || pat.nome || '',
                dataNascimento: pat.birthDate || pat.dataNascimento || '',
                telefonePrincipal: pat.phone || pat.telefone || '',
                telefoneSecundario: pat.phoneSecondary || '',
                endereco: pat.address || pat.endereco || '',
                bairro: pat.neighborhood || pat.bairro || '',
                cidade: pat.city || pat.cidade || 'Betim',
                ubsReferencia: pat.ubs || ''
              }));
            }
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar dados:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => { isMounted = false; };
  }, [patientId, initialData]);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (step === 1 && !formData.nomeCompleto) {
      alert('Por favor, informe seu nome completo.');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      await saveSocialAnamnese({
        ...formData,
        origemPreenchimento: 'paciente'
      });
      setSubmitted(true);
      if (onFinished) onFinished();
    } catch (err) {
      console.error('Erro ao enviar:', err);
      alert('Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>Carregando formulário...</p>
      </div>
    );
  }

  // TELA DE AGRADECIMENTO FINAL (IGUAL AO GOOGLE FORM)
  if (submitted) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.cardSuccess}>
          <div style={styles.iconSuccess}>
            <CheckCircle2 size={52} color="#16a34a" />
          </div>
          <h2 style={styles.successTitle}>Respostas Enviadas com Sucesso!</h2>
          <div style={styles.successBox}>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#1f2937' }}>
              Obrigado por atualizar suas informações.
              <br /><br />
              Esses dados ajudam nossa equipe a identificar necessidades sociais e manter seu cadastro atualizado.
              <br /><br />
              Caso seja necessário, o <strong>Serviço Social</strong> poderá entrar em contato.
            </p>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                if (standalone) {
                  window.location.reload();
                } else if (onFinished) {
                  onFinished();
                }
              }}
              style={styles.btnFinish}
            >
              {standalone ? 'Enviar Outra Resposta' : 'Voltar ao Sistema'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        {/* BANNER SUPERIOR */}
        <div style={styles.topBanner}>
          <div style={styles.bannerIcon}>
            <HeartHandshake size={28} color="#ffffff" />
          </div>
          <div>
            <h1 style={styles.bannerTitle}>Anamnese Social – Paciente Renal</h1>
            <p style={styles.bannerDesc}>
              Serviço Social da Clínica • Atualização Cadastral e Apoio ao Tratamento
            </p>
          </div>
        </div>

        {/* BARRA DE PROGRESSO */}
        <div style={styles.progressBarContainer}>
          <div style={{ ...styles.progressBar, width: `${(step / 5) * 100}%` }}></div>
        </div>
        <div style={styles.stepsHeader}>
          <span style={styles.stepCounter}>Etapa {step} de 5</span>
          <span style={styles.stepTitle}>
            {step === 1 && 'Identificação Pessoal'}
            {step === 2 && 'Seu Tratamento'}
            {step === 3 && 'Família & Trabalho'}
            {step === 4 && 'Moradia & Renda'}
            {step === 5 && 'Transporte & Apoio Social'}
          </span>
        </div>

        {/* FORMULÁRIO EM ETAPAS */}
        <form onSubmit={step === 5 ? handleSubmit : handleNext} style={styles.formContent}>
          {/* ETAPA 1: IDENTIFICAÇÃO */}
          {step === 1 && (
            <div style={styles.stepBlock}>
              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Nome completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nomeCompleto}
                  onChange={(e) => handleChange('nomeCompleto', e.target.value)}
                  style={styles.textInput}
                  placeholder="Seu nome completo"
                />
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Data de nascimento *</label>
                <input
                  type="date"
                  required
                  value={formData.dataNascimento}
                  onChange={(e) => handleChange('dataNascimento', e.target.value)}
                  style={styles.textInput}
                />
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Telefone principal *</label>
                <input
                  type="tel"
                  required
                  value={formData.telefonePrincipal}
                  onChange={(e) => handleChange('telefonePrincipal', e.target.value)}
                  style={styles.textInput}
                  placeholder="(31) 90000-0000"
                />
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Telefone secundário</label>
                <input
                  type="tel"
                  value={formData.telefoneSecundario}
                  onChange={(e) => handleChange('telefoneSecundario', e.target.value)}
                  style={styles.textInput}
                  placeholder="(31) 90000-0000 (Opcional)"
                />
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Cidade onde reside *</label>
                <div style={styles.optionsList}>
                  {CIDADES_ATENDIDAS.map(c => (
                    <label key={c} style={formData.cidade === c ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="cidade"
                        required
                        checked={formData.cidade === c}
                        onChange={() => handleChange('cidade', c)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Endereço completo *</label>
                <input
                  type="text"
                  required
                  value={formData.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  style={styles.textInput}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Bairro *</label>
                <input
                  type="text"
                  required
                  value={formData.bairro}
                  onChange={(e) => handleChange('bairro', e.target.value)}
                  style={styles.textInput}
                  placeholder="Nome do seu bairro"
                />
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Qual é a Unidade Básica de Saúde / Posto de Saúde de referência? *</label>
                <input
                  type="text"
                  required
                  value={formData.ubsReferencia}
                  onChange={(e) => handleChange('ubsReferencia', e.target.value)}
                  style={styles.textInput}
                  placeholder="Nome do postinho de saúde perto da sua casa"
                />
              </div>
            </div>
          )}

          {/* ETAPA 2: TRATAMENTO */}
          {step === 2 && (
            <div style={styles.stepBlock}>
              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Qual é o seu tipo de tratamento? *</label>
                <div style={styles.optionsList}>
                  {TIPOS_TRATAMENTO.map(t => (
                    <label key={t} style={formData.tipoTratamento === t ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="tipoTratamento"
                        required
                        checked={formData.tipoTratamento === t}
                        onChange={() => handleChange('tipoTratamento', t)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Qual é a sua escala e turno? *</label>
                <div style={styles.optionsList}>
                  {ESCALAS_TURNO.map(et => (
                    <label key={et} style={formData.escalaTurno === et ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="escalaTurno"
                        required
                        checked={formData.escalaTurno === et}
                        onChange={() => handleChange('escalaTurno', et)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{et}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Em qual sala realiza o tratamento? *</label>
                <div style={styles.optionsList}>
                  {SALAS_TRATAMENTO.map(s => (
                    <label key={s} style={formData.salaTratamento === s ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="salaTratamento"
                        required
                        checked={formData.salaTratamento === s}
                        onChange={() => handleChange('salaTratamento', s)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: PERFIL SOCIAL & DINÂMICA FAMILIAR */}
          {step === 3 && (
            <div style={styles.stepBlock}>
              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Estado civil *</label>
                <div style={styles.optionsList}>
                  {ESTADOS_CIVIS.map(ec => (
                    <label key={ec} style={formData.estadoCivil === ec ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="estadoCivil"
                        required
                        checked={formData.estadoCivil === ec}
                        onChange={() => handleChange('estadoCivil', ec)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{ec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Escolaridade *</label>
                <div style={styles.optionsList}>
                  {NIVEIS_ESCOLARIDADE.map(ne => (
                    <label key={ne} style={formData.escolaridade === ne ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="escolaridade"
                        required
                        checked={formData.escolaridade === ne}
                        onChange={() => handleChange('escolaridade', ne)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{ne}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Atualmente trabalha? *</label>
                <div style={styles.optionsList}>
                  {OPCOES_SIM_NAO.map(op => (
                    <label key={op} style={formData.trabalhaAtualmente === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="trabalhaAtualmente"
                        required
                        checked={formData.trabalhaAtualmente === op}
                        onChange={() => handleChange('trabalhaAtualmente', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Necessita de ajuda para atividades do dia a dia? *</label>
                <div style={styles.optionsList}>
                  {OPCOES_SIM_NAO_PARCIAL.map(op => (
                    <label key={op} style={formData.ajudaAtividades === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="ajudaAtividades"
                        required
                        checked={formData.ajudaAtividades === op}
                        onChange={() => handleChange('ajudaAtividades', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Possui familiar, cuidador ou pessoa de referência? *</label>
                <div style={styles.optionsList}>
                  {OPCOES_SIM_NAO.map(op => (
                    <label key={op} style={formData.possuiCuidador === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="possuiCuidador"
                        required
                        checked={formData.possuiCuidador === op}
                        onChange={() => handleChange('possuiCuidador', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Quem é sua principal pessoa de apoio? *</label>
                <div style={styles.optionsList}>
                  {PESSOAS_APOIO.map(pa => (
                    <label key={pa} style={formData.pessoaApoio === pa ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="pessoaApoio"
                        required
                        checked={formData.pessoaApoio === pa}
                        onChange={() => handleChange('pessoaApoio', pa)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{pa}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Quantas pessoas moram na residência, incluindo você? *</label>
                <div style={styles.optionsList}>
                  {QUANTIDADE_MORADORES.map(qm => (
                    <label key={qm} style={formData.pessoasResidencia === qm ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="pessoasResidencia"
                        required
                        checked={formData.pessoasResidencia === qm}
                        onChange={() => handleChange('pessoasResidencia', qm)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{qm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: MORADIA & RENDA */}
          {step === 4 && (
            <div style={styles.stepBlock}>
              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Qual é aproximadamente a renda familiar mensal? *</label>
                <div style={styles.optionsList}>
                  {FAIXAS_RENDA_FAMILIAR.map(fr => (
                    <label key={fr} style={formData.rendaFamiliar === fr ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="rendaFamiliar"
                        required
                        checked={formData.rendaFamiliar === fr}
                        onChange={() => handleChange('rendaFamiliar', fr)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{fr}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Qual é a situação da moradia? *</label>
                <div style={styles.optionsList}>
                  {SITUACOES_MORADIA.map(sm => (
                    <label key={sm} style={formData.situacaoMoradia === sm ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="situacaoMoradia"
                        required
                        checked={formData.situacaoMoradia === sm}
                        onChange={() => handleChange('situacaoMoradia', sm)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{sm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Possui água encanada? *</label>
                <div style={styles.optionsList}>
                  {OPCOES_SIM_NAO.map(op => (
                    <label key={op} style={formData.aguaEncanada === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="aguaEncanada"
                        required
                        checked={formData.aguaEncanada === op}
                        onChange={() => handleChange('aguaEncanada', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Qual é a condição de esgotamento sanitário? *</label>
                <div style={styles.optionsList}>
                  {CONDICOES_ESGOTAMENTO.map(ce => (
                    <label key={ce} style={formData.esgotamentoSanitario === ce ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="esgotamentoSanitario"
                        required
                        checked={formData.esgotamentoSanitario === ce}
                        onChange={() => handleChange('esgotamentoSanitario', ce)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{ce}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Recebe algum benefício atualmente? *</label>
                <div style={styles.optionsList}>
                  {BENEFICIOS_SOCIAIS.map(bs => (
                    <label key={bs} style={formData.recebeBeneficio === bs ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="recebeBeneficio"
                        required
                        checked={formData.recebeBeneficio === bs}
                        onChange={() => handleChange('recebeBeneficio', bs)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{bs}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Já contribuiu para o INSS? *</label>
                <div style={styles.optionsList}>
                  {['Sim', 'Não', 'Não sabe informar'].map(op => (
                    <label key={op} style={formData.contribuiuInss === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="contribuiuInss"
                        required
                        checked={formData.contribuiuInss === op}
                        onChange={() => handleChange('contribuiuInss', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 5: TRANSPORTE & APOIO SOCIAL */}
          {step === 5 && (
            <div style={styles.stepBlock}>
              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Qual é o principal meio de transporte utilizado para chegar ao tratamento? *</label>
                <div style={styles.optionsList}>
                  {MEIOS_TRANSPORTE.map(mt => (
                    <label key={mt} style={formData.transporteTratamento === mt ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="transporteTratamento"
                        required
                        checked={formData.transporteTratamento === mt}
                        onChange={() => handleChange('transporteTratamento', mt)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{mt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Possui dificuldade para chegar ao tratamento? *</label>
                <div style={styles.optionsList}>
                  {OPCOES_NAO_SIM_AS_VEZES.map(op => (
                    <label key={op} style={formData.dificuldadeTransporte === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="dificuldadeTransporte"
                        required
                        checked={formData.dificuldadeTransporte === op}
                        onChange={() => handleChange('dificuldadeTransporte', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>A renda atual é suficiente para as necessidades básicas da família? *</label>
                <div style={styles.optionsList}>
                  {OPCOES_SIM_NAO_PARCIAL.map(op => (
                    <label key={op} style={formData.rendaSuficiente === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="rendaSuficiente"
                        required
                        checked={formData.rendaSuficiente === op}
                        onChange={() => handleChange('rendaSuficiente', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Existe dificuldade para comprar alimentos? *</label>
                <div style={styles.optionsList}>
                  {OPCOES_NAO_SIM_AS_VEZES.map(op => (
                    <label key={op} style={formData.dificuldadeAlimentos === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="dificuldadeAlimentos"
                        required
                        checked={formData.dificuldadeAlimentos === op}
                        onChange={() => handleChange('dificuldadeAlimentos', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Existe alguma situação familiar, financeira ou social que possa dificultar a continuidade do tratamento? *</label>
                <div style={styles.optionsList}>
                  {OPCOES_DIFICULDADE_TRATAMENTO.map(op => (
                    <label key={op} style={formData.dificuldadeTratamento === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="dificuldadeTratamento"
                        required
                        checked={formData.dificuldadeTratamento === op}
                        onChange={() => handleChange('dificuldadeTratamento', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Gostaria de conversar com o Serviço Social? *</label>
                <div style={styles.optionsList}>
                  {OPCOES_GOSTARIA_CONVERSAR.map(op => (
                    <label key={op} style={formData.gostariaConversar === op ? styles.optionCardSelected : styles.optionCard}>
                      <input
                        type="radio"
                        name="gostariaConversar"
                        required
                        checked={formData.gostariaConversar === op}
                        onChange={() => handleChange('gostariaConversar', op)}
                        style={{ marginRight: '0.65rem' }}
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.questionCard}>
                <label style={styles.qLabel}>Deseja informar alguma situação importante?</label>
                <textarea
                  rows={4}
                  value={formData.situacaoImportante}
                  onChange={(e) => handleChange('situacaoImportante', e.target.value)}
                  style={styles.textInput}
                  placeholder="Escreva aqui se tiver algo que gostaria que nossa assistente social soubesse..."
                />
              </div>
            </div>
          )}

          {/* BOTÕES DE NAVEGAÇÃO DA ETAPA */}
          <div style={styles.navBar}>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                style={styles.btnBack}
              >
                <ArrowLeft size={16} /> Voltar
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="submit"
                style={styles.btnNext}
              >
                Próximo <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                style={styles.btnSubmit}
              >
                <Send size={16} />
                {submitting ? 'Enviando...' : 'Enviar Respostas'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    padding: '1.5rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '720px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0'
  },
  cardSuccess: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '640px',
    padding: '2.5rem 2rem',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    marginTop: '3rem'
  },
  iconSuccess: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#dcfce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem auto'
  },
  successTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 1rem 0'
  },
  successBox: {
    backgroundColor: '#f8fafc',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    textAlign: 'left'
  },
  btnFinish: {
    padding: '0.75rem 1.75rem',
    borderRadius: '10px',
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.95rem',
    border: 'none',
    cursor: 'pointer'
  },
  topBanner: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    padding: '2rem 1.75rem',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  bannerIcon: {
    width: '54px',
    height: '54px',
    borderRadius: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  bannerTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    margin: 0,
    lineHeight: '1.2'
  },
  bannerDesc: {
    fontSize: '0.875rem',
    opacity: 0.9,
    margin: '0.35rem 0 0 0'
  },
  progressBarContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e2e8f0'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7c3aed',
    transition: 'width 0.3s ease'
  },
  stepsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1.75rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  stepCounter: {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#7c3aed',
    letterSpacing: '0.05em'
  },
  stepTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  formContent: {
    padding: '1.75rem'
  },
  stepBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  questionCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f1f5f9'
  },
  qLabel: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1.4'
  },
  textInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1.5px solid #cbd5e1',
    fontSize: '0.95rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  optionCard: {
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '0.9rem',
    color: '#334155',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s ease'
  },
  optionCardSelected: {
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    border: '2px solid #7c3aed',
    backgroundColor: '#f5f3ff',
    fontSize: '0.9rem',
    color: '#6d28d9',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0'
  },
  btnNext: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.95rem',
    border: 'none',
    cursor: 'pointer'
  },
  btnBack: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.9rem',
    border: 'none',
    cursor: 'pointer'
  },
  btnSubmit: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.85rem 1.75rem',
    borderRadius: '10px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};

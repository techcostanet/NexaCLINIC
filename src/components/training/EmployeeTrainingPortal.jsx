import React, { useState, useEffect, useRef } from 'react';
import { 
  getTrainingById, 
  validateEmployeeCpf, 
  createTrainingSubmission 
} from '../../services/firebase/hrService';
import { 
  Award, CheckCircle2, AlertTriangle, Clock, ArrowRight, ArrowLeft, 
  BookOpen, Play, Check, ShieldCheck, UserCheck, RefreshCw, XCircle, RotateCcw
} from 'lucide-react';
import CertificateView from './CertificateView';

export default function EmployeeTrainingPortal({ trainingId, onExitPortal }) {
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Identificação, 2: Pré-teste, 3: Conteúdo, 4: Pós-teste, 5: Conclusão

  // Identificação
  const [cpf, setCpf] = useState('');
  const [validatingCpf, setValidatingCpf] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [manualName, setManualName] = useState('');
  const [manualSector, setManualSector] = useState('');
  const [cpfError, setCpfError] = useState('');

  // Pré-teste
  const [preAnswers, setPreAnswers] = useState({});
  const [preScore, setPreScore] = useState(0);

  // Conteúdo & Timer
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [timerFinished, setTimerFinished] = useState(true);
  const timerRef = useRef(null);

  // Pós-teste
  const [postAnswers, setPostAnswers] = useState({});
  const [postScore, setPostScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const trn = await getTrainingById(trainingId);
        if (trn) {
          setTraining(trn);
          const minSec = (trn.minDurationMinutes || 0) * 60;
          setSecondsRemaining(minSec);
          setTimerFinished(minSec <= 0);
        }
      } catch (e) {
        console.error('Erro ao carregar treinamento:', e);
      } finally {
        setLoading(false);
      }
    }
    if (trainingId) {
      load();
    } else {
      setLoading(false);
    }
  }, [trainingId]);

  // Contagem regressiva no passo 3 (Conteúdo)
  useEffect(() => {
    if (step === 3 && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, secondsRemaining]);

  const maskCpfInput = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let masked = raw;
    if (raw.length > 9) {
      masked = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;
    } else if (raw.length > 6) {
      masked = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    } else if (raw.length > 3) {
      masked = `${raw.slice(0, 3)}.${raw.slice(3)}`;
    }
    return masked;
  };

  const handleCpfChange = async (e) => {
    const formatted = maskCpfInput(e.target.value);
    setCpf(formatted);
    setCpfError('');

    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 11) {
      setValidatingCpf(true);
      try {
        const res = await validateEmployeeCpf(clean);
        if (res.found && res.employee) {
          setEmployeeInfo(res.employee);
          setManualName(res.employee.name);
          setManualSector(res.employee.sector || 'Geral');
        } else {
          setEmployeeInfo(null);
        }
      } catch (err) {
        console.warn('Erro validação:', err);
      } finally {
        setValidatingCpf(false);
      }
    } else {
      setEmployeeInfo(null);
    }
  };

  const handleStartPreTest = () => {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) {
      setCpfError('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }
    if (!employeeInfo && !manualName.trim()) {
      setCpfError('Por favor, informe seu nome completo para emissão do certificado.');
      return;
    }
    // Se não tiver perguntas no pré-teste, avança direto pro conteúdo
    if (!training?.preTestQuestions || training.preTestQuestions.length === 0) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleSelectPreAnswer = (questionId, optionIndex) => {
    setPreAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleFinishPreTest = () => {
    const questions = training?.preTestQuestions || [];
    let correct = 0;
    questions.forEach(q => {
      if (preAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    const calculated = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 100;
    setPreScore(calculated);
    setStep(3); // Vai para o conteúdo
  };

  const handleProceedToPostTest = () => {
    if (!timerFinished) return;
    setStep(4);
  };

  const handleSelectPostAnswer = (questionId, optionIndex) => {
    setPostAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleFinishPostTest = async () => {
    const questions = training?.postTestQuestions || [];
    let correct = 0;
    questions.forEach(q => {
      if (postAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    const calculated = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 100;
    setPostScore(calculated);

    const minPass = training?.minPassingScore || 70;
    const isPassed = calculated >= minPass;
    const gain = calculated - preScore;

    setSubmitting(true);
    try {
      // Gerador de Código de Certificado Único
      const certCode = `NEXA-TRN-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      const payload = {
        trainingId: training.id,
        trainingTitle: training.title,
        employeeId: employeeInfo?.id || '',
        employeeName: employeeInfo?.name || manualName.trim(),
        cpf: cpf,
        role: employeeInfo?.role || 'Colaborador',
        sector: employeeInfo?.sector || manualSector || 'Geral',
        unitId: employeeInfo?.unitId || '',
        unit: employeeInfo?.unit || '',
        preScore: preScore,
        postScore: calculated,
        gainEfficacy: gain,
        passed: isPassed,
        completedAt: new Date().toISOString(),
        expiresAt: training.validityMonths 
          ? new Date(Date.now() + training.validityMonths * 30 * 24 * 60 * 60 * 1000).toISOString() 
          : undefined,
        certificateId: certCode,
        status: isPassed ? 'Aprovado' : 'Reprovado',
        answers: {
          preAnswers,
          postAnswers
        }
      };

      const result = await createTrainingSubmission(payload);
      setSubmissionResult(result);
      setStep(5);
    } catch (e) {
      console.error('Erro ao registrar conclusão do treinamento:', e);
      alert('Erro ao registrar suas respostas. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryPostTest = () => {
    setPostAnswers({});
    setStep(3); // Volta para rever o conteúdo
  };

  const formatTimer = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>
          Carregando treinamento...
        </p>
      </div>
    );
  }

  if (!training) {
    return (
      <div style={styles.centerContainer}>
        <AlertTriangle size={48} color="#f59e0b" />
        <h2 style={{ color: '#0f172a', marginTop: '1rem' }}>Treinamento Não Encontrado</h2>
        <p style={{ color: '#64748b' }}>O link pode estar expirado ou incorreto.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Topo do Portal */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/logo.png" 
              alt="Logo Nexa" 
              style={{ height: '36px', maxWidth: '120px', objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <span style={styles.brandTitle}>NexaCLINIC</span>
              <span style={styles.brandSub}>Capacitação Continuada em Nefrologia</span>
            </div>
          </div>
          <div style={styles.stepBadge}>
            Etapa {step} de 5
          </div>
        </div>
      </header>

      {/* Container Principal */}
      <main style={styles.main}>
        <div style={styles.card}>
          
          {/* Cabeçalho do Treinamento */}
          <div style={styles.trainingHeader}>
            <span style={styles.sectorTag}>{training.sector || 'Geral'}</span>
            <h1 style={styles.title}>{training.title}</h1>
            <p style={styles.desc}>{training.description}</p>
            <div style={styles.badgesRow}>
              <span style={styles.badgeItem}>
                <Clock size={13} /> {training.workloadHours || 2}h de carga horária
              </span>
              <span style={styles.badgeItem}>
                <ShieldCheck size={13} /> Nota de aprovação: {training.minPassingScore || 70}%
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PASSO 1: IDENTIFICAÇÃO DO COLABORADOR */}
          {/* ========================================================= */}
          {step === 1 && (
            <div style={styles.stepContent}>
              <h2 style={styles.stepTitle}>Identificação do Colaborador</h2>
              <p style={styles.stepDesc}>
                Informe seu CPF para vincular a capacitação ao seu histórico profissional e emitir seu certificado oficial.
              </p>

              <div style={styles.formGroup}>
                <label style={styles.label}>CPF</label>
                <input 
                  type="text" 
                  value={cpf} 
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  style={styles.input}
                  maxLength={14}
                  autoFocus
                />
                {validatingCpf && (
                  <span style={styles.validatingHint}>Localizando cadastro no sistema...</span>
                )}
              </div>

              {employeeInfo && (
                <div style={styles.identifiedBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 700 }}>
                    <UserCheck size={18} />
                    <span>Colaborador Identificado</span>
                  </div>
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {employeeInfo.name}
                  </p>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {employeeInfo.role || 'Função'} • Setor: {employeeInfo.sector || 'Geral'}
                  </p>
                </div>
              )}

              {!employeeInfo && cpf.replace(/\D/g, '').length === 11 && (
                <div style={styles.manualBox}>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                    CPF não encontrado no cadastro prévio. Preencha seus dados para prosseguir:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={styles.label}>Nome Completo</label>
                      <input 
                        type="text" 
                        value={manualName} 
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="Seu nome completo"
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Setor</label>
                      <input 
                        type="text" 
                        value={manualSector} 
                        onChange={(e) => setManualSector(e.target.value)}
                        placeholder="Ex: Enfermagem, Recepção, Limpeza"
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>
              )}

              {cpfError && (
                <div style={styles.errorBox}>
                  <AlertTriangle size={16} color="#ef4444" />
                  <span>{cpfError}</span>
                </div>
              )}

              <button 
                onClick={handleStartPreTest}
                style={styles.primaryActionBtn}
              >
                <span>Iniciar Treinamento</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASSO 2: PRÉ-TESTE (Sondagem Inicial) */}
          {/* ========================================================= */}
          {step === 2 && (
            <div style={styles.stepContent}>
              <div style={styles.sectionBadge}>Etapa 1 de 2 • Avaliação Diagnóstica</div>
              <h2 style={styles.stepTitle}>Pré-teste de Conhecimento</h2>
              <p style={styles.stepDesc}>
                Responda às questões abaixo com o que você já sabe sobre o tema. Não se preocupe se errar: este teste serve para medir sua evolução após o treinamento!
              </p>

              <div style={styles.questionsList}>
                {(training.preTestQuestions || []).map((q, idx) => (
                  <div key={q.id || idx} style={styles.questionCard}>
                    <span style={styles.questionNum}>Questão {idx + 1}</span>
                    <h3 style={styles.questionText}>{q.question}</h3>
                    <div style={styles.optionsList}>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = preAnswers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectPreAnswer(q.id, optIdx)}
                            style={{
                              ...styles.optionBtn,
                              ...(isSelected ? styles.optionBtnSelected : {})
                            }}
                          >
                            <span style={{
                              ...styles.optLetter,
                              ...(isSelected ? styles.optLetterSelected : {})
                            }}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span style={styles.optText}>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.actionRow}>
                <button 
                  onClick={handleFinishPreTest}
                  disabled={Object.keys(preAnswers).length < (training.preTestQuestions?.length || 0)}
                  style={{
                    ...styles.primaryActionBtn,
                    opacity: Object.keys(preAnswers).length < (training.preTestQuestions?.length || 0) ? 0.6 : 1
                  }}
                >
                  <span>Concluir Pré-teste e Ver Conteúdo</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASSO 3: CONTEÚDO DIDÁTICO / VÍDEO / MATERIAL */}
          {/* ========================================================= */}
          {step === 3 && (
            <div style={styles.stepContent}>
              <div style={styles.sectionBadge}>Material Didático</div>
              <h2 style={styles.stepTitle}>Conteúdo do Treinamento</h2>
              <p style={styles.stepDesc}>
                Estude atentamente o conteúdo a seguir. O pós-teste será liberado após o tempo mínimo de leitura/estudo.
              </p>

              {/* Temporizador ativo */}
              {!timerFinished && (
                <div style={styles.timerBanner}>
                  <Clock size={20} color="#4f46e5" />
                  <div>
                    <span style={styles.timerTitle}>Tempo mínimo de estudo obrigatório</span>
                    <span style={styles.timerCount}>{formatTimer(secondsRemaining)} restantes</span>
                  </div>
                </div>
              )}

              {/* Se for vídeo incorporado */}
              {training.videoUrl && (
                <div style={styles.videoWrapper}>
                  {training.videoUrl.includes('youtube.com') || training.videoUrl.includes('youtu.be') ? (
                    <iframe 
                      src={training.videoUrl.replace('watch?v=', 'embed/')} 
                      title="Vídeo do Treinamento"
                      style={styles.iframe}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={training.videoUrl} controls style={styles.videoTag} />
                  )}
                </div>
              )}

              {/* Texto explicativo / Diretrizes */}
              {training.textContent && (
                <div style={styles.textContainer}>
                  <div style={styles.textContent}>
                    {training.textContent.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={lIdx} style={styles.textH4}>{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <li key={lIdx} style={styles.textLi}>
                            {line.replace('- ', '')}
                          </li>
                        );
                      }
                      if (!line.trim()) {
                        return <br key={lIdx} />;
                      }
                      return <p key={lIdx} style={styles.textP}>{line}</p>;
                    })}
                  </div>
                </div>
              )}

              {/* Documento PDF se houver */}
              {training.documentUrl && (
                <div style={styles.docBox}>
                  <BookOpen size={24} color="#4f46e5" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b' }}>Material Complementar</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Acesse a apostila oficial em PDF</p>
                  </div>
                  <a 
                    href={training.documentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    style={styles.docLink}
                  >
                    Abrir PDF
                  </a>
                </div>
              )}

              <div style={styles.actionRow}>
                <button 
                  onClick={handleProceedToPostTest}
                  disabled={!timerFinished}
                  style={{
                    ...styles.primaryActionBtn,
                    opacity: timerFinished ? 1 : 0.5,
                    cursor: timerFinished ? 'pointer' : 'not-allowed'
                  }}
                >
                  <span>{timerFinished ? 'Avançar para o Pós-teste' : `Aguarde ${formatTimer(secondsRemaining)}`}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASSO 4: PÓS-TESTE (Avaliação Final) */}
          {/* ========================================================= */}
          {step === 4 && (
            <div style={styles.stepContent}>
              <div style={styles.sectionBadge}>Etapa 2 de 2 • Avaliação de Fixação</div>
              <h2 style={styles.stepTitle}>Pós-teste de Fixação</h2>
              <p style={styles.stepDesc}>
                Responda com atenção às questões abaixo para concluir sua certificação. Nota mínima de aprovação: <strong>{training.minPassingScore || 70}%</strong>.
              </p>

              <div style={styles.questionsList}>
                {(training.postTestQuestions || []).map((q, idx) => (
                  <div key={q.id || idx} style={styles.questionCard}>
                    <span style={styles.questionNum}>Questão {idx + 1}</span>
                    <h3 style={styles.questionText}>{q.question}</h3>
                    <div style={styles.optionsList}>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = postAnswers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectPostAnswer(q.id, optIdx)}
                            style={{
                              ...styles.optionBtn,
                              ...(isSelected ? styles.optionBtnSelected : {})
                            }}
                          >
                            <span style={{
                              ...styles.optLetter,
                              ...(isSelected ? styles.optLetterSelected : {})
                            }}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span style={styles.optText}>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.actionRow}>
                <button 
                  onClick={handleFinishPostTest}
                  disabled={submitting || Object.keys(postAnswers).length < (training.postTestQuestions?.length || 0)}
                  style={{
                    ...styles.primaryActionBtn,
                    opacity: Object.keys(postAnswers).length < (training.postTestQuestions?.length || 0) ? 0.6 : 1
                  }}
                >
                  <span>{submitting ? 'Processando...' : 'Submeter Avaliação'}</span>
                  <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASSO 5: CONCLUSÃO & RESULTADO */}
          {/* ========================================================= */}
          {step === 5 && submissionResult && (
            <div style={styles.stepContent}>
              {submissionResult.passed ? (
                <div style={styles.resultSuccessCard}>
                  <div style={styles.successIconCircle}>
                    <Award size={42} color="#10b981" />
                  </div>
                  <h2 style={styles.resultSuccessTitle}>Parabéns, Você Foi Aprovado(a)!</h2>
                  <p style={styles.resultSuccessDesc}>
                    Seu treinamento foi registrado com sucesso e seu certificado digital já está disponível.
                  </p>

                  <div style={styles.metricsBox}>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Nota Pré-teste</span>
                      <span style={styles.metricVal}>{submissionResult.preScore}%</span>
                    </div>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Nota Pós-teste</span>
                      <span style={styles.metricValHighlight}>{submissionResult.postScore}%</span>
                    </div>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Ganho de Eficácia</span>
                      <span style={styles.metricValEfficacy}>
                        +{submissionResult.gainEfficacy}%
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={() => setShowCertificate(true)}
                      style={styles.openCertBtn}
                    >
                      <Award size={20} />
                      <span>Visualizar & Baixar Certificado</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.resultFailCard}>
                  <div style={styles.failIconCircle}>
                    <XCircle size={42} color="#ef4444" />
                  </div>
                  <h2 style={styles.resultFailTitle}>Você Não Atingiu a Nota Mínima</h2>
                  <p style={styles.resultFailDesc}>
                    Sua nota no pós-teste foi de <strong>{postScore}%</strong>, sendo necessário pelo menos <strong>{training.minPassingScore || 70}%</strong>.
                  </p>

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={handleRetryPostTest}
                      style={styles.retryBtn}
                    >
                      <RotateCcw size={18} />
                      <span>Revisar Conteúdo e Tentar Novamente</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Modal do Certificado */}
      {showCertificate && submissionResult && (
        <CertificateView 
          submission={submissionResult} 
          training={training} 
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0.75rem 1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  headerInner: {
    maxWidth: '780px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTitle: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.1
  },
  brandSub: {
    display: 'block',
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: 500
  },
  stepBadge: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.25rem 0.65rem',
    borderRadius: '20px'
  },
  main: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    padding: '1.5rem 1rem'
  },
  card: {
    maxWidth: '780px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    padding: '1.75rem',
    overflow: 'hidden'
  },
  trainingHeader: {
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '1.25rem',
    marginBottom: '1.5rem'
  },
  sectorTag: {
    display: 'inline-block',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    marginBottom: '0.4rem',
    textTransform: 'uppercase'
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0.2rem 0 0.4rem 0',
    lineHeight: 1.25
  },
  desc: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.4
  },
  badgesRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.75rem',
    flexWrap: 'wrap'
  },
  badgeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.78rem',
    color: '#475569',
    backgroundColor: '#f8fafc',
    padding: '0.25rem 0.55rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  stepContent: {
    marginTop: '0.5rem'
  },
  sectionBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.2rem'
  },
  stepTitle: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: '0 0 0.35rem 0'
  },
  stepDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0 0 1.25rem 0',
    lineHeight: 1.45
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '0.35rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: '8px',
    border: '1.5px solid #cbd5e1',
    fontSize: '0.95rem',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  validatingHint: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#4f46e5',
    marginTop: '0.35rem'
  },
  identifiedBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '0.9rem',
    marginBottom: '1.25rem'
  },
  manualBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1.25rem'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.82rem',
    marginBottom: '1rem'
  },
  primaryActionBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.85rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
    transition: 'all 0.2s'
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  questionCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem'
  },
  questionNum: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#4f46e5',
    textTransform: 'uppercase'
  },
  questionText: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0.35rem 0 1rem 0',
    lineHeight: 1.4
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  optionBtnSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff'
  },
  optLetter: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.78rem',
    fontWeight: 700,
    flexShrink: 0
  },
  optLetterSelected: {
    backgroundColor: '#4f46e5',
    color: '#ffffff'
  },
  optText: {
    fontSize: '0.85rem',
    color: '#1e293b',
    fontWeight: 500,
    lineHeight: 1.35
  },
  actionRow: {
    marginTop: '1.5rem'
  },
  timerBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    backgroundColor: '#eef2ff',
    border: '1px solid #c7d2fe',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    marginBottom: '1.25rem'
  },
  timerTitle: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#3730a3'
  },
  timerCount: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: 800,
    color: '#4f46e5'
  },
  videoWrapper: {
    position: 'relative',
    paddingBottom: '56.25%',
    height: 0,
    overflow: 'hidden',
    borderRadius: '12px',
    marginBottom: '1.25rem',
    backgroundColor: '#000'
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none'
  },
  videoTag: {
    width: '100%',
    height: 'auto',
    borderRadius: '12px'
  },
  textContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1.25rem'
  },
  textContent: {
    fontSize: '0.9rem',
    color: '#334155',
    lineHeight: 1.6
  },
  textH4: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '1rem 0 0.5rem 0'
  },
  textP: {
    margin: '0.4rem 0'
  },
  textLi: {
    marginLeft: '1.2rem',
    margin: '0.25rem 0'
  },
  docBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    marginBottom: '1.25rem'
  },
  docLink: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 700
  },
  resultSuccessCard: {
    textAlign: 'center',
    padding: '1.5rem 0.5rem'
  },
  successIconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#dcfce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem auto'
  },
  resultSuccessTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#15803d',
    margin: '0 0 0.4rem 0'
  },
  resultSuccessDesc: {
    fontSize: '0.9rem',
    color: '#475569',
    margin: 0
  },
  metricsBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginTop: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0'
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
    marginBottom: '0.2rem'
  },
  metricVal: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#334155'
  },
  metricValHighlight: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#4f46e5'
  },
  metricValEfficacy: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#15803d'
  },
  openCertBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.9rem 1.6rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(79, 70, 229, 0.3)'
  },
  resultFailCard: {
    textAlign: 'center',
    padding: '1.5rem 0.5rem'
  },
  failIconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem auto'
  },
  resultFailTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#b91c1c',
    margin: '0 0 0.4rem 0'
  },
  resultFailDesc: {
    fontSize: '0.9rem',
    color: '#475569',
    margin: 0
  },
  retryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#334155',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.85rem 1.4rem',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  centerContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '1rem'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

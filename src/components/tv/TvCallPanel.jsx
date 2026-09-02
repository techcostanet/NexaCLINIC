import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Volume2, VolumeX, Maximize, Minimize, Clock, Building2, 
  User, Stethoscope, Sparkles, Radio, CheckCircle2, ChevronLeft, ChevronRight,
  Apple, Activity, Droplets, Smile, Users, HelpCircle, ShieldCheck, SlidersHorizontal
} from 'lucide-react';
import { dbService } from '../../firebase';
import { TIP_CATEGORIES, DEFAULT_TIPS } from '../../services/firebase/tvTipsService';
import TvTipsManagerModal from './TvTipsManagerModal';

const CATEGORY_ICONS = {
  hemodialise: Activity,
  nutricao: Apple,
  liquidos: Droplets,
  mental: Smile,
  social: Users,
  mitos: HelpCircle,
  cuidados: ShieldCheck
};

export default function TvCallPanel({ unitId: initialUnitId, onExitPortal }) {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const paramUnit = urlParams.get('unidade') || urlParams.get('unit') || initialUnitId || 'all';

  const [selectedUnit, setSelectedUnit] = useState(paramUnit);
  const [calls, setCalls] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [tenantSettings, setTenantSettings] = useState({ name: 'Nexa Clínica', logo: '', themeColor: '#0891b2' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Educational Tips Carousel States
  const [tips, setTips] = useState(DEFAULT_TIPS);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tipProgress, setTipProgress] = useState(0);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const lastProcessedCallIdRef = useRef(null);
  const audioCtxRef = useRef(null);
  const wakeLockRef = useRef(null);
  const callTimerRef = useRef(null);

  // Active tips list (filtered by active !== false)
  const activeTips = useMemo(() => {
    const list = tips.filter(t => t.active !== false);
    return list.length > 0 ? list : DEFAULT_TIPS;
  }, [tips]);

  const currentTip = useMemo(() => {
    if (!activeTips || activeTips.length === 0) return DEFAULT_TIPS[0];
    return activeTips[currentTipIndex % activeTips.length] || activeTips[0];
  }, [activeTips, currentTipIndex]);

  // Digital Clock updates every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Tenant Settings (Logo, Name, Theme)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (dbService.getTenantSettings) {
          const settings = await dbService.getTenantSettings();
          if (settings) {
            setTenantSettings(prev => ({
              name: settings.name || prev.name,
              logo: settings.logo || prev.logo,
              themeColor: settings.themeColor || prev.themeColor
            }));
          }
        }
      } catch (err) {
        console.error('Erro ao obter dados institucionais para o painel:', err);
      }
    };
    loadSettings();
  }, []);

  // Subscribe to Educational Tips
  useEffect(() => {
    const unsub = dbService.subscribeToTvTips ? dbService.subscribeToTvTips((items) => {
      if (items && Array.isArray(items) && items.length > 0) {
        setTips(items);
      }
    }) : () => {};

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Carousel Progress & Slide Rotation Timer
  useEffect(() => {
    // If patient call is currently active or carousel is paused, freeze carousel
    if (isCallActive || isCarouselPaused) {
      return;
    }

    const durationSeconds = Number(currentTip?.duration) || 14;
    const intervalMs = 100;
    const step = (intervalMs / (durationSeconds * 1000)) * 100;

    const timer = setInterval(() => {
      setTipProgress(prev => {
        if (prev + step >= 100) {
          setCurrentTipIndex(old => (old + 1) % activeTips.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isCallActive, isCarouselPaused, currentTip, activeTips.length]);

  const handleNextTip = () => {
    setTipProgress(0);
    setCurrentTipIndex(prev => (prev + 1) % activeTips.length);
  };

  const handlePrevTip = () => {
    setTipProgress(0);
    setCurrentTipIndex(prev => (prev - 1 + activeTips.length) % activeTips.length);
  };

  // Screen WakeLock to prevent TV from sleeping
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && !wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        // Ignorar se não suportado
      }
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Web Audio API Dual-Tone Chime ("Ding-Dong")
  const playHospitalChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Tone 1: High harmonic (659.25 Hz - E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.45, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.9);

      // Tone 2: Low harmonic (523.25 Hz - C5) starting at 0.5s
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, now + 0.5);
      gain2.gain.setValueAtTime(0, now + 0.5);
      gain2.gain.linearRampToValueAtTime(0.5, now + 0.55);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.5);
      osc2.stop(now + 1.8);
    } catch (e) {
      console.warn('Erro ao tocar chime do painel:', e);
    }
  };

  // Text-to-Speech Voice Announcement
  const speakAnnouncement = (patientName, roomName) => {
    try {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      const phrase = `Atenção: Paciente ${patientName}. Favor dirigir-se ao ${roomName}.`;
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.92;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const brVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR');
      if (brVoice) {
        utterance.voice = brVoice;
      }

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 1600);
    } catch (e) {
      console.warn('Erro na síntese de voz do painel:', e);
    }
  };

  // Unlock audio on initial user gesture (Smart TV compliance)
  const unlockAudio = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        audioCtxRef.current.resume();
      }
      playHospitalChime();
      setAudioUnlocked(true);
    } catch (e) {
      console.error(e);
      setAudioUnlocked(true);
    }
  };

  // Subscribe to Realtime Patient Calls
  useEffect(() => {
    const unsub = dbService.subscribeToPatientCalls(selectedUnit, (items) => {
      setCalls(items);

      if (items && items.length > 0) {
        const newest = items[0];

        // Dispara quando houver uma nova chamada ou rechamada
        if (newest && newest.id !== lastProcessedCallIdRef.current) {
          lastProcessedCallIdRef.current = newest.id;
          setCurrentCall(newest);
          setIsCallActive(true);

          // Disparar Chime e Fala
          playHospitalChime();
          speakAnnouncement(newest.patientName, newest.room);

          // Efeito de Flash / Destaque visual
          setIsFlashing(true);
          const flashTimer = setTimeout(() => setIsFlashing(false), 8000);

          // Mantém a chamada do paciente em destaque por 22 segundos, depois volta para as dicas
          if (callTimerRef.current) clearTimeout(callTimerRef.current);
          callTimerRef.current = setTimeout(() => {
            setIsCallActive(false);
          }, 22000);

          return () => {
            clearTimeout(flashTimer);
            if (callTimerRef.current) clearTimeout(callTimerRef.current);
          };
        }
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
      if (callTimerRef.current) clearTimeout(callTimerRef.current);
    };
  }, [selectedUnit]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, [currentTime]);

  const formattedHours = useMemo(() => {
    return currentTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [currentTime]);

  // Histórico de chamadas anteriores
  const historyCalls = useMemo(() => {
    if (!calls || calls.length === 0) return [];
    if (!currentCall || !isCallActive) return calls.slice(0, 5);
    return calls.filter(c => c.id !== currentCall.id).slice(0, 5);
  }, [calls, currentCall, isCallActive]);

  const categoryConfig = useMemo(() => {
    return TIP_CATEGORIES[currentTip?.category] || TIP_CATEGORIES.nutricao;
  }, [currentTip]);

  const CategoryIconComponent = useMemo(() => {
    return CATEGORY_ICONS[currentTip?.category] || Activity;
  }, [currentTip]);

  return (
    <div style={styles.tvContainer}>
      {/* Banner Superior com Logo, Relógio e Controles */}
      <header style={styles.header}>
        <div style={styles.brandingBox}>
          {tenantSettings.logo ? (
            <img 
              src={tenantSettings.logo} 
              alt={tenantSettings.name} 
              style={styles.logoImg} 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={styles.logoFallback}>
              <Building2 size={32} color="#ffffff" />
            </div>
          )}
          <div>
            <h1 style={styles.clinicTitle}>{tenantSettings.name}</h1>
            <div style={styles.unitBadgeRow}>
              <span style={styles.unitBadge}>
                {selectedUnit === 'all' ? 'Geral' : selectedUnit === 'betim' ? 'Betim' : 'Taguatinga'}
              </span>
              <span style={styles.liveIndicator}>
                <span style={styles.liveDot}></span>
                Ao Vivo
              </span>
            </div>
          </div>
        </div>

        {/* Relógio Digital em Alta Resolução */}
        <div style={styles.clockBox}>
          <div style={styles.timeDisplay}>{formattedHours}</div>
          <div style={styles.dateDisplay}>{formattedDate}</div>
        </div>

        {/* Controles do Painel (Som, Tela Cheia, Dicas, Sair) */}
        <div style={styles.controlsBox}>
          <button
            onClick={() => setIsTipsModalOpen(true)}
            style={{
              ...styles.controlBtn,
              borderColor: 'rgba(56, 189, 248, 0.4)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)'
            }}
            title="Gerenciar Dicas Educativas"
          >
            <Sparkles size={20} color="#38bdf8" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8' }}>Dicas</span>
          </button>

          <button 
            onClick={audioUnlocked ? () => setAudioUnlocked(false) : unlockAudio} 
            style={{
              ...styles.controlBtn,
              backgroundColor: audioUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              borderColor: audioUnlocked ? '#10b981' : '#ef4444'
            }}
            title={audioUnlocked ? 'Som Ativo' : 'Ativar Áudio'}
          >
            {audioUnlocked ? <Volume2 size={22} color="#10b981" /> : <VolumeX size={22} color="#ef4444" />}
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: audioUnlocked ? '#10b981' : '#ef4444' }}>
              {audioUnlocked ? 'Áudio' : 'Ativar'}
            </span>
          </button>

          <button 
            onClick={toggleFullscreen} 
            style={styles.controlBtn} 
            title="Tela Cheia"
          >
            {isFullscreen ? <Minimize size={22} color="#e2e8f0" /> : <Maximize size={22} color="#e2e8f0" />}
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>Tela</span>
          </button>

          {onExitPortal && (
            <button onClick={onExitPortal} style={styles.controlBtn} title="Sair">
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' }}>Sair</span>
            </button>
          )}
        </div>
      </header>

      {/* Banner Informativo se o áudio estiver bloqueado */}
      {!audioUnlocked && (
        <div style={styles.audioAlertBanner} onClick={unlockAudio}>
          <Volume2 size={26} color="#ffffff" />
          <span>Toque ou clique na tela para ativar o sino e a voz da Smart TV</span>
        </div>
      )}

      {/* Área Principal (Corpo do Painel) */}
      <main style={styles.mainGrid}>
        {/* Lado Esquerdo: Chamada Ativa OU Carrossel de Dicas Educativas */}
        {isCallActive && currentCall ? (
          <section style={{
            ...styles.activeCallCard,
            borderColor: isFlashing ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)',
            boxShadow: isFlashing 
              ? '0 0 50px rgba(56, 189, 248, 0.5), inset 0 0 30px rgba(56, 189, 248, 0.2)' 
              : '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={styles.activeCallContent}>
              <div style={styles.callingBadgeRow}>
                <span style={styles.callingBadge}>
                  <Radio size={20} />
                  CHAMANDO AGORA
                </span>
                {currentCall.callCount > 1 && (
                  <span style={styles.repeatBadge}>
                    {currentCall.callCount}ª Chamada
                  </span>
                )}
              </div>

              <div style={styles.patientNameWrapper}>
                <span style={styles.patientLabel}>PACIENTE</span>
                <h2 style={styles.patientNameText}>{currentCall.patientName}</h2>
              </div>

              <div style={styles.roomBox}>
                <div style={styles.roomBadgeHeader}>
                  <Building2 size={28} color="#ffffff" />
                  <span>CONSULTÓRIO / DESTINO</span>
                </div>
                <div style={styles.roomNameText}>
                  {currentCall.room || 'Consultório 1'}
                </div>
              </div>

              {currentCall.doctorName && (
                <div style={styles.doctorInfoRow}>
                  <Stethoscope size={24} color="#38bdf8" />
                  <span>{currentCall.doctorName}</span>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* Carrossel de Dicas de Saúde & Nefrologia */
          <section 
            style={{
              ...styles.tipsCard,
              borderColor: categoryConfig.borderColor,
              background: categoryConfig.gradient,
              boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 40px ${categoryConfig.color}15`
            }}
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            {/* Barra Superior do Card com Categoria e Controles */}
            <div style={styles.tipCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  ...styles.categoryIconCircle,
                  backgroundColor: `${categoryConfig.color}30`,
                  border: `2px solid ${categoryConfig.color}`
                }}>
                  <CategoryIconComponent size={26} color={categoryConfig.color} />
                </div>
                <div>
                  <span style={{
                    ...styles.categoryPill,
                    color: categoryConfig.color,
                    backgroundColor: `${categoryConfig.color}20`,
                    border: `1px solid ${categoryConfig.borderColor}`
                  }}>
                    {categoryConfig.label}
                  </span>
                  <div style={styles.tipSequenceText}>
                    Orientação { (currentTipIndex % activeTips.length) + 1 } de { activeTips.length }
                  </div>
                </div>
              </div>

              <div style={styles.carouselNavGroup}>
                <button 
                  type="button" 
                  onClick={handlePrevTip} 
                  style={styles.carouselNavBtn}
                  title="Anterior"
                >
                  <ChevronLeft size={22} color="#cbd5e1" />
                </button>
                <button 
                  type="button" 
                  onClick={handleNextTip} 
                  style={styles.carouselNavBtn}
                  title="Próxima"
                >
                  <ChevronRight size={22} color="#cbd5e1" />
                </button>
              </div>
            </div>

            {/* Conteúdo Central da Dica */}
            <div style={styles.tipBody}>
              <h2 style={{
                ...styles.tipTitle,
                color: '#ffffff',
                textShadow: `0 0 30px ${categoryConfig.color}60`
              }}>
                {currentTip?.title}
              </h2>
              <p style={styles.tipText}>
                {currentTip?.text}
              </p>
            </div>

            {/* Rodapé da Dica com Barra de Progresso e Assinatura */}
            <div style={styles.tipFooter}>
              <div style={styles.tipFooterRow}>
                <div style={styles.hospitalSignature}>
                  <Sparkles size={18} color={categoryConfig.color} />
                  <span>Espaço Saúde & Cuidado Renal • Equipe Multidisciplinar</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
                  Aguarde a sua chamada no painel
                </span>
              </div>

              {/* Barra de Progresso do Slide */}
              <div style={styles.progressBarTrack}>
                <div 
                  style={{
                    ...styles.progressBarFill,
                    width: `${tipProgress}%`,
                    backgroundColor: categoryConfig.color,
                    boxShadow: `0 0 12px ${categoryConfig.color}`
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Lado Direito: Histórico das Últimas Chamadas */}
        <aside style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <Clock size={24} color="#38bdf8" />
            <h3 style={styles.historyTitle}>Últimas Chamadas</h3>
          </div>

          <div style={styles.historyList}>
            {historyCalls.length === 0 ? (
              <div style={styles.emptyHistoryText}>
                Nenhuma chamada anterior registrada hoje.
              </div>
            ) : (
              historyCalls.map((item, idx) => (
                <div key={item.id || idx} style={styles.historyItem}>
                  <div style={styles.historyItemTop}>
                    <span style={styles.historyItemName}>{item.patientName}</span>
                    <span style={styles.historyItemTime}>
                      {item.calledAt ? new Date(item.calledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div style={styles.historyItemBottom}>
                    <span style={styles.historyRoomBadge}>{item.room || 'Consultório'}</span>
                    {item.doctorName && (
                      <span style={styles.historyDocName}>{item.doctorName}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rodapé Informativo */}
          <div style={styles.historyFooter}>
            <Sparkles size={18} color="#38bdf8" />
            <span>NexaCLINIC • TV Corporativa Inteligente</span>
          </div>
        </aside>
      </main>

      {/* Modal de Gerenciamento das Dicas */}
      <TvTipsManagerModal 
        isOpen={isTipsModalOpen} 
        onClose={() => setIsTipsModalOpen(false)} 
      />
    </div>
  );
}

const styles = {
  tvContainer: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#090d16',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    userSelect: 'none'
  },
  header: {
    height: '110px',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '2px solid rgba(56, 189, 248, 0.2)',
    padding: '0 2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10
  },
  brandingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  logoImg: {
    height: '65px',
    maxWidth: '180px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))'
  },
  logoFallback: {
    width: '58px',
    height: '58px',
    borderRadius: '12px',
    backgroundColor: '#0284c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clinicTitle: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#ffffff',
    textShadow: '0 2px 10px rgba(0,0,0,0.4)'
  },
  unitBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.25rem'
  },
  unitBadge: {
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.3)'
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#10b981',
    textTransform: 'uppercase'
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981'
  },
  clockBox: {
    textAlign: 'center'
  },
  timeDisplay: {
    fontSize: '2.5rem',
    fontWeight: '900',
    letterSpacing: '0.04em',
    color: '#38bdf8',
    textShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
    fontVariantNumeric: 'tabular-nums'
  },
  dateDisplay: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    textTransform: 'capitalize',
    marginTop: '-0.2rem'
  },
  controlsBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  controlBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  audioAlertBanner: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    padding: '0.75rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
  },
  mainGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 420px',
    gap: '2rem',
    padding: '2rem 2.5rem',
    height: 'calc(100vh - 110px)'
  },
  activeCallCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: '24px',
    border: '3px solid rgba(56, 189, 248, 0.3)',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(20px)'
  },
  activeCallContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  callingBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  callingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '1.25rem',
    fontWeight: '900',
    letterSpacing: '0.1em',
    padding: '0.6rem 1.4rem',
    borderRadius: '100px',
    boxShadow: '0 0 25px rgba(220, 38, 38, 0.6)'
  },
  repeatBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    color: '#38bdf8',
    border: '1px solid #38bdf8',
    fontSize: '1rem',
    fontWeight: '700',
    padding: '0.4rem 1rem',
    borderRadius: '100px'
  },
  patientNameWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  patientLabel: {
    fontSize: '1.2rem',
    fontWeight: '700',
    letterSpacing: '0.15em',
    color: '#94a3b8'
  },
  patientNameText: {
    margin: 0,
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    textShadow: '0 4px 25px rgba(0, 0, 0, 0.6)'
  },
  roomBox: {
    backgroundColor: '#0284c7',
    borderRadius: '20px',
    padding: '1.75rem 2.5rem',
    boxShadow: '0 10px 30px rgba(2, 132, 199, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  roomBadgeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: '800',
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '0.5rem'
  },
  roomNameText: {
    fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '0.02em',
    textTransform: 'uppercase'
  },
  doctorInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#cbd5e1'
  },

  /* Tips Card Styles */
  tipsCard: {
    borderRadius: '24px',
    border: '2px solid',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    transition: 'all 0.5s ease',
    overflow: 'hidden'
  },
  tipCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  categoryIconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
  },
  categoryPill: {
    display: 'inline-block',
    padding: '0.35rem 0.9rem',
    borderRadius: '100px',
    fontSize: '1rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  },
  tipSequenceText: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: '0.2rem'
  },
  carouselNavGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  carouselNavBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  tipBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    margin: 'auto 0'
  },
  tipTitle: {
    margin: 0,
    fontSize: 'clamp(2.2rem, 3.8vw, 3.5rem)',
    fontWeight: '900',
    lineHeight: 1.15,
    letterSpacing: '-0.02em'
  },
  tipText: {
    margin: 0,
    fontSize: 'clamp(1.3rem, 2.2vw, 1.95rem)',
    color: '#e2e8f0',
    lineHeight: 1.5,
    fontWeight: '400',
    maxWidth: '92%'
  },
  tipFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  tipFooterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  hospitalSignature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#cbd5e1'
  },
  progressBarTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '100px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '100px',
    transition: 'width 0.1s linear'
  },

  /* History Aside Styles */
  historyCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: '24px',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    backdropFilter: 'blur(20px)'
  },
  historyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '1.25rem'
  },
  historyTitle: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#ffffff'
  },
  historyList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    overflowY: 'auto'
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '1rem',
    marginTop: '2rem'
  },
  historyItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: '16px',
    padding: '1.1rem 1.25rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'transform 0.2s ease'
  },
  historyItemTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  historyItemName: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#ffffff'
  },
  historyItemTime: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#38bdf8',
    fontVariantNumeric: 'tabular-nums'
  },
  historyItemBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  historyRoomBadge: {
    fontSize: '0.85rem',
    fontWeight: '800',
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    color: '#38bdf8',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid rgba(2, 132, 199, 0.4)'
  },
  historyDocName: {
    fontSize: '0.9rem',
    color: '#94a3b8'
  },
  historyFooter: {
    marginTop: 'auto',
    paddingTop: '1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600'
  }
};

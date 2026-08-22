import React, { useState } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, Info, Zap, ArrowRight } from 'lucide-react';

export default function ClinicalCalculatorsTab({ patient, prescription, latestExam }) {
  const [activeCalc, setActiveCalc] = useState('ktv'); // 'ktv', 'ganzoni', 'recirculation', 'ufrate'

  // 1. Kt/V Daugirdas 2nd gen state
  const [ktvPre, setKtvPre] = useState(latestExam?.ureaPre || 140);
  const [ktvPost, setKtvPost] = useState(latestExam?.ureaPost || 38);
  const [ktvTime, setKtvTime] = useState(prescription?.sessionTime || 4.0);
  const [ktvUf, setKtvUf] = useState(2.5);
  const [ktvWeight, setKtvWeight] = useState(prescription?.dryWeight || patient?.dryWeight || 65);

  // 2. Ganzoni formula state
  const [ganzoniWeight, setGanzoniWeight] = useState(prescription?.dryWeight || patient?.dryWeight || 65);
  const [ganzoniHbTarget, setGanzoniHbTarget] = useState(12.0);
  const [ganzoniHbCurrent, setGanzoniHbCurrent] = useState(latestExam?.hemoglobin || 10.5);
  const [ganzoniDepot, setGanzoniDepot] = useState(500);

  // 3. Recirculation state
  const [recSys, setRecSys] = useState(120);
  const [recArt, setRecArt] = useState(115);
  const [recVen, setRecVen] = useState(40);

  // 4. UF Rate state
  const [ufVol, setUfVol] = useState(2800); // mL
  const [ufHours, setUfHours] = useState(4.0);
  const [ufPatWeight, setUfPatWeight] = useState(prescription?.dryWeight || patient?.dryWeight || 65);

  // Calculations
  // Kt/V Daugirdas: -ln(R - 0.008*t) + (4 - 3.5*R) * (UF / W)
  const calcKtvResult = () => {
    const pre = parseFloat(ktvPre);
    const post = parseFloat(ktvPost);
    const t = parseFloat(ktvTime);
    const uf = parseFloat(ktvUf);
    const w = parseFloat(ktvWeight);
    if (!pre || !post || pre <= post || !t || !w) return null;
    const R = post / pre;
    const urr = ((pre - post) / pre) * 100;
    const ktv = -Math.log(R - 0.008 * t) + (4 - 3.5 * R) * (uf / w);
    return {
      ktv: ktv > 0 ? ktv.toFixed(2) : '0.00',
      urr: urr.toFixed(1),
      isAdequate: ktv >= 1.2
    };
  };

  // Ganzoni: Total Iron Deficit (mg) = [Weight (kg) × (Target Hb - Actual Hb) (g/dL) × 2.4] + Iron Depot (mg)
  const calcGanzoniResult = () => {
    const w = parseFloat(ganzoniWeight);
    const target = parseFloat(ganzoniHbTarget);
    const current = parseFloat(ganzoniHbCurrent);
    const depot = parseFloat(ganzoniDepot);
    if (!w || !target || !current) return null;
    const diff = Math.max(0, target - current);
    const totalDeficit = (w * diff * 2.4) + depot;
    const ampoules = Math.ceil(totalDeficit / 100);
    return {
      totalDeficit: Math.round(totalDeficit),
      ampoules
    };
  };

  // Recirculation %: [(S - A) / (S - V)] * 100
  const calcRecirculationResult = () => {
    const S = parseFloat(recSys);
    const A = parseFloat(recArt);
    const V = parseFloat(recVen);
    if (!S || !A || !V || (S - V) <= 0) return null;
    const rec = ((S - A) / (S - V)) * 100;
    return {
      percent: Math.max(0, rec).toFixed(1),
      isHigh: rec > 10
    };
  };

  // UF Rate: (UF mL) / (Weight kg * Hours) -> mL/kg/h
  const calcUfRateResult = () => {
    const vol = parseFloat(ufVol);
    const h = parseFloat(ufHours);
    const w = parseFloat(ufPatWeight);
    if (!vol || !h || !w) return null;
    const rate = vol / (w * h);
    return {
      rate: rate.toFixed(1),
      isSafe: rate <= 13.0
    };
  };

  const ktvRes = calcKtvResult();
  const ganzoniRes = calcGanzoniResult();
  const recRes = calcRecirculationResult();
  const ufRes = calcUfRateResult();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Calculadoras Nefrológicas</h3>
          <p style={styles.subtitle}>Cálculos de adequação dialítica, reposição de ferro e segurança hemodinâmica.</p>
        </div>
      </div>

      {/* Calculator Navigation */}
      <div style={styles.calcNav}>
        <button
          type="button"
          onClick={() => setActiveCalc('ktv')}
          style={{ ...styles.navBtn, ...(activeCalc === 'ktv' ? styles.navBtnActive : {}) }}
        >
          <Calculator size={15} />
          <span>Kt/V Daugirdas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCalc('ganzoni')}
          style={{ ...styles.navBtn, ...(activeCalc === 'ganzoni' ? styles.navBtnActive : {}) }}
        >
          <Zap size={15} />
          <span>Fórmula de Ganzoni</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCalc('ufrate')}
          style={{ ...styles.navBtn, ...(activeCalc === 'ufrate' ? styles.navBtnActive : {}) }}
        >
          <Info size={15} />
          <span>Taxa de Ultrafiltração</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCalc('recirculation')}
          style={{ ...styles.navBtn, ...(activeCalc === 'recirculation' ? styles.navBtnActive : {}) }}
        >
          <ArrowRight size={15} />
          <span>Recirculação de Acesso</span>
        </button>
      </div>

      {/* CALCULATOR 1: Kt/V Daugirdas */}
      {activeCalc === 'ktv' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h4 style={styles.cardTitle}>Kt/V de Daugirdas de 2ª Geração (Single-Pool)</h4>
              <p style={styles.cardSub}>Fórmula padrão recomendada pelo KDOQI e SBN para aferição da dose de diálise entregue.</p>
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.inputsColumn}>
              <div className="form-group">
                <label>Ureia Pré-Diálise (mg/dL)</label>
                <input 
                  type="number" className="form-control" 
                  value={ktvPre} onChange={e => setKtvPre(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Ureia Pós-Diálise (mg/dL)</label>
                <input 
                  type="number" className="form-control" 
                  value={ktvPost} onChange={e => setKtvPost(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Duração da Sessão (Horas)</label>
                <input 
                  type="number" step="0.5" className="form-control" 
                  value={ktvTime} onChange={e => setKtvTime(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Ultrafiltração Total (Litros)</label>
                <input 
                  type="number" step="0.1" className="form-control" 
                  value={ktvUf} onChange={e => setKtvUf(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Peso Pós-Diálise (kg)</label>
                <input 
                  type="number" step="0.5" className="form-control" 
                  value={ktvWeight} onChange={e => setKtvWeight(e.target.value)} 
                />
              </div>
            </div>

            <div style={styles.resultBox}>
              <span style={styles.resLabel}>Resultado de Adequação</span>
              {ktvRes ? (
                <>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: ktvRes.isAdequate ? '#059669' : '#dc2626' }}>
                    {ktvRes.ktv}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#475569', marginTop: '0.25rem' }}>
                    Taxa de Remoção de Ureia (URR): {ktvRes.urr}%
                  </div>
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: ktvRes.isAdequate ? '#dcfce7' : '#fee2e2',
                    color: ktvRes.isAdequate ? '#166534' : '#991b1b',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {ktvRes.isAdequate ? '✓ Adequação dialítica excelente (Kt/V ≥ 1.20)' : '⚠ Sub-diálise: Kt/V abaixo da meta recomendada (< 1.20)'}
                  </div>
                </>
              ) : (
                <p style={{ color: '#94a3b8' }}>Preencha os valores para calcular o Kt/V.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 2: Ganzoni Formula */}
      {activeCalc === 'ganzoni' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h4 style={styles.cardTitle}>Fórmula de Ganzoni (Reposição de Ferro IV)</h4>
              <p style={styles.cardSub}>Cálculo do déficit total de ferro elementar para tratamento da anemia ferropriva na DRC.</p>
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.inputsColumn}>
              <div className="form-group">
                <label>Peso Corporal (kg)</label>
                <input 
                  type="number" step="0.5" className="form-control" 
                  value={ganzoniWeight} onChange={e => setGanzoniWeight(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Hemoglobina Alvo (g/dL)</label>
                <input 
                  type="number" step="0.1" className="form-control" 
                  value={ganzoniHbTarget} onChange={e => setGanzoniHbTarget(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Hemoglobina Atual (g/dL)</label>
                <input 
                  type="number" step="0.1" className="form-control" 
                  value={ganzoniHbCurrent} onChange={e => setGanzoniHbCurrent(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Ferro de Depósito (mg)</label>
                <input 
                  type="number" className="form-control" 
                  value={ganzoniDepot} onChange={e => setGanzoniDepot(e.target.value)} 
                />
              </div>
            </div>

            <div style={styles.resultBox}>
              <span style={styles.resLabel}>Déficit Total Calculado</span>
              {ganzoniRes ? (
                <>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0284c7' }}>
                    {ganzoniRes.totalDeficit} <small style={{ fontSize: '1rem' }}>mg</small>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
                    {ganzoniRes.ampoules} ampolas de Noripurum (100mg)
                  </div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                    Esquema sugerido: 100mg (1 ampola) por sessão durante {ganzoniRes.ampoules} sessões de hemodiálise.
                  </div>
                </>
              ) : (
                <p style={{ color: '#94a3b8' }}>Preencha os valores para calcular o déficit de ferro.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 3: UF Rate */}
      {activeCalc === 'ufrate' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h4 style={styles.cardTitle}>Taxa de Ultrafiltração Segura (mL/kg/h)</h4>
              <p style={styles.cardSub}>Monitoramento para prevenção de hipotensão intradialítica e atordoamento miocárdico.</p>
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.inputsColumn}>
              <div className="form-group">
                <label>Volume de UF Programado (mL)</label>
                <input 
                  type="number" step="100" className="form-control" 
                  value={ufVol} onChange={e => setUfVol(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Tempo de Sessão (Horas)</label>
                <input 
                  type="number" step="0.5" className="form-control" 
                  value={ufHours} onChange={e => setUfHours(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Peso do Paciente (kg)</label>
                <input 
                  type="number" step="0.5" className="form-control" 
                  value={ufPatWeight} onChange={e => setUfPatWeight(e.target.value)} 
                />
              </div>
            </div>

            <div style={styles.resultBox}>
              <span style={styles.resLabel}>Taxa de Remoção Hídrica</span>
              {ufRes ? (
                <>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: ufRes.isSafe ? '#059669' : '#dc2626' }}>
                    {ufRes.rate} <small style={{ fontSize: '1rem' }}>mL/kg/h</small>
                  </div>
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: ufRes.isSafe ? '#dcfce7' : '#fee2e2',
                    color: ufRes.isSafe ? '#166534' : '#991b1b',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {ufRes.isSafe 
                      ? '✓ Taxa Segura (≤ 13.0 mL/kg/h)' 
                      : '⚠ Taxa Elevada (> 13.0 mL/kg/h) - Alto risco de hipotensão e isquemia miocárdica. Considere aumentar o tempo de sessão.'}
                  </div>
                </>
              ) : (
                <p style={{ color: '#94a3b8' }}>Preencha os valores para calcular a taxa de UF.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 4: Recirculation */}
      {activeCalc === 'recirculation' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h4 style={styles.cardTitle}>Taxa de Recirculação do Acesso Vascular</h4>
              <p style={styles.cardSub}>Detecção precoce de estenose de fístula arteriovenosa ou reversão de linhas.</p>
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.inputsColumn}>
              <div className="form-group">
                <label>Ureia Sistêmica / Periférica (S)</label>
                <input 
                  type="number" className="form-control" 
                  value={recSys} onChange={e => setRecSys(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Ureia Linha Arterial (A)</label>
                <input 
                  type="number" className="form-control" 
                  value={recArt} onChange={e => setRecArt(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Ureia Linha Venosa (V)</label>
                <input 
                  type="number" className="form-control" 
                  value={recVen} onChange={e => setRecVen(e.target.value)} 
                />
              </div>
            </div>

            <div style={styles.resultBox}>
              <span style={styles.resLabel}>Porcentagem de Recirculação</span>
              {recRes ? (
                <>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: recRes.isHigh ? '#dc2626' : '#059669' }}>
                    {recRes.percent}%
                  </div>
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: recRes.isHigh ? '#fee2e2' : '#dcfce7',
                    color: recRes.isHigh ? '#991b1b' : '#166534',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {recRes.isHigh 
                      ? '⚠ Recirculação Elevada (> 10%) - Suspeita de estenose no acesso vascular ou proximidade excessiva das agulhas.' 
                      : '✓ Recirculação Normal (≤ 10%)'}
                  </div>
                </>
              ) : (
                <p style={{ color: '#94a3b8' }}>Preencha as dosagens de ureia para calcular.</p>
              )}
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
    gap: '1rem',
  },
  header: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.75rem',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0,
    marginTop: '0.2rem',
  },
  calcNav: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  navBtnActive: {
    backgroundColor: '#8b5cf6',
    color: '#fff',
    borderColor: '#8b5cf6',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem',
    marginBottom: '1.25rem',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0,
  },
  cardSub: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '0.2rem 0 0 0',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem',
    alignItems: 'center',
  },
  inputsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  resultBox: {
    backgroundColor: '#f8fafc',
    border: '2px dashed #cbd5e1',
    borderRadius: '10px',
    padding: '1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '220px',
  },
  resLabel: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  }
};

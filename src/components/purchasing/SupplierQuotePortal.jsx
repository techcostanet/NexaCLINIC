import React, { useState, useEffect } from 'react';
import { 
  Building2, CheckCircle2, Clock, DollarSign, FileText, UploadCloud, 
  AlertTriangle, Truck, Calendar, ShieldCheck, Send, Check, X, 
  ExternalLink, Printer, ArrowRight, Package
} from 'lucide-react';
import { dbService } from '../../firebase';

export default function SupplierQuotePortal({ token: propToken, onExitPortal }) {
  const [token, setToken] = useState(propToken || '');
  const [quotation, setQuotation] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [existingResponse, setExistingResponse] = useState(null);

  // Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [freightType, setFreightType] = useState('CIF'); // 'CIF' | 'FOB'
  const [freightValue, setFreightValue] = useState('');
  const [minBillingValue, setMinBillingValue] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('Boleto 28 dias');
  const [proposalValidityDays, setProposalValidityDays] = useState('15');
  const [leadTimeDays, setLeadTimeDays] = useState('3');
  const [observations, setObservations] = useState('');
  const [proposalFile, setProposalFile] = useState(null);
  const [proposalDocUrl, setProposalDocUrl] = useState('');

  // Items State: map of itemId -> { available: boolean, unitPrice: string, brand: string, packaging: string, itemNotes: string }
  const [itemsOffer, setItemsOffer] = useState({});

  useEffect(() => {
    // Extract token from URL if not passed via props
    let activeToken = token;
    if (!activeToken) {
      const params = new URLSearchParams(window.location.search);
      activeToken = params.get('token') || params.get('cotacao') || '';
      setToken(activeToken);
    }

    if (!activeToken) {
      setLoading(false);
      setErrorMsg('Token de acesso não fornecido ou link inválido.');
      return;
    }

    loadQuotationData(activeToken);
  }, []);

  const loadQuotationData = async (tok) => {
    setLoading(true);
    try {
      const result = await dbService.getWebQuotationByToken(tok);
      if (!result) {
        setErrorMsg('Cotação não encontrada ou token expirado.');
        setLoading(false);
        return;
      }

      const { quotation: qData, supplier: sData } = result;
      setQuotation(qData);
      setSupplier(sData);

      // Pre-fill contact details from supplier register if available
      setContactName(sData.contactPerson || '');
      setContactPhone(sData.phone || '');
      setContactEmail(sData.email || '');

      // Initialize items offer map
      const initialItems = {};
      (qData.items || []).forEach(item => {
        initialItems[item.id] = {
          available: true,
          unitPrice: '',
          brand: '',
          packaging: '',
          itemNotes: ''
        };
      });

      // Check if supplier already submitted a response
      if (sData.status === 'Respondida') {
        const allResponses = await dbService.getQuoteResponses(qData.id);
        const myResp = allResponses.find(r => r.token === tok);
        if (myResp) {
          setExistingResponse(myResp);
          setFreightType(myResp.freightType || 'CIF');
          setFreightValue(myResp.freightValue ? String(myResp.freightValue) : '');
          setMinBillingValue(myResp.minBillingValue ? String(myResp.minBillingValue) : '');
          setPaymentTerm(myResp.paymentTerm || 'Boleto 28 dias');
          setProposalValidityDays(myResp.proposalValidityDays ? String(myResp.proposalValidityDays) : '15');
          setLeadTimeDays(myResp.leadTimeDays ? String(myResp.leadTimeDays) : '3');
          setObservations(myResp.observations || '');
          setProposalDocUrl(myResp.proposalDocUrl || '');

          if (myResp.items && Array.isArray(myResp.items)) {
            myResp.items.forEach(it => {
              if (initialItems[it.itemId]) {
                initialItems[it.itemId] = {
                  available: it.available !== false,
                  unitPrice: it.unitPrice ? String(it.unitPrice) : '',
                  brand: it.brand || '',
                  packaging: it.packaging || '',
                  itemNotes: it.itemNotes || ''
                };
              }
            });
          }
        }
      }

      setItemsOffer(initialItems);
    } catch (err) {
      console.error('Erro ao carregar dados da cotação:', err);
      setErrorMsg('Falha de conexão ao carregar a cotação.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setItemsOffer(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  // Calculations
  const calculatedItems = (quotation?.items || []).map(item => {
    const offer = itemsOffer[item.id] || { available: true, unitPrice: '' };
    const priceNum = parseFloat(String(offer.unitPrice).replace(',', '.')) || 0;
    const total = offer.available ? priceNum * (item.quantity || 1) : 0;
    return {
      ...item,
      ...offer,
      unitPriceNum: priceNum,
      totalPrice: total
    };
  });

  const subtotalItems = calculatedItems.reduce((acc, it) => acc + (it.totalPrice || 0), 0);
  const freightNum = freightType === 'FOB' ? (parseFloat(String(freightValue).replace(',', '.')) || 0) : 0;
  const grandTotal = subtotalItems + freightNum;

  // Check if deadline has passed
  const isExpired = () => {
    if (!quotation?.deadline) return false;
    return new Date() > new Date(quotation.deadline);
  };

  const calculateTimeRemaining = () => {
    if (!quotation?.deadline) return null;
    const diff = new Date(quotation.deadline).getTime() - new Date().getTime();
    if (diff <= 0) return 'Encerrada';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} dia(s) e ${hours % 24}h restantes`;
    }
    return `${hours}h ${mins}min restantes`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quotation || !supplier) return;

    if (isExpired()) {
      alert('Esta cotação já ultrapassou o prazo limite e não pode mais receber lances.');
      return;
    }

    const availableItemsCount = calculatedItems.filter(it => it.available && it.unitPriceNum > 0).length;
    if (availableItemsCount === 0) {
      alert('Por favor, informe o preço de pelo menos um dos itens solicitados.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedFileUrl = proposalDocUrl;

      // Upload proposal PDF if selected
      if (proposalFile) {
        try {
          uploadedFileUrl = await dbService.uploadSupplierProposalDoc(
            proposalFile,
            quotation.code,
            supplier.name
          );
        } catch (uploadErr) {
          console.warn('Erro ao subir anexo:', uploadErr);
        }
      }

      const itemsToSave = calculatedItems.map(it => ({
        itemId: it.id,
        productName: it.productName,
        available: it.available,
        brand: it.brand || '',
        packaging: it.packaging || '',
        unitPrice: it.unitPriceNum,
        totalPrice: it.totalPrice,
        itemNotes: it.itemNotes || ''
      }));

      const payload = {
        quotationId: quotation.id,
        quotationCode: quotation.code,
        token,
        supplierId: supplier.supplierId || '',
        supplierName: supplier.name,
        cnpj: supplier.cnpj || '',
        contactName,
        contactPhone,
        contactEmail,
        freightType,
        freightValue: freightNum,
        minBillingValue: parseFloat(String(minBillingValue).replace(',', '.')) || 0,
        paymentTerm,
        proposalValidityDays: parseInt(proposalValidityDays, 10) || 15,
        leadTimeDays: parseInt(leadTimeDays, 10) || 3,
        proposalDocUrl: uploadedFileUrl,
        proposalFileName: proposalFile ? proposalFile.name : '',
        observations,
        items: itemsToSave,
        totalItemsAmount: subtotalItems,
        totalGrandAmount: grandTotal
      };

      const saved = await dbService.submitSupplierQuote(token, quotation.id, payload);
      setExistingResponse(saved);
      setSubmittedSuccess(true);
    } catch (err) {
      console.error('Erro ao enviar cotação:', err);
      alert('Ocorreu um erro ao enviar a proposta. Verifique sua conexão e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: '#0369a1', fontWeight: '600' }}>Carregando cotação comercial...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorCard}>
          <AlertTriangle size={48} color="#dc2626" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#991b1b', margin: '0 0 0.5rem 0' }}>Acesso Indisponível</h2>
          <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5' }}>{errorMsg}</p>
          {onExitPortal && (
            <button onClick={onExitPortal} style={styles.btnSecondary} className="mt-3">
              Voltar ao Início
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.portalWrapper}>
      {/* Top Header */}
      <header style={styles.portalHeader}>
        <div style={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.logoBadge}>
              <Building2 size={24} color="#fff" />
            </div>
            <div>
              <h1 style={styles.portalTitle}>Nex-Ai CLINIC — Portal de Cotações</h1>
              <span style={styles.portalSubtitle}>
                Unidade {quotation?.unit} • Comprador: {quotation?.buyerName}
              </span>
            </div>
          </div>

          <div style={styles.headerRight}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Cotação</span>
              <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>{quotation?.code}</strong>
            </div>
            <div style={{
              backgroundColor: isExpired() ? '#fee2e2' : '#f0fdf4',
              border: `1px solid ${isExpired() ? '#fca5a5' : '#86efac'}`,
              color: isExpired() ? '#991b1b' : '#166534',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <Clock size={14} />
              <span>{calculateTimeRemaining()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main style={styles.mainContent}>
        {/* Info Banner */}
        <div style={styles.infoBanner}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Fornecedor Convidado</span>
            <h2 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0.15rem 0 0 0', fontWeight: '800' }}>{supplier?.name}</h2>
            {supplier?.cnpj && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>CNPJ: {supplier.cnpj}</span>}
          </div>
          <div style={{ maxWidth: '450px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: '#334155', display: 'block', fontWeight: '600' }}>{quotation?.title}</span>
            {quotation?.notes && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', display: 'block', marginTop: '0.25rem' }}>
                "{quotation.notes}"
              </span>
            )}
          </div>
        </div>

        {/* Success Modal / Banner */}
        {submittedSuccess && (
          <div style={styles.successBanner}>
            <CheckCircle2 size={28} color="#16a34a" />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#166534', fontWeight: '800' }}>Proposta Comercial Enviada com Sucesso!</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#15803d' }}>
                O comprador da Nex-Ai CLINIC já recebeu os seus valores em tempo real. Você pode atualizar seus lances a qualquer momento antes do prazo limite.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section 1: Condições Comerciais */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Truck size={18} color="#0284c7" />
              <h3 style={styles.cardTitle}>Condições Comerciais</h3>
            </div>

            <div style={styles.formGrid}>
              <div className="form-group">
                <label style={styles.inputLabel}>Frete *</label>
                <select 
                  className="form-control" 
                  value={freightType} 
                  onChange={e => setFreightType(e.target.value)}
                  style={styles.selectInput}
                  disabled={isExpired()}
                >
                  <option value="CIF">CIF — Incluso (Frete Grátis / Por conta do fornecedor)</option>
                  <option value="FOB">FOB — Por conta da clínica (Informar valor abaixo)</option>
                </select>
              </div>

              {freightType === 'FOB' && (
                <div className="form-group">
                  <label style={styles.inputLabel}>Valor do Frete (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    className="form-control" 
                    value={freightValue} 
                    onChange={e => setFreightValue(e.target.value)}
                    style={styles.input}
                    disabled={isExpired()}
                  />
                </div>
              )}

              <div className="form-group">
                <label style={styles.inputLabel}>Prazo de Entrega (Dias) *</label>
                <input 
                  type="number" 
                  required
                  placeholder="Ex: 3" 
                  className="form-control" 
                  value={leadTimeDays} 
                  onChange={e => setLeadTimeDays(e.target.value)}
                  style={styles.input}
                  disabled={isExpired()}
                />
              </div>

              <div className="form-group">
                <label style={styles.inputLabel}>Condição de Pagamento *</label>
                <select 
                  className="form-control" 
                  value={paymentTerm} 
                  onChange={e => setPaymentTerm(e.target.value)}
                  style={styles.selectInput}
                  disabled={isExpired()}
                >
                  <option value="Boleto 28 dias">Boleto 28 dias</option>
                  <option value="Boleto 30 dias">Boleto 30 dias</option>
                  <option value="Boleto 30/60 dias">Boleto 30/60 dias</option>
                  <option value="Boleto 14 dias">Boleto 14 dias</option>
                  <option value="À vista com desconto">À vista com desconto</option>
                  <option value="PIX na Entrega">PIX na Entrega</option>
                </select>
              </div>

              <div className="form-group">
                <label style={styles.inputLabel}>Faturamento Mínimo (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Ex: 500.00" 
                  className="form-control" 
                  value={minBillingValue} 
                  onChange={e => setMinBillingValue(e.target.value)}
                  style={styles.input}
                  disabled={isExpired()}
                />
              </div>

              <div className="form-group">
                <label style={styles.inputLabel}>Validade da Proposta (Dias) *</label>
                <input 
                  type="number" 
                  required
                  placeholder="Ex: 15" 
                  className="form-control" 
                  value={proposalValidityDays} 
                  onChange={e => setProposalValidityDays(e.target.value)}
                  style={styles.input}
                  disabled={isExpired()}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tabela de Itens */}
          <div style={styles.card}>
            <div style={{ ...styles.cardHeader, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} color="#0284c7" />
                <h3 style={styles.cardTitle}>Itens Solicitados ({quotation?.items?.length || 0})</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Digite o valor unitário e a marca ofertada
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={styles.itemsTable}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.thCell, width: '40px' }}>Disp.</th>
                    <th style={{ ...styles.thCell, minWidth: '220px' }}>Insumo</th>
                    <th style={{ ...styles.thCell, width: '100px', textAlign: 'center' }}>Qtd</th>
                    <th style={{ ...styles.thCell, minWidth: '130px' }}>Preço (R$) *</th>
                    <th style={{ ...styles.thCell, minWidth: '140px' }}>Marca</th>
                    <th style={{ ...styles.thCell, minWidth: '130px' }}>Embalagem</th>
                    <th style={{ ...styles.thCell, width: '130px', textAlign: 'right' }}>Total (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedItems.map((item, idx) => (
                    <tr key={item.id} style={{ ...styles.tableRow, opacity: item.available ? 1 : 0.45 }}>
                      <td style={{ ...styles.tdCell, textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={item.available} 
                          onChange={e => handleItemChange(item.id, 'available', e.target.checked)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          title={item.available ? "Item disponível" : "Sem estoque deste item"}
                          disabled={isExpired()}
                        />
                      </td>

                      <td style={styles.tdCell}>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{item.productName}</strong>
                        {item.specification && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                            {item.specification}
                          </span>
                        )}
                      </td>

                      <td style={{ ...styles.tdCell, textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }}>
                        {item.quantity} {item.unit || 'un'}
                      </td>

                      <td style={styles.tdCell}>
                        <input 
                          type="number" 
                          step="0.0001"
                          placeholder="0,00"
                          disabled={!item.available || isExpired()}
                          value={item.unitPrice || ''}
                          onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)}
                          style={{
                            ...styles.input,
                            borderColor: item.available && item.unitPriceNum > 0 ? '#10b981' : '#cbd5e1',
                            fontWeight: '700',
                            color: '#0f172a'
                          }}
                        />
                      </td>

                      <td style={styles.tdCell}>
                        <input 
                          type="text" 
                          placeholder="Ex: Fresenius, Nipro..."
                          disabled={!item.available || isExpired()}
                          value={item.brand || ''}
                          onChange={e => handleItemChange(item.id, 'brand', e.target.value)}
                          style={styles.input}
                        />
                      </td>

                      <td style={styles.tdCell}>
                        <input 
                          type="text" 
                          placeholder="Ex: Cx c/ 50"
                          disabled={!item.available || isExpired()}
                          value={item.packaging || ''}
                          onChange={e => handleItemChange(item.id, 'packaging', e.target.value)}
                          style={styles.input}
                        />
                      </td>

                      <td style={{ ...styles.tdCell, textAlign: 'right', fontWeight: '800', fontSize: '0.9rem', color: item.available && item.totalPrice > 0 ? '#0284c7' : '#94a3b8' }}>
                        {item.available && item.totalPrice > 0 
                          ? item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div style={styles.summaryBar}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Subtotal Itens</span>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                    {subtotalItems.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </div>
                {freightType === 'FOB' && freightNum > 0 && (
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Frete FOB</span>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                      {freightNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </strong>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Valor Total da Proposta</span>
                <strong style={{ fontSize: '1.4rem', color: '#0284c7', fontWeight: '900' }}>
                  {grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: Anexo e Observações */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <FileText size={18} color="#0284c7" />
              <h3 style={styles.cardTitle}>Anexo e Observações Comerciais</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={styles.inputLabel}>Anexo da Proposta (PDF ou Imagem)</label>
                {proposalDocUrl && !proposalFile && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: '#f0f9ff', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid #bae6fd' }}>
                    <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600' }}>✓ Documento anexado anteriormente</span>
                    <a href={proposalDocUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700', textDecoration: 'underline' }}>
                      Visualizar
                    </a>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="application/pdf,image/*,.doc,.docx"
                  onChange={e => setProposalFile(e.target.files?.[0] || null)}
                  className="form-control"
                  style={styles.input}
                  disabled={isExpired()}
                />
                {proposalFile && (
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700', marginTop: '0.2rem', display: 'block' }}>
                    ✓ Arquivo selecionado: {proposalFile.name} ({(proposalFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              <div className="form-group">
                <label style={styles.inputLabel}>Observações para o Comprador</label>
                <textarea 
                  rows={3}
                  className="form-control"
                  placeholder="Informações sobre lotes, prazos de validade, bonificações..."
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  style={styles.textarea}
                  disabled={isExpired()}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={styles.actionFooter}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Ao enviar, sua proposta será gravada diretamente na central de compras da clínica com carimbo de data/hora.
            </div>

            <button 
              type="submit" 
              disabled={submitting || isExpired()}
              style={{
                ...styles.btnSubmit,
                backgroundColor: isExpired() ? '#94a3b8' : '#0284c7',
                cursor: isExpired() ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? (
                <>Enviando Proposta...</>
              ) : isExpired() ? (
                <>Cotação Encerrada</>
              ) : (
                <>
                  <Send size={16} />
                  <span>Enviar Proposta Comercial</span>
                </>
              )}
            </button>
          </div>

        </form>
      </main>

      <footer style={styles.portalFooter}>
        <span>© {new Date().getFullYear()} Nex-Ai CLINIC — Sistema Integrado de Compras Hospitalares</span>
      </footer>
    </div>
  );
}

const styles = {
  portalWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  portalHeader: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: '1rem 1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  logoBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#0284c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  portalTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#f8fafc'
  },
  portalSubtitle: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    display: 'block',
    marginTop: '0.1rem'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '1.5rem auto',
    padding: '0 1rem',
    flex: 1,
    width: '100%',
    boxSizing: 'border-box'
  },
  infoBanner: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '1.25rem 1.5rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  successBanner: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  cardHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc'
  },
  cardTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#1e293b'
  },
  formGrid: {
    padding: '1.25rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem'
  },
  inputLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '0.35rem',
    display: 'block'
  },
  input: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    boxSizing: 'border-box'
  },
  selectInput: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    backgroundColor: '#fff',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    boxSizing: 'border-box'
  },
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    backgroundColor: '#f1f5f9',
    borderBottom: '1px solid #cbd5e1'
  },
  thCell: {
    padding: '0.75rem 0.85rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.02em'
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease'
  },
  tdCell: {
    padding: '0.75rem 0.85rem',
    verticalAlign: 'middle'
  },
  summaryBar: {
    padding: '1rem 1.25rem',
    backgroundColor: '#f8fafc',
    borderTop: '2px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  actionFooter: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem'
  },
  btnSubmit: {
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.75rem',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)',
    transition: 'transform 0.1s ease'
  },
  btnSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  portalFooter: {
    backgroundColor: '#fff',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
    padding: '1rem',
    fontSize: '0.75rem',
    color: '#94a3b8'
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
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #0284c7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorCard: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center',
    maxWidth: '400px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    border: '1px solid #fee2e2'
  }
};

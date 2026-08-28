import React, { useRef } from 'react';
import { 
  X, Printer, Send, Copy, FileText, CheckCircle2, Building2, 
  User, Calendar, Clock, DollarSign, Package, AlertCircle, ShieldCheck,
  Truck, ArrowRight, ExternalLink
} from 'lucide-react';

export default function PurchaseOrderModal({ 
  isOpen, 
  onClose, 
  order, 
  quotation, 
  currentUser 
}) {
  if (!isOpen || !order) return null;

  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const itemsText = (order.items || []).map((it, idx) => 
      `${idx + 1}. ${it.productName} - ${it.quantity} ${it.unit} x ${it.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} = ${it.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ${it.brand ? `(Marca: ${it.brand})` : ''}`
    ).join('\n');

    const summary = `*ORDEM DE COMPRA #${order.code || 'PO'} — NexaCLINIC (${order.unit || 'Clínica'})*\n` +
      `*Fornecedor:* ${order.supplierName} (${order.cnpj || 'CNPJ não informado'})\n` +
      `*Data de Emissão:* ${new Date(order.createdAt || Date.now()).toLocaleDateString('pt-BR')}\n` +
      `*Previsão de Entrega:* ${order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString('pt-BR') : 'A combinar'}\n` +
      `*Condição de Pagamento:* ${order.paymentTerm || 'Boleto 28 dias'}\n` +
      `*Frete:* ${order.freightType || 'CIF'}\n\n` +
      `*ITENS DO PEDIDO:*\n${itemsText}\n\n` +
      `*VALOR TOTAL:* ${order.totalGrandAmount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n` +
      `*Comprador:* ${order.buyerName || currentUser?.name || 'Setor de Compras'}\n` +
      `*Instruções:* Favor confirmar o recebimento desta Ordem de Compra e enviar a NF-e para faturamento.`;

    navigator.clipboard.writeText(summary);
    alert('Resumo da Ordem de Compra copiado com sucesso!');
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = (order.supplierPhone || '').replace(/\D/g, '');
    const itemsText = (order.items || []).map((it, idx) => 
      `• ${it.productName}: ${it.quantity} ${it.unit} x ${it.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    ).join('\n');

    const text = `Olá, *${order.supplierContact || order.supplierName}*!\n\n` +
      `Segue a *Ordem de Compra Oficial #${order.code}* emitida pela *NexaCLINIC (${order.unit || 'Clínica'})* referente à cotação *#${order.quotationCode || quotation?.code}*:\n\n` +
      `📦 *Valor Total:* ${order.totalGrandAmount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
      `💳 *Condição:* ${order.paymentTerm || 'Boleto'}\n` +
      `🚚 *Frete:* ${order.freightType || 'CIF'}\n` +
      `⏱️ *Prazo de Entrega:* ${order.leadTimeDays || 3} dias úteis\n\n` +
      `*Itens Confirmados:*\n${itemsText}\n\n` +
      `Favor confirmar o recebimento e o faturamento deste pedido. Obrigado!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone ? '55' + cleanPhone : ''}&text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const unitName = order.unit === 'Taguatinga' ? 'NexaCLINIC — Unidade Taguatinga/DF' : 'NexaCLINIC — Unidade Betim/MG';
  const unitAddress = order.unit === 'Taguatinga' 
    ? 'QNA 30, Lote 12 — Taguatinga Norte, Brasília - DF | CEP: 72110-300'
    : 'Av. Governador Valadares, 450 — Centro, Betim - MG | CEP: 32600-115';
  const unitCnpj = order.unit === 'Taguatinga' ? '45.892.114/0002-88' : '45.892.114/0001-07';

  return (
    <div style={styles.overlay}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-purchase-order, #printable-purchase-order * {
            visibility: visible;
          }
          #printable-purchase-order {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div style={styles.modalContainer}>
        {/* Header Modal Bar */}
        <div style={styles.modalHeader} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#0284c7" />
            <div>
              <h2 style={styles.modalTitle}>Ordem de Compra Oficial ({order.code})</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Homologada via NexaPROCURE • Cotação #{order.quotationCode || quotation?.code}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={handlePrint} style={styles.btnActionPrint} title="Imprimir Ordem de Compra em Folha A4">
              <Printer size={15} />
              <span>Imprimir</span>
            </button>
            <button onClick={handleSendWhatsApp} style={styles.btnActionWhatsApp} title="Disparar no WhatsApp do Fornecedor">
              <Send size={15} />
              <span>WhatsApp</span>
            </button>
            <button onClick={handleCopySummary} style={styles.btnActionSecondary} title="Copiar resumo do pedido">
              <Copy size={15} />
              <span>Copiar</span>
            </button>
            <button onClick={onClose} style={styles.closeBtn}>×</button>
          </div>
        </div>

        {/* Printable Order Sheet */}
        <div style={styles.scrollContent}>
          <div id="printable-purchase-order" style={styles.orderSheet} ref={printRef}>
            
            {/* Header Timbrado */}
            <div style={styles.sheetHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={styles.logoBadge}>Nexa</div>
                    <div>
                      <h1 style={styles.brandTitle}>NexaCLINIC</h1>
                      <span style={styles.brandSubtitle}>Sistema Integrado de Gestão em Nefrologia & Saúde</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#475569', lineHeight: '1.4' }}>
                    <strong>{unitName}</strong><br />
                    <span>CNPJ: {unitCnpj} • I.E: Isento</span><br />
                    <span>{unitAddress}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={styles.poNumberBadge}>
                    ORDEM DE COMPRA
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0369a1' }}>
                      {order.code}
                    </div>
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
                    <strong>Emissão:</strong> {new Date(order.createdAt || Date.now()).toLocaleDateString('pt-BR')} às {new Date(order.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}<br />
                    <strong>Cotação Origem:</strong> #{order.quotationCode || quotation?.code || 'N/A'}<br />
                    <strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: '700' }}>EMITIDO / HOMOLOGADO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Grids: Comprador & Fornecedor */}
            <div style={styles.partiesGrid}>
              <div style={styles.partyBox}>
                <div style={styles.partyBoxHeader}>
                  <Building2 size={14} color="#0284c7" />
                  <strong>FORNECEDOR VENCEDOR</strong>
                </div>
                <div style={styles.partyBoxBody}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>
                    {order.supplierName}
                  </strong>
                  {order.tradeName && <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block' }}>Nome Fantasia: {order.tradeName}</span>}
                  <span><strong>CNPJ:</strong> {order.cnpj || 'Sob Consulta'}</span>
                  <span><strong>Contato:</strong> {order.supplierContact || 'Representante Comercial'}</span>
                  <span><strong>Telefone:</strong> {order.supplierPhone || 'Não informado'}</span>
                  <span><strong>E-mail:</strong> {order.supplierEmail || 'Não informado'}</span>
                </div>
              </div>

              <div style={styles.partyBox}>
                <div style={styles.partyBoxHeader}>
                  <ShieldCheck size={14} color="#16a34a" />
                  <strong>DADOS DE ENTREGA & FATURAMENTO</strong>
                </div>
                <div style={styles.partyBoxBody}>
                  <span><strong>Local de Entrega:</strong> Almoxarifado Central ({order.unit})</span>
                  <span><strong>Endereço:</strong> {unitAddress}</span>
                  <span><strong>Comprador Responsável:</strong> {order.buyerName || currentUser?.name || 'Setor de Compras'}</span>
                  <span><strong>E-mail Faturamento:</strong> compras@dialize.com.br / financeiro@dialize.com.br</span>
                  <span><strong>Horário Recebimento:</strong> Segunda a Sexta, das 08:00 às 17:00</span>
                </div>
              </div>
            </div>

            {/* Table of Items */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={styles.tableTitleRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Package size={15} color="#0284c7" />
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>INVENTÁRIO DE INSUMOS HOMOLOGADOS</strong>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Total de {order.items?.length || 0} item(ns)
                </span>
              </div>

              <table style={styles.orderTable}>
                <thead>
                  <tr style={styles.orderTheadRow}>
                    <th style={{ ...styles.orderTh, width: '45px', textAlign: 'center' }}>Item</th>
                    <th style={styles.orderTh}>Descrição do Insumo / Especificação</th>
                    <th style={{ ...styles.orderTh, width: '130px' }}>Marca Ofertada</th>
                    <th style={{ ...styles.orderTh, width: '90px', textAlign: 'center' }}>Qtd</th>
                    <th style={{ ...styles.orderTh, width: '70px', textAlign: 'center' }}>Unid</th>
                    <th style={{ ...styles.orderTh, width: '110px', textAlign: 'right' }}>Preço Unit.</th>
                    <th style={{ ...styles.orderTh, width: '120px', textAlign: 'right' }}>Total (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((it, idx) => (
                    <tr key={it.id || idx} style={styles.orderTr}>
                      <td style={{ ...styles.orderTd, textAlign: 'center', fontWeight: '700', color: '#64748b' }}>
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td style={styles.orderTd}>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>
                          {it.productName}
                        </strong>
                        {it.specification && (
                          <span style={{ fontSize: '0.73rem', color: '#64748b', display: 'block' }}>
                            {it.specification}
                          </span>
                        )}
                      </td>
                      <td style={styles.orderTd}>
                        <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: '600' }}>
                          {it.brand || 'Conforme Padrão'}
                        </span>
                      </td>
                      <td style={{ ...styles.orderTd, textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>
                        {it.quantity}
                      </td>
                      <td style={{ ...styles.orderTd, textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                        {it.unit || 'un'}
                      </td>
                      <td style={{ ...styles.orderTd, textAlign: 'right', fontSize: '0.85rem' }}>
                        {it.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td style={{ ...styles.orderTd, textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                        {it.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Commercial Summary & Totals */}
            <div style={styles.bottomSummaryGrid}>
              {/* Commercial Conditions */}
              <div style={styles.conditionsBox}>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Condições Comerciais Acordadas
                </strong>
                <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span>🚚 <strong>Modalidade de Frete:</strong> {order.freightType || 'CIF'} {order.freightValue ? `(R$ ${order.freightValue.toFixed(2)})` : '(Frete Incluso / CIF)'}</span>
                  <span>💳 <strong>Condição de Pagamento:</strong> {order.paymentTerm || 'Boleto Bancário 28 dias'}</span>
                  <span>⏱️ <strong>Prazo de Entrega:</strong> {order.leadTimeDays || 3} dias úteis</span>
                  <span>📅 <strong>Previsão de Chegada:</strong> {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString('pt-BR') : 'Até 3 dias úteis'}</span>
                  {order.observations && (
                    <span style={{ marginTop: '0.3rem', fontStyle: 'italic', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '0.3rem' }}>
                      Obs: "{order.observations}"
                    </span>
                  )}
                </div>

                {/* Financial Provision Link Badge */}
                {order.payableId && (
                  <div style={styles.financialLinkBadge}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>Provisão gerada no <strong>Contas a Pagar</strong> (#{order.payableId})</span>
                  </div>
                )}
              </div>

              {/* Totals Box */}
              <div style={styles.totalsBox}>
                <div style={styles.totalRow}>
                  <span>Subtotal dos Itens:</span>
                  <strong>{order.totalItemsAmount ? order.totalItemsAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : order.totalGrandAmount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </div>
                <div style={styles.totalRow}>
                  <span>Frete ({order.freightType || 'CIF'}):</span>
                  <span>{order.freightValue ? order.freightValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}</span>
                </div>
                {order.savingsAmount > 0 && (
                  <div style={{ ...styles.totalRow, color: '#16a34a' }}>
                    <span>Economia (Saving):</span>
                    <strong>- {order.savingsAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </div>
                )}
                <div style={styles.grandTotalRow}>
                  <span>VALOR TOTAL:</span>
                  <strong>{order.totalGrandAmount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </div>
              </div>
            </div>

            {/* Hospital Tax and Reception Warnings */}
            <div style={styles.instructionsBox}>
              <strong style={{ fontSize: '0.78rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                <AlertCircle size={13} />
                INSTRUÇÕES OBRIGATÓRIAS DE FATURAMENTO E ENTREGA:
              </strong>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#475569', lineHeight: '1.45' }}>
                1. A Nota Fiscal (NF-e) deve obrigatoriamente referenciar o número desta <strong>Ordem de Compra ({order.code})</strong> no campo de Informações Complementares.<br />
                2. Para medicamentos, saneantes e materiais estéreis, é <strong>obrigatório</strong> constar Lote, Data de Fabricação e Validade na NF-e e envio do Certificado de Análise/Laudo.<br />
                3. A validade mínima dos insumos entregues deve ser de 75% da vida útil total na data de entrega.
              </p>
            </div>

            {/* Signatures */}
            <div style={styles.signatureRow}>
              <div style={styles.sigBox}>
                <div style={styles.sigLine}></div>
                <strong>{order.buyerName || currentUser?.name || 'Comprador Responsável'}</strong>
                <span>Setor de Compras • NexaCLINIC</span>
              </div>

              <div style={styles.sigBox}>
                <div style={styles.sigLine}></div>
                <strong>{order.supplierName}</strong>
                <span>Aceite / De Acordo do Fornecedor</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div style={styles.modalFooter} className="no-print">
          <button onClick={onClose} style={styles.btnSecondary}>
            Fechar
          </button>
          <button onClick={handlePrint} style={styles.btnPrimary}>
            <Printer size={16} />
            <span>Imprimir Ordem de Compra</span>
          </button>
        </div>
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
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '1rem'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '920px',
    maxHeight: '94vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  closeBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1.5rem',
    color: '#94a3b8',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 0.5rem'
  },
  btnActionPrint: {
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.75rem',
    fontWeight: '700',
    fontSize: '0.78rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    cursor: 'pointer'
  },
  btnActionWhatsApp: {
    backgroundColor: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.75rem',
    fontWeight: '700',
    fontSize: '0.78rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    cursor: 'pointer'
  },
  btnActionSecondary: {
    backgroundColor: '#fff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.4rem 0.75rem',
    fontWeight: '700',
    fontSize: '0.78rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    cursor: 'pointer'
  },
  scrollContent: {
    padding: '1.25rem',
    overflowY: 'auto',
    flex: 1,
    backgroundColor: '#f1f5f9'
  },
  orderSheet: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
    color: '#1e293b'
  },
  sheetHeader: {
    borderBottom: '2px solid #0284c7',
    paddingBottom: '1.25rem'
  },
  logoBadge: {
    backgroundColor: '#0284c7',
    color: '#fff',
    fontWeight: '900',
    fontSize: '1rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    letterSpacing: '0.05em'
  },
  brandTitle: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  brandSubtitle: {
    fontSize: '0.72rem',
    color: '#64748b',
    display: 'block'
  },
  poNumberBadge: {
    backgroundColor: '#e0f2fe',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '0.5rem 0.85rem',
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#0369a1',
    letterSpacing: '0.05em'
  },
  partiesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1.25rem'
  },
  partyBox: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  partyBoxHeader: {
    backgroundColor: '#f8fafc',
    padding: '0.45rem 0.75rem',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.75rem',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    letterSpacing: '0.03em'
  },
  partyBoxBody: {
    padding: '0.65rem 0.75rem',
    fontSize: '0.78rem',
    color: '#475569',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    lineHeight: '1.4'
  },
  tableTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  orderTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem'
  },
  orderTheadRow: {
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '2px solid #cbd5e1'
  },
  orderTh: {
    padding: '0.6rem 0.75rem',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    fontSize: '0.72rem',
    letterSpacing: '0.03em'
  },
  orderTr: {
    borderBottom: '1px solid #f1f5f9'
  },
  orderTd: {
    padding: '0.6rem 0.75rem',
    verticalAlign: 'middle'
  },
  bottomSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1rem',
    marginTop: '1.25rem'
  },
  conditionsBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.85rem'
  },
  financialLinkBadge: {
    marginTop: '0.65rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    padding: '0.35rem 0.6rem',
    fontSize: '0.74rem',
    color: '#15803d',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  totalsBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '0.4rem'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#475569'
  },
  grandTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.05rem',
    fontWeight: '900',
    color: '#0284c7',
    borderTop: '2px solid #cbd5e1',
    paddingTop: '0.4rem',
    marginTop: '0.2rem'
  },
  instructionsBox: {
    marginTop: '1.25rem',
    backgroundColor: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: '8px',
    padding: '0.75rem'
  },
  signatureRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    marginTop: '3rem',
    paddingTop: '1rem'
  },
  sigBox: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    fontSize: '0.78rem',
    color: '#475569'
  },
  sigLine: {
    borderTop: '1px solid #94a3b8',
    marginBottom: '0.4rem'
  },
  modalFooter: {
    padding: '0.85rem 1.25rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    backgroundColor: '#f8fafc'
  },
  btnPrimary: {
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontWeight: '700',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer'
  },
  btnSecondary: {
    backgroundColor: '#fff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer'
  }
};

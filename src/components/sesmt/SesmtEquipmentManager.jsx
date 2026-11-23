import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { 
  Shield, 
  Flame, 
  Droplet, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X, 
  RotateCcw, 
  Power, 
  Calendar, 
  Building2, 
  Tag, 
  LayoutGrid, 
  Table,
  FileText,
  Printer,
  Check,
  Layers,
  ShieldCheck,
  Activity,
  Eye,
  Wrench,
  RefreshCw
} from 'lucide-react';

const SECTORS_LIST = [
  'Bloco Cirúrgico',
  'Salão-1',
  'Salão-2',
  'Salão-3',
  'Diálise Peritoneal',
  'Hemodiálise Externa',
  'Reuso',
  'Sala Amarela',
  'Recepção Principal',
  'Corredor Central',
  'Farmácia',
  'CPD',
  'Sala de Máquinas',
  'DML',
  'Copa',
  'Acesso Externo'
];

export const EXTINGUISHER_TYPES = [
  'ABC',
  'BC',
  'CO₂'
];

export function normalizeExtinguisherType(type) {
  if (!type) return 'ABC';
  const str = String(type).trim();
  const upper = str.toUpperCase();
  if (upper.includes('CO2') || upper.includes('CO₂')) return 'CO₂';
  if (upper.includes('BC') && !upper.includes('ABC')) return 'BC';
  return 'ABC';
}

const HYDRANT_TYPES = [
  'Hidrante de Parede',
  'Hidrante Externo'
];

export default function SesmtEquipmentManager({ equipmentData = [], onRefresh }) {
  // Categoria ativa: 'ALL' | 'EXTINGUISHER' | 'HYDRANT'
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterSector, setFilterSector] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [localEquipment, setLocalEquipment] = useState(equipmentData || []);
  const [loadingLocal, setLoadingLocal] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setViewMode('cards');
    } else {
      setViewMode('table');
    }
  }, []);

  // Sincronização e auto-recuperação do censo de equipamentos
  useEffect(() => {
    if (equipmentData && equipmentData.length > 0) {
      setLocalEquipment(equipmentData);
    } else {
      const loadDirectly = async () => {
        setLoadingLocal(true);
        try {
          const fetcher = dbService.getSesmtEquipment || dbService.getEquipment;
          if (fetcher) {
            const data = await fetcher();
            if (data && data.length > 0) {
              setLocalEquipment(data);
            }
          }
        } catch (e) {
          console.error('Erro ao recuperar equipamentos diretamente:', e);
        } finally {
          setLoadingLocal(false);
        }
      };
      loadDirectly();
    }
  }, [equipmentData]);

  const itemsToUse = localEquipment && localEquipment.length > 0 ? localEquipment : (equipmentData || []);

  // Modais de Gestão e Ações
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData('EXTINGUISHER'));
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // Ações Específicas
  const [rechargeModalItem, setRechargeModalItem] = useState(null);
  const [rechargeForm, setRechargeForm] = useState({ date: '', nextDate: '', supplier: '', seal: '', notes: '' });

  const [hydroModalItem, setHydroModalItem] = useState(null);
  const [hydroForm, setHydroForm] = useState({ date: '', nextDate: '', certificate: '', notes: '' });

  const [statusModalItem, setStatusModalItem] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'ATIVO', reason: '', returnDate: '' });

  const [detailModalItem, setDetailModalItem] = useState(null);

  function getInitialFormData(category) {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const defVal = nextYear.toISOString().split('T')[0];

    const hydroDate = new Date();
    hydroDate.setFullYear(hydroDate.getFullYear() + 5);
    const defHydro = hydroDate.toISOString().split('T')[0];

    const isHydrant = category === 'HYDRANT';

    return {
      category: isHydrant ? 'HYDRANT' : 'EXTINGUISHER',
      code: '',
      sector: SECTORS_LIST[0],
      type: isHydrant ? HYDRANT_TYPES[0] : EXTINGUISHER_TYPES[0],
      capacity: isHydrant ? 'Mangueira 30m' : '6 kg',
      rechargeDate: today,
      validityDate: defVal,
      hydrostaticTestDate: defHydro,
      status: 'ATIVO',
      inmetroSeal: '',
      observations: ''
    };
  }

  // Abertura do Modal de Cadastro / Edição
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      const isExt = (item.category || 'EXTINGUISHER') === 'EXTINGUISHER';
      setFormData({
        category: item.category || 'EXTINGUISHER',
        code: item.code || '',
        sector: item.sector || SECTORS_LIST[0],
        type: isExt ? normalizeExtinguisherType(item.type) : (item.type || HYDRANT_TYPES[0]),
        capacity: item.capacity || (isExt ? '6 kg' : 'Mangueira 30m'),
        rechargeDate: item.rechargeDate || '',
        validityDate: item.validityDate || '',
        hydrostaticTestDate: item.hydrostaticTestDate || '',
        status: item.status || 'ATIVO',
        inmetroSeal: item.inmetroSeal || '',
        observations: item.observations || ''
      });
    } else {
      setEditingItem(null);
      const targetCategory = activeCategory === 'HYDRANT' ? 'HYDRANT' : 'EXTINGUISHER';
      setFormData(getInitialFormData(targetCategory));
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const reloadData = async () => {
    if (onRefresh) onRefresh();
    try {
      const fetcher = dbService.getSesmtEquipment || dbService.getEquipment;
      if (fetcher) {
        const fresh = await fetcher();
        if (fresh && fresh.length > 0) setLocalEquipment(fresh);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Salvar Equipamento (CRUD Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const saveFn = dbService.saveSesmtEquipment || dbService.saveEquipment;
      await saveFn({
        ...(editingItem ? { id: editingItem.id } : {}),
        ...formData
      });
      setFeedbackMsg({ text: editingItem ? 'Equipamento atualizado!' : 'Equipamento cadastrado!', type: 'success' });
      handleCloseModal();
      await reloadData();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Erro ao salvar equipamento.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Excluir Equipamento (CRUD Delete)
  const handleDelete = async (id) => {
    try {
      const delFn = dbService.deleteSesmtEquipment || dbService.deleteEquipment;
      await delFn(id);
      setDeleteConfirmId(null);
      setFeedbackMsg({ text: 'Equipamento removido com sucesso!', type: 'success' });
      await reloadData();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Erro ao excluir equipamento.', type: 'error' });
    }
  };

  // Ação 1: Registrar Recarga Rápida
  const handleOpenRechargeModal = (item) => {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setRechargeForm({
      date: today,
      nextDate: nextYear.toISOString().split('T')[0],
      supplier: item.supplier || '',
      seal: item.inmetroSeal || '',
      notes: ''
    });
    setRechargeModalItem(item);
  };

  const handleConfirmRecharge = async (e) => {
    e.preventDefault();
    if (!rechargeModalItem) return;
    setSubmitting(true);
    try {
      const historyEntry = {
        action: 'RECARGA',
        date: rechargeForm.date,
        nextDate: rechargeForm.nextDate,
        supplier: rechargeForm.supplier,
        seal: rechargeForm.seal,
        notes: rechargeForm.notes,
        createdAt: new Date().toISOString()
      };

      const updatedHistory = [...(rechargeModalItem.actionHistory || []), historyEntry];

      const saveFn = dbService.saveSesmtEquipment || dbService.saveEquipment;
      await saveFn({
        ...rechargeModalItem,
        rechargeDate: rechargeForm.date,
        validityDate: rechargeForm.nextDate,
        inmetroSeal: rechargeForm.seal || rechargeModalItem.inmetroSeal || '',
        supplier: rechargeForm.supplier || rechargeModalItem.supplier || '',
        actionHistory: updatedHistory,
        status: 'ATIVO'
      });

      setFeedbackMsg({ text: `Recarga de ${rechargeModalItem.code} registrada com sucesso!`, type: 'success' });
      setRechargeModalItem(null);
      await reloadData();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Erro ao registrar recarga.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Ação 2: Registrar Teste Hidrostático
  const handleOpenHydroModal = (item) => {
    const today = new Date().toISOString().split('T')[0];
    const nextFive = new Date();
    nextFive.setFullYear(nextFive.getFullYear() + 5);
    setHydroForm({
      date: today,
      nextDate: nextFive.toISOString().split('T')[0],
      certificate: '',
      notes: ''
    });
    setHydroModalItem(item);
  };

  const handleConfirmHydro = async (e) => {
    e.preventDefault();
    if (!hydroModalItem) return;
    setSubmitting(true);
    try {
      const historyEntry = {
        action: 'TESTE_HIDROSTATICO',
        date: hydroForm.date,
        nextDate: hydroForm.nextDate,
        certificate: hydroForm.certificate,
        notes: hydroForm.notes,
        createdAt: new Date().toISOString()
      };

      const updatedHistory = [...(hydroModalItem.actionHistory || []), historyEntry];

      const saveFn = dbService.saveSesmtEquipment || dbService.saveEquipment;
      await saveFn({
        ...hydroModalItem,
        hydrostaticTestDate: hydroForm.nextDate,
        lastHydroDate: hydroForm.date,
        hydroCertificate: hydroForm.certificate || hydroModalItem.hydroCertificate || '',
        actionHistory: updatedHistory
      });

      setFeedbackMsg({ text: `Teste hidrostático de ${hydroModalItem.code} registrado!`, type: 'success' });
      setHydroModalItem(null);
      await reloadData();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Erro ao registrar teste hidrostático.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Ação 3: Alterar Status / Manutenção
  const handleOpenStatusModal = (item) => {
    setStatusForm({
      status: item.status || 'ATIVO',
      reason: item.maintenanceReason || '',
      returnDate: item.maintenanceReturnDate || ''
    });
    setStatusModalItem(item);
  };

  const handleConfirmStatus = async (e) => {
    e.preventDefault();
    if (!statusModalItem) return;
    setSubmitting(true);
    try {
      const historyEntry = {
        action: 'STATUS_CHANGE',
        from: statusModalItem.status,
        to: statusForm.status,
        reason: statusForm.reason,
        returnDate: statusForm.returnDate,
        createdAt: new Date().toISOString()
      };

      const updatedHistory = [...(statusModalItem.actionHistory || []), historyEntry];

      const saveFn = dbService.saveSesmtEquipment || dbService.saveEquipment;
      await saveFn({
        ...statusModalItem,
        status: statusForm.status,
        maintenanceReason: statusForm.status === 'MANUTENCAO' ? statusForm.reason : '',
        maintenanceReturnDate: statusForm.status === 'MANUTENCAO' ? statusForm.returnDate : '',
        actionHistory: updatedHistory
      });

      setFeedbackMsg({ text: `Status de ${statusModalItem.code} alterado para ${statusForm.status}!`, type: 'success' });
      setStatusModalItem(null);
      await reloadData();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Erro ao alterar status.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Ação 4: Imprimir Etiqueta Física Individual
  const handlePrintLabel = (item) => {
    if (!item) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Permita popups para imprimir etiquetas.');
      return;
    }

    const isExt = (item.category || 'EXTINGUISHER') === 'EXTINGUISHER';
    const typeLabel = isExt ? `Extintor ${item.type || 'ABC'}` : (item.type || 'Hidrante');
    const rechargeStr = item.rechargeDate ? formatDateBR(item.rechargeDate) : '-';
    const validityStr = item.validityDate ? formatDateBR(item.validityDate) : '-';
    const hydroStr = item.hydrostaticTestDate ? formatDateBR(item.hydrostaticTestDate) : '-';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etiqueta ${item.code}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 15px; color: #000; }
          .label-box {
            width: 380px;
            border: 3px solid #0f172a;
            border-radius: 8px;
            padding: 12px;
            background: #ffffff;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .label-header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 6px;
            margin-bottom: 10px;
          }
          .brand { font-size: 14px; font-weight: 800; letter-spacing: 1px; color: #0891b2; margin: 0; }
          .subbrand { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; }
          .code-box {
            background: #0f172a;
            color: #ffffff;
            text-align: center;
            padding: 8px;
            border-radius: 6px;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 2px;
            margin-bottom: 10px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            font-size: 11px;
            margin-bottom: 10px;
          }
          .meta-item { border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 4px; }
          .meta-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .meta-val { font-size: 11px; font-weight: 800; color: #0f172a; }
          .check-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .check-table th, .check-table td {
            border: 1px solid #94a3b8;
            padding: 3px;
            text-align: center;
            font-size: 9px;
          }
          .check-table th { background: #f1f5f9; font-weight: 800; }
          .footer-note { font-size: 8px; color: #64748b; text-align: center; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="label-box">
          <div class="label-header">
            <h1 class="brand">NEX-AI CLINIC • SESMT</h1>
            <div class="subbrand">Segurança do Trabalho • NR-23 / NBR 12962</div>
          </div>

          <div class="code-box">${item.code}</div>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Equipamento</div>
              <div class="meta-val">${typeLabel}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Capacidade</div>
              <div class="meta-val">${item.capacity || '-'}</div>
            </div>
            <div class="meta-item" style="grid-column: span 2;">
              <div class="meta-label">Localização / Setor</div>
              <div class="meta-val">${item.sector || '-'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Recarga</div>
              <div class="meta-val">${rechargeStr}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Validade</div>
              <div class="meta-val" style="color: #dc2626;">${validityStr}</div>
            </div>
            <div class="meta-item" style="grid-column: span 2;">
              <div class="meta-label">Teste Hidrostático (5 Anos)</div>
              <div class="meta-val">${hydroStr}</div>
            </div>
          </div>

          <table class="check-table">
            <thead>
              <tr>
                <th colspan="6">Inspeções Técnicas Mensais (Visto do Inspetor)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Jan: ___</td>
                <td>Fev: ___</td>
                <td>Mar: ___</td>
                <td>Abr: ___</td>
                <td>Mai: ___</td>
                <td>Jun: ___</td>
              </tr>
              <tr>
                <td>Jul: ___</td>
                <td>Ago: ___</td>
                <td>Set: ___</td>
                <td>Out: ___</td>
                <td>Nov: ___</td>
                <td>Dez: ___</td>
              </tr>
            </tbody>
          </table>

          <div class="footer-note">
            Em caso de emergência, ligue 193. Mantenha a área desobstruída.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 200);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Ação 5: Imprimir Censo / Inventário Patrimonial Completo
  const handlePrintInventory = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=750');
    if (!printWindow) {
      alert('Permita popups para imprimir o inventário.');
      return;
    }

    const todayStr = formatDateBR(new Date().toISOString().split('T')[0]);
    const items = filteredList;

    const rowsHtml = items.map((it, idx) => {
      const vStat = getValidityStatus(it.validityDate);
      const isExt = (it.category || 'EXTINGUISHER') === 'EXTINGUISHER';
      return `
        <tr>
          <td style="text-align: center; font-weight: bold; padding: 6px;">${idx + 1}</td>
          <td style="text-align: center; font-weight: 800; padding: 6px;">${it.code}</td>
          <td style="padding: 6px;">${isExt ? 'Extintor' : 'Hidrante'}</td>
          <td style="padding: 6px;">${it.sector}</td>
          <td style="padding: 6px; font-weight: bold;">${it.type}</td>
          <td style="padding: 6px; text-align: center;">${it.capacity || '-'}</td>
          <td style="padding: 6px; text-align: center;">${formatDateBR(it.rechargeDate)}</td>
          <td style="padding: 6px; text-align: center; font-weight: bold;">${formatDateBR(it.validityDate)}</td>
          <td style="padding: 6px; text-align: center;">${formatDateBR(it.hydrostaticTestDate)}</td>
          <td style="padding: 6px; text-align: center;">${it.status || 'ATIVO'}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventário de Equipamentos SESMT - ${todayStr}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 15px; color: #000; font-size: 11px; }
          .header-box { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
          .title { font-size: 16px; font-weight: 900; margin: 0; text-transform: uppercase; }
          .subtitle { font-size: 11px; color: #475569; margin: 4px 0 0 0; }
          .meta-bar { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 5px; font-size: 10px; }
          th { background: #f1f5f9; text-transform: uppercase; }
          .sign-box { display: flex; justify-content: space-between; margin-top: 30px; gap: 40px; }
          .sign-line { flex: 1; border-top: 1px solid #000; text-align: center; padding-top: 6px; font-size: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h1 class="title">NEX-AI CLINIC • MÓDULO SESMT</h1>
          <p class="subtitle">Censo Patrimonial e Controle de Equipamentos de Combate a Incêndio (NR-23 / NBR 12962)</p>
        </div>

        <div class="meta-bar">
          <div>Emissão: ${todayStr}</div>
          <div>Total de Equipamentos Mapeados: ${items.length}</div>
          <div>Filtro: ${activeCategory === 'ALL' ? 'Todos os Equipamentos' : activeCategory === 'EXTINGUISHER' ? 'Extintores' : 'Hidrantes'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Código</th>
              <th>Categoria</th>
              <th>Setor</th>
              <th>Tipo</th>
              <th>Capacidade</th>
              <th>Recarga</th>
              <th>Validade</th>
              <th>Hidrostático</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="sign-box">
          <div class="sign-line">Técnica de Segurança do Trabalho<br/>SESMT</div>
          <div class="sign-line">Enfermeiro(a) Responsável Técnico<br/>Coordenação Clínica</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 200);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Helper de cálculo de status de validade
  const getValidityStatus = (dateStr) => {
    if (!dateStr) return { label: 'Sem Data', color: '#64748b', bg: '#f1f5f9' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Vencido (${Math.abs(diffDays)}d)`, status: 'VENCIDO', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    }
    if (diffDays <= 60) {
      return { label: `A Vencer (${diffDays}d)`, status: 'A_VENCER', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    }
    return { label: 'Na Validade', status: 'OK', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  };

  // Filtragem por Categoria (Todos / Extintor / Hidrante)
  const categoryItems = itemsToUse.filter(item => {
    if (activeCategory === 'ALL') return true;
    return (item.category || 'EXTINGUISHER') === activeCategory;
  });

  // Contadores
  const totalAll = itemsToUse.length;
  const totalExt = itemsToUse.filter(i => (i.category || 'EXTINGUISHER') === 'EXTINGUISHER').length;
  const totalHyd = itemsToUse.filter(i => i.category === 'HYDRANT').length;

  let totalCount = categoryItems.length;
  let activeCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;
  let maintenanceCount = 0;

  categoryItems.forEach(item => {
    if (item.status === 'ATIVO') activeCount++;
    if (item.status === 'MANUTENCAO') maintenanceCount++;
    const vStat = getValidityStatus(item.validityDate);
    if (vStat.status === 'A_VENCER') expiringCount++;
    if (vStat.status === 'VENCIDO') expiredCount++;
  });

  // Filtragem combinada
  const filteredList = categoryItems.filter(item => {
    // Filtro por texto de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCode = (item.code || '').toLowerCase().includes(term);
      const matchSector = (item.sector || '').toLowerCase().includes(term);
      const matchType = (item.type || '').toLowerCase().includes(term);
      const matchCap = (item.capacity || '').toLowerCase().includes(term);
      if (!matchCode && !matchSector && !matchType && !matchCap) return false;
    }

    // Filtro por setor
    if (filterSector !== 'TODOS' && item.sector !== filterSector) {
      return false;
    }

    // Filtro por status
    if (filterStatus === 'ATIVO') return item.status === 'ATIVO';
    if (filterStatus === 'MANUTENCAO') return item.status === 'MANUTENCAO';
    if (filterStatus === 'INATIVO') return item.status === 'INATIVO';
    if (filterStatus === 'A_VENCER') {
      const vStat = getValidityStatus(item.validityDate);
      return vStat.status === 'A_VENCER';
    }
    if (filterStatus === 'VENCIDO') {
      const vStat = getValidityStatus(item.validityDate);
      return vStat.status === 'VENCIDO';
    }

    return true;
  });

  return (
    <div style={styles.card}>
      {/* Top Banner / Feedback Message */}
      {feedbackMsg.text && (
        <div style={{
          ...styles.alertBanner,
          backgroundColor: feedbackMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          borderColor: feedbackMsg.type === 'success' ? '#bbf7d0' : '#fecaca',
          color: feedbackMsg.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header com Categorias e Ações Globais */}
      <div style={styles.topRow}>
        <div style={styles.categoryToggleGroup}>
          <button 
            style={{ ...styles.categoryBtn, ...(activeCategory === 'ALL' ? styles.categoryBtnActive : {}) }}
            onClick={() => { setActiveCategory('ALL'); setFilterStatus('TODOS'); }}
          >
            <Layers size={16} /> Todos ({totalAll})
          </button>
          <button 
            style={{ ...styles.categoryBtn, ...(activeCategory === 'EXTINGUISHER' ? styles.categoryBtnActive : {}) }}
            onClick={() => { setActiveCategory('EXTINGUISHER'); setFilterStatus('TODOS'); }}
          >
            <Flame size={16} /> Extintores ({totalExt})
          </button>
          <button 
            style={{ ...styles.categoryBtn, ...(activeCategory === 'HYDRANT' ? styles.categoryBtnActive : {}) }}
            onClick={() => { setActiveCategory('HYDRANT'); setFilterStatus('TODOS'); }}
          >
            <Droplet size={16} /> Hidrantes ({totalHyd})
          </button>
        </div>

        {/* Ações Globais */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={styles.viewToggleGroup}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{ ...styles.viewToggleBtn, ...(viewMode === 'cards' ? styles.viewToggleBtnActive : {}) }}
              title="Modo Cartões"
            >
              <LayoutGrid size={15} /> Cartões
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{ ...styles.viewToggleBtn, ...(viewMode === 'table' ? styles.viewToggleBtnActive : {}) }}
              title="Modo Tabela"
            >
              <Table size={15} /> Tabela
            </button>
          </div>

          <button onClick={handlePrintInventory} style={styles.actionAuxBtn} title="Imprimir Inventário Completo">
            <Printer size={15} /> Inventário
          </button>

          <button 
            onClick={() => onRefresh && onRefresh()} 
            style={styles.actionAuxBtn} 
            title="Sincronizar com banco em nuvem"
          >
            <RefreshCw size={15} /> Sincronizar
          </button>

          <button onClick={() => handleOpenModal()} style={styles.addBtn}>
            <Plus size={16} /> Novo
          </button>
        </div>
      </div>

      {/* Cards de Métricas e Alertas */}
      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total</span>
          <span style={styles.statValue}>{totalCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #16a34a' }}>
          <span style={styles.statLabel}>Ativos</span>
          <span style={{ ...styles.statValue, color: '#16a34a' }}>{activeCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #d97706' }}>
          <span style={styles.statLabel}>A Vencer (60d)</span>
          <span style={{ ...styles.statValue, color: '#d97706' }}>{expiringCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #dc2626' }}>
          <span style={styles.statLabel}>Vencidos</span>
          <span style={{ ...styles.statValue, color: '#dc2626' }}>{expiredCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #8b5cf6' }}>
          <span style={styles.statLabel}>Manutenção</span>
          <span style={{ ...styles.statValue, color: '#8b5cf6' }}>{maintenanceCount}</span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Buscar por código, setor, tipo ou capacidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={styles.filterDropdownGroup}>
          <select 
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            style={styles.filterSelect}
            title="Filtrar por Setor"
          >
            <option value="TODOS">Todos os Setores</option>
            {SECTORS_LIST.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterStatusGroup}>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'TODOS' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('TODOS')}
          >
            Todos
          </button>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'ATIVO' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('ATIVO')}
          >
            Ativos
          </button>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'A_VENCER' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('A_VENCER')}
          >
            A Vencer ({expiringCount})
          </button>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'VENCIDO' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('VENCIDO')}
          >
            Vencidos ({expiredCount})
          </button>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'MANUTENCAO' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('MANUTENCAO')}
          >
            Manutenção ({maintenanceCount})
          </button>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'INATIVO' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('INATIVO')}
          >
            Inativos
          </button>
        </div>
      </div>

      {/* 1. Modo Cartões (Mobile / Tablet) */}
      {viewMode === 'cards' && (
        <div style={styles.equipCardsGrid}>
          {loadingLocal ? (
            <div style={styles.emptyCardBox}>
              <p style={{ margin: 0, color: '#0891b2', fontWeight: 600 }}>Carregando equipamentos...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div style={styles.emptyCardBox}>
              <p style={{ margin: 0, color: '#94a3b8' }}>Nenhum equipamento encontrado com os filtros atuais.</p>
              {itemsToUse.length === 0 && (
                <button onClick={reloadData} style={{ ...styles.actionAuxBtn, marginTop: '0.75rem' }}>
                  <RefreshCw size={14} /> Carregar
                </button>
              )}
            </div>
          ) : (
            filteredList.map((item) => {
              const vStatus = getValidityStatus(item.validityDate);
              const isExt = (item.category || 'EXTINGUISHER') === 'EXTINGUISHER';
              const isInactive = item.status === 'INATIVO';

              return (
                <div 
                  key={item.id} 
                  style={{
                    ...styles.equipCard,
                    opacity: isInactive ? 0.65 : 1,
                    borderLeft: `4px solid ${item.status === 'MANUTENCAO' ? '#8b5cf6' : (vStatus.color || '#cbd5e1')}`
                  }}
                >
                  <div style={styles.equipCardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={styles.equipCodeBadge}>{item.code || 'S/N'}</span>
                      <span style={{
                        ...styles.categoryPill,
                        backgroundColor: isExt ? '#fef2f2' : '#eff6ff',
                        color: isExt ? '#dc2626' : '#2563eb'
                      }}>
                        {isExt ? 'Extintor' : 'Hidrante'}
                      </span>
                      <span style={styles.equipSector}>{item.sector}</span>
                      <span style={styles.typeBadge}>{item.type}</span>
                    </div>

                    <div style={styles.actionGroup}>
                      <button 
                        onClick={() => handleOpenRechargeModal(item)} 
                        style={styles.actionBtnRecarga} 
                        title="Registrar Recarga"
                      >
                        <RotateCcw size={13} />
                      </button>
                      <button 
                        onClick={() => handleOpenHydroModal(item)} 
                        style={styles.actionBtnHydro} 
                        title="Registrar Teste Hidrostático"
                      >
                        <ShieldCheck size={13} />
                      </button>
                      <button 
                        onClick={() => setDetailModalItem(item)} 
                        style={styles.actionBtnFicha} 
                        title="Ficha Técnica"
                      >
                        <FileText size={13} />
                      </button>
                      <button 
                        onClick={() => handlePrintLabel(item)} 
                        style={styles.actionBtnEtiqueta} 
                        title="Imprimir Etiqueta"
                      >
                        <Tag size={13} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(item)} 
                        style={styles.editBtn} 
                        title="Editar"
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => handleOpenStatusModal(item)} 
                        style={{
                          ...styles.toggleStatusBtn,
                          color: item.status === 'ATIVO' ? '#16a34a' : item.status === 'MANUTENCAO' ? '#8b5cf6' : '#d97706'
                        }} 
                        title="Alterar Situação"
                      >
                        <Power size={13} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(item.id)} 
                        style={styles.deleteBtn} 
                        title="Excluir"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.equipCardDetails}>
                    <div style={styles.equipDetailItem}>
                      <span style={styles.detailKey}>Capacidade</span>
                      <span style={styles.detailVal}>{item.capacity || '-'}</span>
                    </div>
                    <div style={styles.equipDetailItem}>
                      <span style={styles.detailKey}>Recarga</span>
                      <span style={styles.detailVal}>{item.rechargeDate ? formatDateBR(item.rechargeDate) : '-'}</span>
                    </div>
                    <div style={styles.equipDetailItem}>
                      <span style={styles.detailKey}>Validade</span>
                      <span style={{
                        ...styles.validityBadge,
                        backgroundColor: vStatus.bg,
                        color: vStatus.color,
                        border: `1px solid ${vStatus.border || vStatus.color}`
                      }}>
                        {item.validityDate ? formatDateBR(item.validityDate) : '-'} ({vStatus.label})
                      </span>
                    </div>
                    <div style={styles.equipDetailItem}>
                      <span style={styles.detailKey}>Hidrostático</span>
                      <span style={styles.detailVal}>{item.hydrostaticTestDate ? formatDateBR(item.hydrostaticTestDate) : '-'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Modo Tabela Clássica (Desktop) */}
      {viewMode === 'table' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Código</th>
                {activeCategory === 'ALL' && <th style={styles.th}>Categoria</th>}
                <th style={styles.th}>Setor</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Capacidade</th>
                <th style={styles.th}>Recarga</th>
                <th style={styles.th}>Validade</th>
                <th style={styles.th}>Hidrostático</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingLocal ? (
                <tr>
                  <td colSpan={activeCategory === 'ALL' ? '10' : '9'} style={{ ...styles.emptyRow, color: '#0891b2', fontWeight: 600 }}>
                    Carregando equipamentos...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={activeCategory === 'ALL' ? '10' : '9'} style={styles.emptyRow}>
                    <div>Nenhum equipamento encontrado com os filtros atuais.</div>
                    {itemsToUse.length === 0 && (
                      <button onClick={reloadData} style={{ ...styles.actionAuxBtn, marginTop: '0.5rem', display: 'inline-flex' }}>
                        <RefreshCw size={14} /> Carregar
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const vStatus = getValidityStatus(item.validityDate);
                  const isExt = (item.category || 'EXTINGUISHER') === 'EXTINGUISHER';
                  const isInactive = item.status === 'INATIVO';

                  return (
                    <tr key={item.id} style={{ ...styles.tr, opacity: isInactive ? 0.6 : 1 }}>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#0f172a' }}>
                        {item.code || 'S/N'}
                      </td>
                      {activeCategory === 'ALL' && (
                        <td style={styles.td}>
                          <span style={{
                            ...styles.categoryPill,
                            backgroundColor: isExt ? '#fef2f2' : '#eff6ff',
                            color: isExt ? '#dc2626' : '#2563eb'
                          }}>
                            {isExt ? 'Extintor' : 'Hidrante'}
                          </span>
                        </td>
                      )}
                      <td style={styles.td}>
                        <span style={{ fontWeight: '600', color: '#334155' }}>{item.sector}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>{item.type}</span>
                      </td>
                      <td style={styles.td}>{item.capacity || '-'}</td>
                      <td style={styles.td}>
                        {item.rechargeDate ? formatDateBR(item.rechargeDate) : '-'}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontWeight: '600' }}>{item.validityDate ? formatDateBR(item.validityDate) : '-'}</span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            display: 'inline-block',
                            width: 'fit-content',
                            backgroundColor: vStatus.bg,
                            color: vStatus.color,
                            border: `1px solid ${vStatus.border || vStatus.color}`
                          }}>
                            {vStatus.label}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        {item.hydrostaticTestDate ? formatDateBR(item.hydrostaticTestDate) : '-'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: item.status === 'ATIVO' ? '#f0fdf4' : item.status === 'MANUTENCAO' ? '#f5f3ff' : '#f1f5f9',
                          color: item.status === 'ATIVO' ? '#16a34a' : item.status === 'MANUTENCAO' ? '#7c3aed' : '#64748b'
                        }}>
                          {item.status || 'ATIVO'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={styles.actionGroup}>
                          <button 
                            onClick={() => handleOpenRechargeModal(item)} 
                            style={styles.actionBtnRecarga} 
                            title="Registrar Recarga"
                          >
                            <RotateCcw size={13} />
                          </button>
                          <button 
                            onClick={() => handleOpenHydroModal(item)} 
                            style={styles.actionBtnHydro} 
                            title="Registrar Teste Hidrostático"
                          >
                            <ShieldCheck size={13} />
                          </button>
                          <button 
                            onClick={() => setDetailModalItem(item)} 
                            style={styles.actionBtnFicha} 
                            title="Ficha Técnica"
                          >
                            <FileText size={13} />
                          </button>
                          <button 
                            onClick={() => handlePrintLabel(item)} 
                            style={styles.actionBtnEtiqueta} 
                            title="Imprimir Etiqueta"
                          >
                            <Tag size={13} />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(item)} 
                            style={styles.editBtn} 
                            title="Editar"
                          >
                            <Edit size={13} />
                          </button>
                          <button 
                            onClick={() => handleOpenStatusModal(item)} 
                            style={{
                              ...styles.toggleStatusBtn,
                              color: item.status === 'ATIVO' ? '#16a34a' : item.status === 'MANUTENCAO' ? '#8b5cf6' : '#d97706'
                            }} 
                            title="Alterar Situação"
                          >
                            <Power size={13} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(item.id)} 
                            style={styles.deleteBtn} 
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: Cadastro e Edição de Equipamento (CRUD Completo) */}
      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Shield size={20} color="#0891b2" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  {editingItem ? 'Editar Equipamento' : 'Novo Equipamento'}
                </h3>
              </div>
              <button onClick={handleCloseModal} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalBody}>
              <div style={styles.formRow2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Categoria *</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormData({ 
                        ...formData, 
                        category: newCat,
                        type: newCat === 'HYDRANT' ? HYDRANT_TYPES[0] : EXTINGUISHER_TYPES[0],
                        capacity: newCat === 'HYDRANT' ? 'Mangueira 30m' : '6 kg'
                      });
                    }}
                    style={styles.select}
                  >
                    <option value="EXTINGUISHER">Extintor</option>
                    <option value="HYDRANT">Hidrante</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Código *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: EXT-22 ou HID-07" 
                    value={formData.code} 
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Setor *</label>
                  <select 
                    value={formData.sector} 
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    style={styles.select}
                  >
                    {SECTORS_LIST.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tipo *</label>
                  {formData.category === 'HYDRANT' ? (
                    <select 
                      value={formData.type} 
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={styles.select}
                      required
                    >
                      {HYDRANT_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      value={formData.type || 'ABC'} 
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={styles.select}
                      required
                    >
                      {EXTINGUISHER_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Capacidade</label>
                  {formData.category === 'HYDRANT' ? (
                    <input 
                      type="text" 
                      placeholder="Ex: Mangueira 30m" 
                      value={formData.capacity} 
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      style={styles.input}
                    />
                  ) : (
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Ex: 6 kg" 
                        value={formData.capacity} 
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        style={{ ...styles.input, flex: 1 }}
                      />
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData({ ...formData, capacity: e.target.value });
                          }
                        }}
                        style={{ ...styles.select, width: 'auto', minWidth: '78px', fontSize: '0.8rem', padding: '0.45rem' }}
                        title="Opções em kg"
                      >
                        <option value="">kg</option>
                        <option value="2 kg">2 kg</option>
                        <option value="4 kg">4 kg</option>
                        <option value="6 kg">6 kg</option>
                        <option value="8 kg">8 kg</option>
                        <option value="10 kg">10 kg</option>
                        <option value="12 kg">12 kg</option>
                      </select>
                    </div>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status *</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={styles.select}
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="MANUTENCAO">MANUTENÇÃO</option>
                    <option value="INATIVO">INATIVO</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow3}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Recarga</label>
                  <input 
                    type="date" 
                    value={formData.rechargeDate} 
                    onChange={(e) => setFormData({ ...formData, rechargeDate: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Validade *</label>
                  <input 
                    type="date" 
                    value={formData.validityDate} 
                    onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                    style={{ ...styles.input, borderColor: '#0891b2' }}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Hidrostático</label>
                  <input 
                    type="date" 
                    value={formData.hydrostaticTestDate} 
                    onChange={(e) => setFormData({ ...formData, hydrostaticTestDate: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Selo</label>
                <input 
                  type="text" 
                  placeholder="Número do Selo INMETRO ou Lote" 
                  value={formData.inmetroSeal} 
                  onChange={(e) => setFormData({ ...formData, inmetroSeal: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Observações</label>
                <textarea 
                  rows="2" 
                  placeholder="Informações técnicas adicionais, fornecedor ou histórico." 
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={handleCloseModal} style={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} style={styles.saveBtn}>
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ação Rápida de Recarga */}
      {rechargeModalItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <RotateCcw size={20} color="#0891b2" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  Registrar Recarga
                </h3>
              </div>
              <button onClick={() => setRechargeModalItem(null)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmRecharge} style={styles.modalBody}>
              <div style={styles.equipSummaryBox}>
                <span style={styles.equipCodeBadge}>{rechargeModalItem.code}</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{rechargeModalItem.sector}</span>
                <span style={styles.typeBadge}>{rechargeModalItem.type}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({rechargeModalItem.capacity})</span>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Recarga *</label>
                  <input 
                    type="date" 
                    value={rechargeForm.date} 
                    onChange={(e) => {
                      const d = e.target.value;
                      const next = new Date(d);
                      next.setFullYear(next.getFullYear() + 1);
                      setRechargeForm({
                        ...rechargeForm,
                        date: d,
                        nextDate: next.toISOString().split('T')[0]
                      });
                    }}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Validade *</label>
                  <input 
                    type="date" 
                    value={rechargeForm.nextDate} 
                    onChange={(e) => setRechargeForm({ ...rechargeForm, nextDate: e.target.value })}
                    style={{ ...styles.input, borderColor: '#0891b2' }}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Fornecedor</label>
                  <input 
                    type="text" 
                    placeholder="Empresa responsável pela recarga" 
                    value={rechargeForm.supplier} 
                    onChange={(e) => setRechargeForm({ ...rechargeForm, supplier: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Selo</label>
                  <input 
                    type="text" 
                    placeholder="Número do Selo INMETRO" 
                    value={rechargeForm.seal} 
                    onChange={(e) => setRechargeForm({ ...rechargeForm, seal: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Observações</label>
                <textarea 
                  rows="2" 
                  placeholder="Observações do técnico ou laudo da recarga" 
                  value={rechargeForm.notes} 
                  onChange={(e) => setRechargeForm({ ...rechargeForm, notes: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setRechargeModalItem(null)} style={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} style={styles.saveBtn}>
                  {submitting ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Ação Rápida de Teste Hidrostático */}
      {hydroModalItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={20} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  Teste Hidrostático
                </h3>
              </div>
              <button onClick={() => setHydroModalItem(null)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmHydro} style={styles.modalBody}>
              <div style={styles.equipSummaryBox}>
                <span style={styles.equipCodeBadge}>{hydroModalItem.code}</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{hydroModalItem.sector}</span>
                <span style={styles.typeBadge}>{hydroModalItem.type}</span>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Teste *</label>
                  <input 
                    type="date" 
                    value={hydroForm.date} 
                    onChange={(e) => {
                      const d = e.target.value;
                      const next = new Date(d);
                      next.setFullYear(next.getFullYear() + 5);
                      setHydroForm({
                        ...hydroForm,
                        date: d,
                        nextDate: next.toISOString().split('T')[0]
                      });
                    }}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Validade (5 Anos) *</label>
                  <input 
                    type="date" 
                    value={hydroForm.nextDate} 
                    onChange={(e) => setHydroForm({ ...hydroForm, nextDate: e.target.value })}
                    style={{ ...styles.input, borderColor: '#6366f1' }}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Laudo / Certificado</label>
                <input 
                  type="text" 
                  placeholder="Número do certificado ou laudo técnico" 
                  value={hydroForm.certificate} 
                  onChange={(e) => setHydroForm({ ...hydroForm, certificate: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Observações</label>
                <textarea 
                  rows="2" 
                  placeholder="Condições do cilindro, ensaio ou observações técnicas" 
                  value={hydroForm.notes} 
                  onChange={(e) => setHydroForm({ ...hydroForm, notes: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setHydroModalItem(null)} style={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} style={{ ...styles.saveBtn, backgroundColor: '#6366f1' }}>
                  {submitting ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Alteração de Status / Manutenção */}
      {statusModalItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Power size={20} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  Situação Operacional
                </h3>
              </div>
              <button onClick={() => setStatusModalItem(null)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmStatus} style={styles.modalBody}>
              <div style={styles.equipSummaryBox}>
                <span style={styles.equipCodeBadge}>{statusModalItem.code}</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{statusModalItem.sector}</span>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Status *</label>
                <select 
                  value={statusForm.status} 
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  style={styles.select}
                >
                  <option value="ATIVO">ATIVO (Operacional)</option>
                  <option value="MANUTENCAO">MANUTENÇÃO (Em reparo / recarga externa)</option>
                  <option value="INATIVO">INATIVO (Desativado / Substituído)</option>
                </select>
              </div>

              {statusForm.status === 'MANUTENCAO' && (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Motivo *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Enviado para recarga anual / troca de válvula" 
                      value={statusForm.reason} 
                      onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Previsão de Retorno</label>
                    <input 
                      type="date" 
                      value={statusForm.returnDate} 
                      onChange={(e) => setStatusForm({ ...statusForm, returnDate: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </>
              )}

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setStatusModalItem(null)} style={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} style={styles.saveBtn}>
                  {submitting ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Ficha Técnica Detalhada do Equipamento */}
      {detailModalItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={20} color="#0891b2" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  Ficha Técnica • {detailModalItem.code}
                </h3>
              </div>
              <button onClick={() => setDetailModalItem(null)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.fichaHeaderCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>{detailModalItem.code}</span>
                  <span style={{
                    ...styles.categoryPill,
                    backgroundColor: (detailModalItem.category || 'EXTINGUISHER') === 'EXTINGUISHER' ? '#fef2f2' : '#eff6ff',
                    color: (detailModalItem.category || 'EXTINGUISHER') === 'EXTINGUISHER' ? '#dc2626' : '#2563eb'
                  }}>
                    {(detailModalItem.category || 'EXTINGUISHER') === 'EXTINGUISHER' ? 'Extintor de Incêndio' : 'Hidrante de Incêndio'}
                  </span>
                  <span style={styles.typeBadge}>{detailModalItem.type}</span>
                </div>
                <div style={{ marginTop: '0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                  <strong>Setor:</strong> {detailModalItem.sector} • <strong>Capacidade:</strong> {detailModalItem.capacity || '-'}
                </div>
              </div>

              <div style={styles.fichaGrid}>
                <div style={styles.fichaBox}>
                  <span style={styles.fichaKey}>Status Atual</span>
                  <span style={{
                    ...styles.detailVal,
                    fontWeight: '800',
                    color: detailModalItem.status === 'ATIVO' ? '#16a34a' : detailModalItem.status === 'MANUTENCAO' ? '#7c3aed' : '#dc2626'
                  }}>
                    {detailModalItem.status || 'ATIVO'}
                  </span>
                </div>

                <div style={styles.fichaBox}>
                  <span style={styles.fichaKey}>Última Recarga</span>
                  <span style={styles.detailVal}>{formatDateBR(detailModalItem.rechargeDate)}</span>
                </div>

                <div style={styles.fichaBox}>
                  <span style={styles.fichaKey}>Validade da Carga</span>
                  <span style={{ ...styles.detailVal, color: '#0891b2', fontWeight: '800' }}>
                    {formatDateBR(detailModalItem.validityDate)}
                  </span>
                </div>

                <div style={styles.fichaBox}>
                  <span style={styles.fichaKey}>Teste Hidrostático</span>
                  <span style={styles.detailVal}>{formatDateBR(detailModalItem.hydrostaticTestDate)}</span>
                </div>

                <div style={styles.fichaBox}>
                  <span style={styles.fichaKey}>Selo INMETRO</span>
                  <span style={styles.detailVal}>{detailModalItem.inmetroSeal || '-'}</span>
                </div>

                <div style={styles.fichaBox}>
                  <span style={styles.fichaKey}>Fornecedor</span>
                  <span style={styles.detailVal}>{detailModalItem.supplier || '-'}</span>
                </div>
              </div>

              {detailModalItem.observations && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Observações:</span>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#334155' }}>{detailModalItem.observations}</p>
                </div>
              )}

              {/* Ações na Ficha */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => { const it = detailModalItem; setDetailModalItem(null); handleOpenRechargeModal(it); }} 
                  style={styles.actionBtnRecargaFull}
                >
                  <RotateCcw size={14} /> Registrar Recarga
                </button>
                <button 
                  onClick={() => { const it = detailModalItem; setDetailModalItem(null); handleOpenHydroModal(it); }} 
                  style={styles.actionBtnHydroFull}
                >
                  <ShieldCheck size={14} /> Teste Hidrostático
                </button>
                <button 
                  onClick={() => handlePrintLabel(detailModalItem)} 
                  style={styles.actionBtnEtiquetaFull}
                >
                  <Printer size={14} /> Imprimir Etiqueta
                </button>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setDetailModalItem(null)} style={styles.cancelBtn}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div style={styles.modalOverlay}>
          <div style={styles.deleteModalBox}>
            <AlertTriangle size={36} color="#dc2626" style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Confirmar Exclusão</h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.85rem' }}>
              Deseja realmente remover este equipamento do cadastro? Esta ação é irreversível.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmId(null)} style={styles.cancelBtn}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} style={styles.confirmDeleteBtn}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateBR(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '1.25rem'
  },
  categoryToggleGroup: {
    display: 'flex',
    gap: '0.4rem',
    backgroundColor: '#f1f5f9',
    padding: '0.25rem',
    borderRadius: '8px'
  },
  categoryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.85rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  categoryBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0891b2',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(8, 145, 178, 0.25)'
  },
  actionAuxBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 0.85rem',
    backgroundColor: '#f8fafc',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.25rem'
  },
  statBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column'
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: '1.4rem',
    fontWeight: '900',
    color: '#0f172a',
    marginTop: '0.2rem'
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '1.25rem',
    padding: '0.85rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.45rem 0.75rem',
    flex: '1 1 240px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.82rem',
    color: '#0f172a'
  },
  clearSearchBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 0
  },
  filterDropdownGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  filterSelect: {
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#334155',
    backgroundColor: '#ffffff'
  },
  filterStatusGroup: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap'
  },
  statusFilterBtn: {
    padding: '0.4rem 0.7rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  statusFilterBtnActive: {
    backgroundColor: '#0891b2',
    color: '#ffffff',
    borderColor: '#0891b2'
  },
  viewToggleGroup: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    padding: '0.2rem',
    borderRadius: '6px'
  },
  viewToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.65rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '700',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  viewToggleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  equipCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '0.85rem'
  },
  equipCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  equipCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },
  equipCodeBadge: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '900',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.5px'
  },
  categoryPill: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.15rem 0.45rem',
    borderRadius: '12px'
  },
  equipSector: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#334155'
  },
  typeBadge: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1'
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    justifyContent: 'center'
  },
  actionBtnRecarga: {
    border: '1px solid #bbf7d0',
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '0.3rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  actionBtnHydro: {
    border: '1px solid #c7d2fe',
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    padding: '0.3rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  actionBtnFicha: {
    border: '1px solid #bae6fd',
    backgroundColor: '#f0f9ff',
    color: '#0284c7',
    padding: '0.3rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  actionBtnEtiqueta: {
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#475569',
    padding: '0.3rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  editBtn: {
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    padding: '0.3rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  toggleStatusBtn: {
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    padding: '0.3rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteBtn: {
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '0.3rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  actionBtnRecargaFull: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.85rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  actionBtnHydroFull: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.85rem',
    backgroundColor: '#eef2ff',
    border: '1px solid #c7d2fe',
    color: '#6366f1',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  actionBtnEtiquetaFull: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.85rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#334155',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  equipCardDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    fontSize: '0.8rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.65rem'
  },
  equipDetailItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  detailKey: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: '600'
  },
  detailVal: {
    fontWeight: '700',
    color: '#1e293b'
  },
  validityBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    width: 'fit-content'
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.82rem'
  },
  th: {
    backgroundColor: '#f8fafc',
    padding: '0.65rem 0.85rem',
    fontWeight: '700',
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '0.65rem 0.85rem',
    color: '#1e293b',
    whiteSpace: 'nowrap'
  },
  emptyRow: {
    textAlign: 'center',
    padding: '2rem',
    color: '#94a3b8'
  },
  emptyCardBox: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '560px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column'
  },
  modalContentSmall: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '460px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  closeBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.2rem'
  },
  modalBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    overflowY: 'auto'
  },
  formRow2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem'
  },
  formRow3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#334155'
  },
  input: {
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    color: '#0f172a',
    outline: 'none'
  },
  select: {
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none'
  },
  textarea: {
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    color: '#0f172a',
    outline: 'none',
    resize: 'vertical'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.75rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.85rem'
  },
  cancelBtn: {
    padding: '0.45rem 0.95rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  saveBtn: {
    padding: '0.45rem 1.1rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  equipSummaryBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 0.85rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    marginBottom: '0.25rem'
  },
  fichaHeaderCard: {
    padding: '0.85rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  fichaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.65rem',
    marginTop: '0.85rem'
  },
  fichaBox: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.65rem',
    display: 'flex',
    flexDirection: 'column'
  },
  fichaKey: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  deleteModalBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '380px',
    width: '100%',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  confirmDeleteBtn: {
    padding: '0.45rem 1rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  }
};

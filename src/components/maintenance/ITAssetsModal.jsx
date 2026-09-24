import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Search, Filter, HardDrive, QrCode, Printer, 
  Trash2, Edit, Check, Laptop, Wifi, Server, Cpu, ShieldCheck
} from 'lucide-react';
import { dbService } from '../../firebase';

const ASSET_TYPES = [
  'Todos',
  'Desktop',
  'Notebook',
  'Impressora',
  'Rede',
  'Energia',
  'Periférico',
  'Servidor'
];

const CLINIC_SECTORS = [
  "Todos",
  "Recepção",
  "Salão A de Hemodiálise",
  "Salão B de Hemodiálise",
  "Salão C de Hemodiálise",
  "Posto de Enfermagem",
  "Consultório Médico",
  "Farmácia Clínica",
  "Laboratório",
  "Tratamento de Água (CTA)",
  "Reúso de Dialisadores",
  "Expurgo / CME",
  "Faturamento / APAC",
  "Financeiro",
  "Recursos Humanos (RH)",
  "Compras",
  "SESMT",
  "Diretoria",
  "Sala de Servidores",
  "Copa",
  "Geral"
];

export default function ITAssetsModal({ isOpen, onClose, currentUser }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [sectorFilter, setSectorFilter] = useState('Todos');
  
  // Modal / form states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrAsset, setQrAsset] = useState(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'Desktop',
    sector: 'Recepção',
    location: '',
    brand: '',
    model: '',
    serialNumber: '',
    ipAddress: '',
    macAddress: '',
    status: 'Operacional',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      if (dbService.getITAssets) {
        const data = await dbService.getITAssets();
        setAssets(data || []);
      }
    } catch (e) {
      console.warn('Erro ao carregar inventário de T.I.:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredAssets = assets.filter(a => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      !term ||
      (a.code || '').toLowerCase().includes(term) ||
      (a.name || '').toLowerCase().includes(term) ||
      (a.model || '').toLowerCase().includes(term) ||
      (a.serialNumber || '').toLowerCase().includes(term) ||
      (a.ipAddress || '').toLowerCase().includes(term) ||
      (a.sector || '').toLowerCase().includes(term);

    const matchType = typeFilter === 'Todos' || a.type === typeFilter;
    const matchSector = sectorFilter === 'Todos' || a.sector === sectorFilter;

    return matchSearch && matchType && matchSector;
  });

  const handleOpenNew = () => {
    const count = assets.length + 1;
    const seq = String(count).padStart(3, '0');
    setForm({
      code: `TI-PAT-${seq}`,
      name: '',
      type: 'Desktop',
      sector: 'Recepção',
      location: '',
      brand: '',
      model: '',
      serialNumber: '',
      ipAddress: '',
      macAddress: '',
      status: 'Operacional',
      notes: ''
    });
    setSelectedAsset(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (asset) => {
    setSelectedAsset(asset);
    setForm({
      code: asset.code || '',
      name: asset.name || '',
      type: asset.type || 'Desktop',
      sector: asset.sector || 'Recepção',
      location: asset.location || '',
      brand: asset.brand || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      ipAddress: asset.ipAddress || '',
      macAddress: asset.macAddress || '',
      status: asset.status || 'Operacional',
      notes: asset.notes || ''
    });
    setIsEditing(true);
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    try {
      const payload = {
        ...(selectedAsset || {}),
        ...form,
        name: form.name.trim(),
        code: form.code.trim()
      };

      if (dbService.saveITAsset) {
        await dbService.saveITAsset(payload);
      }
      setIsEditing(false);
      setSelectedAsset(null);
      loadAssets();
    } catch (err) {
      console.error('Erro ao salvar ativo:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente remover este equipamento do inventário?')) return;
    try {
      if (dbService.deleteITAsset) {
        await dbService.deleteITAsset(id);
      }
      loadAssets();
    } catch (err) {
      console.error('Erro ao excluir ativo:', err);
    }
  };

  const handleOpenQr = (asset) => {
    setQrAsset(asset);
    setShowQrModal(true);
  };

  const handlePrintLabel = (asset) => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const qrData = encodeURIComponent(`https://nexa.techcosta.net/ti/assets/${asset.code}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}&margin=4`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etiqueta Patrimonial - ${asset.code}</title>
        <style>
          @page { size: 65mm 38mm; margin: 0; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 8px 10px; 
            width: 65mm; 
            height: 38mm; 
            box-sizing: border-box; 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            border: 1px dashed #94a3b8;
          }
          .qr-img { width: 75px; height: 75px; flex-shrink: 0; }
          .info { flex: 1; padding-left: 8px; display: flex; flex-direction: column; justify-content: center; }
          .brand { font-size: 8px; font-weight: bold; color: #4338ca; text-transform: uppercase; margin-bottom: 2px; }
          .code { font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 2px; }
          .name { font-size: 9px; font-weight: bold; color: #1e293b; line-height: 1.2; margin-bottom: 2px; }
          .sub { font-size: 8px; color: #475569; }
          .ip { font-size: 8px; font-weight: bold; color: #0369a1; margin-top: 2px; }
          @media print { body { border: none; } }
        </style>
      </head>
      <body>
        <img class="qr-img" src="${qrUrl}" alt="QR" />
        <div class="info">
          <div class="brand">Nex-Ai CLINIC • T.I.</div>
          <div class="code">${asset.code}</div>
          <div class="name">${asset.name}</div>
          <div class="sub">${asset.sector}</div>
          ${asset.ipAddress ? `<div class="ip">IP: ${asset.ipAddress}</div>` : ''}
        </div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 400); };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconBox}>
              <HardDrive size={22} color="#4f46e5" />
            </div>
            <div>
              <h2 style={styles.title}>Inventário de T.I.</h2>
              <p style={styles.subtitle}>Controle patrimonial de computadores, impressoras e ativos</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button type="button" onClick={handleOpenNew} style={styles.btnPrimary}>
              <Plus size={16} /> Novo Ativo
            </button>
            <button type="button" onClick={onClose} style={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <Search size={15} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Buscar por código, nome, modelo, serial, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.selectFilter}
          >
            {ASSET_TYPES.map(t => (
              <option key={t} value={t}>{t === 'Todos' ? 'Tipo' : t}</option>
            ))}
          </select>

          <select 
            value={sectorFilter} 
            onChange={(e) => setSectorFilter(e.target.value)}
            style={styles.selectFilter}
          >
            {CLINIC_SECTORS.map(s => (
              <option key={s} value={s}>{s === 'Todos' ? 'Setor' : s}</option>
            ))}
          </select>
        </div>

        {/* Assets table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patrimônio</th>
                <th style={styles.th}>Equipamento</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Setor</th>
                <th style={styles.th}>IP</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={styles.emptyTd}>Carregando ativos de T.I...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyTd}>Nenhum equipamento cadastrado com os filtros selecionados.</td>
                </tr>
              ) : (
                filteredAssets.map(asset => (
                  <tr key={asset.id} style={styles.tr}>
                    <td style={styles.tdBold}>{asset.code}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{asset.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {asset.brand} {asset.model} {asset.serialNumber ? `• S/N: ${asset.serialNumber}` : ''}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badgeType}>{asset.type}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badgeSector}>{asset.sector}</span>
                      {asset.location && <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{asset.location}</span>}
                    </td>
                    <td style={styles.td}>
                      <code style={styles.codeIp}>{asset.ipAddress || '—'}</code>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: asset.status === 'Operacional' ? '#dcfce7' : asset.status === 'Em Manutenção' ? '#fee2e2' : '#fef3c7',
                        color: asset.status === 'Operacional' ? '#15803d' : asset.status === 'Em Manutenção' ? '#b91c1c' : '#b45309',
                        borderColor: asset.status === 'Operacional' ? '#bbf7d0' : asset.status === 'Em Manutenção' ? '#fca5a5' : '#fde68a'
                      }}>
                        {asset.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button 
                          type="button"
                          onClick={() => handleOpenQr(asset)}
                          style={styles.actionBtnSecondary}
                          title="Visualizar QR Code"
                        >
                          <QrCode size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handlePrintLabel(asset)}
                          style={styles.actionBtnPrimary}
                          title="Imprimir Etiqueta"
                        >
                          <Printer size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleOpenEdit(asset)}
                          style={styles.actionBtnSecondary}
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(asset.id)}
                          style={styles.actionBtnDanger}
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal: Edit / New Asset */}
        {isEditing && (
          <div style={styles.subModalOverlay}>
            <div style={styles.subModal}>
              <div style={styles.subHeader}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  {selectedAsset ? 'Editar Equipamento' : 'Novo Equipamento'}
                </h3>
                <button type="button" onClick={() => setIsEditing(false)} style={styles.closeBtn}><X size={16} /></button>
              </div>

              <form onSubmit={handleSaveAsset} style={styles.subForm}>
                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Código</label>
                    <input 
                      type="text" 
                      required
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={styles.label}>Nome</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Desktop Dell Recepção 1"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Tipo</label>
                    <select 
                      value={form.type} 
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      style={styles.select}
                    >
                      {ASSET_TYPES.filter(t => t !== 'Todos').map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Setor</label>
                    <select 
                      value={form.sector} 
                      onChange={(e) => setForm({ ...form, sector: e.target.value })}
                      style={styles.select}
                    >
                      {CLINIC_SECTORS.filter(s => s !== 'Todos').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Localização</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Bancada 2 / Rack U08"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Marca</label>
                    <input 
                      type="text" 
                      placeholder="Dell / Zebra / HP"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Modelo</label>
                    <input 
                      type="text" 
                      placeholder="OptiPlex 7090 / ZD220"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Serial</label>
                    <input 
                      type="text" 
                      placeholder="Número de Série"
                      value={form.serialNumber}
                      onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>IP</label>
                    <input 
                      type="text" 
                      placeholder="192.168.10.X"
                      value={form.ipAddress}
                      onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>MAC</label>
                    <input 
                      type="text" 
                      placeholder="00:1A:2B:3C:4D:5E"
                      value={form.macAddress}
                      onChange={(e) => setForm({ ...form, macAddress: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Status</label>
                    <select 
                      value={form.status} 
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      style={styles.select}
                    >
                      <option value="Operacional">Operacional</option>
                      <option value="Em Manutenção">Em Manutenção</option>
                      <option value="Reserva">Reserva</option>
                      <option value="Descarte">Descarte</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Observações</label>
                  <textarea 
                    rows="2"
                    placeholder="Configuração, data de aquisição, garantia ou particularidades..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.subFooter}>
                  <button type="button" onClick={() => setIsEditing(false)} style={styles.btnSecondary}>Cancelar</button>
                  <button type="submit" style={styles.btnPrimary}><Check size={15} /> Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: QR Code Preview */}
        {showQrModal && qrAsset && (
          <div style={styles.subModalOverlay}>
            <div style={{ ...styles.subModal, maxWidth: '380px', textAlign: 'center' }}>
              <div style={styles.subHeader}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Etiqueta QR Code</h3>
                <button type="button" onClick={() => setShowQrModal(false)} style={styles.closeBtn}><X size={16} /></button>
              </div>

              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', margin: '14px 0', border: '1px solid #e2e8f0' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`https://nexa.techcosta.net/ti/assets/${qrAsset.code}`)}&margin=4`} 
                  alt="QR Code" 
                  style={{ width: '160px', height: '160px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', marginTop: '10px' }}>{qrAsset.code}</div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#4338ca' }}>{qrAsset.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{qrAsset.sector} {qrAsset.ipAddress ? `• IP: ${qrAsset.ipAddress}` : ''}</div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button type="button" onClick={() => setShowQrModal(false)} style={styles.btnSecondary}>Fechar</button>
                <button type="button" onClick={() => handlePrintLabel(qrAsset)} style={styles.btnPrimary}>
                  <Printer size={15} /> Imprimir Etiqueta
                </button>
              </div>
            </div>
          </div>
        )}
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modal: {
    background: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '920px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '22px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '14px',
    marginBottom: '14px'
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#eef2ff',
    border: '1px solid #c7d2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a'
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px'
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '12px'
  },
  searchBox: {
    flex: '1 1 240px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '7px 12px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '13px',
    color: '#0f172a'
  },
  selectFilter: {
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    fontSize: '12px',
    color: '#0f172a',
    outline: 'none',
    fontWeight: 500
  },
  tableContainer: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflowX: 'auto',
    maxHeight: '440px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px'
  },
  th: {
    background: '#f8fafc',
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    position: 'sticky',
    top: 0,
    zIndex: 1
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.15s ease'
  },
  td: {
    padding: '10px 12px',
    verticalAlign: 'middle',
    color: '#1e293b'
  },
  tdBold: {
    padding: '10px 12px',
    verticalAlign: 'middle',
    fontWeight: 800,
    color: '#4f46e5'
  },
  emptyTd: {
    padding: '30px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    border: '1px solid transparent'
  },
  badgeType: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    background: '#f1f5f9',
    color: '#475569'
  },
  badgeSector: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    background: '#ede9fe',
    color: '#5b21b6'
  },
  codeIp: {
    background: '#f0fdf4',
    color: '#15803d',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'monospace',
    border: '1px solid #bbf7d0'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#475569',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  actionBtnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e0e7ff',
    color: '#4338ca',
    border: '1px solid #c7d2fe',
    padding: '5px 8px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  actionBtnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    padding: '5px 8px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  actionBtnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    padding: '5px 8px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  subModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  },
  subModal: {
    background: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '20px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    border: '1px solid #e2e8f0'
  },
  subHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '12px',
    marginBottom: '14px'
  },
  subForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  row: {
    display: 'flex',
    gap: '10px'
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '3px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  subFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
    marginTop: '6px'
  }
};

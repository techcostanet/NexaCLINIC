import React, { useState } from 'react';
import {
  UserPlus,
  Download,
  Search,
  Edit2,
  Trash2,
  X,
  Scale,
  Calendar,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  OPCOES_CAPILAR,
  calcularCapilarPorPeso,
  ESCALAS,
  SALOES,
  TURNOS,
  BOXES,
  POSICOES_BOX,
  calcularPrimeFinal
} from '../../utils/reuseRules';

export default function ReusePatientsTab({
  pacientes = [],
  onSalvarPaciente,
  onExcluirPaciente,
  onImportarDaClinica,
  carregandoImportacao
}) {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');

  // Estado do formulário
  const formVazio = {
    nome: '',
    cpf: '',
    data_nascimento: '',
    nome_mae: '',
    peso_kg: 70,
    capilar: 'B18H',
    capilar_manual: false,
    escala: 'SEG_QUA_SEX',
    salao: 1,
    turno: 1,
    box: 1,
    posicao: 1,
    prime_inicial: 115,
    reuso_atual: 0,
    unitId: 'betim',
    ativo: true
  };

  const [form, setForm] = useState(formVazio);

  const abrirNovo = () => {
    setEditando(null);
    setForm(formVazio);
    setErro('');
    setModalAberto(true);
  };

  const abrirEditar = (paciente) => {
    setEditando(paciente.id);
    setForm({
      ...paciente,
      peso_kg: paciente.peso_kg || 70,
      prime_inicial: paciente.prime_inicial || 115
    });
    setErro('');
    setModalAberto(true);
  };

  const handlePesoChange = (valor) => {
    const p = Number(valor);
    const atualizado = { ...form, peso_kg: valor };
    if (!form.capilar_manual && p > 0) {
      atualizado.capilar = calcularCapilarPorPeso(p);
    }
    setForm(atualizado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setErro('O nome do paciente é obrigatório.');
      return;
    }

    try {
      const pi = Number(form.prime_inicial) || 115;
      const pf = Number(calcularPrimeFinal(pi));
      await onSalvarPaciente({
        ...form,
        nome: form.nome.toUpperCase().trim(),
        peso_kg: Number(form.peso_kg) || 70,
        salao: Number(form.salao) || 1,
        turno: Number(form.turno) || 1,
        box: Number(form.box) || 1,
        posicao: Number(form.posicao) || 1,
        prime_inicial: pi,
        prime_final: pf
      });
      setModalAberto(false);
      setMensagemSucesso(editando ? 'Paciente atualizado!' : 'Paciente cadastrado com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      setErro(err?.message || 'Erro ao gravar dados do paciente.');
    }
  };

  const handleImportar = async () => {
    try {
      const res = await onImportarDaClinica();
      if (res?.mensagem) {
        setMensagemSucesso(res.mensagem);
        setTimeout(() => setMensagemSucesso(''), 5000);
      }
    } catch (err) {
      setErro(err?.message || 'Falha ao importar pacientes.');
      setTimeout(() => setErro(''), 5000);
    }
  };

  const filtrados = pacientes.filter((p) => {
    if (!busca) return true;
    const b = busca.toLowerCase();
    return (
      (p.nome || '').toLowerCase().includes(b) ||
      (p.cpf || '').replace(/\D/g, '').includes(b.replace(/\D/g, '')) ||
      (p.capilar || '').toLowerCase().includes(b)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Barra de Ações Superiores */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted, #94a3b8)'
            }}
          />
          <input
            type="text"
            placeholder="Buscar paciente cadastrado..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--card-bg, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {/* Botão de Importação Direta da Base Central (SM-009) */}
          <button
            onClick={handleImportar}
            disabled={carregandoImportacao}
            title="Sincronizar e importar pacientes cadastrados na clínica"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid #06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              color: '#0891b2',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: carregandoImportacao ? 'wait' : 'pointer'
            }}
          >
            <Download size={15} />
            {carregandoImportacao ? 'Importando...' : 'Importar'}
          </button>

          <button
            onClick={abrirNovo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#06b6d4',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <UserPlus size={15} />
            Novo
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Check size={16} />
          {mensagemSucesso}
        </div>
      )}

      {/* Tabela de Cadastro */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-color, #f8fafc)',
                  color: 'var(--text-secondary, #64748b)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '0.85rem 1rem' }}>Nome</th>
                <th style={{ padding: '0.85rem 1rem' }}>CPF</th>
                <th style={{ padding: '0.85rem 1rem' }}>Peso</th>
                <th style={{ padding: '0.85rem 1rem' }}>Capilar</th>
                <th style={{ padding: '0.85rem 1rem' }}>Escala</th>
                <th style={{ padding: '0.85rem 1rem' }}>Salão</th>
                <th style={{ padding: '0.85rem 1rem' }}>Turno</th>
                <th style={{ padding: '0.85rem 1rem' }}>Box</th>
                <th style={{ padding: '0.85rem 1rem' }}>Prime</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary, #64748b)' }}>
                    Nenhum paciente cadastrado. Utilize o botão "Importar" para puxar da clínica ou "Novo" para cadastrar.
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>{p.nome}</div>
                      {p.nome_mae && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)' }}>
                          Mãe: {p.nome_mae}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
                      {p.cpf || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {p.peso_kg ? `${p.peso_kg} kg` : '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: '#06b6d4',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}
                      >
                        {p.capilar}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
                      {p.escala === 'SEG_QUA_SEX' ? 'Seg/Qua/Sex' : 'Ter/Qui/Sáb'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      Salão {p.salao}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      T{p.turno}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      Box {p.box} (P{p.posicao})
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
                      {p.prime_inicial || 115} mL
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => abrirEditar(p)}
                          title="Editar"
                          style={{
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color, #cbd5e1)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary, #64748b)',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja remover ${p.nome} do reuso?`)) {
                              onExcluirPaciente(p.id);
                            }
                          }}
                          title="Excluir"
                          style={{
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}
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
      </div>

      {/* Modal de Cadastro / Edição */}
      {modalAberto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setModalAberto(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              color: 'var(--text-primary, #0f172a)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                {editando ? 'Editar Paciente' : 'Novo Paciente'}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem', color: 'var(--text-secondary, #64748b)' }}>
                  Nome
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do paciente"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-color, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem', color: 'var(--text-secondary, #64748b)' }}>
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      backgroundColor: 'var(--bg-color, #f8fafc)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem', color: 'var(--text-secondary, #64748b)' }}>
                    Nascimento
                  </label>
                  <input
                    type="date"
                    value={form.data_nascimento}
                    onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      backgroundColor: 'var(--bg-color, #f8fafc)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem', color: 'var(--text-secondary, #64748b)' }}>
                  Mãe
                </label>
                <input
                  type="text"
                  placeholder="Nome completo da mãe"
                  value={form.nome_mae}
                  onChange={(e) => setForm({ ...form, nome_mae: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-color, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem', color: 'var(--text-secondary, #64748b)' }}>
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.peso_kg}
                    onChange={(e) => handlePesoChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      backgroundColor: 'var(--bg-color, #f8fafc)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem', color: 'var(--text-secondary, #64748b)' }}>
                    Capilar
                  </label>
                  <select
                    value={form.capilar}
                    onChange={(e) => setForm({ ...form, capilar: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      backgroundColor: 'var(--bg-color, #f8fafc)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    {OPCOES_CAPILAR.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '-0.3rem' }}>
                <input
                  type="checkbox"
                  id="capilar_manual"
                  checked={form.capilar_manual}
                  onChange={(e) => setForm({ ...form, capilar_manual: e.target.checked })}
                />
                <label htmlFor="capilar_manual" style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)', cursor: 'pointer' }}>
                  Exceção Clínica (não recalcular automaticamente por peso)
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', color: 'var(--text-secondary)' }}>
                    Escala
                  </label>
                  <select
                    value={form.escala}
                    onChange={(e) => setForm({ ...form, escala: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  >
                    {ESCALAS.map((e) => (
                      <option key={e.valor} value={e.valor}>{e.curto}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', color: 'var(--text-secondary)' }}>
                    Salão
                  </label>
                  <select
                    value={form.salao}
                    onChange={(e) => setForm({ ...form, salao: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  >
                    {SALOES.map((s) => (
                      <option key={s} value={s}>Salão {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', color: 'var(--text-secondary)' }}>
                    Turno
                  </label>
                  <select
                    value={form.turno}
                    onChange={(e) => setForm({ ...form, turno: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  >
                    {TURNOS.map((t) => (
                      <option key={t} value={t}>T{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem', color: 'var(--text-secondary)' }}>
                    Box
                  </label>
                  <select
                    value={form.box}
                    onChange={(e) => setForm({ ...form, box: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  >
                    {BOXES.map((b) => (
                      <option key={b} value={b}>Box {b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {erro && (
                <div
                  style={{
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <AlertCircle size={15} />
                  {erro}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#06b6d4',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

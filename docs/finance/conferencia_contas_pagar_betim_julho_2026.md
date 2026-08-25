# Relatório de Conferência e Auditoria: Contas a Pagar (Unidade Betim)
**Data do Levantamento**: 24/08/2026  
**Período de Referência das Notas**: Julho/2026 (26/07/2026 a 31/07/2026)  
**Unidade de Destino**: Betim / MG (`unitId: 'betim'`)

---

## 📊 1. Resumo Executivo e Totais

- **Total de Lançamentos na Imagem Original**: 27 registros
- **Valor Bruto Total da Imagem**: **R$ 168.969,97**
- **4 Registros Já Existentes no Firestore**: R$ 7.400,00
- **Valor Líquido Inédito Pendente de Decisão**: **R$ 161.569,97**

---

## ⚠️ 2. Alertas de Duplicidade e Conflitos

### A. Conflitos Internos na Imagem Fornecida
1. **NF `931381` — COMERCIAL CIRURGICA RIOCLARENSE LTDA (R$ 1.250,50)**:
   - **Linha 14**: Vencimento `26/07/2026` | Parcela `1` | R$ 1.250,50
   - **Linha 16**: Vencimento `28/07/2026` | Parcela `1` | R$ 1.250,50
   - *A mesma NF aparece duas vezes com Parcela 1 em datas de vencimento diferentes.*

2. **NF `412842` — INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA (R$ 4.032,00)**:
   - **Linha 06**: Vencimento `26/07/2026` | Parcela `1` | R$ 4.032,00
   - **Linha 23**: Vencimento `31/07/2026` | Parcela `1` | R$ 4.032,00
   - **Linha 25**: Vencimento `31/07/2026` | Parcela `2` | R$ 4.032,00
   - *A Parcela 1 aparece repetida nas Linhas 06 e 23 com datas diferentes.*

### B. Registros já Existentes no Banco de Dados (Firestore)
1. **Linha 01 — INTENSIVEMED (NF `416581`)**: R$ 748,00 | Vencimento `26/07/2026` (`ID: Op1DGRy3vIsV7UWhREJY`).
2. **Linha 02 — MEDICAL-HOSP (NF `830`)**: R$ 200,00 | Vencimento `26/07/2026` (`ID: 1mVBLOoyNY8bh43HEPEO`).
3. **Linha 03 — HTS TECNOLOGIA (NF `248744`)**: R$ 5.150,00 | Vencimento `26/07/2026` (`ID: eS5buo505Xep5lPOgS2r`).
4. **Linha 04 — DCB DISTRIBUIDORA (NF `107783`)**: R$ 1.302,00 | Vencimento `26/07/2026` (`ID: VLuGac4DMFzH41rjQrVC`).
5. **Linha 22 — CONTMEDI (NF `405`)**: R$ 7.539,68 já existe no banco com vencimento `21/08/2026` (`ID: Sveojbd37v4wVByCvOBx`).

---

## 📋 3. Tabela Completa dos 27 Lançamentos

| # | Vencimento | Parcela | Fornecedor | NF / Doc | Valor (R$) | Diagnóstico |
|:---:|:---:|:---:|:---|:---:|---:|:---|
| **01** | 26/07/2026 | 1 | INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA | 416581 | R$ 748,00 | 🔴 Já cadastrado no sistema (Op1DGRy3vIsV7UWhREJY) |
| **02** | 26/07/2026 | 1 | MEDICAL-HOSP ASSESSORIA E SERVIÇOS LTDA. | 830 | R$ 200,00 | 🔴 Já cadastrado no sistema (1mVBLOoyNY8bh43HEPEO) |
| **03** | 26/07/2026 | 2 | HTS TECNOLOGIA EM SAUDE COM. IMP EXP LTD | 248744 | R$ 5.150,00 | 🔴 Já cadastrado no sistema (eS5buo505Xep5lPOgS2r) |
| **04** | 26/07/2026 | 1 | DCB DISTRIBUIDORA CIRURGICA BRASILEIRA LTDA | 107783 | R$ 1.302,00 | 🔴 Já cadastrado no sistema (VLuGac4DMFzH41rjQrVC) |
| **05** | 26/07/2026 | 1 | INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA | 413388 | R$ 350,00 | 🟢 Inédito (Pronto para importar) |
| **06** | 26/07/2026 | 1 | INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA | 412842 | R$ 4.032,00 | 🟡 Duplicidade interna na imagem (Repetido na Linha 23) |
| **07** | 26/07/2026 | 2 | COMERCIAL CIRURGICA RIOCLARENSE LTDA | 920340 | R$ 22.700,13 | 🟢 Inédito (Pronto para importar) |
| **08** | 26/07/2026 | 1 | ANCHIETA PULVERIZACOES LTDA | 1507 | R$ 750,71 | 🟢 Inédito (Pronto para importar) |
| **09** | 26/07/2026 | 1 | INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA | 413928 | R$ 3.011,20 | 🟢 Inédito (Pronto para importar) |
| **10** | 26/07/2026 | 1 | GERAIS COM. E IMP. DE MAT. E EQUIP. MEDICOS LTDA | 5975 | R$ 5.960,00 | 🟢 Inédito (Pronto para importar) |
| **11** | 26/07/2026 | 1 | BIOCOMPANY COMERCIO E SERVIÇOS LTDA | 79751 | R$ 8.255,00 | 🟢 Inédito (Pronto para importar) |
| **12** | 26/07/2026 | 1 | COMERCIAL CIRURGICA RIOCLARENSE LTDA | 2168182 | R$ 10.760,00 | 🟢 Inédito (Pronto para importar) |
| **13** | 26/07/2026 | 2 | COMERCIAL CIRURGICA RIOCLARENSE LTDA | 922066 | R$ 6.649,93 | 🟢 Inédito (Pronto para importar) |
| **14** | 26/07/2026 | 1 | COMERCIAL CIRURGICA RIOCLARENSE LTDA | 931381 | R$ 1.250,50 | 🟡 Duplicidade interna na imagem (Repetido na Linha 16) |
| **15** | 28/07/2026 | 1 | COMERCIAL CIRURGICA RIOCLARENSE LTDA | 931359 | R$ 3.751,80 | 🟢 Inédito (Pronto para importar) |
| **16** | 28/07/2026 | 1 | COMERCIAL CIRURGICA RIOCLARENSE LTDA | 931381 | R$ 1.250,50 | 🟡 Duplicidade interna na imagem (Repetido da Linha 14) |
| **17** | 30/07/2026 | 1 | MG ESCAL LTDA - ME | 525 | R$ 520,00 | 🟢 Inédito (Pronto para importar) |
| **18** | 30/07/2026 | 1 | COMERCIAL CIRURGICA RIOCLARENSE LTDA | 931603 | R$ 4.014,00 | 🟢 Inédito (Pronto para importar) |
| **19** | 30/07/2026 | 1 | COMERCIAL CIRURGICA RIOCLARENSE LTDA | 931672 | R$ 11.250,00 | 🟢 Inédito (Pronto para importar) |
| **20** | 30/07/2026 | 1 | KOR3 LOGISTICA INTELIGENTE PARA A SAUDE LTDA | 42 | R$ 30.789,22 | 🟢 Inédito (Pronto para importar) |
| **21** | 30/07/2026 | 2 | PERICOM COMERCIO DE EQUIPAMENTO DE SEGURANÇA | 156464 | R$ 1.338,92 | 🟢 Inédito (Parcela 2) |
| **22** | 31/07/2026 | 1 | CONTMEDI & ESTRUTURAR CONTABILIDADE E FINANCAS LTD | 405 | R$ 7.539,68 | 🔵 Já existe NF 405 no sistema com venc. 21/08 |
| **23** | 31/07/2026 | 1 | INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA | 412842 | R$ 4.032,00 | 🟡 Duplicidade interna na imagem (Repetido da Linha 06) |
| **24** | 31/07/2026 | 1 | EVERLIMP COMERCIO E DISTRIBUIDORA LTDA | 71773 | R$ 1.238,00 | 🟢 Inédito (Pronto para importar) |
| **25** | 31/07/2026 | 2 | INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA | 412842 | R$ 4.032,00 | 🟢 Inédito (Parcela 2) |
| **26** | 31/07/2026 | 1 | CONSELHO REGIONAL DE ENFERMAGEM DE MINAS GERAIS | 19940187 | R$ 202,43 | 🟢 Inédito (Pronto para importar) |
| **27** | 31/07/2026 | 1 | FORTECARE INDUSTRIA DE PRODUTOS MEDICOS LTDA | 77821 | R$ 27.891,95 | 🟢 Inédito (Pronto para importar) |

# Banco de Sugestões de Melhorias — Nex-Ai CLINIC

Este repositório registra todas as sugestões de melhorias, otimizações operacionais, comodidades de interface (UX/UI) e ideias de evolução técnica propostas pelo assistente e postergadas ou não aceitas no momento pelo gestor.

O objetivo deste arquivo é manter a memória das ideias para consultas futuras, facilitando a decisão e a implementação quando for oportuno.

---

## Estrutura de Cada Registro
- **ID:** Identificador sequencial (`SM-001`, `SM-002`, etc.)
- **Data:** Data em que a melhoria foi proposta
- **Módulo:** Módulo do sistema afetado (`.STOCK`, `.FINANCE`, `.ASSIST`, `.CONFIG`, etc.)
- **Título:** Resumo direto da funcionalidade ou ajuste
- **Status:** `Pendente / Aguardando Decisão Futura` | `Aprovada / Implementada` | `Descartada Definitivamente`
- **Origem / Contexto:** Cenário em que a oportunidade foi identificada
- **Descrição Técnica:** O que precisa ser desenvolvido ou ajustado
- **Benefício Operacional:** Impacto positivo no fluxo diário do usuário
- **Arquivos Envolvidos:** Componentes, serviços ou utilitários afetados
- **Complexidade:** `Baixa` | `Média` | `Alta`

---

## Registros de Sugestões

### [SM-001] Captura Automática de Código Pix Copia e Cola em Faturas Digitais
- **Data:** 01/10/2026
- **Módulo:** `.STOCK` (Estoque) / `.FINANCE` (Financeiro)
- **Título:** Extração de Chave/Código Pix Copia e Cola e Botão de Cópia em 1 Clique no Contas a Pagar
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Durante a implementação do reconhecimento de faturas de serviços emitidas via ERPs modernos (ex.: Conta Azul para 4INFRA), identificou-se que o documento disponibiliza código Pix Copia e Cola (`00020101...`) além do boleto bancário tradicional.
- **Descrição Técnica:**
  - Em `danfePdfParser.js`, adicionar regex para extrair sequências `Código Pix Copia e Cola:\s*([0-9a-zA-Z\.\-\*]{60,})`.
  - Vincular o código Pix aos dados da parcela/fatura gerada.
  - No módulo Financeiro (`FinancePanel.jsx`), na listagem de Contas a Pagar e no modal de pagamento, adicionar badge e botão `"Copiar Pix"` (similar ao botão existente de copiar linha digitável de boletos).
- **Benefício Operacional:** Permite pagar fornecedores instantaneamente via Pix através do Internet Banking sem a necessidade de esperar compensação bancária de 1 a 3 dias úteis típica do boleto.
- **Arquivos Envolvidos:** `src/utils/danfePdfParser.js`, `src/components/FinancePanel.jsx`, `src/services/firebase/financialService.js`.
- **Complexidade:** Baixa.

---

### [SM-002] Edição Rápida Inline da Data de Entrada na Tabela de Notas
- **Data:** 01/10/2026
- **Módulo:** `.STOCK` (Estoque)
- **Título:** Edição Rápida da Data de Entrada Diretamente na Tabela de Notas Fiscais
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Identificada após a correção do fuso horário na data de entrada de notas. Atualmente, a tabela já permite retificar o valor monetário da nota com 1 clique (edição inline), mas para alterar a data de entrada é necessário reabrir os dados ou manipular manualmente.
- **Descrição Técnica:**
  - Na tabela de notas fiscais arquivadas (`StockPanel.jsx`), adicionar duplo clique ou ícone de lápis discreto sobre a célula da coluna `Entrada`.
  - Ao clicar, exibe um seletor nativo `<input type="date" />` com botão de confirmação (`Enter` ou botão verde).
  - Atualiza o campo `entryDate` diretamente no documento correspondente no Firestore (`purchase_invoices`) via `dbService.updatePurchaseInvoiceEntryDate(invoiceId, newDate)`.
- **Benefício Operacional:** Facilidade imediata para retificar lançamentos antigos com data divergente sem precisar estornar a nota ou recadastrá-la.
- **Arquivos Envolvidos:** `src/components/StockPanel.jsx`, `src/components/Stock/hooks/useStockLogic.jsx`, `src/services/firebase/financialService.js`.
- **Complexidade:** Baixa.

---

### [SM-003] Painel de Auditoria Visual de E-mails Disparados no NexaCONFIG
- **Data:** 01/10/2026
- **Módulo:** `.CONFIG` (Configurações) / `.ASSIST` (Mural Assistencial)
- **Título:** Histórico Visual de E-mails Enviados com Status de Entrega em Tempo Real
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Proposta durante a ativação do envio de comunicados por e-mail no plano Blaze via Cloud Functions e SMTP.
- **Descrição Técnica:**
  - Na aba `E-mail` do módulo `Nex-Ai.CONFIG`, criar uma subtabela ou modal de "Histórico de Disparos".
  - Consultar a coleção `mail` e `email_logs` do Firestore, exibindo: Data/Hora, Destinatário, Assunto, Origem (ex.: Mural Assistencial, Teste Manual) e Situação (`Enviado ✅`, `Pendente ⏳`, `Erro ❌`).
  - Botão de "Reenviar" para mensagens que eventualmente falharem por instabilidade no servidor SMTP.
- **Benefício Operacional:** Permite à coordenação da clínica auditar se os comunicados urgentes realmente chegaram à caixa postal do destinatário, eliminando dúvidas se a mensagem foi disparada.
- **Arquivos Envolvidos:** `src/components/config/EmailSettingsTab.jsx`, `src/services/firebase/systemService.js`.
- **Complexidade:** Média.

---

### [SM-004] Filtros Avançados de Encaminhamento do Mural por Turno e Urgência
- **Data:** 01/10/2026
- **Módulo:** `.ASSIST` (Mural Assistencial) / `.CONFIG` (Configurações)
- **Título:** Encaminhamento Condicional de E-mails Baseado em Turno ou Grau de Urgência
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Proposta durante a implementação do modo exclusivo de enfermagem no Mural.
- **Descrição Técnica:**
  - No configurador de e-mails (`NexaCONFIG`), permitir parametrizar destinatários diferentes de acordo com o turno (`1º Turno`, `2º Turno`, `3º Turno`) ou nível de gravidade (`Normal`, `Urgente`, `Crítico`).
  - Exemplo: comunicados marcados como "Crítico" notificam a diretoria clínica imediatamente, enquanto avisos de rotina são direcionados apenas à coordenação de enfermagem do turno ativo.
- **Benefício Operacional:** Evita sobrecarga de mensagens na caixa postal dos gestores, garantindo atenção prioritária apenas para o que for estritamente urgente ou pertinente à sua jornada.
- **Arquivos Envolvidos:** `src/components/config/EmailSettingsTab.jsx`, `src/services/firebase/assistService.js`, `functions/index.js`.
- **Complexidade:** Média.

---

### [SM-005] Upload em Lote de Múltiplos Boletos no Contas a Pagar
- **Data:** 01/10/2026
- **Módulo:** `.FINANCE` (Financeiro)
- **Título:** Arraste e Leitura Múltipla de Boletos em Lote (PDFs Múltiplos)
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Identificada durante as otimizações no processamento de boletos em PDF via Web Workers.
- **Descrição Técnica:**
  - Permitir selecionar ou arrastar múltiplos arquivos de boletos simultaneamente na tela do Financeiro.
  - O sistema lê todos em paralelo (com o novo leitor protegido com timeout), associa pelo CNPJ/Fornecedor ou valor aos títulos pendentes do Contas a Pagar e anexa automaticamente.
- **Benefício Operacional:** Economia substancial de tempo no fechamento de contas do mês, permitindo processar 20 a 50 boletos de uma só vez em segundos.
- **Arquivos Envolvidos:** `src/components/FinancePanel.jsx`, `src/utils/boletoParser.js`.
- **Complexidade:** Média.

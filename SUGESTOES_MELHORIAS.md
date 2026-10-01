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

---

### [SM-006] Botão de Sincronização Manual sob Demanda no Mural Assistencial
- **Data:** 01/10/2026
- **Módulo:** `.ASSIST` (Mural Assistencial)
- **Título:** Botão de Disparo Manual de Sincronização de E-mails Titan no Cabeçalho do Mural
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Sugerido durante a reativação da ingestão de e-mails corporativos da caixa `integracao@dialize.com.br`. O gestor optou por manter o Mural limpo sem botões extras, mantendo o controle exclusivo de ligar/desligar na aba de E-mail do NexaCONFIG.
- **Descrição Técnica:**
  - No cabeçalho do Feed Assistencial (`AssistWall.jsx`), adicionar botão discreto de ação com ícone `RefreshCw` para solicitar verificação instantânea da caixa postal.
  - Integração com endpoint ou trigger de execução do script de sincronização sem aguardar o ciclo do serviço.
- **Benefício Operacional:** Permitiria à equipe de enfermagem forçar a busca imediata de um comunicado urgente que acabou de ser enviado por um médico ou parceiro externo.
- **Arquivos Envolvidos:** `src/components/assist/AssistWall.jsx`, `src/services/firebase/assistService.js`.
- **Complexidade:** Baixa.

---

### [SM-007] Exigência de Troca de Senha no Primeiro Acesso (Flag mustChangePassword)
- **Data:** 01/10/2026
- **Módulo:** `.CONFIG` (Configurações) / Autenticação Geral
- **Título:** Forçar Troca Obrigatória de Senha no Primeiro Acesso ou após Redefinição Temporária
- **Status:** `Aprovada / Implementada (v4.9.118)`
- **Origem / Contexto:** Identificada durante o desenvolvimento da alteração simplificada de senhas e do seletor de dificuldade no NexaCONFIG. Aprovada pelo usuário com opção de ativar/desativar no módulo config (desativada por padrão).
- **Descrição Técnica:**
  - No cadastro de usuário pelo administrador ou ao gerar uma senha temporária dinâmica, gravar a flag `mustChangePassword: true` no documento do usuário no Firestore (`users`).
  - No `ModuleSelector.jsx` e `Navbar.jsx`, caso a clínica ative o controle e o colaborador possua `mustChangePassword === true`, abrir compulsoriamente o `ChangePasswordModal` em modo bloqueante (`isForced`) com opção de saída segura (`LogOut`) até que ele defina e salve sua senha definitiva compatível com a política da clínica.
  - Após a alteração bem-sucedida, desmarcar a flag para `false` e atualizar `passwordUpdatedAt`.
- **Benefício Operacional:** Garante que senhas padrão iniciais (ex.: `123456` ou senhas provisórias repassadas por WhatsApp/e-mail) sejam obrigatoriamente substituídas por senhas particulares de conhecimento exclusivo do colaborador, eliminando riscos de vazamento de senhas compartilhadas.
- **Arquivos Envolvidos:** `src/utils/passwordPolicy.js`, `src/components/common/ChangePasswordModal.jsx`, `src/services/firebase/authService.js`, `src/components/ConfigPanel.jsx`, `src/components/ModuleSelector.jsx`, `src/components/Navbar.jsx`.
- **Complexidade:** Baixa.

---

### [SM-008] Expiração Periódica de Senhas para Conformidade Hospitalar (30/60/90/180 dias)
- **Data:** 01/10/2026
- **Módulo:** `.CONFIG` (Configurações) / Segurança
- **Título:** Parâmetro de Renovação Obrigatória Periódica de Senhas (Expiração por Validade)
- **Status:** `Aprovada / Implementada (v4.9.118)`
- **Origem / Contexto:** Identificada no desenho da tela de políticas de segurança e complexidade de senhas no NexaCONFIG. Aprovada pelo usuário com chave de ativação/desativação no Config (desativada por padrão).
- **Descrição Técnica:**
  - Na aba `Senhas` do NexaCONFIG, controles ativáveis de renovação periódica com seletor de ciclo (30, 60, 90 ou 180 dias; padrão 90 dias quando ativado).
  - Armazenar o timestamp `passwordUpdatedAt` no Firestore e na sessão local.
  - Ao carregar o seletor ou navbar, verificar se a credencial está expirada ou nos últimos 7 dias de validade (aviso preventivo com botão rápido `Renovar`).
- **Benefício Operacional:** Atende a requisitos formais de auditorias hospitalares, acreditação ONA (Organização Nacional de Acreditação) e exigências rigorosas de proteção a dados sensíveis de saúde da LGPD.
- **Arquivos Envolvidos:** `src/utils/passwordPolicy.js`, `src/components/ConfigPanel.jsx`, `src/services/firebase/authService.js`, `src/components/ModuleSelector.jsx`, `src/components/Navbar.jsx`.
- **Complexidade:** Média.



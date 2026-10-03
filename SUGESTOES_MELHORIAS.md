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
- **Complexidade:** Média.

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

---

### [SM-009] Importação e Sincronização Direta de Pacientes do Nex-Ai CLINIC para o Módulo .REUSE
- **Data:** 02/10/2026
- **Módulo:** `.REUSE` (Reuso de Dialisadores)
- **Título:** Importação e Vínculo com a Base Central de Pacientes da Clínica
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Durante a análise do sistema legado ReusoPro, observou-se que o cadastro de pacientes era isolado. No Nex-Ai CLINIC já existe a base unificada de pacientes (`patientService`).
- **Descrição Técnica:**
  - Adicionar botão "Importar do Cadastro" na listagem de pacientes do `.REUSE`.
  - Autocomplete buscando na coleção `patients`, preenchendo automaticamente Nome, Peso, Data de Nascimento e Nome da Mãe.
  - Manter chave estrangeira `patientRefId` para sincronização bidirecional de dados vitais.
- **Benefício Operacional:** Elimina retrabalho de digitação e evita inconsistências cadastrais entre a Recepção/Prontuário e a sala de Reuso.
- **Arquivos Envolvidos:** `src/components/reuse/ReusePatientsTab.jsx`, `src/services/firebase/reuseService.js`.
- **Complexidade:** Média.

---

### [SM-010] Leitor de Código de Barras / QR Code na Bancada de Reuso
- **Data:** 02/10/2026
- **Módulo:** `.REUSE` (Reuso de Dialisadores)
- **Título:** Escaneamento de Dialisador para Abertura Imediata da Ficha de Presença e Descarte
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Identificada durante o mapeamento do fluxo físico de identificação de dialisadores na sala de reuso.
- **Descrição Técnica:**
  - Incorporar nas etiquetas térmicas um Código de Barras Code-128 ou QR Code com o ID único do paciente/capilar.
  - No Painel do Reuso, permitir foco automático em campo de escaneamento rápido (compatível com leitor USB/Bluetooth).
  - Ao bipar o capilar na bancada de lavagem, o sistema abre diretamente o modal com as opções de confirmar uso ou registrar descarte.
- **Benefício Operacional:** Agilidade extrema no reprocessamento e garantia de 100% de precisão sem risco de selecionar o paciente errado na lista.
- **Arquivos Envolvidos:** `src/components/reuse/ReusePanel.jsx`, `src/components/reuse/ReuseLabelsTab.jsx`, `src/utils/reuseLabels.js`.
- **Complexidade:** Média.

---

### [SM-011] Exportação Gerencial de Trocas e Descartes em Planilha Excel (XLSX)
- **Data:** 02/10/2026
- **Módulo:** `.REUSE` (Reuso de Dialisadores)
- **Título:** Exportação de Dados de Trocas e Descarte Precoce em Formato Excel Nativo
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** O sistema ReusoPro original fornecia relatórios apenas em PDF. No Nex-Ai CLINIC, a biblioteca `xlsx` já está disponível para relatórios gerenciais e de auditoria.
- **Descrição Técnica:**
  - Na aba `Trocas` e `Relatórios` do módulo `.REUSE`, adicionar botão "Exportar Excel".
  - Gerar planilha contendo colunas: Paciente, Salão, Turno, Capilar Anterior, Capilar Novo, Usos Atingidos, Motivo, Justificativa, Operador e Data/Hora.
- **Benefício Operacional:** Facilidade para a gestão da qualidade e nefrologistas realizarem cruzamentos analíticos em planilhas externas.
- **Arquivos Envolvidos:** `src/components/reuse/ReuseSwapsTab.jsx`, `src/components/reuse/ReuseReportsTab.jsx`.
- **Complexidade:** Baixa.

---

### [SM-012] Gráfico Histórico de Aproveitamento Mensal de Capilares com Recharts
- **Data:** 02/10/2026
- **Módulo:** `.REUSE` (Reuso de Dialisadores)
- **Título:** Gráfico Evolutivo de Linhas e Barras de Aproveitamento (%) por Salão
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** O ReusoPro original utilizava barras de progresso horizontais básicas em CSS. Como o Nex-Ai CLINIC possui o `recharts` instalado e padronizado, é possível apresentar análises temporais ricas.
- **Descrição Técnica:**
  - Na aba `Aproveitamento`, implementar gráfico com Recharts (`LineChart` ou `BarChart`) exibindo a curva média de aproveitamento nos últimos 6 meses.
  - Segmentação visual comparando Salão 1, Salão 2 e Salão 3 com a meta regulamentar (ex.: linha de referência em 85%).
- **Benefício Operacional:** Visão estratégica para a coordenação clínica identificar rapidamente salões ou turnos com pico anômalo de descartes por coagulação ou ruptura.
- **Arquivos Envolvidos:** `src/components/reuse/ReuseYieldTab.jsx`.
- **Complexidade:** Média.

---

### [SM-013] QR Code em Extintores e Hidrantes para Abertura Imediata de Inspeção em Campo
- **Data:** 02/10/2026
- **Módulo:** `.SESMT` (Segurança do Trabalho)
- **Título:** Etiquetas com QR Code nos Equipamentos de Incêndio para Escaneamento e Check-in Móvel
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Durante a expansão dos checklists móveis e auditoria dos 25 relatórios do SESMT, observou-se que a equipe de segurança de campo precisa navegar e selecionar manualmente cada equipamento na lista durante a ronda física.
- **Descrição Técnica:**
  - Gerar etiquetas adesivas com QR Code contendo o identificador do equipamento (ex: `sesmt://extintor/EXT-001`).
  - Adicionar botão com ícone de câmera/leitor QR Code no cabeçalho do módulo SESMT móvel.
  - Ao ler o código com a câmera do celular/tablet, o sistema abre diretamente o modal ou cartão de conferência semanal do extintor/hidrante correspondente.
- **Benefício Operacional:** Elimina tempo de busca e digitação em rondas extensas, garantindo que o técnico está fisicamente presente diante do equipamento conferido.
- **Arquivos Envolvidos:** `src/components/sesmt/EquipmentTab.jsx`, `src/components/sesmt/ExtinguishersChecklistTab.jsx`.
- **Complexidade:** Média.

---

### [SM-014] Notificação Automática por E-mail de Extintores e Ensaios com Carga a Vencer
- **Data:** 02/10/2026
- **Módulo:** `.SESMT` (Segurança do Trabalho) / `.CONFIG` (E-mails)
- **Título:** Alerta Preventivo Automatizado de Vencimento de Cargas de Extintores e Ensaios Hidrostáticos
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** O módulo agora conta com cards de vencimento e relatórios de previsão orçamentária, mas a checagem depende de o técnico abrir o painel.
- **Descrição Técnica:**
  - Integrar rotina diária no backend/cloud que verifica extintores e hidrantes com vencimento em 30, 15 e 7 dias.
  - Enviar e-mail formatado via `processMailQueue` para os técnicos de segurança e encarregados da manutenção predial com a lista de equipamentos que exigem recarga ou reteste.
- **Benefício Operacional:** Prevenção proativa contra multas e não conformidades em vistorias do Corpo de Bombeiros (AVCB) ou Vigilância Sanitária.
- **Arquivos Envolvidos:** `src/services/firebase/sesmtService.js`, `functions/index.js`.
- **Complexidade:** Média.

---

### [SM-015] Alerta Crítico Visual no Painel para Setores com Desvio de Biossegurança ≥ 50%
- **Data:** 02/10/2026
- **Módulo:** `.SESMT` (Segurança do Trabalho) / `.INDEX` (Qualidade & BI)
- **Título:** Alerta Crítico de Biossegurança por Sala/Setor com Alta Taxa de Não Conformidade no Descarte
- **Status:** `Aprovada / Implementada`
- **Origem / Contexto:** Auditoria de descarte de resíduos infectantes (RDC 222/NR-32) que identificou setores (ex: Salão 2 e Salão 3) com taxa de não conformidade entre 89% e 100% nas vistorias de campo.
- **Descrição Técnica:**
  - Implementação de monitoramento dinâmico em `SesmtDashboard.jsx` e `DailyWasteChecklist.jsx`.
  - Quando a taxa de não conformidade no setor atinge ou supera 50% no período, o painel renderiza automaticamente banner de Alerta Crítico em vermelho com destaque do percentual e orientação de reciclagem técnica imediata.
- **Benefício Operacional:** Visibilidade instantânea para o gestor hospitalar e técnico de segurança sobre as áreas que demandam intervenção e treinamento emergencial.
- **Arquivos Envolvidos:** `src/components/sesmt/SesmtDashboard.jsx`, `src/components/sesmt/DailyWasteChecklist.jsx`.
- **Complexidade:** Baixa.

---

### [SM-016] Notificação Automática no Mural Clínico da Enfermagem (.ASSIST) em Vistorias com Desvio
- **Data:** 02/10/2026
- **Módulo:** `.SESMT` (Segurança do Trabalho) / `.ASSIST` (Mural Clínico de Enfermagem)
- **Título:** Comunicação Direta entre Segurança do Trabalho e Equipe Assistencial em Auditorias de Resíduos
- **Status:** `Aprovada / Implementada`
- **Origem / Contexto:** Frequente descontinuidade de comunicação entre as rondas do SESMT e os profissionais de enfermagem que operam as máquinas de diálise nas salas.
- **Descrição Técnica:**
  - Ao salvar uma vistoria de resíduos infectantes com apontamento de Não Conformidade (NC), o serviço `sesmtService.js` dispara a criação de um comunicado automático no Mural Clínico da Enfermagem (`clinicalNotices`).
  - O comunicado categoriza o setor, turno e itens descumpridos com badge de Alerta de Biossegurança, notificando a enfermagem de plantão para correção de condutas e substituição de lixeiras defeituosas.
- **Benefício Operacional:** Ação corretiva em tempo real no próprio turno de trabalho, prevenindo riscos biológicos e quebrando ciclos de reincidência.
- **Arquivos Envolvidos:** `src/services/firebase/sesmtService.js`, `src/components/sesmt/DailyWasteChecklist.jsx`.
- **Complexidade:** Média.

---

### [SM-017] Conciliação Bancária com Leitura Automática de Extrato OFX/CSV e Auto-Matching
- **Data:** 03/10/2026
- **Módulo:** `.FINANCE` (Financeiro & Tesouraria)
- **Título:** Leitor Real de Extratos Bancários (OFX/CSV) com Algoritmo de Auto-Matching de Títulos
- **Status:** `Aprovada / Implementada`
- **Origem / Contexto:** A conciliação anterior dependia de digitação manual de cada transação bancária ou planilhas estáticas, tornando a rotina de conferência da tesouraria lenta e sujeita a erros operacionais.
- **Descrição Técnica:**
  - Utilitário dedicado `src/utils/ofxParser.js` para parsing de extratos bancários nos padrões SGML e XML (Sicoob, Itaú, Banco do Brasil, Santander, Caixa, Bradesco, Inter).
  - Algoritmo de correspondência inteligente que compara valor monetário, proximidade de data (janela de até 5 dias) e similaridade fonética/textual de fornecedor e cliente.
  - Interface no `FinancePanel.jsx` com modal de resumo (`ofxSummaryModal`), métricas de correspondência e botão de conciliação em lote com 1 clique (`handleAutoReconcileAllMatches`).
  - Na tabela de conciliação, exibição de diagnóstico visual com link do título encontrado e botão de baixa instantânea.
- **Benefício Operacional:** Redução de até 90% do tempo despendido pela tesouraria na conferência bancária diária, eliminando erros de digitação e assegurando saldo real idêntico ao do extrato oficial.
- **Arquivos Envolvidos:** `src/utils/ofxParser.js`, `src/components/FinancePanel.jsx`.
- **Complexidade:** Média.

---

### [SM-018] Integração Automática entre Estoque/Compras e Contas a Pagar
- **Data:** 03/10/2026
- **Módulo:** `.STOCK` (Estoque & Compras) / `.FINANCE` (Contas a Pagar)
- **Título:** Lançamento Automático de Títulos a Pagar no Financeiro na Entrada de Notas Fiscais (NF-e/NFS-e)
- **Status:** `Aprovada / Implementada`
- **Origem / Contexto:** Quando a equipe do Almoxarifado/Farmácia dava entrada em notas fiscais de dialisadores, medicamentos ou serviços, o setor financeiro precisava recadastrar manualmente as duplicatas e boletos no módulo `.FINANCE`.
- **Descrição Técnica:**
  - Atualização dos serviços `createPurchaseInvoice` e `deletePurchaseInvoice` em `financialService.js` e `mockFirebase.js`.
  - Ao salvar uma nota fiscal no estoque, o sistema gera automaticamente os títulos de parcelas correspondentes em `accounts_payable` com fornecedor, CNPJ, valor, data de vencimento, categoria de insumo e vínculo com o ID da nota.
  - Implementação da função `syncStockInvoicesToPayables` e inclusão do botão "Sincronizar Estoque" na barra de ações do Contas a Pagar para importar retroativamente notas já existentes.
  - Exibição de badge de rastreabilidade `📦 Estoque` nas linhas de títulos do Contas a Pagar.
- **Benefício Operacional:** Eliminação completa da duplicidade de trabalho entre almoxarifado e financeiro, prevenindo esquecimento de vencimentos e multas por atraso de pagamento a fornecedores críticos de diálise.
- **Arquivos Envolvidos:** `src/services/firebase/financialService.js`, `src/mockFirebase.js`, `src/components/FinancePanel.jsx`.
- **Complexidade:** Média.

---

### [SM-019] Break-even Operacional de Sessão de Diálise por Turno e Máquina
- **Data:** 03/10/2026
- **Módulo:** `.FINANCE` (Custos & Controladoria)
- **Título:** Cálculo Dinâmico de Ponto de Equilíbrio (Break-Even) por Sessão, Turno e Máquina de Hemodiálise
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Proposta durante o refinamento dos indicadores de custos fixos e variáveis da clínica.
- **Descrição Técnica:**
  - Algoritmo que cruza os custos fixos (energia, água de osmose, aluguel, equipe clínica) e variáveis (linhas, capilares, heparina, concentrados) com a tabela de remuneração SUS e convênios privados.
  - Renderizar no painel de DRE Gerencial o número exato de sessões mensais necessárias para atingir o ponto de equilíbrio operacional por turno (1º, 2º e 3º turnos).
- **Benefício Operacional:** Permite ao gestor identificar quais turnos operam com margem positiva e apoia decisões de expansão de capacidade instalada ou realocação de pacientes.
- **Arquivos Envolvidos:** `src/components/FinancePanel.jsx`, `src/services/firebase/financialService.js`.
- **Complexidade:** Alta.

---

### [SM-020] Régua de Alertas Automáticos de Vencimento e DDA Bancário
- **Data:** 03/10/2026
- **Módulo:** `.FINANCE` (Contas a Pagar & Tesouraria)
- **Título:** Notificações Preventivas de Boletos a Vencer e Captura via DDA
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Proposta levantada para evitar juros e encargos por atraso em contas de consumo e fornecedores médicos.
- **Descrição Técnica:**
  - Job automático para envio de alertas por e-mail e push notification no início da manhã com a lista de compromissos financeiros que vencem no dia e nos próximos 3 dias.
  - Estrutura para conferência de boletos registrados no CNPJ da clínica (DDA) via integração bancária.
- **Benefício Operacional:** Segurança financeira, mitigando custos desnecessários com juros e protestos cartorários.
- **Arquivos Envolvidos:** `src/services/firebase/financialService.js`, `functions/index.js`.
- **Complexidade:** Média.

---

### [SM-021] Dossiê Executivo Mensal Consolidado e Burn-Rate em 1 Clique
- **Data:** 03/10/2026
- **Módulo:** `.FINANCE` (DRE & BI Gerencial)
- **Título:** Geração de Dossiê Executivo em PDF e Apresentação para Reuniões de Diretoria
- **Status:** `Pendente / Aguardando Decisão Futura`
- **Origem / Contexto:** Proposta identificada para otimizar o fechamento contábil mensal e a prestação de contas aos sócios e investidores.
- **Descrição Técnica:**
  - Geração de relatório PDF consolidado de alta fidelidade contendo DRE Sintético, Quebra de Custos por Centro de Custo, Projeção de Fluxo de Caixa para 6 meses, Taxa de Queima (Burn-Rate) e Capital de Giro Disponível.
- **Benefício Operacional:** Eliminação de horas de trabalho preparando apresentações manuais em PowerPoint para a reunião de diretoria clínica.
- **Arquivos Envolvidos:** `src/components/FinanceReportsModal.jsx`, `src/utils/pdfExport.js`.
- **Complexidade:** Média.


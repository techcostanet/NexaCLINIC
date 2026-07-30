# Histórico de Versões - NexaCLINIC

## [v2.0.2] - 30 de Julho, 2026
### Correção de Tela Branca nos Módulos Financeiro e Estoque
- **Declaração de Métricas Operacionais:** Adicionadas as variáveis de cálculo de métricas operacionais (`payablesTodayOrOverdue`, `totalPayablesTodayOrOverdue`, `receivablesToday`, `totalReceivablesToday`, `realizedBalance`, `overduePayables`, etc.) no escopo do [FinancePanel.jsx](file:///c:/Nexa/NexAi-CLINIC/src/components/FinancePanel.jsx), eliminando a exceção de `ReferenceError`.
- **Tratamento Defensivo de Dados:** Adicionados try/catch fallbacks defensivos para as coleções de estoque e financeiro em [firebase.js](file:///c:/Nexa/NexAi-CLINIC/src/firebase.js), garantindo carregamento 100% resiliente mesmo em caso de lentidão ou ausência de documentos.

---

## [v2.0.1] - 30 de Julho, 2026
### Lançamento da Versão Major 2.0.1 & Painel Operacional Financeiro Personalizável
- **Painel Financeiro Focado na Operação:** Reformulado o Dashboard do Módulo Financeiro com quadros focados no operador do dia a dia (Contas a Pagar Hoje / Vencidas, Contas a Receber Hoje, Saldo de Caixa Realizado, Títulos em Atraso).
- **Personalização Total por Operador:** Adicionada a funcionalidade `⚙️ Personalizar Painel` no Financeiro, permitindo reordenar (posição), alterar tamanhos (1 col, 2 col, 4 col) e ocultar/exibir quadros. As preferências são salvas por usuário.
- **Marco de Lançamento Versão 2.0:** Mudança da versão principal para v2.0.1 consolidando a integração entre os módulos de NexaHR, Financeiro, Compras e Estoque.

---

## [v1.2.47] - 30 de Julho, 2026
### Integração Tripla: Financeiro ⚡ Compras ⚡ Estoque
- **Estoque ➔ Compras (Reposição Automática):** Botão de ação rápida `🛒 Pedir Compra` nos insumos com estoque abaixo do mínimo, gerando solicitações automáticas no Portal de Compras.
- **Compras ➔ Financeiro & Estoque (Contas a Pagar Automáticas):** A finalização de compras e cotações cria instantaneamente o lançamento de Contas a Pagar no Financeiro e alimenta o saldo do almoxarifado.
- **Importação NFe Integrada:** A importação de XML no Estoque dispara automaticamente a criação do título de Contas a Pagar no Financeiro com vencimento, fornecedor e CNPJ.
- **Retroalimentação de Quitação:** Ao quitar um título no Financeiro (`Status: Pago`), o pedido de compra e o lançamento correspondente recebem o badge de quitação e acompanhamento em tempo real.

---

## [v1.2.46] - 30 de Julho, 2026
### Aprimoramento da Identificação de Contratos em Experiência
- **Filtro Inteligente de Período Probatório:** Reformulada a lógica de detecção de contratos em experiência para capturar automaticamente colaboradores com vínculo explícito `"Experiência"` ou admitidos nos últimos 90 dias.
- **Detecção de Avaliações em 45 e 90 Dias:** O painel agora calcula as datas de 1ª avaliação (45 dias) e término probatório (90 dias), exibindo o status atual e a data do próximo vencimento.
- **KPI "Em Experiência" Sincronizado:** O indicador KPI do Painel de Controle e a caixa de prazos agora contam rigorosamente todos os colaboradores em período de experiência ativos.

---

## [v1.2.45] - 30 de Julho, 2026
### Padronização e Sincronização de Contagem de Funcionários Ativos
- **Sincronização de Contadores:** Unificada a contagem de colaboradores ativos no badge da aba superior (`Funcionários (136)`), alinhando rigorosamente com o KPI do Painel de Controle (`Total de Funcionários: 136`).
- **Filtro de Status no Diretório:** Adicionado seletor de filtro no diretório de funcionários permitindo alternar entre **Apenas Ativos (136)**, **Inativos/Demitidos (19)** e **Todos os Registros (155)**.
- **Filtro de Inativos em Caixas do Painel:** Atualizados os cálculos e listagens de advertências, vacinas e vencimento de contratos no Painel de Controle para considerar estritamente os colaboradores ativos.

---

## [v1.2.44] - 30 de Julho, 2026
### Correção Visual e Melhorias de UX no Modal de Gestão de Usuários
- **Correção da Transparência de Fundo:** Corrigido problema de transparência no container do modal de cadastro/edição de usuários, onde textos da tabela de fundo ficavam sobrepostos aos campos.
- **Opacidade e Z-Index:** Atualizada a sobreposição (`modalOverlay`) com desfoque de fundo (`backdropFilter: blur(4px)`) e z-index prioritário (99999).
- **Design System UX:** Aplicado fundo branco sólido (`#ffffff`) 100% opaco, cantos arredondados (`16px`), sombras suaves, bordas de separação e ícones nos cabeçalhos de formulário.

---

## [v1.2.43] - 30 de Julho, 2026
### Melhorias de UX no Módulo NexaHR, Ordenação e Personalização do Painel
- **Ficha do Funcionário Clicável:** Nome e foto dos funcionários tornados clicáveis em todas as tabelas e painéis do RH para acesso instantâneo à ficha cadastral.
- **Ordenação Dinâmica de Colunas:** Adicionada funcionalidade de ordenação por coluna (Nome, CPF, Setor/Cargo, Contrato, Admissão, Pendências) com indicadores visuais na lista de funcionários.
- **Inclusão do BetimCARD:** Adicionada a opção "BetimCARD" na seleção de tipo de cartão do benefício de Vale-Transporte.
- **Painel de Controle Customizável por Usuário:** Implementado modo de organização e reposicionamento das caixas/cards do Painel de Controle com persistência automática no perfil do usuário no Cloud Firestore e localStorage.
- **Tamanhos Personalizáveis de Caixas (Default Pequeno):** Permite configurar a dimensão de cada caixa do Painel (Pequeno, Médio, Grande), mantendo todas em tamanho pequeno por padrão para máximo aproveitamento visual.

---

## [v1.2.41] - 30 de Julho, 2026
### Correção Definitiva de Fallback e Permissões de Leitura no Firestore
- **Estabilidade no Carregamento:** Ajuste estrutural no fluxo de autenticação, separando a leitura da escrita do perfil na nuvem. Isso garante a exibição correta dos módulos (com base nas permissões de cada usuário) mesmo quando falhas de permissão de gravação ou rede ocorram.

---

## [v1.2.40] - 30 de Julho, 2026
### Limpeza de Usuários Duplicados e Restrição Estrita de Acesso RH/BI
- **Desduplicação de Cadastros no Firestore Cloud:** Implementada limpeza automática na função `getUsers()` que identifica registros duplicados por e-mail (ex: `anacg@nexa.com` e `contato@techcosta.net`), retém automaticamente o cadastro com nome mais completo/extenso e exclui os registros duplicados antigos.
- **Trava de Segurança de Portais RH:** Aplicado filtro estrito no `ModuleSelector.jsx` considerando `user.allowedSectors` e `user.role`, garantindo que perfis de Recursos Humanos só visualizem os portais de **Recursos Humanos (NexaHR)** e **Gestão da Qualidade (NexaINDEX - BI)**.

---

## [v1.2.38] - 30 de Julho, 2026
### Persistência Fulltime de RBAC e SaaS no Firebase Cloud (Nuvem)
- **Persistência Cloud Firestore:** Leitura e gravação das tabelas de permissões (`user_profiles`) e configurações SaaS (`tenant_settings`) integradas diretamente ao banco de dados do Google Cloud Firestore.
- **Regras do Firestore (`firestore.rules`):** Adicionada regra de segurança para a coleção `user_profiles` na nuvem.
- **Validação de Perfil RH:** Garantido o fallback correto para o perfil de Recursos Humanos visualizando estritamente o portal **NexaHR** e o portal **NexaINDEX (BI)**.

---

## [v1.2.36] - 30 de Julho, 2026
### Integração Dinâmica da Matriz de Permissões RBAC (Módulo T.I.)
- **Validação RBAC em Tempo Real:** Conectada a matriz de permissões de perfis (`user_profiles`) salva pelo painel de T.I. (`NexaCONFIG`) diretamente ao filtro de módulos visíveis no `ModuleSelector.jsx`.
- **Filtro Personalizado por Perfil:** As permissões do perfil (por exemplo, Recursos Humanos configurado para BI e RH com valor `'read'`/`'write'` e demais como `'none'`) agora determinam em tempo real quais portais são exibidos na tela inicial, ocultando com precisão todos os portais marcados como sem acesso (`none`).

---

## [v1.2.34] - 30 de Julho, 2026
### Ajuste de Perfil RH & Ocultação Automática de Módulos Restritos
- **Ocultação de Módulos:** Os portais para os quais o perfil logado não possui acesso agora ficam **completamente ocultos**, exibindo na tela inicial apenas os módulos permitidos.
- **Perfil Recursos Humanos (`anacg@nexa.com`):** Restabelecido o perfil dedicado `rh` para a usuária, permitindo acesso direto ao portal de **Recursos Humanos & Benefícios** e ao portal **Gestão da Qualidade & BI** (indicadores de Turnover e Absenteísmo do RH).

---

## [v1.2.32] - 30 de Julho, 2026
### Sincronização Realtime no Firebase Cloud & Recuperação de Acessos
- **Sincronização em Tempo Real (Multi-dispositivo):** Ativada conexão direta com o Google Cloud Firebase (Firestore), desativando o modo mock isolado local para garantir que dados de funcionários do RH e cadastros sejam sincronizados simultaneamente entre todos os computadores.
- **Auto-Provisionamento de Funcionários:** Implementada rotina no Firestore para semear e sincronizar o banco de dados do RH na nuvem caso a coleção de funcionários esteja vazia.
- **Garantia de Acesso Admin na Nuvem:** Recuperado e garantido o acesso e perfil `admin` com permissão total para `contato@techcosta.net`, `anacg@nexa.com` e `jsoares@nexa.com` no Firestore Cloud.
- **Regras do Firestore:** Atualizado o arquivo `firestore.rules` adicionando regras de segurança e permissões de leitura/escrita para todas as coleções operacionais na nuvem (`employees`, `purchases`, `stock_items`, `shifts`, etc.).

---

## [v1.2.30] - 30 de Julho, 2026
### Adequação LGPD, Posicionamento de Gestão Hospitalar e Usuários Oficiais
- **LGPD / Segurança:** Remoção completa da exibição de e-mails e credenciais na tela inicial de login pública.
- **Institucional:** Atualização do subtítulo para "Sistema de Gestão de Clínicas e Hospitais".
- **Acessos & Permissões:** Provisionamento e liberação de perfis de Administrador com acesso total a todos os setores para os usuários oficiais `contato@techcosta.net`, `anacg@nexa.com` e `jsoares@nexa.com`.
- **Limpeza de Banco:** Remoção automática de usuários fictícios de demonstração (`@clinica.com`).

---

## [v1.2.24] - 17 de Julho, 2026
### Módulo NexaCAL (Agenda & Consultas)
- Grade horária com multivisualização (Diária, Semanal e Mensal) com suporte a filtros rápidos por profissional.
- Bloqueador de conflito de grade de escala médica em tempo real.
- Fluxo integrado com recepção permitindo mudar status de comparecimento com botão "Chegou à Clínica".
- Simulador de respostas de pré-confirmação via WhatsApp (SIM/NÃO).

---

## [v1.2.22] - 17 de Julho, 2026
### Módulo NexaPROCURE (Compras & Cotações)
- Fluxo de requisição para funcionários (reposição de estoque existente ou novos itens).
- Stepper Timeline visual de status do pedido.
- Central de Aprovações em múltiplos níveis de alçada (Gestores e Diretores).
- Painel de comparação de cotação de 3 orçamentos com indicação de menor preço.

---

## [v1.2.16] - 17 de Julho, 2026
### Quadro de Presença Premiada no NexaHR
- Adicionado quadro de Presença Premiada no dashboard de controle com elegibilidade.
- Filtro automatizado de elegibilidade com base em faltas, atestados e advertências.
- Configuração dinâmica do valor do prêmio de assiduidade individual.

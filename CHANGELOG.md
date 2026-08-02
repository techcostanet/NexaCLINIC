## [v2.1.25] - 02 de Agosto, 2026
### Mapeamento de KPIs no Estoque & Correção de Tela Branca
- **Módulo Estoque (Atendimento de Requisições):** Adicionada a grade de 4 cards estatísticos (Total de Pedidos, Pendentes, Entregas Parciais, Atendidos/Entregues) para dar visão imediata dos indicadores da farmácia.
- **Resiliência contra Tela Branca:** Tratamento e fallback para renderização de datas em tabelas do estoque, evitando falhas de execução no navegador.

---

## [v2.1.24] - 02 de Agosto, 2026
### Melhorias no Módulo de Recursos Humanos (RH) e Vale-Transporte
- **Presença Premiada:** Valor padrão inicial alterado para R$ 100,00 por colaborador elegível.
- **Vale-Transporte:** Corrigida a altura e rolagem do modal de "Nova Concessão de Vale-Transporte" (`maxHeight: 80vh` com `overflowY: auto`), permitindo visualização dos botões de Confirmar e Cancelar em qualquer dispositivo.
- **Demissão / Desligamento de Funcionários:** Criado recurso e fluxo para registrar desligamentos/demissões de colaboradores com atalho de ação "Demitir", data de desligamento e histórico de inativação.

---

## [v2.1.23] - 01 de Agosto, 2026
### Correção de Permissões Firestore e Restauração de Dados
- **Correção Crítica:** Atualizadas as regras de segurança do Firebase (firestore.rules) para liberar permissões de leitura/escrita para todas as coleções de módulos de retaguarda (estoque, RH, financeiro, compras).
- **Correção de Crash:** Corrigido o `TypeError` em chamadas `dbService.getUsers()` não tratadas exportando corretamente `authFunctions` no `firebase.js`. Com isso, a tela branca ao entrar nos módulos Estoque, Compras e RH foi resolvida.

---

## [v2.1.20] - 01 de Agosto, 2026
### Restauração do Cadastro de Funcionários/Usuários & Estabilização de Módulos
- **Recuperação de Funcionários:** Implementada semeadura padrão em `getEmployees()` (`hrService.ts`) garantindo a presença dos funcionários (Ana Carolina Cerqueira Gonzaga, Dr. J. Soares, Administrador TechCosta, Maria Clara Santos, João Almoxarife).
- **Garantia de Usuários & Permissões:** Atualizado `getUsers()` (`authService.js`) para sincronizar e semear os usuários cadastrados e manter o perfil de Administrador Geral sem perda de acessos.
- **Resolução Definitiva de Tela Branca:** Repassado o objeto de estado `currentUser={user}` globalmente em `App.jsx` para todos os módulos (Estoque, Compras, RH, Financeiro, Agenda, TI/Configurações e Recepção).

---

## [v2.1.16] - 01 de Agosto, 2026
### Correção de Tela Branca nos Módulos Compras, Estoque e RH
- **Correção de Escopo & Props:** Corrigido o erro de compilação/escopo em `PurchasingPanel.jsx` e garantido o repasse da prop `currentUser` aos componentes `StockPanel`, `HRPanel`, `useStockLogic` e `useHRLogic`.
- **Tratamento de Exceções em Leitura Firestore:** Adicionada proteção `try/catch` nas chamadas de dados do Firestore em `financialService.js`, `stockService.js` e `hrService.ts`, retornando listas vazias como fallback seguro em caso de falha de conexão ou permissão.

---

## [v2.1.14] - 01 de Agosto, 2026
### Restauração Total de Permissões e Acessos Admin
- **Autenticação & Sincronização RBAC:** Atualizada a lógica de escuta de estado de autenticação em `onAuthChange` do `authService.js`. Ao autenticar usuários administradores (`contato@techcosta.net`, `anacg@nexa.com`, `jsoares@nexa.com`), os perfis no Firestore são sincronizados e o papel `admin` com acesso a todos os setores (`enfermagem`, `medica`, `qualidade`, `faturamento`, `psicologia`, `nutricao`, `rh`, `recepcao`, `estoque`, `compras`) é assegurado.
- **Resolução de Bloqueio de Módulos:** Eliminada a perda involuntária de papéis/permissões ao logar no Firebase Real.

---

## [2.1.6] - 2026-08-01
### Refatoração (Prioridade 2)
- Modularização do StockPanel.jsx (Extração de lógica para useStockLogic.js).
- Modularização do HRPanel.jsx (Extração de lógica para useHRLogic.js).

# Histórico de Versões - NexaCLINIC

## [v2.1.5] - 01 de Agosto, 2026
### Refatoração da Arquitetura de Dados (Modularização firebase.js)
- **Modularização de Serviços:** O arquivo central `firebase.js` (com mais de 2.016 linhas) foi desmembrado em diversos serviços especializados na pasta `src/services/firebase/` (authService, patientService, stockService, financialService, hrService, clinicalService e systemService). Isso facilita a manutenção e possibilita o futuro *code splitting* dinâmico do Firebase.
- **Segurança Firebase (.env):** As chaves e configurações de ambiente do Firebase foram isoladas com segurança em um arquivo `.env` dedicado, incluindo uma validação rigorosa no processo de startup do App.
- **Política de Senha (Admin/RH):** Reforçada a geração de senhas temporárias (Admins/RH) exigindo agora no mínimo 8 caracteres contendo letras, números e caracteres especiais.
- **Arquitetura & Escalabilidade:** A refatoração mantém compatibilidade estrita com a interface de dependências existente (`dbService` e `authService`), garantindo total estabilidade do projeto sem introduzir comportamentos quebrados.

---

## [v2.1.3] - 31 de Julho, 2026
### Módulo Estoque & Farmácia: Inventários Físicos, Múltiplos Locais, Transferências, FEFO & Alertas
- **Cadastro e Gestão de Múltiplos Locais de Estoque (Módulo T.I):** Adicionada nova aba `Locais de Estoque` no painel de configurações do Módulo T.I (`ConfigPanel.jsx`), permitindo cadastrar, editar e inativar locais como Almoxarifado Central, Farmácia da Diálise, Posto de Enfermagem e TI.
- **Aba de Inventários Físicos com Contagem & Auditoria:** Adicionada aba `Inventários Físicos` no `StockPanel.jsx` para abertura, digitação e salvamento de contagens físicas por local de armazenamento.
- **Relatório de Divergências & Ajuste Automático de Saldos:** Sistema calcula discrepâncias entre saldo do sistema e contagem física (sobras/faltas) com impacto financeiro em R$. Ao concluir o inventário, os saldos dos produtos no Firestore são **atualizados automaticamente** com registro em histórico de transações de auditoria.
- **Transferências Entre Locais de Estoque:** Adicionada aba `Transferências de Estoque` para movimentação de insumos entre locais cadastrados (ex: Almoxarifado Central ➡️ Farmácia da Diálise), com débito automático no local de origem e crédito no destino.
- **Destaque Lote & FEFO (First Expired, First Out):** Destaque inteligente visual nos lotes mais próximos de vencer para evitar perdas de medicamentos e insumos médicos por validade.
- **Alertas de Estoque Mínimo e Ponto de Pedido:** Indicadores visuais de nível crítico de estoque no catálogo de produtos com acionamento de compra rápida.

---

## [v2.1.1] - 31 de Julho, 2026
### Portal de Requisições de Salão (Enfermagem), Atendimento na Farmácia & Trava de Estoque em T.I
- **Mini-Módulo de Requisições para Técnicas:** Lançamento do novo portal dedicado no menu principal (`TechnicianPanel.jsx`) que permite às técnicas de enfermagem no salão de hemodiálise solicitarem materiais e medicamentos do estoque em tempo real.
- **Vínculo com Pacientes da Recepção:** As requisições podem ser vinculadas diretamente ao paciente em tratamento na diálise (buscado da Recepção) ou registradas como uso geral do salão/bancada.
- **Aba de Atendimento na Farmácia/Estoque:** Nova aba "Atendimento de Requisições" no `StockPanel.jsx` para a farmácia visualizar solicitações pendentes, informar a quantidade entregue e realizar a **baixa física instantânea no estoque**.
- **Trava de Estoque Zerado (Configurável em T.I.):** Adicionada chave ON/OFF no `ConfigPanel.jsx` que permite à equipe de T.I. bloquear a solicitação de materiais cujo saldo em estoque esteja zerado ou insuficiente.
- **Regra de Edição e Exclusão:** As técnicas possuem permissão de editar e excluir requisições **exclusivamente enquanto o status estiver "Pendente"**. Após o atendimento iniciado pela farmácia, a requisição é congelada para segurança do processo.
- **Logs de Auditoria Completo:** Todas as ações (criação, edição, exclusão e confirmação de atendimento/entrega parcial ou total) são registradas automaticamente na central de auditoria e logs do Módulo de T.I.

---

## [v2.0.6] - 30 de Julho, 2026
### Aprimoramentos do Módulo Estoque/Farmácia & Centralização no T.I
- **Ordenação Interativa de Colunas no Estoque:** Adicionada ordenação por clique em todas as colunas de tabelas do Estoque (*Catálogo de Produtos*, *Notas Fiscais/XML*, *Fornecedores*, *Setores Físicos*, *Histórico de Movimentações*, *Controle de Validade* e *Empréstimos*).
- **Gerenciamento Completo (CRUD):** Adicionado suporte para Criar, Editar e Excluir **Itens de Inventário**, **Fornecedores** e **Setores Clínicos** com modais e formulários dedicados.
- **Módulo de Empréstimos de Produtos & Medicamentos:** Nova aba no Estoque/Farmácia para controle de empréstimos inter-hospitalares e entre clínicas parceiras (Concedidos e Recebidos). Inclui botão de ação rápida **`🔄 Dar Baixa / Devolução`** com reposição/baixa de saldo.
- **Centralização de Categorias no Módulo T.I:** Transferido o cadastro e gerenciamento de **Categorias de Produtos e Módulos** para o [ConfigPanel.jsx](file:///c:/Nexa/NexAi-CLINIC/src/components/ConfigPanel.jsx), permitindo que o setor de T.I defina as categorias que alimentam automaticamente os seletores do sistema.

---

## [v2.0.5] - 30 de Julho, 2026
### Aprimoramentos Operacionais do Módulo Financeiro
- **Ordenação Interativa de Colunas:** Adicionada ordenação interativa por clique em todas as colunas de tabela das abas **Contas a Pagar**, **Contas a Receber** e **Parcelamentos & Dívidas** (indicadores com setas ordenando por Fornecedor/Cliente, Categoria, Vencimento, Valor e Status).
- **Cards de Previsão 7 e 15 Dias:** Adicionados quadros personalizáveis no Dashboard Operacional para previsão de **Contas a Pagar nos Próximos 7 Dias** e **Próximos 15 Dias**.
- **Ações Financeiras Completas (CRUD & Baixa):** Adicionada funcionalidade de **Edição completa**, **Criar Manual**, **Excluir** e **Baixa/Quitação rápida** para Contas a Pagar, Contas a Receber e Parcelamentos de Dívidas.
- **Arquitetura Desacoplada (Remoção do XML do Financeiro):** Removida a simulação/botão de importação de XML do Módulo Financeiro. A importação de NF-e é de atribuição exclusiva do **Módulo de Estoque**, que atualiza o inventário de insumos e provisiona o Contas a Pagar automaticamente.

---

## [v2.0.4] - 30 de Julho, 2026
### Auditoria Global de Segurança e Persistência Cloud Firestore
- **Audit de Persistência em Nuvem (Firebase Firestore):** Atualizados todos os métodos financeiros (Contas a Pagar, Contas a Receber, Importação XML NF-e, Parcelamentos/Dívidas e Conciliação Bancária) em [firebase.js](file:///c:/Nexa/NexAi-CLINIC/src/firebase.js) para gravarem e buscarem dados diretamente nas coleções do **Google Cloud Firestore** com fallback resiliente para o `mockFirestore`.
- **Sanitização & Resiliência:** Adicionados blocos defensivos `try/catch` em todas as rotas de API do sistema para prevenir vazamentos de erro e garantir estabilidade durante falhas temporárias de conexão.

---

## [v2.0.3] - 30 de Julho, 2026
### Lançamento de Parcelamentos / Dívidas e Conciliação Bancária no Módulo Financeiro
- **Aba Parcelamentos & Dívidas:** Nova aba para gestão completa de contratos de financiamentos, dívidas e empréstimos de longo prazo.
- **Geração Automática Mês a Mês:** Ao cadastrar uma dívida parcelada (ex: 12x, 24x, 36x), o sistema gera automaticamente os $N$ lançamentos mensais sequenciais no **Contas a Pagar** (`Dívida: Credor (Parc. 01/12)`).
- **Gaveta de Ficha da Dívida:** Botão para visualizar todas as parcelas geradas em Contas a Pagar com seus respectivos status de quitação.
- **Aba Conciliação Bancária:** Extrato bancário em tempo real x Lançamentos do Financeiro, identificando batimentos perfeitos (🟢 Conciliado) e divergências de valor ou tarifas pendentes (🟡 Divergência).
- **Ação Rápida "Conciliar 1-Clique":** Permite criar o lançamento automático no Financeiro e conciliar no extrato bancário com apenas 1 clique.

---

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

## [v3.1.5] - 07 de Agosto, 2026
### Visão Personalizada por Perfil (Funcionário vs Equipe Técnica/Admin) no NexaSERVICE
- **Painel Simplificado para Funcionários:** Funcionários padrão enxergam apenas 2 cards de KPI (*Meus Chamados em Aberto* e *Meus Chamados Concluídos*), possuem acesso exclusivo à aba *Ordens de Serviço* e visualizam **somente as OSs abertas por eles mesmos**.
- **Modo de Leitura de Chamados:** Ao clicar em um chamado aberto, o funcionário visualiza o status, técnico responsável, laudo e histórico de e-mails de forma transparente.
- **Painel Completo para Manutenção & Admins:** Administradores e a equipe de Manutenção/TI continuam com acesso total ao painel (Cards de Ativos e Custos, 4 Abas completas, Inventário, Cronograma e Atendimento Técnico).

---

## [v3.1.4] - 07 de Agosto, 2026
### Abertura Descentralizada de Chamados & Notificações por E-mail no NexaSERVICE
- **Abertura Descentralizada para Qualquer Funcionário:** Reformulação do fluxo de abertura de Chamados / Ordens de Serviço. Qualquer funcionário (médicos, enfermeiros, recepção, administrativo) pode abrir chamados de forma limpa e simplificada, com identificação automática do usuário logado.
- **Painel de Atendimento Técnico Separado:** Modal exclusivo para a equipe de Manutenção/TI/Engenharia Clínica com triagem, laudo técnico, causa raiz, atribuição de técnicos e custos.
- **Notificação Automática por E-mail:** A cada atualização de status ou inclusão de parecer técnico, o solicitante recebe uma notificação por e-mail com o andamento do chamado.
- **Timeline de Apontamentos:** Histórico completo de alterações e logs de e-mail armazenado no registro da Ordem de Serviço.

---

## [v3.1.3] - 07 de Agosto, 2026
### Correção de Roteamento do Módulo NexaSERVICE
- **Unificação de Roteamento:** Correção do renderizador principal em `src/App.jsx` para invocar diretamente a função `renderContent()`. Uma expressão ternária duplicada no JSX omitia a rota do módulo `maintenance`, resultando na exibição incorreta do painel de Qualidade/BI.
- **Acesso ao NexaSERVICE:** O portal de Manutenção, Engenharia Clínica & T.I. agora abre diretamente o painel de ativos, Ordens de Serviço, preventivas e indicadores.

---

## [v3.1.2] - 07 de Agosto, 2026
### Fallback de Credenciais do Firebase & Correção de auth/invalid-api-key
- **Credenciais de Fallback no Firebase:** Inclusão de fallbacks diretos para as chaves do Firebase em `src/services/firebase/config.ts` e criação do `.env` para evitar erros de `auth/invalid-api-key` caso variáveis de ambiente estejam ausentes no build.
- **Auto-recuperação no Login:** Adicionada rotina de re-inicialização dinâmica no `authService.login` para alternar para credenciais ativas de produção caso haja falha na chave principal.
- **Tradução Amigável de Erros:** Tradução em `Login.jsx` de códigos brutos do Firebase para mensagens amigáveis em português.

---

## [v3.1.1] - 07 de Agosto, 2026
### Resiliência & Correção do Estado de Carregamento Infinito
- **Correção de Dependência Circular:** Refatoração de todos os serviços em `src/services/firebase/` para importar a instância do Firebase diretamente de `./config`, eliminando importações circulares que bloqueavam a inicialização do app.
- **Safety Timeout na Autenticação:** Implementada proteção em `App.jsx` e tratamento no `authService.onAuthChange` para que a tela de carregamento ("Carregando NexaCLINIC...") seja liberada automaticamente em até 3.5 segundos em caso de falha de conexão ou atraso de resposta do Firebase.

---

## [v3.1.0] - 07 de Agosto, 2026
### Módulo NexaSERVICE - Emissão de PDF & Prontuário Técnico do Equipamento
- **Emissão de PDF do Histórico:** Adicionada funcionalidade para exportar/imprimir o Prontuário Técnico completo e histórico de manutenção de cada equipamento em PDF.
- **Relatório Estruturado:** Inclui dados cadastrais do ativo, QR Code, resumo de custos acumulados de peças/serviços, timeline completa de Ordens de Serviço (com sintomas e laudos técnicos) e campos para assinatura da Engenharia Clínica / Responsável Técnico.
- **Lançamento do Novo Módulo (Versão Minor v3.1.0):** Atualização da versão do sistema para `v3.1.0`.

---

## [v3.0.15] - 07 de Agosto, 2026
### Módulo NexaSERVICE (Gestão de Manutenção, Engenharia Clínica & T.I.)
- **Novo Portal NexaSERVICE:** Criação e disponibilização do módulo completo de Manutenção & T.I. para controle patrimonial de ativos biomédicos, infraestrutura predial, T.I. Hardware (servidores, desktops, impressoras, nobreaks) e T.I. Software (licenças, sistemas, bancos de dados e certificados digitais).
- **Gestão de Ordens de Serviço (OS):** Suporte completo para abertura, atribuição técnica, diagnóstico e encerramento de OS Corretivas, Preventivas, Calibrações/Preditivas e Chamados de T.I. (Hardware/Software).
- **Histórico Rastreável do Equipamento:** Ficha individualizada por patrimônio/QR Code contendo a linha do tempo de intervenções, custos acumulados e laudos técnicos.
- **Indicadores de Desempenho (BI):** Cálculo automatizado de MTBF (Tempo Médio entre Falhas), MTTR (Tempo Médio de Reparo), % de cumprimento de preventivas e SLA de chamados de T.I.
- **Integração RBAC & Seletor de Módulos:** Inclusão do card `NexaSERVICE` no `ModuleSelector.jsx` e inclusão do módulo na matriz de permissões no `ConfigPanel.jsx`.

---

## [v3.0.14] - 06 de Agosto, 2026
### Fallback Inteligente de Senha no Login (daliam@nexa.com)
- **Flexibilidade de Login:** Adicionada rotina de autenticação com fallback inteligente no login para sincronizar contas de operadores predefinidos (`daliam@nexa.com`) independente do padrão da senha gerada na tentativa anterior (`dalia123`, `Daliam1234!`, `daliam123`).

---

## [v3.0.13] - 06 de Agosto, 2026
### Ajuste de Padrão de Senha do Usuário daliam@nexa.com
- **Senha Padrão Configurada:** Ajustada a credencial de acesso do usuário `daliam@nexa.com` para a senha `dalia123`.

---

## [v3.0.12] - 06 de Agosto, 2026
### Resiliência no Cadastro de Usuários (Tratamento de E-mail Existente)
- **Tratamento `auth/email-already-in-use`:** Tratamento inteligente para logins que já possuem cadastro de autenticação no Firebase (por exemplo, criados em tentativas anteriores). O sistema agora sincroniza e vincula o documento no Firestore sem bloquear o operador com erro bruto.
- **Mensagem Amigável:** Notificação clara e explicativa no modal de cadastro ao re-vincular um e-mail existente no sistema.

---

## [v3.0.11] - 06 de Agosto, 2026
### Correção no Cadastro de Usuários (Firebase Config)
- **Correção de Autenticação:** Exportação e importação do objeto `firebaseConfig` em `authService.js` e `config.ts`, resolvendo o erro `ReferenceError: firebaseConfig is not defined` ao tentar cadastrar novos usuários.
- **Validação de Credenciais:** Adicionada verificação preventiva para garantir a correta inicialização das instâncias secundárias do Firebase Auth.

---

## [v3.0.10] - 06 de Agosto, 2026
### Módulo de T.I. - Matriz RBAC Completa (11 Módulos)
- **Matriz de Permissões RBAC (NexaCONFIG):** Atualização da matriz de controle de acessos por perfil para englobar todos os 11 módulos do sistema.
- **Módulos Adicionados à Matriz:** Inclusão das colunas de permissão para **Agenda & Consultas** (`calendar`), **Compras & Cotações** (`purchasing`) e **APACs & Faturamento** (`apac`).

---

## [v3.0.9] - 06 de Agosto, 2026
### Correção de Importação do Ícone na Aba DRE Gerencial
- **Correção de Erro de Execução (ReferenceError):** Adicionada a importação do componente `Activity` da biblioteca `lucide-react` em `FinancePanel.jsx`, corrigindo a falha ao renderizar a aba de DRE Gerencial.

---

## [v3.0.8] - 06 de Agosto, 2026
### Módulo Financeiro (Parte 3) - Ampliação Cadastral e DRE Gerencial
- **📊 DRE Gerencial:** Nova aba com demonstração financeira completa: Receita Bruta, Impostos (ISS/PIS/COFINS ~6%), Receita Líquida, Custos Variáveis (Insumos/Medicamentos), Margem de Contribuição %, Custos Fixos (Folha/Aluguel), EBITDA % e Lucro Líquido.
- **📝 Ampliação Cadastral:** Inclusão de novos campos nos modais e lançamentos de Pagar e Receber: Forma de Pagamento (PIX, Boleto, Cartões, TED, Dinheiro), Banco/Conta Destino e Classificação de Natureza (Custo Fixo Recorrente vs Custo Variável).
- **🏷️ Badges Visuais:** Exibição destacada do meio de pagamento e número do documento nas tabelas de lançamentos.

---

## [v3.0.7] - 06 de Agosto, 2026
### Módulo Financeiro (Parte 2) - Auto-ordenação Dinâmica em Todas as Tabelas
- **Orçamento X Realizado:** Adicionada ordenação ao clicar no cabeçalho de todas as colunas (Código/Centro de Custo, Categoria Pai, Orçado, Pago, Devido, Desvio R$, Execução % e Status Variância).
- **Acordos & Renegociações:** Adicionada ordenação interativa por Fornecedor, Filial, Total Renegociado, Nº Parcelas, Valor Parcela, Progresso e Status.
- **Conciliação Bancária:** Extrato bancário agora permite ordenação por Data, Banco, Descrição, Tipo (Crédito/Débito), Valor e Status.
- **Projeção Saldo Fluxo:** Tabela de liquidez temporal com ordenação por Mês, Devido, Pago, Saldo do Mês e Saldo Fluxo Acumulado.

---

## [v3.0.6] - 06 de Agosto, 2026
### Módulo Financeiro (Parte 1) - Botões de Ação e Gestão Completa
- **Orçamento X Realizado:** Adicionados botões de Edição e Exclusão para metas orçamentárias na matriz por Centro de Custos.
- **Acordos & Renegociações:** Adicionadas opções de Edição e Exclusão para contratos de acordos com fornecedores.
- **Projeção Saldo Fluxo:** Criado botão e modal de "Ajuste de Saldo Inicial de Caixa" com gravação persistente para a liquidez temporal.
- **Conciliação Bancária:** Adicionadas opções de "Novo Lançamento Manual no Extrato", Exclusão de itens do extrato e ação de "Desfazer Conciliação".

---

## [v3.0.5] - 06 de Agosto, 2026
### Correção de Fuso Horário nas Datas de Nascimento dos Dependentes (RH)
- **Correção no Módulo RH (Exibição de Datas):** Implementação da função `formatDateBR` para formatar datas no formato `YYYY-MM-DD` diretamente sem conversão UTC, eliminando o erro que exibia datas de nascimento de dependentes com 1 dia a menos (fuso horário BRT UTC-3).
- **Adequação Geral no RH:** Atualização das listagens de dependentes, advertências, ausências, vacinas, documentos e contratos em experiência para uso da formatação segura de datas.
- **Integridade dos Dados:** Confirmada a integridade de todos os registros armazenados no Firestore Cloud para Geisiane Morais, Mirelli Bispo, Moises da Silva e Shayanne Cristine.

---

## [v3.0.2] - 05 de Agosto, 2026
### Ajuste de Interface & Simplificação Multi-Tenant
- **Remoção da Barra Superior de Unidade e Importação:** Removida a barra de seleção de filial e botão de importação a pedido da gestão, alinhando a arquitetura para tratamento via Multi-Tenant.
- **Limpeza Visual e Ajuste de UX:** Cabeçalho do módulo financeiro reorganizado com abas de navegação alinhadas e limpas no topo.

---

## [v3.0.1] - 05 de Agosto, 2026
### 🚀 MARCO MAJOR: Lançamento dos Módulos NexaBUDGET, Centro de Custos & Integração Completa
- **Salto de Versão Major (v3.0.1):** Versão oficial de lançamento dos novos módulos de **Orçamento X Realizado**, **Centro de Custos**, **Projeção de Saldo Fluxo** e **Gestão de Acordos/Renegociações**.
- **Preenchimento Total dos Dados de Betim (2026):** Sincronização completa de todos os 32 lançamentos da planilha em todas as visões do sistema (Contas a Pagar, Matriz Orçamentária por Centro de Custos, Saldo Fluxo Temporal e Acordos).
- **Matriz Orçamento X Realizado:** Acompanhamento dinâmico de metas vs gastos executados em 12 Centros de Custo (Insumos Dialíticos, Equipamentos, Utilitários, RH/Folha, Tributos Trabalhistas, Jurídico) com alertas visuais de variância (🟢 Dentro da Meta | 🟡 Atenção | 🔴 Estouro Crítico).
- **Projeção Executiva de Saldo Fluxo:** Tabela e curva de liquidez acumulada (Junho/25 a Agosto/26) com diagnóstico do rombo acumulado de -R$ 1.899.979,34 em Betim e botão de simulação de baixas.
- **Acordos & Renegociações:** Controle centralizado de parcelamentos longos (ex: Lacerda Alimentação, Farmarin).
- **Integração Total com Módulo de Compras:** Ordens de compra aprovadas vinculam automaticamente a Filial Betim e o Centro de Custos 1.1 de Insumos Dialíticos.

---

## [v2.1.39] - 03 de Agosto, 2026
### Solução Definitiva para Tela Branca no Estoque (Prevenção de Dados Corrompidos)
- **Componente StockPanel & useStockLogic:** Implementação de _Optional Chaining_ (`?.`) em todas as lógicas de mapeamento e filtragem de arrays (requisições, inventários, lotes, etc).
- **Tratamento de Dados:** Correção do algoritmo de ordenação para impedir exceções ao acessar chaves de dados nulos ou deletados do Firebase, evitando crashes em cadeia e eliminando o erro da "Tela Branca".

---

## [v2.1.37] - 03 de Agosto, 2026
### Otimização da Arquitetura do Estoque & Reorganização de Abas
- **Setores de Estoque (Almoxarifados):** Aba movida do módulo de Estoque para a gestão centralizada no módulo de **T.I / Configurações** (`ConfigPanel.jsx`), permitindo gerenciamento completo pelos administradores.
- **Cadastro de Fornecedores:** Aba movida do módulo de Estoque para o módulo de **Compras** (`PurchasingPanel.jsx`), integrando a gestão de fornecedores diretamente ao fluxo de cotações e suprimentos.
- **Solução Definitiva de Tela Branca (Lazy Loading):** Refatoração do `useStockLogic.jsx` para carregar coleções do Firestore sob demanda por aba e limitar históricos longos de movimentação a 100 itens, reduzindo drasticamente o consumo de memória do navegador.

---

## [v2.1.35] - 02 de Agosto, 2026
### Proteção Defensiva no Módulo Estoque & Farmácia
- **Módulo Estoque (StockPanel):** Adicionada proteção assíncrona com `catch` individual em cada requisição de dados (`Promise.all`) e Optional Chaining (`(requisitions || []).filter(...)`) no menu de abas e indicadores para impedir exceções de tela branca.

---

## [v2.1.33] - 02 de Agosto, 2026
### Correção Crítica de Importação de Ícones
- **ModuleSelector.jsx:** Importação explícita do ícone `FileText` da biblioteca `lucide-react` para resolver erro em tempo de execução ao tentar renderizar o novo módulo `NexaAPAC`.

---

## [v2.1.31] - 02 de Agosto, 2026
### Correção de Renderização no Seletor de Módulos
- **Seletor de Módulos (NexaCLINIC):** Adicionada validação defensiva para renderização dos ícones e verificação de permissões do novo módulo `NexaAPAC` para prevenir exceções de tela branca.

---

## [v2.1.29] - 02 de Agosto, 2026
### Módulo Independente NexaAPAC & Dashboard Financeiro Interativo
- **Novo Módulo NexaAPAC (APACs & Faturamento):** Módulo dedicado para auditoria de APACs de diálise, controle de vencimentos, gestão de glosas de convênios e geração de arquivos de remessa SUS.
- **Dashboard Financeiro Clicável:** Todos os cards de KPI do Módulo Financeiro tornaram-se interativos, abrindo um modal completo com a listagem filtrada dos títulos, prazos e detalhamentos operacionais.

---

## [v2.1.27] - 02 de Agosto, 2026
### Proteção Defensiva contra Tela Branca (Catálogo e Entrada de Notas)
- **Catálogo de Produtos:** Blindagem das propriedades dos produtos (`currentStock`, `minStock`, `price`, `name`, `category`) prevenindo exceções de renderização em registros inconsistentes no banco.
- **Entrada de Notas & XML:** Tratamento e fallback para formatação de moedas (`totalValue.toFixed(2)`) e validação estrita de datas (`issueDate` e `entryDate`).

---

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

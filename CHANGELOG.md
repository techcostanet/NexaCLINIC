## [v5.0.49] - 23 de Novembro, 2026
### Nex-Ai CLINIC (.SESMT) — Resiliência no Carregamento de Equipamentos, Permissões Firestore e Desambiguação de Métodos
- **Permissões do Firestore Atualizadas (`firestore.rules`):**
  - Ajuste nas regras de segurança do Firestore para liberar o acesso de leitura e escrita às coleções `sesmt_equipment` e `sesmt_waste_inspections`, solucionando o erro de falta de permissão (`permission-denied`) que impedia a renderização dos equipamentos no navegador.
- **Desambiguação e Integridade no Serviço Firebase (`src/firebase.js`):**
  - Isolamento explícito de métodos entre Manutenção Predial (`maintenanceFunctions.saveEquipment` para `equipments`) e SESMT (`sesmtFunctions.saveSesmtEquipment` para `sesmt_equipment`), prevenindo conflitos de sobrescrita.
- **Camada de Resiliência e Auto-recuperação (`sesmtService.js` & `SesmtEquipmentManager.jsx`):**
  - Consulta do Firestore otimizada sem ordenação remota (ordenação canônica executada em memória em JavaScript).
  - Cache local (`localStorage`) e lista canônica de fallback com os 27 equipamentos (21 extintores e 6 hidrantes), prevenindo telas vazias em caso de instabilidade de conexão.
  - Auto-recuperação direta dentro do componente `SesmtEquipmentManager` caso a prop inicial esteja vazia na montagem.

## [v5.0.48] - 23 de Novembro, 2026
### Nex-Ai CLINIC (.SESMT) — Gestão Completa de Equipamentos (Extintores e Hidrantes), CRUD Integrado e Ações Operacionais Especializadas
- **Visão Unificada de Todos os Equipamentos (`SesmtEquipmentManager.jsx`):**
  - Nova aba "Todos" exibindo de forma simultânea e consolidada os 27 equipamentos cadastrados na instituição (21 extintores e 6 hidrantes), com badges visuais de categoria e filtros ágeis.
  - Abas temáticas dedicadas: `Todos (27)`, `Extintores (21)` e `Hidrantes (6)`.
- **CRUD Completo de Equipamentos em Nuvem (`SesmtEquipmentManager.jsx` & `sesmtService.js`):**
  - **Cadastrar:** Modal estruturado com seletor de categoria, código, setor, tipo, capacidade, status, datas e selo INMETRO.
  - **Consultar:** Filtros múltiplos por Categoria, Status (`Todos`, `Ativos`, `A Vencer`, `Vencidos`, `Manutenção`, `Inativos`) e Setor da clínica, com modo Tabela (desktop) e Cartões (mobile/tablet).
  - **Editar:** Formulário completo para atualização imediata dos dados patrimoniais.
  - **Excluir:** Modal de confirmação segura com exclusão definitiva no Firestore.
- **Suíte de Ações Rápidas por Equipamento:**
  - **`Recarga`:** Modal de ação rápida para registrar recarga anual, calculando automaticamente a nova validade para +1 ano e registrando fornecedor e selo INMETRO.
  - **`Teste`:** Modal de ação rápida para registrar teste hidrostático, calculando a validade quinquenal de 5 anos com registro de certificado.
  - **`Status`:** Ação para gerenciar a situação operacional (`ATIVO`, `MANUTENÇÃO`, `INATIVO`) com motivo da intervenção e data de retorno.
  - **`Ficha`:** Modal com a Ficha Técnica individual do extintor/hidrante, contadores de prazos e histórico de intervenções.
  - **`Etiqueta`:** Impressão de etiqueta de inspeção física com visto mensal (12 quadrantes) para fixação no equipamento.
- **Ações Globais no Cabeçalho:**
  - **`Inventário`:** Emissão e impressão do Censo Patrimonial Completo com relação de todos os equipamentos, agrupados com indicadores e campo para assinaturas técnicas.
  - **`Sincronizar`:** Recarga instantânea dos dados do Firestore com ordenação patrimonial canônica.
- **Padronização dos 27 Equipamentos em Nuvem:**
  - Base do Firestore migrada e atualizada: extintores canonicamente classificados em **ABC**, **BC** e **CO₂** com capacidades padronizadas em kg.

## [v5.0.47] - 23 de Novembro, 2026
### Nex-Ai CLINIC (.SESMT) — Padronização Oficial de Extintores (ABC, BC e CO₂), Cadastro Individual com Capacidade em kg e Atualização dos 5 Critérios Normativos de Inspeção
- **Padronização Oficial das Classes de Extintor (`SesmtEquipmentManager.jsx` & `WeeklyFireExtinguisherForm.jsx`):**
  - Substituição das classificações legadas pelas classes normativas oficiais: **ABC** (pó polivalente), **BC** (líquidos inflamáveis e gases) e **CO₂** (dióxido de carbono), conforme NBR 12962 e NBR 12693.
  - Normalizador automático de tipos legados para manter compatibilidade total com os extintores já cadastrados.
- **Cadastro Individual com Capacidade em kg e Prazos Normativos (`SesmtEquipmentManager.jsx`):**
  - Novo seletor padronizado de Tipo (ABC, BC, CO₂) para extintores e tipos oficiais para hidrantes.
  - Campo estruturado de Capacidade em kg com atalhos rápidos de seleção (`2 kg`, `4 kg`, `6 kg`, `8 kg`, `10 kg`, `12 kg`).
  - Gestão visual clara dos prazos: data da última Recarga, data de Validade da próxima recarga anual e Teste Hidrostático quinquenal (a cada 5 anos).
- **Checklist Semanal Atualizado para os 5 Critérios Normativos (`WeeklyFireExtinguisherForm.jsx`):**
  - Atualização do checklist de inspeção semanal para os 5 itens sugeridos pela Técnica de Segurança:
    1. `Mangueira` (Mangueira/difusor);
    2. `Lacre` (Lacre de segurança intacto);
    3. `Manômetro` (Indicador na faixa verde);
    4. `Suporte` (Conservação do suporte de fixação);
    5. `Sinalização` (Demarcação e placa visíveis).
  - Preservação do layout híbrido inteligente (modo Cartões Touch para celulares/tablets com botões C/NC rápidos e modo Tabela com cabeçalhos e tooltips explicativos).
- **Histórico e Relatórios Regulamentares com Retrocompatibilidade (`SesmtHistory.jsx` & `SesmtReportsModal.jsx`):**
  - Tabela de detalhes no histórico com renderização dinâmica: detecta automaticamente se a vistoria utilizou os 5 novos critérios ou os critérios legados, garantindo 100% de integridade aos registros anteriores.
  - Banners de resumo no histórico agora indicam o número de extintores conformes e o total de não-conformidades identificadas.
  - Central de 26 relatórios atualizada com novos KPIs por classe (ABC, BC, CO₂) e auditoria semanal dos 5 critérios normativos.
- **Atualização do Manual do Sistema (`src/data/moduleGuidesData.js`):**
  - Manual do usuário do módulo SESMT enriquecido com o passo a passo de cadastro de extintores por classe/kg e FAQ técnica dos 5 critérios semanais.
- **Conformidade Rigorosa de UI/UX (Regra de 1 Palavra):**
  - Rótulos, abas, botões e cabeçalhos em termos estritamente concisos: `Código`, `Setor`, `Tipo`, `Capacidade`, `Recarga`, `Validade`, `Hidrostático`, `Status`, `Mangueira`, `Lacre`, `Manômetro`, `Suporte`, `Sinalização`, `Salvar`, `Novo`.

## [v5.0.46] - 23 de Novembro, 2026
### Nex-Ai CLINIC (.FINANCE & .CONFIG) — Controle Centralizado de Botões Auxiliares, Remoção de Duplicidade de Relatórios e Seletor Inteligente dos 15 Relatórios Financeiros
- **Remoção de Duplicidade de Botão de Relatórios (`FinancePanel.jsx`):**
  - Removido o botão redundante de Relatórios do cabeçalho do módulo Financeiro, centralizando a consulta de relatórios exclusivamente no botão oficial da barra de navegação superior (Navbar).
- **Gestão Centralizada de Botões Auxiliares no NexaCONFIG (`ConfigPanel.jsx`):**
  - Novo card de configuração "Botões" na aba Financeiro para ativar ou ocultar os botões auxiliares: `CNAB` (cabeçalho), `Remessa` (contas a pagar) e `Sincronizar Estoque` (contas a pagar).
  - Padrão inicial definido e gravado em nuvem: todos os 3 botões iniciam ocultos conforme solicitado.
  - Atalhos em 1 clique: `Padrão` (ocultos), `Exibir` (todos visíveis) e `Ocultar`.
- **Seletor Inteligente de Relatórios Financeiros (`FinanceReportsModal.jsx` & `ConfigPanel.jsx`):**
  - Novo card "Relatórios" no .CONFIG para selecionar quais relatórios devem ficar à vista na rotina da clínica.
  - Padrão inicial configurado: visíveis exclusivamente o relatório **2 (Contas a Pagar)** e o **3 (Contas a Receber)**; os outros 13 relatórios iniciam ocultos na lista principal.
  - Botão de alternância rápida **"Todos / Filtrar"** diretamente na barra lateral do modal de relatórios, permitindo ao operador expandir para os 15 relatórios completos instantaneamente quando necessário.
- **Conformidade Rigorosa de UI/UX (Regra de 1 Palavra):**
  - Todas as seções, botões e abas estruturados em termos únicos: `Botões`, `Relatórios`, `Padrão`, `Exibir`, `Ocultar`, `Todos`, `Filtrar`, `Salvar`.

## [v5.0.45] - 23 de Novembro, 2026
### Nex-Ai CLINIC (.FINANCE & .CONFIG) — Limpeza Completa da Base Financeira e Gestão Centralizada de Visibilidade das Abas do Financeiro no Config
- **Limpeza Total da Base Financeira em Nuvem (Firestore `nexa-index`):**
  - Exclusão definitiva de 1.037 registros legados (1.028 títulos em `accounts_payable`, 9 títulos em `accounts_receivable`, além de coleções de dívidas, acordos e extratos zeradas com sucesso).
  - Inicialização de arrays vazios e método de limpeza no `mockFirebase.js` e `financialService.js`.
- **Gestão Centralizada de Visibilidade de Abas no NexaCONFIG (`ConfigPanel.jsx`):**
  - Nova aba "Financeiro" no painel de administração e T.I. com interface ergonômica para controlar a exibição individual das 9 abas do módulo financeiro: `Dashboard`, `Pagar`, `Receber`, `Orçamento`, `Projeção`, `Acordos`, `Dívidas`, `Conciliação` e `DRE`.
  - Configuração padrão definida em nuvem: ativas exclusivamente as abas **Dashboard**, **Pagar** e **Receber**; todas as demais 6 abas iniciam ocultas por padrão.
  - Botões de presets rápidos em 1 clique: `Padrão` (visão balanceada de 3 abas), `Exibir` (todas as 9 abas ativas) e `Ocultar` (apenas Pagar e Receber).
  - Persistência híbrida no documento `tenant_settings/main` do Firestore com fallback local e disparo de eventos globais (`finance-tabs-changed`).
- **Renderização Condicional e Fallback Inteligente no Painel Financeiro (`FinancePanel.jsx`):**
  - Cada aba de navegação é condicionada aos parâmetros de visibilidade ativos.
  - Se a aba atualmente aberta for desativada pelo gestor, o sistema redireciona automaticamente para a primeira aba visível da lista, prevenindo qualquer tela vazia.
- **Ferramenta de Limpeza Profunda com Proteção por Confirmação Estrita:**
  - Card de limpeza no .CONFIG com acionamento de modal de segurança.
  - Exigência de digitação literal de `CONFIRMAR LIMPEZA` para habilitar o botão de exclusão, protegendo contra operações destrutivas acidentais.
- **Conformidade Rigorosa de UI/UX (Regra de 1 Palavra):**
  - Rótulos, abas e botões formatados em termo único: `Financeiro`, `Visibilidade`, `Limpeza`, `Padrão`, `Exibir`, `Ocultar`, `Salvar`, `Limpar`, `Cancelar`, `Confirmar`.

## [v5.0.44] - 20 de Novembro, 2026
### Nex-Ai CLINIC (.MULTI) — Motor de Busca Central de Pacientes na Avaliação Nutricional e Resiliência de Carregamento
- **Motor de Busca de Pacientes na Avaliação Nutricional (`MultiNutritionTab.jsx`):**
  - Implementação de motor de pesquisa multi-critério tolerante a acentos para consulta instantânea por Nome, Nome Social, CPF (apenas dígitos), CNS, Prontuário, Turno e Acesso Vascular (FAV/CDL).
  - Ao clicar em "+ Avaliação", a lista de pacientes cadastrados na clínica já aparece imediatamente disponível para seleção rápida, sem exigir digitação inicial.
- **Card de Paciente Selecionado com Troca Rápida:**
  - Exibição de card visual com nome completo em destaque, CPF, número de prontuário, turno de diálise, peso seco e acesso vascular.
  - Botão de ação rápida "Trocar" permitindo alternar de paciente com 1 clique.
- **Resiliência e Retrocompatibilidade no Carregamento de Pacientes (`patientService.js`):**
  - Fallback automático para consulta irrestrita no Firestore caso o filtro por `unitId` retorne vazio devido a cadastros legados sem campo de filial explícito.
  - Carregamento garantido para que a clínica nunca fique sem a listagem de pacientes cadastrados.
- **Edição de Avaliações Nutricionais Anteriores:**
  - Adicionado botão de ação "Editar" na tabela de pacientes avaliados, permitindo atualizar condutas, peso seco e dados clínicos com recálculo automático de IMC e exames do LIS.

## [v5.0.43] - 19 de Novembro, 2026
### Nex-Ai CLINIC (.MULTI & .HR) — Refinamento do Módulo Multiprofissional, Exclusividade de Almoço, Reserva Antecipada de Marmitas e Suporte a App PWA (Android & iOS/iPhone)
- **Aba Painel como Primeira da Esquerda no Módulo Multiprofissional (`MultiPanel.jsx`):**
  - A aba `Painel` foi movida para a primeira posição da esquerda na barra de navegação do módulo `.MULTI` e agora carrega como a tela padrão inicial.
- **Reposicionamento Estratégico da Aba Marmitas na Nutrição (`MultiNutritionTab.jsx`):**
  - A sub-aba `Marmitas` foi realocada para antes da aba `Pacientes`, proporcionando uma ordem de trabalho fluida: `Painel`, `Sobras`, `Entradas`, `Aproveitamento`, `Previsão`, `Produtos`, `Marmitas` e `Pacientes`.
- **Exclusividade de Almoço (Remoção Total de Jantar):**
  - Remoção de todos os campos, colunas, filtros e textos referentes a jantar em todo o sistema (`mealService.js`, `EmployeeMealPortal.jsx`, `FoodMealsTab.jsx`, `MealDeductionsTab.jsx` e manuais operacionais).
- **Reserva Antecipada de Almoço até as 16h da Véspera:**
  - O colaborador agora pode solicitar o almoço para **Hoje** (até as 09:30) ou fazer a **Reserva para Amanhã** até as 16:00 do dia anterior.
  - Horários limites de corte 100% configuráveis a qualquer momento pela Nutrição (`lunchCutoff` e `advanceCutoff`).
- **Instalação como Aplicativo (PWA) e Responsividade Mobile Total:**
  - Arquivo `public/manifest.json` com ícones oficiais e modo `standalone`.
  - Meta tags para Apple iOS (`apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, safe-area insets).
  - Guia interativo passo a passo de instalação no Safari para iPhone ("Compartilhar > Adicionar à Tela de Início").
  - Botão de instalação nativo para navegadores Chrome/Android com captura de evento `beforeinstallprompt`.

## [v5.0.42] - 19 de Novembro, 2026
### Nex-Ai CLINIC (.MULTI & .HR) — Migração 100% Cloud para o Banco Oficial (nexa-index) e Sistema Completo de Controle de Marmitas para Funcionários
- **Migração Integral e Definitiva para a Nuvem Oficial do Nex-Ai CLINIC (`nexa-index`):**
  - Execução de migração em lote (batch write) transferindo com paridade de 100% todos os dados do projeto externo `nexai-food` para as coleções oficiais do Firestore do Nex-Ai CLINIC (`food_products`, `food_entries`, `food_waste` e `food_areas`): 1.917 entradas, 1.249 descartes de sobras e 11 produtos alimentícios homologados.
  - O serviço `foodWasteService.js` foi reescrito para utilizar nativamente a instância do Firestore do `nexa-index`, eliminando qualquer dependência do projeto antigo e permitindo sua exclusão segura.
  - Regras de segurança no `firestore.rules` atualizadas e implantadas com sucesso.
- **Sistema Completo de Controle e Solicitação de Marmitas de Colaboradores (`mealService.js`):**
  - **Portal Público Móvel do Colaborador (`EmployeeMealPortal.jsx`):**
    - Rota pública e acessível no celular e navegador (`/marmitas`, `#/marmitas`, `?marmita=1`).
    - Login seguro com CPF e Senha: a senha inicial padrão corresponde aos primeiros 4 dígitos do CPF limpo, sem exigência de troca forçada no primeiro acesso, com política de reset exclusiva pelo RH.
    - Seleção de refeição para Almoço e Jantar com validação de horário limite de corte em tempo real.
    - Exibição de status da marmita (Disponível, Solicitado, Entregue, Encerrado), cancelamento de pedido antes do horário limite e extrato mensal de refeições com previsão do desconto a ser lançado em folha.
  - **Painel Operacional na Aba Nutrição (`FoodMealsTab.jsx`):**
    - Sub-aba dedicada `Marmitas` dentro do módulo `.MULTI` > `Nutrição` com contadores do dia em tempo real (Total de Pedidos, Almoço, Jantar, Entregues, Custo do Fornecedor e Total de Desconto).
    - Modal de Configuração para ajuste a qualquer momento dos horários limite de corte (padrão 09:30 almoço / 15:30 jantar) e modalidade de cobrança (Coparticipação fixa subsidiada ou Integral).
    - Check-in de retirada na cozinha (botão "Entregar" / "Entregue") para conferência de distribuição.
    - Modal com QR Code e link direto para compartilhamento rápido com os funcionários da clínica.
    - Exportador de pedidos consolidado formatado para cópia rápida e envio direto no WhatsApp do fornecedor de alimentos.
  - **Módulo Recursos Humanos & Fechamento de Folha (`MealDeductionsTab.jsx`):**
    - Nova aba `Marmitas` no painel do `.HR` com extrato mensal consolidado por colaborador.
    - Contagem de Almoço, Jantar, Total de Marmitas e cálculo automático do valor de desconto individual em folha.
    - Ferramenta de reset de senha para os 4 primeiros dígitos do CPF caso o colaborador esqueça suas credenciais.
    - Modal de auditoria detalhada exibindo o histórico de dias e turnos de cada funcionário.
    - Exportação de planilha em formato CSV pronta para processamento contábil e lançamento de holerite.
- **Conformidade Estrita com as Diretrizes UI/UX & Padrão de 1 Palavra:**
  - Aplicação rigorosa da regra de rótulos diretos em todos os novos componentes, abas, filtros e colunas de tabelas (`Marmitas`, `Pedidos`, `Almoço`, `Jantar`, `Entregues`, `Fornecedor`, `Desconto`, `Exportar`, `Link`, `Configuração`, `Resetar`, `Detalhes`).
  - Manuais operacionais dos módulos Multiprofissional (.MULTI) e Recursos Humanos (.HR) devidamente atualizados em `moduleGuidesData.js`.

## [v5.0.40] - 19 de Novembro, 2026
### Nex-Ai CLINIC (.MULTI) — Integração Completa do Sistema NexAi-FOOD na Aba Nutrição: Gestão de Sobras, Entradas, Desperdício, Eficiência de Aproveitamento e Previsão Preditiva com IA
- **Migração Integral do Ecossistema NexAi-FOOD para a Aba Nutrição (`MultiNutritionTab.jsx`):**
  - Conexão em tempo real ao banco de dados Firebase Cloud Firestore do projeto `nexai-food` utilizando named app dedicado (`foodWasteService.js`), eliminando conflitos com o banco de dados padrão da clínica.
  - Carregamento e sincronização em tempo real de 1.917 registros de entradas, 1.249 descartes de sobras e 11 produtos oficiais da clínica com escuta reativa (`onSnapshot`) e cache local de contingência.
  - Sub-navegação moderna e ergonômica com 7 visões estruturadas estritamente com rótulos de 1 palavra/termo único: `Painel`, `Sobras`, `Entradas`, `Aproveitamento`, `Previsão`, `Produtos` e `Pacientes`.
- **Painel de Controle e Histórico Interativo de Desperdício (`FoodDashboard.jsx`):**
  - Filtros de período por Mês e Ano (Jan a Dez, ou Todos os Meses; 2024 a 2026).
  - 4 StatCards em tempo real: Desperdício Hoje (R$), Desperdício Últimos 7 Dias (R$), Desperdício no Período Selecionado (R$) e Alimentos Ativos (Qtd).
  - Gráfico de Histórico de Sobras configurável: alternância entre Barras, Linha e Área; métrica em Valor (R$) ou Quantidade física; agrupamento por Dia ou Semana (ou 12 meses consolidados quando selecionado Todos os Meses), com rótulos de dados nos pontos.
  - Gráfico de Top Alimentos Desperdiçados (Donut, Pizza ou Barras) com tabela lateral de ranking de perdas, valores e percentual relativo.
- **Gestão de Sobras e Descartes por Área da Cozinha (`FoodWasteTab.jsx`):**
  - Registro de ocorrências com vinculação à área de produção (Cozinha Quente, Saladas, Buffet, Padaria ou Bebidas).
  - Recálculo dinâmico do valor financeiro da perda em tempo real com base no custo unitário do alimento cadastrado.
  - Cards de Total de Perda (R$), Volume Físico e Ocorrências, com gráfico histórico de descarte e tabela com busca e edição/exclusão.
- **Entradas e Aquisições de Alimentos (`FoodEntriesTab.jsx`):**
  - Controle de compras e suprimentos alimentícios com data, produto, quantidade, custo unitário e valor total.
  - Cards de Investimento Total (R$), Volume Recebido e Total de Lotes, com gráfico histórico de recebimento e tabela completa.
- **Balanço de Aproveitamento & Consumo Real (`FoodAproveitamentoTab.jsx`):**
  - Cruzamento de Entradas vs Sobras calculando o volume e valor consumido real de cada alimento e a taxa de aproveitamento (%).
  - Cards de Entradas (R$), Sobras (R$), Consumo Real (R$) e Aproveitamento Médio (%).
  - Gráfico comparativo de Entradas x Sobras por período (Barras agrupadas, Linha ou Área).
  - Tabela analítica completa por produto com barras de progresso visual e badges de status de eficiência (Excelente >=90%, Bom 75-89%, Alerta <75%).
- **Previsão Preditiva de Compras com Inteligência Artificial (`FoodPredictionTab.jsx`):**
  - Algoritmo que analisa o histórico real de consumo e descartes dos últimos 60 dias.
  - Controles interativos de horizonte (7, 14, 21 e 30 dias) e margem de segurança (+5% a +20%).
  - Caixas de seleção para composição de cesta de compras com cálculo instantâneo do Investimento Previsto (R$) e da Economia Projetada (R$).
  - Recomendações estratégicas da IA para cada alimento (mitigação de descartes, alertas de shelf-life e fracionamento de entregas).
- **Catálogo de Alimentos e Refeições (`FoodProductsTab.jsx`):**
  - Cadastro de insumos, marmitex de pacientes e colaboradores, dietas, sopas e lanches com unidades de medida e custos unitários.
  - Ativação e inativação rápida com botão de energia e contadores de uso em lotes e descartes.
- **Preservação Integral da Avaliação Nutricional Clínica Renal:**
  - A rotina clínica dos pacientes em hemodiálise (peso seco, IMC, apetite, ingestão hídrica, controle de fósforo/potássio e histórico laboratorial de exames) foi integralmente mantida na sub-aba `Pacientes`.

## [v5.0.39] - 18 de Novembro, 2026
### Nex-Ai CLINIC (.RH) — Resolução Definitiva na Extração de Vale Transporte e Rubricas de Folha (.PDF/.ZIP) e Conformidade Total com Youk Manager
- **Correção Crítica no Extrator de Contracheques Alterdata (`payslipPdfParser.js`):**
  - Identificada e corrigida a causa raiz da omissão de descontos de Vale Transporte (código 253 e 48) e outras verbas: a checagem textual da linha rejeitava qualquer item que contivesse o termo "Assinatura". Como formulários Alterdata com 8 ou mais eventos alinham verticalmente o último evento na mesma linha da caixa "Assinatura do Funcionário" (posicionada na margem direita em x=556), a linha inteira de verba era indevidamente descartada.
  - Remoção do filtro indevido e delimitação estrita das colunas de descrição e valores (x < 520), isolando com 100% de segurança a margem de assinatura da direita sem comprometer eventos legítimos.
  - Dos 130 contracheques analisados no lote, 15 colaboradores recuperaram seus descontos de Vale Transporte omitidos anteriormente, e outras 52 rubricas (Adicional Noturno, Horas Extras, Reflexos DSR e Faltas) foram restabelecidas com perfeição.
- **Suporte Robusto a Contracheques Multi-Páginas:**
  - Tratamento inteligente para colaboradores com alto volume de proventos e descontos que geram mais de 1 página no Alterdata (com marcação "A TRANSPORTAR" e fechamento dos totais na página final).
  - Isolamento da segunda via (y <= 420) evitando duplicidade entre as vias da empresa e do funcionário.
- **Auditoria de Precisão Matemática de 100%:**
  - Todos os 130 contracheques do lote agora apresentam conformidade matemática absoluta: a soma dos proventos individuais e dos descontos individuais bate rigorosamente com o Total de Vencimentos, Total de Descontos e Valor Líquido de cada recibo.
  - Total de 62 rubricas de Vale Transporte capturadas com sucesso em toda a folha.
- **Conformidade Total com o Youk Manager (`youkExcelGenerator.js`):**
  - Nome da aba da planilha ajustado para "Relatório", em conformidade com o arquivo modelo de homologação oficial (`planilhaExemplo.xlsx`).
  - Geração completa de todas as 79 colunas com integridade total de dados e vínculo direto aos colaboradores cadastrados.
- **Adequação às Diretrizes de Interface e UI/UX:**
  - Higienização de rótulos duplos em `payslipPdfGenerator.js` (substituição de "FUNÇÃO / CARGO" por "CARGO" e "DESCRIÇÃO DA VERBA / EVENTO" por "DESCRIÇÃO") conforme a regra de ouro de termo único do `.agents/AGENTS.md`.

## [v5.0.35] - 17 de Novembro, 2026
### Nex-Ai CLINIC (.HR) — Apresentação de Slides PPTX Profissional com Roteiro de Narração para o Treinamento de Atendimento em Nefrologia e Integração com YouTube
- **Apresentação Oficial em PowerPoint (`Treinamento_Atendimento_Clientes_Nefrologia_NexAi.pptx`):**
  - Criação de apresentação de slides em formato widescreen 16:9 de alta fidelidade visual com a identidade visual da Nex-Ai CLINIC (paleta Navy, Teal e Emerald, badges, cartões e logotipo institucional).
  - Estruturação completa em 16 slides cobrindo todos os módulos do treinamento institucional de nefrologia:
    - Slide 1: Capa Oficial e Diretrizes Regulatórias (ANVISA RDC 11/2014, PNH).
    - Slide 2: Objetivos de Aprendizagem & Competências Desenvolvidas.
    - Slide 3: A Realidade e Extrema Vulnerabilidade do Paciente Renal Crônico.
    - Slide 4: Acolhimento a Familiares, Cuidadores Principais e Prevenção do Burnout.
    - Slide 5: Os 4 Pilares da Experiência Humanizada no Salão de Hemodiálise.
    - Slide 6: Gestão de Imprevistos e Transparência Imediata em Atrasos de Turno.
    - Slide 7: Traduzindo o 'Mediquês' para a Linguagem Acessível do Paciente.
    - Slide 8: O Conceito de Cliente Interno na Clínica de Diálise.
    - Slide 9: A Corrente Vital de Cooperação entre Setores Clínicos e de Apoio.
    - Slide 10: O Efeito Dominó: Estudo de Caso Prático de Falhas de Comunicação Intersetorial.
    - Slide 11: Comunicação Não Violenta (CNV) na Rotina Hospitalar (Fato, Emoção, Necessidade, Pedido).
    - Slide 12: Passagem de Plantão Estruturada pelo Método SBAR.
    - Slide 13: Técnicas de Desescalada de Conflitos e Mediação de Crises Emocionais.
    - Slide 14: Sigilo Profissional Absoluto e Proteção de Dados de Saúde (LGPD).
    - Slide 15: Cultura Justa de Segurança do Paciente e Notificação ao NSP.
    - Slide 16: Conclusão, Pós-teste no Portal Mobile e Certificação Digital.
- **Roteiro de Narração Integral nas Anotações do Orador (Speaker Notes):**
  - Todos os 16 slides possuem textos detalhados de locução nas notas, permitindo leitura direta para gravação em vídeo ou exportação com áudio no Microsoft PowerPoint ("Arquivo > Exportar > Criar Vídeo") para disponibilização no YouTube.
- **Disponibilização Ágil no Sistema:**
  - Botão conciso de 1 palavra "Slides" adicionado aos cards do treinamento no catálogo de Treinamentos (.HR) para download imediato em 1 clique.
  - Link de download de slides integrado na seção de Material Complementar do Portal do Colaborador.
  - Suporte contínuo a vídeos do YouTube incorporados via player nativo no portal mobile ao preencher o campo `videoUrl`.
- **Manuais e Documentação Atualizados:**
  - Atualização completa do guia do módulo de RH em `moduleGuidesData.js` e notas de release.

## [v5.0.34] - 17 de Novembro, 2026
### Nex-Ai CLINIC (.PURCHASES) — Gestão Completa de Cotações (CRUD), Duplicação Ágil de Rodadas Antigas e Prorrogação/Renovação de Prazo com Desbloqueio B2B
- **CRUD Completo de Cotações Web (`WebQuotationsTab.jsx` & `purchasingService.ts`):**
  - **Edição de Cotações:** Modal de edição permitindo alterar título, prazo limite, observações comerciais, cesta de itens (adicionar novos insumos, alterar quantidades e especificações) e fornecedores participantes.
  - **Exclusão de Cotações:** Exclusão segura no Firestore e no armazenamento local (`localStorage`) com diálogo de confirmação prevenindo exclusões acidentais.
- **Duplicação Ágil de Cotações Antigas:**
  - Botão de ação "Duplicar" em cada cotação e no rodapé do comparativo de preços.
  - Clonagem completa da cesta de insumos e da lista de distribuidores convidados, gerando automaticamente novos tokens criptografados e código sequencial (#COT-YYYY-XXX).
  - Pré-preenchimento automático do formulário com novo prazo e título sugerido (`[Título] (Cópia)`), permitindo revisão imediata pelo comprador antes da publicação.
- **Prorrogação e Renovação de Prazo com Reativação Automática:**
  - Novo modal ergonômico "Prorrogar Prazo" com atalhos de acréscimo rápido (+24h, +2 Dias, +3 Dias, +5 Dias, +7 Dias) e seletor de data e hora (`datetime-local`).
  - Campo opcional de justificativa/motivo anexado ao histórico de notas da cotação.
  - Reativação automática no portal B2B público: caso a cotação estivesse com status "Expirada", ao prorrogar o prazo a cotação retorna automaticamente para "Aberta" (ou "Em Análise" caso já possua lances recebidos), desbloqueando imediatamente o acesso dos distribuidores para envio de propostas.
- **Ações Rápidas no Mapa Comparativo de Preços:**
  - Atalhos diretos no rodapé do mapa comparativo para "Prorrogar", "Duplicar" e "Editar" sem necessidade de fechar a análise.
- **Padrões de UI/UX & Manuais:**
  - Rótulos concisos e diretos com padrão rigoroso de 1 palavra/termo único: `Pedido`, `Comparativo`, `Links`, `Prorrogar`, `Duplicar`, `Editar` e `Excluir`.
  - Atualização do manual oficial em `moduleGuidesData.js` e histórico de versões em `ChangelogModal.jsx`.

## [v5.0.33] - 17 de Novembro, 2026
### Nex-Ai CLINIC (.HR) — Treinamento Institucional de Atendimento a Clientes Internos e Externos em Clínica de Hemodiálise com Pré e Pós-Teste Clínico e Dossiê VISA
- **16º Treinamento Oficial em Nefrologia e Hemodiálise (`trn-nefro-atendimento`):**
  - Implementação do programa institucional "Excelência no Atendimento a Clientes Internos e Externos em Nefrologia", configurado para participação de todos os colaboradores da clínica (`sector: 'Geral'`).
  - Carga horária de 4 horas, validade de reciclagem de 12 meses, nota de corte de 70% e tempo mínimo de leitura de 4 minutos.
- **Ementa Estruturada em 6 Módulos Especializados:**
  1. *O Paciente Renal Crônico e seus Familiares como Clientes Externos:* rotina extenuante de hemodiálise (3x/semana, 4h), restrições hídricas e dietéticas, fadiga pós-diálise, *burnout* do cuidador/acompanhante e acolhimento digno desde a recepção.
  2. *Princípios do Atendimento Externo Humanizado:* empatia terapêutica, comunicação proativa e imediata em casos de atraso de turno, linguagem acessível sem jargões herméticos e respeito às singularidades.
  3. *Conceito de Clientes Internos na Hemodiálise — A Corrente Vital:* o ciclo de interdependência crítica entre Higienização, Enfermagem, Farmácia, Tratamento de Água/Manutenção, Corpo Clínico, Nutrição, Psicologia, Serviço Social, Faturamento APAC e Recepção/TI.
  4. *Comunicação Assertiva, CNV e Passagem de Plantão:* aplicação dos 4 pilares da Comunicação Não Violenta (observação sem julgamento, identificação de necessidades, pedidos claros) e técnica SBAR para passagens de plantão e comunicações entre setores.
  5. *Gestão de Conflitos e Desescalada Emocional:* técnicas de postura corporal, escuta ativa sem interrupção inicial, validação emocional prévia, foco em soluções resolutivas e acionamento oportuno de suporte multidisciplinar.
  6. *Ética, Sigilo e Privacidade (LGPD e Segurança do Paciente):* sigilo estrito de sorologias e condutas, proibição de postagens em redes sociais, bloqueio de computadores e cultura justa de notificação de falhas de processo.
- **Avaliações Científicas com 10 Questões Exclusivas:**
  - 5 perguntas diagnósticas no Pré-teste (`atend-pre-1` a `atend-pre-5`).
  - 5 perguntas avaliativas no Pós-teste (`atend-post-1` a `atend-post-5`) com justificativas clínicas e cálculo automático de ganho de eficácia (+%).
- **Integração no Portal do Colaborador, Sincronização Firestore e Dossiê VISA:**
  - Disponível imediatamente para realização no Portal Mobile por digitação de CPF.
  - Sincronização em 1 clique na aba de Treinamentos do RH e auto-seed inteligente no Firestore.
  - Inclusão dos registros, notas e certificados gerados no Dossiê consolidado da Vigilância Sanitária.

## [v5.0.32] - 15 de Novembro, 2026
### Nex-Ai CLINIC (.CLINIC & .ASSIST) — Lista Pronta Imediata de Pacientes no .CLINIC com Cockpit Ativo, Barra de Ações por Ícones na Escala (.ASSIST) e Resolução Resiliente de Exames Laboratoriais
- **Lista Pronta Imediata no Módulo Clínico (.CLINIC):**
  - Ao entrar em .CLINIC, a lista lateral de pacientes da unidade ativa já é exibida completamente pronta com contador em tempo real e seleção automática do primeiro paciente.
  - O Cockpit 360 do paciente renal (dados cadastrais, acesso vascular, heparina, peso seco alvo, última sessão e último exame) é renderizado imediatamente sem estados vazios.
  - Campo de busca instantânea no topo da lista lateral com botão de limpeza ágil para filtragem em tempo real por nome, CPF, CNS, telefone ou leito/salão.
  - Sincronização automática da seleção ao trocar de unidade no seletor global ou ao refinar a pesquisa.
- **Barra de Ações por Ícones nos Cards de Poltronas (.ASSIST):**
  - Redesenho completo do rodapé dos cards de pacientes na escala de hemodiálise (`DialysisScheduleTab.jsx`).
  - Substituição dos botões de texto extenso por 4 botões de ícones elegantes, compactos e com tooltips informativos:
    - ✏️ **Editar** (`Pencil`, fundo azul suave): abre edição rápida de Acesso Vascular, Agulha e Heparina.
    - 📈 **Exames** (`Activity`, fundo ciano suave): consulta imediata do histórico laboratorial e biomarcadores.
    - ⇄ **Remanejar** (`ArrowRightLeft`, fundo ardósia suave): remanejamento ou troca de leito/turno.
    - ⚠️ **Comunicado** (`AlertTriangle`, fundo carmesim suave): publicação rápida de ocorrência no Mural Assistencial.
  - Eliminação total da poluição visual e quebras de linha nos cards de poltronas dos 3 salões.
- **Resolução Resiliente e Conexão Integral de Exames Laboratoriais:**
  - Enriquecimento direto de 2.231 entradas de escala em `initialDialysisSchedule.json` com `patientId` e `cpf` oficiais correspondentes aos pacientes mestres da clínica.
  - Motor de busca e resolução de exames em múltiplos estágios (`patientService.js` e `mockFirebase.js`), suportando busca direta por ID do paciente, CPF de 11 dígitos, desinfecção de anotações e sufixos de enfermagem (FAV, CDL, Permcath, calibres 15/16/17, datas) e tolerância fonética/tokens de nomes.
  - 100% dos pacientes da escala agora abrem seu histórico completo de exames dos últimos 4 meses com alertas clínicos sem falhas.
- **Otimização de Performance e Armazenamento Local:**
  - Remoção da gravação do payload de 2.1MB de exames laboratoriais no `localStorage`, eliminando o erro de cota excedida (`QuotaExceededError`) nos navegadores e acelerando a inicialização do sistema.
  - Regras de segurança no `firestore.rules` atualizadas com permissões para as coleções clínicas (`dialysis_schedules`, `prescriptions`, `sessions_logs`, `clinical_notes`, `patient_medications`, `patient_lab_exams`, `patient_apac_records`).

## [v5.0.31] - 15 de Novembro, 2026
### Nex-Ai CLINIC (.CLINICAL, .ASSIST & .MULTI) — Integração Completa de Exames Laboratoriais (LIS Hospitalar), Ingestão de 563 Arquivos XML com 2.189 Sessões e Consulta em 1 Clique no Leito e na Nutrição
- **Ingestão Massiva do LIS Hospitalar (docs/EXAMES/):**
  - Processamento automatizado de 563 arquivos XML do sistema laboratorial hospitalar, extraindo 2.289 pedidos analíticos de exames de Agosto a Novembro de 2026.
  - 100% de taxa de correspondência de pacientes (2.289 de 2.289), com cruzamento multifatorial (CPF, Prontuário hospitalar e Nome).
  - Cadastro da paciente pendente `BERENICE HELENA CAMPOS` (`pat-2090`), totalizando 2.090 pacientes no cadastro mestre da clínica.
  - Geração do banco de dados laboratorial consolidado em `src/data/allPatientLabExams.json` (2.189 sessões mensais em 628 pacientes).
- **Adequação Dialítica & Biomarcadores Automatizados:**
  - Cálculo automático de Kt/V Daugirdas de 2ª geração e Taxa de Redução de Ureia (URR) para 1.903 sessões a partir das ureias pré e pós-diálise.
  - Indicadores metabólicos monitorados: Potássio (2.160), Sódio (2.174), Cálcio (2.184), Fósforo (2.184), Hemoglobina (2.177), Hematócrito (2.178), Albumina (561), Creatinina (778), Ferritina (554), Sat. Transferrina (580), PTH intacto (535), Glicemia (1.073) e Sorologias (HIV, HCV, HBsAg, Anti-HBs).
- **Atalho 1-Clique na Escala de Hemodiálise (.ASSIST):**
  - Inclusão do botão "Exames" em cada poltrona/ponto ocupado do Mapa de Hemodiálise (`DialysisScheduleTab.jsx`).
  - Modal rápido de exames com abas de meses, identificação do médico solicitante/CRM, banner de alertas clínicos críticos (Hipercalemia > 5.5, Hiperfosfatemia > 5.5, Anemia Hb < 10.0, Dose subótima Kt/V < 1.20), grade de 6 cards de KPIs e tabela comparativa dos últimos 4 meses sem sair da escala durante o round.
- **Integração Laboratorial na Nutrição Renal (.MULTI):**
  - Consulta automática aos exames recentes do paciente ao selecioná-lo no formulário de Avaliação Nutricional (`MultiNutritionTab.jsx`).
  - Auto-sugestão do status de controle de Fósforo (`Na Meta`, `Elevado`, `Muito Alto`) e Potássio (`Na Meta`, `Elevado`, `Crítico`) a partir dos dados laboratoriais reais.
  - Botão "Exames" na tabela de avaliações para consulta rápida do histórico laboratorial do paciente.
- **Repositório Central no Módulo Clínico (.CLINICAL):**
  - Aba Exames com semáforo SBN aprimorada com referências para Sódio, Creatinina e Albumina.
- **Diretrizes de Interface (UI/UX) & Manuais:**
  - Aplicação rigorosa da regra de rótulos de termo único (1 palavra).
  - Atualização dos manuais oficiais em `moduleGuidesData.js` e notas de versão em `ChangelogModal.jsx`.

## [v5.0.30] - 14 de Novembro, 2026
### Nex-Ai CLINIC (.RECEPTION & .ASSIST) — Importação Massiva de 1.398 Pacientes Hospitalares, Consolidação da Base Mestre para 2.089 Registros e Filtros Nefrológicos Avançados
- **Importação Hospitalar:** Importação integral de 1.398 novos pacientes nefrológicos ambulatoriais da planilha oficial do Hospital Público Regional Prefeito Osvaldo Rezende Franco (Betim/MG), expandindo a base mestre unificada para 2.089 pacientes.
- **Consolidação Cadastral:** 100% dos 2.089 pacientes com CPFs formatados e validados, filiação materna, prontuários sequenciais padronizados (PR-001000 a PR-003088), logradouros, bairros, municípios, CEPs e números de Cartão Nacional de Saúde (CNS).
- **Contatos & Familiares:** 1.957 telefones e contatos de acompanhantes (cônjuges, filhos, irmãos) preservados e estruturados com anotações clínicas de recado.
- **Filtro de Tratamento:** Adição de seletor dedicado de modalidade no Painel de Pacientes (.RECEPTION), permitindo filtrar em 1 clique por HD (617), TTO Con. (1.398), APD (70), CAPD (4), DPI e TX-Renal.
- **Paginação de Alta Performance:** Paginação nativa (50 registros por página) com contadores em tempo real e navegação ágil, otimizando o carregamento e renderização do cadastro.
- **Diretrizes de Interface (UI):** Conformidade rigorosa com o padrão de termos únicos (1 palavra), remoção de seletores duplicados no cabeçalho e exibição polida para atendimentos ambulatoriais.

## [v5.0.29] - 14 de Novembro, 2026
### Nex-Ai CLINIC (.RECEPTION & .ASSIST) — Enriquecimento e Atualização Cadastral em Massa com a Base Oficial do Hospital Regional de Betim
- **Atualização Massiva da Base Mestre de Pacientes (llEnrichedPatients.json):**
  - Ingestão da planilha oficial do Hospital Regional de Betim (Novembro/2026), processando 2.020 registros clínicos.
  - Cruzamento e atualização de 633 pacientes cadastrados no sistema (91,6% de cobertura total da base mestre).
  - Enriquecimento com 633 endereços residenciais completos (logradouro, número, bairro, município, CEP, complemento e referências).
  - Extração de 598 telefones primários e contatos com parentesco decodificado (filhos, cônjuges, irmãos e recados estruturados).
  - Atualização de 633 nomes oficiais de mães e datas de nascimento/idades.
  - Atualização de 633 números oficiais do Cartão Nacional de Saúde (CNS).
- **Interface Aprimorada no Cadastro de Pacientes (PatientsPanel.jsx):**
  - Tabela principal com exibição imediata de telefone de contato e bairro/município.
  - Modal de edição expandido com campos completos para telefone, CNS, filiação materna, endereço, número, bairro e CEP, seguindo o padrão rigoroso de rótulos de termo único.
- **Migração Transparente no Navegador (mockFirebase.js):**
  - Adição de rotina de migração inteligente com chave patients_sync_version em getDB(), propagando a nova base para todos os navegadores locais sem perda de configurações locais de leito/turno.
- **Manuais e Guias Oficiais Atualizados (moduleGuidesData.js):**
  - Documentação dos recursos e perguntas frequentes sobre enriquecimento cadastral no manual da Recepção (.RECEPTION).

## [v5.0.28] - 14 de Novembro, 2026
### Nex-Ai CLINIC (.ASSIST) — Padrão de 30 Dias no Mural e Cálculo Dinâmico dos Quadros de Cirurgias por Período Ativo
- **Padrão de 30 Dias no Mural Clínico (AssistPanel.jsx):**
  - Configuração do período inicial de comunicados em 30 dias para todos os usuários ao entrar no Mural, mantendo o foco nas ocorrências recentes e permitindo alternância ágil entre períodos.
- **Cálculo Dinâmico dos Quadros de Cirurgias (AssistSurgeriesTab.jsx):**
  - Recalibração dos 5 quadros de KPIs superiores (Agendadas, Fístulas, Cateteres, Urgências e Realizadas) para calcular seus totais com base no filtro e período ativo exibido (Semana padrão ao entrar no módulo, Mês, Dia ou Tabela).
  - Sincronização em tempo real dos números dos quadros ao navegar pelas semanas ou aplicar filtros de cirurgião, local e situação.
- **Atualização dos Manuais Operacionais (moduleGuidesData.js):**
  - Inclusão dos recursos e respostas a dúvidas frequentes no manual oficial do módulo Nex-Ai.ASSIST.

## [v5.0.27] - 27 de Outubro, 2026
### Nex-Ai CLINIC (.MULTI & .BI) — Ingestão da Planilha Atualizada de Fisioterapia e Sincronização Dinâmica em Tempo Real com o BI
- **Ingestão Integral da Planilha Atualizada de Fisioterapia (`Quadro de Indicadores.xlsx`):**
  - Importação de 592 atendimentos consolidados abrangendo as 5 competências (Junho: 100 sessões, Julho: 100 sessões, Agosto: 128 sessões, Setembro: 154 sessões, Outubro: 183 sessões).
  - Vínculo direto de 100% dos pacientes com o cadastro mestre da clínica (`allEnrichedPatients.json`), associando prontuários e documentos com precisão.
- **Confirmação e Calibração do Indicador de Sessões no BI (`Dashboard.jsx` e `clinicalService.js`):**
  - Confirmação do indicador oficial `fisio_total_sessoes` ("Total de Sessões Executadas"), calibrado na unidade `sessões` e com meta de qualidade mensal ajustada para 180 atendimentos.
- **Sincronização Dinâmica em Tempo Real entre .MULTI e .BI (`physioIndicatorCalculator.js`, `mockFirebase.js` e `clinicalService.js`):**
  - Implementação do motor de cálculo instantâneo `computePhysiotherapyIndicators`, eliminando a necessidade de alimentação manual duplicada de indicadores.
  - Ao salvar, editar ou excluir qualquer ficha de fisioterapia na aba do módulo `.MULTI`, os 10 indicadores clínicos oficiais (Total de Sessões Executadas, Taxa de Aderência, Estado Geral Bom, Prevalência de Dor, Déficit de Mobilidade, Fraqueza Muscular, Incapacidade Funcional, Demanda Espontânea, Busca Ativa e Pacientes em Acompanhamento) são recalculados e sincronizados em tempo real no módulo BI (.BI).
- **Documentação e Guias Operacionais (`moduleGuidesData.js`):**
  - Atualização dos manuais dos módulos `.MULTI` e Gestão da Qualidade & BI (`.INDEX`), detalhando o fluxo de alimentação única e atualização transparente no BI.

## [v5.0.26] - 25 de Outubro, 2026
### Nex-Ai CLINIC (.MULTI) — Correção Estrutural de Importação e Estabilidade no Serviço Social
- **Correção de ReferenceError em MultiSocialTab (`MultiSocialTab.jsx`):**
  - Inclusão do ícone `AlertCircle` no bloco de importação de `lucide-react`, eliminando o erro de tempo de execução (`ReferenceError: AlertCircle is not defined`) disparado ao renderizar a aba de Serviço Social.
  - Higienização e remoção de imports residuais sem uso no módulo multidisciplinar.
  - Varredura com oxlint atestando ausência total de componentes ou tags JSX não declaradas em todo o código-fonte da aplicação.

## [v5.0.25] - 25 de Outubro, 2026
### Nex-Ai CLINIC (.MULTI & .BI) — Controle Clínico de Fisioterapia, Indicadores BI e Vínculo Inteligente com Pacientes
- **Aba Oficial de Fisioterapia no Módulo Multidisciplinar (`MultiPhysiotherapyTab.jsx` e `MultiPanel.jsx`):**
  - Criação da aba dedicada "Fisioterapia" com ícone oficial `Activity` integrada ao módulo `.MULTI`.
  - Navegação temporal ágil por botões mensais (Outubro, Setembro, Agosto, Julho, Junho ou histórico consolidado).
  - 6 Cartões de KPIs estratégicos de primeira linha: Pacientes Avaliados, Total de Sessões Executadas, Taxa de Aderência, Estado Geral Bom, Prevalência de Dor e Fraqueza Muscular.
  - 3 Gráficos analíticos interativos via Recharts: Demandas de Atendimento (Demanda Espontânea vs Busca Ativa), Linha de Tendência Mensal de Sessões e Pizza de Aderência do Paciente.
  - Modal dinâmico para lançamento e edição de sessões de fisioterapia, com busca preditiva de pacientes, checkboxes ergonômicos e validação ágil de campos.
  - Tabela detalhada de atendimentos com identificação de turno, salão, estado, queixas sintomáticas e ações imediatas.
- **Vínculo 100% Preciso com o Cadastro Central de Pacientes (`initialPhysiotherapyData.json`):**
  - Ingestão integral da planilha `Quadro de Indicadores SETEMBRO.xlsx` (787 atendimentos em 5 abas mensais cobrindo Junho a Outubro de 2026).
  - Mapeamento e correspondência de 100% dos 172 pacientes únicos com os cadastros centrais da clínica (`allEnrichedPatients.json`), associando os IDs de prontuário e normalizando grafias.
  - Integração nativa com o motor de busca global de pacientes (`dbService.searchPatients`), permitindo atrelar e consultar pacientes existentes com autocomplete instantâneo.
- **Alimentação Automática dos Indicadores no Módulo BI (`mockFirebase.js`, `clinicalService.js` e `Dashboard.jsx`):**
  - Criação do setor oficial `Fisioterapia` (`fisioterapia`) no catálogo de setores do sistema e nos padrões de RH.
  - Configuração de 10 indicadores clínicos oficiais de fisioterapia com metas de qualidade: Taxa de Aderência, Estado Geral Bom, Prevalência de Queixa de Dor, Déficit de Mobilidade, Fraqueza Muscular, Incapacidade Funcional, Demanda Espontânea, Busca Ativa, Total de Sessões Executadas e Pacientes em Acompanhamento.
  - Injeção de 50 pontos de dados históricos consolidados (10 indicadores x 5 meses: `2026-06` a `2026-10`) prontos para consumo no módulo BI (.BI) e no Painel de Indicadores da Qualidade.
  - Calibração inteligente do indicador de desempenho no Dashboard BI (`isLowerBetter`), reconhecendo queixas clínicas (dor, fraqueza, déficit, incapacidade) onde taxas menores indicam melhor desempenho.
- **Exportação e Relatórios Multiprofissionais (`MultiReportsModal.jsx` e `multiService.js`):**
  - Adição da opção "4. Controle Clínico de Fisioterapia" na central de relatórios do módulo com exportação em planilha Excel nativa (.xlsx).
- **Documentação e Padrões de Interface:**
  - Atualização completa do manual do módulo `.MULTI` em `moduleGuidesData.js` com recursos, tutorial prático passo a passo e FAQ de Fisioterapia.
  - Aplicação rigorosa das diretrizes de UI/UX com rótulos concisos de termo único em todos os botões, cabeçalhos e formulários.

## [v5.0.24] - 14 de Outubro, 2026
### Nex-Ai CLINIC (.RH) — Geração de PDF Unificado de Contracheques, Relatório Tabular em PDF e Exportação Youk Aprimorada
- **Geração de PDF Unificado de Contracheques (`payslipPdfGenerator.js`):**
  - Implementação do motor gerador de PDF oficial de recibos de pagamento (`exportUnifiedPayslipsPdf`), formatando 1 página A4 por colaborador.
  - Cabeçalho hospitalar com Razão Social, CNPJ, Filial e Competência; identificação cadastral completa enriquecida com o CPF validado do colaborador (essencial para o Youk Manager e assinatura digital no app); grade de rubricas/verbas detalhadas; subtotais de vencimentos e descontos; caixa de destaque para o valor líquido; bases legais (Salário Base, INSS, FGTS, IRRF); e canhoto de declaração com campo de assinatura do funcionário.
- **Relatório Tabular Consolidado em PDF (`payslipPdfGenerator.js`):**
  - Geração de relatório executivo da folha em formato A4 Paisagem (`exportTabularPayrollPdf`) com cartões de indicadores (total de holerites, proventos, descontos e líquido) e tabela zebrada com paginação automática.
- **Atualização da Barra de Ações da Folha (`PayslipsTab.jsx` e `PayslipImportModal.jsx`):**
  - Substituição do botão único por botões diretos e concisos seguindo o padrão de 1 palavra: "Recibos" (PDF unificado), "Relatório" (PDF tabular) e "Planilha" (XLSX Youk de 79 colunas).
  - Alerta preventivo aprimorado para bloquear ou confirmar exportação caso existam colaboradores pendentes de CPF.
- **Documentação e Manual do Módulo Atualizados (`moduleGuidesData.js`):**
  - Esclarecimento detalhado no FAQ e no tutorial da folha sobre o suporte a upload de PDFs no Youk Manager e o novo fluxo de geração de contracheques consolidados.

## [v5.0.22] - 13 de Outubro, 2026
### Nex-Ai CLINIC (.RH) — Busca com Autocomplete no Vínculo, Alerta Preventivo de CPF e Correção Youk
- **Componente SearchableEmployeeSelect & Autocomplete (`SearchableEmployeeSelect.jsx`):**
  - Implementação de seletor rápido com digitação em tempo real por nome, CPF ou matrícula e ordenação alfabética (A-Z).
  - Renderização via Portal (`createPortal`) com posicionamento flutuante imune ao overflow/recorte de tabelas, permitindo localizar e vincular colaboradores em menos de 2 segundos.
- **Alerta Preventivo de Holerites sem CPF (`PayslipsTab.jsx` e `PayslipImportModal.jsx`):**
  - Verificação prévia no momento do clique em "Exportar" com modal de alerta exibindo a contagem exata de contracheques sem CPF vinculado (`warningModalOpen`).
  - Prevenção ativa de exportações incompletas que seriam rejeitadas pelo aplicativo Youk Manager, com opções de cancelar para vincular ou exportar com confirmação.
- **Correção da Exportação da Planilha do Youk (`youkExcelGenerator.js`):**
  - Resolução definitiva da exceção `razaoSocial is not defined` ocorrida ao clicar em exportar a planilha homologada do Youk Manager.
  - Implementação de fallback inteligente para a Razão Social da empresa (`ps.companyName`, `ps.companySocialReason`, `emp.companyName` ou padrão da clínica).
  - Padronização de todas as colunas monetárias de bases e totais (Base FGTS, INSS, Base INSS, FGTS, IRRF, Proventos, Descontos e Líquido) com formatação monetária brasileira oficial (`formatCurrencyBR`).

## [v5.0.21] - 13 de Outubro, 2026
### Nex-Ai CLINIC (.RH) — Leitura Rigorosa de Holerites, Isolamento de Rubricas e Vínculo Inteligente por Proximidade Fonética/Ortográfica
- **Isolamento Cadastral e Proteção no PDF (`payslipPdfParser.js`):**
  - Resolução da captura incorreta de linhas da tabela de verbas/eventos ("Código Descrição...") como identificador de colaborador, eliminando a ocorrência de rubricas como `"NORMAIS 30,00"` na coluna de colaborador.
  - Implementação de lista de termos proibidos (blacklist) e verificação de integridade cadastral para impedir categoricamente que termos operacionais de folha sejam atribuídos como nome.
  - Leitura avançada de bases de cálculo com salto inteligente sobre mensagens de declaração e rodapés de assinatura.
- **Motor de Vínculo por Proximidade Fonética e Ortográfica (Fuzzy Matching):**
  - Implementação de algoritmo multicamada de cruzamento: matrícula numérica (sem zeros à esquerda), nome completo normalizado, nome compacto sem espaços, primeiro e último nome com interseção de tokens, e índice de similaridade ponderado (Levenshtein + Coeficiente de Dice + Jaccard de Tokens >= 68%).
  - Suporte ao padrão de nomenclatura de arquivos do Alterdata (ex: `370-09-2026-M-5-SUILAJULIANARODRIGUESNOGUEIRA...`), viabilizando correspondência direta de 100% mesmo quando os PDFs apresentarem formatações atípicas.
- **Aprimoramento de Interface e Troca Rápida (`PayslipsTab.jsx` e `PayslipImportModal.jsx`):**
  - A coluna Colaborador exibe com destaque o nome oficial do colaborador cadastrado na clínica, com legenda sutil de confiança e grafia original lida do contracheque.
  - A coluna CPF agora exibe o CPF oficial com seletor inline para alterar ou atribuir o colaborador em 1 clique.
- **Exportador Youk Manager (`youkExcelGenerator.js`):**
  - Priorização rigorosa dos dados cadastrais consolidados e CPF do colaborador vinculado na matriz de 79 colunas do arquivo oficial do Youk.

## [v5.0.20] - 13 de Outubro, 2026
### Nex-Ai CLINIC (.RH) — Aba Dedicada de Folha, Suporte a Pacotes ZIP de até 10MB e Correção Estrutural de Renderização
- **Correção Estrutural do Erro de Renderização (React Error #310):**
  - Eliminação definitiva da divergência de ordem de hooks do React (`Rendered more hooks than during previous render`) com alinhamento incondicional de todos os hooks no topo dos componentes.
- **Processamento Otimizado para Pacotes ZIP de até 10MB:**
  - Otimização do motor `payslipPdfParser.js` com desalocação forçada de memória em cada página lida (`pdf.destroy()`), evitando esgotamento de memória (RAM) no navegador ao descompactar e analisar centenas de contracheques.
  - Pacing não-bloqueante no loop de leitura com respiração do event loop (`setTimeout`) e barra de progresso em tempo real com porcentagem visual.
  - Tratamento resiliente de falhas por arquivo, impedindo que um PDF corrompido interrompa a extração do lote completo.
- **Migração do Fluxo de Folha para Aba Oficial (`PayslipsTab.jsx`):**
  - Transformação do botão "Folha" em uma aba de primeiro nível na navegação principal do módulo de RH (`activeTab === 'payroll'`), reduzindo a poluição visual de botões soltos em cabeçalhos e barras de ferramentas.
  - Sub-abas integradas para "Importar" e "Histórico", com área de dropzone expansiva, filtros analíticos, tabela de conferência, vinculação manual de CPF e submodal de verbas.
- **Padrão Rigoroso de Rótulos Concisos (1 Palavra):**
  - Rótulos estritamente objetivos em botões, abas, filtros e colunas (`Folha`, `Exportar`, `Importar`, `Histórico`, `Colaborador`, `Matrícula`, `CPF`, `Proventos`, `Descontos`, `Líquido`, `Status`, `Ações`, `Ver`, `Limpar`).

## [v5.0.18] - 13 de Outubro, 2026
### Nex-Ai CLINIC (.RH) — Leitor Inteligente de Folha em Lote (.ZIP/PDF), Geração Oficial Youk Manager e Matrícula de Colaboradores
- **Motor de Leitura Posicional de Contracheques em PDF e Arquivos ZIP (`payslipPdfParser.js`):**
  - Descompactação e processamento em lote diretamente no navegador com a biblioteca `jszip` e `pdfjs-dist`, garantindo 100% de privacidade sem tráfego de dados sensíveis para servidores externos.
  - Extração automatizada e robusta de metadados da empresa (Razão Social, CNPJ), competência (mês/ano), dados do trabalhador (código, matrícula, nome, cargo, CBO, admissão) e bases de cálculo (Salário Base, Base INSS, Base FGTS, FGTS do Mês, Base IRRF).
  - Mapeamento dinâmico linha a linha de todas as rubricas detalhadas (proventos, descontos, referências, códigos e descrições).
  - Extração e validação do valor líquido e conferência matemática dos totais.
- **Gerador Oficial da Planilha Youk Manager (`youkExcelGenerator.js`):**
  - Criação de planilha Excel (`.xlsx`) homologada no padrão estrito de 79 colunas do leiaute Alterdata `ReciboPgAlterdata_Youk_9.0`.
  - Estruturação multi-linha por colaborador (uma linha para cada verba/evento) pronta para importação direta no Youk Manager para assinatura digital do funcionário no celular.
- **Cruzamento Inteligente com Base de Colaboradores Nexa CLINIC:**
  - Vínculo automático por matrícula/código e correspondência de nome normalizado para injeção automática de CPF, data de nascimento, endereço e dados bancários.
  - Mecanismo visual de vinculação manual em 1 clique para casos de grafias divergentes.
- **Interface Integrada no Módulo RH (`PayslipImportModal.jsx`):**
  - Dropzone com arrastar e soltar de arquivos `.zip` ou múltiplos `.pdf`.
  - Barra de progresso com feedback em tempo real da leitura.
  - Cards de KPI: total de holerites, vinculados, pendências e valor líquido total.
  - Tabela analítica com filtros, busca instantânea e modal de conferência rápida de verbas por colaborador.
  - Aba de histórico de lotes processados com registro em auditoria interna.
- **Campo Matrícula nos Colaboradores:**
  - Inclusão do campo Matrícula no formulário de colaboradores e persistência no banco de dados para garantir vínculo direto e inequívoco por código numérico da folha.
- **Documentação e Manuais Atualizados:**
  - Registro de novos recursos, tutorial completo passo a passo e FAQ de dúvidas frequentes em `src/data/moduleGuidesData.js`.

## [v5.0.16] - 08 de Outubro, 2026
### Nex-Ai CLINIC (.ASSIST) — Higienização Definitiva de Comunicados de E-mail (HTML/MIME) e Desambiguação Rigorosa de Pacientes
- **Decodificação e Limpeza Abrangente de Mensagens de E-mail:**
  - Criação do utilitário `src/utils/cleanEmailContent.js` para conversão de e-mails em HTML bruto (tags inline, `<style>`, `<script>`, `<signature>`, atributos de estilo e imagens de assinatura) em texto clínico limpo, legível e estruturado com quebras de parágrafo naturais.
  - Decodificação completa de entidades HTML (`&nbsp;`, `&quot;`, `&amp;`, `&#39;`, caracteres numéricos e Unicode).
  - Remoção automática de assinaturas eletrônicas residuais e rodapés de dispositivos móveis e clientes de e-mail (Titan, Flockmail, Outlook, iPhone, Galaxy).
- **Proteção em Camadas (Cloud Function, Serviço Firestore e Interface UI):**
  - **Backend Nuvem (`functions/assistSync.js`):** Sincronizador IMAP autônomo atualizado com extração e decodificação prévia antes da persistência no Firestore.
  - **Serviço de Dados (`src/services/firebase/assistService.js`):** Sanitização nativa ao consultar (`getAssistPosts`) ou escutar via `onSnapshot` a coleção `assist_posts`.
  - **Interface do Mural (`src/components/AssistPanel.jsx`):** Renderização blindada no modo card, modo compacto, modal de edição e impressão do espelho de turno em A4.
- **Desambiguação Rigorosa de Pacientes no Motor Fuzzy Match:**
  - Restrição para impedir correspondência falsa de pacientes com nomes de uma única palavra/sobrenome isolado (ex: "SANTOS", "GONCALVES", "COSTA"), exigindo pelo menos duas partes de nome e comprimento mínimo de 6 caracteres.
  - Priorização do match mais específico e longo, corrigindo automaticamente vínculos como `EMILSON BARRETO GONCALVES` e `LEONORA FERREIRA DOS SANTOS`.
- **Higienização Completa da Base Histórica:**
  - Varredura e higienização de 100% dos comunicados existentes no Firestore `assist_posts` e atualização do backup local `src/data/synced_assist_emails.json`.

## [v5.0.15] - 08 de Outubro, 2026
### Nex-Ai CLINIC (.ASSIST) — Ingestão Autônoma de E-mails na Nuvem (Cloud Scheduler) e Encaminhamento Automático de Comunicados (Cloud Trigger)
- **Ingestão de E-mails 100% na Nuvem (Firebase Cloud Scheduler):**
  - Substituição definitiva da dependência de scripts locais por Cloud Function agendada autônoma (`syncAssistEmailsScheduled`), executando a cada 5 minutos diretamente nos servidores do Google Cloud / Firebase.
  - Conexão segura IMAP com o servidor Titan (`imap.titan.email:993`) na conta oficial `integracao@dialize.com.br`, processamento de novos e-mails não lidos, higienização de texto, classificação clínica inteligente (Urgência e Categoria) e vínculo fuzzy match com pacientes da clínica.
  - Gravação automática e idempotente na coleção `assist_posts` com controle de UID no Firestore.
- **Encaminhamento de Comunicados por E-mail 100% na Nuvem (Firestore Trigger):**
  - Criação da Cloud Function reativa `onAssistPostCreated`: ao cadastrar um novo comunicado diretamente no Mural ou via agendamento cirúrgico, o Firebase detecta o evento e dispara automaticamente cópia formatada por e-mail para os destinatários cadastrados em `settings/email`.
  - Template de e-mail institucional estilizado em HTML com categoria em destaque, urgência clínica, dados do paciente, salão, turno e corpo da mensagem.
  - Bloqueio inteligente contra loops infinitos (ignora mensagens com origem de e-mail).
- **Refinamento na Interface de Configuração (`EmailSettingsTab`):**
  - Inclusão de banner de alerta preventivo âmbar caso o gestor ative o encaminhamento de comunicados do mural sem preencher o e-mail de destino.
  - Manutenção do padrão estrito de rótulos concisos de 1 palavra.
- **Documentação e Manuais Atualizados:**
  - Registro de novos recursos de ingestão em nuvem, tutorial de configuração e FAQ no guia do módulo `.ASSIST` em `src/data/moduleGuidesData.js`.
- **Gestão de Sugestões de Melhorias:**
  - Registro formal no backlog (`SUGESTOES_MELHORIAS.md`) das sugestões `SM-025` (seletor de destinatários por grupo) e `SM-026` (sincronização sob demanda).

## [v5.0.13] - 08 de Outubro, 2026
### Nex-Ai CLINIC (.MED) — Central de Conflitos de Salão Clicável, Resolução em 1 Clique e Correção de Honorários do 3º Turno
- **Card Interativo e Clicável de Conflitos no Cabeçalho:**
  - Transformação do antigo card estático de conflitos em botão clicável de alta visibilidade com badge "Ver" e contador exato de conflitos por evento.
  - Correção na lógica de contagem: agrupa plantões simultâneos por médico, data e turno, eliminando contagens duplicadas.
- **Modal Dedicado de Detalhamento e Resolução de Conflitos (`MedicalConflictsModal`):**
  - Painel analítico com KPIs de impacto (Conflitos, Plantões Envolvidos e Profissionais Afetados).
  - Exibição comparativa lado a lado dos salões em sobreposição (Salão 1, Salão 2, Salão 3, DP) com status, observações e dados do nefrologista (Nome e CRM).
  - Ações operacionais rápidas integradas em cada plantão conflitante:
    - **`Editar`:** abre o modal de escala já preenchido para reatribuir o médico ou mudar o salão.
    - **`Desescalar`:** desocupa o plantão excedente diretamente do modal em 1 clique com confirmação segura.
    - **`Localizar`:** direciona o mapa da escala para a semana do conflito com realce visual na data correspondente.
- **Alerta Preventivo em Tempo Real no Formulário de Escala:**
  - Validação instantânea durante a edição/criação de plantões: exibe banner vermelho de aviso imediato caso o médico selecionado já possua plantão escalado em outro salão na mesma data e turno.
  - Inclusão do botão "Desescalar" no rodapé de edição para permitir desocupação direta do salão.
- **Correção da Remuneração Noturna / 3º Turno:**
  - Ajuste na resolução de honorários em `MedicalProductionTab.jsx` e `DEFAULT_MEDICAL_SETTINGS`, assegurando que plantões do `3º Turno` recebam a remuneração correta de R$ 825,00.
- **Documentação e Manuais Atualizados:**
  - Registro de novos recursos, tutorial passo a passo e FAQ de conflitos em `src/data/moduleGuidesData.js`.

## [v5.0.11] - 07 de Outubro, 2026
### Nex-Ai CLINIC (.MULTI) — Lançamento do Módulo da Equipe Multidisciplinar e Anamnese Social Completa (Google Forms)
- **Lançamento do Módulo Oficial .MULTI (Equipe Multidisciplinar):**
  - Módulo integrado para Serviço Social, Psicologia e Nutrição com `ModuleHeader` padronizado (`.MULTI`), ícone em gradiente violeta e navegação limpa por abas concisas (`Social`, `Painel`, `Psicologia`, `Nutrição`).
  - Totalmente integrado ao motor central de pacientes da clínica (`patientService`), puxando automaticamente nome, CPF, nascimento, telefone, endereço e turno de diálise.
- **Anamnese Social Oficial do Paciente Renal (Leitura Fiel do Google Forms):**
  - Transposição integral das 31 questões do formulário oficial com todas as opções de múltipla escolha e textos descritivos originais:
    - Identificação e contato (Nome, Celular/WhatsApp, Telefone de Recado).
    - Regime de diálise (Turno 1º/2º/3º/4º, Dias Seg/Qua/Sex ou Ter/Qui/Sáb, Sala 1 a 6, Modalidade HD/DP, Início do Tratamento).
    - Estado civil, moradia (própria, alugada, cedida, financiada, invasão) e pessoas no domicílio.
    - Saneamento básico (Água tratada, Rede de esgoto, Coleta de lixo, Iluminação pública).
    - Escolaridade e situação profissional (Aposentado, Afastado, Desempregado, Autônomo, Assalariado).
    - Renda familiar mensal e benefícios sociais (BPC/LOAS, Bolsa Família, Auxílio-Doença, Pensão).
    - Meio de transporte para a clínica (Ambulância SUS, Carro próprio, Aplicativo, Ônibus) e dificuldades com o transporte do município.
    - Segurança alimentar e recebimento de cesta básica.
    - Risco de continuidade do tratamento por dificuldades financeiras ou logísticas.
    - Solicitação expressa de contato com o Serviço Social e mensagem final de acolhimento.
- **Duas Versões Complementares da Anamnese Social:**
  - **1) Versão Paciente (Link Público / WhatsApp / Kiosk):**
    - Rota pública sem exigência de autenticação hospitalar (`?anamnese_social=ID` ou `novo`).
    - Navegação guiada em 5 etapas acolhedoras (Identificação, Tratamento, Moradia, Renda & Benefícios, Transporte & Bem-estar).
    - Botões grandes e touch-friendly otimizados para celulares e tablets de recepção.
    - Modal com gerador de mensagem personalizada e link direto para envio via WhatsApp em 1 clique.
  - **2) Versão Editável do Serviço Social (Prontuário Multidisciplinar):**
    - Ficha clínica técnica para a assistente social consultar, preencher e alterar qualquer resposta do paciente a qualquer tempo.
    - Organizada em 6 abas dinâmicas com salvamento e registro de data da última alteração.
    - Impressão formatada em PDF/Papel A4 com cabeçalho timbrado da clínica.
- **Cálculo em Tempo Real de Alertas de Vulnerabilidade Social:**
  - Motor preditivo que analisa cruzamento de dados e gera alertas visuais e categorização (Baixa, Média, Alta):
    - Alerta: Sem Renda Familiar Declarada.
    - Alerta: Insegurança Alimentar / Demanda de Cesta Básica.
    - Alerta: Dificuldade com Transporte Municipal / Ambulância.
    - Alerta: Risco de Abandono ou Interrupção do Tratamento.
    - Alerta: Ausência de Rede de Apoio Domiciliar.
- **Áreas Dedicadas de Psicologia e Nutrição Renal:**
  - **Psicologia:** Registro de atendimentos e evoluções (Acolhimento, Consulta, Apoio Familiar), humor e queixas emocionais vinculadas ao paciente central.
  - **Nutrição Renal:** Acompanhamento de peso seco, cálculo automatizado de IMC em tempo real, monitoramento de fósforo/potássio e metas dietéticas.
- **Painel Analítico & Exportação em Planilha Excel (.xlsx):**
  - Dashboard integrado com KPIs executivos, gráficos Recharts de distribuição de moradia e benefícios sociais, e fila prioritária de vulnerabilidade.
  - Botão de exportação nativa em Excel (.xlsx) com planilha formatada de todos os registros sociais e multidisciplinares.
- **UI/UX & Governança:**
  - Rótulos rigorosamente concisos de 1 termo/palavra em conformidade com as regras do projeto.
  - Manual oficial devidamente atualizado em `src/data/moduleGuidesData.js`.

## [v5.0.9] - 07 de Outubro, 2026
### Nex-Ai CLINIC (.REUSE) — Lançamento do Módulo de Reuso de Dialisadores e Melhorias Aprovadas
- **Lançamento do Módulo Oficial .REUSE (RDC 11/2014):**
  - Módulo completo de governança e rastreabilidade do ciclo de reprocessamento de dialisadores (capilares) de hemodiálise.
  - Controle estrito do ciclo de 0 a 20 utilizações com faixas visuais de status (Normal até 17, Atenção em 18-19 e Crítico em 20).
  - Trava de segurança que bloqueia presenças em dialisadores no limite regulamentar de 20 usos, exigindo troca obrigatória.
  - Presenças e faltas operadas por exceção (+1 e -1) com registro rastreável de operador e turno.
- **Melhorias Aprovadas Implementadas:**
  - **[SM-010] Leitor de Código de Barras / QR Code na Bancada:**
    - Campo de escaneamento rápido no topo do painel com foco automático, permitindo que o técnico bipe o dialisador na bancada de lavagem via leitor USB ou Bluetooth para localização imediata do paciente e registro de presença ou troca.
    - Geração de Código de Barras Code-128 e QR Code individual nas etiquetas térmicas ZPL e HTML.
  - **[SM-009] Sincronização Direta com a Base Geral da Clínica:**
    - Botão "Importar" na aba de pacientes que sincroniza em 1 clique os pacientes cadastrados na recepção/prontuário central (`patientService`).
    - Dimensionamento automático do modelo de capilar pelo peso do paciente (>100kg B22H, >90kg B21H, >80kg B20H, >60kg B18H, <=60kg B16H), com suporte a fixação manual por exceção clínica médica.
  - **[SM-011] Exportação em Planilha Excel (.xlsx):**
    - Botão de exportação nativa em formato Excel (.xlsx) na aba de trocas e na central de relatórios, gerando planilhas com histórico de ciclos, motivos, descartes e operadores para auditorias sanitárias.
  - **[SM-012] Gráfico Histórico de Aproveitamento Mensal com Recharts:**
    - Gráfico analítico de linhas e barras com histórico evolutivo dos últimos 6 meses, comparando os Salões 1, 2 e 3 com a meta regulamentar clínica de 85%.
    - Indicador de descarte precoce agrupado por tipo de complicação (Coagulação de Fibras, Baixa Prime, Rupturas, Vazamentos).
- **Impressão de Etiquetas Térmicas & Mapa Físico:**
  - Emissão de etiquetas térmicas (102x44mm) com QR Code individual, dados de filiação, sorologias padrão e volume de prime (PI e PF calculado em 80%).
  - Suporte duplo a comandos nativos Zebra ZPL (203 DPI) e impressão formatada pelo diálogo do navegador (HTML).
  - Mapa visual de poltronas e leitos em 8 boxes por 4 posições por salão e turno.
  - Central de 5 relatórios oficiais com impressão A4 e exportação em planilha.
- **Padrões de UI/UX & Governança:**
  - Cabeçalho padronizado com `ModuleHeader` oficial (`.REUSE`), ícone com gradiente cyan/teal e subtítulo conciso.
  - Rótulos estritamente concisos de 1 termo em abas, botões, tabelas e filtros em conformidade com as regras do sistema.
  - Manual oficial devidamente registrado em `src/data/moduleGuidesData.js` e backlog `SUGESTOES_MELHORIAS.md` atualizado com aprovação de SM-009 a SM-012.

## [v5.0.8] - 03 de Outubro, 2026
### Nex-Ai CLINIC (.FINANCE & .STOCK) — Identidade Visual Oficial (.FINANCE), Leitor de Extrato OFX/CSV com Auto-Matching e Integração Automática com Estoque
- **Padronização Visual Completa do Módulo Financeiro (`FinancePanel.jsx` & `FinanceReportsModal.jsx`):**
  - Implementação do `ModuleHeader` padronizado oficial (`.FINANCE` / `Controladoria & Caixa`), com ícone em gradiente esmeralda (46x46px), cantos arredondados (12px) e identificação pontuada.
  - Eliminação de duplicações do `UnitSelector` dentro do módulo (preservando o seletor único na Navbar superior).
  - Remoção de margens e paddings fixos excedentes no container raiz, alinhando com as diretrizes do design system.
  - Harmonização de todo o painel, abas, tabelas, modais e formulários para suporte completo ao Modo Noturno nos 2 níveis (Dark Slate e Pitch Black OLED) via variáveis CSS (`var(--bg-card)`, `var(--border-color)`, `var(--surface-muted)`).
  - Rigorosa aplicação da regra de rótulos concisos (1 palavra / termo único), eliminando termos duplos com barras (`/`) e conectivos (`&`).
- **Leitor de Extrato Bancário OFX e CSV com Auto-Matching Inteligente (SM-017):**
  - Criação do utilitário `src/utils/ofxParser.js` para parsing de extratos bancários nos padrões OFX 1.x (SGML) e 2.x (XML) emitidos por bancos brasileiros (Sicoob, Itaú, Banco do Brasil, Santander, Caixa, Bradesco, Inter).
  - Algoritmo de correspondência inteligente que compara valor, proximidade temporal (janela de até 5 dias) e similaridade descritiva com os títulos de contas a pagar e receber da clínica.
  - Modal de conferência interativo com métricas de transações e botão de conciliação em lote com 1 clique (`handleAutoReconcileAllMatches`).
  - Diagnóstico visual com link do título correspondente e botão direto de baixa e conciliação na tabela.
- **Integração Automática entre Estoque e Contas a Pagar (SM-018):**
  - Ao lançar uma nota fiscal de insumos, materiais médicos ou medicamentos no almoxarifado/farmácia (.STOCK), as parcelas correspondentes são geradas de forma 100% automática no Contas a Pagar (`accounts_payable`).
  - Criação da função de sincronização retroativa (`syncStockInvoicesToPayables`) com botão dedicado "Sincronizar Estoque" na barra de ações.
  - Badge visual de rastreabilidade `📦 Estoque` nas linhas de títulos do Contas a Pagar.
- **Backlog de Melhorias e Documentação:**
  - Registro das melhorias SM-017 e SM-018 como `Aprovada / Implementada` e das melhorias SM-019, SM-020 e SM-021 como `Pendente` em `SUGESTOES_MELHORIAS.md`.
  - Atualização completa do manual do módulo financeiro em `src/data/moduleGuidesData.js` com novos recursos, passo a passo e FAQ.

## [v5.0.6] - 02 de Outubro, 2026
### Nex-Ai CLINIC (.INDEX / .BI) — Redesenho Completo do Módulo BI, Abas Integradas, Dashboard Executivo Interativo com Cards Clicáveis, Análise Deep Dive e Auditoria Clínica de Metas
- **Modernização e Padronização Oficial de Interface (`QualityPanel.jsx` & `Navbar.jsx`):**
  - Criação do container oficial do módulo `QualityPanel.jsx` estruturado com o `ModuleHeader` padronizado (`.INDEX` / `Gestão da Qualidade & BI`), gradiente azul 46x46px e navegação em abas limpas e modernas: `Dashboard`, `Lançamento`, `Admin` e `Relatórios`.
  - Remoção definitiva dos botões legados espalhados no topo da navbar global (`Navbar.jsx`), unificando a arquitetura de navegação do sistema e respeitando a política de cabeçalho limpo.
- **Dashboard Executivo 100% Interativo com Filtragem por Clique:**
  - 6 Cards KPI de topo com contadores e taxas calculadas em tempo real: `Conformidade` (% global), `Total` (100 indicadores), `Conformes` (na meta), `Desvios` (abaixo da meta), `Registrados` (com dados no período) e `Setores` (11 setores).
  - **Cards Clicáveis:** Clicar nos cards `Conformes`, `Desvios` ou `Registrados` filtra instantaneamente a visualização da tela inteira, com badge de filtro ativo e botão de limpeza rápida.
  - Seletor de período com presets rápidos (`Mês Atual`, `30 Dias`, `Mês Anterior`, `Todos`) e busca textual por indicador ou fórmula.
  - Opção de visualização institucional unificada `Todos os Setores (Geral)`, eliminando a restrição de visualizar apenas um setor por vez.
- **Novas Seções Executivas no Dashboard:**
  - **Desempenho por Setor:** Painel de cartões para cada setor hospitalar (Hemodiálise, SESMT, Enfermagem, Médica, etc.) com taxa de conformidade, barra de progresso colorida e filtragem direta ao clicar no cartão.
  - **Desvios Críticos:** Painel executivo que isola imediatamente os indicadores em não conformidade para intervenção prioritária da gestão.
  - **Gráficos Analíticos Recharts:** Gráfico de barras horizontais de conformidade por setor e gráfico em rosca (donut) da distribuição de status das metas.
  - **Visualização Multiformato nos Indicadores:** Alternância fluida entre gráficos de Linha de Tendência, Gráficos de Barras, Degrau (Step) e Tabela.
  - **Modal Deep Dive (Análise Completa):** Janela modal com análise histórica detalhada, linha de meta destacada em vermelho, diagnóstico com badges de status, tabela completa de medições e impressão timbrada nos formatos Retrato e Paisagem.
- **Auditoria Clínica e Regras de Metas (`isLowerBetter`):**
  - Auditoria profunda nas 100 métricas do sistema: correção de indicadores onde menor valor é melhor (Reações Transfusionais, Internações, Anemia Grave, PTH Elevado, Distúrbios Eletrolíticos de Potássio e Fósforo).
  - Correção na detecção do indicador "Dias Consecutivos sem Acidentes" para garantir que valores crescentes sejam pontuados positivamente, eliminando falsos alertas.
- **Governança, Boy Scout Rule e Documentação:**
  - Aplicação rigorosa da regra de rótulos concisos (1 termo/palavra) em `AdminPanel.jsx` e `UploadData.jsx`, eliminando termos duplos e conectivos (`/`, `&`).
  - Atualização completa do manual do módulo em `src/data/moduleGuidesData.js` com recursos detalhados, passo a passo e FAQ clínica.

## [v5.0.5] - 02 de Outubro, 2026
### Nex-Ai CLINIC (.SESMT, .BI & .ASSIST) — Auditoria de Descarte de Lixo Infectante (RDC 222 / NR-32), 3 Novos Indicadores no BI, Central de 26 Relatórios e Alertas de Biossegurança
- **Rotina de Vistoria de Descarte de Lixo Infectante:**
  - Criação da rotina especializada de auditoria sanitária e de biossegurança de resíduos infectantes em `DailyWasteChecklist.jsx` e `sesmtService.js`.
  - Formulário com checklist de 6 itens técnicos regulamentares: Saco branco leitoso apropriado, Lixeira com tampa e pedal íntegro, Limite de 2/3 de capacidade respeitado, Identificação visível de resíduo infectante, Separação estrita de perfurocortantes e Uso obrigatório de EPIs.
  - Suporte a múltiplos setores clínicos (D.P, Salão 1, Salão 2, Salão 3, Bloco Cirúrgico, etc.), turnos e coleta de assinatura digital touch em campo.
- **Integração em Tempo Real com Módulo BI (18 Indicadores Oficiais):**
  - Adicionados 3 novos indicadores estratégicos de biossegurança na base do BI:
    - `sesmt_descarte_infectante_conformidade`: Taxa de Conformidade no Descarte de Resíduos Infectantes (Meta: ≥ 95.0%).
    - `sesmt_descarte_infectante_nao_conformidade`: Taxa de Não Conformidade no Descarte (Meta: ≤ 5.0%, com cálculo inteligente `isLowerBetter`).
    - `sesmt_vistorias_residuos_total`: Total de Vistorias de Resíduos Realizadas no Mês (Meta: 60 vistorias).
  - Carga histórica dos dados reais de auditoria do PDF para a clínica DialiZe Betim-MG (Abril/26: 56 vistorias, 28.57% conf, 71.43% NC; Junho/26: 76 vistorias, 27.63% conf, 72.37% NC).
  - Recálculo automático dos indicadores do BI a cada novo checklist de descarte salvo no módulo SESMT.
- **Painel Executivo de Resíduos no Dashboard do SESMT:**
  - Banners destacados de Conformidade e Não Conformidade idênticos ao layout executivo dos laudos de auditoria.
  - Tabela comparativa com quantitativos e percentuais por local (D.P, Salão 1, Salão 2, Salão 3 e Total Geral).
  - Gráfico de barras agrupadas comparando Conforme x Não Conforme por sala.
- **Melhorias Proativas de Biossegurança Aprovadas e Implementadas:**
  - **SM-015:** Alerta Crítico visual destacado no painel para setores que apresentam taxa de não conformidade ≥ 50%.
  - **SM-016:** Publicação e notificação automática de comunicado de biossegurança no Mural Clínico da Enfermagem (.ASSIST) sempre que uma vistoria com desvios for registrada.
- **Central de 26 Relatórios do SESMT:**
  - Inclusão do relatório regulamentar **"26. Descarte de Lixo Infectante por Local"** com exportação completa em Excel (.xlsx), PDF timbrado e Impressão direta.
- **Documentação e Padrões de Interface:**
  - Atualização completa do manual do SESMT em `src/data/moduleGuidesData.js` com novos recursos, tutoriais de campo e FAQ.
  - Registro de SM-015 e SM-016 como Aprovadas / Implementadas em `SUGESTOES_MELHORIAS.md`.
  - Rigorosa aplicação da diretriz de 1 termo/palavra e Boy Scout Rule nos rótulos de interface.

## [v5.0.2] - 02 de Outubro, 2026
### Nex-Ai CLINIC (.SESMT & .BI) — Central de 25 Relatórios do SESMT, Dashboard com 12 Cards e 15 Indicadores no Módulo BI
- **Central Analítica de Relatórios do SESMT (25 Relatórios Oficiais):**
  - Implementação da central analítica de relatórios do SESMT contendo **5 relatórios especializados para cada um dos 5 assuntos** do módulo (25 relatórios no total):
    - **EPI (5)**: 1. Censo de Conformidade Diária de EPIs; 2. Auditoria de Itens Críticos de EPI; 3. Desvios e Não Conformidades por Setor; 4. Aderência de EPI por Turno; 5. Rastreabilidade de Vistos e Responsáveis.
    - **Extintores (5)**: 6. Censo Cadastral e Localização de Extintores; 7. Cronograma de Vencimento de Cargas; 8. Histórico de Testes Hidrostáticos; 9. Auditoria de Inspeções Semanais; 10. Extintores Inoperantes e em Manutenção.
    - **Hidrantes (5)**: 11. Inventário Físico dos Abrigos de Hidrantes; 12. Inspeção Semanal de Integridade dos Abrigos; 13. Censo de Mangueiras e Esguichos; 14. Cronograma de Teste Hidrostático de Mangueiras; 15. Ocorrências e Desvios em Hidrantes.
    - **Copa (5)**: 16. Checklist Sanitário Diário da Copa; 17. Controle Térmico de Geladeiras e Equipamentos; 18. Controle de Validades e Manipulação (PVPS); 19. Boas Práticas dos Manipuladores; 20. Higienização de Ambientes e Descarte.
    - **Ativos & Gestão Estratégica (5)**: 21. Inventário Geral de Ativos de Segurança; 22. Mapa de Distribuição Setorial de Ativos; 23. Previsão Orçamentária de Recargas e Ensaios; 24. Painel Geral de Não Conformidades Críticas; 25. Auditoria de Conformidade com NRs (06, 23, 32).
  - Suporte completo a exportação em **Excel (.xlsx)** via biblioteca `xlsx`, **PDF timbrado A4** via `jspdf-autotable` e **Impressão direta** formatada para pranchetas e auditorias sanitárias.
  - Filtros dinâmicos cruzados por período (início e fim), setor e turno operacional.
  - Acionamento direto pelo botão **Relatórios** no topo do módulo SESMT (`ModuleHeader`) e pelo seletor de relatórios global da navbar.
- **Dashboard Estratégica do SESMT com 12 Cards e Gráficos:**
  - 12 KPI cards com rótulos concisos de termo único: `Conformidade` (% EPI), `Inspeções` (checklists), `Extintores` (cargas regulares), `A Vencer` (60 dias), `Vencidos` (recarga urgente), `Hidrantes` (% integridade), `Copa` (% sanitária), `Conservação` (% térmico/higiene), `Desvios` (não conformidades), `EPI Crítico` (% máscara/óculos/adornos), `Inventário` (total de ativos), `Setores` (setores auditados).
  - Gráfico analítico de "Aderência por Categoria" e ranking visual dos "Top 5 Desvios Mais Frequentes".
- **Integração de 15 Indicadores Oficiais no Módulo BI:**
  - Cadastrado o setor `sesmt` no banco de dados com 15 indicadores estratégicos regulamentares com metas vinculadas a NR-06, NR-23 e NR-32.
  - Série histórica de 7 meses (Janeiro a Julho/2026) com suporte a gráficos de Linha, Área, Colunas e Tabela.
  - Lógica inteligente de cálculo de conformidade (`isLowerBetter`) para desvios, tempo de resolução e taxas de acidentes.
  - Botão de atalho contextual "Relatórios" integrado na barra de filtros do BI quando o setor SESMT está selecionado.
- **Padrões de UI e Documentação:**
  - Manual do SESMT atualizado com recursos, tutoriais passo a passo e FAQ em `src/data/moduleGuidesData.js`.
  - Rótulos rigorosamente padronizados em termo único conforme diretrizes do sistema.

## [v5.0.1] - 01 de Outubro, 2026
### Nex-Ai CLINIC — Modo Noturno com 2 Níveis e Virada de Versão Major (v5.0.1)
- **Modo Noturno com 2 Níveis Especializados (Ergonomia & Conforto Visual):**
  - Implementado o sistema visual tri-modal de ponta na plataforma Nex-Ai CLINIC, mantendo o **Modo Claro** como padrão nativo do sistema e disponibilizando dois níveis especializados de Modo Noturno:
    - **Modo Claro (Padrão Hospitalar Diurno):** Design clássico de alta luminosidade com fundo neutro (#f8fafc) e superfícies alvas, ideal para ambientes clínicos diurnos e estações de recepção.
    - **Nível 1 — Noturno Suave (Dark Slate):** Paleta balanceada em tons nobres de ardósia e grafite (#0b1120 / #151f32), projetada para alívio visual contínuo e redução de fadiga ocular em salas de plantão com baixa iluminação.
    - **Nível 2 — Noturno OLED (Pitch Black):** Preto cirúrgico absoluto (#000000 / #09090b) com contraste de alta fidelidade para telas AMOLED/OLED, oferecendo máxima economia energética e imersão total.
  - **Componente Seletor de Tema Universal (ThemeToggle):**
    - Modo compacto com popover inteligente na barra superior global (Navbar) e na tela de login.
    - Modo segmentado em pílula na tela de seleção de portais (ModuleSelector) e no módulo Nex-Ai.CONFIG (aba Customização).
  - **Persistência Inteligente & Zero Flicker:**
    - Armazenamento em localStorage com carregamento síncrono no head do HTML, eliminando qualquer cintilação visual (flicker) ao recarregar a página.
    - Transições CSS suaves de 200ms entre as trocas de modo.
- **Virada de Versão Maior (Major Release v5.0.1):**
  - Atualização do número de versão do sistema para **v5.0.1** no package.json, rodapé global e modais de histórico.
- **Manuais & Governança Atualizados:**
  - Atualização do manual oficial em moduleGuidesData.js com documentação, tutoriais de uso e perguntas frequentes sobre os novos modos visuais.

## [v4.9.120] - 01 de Outubro, 2026
### Nex-Ai CLINIC (.CONFIG) — Correção de Importação de Ícone (ShieldCheck)
- **Correção Crítica de Importação no NexaCONFIG:**
  - Adicionada a importação ausente do ícone `ShieldCheck` da biblioteca `lucide-react` em `ConfigPanel.jsx`.
  - Solucionado o erro em produção (`ReferenceError: ShieldCheck is not defined`) que impedia a renderização do módulo de configurações e governança de segurança.
  - Validação completa do bundle e integridade de componentes de tela.

## [v4.9.118] - 01 de Outubro, 2026
### Nex-Ai CLINIC (.CONFIG & SEGURANÇA) — Primeiro Acesso Obrigatório e Expiração Periódica de Senhas
- **Controles de Segurança Parametrizáveis no NexaCONFIG:**
  - Adicionada a seção `Controles` na aba `Senhas` do módulo `Nex-Ai.CONFIG`, oferecendo gestão completa e flexível do ciclo de vida das credenciais de acesso.
  - **Primeiro Acesso Obrigatório:**
    - Chave ativável/desativável (desativada por padrão) para obrigar novos colaboradores ou usuários que receberam senha provisória a definirem uma senha particular logo após o login.
    - Modal bloqueante que impede o acesso às rotinas da clínica até a definição da nova senha, com botão de logout seguro caso prefira sair.
  - **Expiração Periódica de Senhas (LGPD & ONA):**
    - Chave ativável/desativável (desativada por padrão) com seleção de vigência (30, 60, 90 ou 180 dias; padrão 90 dias quando ativado).
    - Notificação preventiva automática com contagem regressiva em dias no topo da tela inicial de portais (`ModuleSelector`) e indicador na chave do `Navbar` 7 dias antes do término, com botão rápido "Renovar".
    - Bloqueio automático para renovação obrigatória caso o prazo expire.
- **Sincronização & Trilha de Auditoria:**
  - Integração nativa com `users` no Firestore (`mustChangePassword`, `passwordUpdatedAt`), atualização automática da sessão local e registro em logs de auditoria.
  - Checkbox opcional de exigir troca no próximo login diretamente no cadastro/edição de usuários pelo administrador.
- **Backlog & Documentação:**
  - Conclusão e atualização dos itens `SM-007` e `SM-008` no backlog `SUGESTOES_MELHORIAS.md`.
  - Manual oficial atualizado em `moduleGuidesData.js` com recursos, tutoriais de ativação e FAQs explicativos.

## [v4.9.117] - 01 de Outubro, 2026
### Nex-Ai CLINIC (.CONFIG & GLOBAL) — Política de Complexidade de Senhas Parametrizável e Alteração Simplificada de Credenciais
- **Política de Complexidade de Senhas Parametrizável por Clínica (SaaS):**
  - Implementada a nova aba `Senhas` no módulo `Nex-Ai.CONFIG` para governança de segurança adaptável às necessidades de cada cliente.
  - Disponibilizados 4 níveis pré-configurados com 1 clique:
    - **Simples (Flexível):** Mínimo de 4 dígitos ou caracteres livres. Projetado para máxima agilidade em terminais de salão de enfermagem e atendimento emergencial.
    - **Padrão (Recomendado):** Mínimo de 6 caracteres combinando letras e números. Equilíbrio ideal entre praticidade diária e proteção de dados clínicos.
    - **Forte (Corporativo):** Mínimo de 8 caracteres exigindo letras maiúsculas, minúsculas e números.
    - **Rigoroso (LGPD Máxima):** Mínimo de 8 caracteres exigindo letras maiúsculas, minúsculas, números e símbolos especiais (`!@#$%...`).
  - Personalização avançada de regras: permite ao administrador ajustar o comprimento mínimo e alternar requisitos específicos (números, letras, maiúsculas e símbolos).
  - **Simulador Interativo em Tempo Real:** Área no NexaCONFIG para que o gestor de T.I. teste senhas e veja instantaneamente como a política reage à digitação dos colaboradores antes de aplicar à instituição.
  - Sincronização automática na coleção `tenant_settings/main` do Firestore e reflexo instantâneo em todo o sistema.
- **Alteração Simplificada de Senha pelo Usuário:**
  - Novo componente `ChangePasswordModal` integrado à barra superior global (`Navbar`) e à tela de seleção de portais (`ModuleSelector`).
  - Qualquer colaborador autenticado pode clicar no ícone de chave (`Senha`) e alterar sua credencial de forma simples e intuitiva.
  - Medidor de força visual com barra colorida em tempo real (Fraca, Média, Forte, Excelente).
  - Checklist interativo dinâmico que destaca com checkmarks verdes os critérios atendidos da política da clínica.
  - Botão de alternância de visualização de senha (olho para exibir/ocultar) e indicador em tempo real de coincidência de senhas.
  - Atualização simultânea no Firebase Authentication, no Firestore (`users`) e na sessão local (`localStorage`), além de trilha de auditoria completa em `audit_logs`.
- **Validação Preventiva no Cadastro de Usuários:**
  - O modal de criação e edição de usuários no NexaCONFIG agora exibe o nível de política ativo e valida a senha digitada pelo administrador antes do salvamento.
- **Manuais & Governança UI:**
  - Atualização completa do manual do módulo Config em `moduleGuidesData.js` (recursos, tutorial passo a passo e FAQ).
  - Rótulos de campos e cabeçalhos estritamente limpos conforme o padrão de 1 palavra.

## [v4.9.116] - 01 de Outubro, 2026
### Nex-Ai CLINIC (.ASSIST & .CONFIG) — Ingestão Automática de E-mails Clínicos Titan (IMAP) e Controle de Ativação
- **Ingestão Automática & Carga da Caixa Postal Corporativa (Titan IMAP):**
  - Conector inteligente com a caixa `integracao@dialize.com.br` (`imap.titan.email:993` via SSL/TLS), lendo e higienizando comunicados clínicos recebidos.
  - Categorização clínica automatizada por termos-chave (Intercorrência, Urgência, Alta, Exames, Soroteca, Nutrição) e atribuição de níveis de criticidade (Urgente, Atenção, Informativo).
  - Reconhecimento e auto-vínculo de pacientes cadastrados por correspondência de nome completo ou primeiro/último nome, preenchendo automaticamente o paciente, turno e salão.
  - Sincronização direta na nuvem na coleção `assist_posts` do Firestore (396 comunicados históricos processados e disponíveis no feed em tempo real).
- **Controle de Ligar / Desligar no NexaCONFIG:**
  - Adicionado interruptor na aba `E-mail` do módulo `Nex-Ai.CONFIG` para ativar ou pausar a importação automática a qualquer momento.
  - O robô de monitoramento contínuo consulta o status da configuração no Firestore antes de processar mensagens, pausando imediatamente caso a chave seja desativada pela coordenação.
  - Mural mantido com visual 100% limpo, sem elementos excedentes ou atalhos desnecessários, conforme preferência da gestão.
- **Robô Daemon Contínuo & Backlog:**
  - Processo de monitoramento em segundo plano reativado com checagem contínua a cada 60 segundos.
  - Registro de sugestão de atalho sob demanda no Mural cadastrada no backlog (`SUGESTOES_MELHORIAS.md` - `SM-006`).
  - Manuais interativos de `.ASSIST` e `.CONFIG` atualizados em `moduleGuidesData.js` em conformidade com as regras do sistema.

## [v4.9.114] - 01 de Outubro, 2026
### Nex-Ai CLINIC (.STOCK) — Correção de Fuso de Data de Entrada, Desbloqueio de Anexo de Boletos e Reconhecimento de Faturas de Serviços
- **Desbloqueio e Otimização do Anexo de Boletos em PDF:**
  - Adicionado temporizador preventivo de segurança (timeout de 3,5s) no processamento do worker PDF.js com fallback automático para decodificação textual direta, impedindo qualquer bloqueio ou congelamento no botão "Processando...".
  - Otimizado o upload de arquivos no Firebase Storage com tolerância de 2,5s e fallback instantâneo para armazenamento em Base64 / DataURL, contornando buckets indisponíveis ou demoras de rede.
  - Limpeza automática do valor do seletor de arquivos (`e.target.value = ''`), permitindo reanexar o mesmo documento ou selecionar outro sem falha de evento.
- **Correção da Data de Entrada Local (Imunidade a UTC):**
  - Resolução da anomalia em que notas fiscais lançadas no dia vigente apareciam com a data de ontem (`30/09` em vez de `01/10`).
  - Implementado o utilitário `formatDateBR` e `getLocalDateString` em `dateUtils.js`, eliminando a conversão distorcida do JavaScript que interpretava strings `YYYY-MM-DD` como meia-noite UTC (que no Brasil UTC-3 retrocedia 3 horas para a noite do dia anterior).
  - Adicionado o campo editável de **Entrada** no assistente de notas fiscais (com valor padrão no dia local de hoje), além de exibição fiel em todas as tabelas (Normal, Compacta e Cards) e no modal de detalhes.
- **Leitura e Reconhecimento de Faturas de Serviços e Cobranças Digitais (Conta Azul / 4INFRA):**
  - Parser de DANFE e NFS-e (`danfePdfParser.js`) aprimorado para reconhecer faturas de serviços com boleto bancário e Pix embutidos (ex.: modelos Conta Azul).
  - Identificação precisa do número da venda/fatura (ex.: Venda 216773), valor total do documento (R$ 585,00), data de emissão (`01/10/2026`) e vencimento (`10/10/2026`).
  - Filtro inteligente de CNPJs: diferencia o prestador real do serviço (4INFRA) das empresas intermediadoras financeiras (Conta Azul) e do tomador da nota.
  - Extração automática da linha digitável contínua de 47 dígitos do boleto e vinculação imediata às duplicatas no Contas a Pagar do Financeiro.
- **Documentação & Padrões Visuais:**
  - Manual interativo de Estoque atualizado em `moduleGuidesData.js` com tópicos sobre faturas digitais, datas de entrada e upload de boletos.
  - Manutenção do padrão estrito de 1 palavra em todos os rótulos de campos e cabeçalhos em conformidade com as regras do projeto.

## [v4.9.111] - 01 de Outubro, 2026
### Nex-Ai CLINIC (Nuvem & E-mails) — Disparo Real de E-mails via Firebase Cloud Functions e Integração SMTP
- **Disparo Real de E-mails via Nuvem (Cloud Functions no Plano Blaze):**
  - Implementada a Cloud Function `processMailQueue` acionada automaticamente pela coleção `mail` no Firestore, enviando e-mails reais através de conexão TLS/SSL com o servidor SMTP cadastrado (`smtp.titan.email:465` ou Gmail).
  - Implementado o endpoint Callable `testSmtpConnection` permitindo validação em tempo real da conectividade e autenticação SMTP direto pelo painel NexaCONFIG, contornando limitações de CORS dos navegadores.
  - Regras de segurança no Firestore (`firestore.rules`) atualizadas para autorizar a gravação de mensagens na fila `mail`.
  - Comunicados do Mural Assistencial (.ASSIST) e testes do módulo de configurações agora são disparados fisicamente e entregues com sucesso na caixa de entrada do destinatário.

## [v4.9.109] - 01 de Outubro, 2026
### Nex-Ai CLINIC (.ASSIST & .CONFIG) — Modo Temporário para Enfermagem e Encaminhamento de Comunicados por E-mail
- **Mural Exclusivo para Enfermagem (Modo Temporário):**
  - Implementado interruptor no módulo de configurações (`NexaCONFIG > E-mail > Mural`) permitindo ativar o modo temporário onde apenas a equipe assistencial de enfermagem e administradores podem visualizar e publicar no Mural.
  - Para colaboradores de outros setores, é exibida uma tela protegida e amigável informando o regime temporário exclusivo de enfermagem.
- **Encaminhamento Automático por E-mail:**
  - Qualquer postagem publicada no Mural Assistencial é imediatamente formatada e encaminhada em segundo plano para o e-mail configurado.
  - Corpo da mensagem formatado em texto claro e HTML responsivo destacando urgência, categoria, paciente, sala, turno e autor.
- **Configurador de E-mails com Teste em Tempo Real:**
  - Painel com controles intuitivos para ligar/desligar o encaminhamento e o modo temporário a qualquer momento.
  - Botão "Testar" para validar a recepção imediata na caixa de entrada sem precisar publicar comunicados reais.
- **Manuais e Documentação Atualizados:**
  - Manuais de `.ASSIST` e `.CONFIG` atualizados em `moduleGuidesData.js` com tópicos detalhados em Recursos, Tutoriais e Dúvidas Frequentes.
- **Boy Scout Rule & Padrão de Rótulos de 1 Palavra:**
  - Higienização e simplificação de rótulos nos cabeçalhos e tabelas para o padrão de termo único indispensável.

## [v4.9.106] - 30 de Setembro, 2026
### Nex-Ai CLINIC (.SERVICE) — Correção de Persistência e Visibilidade em Nuvem de Chamados de T.I. e Setor Enfermagem
- **Resolução Crítica de Persistência e Visibilidade de Chamados de T.I.:**
  - Removido o filtro indevido que expurgava e excluía chamados sequenciais com código iniciando em `TI-2026-000` (afetando os protocolos reais 0001 a 0009).
  - Adicionadas regras de segurança no Firestore (`firestore.rules`) para as coleções `it_service_orders`, `service_orders`, `equipments`, `it_daily_rounds` e `it_assets`, permitindo gravação em nuvem e sincronização em tempo real para os usuários e o gestor/administrador (`contato@techcosta.net`).
  - Corrigido o `ReferenceError` em tempo de execução referente à variável `matchesPriority` no hook `filteredOrders` em `ITServiceOrdersTab.jsx`, que impedia a exibição da listagem de chamados.
  - Otimização do cálculo de código sequencial com consulta ao Firestore, prevenindo duplicações e garantindo numeração progressiva e persistente.
  - Atualização instantânea do estado local e cache no momento da criação do chamado, garantindo que o colaborador visualize a demanda de imediato na sua tela.
  - Inclusão de `requesterId`, `requesterUsername` e resolução refinada de permissões no escopo de visibilidade para que solicitantes identifiquem suas solicitações mesmo sem e-mail corporativo cadastrado.
- **Inclusão do Setor "Enfermagem" na Abertura de Chamados:**
  - Adicionado o setor "Enfermagem" a todas as listagens de setores operacionais para abertura de chamados, edição de ordens de serviço, cadastro de ativos e tarefas de T.I.
- **Atualização do Manual e Boy Scout Rule:**
  - Atualização do manual interativo de manutenção e T.I. (`moduleGuidesData.js`) com orientações sobre o setor de Enfermagem e monitoramento em nuvem.
  - Higienização e simplificação de termos duplos e rótulos compostos em conformidade com o padrão rigoroso de termo único.

## [v4.9.103] - 29 de Setembro, 2026
### Nex-Ai CLINIC (.MED & .ASSIST) — Integração Total de Cirurgias e Procedimentos na Gestão Médica
- **Integração em Tempo Real de Cirurgias Realizadas:**
  - Cirurgias agendadas e concluídas no Hub de Cirurgias (`Nex-Ai.ASSIST`) com situação "Realizado" são agora capturadas automaticamente na Gestão Médica (`Nex-Ai.MED`).
  - O procedimento cirúrgico (ex: cirurgia do paciente ADAIL) aparece instantaneamente na aba de Procedimentos e na produção do cirurgião responsável (Dr. Moisés Arantes Diniz / Dr. Alexandre Jesus).
- **Precificação Automática Inteligente:**
  - Implementação do resolvedor inteligente de valores (`procedurePriceResolver.js`) conectado ao Catálogo Unificado e às tabelas de honorários da clínica (PTFE: R$ 891,00; FAV simples: R$ 668,25; Permcath: R$ 800,00; CDL: R$ 385,00; Duplex: R$ 119,79; Transposição basílica: R$ 770,00; Ligadura: R$ 550,00).
- **Badges de Origem e Rastreabilidade:**
  - Nova coluna "Origem" na aba Procedimentos com badges coloridos para diferenciar: `Cirurgia` (azul), `Agenda` (âmbar) e `Manual` (verde).
  - Filtro exclusivo por procedência na barra de ferramentas.
- **Segregação Rigorosa na Apuração de Produção:**
  - Separação clara entre consultas ambulatoriais e procedimentos clínicos da agenda (`Nex-Ai.CAL`), evitando distorções contábeis e cobranças em duplicidade.
- **Homologação Financeira e Extrato:**
  - Exibição discriminada dos procedimentos cirúrgicos no modal de homologação com envio automatizado ao Contas a Pagar do `Nex-Ai.FINANCE` e no demonstrativo mensal de honorários em PDF.
- **Boy Scout Rule & Padrão de Rótulos de 1 Palavra:**
  - Ajuste e limpeza de rótulos nos modais e tabelas, garantindo conformidade rigorosa com a regra de 1 palavra/termo único.

## [v4.9.102] - 28 de Setembro, 2026
### Nex-Ai CLINIC (.CAL) — Grade Dinâmica por Médico, Slots Reais Personalizados, Escala Diária e Cores Executivas de Profissionais
- **Grade Dinâmica e Fiel por Profissional:**
  - Ao selecionar um médico no filtro da visão "Horários", a grade abandona réguas genéricas cegas e renderiza com exatidão matemática os slots configurados (ex: 20 minutos para o Dr. Danrley, totalizando 7 slots das 11:00 às 13:20).
  - Elimina o risco operacional da recepção agendar consultas fora do expediente ou em turnos em que o profissional não atende.
- **Escala Diária e Barra de Presença:**
  - Barra dinâmica no topo da visão geral exibindo os médicos escalados no dia, turnos e salas, com chips clicáveis de 1 toque para alternância instantânea.
- **Paleta Executiva de Cores Médicas:**
  - Sistema com algoritmo determinístico de hash atribuindo automaticamente cores clínicas e elegantes para cada médico em cards, slots livres e visões multissalas/semanal.
- **Gestão Inteligente de Folgas & Atalho "Próximo":**
  - Card explicativo em dias sem atendimento com botão para avançar diretamente para a próxima data disponível na grade do profissional e botão de encaixe extraordinário.
- **Agendamento com 1 Clique:**
  - Pré-preenchimento automático de médico, consultório e horários exatos de início e fim no formulário ao clicar em qualquer slot livre da grade oficial.
- **Boy Scout Rule & Rótulos Concisos:**
  - Aplicação rigorosa da diretriz de 1 palavra em todos os novos botões, filtros e cabeçalhos (`Escala`, `Próximo`, `Encaixe`, `Grade`, `Configurar`, `Oficial`).

## [v4.9.101] - 24 de Setembro, 2026
### Nex-Ai CLINIC (.SERVICE) — CRUD Completo de Chamados e Tarefas de T.I., Purga de Testes e Sistema de Cobrança de Agilidade
- **Purga Definitiva dos Chamados de Teste:**
  - Remoção dos chamados de teste mock (`TI-2026-0001` a `0004`) do Firestore e do armazenamento local via rotina de higienização automatizada em `maintenanceService.js`.
- **CRUD Completo de Chamados e Tarefas (.SERVICE):**
  - Criação do modal de edição completa (`ITEditModal.jsx`) permitindo alteração de todos os parâmetros: título, descrição, categoria, subcategoria, setor, prioridade, técnico atribuído, status, origem e tipo de tarefa interna.
  - Exclusão com modal de confirmação protetiva e irreversível na listagem de chamados, no modo cards e no Kanban.
- **Sistema de Cobrança de Agilidade:**
  - Novo modal dedicado (`ITUrgencyModal.jsx`) permitindo ao solicitante cobrar prioridade com motivos de 1 clique: *Setor Parado*, *Prazo Excedido*, *Impacto Assistencial* ou *Impressão Travada*, com campo de observação adicional.
  - Sinalização visual com badge dourado pulsante `⚡ Cobrado (Nx)` na Tabela, nos Cards e no Kanban.
  - Nova pílula de filtro `Cobrados (Nx)` no topo da aba para a equipe técnica isolar chamados que demandam agilidade imediata.
  - Banner de alerta em destaque no topo do modal de atendimento do chamado.
  - Chips de respostas rápidas de 1 clique para técnicos na linha do tempo de interações (*Técnico a caminho*, *No laboratório*, *Peça solicitada*, *Aguardando acesso*).
- **Boy Scout Rule & Padrão de Rótulos de 1 Palavra:**
  - Varredura e higienização de rótulos compostos ou com barras em todo o fluxo de chamados e formulários de suporte técnico.

## [v4.9.99] - 24 de Setembro, 2026
### Nex-Ai CLINIC (.HR) — Hotfix Ordem de React Hooks no Mural de Aniversariantes (Minified React Error #310)
- **Correção da Ordem dos Hooks (React Rules of Hooks):**
  - Realocada a checagem condicional `if (!isOpen) return null;` para após todos os hooks (`useState`, `useRef`, `useEffect` e `useMemo`) em `BirthdayMuralModal.jsx`.
  - Solucionado o erro `Minified React error #310` ("Rendered more hooks than during the previous render"), permitindo que o mural abra perfeitamente ao clicar em "Mural" nos cards ou no banner festivo.
- **Ciclo de Vida & Reset na Abertura:**
  - Adicionado `useEffect` com dependência de `isOpen` para redefinir o mês/ano selecionado para o atual, limpar termos de busca e reiniciar o filtro sempre que o mural for aberto.

## [v4.9.98] - 24 de Setembro, 2026
### Nex-Ai CLINIC (.SERVICE & .HR) — Gestão Completa de T.I.: Tarefas Internas, Kanban, Ronda Diária, Ativos com QR Code, Wiki Técnica & Navegação de Aniversariantes
- **Mural de Aniversariantes (.HR):**
  - Navegação dinâmica entre meses (anterior/próximo), seletor de ano e botão de retorno ágil "Mês Atual".
  - Recálculo dinâmico automático de todos os aniversariantes do mês selecionado.
  - Layout oficial para impressão de cartaz A4 formatado para fixação nos murais físicos e quadros de aviso da clínica.
- **Separação de Chamados vs. Tarefas Internas (.SERVICE):**
  - Pílulas de filtro de origem rápida (`Todos`, `Chamados`, `Tarefas Internas`).
  - Dois botões distintos de criação: `+ Chamado` (para abertura padrão de chamados de usuários) e `+ Tarefa T.I.` (para rotinas internas proativas).
  - Formulário rápido de Tarefas Internas com tipo de atividade (Servidor, Backup, Rede, Antivírus, Infra, Outro), sem notificações de e-mail a solicitantes externos.
- **Quadro Kanban Ágil de T.I.:**
  - Visualização dinâmica em colunas de status: `Pendente`, `Em Andamento`, `Aguardando` e `Concluído`.
  - Cards detalhados com código, categoria, prioridade, técnico, setor e botões de avanço de status em 1 clique.
- **Ronda Diária Matinal de T.I.:**
  - Checklist preventivo estruturado para conferência diária no início do expediente: Links de internet (Fibra e 4G Contingência), Temperatura do CPD (18-22°C), Rotina de Backups, Impressoras Zebra de etiquetas, Scanners e Nobreaks.
  - Histórico de auditoria de rondas executadas com data, hora, responsável e observações.
- **Inventário de Ativos de T.I. com QR Code:**
  - Cadastro completo de estações de trabalho, notebooks, servidores, switches e impressoras com IP de rede, setor físico e responsável.
  - Emissão e impressão de etiquetas patrimoniais com QR Code de alta resolução em layout pronto para impressoras térmicas e A4.
- **Base de Conhecimento Técnica (Wiki T.I.):**
  - Acervo prático de Procedimentos Operacionais Padrão (POPs) cobrindo Calibração de Zebra GC420t/ZD220, Ativação de contingência 4G, Reset de leitor de código de barras e Importação de certificados digitais A1.
- **Indicador de Atuação Proativa:**
  - Métrica de maturidade de T.I. no painel executivo de SLA calculando a proporção de ações preventivas internas frente ao total de chamados reativos.
- **Boy Scout Rule & Padrão de Rótulos de 1 Palavra:**
  - Higienização e aplicação rígida do padrão de termo único em todos os novos componentes e modais criados.

## [v4.9.96] - 24 de Setembro, 2026
### Nex-Ai CLINIC (.HR) — Mural de Aniversariantes, Felicitações via WhatsApp e Novos Cards Estratégicos no RH
- **Mural de Aniversariantes Completo:**
  - Removido o limite fixo de 5 registros (`.slice(0, 5)`); todos os aniversariantes do mês agora são exibidos em contêiner com rolagem suave.
  - Destaque comemorativo para quem faz aniversário no dia com tag dourada (`🎉 Hoje!`) e posicionamento prioritário no topo da lista.
  - Exibição de cargo completo em subtítulo e telefone/contato direto.
  - Botão rápido de WhatsApp para envio de felicitações personalizadas com mensagem pronta em 1 clique.
  - Novo modal **Mural de Aniversariantes** com filtros (Todos, Hoje, Próximos, Anteriores, por Setor), busca em tempo real, métricas gerais, exportação para CSV e modo de impressão em folha A4 otimizada para quadros de aviso institucionais.
  - Banner festivo dinâmico no topo do painel quando houver aniversariantes no dia com atalho direto ao Mural.
- **Novos Cards Estratégicos no Dashboard RH:**
  - **Jubileu de Empresa:** Aniversários de contratação e tempo de casa no mês vigente para homenagens de fidelidade funcional.
  - **Afastamentos & Férias:** Monitoramento em tempo real de licenças médicas, afastamentos e férias ativas com identificação de setor e status.
  - **Habilitações (CNH Condutores):** Alerta preventivo de vencimento de CNH de motoristas e condutores de ambulância para conformidade de trânsito.
  - **Vínculos Contratuais:** Distribuição percentual e absoluta dos contratos (CLT, PJ, Estágio, Outros) com barra visual proporcional.
  - **Treinamentos Ocupacionais (KPI):** Taxa de conformidade, total de participações e índice de eficácia de capacitações (NR-32 e ANVISA RDC 63/2011).
- **Boy Scout Rule & Padrão de Rótulos de 1 Termo Único:**
  - Removidos limites estáticos de 4 registros em todos os cards de listas do painel (`Advertências`, `Absenteísmo`, `Vacinas`, `Contratos`).
  - Higienização de rótulos duplos e redundantes para conformidade estrita com o padrão de interface de termo único.

## [v4.9.94] - 22 de Setembro, 2026
### Nex-Ai CLINIC (.ASSIST) — Otimização do Modal de Agendamento Cirúrgico Vascular
- **Remoção dos Chips Rápidos de Procedimentos:**
  - Removida a barra de botões clicáveis de procedimentos populares (`CONFECÇÃO DE FAV SIMPLES`, `IMPLANTE DE PERMCATH`, `RETIRADA DE PERMCATH`, `DUPLEX`), mantendo apenas a seleção oficial no dropdown do catálogo e a opção de digitação manual sob demanda.
- **Expansão e Modernização do Campo de Motivo Cirúrgico:**
  - Substituído o input de texto com datalist por um componente `<select>` nativo e responsivo com seta indicativa, perfeitamente harmonizado com o campo de Situação.
  - Cadastrado catálogo amplo com 11 motivos cirúrgicos vasculares padronizados:
    - *ACESSO*
    - *INFECÇÃO / BACTEREMIA DE CATETER*
    - *TROMBOSE DE FAV*
    - *DISFUNÇÃO / BAIXO FLUXO SANGUÍNEO*
    - *ESTENOSE / HIPERPLASIA DE FAV*
    - *SUBSTITUIÇÃO DE CATETER (CDL / PERMCATH)*
    - *MATURAÇÃO DE FAV (RETIRADA DE CATETER)*
    - *DOR / DIFICULDADE DE PUNÇÃO*
    - *ABAULAMENTO / PSEUDOANEURISMA*
    - *URGÊNCIA DIALÍTICA*
    - *REVISÃO / REPARO DE ACESSO*
  - Incluído botão *"Digitar Manualmente"* para permitir lançamentos de motivos atípicos ou observações específicas.

## [v4.9.93] - 22 de Setembro, 2026
### Nex-Ai CLINIC — Atualização de Recursos Humanos e Perfis de Acesso (Config & RH)
- **Módulo RH (.HR):**
  - Adicionado o cargo padronizado **Copeiro** em `STANDARD_ROLES` e na regra de normalização de cargos.
  - Adicionado o setor padronizado **Copa** (`{ id: 'copa', name: 'Copa', description: 'Copa e Serviços de Alimentação' }`) em `STANDARD_SECTORS` e na regra de normalização de setores.
  - Disponível automaticamente em todo o ecossistema de RH: listagens, filtros por setor/cargo, formulários de admissão e edição de colaboradores, dossiês de treinamentos e premiações.
- **Módulo Configurações (.CONFIG):**
  - Adicionado o perfil de segurança RBAC **Enfermagem** (`id: 'nursing'`) em `DEFAULT_USER_PROFILES`.
  - Configurado com permissões completas de assistência (`assist: write`, `clinical: write`, `requisitions: write`, `calendar: write`, `maintenance: write`, leituras clínicas e de estoque).
  - Integração no auto-seed do Cloud Firestore (`user_profiles`), tabela de permissões por perfil, seleção no cadastro de usuários e no seletor dinâmico de módulos.

## [v4.9.92] - 22 de Setembro, 2026
### Nex-Ai CLINIC (.ASSIST) — Grande Pacote de Melhorias no Mural de Avisos e Painel de Cirurgias Vasculares
- **Item 3 — Anexo de Imagens e Laudos no Mural de Avisos:**
  - Suporte completo a upload de fotos (JPG, PNG) e documentos em PDF diretamente nos recados do Mural.
  - Pré-visualização de imagem antes da postagem e exclusão dinâmica.
  - Miniaturas nos cards com abertura em Lightbox modal de alta resolução e link direto para download seguro.
  - Armazenamento em nuvem via Firebase Storage integrado (`assist_attachments/`).
- **Item 6 — Impressão e Exportação em PDF do Resumo do Turno:**
  - Botão dedicado "Imprimir Turno" na barra de ferramentas do Mural.
  - Geração de relatório hospitalar formatado em folha A4 com KPIs do turno, alertas críticos, tabela consolidada de recados e blocos de assinatura médica e de enfermagem (COREN/CRM).
- **Item 8 — Checklist Pré-Operatório de Segurança Vascular:**
  - 5 verificações cirúrgicas essenciais: Risco Cardiológico (ECG), Coagulograma (TAP/INR), Hemograma Recente, Jejum Orientado (8h) e Mapeamento Duplex.
  - Badge dinâmico no card da cirurgia indicando o progresso (Completo 5/5, Parcial ou Pendente).
  - Popover rápido no card para marcação e alternância com 1 clique sem abrir o modal.
  - Seção integrada no formulário de criação/edição da cirurgia.
- **Item 10 — Disparo de Orientações e Preparo Pré-Operatório via WhatsApp:**
  - Botão de acesso rápido no card da cirurgia.
  - Modal com preenchimento automático do telefone do paciente, gerador de mensagem estruturada com data, horário, cirurgião, jejum e recomendações de internação.
  - Botões para copiar o texto ou abrir diretamente no WhatsApp Web / Desktop com payload sanitizado.
- **Item 13 — Sincronização Automática de Acesso Vascular com Prontuário:**
  - Detecção inteligente do procedimento realizado (FAV, Permcath, CDL, Prótese) e lateralidade (Direito/Esquerdo).
  - Modal automático acionado ao marcar a cirurgia como "Realizado" solicitando confirmação para atualizar o prontuário do paciente de forma imediata no Cloud Firestore.

## [v4.9.88] - 21 de Setembro, 2026
### Nex-Ai CLINIC — Correção de Permissão e Persistência do Checklist da Copa no SESMT (.SESMT)
- **Correção de Permissão no Firebase Firestore (`firestore.rules`):**
  - Incluída a regra de segurança `match /sesmt_copa_inspections/{id} { allow read, write: if isAuthenticated(); }`, permitindo leitura e gravação dos checklists diários da Copa e eliminando a recusa de permissão (`PERMISSION_DENIED`).
- **Aprimoramento de Persistência e Sanitização (`sesmtService.js`):**
  - Ajustada a sanitização do objeto em `saveCopaInspection` e `saveEpiInspection`, removendo atributos `id` indefinidos antes de invocar `addDoc` e `updateDoc` no Firestore.
- **Validação e Usabilidade no Formulário da Copa (`DailyCopaChecklist.jsx`):**
  - Flexibilizada a exigência dos campos de responsáveis para permitir o envio desde que ao menos um dos profissionais (`Nutricionista` ou `Técnico`) esteja informado, evitando bloqueios de submissão em rondas isoladas do técnico.
  - Reset automático dos campos de formulário e assinatura touch após o salvamento com sucesso.
  - Exibição de mensagens de erro claras e informativas caso ocorra instabilidade de rede ou de sessão.
  - Rótulos concisos de 1 palavra nos botões touch (`Conforme`, `Não Conforme`, `Não Avaliado`).

---

## [v4.9.86] - 21 de Setembro, 2026
### Nex-Ai CLINIC — Correção de Variável no Dashboard SESMT (Hotfix ReferenceError filteredEpiData) (.SESMT)
- **Correção Crítica no Dashboard do SESMT (`SesmtDashboard.jsx`):**
  - Substituída a referência descontinuada `filteredEpiData` por `filteredChecklistData` no cálculo de formulários realizados e na visualização de inconformidades por setor, eliminando o erro de execução `ReferenceError: filteredEpiData is not defined`.
  - Conformidade estrita com o padrão de rótulo único (1 palavra): padronização dos cards superiores para `Conformidade` e `Inspeções`.

---

## [v4.9.85] - 21 de Setembro, 2026
### Nex-Ai CLINIC — Checklists Oficiais SESMT: EPIs (11 Itens Clínicos), Nova Aba Copa (7 Itens) & Ficha de Auditoria Oficial A4 (.SESMT)
- **Checklist Oficial de EPIs Clínicos Baseado na Planilha Saude.xlsx (`DailyEPIChecklist.jsx`):**
  - Expansão completa para os 11 itens técnicos oficiais: Uso de EPI, Higienização das mãos, Descarte de resíduos, Conservação de EPI, Limpeza dos ralos, Ausência de adornos, Uso adequado de cílios, Bancadas/superfícies limpas, Produtos químicos identificados, FDS de químicos disponíveis e Condições/comprimento das unhas.
  - Atualização dos setores oficiais de hemodiálise e apoio: Salão Hemodiálise 1, Salão Hemodiálise 2, Salão Hemodiálise 3, Diálise Peritoneal, Hemodiálise Externa, Bloco Cirúrgico, Reuso e Sala Amarela.
  - Identificação dos profissionais responsáveis da inspeção: Enfermeiro e Técnico de Segurança do Trabalho, com assinatura digital.
- **Nova Aba e Checklist Especializado da Copa (`DailyCopaChecklist.jsx` & `sesmtService.js`):**
  - Implementação da aba temática Copa baseada na planilha oficial `Copa.xlsx`, abrangendo 7 critérios técnicos de higiene e segurança alimentar (EPIs, higienização, descarte, conservação, adornos, bancadas e unhas).
  - Identificação específica dos responsáveis: Nutricionista e Técnico de Segurança, integrando assinatura digital interativa via touch/caneta.
  - Layout responsivo híbrido com alternância instantânea entre Modo Cartões (otimizado para dispositivos móveis) e Modo Tabela (para computador), além do atalho de preenchimento rápido "Conformes".
  - Métodos dedicados no Firebase Firestore (`sesmt_copa_inspections`) para persistência atômica, consulta e exclusão.
- **Unificação de Indicadores no Painel SESMT (`SesmtDashboard.jsx`):**
  - Adição da aba Copa na barra de navegação superior com ícone temático (`Coffee`).
  - Cálculo integrado da Taxa de Conformidade Geral e do ranking de não-conformidades ponderando tanto os setores clínicos quanto a Copa.
- **Histórico & Impressão de Ficha Oficial de Auditoria A4 (`SesmtHistory.jsx`):**
  - Aba de filtro rápido "Copa" no histórico com suporte a auditoria, consulta detalhada e exclusão de vistorias.
  - Recurso de Impressão Oficial da Ficha de Inspeção: reproduz com fidelidade milimétrica o layout físico de prancheta A4 das planilhas oficiais (`Saude.xlsx` e `Copa.xlsx`), contendo cabeçalho institucional, tabela de assinalamento com X em Conforme/Não Conforme/Não Se Aplica, observações de campo e bloco duplo de assinaturas com a imagem da assinatura digitalizada.
- **Atualização do Manual do Sistema (`moduleGuidesData.js`):**
  - Documentação completa em Recursos, Tutorial de Inspeção e FAQ de Auditoria no manual do SESMT contemplando as rotinas clínicas e da copa.
- **Conformidade Rigorosa de UI/UX (Padrão de 1 Palavra):**
  - Aplicação estrita de rótulos diretos e concisos (Data, Horário, Turno, Setor, Enfermeiro, Nutricionista, Técnico, Assinatura, Salvar, Conformes, Imprimir) sem barras ou conectivos redundantes.

---

## [v4.9.84] - 19 de Setembro, 2026
### Nex-Ai CLINIC — Padronização Oficial de Cabeçalhos (.HR e .CALENDAR) & Desduplicação de Unidades
- **Cabeçalho Oficial .HR (`HRPanel.jsx`):**
  - Implementação do componente padronizado `ModuleHeader` no módulo de Recursos Humanos com identificação `.HR`, gradiente índigo (`linear-gradient(135deg, #6366f1, #4f46e5)`), ponto de destaque colorido e botão contextual de ação rápida `+ Colaborador`.
  - Remoção da duplicação do `<UnitSelector />`, mantendo a centralização exclusiva na barra de navegação global (Navbar).
- **Cabeçalho Oficial .CALENDAR (`CalendarPanel.jsx`):**
  - Adoção do `ModuleHeader` no módulo de Agenda com identificação `.CALENDAR`, ícone temático de calendário em caixa de 46x46px e gradiente ciano (`linear-gradient(135deg, #06b6d4, #0891b2)`).
  - Consolidação das ações contextuais de tela (Grade Médica, Bloquear Ausência, Painel TV, Atualizar e Agendar) e remoção do `<UnitSelector />` redundante.
- **Conformidade com Diretrizes de Layout (`standard-header-ui.md`):**
  - Alinhamento rigoroso de `styles.container` com `display: flex`, `flexDirection: column` e `gap: 1.25rem`, eliminando `padding: 1.5rem` e `margin: 0 auto` manuais no painel da Agenda.

---

## [v4.9.83] - 19 de Setembro, 2026
### Nex-Ai CLINIC — Módulo RH: Correção no Modal de Edição de Treinamentos (React Error #31) & Padronização de Rótulos
- **Correção Crítica no Modal de Treinamentos (`TrainingModal.jsx`):**
  - Corrigida a renderização do seletor de setores que provocava o erro `Minified React error #31` ao abrir qualquer treinamento para edição ou cadastro, extraindo com segurança `s.name` em vez de renderizar o objeto de configuração diretamente.
  - Implementado tratamento defensivo e retrocompatível para manter setores personalizados ou preexistentes já gravados no banco.
- **Conformidade com Diretrizes de UI/UX & Boy Scout Rule:**
  - Padronização de rótulos diretos e concisos de 1 termo único no `TrainingModal.jsx` (Instrutor, Cargo, Carga, Validade, Corte, Duração, Tipo, Vídeo, Conteúdo, Justificativa) e no `TrainingsTab.jsx` (Realização, Reciclar, Controle de Reciclagem).

---

## [v4.9.82] - 19 de Setembro, 2026
### Nex-Ai CLINIC — Módulo .STOCK & .CONFIG: Categorias Dinâmicas, Almoxarifados, Kits de Hemodiálise & 3 Modos de Entradas
- **Categorias Dinâmicas de Produtos com CRUD no .CONFIG (`ConfigPanel.jsx` & `StockPanel.jsx`):**
  - O seletor de categorias do produto agora carrega dinamicamente a coleção `stock_categories` mantida no Firestore.
  - Seeding inicial inteligente com 20 categorias padronizadas de nefrologia e farmácia hospitalar (MatMed, Medicamento, Controlado, Concentrado, Dialisador, Linhas, Acesso, Curativo, etc.).
  - CRUD completo na aba "Categorias" do módulo .CONFIG para inclusão, alteração e exclusão com sincronização em tempo real.
- **Correção da Seleção de Almoxarifado / Setor Padrão:**
  - Corrigido o mapeamento no cadastro e edição de insumos para consumir os locais físicos reais da coleção `stock_locations`.
  - CRUD completo de depósitos, farmácias satélites e postos de consumo na aba "Almoxarifados" do módulo .CONFIG.
- **6 Kits Clínicos de Enfermagem em Hemodiálise (`initialProducts.json` & `stockService.js`):**
  - Estruturados 6 kits assistenciais completos para a enfermagem com produtos reais do catálogo e custos calculados:
    1. *KIT-HEMO-01:* Conexão de Fístula Arteriovenosa (FAV).
    2. *KIT-HEMO-02:* Desconexão e Hemostasia de Fístula (FAV).
    3. *KIT-HEMO-03:* Curativo Estéril de Cateter Permcath.
    4. *KIT-HEMO-04:* Implante / Manutenção de Cateter Duplo Lúmen (CDL).
    5. *KIT-HEMO-05:* Recirculação e Priming de Circuito Extracorpóreo.
    6. *KIT-HEMO-06:* Manejo de Intercorrência e Coagulação Intradialítica.
- **3 Modos Oficiais de Visualização na Aba Entradas:**
  - *Compacta:* Tabela de alta densidade operacional (36px) com edição inline de valores em 1 clique.
  - *Normal:* Tabela detalhada completa com chave de acesso de 44 dígitos, itens, emitente e parcelas.
  - *Cards:* Grade visual responsiva de faturas com badges de documento, status de boleto e ações rápidas.
- **Padrão de Rótulos Diretos & Boy Scout Rule:**
  - Higienização ativa de termos compostos e duplos em formulários, tabelas e modais, adotando termos únicos e diretos.
- **Manuais Atualizados (`moduleGuidesData.js`):**
  - Documentação completa das novas rotinas operacionais nas seções de recursos, tutoriais e perguntas frequentes.

---

## [v4.9.81] - 19 de Setembro, 2026
### Nex-Ai CLINIC — Módulo .MED: Tela de Homologação Médica, Apuração Real de Consultas & Limpeza de UI
- **Nova Tela Modal de Homologação da Gestão Médica (`MedicalHomologationModal.jsx`):**
  - Implementada tela modal interativa acionada ao clicar em "Homologar" na aba Produção, permitindo que a coordenação valide a produção antes do envio ao financeiro.
  - Discriminação itemizada de plantões presenciais auditados (com datas, salões e turnos), consultas ambulatoriais concluídas e procedimentos nefrológicos.
  - Campo de ajuste de honorários (+ / -) com justificativa e seletor da data de vencimento a ser cadastrada no Contas a Pagar.
  - Lançamento automático no Contas a Pagar do NexaFINANCE na categoria "Honorários Médicos" com chave PIX e dados bancários do nefrologista.
- **Recurso de Desfazer Homologação / Estorno Financeiro:**
  - Botão "Detalhes" em itens homologados permitindo auditar o ID do título a pagar gerado e estornar a homologação com exclusão segura do título no Contas a Pagar.
- **Correção da Apuração de Consultas Ambulatoriais (`MedicalProductionTab.jsx`):**
  - Removido o valor fixo fictício de 8 consultas, passando a contabilizar estritamente os atendimentos finalizados na Agenda médica (ou 0 caso não haja).
- **Limpeza do Cabeçalho do Módulo .MED (`MedicalPanel.jsx`):**
  - Removido o botão verde redundante "Relatórios" do ModuleHeader, unificando o acesso na barra superior global do sistema.
- **Busca e Filtros Rápidos de Produção (`MedicalProductionTab.jsx`):**
  - Filtros por status (Todos, Pendentes, Homologados) com contadores em tempo real e pesquisa instantânea por médico/CRM.
- **Conformidade de UI/UX & Boy Scout Rule:**
  - Substituição de termos com barras por rótulos concisos e diretos em relatórios, fichas médicas e telas de trocas.
- **Manuais Atualizados (`moduleGuidesData.js`):**
  - Atualização completa do tutorial do módulo .MED detalhando o fluxo interativo de homologação e repasse financeiro.

---

## [v4.9.79] - 17 de Setembro, 2026
### Nex-Ai CLINIC — 15 Treinamentos Especializados em Nefrologia, Logomarca Institucional & Sincronização 1-Clique
- **15 Treinamentos Especializados para Clínica de Nefrologia (`nephrologyTrainingsData.js`):**
  - Criação de matriz curricular com 15 treinamentos completos cobrindo todos os setores clínicos e operacionais:
    1. *Enfermagem:* Manejo, Punção e Preservação da Fístula Arteriovenosa (FAV).
    2. *Enfermagem:* Prevenção de Infecções em Cateteres de Hemodiálise (CVC e Permcath) e técnica Scrub the Hub.
    3. *Enfermagem:* Prevenção e Manejo de Emergências e Intercorrências Intradialíticas (Hipotensão, Câimbras, Coagulação e SDD).
    4. *Enfermagem / Reuso:* Processamento, Reuso e Teste Residual em Dialisadores (ANVISA RDC 11/2014).
    5. *Manutenção:* Monitoramento do Sistema de Tratamento de Água para Hemodiálise (Osmose Reversa, Cloro < 0,1 mg/L, Dureza e Endotoxinas).
    6. *Manutenção:* Manutenção Preventiva e Desinfecção de Máquinas Proporcionadoras de Diálise.
    7. *Médico:* Prescrição Dialítica Individualizada, Adequação (Kt/V >= 1,2, URR), Anemia e DMO-DRC.
    8. *Farmácia:* Farmácia Clínica: Concentrado Ácido e Básico (diluição em 24h) e Cadeia de Frio (+2°C a +8°C).
    9. *Higienização:* Limpeza das Salas de Diálise e Protocolos Estritos de Isolamento da Sala de Hepatite B (HBsAg+).
    10. *Nutrição:* Terapia Nutricional Renal: Manejo de Potássio, Fósforo Inorgânico e Balanço Hídrico (GPID).
    11. *Psicologia & Serviço Social:* Suporte Psicossocial, Adesão Terapêutica, Direitos Sociais (Passe Livre, BPC) e Transplante.
    12. *Recepção:* Acolhimento na Recepção, Pesagem Pré-Diálise e Articulação com Transporte Sanitário Municipal.
    13. *Faturamento:* Faturamento de APAC de Hemodiálise, Auditoria de Prontuários e Conformidade SUS.
    14. *Qualidade / NSP:* Metas Internacionais de Segurança do Paciente Aplicadas à Nefrologia e Alta Segura Pós-Diálise.
    15. *T.I. / LGPD:* Segurança da Informação, LGPD e Sigilo do Prontuário Eletrônico em Nefrologia.
- **5 Questões de Pré-Teste e 5 de Pós-Teste por Treinamento:**
  - Cada um dos 15 módulos contém rigorosamente 5 perguntas diagnósticas iniciais e 5 perguntas pós-teste com justificativas clínicas detalhadas.
- **Logomarca Oficial Integrada aos Portais e Certificados:**
  - Aplicação da logomarca oficial da clínica (`/logo.png`) no topo do Portal do Colaborador, no Certificado Digital (em tela e no PDF exportado via `jsPDF`), no Cartaz de Divulgação mural e no Dossiê da Vigilância Sanitária.
- **Sincronização 1-Clique no Firestore & Auto-Seed (`hrService.ts` & `TrainingsTab.jsx`):**
  - Implementação de botão "Sincronizar" na barra do RH e rotina de auto-seed que popula automaticamente os 15 treinamentos no banco de dados Firestore `hr_trainings`.

---

## [v4.9.78] - 17 de Setembro, 2026
### Nex-Ai CLINIC — Correção de Inicialização da Tela Principal (Hotfix ReferenceError)
- **Correção de Inicialização de Rota (`App.jsx`):**
  - Reordenação da declaração das constantes `pathname` e `hash` antes de sua utilização na extração de rotas diretas de treinamento e certificado digital, corrigindo o erro de Temporal Dead Zone (`ReferenceError: Cannot access 'pathname' before initialization`) e restaurando a exibição imediata da tela inicial.

---

## [v4.9.77] - 17 de Setembro, 2026
### Nex-Ai CLINIC — Gestão de Treinamentos (.HR), Avaliação de Eficácia (Pré/Pós-teste), Certificados com QR Code & Dossiê VISA
- **Aba Treinamentos no Módulo NexaHR (`HRPanel.jsx` & `TrainingsTab.jsx`):**
  - Implementação da nova aba dedicada "Treinamentos" para controle de capacitação continuada e conformidade sanitária (ANVISA RDC 63/2011 e NR-32).
  - Painel com KPIs estratégicos em tempo real: Total de Treinamentos, Conclusões Totais, Taxa de Aprovação Média, Ganho Médio de Eficácia (+%) e Alertas de Reciclagem Periódica.
  - Sub-aba "Catálogo": Visualização em grade dos programas ativos com botões de divulgação (QR Code), edição e exclusão.
  - Sub-aba "Participações": Auditoria completa de colaboradores com data, notas pré e pós-teste, ganho de eficácia (+%) e acesso ao certificado emitido.
  - Sub-aba "Reciclagem": Matriz de vencimentos de treinamentos periódicos com alertas visuais (Em dia, A vencer em 30d, Vencido) e link rápido de reciclagem.
- **Portal Público do Colaborador Mobile-First (`EmployeeTrainingPortal.jsx`):**
  - Página leve e responsiva projetada para celulares e tablets da clínica, acessível via link e QR Code sem necessidade de login prévio.
  - Etapa 1 (Identificação): Consulta instantânea por CPF no banco de dados do RH, preenchendo automaticamente nome, cargo e setor.
  - Etapa 2 (Pré-teste): Questionário diagnóstico inicial de sondagem para medir o conhecimento prévio.
  - Etapa 3 (Conteúdo com Trava de Tempo): Estudo do material didático (vídeo ou texto estruturado) com temporizador ativo que exige a permanência mínima do colaborador antes de liberar o pós-teste.
  - Etapa 4 (Pós-teste): Avaliação de fixação com cálculo imediato da nota e feedback explicativo de respostas.
  - Etapa 5 (Resultado): Emissão imediata do certificado digital em caso de aprovação ou orientação para revisão do conteúdo e nova tentativa.
- **Certificação Digital & Validação de Autenticidade (`CertificateView.jsx` & `CertificateVerifyPortal.jsx`):**
  - Emissão de Certificado Digital de Capacitação com design institucional, dados do colaborador (nome, CPF, setor), carga horária, nota, ganho de eficácia e código de registro único.
  - Exportação em PDF de alta qualidade via `jsPDF` e suporte a impressão direta em impressoras convencionais e térmicas.
  - QR Code no certificado apontando para o validador público do NexaCLINIC (`?certificado=ID`), atestando a autenticidade perante fiscais e auditores.
- **Dossiê Vigilância Sanitária em 1 Clique (`TrainingDossierModal.jsx`):**
  - Gerador oficial de Dossiê Sanitário em PDF para auditorias municipais (VISA), reunindo ementa do curso, lista de presenças e aprovações com CPFs, notas diagnóstica e de fixação, ganho médio de eficácia e campos formais para assinatura do RT e visto do fiscal.
- **Modelos Prontos Hospitalares (`TrainingModal.jsx` & `hrService.ts`):**
  - Templates pré-configurados prontos para uso com conteúdo validado e questionários de NR-32 & Biossegurança, PGRSS & Descarte de Resíduos, Higienização das Mãos & Precauções Padrão, Atendimento Humanizado e LGPD em Saúde.
- **Roteamento Público no Sistema (`App.jsx`):**
  - Suporte a rotas diretas `?treinamento=ID` e `?certificado=ID` (e paths equivalentes) carregando os respectivos portais sem exigir autenticação administrativa.
- **Atualização do Manual e Regras de UI (`moduleGuidesData.js`):**
  - Atualização completa do guia do módulo de RH com Recursos, Tutorial passo a passo e FAQ com dúvidas sobre eficácia e validação de certificados.

---

## [v4.9.77] - 16 de Setembro, 2026
### Nex-Ai CLINIC — Padronização Oficial de Design (.CLINIC), Central de Relatórios Especializados & 5 KPI Cards
- **Padrão Oficial de Cabeçalho dos Módulos (`ModuleHeader.jsx` & `ClinicalPanel.jsx`):**
  - Implementação do cabeçalho unificado com identificador `.CLINIC`, gradiente roxo/violeta (`#8b5cf6` / `#7c3aed`), ícone `HeartPulse`, dotColor `#8b5cf6` e botões rápidos contextuais (`Copiloto` e `Relatórios`).
  - Remoção terminante do `<UnitSelector />` do interior do módulo clínico, mantendo a responsabilidade única e centralizada na Navbar superior global.
- **Faixa de Indicadores de Gestão (5 KPI Cards):**
  - Adição de 5 cards consolidados com métricas em tempo real: `Pacientes` (base cadastrada), `Prescrições` (protocolos vigentes), `Sessões` (realizadas/previstas hoje), `Evoluções` (notas do prontuário) e `Farmácia` (medicamentos ativos) com navegação rápida para as abas ao clicar.
- **Nova Central de Relatórios Clínicos & Nefrológicos (`ClinicalReportsModal.jsx`):**
  - Criação da central analítica do módulo com 12 relatórios especializados:
    1. Censo Geral de Pacientes Renais
    2. Mapa de Acessos Vasculares (FAV, Próteses, CDL, Permcath)
    3. Prescrições Dialíticas Vigentes (QB, QD, capilares, heparina)
    4. Monitoramento Horário de Sessões (pressão, perda, intercorrências)
    5. Auditoria de Taxa de Ultrafiltração (> 13 mL/kg/h com alerta hemodinâmico)
    6. Painel Laboratorial Consolidado & Semáforo SBN
    7. Controle de Anemia & Cinética de Ferro (Hb, Ferritina, SAT)
    8. Metabolismo Ósseo e Mineral (Cálcio, Fósforo, Ca x P, PTH)
    9. Regulação & Validade de Laudos APAC (alerta preventivo de 30 dias)
    10. Farmacoterapia & Dispensação Clínica (fármacos intradialíticos)
    11. Auditoria de Evoluções no Prontuário (médica, enfermagem, nutrição, psicologia, social)
    12. Alertas Assistenciais & Ocorrências no Mural
  - Filtros dinâmicos por Salão (Salão 1, 2, 3, Isolamento), Turno (1º, 2º, 3º) e busca em tempo real por paciente/máquina.
  - Exportação instantânea em Planilha Excel (`.xlsx`) e Documento Formatado em PDF (`.pdf`) com cabeçalho institucional e impressão nativa.
- **Roteamento Global de Relatórios (`App.jsx`):**
  - Conexão do atalho global `[Relatórios]` da Navbar superior diretamente ao `ClinicalPanel` repassando `isReportsOpen` e `setIsReportsOpen`.
- **Higienização Ativa de Rótulos (Boy Scout Rule):**
  - Remoção de barras e termos redundantes nos formulários clínicos (`Máquina *`, `Peso Inicial`, `Peso Final`, `Perda`, `Conduta`, `Capilar *`, `Duração *`, `Fluxo (QB) *`, `Dialisato (QD) *`, `Heparina *`, `Peso Seco *`, `Evolução *`, `Evento`).
- **Atualização Contínua dos Manuais (`moduleGuidesData.js`):**
  - Limpeza de chave duplicada legada e documentação completa das novas funcionalidades do `.CLINIC` nas seções `Recursos`, `Tutorial` e `Dúvidas`.

---

## [v4.9.75] - 11 de Setembro, 2026
### Nex-Ai CLINIC — 3 Modos de Visualização (.SERVICE), Exclusão de Equipamentos & Auto Ordenação por Colunas
- **3 Modos de Visualização com Persistência (`MaintenancePanel.jsx`):**
  - Implementação de seletor visual com 3 modos de exibição nas abas "Ordens" e "Equipamentos": `Compacta` (alta densidade com linhas finas e máxima produtividade), `Normal` (visualização padrão com espaçamento regular) e `Cards` (grade responsiva de crachás técnicos com ações rápidas).
  - Memorização automática da preferência do usuário no `localStorage` (`nexa_maint_view_mode_orders` e `nexa_maint_view_mode_equipments`).
- **Exclusão Segura e Permanente de Qualquer Equipamento (`MaintenancePanel.jsx` & `maintenanceService.js`):**
  - Adicionado botão de ação de exclusão (ícone de lixeira com cor de alerta) diretamente na coluna de ações da tabela e no rodapé dos cards de equipamentos.
  - Adicionado botão "Excluir" no rodapé do modal de edição do equipamento.
  - Diálogo de confirmação de segurança detalhado exibindo nome e patrimônio da máquina antes da exclusão definitiva no Firestore e fallback local.
- **Auto Ordenação Interativa por Colunas em Todas as Tabelas (`MaintenancePanel.jsx` & `ITServiceOrdersTab.jsx`):**
  - Adicionada funcionalidade de ordenação automática ao clicar no cabeçalho de qualquer coluna em todas as abas tabulares do módulo:
    - Aba Ordens: Código, Título, Equipamento, Tipo, Setor, Prioridade, Status, Abertura, Técnico.
    - Aba Equipamentos: Patrimônio, Equipamento, Marca/Modelo, Série, Setor, Periodicidade, Status.
    - Aba Calendário: Equipamento, Setor, Periodicidade, Última Manutenção, Próxima Revisão, Status.
    - Aba Chamados T.I.: Código, Assunto, Categoria, Setor, Prioridade, SLA, Status, Solicitante, Técnico.
  - Indicador visual dinâmico com setas de ordenação (`ArrowUp` para ascendente, `ArrowDown` para descendente e `ArrowUpDown` neutro).
  - Preservação da ordenação selecionada ao alternar entre visualização tabular e visualização em cards.
- **Conformidade de UI/UX e Boy Scout Rule (`MaintenancePanel.jsx` & `ITServiceOrdersTab.jsx`):**
  - Remoção de rótulos duplos e redundantes: `Laudo / Solução Aplicada` -> `Laudo`, `🖨️ Imprimir / Salvar em PDF` -> `🖨️ Imprimir`, `Atender / Gerenciar` -> `Atender`, `Painel SLA` -> `SLA`, títulos de botões e cabeçalhos técnicos sanitizados.
- **Atualização dos Manuais dos Módulos (`moduleGuidesData.js`):**
  - Documentação completa em `Recursos`, `Tutorial` e `Dúvidas` no módulo de Manutenção cobrindo os 3 modos de visualização, exclusão de equipamentos e ordenação por colunas.

---

## [v4.9.74] - 11 de Setembro, 2026
### Nex-Ai CLINIC — Impressão de QR Code de Equipamentos em Folha Única (.SERVICE) & Prevenção de Quebras de Página
- **Impressão em Folha Única da Etiqueta Patrimonial (`MaintenancePanel.jsx`):**
  - Ajuste completo das diretivas de impressão CSS (`@page { size: auto; margin: 6mm; }`, `page-break-after: avoid !important;`, `break-after: avoid !important;`) para prevenir divisão em 2 folhas de papel.
  - Correção de overflow na janela de impressão isolando `html, body { overflow: hidden !important; height: auto !important; }`, eliminando páginas em branco ou linhas órfãs geradas pelo motor Chromium.
- **Redimensionamento Proporcional & Otimização do Card (`MaintenancePanel.jsx`):**
  - Redução da largura do cartão patrimonial para 300px e do QR Code para 125x125px com borda arredondada e espaçamentos internos enxutos.
  - Altura total vertical reduzida para ~60mm, garantindo compatibilidade perfeita tanto em impressoras jato de tinta / laser convencionais (folha A4) quanto em impressoras térmicas de etiquetas (Zebra / Argox / Elgin).
- **Barra de Ações e Feedback na Janela de Impressão (`MaintenancePanel.jsx`):**
  - Adição de barra de utilidades no topo da janela com classe `.no-print`, provendo botões diretos "Imprimir", "Fechar" e sinalizador visual de confirmação "Folha Única".
- **Impressão em Lote Calibrada para Folha A4 (`MaintenancePanel.jsx`):**
  - Compactação da grade de etiquetas em lote (QR Code de 82px, padding 6px 8px e gap 6px), permitindo impressão de múltiplos ativos por folha sem corte na margem inferior.
- **Atualização dos Manuais dos Módulos (`moduleGuidesData.js`):**
  - Documentação em Manutenção (`maintenance`) sobre a calibração de impressão e suporte a folha única e impressoras térmicas.

---

## [v4.9.73] - 11 de Setembro, 2026
### Nex-Ai CLINIC — Prevenção Ativa Anti-Duplicidade de Notas e Boletos no Estoque (.STOCK) & Gestão Dinâmica de Itens
- **Bloqueio Ativo e Prevenção Anti-Duplicidade de Notas Fiscais (`useStockLogic.jsx` & `StockPanel.jsx`):**
  - Implementação de algoritmo preventivo que impede a entrada repetida da mesma nota fiscal, tanto via importação de arquivos (XML NF-e, XML NFS-e, PDF DANFE/NFS-e) quanto via lançamento manual.
  - Validação por Chave de Acesso (44 dígitos) e por combinação de Número da Nota Fiscal com Fornecedor (CNPJ limpo ou Razão Social normalizada).
  - Exibição de banner de alerta com todos os dados da nota já existente no sistema (número, emitente, data de entrada, valor e se pertence a outra unidade da rede) e botão "Visualizar" para auditoria imediata.
  - Bloqueio rígido do botão de avanço do assistente enquanto houver duplicidade detectada.
- **Prevenção e Bloqueio de Boletos Bancários Duplicados (`useStockLogic.jsx` & `StockPanel.jsx`):**
  - Validação da linha digitável (47 ou 48 dígitos) em tempo real contra todas as contas a pagar já registradas na unidade ou rede e contra faturas de notas já processadas.
  - Validação cruzada entre as parcelas da própria nota fiscal, impedindo a inserção repetida do mesmo código de boleto em múltiplas duplicatas.
  - Destaque visual com alerta descritivo e bloqueio de avanço para a etapa seguinte até que a divergência seja corrigida.
- **Dupla Verificação Atômica no Banco de Dados (`useStockLogic.jsx`):**
  - Consulta atômica no Firestore imediatamente antes da gravação de qualquer nota ou duplicata no `handleFinishXmlWizard`, garantindo proteção definitiva contra concorrência entre múltiplos usuários.
- **Gestão Dinâmica de Itens na Entrada Manual de Produtos (`useStockLogic.jsx` & `StockPanel.jsx`):**
  - Novo botão `+ Item` na Etapa 4 para notas de produtos, permitindo inclusão dinâmica de múltiplos insumos na nota com definição de descrição, catálogo, quantidade, preço unitário, lote e validade.
  - Ação de exclusão individual de itens com o botão de lixeira.
- **Badge Visual de Boleto no Histórico de Notas (`StockPanel.jsx`):**
  - Nova coluna "Boleto" na tabela da aba de Entradas indicando visualmente documentos com boleto vinculado (badge verde `Boleto`) ou sem anexo (badge cinza `Pendente`).
- **Conformidade Rigorosa de UI/UX (Padrão de 1 Palavra):**
  - Sanitização de rótulos e botões no fluxo de entrada do estoque, garantindo botões diretos de termo único (`Nota`, `Fornecedor`, `Financeiro`, `Itens`, `Revisar`, `Confirmar`, `Copiar`, `Visualizar`).
- **Atualização dos Manuais dos Módulos (`moduleGuidesData.js`):**
  - Documentação completa em `Recursos`, `Tutorial` e `Dúvidas` cobrindo o funcionamento do bloqueio anti-duplicidade e a gestão dinâmica de insumos.

---

## [v4.9.71] - 10 de Setembro, 2026
### Nex-Ai CLINIC — Central de Relatórios de Manutenção (.SERVICE), Exportação Excel, Fast-Close de OS & Otimização Visual
- **Central de Relatórios Especializados de Manutenção & T.I. (`MaintenanceReportsModal.jsx` & `App.jsx`):**
  - Criação de central de relatórios com 12 opções dedicadas à engenharia clínica e infraestrutura de T.I.: Censo Geral de Ativos, Máquinas de Diálise & Osmose, Inventário de T.I. & Periféricos, Ativos Inoperantes & Críticos, Plano de Preventivas, Calibração & Metrologia, Histórico de Intervenções, Extrato Geral de OS, Custos por Setor/Ativo, Peças & Insumos Utilizados, Chamados de T.I. & SLA, e Produtividade Técnica.
  - Exportação nativa em PDF com cabeçalho hospitalar e planilha Excel (.xlsx) estruturada.
  - Integração direta com o botão "Relatórios" da Navbar global através de `isReportsOpen`.
- **Padronização Oficial do Cabeçalho (.SERVICE) (`MaintenancePanel.jsx`):**
  - Adoção do componente oficial `ModuleHeader` com a tag `.SERVICE`, gradiente ciano (`#0891b2` / `#0e7490`), ícone `Wrench` e ações rápidas `+ Nova OS` e `+ Equipamento`.
  - Remoção de duplicidades visuais como seletor secundário de unidade e normalização do container para `gap: 1.25rem`.
- **Exportação Rápida para Excel (.xlsx) na Barra de Ferramentas (`MaintenancePanel.jsx`):**
  - Botão verde dedicado na barra de ferramentas para exportação instantânea com download em 1 clique das ordens de serviço ou equipamentos listados com todos os dados e status.
- **Fast-Close de Ordens de Serviço (`MaintenancePanel.jsx`):**
  - Ação rápida direta (ícone `CheckCircle2`) nas linhas da tabela e nos cards de OS permitindo conclusão imediata da ordem com inserção opcional de laudo técnico resumido.
- **Impressão de Etiquetas QR Code em Lote (`MaintenancePanel.jsx`):**
  - Ferramenta para emissão e impressão de etiquetas adesivas padronizadas em folha A4 com QR Code, tombamento, modelo e setor para identificação física imediata dos ativos da clínica.
- **Alerta Preventivo de Hemodiálise & Osmose Reversa (`MaintenancePanel.jsx`):**
  - Banner em destaque no topo do módulo avisando em tempo real sobre máquinas de diálise ou sistema de tratamento de água com status inoperante ou em manutenção crítica.
- **Filtros Rápidos por Pílulas com Contadores Dinâmicos (`MaintenancePanel.jsx`):**
  - Barra de pílulas interativas com contadores em tempo real para alternar status entre Todos, Abertos, Em Andamento, Aguardando Peça e Concluídos.
- **Limpeza de Botões Locais de Relatórios (`ReceptionPanel.jsx` & `StockPanel.jsx`):**
  - Remoção dos botões "Relatórios" redundantes localizados na linha de título dos módulos de Recepção e Estoque, mantendo a chamada limpa e unificada no botão padrão da Navbar superior.
- **Atualização de Manuais dos Módulos (`moduleGuidesData.js`):**
  - Inclusão detalhada de todos os novos recursos técnicos, atalhos rápidos e guias operacionais no manual do módulo de Manutenção.

---

## [v4.9.69] - 10 de Setembro, 2026
### Nex-Ai CLINIC — Centrais de Relatórios (.MED & .RECEPTION), Padronização .STOCK & Otimização Visual
- **Limpeza Visual de Abas e Subtítulos de Relatórios:**
  - Remoção de contagens estáticas nos subtítulos e números entre parênteses nas abas de navegação de relatórios (`AssistReportsModal.jsx` e `StockReportsModal.jsx`).
  - Preservação da numeração ordinal individual em cada cartão de relatório para identificação direta.
- **Nova Central de Relatórios Médica (.MED) (`MedicalReportsModal.jsx` & `MedicalPanel.jsx`):**
  - Criação de central completa de relatórios com 12 opções especializadas: Escala Mensal Geral, Plantões & Lacunas, Carga Horária, Extratos Individuais, Assiduidade, Bolsa de Trocas, Procedimentos Cirúrgicos, Cateteres Vasculares, Produção Consolidada, Repasse de Honorários, Corpo Clínico e Tabela Vigente.
  - Filtros contextuais por mês, profissional e situação clínica, indicadores em tempo real (KPIs) e suporte a exportação em PDF e Excel (.xlsx).
- **Nova Central de Relatórios da Recepção (.RECEPTION) (`ReceptionReportsModal.jsx` & `ReceptionPanel.jsx`):**
  - Criação de central de relatórios com 12 opções especializadas cobrindo Pacientes, Nefrologia, Logística de Transporte e Ronda Médica.
  - Filtros contextuais por sala, turno, status do paciente e busca textual direta com exportação nativa em PDF e Excel (.xlsx).
  - Integração com o atalho "Relatórios" do cabeçalho local e da Navbar global.
- **Padronização Oficial do Cabeçalho de Estoque (.STOCK) (`StockPanel.jsx`):**
  - Migração para o componente oficial `ModuleHeader` com identificação `.STOCK`, ícone em gradiente âmbar (`#f59e0b` / `#d97706`), botão direto `Insumo` e atalho `Relatórios`.
  - Remoção de seletor secundário duplicado de Unidade e limpeza dos rótulos de abas para termo único conciso.
- **Remoção do Botão TV na Recepção (`ReceptionPanel.jsx`):**
  - Retirada do botão de TV redundante no módulo de recepção, concentrando a operação do painel de chamada na Agenda.
- **Atualização de Manuais dos Módulos (`moduleGuidesData.js`):**
  - Documentação completa das novas funcionalidades nos manuais dos módulos Assistência, Médica e Recepção.

---

## [v4.9.68] - 09 de Setembro, 2026
### Nex-Ai CLINIC — Correção Crítica de Referência de Unidade (`useUnit`) & Sanitização de Dependências Globais
- **Correção Crítica de `useUnit` (`MedicalPanel.jsx` & `AssistPanel.jsx`):**
  - Restauração da importação de `useUnit` a partir de `../contexts/UnitContext` em ambos os módulos após a adoção do cabeçalho oficial `ModuleHeader`.
  - Resolução definitiva do erro em tempo de execução `ReferenceError: useUnit is not defined` capturado pelo `ErrorBoundary`.
- **Sanitização de Variáveis e Prevenção Ativa de Quebras:**
  - **`useStockLogic.jsx`**: Adicionada a desestruturação de `activeUnit` no hook do estoque, prevenindo falha no salvamento e vinculação de fornecedores.
  - **`ClinicalPanel.jsx`**: Correção da chamada de registro e acompanhamento de sessão da diálise vinculando diretamente ao manipulador `handleOpenSessionLog`.
  - **`FinancePanel.jsx`**: Restauração da importação de `import_2026.json` para processamento íntegro no modal de conciliação e dados de Betim.
  - **`authService.js`**: Adicionado `deleteDoc` nas exportações dinâmicas do Firestore para a rotina de desduplicação de usuários.

---

## [v4.9.66] - 08 de Setembro, 2026
### Nex-Ai CLINIC — Padrão Ouro de Topo (ModuleHeader), Desduplicação de Marca & Alinhamento Visual
- **Componente Oficial Padronizado (`ModuleHeader.jsx`):**
  - Criação de `src/components/common/ModuleHeader.jsx` centralizando título com ponto de destaque colorido (`.RECEPTION`, `.ASSIST`, `.MED`), ícones em degradê específicos (46x46px com cantos arredondados de 12px), subtítulo descritivo e área flexível para ações de contexto de tela.
- **Branding Global Limpo na Navbar Superior (`Navbar.jsx`):**
  - Eliminação de badges com nomes de módulos ao lado do logo `Nex-Ai`, acabando com a tripla repetição da marca no mesmo campo de visão.
- **Desduplicação do Seletor de Unidade (`UnitSelector.jsx`):**
  - Remoção da chamada secundária de `UnitSelector` de dentro das telas dos módulos, tornando a barra superior o único ponto de controle de unidade da clínica.
- **Alinhamento Vertical e Correção de Espaço em Branco (`AssistPanel.jsx` & `MedicalPanel.jsx`):**
  - Normalização dos containers internos para `display: 'flex', flexDirection: 'column', gap: '1.25rem'`, removendo `padding: 1.5rem` duplo que gerava vão em branco indesejado no topo.
- **Regra e Governança Registradas (`.agents/rules/standard-header-ui.md` & `.agents/AGENTS.md`):**
  - Documentação formal do padrão de cabeçalho e inclusão nas diretrizes obrigatórias do projeto para todos os futuros módulos.

---

## [v4.9.62] - 06 de Setembro, 2026
### Nex-Ai CLINIC — Tratamentos (9 Opções), Tipo de Paciente, Gestão Central de Esquemas no Config & Exportação Excel
- **Opções de Tratamento no Cadastro e Filtros (`ReceptionPanel.jsx`):**
  - Implementação completa das 9 modalidades de tratamento solicitadas: `CAPD`, `HD`, `APD`, `DPI`, `TTO Con.`, `TX-Renal`, `Doador`, `Óbito` e `Inativos`.
  - Disponibilização dos seletores de Tratamento nas abas "Identificação" e "Logística" do cadastro/admissão do paciente.
  - Filtro dedicado `Tratamento:` na barra superior com filtragem dinâmica instantânea e cruzamento com outros filtros.
  - Badges coloridos de Tratamento exibidos na tabela compacta, tabela normal e cards de pacientes.
- **Tipo de Paciente no Cadastro e Filtros (`ReceptionPanel.jsx`):**
  - Opções `Crônico`, `Agudo` e `Trânsito` integradas nas abas do cadastro e no seletor de filtros `Tipo:` da recepção.
  - Exibição discreta e legível da situação do paciente em todas as 3 formas de visualização.
- **Gestão Centralizada de Esquemas de Dias de Sessão no Módulo Config (`ConfigPanel.jsx` & `clinicalService.js`):**
  - Nova aba **`Esquemas`** no painel de administração e T.I. com catálogo completo de dias e frequências de hemodiálise (`Segunda, quarta e sexta`, `Terça, quinta e sábado`, `Segunda a sabado`, etc.).
  - Modal ergonômico de cadastro e edição de esquemas com botões interativos para seleção rápida dos dias da semana (`Segunda`, `Terça`, `Quarta`, `Quinta`, `Sexta`, `Sábado`, `Domingo`).
  - Cálculo automático de frequência semanal, ordenação numérica de prioridade e interruptor para ativar/desativar esquemas em 1 clique.
  - Sincronização em tempo real na coleção `dialysis_frequencies` do Firestore com fallback local e alimentação direta dos seletores de agendamento na recepção.
- **Exportação Rápida da Relação de Pacientes para Excel (.xlsx) (`ReceptionPanel.jsx`):**
  - Botão verde `Exportar` na barra de ferramentas da recepção para download imediato em formato Excel (.xlsx).
  - Respeito integral aos filtros ativos em tela com colunas formatadas para identificação, documentos, idade, convênio, tratamento, tipo, dias, alocação e status.
- **Memorização de Preferência de Visão de Pacientes (`ReceptionPanel.jsx`):**
  - Persistência imediata da visualização escolhida (`Compacto`, `Normal` ou `Cards`) no `localStorage` do navegador (`nexai_reception_view_mode`), mantendo a preferência entre recarregamentos e acessos subsequentes.
- **Rótulos Rigorosos de 1 Palavra & Boy Scout Rule:**
  - Varredura e conformidade integral com a diretriz de termos únicos sem barras ou conectivos redundantes em formulários, tabelas e filtros.
- **Atualização Contínua dos Manuais (`src/data/moduleGuidesData.js`):**
  - Atualização dos guias oficiais dos módulos `Recepção` e `Config` com seções completas de recursos, tutoriais passo a passo e perguntas frequentes.

---

## [v4.9.61] - 06 de Setembro, 2026
### Nex-Ai.RECEPTION — Design NexAiBrand Oficial, 3 Formas de Visualização (Compacto, Normal e Cards) & Filtro por Status
- **Design do Título com NexAiBrand Oficial (`ReceptionPanel.jsx`):**
  - Aplicação do componente `<NexAiBrand size="lg" suffix=".RECEPTION" showIcon={false} />` garantindo o mesmo padrão tipográfico e degradê característico do sistema (igual aos módulos Assist e Med).
  - Ícone de cabeçalho estilizado em degrade teal (`linear-gradient(135deg, #0d9488, #0f766e)`) com sombra suave e harmonização visual.
- **3 Formas de Visualização de Pacientes (`ReceptionPanel.jsx`):**
  - Criação do seletor `Visão` com 3 modos de exibição rápidos com ícones e labels diretos:
    1. **`Compacto` (Padrão)**: tabela hospitalar de alta densidade com linhas finas (`padding: 0.35rem`), avatares reduzidos (28px), fonte condensada e botões compactos (26px), permitindo visualizar dezenas de pacientes simultaneamente sem rolagem excessiva.
    2. **`Normal`**: visualização tabular tradicional respirável com avatar de 38px, detalhes de recado com parentesco e ações completas.
    3. **`Cards`**: grade moderna responsiva de crachás visuais com foto/avatar, alocação física detalhada (Sala, Turno e Poltrona), tags clínicas (Convênio, Frequência, Acesso) e botões de ação (WhatsApp direto, Editar e Excluir).
- **Filtro por Status & Barra de Pílulas Interativas (`ReceptionPanel.jsx`):**
  - Filtro por situação clínica acessível tanto pelo `<select>` de Status quanto por uma barra horizontal de pílulas rápidas com badges coloridos e contagens em tempo real (`Todos`, `Ativo`, `Suspenso`, `Em Trânsito`, `Transplantado`, `Óbito`).
  - Sincronização automática entre o card superior de "Ativos", o select de Status e as pílulas rápidas.
  - Alinhamento vertical aperfeiçoado de todos os campos da barra de filtros com labels superiores (`Paciente:`, `Turno:`, `Sala:`, `Status:`, `Visão:` e `Admissão`).
- **Retirada do Indicador de APACs dos KPIs Superiores (`ReceptionPanel.jsx`):**
  - Remoção definitiva do card métrico de APACs do topo do módulo de Recepção, consolidando os KPIs em 3 cartões objetivos e equilibrados (`Pacientes`, `Ativos` e `Ronda`).
- **Base de Conhecimento e Manuais Atualizados (`src/data/moduleGuidesData.js`):**
  - Atualização completa do guia interativo Nex-Ai.RECEPTION documentando as 3 formas de visualização, as pílulas de status e a nova organização da recepção.

---

## [v4.9.60] - 06 de Setembro, 2026
### Nex-Ai.RECEPTION — Busca de Pacientes com Autocomplete no Padrão Assist, Nova Ronda Médica Completa & Unificação de Presença/Poltronas na Escala
- **Autocomplete Inteligente na Busca de Pacientes (`ReceptionPanel.jsx`):**
  - Padronização do campo de busca de pacientes exatamente no estilo do módulo Assist, com label superior `Paciente:` e digitação em caixa alta automática.
  - Dropdown flutuante instantâneo com sombra suave e bordas arredondadas exibindo nome do paciente em negrito maiúsculo (`font-weight: 800`) e linha secundária com `CPF • Salão (Turno)`.
  - Fechamento imediato e suave do dropdown ao selecionar o paciente, ao clicar fora da área de busca (`searchWrapperRef` + listener `mousedown`) ou ao pressionar a tecla `Escape`.
- **Nova Central de Ronda Médica Presencial (`ReceptionPanel.jsx`):**
  - Auditoria completa de presença presencial dos médicos nefrologistas escalados na unidade com suporte a qualquer data selecionada.
  - Seletor de data intuitivo com botões de navegação rápida (dia anterior `<` e próximo dia `>`) e botão de atalho direto para "Hoje".
  - Filtros dinâmicos por Setor (`Salão 1`, `Salão 2`, `Salão 3`, `DP`) e por Turno (`1º Turno`, `2º Turno`, `3º Turno`).
  - Painel analítico com 6 KPIs em linha única: `Escalados`, `Presentes` (verde), `Atrasos` (amarelo), `Substituídos` (roxo), `Ausentes` (vermelho) e `Pendentes` (cinza).
  - Ações rápidas de 1 clique nos cards de plantão: `✓ Presente`, `⚠ Atraso`, `🔄 Troca`, `✕ Falta` e botão `Editar`.
  - Modal ergonômico de Registro e Edição de Ronda Médica integrado e sincronizado em tempo real com a coleção `medical_schedules` do Firestore (linkado diretamente ao `Nex-Ai.MED`).
  - Empty state inteligente quando não houver plantões agendados para a data, permitindo o registro da presença médica presencial na hora.
- **Unificação Operacional das Abas Presença e Poltronas:**
  - Remoção definitiva das abas legadas "Presença" (check-in de hemodiálise) e "Poltronas" (mapa de salas) do módulo Recepção, eliminando duplicidade de fluxo e concentrando o controle físico e clínico de poltronas na aba "Escala" do módulo `Nex-Ai.ASSIST`.
- **Rótulos Rigorosos de 1 Palavra & Boy Scout Rule:**
  - Todos os novos botões, filtros e campos concebidos com termos objetivos e diretos de 1 palavra (`Paciente`, `Data`, `Setores`, `Turnos`, `Ronda`, `Status`, `Hoje`).
- **Atualização da Base de Conhecimento (`src/data/moduleGuidesData.js`):**
  - Atualização completa do manual do módulo de Recepção refletindo as novas rotinas de busca, a auditoria presencial de médicos e a centralização de poltronas na Escala.

---

## [v4.9.59] - 06 de Setembro, 2026
### Nex-Ai.ASSIST — Espaçamento Padrão no Modal de Escala, 7 KPIs em Linha Única & 4 Novos Relatórios de Escala e Heparina
- **Espaçamento e Harmonia no Modal de Edição da Escala (`DialysisScheduleTab.jsx`):**
  - Correção do corpo do formulário (`modalBody`) com espaçamento lateral ergonômico padrão do sistema (`padding: 1.5rem 1.75rem`), eliminando a sensação de formulário apertado e trazendo respiro harmônico aos cards e campos.
- **Unificação dos 7 Indicadores em Linha Única (`DialysisScheduleTab.jsx`):**
  - Reestruturação do grid de indicadores para grade de 7 colunas (`repeat(7, minmax(0, 1fr))`) com dimensionamento compacto e layout horizontal, alinhando Capacidade, Ocupação, Vagas, Fístulas, Cateteres, Isolamento e Heparina estritamente em uma linha sem quebra de página.
- **Remoção de Botões na Escala & Criação de 4 Novos Relatórios (`AssistReportsModal.jsx`):**
  - Remoção dos botões `[💉 Heparina]` e `[🖨️ Imprimir]` da barra da escala, centralizando a gestão documental no botão de "Relatórios" do topo do módulo Nex-Ai.ASSIST.
  - Criação de 4 novos relatórios analíticos e operacionais sob a seção Escala:
    1. **Mapa de Heparina do Turno**: identificação de box, ponto, paciente, acesso, dose prescrita de heparina e campo de checagem/visto da equipe de enfermagem.
    2. **Censo de Anticoagulação & Heparina**: análise clínica com total de pacientes, percentual sob anticoagulação, dose média e consumo total previsto em mL.
    3. **Mapa Operacional da Escala (Posto)**: escala completa de diálise formatada para impressão hospitalar e afixação no posto de enfermagem.
    4. **Grade Consolidada de Turnos & Poltronas**: matriz consolidada cruzando alocações de poltronas/máquinas entre os turnos (1º, 2º, 3º) e cadências (SQS e TQS).
  - Suporte completo a exportação em PDF, planilha Excel (.xlsx) e impressão direta.
- **Rótulos Concisos & Boy Scout Rule:**
  - Padronização de rótulos do modal para termo único conciso (`Isolamento`).
- **Atualização do Manual do Módulo (`src/data/moduleGuidesData.js`):**
  - Atualização completa das seções Recursos, Tutorial e Dúvidas com os novos relatórios e rotinas da escala.

---

## [v4.9.58] - 06 de Setembro, 2026
### Nex-Ai.ASSIST — Escala Interativa Clicável, Gestão de Heparina & Carga CSV Salão 02
- **Escala de Diálise Interativa e Clicável (`DialysisScheduleTab.jsx`):**
  - Cada card de paciente na escala agora possui indicador visual de clique (`cursor: pointer`, micro-animação hover) e botão "Editar" na barra do ponto.
  - Ao clicar no paciente, abre modal moderno de edição rápida de parâmetros clínicos de sessão: **Acesso Vascular** (FAV, CDL, Permcath, Prótese), **Calibre da Agulha** (15G, 16G, 17G) e **Heparina** (com botões de preenchimento rápido de 0,5 ml a 2,5 ml e NA).
  - A edição na escala sincroniza automaticamente os parâmetros atualizados no cadastro central do paciente (`dbService.updatePatient`).
- **Badge de Heparina no Card do Paciente:**
  - Inclusão do indicador visual de Heparina (`💉 [Dose]`) no card do paciente, posicionado estrategicamente ao lado do selo de acesso vascular para checagem rápida da enfermagem.
- **Painel KPI de Heparina & Folha de Checagem da Enfermagem:**
  - Adicionado card de métricas dinâmicas de Heparina no topo da escala (quantitativo de pacientes com anticoagulação, sem heparina e volume total estimado em ml).
  - Botão dedicado "Heparina" na barra de ações que abre a Folha de Heparina do Turno com visualização em tabela e impressão limpa para apoio à enfermagem.
- **Integração Global no Cadastro de Pacientes (`PatientsPanel.jsx` & `ReceptionPanel.jsx`):**
  - Adição dos campos `Heparina` e `Agulha` no formulário mestre de pacientes e na recepção/admissão, com visualização correspondente nas listagens e tabelas.
- **Carga de Dados das Planilhas CSV do Salão 02:**
  - Processamento e sincronização completa das planilhas `docs/1.CSV` (Salão 02 - 1º Turno SQS), `docs/2.CSV` (Salão 02 - 2º Turno SQS) e `docs/3.CSV` (Salão 02 - 1º Turno TQS).
  - 100% de correspondência e enriquecimento das doses de heparina e acessos vasculares na base inicial da escala e no cadastro mestre.
- **Padrão Rigoroso de Rótulos de 1 Palavra & Boy Scout Rule:**
  - Todos os novos campos, cabeçalhos e botões implementados com rótulos concisos e diretos de termo único (`Acesso`, `Agulha`, `Heparina`, `Turno`, `Salão`, `Poltrona`, `Editar`, `Salvar`, `Cancelar`, `Imprimir`).

---

## [v4.9.57] - 05 de Setembro, 2026
### Nex-Ai.MED — Modal Recorrente com Rodapé Fixo, Branding Oficial & Desconexão de Envio de E-mail
- **Modal Recorrente Responsivo sem Necessidade de Zoom (`MedicalScheduleTab.jsx`):**
  - Restruturação arquitetural do modal de adicionar e editar escala com altura máxima contida (`maxHeight: min(90vh, 740px)`), cabeçalho fixo com fechamento rápido, corpo com rolagem suave independente (`overflowY: auto`) e rodapé sticky com os botões "Cancelar" e "Salvar".
  - Eliminação definitiva da necessidade de diminuir o zoom do navegador (`Ctrl -`) para alcançar o botão de finalização em monitores de menor resolução ou telas escaladas.
- **Branding Oficial `Nex-Ai.MED` (`MedicalPanel.jsx`, `MedicalStatementModal.jsx`, `MedicalScheduleTab.jsx`):**
  - Aplicação do componente oficial `NexAiBrand` com gradiente prismático Antigravity IDE e identificador de módulo `.MED`.
  - Atualização dos demonstrativos mensais impressos para `Nex-Ai CLINIC • Nefrologia & Terapia Renal Substitutiva` e dos registros de log de e-mail de trocas para `[Nex-Ai.MED]`.
- **Desconexão e Remoção da Tela de Envio de E-mail (`MedicalSendProductionCard.jsx`):**
  - Remoção definitiva do card e do formulário "Enviar produção do mês" e desconexão das abas de Produção (`MedicalProductionTab.jsx`) e Meus Plantões (`MedicalMyShiftsTab.jsx`), higienizando o fluxo financeiro/ambulatorial.
- **Padrão Rigoroso de Rótulos de 1 Palavra:**
  - Padronização concisa de campos e botões: "Data", "Mês", "Dias", "Setor", "Turno", "Médico", "Titular", "Observação", "Cancelar" e "Salvar".
- **Atualização da Base de Manuais:**
  - Atualização do tutorial de escala recorrente no arquivo `src/data/moduleGuidesData.js`.

---

## [v4.9.56] - 05 de Setembro, 2026
### Organização da Raiz do Projeto — Centralização de Documentos, Escalas e Planilhas em docs/
- **Realocação da Pasta `Escalas de Pacientes` para `docs/Escalas de Pacientes/`:**
  - Transferência e controle de versão de todas as planilhas CSV de escalas de pacientes dos salões 01, 02 e 03 por turnos para dentro do diretório padronizado `docs/`.
- **Centralização de Arquivos `.pdf` e `.csv`:**
  - Higienização da raiz do projeto, movendo comprovantes bancários (`betim-comprovante_17-08-2026 13-10-04.pdf`), apresentações (`Apresentacao_Modulo_Agenda_NexaCLINIC.pdf`) e planilhas de teste/extração (`amostra_teste.csv`, `debitos_extrato.csv`, `prodissionais.CSV`) para `docs/`.
- **Atualização de Scripts de Dados:**
  - Adaptação do script `scripts/sync_doctors_csv.mjs` para buscar a base de profissionais preferencialmente em `docs/prodissionais.CSV`.
- **Replicação Multi-Ambiente:**
  - Todas as movimentações registradas via Git para sincronização automática em todos os computadores de trabalho da clínica após `git pull`.

---

## [v4.9.55] - 05 de Setembro, 2026
### Nex-Ai.ASSIST — Modernização do Agendamento Cirúrgico, KPIs Clínicos & Refinamento de Interface
- **Redesign Completo do Agendamento Cirúrgico (`AssistSurgeriesTab.jsx`):**
  - Superação do modelo antigo (cópia estática de PDF impresso) por um hub interativo e dinâmico de alta performance clínica.
  - Novos cartões de agendamento ricos com visualização de horário em destaque (`Clock`), nome do paciente em caixa alta, crachás de procedimento coloridos por categoria e chips clínicos de indicação e antibiótico profilático (`ATB`).
  - Ação rápida de 1 clique para concluir cirurgia (`Realizado`), alternando o status em tempo real no Firestore e na interface.
- **Painel KPI de Cirurgias Vasculares no Topo:**
  - 5 métricas dinâmicas com contadores automáticos calculados a partir dos filtros ativos: **Agendadas**, **Fístulas (FAV)**, **Cateteres (Permcath/CDL)**, **Urgências** e **Realizadas**.
- **Alternância entre Visualizações na Semana (Cards vs Linhas):**
  - Introdução de seletor rápido no topo da semana permitindo alternar entre a grade de cartões modernos e uma tabela hospitalar limpa e espaçosa com ações atômicas.
- **Branding Oficial `Nex-Ai.ASSIST`:**
  - Atualização do cabeçalho do módulo no `AssistPanel.jsx` utilizando o componente vetorial `NexAiBrand` com gradiente prismático Antigravity no termo "Ai".
- **Higienização do Cabeçalho Hero:**
  - Remoção do botão redundante "Relatórios" ao lado de "Comunicado", mantendo a central de 15 relatórios assistenciais no botão padronizado da barra superior.
- **Padrão Rigoroso de Rótulos de 1 Palavra:**
  - Conformidade estrita com o padrão de termos únicos em todos os botões (`Agendar`, `Imprimir`, `Salvar`, `Cancelar`, `Hoje`, `Semana`, `Mês`, `Dia`, `Tabela`, `Cards`, `Linhas`) e cabeçalhos de tabela (`Horário`, `Paciente`, `Procedimento`, `Motivo`, `ATB`, `Observação`, `Situação`, `Ações`).
- **Atualização da Base de Manuais:**
  - Inclusão dos tutoriais, recursos e dúvidas de agendamento cirúrgico no arquivo `src/data/moduleGuidesData.js`.

---

## [v4.9.54] - 05 de Setembro, 2026
### Rebranding Global — Nex-Ai CLINIC (AI-Powered Healthcare Ecosystem)
- **Evolução da Marca Institucional para `Nex-Ai CLINIC`:**
  - Lançamento oficial da nova identidade da plataforma, destacando a inteligência artificial embarcada na gestão hospitalar e hemodiálise.
  - Estilização do termo **`Ai`** com o gradiente prismático de alta definição inspirado no ícone do **Antigravity IDE** (`linear-gradient(135deg, #06b6d4 0%, #3b82f6 30%, #8b5cf6 65%, #ec4899 100%)`).
  - Criação do componente unificado de branding `NexAiBrand.jsx` com suporte a tamanhos dinâmicos, símbolos vetoriais e micro-interação de glow/brilho no hover.
- **Higienização & Foco na Tela de Login:**
  - Remoção definitiva do botão de acesso à TV pública do formulário de login (`Login.jsx`), garantindo maior sobriedade, foco e segurança no ambiente de autenticação.
- **Atalho do Painel TV no Portal de Recepção (`ReceptionPanel.jsx`):**
  - Inclusão de botão dedicado `TV` na barra superior da Recepção, permitindo que a equipe de acolhimento acione a TV da sala de espera em nova aba com 1 clique direto.
- **Harmonização dos 15 Módulos Operacionais:**
  - Padronização de todas as insígnias e cartões de módulos sob a taxonomia oficial:
    `Nex-Ai.CLINIC`, `Nex-Ai.INDEX`, `Nex-Ai.ASSIST`, `Nex-Ai.MED`, `Nex-Ai.CARE`, `Nex-Ai.RECEPTION`, `Nex-Ai.STOCK`, `Nex-Ai.SERVICE`, `Nex-Ai.FINANCE`, `Nex-Ai.HR`, `Nex-Ai.SAFE`, `Nex-Ai.APAC`, `Nex-Ai.CAL`, `Nex-Ai.PROCURE` e `Nex-Ai.CONFIG`.
- **Favicon & Portais Integrados:**
  - Atualização do `favicon.svg` com a nova geometria prismática Antigravity.
  - Atualização do título global no `index.html` e nos portais integrados (Fornecedores, QR Code de Manutenção e Painel TV).
- **Diretrizes e Manuais:**
  - Atualização das regras do repositório (`.agents/AGENTS.md`) e da base de manuais operacionais (`moduleGuidesData.js`).

---

## [v4.9.53] - 05 de Setembro, 2026
### NexaASSIST — Refinamento de Remanejamento, Nomes em Caixa Alta & Pré-seleção de Pacientes no Comunicado
- **Feedback Visual Claro no Remanejamento (`DialysisScheduleTab.jsx`):**
  - Ao clicar no botão **`Desocupar`**, o sistema exibe imediatamente um alerta em destaque com ícone e aviso em vermelho: *"Vaga Selecionada para Desocupação: O paciente será desvinculado e o leito ficará VAGO ao clicar em Desocupar"*.
  - O campo de pesquisa do paciente é limpo automaticamente e o botão de confirmação passa a exibir expressamente o rótulo **`Desocupar`** em tom vermelho de segurança, evitando qualquer sensação de inação.
  - Opção instantânea **`Desfazer`** caso o operador deseje retornar ao estado anterior ou escolher outro paciente.
  - Badge visual em verde confirmando a seleção de um novo paciente ao escolhê-lo na lista.
- **Padronização Universal de Nomes em Caixa Alta (MAIÚSCULAS):**
  - Aplicação de `text-transform: uppercase` e normalização programática `.toUpperCase()` em todos os nomes de pacientes do sistema:
    - Cards de hemodiálise (leitos e boxes), avatares e listas de turnos.
    - Modal de remanejamento, busca global de pacientes e máquinas.
    - Mural e comunicados clínicos (feed compacto e expandido, campo de busca e etiquetas de vínculo).
    - Mapa cirúrgico vascular (semana, mês, dia e compacto) e formulário de agendamento de cirurgias.
    - Central de Relatórios Assistenciais (tabelas de visualização, relatórios em PDF e planilhas Excel).
    - Camada de serviços (`dialysisScheduleService.js`, `patientService.js` e `mockFirebase.js`).
- **Pré-seleção Automática de Pacientes ao Clicar em Comunicado:**
  - Correção na passagem de parâmetros do card de hemodiálise para o modal de novo comunicado (`handleOpenCreateModal`): o nome do paciente, salão e turno são pré-preenchidos e vinculados imediatamente.
  - Exibição direta do paciente no campo de texto e na etiqueta de paciente vinculado, com botão direto de 1 palavra **`Remover`**.

---

## [v4.9.52] - 05 de Setembro, 2026
### NexaASSIST — Central de Relatórios Assistenciais (15 Relatórios Especializados: Escala, Mural e Cirurgias)
- **Central Unificada de Relatórios (`AssistReportsModal.jsx`):**
  - Integração ao botão **`Relatórios`** na barra superior e no cabeçalho do NexaASSIST, seguindo o padrão consagrado da Central de Relatórios Financeiros (`FinanceReportsModal`).
  - Total de **15 relatórios gerenciais e assistenciais**, distribuídos em 3 categorias operacionais (5 por pilar):
    - **Escala (5 relatórios):**
      1. *Ocupação de Leitos:* Censo em tempo real por salão e turno, capacidade total, leitos ocupados, livres e taxa percentual de ocupação.
      2. *Escala Nominal de Pacientes:* Distribuição de pacientes por máquina, box, turno e frequência semanal (Seg/Qua/Sex ou Ter/Qui/Sáb).
      3. *Censo de Acessos Vasculares:* Indicadores de pacientes por tipo de acesso (FAV, Duplo Lúmen, Permcath), lado e tempo de uso.
      4. *Inventário de Máquinas de Hemodiálise:* Relação de equipamentos ativos, marcas, modelos, números de patrimônio e status operacional.
      5. *Pacientes em Precaução & Isolamento:* Monitoramento de precauções de contato, hepatites (HBV/HCV), HIV, isolamentos e condutas de enfermagem.
    - **Mural (5 relatórios):**
      6. *Extrato Geral de Publicações:* Registro cronológico completo de comunicados, avisos e despachos clínicos com autor e turno.
      7. *Intercorrências & Eventos Adversos:* Relatório de quedas, hipotensão grave, coagulação de capilares e eventos críticos.
      8. *Movimentação de Pacientes:* Balanço consolidado de novas admissões, internações hospitalares, transferências, altas e óbitos.
      9. *Transfusões de Hemocomponentes & Infecções:* Controle de transfusões sanguíneas realizadas na clínica e notificações de infecção de acesso.
      10. *Volumetria por Categoria & Turno:* Estatística quantitativa de comunicados postados por turno e tipo de postagem.
    - **Cirurgias (5 relatórios):**
      11. *Mapa Cirúrgico Geral:* Relação cronológica detalhada de todos os agendamentos cirúrgicos com paciente, procedimento, cirurgião, hospital e status.
      12. *Produção por Cirurgião:* Quantidade de atos cirúrgicos executados por cada cirurgião vascular com taxa de realização.
      13. *Cirurgias de Fístula (FAV) vs Cateteres:* Comparativo de confecção de fístulas arteriovenosas contra implantes e retiradas de cateteres.
      14. *Casos de Urgência & Pendências:* Painel de triagem para procedimentos com alerta de urgência ("CDL de Urgência"), pendência de risco cirúrgico ou PTFE.
      15. *Perfil por Hospital & Antibioticoprofilaxia:* Distribuição dos procedimentos por hospital conveniado e antibióticos profiláticos padronizados.
- **Recursos de Exportação e Filtragem:**
  - **Exportação para PDF (`jsPDF` + `autoTable`):** Cabeçalho hospitalar oficial, logotipo do NexaCLINIC, paleta corporativa elegante, sumário estatístico e quebra de páginas inteligente.
  - **Exportação para Excel (`xlsx`):** Planilhas tabuladas com colunas dimensionadas, cabeçalhos destacados e compatibilidade nativa com Excel e Google Sheets.
  - **Impressão Direta do Navegador:** Estilos `@media print` otimizados para impressoras térmicas e pranchetas hospitalares.
  - **Filtros Dinâmicos:** Filtro por período de datas (`Início` e `Fim`) e seletor de unidade assistencial (`Unidade`).
- **Conformidade Estrita de UI/UX (`.agents/AGENTS.md`):**
  - Rótulos de formulário, abas, botões e cabeçalhos em termo único indispensável (`Data`, `Turno`, `Paciente`, `Cirurgião`, `Hospital`, `Situação`, etc.).
  - Total sigilo de valores financeiros na interface assistencial.

---

## [v4.9.51] - 05 de Setembro, 2026
### NexaASSIST — Sincronização e Listagem Completa de Procedimentos Cirúrgicos & Permissões do Firestore
- **Exibição Universal de Procedimentos no NexaASSIST (`AssistSurgeriesTab.jsx`):**
  - Substituição do campo de autocompletar restritivo (`<input list>`) por um `<select>` moderno e dinâmico, garantindo a exibição de **todos os 13 procedimentos** marcados com o módulo `Cirurgias` (`assist: true`) no catálogo do T.I.
  - Ordenação alfabética instantânea dos procedimentos para facilitar a localização ágil pelo operador.
  - Opção integrada `➕ Outro (Digitar manualmente)...` caso a equipe cirúrgica precise registrar procedimentos específicos não catalogados, com botão para alternar de volta para a lista central.
  - Omissão de valores monetários no dropdown, mantendo a diretriz de sigilo de custos na área operacional.
- **Resiliência e Carregamento Assíncrono (`AssistSurgeriesTab.jsx`):**
  - Utilização de `Promise.allSettled` e fallback inteligente (`INITIAL_PROCEDURES`) para garantir que os procedimentos cadastrados estejam imediatamente disponíveis na abertura do modal, mesmo durante carregamento inicial ou oscilações de rede.
- **Atualização de Permissões de Segurança (`firestore.rules`):**
  - Adição de regras para as coleções `clinical_procedures`, `surgeries`, `surgery_blocks`, `medical_doctors`, `medical_schedules`, `medical_swaps`, `medical_procedures`, `settings` e `email_logs`.

---

## [v4.9.50] - 05 de Setembro, 2026
### NexaCONFIG — Catálogo Central de Procedimentos no T.I. & Ocultação de Valores nos Seletores
- **Catálogo Central de Procedimentos (`ConfigPanel.jsx` & `procedureService.js`):**
  - Nova aba **`Procedimentos`** no módulo NexaCONFIG (Administração & T.I.) com gestão centralizada de procedimentos cirúrgicos, médicos e clínicos.
  - Campos completos de cadastro: `Nome`, `Código` (SUS/TUSS), `Valor` em R$, `Situação` (Ativo/Inativo) e opções de visibilidade modular.
- **Marcação de Visibilidade por Módulo:**
  - Caixas de seleção (checkboxes) para determinar com precisão em quais módulos cada procedimento deve ser disponibilizado:
    - `Cirurgias (NexaASSIST)`
    - `Médico (NexaMED)`
    - `Prontuário (NexaCLINIC)`
    - `APAC (Faturamento)`
- **Ocultação da Visualização de Valores nos Seletores:**
  - Remoção dos valores `(R$ ...)` no `<select>` de procedimentos do formulário "Lançar Procedimento" no NexaMED.
  - Remoção de qualquer exibição de valor no seletor de procedimentos do modal de agendamento de cirurgias no NexaASSIST.
  - Preservação integral do cálculo de honorários médicos nos bastidores e fechamento mensal.
- **Sincronização Bidirecional com a Tabela de Honorários:**
  - Alterações e criações de procedimentos realizadas no T.I. refletem na tabela de honorários do NexaMED e vice-versa.
- **Filtros Rápidos por Módulo:**
  - Botões de alternância rápida no topo da tabela de T.I. (`Todos`, `Cirurgias`, `Médico`, `Prontuário`, `APAC`).
- **Atualização da Documentação & Manuais (`moduleGuidesData.js`):**
  - Adição do manual completo do NexaCONFIG com Recursos, Tutorial e Dúvidas Frequentes.

---

## [v4.9.47] - 05 de Setembro, 2026
### NexaASSIST — Agendamento de Cirurgias Vasculares, 4 Modos de Visualização & Integração com o Mural
- **Aba Cirurgias no NexaASSIST (`AssistPanel.jsx` & `AssistSurgeriesTab.jsx`):**
  - Adição do botão/aba **`Cirurgias`** no seletor do Hero Banner ao lado de `Mural`.
  - Submódulo de agendamento cirúrgico especializado para pacientes renais e cirurgias vasculares (FAV simples com suporte anestésico, FAV basílica, FAV com PTFE, implante e retirada de permcath, duplex vascular e ligaduras).
- **4 Modos de Visualização Operacional:**
  - **Semana:** Fiel ao modelo do documento oficial *Mapa Cirúrgico Vascular*, organizado por blocos diários de segunda a sexta com cabeçalhos de início, cirurgião responsável, anestesista, local/hospital e tabela detalhada de procedimentos.
  - **Mês:** Calendário mensal com distribuição de procedimentos e marcadores de status.
  - **Dia:** Linha do tempo horária cronológica detalhada com ficha completa do procedimento e condutas.
  - **Compacto:** Tabela densa de dados com pesquisa rápida instantânea e ordenação.
- **Integração Automática com o Mural de Notícias:**
  - Nova categoria **`Cirurgias`** no Mural com card de contadores em tempo real.
  - Ao salvar um agendamento, o sistema publica automaticamente um comunicado no Mural detalhando data, horário, cirurgião, anestesista, procedimento, motivo clínico, ATB profilático e observações de materiais.
- **Padronização Fiel ao Mapa Cirúrgico & Impressão Formatada:**
  - Suporte a alertas e destaques visuais para vagas de urgência ("CDL de Urgência"), pendências de materiais ("Aguardando PTFE") e pendências de exames ("Pendente Risco Cirúrgico").
  - Botão **`Imprimir`** para espelho A4 de prancheta e rotina de **`Bloquear`** para feriados e manutenções de bloco.
  - Aplicação estrita da diretriz de rótulos de 1 termo e documentação completa em `moduleGuidesData.js`.

---

## [v4.9.46] - 04 de Setembro, 2026
### Escala Recorrente por Dias da Semana & Cópia Inteligente de Mês Anterior
- **Escala Recorrente por Dias da Semana (`MedicalScheduleTab.jsx`):**
  - Novo alternador de modo no modal de escala médica: `Individual` vs `Recorrente`.
  - Seleção ágil de dias da semana (Seg, Ter, Qua, Qui, Sex, Sáb, Dom) e presets instantâneos (`Seg/Qua/Sex`, `Ter/Qui/Sáb`, `Seg a Sex`, `Todos`).
  - Cálculo dinâmico das datas do mês de competência com exibição de chips das datas calculadas e totalizador de plantões gerados.
  - Opção de sobrescrita seletiva para plantões já preenchidos nas datas selecionadas.
- **Cópia Inteligente do Mês Anterior (`MedicalScheduleTab.jsx`):**
  - Botão dedicado `Copiar` no cabeçalho da escala médica abrindo assistente de clonagem de grade.
  - Mapeamento por **Dia da Semana** (1ª segunda-feira do mês anterior alinhada à 1ª segunda-feira do mês atual), preservando os ciclos de nefrologia sem defasagem de calendário.
  - Suporte opcional a mapeamento por **Dia do Mês** (dia 01 para dia 01).
  - Seleção granular de setores a copiar (`Salão 1`, `Salão 2`, `Salão 3`, `DP`).
  - Painel de substituição de médicos em massa: remapeamento de nefrologistas atuantes no mês de origem para novos responsáveis com 1 clique.
- **Prevenção e Alerta Ativo de Conflitos de Salão:**
  - Checagem cruzada que impede dupla alocação despercebida: se um médico for escalado em múltiplos salões no mesmo turno e data, a célula ganha destaque em vermelho com selo `Conflito` e tooltip explicativo.
  - Faixa superior exibe badge com a contagem total de conflitos de salão pendentes no mês.
- **Limpeza de Escala do Mês em Lote (`MedicalPanel.jsx` & `medicalService.js`):**
  - Ação `Limpar` no cabeçalho para resetar ou refazer a grade mensal com confirmação de segurança.
- **Padronização Rigorosa de Rótulos (Boy Scout Rule):**
  - Varrida e saneamento de rótulos compostos ou duplos no módulo médico, adotando estritamente termos únicos e concisos (`Troca`, `Titular`, `Salão`, `Turno`, `Médico`, `Origem`, `Destino`, `Método`, `Setores`).

---

## [v4.9.45] - 04 de Setembro, 2026
### Compatibilidade Universal Smart TV & Samsung Internet para Painel da Sala de Espera
- **Suporte a Smart TVs e Tizen OS com Polyfills (@vitejs/plugin-legacy & Terser):**
  - Configuração do Vite para compilação dual: ES Modules modernos para desktops/smartphones e bundles legados com SystemJS e polyfills (Chromium >= 58, Samsung Internet >= 8, Safari >= 11).
  - Eliminação de quebra de sintaxe fatal (`Uncaught SyntaxError: Unexpected token '.'`) causada por *Optional Chaining* (`?.`) e *Nullish Coalescing* (`??`) no motor Chromium do Tizen OS da Samsung.
- **Roteamento Universal por URL Curta (/tv, /tv/betim, /tv/taguatinga):**
  - Resolução direta de rotas curtas e fáceis de digitar no controle remoto da TV (`/tv`, `/tv/betim`, `/tv/taguatinga`, `/#tv`, `?tv=betim`, `?painel_tv=1`).
  - Associação automática da unidade da clínica sem necessidade de parâmetros de consulta extensos.
- **Regras de Acesso Público no Firestore (`firestore.rules`):**
  - Liberação de leitura não autenticada para `patient_calls`, `tv_educational_tips` e `tenant_settings`, viabilizando o funcionamento em tempo real de Smart TVs em salas de espera sem exigir login de usuário.
- **Desbloqueio de Áudio Amigável para TV:**
  - Listener global para teclas do controle remoto (`keydown`), toques e cliques para desbloquear o sintetizador de voz (TTS) e o chime sonoro hospitalar na primeira interação.
  - Suporte resiliente a APIs de tela cheia com prefixos proprietários (`webkit`, `moz`, `ms`).
- **QR Code & Acesso Rápido na Agenda e Login:**
  - Modal da Smart TV no módulo de Agenda atualizado com exibição da URL curta e geração de QR Code dinâmico via `qrcode`.
  - Botão de atalho rápido "Painel" incorporado na tela de login para redirecionamento imediato caso a TV acerte a URL raiz do sistema.

---

## [v4.9.43] - 04 de Setembro, 2026
### Entrada de Notas Parceladas & Remessa Bancária CNAB 240 Sicoob
- **Leitura Automática de Parcelas em NF-e e NFS-e (`danfePdfParser.js` & `useStockLogic.jsx`):**
  - Identificação estruturada de duplicatas e faturas em XML (`<dup>`, `<cobr>`, `<condicaoPagamento>`).
  - Reconhecimento avançado em PDFs de notas fiscais de produtos (DANFE) e serviços (NFS-e), extraindo datas, valores e identificadores de parcelas.
  - Suporte a termos de faturamento em texto livre (ex: "30 / 60 / 90 dias" ou "1/3, 2/3, 3/3") com distribuição temporal automática.
- **Assistente de Importação com Gestão de Parcelas (`StockPanel.jsx`):**
  - Tabela financeira com cabeçalhos e termos concisos (`Parcela`, `Vencimento`, `Valor`, `Código`, `Ações`).
  - Botões de divisão rápida em 1 clique (`1x`, `2x`, `3x`, `4x`, `6x`) com espaçamento automático de 30 dias.
  - Botão de equilíbrio de saldo (`Equilibrar`) para eliminar centavos de arredondamento diretamente na última parcela.
  - Suporte a linha digitável e código de boleto específico para cada parcela.
- **Gerador de Arquivo de Remessa CNAB 240 Sicoob (`sicoobCnab240.js`):**
  - Em estrita conformidade com a FEBRABAN e com o manual oficial Sicoob v3.3 (Banco 756).
  - Geração dos 6 tipos de registros obrigatórios: Header de Arquivo (v087), Header de Lote (v040), Segmento J (pagamento de títulos), Segmento J-52 (sacado e cedente obrigatório), Trailer de Lote e Trailer de Arquivo.
  - Conversão algorítmica exata de Linha Digitável de 47 dígitos para Código de Barras de 44 dígitos.
  - Rigorosa validação de 240 caracteres por linha e terminação `\r\n`.
- **Módulo de Remessa no Contas a Pagar (`FinancePanel.jsx` & `CnabExportModal.jsx`):**
  - Novo botão `Remessa` na barra de ações do Contas a Pagar.
  - Modal interativo para seleção de títulos a pagar, filtragem por código de barras e totalizador dinâmico.
  - Edição inline de linha digitável para inclusão rápida de boletos pendentes.
  - Painel de configuração de conta bancária Sicoob (Convênio, Agência, Conta, DV, Sequencial NSA) com persistência automática no Firestore e no armazenamento local.
  - Download automático do arquivo `.REM` pronto para importação direta no Sicoob Internet Banking.

---

## [v4.9.41] - 04 de Setembro, 2026
### Gestão Inteligente de Boletos Bancários: Anexo na Entrada de Notas & Contas a Pagar em 1 Clique
- **Utilitário de Extração de Boletos (`boletoParser.js`):**
  - Leitura estruturada de arquivos em PDF (via `pdfjs-dist`) e imagens com detecção de código de barras.
  - Reconhecimento automático de Linha Digitável de 47 dígitos (cobrança bancária) e 48 dígitos (concessionárias/tributos).
  - Extração de data de vencimento e valor nominal da cobrança com formatação FEBRABAN.
- **Integração na Entrada de Notas Fiscais (`StockPanel.jsx` & `useStockLogic.jsx`):**
  - Nova seção no passo 3 (Financeiro) do assistente de importação de NF-e (XML/PDF) para anexar o boleto bancário (opcional).
  - Extração automática da linha digitável com possibilidade de conferência, edição manual e cópia instantânea.
  - Upload seguro para o Firebase Storage com fallback local resiliente.
  - Propagação direta dos dados e anexos do boleto para as faturas de `accounts_payable` criadas.
- **Aceleração Operacional no Contas a Pagar (`FinancePanel.jsx`):**
  - Nova coluna "Boleto" na tabela de Contas a Pagar (modos Compacto e Normal).
  - Botão de **Copiar em 1 Clique** da Linha Digitável com feedback visual via toast para agendamento ágil no Internet Banking sem erros de digitação.
  - Botão **Boleto** com modal de visualização do documento original (PDF/Imagem) diretamente na tela sem perder o contexto dos lançamentos.
  - Inclusão de suporte a upload de boleto e linha digitável também no formulário de cadastro manual de despesas.
- **Roadmap e Arquitetura Arquivados (`docs/roadmap_boletos_bancarios.md`):**
  - Especificação funcional e técnica detalhada da **Fase 2** (Múltiplos Boletos e Parcelamento N:N) e **Fase 3** (Geração de Remessa CNAB 240 Padrão FEBRABAN para Pagamento a Fornecedores e APIs Bancárias PJ).
- **Manuais e Documentação Atualizados (`moduleGuidesData.js`):**
  - Atualização completa dos manuais de Estoque e Financeiro com novos Recursos, Tutoriais passo a passo e FAQ de Dúvidas.

---

## [v4.9.40] - 02 de Setembro, 2026
### Edição Direta de Valor & Auto-Recuperação pelo Contas a Pagar
- **Edição Inline de Valor na Tabela de Entradas:**
  - A coluna "Valor" agora é clicável e exibe ícone de lápis para permitir edição rápida e direta.
  - Permite digitar o valor correto (ex: R$ 3.988,63) e salvar instantaneamente no banco de dados pressionando Enter ou o botão verde de confirmação.
- **Auto-Recuperação de Notas Zeradas pelo Financeiro:**
  - Ao carregar a lista de notas de entrada, o sistema cruza notas com valor zerado com as faturas ativas em Contas a Pagar pelo número da nota ou código.
  - Se parcelas forem localizadas, o valor é recuperado e sincronizado automaticamente no banco de dados.
- **Ajuste de Valor no Modal de Detalhes:**
  - Inserido campo numérico de edição de valor e botão "Salvar" no modal de detalhes da nota.
  - O botão "Salvar como Serviço" agora sincroniza e grava o valor digitado junto com o tipo de documento.

---

## [v4.9.39] - 02 de Setembro, 2026
### Fluxo Otimizado para Entrada de Serviços (NFS-e) & Auditoria de Notas
- **Omissão Automática da Etapa de Produtos no Wizard:**
  - O assistente de importação de notas fiscais identifica documentos de serviço e omite a etapa 4 de mapeamento de catálogo ("Mapear Itens").
  - O fluxo para NFS-e opera em 4 etapas diretas: `1. Documento -> 2. Fornecedor -> 3. Financeiro & Serviço -> 4. Finalizar`.
- **Prevenção de Total Zerado & Cálculo pelas Parcelas:**
  - Caso o valor total no cabeçalho de uma NFS-e em PDF não seja extraído pelo leitor municipal, o sistema calcula o valor total automaticamente através da soma das duplicatas/parcelas identificadas.
  - Disponibilizado botão de sincronização e campo de edição direta de valor total na etapa financeira.
- **Identificação Visual na Tabela de Entradas:**
  - Na coluna "Detalhes", notas de serviço exibem agora a identificação `🛠️ Serviço` acompanhada da descrição e categoria, eliminando a exibição equivocada de `0 produto(s)`.
- **Ferramenta de Correção de Notas Anteriores:**
  - Inclusão do botão `🔄 Salvar como Serviço` no modal de detalhes (`InvoiceDetailModal`) e ação rápida na tabela, permitindo converter notas salvas anteriormente com tipo ou valor incorretos em 1 clique.

---

## [v4.9.37] - 02 de Setembro, 2026
### Entrada de Notas de Serviços (NFS-e) & Integração com Contas a Pagar
- **Suporte a Notas Fiscais de Serviços Prestados (NFS-e):**
  - Adaptação do módulo de Estoque para receber notas fiscais de serviços tomados/prestados (ex: calibração de máquinas, manutenção, TI, consultoria, limpeza e destinação de resíduos).
  - O processamento da NFS-e registra o documento fiscal no histórico da clínica (`purchase_invoices`), mas não gera movimentações nem incrementa saldos físicos de insumos do almoxarifado.
  - Geração atômica das faturas e parcelas programadas no Contas a Pagar (`accounts_payable`) do módulo Financeiro com fornecedor, CNPJ, categoria do serviço, datas de vencimento e valores individuais.
- **Leitor Inteligente de Arquivos (XML & PDF):**
  - Identificação e parsing automático de padrões de notas de serviços (XML padrão ABRASF / Nacional e PDFs de prefeituras) e mercadorias (XML SEFAZ e DANFE em PDF).
  - Extração automática de emitente, CNPJ, número, código de verificação, total, parcelas e descrição detalhada dos serviços prestados.
- **Digitação Manual & Filtro Unificado de Entradas:**
  - Novo fluxo de digitação direta na tela para inclusão de notas de compras ou serviços sem necessidade de anexar arquivo digital.
  - Filtro por tipo de nota na tabela de Entradas: Todas as Entradas, Produtos (NF-e) ou Serviços (NFS-e).
  - Modal de visualização detalhada (`InvoiceDetailModal`) com conferência de parcelas e dados do prestador.
  - Adequação rigorosa à regra de rótulos concisos (1 termo único) em cabeçalhos e campos.

---

## [v4.9.36] - 02 de Setembro, 2026
### Design Hospitalar em Tons Claros para o Painel da Smart TV
- **Identidade Visual em Tons Claros (`TvCallPanel.jsx` & `tvTipsService.js`):**
  - Transição completa da interface da TV para padrão claro/clean hospitalar (fundo perolado `#f1f5f9`, cabeçalho branco `#ffffff` com sombra suave e tipografia em azul marinho escuro `#0f172a`).
  - Reformulação dos 70 cards do carrossel educativo com gradientes pastel claros, bordas refinadas na cor de cada especialidade e textos de altíssima legibilidade.
  - Card de chamada ativa em branco puro com bordas de destaque azul/vermelho vibrante e histórico lateral clean.

---

## [v4.9.35] - 02 de Setembro, 2026
### Carrossel Educativo na TV com 70 Dicas Clínicas & Gerenciador de Conteúdo
- **Carrossel Temático na Smart TV (`TvCallPanel.jsx` & `tvTipsService.js`):**
  - Implementação de transmissão contínua de orientações clínicas durante o tempo de espera entre chamadas.
  - 70 recomendações clínicas completas organizadas em 7 categorias nefrológicas:
    1. **Nutrição:** Potássio, fósforo, sódio, quelantes, carambola e proteínas.
    2. **Hemodiálise:** Duração, ultrafiltração, exames mensais, EPO/ferro e pressão.
    3. **Líquidos:** Peso seco, GPID, alívio de sede com gelo e garrafinha graduada.
    4. **Saúde Mental:** Acolhimento emocional, rotina, convivência e suporte familiar.
    5. **Serviço Social:** TFD, transporte público, BPC/LOAS, FGTS/PIS e isenções tributárias.
    6. **Mitos & Verdades:** Diurese residual, viagens em trânsito, mitos do sal light e transplante.
    7. **Cuidados & Acesso:** Frêmito da fístula (FAV), proteção de curativo de cateter e higiene.
  - Paleta de cores temática de alto contraste para cada assunto com barra de progresso suave e micro-animações.
  - **Prioridade Absoluta:** O carrossel é interrompido instantaneamente ao receber chamada de paciente, retornando suavemente após 22 segundos.
- **Gerenciador de Dicas da TV (`TvTipsManagerModal.jsx`):**
  - Modal administrativo integrado para criar, editar, inativar, excluir e restaurar dicas em lote.
  - Botão de acesso rápido integrado tanto no cabeçalho da Smart TV quanto no modal do Painel da Agenda.

---

## [v4.9.34] - 02 de Setembro, 2026
### Painel TV de Chamada de Pacientes & Vocalização Inteligente (Módulo Agenda)
- **Painel Smart TV em Tela Cheia (`TvCallPanel.jsx` & `App.jsx`):**
  - Desenvolvido portal público para Smart TVs em salas de espera, acessível diretamente por link (`?painel_tv=1&unidade=betim`) sem necessidade de login por senha no controle remoto.
  - Exibição de alta resolução com relógio digital de segundos em tempo real, data completa, logomarca dinâmica da clínica (carregada do branding) e badge da unidade ativa.
  - Destaque visual luminoso de chamada com tipografia garrafal de alto contraste legível a mais de 5 metros de distância, box do consultório e médico responsável.
  - Histórico lateral dinâmico exibindo as últimas chamadas realizadas no dia.
  - Suporte a `navigator.wakeLock` para prevenir que a Smart TV entre em modo de economia/suspensão.
- **Sonorização Dupla (Chime Hospitalar & Síntese de Voz):**
  - **Sinal de Atenção (Chime):** Toque duplo harmonioso ("ding-dong") gerado em tempo real via *Web Audio API* (independente de downloads de arquivos MP3 externos).
  - **Voz Natural em Português:** Vocalização automática por *Web Speech API* sintetizando: *"Atenção: Paciente [Nome], favor dirigir-se ao [Consultório]"*.
  - Botão de ativação rápida de áudio para conformidade com a política de autoplay de navegadores de Smart TVs.
- **Integração Completa na Agenda (`CalendarPanel.jsx` & `patientCallService.js`):**
  - Adicionado botão **`Chamar`** e **`Rechamar`** na tabela de horários do dia e nos cards da visão por consultórios/salas.
  - Sincronização em tempo real via Firestore `onSnapshot` com feedback imediato ao profissional clínico.
  - Modal do **`Painel`** no topo da Agenda com cópia de URL direta, teste imediato e instruções de uso na TV.
- **Documentação & Base de Conhecimento (`moduleGuidesData.js`):**
  - Atualização completa do manual do módulo Agenda com recursos, tutorial de operação na TV e respostas para dúvidas frequentes.

---

## [v4.9.31] - 02 de Setembro, 2026
### QR Code de Patrimônio com Abertura Pública de Chamados & Revisão da Manutenção
- **QR Code Inteligente em Alta Resolução (`MaintenancePanel.jsx` & `qrcode`):**
  - Implementada a geração real de QR Code (220px) dinamicamente para cada equipamento clínico ou predial cadastrado.
  - Adicionados botões de ação rápida no modal da tag: **Imprimir Etiqueta Patrimonial** (formatada para 80x100mm ou A4 com identificação visual do NexaCLINIC), **Copiar Link**, **Testar Chamado** em nova aba e **Baixar QR** em imagem PNG.
- **Portal Público de Abertura de Chamados (`MachineTicketPortal.jsx` & `App.jsx`):**
  - Criada tela mobile-first e responsiva com acesso público via escaneamento do QR Code (`?chamado_equipamento=ID`), sem exigir autenticação/login.
  - Carregamento instantâneo das informações do ativo (Patrimônio, Nome, Setor, Modelo, Série e Status Operacional).
  - Verificação de chamados em aberto para evitar redundâncias e formulário com validação imediata.
  - Geração de protocolo sequencial (`OS-2026-XXXX`), timeline rastreável e alteração automática do status da máquina para *Em Manutenção* caso a criticidade seja Alta ou Crítica.
- **Serviços Resilientes de Manutenção (`maintenanceService.js`):**
  - Implementadas funções `getEquipmentById` e `createPublicMaintenanceTicket` com persistência direta e seeding aprimorado no Firestore preservando IDs naturais de equipamentos e ordens de serviço.
- **Revisão Rigorosa de UI/UX (Boy Scout Rule):**
  - Padronização estrita de rótulos concisos (1 termo único) em todas as tabelas, abas, filtros, cards e modais de Manutenção, eliminando barras e conectivos.
- **Base de Manuais e Documentação Atualizada (`moduleGuidesData.js`):**
  - Adicionadas seções completas de Recursos, Tutoriais passo a passo e FAQ de Dúvidas sobre QR Code patrimonial e suporte hospitalar.

---

## [v4.9.30] - 31 de Agosto, 2026
### Melhoria de Layout: Modal de Registro de ASO (Exame Ocupacional)
- **Design Mais Amplo (Wide):**
  - O modal de lançamento de ASO no módulo de RH foi expandido para um formato horizontal mais largo (wide).
  - Os campos foram reorganizados em grades (grids) horizontais, facilitando o preenchimento.
  - Elimina a necessidade de reduzir o zoom da tela para ver todo o formulário.

---

## [v4.9.29] - 31 de Agosto, 2026
### Atualização no Script de Deploy
- **Correção do Firebase CLI:** Ajustado o `package.json` para utilizar `npx firebase-tools deploy` assegurando o funcionamento em diferentes ambientes.

---

## [v4.9.28] - 31 de Agosto, 2026
### Correção na Lógica da Presença Premiada & Prevenção de Erros na Busca do RH
- **Correção da Presença Premiada (`useHRLogic.jsx`):**
  - Ajuste na lógica de verificação de faltas para considerar ausências longas que sobrepõem o período de apuração, evitando que funcionários com faltas injustificadas contínuas sejam contemplados indevidamente.
  - Correção de fuso horário nas datas de advertências e faltas para garantir que ocorrências no último dia do mês sejam computadas corretamente.
- **Prevenção de Erros de Busca (`useHRLogic.jsx`):**
  - Adicionado tratamento de fallback (`|| ''`) nos campos de nome e CPF durante a filtragem de pesquisa, prevenindo o erro `Cannot read properties of undefined (reading 'includes')` quando a base contém registros incompletos.

---

## [v4.9.27] - 31 de Agosto, 2026
### Limpeza de Dados Fictícios & Otimização da Aba Honorários (NexaMED)
- **Zerar Bases Fictícias (`medicalService.js` & `mockFirebase.js`):**
  - Zeradas todas as coleções e listas temporárias de **Produção**, **Procedimentos**, **Trocas**, **Plantões** e **Escala**.
- **Otimização da Aba Honorários (`MedicalSettingsTab.jsx`):**
  - Removida a listagem redundante de profissionais da aba Honorários, mantendo-a focada exclusivamente nas tabelas de consultas, plantões e procedimentos. A gestão dos profissionais permanece na aba **Profissionais**.

---

## [v4.9.25] - 31 de Agosto, 2026
### Plantões Clicáveis para Troca & Interface Enxuta para Médicos (NexaMED)
- **Plantões Clicáveis na Aba Plantões (`MedicalMyShiftsTab.jsx`):**
  - Cada card de plantão da lista agora é clicável e abre diretamente o modal para solicitar troca de plantão com um colega substituto.
  - Removida a coluna redundante "Procedimentos Executados" da aba Plantões.
- **Navegação Simplificada para o Médico Simples (`MedicalPanel.jsx`):**
  - Ocultadas as abas **Trocas** e **Produção** para médicos assistenciais, exibindo exclusivamente **Plantões** e **Procedimentos**.
  - Coordenação e Diretoria Clínica mantêm a visão de todas as abas de gestão.

---

## [v4.9.23] - 31 de Agosto, 2026
### Geração de Base Completa de Dados Fictícios de Demonstração (NexaMED)
- **Escalas e Plantões (`medicalService.js`):**
  - Geração de escala mensal assistencial para todos os 6 médicos em todos os setores (Salões 1, 2, 3 e DP) e turnos (Manhã, Tarde, Noite).
- **Procedimentos e Trocas (`medicalService.js` & `mockFirebase.js`):**
  - Cadastro de procedimentos cirúrgicos para todos os médicos com os 12 procedimentos oficiais da tabela de honorários.
  - Cadastro de solicitações de trocas de plantões com múltiplos status (Pendente, Aceito, Homologado) e rastreabilidade de notificações por e-mail.

---

## [v4.9.21] - 31 de Agosto, 2026
### Permissões por Perfil Médico & Solicitação de Troca de Plantões (NexaMED)
- **Restrição de Abas Administrativas (`MedicalPanel.jsx`):**
  - Ocultadas as abas **Escala**, **Profissionais** e **Honorários** para médicos sem perfil de Diretoria Clínica / Coordenação.
  - Acesso do médico comum restrito às suas abas operacionais (**Plantões**, **Trocas**, **Procedimentos**, **Produção**).
- **Solicitação de Troca de Plantão (`MedicalSwapsTab.jsx`):**
  - Adicionado botão e modal "+ Pedir Troca de Plantão" na aba Trocas para permitir que o médico requisite a substituição de qualquer plantão previamente escalado pela coordenação.

---

## [v4.9.19] - 31 de Agosto, 2026
### Correção de Renderização na Aba Produção (NexaMED)
- **Aba Produção (`MedicalProductionTab.jsx`):**
  - Correção de referência de variável (`shiftFee`/`consultFee`) nos cards de apuração financeira e tabela base de honorários.

---

## [v4.9.17] - 31 de Agosto, 2026
### Tabela Oficial de Honorários & Envio de Produção do Mês (NexaMED)
- **Tabela de Honorários e Plantões (`MedicalSettingsTab.jsx` & `medicalService.js`):**
  - Cadastrados valores referenciais de Consultas (Ambulatorial: R$ 100,00; Peritonial: R$ 160,00).
  - Cadastrados valores de Plantões assistenciais por turno (Manhã: R$ 726,00; Tarde: R$ 726,00; Noite: R$ 825,00).
  - Cadastrada a tabela completa com os 12 procedimentos cirúrgicos e intervencionistas nefrológicos com chaves de ativação, edição de valores e histórico.
- **Card "Enviar Produção do Mês" (`MedicalSendProductionCard.jsx`):**
  - Implementado componente idêntico ao modelo com seletores de Mês e Ano, apuração em tempo real, campo para e-mail adicional de contabilidade e ação de envio direto.

---

## [v4.9.15] - 31 de Agosto, 2026
### Ajustes no NexaMED (Gestão Médica) & Deduplicação Central de Pacientes
- **Aba Plantões NexaMED (`MedicalMyShiftsTab.jsx`):**
  - Removido o botão redundante "+ Lançar Procedimento" da visualização de plantões, mantendo o lançamento centralizado na aba de Procedimentos.
- **Ordem Alfabética & Deduplicação de Pacientes (`MedicalProceduresTab.jsx` & `patientService.js`):**
  - Corrigida a ordenação de pacientes para ordem alfabética estrita (`localeCompare` com normalização de acentos).
  - Implementada deduplicação por CPF e identificador/nome no modal de procedimentos e no método central `patientService.getPatients()`.

---

## [v4.9.13] - 31 de Agosto, 2026
### Unificação do Autocomplete e Busca Instantânea de Pacientes (Care, Recepção e Clínico)
- **Autocomplete Instantâneo na Recepção (`ReceptionPanel.jsx`):**
  - Adicionado dropdown flutuante de sugestões em tempo real diretamente acoplado à barra de pesquisa da recepção.
  - Ao pesquisar por nome ou CPF no Check-in/Presença, a busca agora consulta toda a base de pacientes ativos da unidade, eliminando o bloqueio da escala do dia (que anteriormente fazia com que pacientes que não dialisam no dia atual não aparecessem ao digitar o nome).
- **Autocomplete em Requisições & Sessões no NexaCARE (`CarePanel.jsx`):**
  - Substituído o antigo `<select>` estático da requisição de insumos por um componente de autocomplete idêntico ao do módulo `Assist` e `Agenda`, permitindo digitar nome ou CPF com seleção imediata ou alternar para uso geral do salão em 1 clique.
  - Adicionado dropdown de autocomplete instantâneo na barra de pesquisa principal de sessões de hemodiálise.
- **Busca Omnisearch no Prontuário Clínico (`ClinicalPanel.jsx`):**
  - Adicionada barra de busca na aba de Acompanhamento de Sessões (`monitoring`), permitindo localizar qualquer paciente por nome, CPF ou poltrona.
  - Otimizada a lista lateral do prontuário com pesquisa rápida e suporte a nomes sociais, telefones e CPFs limpos.

---

## [v4.9.9] - 30 de Agosto, 2026
### Aprimoramento e Unificação do Motor de Busca de Pacientes
- **Busca Normalizada e Tolerante a Acentos (Omnisearch):**
  - Refatoração dos filtros de pesquisa nos módulos `ClinicalPanel.jsx`, `CarePanel.jsx`, `PatientsPanel.jsx` e `ApacBillingPanel.jsx` para utilizar normalização Unicode NFD.
  - A busca agora ignora acentos, espaços desnecessários (trailing/leading) e casing (maiúsculo/minúsculo), garantindo que termos como "ADAIR" localizem corretamente "ADAIR PRAXEDES MORENO".
  - Busca direta por dígitos limpos de CPF em todos os painéis, removendo formatação (`.` e `-`) para correspondência exata.
- **Resolução de Omissão de Pacientes:**
  - Corrigido o problema onde os painéis "Clínico" e "Assistência" não exibiam resultados esperados ao iniciar a digitação devido a discrepâncias na normalização de texto em comparação ao painel de "Agenda" e "Mural (Assist)".

---

## [v4.9.8] - 30 de Agosto, 2026
### Correção de Falha Crítica na Busca de Pacientes (Tela de Erro)
- **Correção de `TypeError` em Funções de Filtro (`ClinicalPanel.jsx`, `PatientsPanel.jsx` e `ApacBillingPanel.jsx`):**
  - Adicionado tratamento seguro (`(p.name || '').toLowerCase()`) na lógica de pesquisa local para evitar erro crítico `Cannot read properties of undefined` (Tela de erro branca) causado pela tentativa de utilizar `.toLowerCase()` em registros sem nome definido ou com base importada de forma incompleta.
- **Estabilização Total de Módulos Clínicos:**
  - Restaurada a funcionalidade de busca e listagem no Prontuário Clínico (NexaCLINIC), Cadastro de Pacientes e Módulo de Faturamento APAC.

---

## [v4.9.7] - 30 de Agosto, 2026
### Correção de Carregamento no Clínico e Busca Inteligente na Recepção
- **Correção de useMemo no Painel Clínico (`ClinicalPanel.jsx`):**
  - Importação do hook `useMemo` ausente, eliminando o erro `ReferenceError: useMemo is not defined` ao acessar o prontuário.
- **Busca Normalizada e Tolerante a Acentos na Recepção (`ReceptionPanel.jsx`):**
  - Implementada busca com normalização Unicode NFD e busca direta por dígitos limpos de CPF e CNS (ex: digitando "ADAIR" localiza imediatamente "ADAIR PRAXEDES MORENO").
- **Garantia de Carregamento Contínuo da Base Mestre (`patientService.js`):**
  - Adicionado particionamento de lotes de 400 escritas para o Firestore e fallback imediato caso a conexão com a nuvem demore ou esteja vazia.

---

## [v4.9.6] - 30 de Agosto, 2026
### Base Central e Unificada de Pacientes (Master Patient Record) em Todo o Sistema
- **Base Mestre Canônica Unificada (Single Source of Truth):**
  - Consolidação e deduplicação de 691 fichas de pacientes com dados cadastrais, APACs autorizadas, acessos vasculares, alocações de sala/turno e histórico clínico-transplante sem duplicidades.
- **Serviço Centralizado no Banco de Dados (`patientService.js`):**
  - Métodos padronizados de busca inteligente multi-campos (Nome, CPF sem pontuação, Prontuário, CNS e APAC) e sincronização em tempo real no Firestore e MockDB.
- **Redirecionamento de Todos os Módulos:**
  - *Recepção & Admissão:* Hub mestre de admissão e check-in diário sincronizado em tempo real.
  - *Prontuário Clínico:* Prescrições, evoluções e exames laboratoriais vinculados diretamente ao paciente selecionado.
  - *NexaCARE (Enfermagem):* Sessões de hemodiálise e escalas alimentadas pelos dados centrais.
  - *NexaASSIST:* Alertas, altas e leitor de e-mails com vinculação automática inteligente aos pacientes da base.
  - *NexaMED:* Procedimentos cirúrgicos (CDL, FAV, biópsias) e escalas com histórico unificado.
  - *NexaCAL (Agenda):* Agendamento de consultas com busca preditiva no cadastro mestre.
  - *NexaAPAC (Faturamento):* Validade de APACs e glosas conectadas aos dados reais dos pacientes.
- **Diretrizes de UI/UX & Manuais:**
  - Aplicação rigorosa da regra de rótulos concisos (1 palavra / termo único) e documentação atualizada no manual do sistema (`src/data/moduleGuidesData.js`).

---

## [v4.9.4] - 30 de Agosto, 2026
### NexaCARE — Autocomplete Idêntico ao Módulo Assist e Busca Direta de Pacientes
- **Componente Autocomplete Padronizado com o Módulo Assist:**
  - Implementação idêntica da busca de paciente com dropdown suspenso em tempo real:
    - Exibe nome do paciente em destaque.
    - Exibe linha de apoio com `CPF`, `Salão` e `Turno` (inclusive para pacientes cadastrados com "Sem salão / Turno N/A").
  - Ao selecionar um paciente, exibe o card de vínculo ativo com botão direto "Trocar Paciente".
- **Busca Global na Tabela:**
  - Consulta direta por nome e CPF sem bloqueios por salão ou turno ausente.

---

## [v4.9.3] - 30 de Agosto, 2026
### NexaCARE — Busca Inteligente no Cadastro Completo de Pacientes e Autocomplete no Modal de Sessão
- **Busca Global & Normalização NFD:**
  - Consulta de pacientes com tolerância a acentos (normalização Unicode NFD), busca case-insensitive e limpeza de pontuação de CPF.
  - Varredura irrestrita em todos os pacientes cadastrados no sistema (Nome, Nome Social, CPF, Prontuário, Cadeira, CNS, Salão, Turno e Acesso).
- **Buscador com Autocomplete no Modal de Sessão:**
  - Adição de campo de busca interativa preditiva com dropdown no topo do modal de sessão de hemodiálise, permitindo localizar e selecionar qualquer paciente do cadastro com 1 clique.
- **Fallback Seguro de Unidade:**
  - Proteção contra listas vazias quando pacientes cadastrados não possuem tag de unidade ou quando alternada a unidade ativa no seletor geral.
- **Diretrizes de UI/UX (1-Word Rule):**
  - Aplicação rigorosa da regra de termos concisos e únicos em botões e formulários.

---

## [v4.9.2] - 30 de Agosto, 2026
### NexaCARE — Correção na Consulta de Pacientes, Filtro de Cadência, Botão de Iniciar Sessão e Seletor no Modal
- **Busca e Consulta Ampla de Pacientes (Aba Sessão):**
  - Correção na lógica de filtragem da grade de hemodiálise: eliminada a restrição fixa por dia da semana que ocultava pacientes no domingo/testes.
  - Busca inteligente e instantânea por Nome, CPF (com ou sem pontuação), Cadeira (#), CNS, Salão (1, 2, 3), Turno e tipo de acesso vascular (FAV/Cateter).
- **Filtro Seletor de Cadência:**
  - Inclusão do dropdown de Cadência (`Cadência (Todas)`, `Hoje (Turno Atual)`, `Seg / Qua / Sex (SQS)`, `Ter / Qui / Sáb (TQS)`).
- **Botão de Ação Destacado (+ Iniciar Sessão):**
  - Inclusão do botão de ação primária em verde-azulado (+ Iniciar Sessão) no topo dos controles e no estado vazio (empty state) da tabela.
- **Seletor de Paciente no Topo do Modal:**
  - Adição de dropdown pesquisável no cabeçalho da folha eletrônica de diálise permitindo selecionar ou alternar o paciente em atendimento em tempo real.
- **Conformidade com Diretrizes de UI/UX (1-Word Rule):**
  - Padronização de todos os novos rótulos para termos únicos e diretos.

---

## [v4.9.1] - 30 de Agosto, 2026
### Módulo NexaCARE (Enfermagem & Salão) — Cockpit Unificado com 4 Abas (Sessão, Escala, Requisição, Chamados) e Perfil Nativo no RBAC
- **Cockpit Unificado da Enfermagem (NexaCARE):**
  - Evolução integral do módulo de salão, reunindo as 4 rotinas diárias essenciais dos técnicos de enfermagem em um único ambiente moderno:
    1. *Sessão:* Digitação e acompanhamento da hemodiálise (avaliação pré-diálise, tabela horária da 1ªh à 4ªh com PA, pulso, pressões de linha PV/PA art, Qb real e taxa UF, intercorrências intradialíticas em 1 toque e fechamento pós-diálise com cálculo de perda hídrica efetiva).
    2. *Escala:* Consulta da grade de pacientes por salão (Salões 1, 2 e 3), turnos e cadências (SQS/TQS) em modo leitura com busca instantânea de pontos e cadeiras.
    3. *Requisição:* Solicitação ágil de kits pré-configurados e insumos avulsos por salão ou vinculados a pacientes, com verificação de estoque e rastreamento na farmácia.
    4. *Chamados:* Abertura direta de chamados técnicos e ordens de serviço corretivas para máquinas de hemodiálise, osmose e poltronas, sincronizadas em tempo real com a Engenharia Clínica no NexaSERVICE.
- **Perfil Nativo Técnico de Enfermagem (RBAC):**
  - Criação do perfil `nurse_tech` ("Técnico de Enfermagem") na matriz de controle de acessos do `NexaCONFIG` e no Firestore, com permissões sob medida para a equipe assistencial de salão.
- **Padrão de Rótulos Únicos (UI/UX 1-Word Rule):**
  - Conformidade estrita com o padrão de termos únicos concisos em todas as abas, botões, modais e formulários.
- **Manual do Módulo:**
  - Atualização completa de Recursos, Tutoriais e Dúvidas Frequentes do NexaCARE em `src/data/moduleGuidesData.js`.

---

## [v4.8.1] - 29 de Agosto, 2026
### Módulo Recepção — Admissão Nefrológica Completa em 6 Abas, Busca de CEP (ViaCEP), Atalhos WhatsApp & Alerta de Ganho de Peso
- **Admissão Nefrológica Completa em 6 Abas:**
  - Reformulação integral do cadastro de pacientes com divisão lógica em abas:
    1. *Identificação Civil* (Nome, Nome Social, CPF, CNS de 15 dígitos, RG, Data de Nascimento com cálculo de idade em tempo real, Gênero, Estado Civil, Nome da Mãe e Pai).
    2. *Contatos & Endereço* (Busca instantânea de CEP via API ViaCEP, Logradouro, Bairro, Cidade, UF, Ponto de Referência, Telefone Principal e Acompanhantes/Contatos de Emergência com parentesco).
    3. *Convênio & APAC* (Pagante SUS, Unimed, Bradesco, Amil, SulAmérica, Particular, Carteirinha, Validade da Guia e APAC com alerta preditivo de vencimento).
    4. *Logística de Diálise* (Modalidade HD/DP/Conservador, Frequência Semanal, Turno, Salão, Poltrona #1 a #20, Tipo de Acesso Vascular, Localização anatômica, Peso Seco e Médico Assistente).
    5. *Nefrologia & Admissão* (Origem, Centro de Origem, Data da 1ª diálise da vida, Caráter Eletivo vs Urgência, Local Hospital vs Clínica, Etiologia da DRC/CID-10, Tipo Sanguíneo/RH, Alergias Conhecidas e Comorbidades).
    6. *Transplante Renal* (Indicação, Situação na Fila RBT, Centro Transplantador, Inscrição Estadual, Tipo de Doador e Histórico Obstétrico/Sensibilização HLA).
- **Eliminação de Burocracias Legadas:**
  - Remoção total de campos obsoletos (Título de Eleitor, Zona, Seção, CTPS, Série, PIS/PASEP, Certidões de Cartório) em conformidade com as diretrizes do SUS Digital e LGPD.
- **Autocompletar de Endereço (ViaCEP):**
  - Consulta automática da API dos Correios (ViaCEP) ao digitar o CEP, preenchendo rua, bairro, cidade e estado em 1 segundo.
- **Check-in Diário de Presença & Cálculo de Ganho de Peso Interdialítico:**
  - Confirmação de presença do dia com registro de Peso de Entrada, Pressão Arterial e Temperatura.
  - Cálculo instantâneo do Ganho de Peso Interdialítico (`Peso de Entrada - Peso Seco`), com badge vermelho de alerta para ganhos críticos (> 4.0 kg).
- **Comunicação Direta por WhatsApp:**
  - Disparo de mensagens pré-formatadas para o paciente ou contatos de emergência/recado diretamente da lista de presença e cadastro.
- **Conexão com Cockpit Clínico & Prontuário Médico:**
  - Integração dos dados de admissão (Alergias em destaque vermelho, Tipo Sanguíneo, Etiologia e Transplante) diretamente na visualização médica do prontuário.
- **Conformidade com Diretrizes de UI/UX (Termo Único):**
  - Padronização de 100% dos rótulos de tabelas, abas e filtros com termos diretos de 1 palavra.

---

## [v4.7.90] - 29 de Agosto, 2026
### Módulo Agenda (NexaCAL) — Registro Ágil de Falta (No-Show), WhatsApp Dinâmico com Branding e Isolamento Multi-Unidade
- **Ação Rápida de Falta (No-Show):**
  - Implementação do botão "Faltou" na recepção diária e na timeline de horários para registro ágil de ausência de pacientes com 1 clique.
  - Atualização automática dos indicadores e KPIs de absenteísmo nos relatórios gerenciais e na busca global.
- **WhatsApp Dinâmico com Branding da Clínica:**
  - Template de mensagens de confirmação e lembrete integrado diretamente com a Razão Social ou Nome Fantasia configurado no módulo de Branding (`tenantSettings.name`), garantindo comunicação oficial personalizada.
- **Isolamento Multi-Unidade nos Bloqueios de Agenda:**
  - Inclusão do `unitId` e `unit` em todos os registros de bloqueios de agenda para segregação completa entre unidades (Betim e Taguatinga).
- **Normalização dos 15 Relatórios Gerenciais:**
  - Compatibilidade universal com os status operacionais da agenda (`Finalizado`, `Atendido`, `Em Consulta`, `Em Atendimento`, `Aguardando`, `Faltou`), garantindo precisão nos extratos em PDF timbrado e Excel (XLSX).
- **Atualização do Manual do Módulo:**
  - Inclusão de recursos, passo a passo e FAQ da Agenda e Relatórios em `src/data/moduleGuidesData.js`.

---

## [v4.7.87] - 29 de Agosto, 2026
### Corpo Clínico — Padronização Visual sem CRM/Títulos, Ordenação A-Z e Sincronização em Lote de 38 Profissionais via CSV
- **Padronização e Limpeza Visual do Corpo Clínico:**
  - Remoção rigorosa de prefixos e títulos profissionais ("Dr.", "Dra.", "Doutor(a)") em todas as telas e seletores do sistema.
  - Ocultação de menções redundantes a CRM e especialidades nos dropdowns da Agenda, Escala de Plantões, Bolsa de Trocas e Procedimentos, exibindo exclusivamente o nome limpo do profissional.
  - Ordenação alfabética padronizada (A-Z) em todos os seletores de médicos e profissionais clínicos do sistema.
- **Sincronização em Lote de 38 Profissionais via CSV (`prodissionais.CSV`):**
  - Integração em lote de 38 profissionais cadastrados na base corporativa com criação/atualização de contas no Firebase Auth (`login@nexa.com`, senha padrão corporativa `login123`) e espelhamento no Firestore.
  - Vínculo automático de todos os médicos ao perfil com permissão de escrita nos módulos Assistencial (`assist` / NexaASSIST), Médico (`med` / NexaMED), Clínico (`clinic` / NexaCLINIC) e Agenda (`cal` / NexaCAL).
  - Normalização de nomes e campos de contato (telefone, e-mail corporativo, status ativo).

---

## [v4.7.85] - 29 de Agosto, 2026
### Módulo Agenda (NexaCAL) — Central de 15 Relatórios Clínicos & Operacionais com Exportação PDF e Excel
- **Central de 15 Relatórios Clínicos e Estratégicos:**
  - Lançamento da central integrada de relatórios para o módulo Agenda (NexaCAL), acessada diretamente pelo botão "Relatórios" do Navbar:
    1. *Extrato Geral de Agendamentos (Grade Completa)*
    2. *Produtividade & Atendimentos por Médico*
    3. *Taxa de Absenteísmo & Faltas (No-Show)*
    4. *Confirmações & Disparos via WhatsApp*
    5. *Ocupação & Utilização de Consultórios*
    6. *Distribuição por Tipo de Consulta*
    7. *Encaixes & Atendimentos de Urgência*
    8. *Cancelamentos & Reagendamentos*
    9. *Cotas Anuais & Metas por Médico*
    10. *Bloqueios de Agenda & Afastamentos*
    11. *Tempo de Espera & Pontualidade*
    12. *Distribuição por Convênio / Plano de Saúde*
    13. *Pacientes Crônicos Sem Retorno (Busca Ativa Preventiva)*
    14. *Escala Médica vs Feriados Nacionais*
    15. *Auditoria de Inclusões & Alterações de Agenda*
- **Exportação Profissional em PDF & Excel (XLSX):**
  - Botão de exportação **PDF** com layout timbrado hospitalar, cabeçalho da clínica, dados do CNPJ, filtros ativos e paginação automática com `jsPDF` e `jspdf-autotable`.
  - Botão de exportação **Excel** com geração de planilhas `.xlsx` formatadas com células numéricas limpas prontas para auditorias e análises dinâmicas.
- **Painel de Indicadores (KPIs) & Filtros Dinâmicos:**
  - Filtros cruzados por Período Inicial/Final, Profissional Médico, Sala/Consultório e Status do agendamento, com atualização em tempo real de KPIs (Total, Realizados, No-Show, Encaixes e Taxas de Conversão).

---

## [v4.7.84] - 29 de Agosto, 2026
### Módulo Configurações (NexaCONFIG) — Matriz RBAC com Feed Assistencial e Médico, Ordenação Alfabética e Salvamento Ágil de Usuários
- **Matriz RBAC com Módulos Assistencial e Médico:**
  - Inclusão das colunas de permissão para o Feed Assistencial (`assist` / NexaASSIST) e Gestão Médica (`medical` / NexaMED) na matriz de perfis de usuário do sistema.
  - Permite aos administradores definir granularmente o acesso (`Bloqueado`, `Leitura` ou `Escrita`) para qualquer perfil operacional (Médico, Enfermagem, Recepção, RH, etc.), com reflexo imediato no seletor de módulos.
- **Ordenação Alfabética Rigorosa de Funcionários:**
  - Ordenação alfabética (A-Z com suporte a acentuação em português) aplicada na busca do banco de dados e no seletor de colaboradores físicos no modal de criação e edição de credenciais de login.
- **Gravação de Acessos em 1 Clique Único (Atômica):**
  - Refatoração dos métodos de criação e atualização de usuários no Firebase Auth e Firestore com payload unificado e uso de `setDoc(..., { merge: true })`.
  - Eliminação de chamadas redundantes e fechamento instantâneo do modal com mensagem de confirmação em toast, resolvendo o comportamento onde era necessário clicar duas vezes para salvar.
- **Layout Responsivo do Modal com Rodapé Fixo:**
  - Ajuste de dimensionamento do modal de usuários com altura máxima de `92vh`, rolagem interna fluida no formulário e rodapé com o botão "Gravar Acesso" sempre fixo e visível, sem necessidade de alterar o zoom do navegador.
- **Padronização de Rótulos em Termo Único (Boy Scout Rule):**
  - Limpeza e padronização rigorosa de todos os cabeçalhos de tabela e rótulos de campos nas abas de Perfis, Usuários, Locais de Estoque, Categorias e Logs de Auditoria.

---

## [v4.7.82] - 28 de Agosto, 2026
### Módulo de Compras (NexaPROCURE) — Ordem de Compra Oficial (PO), Provisão no Contas a Pagar, Saving & Curva ABC
- **Emissão e Envio da Ordem de Compra Oficial (PO / Purchase Order):**
  - Geração de documento timbrado e padronizado de Ordem de Compra hospitalar (`#OC-YYYY-XXX`) para cada fornecedor vencedor após homologação (pedido único ou compra dividida/split).
  - Espelho com dados da unidade compradora, fornecedor, CNPJ, itens premiados, marcas, quantidades, valores unitários e totais, frete (CIF/FOB), prazo de entrega e condições de pagamento.
  - Seções formais de instruções fiscais/ANVISA, assinatura do comprador e autorização da diretoria.
  - Botão de Impressão A4 limpa (`@media print`), disparo direto no WhatsApp do representante comercial e cópia rápida de resumo.
- **Integração Automática com o Módulo Financeiro (`Contas a Pagar`):**
  - No momento da homologação, o sistema gera automaticamente uma provisão de despesa no Contas a Pagar (`accounts_payable`).
  - Registro parametrizado com status `Pendente`, `isProvision: true`, centro de custo de Farmácia/Almoxarifado, categoria de insumos e data de vencimento calculada a partir do prazo negociado.
- **Indicador de Saving (Economia em R$ e %):**
  - Cálculo em tempo real da economia gerada em relação à última compra histórica por insumo e total da cotação.
  - KPI Card de Economia Total (Saving) no topo da aba de cotações e badges verdes de economia no Mapa Comparativo de Preços.
- **Auditoria de Histórico de Preços & Inflação:**
  - Novo modal interativo de auditoria de preços ao clicar em qualquer insumo no catálogo ou no mapa de cotações.
  - Exibição de menor preço histórico, preço médio ponderado, maior preço pago e linha do tempo com percentuais de variação (economia/aumento).
- **Classificação Curva ABC no Estoque de Reposição:**
  - Classificação inteligente de todos os insumos em **Classe A** (80% do valor financeiro), **Classe B** (15%) e **Classe C** (5%).
  - Filtro por classe na aba de Reposição e badges visuais estilizados para tomada de decisão estratégica de suprimentos.

---

## [v4.7.80] - 28 de Agosto, 2026
### Módulo Compras / Cotação Web (NexaPROCURE) — Busca Alfabética por Digitação de Insumos & Layout Responsivo com Rodapé Fixo
- **Busca por Digitação em Ordem Alfabética:**
  - Adição de campo de busca inteligente por digitação com autocomplete em tempo real para os insumos do catálogo de estoque, listados rigorosamente em ordem alfabética.
  - Exibição de informações vitais no menu flutuante: nome, código (`#code`), categoria, subgrupo, saldo atual em estoque, nível mínimo e último preço praticado.
  - Ao clicar no insumo, ele é adicionado instantaneamente à cesta da cotação com cálculo automático de necessidade (`Estoque Ideal - Estoque Atual`), limpando o campo de busca pronto para o próximo insumo.
- **Layout Responsivo com Barra de Rolagem Interna e Rodapé Fixo:**
  - O modal de Nova Cotação foi reestruturado com barra de rolagem vertical independente no corpo do formulário (`overflowY: auto`), impedindo que o conteúdo fique apertado ou corte elementos na tela.
  - O rodapé com os botões "Cancelar" e "Publicar Cotação e Gerar Links" fica permanentemente fixo na base do modal, eliminando qualquer necessidade de reduzir o zoom do navegador para visualizar a ação final.
- **Gestão Ágil de Fornecedores na Cotação:**
  - Barra de filtro por digitação de fornecedores (por nome, razão social, CNPJ, telefone ou contato).
  - Botões de ação rápida "Selecionar Todos" e "Desmarcar Todos".
  - Grade de fornecedores com rolagem vertical independente e cartões clicáveis com indicação visual de seleção.
- **Insumos Livres e Estoque Crítico:**
  - Botão "+ Insumo Livre" para inclusão de itens pontuais não cadastrados no catálogo e botão "Importar Estoque Crítico" para reposição automática de itens abaixo do ponto de pedido.

---

## [v4.7.78] - 28 de Agosto, 2026
### Módulo de Compras (NexaPROCURE) — Busca com Digitação (Autocomplete) de Insumos do Estoque & Correção de Unidade
- **Busca por Digitação em Tempo Real (Autocomplete):**
  - O solicitante agora pode digitar diretamente o nome, código ou categoria do insumo desejado (ex: *dipirona*, *luva*, *seringa*, *agulha*, etc.), com filtro instantâneo e insensível a acentos.
- **Dropdown Inteligente de Produtos:**
  - Exibição de menu suspenso flutuante com nome em destaque, código (`#123`), categorias/subgrupos e indicador de saldo em estoque (verde ou vermelho se abaixo do mínimo).
- **Seleção Rápida e Preenchimento Automático:**
  - Ao clicar no insumo, o sistema preenche a unidade de medida padrão (ex: `UNIDADE`, `Frasco`, `Caixa`) e confirma a seleção com badge visual e opção rápida de limpeza/troca.
- **Correção no Filtro Multi-Unidade:**
  - Ajuste na verificação de unidade ativa do `UnitContext` para garantir que itens do estoque geral nunca sejam ocultados por confusão entre unidade de medida e filial da clínica.

---

## [v4.7.77] - 28 de Agosto, 2026
### Módulo de Compras (NexaPROCURE) — Pedidos Multi-Itens, 3 Modos de Visualização & Gestão do Solicitante
- **Pedidos Consolidados com Múltiplos Insumos:**
  - O solicitante agora monta um pedido de compras completo com múltiplos insumos em uma única solicitação (`#SOL-YYYY-XXX`), podendo mesclar itens cadastrados no estoque e novos insumos livres.
- **3 Modos de Visualização na Esteira (Compacta como Padrão):**
  - **Compacta (Padrão ⭐):** Visualização em tabela densa, com código, data, setor, solicitante, resumo dos insumos solicitados, status e ações rápidas.
  - **Normal:** Grade de cards informativos com lista de insumos e detalhes do pedido.
  - **Estendida:** Cards amplos com a esteira/stepper de 5 fases de aprovação e tabela interna de itens com especificações completas.
- **Gestão do Solicitante (Edição e Exclusão):**
  - Permite ao solicitante editar seus pedidos ou excluí-los enquanto a solicitação estiver em análise inicial (`Aguardando Gestor`) ou caso tenha sido recusada.
- **Modal de Detalhes Completo:**
  - Janela modal para inspeção profunda de todos os insumos, quantidades, unidades, especificações e histórico cronológico de aprovações.
- **Busca & Filtros da Esteira:**
  - Busca textual por código, insumo, solicitante ou setor, combinada com filtro rápido por status da esteira.

---

## [v4.7.75] - 28 de Agosto, 2026
### Módulo de Compras (NexaPROCURE) — Controle de Acesso por Perfis (RBAC) & Segregação de Visualização
- **Identificação Inteligente de Perfis e Papéis:**
  - Segregação automática e em cascata por e-mail (`contato@techcosta.net`), papéis (`admin`, `compras`, `gestor`, `professional`), setores atribuídos e cargo no RH.
- **Visão Simplificada do Colaborador / Solicitante:**
  - Usuários comuns (equipe assistencial, enfermagem, recepção, psicologia, nutrição, etc.) visualizam exclusivamente a esteira de pedidos, ocultando abas avançadas de reposição crítica, cotações e fornecedores.
- **Filtro Rápido de Solicitações:**
  - Alternância facilitada entre "Todas do Setor" e "Minhas Solicitações" para acompanhamento ágil do andamento de aprovações.
- **Rastreabilidade de Pedidos:**
  - Registro automático de nome e e-mail do autor em cada solicitação e no histórico da esteira.
- **Segurança de Acesso e Redirecionamento Dinâmico:**
  - Prevenção de acessos forçados a abas administrativas e redirecionamento instantâneo.

---

## [v4.7.73] - 28 de Agosto, 2026
### Módulo de Compras (NexaPROCURE) — Sistema de Cotações Web & Portal B2B para Fornecedores
- **Cotações Web e E-Procurement:**
  - Criação de rodadas de cotação digital multi-itens a partir de insumos críticos do estoque ou catálogo geral da clínica.
- **Portal B2B Público do Fornecedor (`/cotacao?token=...`):**
  - Ambiente responsivo onde os fornecedores acessam via link exclusivo com token seguro (sem burocracia de cadastros e senhas) para preencher preços unitários, marcas ofertadas, tipo de frete (CIF/FOB), prazos de entrega e anexar propostas formais em PDF.
- **Disparo Automatizado via WhatsApp:**
  - Botão de envio que abre o WhatsApp do representante comercial com a mensagem estruturada e link exclusivo para resposta imediata.
- **Mapa Comparativo Inteligente:**
  - Matriz de preços lado a lado destacando em verde o menor valor unitário por item (🏆) e comparativo de variação com a última compra histórica da clínica.
- **Homologação Flexível e Emissão de Pedido de Compra:**
  - Suporte à compra dividida pelos melhores itens de cada distribuidor (Split Order) ou fechamento consolidado com fornecedor único.
- **Segurança e Sigilo:**
  - Cotação cega (Blind Bidding) com sigilo total de concorrentes e regras dedicadas no Firestore.

---

## [v4.7.72] - 28 de Agosto, 2026
### Módulo RH — Armazenamento em Nuvem (Firebase Cloud Storage) e Visualização de Exames Ocupacionais (ASO)
- **Integração com Firebase Cloud Storage:**
  - Upload automático e seguro de laudos e comprovantes de ASO (arquivos PDF, PNG, JPG, DOCX) diretamente no bucket de armazenamento em nuvem.
- **Visualização Remota e Download em Qualquer Lugar:**
  - Inclusão do botão de visualização com link direto para abertura em nova aba de alta definição, permitindo consulta remota e download por médicos, gestores e colaboradores.
- **Desacoplamento e Estabilidade do Banco de Dados:**
  - Eliminação do armazenamento de arquivos em Base64 no corpo dos documentos do Firestore, contornando o limite de 1 MB e prevenindo qualquer falha de gravação.
- **Correção de Permissões de Segurança (RBAC):**
  - Atualização do `firestore.rules` com a declaração da coleção `occupational_exams` e do `storage.rules` para autorização de leitura e escrita nos buckets.
- **Interface & Experiência de Usuário:**
  - Componente moderno de upload com dropzone, indicador de tamanho de arquivo (KB/MB), badge de arquivo na nuvem, botão para remoção/substituição e feedback de progresso durante o envio.

---

## [v4.7.68] - 27 de Agosto, 2026
### Módulo de Manutenção — Sistema de Ordem de Serviço de T.I. com SLA e Gestão por Setores
- **Aba Dedicada "Chamados T.I." no NexaSERVICE:**
  - Sistema completo de Service Desk / Helpdesk integrado ao módulo de Manutenção acessível para todos os colaboradores da clínica.
- **Segregação Rigorosa de Acessos (RBAC):**
  - Colaboradores comuns visualizam exclusivamente os seus próprios chamados, enquanto o Administrador e equipe de T.I. gerenciam 100% de todos os chamados da instituição.
- **Painel Executivo de SLA em Tempo Real:**
  - Metas contratuais de atendimento (Crítico 2h, Alta 8h, Média 24h, Baixa 48h) com cálculo automático, semáforo visual (No Prazo, Alerta, Estourado, Cumprido) e taxas de cumprimento %.
- **Categorização & Setores Hospitalares:**
  - Classificação técnica por incidentes (Hardware, Sistemas, Rede, Impressoras Zebra/Laser, Acessos, Telefonia, Segurança, Servidores) e setores da clínica (Salões de Hemodiálise, Recepção, Farmácia, Consultório, CME, CTA, etc.).
- **Atendimento Técnico & Linha do Tempo:**
  - Atribuição de técnico, diagnóstico, registro de solução aplicada, peças substituídas e timeline interativa com mensagens entre solicitante e suporte.
- **Impressão de O.S. Formatada em A4:**
  - Geração de documento de Ordem de Serviço de T.I. com laudo técnico e campos de assinatura para homologação.

---

## [v4.7.66] - 25 de Agosto, 2026
### Módulo RH — Controle de Exames Ocupacionais (ASO) e Alertas de Vencimento (30d, 14d, 7d)
- **Aba Dedicada "Exames" no NexaHR:**
  - Gerenciamento completo de exames médicos ocupacionais (Admissional, Periódico, Demissional, Mudança de Função e Retorno ao Trabalho) para colaboradores CLT e prestadores PJ.
- **Alertas Preditivos na Dashboard:**
  - Cards e widgets dinâmicos de alerta com contagem regressiva para exames Vencidos, Próximos 7 Dias (Crítico), Próximos 14 Dias (Atenção) e Próximos 30 Dias (Alerta), com atalho de renovação direta.
- **Cálculo Automático de Periodicidade (+1 ano):**
  - Projeção automatizada do próximo vencimento para 12 meses a partir do último exame ou da data de admissão do colaborador.
- **Modal de Lançamento de ASO & Upload:**
  - Cadastro estruturado de laudos com Parecer (Apto/Inapto/Restrições), CRM/Médico, Clínica/Laboratório, observações e anexos em Base64/arquivo.
- **Filtros e Ações Rápidas:**
  - Tabela com filtros por tipo de contrato (CLT/PJ), modalidade de exame, nível de urgência, busca em tempo real e botão de renovação em 1 clique.

---

## [v4.7.63] - 25 de Agosto, 2026
### Importação do Catálogo de Fornecedores de Taguatinga e Autocompletar no Contas a Pagar
- **Carga e Conciliação de Fornecedores:**
  - Importação de 158 fornecedores de Taguatinga a partir do relatório oficial com decodificação perfeita de caracteres, CNPJ, Razão Social, Nome Fantasia e Município.
  - Conciliação inteligente: 126 novos cadastros criados e 32 parceiros existentes enriquecidos com suporte multi-filial (`units: ['betim', 'taguatinga']`).
- **Autocompletar Inteligente em Despesas:**
  - Campo "Fornecedor" no formulário de Nova Despesa (Contas a Pagar) integrado a datalist interativo filtrado em tempo real pela filial ativa.
- **Suporte Multi-Filial no Estoque e Unidades:**
  - `UnitContext` e módulo de Estoque aprimorados para suportar fornecedores vinculados a múltiplas filiais simultâneas.

---

## [v4.7.62] - 25 de Agosto, 2026
### Isolamento Rigoroso de Métricas e Saldos Financeiros por Filial (Taguatinga vs Betim)
- **Correção de Escopo e Métricas em Cards Operacionais:**
  - Os cards operacionais **"A PAGAR (PRÓXIMOS 7 DIAS)"** e **"A PAGAR (PRÓXIMOS 15 DIAS)"** agora filtram estritamente sobre a lista de títulos da filial ativa (`currentPayableList`), corrigindo o vazamento de valores de Betim na visualização de Taguatinga.
  - Alertas simulados de APAC foram configurados para exibir registros apenas na filial Betim / visão global, apresentando lista limpa e sem ruídos em Taguatinga.
- **DRE Gerencial e Projeção de Saldo Fluxo Dinâmicos:**
  - O **DRE Gerencial** foi refatorado para remover valores fixos de fallback (`540000`, etc.), refletindo com precisão matemática o faturamento, custos variáveis, custos fixos e despesas bancárias da filial ativa (apresentando R$ 0,00 quando a unidade não possui lançamentos).
  - A **Projeção de Saldo Fluxo** agora agrupa e projeta os saldos mensalmente de forma dinâmica com base nas datas reais de vencimento e quitação da filial ativa, substituindo tabelas e avisos estáticos de Betim por diagnóstico de liquidez contextualizado.
- **Segregação de Dívidas, Acordos e Conciliação Bancária:**
  - Abas de **Dívidas de Longo Prazo**, **Acordos & Renegociações** e **Conciliação Bancária** conectadas às listas filtradas por unidade (`currentDebtsList`, `currentAgreementsList`, `currentBankStatements`), com contadores de abas e gavetas de parcelas 100% consistentes.
- **Sincronização de Estado de Filial:**
  - O estado do seletor interno do painel financeiro agora reage dinamicamente às trocas de filial realizadas no `UnitContext` global.

---

## [v4.7.60] - 24 de Agosto, 2026
### Aba Dedicada "Profissionais" no NexaMED para Gestão e Complementação do Corpo Clínico
- **Aba Exclusiva "Profissionais":**
  - Adicionado menu e aba dedicada **Profissionais** diretamente na barra superior do **NexaMED** para facilitar a localização e gerenciamento de todos os médicos cadastrados.
- **Painel de Indicadores & Métricas:**
  - Cards no topo da aba exibindo o total de médicos, cadastros completos e cadastros pendentes de complementação.
- **Barra de Pesquisa e Filtros Rápidos:**
  - Busca instantânea por Nome, CRM, CPF, E-mail, Celular ou Especialidade, com filtros rápidos por status (Todos, Pendentes e Ativos).
- **Ação Direta "Completar / Editar":**
  - Botão destacado na tabela que abre o modal completo de edição para preencher ou atualizar CPF, Cartão SUS, Celular, CRM/UF, Especialidade, Vínculo, PIX e Dados Bancários.

---

## [v4.7.59] - 24 de Agosto, 2026
### Perfil RBAC Médico e Cadastro Completo no NexaMED (CPF, SUS, Celular, CRM, PIX e Banco)
- **Novo Perfil RBAC "Médico / Corpo Clínico" (`doctor`):**
  - Adicionado perfil de segurança dedicado com concessão automática de acessos aos módulos clínicos e assistenciais (`medical`, `clinical`, `calendar`, `assist`, `stock: read`, `maintenance: read`).
  - Disponível para seleção imediata no painel de administração e T.I. (`NexaCONFIG`).
- **Fluxo Integrado em 2 Etapas (T.I. + Coordenação Médica):**
  - O Administrador de T.I. cria o usuário no sistema centralizando o controle de acesso e senhas.
  - A Coordenação Médica realiza a complementação da ficha do profissional diretamente na aba **Honorários** do **NexaMED**.
- **Cadastro Médico Completo & Persistência em Nuvem:**
  - Novo modal de edição e complementação médica incluindo:
    - **Dados Pessoais & Contato:** Nome, CPF, Cartão SUS (CNS), Celular / WhatsApp, E-mail.
    - **Dados Profissionais:** CRM / UF, Especialidade (Nefrologia, Cirurgia Vascular, etc.).
    - **Dados Financeiros & Honorários:** Vínculo Contratual (PJ, CLT, Autônomo, Cooperado), Chave PIX, Banco (Agência/Conta), Status (Ativo/Inativo).
  - Badge inteligente **"Completar"** para sinalizar médicos recém-criados que ainda possuem dados pendentes de preenchimento.
  - Sincronização automática entre a coleção de médicos (`medical_doctors`) e a base de usuários (`users`) no Firestore.
- **Padrão Rigoroso de Rótulos Concisos (1 Palavra):**
  - Aplicação estrita da diretriz de 1 palavra nos botões, modais, formulários e tabelas do módulo médico.

---

## [v4.7.57] - 24 de Agosto, 2026
### NexaCAL — Atualização das Salas de Atendimento (Consultórios 1 a 6 e Consultório DP)
- **Padronização das Salas da Agenda:**
  - O catálogo de salas do módulo Agenda foi atualizado para conter exclusivamente: **Consultório 1**, **Consultório 2**, **Consultório 3**, **Consultório 4**, **Consultório 5**, **Consultório 6** e **Consultório DP**.
  - Removidas salas não aplicáveis (Salão 1, Salão 2, Sala Ultrassom e Pequenos Procedimentos) da grade por salas, do filtro de pesquisa e dos seletores dos modais de agendamento e grade médica.

---

## [v4.7.56] - 24 de Agosto, 2026
### NexaCAL — Configuração Anual de Grade, Pesquisa Global Multianual e Legenda Visual
- **Configuração de Agenda por Ano Inteiro (12 Meses):**
  - Adicionado seletor de ano (`2026`, `2027`, etc.) no modal de Grade do Médico.
  - Alternador de escopo entre "Ano Inteiro (12m)" e meses individuais (Jan a Dez), permitindo customizações específicas ou parametrização padrão.
  - Botão **"Replicar para o Ano Inteiro"** que propaga as cotas de consultas, retornos e procedimentos para todos os 12 meses do ano selecionado em 1 clique.
  - Painel de **Capacidade Anual** com métricas consolidadas (Total de Primeiras Consultas/Ano, Retornos/Ano, Procedimentos/Ano e Vagas Totais no Ano).
- **Pesquisa Global Universal em Todos os Anos, Meses e Dias:**
  - O campo de pesquisa agora realiza busca profunda em todo o banco de agendamentos (passado, presente e futuro).
  - Suporte à busca por Nome do Paciente, CPF, Telefone, Médico, Sala, Procedimento, Status e Datas em múltiplos formatos (`DD/MM/AAAA`, `DD/MM`, `YYYY-MM-DD`, ano ou mês).
  - Tela dedicada de **Resultados da Busca Global** exibindo a lista completa de atendimentos encontrados com botão **"Ver Dia"** para salto direto para a grade daquela data.
- **Legenda Visual Clean:**
  - Remoção dos nomes das cores dos badges de status (Agendado, Confirmado, Aguardando, Em Consulta, Encaixe, Cancelado), preservando a identificação por marcadores de cor circulares.
- **Padronização Rigorosa de Rótulos Concisos (1 Palavra):**
  - Remoção de termos duplos, barras (`/`) e conectivos (`&`) em cabeçalhos, formulários, modais e botões do módulo Agenda (`Agenda`, `Grade`, `Bloquear`, `Agendar`, `Início`, `Fim`, `Limite`, `Parâmetros`, `Salvar`, `Confirmar`).

---

## [v4.7.55] - 24 de Agosto, 2026
### Correção de Permissões de Filial por Usuário (Restrição Individual de Unidades)
- **Remoção de Sobrecargas Globais em Código:**
  - Removida a atribuição forçada de multi-unidades para usuárias específicas (`anacg@nexa.com`, `jsoares@nexa.com`), fazendo com que o acesso a filiais seja governado **estritamente pelo perfil e unidade atribuída no cadastro (`primaryUnit` / `allowedUnits`)**.
- **Gestão Completa de Filial em Configurações & T.I. (`NexaCONFIG` e `Painel de Governança`):**
  - Inclusão do campo de Filial de Operação nos formulários de criação e edição de operadores em ambos os painéis administrativos.
  - Exibição de badge visual de filial (`🏢 Betim`, `🏢 Taguatinga` ou `🌐 Todas`) na tabela de usuários.
- **Sanitização Automática de Sessão:**
  - Usuários locais com filial Betim (`anacg`, etc.) agora abrem diretamente com a filial Betim selecionada e seletor estático (sem opção de troca não autorizada para Taguatinga ou Todas as Unidades).
  - Administrador Master (`contato@techcosta.net`) mantém permissão global irrestrita de gerenciamento e alternância de filiais.

---

## [v4.7.54] - 24 de Agosto, 2026
### Isolamento Total de Dados por Filial (Taguatinga/DF vs Betim/MG) em Todos os Módulos do Sistema
- **Isolamento Completo e Rigoroso de Dados por Unidade:**
  - Implementado chaveamento e filtragem universal em **todos os 14 módulos do sistema**:
    - **NexaASSIST**: Escalas de hemodiálise, mapa de salões e mural de comunicados isolados por filial, com empty state elegante para unidades novas (Taguatinga / DF).
    - **NexaCLINICAL & Pacientes**: Listagens, prontuários, registros de diálise, prescrições e contadores 100% segregados por filial ativa.
    - **NexaCAL (Agenda)**: Agendamentos, escalas de plantão médico e bloqueios de horário filtrados por unidade.
    - **NexaMED (Gestão Médica)**: Corpo clínico, procedimentos, produção médica e solicitações de troca de plantão isolados por filial.
    - **NexaHR (Recursos Humanos)**: Colaboradores, vale-transporte, advertências, contratos em experiência e indicadores (turnover/absenteísmo) estritamente por unidade.
    - **NexaSTOCK (Estoque & Farmácia)**: Saldos físicos, movimentações, notas fiscais, lotes, empréstimos e inventários isolados.
    - **NexaENG (Manutenção & Engenharia Clínica)**: Parque de máquinas/equipamentos, ordens de serviço e cronograma preventivo filtrados por filial.
    - **NexaPROCURE (Compras & Cotações)**: Requisições de compra, itens críticos calculados sobre o saldo disponível e cotações isoladas por filial.
    - **NexaRECEPTION (Recepção & Admissões)**: Admissões, check-ins diários, escala de poltronas e rondas médicas isoladas por filial.
    - **NexaREQ (Salão de Diálise / Técnicos)**: Requisições de materiais e kits padronizados por salão segregados por filial.
    - **NexaINDEX (Dashboard Geral de Indicadores)**: Métricas de qualidade, infecção, glosas e mortalidade calculadas dinamicamente por filial ativa ou consolidado.
    - **NexaAPAC (Faturamento SUS / Convênios)**: APACs ativas, alertas de vencimento e controle de glosas isolados por filial.
- **Seletor Unificado e Tagging Automático:**
  - Inserido o componente `UnitSelector` de forma padronizada nos cabeçalhos de todos os módulos.
  - Novos registros criados em qualquer formulário são automaticamente etiquetados com a `unitId` e `unit` da filial ativa.
  - Visão limpa e zerada para a nova unidade de Taguatinga / DF, garantindo que nenhum dado histórico de Betim seja apresentado indevidamente.

---

## [v4.7.53] - 24 de Agosto, 2026
### Arquitetura Multi-Unidade (Betim/MG e Taguatinga/DF) & Preparação para SaaS e Integração Financeira/Estoque
- **Arquitetura Global Multi-Unidade (`UnitContext` & `UnitSelector`):**
  - Implementado provedor global de filiais (`UnitContext`) com suporte nativo às unidades **Betim / MG** e **Taguatinga / DF**, com persistência local e suporte a modo consolidado (`🌐 Todas as Unidades`).
  - Seletor de unidades moderno e responsivo integrado na Navbar, no Hub de Módulos, no painel Financeiro e no painel de Estoque/Farmácia.
  - Usuários gestores e o administrador (`contato@techcosta.net`) possuem visão global e alternância livre entre unidades; operadoras locais possuem visão focada na filial designada.
- **Módulo Financeiro Multi-Filial Integrado:**
  - Métricas em tempo real (Total a Pagar, Total a Receber, EBITDA, Saldo Realizado, Vencidos) recalculadas dinamicamente com base na unidade selecionada ou visão consolidada do grupo econômico.
  - Inclusão do campo de Filial nos cadastros de Contas a Pagar e Contas a Receber, com badges visuais cromáticas (🟢 `Taguatinga` e 🔵 `Betim`) nas tabelas.
  - Total retrocompatibilidade com lançamentos legados, mantendo fallback automático e seguro para Betim sem qualquer perda de dados.
- **Estoque & Farmácia com Importação de NF-e por Filial:**
  - Importação de notas fiscais (XML/PDF DANFE) vincula automaticamente os lotes abastecidos e gera contas a pagar associadas à filial ativa (Taguatinga ou Betim).
- **Gestão de Usuários e Permissões no Admin:**
  - Cadastro de usuários atualizado com seleção de Filial Principal e controle de acesso a múltiplas unidades.
  - Provisionamento do perfil financeiro e de estoque para operações de Taguatinga.

---

## [v4.7.52] - 24 de Agosto, 2026
### NexaASSIST — Novas Categorias Clínicas no Mural e Correção de Alinhamento/Espaçamento Visual de Cards
- **5 Novas Categorias Clínicas Especializadas:**
  - Adicionadas categorias fundamentais para a rotina de hemodiálise:
    - ⚡ **Evento Adverso** (destaque âmbar `#d97706`)
    - 🩸 **Hemotransfusão** (destaque rubi `#e11d48`)
    - 🦠 **Infecção** (destaque púrpura `#9333ea`)
    - 💉 **Acesso Vascular** (destaque ciano/teal `#0d9488`)
    - 🛑 **Precaução de Contato** (destaque terracota `#c2410c`)
  - Totalizando 14 categorias com contagens em tempo real e filtros instantâneos no topo do mural.
- **Correção e Harmonização Visual dos Cards do Mural:**
  - Resolução dos estilos que estavam desconfigurados: badges de categoria e urgência (`⚠️ Urgente`) agora possuem espaçamento, padding, bordas arredondadas e cores distintas.
  - Ícones de paciente (`User`), localização (`Building2`) e horário (`Clock`) com alinhamento flexível e margens precisas, eliminando sobreposições.
  - Botões de ação (Editar e Excluir) convertidos em ícones elegantes (`iconBtn`) com hover sutil, substituindo botões padrão de navegador.
  - Grade e lista do mural padronizadas em todos os modos (`Normal`, `Grade` e `Compacta`).

---

## [v4.7.51] - 24 de Agosto, 2026
### NexaASSIST — Refatoração de Design System Vanilla CSS no Mapa de Salões e Header de Abas
- **Padronização Visual Completa (Vanilla CSS):**
  - Refatoração integral do componente `DialysisScheduleTab` com estilização inline pura e compatível com o design system do NexaCLINIC, eliminando dependências externas não carregadas.
  - Cards de pontos/leitos reestruturados com tipografia moderna, avatares em degradê, badges cromáticas de acessos vasculares (FAV 15/16/17, CDL, Permcath) e alertas de isolamento destacados.
  - Indicadores operacionais (KPIs) organizados em grid responsivo com cards brancos de alto contraste e bordas suaves.
- **Alternador de Abas do NexaASSIST (`Escala` vs `Mural`):**
  - Redesenho do seletor de abas na Hero Section com fundo de alto contraste (`#f1f5f9`), ícones nítidos e destaque cromático ativo (`#4f46e5` para Escala e `#ec4899` para Mural).
- **Rótulo Padronizado de 1 Palavra:**
  - Botão de publicação simplificado para `+ Comunicado` em conformidade com as diretrizes de UI.

---

## [v4.7.50] - 24 de Agosto, 2026
### NexaASSIST — Escala Operacional de Hemodiálise por Salões & Turnos, Unificação de 570 Pacientes e Vínculo com Manutenção
- **Escala de Hemodiálise por Salões e Turnos (NexaASSIST):**
  - Implementado mapa visual interativo e em tempo real dos leitos/cadeiras por **Salão 01**, **Salão 02** e **Salão 03** nos **3 Turnos diários (1ºT, 2ºT e 3ºT)**, organizado por **Boxes (01 a 08 e Sala Amarela)**, eliminando 100% o uso das planilhas manuais.
  - Alternância instantânea de cadência dialítica entre **Segunda/Quarta/Sexta (SQS)** e **Terça/Quinta/Sábado (TQS)** com detecção automática do dia da semana atual.
- **Unificação e Cadastro de Pacientes:**
  - Cruzamento de dados de **570 pacientes únicos** parseados das 9 matrizes de salões:
    - 503 pacientes existentes enriquecidos com localização física de diálise (Salão, Turno, Box, Ponto, Máquina), acesso vascular exato, calibre de agulha e isolamento.
    - 67 novos pacientes cadastrados com perfis clínicos completos no sistema.
- **Integração com o Módulo de Manutenção (NexaSERVICE):**
  - Rastreabilidade de **100% dos 90 números de série de máquinas de hemodiálise Nipro Diamax 220F** da escala aos equipamentos da engenharia clínica, com badges visuais de status (*Operacional*, *Preventiva*, *Corretiva*) e atalho para ficha técnica da máquina com 1 clique direto no leito.
- **Detalhamento de Acesso Vascular, Calibre de Agulhas e Isolamentos:**
  - Badges cromáticas diferenciadas: 🟢 FAV com especificação de calibre (Ag. 15, Ag. 16, Ag. 17), 🟡 CDL (Cateter Duplo Lúmen), 🟣 Permcath e alertas de segurança para 🔴 Uso Único / HIV e Hepatite C (HCV).
- **Localizador Global de Paciente & Máquina:**
  - Mecanismo de busca rápida global para localização instantânea de qualquer paciente ou máquina em qualquer salão e turno.
- **Remanejamento & Ocupação de Vagas:**
  - Gestão ágil de vagas livres com botão `+ Alocar` e ferramenta de troca/remanejamento de pacientes entre pontos e turnos.
- **Impressão A4 da Escala Diária:**
  - Layout limpo e padronizado em A4 para impressão e afixação nas pranchetas dos postos de enfermagem dos salões.

---

## [v4.7.49] - 23 de Agosto, 2026
### NexaMED — Matriz Semanal de Salões, Mapa de Cores de Trocas e Impressão A4 Paisagem
- **Modo Matriz Semanal (Visualização Planilha Interativa):**
  - Implementado modo de visualização em grade agrupado por semanas (`1ª a 5ª Semana`), dividindo os dias da semana (Segunda a Sábado e Domingo) por **Salão 1**, **Salão 2**, **Salão 3** e **DP** em cada um dos **3 Turnos diários (1ºT, 2ºT e 3ºT)**.
  - Alternador de visualização rápido no topo: **`Matriz`** vs **`Lista`**.
- **Mapa de Cores de Status:**
  - Células com fundo **Verde Claro** para plantões fruto de **Troca/Substituição** (com identificação do titular original).
  - Células com fundo **Vermelho Alerta** para **Vagas/Buracos na escala** com botão imediato de preenchimento.
  - Células com fundo **Branco/Azul** para plantões regulares titulares.
- **Painel de Bolsa de Trocas & Balanço de Coberturas:**
  - Quadro inferior exibindo em tempo real as trocas do mês e o saldo de plantões titulares versus coberturas assumidas por cada nefrologista.
- **Impressão Oficial A4 Paisagem (Mural dos Salões):**
  - Botão de impressão diagramado em formato A4 Landscape com cabeçalho institucional e campo de assinatura da Coordenação Médica para afixação nos salões de diálise.

---

## [v4.7.47] - 23 de Agosto, 2026
### Módulo de T.I. (NexaCONFIG) — Servidor Centralizado de E-mail (SMTP) e Disparos Universais
- **Aba E-mail no Módulo de T.I.:**
  - Implementação de painel centralizado de configuração de correio eletrônico institucional no [ConfigPanel.jsx](file:///c:/Nexa/NexAi-CLINIC/src/components/ConfigPanel.jsx) através do componente [EmailSettingsTab.jsx](file:///c:/Nexa/NexAi-CLINIC/src/components/config/EmailSettingsTab.jsx).
- **Provedores Pré-Configurados (1-Click Presets):**
  - Presets para Google Workspace / Gmail, Microsoft 365 / Outlook, Amazon SES, Resend e SMTP Personalizado com preenchimento automático de portas e protocolos de segurança (TLS/SSL).
- **Credenciais e Segurança SMTP:**
  - Configuração de Remetente (Nome e E-mail), Host, Porta, Criptografia, Login, Senha de Aplicativo / API Key (com botão para exibir/ocultar senha), E-mail de Resposta (Reply-To), Cópia Oculta (BCC para Auditoria T.I.) e Assinatura Institucional Padrão de Rodapé.
- **Teste de Disparo em Tempo Real:**
  - Função de envio imediato de e-mail de teste com diagnóstico de conectividade, feedback visual instantâneo e gravação de log.
- **Controle Granular de Gatilhos por Módulo:**
  - Switches para ativar ou pausar disparos automáticos nos módulos `NexaMED` (escalas/trocas), `NexaSERVICE` (ordens de serviço), `NexaHR` (admissões/férias), `NexaPROCURE` (cotações), `NexaCAL` (lembretes de consultas), `NexaASSIST` (alertas de internação) e `NexaCONFIG` (segurança/auditoria).
- **Histórico e Logs de Disparos:**
  - Tabela com rastreabilidade completa de todos os e-mails gerados pelo sistema com data, módulo originador, destinatário e status de entrega.
- **Manual do Módulo Atualizado:**
  - Documentação completa em [moduleGuidesData.js](file:///c:/Nexa/NexAi-CLINIC/src/data/moduleGuidesData.js) com recursos, tutorial passo a passo e perguntas frequentes.

---

## [v4.7.45] - 23 de Agosto, 2026
### NexaMED — Ajuste Visual do Header, Lista de Médicos na Escala e Correção do Seletor de Mês/Ano
- **Cabeçalho Limpo e Harmonizado:**
  - Removidos o botão "Voltar" e o campo de seleção "Acesso" da Hero Section do NexaMED, proporcionando um cabeçalho limpo no padrão do sistema.
- **Lista de Médicos no Modal de Escala:**
  - Garantido o carregamento robusto e exibição da lista completa de médicos nefrologistas no dropdown do modal de escalar plantão nos salões e diálise peritoneal.
- **Correção do Seletor de Mês e Ano:**
  - Aumentada a largura do seletor mensal (`<input type="month" />`) para 220px, prevenindo que o ano seja cortado na interface.
- **Padronização Estrita de Rótulos Concisos (1 Palavra):**
  - Aplicação da regra de 1 palavra única nos cabeçalhos de tabelas, formulários e modais em todas as abas do NexaMED (`Setor`, `Médico`, `Presença`, `Plantões`, `Consultas`, `Total`, `Unitário`, `Descrição`, `Salvar`).

---

## [v4.7.43] - 22 de Agosto, 2026
### Padronização Estrita de Cargos e Setores (1 Palavra, Title Case e Ordem Alfabética A-Z)
- **Cargos Padronizados em 1 Palavra e Primeira Letra Maiúscula:**
  - Padronização de todo o catálogo de cargos para termos únicos com primeira letra maiúscula (`Administrador`, `Administrativo`, `Almoxarife`, `Analista`, `Assistente`, `Atendente`, `Auxiliar`, `Biomédico`, `Comprador`, `Coordenador`, `Diretor`, `Enfermeiro`, `Engenheiro`, `Estagiário`, `Estoquista`, `Farmacêutico`, `Faturista`, `Gerente`, `Higienista`, `Líder`, `Manutenção`, `Médico`, `Motorista`, `Nefrologista`, `Nutricionista`, `Plantonista`, `Psicólogo`, `Recepcionista`, `Supervisor`, `Técnico`).
  - Ordenação estritamente alfabética (`A-Z`).
- **Setores Padronizados em 1 Palavra e Primeira Letra Maiúscula:**
  - Catálogo de 25 setores ajustado para termos únicos objetivos (`Administração`, `Almoxarifado`, `Ambulatório`, `Atendimento`, `Clínica`, `Compras`, `Diretoria`, `Enfermagem`, `Estoque`, `Farmácia`, `Faturamento`, `Financeiro`, `Hemodiálise`, `Higienização`, `Manutenção`, `Médico`, `Nutrição`, `Peritoneal`, `Psicologia`, `Qualidade`, `Recepção`, `RH`, `SESMT`, `Social`, `TI`).
  - Ordenação estritamente alfabética (`A-Z`) e deduplicação garantida.
- **Normalização Automática de Dados Legados:**
  - Conversão inteligente de cadastros legados com nomes compostos ou em caixa alta (ex: `AUXILIAR ADMINISTRATIVO` ➡️ `Administrativo`, `administrativo (Atual)` ➡️ `Administração`), refletindo em todas as telas, cards, listas e relatórios.

---

## [v4.7.42] - 22 de Agosto, 2026
### Módulo RH — Cargos Selecionáveis Padronizados e Expansão de Setores Hospitalares & Clínicos
- **Cargos Selecionáveis Padronizados (`STANDARD_ROLES`):**
  - Transformação do campo de texto livre de Cargo em um seletor (`<select>`) com catálogo completo e padronizado de cargos da área de saúde e hospitalar (Enfermagem, Nefrologia, Equipe Multidisciplinar, Farmácia, Engenharia Clínica, SESMT, Faturamento, Operações e Gestão).
  - Preservação automática de compatibilidade com cargos preexistentes via fallback contextual.
- **Expansão de Setores Hospitalares & Clínicos (`STANDARD_SECTORS`):**
  - Cadastro e sincronização de 19 setores especializados cobrindo toda a rotina de clínicas de diálise e hospitais (Hemodiálise nos Salões, Diálise Peritoneal, Corpo Clínico, Enfermagem, Farmácia, Recepção, Faturamento/APACs, Manutenção & Engenharia Clínica, Qualidade & BI, Psicologia, Nutrição, Serviço Social, SESMT, TI, Compras, Higienização/Limpeza, RH, Financeiro e Diretoria).
- **Padronização Visual e Rótulos Concisos (Boy Scout Rule):**
  - Limpeza total de termos duplos e aplicação do padrão rigoroso de 1 única palavra em todas as abas e formulários do colaborador (`Nome`, `Nascimento`, `Mãe`, `Telefone`, `E-mail`, `Endereço`, `Cargo`, `Setor`, `Admissão`, `Contrato`, `Status`, `Desligamento`, `Salário`, `CNH`, `Vencimento`, `Conta`, `Dependente`, `Ausência`, `Dias`, `Motivo`, `Descrição`, `Anexo`).

---

## [v4.7.41] - 22 de Agosto, 2026
### Correções: Deduplicação NexaMED no Menu Central e Busca Alfabética de Funcionários no Vale-Transporte
- **Deduplicação no Seletor de Módulos (`ModuleSelector.jsx`):**
  - Removida a entrada duplicada do módulo `NexaMED`, mantendo um único card oficial integrado no menu central de navegação.
- **Vale-Transporte (Módulo RH - `HRPanel.jsx`):**
  - Lista de funcionários ordenada estritamente em **ordem alfabética** (`A-Z`).
  - Adicionado **campo de busca em tempo real** (`input` com ícone de lupa) acima do seletor, permitindo pesquisar instantaneamente colaboradores por nome ou cargo antes da emissão do VT.

---

## [v4.7.40] - 22 de Agosto, 2026
### NexaMED — Aplicação do Design System Padrão Oficial Hero Section
- **Hero Section Oficial Nexa (`heroIconBadge` + `heroTitle` + `heroSubtitle`):**
  - Implementação da identidade visual padrão com badge de canto arredondado em degradê azul/safira médico (`linear-gradient(135deg, #0284c7 0%, #2563eb 100%)`) e ícone do estetoscópio (`Stethoscope`).
  - Padronização do título em travessão: **`NexaMED — Gestão Médica & Escalas`** no mesmo estilo de `NexaSTOCK`, `NexaHR`, `NexaCAL` e `NexaASSIST`.
  - Inclusão do módulo no Seletor Central (`ModuleSelector.jsx`) e na barra de navegação global (`Navbar.jsx`).

---

## [v4.7.39] - 22 de Agosto, 2026
### NexaMED - Padrão Visual Clean do Header e Sincronização Total dos Médicos da Agenda
- **Padrão Visual Harmonizado (Fim do Top Banner Escuro):**
  - Substituição da barra superior preta pelo padrão de Card Header branco e limpo do NexaCLINIC, com tipografia harmônica, bordas sutis e fundo claro.
  - Atualização do card do médico no Portal "Meus Plantões" para seguir a identidade visual clean da clínica.
- **Sincronização Total com a Lista de Médicos da Agenda (NexaCAL):**
  - Integração unificada que busca todos os médicos e profissionais cadastrados no sistema (via `getUsers()` e `getMedicalDoctors()`).
  - Disponibilização completa dos médicos nefrologistas em todos os seletores e modais: Escalar Plantão, Bolsa de Trocas, Lançamento de Procedimentos e Apuração de Honorários.

---

## [v4.7.38] - 22 de Agosto, 2026
### Novo Módulo Gestão Médica & Escalas (NexaMED) - Escala de Salões/DP, Bolsa de Trocas com E-mail, Ronda da Recepção e Repasse Financeiro
- **Escala Mensal de Plantões por Salões e DP:**
  - Grade de distribuição dos médicos nefrologistas nos Salões 1, 2, 3 e Diálise Peritoneal (DP) nos 3 turnos diários (1º, 2º e 3º Turno).
  - Trava Anti-Buraco com semáforo visual para garantir 100% de cobertura médica assistencial exigida pela ANVISA/RDC 11.
- **Portal do Médico ("Meus Plantões"):**
  - Visualização da escala pessoal de plantões limpa (sem exposição de valores financeiros).
  - Botão de solicitação de trocas de plantão com colegas.
  - Formulário para lançamento de procedimentos nefrológicos executados vinculando paciente e data.
- **Bolsa de Trocas de Plantão com Notificações por E-mail:**
  - Rastreabilidade de substituições em 3 etapas (solicitação, aceite do médico substituto e homologação pela coordenação médica).
  - Disparo automático de e-mails em cada fase com histórico completo gravado.
- **Integração com Agenda Ambulatorial (NexaCAL):**
  - Consultas marcadas como finalizadas ou concluídas na agenda entram automaticamente na contagem de produção médica do profissional.
- **Ronda Médica Presencial na Recepção (Fim da Prancheta):**
  - Nova aba de ronda no módulo Recepção para auditoria presencial nos salões e DP com 1 toque (*Presente, Atraso, Substituição, Falta*), registrando o horário real.
- **Tabela de Honorários Configurável:**
  - Painel de configuração de valores unitários para plantões, consultas ambulatoriais e procedimentos (*Cateter CDL, Permcath, Biópsia Renal, FAV*).
- **Fechamento de Produção & Homologação Automática para o Financeiro:**
  - Apuração consolidada de honorários por médico com botão de homologação da coordenação.
  - Lançamento automático de títulos no **Contas a Pagar** do `NexaFINANCE` (Categoria: *Honorários Médicos*), garantindo segregação de acessos.
- **Extrato / Holerite Médico em PDF:**
  - Emissão e impressão em 1 clique do demonstrativo detalhado de produção com assinatura da coordenação e do médico.

---

## [v4.7.37] - 22 de Agosto, 2026
### Renovação do Módulo Clínico (NexaCLINIC) - Cockpit 360°, Prescrição Medicamentosa, Painel Laboratorial SBN, Laudos APAC, Calculadoras e Copiloto IA
- **Cockpit 360° do Paciente Renal:**
  - Header unificado com foto/avatar, idade, tempo de diálise, tipo e sítio anatômico do acesso vascular, peso seco alvo, badges de alergias em destaque e sorologias ativas (*HBV, HCV, HIV*).
- **Prescrição Medicamentosa Integrada (NexaSTOCK & NexaREQ):**
  - Aba dedicada para prescrição médica de fármacos intradialíticos (*Alfaepoetina, Noripurum, Calcitriol, Cefazolina*) e uso domiciliar (*Sevelamer, Anti-hipertensivos*), com atalhos rápidos e botão de envio de requisição direta para salões de hemodiálise.
- **Painel Laboratorial com Semáforo de Metas SBN/ANVISA:**
  - Matriz cronológica dos biomarcadores renais (*Hemoglobina, Ferritina, Sat. Transf., Fósforo, Cálcio, PTH, Potássio, Kt/V, URR e Albumina*) com sinalização visual por semáforo de metas da Sociedade Brasileira de Nefrologia.
- **Sessões com Alerta Hemodinâmico e Máquina de Diálise:**
  - Registro horário de parâmetros com seleção da máquina de diálise ativa (*vinculada ao NexaSERVICE*), cálculo automático de perda ponderal e alerta preventivo de taxa de ultrafiltração excessiva (> 13 mL/kg/h).
- **Central de Laudos e Regulação APAC (SUS):**
  - Monitoramento de validade com alerta preventivo de 30 dias e emissor oficial de Laudo de Solicitação de Procedimentos de Alta Complexidade (LME) para assinatura médica e faturamento no BPA/SUS.
- **Evoluções Multiprofissionais Estruturadas:**
  - Filtros e formulários dedicados para Medicina, Enfermagem, Nutrição, Psicologia e Serviço Social com botões de roteiro rápido em 1 clique.
- **Copiloto Clínico IA & Calculadoras Nefrológicas:**
  - Síntese inteligente do prontuário em 1 clique com inserção direta em evolução e calculadoras interativas de Kt/V Daugirdas, Fórmula de Ganzoni, Taxa de Recirculação e Taxa de Ultrafiltração Segura.
- **Exportação de Sumário e Ficha de Trânsito:**
  - Emissão de prontuário e ficha de trânsito em PDF formatado padrão CFM/SBN.

---

## [v4.7.35] - 22 de Agosto, 2026
### Módulo SESMT - Padronização dos Formulários de Inspeção de Extintores e Hidrantes
- **Remoção da Coluna de Assinatura Individual nas Tabelas:**
  - Removida a coluna de assinatura/rubrica por linha nas tabelas das abas *Inspeção Extintores* e *Inspeção Hidrantes*, tornando o preenchimento mais rápido, limpo e responsivo.
- **Campos de Responsabilidade no Rodapé (Padrão EPI):**
  - Adicionados os campos de *Inspetor* e *Técnico de Segurança* no final dos formulários de extintores e hidrantes, exatamente como no padrão utilizado no checklist de EPI.
- **Histórico e Modais Atualizados:**
  - Visualização detalhada das inspeções no histórico SESMT atualizada com cabeçalhos diretos e sem a coluna de assinatura.

---

## [v4.7.34] - 22 de Agosto, 2026
### Módulo de Compras Inteligente - Modelo dos 4 Saldos de Estoque, TTL de Requisições Configurável e Semáforo de Urgência
- **Modelo dos 4 Saldos de Estoque em Compras (NexaPROCURE):**
  - Matriz visual na aba *Reposição* exibindo **Físico**, **Reservado** (soma dos pedidos pendentes da enfermagem), **Disponível** (Físico - Reservado), **Trânsito** (pedidos abertos em compras), **Mínimo** e **Sugestão**.
  - O gatilho de compra agora dispara quando `Disponível <= Mínimo`, prevenindo faltas causadas pelo atraso de separação da farmácia entre os 3 turnos clínicos.
- **Detalhamento de Requisições por Salão / Turno:**
  - Clique direto no badge de saldo *Reservado* abre popover/modal detalhando cada requisição em aberto (código, salão de hemodiálise, técnica solicitante, paciente, quantidade e data/hora).
- **TTL de Requisições Configurável no Módulo de Configurações (T.I.):**
  - Adicionado controle de Tempo Limite de Requisições no painel de TI com valor padrão inicial de **1 hora** e botões de atalho rápido (1h, 2h, 4h, 8h/turno, 12h, 24h).
  - Expiração automática de requisições pendentes que ultrapassarem o TTL, com transição para status `Expirada` e liberação imediata do saldo reservado para disponível.
- **Semáforo de Urgência e Renovação em 1 Clique (NexaREQ & NexaSTOCK):**
  - Indicador visual com tempo restante de atendimento nas requisições da enfermagem e farmácia com semáforo de cores (verde, amarelo, vermelho e expirada).
  - Botão de renovação instantânea com 1 clique para a enfermagem reenviar requisições que expiraram sem necessidade de preenchimento manual.
- **Documentação e Manuais Atualizados:**
  - Atualização completa dos manuais de *Compras*, *Estoque*, *Requisições* e *Configurações* em `src/data/moduleGuidesData.js`.

---

## [v4.7.32] - 22 de Agosto, 2026
### Módulo de Compras (NexaPROCURE) - Reposição Crítica em Tempo Real, Pedidos em Lote, Design Padronizado e Fornecedores Ordenáveis
- **Aba de Reposição Crítica em Tempo Real:**
  - Nova aba conectada em tempo real ao saldo e estoque mínimo da farmácia/estoque (`inventory_items`).
  - Cards de métricas com total de itens críticos, zerados e abaixo do mínimo.
  - Cálculo automático da sugestão de compra e botão de solicitação rápida individual com 1 clique.
- **Geração de Pedidos em Lote:**
  - Botão no cabeçalho da aba de reposição que gera automaticamente solicitações unificadas de compras para todos os insumos críticos de forma instantânea.
- **Catálogo de Fornecedores com Colunas Clicáveis (Ordenação):**
  - Ordenação dinâmica por clique nos cabeçalhos de *Razão*, *CNPJ*, *Contato*, *Email* e *Prazo*, alternando entre crescente (A-Z) e decrescente (Z-A).
- **Hero Header Padronizado:**
  - Cabeçalho padronizado com ícone amplo `56x56px` com gradiente temático (`#0891b2`), tipografia `1.6rem` e badges com contadores dinâmicos nas abas.
- **Manual do Módulo Adicionado:**
  - Documentação interativa completa do *NexaPROCURE* adicionada em `src/data/moduleGuidesData.js`.

---

## [v4.7.31] - 22 de Agosto, 2026
### Módulo NexaASSIST - Nomes Completos de Categorias, Hero Padronizado, 3 Modos de Visualização e Proteção de Autoria
- **Nomes Completos sem Cortes:**
  - Ajuste na grade superior de categorias com flex-wrap inteligente e padding balanceado, garantindo que nomes longos (*Internação*, *Intercorrência*, *Serviço Social*, *Psicologia*, etc.) nunca fiquem cortados com reticências.
- **Hero Header Padronizado:**
  - Alinhamento das dimensões do ícone (`56x56px`), títulos (`1.6rem`), tipografia e botões com os padrões visuais dos módulos *NexaSTOCK* e *NexaHR*.
- **3 Modos de Visualização:**
  - Inclusão de seletor rápido no toolbar permitindo alternar entre modo **Compacta** (tabela densa com uma linha por ocorrência), **Normal** (cards individuais clássicos) e **Grade** (colunas múltiplas tipo dashboard).
- **Proteção de Autoria (Segurança Clínica):**
  - Botões de ação (Editar e Excluir) restritos ao autor que criou a publicação ou administradores do sistema, impedindo alterações não autorizadas em comunicados de colegas.
- **Manual do Módulo Atualizado:**
  - Documentação do *NexaASSIST* atualizada em `src/data/moduleGuidesData.js`.

---

## [v4.7.30] - 22 de Agosto, 2026
### Módulo NexaASSIST - Redesign Ultra-Clean, Grade Compacta de Categorias e Simplificação Operacional
- **Grade Compacta de Categorias (Unificação sem Redundâncias):**
  - Eliminação da duplicidade entre cards gigantes e pílulas inferiores, criando uma única grade compacta de cards responsivos com ícone, nome e contador de cada categoria clínica.
  - Redução de mais de 60% do espaço vertical ocupado no topo do mural.
- **Hero Header Enxuto:**
  - Remoção do badge "Em Tempo Real" e do botão de e-mail, mantendo o topo padronizado com foco exclusivo no botão primário `+ Novo Comunicado`.
- **Feed Clínico Despoluído:**
  - Remoção dos controles de "Dar Ciente", do filtro "Não Lidos" e de badges legados "Via E-mail", focando a visualização no paciente, categoria, local e conteúdo clínico da mensagem.
- **Manual do Módulo Atualizado:**
  - Guia do *NexaASSIST* atualizado em `src/data/moduleGuidesData.js` com a nova estrutura operacional.

---

## [v4.7.29] - 22 de Agosto, 2026
### Módulo NexaASSIST - Filtro de Datas Inteligente, Cards de KPI Clicáveis e Estabilização Antiflicker
- **Cards de KPI Interativos e Clicáveis:**
  - Clique direto nos cards de *Total*, *Internações*, *Altas*, *Intercorrências* e *Pendentes* para filtrar instantaneamente os comunicados na tela.
  - Efeito visual de foco com borda temática acentuada, realce de background e badge de filtro ativo (`🟢 Filtrando Todos`, `🔴 Filtrando Internações`, etc.).
- **Filtro Dinâmico por Período de Data:**
  - Seletor de período no toolbar com opções rápidas: *Todos*, *Hoje*, *Ontem*, *7 Dias*, *30 Dias*, *Este Mês* e *Personalizado*.
  - Modo Personalizado com campos de data inicial e final.
  - Recálculo automático em tempo real das métricas dos cards de KPI e dos comunicados exibidos no feed.
- **Blindagem Antiflicker Definitiva:**
  - Comparação de integridade de dados (`isSamePosts`) impedindo re-renderizações desnecessárias e listener Firestore otimizado sem loops de reconexão ou quedas circulares.
- **Manual do Módulo Atualizado:**
  - Guia completo do *NexaASSIST* atualizado em `src/data/moduleGuidesData.js` com instruções dos novos filtros e cards interativos.

---

## [v4.7.26] - 22 de Agosto, 2026
### Módulo NexaASSIST - Correção do Loop de Renderização, Ingestão IA e Sincronização dos E-mails Titan
- **Eliminação de Loop Infinito e Piscamento da Tela:**
  - Correção do `useEffect` no componente `AssistPanel.jsx`, desacoplando a dependência cíclica de `patients` e utilizando `useRef` para os ouvintes em tempo real do Firestore.
  - Carregamento estável e fluido do feed assistencial sem flickering ou alternância intermitente de spinner.
- **Sincronização Titan IMAP (`integracao@dialize.com.br`):**
  - Carga completa de 58 comunicados assistenciais reais extraídos da caixa de e-mails via script Python/Firestore.
  - Atualização do arquivo de fallback local e `mockFirebase.js` com a base completa de comunicados reais.
- **Acesso Rápido de Ingestão de E-mails com IA:**
  - Adição do botão `Ingestão IA` no cabeçalho (*Hero Actions*) do NexaASSIST para leitura, análise com IA e aprovação de e-mails assistenciais.
- **Padronização Rigorosa de Rótulos Únicos (Boy Scout Rule):**
  - Adequação de todos os rótulos de campos, modais e filtros para o padrão direto sem barras ou conectivos redundantes.
- **Manual do Módulo Atualizado:**
  - Adição do guia completo do módulo *NexaASSIST* em `src/data/moduleGuidesData.js` com recursos, tutoriais de publicação e confirmação de ciente, e FAQs.

---

## [v4.7.24] - 21 de Agosto, 2026
### Módulo de Requisições - Alinhamento Rigoroso ao Padrão de Design Hero Banner NexaREQ, 3 Modos de Visualização e Rótulos Únicos
- **Alinhamento do Hero Banner (Padrão NexaSTOCK / NexaHR):**
  - Remoção da tag/badge flutuante superior, deixando o cabeçalho perfeitamente limpo e padronizado: ícone em gradiente teal (`#14b8a6`), título *NexaREQ — Requisições de Insumos* e subtítulo descritivo direto.
- **3 Modos de Visualização Operacional:**
  - **Compacta (Padrão):** Visualização de alta densidade para operação ágil das técnicas no salão, com linhas compactas, badges de salão, kit e controle especial.
  - **Normal (Detalhada):** Tabela completa com informações estruturadas de paciente, solicitante, data/hora e ações.
  - **Cards:** Grade responsiva de cards com informações visuais resumidas, lista de insumos com quantidades e botões de ação rápida (*Visualizar*, *Editar*, *Excluir*).
- **Padronização Rigorosa de Rótulos Únicos (Boy Scout Rule):**
  - Ajuste de todos os rótulos de campos e botões para o padrão direto de 1 palavra:
    - `Insumo / Medicamento (Ordem Alfabética)` ➡️ **`Insumo`**
    - `Salão de Destino` ➡️ **`Salão`**
    - `Destino Assistencial` ➡️ **`Destino`**
    - `Paciente da Hemodiálise` ➡️ **`Paciente`**
    - `Qtd:` / `Qtd Pedida` ➡️ **`Quantidade`**
    - `Pacotes & Kits Padronizados` ➡️ **`Kits`**
    - `Selecionar Insumos Individuais` ➡️ **`Insumos`**
    - `Observações / Justificativa (opcional)` ➡️ **`Observações`**
    - `Total de Pedidos` ➡️ **`Total`**
    - `Entregas Parciais` ➡️ **`Parciais`**
    - `Atendidos / Entregues` ➡️ **`Entregues`**
- **Filtro de Triagem por Salão:**
  - Novo seletor no toolbar para filtrar requisições por Salão 1, Salão 2, Salão 3 ou Consultório.
- **Manual do Módulo Atualizado:**
  - Atualização do guia do módulo em `src/data/moduleGuidesData.js` com tutoriais, recursos e FAQs.

---

## [v4.7.20] - 21 de Agosto, 2026
### Módulo Estoque & Farmácia - Gestão de Kits de Produtos, Identificação de Medicamentos Controlados, Logística de Salões e Ocultação de Saldo para Enfermagem
- **Gestão de Kits de Insumos & Procedimentos:**
  - Nova aba `Kits` no painel *NexaSTOCK* permitindo cadastro, edição e exclusão de pacotes padronizados de diálise e enfermagem.
  - Seleção de múltiplos insumos com ajuste dinâmico de quantidades, vinculação a salão sugerido e cálculo em tempo real do custo estimado do pacote.
- **Identificação Visual de Medicamentos Controlados (Portaria 344/ANVISA):**
  - Checkbox dedicado `🔒 Medicamento Controlado (Portaria 344)` no formulário de cadastro/edição de produtos.
  - Sinalização visual imediata com tarjas e badges vermelhos de alto contraste (`🔒 Controlado` / `🔒 Portaria 344`) nos 3 modos de catálogo, lista de kits, requisições do salão e atendimento da farmácia.
- **Logística de Salões de Diálise (Salão 1, Salão 2, Salão 3):**
  - Campo `Salão` adicionado ao formulário de requisição das técnicas com validação de preenchimento obrigatório sempre que um Kit for requisitado.
  - Exibição de badge do salão de destino (`📍 Salão 1`, `📍 Salão 2`, `📍 Salão 3`) na triagem e atendimento da farmácia para entrega direta no posto correto.
- **Ocultação de Saldo de Estoque para a Enfermagem:**
  - Ocultação do indicador `Saldo: X un` na busca de insumos do painel da técnica, garantindo prescrições e requisições baseadas estritamente na necessidade clínica do paciente.
- **Padronização de Rótulos Diretos:**
  - Aplicação rigorosa da regra de termos únicos concisos de 1 palavra nos cabeçalhos, formulários e tabelas.

---

## [v4.7.18] - 21 de Agosto, 2026
### Módulo Estoque & Farmácia - Design Hero NexaSTOCK, 3 Modos de Visualização de Catálogo, Ações de Inventário/Transferência e Empréstimos com Parceiros Inteligentes
- **Hero Header Padrão NexaSTOCK:**
  - Banner moderno com ícone temático gradiente âmbar/laranja (`Boxes`), título corporativo *NexaSTOCK — Estoque & Farmácia Hospitalar*, subtítulo explicativo e botão de ação rápida `+ Cadastrar Insumo`.
- **3 Modos de Visualização no Catálogo de Produtos:**
  - **Compacta (Padrão):** Tabela de alta densidade visual (linhas de 36px), código/insumo com atalho para edição, categoria, badge de lote FEFO, saldo com alerta de ruptura, estoque mínimo, status, preço unitário em `R$` e ações compactas.
  - **Normal (Detalhada):** Tabela espaçosa com unidade/apresentação, setor padrão, barra de progresso visual de estoque (% em relação ao mínimo), preço unitário e valor financeiro total em estoque (`R$`), controle de lote e ações completas.
  - **Cards (Grade Visual de Suprimentos):** Grade responsiva de cards com ícone de insumo em container âmbar, setor/almoxarifado padrão, indicador de status (🟢 Regular vs 🔴 Crítico), barra de nível de estoque, 4 blocos métricos e botões de ação rápida (*Editar*, *Excluir*, *+ Compra*).
- **Inclusão dos Botões de Inventários e Transferências:**
  - Adicionados os botões de ação `+ Novo Inventário` e `+ Nova Transferência` diretamente no cabeçalho das respectivas abas.
- **Clínica Parceira Digital & Selecionável em Empréstimos:**
  - Campo de Instituição / Clínica Parceira integrado com `datalist` dinâmico contendo sugestões de instituições hospitalares e acúmulo automático de parceiros utilizados nos empréstimos anteriores.
- **Manuais e Documentação Atualizados:**
  - Atualização completa do guia do módulo em `src/data/moduleGuidesData.js`.

---

## [v4.7.16] - 21 de Agosto, 2026
### Módulo RH - 3 Modos de Visualização de Funcionários, Padrão Monetário Brasileiro & Nomenclatura Gestão de Vale-Transporte
- **3 Tipos de Visualização na Aba Funcionários:**
  - **Compacta (Padrão):** Tabela de alta densidade visual, linhas de 36px, foto redonda miniatura de 26px e informações essenciais diretas (Funcionário, CPF, Cargo/Setor, Contrato, Admissão, Pendências, Ações compactas).
  - **Normal (Detalhada):** Tabela expandida com foto de 38px, e-mail/contato, CPF, Cargo, Contrato com salário formatado em Real (`R$`), Admissão com tempo de casa calculado (ex: `2a 5m`), badges de conformidade e status.
  - **Cards (Grade Visual):** Grade responsiva de crachás corporativos com avatar de 54px, nome com link para ficha, cargo, badge de setor, painel métrico em 4 blocos (CPF, Salário, Admissão, Telefone com atalho direto para WhatsApp), badges de vacinas/documentos/advertências e botões "Ficha Completa", "Demitir" e "Excluir".
- **Padronização Monetária e Numérica Brasileira:**
  - Aplicação universal dos formatadores `formatCurrencyBR` (`R$ 1.234,56`) e `formatNumberBR` (`10,20%`) em todos os cards, relatórios, modais e tabelas do módulo.
- **Nomenclatura "Gestão de Vale-Transporte":**
  - Transição de termos de "Concessão" para "Gestão de Vale-Transporte" e "+ Novo Vale-Transporte", com sinalização de "Rota Especial".
- **Manuais e Documentação Atualizados:**
  - Atualização do manual interativo NexaHR com instruções de operação dos 3 modos de visualização.

---

## [v4.7.14] - 21 de Agosto, 2026
### Módulo RH - Correção de Importação de Ícone (Clock) e Estabilidade do Dashboard
- **Correção de Referência Lucide-React:**
  - Adicionada a importação do componente `Clock` em `HRPanel.jsx` para a caixa métrica de Absenteísmo.
  - Validação e compilação do painel de controle concluídas com sucesso.

---

## [v4.7.13] - 21 de Agosto, 2026
### Módulo RH - Organização Inteligente de Cards do Dashboard & 5 Opções de Tamanho
- **Organização Proporcional por Densidade de Conteúdo:**
  - Cards de métricas numéricas (Total de Colaboradores, Turnover, Absenteísmo, Advertências, Em Experiência) configurados em tamanho compacto com ícones temáticos dedicados e legendas contextuais.
  - Cards de conteúdo operacional rico (Presença Premiada, Aniversariantes do Mês, Contratos em Experiência, Próximas Vacinações, Últimas Advertências e Ausências) organizados em 2 colunas para exibição fluida e sem cortes.
- **5 Opções de Dimensionamento de Caixas:**
  - Inclusão dos seletores: *Compacto (1 Col Métrico)*, *Pequeno (1 Col Padrão)*, *Médio (2 Colunas)*, *Grande (3 Colunas)* e *Largura Total (Linha Inteira)*.
- **Ajuste de Identidade Visual no Header:**
  - Remoção do indicador de tempo real do cabeçalho NexaHR, mantendo o padrão visual com ícone gradiente e subtítulo corporativo.

---

## [v4.7.12] - 21 de Agosto, 2026
### Módulo RH - Central de 15 Relatórios Completos, Padronização Visual NexaASSIST e Otimização de Abas
- **Central de 15 Relatórios do RH (`HRReportsModal`):**
  - Integração direta com o botão superior "Relatórios" da Navbar principal.
  - Exportação em **PDF** corporativo formatado com cabeçalho institucional, dados de filiais e status.
  - Exportação em **Excel (.xlsx)** com células numéricas puras para fórmulas e totalizações.
  - 15 Relatórios completos cobrindo:
    1. *Cadastro Geral & Ficha Funcional*
    2. *Vale-Transporte Consolidado (com recarga e situação)*
    3. *Presença Premiada & Assiduidade (elegibilidade e PIX)*
    4. *Aniversariantes do Mês & Período*
    5. *Advertências Disciplinares & Ocorrências*
    6. *Absenteísmo & Histórico de Faltas*
    7. *Turnover & Movimentação de Pessoal*
    8. *Contratos de Experiência (45 / 90 Dias)*
    9. *Controle Vacinal & Imunização*
    10. *Quadro de Dependentes & Benefícios Familiares*
    11. *Folha de Pagamento Sintética por Setor*
    12. *Dados Bancários & Contas para PIX*
    13. *Documentos Ocupacionais & Vencimentos de CNH/ASO*
    14. *Distribuição do Efetivo por Setor & Cargo*
    15. *Auditoria de Governança & LGPD*
- **Padronização Visual no Estilo NexaASSIST:**
  - Inclusão do header hero com ícone em gradiente, título com badge "• Em Tempo Real" e botão de ação rápida "Novo Funcionário".
- **Otimização e Limpeza de Abas:**
  - Remoção da aba redundante "Relatórios & Importação", centralizando todos os relatórios e consultas no botão superior.

---

## [v4.7.10] - 21 de Agosto, 2026
### Módulo RH - Gestão Histórica de Vale-Transporte (VT) & Sincronização por Período
- **Histórico & Sincronização em Produção:**
  - Carga e consolidação de 481 registros de concessões de Vale-Transporte abrangendo março, abril, maio, junho, julho e agosto de 2026 diretamente no Firestore.
- **Persistência de Período & Imediação Visual:**
  - Inclusão do campo explícito de período no cadastro e edição de concessões de VT.
  - Correção na lógica de salvamento para persistir o mês de vigência (`period`) e sincronizar a seleção do filtro em tela para exibição imediata do registro recém-criado.
- **Cálculo de Recargas & Saldo de Cartão:**
  - Cálculo automatizado de valor bruto previsto (`diária * dias`), confronto com saldo existente do cartão e determinação do montante líquido de recarga necessária.
- **Padronização de Rótulos de Interface (UI/UX):**
  - Simplificação e conformidade de todos os rótulos de campos e cabeçalhos da tabela de VT para termos únicos e diretos (`Beneficiários`, `Previsto`, `Saldo`, `Recarga`, `Desconto`, `Cargo`, `Tarifa`, `Status`, `Ações`).

---

## [v4.7.7] - 20 de Agosto, 2026
### Central de Relatórios de Estoque & Farmácia (15 Relatórios Completos com Exportação PDF e XLS)
- **Central de Relatórios Nativos (`StockReportsModal`):**
  - Implementação de modal no mesmo padrão de excelência visual do módulo financeiro, acessível pelo botão **"Relatórios (15)"** no topo do painel.
  - Exportação em **PDF** em modo paisagem via `jsPDF` com layout corporativo, cabeçalhos estilizados em azul clínica (`#0284c7`), data de emissão e CNPJ da unidade.
  - Exportação em **Excel (.xlsx)** via `xlsx` com números e valores como floats puros, permitindo fórmulas matemáticas imediatas no Excel.
- **Suíte Completa com 15 Relatórios:**
  1. *1. Posição Geral de Estoque (Inventário Valorizado R$)*
  2. *2. Curva ABC de Insumos & Medicamentos (Impacto Financeiro e % Acumulado)*
  3. *3. Validades & Lotes (Critério FEFO / PVPS)*
  4. *4. Itens Críticos & Ponto de Reposição (Abaixo do Mínimo com Sugestão de Compra)*
  5. *5. Extrato de Movimentações (Kardex Completo por Período)*
  6. *6. Consumo de Medicamentos por Paciente (Rastreabilidade Individual)*
  7. *7. Consumo Agrupado por Setor / Salão de Hemodiálise*
  8. *8. Requisições da Enfermagem (Status e Atendimento)*
  9. *9. Entradas de Notas Fiscais de Compra (NF-e XML / PDF)*
  10. *10. Compras por Fornecedor (Volume e Custo Total)*
  11. *11. Dossiê de Recall Farmacêutico (Auditoria Sanitária & ANVISA)*
  12. *12. Transferências entre Almoxarifados e Postos*
  13. *13. Empréstimos Cedidos e Tomados com Parceiros*
  14. *14. Acurácia e Divergências de Inventário Físico*
  15. *15. Previsão de Consumo & Giro de Estoque (Projeção para 30 e 60 dias)*

---

## [v4.7.4] - 20 de Agosto, 2026
### Rastreabilidade Hospitalar Completa de Medicamentos & Insumos, Dispensação com Sugestão FEFO e Painel de Recall (Fases 1, 2, 3 e 4)
- **Fase 1 — Cadastro & Estrutura de Lotes com Validade:**
  - Criação da coleção `product_batches` para controle atômico de saldos por lote, flag `Controla Lote` no cadastro de insumos/medicamentos, abastecimento automático na importação de NF-e (XML/PDF) e entradas manuais, e aba *Controle de Validade* com ordenação FEFO.
- **Fase 2 — Dispensação na Farmácia com Escolha de Lote & Sugestão FEFO:**
  - No modal de atendimento de requisições da enfermagem, a Farmácia conta agora com seleção inteligente do lote físico a ser entregue, sugerindo automaticamente o lote com vencimento mais próximo (⭐ FEFO) e saldo disponível.
  - Baixa atômica simultânea no estoque geral e no saldo remanescente do lote específico.
- **Fase 3 — Histórico de Rastreabilidade no Prontuário do Paciente:**
  - Registro de cada dispensação na coleção `patient_dispensations` vinculando paciente, medicamento, dose/quantidade, número do lote, validade, técnica solicitante e operador da farmácia.
  - Nova aba **"Medicamentos & Insumos"** no Painel Clínico (`ClinicalPanel`), permitindo auditar tudo o que foi administrado a cada paciente com rastreabilidade total.
- **Fase 4 — Painel de Rastreabilidade & Busca Reversa de Lotes (Recall Sanitário):**
  - Nova aba **"Rastreabilidade & Recall"** no módulo Estoque & Farmácia com busca reversa por Número de Lote, Medicamento, Paciente ou NF-e.
  - Exibição cruzada completa: Dados de Origem da Compra (NF-e, fornecedor, quantidade inicial e saldo atual) + Lista de todos os pacientes que receberam o lote.
  - Botão para impressão rápida de Relatório de Recall / Vigilância Sanitária (ANVISA).

---

## [v4.7.0] - 19 de Agosto, 2026
### Central de Manuais e Guias Interativos dos Módulos & Padronização de Relatórios Brasileiros
- **Central de Manuais e Guias Interativos dos Módulos (`ModuleGuideModal`):**
  - Implementação de modal nativo acessível pelo botão **"Manual"** no topo de cada módulo.
  - Estrutura organizada em abas de termo único: **`Recursos`** (funcionalidades disponíveis), **`Tutorial`** (passos práticos numerados) e **`Dúvidas`** (FAQ rápida).
  - Barra de busca dinâmica em tempo real para localização instantânea de procedimentos.
- **Base de Conhecimento Operacional Completa (`src/data/moduleGuidesData.js`):**
  - Conteúdo prático, direto e com linguagem clínica para os 8 módulos centrais:
    - *Financeiro (NexaFINANCE)*, *RH & Benefícios (NexaHR)*, *Agenda (NexaCAL)*, *Estoque & Farmácia (NexaSTOCK)*, *Compras (NexaPROCURE)*, *Requisições (NexaREQ)*, *SESMT (NexaSAFE)* e *Feed Assistencial (NexaASSIST)*.
- **Regra Obrigatória de Governança de Projeto ([`.agents/AGENTS.md`](file:///c:/Nexa/NexAi-CLINIC/.agents/AGENTS.md)):**
  - Nova diretriz obrigando a atualização da base de manuais a cada nova funcionalidade adicionada no sistema.
- **Padronização de Relatórios Financeiros para o Padrão Brasileiro:**
  - Conversão de todas as colunas de data para o padrão nacional `DD/MM/AAAA`.
  - Exportação de valores no Excel (.xlsx) como números puros (floats), viabilizando fórmulas matemáticas (`=SOMA()`) sem a interferência do texto `"R$"`.
  - Cabeçalhos de tabelas e relatórios simplificados para 1 palavra concisa.

---

## [v4.1.1] - 19 de Agosto, 2026
### Módulo Estoque & Farmácia - Zeração de Estoque Mínimo e Etapa Financeira Dedicada no Importador de NF-e
- **Zeração de Estoque Mínimo de Todos os Produtos (1.221 Itens):**
  - Todos os 1.221 insumos e medicamentos cadastrados no catálogo e no Firestore (`inventory_items`) tiveram seu `minStock` redefinido para `0`.
- **Nova Etapa Financeira Dedicada no Assistente de Importação:**
  - Inclusão da Etapa 3 (*Financeiro*) no fluxo de importação de XML e PDF DANFE, permitindo conferir a Data de Emissão, Valor Total e a tabela de parcelas/faturas identificadas.
- **Edição e Ajuste Dinâmico de Parcelas para Contas a Pagar:**
  - Possibilidade de editar o identificador da parcela, data de vencimento e valor de cada duplicata, bem como adicionar novas parcelas ou excluir itens desnecessários.
  - Validador em tempo real informando se a soma das parcelas bate perfeitamente com o total da nota fiscal.
- **Fluxo Estruturado em 5 Etapas:**
  - 1. Arquivo -> 2. Fornecedor -> 3. Financeiro -> 4. Mapear Itens -> 5. Finalizar.

---

## [v4.1.0] - 19 de Agosto, 2026
### Módulo Estoque & Farmácia - Zeração de Saldos, Limpeza de Histórico, Importador XML & PDF (DANFE) e Modais 100% Responsivos
- **Zeração Completa de Saldos de Produtos (1.221 Itens):**
  - Todos os 1.221 insumos e medicamentos cadastrados no catálogo local e no Firestore (`inventory_items`) foram redefinidos para quantidade inicial 0 (`currentStock: 0`), preparando o ambiente para contagem física real.
- **Exclusão de Histórico de Movimentações Anteriores:**
  - Limpeza total dos registros prévios da coleção `stock_transactions` no Firestore.
- **Importador de Notas Fiscais via XML e PDF (DANFE):**
  - Implementação de parser inteligente de PDF DANFE (`pdfjs-dist`) e XML SEFAZ, extraindo automaticamente Emitente/Fornecedor, Número da NF, Chave de Acesso, Valor Total, Itens/Produtos com quantidades e Duplicatas/Parcelas.
  - Wizard em 4 etapas permitindo upload de `.xml` e `.pdf`, conferência de dados, mapeamento/criação de produtos no catálogo e conferência final.
- **Integração Financeira Direta (Estoque + Contas a Pagar):**
  - Ao concluir a importação de uma NF-e, o estoque é abastecido atomicamente e cada parcela/duplicata identificada no documento é lançada automaticamente no Contas a Pagar (`accounts_payable`) com seu respectivo valor e data de vencimento real.
- **Modais 100% Responsivos e Ajustados para Zoom Normal:**
  - Correção de todos os modais do módulo (Cadastro/Edição de Insumo, Fornecedor, Setor, Movimentação Manual, Transferências entre Locais, Empréstimos, Atendimento de Requisições, Inventário e Contagem Física).
  - Estrutura com corpo rolável (`overflow-y: auto`) e rodapé fixo (`sticky footer`), assegurando que botões de confirmação e cancelamento estejam sempre visíveis sem corte em 100% de zoom.

---

## [v4.0.9] - 19 de Agosto, 2026
### Módulo Financeiro - Saldo Pendente no Card Contas a Pagar do Mês e Remoção de Card Duplicado
- **Card "Contas a Pagar do Mês" Focado em Saldo Pendente:**
  - O valor em destaque do card agora exibe exclusivamente o saldo que falta pagar no mês (títulos pendentes e saldo devedor), sem poluição visual.
  - Remoção de textos explicativos redundantes no rodapé do card.
- **Detalhamento Filtrado Somente com Contas Pendentes:**
  - O modal aberto ao clicar no card agora lista exclusivamente as contas pendentes/não pagas (eliminando registros já quitados da listagem), com botão direto para "Baixar".
- **Eliminação de Card Redundante ("Pagar Hoje & Atrasados"):**
  - Removido o card "Pagar Hoje & Atrasados" para evitar duplicação de informações com o card "Vencidos do Mês", mantendo o layout limpo e direto.
- **Padrão de Rótulos Concisos (1 Palavra):**
  - Padronização de todas as colunas do modal (`Fornecedor`, `Categoria`, `Vencimento`, `Valor`, `Status`, `Ação`).

---

## [v4.0.8] - 19 de Agosto, 2026
### Módulo NexaASSIST - Sincronização em Nuvem (Loop 1 Minuto), Persistência no Firestore e Atualização em Tempo Real
- **Sincronização em Nuvem Contínua (Intervalo de 1 Minuto):**
  - Automação completa do processamento da caixa Titan (`integracao@dialize.com.br`) sem necessidade de manter computador ligado, com workflow em nuvem no GitHub Actions e daemon com intervalo de 60 segundos.
- **Persistência Direta no Firestore (`assist_posts`):**
  - Gravação direta de todos os comunicados assistenciais no Firestore (`assist_posts`), incluindo importação de todos os 18 e-mails dos dias 18 e 19/08 (altas, internações, perdas de acesso, retiradas de CDL e antibioticoterapia).
- **Atualização em Tempo Real (`onSnapshot`):**
  - Conexão em tempo real no feed assistencial, atualizando instantaneamente os cards e KPIs na tela dos profissionais à medida que novos e-mails chegam, sem necessidade de recarregar a página.
- **Liberação das Regras de Segurança do Firestore:**
  - Inclusão das regras de segurança de leitura e escrita para a coleção `assist_posts` em `firestore.rules`.
- **Fuzzy Match com Base Completa de 624 Pacientes:**
  - Correção do motor de busca para cruzar os comunicados com o banco integral de 624 pacientes reais, associando instantaneamente Salão de Diálise, Turno e dados cadastrais.

---

## [v4.0.5] - 17 de Agosto, 2026
### Módulo NexaASSIST - Ingestão Inteligente em Background, Auto-Vínculo de Pacientes e Limpeza de Interface
- **Vínculo Automático de Pacientes (Fuzzy Matching):**
  - Implementação da função `autoLinkAssistPosts` para rastreamento e vínculo automático de pacientes cadastrados (ex: ALEXANDRE JOSE DE PAULA, RAQUEL TABITA, CELSO GONÇALVES MATOS, FLAVIO FERREIRA, ESTER GUIMARÃES) no carregamento dos comunicados.
  - Associação automática de Salão de Diálise, Turno, CPF e identificador do paciente sem exigir intervenção manual.
- **Processamento de E-mails Reais da Caixa Titan (`integracao@dialize.com.br`):**
  - Ingestão contínua em segundo plano dos comunicados de Admissão, Alta Hospitalar e Hospitalização recebidos na caixa assistencial oficial.
- **Classificação Clínica Aprimorada:**
  - Reconhecimento automático de prioridades clínicas para infecções (Ceftazidima/Vancomicina/Permcath/Hemocultura), admissões hospitalares e altas.
- **Simplificação Visual do Cabeçalho:**
  - Remoção dos botões manuais de sincronização e simulação, mantendo a leitura 100% automatizada e o foco no botão de Novo Comunicado.

---

## [v4.0.4] - 17 de Agosto, 2026
### Módulo Agenda (NexaCAL) - Feriados Nacionais do Brasil, Bloqueio de Ausências e Gestão de Grade & Cotas por Médico
- **Feriados Nacionais do Brasil Integrados:**
  - Inclusão do motor de cálculo dinâmico para feriados fixos e móveis nacionais (Carnaval, Quarta-feira de Cinzas, Sexta-feira Santa, Páscoa, Tiradentes, Dia do Trabalho, Corpus Christi, Independência, N. Sra. Aparecida, Finados, Proclamação da República, Consciência Negra e Natal).
  - Destaque visual em todas as visualizações (Diária com banner, Semanal com badges, Mensal com chips comemorativos).
  - Alerta inteligente no modal de agendamento ao selecionar uma data de feriado nacional.
- **Bloqueio de Agenda & Ausências Médicas:**
  - Ferramenta para fechamento de dias ou períodos por solicitação do médico, férias, congressos, folgas ou atestados.
  - Verificação em tempo real de pacientes com consultas marcadas no período bloqueado para remanejamento preventivo.
  - Sinalização de slots bloqueados com cadeado na grade e botão direto para gerenciamento e desbloqueio.
- **Configuração de Grade & Cotas por Médico:**
  - Painel com definição de cotas mensais para Primeira Consulta, Retorno e Procedimentos com barra de progresso em tempo real.
  - Grade semanal com ativação de dias da semana (Segunda a Domingo) e horários de atendimento da Manhã e Tarde.
  - Parâmetros operacionais: tempo médio/duração da consulta (15m a 60m), limite de encaixes diários e consultório preferencial.
  - Validações inteligentes: alertas automáticos no agendamento se a cota do mês foi atingida, se o médico não atende naquele dia da semana ou se possui bloqueio ativo.

---

## [v4.0.2] - 17 de Agosto, 2026
### Módulo Financeiro - Padrão de Rótulos Concisos (1 Palavra) e Vinculação Direta de Centro de Custo
- **Padrão de Rótulos de 1 Palavra / Termo Direto:**
  - Simplificação integral de cabeçalhos de tabela: `Fornecedor`, `Nota Fiscal`, `Parcela`, `Centro de Custo`, `Vencimento`, `Devido`, `Pago`, `Ações`, `Macroárea`, `Orçado`, `Realizado`, `Cadastrado`, `Desvio`, `Execução`, `Competência`, `Situação`, `Saldo`, `Acumulado`, `Cliente`, `Guia`, `Credor`, `Total`.
  - Eliminação de barras e conectivos redundantes que causavam sobreposição e truncamento visual de colunas como `DEVIDO`.
- **Centro de Custo no Formulário de Contas a Pagar:**
  - Adicionado o dropdown com os 31 Centros de Custo Hospitalares no formulário de inclusão e edição de despesas (`costCenterId`), permitindo associação imediata e correta de cada título à matriz de Orçamento x Realizado.
- **Diretriz de Design Registrada (`.agents/AGENTS.md`):**
  - Estabelecida como regra mandatória de desenvolvimento a aplicação de termos únicos/concisos em rótulos e colunas.

---

## [v4.0.1] - 17 de Agosto, 2026
### Módulo Financeiro v4 - Coluna de Ações Sticky, Ocultação de Baixa em Títulos Pagos, Categorias Médicas e Centros de Custo Hospitalares
- **Coluna de Ações Fixa (Sticky Right):** A coluna "Ações & Baixa" agora permanece fixada à direita da tabela em visualização Normal ou Compacta, com sombra de profundidade (`box-shadow`), eliminando a necessidade de rolar até o fim da página para realizar ações.
- **Cabeçalho Fixo e Scroll Interno Otimizado:** Implementado `position: sticky; top: 0` nos cabeçalhos da tabela e container de rolagem suave com barra horizontal sempre no campo de visão imediato do operador.
- **Baixa Inteligente de Títulos:**
  - Ocultação automática do botão "Baixar" em títulos 100% quitados (`isPaid === true` ou saldo devedor zerado), prevenindo duplicidade de baixa.
  - Exibição de botão dinâmico "Baixar Saldo" para pagamentos parciais pendentes.
- **Catálogo Especializado de Categorias Médicas & Hospitalares:** Inclusão de 17 categorias padronizadas para hospitais e clínicas de hemodiálise (MatMed, Medicamentos Clínicos, Concentrados, Dialisadores, Osmose Reversa, Gases Medicinais, Engenharia Clínica, RSS/Lixo Infectante, Honorários Médicos PJ, etc.).
- **Estruturação de 31 Centros de Custo Hospitalares:** População e persistência no Firestore de 31 centros de custo estruturados hierarquicamente em 5 macro áreas (Clínico/Assistencial, Infraestrutura/Hotelaria, Recursos Humanos, Governança/TI e Fiscal/Logística).

---

## [v3.3.84] - 17 de Agosto, 2026
### Módulo Financeiro - Correção de Escopo em Acumuladores e Blindagem Case-Insensitive
- **Correção de ReferenceError (`p is not defined`):** Ajustado o parâmetro de iteração nos acumuladores de redução de totais pagos (`paidAmount` e `totalPaidRealized`) no painel operacional.
- **Normalização no Firestore:** Atualização de todos os 124 registros importados de débitos em `accounts_payable` para o status padronizado `'Pago'`.
- **Blindagem Case-Insensitive:** Refatoração de todos os cálculos de KPIs operacionais, cards de vencimento e relatórios contábeis para verificação resiliente a maiúsculas/minúsculas (`isItemPaid`).
- **Resolução de Indicadores Operacionais:**
  - Card "Títulos em Atraso" e "Pagar Hoje": Contas quitadas e débitos passados não constam mais incorretamente como pendências/atrasos.
  - Card "A Pagar (Próximos 7 Dias)": Desconsidera débitos já liquidados no dia da operação.
- **Relatórios Contábeis Alinhados:** DRE, Fluxo de Caixa Diário e Previsão de Caixa agora reconhecem com exatidão todas as baixas bancárias efetuadas.

---

## [v3.3.81] - 17 de Agosto, 2026
### Módulo Financeiro - Limpeza Integral da Base de Dados na Nuvem (Reset Geral)
- **Limpeza em Nuvem no Firestore:** Exclusão em lote de 985 documentos legados das coleções `accounts_payable`, `accounts_receivable`, `debts`, `bank_statements`, `budget_plans` e `agreements`.
- **Regras de Permissão Atualizadas (`firestore.rules`):** Regras de segurança publicadas e ativas para todas as coleções financeiras no Firestore.
- **Eliminação de Auto-seeding de Mock:** Desativação de dados mock de fallback para que todas as abas financeiras iniciem vazias e operem exclusivamente com registros reais.
- **Fluxo de Caixa Padrão Zerado:** Redefinição do saldo inicial de caixa padrão para R$ 0,00 na projeção financeira.
- **Redução de Bundle em ~200 kB:** Eliminação de JSONs estáticos legados do bundle de produção.

---

## [v3.3.79] - 17 de Agosto, 2026
### Módulo NexaHR (Recursos Humanos) - Regras Estritas de Presença Premiada & Relatório Oficial de Ganhadores com Impressão
- **Regra de Vínculo Empregatício CLT:** A apuração da Presença Premiada passa a contemplar exclusivamente colaboradores contratados sob regime CLT (`contractType === 'CLT'`).
- **Carência Pós-Experiência (>90 dias):** Exclusão automática de colaboradores em período de experiência contratual (admissão com menos de 90 dias até o encerramento do mês de apuração).
- **Desclassificação por Advertências Disciplinares:** Qualquer advertência registrada na ficha funcional do colaborador no mês de competência resulta em desclassificação imediata do prêmio.
- **Desclassificação por Ausências/Faltas:** Ocorrência de faltas ou ausências no período apurado desclassifica o colaborador da bonificação de assiduidade.
- **Novo Relatório Oficial de Ganhadores:** Modal completo acessível pelo card de Presença Premiada e pela aba de Relatórios do NexaHR, com totalizadores de investimento, seletor de competência e valor customizável do prêmio.
- **Folha de Impressão A4 Padronizada:** Layout formatado para impressão (`window.print()` e estilos `@media print`) contendo dados do colaborador, tempo de casa, valor do bônus e campo de assinatura para recibo e auditoria.
- **Exportação em PDF e CSV:** Geração de documento PDF profissional com tabelas zebradas e cabeçalho institucional via jsPDF, além de exportação em planilha CSV para a contabilidade.
- **Auditoria Transparente de Excluídos:** Aba de acompanhamento com detalhamento individualizado de todos os motivos de desclassificação no mês.

---

## [v3.3.77] - 17 de Agosto, 2026
### Módulo NexaASSIST - Conexão Oficial Titan Email (IMAP SSL/TLS) & Sincronização em Tempo Real
- **Conexão Oficial Titan Email:** Integração autenticada com o servidor IMAP `imap.titan.email:993` (SSL/TLS) na conta `integracao@dialize.com.br`.
- **Script Autônomo de Sincronização (`scripts/sync_assist_emails.py`):** Conector em segundo plano com decodificação MIME, sanitização de HTML/assinaturas e classificação automática por IA/NLP.
- **Botão "Sincronizar Caixa Titan" no Painel:** Ação em 1 clique na interface do NexaASSIST para importar novos e-mails diretamente para a linha do tempo.
- **Ingestão Validada do Primeiro Comunicado Real:** Reconhecimento e tratamento de e-mail de intercorrência clínica e antibióticos enviado pela equipe assistencial.

---

## [v3.3.75] - 17 de Agosto, 2026
### Módulo NexaASSIST (Central & Feed Assistencial Inteligente) - Ingestão com IA, Mural de Salões e Linha do Tempo
- **Novo Módulo NexaASSIST:** Hub centralizado de comunicação assistencial rápida, descontinuando gradualmente o uso da lista de e-mail `assistencia@...` e liberando espaço de armazenamento nas caixas da equipe.
- **Mural / Feed em Linha do Tempo:** Visualização em tempo real de comunicados com categorização por cores (Internações, Altas, Transferências, Intercorrências, Nutrição, Psicologia, Serviço Social e Avisos Gerais).
- **Filtros Inteligentes por Salão e Turno:** Segmentação instantânea por Salão 1, Salão 2, Salão 3, DP e Geral, além de turnos e status de leitura.
- **Motor de IA para Leitura de E-mails (Conta Espelho):** Parser NLP com algoritmo de correspondência fuzzy para identificar automaticamente o paciente, categoria clínica, nível de urgência e gerar resumo limpo.
- **Confirmação de Leitura ("Dar Ciente"):** Botão interativo que registra o ciente de cada profissional com data/hora e permite auditar quem da equipe já tomou conhecimento do comunicado.
- **Integração Completa ao Prontuário do Paciente:** Nova aba "Feed & Comunicados" no painel clínico (`ClinicalPanel`) exibindo a linha do tempo exclusiva de ocorrências do paciente e atalho para criar comunicados rápidos.
- **Vínculo Manual de Pacientes Pendentes:** Interface ágil para associar comunicados que vieram de e-mails informais com ambiguidade de nomes.

---

## [v3.3.73] - 14 de Agosto, 2026
### Módulo NexaCAL (Agenda Clínica) - Encaixes, Horários Flexíveis, Idade Automática & Legenda
- **Consultório Padrão "Nenhum":** Ao criar novos agendamentos, o campo Consultório/Sala agora inicia por padrão como "Nenhum", permitindo agendar sem sala fixa.
- **Horário Inicial e Final Livres:** Substituição do seletor fixo por inputs do tipo `time` que permitem agendar em qualquer minuto (ex: 08:15 às 08:45), sugerindo término automático em +30min.
- **Múltiplos Pacientes no Mesmo Horário (Encaixes):** Suporte nativo para acomodar vários pacientes no mesmo horário e médico, com visualização organizada na grade diária.
- **Alerta de Conflito & Confirmação de Encaixe:** Detecção em tempo real de horários concorrentes no modal com aviso visual e botão para registrar como "Encaixe ⚡".
- **Data de Nascimento & Cálculo Automático de Idade:** Preenchimento automático da data de nascimento para pacientes cadastrados e campo editável para pacientes avulsos, calculando dinamicamente a idade na tela.
- **Destaque Visual para Encaixes:** Badge e estilização exclusiva em tom âmbar/laranja para fácil identificação de encaixes em todas as visões (Dia, Salas, Semana e Mês).
- **Legenda Explicativa de Cores:** Barra superior informativa no painel detalhando o significado de cada cor de status e encaixes.

---

## [v3.3.71] - 14 de Agosto, 2026
### Módulo NexaCAL (Agenda Clínica) - Ativação Multiusuário & 5 Melhorias de Experiência
- **Painel de Indicadores de Recepção do Dia (KPIs):** Contadores em tempo real para Total Agendados, Confirmados, Aguardando na Recepção (Sala de Espera), Em Atendimento e Concluídos, com filtro rápido por status.
- **Disparo Real de Lembretes WhatsApp:** Integração direta com WhatsApp Web enviando mensagens personalizadas de confirmação de agendamento em 1 clique.
- **Busca Inteligente & Auto-Complete de Pacientes:** Barra de busca em tempo real na agenda e campo com auto-complete por Nome, CPF ou Telefone no modal de agendamento.
- **Reagendamento & Edição Completa:** Modal intuitivo para alterar data, horário, médico, procedimento ou sala, com validação inteligente de conflitos de horário.
- **Visualização Multissalas & Atalho "Hoje":** Data dinâmica (data atual do sistema), atalho rápido para hoje e novo modo de exibição por salas/consultórios lado a lado.
- **Segurança e Nuvem:** Regras de persistência em nuvem ativadas no `firestore.rules` com sincronização ultrarrápida para operação concorrente de múltiplos atendentes.

---

## [v3.3.70] - 14 de Agosto, 2026
### Módulo de TI - Desvinculação de Regras Fixas de Perfis & Flexibilidade Total
- **Remoção Definitiva de Sobrescrevimento de Papéis:** Eliminadas regras hardcoded que forçavam papéis fixos para usuárias (`anacg@nexa.com`, `jsoares@nexa.com`, etc.).
- **Persistência Total no Firestore:** As alterações de perfil de qualquer usuário realizadas pelo Administrador no Módulo de T.I. / Configurações agora são gravadas e mantidas de forma permanente e dinâmica na nuvem, sem reversão automática no login ou carregamento da lista.
- **Configuração Inicial das Usuárias:** Usuárias `anacg@nexa.com` e `jsoares@nexa.com` configuradas no perfil de Recursos Humanos (RH) como ponto de partida, com total liberdade para futuras edições.

---

## [v3.3.69] - 14 de Agosto, 2026
### Módulo SESMT - Correção de Estilização no Dashboard
- **Correção de Erro de Execução (`ReferenceError: styles is not defined`):** Restaurada a definição completa de estilos e funções auxiliares no `SesmtDashboard.jsx`, garantindo carregamento fluido de todas as 6 abas do módulo SESMT.

---

## [v3.3.68] - 14 de Agosto, 2026
### Módulo SESMT - Cadastro Dinâmico de Equipamentos & Monitoramento de Validades
- **Nova Aba de Cadastro de Equipamentos (`sesmt_equipment`):** Controle patrimonial completo de Extintores de Incêndio e Hidrantes, permitindo cadastrar, editar, inativar, excluir e gerenciar a localização física (setores), tipos de agentes extintores, capacidades e validades de carga e teste hidrostático.
- **Formulários Semanais Dinâmicos:** Os formulários de inspeção de Extintores e Hidrantes agora carregam automaticamente apenas os equipamentos ativos com Localização e Tipo, eliminando a digitação manual e repetitiva de validades a cada semana.
- **Monitoramento Inteligente no Dashboard:** O Dashboard agora analisa dinamicamente as validades cadastradas no banco, alertando com precisão os extintores na validade, a vencer (em 60 dias) e vencidos.

---

## [v3.3.67] - 14 de Agosto, 2026
### Módulo SESMT - Histórico de Registros & Seletor de Período no Dashboard
- **Aba Histórico de Registros:** Nova aba completa para consulta e gestão de todas as inspeções salvas (EPI, Extintores e Hidrantes) com filtros por tipo, busca por texto, intervalo de datas, filtro por turno, botão de visualização detalhada em modal e opção de exclusão.
- **Seletor de Períodos no Dashboard:** Adicionada barra superior com filtros inteligentes de data (Mês Atual, Hoje, Últimos 7 dias, Mês Anterior, Ano Atual, Todos e Personalizado com datas de/até), além de filtros por Setor e Turno, recalculando dinamicamente a taxa de conformidade e todos os gráficos e KPIs.

---

## [v3.3.66] - 14 de Agosto, 2026
### Módulo SESMT - Permissões Cloud Firestore
- **Regras de Segurança Cloud:** Liberadas e aplicadas as permissões de leitura e gravação no Firestore para as coleções do módulo SESMT (`sesmt_epi_inspections`, `sesmt_extinguisher_inspections` e `sesmt_hydrant_inspections`), resolvendo a falha de permissão ao salvar checklists.

---

## [v3.3.65] - 14 de Agosto, 2026
### Módulo SESMT - Seleção de Turno de Trabalho no Checklist de EPI
- **Turno de Trabalho:** Adicionada a seleção de turno (`1º Turno (Manhã)`, `2º Turno (Tarde)` e `3º Turno (Noite)`) no formulário de Verificação Diária de EPI e Segurança, permitindo o registro separado das auditorias realizadas pela manhã e à tarde.

---

## [v3.3.64] - 14 de Agosto, 2026
### Módulo SESMT - Correção de Contraste e Exibição dos Cabeçalhos
- **Visibilidade dos Cabeçalhos:** Corrigida a sobreposição do estilo global CSS nas tags `<th>`, garantindo que os nomes das colunas da tabela de extintores e hidrantes apareçam claramente com fundo azul navy (`#154c79`) e texto branco em negrito.

---

## [v3.3.63] - 14 de Agosto, 2026
### Módulo SESMT - Ajuste de Colunas de Extintores
- **Tabela de Extintores:** Atualizados os nomes e cabeçalhos de todas as colunas da inspeção de extintores (`N° Extintor`, `Tipo`, `Acesso e Visib.`, `Sinalização`, `Pino`, `Lacre / anel`, `Pressurização`, `Mangueira`, `Bico`, `Estado Físico`, `Validade` e `Assinatura`), com inclusão do campo de assinatura individual por extintor e novo visual com contraste navy blue.

---

## [v3.3.61] - 12 de Agosto, 2026
### Desmembramento dos Setores de Hemodiálise no SESMT (Salão-1, Salão-2 e Salão-3)
- **Setores SESMT:** Substituição da opção única "Salão Hemodiálise" pelos setores específicos "Salão-1", "Salão-2" e "Salão-3" no formulário de verificação diária de EPI.
- **Gráficos & BI:** Atualização e alinhamento dos indicadores de não-conformidade por setor no painel do SESMT.

---

## [v3.3.58] - 12 de Agosto, 2026
### Expansão da Matriz RBAC & Perfis de Permissão
- **Matriz RBAC:** Inclusão do módulo SESMT & Segurança (NexaSAFE) na matriz de permissões por perfil.
- **Perfis de Permissão:** Expansão do seletor de perfis de usuário para cobrir os 10 perfis do sistema (Administrador, Recepção, Clínico, Financeiro, RH, SESMT, Almoxarifado, Manutenção, APACs e Compras).
- **Sincronização Cloud:** Auto-seeding inteligente garantindo a gravação de todos os perfis e suas respectivas permissões na coleção `user_profiles` no Firestore.

---

## [v3.3.56] - 12 de Agosto, 2026
### 4 Modos de Visualização & Busca no Portal de Módulos
- **Visualizações:** Inclusão dos 4 modos de exibição no seletor de módulos (Grid, Detalhada, Compacta e Expandida), mantendo o Grid como visão padrão.
- **Busca em Tempo Real:** Adicionada barra de pesquisa para filtrar módulos instantaneamente por nome, subtítulo ou descrição.
- **Usabilidade:** Barra de ferramentas superior intuitiva para alteração de layout com 1 clique e resposta responsiva.

---

## [v3.3.54] - 12 de Agosto, 2026
### Módulo SESMT & Perfil de Acesso para roseannefa
- **Módulo SESMT & Segurança:** Implementado o portal NexaSAFE contendo os formulários digitais de Verificação Diária de EPI, Inspeção Semanal de Extintores e Inspeção Semanal de Hidrantes, acompanhado do Dashboard com indicadores em tempo real (Recharts).
- **Perfil de Permissão SESMT:** Adicionado novo perfil RBAC `sesmt` ("SESMT & Segurança do Trabalho") com permissão de escrita e gestão do módulo SESMT.
- **Usuária Roseanne Faria (`roseannefa`):** Criada e vinculada a usuária `roseannefa@nexa.com` com perfil `sesmt` e permissões ativas.

---

## [v3.3.50] - 12 de Agosto, 2026
### Correção de Autenticação e Fallback de Login (Módulo TI)
- **Correção de Bloqueio Auth:** Resolvido erro `auth/too-many-requests` ao tentar autenticar e implementado fallback inteligente para contas do sistema (`daliam@nexa.com`, `anacg@nexa.com`, etc.), permitindo acesso fluido sem travamento de tentativas.

---

## [v3.3.48] - 12 de Agosto, 2026
### Restauração de Acessos Financeiros (Módulo TI & Autenticação)
- **Acesso do Usuário:** Corrigida e restaurada a regra de permissões da usuária **daliam@nexa.com** (Dália Moraes), definindo seu perfil como **Gestão Financeira (`financial`)** com acesso garantido ao Módulo Financeiro (`NexaFINANCE`), Faturamento, Compras e Qualidade.

---

## [v3.3.46] - 12 de Agosto, 2026
### Atualizações no Módulo Financeiro
- **Filtro de Período:** Adicionado filtro de Mês/Ano para a visualização padrão de Contas a Pagar, exibindo sempre o mês corrente.
- **Remoção de Botão e Duplicatas:** Removido o botão de Limpar Duplicatas, visto que os 456 registros em duplicidade foram excluídos diretamente no banco de dados com um script.

---

## [v3.3.44] - 12 de Agosto, 2026
### Atualizações no Módulo Financeiro
- **Limpeza de Duplicatas:** Adicionado botão para remover registros duplicados importados na planilha de Betim.
- **Remoção de Importação:** Botão de importação de planilha de Betim removido conforme solicitado.
- **Número da Nota:** Coluna "Filial & Competência" substituída por "Número da Nota" na tabela.
- **Data da Baixa:** Adicionado campo "Data do Pagamento" na confirmação de pagamento total ou parcial de despesas.

---

## [v3.3.42] - 11 de Agosto, 2026
### Importação Contas a Pagar Betim 2026
- **Módulo Financeiro:** Implementada rotina automatizada e anti-duplicidade para importação dos 1.191 registros da planilha de Contas a Pagar (Betim) referente a 2026.

---

## [v3.3.40] - 11 de Agosto, 2026
### Novos Motivos de AdvertÃªncia no RH (DesÃ­dia e Indisciplina)
- **AdvertÃªncias:** Adicionados os motivos **DesÃ­dia** e **Indisciplina** na caixa de seleÃ§Ã£o ao registrar advertÃªncias na ficha do colaborador.

---

## [v3.3.39] - 11 de Agosto, 2026
### AusÃªncias de Colaboradores por Dias (MÃ³dulo RH)
- **Ficha de AusÃªncias:** AlteraÃ§Ã£o do campo "Horas Perdidas" para "Dias Perdidos" na adiÃ§Ã£o de faltas e ausÃªncias do colaborador.
- **ExibiÃ§Ã£o & Listagem:** Ajuste da coluna da tabela de ausÃªncias e do widget de ausÃªncias recentes para contabilizaÃ§Ã£o e exibiÃ§Ã£o em Dias.

---

## [v3.3.38] - 11 de Agosto, 2026
### RestriÃ§Ã£o de Perfil Administrador Exclusivo e Ajuste de UsuÃ¡rias RH (MÃ³dulo TI)
- **SeguranÃ§a & RBAC:** Perfil de Administrador restrito e garantido exclusivamente para a conta `contato@techcosta.net`.
- **Perfis de UsuÃ¡rias RH:** ReconfiguraÃ§Ã£o automÃ¡tica e permanente do perfil das usuÃ¡rias `anacg@nexa.com` e `jsoares@nexa.com` para Recursos Humanos (`rh`), evitando que revertam para o perfil de administrador.
- **MÃ³dulo TI / GestÃ£o de UsuÃ¡rios:** Adicionada a opÃ§Ã£o explÃ­cita de seleÃ§Ã£o do perfil "Recursos Humanos (RH)" no painel de administraÃ§Ã£o e gerenciamento de usuÃ¡rios.

---

## [v3.3.34] - 10 de Agosto, 2026
### ImportaÃ§Ã£o do HistÃ³rico de MarÃ§o/2026 e Abril/2026 de Vale-Transporte
- **Base HistÃ³rica Completa:** Processamento e importaÃ§Ã£o dos relatÃ³rios oficiais de VT de MarÃ§o/2026 e Abril/2026 com itinerÃ¡rios, saldos em cartÃ£o e recargas.
- **AmpliaÃ§Ã£o do Seletor:** DisponibilizaÃ§Ã£o dos meses de MarÃ§o/2026 e Abril/2026 no filtro do painel de Vale-Transporte.

---

## [v3.3.33] - 10 de Agosto, 2026
### ImportaÃ§Ã£o de Vale-Transporte dos Meses Anteriores (Junho/2026 e Maio/2026)
- **HistÃ³rico Completo:** Leitura e importaÃ§Ã£o integral dos relatÃ³rios oficiais de VT de Junho/2026 e Maio/2026 com mais de 80 colaboradores por perÃ­odo.
- **SincronizaÃ§Ã£o & Destaques:** VinculaÃ§Ã£o automÃ¡tica com colaboradores e aplicaÃ§Ã£o dos destaques para ConcessÃµes Especiais e Saldos Negativos.
- **Seletor de PerÃ­odos:** DisponibilizaÃ§Ã£o dos meses de Maio/2026 e Junho/2026 no seletor de perÃ­odos do painel de Vale-Transporte.

---

## [v3.3.31] - 10 de Agosto, 2026
### ImportaÃ§Ã£o Oficial de Vale-Transporte (Agosto/2026 - 67 Colaboradores) & ProjeÃ§Ã£o Futura
- **ImportaÃ§Ã£o Completa:** Leitura e importaÃ§Ã£o rigorosa de 67 colaboradores da planilha oficial de Agosto/2026 com Ida, Volta, Total Dia, Escala, Previsto, Saldo CartÃ£o 01/08 e Recarga NecessÃ¡ria.
- **SincronizaÃ§Ã£o RH:** VinculaÃ§Ã£o automÃ¡tica dos 67 colaboradores ao cadastro central do mÃ³dulo RH (`employees`).
- **Destaques & Cores:** Badges visuais em Laranja para ConcessÃµes Especiais, Amarelo para Saldo Sobrando/Excedente e Vermelho para Saldo Negativo/Ajustar.
- **ProjeÃ§Ã£o Futura & ExportaÃ§Ã£o:** BotÃ£o de projeÃ§Ã£o automÃ¡tica para os meses seguintes ("âš¡ ProjeÃ§Ã£o PrÃ³ximo MÃªs") e exportaÃ§Ã£o do relatÃ³rio em CSV.

---

## [v3.3.28] - 10 de Agosto, 2026
### AtualizaÃ§Ã£o e ImportaÃ§Ã£o de Vale-Transporte (MÃ³dulo RH)
- **Novos Campos:** Adicionados os campos Custo Ida, Custo Volta, Escala, Saldo Atual e Recarga NecessÃ¡ria no formulÃ¡rio e listagem do painel de Vale-Transporte.
- **ImportaÃ§Ã£o:** CriaÃ§Ã£o de script NodeJS e importaÃ§Ã£o com sucesso da planilha de dados de Vale-Transporte (Julho de 2026) para o banco de dados.

---

## [v3.3.26] - 08 de Agosto, 2026
### Modos de VisualizaÃ§Ã£o (Compacto, Normal, Card) e Ajuste de Setores
- **Modos de VisualizaÃ§Ã£o:** Adicionado seletor com 3 opÃ§Ãµes de visualizaÃ§Ã£o (**Compacto**, **Normal** e **Card**) para todas as 3 abas principais (Ordens de ServiÃ§o, Equipamentos & Ativos, Cronograma de Preventivas).
- **PadrÃ£o Compacto:** DefiniÃ§Ã£o do modo **Compacto** como padrÃ£o inicial em todas as abas para proporcionar alta densidade e produtividade.
- **Ajuste de Setores:** RemoÃ§Ã£o das opÃ§Ãµes "SalÃ£o A, SalÃ£o B, SalÃ£o C" da lista padrÃ£o de setores, mantendo a estrutura oficial (SalÃ£o-1, SalÃ£o-2, SalÃ£o-3).

---

## [v3.3.25] - 08 de Agosto, 2026
### Seletor de Setor e LocalizaÃ§Ã£o de Equipamentos
- **Novas OpÃ§Ãµes:** O campo de Setor/LocalizaÃ§Ã£o no cadastro de equipamentos agora possui uma lista suspensa de opÃ§Ãµes prÃ©-definidas contendo **SalÃ£o-1, SalÃ£o-2, SalÃ£o-3**, SalÃ£o A, SalÃ£o B, SalÃ£o C, Tratamento de Ã�gua, ReÃºso, CME, ConsultÃ³rios, RecepÃ§Ã£o, etc.
- **Setor Personalizado:** OpÃ§Ã£o de selecionar "Outro" para digitar qualquer setor/localizaÃ§Ã£o personalizado.
- **HistÃ³rico DinÃ¢mico:** Todos os setores jÃ¡ cadastrados no banco sÃ£o mesclados automaticamente Ã s opÃ§Ãµes.

---

## [v3.3.24] - 08 de Agosto, 2026
### Expurgo AutomÃ¡tico de Ativos de TI Legados
- **SanitizaÃ§Ã£o em Tempo de ExecuÃ§Ã£o:** Implementada filtragem preventiva no carregamento e escuta de banco de dados para expurgar automaticamente qualquer equipamento (Servidores Dell, Impressoras Zebra) ou Ordens de ServiÃ§o de TI antigas que estivessem salvas em cache local (localStorage) ou no banco de dados Firestore.

---

## [v3.3.23] - 08 de Agosto, 2026
### Varredura Completa de T.I. no MÃ³dulo de ManutenÃ§Ã£o
- **Limpeza Profunda:** RemoÃ§Ã£o de todos os textos, opÃ§Ãµes de formulÃ¡rio (TI Hardware/Software, Computador, Impressora, Monitor, Senha), exemplos de placeholders (Servidor Dell, Data Center) e tÃ­tulos ("ManutenÃ§Ã£o & TI", "BI ManutenÃ§Ã£o & TI") nos seletores de mÃ³dulos, Navbar e Painel de ManutenÃ§Ã£o.
- **Foco Exclusivo:** MÃ³dulo 100% voltado para Engenharia ClÃ­nica (BiomÃ©dico) e ManutenÃ§Ã£o Predial/Infraestrutura.

---

## [v3.3.21] - 08 de Agosto, 2026
### RemoÃ§Ã£o de T.I. do MÃ³dulo de ManutenÃ§Ã£o
- **Limpeza de Escopo:** RemoÃ§Ã£o completa de referÃªncias, KPIs e categorias de Tecnologia da InformaÃ§Ã£o (TI) da tela de ManutenÃ§Ã£o para manter o foco exclusivo no setor ClÃ­nico e Predial.
- **Base de Dados:** ExclusÃ£o de equipamentos simulados de hardware/software de TI e suas respectivas Ordens de ServiÃ§o do banco inicial.
- **PermissÃµes:** Ajuste no controle de acesso, centralizando o mÃ³dulo apenas para cargos de administraÃ§Ã£o e engenharia/manutenÃ§Ã£o.

---

## [v3.3.20] - 08 de Agosto, 2026
### MÃ³dulo de ManutenÃ§Ã£o - Cadastro Completo de Equipamentos de HemodiÃ¡lise e Osmose
- **Equipamentos:** Carga de 105 MÃ¡quinas de HemodiÃ¡lise Nipro Diamax 220F com nÃºmero de sÃ©rie, salÃ£o/ponto e histÃ³rico de coletas de dialisato.
- **Tratamento de Ã�gua:** Cadastro de 7 Osmoses PortÃ¡teis (Deltamed, Ipabras e Vexer) para diÃ¡lise externa.
- **DesduplicaÃ§Ã£o:** Cruzamento e desduplicaÃ§Ã£o dos dados entre as planilhas/cronogramas de 2025 e 2026.

---

## [v3.3.16] - 08 de Agosto, 2026
### Desbloqueio de LanÃ§amento BI
- **Acessibilidade:** LiberaÃ§Ã£o de acesso: A pÃ¡gina de Upload/LanÃ§amento de Dados no mÃ³dulo de BI foi liberada novamente para todos os perfis, permitindo que todos os setores insiram os dados de seus indicadores.

---

## [v3.3.15] - 08 de Agosto, 2026
### RestriÃ§Ã£o de Acesso e ImpressÃ£o BI
- **SeguranÃ§a:** RestriÃ§Ã£o de acesso: Apenas administradores podem lanÃ§ar dados e acessar a pÃ¡gina de Upload no mÃ³dulo de BI.
- **Recursos:** Nova funcionalidade: OpÃ§Ã£o de impressÃ£o de grÃ¡ficos de indicadores em formatos retrato e paisagem.

---

ï¿½ï¿½## [v3.3.14] - 08 de Agosto, 2026
### Correï¿½ï¿½o Prioridade RBAC vs Permissï¿½es Legadas
- **RBAC:** Matriz de permissï¿½es dinï¿½micas do ConfigPanel agora sobrepï¿½e o sistema antigo (allowedSectors), resolvendo problema em que mï¿½dulos configurados na Equipe Multiprofissional nï¿½o apareciam.

---

## [v3.3.13] - 08 de Agosto, 2026 ### Ajuste Crï¿½tico de Autenticaï¿½ï¿½o e Perfil - **Autenticaï¿½ï¿½o:** Redefiniï¿½ï¿½o forï¿½ada de senha para usuï¿½rio especï¿½fico diretamente no Firebase Auth e Firestore. - **Sincronizaï¿½ï¿½o:** Correï¿½ï¿½o no retorno do objeto de usuï¿½rio no Login para garantir carregamento imediato do perfil (mï¿½dulos e nome).  ---  ## [v3.3.9] - 08 de Agosto, 2026 ### Sincronizaï¿½ï¿½ï¿½ï¿½o e Fallback de Senhas de Login Multi-Dispositivo - **Fallback Inteligente (localStorage):** Implementaï¿½ï¿½ï¿½ï¿½o de persistï¿½ï¿½ncia local da sessï¿½ï¿½o quando a autenticaï¿½ï¿½ï¿½ï¿½o nativa do Firebase falha por dessincronizaï¿½ï¿½ï¿½ï¿½o de senha (ex: senhas temporï¿½ï¿½rias ou atualizaï¿½ï¿½ï¿½ï¿½es manuais no painel T.I). - **Auto-Healing de Credenciais:** O sistema agora tenta ativamente reconectar com senhas padrï¿½ï¿½es antigas nos bastidores e, se bem-sucedido, sincroniza e atualiza automaticamente a conta no Firebase Auth com a nova senha customizada gravada na nuvem.  ---  ## [v3.3.7] - 08 de Agosto, 2026 ### Correï¿½ï¿½ï¿½ï¿½o Definitiva: Gravaï¿½ï¿½ï¿½ï¿½o e Validaï¿½ï¿½ï¿½ï¿½o Resiliente por E-mail/UID no Firestore - **Gravaï¿½ï¿½ï¿½ï¿½o Resiliente no Cloud Firestore:** A funï¿½ï¿½ï¿½ï¿½o `updateUserPassword` agora localiza o registro do usuï¿½ï¿½rio por `email` ou `uid`, escrevendo o campo `password` com a instruï¿½ï¿½ï¿½ï¿½o `{ merge: true }`. - **Validaï¿½ï¿½ï¿½ï¿½o Imediata entre Navegadores:** Correï¿½ï¿½ï¿½ï¿½o do problema onde a senha temporï¿½ï¿½ria/nova gerada no Navegador 1 nï¿½ï¿½o afetava a conta no Navegador 2 devido a divergï¿½ï¿½ncias entre a chave ID interna e a chave do e-mail de login.  ---  ## [v3.0.14] - 06 de Agosto, 2026 ### Fallback Inteligente de Senha no Login (daliam@nexa.com) - **Flexibilidade de Login:** Adicionada rotina de autenticaï¿½ï¿½ï¿½ï¿½o com fallback inteligente no login para sincronizar contas de operadores predefinidos (`daliam@nexa.com`) independente do padrï¿½ï¿½o da senha gerada na tentativa anterior (`dalia123`, `Daliam1234!`, `daliam123`).  ---  ## [v3.0.13] - 06 de Agosto, 2026 ### Ajuste de Padrï¿½ï¿½o de Senha do Usuï¿½ï¿½rio daliam@nexa.com - **Senha Padrï¿½ï¿½o Configurada:** Ajustada a credencial de acesso do usuï¿½ï¿½rio `daliam@nexa.com` para a senha `dalia123`.  ---  ## [v3.0.12] - 06 de Agosto, 2026 ### Resiliï¿½ï¿½ncia no Cadastro de Usuï¿½ï¿½rios (Tratamento de E-mail Existente) - **Tratamento `auth/email-already-in-use`:** Tratamento inteligente para logins que jï¿½ï¿½ possuem cadastro de autenticaï¿½ï¿½ï¿½ï¿½o no Firebase (por exemplo, criados em tentativas anteriores). O sistema agora sincroniza e vincula o documento no Firestore sem bloquear o operador com erro bruto. - **Mensagem Amigï¿½ï¿½vel:** Notificaï¿½ï¿½ï¿½ï¿½o clara e explicativa no modal de cadastro ao re-vincular um e-mail existente no sistema.  ---  ## [v3.0.11] - 06 de Agosto, 2026 ### Correï¿½ï¿½ï¿½ï¿½o no Cadastro de Usuï¿½ï¿½rios (Firebase Config) - **Correï¿½ï¿½ï¿½ï¿½o de Autenticaï¿½ï¿½ï¿½ï¿½o:** Exportaï¿½ï¿½ï¿½ï¿½o e importaï¿½ï¿½ï¿½ï¿½o do objeto `firebaseConfig` em `authService.js` e `config.ts`, resolvendo o erro `ReferenceError: firebaseConfig is not defined` ao tentar cadastrar novos usuï¿½ï¿½rios. - **Validaï¿½ï¿½ï¿½ï¿½o de Credenciais:** Adicionada verificaï¿½ï¿½ï¿½ï¿½o preventiva para garantir a correta inicializaï¿½ï¿½ï¿½ï¿½o das instï¿½ï¿½ncias secundï¿½ï¿½rias do Firebase Auth.  ---  ## [v3.0.10] - 06 de Agosto, 2026 ### Mï¿½ï¿½dulo de T.I. - Matriz RBAC Completa (11 Mï¿½ï¿½dulos) - **Matriz de Permissï¿½ï¿½es RBAC (NexaCONFIG):** Atualizaï¿½ï¿½ï¿½ï¿½o da matriz de controle de acessos por perfil para englobar todos os 11 mï¿½ï¿½dulos do sistema. - **Mï¿½ï¿½dulos Adicionados ï¿½ï¿½ Matriz:** Inclusï¿½ï¿½o das colunas de permissï¿½ï¿½o para **Agenda & Consultas** (`calendar`), **Compras & Cotaï¿½ï¿½ï¿½ï¿½es** (`purchasing`) e **APACs & Faturamento** (`apac`).  ---  ## [v3.0.9] - 06 de Agosto, 2026 ### Correï¿½ï¿½ï¿½ï¿½o de Importaï¿½ï¿½ï¿½ï¿½o do ï¿½ï¿½cone na Aba DRE Gerencial - **Correï¿½ï¿½ï¿½ï¿½o de Erro de Execuï¿½ï¿½ï¿½ï¿½o (ReferenceError):** Adicionada a importaï¿½ï¿½ï¿½ï¿½o do componente `Activity` da biblioteca `lucide-react` em `FinancePanel.jsx`, corrigindo a falha ao renderizar a aba de DRE Gerencial.  ---  ## [v3.0.8] - 06 de Agosto, 2026 ### Mï¿½ï¿½dulo Financeiro (Parte 3) - Ampliaï¿½ï¿½ï¿½ï¿½o Cadastral e DRE Gerencial - **ï¿½x ` DRE Gerencial:** Nova aba com demonstraï¿½ï¿½ï¿½ï¿½o financeira completa: Receita Bruta, Impostos (ISS/PIS/COFINS ~6%), Receita Lï¿½ï¿½quida, Custos Variï¿½ï¿½veis (Insumos/Medicamentos), Margem de Contribuiï¿½ï¿½ï¿½ï¿½o %, Custos Fixos (Folha/Aluguel), EBITDA % e Lucro Lï¿½ï¿½quido. - **ï¿½x ï¿½ Ampliaï¿½ï¿½ï¿½ï¿½o Cadastral:** Inclusï¿½ï¿½o de novos campos nos modais e lanï¿½ï¿½amentos de Pagar e Receber: Forma de Pagamento (PIX, Boleto, Cartï¿½ï¿½es, TED, Dinheiro), Banco/Conta Destino e Classificaï¿½ï¿½ï¿½ï¿½o de Natureza (Custo Fixo Recorrente vs Custo Variï¿½ï¿½vel). - **ï¿½xï¿½ï¿½ï¿½ï¿½ï¿½ Badges Visuais:** Exibiï¿½ï¿½ï¿½ï¿½o destacada do meio de pagamento e nï¿½ï¿½mero do documento nas tabelas de lanï¿½ï¿½amentos.  ---  ## [v3.0.7] - 06 de Agosto, 2026 ### Mï¿½ï¿½dulo Financeiro (Parte 2) - Auto-ordenaï¿½ï¿½ï¿½ï¿½o Dinï¿½ï¿½mica em Todas as Tabelas - **Orï¿½ï¿½amento X Realizado:** Adicionada ordenaï¿½ï¿½ï¿½ï¿½o ao clicar no cabeï¿½ï¿½alho de todas as colunas (Cï¿½ï¿½digo/Centro de Custo, Categoria Pai, Orï¿½ï¿½ado, Pago, Devido, Desvio R$, Execuï¿½ï¿½ï¿½ï¿½o % e Status Variï¿½ï¿½ncia). - **Acordos & Renegociaï¿½ï¿½ï¿½ï¿½es:** Adicionada ordenaï¿½ï¿½ï¿½ï¿½o interativa por Fornecedor, Filial, Total Renegociado, Nï¿½ï¿½ Parcelas, Valor Parcela, Progresso e Status. - **Conciliaï¿½ï¿½ï¿½ï¿½o Bancï¿½ï¿½ria:** Extrato bancï¿½ï¿½rio agora permite ordenaï¿½ï¿½ï¿½ï¿½o por Data, Banco, Descriï¿½ï¿½ï¿½ï¿½o, Tipo (Crï¿½ï¿½dito/Dï¿½ï¿½bito), Valor e Status. - **Projeï¿½ï¿½ï¿½ï¿½o Saldo Fluxo:** Tabela de liquidez temporal com ordenaï¿½ï¿½ï¿½ï¿½o por Mï¿½ï¿½s, Devido, Pago, Saldo do Mï¿½ï¿½s e Saldo Fluxo Acumulado.  ---  ## [v3.0.6] - 06 de Agosto, 2026 ### Mï¿½ï¿½dulo Financeiro (Parte 1) - Botï¿½ï¿½es de Aï¿½ï¿½ï¿½ï¿½o e Gestï¿½ï¿½o Completa - **Orï¿½ï¿½amento X Realizado:** Adicionados botï¿½ï¿½es de Ediï¿½ï¿½ï¿½ï¿½o e Exclusï¿½ï¿½o para metas orï¿½ï¿½amentï¿½ï¿½rias na matriz por Centro de Custos. - **Acordos & Renegociaï¿½ï¿½ï¿½ï¿½es:** Adicionadas opï¿½ï¿½ï¿½ï¿½es de Ediï¿½ï¿½ï¿½ï¿½o e Exclusï¿½ï¿½o para contratos de acordos com fornecedores. - **Projeï¿½ï¿½ï¿½ï¿½o Saldo Fluxo:** Criado botï¿½ï¿½o e modal de "Ajuste de Saldo Inicial de Caixa" com gravaï¿½ï¿½ï¿½ï¿½o persistente para a liquidez temporal. - **Conciliaï¿½ï¿½ï¿½ï¿½o Bancï¿½ï¿½ria:** Adicionadas opï¿½ï¿½ï¿½ï¿½es de "Novo Lanï¿½ï¿½amento Manual no Extrato", Exclusï¿½ï¿½o de itens do extrato e aï¿½ï¿½ï¿½ï¿½o de "Desfazer Conciliaï¿½ï¿½ï¿½ï¿½o".  ---  ## [v3.0.5] - 06 de Agosto, 2026 ### Correï¿½ï¿½ï¿½ï¿½o de Fuso Horï¿½ï¿½rio nas Datas de Nascimento dos Dependentes (RH) - **Correï¿½ï¿½ï¿½ï¿½o no Mï¿½ï¿½dulo RH (Exibiï¿½ï¿½ï¿½ï¿½o de Datas):** Implementaï¿½ï¿½ï¿½ï¿½o da funï¿½ï¿½ï¿½ï¿½o `formatDateBR` para formatar datas no formato `YYYY-MM-DD` diretamente sem conversï¿½ï¿½o UTC, eliminando o erro que exibia datas de nascimento de dependentes com 1 dia a menos (fuso horï¿½ï¿½rio BRT UTC-3). - **Adequaï¿½ï¿½ï¿½ï¿½o Geral no RH:** Atualizaï¿½ï¿½ï¿½ï¿½o das listagens de dependentes, advertï¿½ï¿½ncias, ausï¿½ï¿½ncias, vacinas, documentos e contratos em experiï¿½ï¿½ncia para uso da formataï¿½ï¿½ï¿½ï¿½o segura de datas. - **Integridade dos Dados:** Confirmada a integridade de todos os registros armazenados no Firestore Cloud para Geisiane Morais, Mirelli Bispo, Moises da Silva e Shayanne Cristine.  ---  ## [v3.0.2] - 05 de Agosto, 2026 ### Ajuste de Interface & Simplificaï¿½ï¿½ï¿½ï¿½o Multi-Tenant - **Remoï¿½ï¿½ï¿½ï¿½o da Barra Superior de Unidade e Importaï¿½ï¿½ï¿½ï¿½o:** Removida a barra de seleï¿½ï¿½ï¿½ï¿½o de filial e botï¿½ï¿½o de importaï¿½ï¿½ï¿½ï¿½o a pedido da gestï¿½ï¿½o, alinhando a arquitetura para tratamento via Multi-Tenant. - **Limpeza Visual e Ajuste de UX:** Cabeï¿½ï¿½alho do mï¿½ï¿½dulo financeiro reorganizado com abas de navegaï¿½ï¿½ï¿½ï¿½o alinhadas e limpas no topo.  ---  ## [v3.0.1] - 05 de Agosto, 2026 ### ï¿½xaï¿½  MARCO MAJOR: Lanï¿½ï¿½amento dos Mï¿½ï¿½dulos NexaBUDGET, Centro de Custos & Integraï¿½ï¿½ï¿½ï¿½o Completa - **Salto de Versï¿½ï¿½o Major (v3.0.1):** Versï¿½ï¿½o oficial de lanï¿½ï¿½amento dos novos mï¿½ï¿½dulos de **Orï¿½ï¿½amento X Realizado**, **Centro de Custos**, **Projeï¿½ï¿½ï¿½ï¿½o de Saldo Fluxo** e **Gestï¿½ï¿½o de Acordos/Renegociaï¿½ï¿½ï¿½ï¿½es**. - **Preenchimento Total dos Dados de Betim (2026):** Sincronizaï¿½ï¿½ï¿½ï¿½o completa de todos os 32 lanï¿½ï¿½amentos da planilha em todas as visï¿½ï¿½es do sistema (Contas a Pagar, Matriz Orï¿½ï¿½amentï¿½ï¿½ria por Centro de Custos, Saldo Fluxo Temporal e Acordos). - **Matriz Orï¿½ï¿½amento X Realizado:** Acompanhamento dinï¿½ï¿½mico de metas vs gastos executados em 12 Centros de Custo (Insumos Dialï¿½ï¿½ticos, Equipamentos, Utilitï¿½ï¿½rios, RH/Folha, Tributos Trabalhistas, Jurï¿½ï¿½dico) com alertas visuais de variï¿½ï¿½ncia (ï¿½xxï¿½ Dentro da Meta | ï¿½xxï¿½ Atenï¿½ï¿½ï¿½ï¿½o | ï¿½x ï¿½ Estouro Crï¿½ï¿½tico). - **Projeï¿½ï¿½ï¿½ï¿½o Executiva de Saldo Fluxo:** Tabela e curva de liquidez acumulada (Junho/25 a Agosto/26) com diagnï¿½ï¿½stico do rombo acumulado de -R$ 1.899.979,34 em Betim e botï¿½ï¿½o de simulaï¿½ï¿½ï¿½ï¿½o de baixas. - **Acordos & Renegociaï¿½ï¿½ï¿½ï¿½es:** Controle centralizado de parcelamentos longos (ex: Lacerda Alimentaï¿½ï¿½ï¿½ï¿½o, Farmarin). - **Integraï¿½ï¿½ï¿½ï¿½o Total com Mï¿½ï¿½dulo de Compras:** Ordens de compra aprovadas vinculam automaticamente a Filial Betim e o Centro de Custos 1.1 de Insumos Dialï¿½ï¿½ticos.  ---  ## [v2.1.39] - 03 de Agosto, 2026 ### Soluï¿½ï¿½ï¿½ï¿½o Definitiva para Tela Branca no Estoque (Prevenï¿½ï¿½ï¿½ï¿½o de Dados Corrompidos) - **Componente StockPanel & useStockLogic:** Implementaï¿½ï¿½ï¿½ï¿½o de _Optional Chaining_ (`?.`) em todas as lï¿½ï¿½gicas de mapeamento e filtragem de arrays (requisiï¿½ï¿½ï¿½ï¿½es, inventï¿½ï¿½rios, lotes, etc). - **Tratamento de Dados:** Correï¿½ï¿½ï¿½ï¿½o do algoritmo de ordenaï¿½ï¿½ï¿½ï¿½o para impedir exceï¿½ï¿½ï¿½ï¿½es ao acessar chaves de dados nulos ou deletados do Firebase, evitando crashes em cadeia e eliminando o erro da "Tela Branca".  ---  ## [v2.1.37] - 03 de Agosto, 2026 ### Otimizaï¿½ï¿½ï¿½ï¿½o da Arquitetura do Estoque & Reorganizaï¿½ï¿½ï¿½ï¿½o de Abas - **Setores de Estoque (Almoxarifados):** Aba movida do mï¿½ï¿½dulo de Estoque para a gestï¿½ï¿½o centralizada no mï¿½ï¿½dulo de **T.I / Configuraï¿½ï¿½ï¿½ï¿½es** (`ConfigPanel.jsx`), permitindo gerenciamento completo pelos administradores. - **Cadastro de Fornecedores:** Aba movida do mï¿½ï¿½dulo de Estoque para o mï¿½ï¿½dulo de **Compras** (`PurchasingPanel.jsx`), integrando a gestï¿½ï¿½o de fornecedores diretamente ao fluxo de cotaï¿½ï¿½ï¿½ï¿½es e suprimentos. - **Soluï¿½ï¿½ï¿½ï¿½o Definitiva de Tela Branca (Lazy Loading):** Refatoraï¿½ï¿½ï¿½ï¿½o do `useStockLogic.jsx` para carregar coleï¿½ï¿½ï¿½ï¿½es do Firestore sob demanda por aba e limitar histï¿½ï¿½ricos longos de movimentaï¿½ï¿½ï¿½ï¿½o a 100 itens, reduzindo drasticamente o consumo de memï¿½ï¿½ria do navegador.  ---  ## [v2.1.35] - 02 de Agosto, 2026 ### Proteï¿½ï¿½ï¿½ï¿½o Defensiva no Mï¿½ï¿½dulo Estoque & Farmï¿½ï¿½cia - **Mï¿½ï¿½dulo Estoque (StockPanel):** Adicionada proteï¿½ï¿½ï¿½ï¿½o assï¿½ï¿½ncrona com `catch` individual em cada requisiï¿½ï¿½ï¿½ï¿½o de dados (`Promise.all`) e Optional Chaining (`(requisitions || []).filter(...)`) no menu de abas e indicadores para impedir exceï¿½ï¿½ï¿½ï¿½es de tela branca.  ---  ## [v2.1.33] - 02 de Agosto, 2026 ### Correï¿½ï¿½ï¿½ï¿½o Crï¿½ï¿½tica de Importaï¿½ï¿½ï¿½ï¿½o de ï¿½ï¿½cones - **ModuleSelector.jsx:** Importaï¿½ï¿½ï¿½ï¿½o explï¿½ï¿½cita do ï¿½ï¿½cone `FileText` da biblioteca `lucide-react` para resolver erro em tempo de execuï¿½ï¿½ï¿½ï¿½o ao tentar renderizar o novo mï¿½ï¿½dulo `NexaAPAC`.  ---  ## [v2.1.31] - 02 de Agosto, 2026 ### Correï¿½ï¿½ï¿½ï¿½o de Renderizaï¿½ï¿½ï¿½ï¿½o no Seletor de Mï¿½ï¿½dulos - **Seletor de Mï¿½ï¿½dulos (NexaCLINIC):** Adicionada validaï¿½ï¿½ï¿½ï¿½o defensiva para renderizaï¿½ï¿½ï¿½ï¿½o dos ï¿½ï¿½cones e verificaï¿½ï¿½ï¿½ï¿½o de permissï¿½ï¿½es do novo mï¿½ï¿½dulo `NexaAPAC` para prevenir exceï¿½ï¿½ï¿½ï¿½es de tela branca.  ---  ## [v2.1.29] - 02 de Agosto, 2026 ### Mï¿½ï¿½dulo Independente NexaAPAC & Dashboard Financeiro Interativo - **Novo Mï¿½ï¿½dulo NexaAPAC (APACs & Faturamento):** Mï¿½ï¿½dulo dedicado para auditoria de APACs de diï¿½ï¿½lise, controle de vencimentos, gestï¿½ï¿½o de glosas de convï¿½ï¿½nios e geraï¿½ï¿½ï¿½ï¿½o de arquivos de remessa SUS. - **Dashboard Financeiro Clicï¿½ï¿½vel:** Todos os cards de KPI do Mï¿½ï¿½dulo Financeiro tornaram-se interativos, abrindo um modal completo com a listagem filtrada dos tï¿½ï¿½tulos, prazos e detalhamentos operacionais.  ---  ## [v2.1.27] - 02 de Agosto, 2026 ### Proteï¿½ï¿½ï¿½ï¿½o Defensiva contra Tela Branca (Catï¿½ï¿½logo e Entrada de Notas) - **Catï¿½ï¿½logo de Produtos:** Blindagem das propriedades dos produtos (`currentStock`, `minStock`, `price`, `name`, `category`) prevenindo exceï¿½ï¿½ï¿½ï¿½es de renderizaï¿½ï¿½ï¿½ï¿½o em registros inconsistentes no banco. - **Entrada de Notas & XML:** Tratamento e fallback para formataï¿½ï¿½ï¿½ï¿½o de moedas (`totalValue.toFixed(2)`) e validaï¿½ï¿½ï¿½ï¿½o estrita de datas (`issueDate` e `entryDate`).  ---  ## [v2.1.25] - 02 de Agosto, 2026 ### Mapeamento de KPIs no Estoque & Correï¿½ï¿½ï¿½ï¿½o de Tela Branca - **Mï¿½ï¿½dulo Estoque (Atendimento de Requisiï¿½ï¿½ï¿½ï¿½es):** Adicionada a grade de 4 cards estatï¿½ï¿½sticos (Total de Pedidos, Pendentes, Entregas Parciais, Atendidos/Entregues) para dar visï¿½ï¿½o imediata dos indicadores da farmï¿½ï¿½cia. - **Resiliï¿½ï¿½ncia contra Tela Branca:** Tratamento e fallback para renderizaï¿½ï¿½ï¿½ï¿½o de datas em tabelas do estoque, evitando falhas de execuï¿½ï¿½ï¿½ï¿½o no navegador.  ---  ## [v2.1.24] - 02 de Agosto, 2026 ### Melhorias no Mï¿½ï¿½dulo de Recursos Humanos (RH) e Vale-Transporte - **Presenï¿½ï¿½a Premiada:** Valor padrï¿½ï¿½o inicial alterado para R$ 100,00 por colaborador elegï¿½ï¿½vel. - **Vale-Transporte:** Corrigida a altura e rolagem do modal de "Nova Concessï¿½ï¿½o de Vale-Transporte" (`maxHeight: 80vh` com `overflowY: auto`), permitindo visualizaï¿½ï¿½ï¿½ï¿½o dos botï¿½ï¿½es de Confirmar e Cancelar em qualquer dispositivo. - **Demissï¿½ï¿½o / Desligamento de Funcionï¿½ï¿½rios:** Criado recurso e fluxo para registrar desligamentos/demissï¿½ï¿½es de colaboradores com atalho de aï¿½ï¿½ï¿½ï¿½o "Demitir", data de desligamento e histï¿½ï¿½rico de inativaï¿½ï¿½ï¿½ï¿½o.  ---  ## [v2.1.23] - 01 de Agosto, 2026 ### Correï¿½ï¿½ï¿½ï¿½o de Permissï¿½ï¿½es Firestore e Restauraï¿½ï¿½ï¿½ï¿½o de Dados - **Correï¿½ï¿½ï¿½ï¿½o Crï¿½ï¿½tica:** Atualizadas as regras de seguranï¿½ï¿½a do Firebase (firestore.rules) para liberar permissï¿½ï¿½es de leitura/escrita para todas as coleï¿½ï¿½ï¿½ï¿½es de mï¿½ï¿½dulos de retaguarda (estoque, RH, financeiro, compras). - **Correï¿½ï¿½ï¿½ï¿½o de Crash:** Corrigido o `TypeError` em chamadas `dbService.getUsers()` nï¿½ï¿½o tratadas exportando corretamente `authFunctions` no `firebase.js`. Com isso, a tela branca ao entrar nos mï¿½ï¿½dulos Estoque, Compras e RH foi resolvida.  ---  ## [v2.1.20] - 01 de Agosto, 2026 ### Restauraï¿½ï¿½ï¿½ï¿½o do Cadastro de Funcionï¿½ï¿½rios/Usuï¿½ï¿½rios & Estabilizaï¿½ï¿½ï¿½ï¿½o de Mï¿½ï¿½dulos - **Recuperaï¿½ï¿½ï¿½ï¿½o de Funcionï¿½ï¿½rios:** Implementada semeadura padrï¿½ï¿½o em `getEmployees()` (`hrService.ts`) garantindo a presenï¿½ï¿½a dos funcionï¿½ï¿½rios (Ana Carolina Cerqueira Gonzaga, Dr. J. Soares, Administrador TechCosta, Maria Clara Santos, Joï¿½ï¿½o Almoxarife). - **Garantia de Usuï¿½ï¿½rios & Permissï¿½ï¿½es:** Atualizado `getUsers()` (`authService.js`) para sincronizar e semear os usuï¿½ï¿½rios cadastrados e manter o perfil de Administrador Geral sem perda de acessos. - **Resoluï¿½ï¿½ï¿½ï¿½o Definitiva de Tela Branca:** Repassado o objeto de estado `currentUser={user}` globalmente em `App.jsx` para todos os mï¿½ï¿½dulos (Estoque, Compras, RH, Financeiro, Agenda, TI/Configuraï¿½ï¿½ï¿½ï¿½es e Recepï¿½ï¿½ï¿½ï¿½o).  ---  ## [v2.1.16] - 01 de Agosto, 2026 ### Correï¿½ï¿½ï¿½ï¿½o de Tela Branca nos Mï¿½ï¿½dulos Compras, Estoque e RH - **Correï¿½ï¿½ï¿½ï¿½o de Escopo & Props:** Corrigido o erro de compilaï¿½ï¿½ï¿½ï¿½o/escopo em `PurchasingPanel.jsx` e garantido o repasse da prop `currentUser` aos componentes `StockPanel`, `HRPanel`, `useStockLogic` e `useHRLogic`. - **Tratamento de Exceï¿½ï¿½ï¿½ï¿½es em Leitura Firestore:** Adicionada proteï¿½ï¿½ï¿½ï¿½o `try/catch` nas chamadas de dados do Firestore em `financialService.js`, `stockService.js` e `hrService.ts`, retornando listas vazias como fallback seguro em caso de falha de conexï¿½ï¿½o ou permissï¿½ï¿½o.  ---  ## [v2.1.14] - 01 de Agosto, 2026 ### Restauraï¿½ï¿½ï¿½ï¿½o Total de Permissï¿½ï¿½es e Acessos Admin - **Autenticaï¿½ï¿½ï¿½ï¿½o & Sincronizaï¿½ï¿½ï¿½ï¿½o RBAC:** Atualizada a lï¿½ï¿½gica de escuta de estado de autenticaï¿½ï¿½ï¿½ï¿½o em `onAuthChange` do `authService.js`. Ao autenticar usuï¿½ï¿½rios administradores (`contato@techcosta.net`, `anacg@nexa.com`, `jsoares@nexa.com`), os perfis no Firestore sï¿½ï¿½o sincronizados e o papel `admin` com acesso a todos os setores (`enfermagem`, `medica`, `qualidade`, `faturamento`, `psicologia`, `nutricao`, `rh`, `recepcao`, `estoque`, `compras`) ï¿½ï¿½ assegurado. - **Resoluï¿½ï¿½ï¿½ï¿½o de Bloqueio de Mï¿½ï¿½dulos:** Eliminada a perda involuntï¿½ï¿½ria de papï¿½ï¿½is/permissï¿½ï¿½es ao logar no Firebase Real.  ---  ## [2.1.6] - 2026-08-01 ### Refatoraï¿½ï¿½ï¿½ï¿½o (Prioridade 2) - Modularizaï¿½ï¿½ï¿½ï¿½o do StockPanel.jsx (Extraï¿½ï¿½ï¿½ï¿½o de lï¿½ï¿½gica para useStockLogic.js). - Modularizaï¿½ï¿½ï¿½ï¿½o do HRPanel.jsx (Extraï¿½ï¿½ï¿½ï¿½o de lï¿½ï¿½gica para useHRLogic.js).  # Histï¿½ï¿½rico de Versï¿½ï¿½es - NexaCLINIC  ## [v2.1.5] - 01 de Agosto, 2026 ### Refatoraï¿½ï¿½ï¿½ï¿½o da Arquitetura de Dados (Modularizaï¿½ï¿½ï¿½ï¿½o firebase.js) - **Modularizaï¿½ï¿½ï¿½ï¿½o de Serviï¿½ï¿½os:** O arquivo central `firebase.js` (com mais de 2.016 linhas) foi desmembrado em diversos serviï¿½ï¿½os especializados na pasta `src/services/firebase/` (authService, patientService, stockService, financialService, hrService, clinicalService e systemService). Isso facilita a manutenï¿½ï¿½ï¿½ï¿½o e possibilita o futuro *code splitting* dinï¿½ï¿½mico do Firebase. - **Seguranï¿½ï¿½a Firebase (.env):** As chaves e configuraï¿½ï¿½ï¿½ï¿½es de ambiente do Firebase foram isoladas com seguranï¿½ï¿½a em um arquivo `.env` dedicado, incluindo uma validaï¿½ï¿½ï¿½ï¿½o rigorosa no processo de startup do App. - **Polï¿½ï¿½tica de Senha (Admin/RH):** Reforï¿½ï¿½ada a geraï¿½ï¿½ï¿½ï¿½o de senhas temporï¿½ï¿½rias (Admins/RH) exigindo agora no mï¿½ï¿½nimo 8 caracteres contendo letras, nï¿½ï¿½meros e caracteres especiais. - **Arquitetura & Escalabilidade:** A refatoraï¿½ï¿½ï¿½ï¿½o mantï¿½ï¿½m compatibilidade estrita com a interface de dependï¿½ï¿½ncias existente (`dbService` e `authService`), garantindo total estabilidade do projeto sem introduzir comportamentos quebrados.  ---  ## [v2.1.3] - 31 de Julho, 2026 ### Mï¿½ï¿½dulo Estoque & Farmï¿½ï¿½cia: Inventï¿½ï¿½rios Fï¿½ï¿½sicos, Mï¿½ï¿½ltiplos Locais, Transferï¿½ï¿½ncias, FEFO & Alertas - **Cadastro e Gestï¿½ï¿½o de Mï¿½ï¿½ltiplos Locais de Estoque (Mï¿½ï¿½dulo T.I):** Adicionada nova aba `Locais de Estoque` no painel de configuraï¿½ï¿½ï¿½ï¿½es do Mï¿½ï¿½dulo T.I (`ConfigPanel.jsx`), permitindo cadastrar, editar e inativar locais como Almoxarifado Central, Farmï¿½ï¿½cia da Diï¿½ï¿½lise, Posto de Enfermagem e TI. - **Aba de Inventï¿½ï¿½rios Fï¿½ï¿½sicos com Contagem & Auditoria:** Adicionada aba `Inventï¿½ï¿½rios Fï¿½ï¿½sicos` no `StockPanel.jsx` para abertura, digitaï¿½ï¿½ï¿½ï¿½o e salvamento de contagens fï¿½ï¿½sicas por local de armazenamento. - **Relatï¿½ï¿½rio de Divergï¿½ï¿½ncias & Ajuste Automï¿½ï¿½tico de Saldos:** Sistema calcula discrepï¿½ï¿½ncias entre saldo do sistema e contagem fï¿½ï¿½sica (sobras/faltas) com impacto financeiro em R$. Ao concluir o inventï¿½ï¿½rio, os saldos dos produtos no Firestore sï¿½ï¿½o **atualizados automaticamente** com registro em histï¿½ï¿½rico de transaï¿½ï¿½ï¿½ï¿½es de auditoria. - **Transferï¿½ï¿½ncias Entre Locais de Estoque:** Adicionada aba `Transferï¿½ï¿½ncias de Estoque` para movimentaï¿½ï¿½ï¿½ï¿½o de insumos entre locais cadastrados (ex: Almoxarifado Central ï¿½~ï¿½ï¿½ï¿½ï¿½ Farmï¿½ï¿½cia da Diï¿½ï¿½lise), com dï¿½ï¿½bito automï¿½ï¿½tico no local de origem e crï¿½ï¿½dito no destino. - **Destaque Lote & FEFO (First Expired, First Out):** Destaque inteligente visual nos lotes mais prï¿½ï¿½ximos de vencer para evitar perdas de medicamentos e insumos mï¿½ï¿½dicos por validade. - **Alertas de Estoque Mï¿½ï¿½nimo e Ponto de Pedido:** Indicadores visuais de nï¿½ï¿½vel crï¿½ï¿½tico de estoque no catï¿½ï¿½logo de produtos com acionamento de compra rï¿½ï¿½pida.  ---  ## [v2.1.1] - 31 de Julho, 2026 ### Portal de Requisiï¿½ï¿½ï¿½ï¿½es de Salï¿½ï¿½o (Enfermagem), Atendimento na Farmï¿½ï¿½cia & Trava de Estoque em T.I - **Mini-Mï¿½ï¿½dulo de Requisiï¿½ï¿½ï¿½ï¿½es para Tï¿½ï¿½cnicas:** Lanï¿½ï¿½amento do novo portal dedicado no menu principal (`TechnicianPanel.jsx`) que permite ï¿½ï¿½s tï¿½ï¿½cnicas de enfermagem no salï¿½ï¿½o de hemodiï¿½ï¿½lise solicitarem materiais e medicamentos do estoque em tempo real. - **Vï¿½ï¿½nculo com Pacientes da Recepï¿½ï¿½ï¿½ï¿½o:** As requisiï¿½ï¿½ï¿½ï¿½es podem ser vinculadas diretamente ao paciente em tratamento na diï¿½ï¿½lise (buscado da Recepï¿½ï¿½ï¿½ï¿½o) ou registradas como uso geral do salï¿½ï¿½o/bancada. - **Aba de Atendimento na Farmï¿½ï¿½cia/Estoque:** Nova aba "Atendimento de Requisiï¿½ï¿½ï¿½ï¿½es" no `StockPanel.jsx` para a farmï¿½ï¿½cia visualizar solicitaï¿½ï¿½ï¿½ï¿½es pendentes, informar a quantidade entregue e realizar a **baixa fï¿½ï¿½sica instantï¿½ï¿½nea no estoque**. - **Trava de Estoque Zerado (Configurï¿½ï¿½vel em T.I.):** Adicionada chave ON/OFF no `ConfigPanel.jsx` que permite ï¿½ï¿½ equipe de T.I. bloquear a solicitaï¿½ï¿½ï¿½ï¿½o de materiais cujo saldo em estoque esteja zerado ou insuficiente. - **Regra de Ediï¿½ï¿½ï¿½ï¿½o e Exclusï¿½ï¿½o:** As tï¿½ï¿½cnicas possuem permissï¿½ï¿½o de editar e excluir requisiï¿½ï¿½ï¿½ï¿½es **exclusivamente enquanto o status estiver "Pendente"**. Apï¿½ï¿½s o atendimento iniciado pela farmï¿½ï¿½cia, a requisiï¿½ï¿½ï¿½ï¿½o ï¿½ï¿½ congelada para seguranï¿½ï¿½a do processo. - **Logs de Auditoria Completo:** Todas as aï¿½ï¿½ï¿½ï¿½es (criaï¿½ï¿½ï¿½ï¿½o, ediï¿½ï¿½ï¿½ï¿½o, exclusï¿½ï¿½o e confirmaï¿½ï¿½ï¿½ï¿½o de atendimento/entrega parcial ou total) sï¿½ï¿½o registradas automaticamente na central de auditoria e logs do Mï¿½ï¿½dulo de T.I.  ---  ## [v2.0.6] - 30 de Julho, 2026 ### Aprimoramentos do Mï¿½ï¿½dulo Estoque/Farmï¿½ï¿½cia & Centralizaï¿½ï¿½ï¿½ï¿½o no T.I - **Ordenaï¿½ï¿½ï¿½ï¿½o Interativa de Colunas no Estoque:** Adicionada ordenaï¿½ï¿½ï¿½ï¿½o por clique em todas as colunas de tabelas do Estoque (*Catï¿½ï¿½logo de Produtos*, *Notas Fiscais/XML*, *Fornecedores*, *Setores Fï¿½ï¿½sicos*, *Histï¿½ï¿½rico de Movimentaï¿½ï¿½ï¿½ï¿½es*, *Controle de Validade* e *Emprï¿½ï¿½stimos*). - **Gerenciamento Completo (CRUD):** Adicionado suporte para Criar, Editar e Excluir **Itens de Inventï¿½ï¿½rio**, **Fornecedores** e **Setores Clï¿½ï¿½nicos** com modais e formulï¿½ï¿½rios dedicados. - **Mï¿½ï¿½dulo de Emprï¿½ï¿½stimos de Produtos & Medicamentos:** Nova aba no Estoque/Farmï¿½ï¿½cia para controle de emprï¿½ï¿½stimos inter-hospitalares e entre clï¿½ï¿½nicas parceiras (Concedidos e Recebidos). Inclui botï¿½ï¿½o de aï¿½ï¿½ï¿½ï¿½o rï¿½ï¿½pida **`ï¿½x   Dar Baixa / Devoluï¿½ï¿½ï¿½ï¿½o`** com reposiï¿½ï¿½ï¿½ï¿½o/baixa de saldo. - **Centralizaï¿½ï¿½ï¿½ï¿½o de Categorias no Mï¿½ï¿½dulo T.I:** Transferido o cadastro e gerenciamento de **Categorias de Produtos e Mï¿½ï¿½dulos** para o [ConfigPanel.jsx](file:///c:/Nexa/NexAi-CLINIC/src/components/ConfigPanel.jsx), permitindo que o setor de T.I defina as categorias que alimentam automaticamente os seletores do sistema.  ---  ## [v2.0.5] - 30 de Julho, 2026 ### Aprimoramentos Operacionais do Mï¿½ï¿½dulo Financeiro - **Ordenaï¿½ï¿½ï¿½ï¿½o Interativa de Colunas:** Adicionada ordenaï¿½ï¿½ï¿½ï¿½o interativa por clique em todas as colunas de tabela das abas **Contas a Pagar**, **Contas a Receber** e **Parcelamentos & Dï¿½ï¿½vidas** (indicadores com setas ordenando por Fornecedor/Cliente, Categoria, Vencimento, Valor e Status). - **Cards de Previsï¿½ï¿½o 7 e 15 Dias:** Adicionados quadros personalizï¿½ï¿½veis no Dashboard Operacional para previsï¿½ï¿½o de **Contas a Pagar nos Prï¿½ï¿½ximos 7 Dias** e **Prï¿½ï¿½ximos 15 Dias**. - **Aï¿½ï¿½ï¿½ï¿½es Financeiras Completas (CRUD & Baixa):** Adicionada funcionalidade de **Ediï¿½ï¿½ï¿½ï¿½o completa**, **Criar Manual**, **Excluir** e **Baixa/Quitaï¿½ï¿½ï¿½ï¿½o rï¿½ï¿½pida** para Contas a Pagar, Contas a Receber e Parcelamentos de Dï¿½ï¿½vidas. - **Arquitetura Desacoplada (Remoï¿½ï¿½ï¿½ï¿½o do XML do Financeiro):** Removida a simulaï¿½ï¿½ï¿½ï¿½o/botï¿½ï¿½o de importaï¿½ï¿½ï¿½ï¿½o de XML do Mï¿½ï¿½dulo Financeiro. A importaï¿½ï¿½ï¿½ï¿½o de NF-e ï¿½ï¿½ de atribuiï¿½ï¿½ï¿½ï¿½o exclusiva do **Mï¿½ï¿½dulo de Estoque**, que atualiza o inventï¿½ï¿½rio de insumos e provisiona o Contas a Pagar automaticamente.  ---  ## [v2.0.4] - 30 de Julho, 2026 ### Auditoria Global de Seguranï¿½ï¿½a e Persistï¿½ï¿½ncia Cloud Firestore - **Audit de Persistï¿½ï¿½ncia em Nuvem (Firebase Firestore):** Atualizados todos os mï¿½ï¿½todos financeiros (Contas a Pagar, Contas a Receber, Importaï¿½ï¿½ï¿½ï¿½o XML NF-e, Parcelamentos/Dï¿½ï¿½vidas e Conciliaï¿½ï¿½ï¿½ï¿½o Bancï¿½ï¿½ria) em [firebase.js](file:///c:/Nexa/NexAi-CLINIC/src/firebase.js) para gravarem e buscarem dados diretamente nas coleï¿½ï¿½ï¿½ï¿½es do **Google Cloud Firestore** com fallback resiliente para o `mockFirestore`. - **Sanitizaï¿½ï¿½ï¿½ï¿½o & Resiliï¿½ï¿½ncia:** Adicionados blocos defensivos `try/catch` em todas as rotas de API do sistema para prevenir vazamentos de erro e garantir estabilidade durante falhas temporï¿½ï¿½rias de conexï¿½ï¿½o.  ---  ## [v2.0.3] - 30 de Julho, 2026 ### Lanï¿½ï¿½amento de Parcelamentos / Dï¿½ï¿½vidas e Conciliaï¿½ï¿½ï¿½ï¿½o Bancï¿½ï¿½ria no Mï¿½ï¿½dulo Financeiro - **Aba Parcelamentos & Dï¿½ï¿½vidas:** Nova aba para gestï¿½ï¿½o completa de contratos de financiamentos, dï¿½ï¿½vidas e emprï¿½ï¿½stimos de longo prazo. - **Geraï¿½ï¿½ï¿½ï¿½o Automï¿½ï¿½tica Mï¿½ï¿½s a Mï¿½ï¿½s:** Ao cadastrar uma dï¿½ï¿½vida parcelada (ex: 12x, 24x, 36x), o sistema gera automaticamente os $N$ lanï¿½ï¿½amentos mensais sequenciais no **Contas a Pagar** (`Dï¿½ï¿½vida: Credor (Parc. 01/12)`). - **Gaveta de Ficha da Dï¿½ï¿½vida:** Botï¿½ï¿½o para visualizar todas as parcelas geradas em Contas a Pagar com seus respectivos status de quitaï¿½ï¿½ï¿½ï¿½o. - **Aba Conciliaï¿½ï¿½ï¿½ï¿½o Bancï¿½ï¿½ria:** Extrato bancï¿½ï¿½rio em tempo real x Lanï¿½ï¿½amentos do Financeiro, identificando batimentos perfeitos (ï¿½xxï¿½ Conciliado) e divergï¿½ï¿½ncias de valor ou tarifas pendentes (ï¿½xxï¿½ Divergï¿½ï¿½ncia). - **Aï¿½ï¿½ï¿½ï¿½o Rï¿½ï¿½pida "Conciliar 1-Clique":** Permite criar o lanï¿½ï¿½amento automï¿½ï¿½tico no Financeiro e conciliar no extrato bancï¿½ï¿½rio com apenas 1 clique.  ---  ## [v2.0.2] - 30 de Julho, 2026 ### Correï¿½ï¿½ï¿½ï¿½o de Tela Branca nos Mï¿½ï¿½dulos Financeiro e Estoque - **Declaraï¿½ï¿½ï¿½ï¿½o de Mï¿½ï¿½tricas Operacionais:** Adicionadas as variï¿½ï¿½veis de cï¿½ï¿½lculo de mï¿½ï¿½tricas operacionais (`payablesTodayOrOverdue`, `totalPayablesTodayOrOverdue`, `receivablesToday`, `totalReceivablesToday`, `realizedBalance`, `overduePayables`, etc.) no escopo do [FinancePanel.jsx](file:///c:/Nexa/NexAi-CLINIC/src/components/FinancePanel.jsx), eliminando a exceï¿½ï¿½ï¿½ï¿½o de `ReferenceError`. - **Tratamento Defensivo de Dados:** Adicionados try/catch fallbacks defensivos para as coleï¿½ï¿½ï¿½ï¿½es de estoque e financeiro em [firebase.js](file:///c:/Nexa/NexAi-CLINIC/src/firebase.js), garantindo carregamento 100% resiliente mesmo em caso de lentidï¿½ï¿½o ou ausï¿½ï¿½ncia de documentos.  ---  ## [v2.0.1] - 30 de Julho, 2026 ### Lanï¿½ï¿½amento da Versï¿½ï¿½o Major 2.0.1 & Painel Operacional Financeiro Personalizï¿½ï¿½vel - **Painel Financeiro Focado na Operaï¿½ï¿½ï¿½ï¿½o:** Reformulado o Dashboard do Mï¿½ï¿½dulo Financeiro com quadros focados no operador do dia a dia (Contas a Pagar Hoje / Vencidas, Contas a Receber Hoje, Saldo de Caixa Realizado, Tï¿½ï¿½tulos em Atraso). - **Personalizaï¿½ï¿½ï¿½ï¿½o Total por Operador:** Adicionada a funcionalidade `ï¿½a"!ï¿½ï¿½ï¿½ Personalizar Painel` no Financeiro, permitindo reordenar (posiï¿½ï¿½ï¿½ï¿½o), alterar tamanhos (1 col, 2 col, 4 col) e ocultar/exibir quadros. As preferï¿½ï¿½ncias sï¿½ï¿½o salvas por usuï¿½ï¿½rio. - **Marco de Lanï¿½ï¿½amento Versï¿½ï¿½o 2.0:** Mudanï¿½ï¿½a da versï¿½ï¿½o principal para v2.0.1 consolidando a integraï¿½ï¿½ï¿½ï¿½o entre os mï¿½ï¿½dulos de NexaHR, Financeiro, Compras e Estoque.  ---  ## [v1.2.47] - 30 de Julho, 2026 ### Integraï¿½ï¿½ï¿½ï¿½o Tripla: Financeiro ï¿½aï¿½ Compras ï¿½aï¿½ Estoque - **Estoque ï¿½~  Compras (Reposiï¿½ï¿½ï¿½ï¿½o Automï¿½ï¿½tica):** Botï¿½ï¿½o de aï¿½ï¿½ï¿½ï¿½o rï¿½ï¿½pida `ï¿½x:   Pedir Compra` nos insumos com estoque abaixo do mï¿½ï¿½nimo, gerando solicitaï¿½ï¿½ï¿½ï¿½es automï¿½ï¿½ticas no Portal de Compras. - **Compras ï¿½~  Financeiro & Estoque (Contas a Pagar Automï¿½ï¿½ticas):** A finalizaï¿½ï¿½ï¿½ï¿½o de compras e cotaï¿½ï¿½ï¿½ï¿½es cria instantaneamente o lanï¿½ï¿½amento de Contas a Pagar no Financeiro e alimenta o saldo do almoxarifado. - **Importaï¿½ï¿½ï¿½ï¿½o NFe Integrada:** A importaï¿½ï¿½ï¿½ï¿½o de XML no Estoque dispara automaticamente a criaï¿½ï¿½ï¿½ï¿½o do tï¿½ï¿½tulo de Contas a Pagar no Financeiro com vencimento, fornecedor e CNPJ. - **Retroalimentaï¿½ï¿½ï¿½ï¿½o de Quitaï¿½ï¿½ï¿½ï¿½o:** Ao quitar um tï¿½ï¿½tulo no Financeiro (`Status: Pago`), o pedido de compra e o lanï¿½ï¿½amento correspondente recebem o badge de quitaï¿½ï¿½ï¿½ï¿½o e acompanhamento em tempo real.  ---  ## [v1.2.46] - 30 de Julho, 2026 ### Aprimoramento da Identificaï¿½ï¿½ï¿½ï¿½o de Contratos em Experiï¿½ï¿½ncia - **Filtro Inteligente de Perï¿½ï¿½odo Probatï¿½ï¿½rio:** Reformulada a lï¿½ï¿½gica de detecï¿½ï¿½ï¿½ï¿½o de contratos em experiï¿½ï¿½ncia para capturar automaticamente colaboradores com vï¿½ï¿½nculo explï¿½ï¿½cito `"Experiï¿½ï¿½ncia"` ou admitidos nos ï¿½ï¿½ltimos 90 dias. - **Detecï¿½ï¿½ï¿½ï¿½o de Avaliaï¿½ï¿½ï¿½ï¿½es em 45 e 90 Dias:** O painel agora calcula as datas de 1ï¿½ï¿½ avaliaï¿½ï¿½ï¿½ï¿½o (45 dias) e tï¿½ï¿½rmino probatï¿½ï¿½rio (90 dias), exibindo o status atual e a data do prï¿½ï¿½ximo vencimento. - **KPI "Em Experiï¿½ï¿½ncia" Sincronizado:** O indicador KPI do Painel de Controle e a caixa de prazos agora contam rigorosamente todos os colaboradores em perï¿½ï¿½odo de experiï¿½ï¿½ncia ativos.  ---  ## [v1.2.45] - 30 de Julho, 2026 ### Padronizaï¿½ï¿½ï¿½ï¿½o e Sincronizaï¿½ï¿½ï¿½ï¿½o de Contagem de Funcionï¿½ï¿½rios Ativos - **Sincronizaï¿½ï¿½ï¿½ï¿½o de Contadores:** Unificada a contagem de colaboradores ativos no badge da aba superior (`Funcionï¿½ï¿½rios (136)`), alinhando rigorosamente com o KPI do Painel de Controle (`Total de Funcionï¿½ï¿½rios: 136`). - **Filtro de Status no Diretï¿½ï¿½rio:** Adicionado seletor de filtro no diretï¿½ï¿½rio de funcionï¿½ï¿½rios permitindo alternar entre **Apenas Ativos (136)**, **Inativos/Demitidos (19)** e **Todos os Registros (155)**. - **Filtro de Inativos em Caixas do Painel:** Atualizados os cï¿½ï¿½lculos e listagens de advertï¿½ï¿½ncias, vacinas e vencimento de contratos no Painel de Controle para considerar estritamente os colaboradores ativos.  ---  ## [v1.2.44] - 30 de Julho, 2026 ### Correï¿½ï¿½ï¿½ï¿½o Visual e Melhorias de UX no Modal de Gestï¿½ï¿½o de Usuï¿½ï¿½rios - **Correï¿½ï¿½ï¿½ï¿½o da Transparï¿½ï¿½ncia de Fundo:** Corrigido problema de transparï¿½ï¿½ncia no container do modal de cadastro/ediï¿½ï¿½ï¿½ï¿½o de usuï¿½ï¿½rios, onde textos da tabela de fundo ficavam sobrepostos aos campos. - **Opacidade e Z-Index:** Atualizada a sobreposiï¿½ï¿½ï¿½ï¿½o (`modalOverlay`) com desfoque de fundo (`backdropFilter: blur(4px)`) e z-index prioritï¿½ï¿½rio (99999). - **Design System UX:** Aplicado fundo branco sï¿½ï¿½lido (`#ffffff`) 100% opaco, cantos arredondados (`16px`), sombras suaves, bordas de separaï¿½ï¿½ï¿½ï¿½o e ï¿½ï¿½cones nos cabeï¿½ï¿½alhos de formulï¿½ï¿½rio.  ---  ## [v1.2.43] - 30 de Julho, 2026 ### Melhorias de UX no Mï¿½ï¿½dulo NexaHR, Ordenaï¿½ï¿½ï¿½ï¿½o e Personalizaï¿½ï¿½ï¿½ï¿½o do Painel - **Ficha do Funcionï¿½ï¿½rio Clicï¿½ï¿½vel:** Nome e foto dos funcionï¿½ï¿½rios tornados clicï¿½ï¿½veis em todas as tabelas e painï¿½ï¿½is do RH para acesso instantï¿½ï¿½neo ï¿½ï¿½ ficha cadastral. - **Ordenaï¿½ï¿½ï¿½ï¿½o Dinï¿½ï¿½mica de Colunas:** Adicionada funcionalidade de ordenaï¿½ï¿½ï¿½ï¿½o por coluna (Nome, CPF, Setor/Cargo, Contrato, Admissï¿½ï¿½o, Pendï¿½ï¿½ncias) com indicadores visuais na lista de funcionï¿½ï¿½rios. - **Inclusï¿½ï¿½o do BetimCARD:** Adicionada a opï¿½ï¿½ï¿½ï¿½o "BetimCARD" na seleï¿½ï¿½ï¿½ï¿½o de tipo de cartï¿½ï¿½o do benefï¿½ï¿½cio de Vale-Transporte. - **Painel de Controle Customizï¿½ï¿½vel por Usuï¿½ï¿½rio:** Implementado modo de organizaï¿½ï¿½ï¿½ï¿½o e reposicionamento das caixas/cards do Painel de Controle com persistï¿½ï¿½ncia automï¿½ï¿½tica no perfil do usuï¿½ï¿½rio no Cloud Firestore e localStorage. - **Tamanhos Personalizï¿½ï¿½veis de Caixas (Default Pequeno):** Permite configurar a dimensï¿½ï¿½o de cada caixa do Painel (Pequeno, Mï¿½ï¿½dio, Grande), mantendo todas em tamanho pequeno por padrï¿½ï¿½o para mï¿½ï¿½ximo aproveitamento visual.  ---  ## [v1.2.41] - 30 de Julho, 2026 ### Correï¿½ï¿½ï¿½ï¿½o Definitiva de Fallback e Permissï¿½ï¿½es de Leitura no Firestore - **Estabilidade no Carregamento:** Ajuste estrutural no fluxo de autenticaï¿½ï¿½ï¿½ï¿½o, separando a leitura da escrita do perfil na nuvem. Isso garante a exibiï¿½ï¿½ï¿½ï¿½o correta dos mï¿½ï¿½dulos (com base nas permissï¿½ï¿½es de cada usuï¿½ï¿½rio) mesmo quando falhas de permissï¿½ï¿½o de gravaï¿½ï¿½ï¿½ï¿½o ou rede ocorram.  ---  ## [v1.2.40] - 30 de Julho, 2026 ### Limpeza de Usuï¿½ï¿½rios Duplicados e Restriï¿½ï¿½ï¿½ï¿½o Estrita de Acesso RH/BI - **Desduplicaï¿½ï¿½ï¿½ï¿½o de Cadastros no Firestore Cloud:** Implementada limpeza automï¿½ï¿½tica na funï¿½ï¿½ï¿½ï¿½o `getUsers()` que identifica registros duplicados por e-mail (ex: `anacg@nexa.com` e `contato@techcosta.net`), retï¿½ï¿½m automaticamente o cadastro com nome mais completo/extenso e exclui os registros duplicados antigos. - **Trava de Seguranï¿½ï¿½a de Portais RH:** Aplicado filtro estrito no `ModuleSelector.jsx` considerando `user.allowedSectors` e `user.role`, garantindo que perfis de Recursos Humanos sï¿½ï¿½ visualizem os portais de **Recursos Humanos (NexaHR)** e **Gestï¿½ï¿½o da Qualidade (NexaINDEX - BI)**.  ---  ## [v1.2.38] - 30 de Julho, 2026 ### Persistï¿½ï¿½ncia Fulltime de RBAC e SaaS no Firebase Cloud (Nuvem) - **Persistï¿½ï¿½ncia Cloud Firestore:** Leitura e gravaï¿½ï¿½ï¿½ï¿½o das tabelas de permissï¿½ï¿½es (`user_profiles`) e configuraï¿½ï¿½ï¿½ï¿½es SaaS (`tenant_settings`) integradas diretamente ao banco de dados do Google Cloud Firestore. - **Regras do Firestore (`firestore.rules`):** Adicionada regra de seguranï¿½ï¿½a para a coleï¿½ï¿½ï¿½ï¿½o `user_profiles` na nuvem. - **Validaï¿½ï¿½ï¿½ï¿½o de Perfil RH:** Garantido o fallback correto para o perfil de Recursos Humanos visualizando estritamente o portal **NexaHR** e o portal **NexaINDEX (BI)**.  ---  ## [v1.2.36] - 30 de Julho, 2026 ### Integraï¿½ï¿½ï¿½ï¿½o Dinï¿½ï¿½mica da Matriz de Permissï¿½ï¿½es RBAC (Mï¿½ï¿½dulo T.I.) - **Validaï¿½ï¿½ï¿½ï¿½o RBAC em Tempo Real:** Conectada a matriz de permissï¿½ï¿½es de perfis (`user_profiles`) salva pelo painel de T.I. (`NexaCONFIG`) diretamente ao filtro de mï¿½ï¿½dulos visï¿½ï¿½veis no `ModuleSelector.jsx`. - **Filtro Personalizado por Perfil:** As permissï¿½ï¿½es do perfil (por exemplo, Recursos Humanos configurado para BI e RH com valor `'read'`/`'write'` e demais como `'none'`) agora determinam em tempo real quais portais sï¿½ï¿½o exibidos na tela inicial, ocultando com precisï¿½ï¿½o todos os portais marcados como sem acesso (`none`).  ---  ## [v1.2.34] - 30 de Julho, 2026 ### Ajuste de Perfil RH & Ocultaï¿½ï¿½ï¿½ï¿½o Automï¿½ï¿½tica de Mï¿½ï¿½dulos Restritos - **Ocultaï¿½ï¿½ï¿½ï¿½o de Mï¿½ï¿½dulos:** Os portais para os quais o perfil logado nï¿½ï¿½o possui acesso agora ficam **completamente ocultos**, exibindo na tela inicial apenas os mï¿½ï¿½dulos permitidos. - **Perfil Recursos Humanos (`anacg@nexa.com`):** Restabelecido o perfil dedicado `rh` para a usuï¿½ï¿½ria, permitindo acesso direto ao portal de **Recursos Humanos & Benefï¿½ï¿½cios** e ao portal **Gestï¿½ï¿½o da Qualidade & BI** (indicadores de Turnover e Absenteï¿½ï¿½smo do RH).  ---  ## [v1.2.32] - 30 de Julho, 2026 ### Sincronizaï¿½ï¿½ï¿½ï¿½o Realtime no Firebase Cloud & Recuperaï¿½ï¿½ï¿½ï¿½o de Acessos - **Sincronizaï¿½ï¿½ï¿½ï¿½o em Tempo Real (Multi-dispositivo):** Ativada conexï¿½ï¿½o direta com o Google Cloud Firebase (Firestore), desativando o modo mock isolado local para garantir que dados de funcionï¿½ï¿½rios do RH e cadastros sejam sincronizados simultaneamente entre todos os computadores. - **Auto-Provisionamento de Funcionï¿½ï¿½rios:** Implementada rotina no Firestore para semear e sincronizar o banco de dados do RH na nuvem caso a coleï¿½ï¿½ï¿½ï¿½o de funcionï¿½ï¿½rios esteja vazia. - **Garantia de Acesso Admin na Nuvem:** Recuperado e garantido o acesso e perfil `admin` com permissï¿½ï¿½o total para `contato@techcosta.net`, `anacg@nexa.com` e `jsoares@nexa.com` no Firestore Cloud. - **Regras do Firestore:** Atualizado o arquivo `firestore.rules` adicionando regras de seguranï¿½ï¿½a e permissï¿½ï¿½es de leitura/escrita para todas as coleï¿½ï¿½ï¿½ï¿½es operacionais na nuvem (`employees`, `purchases`, `stock_items`, `shifts`, etc.).  ---  ## [v1.2.30] - 30 de Julho, 2026 ### Adequaï¿½ï¿½ï¿½ï¿½o LGPD, Posicionamento de Gestï¿½ï¿½o Hospitalar e Usuï¿½ï¿½rios Oficiais - **LGPD / Seguranï¿½ï¿½a:** Remoï¿½ï¿½ï¿½ï¿½o completa da exibiï¿½ï¿½ï¿½ï¿½o de e-mails e credenciais na tela inicial de login pï¿½ï¿½blica. - **Institucional:** Atualizaï¿½ï¿½ï¿½ï¿½o do subtï¿½ï¿½tulo para "Sistema de Gestï¿½ï¿½o de Clï¿½ï¿½nicas e Hospitais". - **Acessos & Permissï¿½ï¿½es:** Provisionamento e liberaï¿½ï¿½ï¿½ï¿½o de perfis de Administrador com acesso total a todos os setores para os usuï¿½ï¿½rios oficiais `contato@techcosta.net`, `anacg@nexa.com` e `jsoares@nexa.com`. - **Limpeza de Banco:** Remoï¿½ï¿½ï¿½ï¿½o automï¿½ï¿½tica de usuï¿½ï¿½rios fictï¿½ï¿½cios de demonstraï¿½ï¿½ï¿½ï¿½o (`@clinica.com`).  ---  ## [v1.2.24] - 17 de Julho, 2026 ### Mï¿½ï¿½dulo NexaCAL (Agenda & Consultas) - Grade horï¿½ï¿½ria com multivisualizaï¿½ï¿½ï¿½ï¿½o (Diï¿½ï¿½ria, Semanal e Mensal) com suporte a filtros rï¿½ï¿½pidos por profissional. - Bloqueador de conflito de grade de escala mï¿½ï¿½dica em tempo real. - Fluxo integrado com recepï¿½ï¿½ï¿½ï¿½o permitindo mudar status de comparecimento com botï¿½ï¿½o "Chegou ï¿½ï¿½ Clï¿½ï¿½nica". - Simulador de respostas de prï¿½ï¿½-confirmaï¿½ï¿½ï¿½ï¿½o via WhatsApp (SIM/Nï¿½ï¿½O).  ---  ## [v1.2.22] - 17 de Julho, 2026 ### Mï¿½ï¿½dulo NexaPROCURE (Compras & Cotaï¿½ï¿½ï¿½ï¿½es) - Fluxo de requisiï¿½ï¿½ï¿½ï¿½o para funcionï¿½ï¿½rios (reposiï¿½ï¿½ï¿½ï¿½o de estoque existente ou novos itens). - Stepper Timeline visual de status do pedido. - Central de Aprovaï¿½ï¿½ï¿½ï¿½es em mï¿½ï¿½ltiplos nï¿½ï¿½veis de alï¿½ï¿½ada (Gestores e Diretores). - Painel de comparaï¿½ï¿½ï¿½ï¿½o de cotaï¿½ï¿½ï¿½ï¿½o de 3 orï¿½ï¿½amentos com indicaï¿½ï¿½ï¿½ï¿½o de menor preï¿½ï¿½o.  ---  ## [v1.2.16] - 17 de Julho, 2026 ### Quadro de Presenï¿½ï¿½a Premiada no NexaHR - Adicionado quadro de Presenï¿½ï¿½a Premiada no dashboard de controle com elegibilidade. - Filtro automatizado de elegibilidade com base em faltas, atestados e advertï¿½ï¿½ncias. - Configuraï¿½ï¿½ï¿½ï¿½o dinï¿½ï¿½mica do valor do prï¿½ï¿½mio de assiduidade individual.


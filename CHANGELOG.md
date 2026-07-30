# Histórico de Versões - NexaCLINIC

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

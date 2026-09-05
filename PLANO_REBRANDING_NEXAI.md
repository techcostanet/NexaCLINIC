# 🚀 Plano Diretor de Rebranding: **Nex-Ai CLINIC**
*(AI-Powered Healthcare Ecosystem)*

Este documento estabelece o planejamento técnico, visual e operacional para a evolução da identidade da plataforma para **Nex-Ai CLINIC**, incorporando a estética prismática de IA e o isolamento de segurança solicitado.

---

## 📌 1. Diretriz de Identidade Visual da Marca

* **Nome Oficial:** `Nex-Ai CLINIC`
* **Conceito:** Ecossistema hospitalar e clínico inteligente, concebido e potencializado por inteligência artificial.
* **Slogan / Assinatura:** *Inteligência Clínica & Gestão Integrada de Saúde*
* **Tipografia e Estilo do `Ai` (Inspiração Antigravity IDE):**
  - O prefixo `Nex-` e o sufixo `CLINIC` utilizam tipografia limpa, sólida e institucional (`#0f172a` / `#1e293b`).
  - O termo **`Ai`** adota o gradiente prismático característico do ícone do **Antigravity IDE**:
    - **Paleta de Cores:** Ciano Elétrico (`#00D2FF` / `#06B6D4`) ➔ Azul Safira (`#3B82F6`) ➔ Violeta Cósmico (`#8B5CF6`) ➔ Fúcsia Neon (`#EC4899`).
    - **Efeito Visual:** `background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 30%, #8b5cf6 65%, #ec4899 100%)`, com máscara de texto (`-webkit-background-clip: text; -webkit-text-fill-color: transparent;`) e filtro suave de drop-shadow para profundidade.
* **Segurança e Foco no Login:**
  - **Remoção do botão de acesso à TV na tela de autenticação (`Login.jsx`)**: o acesso ao painel de TV pública não deve poluir a tela de credenciais, resguardando o ambiente de autenticação dos usuários clínicos e administrativos.

---

## 🧭 2. Nomenclatura Harmonizada dos 15 Módulos

Todos os submódulos da plataforma adotam a taxonomia oficial **`Nex-Ai.<MÓDULO>`**:

| ID Interno | Nome Operacional | Identificador Oficial | Escopo do Módulo |
| :--- | :--- | :--- | :--- |
| `clinical` | Módulo Clínico | **`Nex-Ai.CLINIC`** | Prontuário eletrônico, prescrições de diálise e evoluções |
| `quality` | Qualidade & BI | **`Nex-Ai.INDEX`** | Indicadores hospitalares, metas e qualidade assistencial |
| `assist` | Feed Assistencial | **`Nex-Ai.ASSIST`** | Mural de comunicados, mapa cirúrgico e trocas de escala |
| `medical` | Gestão Médica | **`Nex-Ai.MED`** | Escalas médicas, corpo clínico e fechamento de honorários |
| `requisitions` | Enfermagem & Salão | **`Nex-Ai.CARE`** | Sessões de diálise em tempo real, salão e chamados ágeis |
| `reception` | Recepção & Admissão | **`Nex-Ai.RECEPTION`** | Admissão, controle de presença diária e guias APAC |
| `stock` | Estoque & Farmácia | **`Nex-Ai.STOCK`** | Dispensação de medicamentos, lotes e validade de insumos |
| `maintenance` | Engenharia Clínica | **`Nex-Ai.SERVICE`** | Gestão de ativos biomédicos, calibrações e ordens de serviço |
| `finance` | Módulo Financeiro | **`Nex-Ai.FINANCE`** | Contas a pagar/receber, conciliação e fluxo de caixa |
| `hr` | Recursos Humanos | **`Nex-Ai.HR`** | Gestão de colaboradores, benefícios e controle de faltas/VT |
| `sesmt` | SESMT & Segurança | **`Nex-Ai.SAFE`** | Prevenção de acidentes, checklists de EPI e extintores |
| `apac` | Faturamento SUS | **`Nex-Ai.APAC`** | Regulação de laudos, auditoria de guias e faturamento BPA |
| `calendar` | Agenda & Escalas | **`Nex-Ai.CAL`** | Grade ambulatorial, consultas e marcações |
| `purchasing` | Compras & Cotações | **`Nex-Ai.PROCURE`** | Solicitação de compras, cotações com fornecedores e O.C. |
| `config` | T.I. & Governança | **`Nex-Ai.CONFIG`** | Perfis de acesso RBAC, logs de auditoria e configurações |

---

## 🛠️ 3. Mapeamento Preciso dos Arquivos de Interface (UI)

Quando autorizada a execução, os seguintes arquivos serão atualizados:

| Componente / Arquivo | Ações e Elementos a Atualizar |
| :--- | :--- |
| **`index.html`** | Atualizar `<title>` para `Nex-Ai CLINIC - Sistema de Gestão Hospitalar & Clínico`, meta tags e favicon. |
| **`src/components/Login.jsx`** | Substituir o logo e título para `Nex-Ai CLINIC` com o `Ai` estilizado no gradiente Antigravity IDE; **remover o botão de TV (`/tv`) do rodapé**; atualizar versão. |
| **`src/components/Navbar.jsx`** | Atualizar `tenantSettings` default (`Nex-Ai CLINIC`), atualizar o mapeamento de `portalName` com todos os 15 módulos `Nex-Ai.*` e renderizar o novo branding. |
| **`src/components/ModuleSelector.jsx`** | Atualizar os subtítulos dos 15 cartões de módulos para o padrão `Nex-Ai.*`; atualizar cabeçalho. |
| **`src/App.jsx`** | Atualizar texto de inicialização para *"Carregando Nex-Ai CLINIC..."*. |
| **`src/components/purchasing/SupplierQuotePortal.jsx`** | Atualizar título do portal de cotações para fornecedores externos: *"Portal do Fornecedor — Nex-Ai CLINIC"*. |
| **`src/components/maintenance/MachineTicketPortal.jsx`** | Atualizar título do portal de QR Code de equipamentos: *"Engenharia Clínica — Nex-Ai CLINIC"*. |
| **`src/components/tv/TvCallPanel.jsx`** | Harmonizar a assinatura institucional do painel de chamada de TV. |
| **`src/services/systemService.js`** | Atualizar cabeçalhos de e-mails transacionais (cotações, convites e comunicados). |
| **`src/data/moduleGuidesData.js`** | Atualizar textos e nomes dos módulos nos manuais e documentação do sistema. |
| **`.agents/AGENTS.md`** | Atualizar o nome do projeto no arquivo de regras do repositório. |

---

## 🔒 4. Impacto Zero em Banco de Dados e Lógica Operacional

* **Nomes de Coleções Firestore:** **Inalteradas** (`patients`, `dialysis_schedules`, `clinical_procedures`, `purchasing_quotes`, `users`, etc.).
* **Chaves Internas de Navegação:** **Inalteradas** (`currentModule === 'assist'`, `'medical'`, `'stock'`, etc.).
* **Permissões RBAC e Roles:** **Inalteradas** (`admin`, `professional`, `doctor`, `clinical`, `receptionist`, etc.).
* **Regra de 1 Palavra em UI:** Preservação integral do padrão conciso de rótulos do projeto (`.agents/AGENTS.md`).

---

## 💡 5. Sugestões de Melhoria Identificadas (Opcional - Aguardando sua decisão)

Com base nas melhores práticas de arquitetura e UI/UX de nível enterprise, identificamos as seguintes melhorias para enriquecer ainda mais o rebranding:

1. **Componente Reutilizável de Branding (`src/components/common/NexAiBrand.jsx`):**
   - *Benefício:* Centralizar a renderização do logotipo e do texto `Nex-Ai CLINIC` com o gradiente Antigravity exato. Evita duplicação de estilos CSS inline e garante consistência em qualquer tela (Login, Navbar, Seleção de Módulos, Portais e Telas de Impressão).
2. **Atualização do Favicon SVG (`public/favicon.svg`) com Paleta Antigravity:**
   - *Benefício:* O ícone na aba do navegador passará a exibir o símbolo vetorial geométrico com as cores do Antigravity IDE, conferindo alta resolução mesmo em telas Retina/4K.
3. **Atalho do Painel TV no Módulo de Recepção (`ReceptionPanel.jsx`):**
   - *Benefício:* Como o botão foi removido com sucesso da tela pública de login (tornando-a mais segura e limpa), adicionar um botão discreto `"Painel TV"` no cabeçalho ou barra de ferramentas da Recepção. Isso permite que a secretária abra a TV em um clique sem precisar digitar a URL `/tv` manualmente.
4. **Micro-interação Holográfica no `Ai` (Sutil Glow no Hover):**
   - *Benefício:* Adicionar uma transição CSS refinada com leve efeito de pulsação luminosa (`drop-shadow`) ao passar o mouse sobre o `Ai`, transmitindo uma experiência tecnológica moderna e diferenciada sem impactar o desempenho.
5. **Badges Estilizadas nos Cartões do `ModuleSelector`:**
   - *Benefício:* Exibir o identificador `Nex-Ai.*` no topo de cada card em formato de badge moderna translúcida com a cor temática do módulo, facilitando a identificação rápida do usuário.

---

*Aguardando aprovação das diretrizes e das sugestões para iniciar a execução.*

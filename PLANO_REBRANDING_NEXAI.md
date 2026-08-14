# 🚀 Plano Estratégico de Rebranding: Transição para **NexAi**

Este documento detalha o planejamento completo para a evolução da identidade visual e nomenclatura do sistema para **NexAi** (*AI-Powered Healthcare Ecosystem*).

---

## 📌 1. Visão Geral da Nova Identidade

* **Nome Principal:** `NexAi`
* **Conceito:** Plataforma hospitalar e clínica integrada, concebida e potencializada por inteligência artificial.
* **Assinatura / Slogan:** *Inteligência Clínica & Gestão Integrada de Saúde*
* **Nomenclatura Harmonizada dos Módulos:**
  - **NexAi.CLINIC** – Assistencial, Prescrição & Prontuário Eletrônico
  - **NexAi.INDEX** – BI, Indicadores Hospitalares & Qualidade
  - **NexAi.HR** – Recursos Humanos, Pessoal & Benefícios
  - **NexAi.SAFE** – SESMT, Segurança do Trabalho & Prevenção
  - **NexAi.STOCK** – Farmácia Clínica, Insumos & Almoxarifado
  - **NexAi.SERVICE** – Engenharia Clínica, Manutenção & O.S.
  - **NexAi.FINANCE** – Gestão Financeira, Contas & Fluxo de Caixa
  - **NexAi.APAC** – Faturamento SUS, Convênios & Auditoria
  - **NexAi.CAL** – Agendamento & Gestão de Escalas
  - **NexAi.PROCURE** – Compras, Suprimentos & Cotações
  - **NexAi.REQ** – Requisições Ágeis de Salão de Diálise
  - **NexAi.CONFIG** – T.I., Governança & Segurança RBAC

---

## 🛠️ 2. Mapeamento dos Arquivos de Interface (UI)

Quando for aprovada a execução, os seguintes pontos serão atualizados:

| Componente / Arquivo | Elementos a Atualizar |
| :--- | :--- |
| **`index.html`** | `<title>NexAi - Sistema de Gestão Clínica</title>`, meta tags e favicon |
| **`src/components/Navbar.jsx`** | Logo textual/ícone da barra superior e rodapé |
| **`src/components/LoginModal.jsx`** / **`App.jsx`** | Título de boas-vindas, branding da tela de autenticação |
| **`src/components/ModuleSelector.jsx`** | Subtítulos dos cartões de módulos (`NexAi.CLINIC`, `NexAi.HR`, etc.) |
| **`src/components/ConfigPanel.jsx`** | Branding de parâmetros do sistema de T.I. |
| **Serviços de Exportação de PDF** | Cabeçalho oficial de relatórios técnicos e atas (`src/services/` e componentes) |

---

## 🌐 3. Estratégia de Hospedagem e Domínio (URLs)

### Opção A: Domínio Próprio Personalizado (Recomendado)
- **Exemplos de Domínio:** `nexai.com.br`, `nexai.med.br`, `app.nexai.clinic` ou `nexai.net.br`.
- **Como configurar no Firebase:**
  1. Acessar Firebase Console ➔ Hosting ➔ *Adicionar domínio personalizado*.
  2. Inserir o domínio desejado e adicionar os 2 registros DNS (tipo `A` ou `CNAME`) no provedor do domínio (ex: Registro.br, Hostinger, Cloudflare).
  3. O Firebase emite o certificado SSL (HTTPS) automaticamente em poucos minutos.

### Opção B: Subdomínio no Firebase Hosting
- Adicionar um novo target/site no Firebase Console vinculado ao projeto atual (ex: `nexai-clinic.web.app` ou `nexai-app.web.app`), mantendo o redirecionamento ou substituição do atual `nexa-index.web.app`.

---

## 🔒 4. Impacto Operacional e de Dados

- **Impacto em Dados e Lógica:** **ZERO**.
- **Continuidade:** Todas as contas de usuários, histórico de manutenções, prontuários, registros de SESMT, estoque e indicadores permanecem intactos no Cloud Firestore.

---

*Documento salvo e pronto para execução sob demanda do gestor do projeto.*

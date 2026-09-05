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

ï¿½ï¿½# #   [ v 3 . 3 . 1 4 ]   -   0 8   d e   A g o s t o ,   2 0 2 6 
 # # #   C o r r e ï¿½ ï¿½ o   P r i o r i d a d e   R B A C   v s   P e r m i s s ï¿½ e s   L e g a d a s 
 -   * * R B A C : * *   M a t r i z   d e   p e r m i s s ï¿½ e s   d i n ï¿½ m i c a s   d o   C o n f i g P a n e l   a g o r a   s o b r e p ï¿½ e   o   s i s t e m a   a n t i g o   ( a l l o w e d S e c t o r s ) ,   r e s o l v e n d o   p r o b l e m a   e m   q u e   m ï¿½ d u l o s   c o n f i g u r a d o s   n a   E q u i p e   M u l t i p r o f i s s i o n a l   n ï¿½ o   a p a r e c i a m . 
 
 - - - 
 
 # #   [ v 3 . 3 . 1 3 ]   -   0 8   d e   A g o s t o ,   2 0 2 6   # # #   A j u s t e   C r ï¿½ t i c o   d e   A u t e n t i c a ï¿½ ï¿½ o   e   P e r f i l   -   * * A u t e n t i c a ï¿½ ï¿½ o : * *   R e d e f i n i ï¿½ ï¿½ o   f o r ï¿½ a d a   d e   s e n h a   p a r a   u s u ï¿½ r i o   e s p e c ï¿½ f i c o   d i r e t a m e n t e   n o   F i r e b a s e   A u t h   e   F i r e s t o r e .   -   * * S i n c r o n i z a ï¿½ ï¿½ o : * *   C o r r e ï¿½ ï¿½ o   n o   r e t o r n o   d o   o b j e t o   d e   u s u ï¿½ r i o   n o   L o g i n   p a r a   g a r a n t i r   c a r r e g a m e n t o   i m e d i a t o   d o   p e r f i l   ( m ï¿½ d u l o s   e   n o m e ) .     - - -     # #   [ v 3 . 3 . 9 ]   -   0 8   d e   A g o s t o ,   2 0 2 6   # # #   S i n c r o n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   e   F a l l b a c k   d e   S e n h a s   d e   L o g i n   M u l t i - D i s p o s i t i v o   -   * * F a l l b a c k   I n t e l i g e n t e   ( l o c a l S t o r a g e ) : * *   I m p l e m e n t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   p e r s i s t ï¿½ ï¿½ n c i a   l o c a l   d a   s e s s ï¿½ ï¿½ o   q u a n d o   a   a u t e n t i c a ï¿½ ï¿½ ï¿½ ï¿½ o   n a t i v a   d o   F i r e b a s e   f a l h a   p o r   d e s s i n c r o n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   s e n h a   ( e x :   s e n h a s   t e m p o r ï¿½ ï¿½ r i a s   o u   a t u a l i z a ï¿½ ï¿½ ï¿½ ï¿½ e s   m a n u a i s   n o   p a i n e l   T . I ) .   -   * * A u t o - H e a l i n g   d e   C r e d e n c i a i s : * *   O   s i s t e m a   a g o r a   t e n t a   a t i v a m e n t e   r e c o n e c t a r   c o m   s e n h a s   p a d r ï¿½ ï¿½ e s   a n t i g a s   n o s   b a s t i d o r e s   e ,   s e   b e m - s u c e d i d o ,   s i n c r o n i z a   e   a t u a l i z a   a u t o m a t i c a m e n t e   a   c o n t a   n o   F i r e b a s e   A u t h   c o m   a   n o v a   s e n h a   c u s t o m i z a d a   g r a v a d a   n a   n u v e m .     - - -     # #   [ v 3 . 3 . 7 ]   -   0 8   d e   A g o s t o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   D e f i n i t i v a :   G r a v a ï¿½ ï¿½ ï¿½ ï¿½ o   e   V a l i d a ï¿½ ï¿½ ï¿½ ï¿½ o   R e s i l i e n t e   p o r   E - m a i l / U I D   n o   F i r e s t o r e   -   * * G r a v a ï¿½ ï¿½ ï¿½ ï¿½ o   R e s i l i e n t e   n o   C l o u d   F i r e s t o r e : * *   A   f u n ï¿½ ï¿½ ï¿½ ï¿½ o   ` u p d a t e U s e r P a s s w o r d `   a g o r a   l o c a l i z a   o   r e g i s t r o   d o   u s u ï¿½ ï¿½ r i o   p o r   ` e m a i l `   o u   ` u i d ` ,   e s c r e v e n d o   o   c a m p o   ` p a s s w o r d `   c o m   a   i n s t r u ï¿½ ï¿½ ï¿½ ï¿½ o   ` {   m e r g e :   t r u e   } ` .   -   * * V a l i d a ï¿½ ï¿½ ï¿½ ï¿½ o   I m e d i a t a   e n t r e   N a v e g a d o r e s : * *   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d o   p r o b l e m a   o n d e   a   s e n h a   t e m p o r ï¿½ ï¿½ r i a / n o v a   g e r a d a   n o   N a v e g a d o r   1   n ï¿½ ï¿½ o   a f e t a v a   a   c o n t a   n o   N a v e g a d o r   2   d e v i d o   a   d i v e r g ï¿½ ï¿½ n c i a s   e n t r e   a   c h a v e   I D   i n t e r n a   e   a   c h a v e   d o   e - m a i l   d e   l o g i n .     - - -     # #   [ v 3 . 0 . 1 4 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   F a l l b a c k   I n t e l i g e n t e   d e   S e n h a   n o   L o g i n   ( d a l i a m @ n e x a . c o m )   -   * * F l e x i b i l i d a d e   d e   L o g i n : * *   A d i c i o n a d a   r o t i n a   d e   a u t e n t i c a ï¿½ ï¿½ ï¿½ ï¿½ o   c o m   f a l l b a c k   i n t e l i g e n t e   n o   l o g i n   p a r a   s i n c r o n i z a r   c o n t a s   d e   o p e r a d o r e s   p r e d e f i n i d o s   ( ` d a l i a m @ n e x a . c o m ` )   i n d e p e n d e n t e   d o   p a d r ï¿½ ï¿½ o   d a   s e n h a   g e r a d a   n a   t e n t a t i v a   a n t e r i o r   ( ` d a l i a 1 2 3 ` ,   ` D a l i a m 1 2 3 4 ! ` ,   ` d a l i a m 1 2 3 ` ) .     - - -     # #   [ v 3 . 0 . 1 3 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   A j u s t e   d e   P a d r ï¿½ ï¿½ o   d e   S e n h a   d o   U s u ï¿½ ï¿½ r i o   d a l i a m @ n e x a . c o m   -   * * S e n h a   P a d r ï¿½ ï¿½ o   C o n f i g u r a d a : * *   A j u s t a d a   a   c r e d e n c i a l   d e   a c e s s o   d o   u s u ï¿½ ï¿½ r i o   ` d a l i a m @ n e x a . c o m `   p a r a   a   s e n h a   ` d a l i a 1 2 3 ` .     - - -     # #   [ v 3 . 0 . 1 2 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   R e s i l i ï¿½ ï¿½ n c i a   n o   C a d a s t r o   d e   U s u ï¿½ ï¿½ r i o s   ( T r a t a m e n t o   d e   E - m a i l   E x i s t e n t e )   -   * * T r a t a m e n t o   ` a u t h / e m a i l - a l r e a d y - i n - u s e ` : * *   T r a t a m e n t o   i n t e l i g e n t e   p a r a   l o g i n s   q u e   j ï¿½ ï¿½   p o s s u e m   c a d a s t r o   d e   a u t e n t i c a ï¿½ ï¿½ ï¿½ ï¿½ o   n o   F i r e b a s e   ( p o r   e x e m p l o ,   c r i a d o s   e m   t e n t a t i v a s   a n t e r i o r e s ) .   O   s i s t e m a   a g o r a   s i n c r o n i z a   e   v i n c u l a   o   d o c u m e n t o   n o   F i r e s t o r e   s e m   b l o q u e a r   o   o p e r a d o r   c o m   e r r o   b r u t o .   -   * * M e n s a g e m   A m i g ï¿½ ï¿½ v e l : * *   N o t i f i c a ï¿½ ï¿½ ï¿½ ï¿½ o   c l a r a   e   e x p l i c a t i v a   n o   m o d a l   d e   c a d a s t r o   a o   r e - v i n c u l a r   u m   e - m a i l   e x i s t e n t e   n o   s i s t e m a .     - - -     # #   [ v 3 . 0 . 1 1 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   n o   C a d a s t r o   d e   U s u ï¿½ ï¿½ r i o s   ( F i r e b a s e   C o n f i g )   -   * * C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   A u t e n t i c a ï¿½ ï¿½ ï¿½ ï¿½ o : * *   E x p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   e   i m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   o b j e t o   ` f i r e b a s e C o n f i g `   e m   ` a u t h S e r v i c e . j s `   e   ` c o n f i g . t s ` ,   r e s o l v e n d o   o   e r r o   ` R e f e r e n c e E r r o r :   f i r e b a s e C o n f i g   i s   n o t   d e f i n e d `   a o   t e n t a r   c a d a s t r a r   n o v o s   u s u ï¿½ ï¿½ r i o s .   -   * * V a l i d a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   C r e d e n c i a i s : * *   A d i c i o n a d a   v e r i f i c a ï¿½ ï¿½ ï¿½ ï¿½ o   p r e v e n t i v a   p a r a   g a r a n t i r   a   c o r r e t a   i n i c i a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d a s   i n s t ï¿½ ï¿½ n c i a s   s e c u n d ï¿½ ï¿½ r i a s   d o   F i r e b a s e   A u t h .     - - -     # #   [ v 3 . 0 . 1 0 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   M ï¿½ ï¿½ d u l o   d e   T . I .   -   M a t r i z   R B A C   C o m p l e t a   ( 1 1   M ï¿½ ï¿½ d u l o s )   -   * * M a t r i z   d e   P e r m i s s ï¿½ ï¿½ e s   R B A C   ( N e x a C O N F I G ) : * *   A t u a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d a   m a t r i z   d e   c o n t r o l e   d e   a c e s s o s   p o r   p e r f i l   p a r a   e n g l o b a r   t o d o s   o s   1 1   m ï¿½ ï¿½ d u l o s   d o   s i s t e m a .   -   * * M ï¿½ ï¿½ d u l o s   A d i c i o n a d o s   ï¿½ ï¿½   M a t r i z : * *   I n c l u s ï¿½ ï¿½ o   d a s   c o l u n a s   d e   p e r m i s s ï¿½ ï¿½ o   p a r a   * * A g e n d a   &   C o n s u l t a s * *   ( ` c a l e n d a r ` ) ,   * * C o m p r a s   &   C o t a ï¿½ ï¿½ ï¿½ ï¿½ e s * *   ( ` p u r c h a s i n g ` )   e   * * A P A C s   &   F a t u r a m e n t o * *   ( ` a p a c ` ) .     - - -     # #   [ v 3 . 0 . 9 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   I m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   ï¿½ ï¿½ c o n e   n a   A b a   D R E   G e r e n c i a l   -   * * C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   E r r o   d e   E x e c u ï¿½ ï¿½ ï¿½ ï¿½ o   ( R e f e r e n c e E r r o r ) : * *   A d i c i o n a d a   a   i m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   c o m p o n e n t e   ` A c t i v i t y `   d a   b i b l i o t e c a   ` l u c i d e - r e a c t `   e m   ` F i n a n c e P a n e l . j s x ` ,   c o r r i g i n d o   a   f a l h a   a o   r e n d e r i z a r   a   a b a   d e   D R E   G e r e n c i a l .     - - -     # #   [ v 3 . 0 . 8 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   M ï¿½ ï¿½ d u l o   F i n a n c e i r o   ( P a r t e   3 )   -   A m p l i a ï¿½ ï¿½ ï¿½ ï¿½ o   C a d a s t r a l   e   D R E   G e r e n c i a l   -   * * ï¿½ x `  D R E   G e r e n c i a l : * *   N o v a   a b a   c o m   d e m o n s t r a ï¿½ ï¿½ ï¿½ ï¿½ o   f i n a n c e i r a   c o m p l e t a :   R e c e i t a   B r u t a ,   I m p o s t o s   ( I S S / P I S / C O F I N S   ~ 6 % ) ,   R e c e i t a   L ï¿½ ï¿½ q u i d a ,   C u s t o s   V a r i ï¿½ ï¿½ v e i s   ( I n s u m o s / M e d i c a m e n t o s ) ,   M a r g e m   d e   C o n t r i b u i ï¿½ ï¿½ ï¿½ ï¿½ o   % ,   C u s t o s   F i x o s   ( F o l h a / A l u g u e l ) ,   E B I T D A   %   e   L u c r o   L ï¿½ ï¿½ q u i d o .   -   * * ï¿½ x ï¿½   A m p l i a ï¿½ ï¿½ ï¿½ ï¿½ o   C a d a s t r a l : * *   I n c l u s ï¿½ ï¿½ o   d e   n o v o s   c a m p o s   n o s   m o d a i s   e   l a n ï¿½ ï¿½ a m e n t o s   d e   P a g a r   e   R e c e b e r :   F o r m a   d e   P a g a m e n t o   ( P I X ,   B o l e t o ,   C a r t ï¿½ ï¿½ e s ,   T E D ,   D i n h e i r o ) ,   B a n c o / C o n t a   D e s t i n o   e   C l a s s i f i c a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   N a t u r e z a   ( C u s t o   F i x o   R e c o r r e n t e   v s   C u s t o   V a r i ï¿½ ï¿½ v e l ) .   -   * * ï¿½ xï¿½ ï¿½ ï¿½ ï¿½ ï¿½   B a d g e s   V i s u a i s : * *   E x i b i ï¿½ ï¿½ ï¿½ ï¿½ o   d e s t a c a d a   d o   m e i o   d e   p a g a m e n t o   e   n ï¿½ ï¿½ m e r o   d o   d o c u m e n t o   n a s   t a b e l a s   d e   l a n ï¿½ ï¿½ a m e n t o s .     - - -     # #   [ v 3 . 0 . 7 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   M ï¿½ ï¿½ d u l o   F i n a n c e i r o   ( P a r t e   2 )   -   A u t o - o r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   D i n ï¿½ ï¿½ m i c a   e m   T o d a s   a s   T a b e l a s   -   * * O r ï¿½ ï¿½ a m e n t o   X   R e a l i z a d o : * *   A d i c i o n a d a   o r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   a o   c l i c a r   n o   c a b e ï¿½ ï¿½ a l h o   d e   t o d a s   a s   c o l u n a s   ( C ï¿½ ï¿½ d i g o / C e n t r o   d e   C u s t o ,   C a t e g o r i a   P a i ,   O r ï¿½ ï¿½ a d o ,   P a g o ,   D e v i d o ,   D e s v i o   R $ ,   E x e c u ï¿½ ï¿½ ï¿½ ï¿½ o   %   e   S t a t u s   V a r i ï¿½ ï¿½ n c i a ) .   -   * * A c o r d o s   &   R e n e g o c i a ï¿½ ï¿½ ï¿½ ï¿½ e s : * *   A d i c i o n a d a   o r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   i n t e r a t i v a   p o r   F o r n e c e d o r ,   F i l i a l ,   T o t a l   R e n e g o c i a d o ,   N ï¿½ ï¿½   P a r c e l a s ,   V a l o r   P a r c e l a ,   P r o g r e s s o   e   S t a t u s .   -   * * C o n c i l i a ï¿½ ï¿½ ï¿½ ï¿½ o   B a n c ï¿½ ï¿½ r i a : * *   E x t r a t o   b a n c ï¿½ ï¿½ r i o   a g o r a   p e r m i t e   o r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   p o r   D a t a ,   B a n c o ,   D e s c r i ï¿½ ï¿½ ï¿½ ï¿½ o ,   T i p o   ( C r ï¿½ ï¿½ d i t o / D ï¿½ ï¿½ b i t o ) ,   V a l o r   e   S t a t u s .   -   * * P r o j e ï¿½ ï¿½ ï¿½ ï¿½ o   S a l d o   F l u x o : * *   T a b e l a   d e   l i q u i d e z   t e m p o r a l   c o m   o r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   p o r   M ï¿½ ï¿½ s ,   D e v i d o ,   P a g o ,   S a l d o   d o   M ï¿½ ï¿½ s   e   S a l d o   F l u x o   A c u m u l a d o .     - - -     # #   [ v 3 . 0 . 6 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   M ï¿½ ï¿½ d u l o   F i n a n c e i r o   ( P a r t e   1 )   -   B o t ï¿½ ï¿½ e s   d e   A ï¿½ ï¿½ ï¿½ ï¿½ o   e   G e s t ï¿½ ï¿½ o   C o m p l e t a   -   * * O r ï¿½ ï¿½ a m e n t o   X   R e a l i z a d o : * *   A d i c i o n a d o s   b o t ï¿½ ï¿½ e s   d e   E d i ï¿½ ï¿½ ï¿½ ï¿½ o   e   E x c l u s ï¿½ ï¿½ o   p a r a   m e t a s   o r ï¿½ ï¿½ a m e n t ï¿½ ï¿½ r i a s   n a   m a t r i z   p o r   C e n t r o   d e   C u s t o s .   -   * * A c o r d o s   &   R e n e g o c i a ï¿½ ï¿½ ï¿½ ï¿½ e s : * *   A d i c i o n a d a s   o p ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   E d i ï¿½ ï¿½ ï¿½ ï¿½ o   e   E x c l u s ï¿½ ï¿½ o   p a r a   c o n t r a t o s   d e   a c o r d o s   c o m   f o r n e c e d o r e s .   -   * * P r o j e ï¿½ ï¿½ ï¿½ ï¿½ o   S a l d o   F l u x o : * *   C r i a d o   b o t ï¿½ ï¿½ o   e   m o d a l   d e   " A j u s t e   d e   S a l d o   I n i c i a l   d e   C a i x a "   c o m   g r a v a ï¿½ ï¿½ ï¿½ ï¿½ o   p e r s i s t e n t e   p a r a   a   l i q u i d e z   t e m p o r a l .   -   * * C o n c i l i a ï¿½ ï¿½ ï¿½ ï¿½ o   B a n c ï¿½ ï¿½ r i a : * *   A d i c i o n a d a s   o p ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   " N o v o   L a n ï¿½ ï¿½ a m e n t o   M a n u a l   n o   E x t r a t o " ,   E x c l u s ï¿½ ï¿½ o   d e   i t e n s   d o   e x t r a t o   e   a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   " D e s f a z e r   C o n c i l i a ï¿½ ï¿½ ï¿½ ï¿½ o " .     - - -     # #   [ v 3 . 0 . 5 ]   -   0 6   d e   A g o s t o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   F u s o   H o r ï¿½ ï¿½ r i o   n a s   D a t a s   d e   N a s c i m e n t o   d o s   D e p e n d e n t e s   ( R H )   -   * * C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   n o   M ï¿½ ï¿½ d u l o   R H   ( E x i b i ï¿½ ï¿½ ï¿½ ï¿½ o   d e   D a t a s ) : * *   I m p l e m e n t a ï¿½ ï¿½ ï¿½ ï¿½ o   d a   f u n ï¿½ ï¿½ ï¿½ ï¿½ o   ` f o r m a t D a t e B R `   p a r a   f o r m a t a r   d a t a s   n o   f o r m a t o   ` Y Y Y Y - M M - D D `   d i r e t a m e n t e   s e m   c o n v e r s ï¿½ ï¿½ o   U T C ,   e l i m i n a n d o   o   e r r o   q u e   e x i b i a   d a t a s   d e   n a s c i m e n t o   d e   d e p e n d e n t e s   c o m   1   d i a   a   m e n o s   ( f u s o   h o r ï¿½ ï¿½ r i o   B R T   U T C - 3 ) .   -   * * A d e q u a ï¿½ ï¿½ ï¿½ ï¿½ o   G e r a l   n o   R H : * *   A t u a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d a s   l i s t a g e n s   d e   d e p e n d e n t e s ,   a d v e r t ï¿½ ï¿½ n c i a s ,   a u s ï¿½ ï¿½ n c i a s ,   v a c i n a s ,   d o c u m e n t o s   e   c o n t r a t o s   e m   e x p e r i ï¿½ ï¿½ n c i a   p a r a   u s o   d a   f o r m a t a ï¿½ ï¿½ ï¿½ ï¿½ o   s e g u r a   d e   d a t a s .   -   * * I n t e g r i d a d e   d o s   D a d o s : * *   C o n f i r m a d a   a   i n t e g r i d a d e   d e   t o d o s   o s   r e g i s t r o s   a r m a z e n a d o s   n o   F i r e s t o r e   C l o u d   p a r a   G e i s i a n e   M o r a i s ,   M i r e l l i   B i s p o ,   M o i s e s   d a   S i l v a   e   S h a y a n n e   C r i s t i n e .     - - -     # #   [ v 3 . 0 . 2 ]   -   0 5   d e   A g o s t o ,   2 0 2 6   # # #   A j u s t e   d e   I n t e r f a c e   &   S i m p l i f i c a ï¿½ ï¿½ ï¿½ ï¿½ o   M u l t i - T e n a n t   -   * * R e m o ï¿½ ï¿½ ï¿½ ï¿½ o   d a   B a r r a   S u p e r i o r   d e   U n i d a d e   e   I m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o : * *   R e m o v i d a   a   b a r r a   d e   s e l e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   f i l i a l   e   b o t ï¿½ ï¿½ o   d e   i m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   a   p e d i d o   d a   g e s t ï¿½ ï¿½ o ,   a l i n h a n d o   a   a r q u i t e t u r a   p a r a   t r a t a m e n t o   v i a   M u l t i - T e n a n t .   -   * * L i m p e z a   V i s u a l   e   A j u s t e   d e   U X : * *   C a b e ï¿½ ï¿½ a l h o   d o   m ï¿½ ï¿½ d u l o   f i n a n c e i r o   r e o r g a n i z a d o   c o m   a b a s   d e   n a v e g a ï¿½ ï¿½ ï¿½ ï¿½ o   a l i n h a d a s   e   l i m p a s   n o   t o p o .     - - -     # #   [ v 3 . 0 . 1 ]   -   0 5   d e   A g o s t o ,   2 0 2 6   # # #   ï¿½ xaï¿½   M A R C O   M A J O R :   L a n ï¿½ ï¿½ a m e n t o   d o s   M ï¿½ ï¿½ d u l o s   N e x a B U D G E T ,   C e n t r o   d e   C u s t o s   &   I n t e g r a ï¿½ ï¿½ ï¿½ ï¿½ o   C o m p l e t a   -   * * S a l t o   d e   V e r s ï¿½ ï¿½ o   M a j o r   ( v 3 . 0 . 1 ) : * *   V e r s ï¿½ ï¿½ o   o f i c i a l   d e   l a n ï¿½ ï¿½ a m e n t o   d o s   n o v o s   m ï¿½ ï¿½ d u l o s   d e   * * O r ï¿½ ï¿½ a m e n t o   X   R e a l i z a d o * * ,   * * C e n t r o   d e   C u s t o s * * ,   * * P r o j e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   S a l d o   F l u x o * *   e   * * G e s t ï¿½ ï¿½ o   d e   A c o r d o s / R e n e g o c i a ï¿½ ï¿½ ï¿½ ï¿½ e s * * .   -   * * P r e e n c h i m e n t o   T o t a l   d o s   D a d o s   d e   B e t i m   ( 2 0 2 6 ) : * *   S i n c r o n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   c o m p l e t a   d e   t o d o s   o s   3 2   l a n ï¿½ ï¿½ a m e n t o s   d a   p l a n i l h a   e m   t o d a s   a s   v i s ï¿½ ï¿½ e s   d o   s i s t e m a   ( C o n t a s   a   P a g a r ,   M a t r i z   O r ï¿½ ï¿½ a m e n t ï¿½ ï¿½ r i a   p o r   C e n t r o   d e   C u s t o s ,   S a l d o   F l u x o   T e m p o r a l   e   A c o r d o s ) .   -   * * M a t r i z   O r ï¿½ ï¿½ a m e n t o   X   R e a l i z a d o : * *   A c o m p a n h a m e n t o   d i n ï¿½ ï¿½ m i c o   d e   m e t a s   v s   g a s t o s   e x e c u t a d o s   e m   1 2   C e n t r o s   d e   C u s t o   ( I n s u m o s   D i a l ï¿½ ï¿½ t i c o s ,   E q u i p a m e n t o s ,   U t i l i t ï¿½ ï¿½ r i o s ,   R H / F o l h a ,   T r i b u t o s   T r a b a l h i s t a s ,   J u r ï¿½ ï¿½ d i c o )   c o m   a l e r t a s   v i s u a i s   d e   v a r i ï¿½ ï¿½ n c i a   ( ï¿½ xxï¿½   D e n t r o   d a   M e t a   |   ï¿½ xxï¿½   A t e n ï¿½ ï¿½ ï¿½ ï¿½ o   |   ï¿½ x ï¿½   E s t o u r o   C r ï¿½ ï¿½ t i c o ) .   -   * * P r o j e ï¿½ ï¿½ ï¿½ ï¿½ o   E x e c u t i v a   d e   S a l d o   F l u x o : * *   T a b e l a   e   c u r v a   d e   l i q u i d e z   a c u m u l a d a   ( J u n h o / 2 5   a   A g o s t o / 2 6 )   c o m   d i a g n ï¿½ ï¿½ s t i c o   d o   r o m b o   a c u m u l a d o   d e   - R $   1 . 8 9 9 . 9 7 9 , 3 4   e m   B e t i m   e   b o t ï¿½ ï¿½ o   d e   s i m u l a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   b a i x a s .   -   * * A c o r d o s   &   R e n e g o c i a ï¿½ ï¿½ ï¿½ ï¿½ e s : * *   C o n t r o l e   c e n t r a l i z a d o   d e   p a r c e l a m e n t o s   l o n g o s   ( e x :   L a c e r d a   A l i m e n t a ï¿½ ï¿½ ï¿½ ï¿½ o ,   F a r m a r i n ) .   -   * * I n t e g r a ï¿½ ï¿½ ï¿½ ï¿½ o   T o t a l   c o m   M ï¿½ ï¿½ d u l o   d e   C o m p r a s : * *   O r d e n s   d e   c o m p r a   a p r o v a d a s   v i n c u l a m   a u t o m a t i c a m e n t e   a   F i l i a l   B e t i m   e   o   C e n t r o   d e   C u s t o s   1 . 1   d e   I n s u m o s   D i a l ï¿½ ï¿½ t i c o s .     - - -     # #   [ v 2 . 1 . 3 9 ]   -   0 3   d e   A g o s t o ,   2 0 2 6   # # #   S o l u ï¿½ ï¿½ ï¿½ ï¿½ o   D e f i n i t i v a   p a r a   T e l a   B r a n c a   n o   E s t o q u e   ( P r e v e n ï¿½ ï¿½ ï¿½ ï¿½ o   d e   D a d o s   C o r r o m p i d o s )   -   * * C o m p o n e n t e   S t o c k P a n e l   &   u s e S t o c k L o g i c : * *   I m p l e m e n t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   _ O p t i o n a l   C h a i n i n g _   ( ` ? . ` )   e m   t o d a s   a s   l ï¿½ ï¿½ g i c a s   d e   m a p e a m e n t o   e   f i l t r a g e m   d e   a r r a y s   ( r e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ e s ,   i n v e n t ï¿½ ï¿½ r i o s ,   l o t e s ,   e t c ) .   -   * * T r a t a m e n t o   d e   D a d o s : * *   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d o   a l g o r i t m o   d e   o r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   p a r a   i m p e d i r   e x c e ï¿½ ï¿½ ï¿½ ï¿½ e s   a o   a c e s s a r   c h a v e s   d e   d a d o s   n u l o s   o u   d e l e t a d o s   d o   F i r e b a s e ,   e v i t a n d o   c r a s h e s   e m   c a d e i a   e   e l i m i n a n d o   o   e r r o   d a   " T e l a   B r a n c a " .     - - -     # #   [ v 2 . 1 . 3 7 ]   -   0 3   d e   A g o s t o ,   2 0 2 6   # # #   O t i m i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d a   A r q u i t e t u r a   d o   E s t o q u e   &   R e o r g a n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   A b a s   -   * * S e t o r e s   d e   E s t o q u e   ( A l m o x a r i f a d o s ) : * *   A b a   m o v i d a   d o   m ï¿½ ï¿½ d u l o   d e   E s t o q u e   p a r a   a   g e s t ï¿½ ï¿½ o   c e n t r a l i z a d a   n o   m ï¿½ ï¿½ d u l o   d e   * * T . I   /   C o n f i g u r a ï¿½ ï¿½ ï¿½ ï¿½ e s * *   ( ` C o n f i g P a n e l . j s x ` ) ,   p e r m i t i n d o   g e r e n c i a m e n t o   c o m p l e t o   p e l o s   a d m i n i s t r a d o r e s .   -   * * C a d a s t r o   d e   F o r n e c e d o r e s : * *   A b a   m o v i d a   d o   m ï¿½ ï¿½ d u l o   d e   E s t o q u e   p a r a   o   m ï¿½ ï¿½ d u l o   d e   * * C o m p r a s * *   ( ` P u r c h a s i n g P a n e l . j s x ` ) ,   i n t e g r a n d o   a   g e s t ï¿½ ï¿½ o   d e   f o r n e c e d o r e s   d i r e t a m e n t e   a o   f l u x o   d e   c o t a ï¿½ ï¿½ ï¿½ ï¿½ e s   e   s u p r i m e n t o s .   -   * * S o l u ï¿½ ï¿½ ï¿½ ï¿½ o   D e f i n i t i v a   d e   T e l a   B r a n c a   ( L a z y   L o a d i n g ) : * *   R e f a t o r a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   ` u s e S t o c k L o g i c . j s x `   p a r a   c a r r e g a r   c o l e ï¿½ ï¿½ ï¿½ ï¿½ e s   d o   F i r e s t o r e   s o b   d e m a n d a   p o r   a b a   e   l i m i t a r   h i s t ï¿½ ï¿½ r i c o s   l o n g o s   d e   m o v i m e n t a ï¿½ ï¿½ ï¿½ ï¿½ o   a   1 0 0   i t e n s ,   r e d u z i n d o   d r a s t i c a m e n t e   o   c o n s u m o   d e   m e m ï¿½ ï¿½ r i a   d o   n a v e g a d o r .     - - -     # #   [ v 2 . 1 . 3 5 ]   -   0 2   d e   A g o s t o ,   2 0 2 6   # # #   P r o t e ï¿½ ï¿½ ï¿½ ï¿½ o   D e f e n s i v a   n o   M ï¿½ ï¿½ d u l o   E s t o q u e   &   F a r m ï¿½ ï¿½ c i a   -   * * M ï¿½ ï¿½ d u l o   E s t o q u e   ( S t o c k P a n e l ) : * *   A d i c i o n a d a   p r o t e ï¿½ ï¿½ ï¿½ ï¿½ o   a s s ï¿½ ï¿½ n c r o n a   c o m   ` c a t c h `   i n d i v i d u a l   e m   c a d a   r e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ o   d e   d a d o s   ( ` P r o m i s e . a l l ` )   e   O p t i o n a l   C h a i n i n g   ( ` ( r e q u i s i t i o n s   | |   [ ] ) . f i l t e r ( . . . ) ` )   n o   m e n u   d e   a b a s   e   i n d i c a d o r e s   p a r a   i m p e d i r   e x c e ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   t e l a   b r a n c a .     - - -     # #   [ v 2 . 1 . 3 3 ]   -   0 2   d e   A g o s t o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   C r ï¿½ ï¿½ t i c a   d e   I m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   ï¿½ ï¿½ c o n e s   -   * * M o d u l e S e l e c t o r . j s x : * *   I m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   e x p l ï¿½ ï¿½ c i t a   d o   ï¿½ ï¿½ c o n e   ` F i l e T e x t `   d a   b i b l i o t e c a   ` l u c i d e - r e a c t `   p a r a   r e s o l v e r   e r r o   e m   t e m p o   d e   e x e c u ï¿½ ï¿½ ï¿½ ï¿½ o   a o   t e n t a r   r e n d e r i z a r   o   n o v o   m ï¿½ ï¿½ d u l o   ` N e x a A P A C ` .     - - -     # #   [ v 2 . 1 . 3 1 ]   -   0 2   d e   A g o s t o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   R e n d e r i z a ï¿½ ï¿½ ï¿½ ï¿½ o   n o   S e l e t o r   d e   M ï¿½ ï¿½ d u l o s   -   * * S e l e t o r   d e   M ï¿½ ï¿½ d u l o s   ( N e x a C L I N I C ) : * *   A d i c i o n a d a   v a l i d a ï¿½ ï¿½ ï¿½ ï¿½ o   d e f e n s i v a   p a r a   r e n d e r i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d o s   ï¿½ ï¿½ c o n e s   e   v e r i f i c a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   p e r m i s s ï¿½ ï¿½ e s   d o   n o v o   m ï¿½ ï¿½ d u l o   ` N e x a A P A C `   p a r a   p r e v e n i r   e x c e ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   t e l a   b r a n c a .     - - -     # #   [ v 2 . 1 . 2 9 ]   -   0 2   d e   A g o s t o ,   2 0 2 6   # # #   M ï¿½ ï¿½ d u l o   I n d e p e n d e n t e   N e x a A P A C   &   D a s h b o a r d   F i n a n c e i r o   I n t e r a t i v o   -   * * N o v o   M ï¿½ ï¿½ d u l o   N e x a A P A C   ( A P A C s   &   F a t u r a m e n t o ) : * *   M ï¿½ ï¿½ d u l o   d e d i c a d o   p a r a   a u d i t o r i a   d e   A P A C s   d e   d i ï¿½ ï¿½ l i s e ,   c o n t r o l e   d e   v e n c i m e n t o s ,   g e s t ï¿½ ï¿½ o   d e   g l o s a s   d e   c o n v ï¿½ ï¿½ n i o s   e   g e r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   a r q u i v o s   d e   r e m e s s a   S U S .   -   * * D a s h b o a r d   F i n a n c e i r o   C l i c ï¿½ ï¿½ v e l : * *   T o d o s   o s   c a r d s   d e   K P I   d o   M ï¿½ ï¿½ d u l o   F i n a n c e i r o   t o r n a r a m - s e   i n t e r a t i v o s ,   a b r i n d o   u m   m o d a l   c o m p l e t o   c o m   a   l i s t a g e m   f i l t r a d a   d o s   t ï¿½ ï¿½ t u l o s ,   p r a z o s   e   d e t a l h a m e n t o s   o p e r a c i o n a i s .     - - -     # #   [ v 2 . 1 . 2 7 ]   -   0 2   d e   A g o s t o ,   2 0 2 6   # # #   P r o t e ï¿½ ï¿½ ï¿½ ï¿½ o   D e f e n s i v a   c o n t r a   T e l a   B r a n c a   ( C a t ï¿½ ï¿½ l o g o   e   E n t r a d a   d e   N o t a s )   -   * * C a t ï¿½ ï¿½ l o g o   d e   P r o d u t o s : * *   B l i n d a g e m   d a s   p r o p r i e d a d e s   d o s   p r o d u t o s   ( ` c u r r e n t S t o c k ` ,   ` m i n S t o c k ` ,   ` p r i c e ` ,   ` n a m e ` ,   ` c a t e g o r y ` )   p r e v e n i n d o   e x c e ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   r e n d e r i z a ï¿½ ï¿½ ï¿½ ï¿½ o   e m   r e g i s t r o s   i n c o n s i s t e n t e s   n o   b a n c o .   -   * * E n t r a d a   d e   N o t a s   &   X M L : * *   T r a t a m e n t o   e   f a l l b a c k   p a r a   f o r m a t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   m o e d a s   ( ` t o t a l V a l u e . t o F i x e d ( 2 ) ` )   e   v a l i d a ï¿½ ï¿½ ï¿½ ï¿½ o   e s t r i t a   d e   d a t a s   ( ` i s s u e D a t e `   e   ` e n t r y D a t e ` ) .     - - -     # #   [ v 2 . 1 . 2 5 ]   -   0 2   d e   A g o s t o ,   2 0 2 6   # # #   M a p e a m e n t o   d e   K P I s   n o   E s t o q u e   &   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   T e l a   B r a n c a   -   * * M ï¿½ ï¿½ d u l o   E s t o q u e   ( A t e n d i m e n t o   d e   R e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ e s ) : * *   A d i c i o n a d a   a   g r a d e   d e   4   c a r d s   e s t a t ï¿½ ï¿½ s t i c o s   ( T o t a l   d e   P e d i d o s ,   P e n d e n t e s ,   E n t r e g a s   P a r c i a i s ,   A t e n d i d o s / E n t r e g u e s )   p a r a   d a r   v i s ï¿½ ï¿½ o   i m e d i a t a   d o s   i n d i c a d o r e s   d a   f a r m ï¿½ ï¿½ c i a .   -   * * R e s i l i ï¿½ ï¿½ n c i a   c o n t r a   T e l a   B r a n c a : * *   T r a t a m e n t o   e   f a l l b a c k   p a r a   r e n d e r i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   d a t a s   e m   t a b e l a s   d o   e s t o q u e ,   e v i t a n d o   f a l h a s   d e   e x e c u ï¿½ ï¿½ ï¿½ ï¿½ o   n o   n a v e g a d o r .     - - -     # #   [ v 2 . 1 . 2 4 ]   -   0 2   d e   A g o s t o ,   2 0 2 6   # # #   M e l h o r i a s   n o   M ï¿½ ï¿½ d u l o   d e   R e c u r s o s   H u m a n o s   ( R H )   e   V a l e - T r a n s p o r t e   -   * * P r e s e n ï¿½ ï¿½ a   P r e m i a d a : * *   V a l o r   p a d r ï¿½ ï¿½ o   i n i c i a l   a l t e r a d o   p a r a   R $   1 0 0 , 0 0   p o r   c o l a b o r a d o r   e l e g ï¿½ ï¿½ v e l .   -   * * V a l e - T r a n s p o r t e : * *   C o r r i g i d a   a   a l t u r a   e   r o l a g e m   d o   m o d a l   d e   " N o v a   C o n c e s s ï¿½ ï¿½ o   d e   V a l e - T r a n s p o r t e "   ( ` m a x H e i g h t :   8 0 v h `   c o m   ` o v e r f l o w Y :   a u t o ` ) ,   p e r m i t i n d o   v i s u a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d o s   b o t ï¿½ ï¿½ e s   d e   C o n f i r m a r   e   C a n c e l a r   e m   q u a l q u e r   d i s p o s i t i v o .   -   * * D e m i s s ï¿½ ï¿½ o   /   D e s l i g a m e n t o   d e   F u n c i o n ï¿½ ï¿½ r i o s : * *   C r i a d o   r e c u r s o   e   f l u x o   p a r a   r e g i s t r a r   d e s l i g a m e n t o s / d e m i s s ï¿½ ï¿½ e s   d e   c o l a b o r a d o r e s   c o m   a t a l h o   d e   a ï¿½ ï¿½ ï¿½ ï¿½ o   " D e m i t i r " ,   d a t a   d e   d e s l i g a m e n t o   e   h i s t ï¿½ ï¿½ r i c o   d e   i n a t i v a ï¿½ ï¿½ ï¿½ ï¿½ o .     - - -     # #   [ v 2 . 1 . 2 3 ]   -   0 1   d e   A g o s t o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   P e r m i s s ï¿½ ï¿½ e s   F i r e s t o r e   e   R e s t a u r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   D a d o s   -   * * C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   C r ï¿½ ï¿½ t i c a : * *   A t u a l i z a d a s   a s   r e g r a s   d e   s e g u r a n ï¿½ ï¿½ a   d o   F i r e b a s e   ( f i r e s t o r e . r u l e s )   p a r a   l i b e r a r   p e r m i s s ï¿½ ï¿½ e s   d e   l e i t u r a / e s c r i t a   p a r a   t o d a s   a s   c o l e ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   m ï¿½ ï¿½ d u l o s   d e   r e t a g u a r d a   ( e s t o q u e ,   R H ,   f i n a n c e i r o ,   c o m p r a s ) .   -   * * C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   C r a s h : * *   C o r r i g i d o   o   ` T y p e E r r o r `   e m   c h a m a d a s   ` d b S e r v i c e . g e t U s e r s ( ) `   n ï¿½ ï¿½ o   t r a t a d a s   e x p o r t a n d o   c o r r e t a m e n t e   ` a u t h F u n c t i o n s `   n o   ` f i r e b a s e . j s ` .   C o m   i s s o ,   a   t e l a   b r a n c a   a o   e n t r a r   n o s   m ï¿½ ï¿½ d u l o s   E s t o q u e ,   C o m p r a s   e   R H   f o i   r e s o l v i d a .     - - -     # #   [ v 2 . 1 . 2 0 ]   -   0 1   d e   A g o s t o ,   2 0 2 6   # # #   R e s t a u r a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   C a d a s t r o   d e   F u n c i o n ï¿½ ï¿½ r i o s / U s u ï¿½ ï¿½ r i o s   &   E s t a b i l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   M ï¿½ ï¿½ d u l o s   -   * * R e c u p e r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   F u n c i o n ï¿½ ï¿½ r i o s : * *   I m p l e m e n t a d a   s e m e a d u r a   p a d r ï¿½ ï¿½ o   e m   ` g e t E m p l o y e e s ( ) `   ( ` h r S e r v i c e . t s ` )   g a r a n t i n d o   a   p r e s e n ï¿½ ï¿½ a   d o s   f u n c i o n ï¿½ ï¿½ r i o s   ( A n a   C a r o l i n a   C e r q u e i r a   G o n z a g a ,   D r .   J .   S o a r e s ,   A d m i n i s t r a d o r   T e c h C o s t a ,   M a r i a   C l a r a   S a n t o s ,   J o ï¿½ ï¿½ o   A l m o x a r i f e ) .   -   * * G a r a n t i a   d e   U s u ï¿½ ï¿½ r i o s   &   P e r m i s s ï¿½ ï¿½ e s : * *   A t u a l i z a d o   ` g e t U s e r s ( ) `   ( ` a u t h S e r v i c e . j s ` )   p a r a   s i n c r o n i z a r   e   s e m e a r   o s   u s u ï¿½ ï¿½ r i o s   c a d a s t r a d o s   e   m a n t e r   o   p e r f i l   d e   A d m i n i s t r a d o r   G e r a l   s e m   p e r d a   d e   a c e s s o s .   -   * * R e s o l u ï¿½ ï¿½ ï¿½ ï¿½ o   D e f i n i t i v a   d e   T e l a   B r a n c a : * *   R e p a s s a d o   o   o b j e t o   d e   e s t a d o   ` c u r r e n t U s e r = { u s e r } `   g l o b a l m e n t e   e m   ` A p p . j s x `   p a r a   t o d o s   o s   m ï¿½ ï¿½ d u l o s   ( E s t o q u e ,   C o m p r a s ,   R H ,   F i n a n c e i r o ,   A g e n d a ,   T I / C o n f i g u r a ï¿½ ï¿½ ï¿½ ï¿½ e s   e   R e c e p ï¿½ ï¿½ ï¿½ ï¿½ o ) .     - - -     # #   [ v 2 . 1 . 1 6 ]   -   0 1   d e   A g o s t o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   T e l a   B r a n c a   n o s   M ï¿½ ï¿½ d u l o s   C o m p r a s ,   E s t o q u e   e   R H   -   * * C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   E s c o p o   &   P r o p s : * *   C o r r i g i d o   o   e r r o   d e   c o m p i l a ï¿½ ï¿½ ï¿½ ï¿½ o / e s c o p o   e m   ` P u r c h a s i n g P a n e l . j s x `   e   g a r a n t i d o   o   r e p a s s e   d a   p r o p   ` c u r r e n t U s e r `   a o s   c o m p o n e n t e s   ` S t o c k P a n e l ` ,   ` H R P a n e l ` ,   ` u s e S t o c k L o g i c `   e   ` u s e H R L o g i c ` .   -   * * T r a t a m e n t o   d e   E x c e ï¿½ ï¿½ ï¿½ ï¿½ e s   e m   L e i t u r a   F i r e s t o r e : * *   A d i c i o n a d a   p r o t e ï¿½ ï¿½ ï¿½ ï¿½ o   ` t r y / c a t c h `   n a s   c h a m a d a s   d e   d a d o s   d o   F i r e s t o r e   e m   ` f i n a n c i a l S e r v i c e . j s ` ,   ` s t o c k S e r v i c e . j s `   e   ` h r S e r v i c e . t s ` ,   r e t o r n a n d o   l i s t a s   v a z i a s   c o m o   f a l l b a c k   s e g u r o   e m   c a s o   d e   f a l h a   d e   c o n e x ï¿½ ï¿½ o   o u   p e r m i s s ï¿½ ï¿½ o .     - - -     # #   [ v 2 . 1 . 1 4 ]   -   0 1   d e   A g o s t o ,   2 0 2 6   # # #   R e s t a u r a ï¿½ ï¿½ ï¿½ ï¿½ o   T o t a l   d e   P e r m i s s ï¿½ ï¿½ e s   e   A c e s s o s   A d m i n   -   * * A u t e n t i c a ï¿½ ï¿½ ï¿½ ï¿½ o   &   S i n c r o n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   R B A C : * *   A t u a l i z a d a   a   l ï¿½ ï¿½ g i c a   d e   e s c u t a   d e   e s t a d o   d e   a u t e n t i c a ï¿½ ï¿½ ï¿½ ï¿½ o   e m   ` o n A u t h C h a n g e `   d o   ` a u t h S e r v i c e . j s ` .   A o   a u t e n t i c a r   u s u ï¿½ ï¿½ r i o s   a d m i n i s t r a d o r e s   ( ` c o n t a t o @ t e c h c o s t a . n e t ` ,   ` a n a c g @ n e x a . c o m ` ,   ` j s o a r e s @ n e x a . c o m ` ) ,   o s   p e r f i s   n o   F i r e s t o r e   s ï¿½ ï¿½ o   s i n c r o n i z a d o s   e   o   p a p e l   ` a d m i n `   c o m   a c e s s o   a   t o d o s   o s   s e t o r e s   ( ` e n f e r m a g e m ` ,   ` m e d i c a ` ,   ` q u a l i d a d e ` ,   ` f a t u r a m e n t o ` ,   ` p s i c o l o g i a ` ,   ` n u t r i c a o ` ,   ` r h ` ,   ` r e c e p c a o ` ,   ` e s t o q u e ` ,   ` c o m p r a s ` )   ï¿½ ï¿½   a s s e g u r a d o .   -   * * R e s o l u ï¿½ ï¿½ ï¿½ ï¿½ o   d e   B l o q u e i o   d e   M ï¿½ ï¿½ d u l o s : * *   E l i m i n a d a   a   p e r d a   i n v o l u n t ï¿½ ï¿½ r i a   d e   p a p ï¿½ ï¿½ i s / p e r m i s s ï¿½ ï¿½ e s   a o   l o g a r   n o   F i r e b a s e   R e a l .     - - -     # #   [ 2 . 1 . 6 ]   -   2 0 2 6 - 0 8 - 0 1   # # #   R e f a t o r a ï¿½ ï¿½ ï¿½ ï¿½ o   ( P r i o r i d a d e   2 )   -   M o d u l a r i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   S t o c k P a n e l . j s x   ( E x t r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   l ï¿½ ï¿½ g i c a   p a r a   u s e S t o c k L o g i c . j s ) .   -   M o d u l a r i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   H R P a n e l . j s x   ( E x t r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   l ï¿½ ï¿½ g i c a   p a r a   u s e H R L o g i c . j s ) .     #   H i s t ï¿½ ï¿½ r i c o   d e   V e r s ï¿½ ï¿½ e s   -   N e x a C L I N I C     # #   [ v 2 . 1 . 5 ]   -   0 1   d e   A g o s t o ,   2 0 2 6   # # #   R e f a t o r a ï¿½ ï¿½ ï¿½ ï¿½ o   d a   A r q u i t e t u r a   d e   D a d o s   ( M o d u l a r i z a ï¿½ ï¿½ ï¿½ ï¿½ o   f i r e b a s e . j s )   -   * * M o d u l a r i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   S e r v i ï¿½ ï¿½ o s : * *   O   a r q u i v o   c e n t r a l   ` f i r e b a s e . j s `   ( c o m   m a i s   d e   2 . 0 1 6   l i n h a s )   f o i   d e s m e m b r a d o   e m   d i v e r s o s   s e r v i ï¿½ ï¿½ o s   e s p e c i a l i z a d o s   n a   p a s t a   ` s r c / s e r v i c e s / f i r e b a s e / `   ( a u t h S e r v i c e ,   p a t i e n t S e r v i c e ,   s t o c k S e r v i c e ,   f i n a n c i a l S e r v i c e ,   h r S e r v i c e ,   c l i n i c a l S e r v i c e   e   s y s t e m S e r v i c e ) .   I s s o   f a c i l i t a   a   m a n u t e n ï¿½ ï¿½ ï¿½ ï¿½ o   e   p o s s i b i l i t a   o   f u t u r o   * c o d e   s p l i t t i n g *   d i n ï¿½ ï¿½ m i c o   d o   F i r e b a s e .   -   * * S e g u r a n ï¿½ ï¿½ a   F i r e b a s e   ( . e n v ) : * *   A s   c h a v e s   e   c o n f i g u r a ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   a m b i e n t e   d o   F i r e b a s e   f o r a m   i s o l a d a s   c o m   s e g u r a n ï¿½ ï¿½ a   e m   u m   a r q u i v o   ` . e n v `   d e d i c a d o ,   i n c l u i n d o   u m a   v a l i d a ï¿½ ï¿½ ï¿½ ï¿½ o   r i g o r o s a   n o   p r o c e s s o   d e   s t a r t u p   d o   A p p .   -   * * P o l ï¿½ ï¿½ t i c a   d e   S e n h a   ( A d m i n / R H ) : * *   R e f o r ï¿½ ï¿½ a d a   a   g e r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   s e n h a s   t e m p o r ï¿½ ï¿½ r i a s   ( A d m i n s / R H )   e x i g i n d o   a g o r a   n o   m ï¿½ ï¿½ n i m o   8   c a r a c t e r e s   c o n t e n d o   l e t r a s ,   n ï¿½ ï¿½ m e r o s   e   c a r a c t e r e s   e s p e c i a i s .   -   * * A r q u i t e t u r a   &   E s c a l a b i l i d a d e : * *   A   r e f a t o r a ï¿½ ï¿½ ï¿½ ï¿½ o   m a n t ï¿½ ï¿½ m   c o m p a t i b i l i d a d e   e s t r i t a   c o m   a   i n t e r f a c e   d e   d e p e n d ï¿½ ï¿½ n c i a s   e x i s t e n t e   ( ` d b S e r v i c e `   e   ` a u t h S e r v i c e ` ) ,   g a r a n t i n d o   t o t a l   e s t a b i l i d a d e   d o   p r o j e t o   s e m   i n t r o d u z i r   c o m p o r t a m e n t o s   q u e b r a d o s .     - - -     # #   [ v 2 . 1 . 3 ]   -   3 1   d e   J u l h o ,   2 0 2 6   # # #   M ï¿½ ï¿½ d u l o   E s t o q u e   &   F a r m ï¿½ ï¿½ c i a :   I n v e n t ï¿½ ï¿½ r i o s   F ï¿½ ï¿½ s i c o s ,   M ï¿½ ï¿½ l t i p l o s   L o c a i s ,   T r a n s f e r ï¿½ ï¿½ n c i a s ,   F E F O   &   A l e r t a s   -   * * C a d a s t r o   e   G e s t ï¿½ ï¿½ o   d e   M ï¿½ ï¿½ l t i p l o s   L o c a i s   d e   E s t o q u e   ( M ï¿½ ï¿½ d u l o   T . I ) : * *   A d i c i o n a d a   n o v a   a b a   ` L o c a i s   d e   E s t o q u e `   n o   p a i n e l   d e   c o n f i g u r a ï¿½ ï¿½ ï¿½ ï¿½ e s   d o   M ï¿½ ï¿½ d u l o   T . I   ( ` C o n f i g P a n e l . j s x ` ) ,   p e r m i t i n d o   c a d a s t r a r ,   e d i t a r   e   i n a t i v a r   l o c a i s   c o m o   A l m o x a r i f a d o   C e n t r a l ,   F a r m ï¿½ ï¿½ c i a   d a   D i ï¿½ ï¿½ l i s e ,   P o s t o   d e   E n f e r m a g e m   e   T I .   -   * * A b a   d e   I n v e n t ï¿½ ï¿½ r i o s   F ï¿½ ï¿½ s i c o s   c o m   C o n t a g e m   &   A u d i t o r i a : * *   A d i c i o n a d a   a b a   ` I n v e n t ï¿½ ï¿½ r i o s   F ï¿½ ï¿½ s i c o s `   n o   ` S t o c k P a n e l . j s x `   p a r a   a b e r t u r a ,   d i g i t a ï¿½ ï¿½ ï¿½ ï¿½ o   e   s a l v a m e n t o   d e   c o n t a g e n s   f ï¿½ ï¿½ s i c a s   p o r   l o c a l   d e   a r m a z e n a m e n t o .   -   * * R e l a t ï¿½ ï¿½ r i o   d e   D i v e r g ï¿½ ï¿½ n c i a s   &   A j u s t e   A u t o m ï¿½ ï¿½ t i c o   d e   S a l d o s : * *   S i s t e m a   c a l c u l a   d i s c r e p ï¿½ ï¿½ n c i a s   e n t r e   s a l d o   d o   s i s t e m a   e   c o n t a g e m   f ï¿½ ï¿½ s i c a   ( s o b r a s / f a l t a s )   c o m   i m p a c t o   f i n a n c e i r o   e m   R $ .   A o   c o n c l u i r   o   i n v e n t ï¿½ ï¿½ r i o ,   o s   s a l d o s   d o s   p r o d u t o s   n o   F i r e s t o r e   s ï¿½ ï¿½ o   * * a t u a l i z a d o s   a u t o m a t i c a m e n t e * *   c o m   r e g i s t r o   e m   h i s t ï¿½ ï¿½ r i c o   d e   t r a n s a ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   a u d i t o r i a .   -   * * T r a n s f e r ï¿½ ï¿½ n c i a s   E n t r e   L o c a i s   d e   E s t o q u e : * *   A d i c i o n a d a   a b a   ` T r a n s f e r ï¿½ ï¿½ n c i a s   d e   E s t o q u e `   p a r a   m o v i m e n t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   i n s u m o s   e n t r e   l o c a i s   c a d a s t r a d o s   ( e x :   A l m o x a r i f a d o   C e n t r a l   ï¿½ ~ï¿½ ï¿½ ï¿½ ï¿½   F a r m ï¿½ ï¿½ c i a   d a   D i ï¿½ ï¿½ l i s e ) ,   c o m   d ï¿½ ï¿½ b i t o   a u t o m ï¿½ ï¿½ t i c o   n o   l o c a l   d e   o r i g e m   e   c r ï¿½ ï¿½ d i t o   n o   d e s t i n o .   -   * * D e s t a q u e   L o t e   &   F E F O   ( F i r s t   E x p i r e d ,   F i r s t   O u t ) : * *   D e s t a q u e   i n t e l i g e n t e   v i s u a l   n o s   l o t e s   m a i s   p r ï¿½ ï¿½ x i m o s   d e   v e n c e r   p a r a   e v i t a r   p e r d a s   d e   m e d i c a m e n t o s   e   i n s u m o s   m ï¿½ ï¿½ d i c o s   p o r   v a l i d a d e .   -   * * A l e r t a s   d e   E s t o q u e   M ï¿½ ï¿½ n i m o   e   P o n t o   d e   P e d i d o : * *   I n d i c a d o r e s   v i s u a i s   d e   n ï¿½ ï¿½ v e l   c r ï¿½ ï¿½ t i c o   d e   e s t o q u e   n o   c a t ï¿½ ï¿½ l o g o   d e   p r o d u t o s   c o m   a c i o n a m e n t o   d e   c o m p r a   r ï¿½ ï¿½ p i d a .     - - -     # #   [ v 2 . 1 . 1 ]   -   3 1   d e   J u l h o ,   2 0 2 6   # # #   P o r t a l   d e   R e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   S a l ï¿½ ï¿½ o   ( E n f e r m a g e m ) ,   A t e n d i m e n t o   n a   F a r m ï¿½ ï¿½ c i a   &   T r a v a   d e   E s t o q u e   e m   T . I   -   * * M i n i - M ï¿½ ï¿½ d u l o   d e   R e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ e s   p a r a   T ï¿½ ï¿½ c n i c a s : * *   L a n ï¿½ ï¿½ a m e n t o   d o   n o v o   p o r t a l   d e d i c a d o   n o   m e n u   p r i n c i p a l   ( ` T e c h n i c i a n P a n e l . j s x ` )   q u e   p e r m i t e   ï¿½ ï¿½ s   t ï¿½ ï¿½ c n i c a s   d e   e n f e r m a g e m   n o   s a l ï¿½ ï¿½ o   d e   h e m o d i ï¿½ ï¿½ l i s e   s o l i c i t a r e m   m a t e r i a i s   e   m e d i c a m e n t o s   d o   e s t o q u e   e m   t e m p o   r e a l .   -   * * V ï¿½ ï¿½ n c u l o   c o m   P a c i e n t e s   d a   R e c e p ï¿½ ï¿½ ï¿½ ï¿½ o : * *   A s   r e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ e s   p o d e m   s e r   v i n c u l a d a s   d i r e t a m e n t e   a o   p a c i e n t e   e m   t r a t a m e n t o   n a   d i ï¿½ ï¿½ l i s e   ( b u s c a d o   d a   R e c e p ï¿½ ï¿½ ï¿½ ï¿½ o )   o u   r e g i s t r a d a s   c o m o   u s o   g e r a l   d o   s a l ï¿½ ï¿½ o / b a n c a d a .   -   * * A b a   d e   A t e n d i m e n t o   n a   F a r m ï¿½ ï¿½ c i a / E s t o q u e : * *   N o v a   a b a   " A t e n d i m e n t o   d e   R e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ e s "   n o   ` S t o c k P a n e l . j s x `   p a r a   a   f a r m ï¿½ ï¿½ c i a   v i s u a l i z a r   s o l i c i t a ï¿½ ï¿½ ï¿½ ï¿½ e s   p e n d e n t e s ,   i n f o r m a r   a   q u a n t i d a d e   e n t r e g u e   e   r e a l i z a r   a   * * b a i x a   f ï¿½ ï¿½ s i c a   i n s t a n t ï¿½ ï¿½ n e a   n o   e s t o q u e * * .   -   * * T r a v a   d e   E s t o q u e   Z e r a d o   ( C o n f i g u r ï¿½ ï¿½ v e l   e m   T . I . ) : * *   A d i c i o n a d a   c h a v e   O N / O F F   n o   ` C o n f i g P a n e l . j s x `   q u e   p e r m i t e   ï¿½ ï¿½   e q u i p e   d e   T . I .   b l o q u e a r   a   s o l i c i t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   m a t e r i a i s   c u j o   s a l d o   e m   e s t o q u e   e s t e j a   z e r a d o   o u   i n s u f i c i e n t e .   -   * * R e g r a   d e   E d i ï¿½ ï¿½ ï¿½ ï¿½ o   e   E x c l u s ï¿½ ï¿½ o : * *   A s   t ï¿½ ï¿½ c n i c a s   p o s s u e m   p e r m i s s ï¿½ ï¿½ o   d e   e d i t a r   e   e x c l u i r   r e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ e s   * * e x c l u s i v a m e n t e   e n q u a n t o   o   s t a t u s   e s t i v e r   " P e n d e n t e " * * .   A p ï¿½ ï¿½ s   o   a t e n d i m e n t o   i n i c i a d o   p e l a   f a r m ï¿½ ï¿½ c i a ,   a   r e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ o   ï¿½ ï¿½   c o n g e l a d a   p a r a   s e g u r a n ï¿½ ï¿½ a   d o   p r o c e s s o .   -   * * L o g s   d e   A u d i t o r i a   C o m p l e t o : * *   T o d a s   a s   a ï¿½ ï¿½ ï¿½ ï¿½ e s   ( c r i a ï¿½ ï¿½ ï¿½ ï¿½ o ,   e d i ï¿½ ï¿½ ï¿½ ï¿½ o ,   e x c l u s ï¿½ ï¿½ o   e   c o n f i r m a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   a t e n d i m e n t o / e n t r e g a   p a r c i a l   o u   t o t a l )   s ï¿½ ï¿½ o   r e g i s t r a d a s   a u t o m a t i c a m e n t e   n a   c e n t r a l   d e   a u d i t o r i a   e   l o g s   d o   M ï¿½ ï¿½ d u l o   d e   T . I .     - - -     # #   [ v 2 . 0 . 6 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   A p r i m o r a m e n t o s   d o   M ï¿½ ï¿½ d u l o   E s t o q u e / F a r m ï¿½ ï¿½ c i a   &   C e n t r a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   n o   T . I   -   * * O r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   I n t e r a t i v a   d e   C o l u n a s   n o   E s t o q u e : * *   A d i c i o n a d a   o r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   p o r   c l i q u e   e m   t o d a s   a s   c o l u n a s   d e   t a b e l a s   d o   E s t o q u e   ( * C a t ï¿½ ï¿½ l o g o   d e   P r o d u t o s * ,   * N o t a s   F i s c a i s / X M L * ,   * F o r n e c e d o r e s * ,   * S e t o r e s   F ï¿½ ï¿½ s i c o s * ,   * H i s t ï¿½ ï¿½ r i c o   d e   M o v i m e n t a ï¿½ ï¿½ ï¿½ ï¿½ e s * ,   * C o n t r o l e   d e   V a l i d a d e *   e   * E m p r ï¿½ ï¿½ s t i m o s * ) .   -   * * G e r e n c i a m e n t o   C o m p l e t o   ( C R U D ) : * *   A d i c i o n a d o   s u p o r t e   p a r a   C r i a r ,   E d i t a r   e   E x c l u i r   * * I t e n s   d e   I n v e n t ï¿½ ï¿½ r i o * * ,   * * F o r n e c e d o r e s * *   e   * * S e t o r e s   C l ï¿½ ï¿½ n i c o s * *   c o m   m o d a i s   e   f o r m u l ï¿½ ï¿½ r i o s   d e d i c a d o s .   -   * * M ï¿½ ï¿½ d u l o   d e   E m p r ï¿½ ï¿½ s t i m o s   d e   P r o d u t o s   &   M e d i c a m e n t o s : * *   N o v a   a b a   n o   E s t o q u e / F a r m ï¿½ ï¿½ c i a   p a r a   c o n t r o l e   d e   e m p r ï¿½ ï¿½ s t i m o s   i n t e r - h o s p i t a l a r e s   e   e n t r e   c l ï¿½ ï¿½ n i c a s   p a r c e i r a s   ( C o n c e d i d o s   e   R e c e b i d o s ) .   I n c l u i   b o t ï¿½ ï¿½ o   d e   a ï¿½ ï¿½ ï¿½ ï¿½ o   r ï¿½ ï¿½ p i d a   * * ` ï¿½ x    D a r   B a i x a   /   D e v o l u ï¿½ ï¿½ ï¿½ ï¿½ o ` * *   c o m   r e p o s i ï¿½ ï¿½ ï¿½ ï¿½ o / b a i x a   d e   s a l d o .   -   * * C e n t r a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   C a t e g o r i a s   n o   M ï¿½ ï¿½ d u l o   T . I : * *   T r a n s f e r i d o   o   c a d a s t r o   e   g e r e n c i a m e n t o   d e   * * C a t e g o r i a s   d e   P r o d u t o s   e   M ï¿½ ï¿½ d u l o s * *   p a r a   o   [ C o n f i g P a n e l . j s x ] ( f i l e : / / / c : / N e x a / N e x A i - C L I N I C / s r c / c o m p o n e n t s / C o n f i g P a n e l . j s x ) ,   p e r m i t i n d o   q u e   o   s e t o r   d e   T . I   d e f i n a   a s   c a t e g o r i a s   q u e   a l i m e n t a m   a u t o m a t i c a m e n t e   o s   s e l e t o r e s   d o   s i s t e m a .     - - -     # #   [ v 2 . 0 . 5 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   A p r i m o r a m e n t o s   O p e r a c i o n a i s   d o   M ï¿½ ï¿½ d u l o   F i n a n c e i r o   -   * * O r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   I n t e r a t i v a   d e   C o l u n a s : * *   A d i c i o n a d a   o r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   i n t e r a t i v a   p o r   c l i q u e   e m   t o d a s   a s   c o l u n a s   d e   t a b e l a   d a s   a b a s   * * C o n t a s   a   P a g a r * * ,   * * C o n t a s   a   R e c e b e r * *   e   * * P a r c e l a m e n t o s   &   D ï¿½ ï¿½ v i d a s * *   ( i n d i c a d o r e s   c o m   s e t a s   o r d e n a n d o   p o r   F o r n e c e d o r / C l i e n t e ,   C a t e g o r i a ,   V e n c i m e n t o ,   V a l o r   e   S t a t u s ) .   -   * * C a r d s   d e   P r e v i s ï¿½ ï¿½ o   7   e   1 5   D i a s : * *   A d i c i o n a d o s   q u a d r o s   p e r s o n a l i z ï¿½ ï¿½ v e i s   n o   D a s h b o a r d   O p e r a c i o n a l   p a r a   p r e v i s ï¿½ ï¿½ o   d e   * * C o n t a s   a   P a g a r   n o s   P r ï¿½ ï¿½ x i m o s   7   D i a s * *   e   * * P r ï¿½ ï¿½ x i m o s   1 5   D i a s * * .   -   * * A ï¿½ ï¿½ ï¿½ ï¿½ e s   F i n a n c e i r a s   C o m p l e t a s   ( C R U D   &   B a i x a ) : * *   A d i c i o n a d a   f u n c i o n a l i d a d e   d e   * * E d i ï¿½ ï¿½ ï¿½ ï¿½ o   c o m p l e t a * * ,   * * C r i a r   M a n u a l * * ,   * * E x c l u i r * *   e   * * B a i x a / Q u i t a ï¿½ ï¿½ ï¿½ ï¿½ o   r ï¿½ ï¿½ p i d a * *   p a r a   C o n t a s   a   P a g a r ,   C o n t a s   a   R e c e b e r   e   P a r c e l a m e n t o s   d e   D ï¿½ ï¿½ v i d a s .   -   * * A r q u i t e t u r a   D e s a c o p l a d a   ( R e m o ï¿½ ï¿½ ï¿½ ï¿½ o   d o   X M L   d o   F i n a n c e i r o ) : * *   R e m o v i d a   a   s i m u l a ï¿½ ï¿½ ï¿½ ï¿½ o / b o t ï¿½ ï¿½ o   d e   i m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   X M L   d o   M ï¿½ ï¿½ d u l o   F i n a n c e i r o .   A   i m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   N F - e   ï¿½ ï¿½   d e   a t r i b u i ï¿½ ï¿½ ï¿½ ï¿½ o   e x c l u s i v a   d o   * * M ï¿½ ï¿½ d u l o   d e   E s t o q u e * * ,   q u e   a t u a l i z a   o   i n v e n t ï¿½ ï¿½ r i o   d e   i n s u m o s   e   p r o v i s i o n a   o   C o n t a s   a   P a g a r   a u t o m a t i c a m e n t e .     - - -     # #   [ v 2 . 0 . 4 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   A u d i t o r i a   G l o b a l   d e   S e g u r a n ï¿½ ï¿½ a   e   P e r s i s t ï¿½ ï¿½ n c i a   C l o u d   F i r e s t o r e   -   * * A u d i t   d e   P e r s i s t ï¿½ ï¿½ n c i a   e m   N u v e m   ( F i r e b a s e   F i r e s t o r e ) : * *   A t u a l i z a d o s   t o d o s   o s   m ï¿½ ï¿½ t o d o s   f i n a n c e i r o s   ( C o n t a s   a   P a g a r ,   C o n t a s   a   R e c e b e r ,   I m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   X M L   N F - e ,   P a r c e l a m e n t o s / D ï¿½ ï¿½ v i d a s   e   C o n c i l i a ï¿½ ï¿½ ï¿½ ï¿½ o   B a n c ï¿½ ï¿½ r i a )   e m   [ f i r e b a s e . j s ] ( f i l e : / / / c : / N e x a / N e x A i - C L I N I C / s r c / f i r e b a s e . j s )   p a r a   g r a v a r e m   e   b u s c a r e m   d a d o s   d i r e t a m e n t e   n a s   c o l e ï¿½ ï¿½ ï¿½ ï¿½ e s   d o   * * G o o g l e   C l o u d   F i r e s t o r e * *   c o m   f a l l b a c k   r e s i l i e n t e   p a r a   o   ` m o c k F i r e s t o r e ` .   -   * * S a n i t i z a ï¿½ ï¿½ ï¿½ ï¿½ o   &   R e s i l i ï¿½ ï¿½ n c i a : * *   A d i c i o n a d o s   b l o c o s   d e f e n s i v o s   ` t r y / c a t c h `   e m   t o d a s   a s   r o t a s   d e   A P I   d o   s i s t e m a   p a r a   p r e v e n i r   v a z a m e n t o s   d e   e r r o   e   g a r a n t i r   e s t a b i l i d a d e   d u r a n t e   f a l h a s   t e m p o r ï¿½ ï¿½ r i a s   d e   c o n e x ï¿½ ï¿½ o .     - - -     # #   [ v 2 . 0 . 3 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   L a n ï¿½ ï¿½ a m e n t o   d e   P a r c e l a m e n t o s   /   D ï¿½ ï¿½ v i d a s   e   C o n c i l i a ï¿½ ï¿½ ï¿½ ï¿½ o   B a n c ï¿½ ï¿½ r i a   n o   M ï¿½ ï¿½ d u l o   F i n a n c e i r o   -   * * A b a   P a r c e l a m e n t o s   &   D ï¿½ ï¿½ v i d a s : * *   N o v a   a b a   p a r a   g e s t ï¿½ ï¿½ o   c o m p l e t a   d e   c o n t r a t o s   d e   f i n a n c i a m e n t o s ,   d ï¿½ ï¿½ v i d a s   e   e m p r ï¿½ ï¿½ s t i m o s   d e   l o n g o   p r a z o .   -   * * G e r a ï¿½ ï¿½ ï¿½ ï¿½ o   A u t o m ï¿½ ï¿½ t i c a   M ï¿½ ï¿½ s   a   M ï¿½ ï¿½ s : * *   A o   c a d a s t r a r   u m a   d ï¿½ ï¿½ v i d a   p a r c e l a d a   ( e x :   1 2 x ,   2 4 x ,   3 6 x ) ,   o   s i s t e m a   g e r a   a u t o m a t i c a m e n t e   o s   $ N $   l a n ï¿½ ï¿½ a m e n t o s   m e n s a i s   s e q u e n c i a i s   n o   * * C o n t a s   a   P a g a r * *   ( ` D ï¿½ ï¿½ v i d a :   C r e d o r   ( P a r c .   0 1 / 1 2 ) ` ) .   -   * * G a v e t a   d e   F i c h a   d a   D ï¿½ ï¿½ v i d a : * *   B o t ï¿½ ï¿½ o   p a r a   v i s u a l i z a r   t o d a s   a s   p a r c e l a s   g e r a d a s   e m   C o n t a s   a   P a g a r   c o m   s e u s   r e s p e c t i v o s   s t a t u s   d e   q u i t a ï¿½ ï¿½ ï¿½ ï¿½ o .   -   * * A b a   C o n c i l i a ï¿½ ï¿½ ï¿½ ï¿½ o   B a n c ï¿½ ï¿½ r i a : * *   E x t r a t o   b a n c ï¿½ ï¿½ r i o   e m   t e m p o   r e a l   x   L a n ï¿½ ï¿½ a m e n t o s   d o   F i n a n c e i r o ,   i d e n t i f i c a n d o   b a t i m e n t o s   p e r f e i t o s   ( ï¿½ xxï¿½   C o n c i l i a d o )   e   d i v e r g ï¿½ ï¿½ n c i a s   d e   v a l o r   o u   t a r i f a s   p e n d e n t e s   ( ï¿½ xxï¿½   D i v e r g ï¿½ ï¿½ n c i a ) .   -   * * A ï¿½ ï¿½ ï¿½ ï¿½ o   R ï¿½ ï¿½ p i d a   " C o n c i l i a r   1 - C l i q u e " : * *   P e r m i t e   c r i a r   o   l a n ï¿½ ï¿½ a m e n t o   a u t o m ï¿½ ï¿½ t i c o   n o   F i n a n c e i r o   e   c o n c i l i a r   n o   e x t r a t o   b a n c ï¿½ ï¿½ r i o   c o m   a p e n a s   1   c l i q u e .     - - -     # #   [ v 2 . 0 . 2 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   T e l a   B r a n c a   n o s   M ï¿½ ï¿½ d u l o s   F i n a n c e i r o   e   E s t o q u e   -   * * D e c l a r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   M ï¿½ ï¿½ t r i c a s   O p e r a c i o n a i s : * *   A d i c i o n a d a s   a s   v a r i ï¿½ ï¿½ v e i s   d e   c ï¿½ ï¿½ l c u l o   d e   m ï¿½ ï¿½ t r i c a s   o p e r a c i o n a i s   ( ` p a y a b l e s T o d a y O r O v e r d u e ` ,   ` t o t a l P a y a b l e s T o d a y O r O v e r d u e ` ,   ` r e c e i v a b l e s T o d a y ` ,   ` t o t a l R e c e i v a b l e s T o d a y ` ,   ` r e a l i z e d B a l a n c e ` ,   ` o v e r d u e P a y a b l e s ` ,   e t c . )   n o   e s c o p o   d o   [ F i n a n c e P a n e l . j s x ] ( f i l e : / / / c : / N e x a / N e x A i - C L I N I C / s r c / c o m p o n e n t s / F i n a n c e P a n e l . j s x ) ,   e l i m i n a n d o   a   e x c e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   ` R e f e r e n c e E r r o r ` .   -   * * T r a t a m e n t o   D e f e n s i v o   d e   D a d o s : * *   A d i c i o n a d o s   t r y / c a t c h   f a l l b a c k s   d e f e n s i v o s   p a r a   a s   c o l e ï¿½ ï¿½ ï¿½ ï¿½ e s   d e   e s t o q u e   e   f i n a n c e i r o   e m   [ f i r e b a s e . j s ] ( f i l e : / / / c : / N e x a / N e x A i - C L I N I C / s r c / f i r e b a s e . j s ) ,   g a r a n t i n d o   c a r r e g a m e n t o   1 0 0 %   r e s i l i e n t e   m e s m o   e m   c a s o   d e   l e n t i d ï¿½ ï¿½ o   o u   a u s ï¿½ ï¿½ n c i a   d e   d o c u m e n t o s .     - - -     # #   [ v 2 . 0 . 1 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   L a n ï¿½ ï¿½ a m e n t o   d a   V e r s ï¿½ ï¿½ o   M a j o r   2 . 0 . 1   &   P a i n e l   O p e r a c i o n a l   F i n a n c e i r o   P e r s o n a l i z ï¿½ ï¿½ v e l   -   * * P a i n e l   F i n a n c e i r o   F o c a d o   n a   O p e r a ï¿½ ï¿½ ï¿½ ï¿½ o : * *   R e f o r m u l a d o   o   D a s h b o a r d   d o   M ï¿½ ï¿½ d u l o   F i n a n c e i r o   c o m   q u a d r o s   f o c a d o s   n o   o p e r a d o r   d o   d i a   a   d i a   ( C o n t a s   a   P a g a r   H o j e   /   V e n c i d a s ,   C o n t a s   a   R e c e b e r   H o j e ,   S a l d o   d e   C a i x a   R e a l i z a d o ,   T ï¿½ ï¿½ t u l o s   e m   A t r a s o ) .   -   * * P e r s o n a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   T o t a l   p o r   O p e r a d o r : * *   A d i c i o n a d a   a   f u n c i o n a l i d a d e   ` ï¿½ a"!ï¿½ ï¿½ ï¿½   P e r s o n a l i z a r   P a i n e l `   n o   F i n a n c e i r o ,   p e r m i t i n d o   r e o r d e n a r   ( p o s i ï¿½ ï¿½ ï¿½ ï¿½ o ) ,   a l t e r a r   t a m a n h o s   ( 1   c o l ,   2   c o l ,   4   c o l )   e   o c u l t a r / e x i b i r   q u a d r o s .   A s   p r e f e r ï¿½ ï¿½ n c i a s   s ï¿½ ï¿½ o   s a l v a s   p o r   u s u ï¿½ ï¿½ r i o .   -   * * M a r c o   d e   L a n ï¿½ ï¿½ a m e n t o   V e r s ï¿½ ï¿½ o   2 . 0 : * *   M u d a n ï¿½ ï¿½ a   d a   v e r s ï¿½ ï¿½ o   p r i n c i p a l   p a r a   v 2 . 0 . 1   c o n s o l i d a n d o   a   i n t e g r a ï¿½ ï¿½ ï¿½ ï¿½ o   e n t r e   o s   m ï¿½ ï¿½ d u l o s   d e   N e x a H R ,   F i n a n c e i r o ,   C o m p r a s   e   E s t o q u e .     - - -     # #   [ v 1 . 2 . 4 7 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   I n t e g r a ï¿½ ï¿½ ï¿½ ï¿½ o   T r i p l a :   F i n a n c e i r o   ï¿½ aï¿½   C o m p r a s   ï¿½ aï¿½   E s t o q u e   -   * * E s t o q u e   ï¿½ ~   C o m p r a s   ( R e p o s i ï¿½ ï¿½ ï¿½ ï¿½ o   A u t o m ï¿½ ï¿½ t i c a ) : * *   B o t ï¿½ ï¿½ o   d e   a ï¿½ ï¿½ ï¿½ ï¿½ o   r ï¿½ ï¿½ p i d a   ` ï¿½ x:    P e d i r   C o m p r a `   n o s   i n s u m o s   c o m   e s t o q u e   a b a i x o   d o   m ï¿½ ï¿½ n i m o ,   g e r a n d o   s o l i c i t a ï¿½ ï¿½ ï¿½ ï¿½ e s   a u t o m ï¿½ ï¿½ t i c a s   n o   P o r t a l   d e   C o m p r a s .   -   * * C o m p r a s   ï¿½ ~   F i n a n c e i r o   &   E s t o q u e   ( C o n t a s   a   P a g a r   A u t o m ï¿½ ï¿½ t i c a s ) : * *   A   f i n a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   c o m p r a s   e   c o t a ï¿½ ï¿½ ï¿½ ï¿½ e s   c r i a   i n s t a n t a n e a m e n t e   o   l a n ï¿½ ï¿½ a m e n t o   d e   C o n t a s   a   P a g a r   n o   F i n a n c e i r o   e   a l i m e n t a   o   s a l d o   d o   a l m o x a r i f a d o .   -   * * I m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   N F e   I n t e g r a d a : * *   A   i m p o r t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   X M L   n o   E s t o q u e   d i s p a r a   a u t o m a t i c a m e n t e   a   c r i a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   t ï¿½ ï¿½ t u l o   d e   C o n t a s   a   P a g a r   n o   F i n a n c e i r o   c o m   v e n c i m e n t o ,   f o r n e c e d o r   e   C N P J .   -   * * R e t r o a l i m e n t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   Q u i t a ï¿½ ï¿½ ï¿½ ï¿½ o : * *   A o   q u i t a r   u m   t ï¿½ ï¿½ t u l o   n o   F i n a n c e i r o   ( ` S t a t u s :   P a g o ` ) ,   o   p e d i d o   d e   c o m p r a   e   o   l a n ï¿½ ï¿½ a m e n t o   c o r r e s p o n d e n t e   r e c e b e m   o   b a d g e   d e   q u i t a ï¿½ ï¿½ ï¿½ ï¿½ o   e   a c o m p a n h a m e n t o   e m   t e m p o   r e a l .     - - -     # #   [ v 1 . 2 . 4 6 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   A p r i m o r a m e n t o   d a   I d e n t i f i c a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   C o n t r a t o s   e m   E x p e r i ï¿½ ï¿½ n c i a   -   * * F i l t r o   I n t e l i g e n t e   d e   P e r ï¿½ ï¿½ o d o   P r o b a t ï¿½ ï¿½ r i o : * *   R e f o r m u l a d a   a   l ï¿½ ï¿½ g i c a   d e   d e t e c ï¿½ ï¿½ ï¿½ ï¿½ o   d e   c o n t r a t o s   e m   e x p e r i ï¿½ ï¿½ n c i a   p a r a   c a p t u r a r   a u t o m a t i c a m e n t e   c o l a b o r a d o r e s   c o m   v ï¿½ ï¿½ n c u l o   e x p l ï¿½ ï¿½ c i t o   ` " E x p e r i ï¿½ ï¿½ n c i a " `   o u   a d m i t i d o s   n o s   ï¿½ ï¿½ l t i m o s   9 0   d i a s .   -   * * D e t e c ï¿½ ï¿½ ï¿½ ï¿½ o   d e   A v a l i a ï¿½ ï¿½ ï¿½ ï¿½ e s   e m   4 5   e   9 0   D i a s : * *   O   p a i n e l   a g o r a   c a l c u l a   a s   d a t a s   d e   1 ï¿½ ï¿½   a v a l i a ï¿½ ï¿½ ï¿½ ï¿½ o   ( 4 5   d i a s )   e   t ï¿½ ï¿½ r m i n o   p r o b a t ï¿½ ï¿½ r i o   ( 9 0   d i a s ) ,   e x i b i n d o   o   s t a t u s   a t u a l   e   a   d a t a   d o   p r ï¿½ ï¿½ x i m o   v e n c i m e n t o .   -   * * K P I   " E m   E x p e r i ï¿½ ï¿½ n c i a "   S i n c r o n i z a d o : * *   O   i n d i c a d o r   K P I   d o   P a i n e l   d e   C o n t r o l e   e   a   c a i x a   d e   p r a z o s   a g o r a   c o n t a m   r i g o r o s a m e n t e   t o d o s   o s   c o l a b o r a d o r e s   e m   p e r ï¿½ ï¿½ o d o   d e   e x p e r i ï¿½ ï¿½ n c i a   a t i v o s .     - - -     # #   [ v 1 . 2 . 4 5 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   P a d r o n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   e   S i n c r o n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   C o n t a g e m   d e   F u n c i o n ï¿½ ï¿½ r i o s   A t i v o s   -   * * S i n c r o n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   C o n t a d o r e s : * *   U n i f i c a d a   a   c o n t a g e m   d e   c o l a b o r a d o r e s   a t i v o s   n o   b a d g e   d a   a b a   s u p e r i o r   ( ` F u n c i o n ï¿½ ï¿½ r i o s   ( 1 3 6 ) ` ) ,   a l i n h a n d o   r i g o r o s a m e n t e   c o m   o   K P I   d o   P a i n e l   d e   C o n t r o l e   ( ` T o t a l   d e   F u n c i o n ï¿½ ï¿½ r i o s :   1 3 6 ` ) .   -   * * F i l t r o   d e   S t a t u s   n o   D i r e t ï¿½ ï¿½ r i o : * *   A d i c i o n a d o   s e l e t o r   d e   f i l t r o   n o   d i r e t ï¿½ ï¿½ r i o   d e   f u n c i o n ï¿½ ï¿½ r i o s   p e r m i t i n d o   a l t e r n a r   e n t r e   * * A p e n a s   A t i v o s   ( 1 3 6 ) * * ,   * * I n a t i v o s / D e m i t i d o s   ( 1 9 ) * *   e   * * T o d o s   o s   R e g i s t r o s   ( 1 5 5 ) * * .   -   * * F i l t r o   d e   I n a t i v o s   e m   C a i x a s   d o   P a i n e l : * *   A t u a l i z a d o s   o s   c ï¿½ ï¿½ l c u l o s   e   l i s t a g e n s   d e   a d v e r t ï¿½ ï¿½ n c i a s ,   v a c i n a s   e   v e n c i m e n t o   d e   c o n t r a t o s   n o   P a i n e l   d e   C o n t r o l e   p a r a   c o n s i d e r a r   e s t r i t a m e n t e   o s   c o l a b o r a d o r e s   a t i v o s .     - - -     # #   [ v 1 . 2 . 4 4 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   V i s u a l   e   M e l h o r i a s   d e   U X   n o   M o d a l   d e   G e s t ï¿½ ï¿½ o   d e   U s u ï¿½ ï¿½ r i o s   -   * * C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   d a   T r a n s p a r ï¿½ ï¿½ n c i a   d e   F u n d o : * *   C o r r i g i d o   p r o b l e m a   d e   t r a n s p a r ï¿½ ï¿½ n c i a   n o   c o n t a i n e r   d o   m o d a l   d e   c a d a s t r o / e d i ï¿½ ï¿½ ï¿½ ï¿½ o   d e   u s u ï¿½ ï¿½ r i o s ,   o n d e   t e x t o s   d a   t a b e l a   d e   f u n d o   f i c a v a m   s o b r e p o s t o s   a o s   c a m p o s .   -   * * O p a c i d a d e   e   Z - I n d e x : * *   A t u a l i z a d a   a   s o b r e p o s i ï¿½ ï¿½ ï¿½ ï¿½ o   ( ` m o d a l O v e r l a y ` )   c o m   d e s f o q u e   d e   f u n d o   ( ` b a c k d r o p F i l t e r :   b l u r ( 4 p x ) ` )   e   z - i n d e x   p r i o r i t ï¿½ ï¿½ r i o   ( 9 9 9 9 9 ) .   -   * * D e s i g n   S y s t e m   U X : * *   A p l i c a d o   f u n d o   b r a n c o   s ï¿½ ï¿½ l i d o   ( ` # f f f f f f ` )   1 0 0 %   o p a c o ,   c a n t o s   a r r e d o n d a d o s   ( ` 1 6 p x ` ) ,   s o m b r a s   s u a v e s ,   b o r d a s   d e   s e p a r a ï¿½ ï¿½ ï¿½ ï¿½ o   e   ï¿½ ï¿½ c o n e s   n o s   c a b e ï¿½ ï¿½ a l h o s   d e   f o r m u l ï¿½ ï¿½ r i o .     - - -     # #   [ v 1 . 2 . 4 3 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   M e l h o r i a s   d e   U X   n o   M ï¿½ ï¿½ d u l o   N e x a H R ,   O r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   e   P e r s o n a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   P a i n e l   -   * * F i c h a   d o   F u n c i o n ï¿½ ï¿½ r i o   C l i c ï¿½ ï¿½ v e l : * *   N o m e   e   f o t o   d o s   f u n c i o n ï¿½ ï¿½ r i o s   t o r n a d o s   c l i c ï¿½ ï¿½ v e i s   e m   t o d a s   a s   t a b e l a s   e   p a i n ï¿½ ï¿½ i s   d o   R H   p a r a   a c e s s o   i n s t a n t ï¿½ ï¿½ n e o   ï¿½ ï¿½   f i c h a   c a d a s t r a l .   -   * * O r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   D i n ï¿½ ï¿½ m i c a   d e   C o l u n a s : * *   A d i c i o n a d a   f u n c i o n a l i d a d e   d e   o r d e n a ï¿½ ï¿½ ï¿½ ï¿½ o   p o r   c o l u n a   ( N o m e ,   C P F ,   S e t o r / C a r g o ,   C o n t r a t o ,   A d m i s s ï¿½ ï¿½ o ,   P e n d ï¿½ ï¿½ n c i a s )   c o m   i n d i c a d o r e s   v i s u a i s   n a   l i s t a   d e   f u n c i o n ï¿½ ï¿½ r i o s .   -   * * I n c l u s ï¿½ ï¿½ o   d o   B e t i m C A R D : * *   A d i c i o n a d a   a   o p ï¿½ ï¿½ ï¿½ ï¿½ o   " B e t i m C A R D "   n a   s e l e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   t i p o   d e   c a r t ï¿½ ï¿½ o   d o   b e n e f ï¿½ ï¿½ c i o   d e   V a l e - T r a n s p o r t e .   -   * * P a i n e l   d e   C o n t r o l e   C u s t o m i z ï¿½ ï¿½ v e l   p o r   U s u ï¿½ ï¿½ r i o : * *   I m p l e m e n t a d o   m o d o   d e   o r g a n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   e   r e p o s i c i o n a m e n t o   d a s   c a i x a s / c a r d s   d o   P a i n e l   d e   C o n t r o l e   c o m   p e r s i s t ï¿½ ï¿½ n c i a   a u t o m ï¿½ ï¿½ t i c a   n o   p e r f i l   d o   u s u ï¿½ ï¿½ r i o   n o   C l o u d   F i r e s t o r e   e   l o c a l S t o r a g e .   -   * * T a m a n h o s   P e r s o n a l i z ï¿½ ï¿½ v e i s   d e   C a i x a s   ( D e f a u l t   P e q u e n o ) : * *   P e r m i t e   c o n f i g u r a r   a   d i m e n s ï¿½ ï¿½ o   d e   c a d a   c a i x a   d o   P a i n e l   ( P e q u e n o ,   M ï¿½ ï¿½ d i o ,   G r a n d e ) ,   m a n t e n d o   t o d a s   e m   t a m a n h o   p e q u e n o   p o r   p a d r ï¿½ ï¿½ o   p a r a   m ï¿½ ï¿½ x i m o   a p r o v e i t a m e n t o   v i s u a l .     - - -     # #   [ v 1 . 2 . 4 1 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   C o r r e ï¿½ ï¿½ ï¿½ ï¿½ o   D e f i n i t i v a   d e   F a l l b a c k   e   P e r m i s s ï¿½ ï¿½ e s   d e   L e i t u r a   n o   F i r e s t o r e   -   * * E s t a b i l i d a d e   n o   C a r r e g a m e n t o : * *   A j u s t e   e s t r u t u r a l   n o   f l u x o   d e   a u t e n t i c a ï¿½ ï¿½ ï¿½ ï¿½ o ,   s e p a r a n d o   a   l e i t u r a   d a   e s c r i t a   d o   p e r f i l   n a   n u v e m .   I s s o   g a r a n t e   a   e x i b i ï¿½ ï¿½ ï¿½ ï¿½ o   c o r r e t a   d o s   m ï¿½ ï¿½ d u l o s   ( c o m   b a s e   n a s   p e r m i s s ï¿½ ï¿½ e s   d e   c a d a   u s u ï¿½ ï¿½ r i o )   m e s m o   q u a n d o   f a l h a s   d e   p e r m i s s ï¿½ ï¿½ o   d e   g r a v a ï¿½ ï¿½ ï¿½ ï¿½ o   o u   r e d e   o c o r r a m .     - - -     # #   [ v 1 . 2 . 4 0 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   L i m p e z a   d e   U s u ï¿½ ï¿½ r i o s   D u p l i c a d o s   e   R e s t r i ï¿½ ï¿½ ï¿½ ï¿½ o   E s t r i t a   d e   A c e s s o   R H / B I   -   * * D e s d u p l i c a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   C a d a s t r o s   n o   F i r e s t o r e   C l o u d : * *   I m p l e m e n t a d a   l i m p e z a   a u t o m ï¿½ ï¿½ t i c a   n a   f u n ï¿½ ï¿½ ï¿½ ï¿½ o   ` g e t U s e r s ( ) `   q u e   i d e n t i f i c a   r e g i s t r o s   d u p l i c a d o s   p o r   e - m a i l   ( e x :   ` a n a c g @ n e x a . c o m `   e   ` c o n t a t o @ t e c h c o s t a . n e t ` ) ,   r e t ï¿½ ï¿½ m   a u t o m a t i c a m e n t e   o   c a d a s t r o   c o m   n o m e   m a i s   c o m p l e t o / e x t e n s o   e   e x c l u i   o s   r e g i s t r o s   d u p l i c a d o s   a n t i g o s .   -   * * T r a v a   d e   S e g u r a n ï¿½ ï¿½ a   d e   P o r t a i s   R H : * *   A p l i c a d o   f i l t r o   e s t r i t o   n o   ` M o d u l e S e l e c t o r . j s x `   c o n s i d e r a n d o   ` u s e r . a l l o w e d S e c t o r s `   e   ` u s e r . r o l e ` ,   g a r a n t i n d o   q u e   p e r f i s   d e   R e c u r s o s   H u m a n o s   s ï¿½ ï¿½   v i s u a l i z e m   o s   p o r t a i s   d e   * * R e c u r s o s   H u m a n o s   ( N e x a H R ) * *   e   * * G e s t ï¿½ ï¿½ o   d a   Q u a l i d a d e   ( N e x a I N D E X   -   B I ) * * .     - - -     # #   [ v 1 . 2 . 3 8 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   P e r s i s t ï¿½ ï¿½ n c i a   F u l l t i m e   d e   R B A C   e   S a a S   n o   F i r e b a s e   C l o u d   ( N u v e m )   -   * * P e r s i s t ï¿½ ï¿½ n c i a   C l o u d   F i r e s t o r e : * *   L e i t u r a   e   g r a v a ï¿½ ï¿½ ï¿½ ï¿½ o   d a s   t a b e l a s   d e   p e r m i s s ï¿½ ï¿½ e s   ( ` u s e r _ p r o f i l e s ` )   e   c o n f i g u r a ï¿½ ï¿½ ï¿½ ï¿½ e s   S a a S   ( ` t e n a n t _ s e t t i n g s ` )   i n t e g r a d a s   d i r e t a m e n t e   a o   b a n c o   d e   d a d o s   d o   G o o g l e   C l o u d   F i r e s t o r e .   -   * * R e g r a s   d o   F i r e s t o r e   ( ` f i r e s t o r e . r u l e s ` ) : * *   A d i c i o n a d a   r e g r a   d e   s e g u r a n ï¿½ ï¿½ a   p a r a   a   c o l e ï¿½ ï¿½ ï¿½ ï¿½ o   ` u s e r _ p r o f i l e s `   n a   n u v e m .   -   * * V a l i d a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   P e r f i l   R H : * *   G a r a n t i d o   o   f a l l b a c k   c o r r e t o   p a r a   o   p e r f i l   d e   R e c u r s o s   H u m a n o s   v i s u a l i z a n d o   e s t r i t a m e n t e   o   p o r t a l   * * N e x a H R * *   e   o   p o r t a l   * * N e x a I N D E X   ( B I ) * * .     - - -     # #   [ v 1 . 2 . 3 6 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   I n t e g r a ï¿½ ï¿½ ï¿½ ï¿½ o   D i n ï¿½ ï¿½ m i c a   d a   M a t r i z   d e   P e r m i s s ï¿½ ï¿½ e s   R B A C   ( M ï¿½ ï¿½ d u l o   T . I . )   -   * * V a l i d a ï¿½ ï¿½ ï¿½ ï¿½ o   R B A C   e m   T e m p o   R e a l : * *   C o n e c t a d a   a   m a t r i z   d e   p e r m i s s ï¿½ ï¿½ e s   d e   p e r f i s   ( ` u s e r _ p r o f i l e s ` )   s a l v a   p e l o   p a i n e l   d e   T . I .   ( ` N e x a C O N F I G ` )   d i r e t a m e n t e   a o   f i l t r o   d e   m ï¿½ ï¿½ d u l o s   v i s ï¿½ ï¿½ v e i s   n o   ` M o d u l e S e l e c t o r . j s x ` .   -   * * F i l t r o   P e r s o n a l i z a d o   p o r   P e r f i l : * *   A s   p e r m i s s ï¿½ ï¿½ e s   d o   p e r f i l   ( p o r   e x e m p l o ,   R e c u r s o s   H u m a n o s   c o n f i g u r a d o   p a r a   B I   e   R H   c o m   v a l o r   ` ' r e a d ' ` / ` ' w r i t e ' `   e   d e m a i s   c o m o   ` ' n o n e ' ` )   a g o r a   d e t e r m i n a m   e m   t e m p o   r e a l   q u a i s   p o r t a i s   s ï¿½ ï¿½ o   e x i b i d o s   n a   t e l a   i n i c i a l ,   o c u l t a n d o   c o m   p r e c i s ï¿½ ï¿½ o   t o d o s   o s   p o r t a i s   m a r c a d o s   c o m o   s e m   a c e s s o   ( ` n o n e ` ) .     - - -     # #   [ v 1 . 2 . 3 4 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   A j u s t e   d e   P e r f i l   R H   &   O c u l t a ï¿½ ï¿½ ï¿½ ï¿½ o   A u t o m ï¿½ ï¿½ t i c a   d e   M ï¿½ ï¿½ d u l o s   R e s t r i t o s   -   * * O c u l t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   M ï¿½ ï¿½ d u l o s : * *   O s   p o r t a i s   p a r a   o s   q u a i s   o   p e r f i l   l o g a d o   n ï¿½ ï¿½ o   p o s s u i   a c e s s o   a g o r a   f i c a m   * * c o m p l e t a m e n t e   o c u l t o s * * ,   e x i b i n d o   n a   t e l a   i n i c i a l   a p e n a s   o s   m ï¿½ ï¿½ d u l o s   p e r m i t i d o s .   -   * * P e r f i l   R e c u r s o s   H u m a n o s   ( ` a n a c g @ n e x a . c o m ` ) : * *   R e s t a b e l e c i d o   o   p e r f i l   d e d i c a d o   ` r h `   p a r a   a   u s u ï¿½ ï¿½ r i a ,   p e r m i t i n d o   a c e s s o   d i r e t o   a o   p o r t a l   d e   * * R e c u r s o s   H u m a n o s   &   B e n e f ï¿½ ï¿½ c i o s * *   e   a o   p o r t a l   * * G e s t ï¿½ ï¿½ o   d a   Q u a l i d a d e   &   B I * *   ( i n d i c a d o r e s   d e   T u r n o v e r   e   A b s e n t e ï¿½ ï¿½ s m o   d o   R H ) .     - - -     # #   [ v 1 . 2 . 3 2 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   S i n c r o n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   R e a l t i m e   n o   F i r e b a s e   C l o u d   &   R e c u p e r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   A c e s s o s   -   * * S i n c r o n i z a ï¿½ ï¿½ ï¿½ ï¿½ o   e m   T e m p o   R e a l   ( M u l t i - d i s p o s i t i v o ) : * *   A t i v a d a   c o n e x ï¿½ ï¿½ o   d i r e t a   c o m   o   G o o g l e   C l o u d   F i r e b a s e   ( F i r e s t o r e ) ,   d e s a t i v a n d o   o   m o d o   m o c k   i s o l a d o   l o c a l   p a r a   g a r a n t i r   q u e   d a d o s   d e   f u n c i o n ï¿½ ï¿½ r i o s   d o   R H   e   c a d a s t r o s   s e j a m   s i n c r o n i z a d o s   s i m u l t a n e a m e n t e   e n t r e   t o d o s   o s   c o m p u t a d o r e s .   -   * * A u t o - P r o v i s i o n a m e n t o   d e   F u n c i o n ï¿½ ï¿½ r i o s : * *   I m p l e m e n t a d a   r o t i n a   n o   F i r e s t o r e   p a r a   s e m e a r   e   s i n c r o n i z a r   o   b a n c o   d e   d a d o s   d o   R H   n a   n u v e m   c a s o   a   c o l e ï¿½ ï¿½ ï¿½ ï¿½ o   d e   f u n c i o n ï¿½ ï¿½ r i o s   e s t e j a   v a z i a .   -   * * G a r a n t i a   d e   A c e s s o   A d m i n   n a   N u v e m : * *   R e c u p e r a d o   e   g a r a n t i d o   o   a c e s s o   e   p e r f i l   ` a d m i n `   c o m   p e r m i s s ï¿½ ï¿½ o   t o t a l   p a r a   ` c o n t a t o @ t e c h c o s t a . n e t ` ,   ` a n a c g @ n e x a . c o m `   e   ` j s o a r e s @ n e x a . c o m `   n o   F i r e s t o r e   C l o u d .   -   * * R e g r a s   d o   F i r e s t o r e : * *   A t u a l i z a d o   o   a r q u i v o   ` f i r e s t o r e . r u l e s `   a d i c i o n a n d o   r e g r a s   d e   s e g u r a n ï¿½ ï¿½ a   e   p e r m i s s ï¿½ ï¿½ e s   d e   l e i t u r a / e s c r i t a   p a r a   t o d a s   a s   c o l e ï¿½ ï¿½ ï¿½ ï¿½ e s   o p e r a c i o n a i s   n a   n u v e m   ( ` e m p l o y e e s ` ,   ` p u r c h a s e s ` ,   ` s t o c k _ i t e m s ` ,   ` s h i f t s ` ,   e t c . ) .     - - -     # #   [ v 1 . 2 . 3 0 ]   -   3 0   d e   J u l h o ,   2 0 2 6   # # #   A d e q u a ï¿½ ï¿½ ï¿½ ï¿½ o   L G P D ,   P o s i c i o n a m e n t o   d e   G e s t ï¿½ ï¿½ o   H o s p i t a l a r   e   U s u ï¿½ ï¿½ r i o s   O f i c i a i s   -   * * L G P D   /   S e g u r a n ï¿½ ï¿½ a : * *   R e m o ï¿½ ï¿½ ï¿½ ï¿½ o   c o m p l e t a   d a   e x i b i ï¿½ ï¿½ ï¿½ ï¿½ o   d e   e - m a i l s   e   c r e d e n c i a i s   n a   t e l a   i n i c i a l   d e   l o g i n   p ï¿½ ï¿½ b l i c a .   -   * * I n s t i t u c i o n a l : * *   A t u a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   d o   s u b t ï¿½ ï¿½ t u l o   p a r a   " S i s t e m a   d e   G e s t ï¿½ ï¿½ o   d e   C l ï¿½ ï¿½ n i c a s   e   H o s p i t a i s " .   -   * * A c e s s o s   &   P e r m i s s ï¿½ ï¿½ e s : * *   P r o v i s i o n a m e n t o   e   l i b e r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   p e r f i s   d e   A d m i n i s t r a d o r   c o m   a c e s s o   t o t a l   a   t o d o s   o s   s e t o r e s   p a r a   o s   u s u ï¿½ ï¿½ r i o s   o f i c i a i s   ` c o n t a t o @ t e c h c o s t a . n e t ` ,   ` a n a c g @ n e x a . c o m `   e   ` j s o a r e s @ n e x a . c o m ` .   -   * * L i m p e z a   d e   B a n c o : * *   R e m o ï¿½ ï¿½ ï¿½ ï¿½ o   a u t o m ï¿½ ï¿½ t i c a   d e   u s u ï¿½ ï¿½ r i o s   f i c t ï¿½ ï¿½ c i o s   d e   d e m o n s t r a ï¿½ ï¿½ ï¿½ ï¿½ o   ( ` @ c l i n i c a . c o m ` ) .     - - -     # #   [ v 1 . 2 . 2 4 ]   -   1 7   d e   J u l h o ,   2 0 2 6   # # #   M ï¿½ ï¿½ d u l o   N e x a C A L   ( A g e n d a   &   C o n s u l t a s )   -   G r a d e   h o r ï¿½ ï¿½ r i a   c o m   m u l t i v i s u a l i z a ï¿½ ï¿½ ï¿½ ï¿½ o   ( D i ï¿½ ï¿½ r i a ,   S e m a n a l   e   M e n s a l )   c o m   s u p o r t e   a   f i l t r o s   r ï¿½ ï¿½ p i d o s   p o r   p r o f i s s i o n a l .   -   B l o q u e a d o r   d e   c o n f l i t o   d e   g r a d e   d e   e s c a l a   m ï¿½ ï¿½ d i c a   e m   t e m p o   r e a l .   -   F l u x o   i n t e g r a d o   c o m   r e c e p ï¿½ ï¿½ ï¿½ ï¿½ o   p e r m i t i n d o   m u d a r   s t a t u s   d e   c o m p a r e c i m e n t o   c o m   b o t ï¿½ ï¿½ o   " C h e g o u   ï¿½ ï¿½   C l ï¿½ ï¿½ n i c a " .   -   S i m u l a d o r   d e   r e s p o s t a s   d e   p r ï¿½ ï¿½ - c o n f i r m a ï¿½ ï¿½ ï¿½ ï¿½ o   v i a   W h a t s A p p   ( S I M / N ï¿½ ï¿½O ) .     - - -     # #   [ v 1 . 2 . 2 2 ]   -   1 7   d e   J u l h o ,   2 0 2 6   # # #   M ï¿½ ï¿½ d u l o   N e x a P R O C U R E   ( C o m p r a s   &   C o t a ï¿½ ï¿½ ï¿½ ï¿½ e s )   -   F l u x o   d e   r e q u i s i ï¿½ ï¿½ ï¿½ ï¿½ o   p a r a   f u n c i o n ï¿½ ï¿½ r i o s   ( r e p o s i ï¿½ ï¿½ ï¿½ ï¿½ o   d e   e s t o q u e   e x i s t e n t e   o u   n o v o s   i t e n s ) .   -   S t e p p e r   T i m e l i n e   v i s u a l   d e   s t a t u s   d o   p e d i d o .   -   C e n t r a l   d e   A p r o v a ï¿½ ï¿½ ï¿½ ï¿½ e s   e m   m ï¿½ ï¿½ l t i p l o s   n ï¿½ ï¿½ v e i s   d e   a l ï¿½ ï¿½ a d a   ( G e s t o r e s   e   D i r e t o r e s ) .   -   P a i n e l   d e   c o m p a r a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   c o t a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   3   o r ï¿½ ï¿½ a m e n t o s   c o m   i n d i c a ï¿½ ï¿½ ï¿½ ï¿½ o   d e   m e n o r   p r e ï¿½ ï¿½ o .     - - -     # #   [ v 1 . 2 . 1 6 ]   -   1 7   d e   J u l h o ,   2 0 2 6   # # #   Q u a d r o   d e   P r e s e n ï¿½ ï¿½ a   P r e m i a d a   n o   N e x a H R   -   A d i c i o n a d o   q u a d r o   d e   P r e s e n ï¿½ ï¿½ a   P r e m i a d a   n o   d a s h b o a r d   d e   c o n t r o l e   c o m   e l e g i b i l i d a d e .   -   F i l t r o   a u t o m a t i z a d o   d e   e l e g i b i l i d a d e   c o m   b a s e   e m   f a l t a s ,   a t e s t a d o s   e   a d v e r t ï¿½ ï¿½ n c i a s .   -   C o n f i g u r a ï¿½ ï¿½ ï¿½ ï¿½ o   d i n ï¿½ ï¿½ m i c a   d o   v a l o r   d o   p r ï¿½ ï¿½ m i o   d e   a s s i d u i d a d e   i n d i v i d u a l .  
 

/**
 * Base de Dados Oficial: 15 Treinamentos Especializados em Nefrologia e Hemodiálise
 * Nex-Ai CLINIC — Educação Continuada e Conformidade Sanitária (ANVISA RDC 11/2014 & NR-32)
 * 
 * Cada treinamento contém:
 * - Ementa e conteúdo programático completo (Markdown com tópicos técnicos e normas)
 * - Exatamente 5 perguntas de Pré-teste (diagnóstico de entrada)
 * - Exatamente 5 perguntas de Pós-teste (avaliação de fixação com justificativa/explicação)
 * - Carga horária, setor-alvo, nota de corte e tempo mínimo de estudo.
 */

export const NEPHROLOGY_TRAININGS = [
  // -------------------------------------------------------------------------
  // 1. ENFERMAGEM: FÍSTULA ARTERIOVENOSA (FAV)
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-fav',
    title: 'Manejo, Punção e Preservação da Fístula Arteriovenosa (FAV)',
    description: 'Protocolos de avaliação clínica pré-diálise, técnica asséptica de canulação, hemostasia segura e orientações de preservação do acesso vascular.',
    sector: 'Enfermagem',
    workloadHours: 4,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 5,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Enfª Especialista em Nefrologia / Acessos Vasculares',
    instructorRole: 'Coordenação de Enfermagem Dialítica',
    textContent: `### 1. Avaliação Clínica Pré-Punção da FAV
Antes de qualquer punção, o profissional de enfermagem deve obrigatoriamente inspecionar, palpar e auscultar o trajeto venoso:
- **Inspeção:** Verificar presença de hematomas, áreas hiperemiadas, secreções, dilatações aneurismáticas excessivas ou sinais de isquemia na mão ipsilateral (síndrome do roubo de fluxo).
- **Palpação:** Sentir o frêmito (*thrill*) ao longo de toda a extensão da veia arterializada e na anastomose. Frêmito fraco ou ausente sugere estenose grave ou trombose iminente.
- **Ausculta:** Auscultar o sopro característico (contínuo e de baixa tonalidade). Um sopro agudo ou descontinuado indica provável área de estenose vascular.

### 2. Antissepsia Rigorosa e Técnica de Canulação
- **Higienização:** O paciente deve lavar o membro com água e sabonete degermante antes de entrar na sala de hemodiálise.
- **Antissepsia:** Aplicação de Clorexidina Alcoólica 0,5% a 2% em movimentos unidirecionais ou circulares do centro para a periferia, aguardando o tempo de secagem espontânea (30 a 60 segundos).
- **Direção e Calibre das Agulhas:**
  - Agulha arterial: Puncionada no sentido do fluxo ou retrógrado (conforme anatomia), respeitando distância mínima de 3 cm da anastomose cirúrgica.
  - Agulha venosa: Sempre puncionada no sentido antegrado (em direção ao coração).
  - Distância entre agulhas: Manter distância de 3 a 5 cm entre os biséis das duas agulhas para evitar a temida recirculação sanguínea (que compromete a eficácia dialítica).
- **Técnicas de Punção:** Rotação sistemática dos sítios (técnica em escada) para evitar adelgaçamento e aneurismas, ou técnica de botoeira (*buttonhole*) estritamente com agulhas rombas após formação do túnel.

### 3. Hemostasia Pós-Diálise e Preservação
- Retirada da agulha: Nunca comprimir enquanto a agulha ainda estiver dentro do vaso. A compressão só deve iniciar após a retirada completa do bisel.
- Técnica de compressão: Pressão digital suave e contínua com gaze estéril por 10 a 15 minutos, garantindo que o frêmito continue palpável distalmente.
- Proibição de garrotes e curativos apertados: O uso de garrotes de borracha mantidos ou curativos excessivamente compressivos é uma das causas mais comuns de trombose da fístula.
- Recomendações ao paciente: Não carregar peso no membro da FAV, não aferir pressão arterial e não colher exames laboratoriais no braço da fístula.`,
    preTestQuestions: [
      {
        id: 'fav-pre-1',
        question: 'Qual a avaliação propedêutica mandatória antes de puncionar a fístula arteriovenosa?',
        options: ['Inspeção visual rápida apenas', 'Palpação obrigatória do frêmito e ausculta do sopro contínuo', 'Aplicação de garrote metálico', 'Lavagem com álcool comum'],
        correctIndex: 1
      },
      {
        id: 'fav-pre-2',
        question: 'Qual o antisséptico padrão ouro para o preparo da pele antes da canulação da FAV?',
        options: ['Álcool 70% simples', 'Clorexidina alcoólica com secagem espontânea', 'Soro fisiológico estéril', 'Éter hospitalar'],
        correctIndex: 1
      },
      {
        id: 'fav-pre-3',
        question: 'Qual a distância mínima recomendada entre as agulhas arterial e venosa para prevenir a recirculação sanguínea?',
        options: ['1 cm', 'Pelo menos 3 a 5 cm', '10 a 15 cm', 'Não há distância mínima'],
        correctIndex: 1
      },
      {
        id: 'fav-pre-4',
        question: 'Como deve ser realizada a hemostasia no sítio de punção ao término da sessão?',
        options: ['Garroteamento de borracha mantido por 2 horas', 'Compressão manual suave de 10 a 15 min preservando o frêmito', 'Curativo de esparadrapo muito apertado sem compressão', 'Deixar sangrar até parar sozinho'],
        correctIndex: 1
      },
      {
        id: 'fav-pre-5',
        question: 'A verificação da pressão arterial (PA) e punções venosas para exames no braço com FAV são:',
        options: ['Permitidas se a fístula for madura', 'Terminantemente proibidas pelo risco de oclusão e trombose', 'Recomendadas antes de cada sessão', 'Obrigatórias no membro da fístula'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'fav-post-1',
        question: 'A constatação de frêmito fraco ou sopro agudo/descontínuo no trajeto da FAV indica:',
        options: ['Excelente fluxo de sangue', 'Possível estenose ou trombose iminente necessitando de avaliação vascular', 'Que a fístula pode receber agulha de maior calibre', 'Que a diálise pode correr com fluxo máximo de 500 mL/min'],
        correctIndex: 1,
        explanation: 'Alterações no timbre do sopro e enfraquecimento do frêmito são sinais precoces de estenose vascular que devem ser investigados por Eco-Doppler.'
      },
      {
        id: 'fav-post-2',
        question: 'Por que a técnica de punção em escada (rotação de sítios) é indispensável para a longevidade da FAV?',
        options: ['Para facilitar o trabalho do técnico', 'Para evitar dilatações aneurismáticas e enfraquecimento da parede vascular', 'Porque a cada sessão a veia muda de lugar', 'Para acelerar a retirada da agulha'],
        correctIndex: 1,
        explanation: 'Puncionar repetidamente o mesmo ponto enfraquece a túnica média do vaso, predispondo a aneurismas e rupturas hemorrágicas.'
      },
      {
        id: 'fav-post-3',
        question: 'Ao retirar a agulha da FAV ao término da diálise, a compressão do sítio deve iniciar:',
        options: ['Ainda com o bisel dentro do vaso para estancar mais rápido', 'Imediatamente após a retirada total da agulha, nunca com ela no interior do vaso', 'Apenas 5 minutos após a remoção', 'Com garrote de borracha colocado no braço'],
        correctIndex: 1,
        explanation: 'Comprimir a pele com a agulha ainda introduzida lacera o endotélio vascular e desencadeia sangramentos de difícil controle.'
      },
      {
        id: 'fav-post-4',
        question: 'O que caracteriza a síndrome do roubo de fluxo em pacientes portadores de FAV?',
        options: ['Excesso de peso interdialítico', 'Dor, palidez, parestesia e frialdade na mão ipsilateral por desvio arterial para a fístula', 'Aumento repentino da pressão venosa na máquina', 'Febre alta durante a diálise'],
        correctIndex: 1,
        explanation: 'A fístula desvia grande volume sanguíneo da circulação distal, podendo isquemiante a mão do paciente.'
      },
      {
        id: 'fav-post-5',
        question: 'Qual das orientações a seguir deve ser enfatizada na alta do paciente dialítico?',
        options: ['Dormir de lado apoiando todo o peso sobre o braço da fístula', 'Nunca medir PA, não colher sangue e não carregar peso no membro da FAV', 'Usar relógios e pulseiras apertadas para firmar o vaso', 'Suspender a lavagem do braço'],
        correctIndex: 1,
        explanation: 'Adornos e compressão externa prejudicam a perfusão da FAV e são as principais causas de trombose doméstica.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 2. ENFERMAGEM: CATETER VENOSO CENTRAL (CVC / PERMCATH)
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-cvc',
    title: 'Prevenção de Infecções e Boas Práticas em Cateteres de Hemodiálise (CVC e Permcath)',
    description: 'Protocolos estritos de antissepsia, técnica de "Scrub the Hub", curativos, infusão de selo heparínico e condutas frente a bacteremia.',
    sector: 'Enfermagem',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Enfª Responsável pela CCIH / SCIH',
    instructorRole: 'Comissão de Controle de Infecção Hospitalar',
    textContent: `### 1. Infecções Relacionadas a Cateter (IPCS) em Hemodiálise
O cateter venoso central (temporário ou tunelizado de longa permanência / Permcath) representa o maior fator de risco para septicemia e óbito em terapia renal substitutiva. A prevenção depende de adesão absoluta aos protocolos de barreira máxima.

### 2. Abertura, Manipulação e Fricção ("Scrub the Hub")
- Uso de EPIs: Máscara cirúrgica no profissional e no paciente (virando a cabeça para o lado oposto), óculos e luvas de procedimento estéreis durante a conexão.
- **Técnica "Scrub the Hub":** Desinfecção ativa com gaze embebida em álcool a 70% ou clorexidina alcoólica por no mínimo 15 segundos vigorosos em cada conector (*hub*) antes de desrosquear as tampas ou conectar as linhas de sangue.
- Deixar secar completamente antes de abrir as vias do cateter.

### 3. Aspiração e Selamento com Heparina / Citrato
- Aspiração pré-diálise: Sempre aspirar e descartar o volume do selo heparínico prévio (aproximadamente 2 a 3 mL de cada via) verificando a presença de coágulos. Nunca injetar o selo de heparina diretamente na circulação do paciente!
- Verificação do fluxo: Testar o fluxo e refluxo de sangue com seringa de 10 mL suavemente.
- Selamento pós-diálise: Injetar solução de heparina pura ou diluída exatamente no volume nominal impresso em cada ramo (arterial e venoso) do cateter para evitar tanto trombose quanto anticoagulação sistêmica acidental.

### 4. Troca de Curativos e Manejo de Sinais Infecciosos
- Curativo com gaze e micropore: Troca a cada sessão de hemodiálise (48h) ou imediatamente se úmido, solto ou com sujidade.
- Curativo com filme transparente estéril: Troca a cada 7 dias na ausência de exsudato.
- Febre intradialítica ou calafrios: Coleta imediata de 2 pares de hemoculturas (um do cateter e um de veia periférica) antes do início da antibioticoterapia prescrita.`,
    preTestQuestions: [
      {
        id: 'cvc-pre-1',
        question: 'Qual a principal via de entrada de bactérias causadoras de infecção de corrente sanguínea em cateteres de diálise?',
        options: ['Pela pele íntegra da perna', 'Pelas conexões (hubs) manipuladas sem a desinfecção adequada e pelo óstio do cateter', 'Pelo circuito de ar condicionado', 'Pela ingestão de água'],
        correctIndex: 1
      },
      {
        id: 'cvc-pre-2',
        question: 'O que o profissional e o paciente devem utilizar obrigatoriamente durante a manipulação do cateter?',
        options: ['Apenas avental simples', 'Máscara cobrindo nariz e boca (com paciente virando o rosto para o lado oposto)', 'Nenhum EPI é obrigatório', 'Apenas protetor auricular'],
        correctIndex: 1
      },
      {
        id: 'cvc-pre-3',
        question: 'Qual o tempo mínimo preconizado de fricção com álcool a 70% nos conectores do cateter ("Scrub the Hub")?',
        options: ['2 segundos', 'No mínimo 15 segundos vigorosos com gaze embebida', '30 minutos', 'Basta encostar a gaze'],
        correctIndex: 1
      },
      {
        id: 'cvc-pre-4',
        question: 'Ao iniciar a diálise, o selo de heparina que estava no cateter desde a sessão anterior deve ser:',
        options: ['Injetado rapidamente no paciente', 'Aspirado e descartado junto com possíveis coágulos residuais', 'Completado com soro glicosado', 'Deixado dentro do paciente'],
        correctIndex: 1
      },
      {
        id: 'cvc-pre-5',
        question: 'Qual a conduta imediata se o paciente apresentar calafrios e febre súbita durante a hemodiálise?',
        options: ['Aumentar o fluxo da bomba de sangue', 'Comunicar ao médico, coletar hemoculturas pareadas (cateter e periférico) e seguir protocolo de bacteremia', 'Encerrar o atendimento sem registrar', 'Oferecer água gelada apenas'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'cvc-post-1',
        question: 'Por que o selo heparínico prévio não deve ser injetado no paciente ao iniciar a sessão?',
        options: ['Porque pode manchar a tubulação', 'Porque pode infundir coágulos no leito vascular e causar heparinização sistêmica indesejada', 'Porque altera a cor do dialisato', 'Porque neutraliza o bicarbonato'],
        correctIndex: 1,
        explanation: 'Injetar o selo pode liberar trombos no sistema vascular pulmonar e provocar risco de hemorragia aguda decorrente da heparina concentrada.'
      },
      {
        id: 'cvc-post-2',
        question: 'O que deve ser respeitado ao instilar o selo de heparina ao término da sessão?',
        options: ['Injetar 10 mL em cada via independente do modelo', 'Injetar exatamente o volume luminal interno gravado pelo fabricante em cada ramo do cateter', 'Injetar apenas água bidestilada', 'Encher até transbordar'],
        correctIndex: 1,
        explanation: 'Volumes superiores extravasam para a circulação sistêmica e volumes menores deixam a ponta do cateter desprotegida propensa à trombose.'
      },
      {
        id: 'cvc-post-3',
        question: 'Qual a periodicidade de troca do curativo de cateter com gaze estéril e fita microporosa?',
        options: ['A cada 15 dias', 'A cada sessão de hemodiálise (48 horas) ou imediatamente se úmido, sujo ou descolado', 'Uma vez por mês', 'Apenas quando o cateter cair'],
        correctIndex: 1,
        explanation: 'O curativo de gaze deve ser trocado em todas as sessões para inspeção do óstio de inserção e prevenção do acúmulo de microrganismos.'
      },
      {
        id: 'cvc-post-4',
        question: 'A técnica "Scrub the Hub" consiste em:',
        options: ['Lavar o cateter com água de torneira', 'Fricção mecânica rigorosa com álcool 70% ou clorexidina alcoólica por no mínimo 15 segundos nas extremidades dos hubs', 'Passar gaze seca sobre a pele', 'Trocar a linha de sangue no meio da diálise'],
        correctIndex: 1,
        explanation: 'A fricção mecânica contínua destrói o biofilme bacteriano aderido à superfície externa das conexões do cateter.'
      },
      {
        id: 'cvc-post-5',
        question: 'Em relação ao curativo com filme transparente estéril de poliuretano, sua troca deve ocorrer:',
        options: ['Diariamente', 'A cada 7 dias, ou antes se houver descolamento, umidade ou presença de exsudato', 'Somente no momento da retirada do cateter', 'A cada 30 dias'],
        correctIndex: 1,
        explanation: 'Filmes transparentes semipermeáveis protegem por até 7 dias, permitindo a visualização constante do sítio de inserção sem necessidade de manipulação diária.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 3. ENFERMAGEM: INTERCORRÊNCIAS INTRADIALÍTICAS
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-intercorrencias',
    title: 'Prevenção e Manejo de Emergências e Intercorrências Intradialíticas',
    description: 'Protocolos de resposta rápida para hipotensão sintomática, câimbras, coagulação de circuito, reação ao dialisador e parada cardiorrespiratória.',
    sector: 'Enfermagem',
    workloadHours: 4,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 5,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Dr. Nefrologista Rotineiro / Coordenação Médica',
    instructorRole: 'Corpo Clínico & Emergências Nefrológicas',
    textContent: `### 1. Hipotensão Intradialítica (HID)
A queda sintomática da pressão arterial sistólica é a intercorrência mais frequente em hemodiálise (20 a 30% das sessões):
- **Causas:** Taxa de ultrafiltração (UF) superior à taxa de refilamento capilar vascular, peso seco subestimado, uso de anti-hipertensivos antes da sessão, alimentação pesada durante o tratamento.
- **Sintomatologia:** Bocejos frequentes, náuseas, vômitos, turvação visual, sudorese fria, tontura e agitação.
- **Conduta Imediata:**
  1. Colocar o paciente imediatamente em posição de Trendelenburg (elevar membros inferiores e reclinar poltrona).
  2. Reduzir a taxa de ultrafiltração para zero ($UF = 0$) temporariamente.
  3. Reduzir moderadamente o fluxo de sangue ($Qb$).
  4. Administrar bólus cauteloso de Soro Fisiológico 0,9% (100 a 200 mL) monitorando a resposta pressórica.
  5. Administrar oxigênio por cateter nasal se necessário e solicitar avaliação médica.

### 2. Câimbras Musculares Severas
- Fisiopatologia: Hipoperfusão tecidual associada à remoção rápida de volume e hipoosmolaridade plasmática transitória.
- Conduta: Reduzir UF, infusão de volume salino conforme prescrição médica, massagem local e calor suave.

### 3. Coagulação do Circuito Extracorpóreo
- Sinais na máquina: Elevação progressiva da pressão venosa ($Pv$) e da pressão transmembrana (TMP), escurecimento do sangue nas linhas e na câmara de bolhas.
- Conduta: Avaliar heparinização prévia. Realizar teste de lavagem rápida com 100 mL de SF 0,9%. Se o dialisador e linhas estiverem coagulados, **NUNCA** tentar reinfundir o sangue para o paciente devido ao risco de embolia. Desconectar, descartar o circuito coagulado e remontar novo sistema.

### 4. Reações Alérgicas e Síndrome do Desequilíbrio Dialítico (SDD)
- Reação Tipo A (Anafilactoide ao óxido de etileno / membrana): Ocorre nos primeiros minutos da diálise (dispneia, urticária, choque). Interromper a diálise imediatamente sem devolver o sangue!
- Reação Tipo B: Dor lombar e torácica incaracterística após 20 a 40 minutos.
- SDD: Edema cerebral decorrente da remoção muito rápida de ureia do sangue em pacientes novos. Prevenção: sessões iniciais curtas (2 horas) e com baixo fluxo ($Qb \le 200$ mL/min).`,
    preTestQuestions: [
      {
        id: 'int-pre-1',
        question: 'Qual a primeira manobra postural imediata indicada ao constatar hipotensão intradialítica sintomática?',
        options: ['Sentar o paciente ereto com pernas para baixo', 'Colocar em posição de Trendelenburg (elevar as pernas e reclinar a poltrona)', 'Levantar o paciente para caminhar', 'Colocar o paciente de barriga para baixo'],
        correctIndex: 1
      },
      {
        id: 'int-pre-2',
        question: 'Ao identificar hipotensão, qual o ajuste imediato obrigatório na máquina de hemodiálise?',
        options: ['Aumentar a ultrafiltração (UF) ao máximo', 'Pausar ou zerar temporariamente a ultrafiltração (UF = 0)', 'Desligar a bomba de sangue completamente', 'Aumentar a temperatura do dialisato para 40°C'],
        correctIndex: 1
      },
      {
        id: 'int-pre-3',
        question: 'Se o circuito de hemodiálise (linhas e dialisador) estiver totalmente coagulado, a conduta correta é:',
        options: ['Empurrar todo o sangue com ar para dentro do paciente', 'Nunca devolver sangue coagulado; desconectar com segurança e descartar o sistema', 'Injetar 50 mL de heparina pura e forçar a reinfusão', 'Bater no dialisador para soltar os trombos'],
        correctIndex: 1
      },
      {
        id: 'int-pre-4',
        question: 'Quais os primeiros sinais clínicos que prenunciam uma crise de hipotensão durante a diálise?',
        options: ['Fome intensa e euforia', 'Bocejos frequentes, náuseas, sudorese fria e tontura', 'Hipertensão arterial severa', 'Tosse seca e rouquidão'],
        correctIndex: 1
      },
      {
        id: 'int-pre-5',
        question: 'A Síndrome do Desequilíbrio Dialítico (SDD) é prevenida principalmente através de:',
        options: ['Sessões de 6 horas no primeiro dia', 'Sessões iniciais mais curtas (2 horas) com fluxo de sangue reduzido em pacientes novos', 'Uso de soro glicosado hipertônico livremente', 'Ingestão de alimentos pesados'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'int-post-1',
        question: 'Por que a devolução de sangue de um circuito extensamente coagulado é terminantemente contraindicada?',
        options: ['Porque mancha os lençóis da clínica', 'Pelo risco iminente de tromboembolismo pulmonar maciço e morte do paciente', 'Porque descalibra a máquina de diálise', 'Para economizar soro fisiológico'],
        correctIndex: 1,
        explanation: 'A reinfusão de coágulos venosos migra diretamente para a circulação pulmonar, causando embolia pulmonar potencialmente fatal.'
      },
      {
        id: 'int-post-2',
        question: 'Qual o volume inicial habitual recomendado de bólus de SF 0,9% para expansão volêmica na hipotensão intradialítica?',
        options: ['1.000 a 2.000 mL de uma só vez', '100 a 200 mL titulados conforme a resposta pressórica', '500 mL associados a diurético', 'Não se deve infundir volume'],
        correctIndex: 1,
        explanation: 'Infusões maciças de volume cancelam a perda obtida na sessão e podem sobrecarregar o ventrículo de cardiopatas renais; doses fracionadas de 100-200 mL são o padrão.'
      },
      {
        id: 'int-post-3',
        question: 'Em caso de suspeita de Reação Anafilactoide Tipo A ao dialisador nos primeiros minutos de sessão, a conduta correta é:',
        options: ['Devolver o sangue e observar por 30 minutos', 'Interromper imediatamente a diálise sem reinfundir o sangue do circuito e acionar suporte médico de emergência', 'Apenas administrar dipirona e prosseguir a sessão', 'Aumentar a ultrafiltração'],
        correctIndex: 1,
        explanation: 'O sangue em contato com o alérgeno deve ser descartado imediatamente para cessar a absorção sistêmica dos mediadores antigênicos.'
      },
      {
        id: 'int-post-4',
        question: 'As câimbras musculares intensas durante a hemodiálise estão frequentemente associadas a:',
        options: ['Excesso de potássio na dieta', 'Taxas de ultrafiltração muito rápidas e peso seco fixado incorretamente abaixo do ideal', 'Consumo de carboidratos complexos', 'Uso de máscara cirúrgica'],
        correctIndex: 1,
        explanation: 'A rápida remoção volumétrica e a depleção eletrolítica local geram hipoperfusão muscular e espasmos dolorosos.'
      },
      {
        id: 'int-post-5',
        question: 'Qual alteração no monitor da máquina de hemodiálise alerta a equipe para aumento de resistência e risco de coagulação?',
        options: ['Queda do fluxo de sangue para zero', 'Aumento expressivo da Pressão Venosa (Pv) e da Pressão Transmembrana (TMP)', 'Redução da condutividade do dialisato', 'Desligamento do display'],
        correctIndex: 1,
        explanation: 'O acúmulo de fibrina e microtrombos obstrui os capilares do dialisador e o cata-bolhas, elevando bruscamente as pressões internas do circuito.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 4. ENFERMAGEM: PROCESSAMENTO E REUSO DE DIALISADORES
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-reuso',
    title: 'Processamento, Reuso e Teste Residual em Dialisadores (RDC 11/2014)',
    description: 'Normas da ANVISA para higienização, teste de volume capilar residual (primo-reuso), concentração de germicida e teste químico de segurança.',
    sector: 'Enfermagem',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Enfª Responsável Técnica pelo Setor de Reuso',
    instructorRole: 'Controle de Qualidade em Reuso de Linhas e Dialisadores',
    textContent: `### 1. Marco Regulatório da ANVISA (RDC 11/2014)
O reprocessamento de dialisadores e linhas no Brasil é autorizado e estritamente regulado pela RDC 11/2014:
- Limite máximo de reutilizações: Até 20 vezes para reuso automatizado ou manual validado.
- Exclusividade absoluta: O dialisador é de uso estritamente individual e intransferível. Pacientes com sorologia positiva para Hepatite B (HBsAg+) **NÃO** podem ter seus dialisadores reusados (devem ser descartados a cada sessão).

### 2. Rotulagem e Critérios de Identificação
Cada conjunto de diálise deve conter etiqueta legível contendo:
- Nome completo do paciente e número de registro/prontuário.
- Data do primeiro uso (primo-uso).
- Volume interno residual inicial de referência (determinado no primo-uso).
- Número ordinal de cada reutilização.

### 3. Teste de Volume Capilar Interno (Fiber Bundle Volume - FBV)
- A cada ciclo de reprocessamento, o volume interno de feixe de fibras deve ser mensurado.
- **Critério de Descarte Obrigatório:** Se o volume residual for inferior a 80% do volume inicial medido no primeiro uso, o dialisador deve ser descartado imediatamente por perda de capacidade depurativa.
- Outros motivos de descarte: Fissuras na carcaça plástica, perda da integridade das fibras (fuga de sangue) e coágulos extensos irreversíveis.

### 4. Desinfetante e Teste de Ausência de Resíduo Químico Pré-Diálise
- Solução esterilizante/desinfetante comumente utilizada: Ácido Peracético estabilizado.
- Controle de concentração: Verificação da concentração mínima eficaz (CME) do esterilizante com fitas reagentes antes do acondicionamento.
- **Teste Residual Pré-Conexão:** Antes de instalar as linhas no paciente, é mandatório lavar o sistema com soro fisiológico e realizar o teste de verificação da ausência total de resíduos de ácido peracético nas linhas arterial e venosa com fita específica indicadora. Conectar um circuito com resíduo químico pode causar hemólise grave e choque tóxico no paciente!`,
    preTestQuestions: [
      {
        id: 'reu-pre-1',
        question: 'Segundo a RDC 11/2014 da ANVISA, qual o número máximo permitido de reutilizações de um dialisador?',
        options: ['5 vezes', 'Até 20 vezes se mantiver os critérios de integridade e volume', '50 vezes', 'Ilimitado enquanto não furar'],
        correctIndex: 1
      },
      {
        id: 'reu-pre-2',
        question: 'Qual o percentual mínimo de volume capilar residual (FBV) exigido para que o dialisador continue apto ao reuso?',
        options: ['50% do volume inicial', 'Pelo menos 80% do volume inicial de primo-reuso', '99% obrigatório', '30%'],
        correctIndex: 1
      },
      {
        id: 'reu-pre-3',
        question: 'É permitido o reuso de dialisadores de pacientes portadores de Hepatite B (HBsAg positivo)?',
        options: ['Sim, em sala separada', 'Não, a legislação brasileira proíbe o reuso em pacientes com Hepatite B (descarte obrigatório a cada sessão)', 'Sim, se esterilizado 2 vezes', 'Apenas com autorização médica'],
        correctIndex: 1
      },
      {
        id: 'reu-pre-4',
        question: 'Qual teste deve ser realizado obrigatoriamente logo antes de conectar o dialisador reprocessado ao paciente?',
        options: ['Teste de glicemia no dialisato', 'Teste de ausência de resíduo do desinfetante (ácido peracético) com fita química reagente', 'Teste de fragilidade osmótica', 'Nenhum teste é necessário'],
        correctIndex: 1
      },
      {
        id: 'reu-pre-5',
        question: 'O que deve ser feito se um dialisador apresentar volume capilar interno de 75% em relação ao primo-uso?',
        options: ['Completar com soro e usar', 'Descartar imediatamente conforme exigência da RDC 11/2014', 'Reusar apenas em pacientes jovens', 'Usar aumentando o fluxo da bomba'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'reu-post-1',
        question: 'Qual a consequência clínica se um dialisador for conectado ao paciente contendo resíduo químico de ácido peracético?',
        options: ['Aumento transitório do apetite', 'Hemólise intravascular aguda, dor torácica severa, colapso hemodinâmico e choque tóxico', 'Melhora da anemia', 'Nenhuma repercussão clínica'],
        correctIndex: 1,
        explanation: 'O ácido peracético em circulação oxida e destrói as hemácias (hemólise maciça), desencadeando acidose e parada cardiorrespiratória.'
      },
      {
        id: 'reu-post-2',
        question: 'Por que o volume capilar interno residual (FBV) é o indicador ouro de eficácia do dialisador reprocessado?',
        options: ['Porque mede o peso da carcaça plástica', 'Porque quantifica a área de superfície de membrana dialisadora efetiva que permanece pérvia para troca de toxinas', 'Para saber a quantidade de heparina necessária', 'Para calcular a taxa de faturamento'],
        correctIndex: 1,
        explanation: 'Capilares obstruídos por fibrina reduzem a área de filtração, tornando a diálise inadequada se a perda for superior a 20% do feixe de fibras.'
      },
      {
        id: 'reu-post-3',
        question: 'Quais informações obrigatórias devem constar no rótulo de identificação de cada dialisador em reuso?',
        options: ['Apenas o primeiro nome do paciente', 'Nome completo do paciente, registro/prontuário, data do 1º uso, volume inicial e contagem de reusos', 'Apenas a cor da tampa', 'Apenas o turno de diálise'],
        correctIndex: 1,
        explanation: 'A rastreabilidade unívoca e detalhada impede trocas acidentais de dialisadores entre pacientes, garantindo a biossegurança estrita.'
      },
      {
        id: 'reu-post-4',
        question: 'Antes de iniciar a sessão com dialisador reutilizado, o processo de lavagem preparatória (priming) tem como objetivo:',
        options: ['Esquentar o sangue do paciente', 'Remover completamente qualquer bolha de ar e enxaguar todo o desinfetante residual do sistema', 'Colorir as linhas de sangue', 'Calibrar a balança da clínica'],
        correctIndex: 1,
        explanation: 'O priming com solução salina retira o gás das fibras e elimina os traços do germicida utilizado no armazenamento.'
      },
      {
        id: 'reu-post-5',
        question: 'O descarte de linhas e dialisadores reusados ao atingirem o limite deve seguir o protocolo de qual grupo do PGRSS?',
        options: ['Grupo D (Comum)', 'Grupo A (Resíduo Biológico / Infectante em saco branco leitoso)', 'Grupo B (Químico puro)', 'Reciclagem comum'],
        correctIndex: 1,
        explanation: 'Por terem tido contato direto com sangue e fluidos humanos, linhas e capilares são resíduos infectantes de classificação Grupo A1.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 5. MANUTENÇÃO: TRATAMENTO DE ÁGUA PARA HEMODIÁLISE
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-agua',
    title: 'Monitoramento e Rotina do Sistema de Tratamento de Água (RDC 11/2014)',
    description: 'Etapas de pré-tratamento, abrandador, descloração com carvão ativado, osmose reversa, controle bacteriológico e endotoxinas.',
    sector: 'Manutencao',
    workloadHours: 4,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 5,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Engenheiro Químico / Responsável pela Água',
    instructorRole: 'Engenharia Clínica e Gestão da Qualidade da Água',
    textContent: `### 1. Importância Crítica da Água em Hemodiálise
Um paciente renal crônico entra em contato com aproximadamente 360 a 400 litros de água tratada para diálise a cada semana através da membrana semipermeável. Contaminantes químicos ou biológicos passam diretamente para a corrente sanguínea, tornando a água o insumo mais crítico da clínica.

### 2. Fluxograma do Sistema e Funções
1. **Pré-Tratamento:**
   - **Filtros de Areia / Multimídia:** Retenção mecânica de partículas e turbidez da água bruta da concessionária.
   - **Abrandador:** Troca de íons cálcio ($Ca^{2+}$) e magnésio ($Mg^{2+}$) por sódio através de resina catiônica, reduzindo a dureza da água e protegendo a membrana de osmose contra incrustações.
   - **Filtros de Carvão Ativado:** Remoção obrigatória de cloro livre e cloraminas por adsorção. Cloro na água de diálise provoca hemólise química fatal!
   - **Microfiltros de 5 e 1 micra:** Retenção final de partículas finas e finos de carvão.
2. **Tratamento Principal (Osmose Reversa - OR):**
   - Membranas poliméricas de poliamida com alta pressão que rejeitam mais de 98% dos sais dissolvidos, metais pesados, bactérias e endotoxinas.

### 3. Monitoramento Diário Obrigatório
- **Cloro Residual Total:** Medição obrigatória no início de cada turno e antes do primeiro paciente na saída do filtro de carvão ativado. **Limite máximo permitido: < 0,1 mg/L (ppm)**.
- **Dureza da Água:** Teste com kit colorimétrico antes e após o abrandador. Limite: $< 1$ grão/galão ($< 17$ mg/L).
- **Condutividade da Água Produzida:** Verificação contínua no painel da OR. Deve ser $< 10$ $\mu$S/cm.

### 4. Padrões Microbiológicos e Endotoxinas (RDC 11/2014)
- **Bactérias Heterotróficas:** Coleta mensal no reservatório e pontos do loop de distribuição. Limite máximo: $< 100$ UFC/mL.
- **Endotoxinas Bacterianas (LAL):** Dosagem trimestral ou mensal. Limite máximo: $< 0,25$ UE/mL.
- Procedimento em caso de não conformidade: Desinfecção química imediata do anel de distribuição (*loop*) com ácido peracético ou hipoclorito, recoleta e investigação de biofilme.`,
    preTestQuestions: [
      {
        id: 'agua-pre-1',
        question: 'Qual a principal finalidade dos filtros de carvão ativado no sistema de tratamento de água para hemodiálise?',
        options: ['Eliminar a poeira da água', 'Remover o cloro livre e cloraminas para evitar hemólise aguda nos pacientes', 'Aumentar o cálcio da água', 'Esfriar a temperatura'],
        correctIndex: 1
      },
      {
        id: 'agua-pre-2',
        question: 'Qual o limite máximo permitido de cloro residual na água tratada segundo a RDC 11/2014?',
        options: ['1,0 mg/L', 'Menor que 0,1 mg/L (0,1 ppm)', '5,0 mg/L', 'Não há limite estipulado'],
        correctIndex: 1
      },
      {
        id: 'agua-pre-3',
        question: 'O abrandador tem a função específica de:',
        options: ['Substituir o cloro por iodo', 'Remover a dureza da água (íons cálcio e magnésio) protegendo a membrana de osmose', 'Matar vírus e fungos com calor', 'Aumentar a pressão da rede'],
        correctIndex: 1
      },
      {
        id: 'agua-pre-4',
        question: 'Segundo a RDC 11/2014, qual o limite máximo aceitável para contagem de bactérias heterotróficas na água de hemodiálise?',
        options: ['1.000 UFC/mL', 'Menor que 100 UFC/mL', '10.000 UFC/mL', 'Zero absoluto'],
        correctIndex: 1
      },
      {
        id: 'agua-pre-5',
        question: 'O que ocorre se água contendo cloro for utilizada durante a sessão de hemodiálise?',
        options: ['O paciente sente sede', 'Ocorre oxidação imediata da hemoglobina, hemólise maciça e risco de óbito', 'Apenas alteração do cheiro da sala', 'Melhora da depuração de ureia'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'agua-post-1',
        question: 'Qual o limite regulamentar máximo aceitável de endotoxinas bacterianas na água tratada para diálise?',
        options: ['5,0 UE/mL', 'Menor que 0,25 UE/mL', '10 UE/mL', 'Não é necessário dosar endotoxinas'],
        correctIndex: 1,
        explanation: 'Endotoxinas acima de 0,25 UE/mL atravessam a membrana do dialisador (retrofiltração) e causam reações pirogênicas severas e choque séptico.'
      },
      {
        id: 'agua-post-2',
        question: 'Quando deve ser realizada a medição do nível de cloro livre na água?',
        options: ['Apenas uma vez ao ano pelo fabricante', 'Diariamente, antes do início das atividades de cada turno na saída do carvão ativado', 'Apenas se a água sair com cor amarela', 'No final de semana'],
        correctIndex: 1,
        explanation: 'O leito de carvão ativado pode saturar subitamente; por isso, a checagem a cada início de turno é mandatória e salva vidas.'
      },
      {
        id: 'agua-post-3',
        question: 'A condutividade elétrica da água produzida pela Osmose Reversa reflete:',
        options: ['A quantidade de cloro adicionada', 'A concentração de sais minerais e íons dissolvidos na água após a membrana', 'O volume de urina dos pacientes', 'A cor da água'],
        correctIndex: 1,
        explanation: 'Condutividade baixa (< 10 microsiemens/cm) comprova a integridade e eficácia da membrana de osmose na remoção iônica.'
      },
      {
        id: 'agua-post-4',
        question: 'A presença de biofilme no anel de distribuição (loop de água) é um desafio sanitário porque:',
        options: ['Aquece a tubulação', 'As bactérias secretam uma matriz protetora resistente aos desinfetantes comuns e liberam endotoxinas contínuas', 'Muda a cor dos tubos para verde', 'Não traz risco algum'],
        correctIndex: 1,
        explanation: 'Biofilmes bacterianos protegem microorganismos contra biocidas comuns, exigindo desinfecções químicas regulares e sanitização do anel.'
      },
      {
        id: 'agua-post-5',
        question: 'A regeneração do abrandador é realizada periodicamente utilizando:',
        options: ['Álcool etílico', 'Solução saturada de cloreto de sódio (salmoura)', 'Ácido sulfúrico', 'Água oxigenada concentrada'],
        correctIndex: 1,
        explanation: 'A salmoura fornece alta concentração de íons de sódio para deslocar o cálcio e magnésio retidos na resina trocadora.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 6. MANUTENÇÃO: MÁQUINAS DE HEMODIÁLISE E ENGENHARIA CLÍNICA
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-maquinas',
    title: 'Manutenção Preventiva e Desinfecção de Proporcionadoras de Diálise',
    description: 'Protocolos operacionais de desinfecção térmica e química entre turnos, calibração de sensores de condutividade, temperatura e detector de fuga de sangue.',
    sector: 'Manutencao',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Engenheiro Clínico / Especialista em Equipamentos Médicos',
    instructorRole: 'Engenharia Clínica e Manutenção Preventiva Hospitalar',
    textContent: `### 1. Responsabilidade Técnica da Engenharia Clínica
As máquinas proporcionadoras de hemodiálise preparam a mistura exata de água tratada com os concentrados ácido e básico para criar o dialisato. Qualquer falha de calibração ou desinfecção pode causar acidentes graves aos pacientes.

### 2. Rotinas de Limpeza e Desinfecção Obrigatórias
- **Entre Turnos de Atendimento:** Ciclo obrigatório de desinfecção térmica rápida (85°C a 90°C) ou química (ácido cítrico / desinfetante próprio do fabricante) entre a saída de um paciente e a entrada do próximo na mesma máquina.
- **Ao Final do Último Turno do Dia:** Ciclo completo e aprofundado de desinfecção química associado a descalcificação para remover precipitações de carbonato de cálcio das tubulações hidráulicas internas.
- **Após Paciente HBsAg+:** Uso de máquina estritamente dedicada em sala exclusiva para Hepatite B, com ciclo de desinfecção reforçado.

### 3. Calibração de Sensores Vitais
- **Sensor de Condutividade do Dialisato:** Faixa terapêutica obrigatória (13,5 a 14,5 mS/cm). Um erro de condutividade causa hipo ou hipernatremia severa, edema cerebral ou arritmias.
- **Sensor de Temperatura do Banho:** Deve manter o banho entre 35,5°C e 37,0°C. Temperatura > 40°C desnatura proteínas sanguíneas e desencadeia hemólise aguda.
- **Detector Óptico de Fuga de Sangue (Blood Leak):** Deve ser testado periodicamente para garantir que qualquer ruptura microscópica nas fibras do dialisador pause a bomba de sangue e acione o alarme de segurança.
- **Calibração de Pressões:** Verificação dos transdutores de pressão arterial pré-bomba, pressão venosa pós-dialisador e pressão transmembrana (TMP).

### 4. Segurança Elétrica e Rastreabilidade (NBR IEC 60601)
- Teste periódico de corrente de fuga e continuidade de aterramento elétrico.
- Registro obrigatório de todas as intervenções corretivas e preventivas em Ordens de Serviço (OS) arquivadas para comprovação fiscal e sanitária.`,
    preTestQuestions: [
      {
        id: 'maq-pre-1',
        question: 'O que deve ser realizado na máquina de hemodiálise obrigatoriamente entre a saída de um paciente e a entrada do próximo?',
        options: ['Apenas passar pano seco na tela', 'Ciclo de limpeza e desinfecção térmica ou química validado pelo fabricante', 'Desligar e ligar na tomada', 'Não há necessidade de limpeza'],
        correctIndex: 1
      },
      {
        id: 'maq-pre-2',
        question: 'Qual a consequência clínica se a máquina produzir dialisato com temperatura superior a 40°C?',
        options: ['O paciente sente sono', 'Desnaturação de proteínas plasmáticas, hemólise maciça e colapso circulatório', 'Melhora da anemia', 'Nenhuma repercussão'],
        correctIndex: 1
      },
      {
        id: 'maq-pre-3',
        question: 'A condutividade do dialisato deve se manter estritamente calibrada porque alterações bruscas provocam:',
        options: ['Queda do sinal de internet', 'Distúrbios osmóticos severos de sódio (hipo/hipernatremia), edema cerebral ou convulsão', 'Aquecimento dos cabos', 'Alteração do peso seco'],
        correctIndex: 1
      },
      {
        id: 'maq-pre-4',
        question: 'O sensor detector de fuga de sangue (blood leak) tem como papel vital:',
        options: ['Medir a pressão arterial do paciente', 'Detectar rupturas de fibras do dialisador que permitam extravasamento de sangue para o dialisato', 'Avisar o término do horário da sessão', 'Economizar energia'],
        correctIndex: 1
      },
      {
        id: 'maq-pre-5',
        question: 'A descalcificação periódica do sistema hidráulico interno da máquina tem a finalidade de:',
        options: ['Clarear as peças plásticas', 'Remover depósitos e crostas de carbonato de cálcio precipitados pelo bicarbonato', 'Tirar o cheiro de hospital', 'Lubrificar a bomba de sangue'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'maq-post-1',
        question: 'Qual o procedimento obrigatório diante de um alarme contínuo de Blood Leak (fuga de sangue) confirmado?',
        options: ['Mutar o alarme e continuar a diálise normalmente', 'Interromper a sessão, verificar a câmara de dialisato e substituir imediatamente o dialisador rompido', 'Reiniciar a máquina com o paciente conectado', 'Injetar ar no dialisador'],
        correctIndex: 1,
        explanation: 'Fuga de sangue significa que a barreira capilar quebrou, havendo perda de sangue e risco de contaminação retrógrada do paciente.'
      },
      {
        id: 'maq-post-2',
        question: 'Qual das soluções a seguir é habitualmente utilizada para realizar a descalcificação dos circuitos internos das máquinas?',
        options: ['Álcool comum 70%', 'Ácido Cítrico ou solução ácida específica do fabricante', 'Soro glicosado a 50%', 'Clorexidina alcoólica'],
        correctIndex: 1,
        explanation: 'O ácido cítrico dissolve eficientemente os sais de cálcio insolúveis sem danificar as válvulas hidráulicas da máquina.'
      },
      {
        id: 'maq-post-3',
        question: 'A comprovação da manutenção preventiva das máquinas de diálise perante a Vigilância Sanitária é feita através de:',
        options: ['Palavra verbal da equipe de enfermagem', 'Ordens de Serviço (OS) detalhadas com laudos de calibração assinados por engenheiro clínico habilitado', 'Notas fiscais de compra das máquinas', 'Fotos dos equipamentos'],
        correctIndex: 1,
        explanation: 'A documentação formal de calibração e rastreabilidade técnica é exigência indispensável da RDC 11/2014.'
      },
      {
        id: 'maq-post-4',
        question: 'A condutividade padrão de operação da mistura do dialisato deve permanecer na faixa aproximada de:',
        options: ['5 a 8 mS/cm', '13,5 a 14,5 mS/cm', '30 a 45 mS/cm', 'Zero'],
        correctIndex: 1,
        explanation: 'Essa faixa de condutividade equivale a uma concentração sérica isotônica de sódio e eletrólitos compatível com a vida.'
      },
      {
        id: 'maq-post-5',
        question: 'Em relação ao aterramento elétrico das máquinas de diálise conforme a norma NBR IEC 60601, ele é indispensável para:',
        options: ['Garantir que a máquina ligue mais rápido', 'Eliminar correntes de fuga e prevenir choque elétrico de microchoque cardíaco no paciente conectado ao circuito sanguíneo', 'Reduzir a conta de luz da clínica', 'Proteger contra poeira'],
        correctIndex: 1,
        explanation: 'O paciente em diálise está conectado a cateteres ou agulhas metálicas que chegam próximo ao coração, sendo extremamente sensível a microchoques.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 7. MÉDICO: PRESCRIÇÃO DIALÍTICA, ADEQUAÇÃO (Kt/V) E DMO-DRC
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-medica',
    title: 'Prescrição Dialítica, Avaliação de Adequação (Kt/V) e DMO-DRC',
    description: 'Parâmetros de prescrição individualizada, metas de Kt/V e URR, reposição de ferro/EPO, manejo do distúrbio mineral ósseo e controle do peso seco.',
    sector: 'Medica',
    workloadHours: 4,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 5,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Dr. Nefrologista Titular SBN / RT Médico',
    instructorRole: 'Responsável Técnico Médico & Coordenação Clínica',
    textContent: `### 1. Parâmetros da Prescrição Dialítica Individualizada
A prescrição deve ser revisada mensalmente e adaptada às necessidades metabólicas e hemodinâmicas do paciente renal:
- **Fluxo de Sangue ($Qb$):** Habitualmente entre 300 e 400 mL/min em FAV (respeitando o limite de 200 a 250 mL/min em cateteres temporários ou primeiras sessões).
- **Fluxo de Dialisato ($Qd$):** Padrão de 500 a 800 mL/min.
- **Área do Dialisador:** Seleção de capilar de acordo com a área de superfície corporal ($1,5$ a $2,1$ $\text{m}^2$) e coeficiente de ultrafiltração ($Kuf$).
- **Perfil de Eletrólitos:** Concentração de potássio no banho (1, 2 ou 3 mEq/L), cálcio (2,5 ou 3,0 mEq/L) e bicarbonato (32 a 36 mEq/L).

### 2. Avaliação da Dose de Diálise (Adequação - Kt/V e URR)
- **Cálculo de Kt/V monopartido ($spKt/V$):** Medida da depuração fracionária de ureia. Meta mínima preconizada: **$Kt/V \ge 1,2$** por sessão (ideal $\ge 1,4$) para 3 sessões semanais de 4 horas.
- **Taxa de Redução de Ureia (URR):** Meta mínima de **URR $\ge 65\%$** (ideal $> 70\%$).
- Coleta correta de Ureia Pós-diálise: Técnica da parada da bomba ou redução do fluxo ($Qb = 100$ mL/min por 15 segundos) antes da coleta para evitar amostras diluídas por recirculação de acesso.

### 3. Distúrbio Mineral e Ósseo (DMO-DRC)
- Controle do Fósforo sérico: Meta de $3,5$ a $5,5$ mg/dL através de dieta e uso disciplinado de quelantes de fósforo (carbonato de cálcio, sevelamer).
- Produto Cálcio x Fósforo ($Ca \times P$): Manter $< 55$ $\text{mg}^2/\text{dL}^2$ para prevenir calcificação vascular acelerada.
- Hormônio da Paratireoide (PTH intacto): Manter na faixa de 2 a 9 vezes o limite superior do método (aproximadamente 150 a 600 pg/mL) com análogos da vitamina D ou calcimiméticos.

### 4. Manejo da Anemia e Estimuladores da Eritropoiese
- Meta de Hemoglobina (Hb): **10,0 a 11,5 g/dL**.
- Reposição de Ferro: Manter Saturação de Transferrina (ISAT) entre 20% e 50% e Ferritina entre 200 e 800 ng/mL antes de aumentar doses de Alfaepoetina (EPO).`,
    preTestQuestions: [
      {
        id: 'med-pre-1',
        question: 'Qual a meta mínima recomendada de Kt/V monopartido por sessão para pacientes em regime de 3 vezes por semana?',
        options: ['Kt/V de 0,5', 'Kt/V de pelo menos 1,2 (ideal 1,4)', 'Kt/V de 5,0', 'O Kt/V não é aplicável em hemodiálise'],
        correctIndex: 1
      },
      {
        id: 'med-pre-2',
        question: 'Qual a faixa terapêutica alvo de Hemoglobina (Hb) recomendada nas diretrizes para pacientes em hemodiálise crônica?',
        options: ['7,0 a 8,5 g/dL', '10,0 a 11,5 g/dL (evitando ultrapassar 13 g/dL)', '16,0 a 18,0 g/dL', 'Qualquer valor acima de 5 g/dL'],
        correctIndex: 1
      },
      {
        id: 'med-pre-3',
        question: 'Qual o risco de manter o produto Cálcio x Fósforo (Ca x P) cronicamente acima de 55 mg²/dL² no paciente renal?',
        options: ['Queda de cabelo', 'Calcificação cardiovascular e arterial acelerada com alto risco de infarto e AVC', 'Aumento de miopia', 'Hipotermia'],
        correctIndex: 1
      },
      {
        id: 'med-pre-4',
        question: 'Qual a meta recomendada para a Taxa de Redução de Ureia (URR) como critério de adequação dialítica?',
        options: ['URR mínima de 20%', 'URR mínima de 65% (ideal > 70%)', 'URR de 100% sempre', 'URR menor que 40%'],
        correctIndex: 1
      },
      {
        id: 'med-pre-5',
        question: 'Antes de iniciar ou aumentar as doses de Eritropoietina (EPO), o que deve ser obrigatoriamente checado e corrigido?',
        options: ['O tipo sanguíneo ABO', 'Os estoques de ferro (Saturação de Transferrina e Ferritina)', 'A altura do paciente', 'O nível de ácido fólico apenas'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'med-post-1',
        question: 'A coleta de sangue para a dosagem de ureia pós-diálise deve respeitar qual protocolo técnico para evitar erro de cálculo do Kt/V?',
        options: ['Coletar com a bomba de sangue a 400 mL/min sem parar', 'Desacelerar o fluxo de sangue para 100 mL/min por 15 segundos ou pausar a ultrafiltração antes de aspirar a amostra', 'Coletar de veia da perna 1 hora depois', 'Coletar diretamente do dialisato'],
        correctIndex: 1,
        explanation: 'Coletar sob fluxo pleno suga sangue recém-filtrado da linha venosa que recirculou pelo acesso, gerando falso Kt/V superestimado.'
      },
      {
        id: 'med-post-2',
        question: 'O valor de PTH intacto em pacientes com doença renal terminal (DRC estágio 5D) deve ser mantido habitualmente na faixa de:',
        options: ['Zero absoluto', 'Entre 2 a 9 vezes o limite superior da normalidade (aproximadamente 150 a 600 pg/mL)', 'Maior que 3.000 pg/mL', 'Menor que 10 pg/mL'],
        correctIndex: 1,
        explanation: 'O osso urêmico apresenta resistência esquelética à ação do PTH, exigindo níveis ligeiramente elevados para evitar doença óssea adinâmica.'
      },
      {
        id: 'med-post-3',
        question: 'Por que o uso de quelantes de fósforo (ex: carbonato de cálcio, sevelamer) deve ocorrer estritamente durante as refeições?',
        options: ['Para não dar sono no paciente', 'Para quelar e precipitar o fósforo dos alimentos diretamente na luz intestinal antes de sua absorção', 'Porque em jejum o remédio não dissolve', 'Para proteger o esôfago'],
        correctIndex: 1,
        explanation: 'Quelantes ingeridos fora das refeições perdem sua eficácia quelante de fósforo alimentar e podem aumentar a absorção indesejada de cálcio.'
      },
      {
        id: 'med-post-4',
        question: 'Qual a conduta indicada quando a Saturação de Transferrina (ISAT) for inferior a 20% e Ferritina < 200 ng/mL?',
        options: ['Suspender a hemodiálise', 'Prescrever reposição intravenosa de ferro (ex: sacarato de hidróxido de ferro) conforme protocolo clínico', 'Aumentar a ultrafiltração da máquina', 'Prescrever cálcio oral em jejum'],
        correctIndex: 1,
        explanation: 'A deficiência absoluta de ferro impede a resposta da medula à EPO, gerando anemia refratária e perda de eficácia clínica.'
      },
      {
        id: 'med-post-5',
        question: 'A prescrição de heparinização em bólus inicial e infusão contínua durante a sessão tem como objetivo principal:',
        options: ['Aliviar as dores de cabeça do paciente', 'Prevenir a formação de trombos no interior dos capilares do dialisador e das linhas extracorpóreas', 'Acelerar a retirada de potássio', 'Reduzir a pressão arterial'],
        correctIndex: 1,
        explanation: 'O contato contínuo do sangue com superfícies artificiais sintéticas ativa a cascata de coagulação se não houver heparinização adequada.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 8. FARMÁCIA: CONCENTRADOS POLIELETROLÍTICOS E MEDICAMENTOS ESPECIAIS
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-farmacia',
    title: 'Farmácia Clínica: Manejo, Diluição e Armazenamento de Concentrados e Termolábeis',
    description: 'Boas práticas na estocagem de concentrado ácido e básico, controle da cadeia de frio (EPO), rastreabilidade de heparinas e prevenção de erros de medicação.',
    sector: 'Farmacia',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Farmacêutico(a) Bioquímico(a) Hospitalar',
    instructorRole: 'Farmácia Hospitalar e Assistência Farmacêutica em Nefrologia',
    textContent: `### 1. Insumos Farmacêuticos Exclusivos de Nefrologia
A farmácia hospitalar de uma clínica de nefrologia é responsável por medicamentos de alta vigilância, soluções parenterais em grande volume e concentrados polieletrolíticos.

### 2. Concentrados Polieletrolíticos para Diálise
- **Concentrado Ácido:** Solução contendo cloreto de sódio, potássio, cálcio, magnésio, cloreto e ácido acético/cítrico, além de glicose. Deve ser armazenado em estrados protegidos da luz solar direta.
- **Concentrado Básico (Bicarbonato de Sódio pó ou líquido):**
  - Quando preparado a partir do pó na clínica, a diluição deve ser feita exclusivamente com **água tratada para hemodiálise**.
  - **Validade microbiológica do bicarbonato diluído:** Deve ser utilizado em no máximo **24 horas** após a dissolução devido ao risco exponencial de crescimento bacteriano e precipitação de carbonato.
  - Nunca misturar lotes de bicarbonato ou reaproveitar sobras de galões abertos de dias anteriores!

### 3. Controle Estrito da Cadeia de Frio (Termolábeis)
- Medicamentos como Alfaepoetina (EPO) e vacinas devem ser estocados em refrigeradores de uso exclusivo para medicamentos em faixa estrita de **+2°C a +8°C**.
- Registro manual ou digital de temperatura e umidade no mínimo **duas vezes ao dia** (manhã e tarde) com termômetro calibrado de máxima e mínima.
- Plano de contingência: Acionamento imediato de gerador ou caixas térmicas com gelox monitorado em caso de queda de energia prolongada.

### 4. Rastreabilidade de Heparinas e Alta Vigilância
- A heparina sódica é medicamento de alta vigilância. Cada ampola dispensada deve possuir registro de lote, validade e ser conferida duplamente antes da aplicação.
- Antídoto disponível na emergência: Sulfato de Protamina 1% disponível e dentro da validade na sala de emergência para reversão imediata de heparinização acidental.
- Dispensação individualizada pelo método PVPS (Primeiro que Vence, Primeiro que Sai).`,
    preTestQuestions: [
      {
        id: 'far-pre-1',
        question: 'Qual a faixa de temperatura obrigatória de armazenamento de medicamentos biológicos termolábeis como a Eritropoietina (EPO)?',
        options: ['Abaixo de zero (-10°C)', 'Faixa estrita de +2°C a +8°C sem congelar', 'Temperatura ambiente (25°C)', 'Qualquer temperatura'],
        correctIndex: 1
      },
      {
        id: 'far-pre-2',
        question: 'Qual a validade máxima recomendada da solução de bicarbonato de sódio após a diluição com água tratada na clínica?',
        options: ['30 dias', 'No máximo 24 horas devido ao risco de contaminação bacteriana e precipitação', '6 meses', 'Indeterminada'],
        correctIndex: 1
      },
      {
        id: 'far-pre-3',
        question: 'Qual a água obrigatória que deve ser utilizada para o preparo e diluição do bicarbonato em pó para diálise?',
        options: ['Água mineral de garrafão', 'Água tratada para hemodiálise produzida pela osmose reversa da clínica', 'Água da torneira fervida', 'Água destilada aromática'],
        correctIndex: 1
      },
      {
        id: 'far-pre-4',
        question: 'Qual é o antídoto de ação imediata que deve estar sempre disponível na emergência para reverter superdosagem de heparina?',
        options: ['Vitamina C endovenosa', 'Sulfato de Protamina', 'Paracetamol oral', 'Soro glicosado a 5%'],
        correctIndex: 1
      },
      {
        id: 'far-pre-5',
        question: 'O método PVPS no controle de estoque da farmácia significa:',
        options: ['Preço de Venda Para o Setor', 'Primeiro que Vence, Primeiro que Sai', 'Produto Válido Para Sempre', 'Pedido Válido Por Semana'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'far-post-1',
        question: 'O que ocorre se a Eritropoietina (EPO) for congelada acidentalmente dentro do refrigerador?',
        options: ['Aumenta a sua potência terapêutica', 'Ocorre desnaturação irreversível da molécula proteica biológica, com perda total da eficácia e risco de imunogenicidade', 'Pode ser descongelada em micro-ondas e usada normalmente', 'Muda apenas a cor do líquido'],
        correctIndex: 1,
        explanation: 'Fármacos proteicos biológicos sofrem quebra estrutural irreversível sob congelamento, devendo ser descartados imediatamente.'
      },
      {
        id: 'far-post-2',
        question: 'Por que o bicarbonato de sódio diluído não pode ficar estocado em galões abertos por mais de 24 horas?',
        options: ['Porque o galão pode quebrar', 'Porque perde CO2 para o ambiente elevando o pH e funciona como meio propício para multiplicação de bactérias pirogênicas', 'Porque evapora completamente em 12 horas', 'Por exigência puramente estética'],
        correctIndex: 1,
        explanation: 'O bicarbonato líquido perde dióxido de carbono, alcaliniza excessivamente e suporta proliferação de bactérias gram-negativas produtoras de endotoxinas.'
      },
      {
        id: 'far-post-3',
        question: 'Com que frequência a temperatura dos refrigeradores de termolábeis da farmácia deve ser checada e registrada formalmente?',
        options: ['Uma vez por mês', 'No mínimo duas vezes ao dia (início e término de expediente) com termômetro calibrado de máxima e mínima', 'Apenas quando a energia cair', 'Semestralmente'],
        correctIndex: 1,
        explanation: 'O monitoramento bidiário garante a detecção imediata de desvios térmicos e a salvaguarda dos medicamentos biológicos caros.'
      },
      {
        id: 'far-post-4',
        question: 'Medicamentos de Alta Vigilância como a Heparina Sódica exigem qual procedimento de dispensação e administração?',
        options: ['Autoaplicação pelo próprio paciente na recepção', 'Dupla checagem independente de dose, via, diluição e lote antes da administração ao paciente', 'Dispensação sem prescrição médica', 'Uso livre sem anotação em prontuário'],
        correctIndex: 1,
        explanation: 'Erros com heparina estão entre os incidentes com maior letalidade em saúde, exigindo conferência por dois profissionais.'
      },
      {
        id: 'far-post-5',
        question: 'Ao receber um novo lote de concentrado ácido no almoxarifado, a equipe deve conferir obrigatoriamente:',
        options: ['Apenas a quantidade de caixas', 'Integridade dos lacres, laudo de análise do lote do fabricante, validade e compatibilidade da fórmula de eletrólitos', 'A cor do caminhão de entrega', 'O nome do motorista apenas'],
        correctIndex: 1,
        explanation: 'Receber fórmula ácida errada (ex: potássio 1 em vez de potássio 2 mEq/L) pode provocar hipocalemia com arritmias fatais nos pacientes.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 9. HIGIENIZAÇÃO: LIMPEZA DAS SALAS DE DIÁLISE E ISOLAMENTO DE HEPATITE B
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-higienizacao',
    title: 'Higienização das Salas de Diálise e Protocolos de Isolamento (Hepatite B)',
    description: 'Diferenciação entre limpeza concorrente e terminal, manejo de derramamento biológico, produtos padronizados e rotina da Sala Amarela (HBsAg+).',
    sector: 'Higienizacao',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Supervisora de Higienização Hospitalar & CCIH',
    instructorRole: 'Serviço de Higiene Hospitalar e Controle Ambiental',
    textContent: `### 1. Desafios da Higiene em Ambiente Hemodialítico
A sala de hemodiálise é considerada área crítica hospitalar devido à circulação constante de sangue extracorpóreo, pacientes imunossuprimidos e equipamentos eletrônicos complexos.

### 2. Limpeza Concorrente vs. Limpeza Terminal
- **Limpeza Concorrente:** Realizada entre os turnos de diálise após a saída de cada paciente:
  - Fricção com desinfetante hospitalar de nível intermediário (quaternário de amônio de 5ª geração ou álcool 70%) em poltronas, mesas de apoio, suportes de soro e superfície externa da máquina de diálise.
  - Retirada de lençóis descartáveis e descarte no lixo infectante (Grupo A).
  - Nunca varrer a seco! A limpeza do piso deve ser sempre úmida com mop e detergente desinfetante neutro.
- **Limpeza Terminal:** Realizada ao final do último turno diário e semanalmente em profundidade:
  - Higienização completa de paredes, luminárias, janelas, teto, rodapés e toda a extensão das poltronas e bancadas.

### 3. Sala Exclusiva de Hepatite B (Sala Amarela / HBsAg+)
- O vírus da Hepatite B (HBV) é extremamente resistente no meio ambiente, sobrevivendo por mais de 7 dias em superfícies secas.
- **Regras Estritas de Isolamento:**
  - Materiais de limpeza (mops, baldes, panos de microfibra, luvas) são de **uso estritamente exclusivo** da sala de Hepatite B. Nunca levar esses itens para a sala geral!
  - Todos os colaboradores atuantes na sala amarela devem ter comprovação de imunização com Anti-HBs positivo ($> 10$ mUI/mL).
  - Dialisadores de pacientes com Hepatite B são de descarte único (proibido qualquer reuso).

### 4. Manejo de Derramamento de Sangue e Fluidos Biológicos
1. Isolar a área imediatamente para evitar que pessoas pisem no sangue.
2. Paramentar-se com EPIs completos (luvas de borracha grossa, avental e máscara).
3. Cobrir o sangue com papel toalha absorvente para conter o espalhamento.
4. Aplicar solução de Hipoclorito de Sódio a 1% sobre o papel e deixar agir por 10 minutos.
5. Recolher todo o material e descartar obrigatoriamente no saco branco leitoso de risco biológico (Grupo A). Enxaguar e desinfetar o piso.`,
    preTestQuestions: [
      {
        id: 'hig-pre-1',
        question: 'Qual a conduta correta sobre a varredura do piso dentro das salas de hemodiálise?',
        options: ['Varrer com vassoura de cerdas secas para levantar poeira', 'É proibida a varredura a seco; deve ser feita exclusivamente limpeza úmida com mop hospitalar', 'Apenas aspirar sem lavar', 'Jogar água fervendo'],
        correctIndex: 1
      },
      {
        id: 'hig-pre-2',
        question: 'Os materiais de limpeza (baldes, panos e mops) usados na Sala Amarela (Hepatite B) podem ser utilizados na sala de diálise geral?',
        options: ['Sim, se lavar com sabão', 'Terminantemente NÃO; devem ser de uso exclusivo e restrito à sala de Hepatite B', 'Apenas nos finais de semana', 'Se o médico permitir'],
        correctIndex: 1
      },
      {
        id: 'hig-pre-3',
        question: 'Diante de um derramamento de sangue no chão da sala de diálise, qual a primeira conduta antes de passar desinfetante?',
        options: ['Passar pano úmido espalhando o sangue', 'Absorver o sangue com papel toalha descartável antes de aplicar a solução desinfetante', 'Deixar secar naturalmente ao sol', 'Jogar álcool gel diretamente no sangue'],
        correctIndex: 1
      },
      {
        id: 'hig-pre-4',
        question: 'Em qual cor de saco plástico de resíduo devem ser descartados os panos e toalhas sujas de sangue de hemodiálise?',
        options: ['Saco preto comum', 'Saco branco leitoso com símbolo de substância infectante (Grupo A)', 'Saco azul de recicláveis', 'Saco transparente'],
        correctIndex: 1
      },
      {
        id: 'hig-pre-5',
        question: 'O que diferencia a limpeza concorrente da limpeza terminal na clínica?',
        options: ['A cor do uniforme do colaborador', 'A concorrente é realizada entre turnos e a terminal é a limpeza profunda ao final do dia ou semanalmente', 'A concorrente usa água e a terminal não usa água', 'São exatamente a mesma coisa'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'hig-post-1',
        question: 'Por que o vírus da Hepatite B (HBV) exige cuidados extremos de isolamento e desinfecção em nefrologia?',
        options: ['Porque não existe vacina', 'Porque possui altíssima infectividade e sobrevive mais de uma semana infeccioso em superfícies secas inanimadas', 'Porque evapora no ar', 'Porque só ataca as máquinas'],
        correctIndex: 1,
        explanation: 'O HBV tem estabilidade ambiental muito superior ao HIV e Hepatite C, tornando qualquer falha na higiene de poltronas uma via de surto.'
      },
      {
        id: 'hig-post-2',
        question: 'Qual o tempo mínimo de contato recomendado ao aplicar solução de hipoclorito a 1% sobre derramamento biológico contido?',
        options: ['10 segundos', 'Pelo menos 10 a 15 minutos para garantir ação germicida de largo espectro', '2 horas', 'Não precisa aguardar'],
        correctIndex: 1,
        explanation: 'O cloro necessita de tempo de contato para inativar vírus envelopados e não-envelopados presentes na carga proteica do sangue.'
      },
      {
        id: 'hig-post-3',
        question: 'Qual o sentido correto do movimento de limpeza ao friccionar superfícies de poltronas e mesas clínicas?',
        options: ['Movimentos circulares de vai e vem repetidos', 'Sentido unidirecional, do mais limpo para o mais contaminado e de cima para baixo', 'De baixo para cima espalhando o pó', 'Sem qualquer critério de direção'],
        correctIndex: 1,
        explanation: 'Movimentos circulares apenas redistribuem os microrganismos sobre a superfície recém-limpa.'
      },
      {
        id: 'hig-post-4',
        question: 'O profissional de higienização que atua na sala de pacientes com Hepatite B deve obrigatoriamente possuir:',
        options: ['Carteira de motorista', 'Esquema vacinal completo de Hepatite B com confirmação laboratorial de imunidade (Anti-HBs reagente)', 'Mais de 10 anos de clínica', 'Curso superior de farmácia'],
        correctIndex: 1,
        explanation: 'A NR-32 exige comprovação sorológica da eficácia da vacina para todos os trabalhadores expostos a pacientes HBsAg positivos.'
      },
      {
        id: 'hig-post-5',
        question: 'Por que a limpeza concorrente das poltronas de hemodiálise é realizada imediatamente após a saída de cada paciente?',
        options: ['Para que a sala pareça bonita para os visitantes', 'Para impedir a transmissão cruzada de patógenos multirresistentes e vírus sanguíneos entre pacientes de turnos sucessivos', 'Para resfriar o couro da poltrona', 'Para cumprir horário'],
        correctIndex: 1,
        explanation: 'Pacientes em diálise compartilham a mesma poltrona horas depois; a desinfecção intermediária quebra a cadeia de transmissão.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 10. NUTRIÇÃO: TERAPIA NUTRICIONAL NO PACIENTE EM HEMODIÁLISE
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-nutricao',
    title: 'Terapia Nutricional Renal: Manejo de Potássio, Fósforo e Balanço Hídrico',
    description: 'Estratégias dietéticas para prevenção de hipercalemia fatal, controle de hiperfosfatemia, ajuste proteico-calórico e ganho de peso interdialítico.',
    sector: 'Nutricao',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Nutricionista Especialista em Doenças Renais',
    instructorRole: 'Serviço de Nutrição Clínica e Terapia Nutricional Renal',
    textContent: `### 1. Desafios Nutricionais na Doença Renal Crônica Terminal
O paciente anúrico em hemodiálise enfrenta o paradoxo entre a necessidade de restrição rigorosa de eletrólitos e líquidos versus a necessidade de alta oferta proteica para combater o desgaste proteico-energético (DPE).

### 2. Manejo Dietético do Potássio e Prevenção de Hipercalemia
- O potássio sérico deve se manter entre **3,5 e 5,5 mEq/L**. Níveis $> 6,0$ mEq/L causam arritmias ventriculares malignas e parada cardíaca súbita.
- **Técnicas Culinárias de Redução de Potássio:**
  - Descascar, picar em cubos pequenos e deixar vegetais de molho em água abundante por no mínimo 2 horas.
  - Cozimento em água fervente com descarte obrigatório da primeira água de cocção (reduz em até 60% o teor de potássio de batatas, mandiocas e legumes).
- Frutas com alto teor de potássio a serem controladas: Banana-nanica, carambola (contraindicada formalmente por neurotoxina), abacate, maracujá e água de coco.

### 3. Controle do Fósforo e Uso Correto de Quelantes
- **Biodisponibilidade do Fósforo:**
  - Fósforo Inorgânico (Aditivos químicos de ultraprocessados, refrigerantes à base de cola, embutidos): Absorção intestinal de **90 a 100%**. Deve ser eliminado da dieta!
  - Fósforo Orgânico Animal (Carnes, laticínios): Absorção de 40 a 60%.
  - Fósforo Orgânico Vegetal (Leguminosas, feijão): Absorção baixa (20 a 40%) por estar ligado a fitatos.
- Orientação sobre Quelantes: O Sevelamer ou Carbonato de Cálcio deve ser ingerido **junto com a primeira garfada da refeição**, e não horas antes ou depois.

### 4. Aporte Proteico e Controle do Ganho de Peso Interdialítico (GPID)
- **Recomendação Proteica:** 1,2 a 1,4 g de proteína/kg de peso seco/dia para compensar a perda de 10 a 13 g de aminoácidos a cada sessão de hemodiálise.
- **Ganho de Peso Interdialítico Seguro:** Deve ser inferior a **4% a 5% do peso seco** (ex: no máximo 2 a 3 kg entre as sessões). Ganho excessivo leva a edema agudo de pulmão, sobrecarga ventricular e hipertensão refratária.`,
    preTestQuestions: [
      {
        id: 'nut-pre-1',
        question: 'Qual a técnica culinária recomendada ao paciente em hemodiálise para reduzir o teor de potássio de tubérculos e vegetais?',
        options: ['Fritar em óleo quente', 'Picar em cubos pequenos, ferver em água abundante e descartar a água do cozimento', 'Comer cru com a casca', 'Deixar no micro-ondas por 1 minuto'],
        correctIndex: 1
      },
      {
        id: 'nut-pre-2',
        question: 'Por que a carambola é formalmente proibida para pacientes portadores de insuficiência renal crônica?',
        options: ['Porque engorda muito rápido', 'Porque contém a neurotoxina Caramboxina que não é depurada pelo rim lesionado, causando soluços intratáveis, convulsões e óbito', 'Porque estraga as poltronas da clínica', 'Porque causa azia'],
        correctIndex: 1
      },
      {
        id: 'nut-pre-3',
        question: 'Qual tipo de fósforo possui a maior taxa de absorção intestinal (quase 100%) e deve ser banido da dieta renal?',
        options: ['Fósforo orgânico do feijão', 'Fósforo inorgânico adicionado artificialmente em alimentos ultraprocessados, refrigerantes e embutidos', 'Fósforo de peixes de água doce', 'Fósforo de maçã'],
        correctIndex: 1
      },
      {
        id: 'nut-pre-4',
        question: 'O ganho de peso interdialítico (GPID) considerado seguro entre as sessões não deve ultrapassar:',
        options: ['10 kg por semana', 'Aproximadamente 4% a 5% do peso seco do paciente (cerca de 2 a 3 kg)', '20% do peso corporal', 'Não há limite para ganho de peso'],
        correctIndex: 1
      },
      {
        id: 'nut-pre-5',
        question: 'Qual a recomendação diária aproximada de ingestão proteica para o paciente em hemodiálise crônica estável?',
        options: ['0,2 g/kg/dia (dieta sem nenhuma proteína)', '1,2 a 1,4 g de proteína por kg de peso seco ao dia', '5,0 g/kg/dia', 'Dieta exclusivamente de carboidratos'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'nut-post-1',
        question: 'Qual o momento correto em que o paciente renal deve ingerir o seu medicamento quelante de fósforo prescrito?',
        options: ['Em jejum total ao acordar', 'Exatamente durante as principais refeições, junto com a alimentação', 'Três horas após o jantar', 'Apenas no início da sessão de hemodiálise'],
        correctIndex: 1,
        explanation: 'Os quelantes precisam estar misturados ao bolo alimentar no estômago e intestino delgado para se ligar ao fósforo e eliminá-lo nas fezes.'
      },
      {
        id: 'nut-post-2',
        question: 'Por que a hipercalemia (potássio sérico > 6,0 mEq/L) é considerada uma das emergências mais graves em nefrologia?',
        options: ['Porque faz o paciente perder a voz', 'Porque altera o potencial de repouso das fibras miocárdicas, gerando fibrilação ventricular e assistolia sem aviso prévio', 'Porque diminui o peso da diálise', 'Porque gera vermelhidão na pele'],
        correctIndex: 1,
        explanation: 'O potássio elevado paralisa a condução elétrica do coração, exigindo intervenção rápida com gluconato de cálcio, glicoinsulina ou diálise imediata.'
      },
      {
        id: 'nut-post-3',
        question: 'Um ganho de peso interdialítico superior a 5 kg em um paciente de 60 kg predispõe diretamente a qual risco agudo?',
        options: ['Hipotermia durante o sono', 'Edema agudo de pulmão hipervolêmico e necessidade de ultrafiltração excessiva com hipotensão intradialítica grave', 'Desnutrição aguda por carência de sal', 'Melhora da diurese residual'],
        correctIndex: 1,
        explanation: 'O excesso de líquidos inunda os alvéolos pulmonares e obriga a máquina a puxar volume em taxa muito superior à capacidade de refilamento vascular.'
      },
      {
        id: 'nut-post-4',
        question: 'A ingestão de água e líquidos em pacientes anúricos deve ser orientada com base em:',
        options: ['Vontade livre sem limites (3 a 4 litros ao dia)', 'Volume fixo de 500 mL mais o equivalente à diurese residual de 24 horas', 'Ingestão de sucos ácidos concentrados', 'Tomar água somente durante a hemodiálise'],
        correctIndex: 1,
        explanation: 'O balanço hídrico restrito previne a sobrecarga cardiovascular no paciente que não tem mais capacidade de urinar.'
      },
      {
        id: 'nut-post-5',
        question: 'O Desgaste Proteico-Energético (DPE) em pacientes renais é caracterizado por:',
        options: ['Ganho acelerado de massa muscular', 'Perda involuntária e progressiva de massa muscular e reservas energéticas associada à inflamação crônica e baixa ingesta', 'Aumento da produção de urina', 'Redução do colesterol bom apenas'],
        correctIndex: 1,
        explanation: 'O DPE é o principal preditor de mortalidade em hemodiálise, exigindo suplementação nutricional hiperproteica específica para nefropatas.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 11. PSICOLOGIA E SERVIÇO SOCIAL: ADESÃO E SUPORTE PSICOSSOCIAL
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-psicossocial',
    title: 'Suporte Psicossocial, Adesão Terapêutica e Manejo de Conflitos em Nefrologia',
    description: 'Acolhimento ao luto da perda da função renal, estratégias para adesão de pacientes resistentes, direitos sociais (Passe Livre, BPC) e preparação para transplante.',
    sector: 'Psicologia',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Psicóloga Clínica & Assistente Social',
    instructorRole: 'Serviço de Apoio Psicossocial e Saúde Mental do Paciente Renal',
    textContent: `### 1. O Impacto Biopsicossocial da Terapia Renal Substitutiva
O diagnóstico de insuficiência renal crônica e o início repentino da hemodiálise representam uma ruptura profunda na vida do indivíduo: dependência de uma máquina 3 vezes por semana, restrição hídrica, perda do emprego e alteração da autoimagem corporal devido a cateteres e fístulas.

### 2. As Fases Psicológicas e a Não-Adesão
- **Fases do Ajuste:** Negação, revolta, barganha, depressão e aceitação.
- **Manifestações de Não-Adesão:** Faltas repetidas às sessões de diálise, recusa em tomar medicamentos prescritos, transgressão intencional da dieta e consumo abusivo de líquidos.
- **Abordagem da Equipe:** Nunca utilizar coerção ou ameaças de morte ("se você não dialisar vai morrer"). A abordagem deve ser pautada na escuta empática, acolhimento das angústias e pactuação de metas terapêuticas realistas.

### 3. Direitos Sociais do Paciente Renal Crônico no Brasil
O Serviço Social desempenha papel vital na garantia da cidadania e da sustentabilidade do tratamento:
- **Passe Livre de Transporte:** Gratuidade no transporte público municipal e interestadual para deslocamento às sessões de hemodiálise.
- **Benefício de Prestação Continuada (BPC/LOAS):** Para pacientes renais sem fonte de renda e em situação de vulnerabilidade social comprovada.
- **Aposentadoria por Invalidez e Isenções Fiscais:** Orientação para auxílio-doença, aposentadoria pelo INSS e isenções tributárias (IPVA, IPI para veículos, Isenção de IRPF sobre proventos de aposentadoria).

### 4. Preparação Emocional e Social para o Transplante Renal
- Desmistificação de mitos sobre o transplante.
- Acompanhamento da fila da Central Estadual de Transplantes e incentivo à realização dos exames anuais de manutenção na lista ativa.
- Fortalecimento da rede de apoio familiar e suporte ao cuidador principal contra a Síndrome de Burnout do Cuidador.`,
    preTestQuestions: [
      {
        id: 'psi-pre-1',
        question: 'Qual a reação psicológica inicial mais frequente observada no paciente ao receber o diagnóstico da necessidade de hemodiálise?',
        options: ['Sentimento de euforia e comemoração', 'Negação, medo da morte, sensação de perda de liberdade e revolta', 'Indiferença absoluta', 'Adesão imediata e perfeita'],
        correctIndex: 1
      },
      {
        id: 'psi-pre-2',
        question: 'Diante de um paciente que falta frequentemente às sessões de hemodiálise, a postura recomendada da equipe multiprofissional é:',
        options: ['Expulsar o paciente da clínica imediatamente', 'Acolhimento empático, investigação dos fatores psicossociais/logísticos da falta e pactuação de metas conjuntas', 'Gritar com o paciente na frente de todos', 'Ignorar as faltas sem registrar'],
        correctIndex: 1
      },
      {
        id: 'psi-pre-3',
        question: 'Qual dos benefícios a seguir é um direito garantido por lei para viabilizar o deslocamento do paciente renal ao tratamento?',
        options: ['Passaporte diplomático', 'Passe Livre de Transporte Sanitário / Coletivo municipal e intermunicipal', 'Desconto em viagens aéreas de turismo', 'Carro particular fornecido pela clínica'],
        correctIndex: 1
      },
      {
        id: 'psi-pre-4',
        question: 'O papel do Serviço Social na clínica de hemodiálise visa primariamente:',
        options: ['Cobrar dívidas em atraso', 'Garantir o acesso aos direitos de cidadania, benefícios previdenciários/sociais e fortalecer a rede de apoio familiar', 'Apenas organizar festas de aniversário', 'Auxiliar na limpeza das máquinas'],
        correctIndex: 1
      },
      {
        id: 'psi-pre-5',
        question: 'A Síndrome de Burnout do Cuidador refere-se a:',
        options: ['Uma infecção bacteriana do cateter', 'Esgotamento físico, emocional e psicológico extremo do familiar responsável pelos cuidados diários do paciente renal crônico', 'Uma queimação na pele', 'Uma falha no motor da máquina'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'psi-post-1',
        question: 'Por que abordagens baseadas em intimidação e ameaças ("você vai morrer se faltar") fracassam com pacientes renais resistentes?',
        options: ['Porque o paciente não escuta nada', 'Porque ampliam a ansiedade, o sentimento de desamparo e a negação defensiva, afastando o paciente do vínculo de confiança com a equipe', 'Porque o paciente gosta de ameaças', 'Porque a lei não permite conversar'],
        correctIndex: 1,
        explanation: 'Comunicação baseada em medo gera fuga e retraimento; o vínculo terapêutico sólido é o único preditor real de adesão a longo prazo.'
      },
      {
        id: 'psi-post-2',
        question: 'O Benefício de Prestação Continuada (BPC/LOAS) pode ser pleiteado por pacientes renais crônicos quando:',
        options: ['Qualquer paciente mesmo milionário', 'Comprovada incapacidade para o trabalho e situação de vulnerabilidade e baixa renda familiar per capita', 'Somente se fizerem hemodiálise há mais de 10 anos', 'Apenas pacientes solteiros'],
        correctIndex: 1,
        explanation: 'O BPC garante 1 salário mínimo mensal para pessoas com deficiência de longo prazo em situação de vulnerabilidade socioeconômica.'
      },
      {
        id: 'psi-post-3',
        question: 'Como a equipe de saúde deve apoiar o familiar cuidador principal do paciente renal dependente?',
        options: ['Exigindo que o cuidador fique 24h na clínica sem descanso', 'Ofertando escuta acolhedora, orientando sobre divisão de tarefas na família e inserindo o cuidador em grupos de apoio', 'Não conversando com familiares', 'Transferindo toda a responsabilidade jurídica para o cuidador'],
        correctIndex: 1,
        explanation: 'Cuidadores sobrecarregados adoecem mentalmente, o que desestabiliza diretamente o tratamento do paciente dependente.'
      },
      {
        id: 'psi-post-4',
        question: 'Em relação ao preparo psicossocial para o Transplante Renal, o trabalho interdisciplinar consiste em:',
        options: ['Prometer cura mágica e vida sem nenhum remédio', 'Acolher ansiedades, esclarecer a necessidade de imunossupressão contínua pós-transplante e acompanhar a manutenção dos exames da fila', 'Desestimular o paciente a se inscrever', 'Obrigar o paciente a operar'],
        correctIndex: 1,
        explanation: 'O transplante substitui a modalidade dialítica, mas requer disciplina com imunossupressores para evitar a rejeição do enxerto.'
      },
      {
        id: 'psi-post-5',
        question: 'A prática de Comunicação Não-Violenta (CNV) na mediação de conflitos na sala de hemodiálise envolve:',
        options: ['Calar o paciente na frente dos demais', 'Identificar os sentimentos e necessidades não atendidas por trás da agressividade, mantendo postura empática e neutra', 'Chamar a polícia para qualquer discordância', 'Concordar com tudo mesmo que fira a segurança'],
        correctIndex: 1,
        explanation: 'Agressividade na clínica muitas vezes esconde medo da morte ou dor física; desarmar com empatia restabelece a cooperação.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 12. RECEPÇÃO E ATENDIMENTO: ACOLHIMENTO E TRANSPORTE SANITÁRIO
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-recepcao',
    title: 'Acolhimento na Recepção, Agendamento de Turnos e Gestão de Transporte',
    description: 'Gestão humanizada da entrada do paciente, controle de pesagem inicial, articulação com frotas de ambulâncias das prefeituras e gestão de filas prioritárias.',
    sector: 'Recepcao',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Supervisor de Recepção & Experiência do Paciente',
    instructorRole: 'Atendimento Humanizado e Gestão de Fluxos Ambulatoriais',
    textContent: `### 1. A Recepção como Porta de Entrada do Cuidado
A recepção de uma clínica de hemodiálise não é um mero balcão burocrático; ela é o primeiro termômetro do estado de saúde e bem-estar do paciente crônico que chega debilitado para a sessão.

### 2. Rotina da Entrada e Pesagem Pré-Diálise
- **Acolhimento Pontual:** Organização dos fluxos de entrada conforme os turnos (1º, 2º e 3º turnos), evitando aglomerações e garantindo que o paciente não fique em pé em filas.
- **Pesagem Obrigatória Inicial:**
  - Orientar o paciente a retirar casacos pesados, calçados e bolsas volumosas antes de subir na balança.
  - O registro correto do peso pré-diálise é vital: um erro de 1 kg digitado na recepção pode levar a uma programação incorreta de ultrafiltração na máquina, causando hipotensão severa!
  - Identificar sinais visíveis de alerta: falta de ar ao caminhar, lábios arroxeados (cianose) ou confusão mental devem ser comunicados **imediatamente** à enfermagem.

### 3. Articulação com o Transporte Sanitário Municipal
- Grande parte dos pacientes dialíticos depende de vans e ambulâncias enviadas pelas Secretarias Municipais de Saúde de cidades vizinhas.
- **Comunicação Proativa:** Avisar os motoristas sobre a previsão exata de término das sessões para que os pacientes não fiquem aguardando horas a fio após a diálise, momento em que estão fadigados e com maior risco de hipotensão postural.
- Registro formal de atrasos e horários de saída para fins de auditoria e relatórios de transporte.

### 4. Humanização e Prioridades Legais (Lei 10.048/2000)
- Atendimento prioritário imediato para idosos com mais de 80 anos, cadeirantes e pacientes debilitados.
- Tratamento cortês com nome social e acolhimento caloroso das dúvidas dos familiares.`,
    preTestQuestions: [
      {
        id: 'rec-pre-1',
        question: 'Qual a importância crítica da pesagem correta do paciente na balança da recepção antes da sessão de diálise?',
        options: ['Apenas para fins estatísticos do IBGE', 'Porque o peso pré-diálise determina a taxa de água que a máquina de diálise terá que retirar do paciente', 'Para cobrar passagem de transporte', 'Não tem importância clínica'],
        correctIndex: 1
      },
      {
        id: 'rec-pre-2',
        question: 'Ao observar um paciente chegando na recepção com evidente falta de ar (dispneia) e cansaço extremo, a conduta correta do recepcionista é:',
        options: ['Pedir para ele sentar e aguardar na fila normal por 1 hora', 'Acionar imediatamente a equipe de enfermagem/médico para avaliação prioritária de urgência', 'Oferecer um copo cheio de água gelada', 'Ignorar e continuar digitando'],
        correctIndex: 1
      },
      {
        id: 'rec-pre-3',
        question: 'Por que a comunicação da recepção com os motoristas de ambulâncias e vans das prefeituras é estratégica?',
        options: ['Para fazer fofoca sobre a viagem', 'Para sincronizar o término das sessões e evitar que pacientes debilitados fiquem aguardando horas após a diálise', 'Para abastecer as vans com gasolina da clínica', 'Não deve haver contato'],
        correctIndex: 1
      },
      {
        id: 'rec-pre-4',
        question: 'Ao pesar o paciente na balança analógica ou digital, qual orientação deve ser sempre dada?',
        options: ['Subir com mochila pesada e casacos grossos', 'Retirar casacos pesados, sapatos e bolsas para registrar o peso real fidedigno', 'Segurar-se firme nas paredes para aliviar o peso', 'Pesar de olhos fechados'],
        correctIndex: 1
      },
      {
        id: 'rec-pre-5',
        question: 'Qual lei brasileira garante atendimento prioritário imediato para idosos, pessoas com deficiência e mobilidade reduzida na recepção?',
        options: ['Código de Trânsito Brasileiro', 'Lei Federal nº 10.048/2000 (Lei da Prioridade de Atendimento)', 'Lei de Patentes', 'Consolidação das Leis do Trabalho'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'rec-post-1',
        question: 'Se a balança da recepção registrar 2 kg a mais por erro de digitação ou casaco pesado, qual a complicação previsível na máquina?',
        options: ['A diálise fica mais rápida', 'A máquina programará ultrafiltração excessiva de 2 litros a mais, levando a hipotensão severa, choque e câimbras intensas', 'O paciente ganha peso muscular', 'Nenhum impacto'],
        correctIndex: 1,
        explanation: 'A ultrafiltração é calculada pela diferença entre o peso de chegada e o peso seco; erro no peso de entrada desestabiliza a prescrição.'
      },
      {
        id: 'rec-post-2',
        question: 'Como a recepção deve proceder quando um paciente cadastrado falta inesperadamente ao seu turno habitual de hemodiálise?',
        options: ['Dar baixa definitiva no cadastro sem avisar ninguém', 'Registrar a ausência no sistema e comunicar imediatamente à enfermagem e ao serviço social para contato de busca ativa', 'Esperar o paciente aparecer na semana seguinte', 'Passar a vaga para outra pessoa da rua'],
        correctIndex: 1,
        explanation: 'A falta à diálise pode ser decorrente de óbito domiciliar, internamento em UPA ou crise hipercalêmica, exigindo busca ativa imediata.'
      },
      {
        id: 'rec-post-3',
        question: 'Qual a postura ética recomendada perante familiares ansiosos que reclamam de eventuais atrasos no início do turno?',
        options: ['Discutir de forma áspera e mandar calar a boca', 'Escuta atenta e empática, explicação transparente sobre a necessidade de desinfecção segura das máquinas e acolhimento sereno', 'Trancar a porta de entrada', 'Dizer que a clínica não tem obrigação'],
        correctIndex: 1,
        explanation: 'A transparência e a tranquilidade no atendimento evitam a escalada de conflitos e transmitem segurança sobre as rotinas sanitárias.'
      },
      {
        id: 'rec-post-4',
        question: 'O paciente recém-saído da hemodiálise que aguarda o transporte sanitário no saguão apresenta maior risco de:',
        options: ['Fadiga e hipotensão ortostática com risco de desmaio e queda ao se levantar bruscamente', 'Hipertermia maligna', 'Aumento repentino da visão', 'Alergia ao ar livre'],
        correctIndex: 1,
        explanation: 'Após a retirada de líquido e sangue extracorpóreo, o paciente fica vulnerável à queda brusca de pressão ao ficar em pé.'
      },
      {
        id: 'rec-post-5',
        question: 'Qual a conduta da recepção caso chegue um paciente com suspeita de sintoma respiratório transmissível (tosse, coriza ou febre)?',
        options: ['Mandar voltar para casa sem dialisar', 'Fornecer imediatamente máscara cirúrgica, orientar higienização das mãos e notificar a enfermagem para isolamento de gotículas', 'Misturar com os demais na sala de espera', 'Trancar o paciente no banheiro'],
        correctIndex: 1,
        explanation: 'A barreira de proteção respiratória precoce na recepção impede surtos de vírus respiratórios na sala comunitária de hemodiálise.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 13. FATURAMENTO E APAC: AUDITORIA DE PRONTUÁRIOS E REGRAS SUS
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-faturamento',
    title: 'Faturamento de APAC de Hemodiálise, Auditoria de Prontuários e SUS',
    description: 'Normas de autorização de procedimentos ambulatoriais de alta complexidade (APAC), preenchimento de laudos, checagem de presenças e prevenção de glosas.',
    sector: 'Faturamento',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Especialista em Faturamento SUS & Auditoria Médica',
    instructorRole: 'Setor de Faturamento Hospitalar e Auditoria em Saúde',
    textContent: `### 1. O Sistema de Alta Complexidade do SUS (APAC de Nefrologia)
O financiamento da Terapia Renal Substitutiva (TRS) no Brasil ocorre majoritariamente pelo Sistema Único de Saúde (SUS) por meio de Autorização de Procedimentos Ambulatoriais de Alta Complexidade (APAC).

### 2. Requisitos do Laudo Médico Inicial e Renovação de APAC
- O Laudo para Solicitação de APAC deve ser preenchido e assinado pelo médico nefrologista com CRM ativo e RQE em nefrologia.
- **Códigos Principais da Tabela SIGTAP/SUS:**
  - Procedimento: Hemodiálise Convencional (código 03.05.01.010-7) - máximo de 13 a 14 sessões cobradas por competência mensal (3 sessões/semana).
  - Procedimento: Diálise Peritoneal Ambulatorial Contínua (CAPD/DPAC) ou Automatizada (DPA).
- Critérios Clínicos Obrigatórios: CID-10 correspondente (ex: N18.0 - DRC terminal), data de início do tratamento, valor basal de creatinina sérica e taxa de filtração glomerular ($TFG < 15$ mL/min/1,73m²).
- **Validade da APAC:** A cada 3 meses deve ser feita a renovação formal conforme a portaria ministerial vigente.

### 3. Exames Laboratoriais Mensais Obrigatórios
Para validação e faturamento da APAC de nefrologia, o SUS exige a realização de painel periódico regular:
- **Mensal:** Ureia pré e pós-diálise (para cálculo de Kt/V), Creatinina, Potássio, Fósforo, Cálcio, Hemograma completo.
- **Trimestral:** Ferritina sérica, Índice de Saturação de Transferrina (ISAT), Fosfatase Alcalina, PTH intacto.
- **Semestral / Anual:** Sorologias obrigatórias (Hepatite B - HBsAg e Anti-HBs, Hepatite C - Anti-HCV, HIV).

### 4. Auditoria de Prontuário e Prevenção de Glosas
- A folha de presença e evolução clínica diária deve conter obrigatoriamente a assinatura do paciente ou responsável a cada sessão realizada.
- Sessão sem registro de parâmetros (peso inicial, peso final, tempo de diálise, PA e assinatura) é passível de glosa imediata pela auditoria municipal e estadual do SUS.`,
    preTestQuestions: [
      {
        id: 'fat-pre-1',
        question: 'Qual o instrumento oficial utilizado pelo SUS para autorizar e faturar os procedimentos de hemodiálise crônica?',
        options: ['Guia de internação hospitalar (AIH)', 'Autorização de Procedimentos Ambulatoriais de Alta Complexidade (APAC)', 'Receituário simples de farmácia', 'Cheque nominal'],
        correctIndex: 1
      },
      {
        id: 'fat-pre-2',
        question: 'Qual a periodicidade de renovação do laudo de APAC de TRS exigida pelas diretrizes do SUS?',
        options: ['A cada 10 anos', 'Trimestral (a cada 3 meses) ou semestral conforme portaria do gestor local', 'Uma única vez na vida do paciente', 'Semanal'],
        correctIndex: 1
      },
      {
        id: 'fat-pre-3',
        question: 'Qual exame laboratorial mensal é exigido pelo SUS para comprovar a eficácia dialítica (Kt/V) nas auditorias de APAC?',
        options: ['Ureia pré e pós-diálise', 'Glicose na ponta do dedo apenas', 'Raio-X de coluna', 'Exame de fezes'],
        correctIndex: 0
      },
      {
        id: 'fat-pre-4',
        question: 'A falta de assinatura do paciente na ficha diária de presença da sessão de hemodiálise acarreta:',
        options: ['Aumento do valor faturado', 'Glosa financeira do procedimento pelo auditor do SUS por falta de comprovação da execução', 'Nenhum problema administrativo', 'Multa para o paciente'],
        correctIndex: 1
      },
      {
        id: 'fat-pre-5',
        question: 'Qual a Taxa de Filtração Glomerular (TFG) habitual que qualifica o paciente com DRC para indicação de início de TRS pelo SUS?',
        options: ['TFG acima de 90 mL/min', 'TFG inferior a 15 mL/min/1,73m² associada a sintomas urêmicos (DRC Estágio 5)', 'TFG de 60 mL/min sem sintomas', 'Qualquer TFG'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'fat-post-1',
        question: 'Qual é o impacto de uma glosa de faturamento em um lote de APACs de hemodiálise?',
        options: ['A clínica recebe bônus do Ministério da Saúde', 'O não pagamento dos custos das sessões executadas, gerando prejuízo financeiro e descontinuidade dos insumos', 'O paciente é transferido de cidade', 'O auditor é penalizado'],
        correctIndex: 1,
        explanation: 'Glosas decorrentes de erros de preenchimento ou falta de laudos retêm os repasses de alto custo fundamentais para a manutenção da clínica.'
      },
      {
        id: 'fat-post-2',
        question: 'Com que frequência as sorologias para Hepatite B, Hepatite C e HIV devem ser monitoradas no prontuário para conformidade com a portaria do SUS?',
        options: ['A cada 5 anos', 'Semestralmente para pacientes suscetíveis e anualmente para vacinados/imunes', 'Nunca precisam ser repetidas', 'Apenas se o paciente tiver febre'],
        correctIndex: 1,
        explanation: 'O rastreio sorológico periódico é exigência obrigatória para prevenir e detectar precocemente qualquer soroconversão na unidade.'
      },
      {
        id: 'fat-post-3',
        question: 'No preenchimento do Laudo de Solicitação de APAC, qual informação é estritamente mandatória para autorização do procedimento?',
        options: ['Cor favorita do paciente', 'CID-10 da causa básica da nefropatia, valores de exames comprobatórios de creatinina e assinatura de médico nefrologista especialista', 'Apenas a foto do paciente', 'Apenas o telefone do vizinho'],
        correctIndex: 1,
        explanation: 'O laudo é documento pericial submetido ao crivo do médico autorizador da Secretaria Municipal/Estadual de Saúde.'
      },
      {
        id: 'fat-post-4',
        question: 'O número máximo usual de sessões de hemodiálise ambulatorial faturáveis por mês para cada paciente em regime convencional de 3 vezes por semana é:',
        options: ['30 sessões', '13 a 14 sessões (conforme o calendário de dias úteis da competência)', '5 sessões', '60 sessões'],
        correctIndex: 1,
        explanation: 'A tabela SUS estipula o teto de 13 a 14 sessões mensais; sessões adicionais de emergência necessitam de justificativa clínica detalhada.'
      },
      {
        id: 'fat-post-5',
        question: 'A auditoria concorrente dos prontuários realizada internamente pela clínica tem como meta principal:',
        options: ['Encontrar culpados para punir', 'Identificar pendências documentais antes do envio da fatura, garantindo a integridade dos registros e prevenindo glosas sanitárias e financeiras', 'Diminuir o trabalho dos médicos', 'Gastar papel'],
        correctIndex: 1,
        explanation: 'Auditar previamente o prontuário assegura que todas as assinaturas, evoluções e laudos laboratoriais estejam perfeitamente anexados.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 14. QUALIDADE E NSP: METAS INTERNACIONAIS DE SEGURANÇA DO PACIENTE
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-seguranca',
    title: 'Metas Internacionais de Segurança do Paciente Aplicadas à Nefrologia (NSP)',
    description: 'Protocolos de identificação unívoca, conferência de dialisadores, segurança medicamentosa, comunicação na passagem de plantão e prevenção de quedas pós-diálise.',
    sector: 'Qualidade',
    workloadHours: 3,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Coordenador(a) do Núcleo de Segurança do Paciente (NSP)',
    instructorRole: 'Gestão da Qualidade Hospitalar e Segurança do Paciente',
    textContent: `### 1. As 6 Metas Internacionais de Segurança do Paciente
O Núcleo de Segurança do Paciente (NSP) da clínica de nefrologia é responsável por disseminar a cultura justa de segurança e implementar as metas da OMS/MS:
1. **Meta 1 - Identificação Correta do Paciente:**
   - Uso obrigatório de pulseira de identificação legível com **no mínimo 2 identificadores**: Nome completo e Data de nascimento (nunca utilizar o número da poltrona como identificador!).
   - Dupla checagem: Antes de conectar o paciente à máquina, checar a etiqueta do dialisador reusado e a prescrição com o nome verbalizado pelo paciente.
2. **Meta 2 - Comunicação Efetiva:**
   - Padronização da passagem de plantão entre os turnos de enfermagem utilizando a ferramenta **SBAR** (Situação, Breve Histórico, Avaliação e Recomendação).
3. **Meta 3 - Segurança na Prescrição e Administração de Medicamentos:**
   - Medicamentos de Alta Vigilância (Heparina, Cloreto de Potássio concentrado, Gluconato de Cálcio): Armazenamento segregado, identificação com alertas visuais e dupla conferência.
4. **Meta 4 - Cirurgia / Procedimento Seguro:**
   - Verificação do sítio anatômico correto para punção de acessos e troca de curativos de cateter.
5. **Meta 5 - Higienização das Mãos para Prevenção de IRAS:**
   - Aderência aos 5 momentos da OMS e fricção com álcool a 70%.
6. **Meta 6 - Prevenção de Quedas e Lesão por Pressão:**
   - Pacientes em hemodiálise apresentam altíssimo risco de queda no período pós-diálise imediato devido à hipotensão postural e perda volêmica.
   - **Protocolo de Alta Segura:** Aferir a PA sentado e em pé antes da liberação. O paciente só deve se levantar da poltrona acompanhado pela equipe, auxiliado no percurso até a saída.`,
    preTestQuestions: [
      {
        id: 'seg-pre-1',
        question: 'Quais os dois identificadores mínimos obrigatórios para identificação segura do paciente renal segundo a Meta 1?',
        options: ['Número da poltrona e cor da roupa', 'Nome completo do paciente e Data de nascimento', 'Primeiro nome e número do calçado', 'Apelido e nome da cidade'],
        correctIndex: 1
      },
      {
        id: 'seg-pre-2',
        question: 'Por que o número da poltrona de hemodiálise NUNCA deve ser utilizado como forma de identificar o paciente?',
        options: ['Porque as poltronas mudam de cor', 'Porque poltronas são móveis, pacientes trocam de lugar entre turnos e o risco de conectar o dialisador errado é gravíssimo', 'Porque o número é feio', 'Porque os números são em algarismos romanos'],
        correctIndex: 1
      },
      {
        id: 'seg-pre-3',
        question: 'O que deve ser realizado obrigatoriamente antes de liberar o paciente da poltrona ao final da sessão de diálise para prevenir quedas?',
        options: ['Mandar ele correr até a porta', 'Aferição da pressão arterial pós-diálise e auxílio físico na deambulação para prevenir hipotensão postural e quedas', 'Oferecer almoço pesado', 'Pedir para descer da poltrona sozinho'],
        correctIndex: 1
      },
      {
        id: 'seg-pre-4',
        question: 'A ferramenta padronizada SBAR na comunicação entre profissionais de saúde significa:',
        options: ['Sistema Básico de Água Residual', 'Situação, Breve Histórico, Avaliação e Recomendação', 'Semana Brasileira de Aconselhamento Renal', 'Soro, Bicarbonato, Ácido e Resíduos'],
        correctIndex: 1
      },
      {
        id: 'seg-pre-5',
        question: 'Qual a filosofia da Cultura Justa de Segurança defendida pelo Núcleo de Segurança do Paciente?',
        options: ['Punir e demitir quem notificar incidentes', 'Aprender com os quase-erros e incidentes através de notificações não-punitivas para aprimorar os processos institucionais', 'Esconder os erros da diretoria', 'Não registrar acidentes'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'seg-post-1',
        question: 'A conferência cruzada (dupla checagem) antes de iniciar a sessão de hemodiálise envolve:',
        options: ['Olhar se a máquina está ligada na tomada', 'Conferir os dados da pulseira do paciente com a etiqueta do dialisador reprocessado e a prescrição médica confirmando verbalmente com o paciente', 'Conferir o valor do faturamento SUS', 'Checar o horário do almoço'],
        correctIndex: 1,
        explanation: 'Conectar um dialisador de outro paciente pode transmitir vírus incuráveis como HIV e Hepatites B e C (evento sentinela gravíssimo).'
      },
      {
        id: 'seg-post-2',
        question: 'Por que o risco de queda é acentuadamente elevado logo após a desconexão da hemodiálise?',
        options: ['Porque o chão é liso', 'Devido à remoção rápida de volume e hipovolemia transitória que desencadeiam hipotensão ortostática quando o paciente fica em pé', 'Porque o paciente esquece de andar', 'Pelo uso de meias'],
        correctIndex: 1,
        explanation: 'A redistribuição de fluxo faz o sangue pooling nas pernas, reduzindo a perfusão cerebral transitória e provocando síncope.'
      },
      {
        id: 'seg-post-3',
        question: 'O que caracteriza um "Quase-Erro" (Near Miss) na rotina de hemodiálise?',
        options: ['Um erro que atingiu o paciente e causou morte', 'Um incidente com potencial de dano que foi interceptado pela equipe antes de atingir o paciente', 'Um atraso de 5 minutos do médico', 'Uma lâmpada queimada'],
        correctIndex: 1,
        explanation: 'Near misses fornecem as melhores oportunidades de melhoria de processos preventivos sem que o paciente sofra o dano.'
      },
      {
        id: 'seg-post-4',
        question: 'Medicamentos potencialmente perigosos (Alta Vigilância) como o Cloreto de Potássio 19,1% concentrado exigem qual barreira de segurança?',
        options: ['Ficar misturado nas gavetas comuns de dipirona', 'Armazenamento segregado com alerta visual chamativo e dupla checagem obrigatória antes de qualquer infusão', 'Aplicação sem diluição', 'Uso sem prescrição'],
        correctIndex: 1,
        explanation: 'A injeção acidental em bólus de cloreto de potássio concentrado é letal por parada cardíaca em diástole.'
      },
      {
        id: 'seg-post-5',
        question: 'A notificação de eventos adversos na plataforma do Núcleo de Segurança do Paciente deve ser encarada pela equipe como:',
        options: ['Uma denúncia policial contra o colega', 'Uma oportunidade educativa de melhoria sistêmica e fortalecimento das barreiras de defesa do paciente', 'Um motivo de vergonha profissional', 'Uma perda de tempo desnecessária'],
        correctIndex: 1,
        explanation: 'Ambientes seguros e maduros analisam a falha do processo e não a culpa do indivíduo.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 15. TI E ADMINISTRAÇÃO: SEGURANÇA DA INFORMAÇÃO E LGPD EM SAÚDE
  // -------------------------------------------------------------------------
  {
    id: 'trn-nefro-ti-lgpd',
    title: 'Segurança da Informação, LGPD e Sigilo do Prontuário Eletrônico em Nefrologia',
    description: 'Tratamento de dados pessoais sensíveis em saúde (Lei 13.709/2018), proteção de senhas, bloqueio de telas, proibição de fotos de prontuários e prevenção contra phishing.',
    sector: 'TI',
    workloadHours: 2,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 3,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'DPO & Encarregado de Proteção de Dados / Gestor de TI',
    instructorRole: 'Tecnologia da Informação e Segurança Digital em Saúde',
    textContent: `### 1. A LGPD no Contexto da Clínica de Nefrologia
A Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD) classifica informações de saúde, histórico clínico, prontuários, laudos e resultados sorológicos de pacientes renais como **Dados Pessoais Sensíveis**. O vazamento ou exposição dessas informações gera multas severas e processo ético-profissional.

### 2. Boas Práticas Digitais Indispensáveis
- **Bloqueio Obrigatório de Telas:** Sempre que o profissional se ausentar de sua estação de trabalho (mesmo que por 1 minuto), deve bloquear o computador utilizando o atalho \`Win + L\`. Deixar prontuários abertos visíveis a terceiros e acompanhantes viola a lei.
- **Senhas Pessoais e Intransferíveis:** Nunca compartilhar senhas de acesso aos sistemas clínicos ou anexar bilhetes com senhas no monitor. Toda ação no prontuário eletrônico é registrada em log de auditoria associado ao usuário logado.
- **Proibição Estrita de Captura de Imagens:** É terminantemente proibido fotografar prontuários, telas com exames ou pacientes com celulares pessoais para envio em grupos de WhatsApp ou redes sociais.

### 3. Prevenção Contra Golpes Cibernéticos e Phishing
- Nunca clicar em links desconhecidos ou anexos de e-mails suspeitos ("boleto atrasado", "atualização urgente de banco") em computadores da clínica. O ataque por *Ransomware* (sequestro de dados) pode paralisar as máquinas de hemodiálise e apagar o histórico de milhares de pacientes.
- Uso exclusivo de pendrives autorizados pela TI para evitar infecções por malware.

### 4. Conduta Frente a Incidentes de Segurança
Qualquer suspeita de invasão, tela travada ou extravio de documentos físicos contendo dados de pacientes deve ser reportada **imediatamente** ao Encarregado de Dados (DPO) da clínica para contenção e notificação à ANPD dentro do prazo legal.`,
    preTestQuestions: [
      {
        id: 'ti-pre-1',
        question: 'Segundo a LGPD (Lei 13.709/2018), os prontuários, diagnósticos e laudos de pacientes renais são classificados como:',
        options: ['Dados de domínio público na internet', 'Dados Pessoais Sensíveis sujeitos a proteção jurídica rigorosa', 'Dados sem valor legal', 'Propriedade pessoal do funcionário'],
        correctIndex: 1
      },
      {
        id: 'ti-pre-2',
        question: 'Qual a regra básica de segurança ao sair da sua estação de trabalho por alguns instantes na clínica?',
        options: ['Deixar o prontuário aberto na tela para o próximo ver', 'Bloquear imediatamente a tela do computador (atalho Win + L) exigindo senha para desbloqueio', 'Deixar a tela virada para o corredor', 'Desligar o monitor no botão mas deixar o computador destravado'],
        correctIndex: 1
      },
      {
        id: 'ti-pre-3',
        question: 'É permitido fotografar prontuários ou telas de exames com celular pessoal para compartilhar em grupos informais de mensagens?',
        options: ['Sim, para qualquer amigo', 'Terminantemente proibido pelo Código de Ética e pela LGPD sem consentimento formal e plataforma homologada', 'Sim, se tirar a foto de longe', 'Permitido nos finais de semana'],
        correctIndex: 1
      },
      {
        id: 'ti-pre-4',
        question: 'O compartilhamento de senhas de acesso entre colegas de trabalho no sistema da clínica é:',
        options: ['Uma boa prática de camaradagem', 'Estritamente proibido, pois cada usuário responde civil e criminalmente pelas ações registradas sob seu login', 'Obrigatório pela lei', 'Recomendado para agilizar'],
        correctIndex: 1
      },
      {
        id: 'ti-pre-5',
        question: 'O que caracteriza um ataque cibernético do tipo Phishing recebido por e-mail institucional?',
        options: ['Uma mensagem de parabéns da diretoria', 'Um e-mail falso com link ou anexo malicioso projetado para capturar senhas ou instalar vírus sequestradores de dados (Ransomware)', 'Uma atualização oficial do Windows', 'Um e-mail enviado pelo médico'],
        correctIndex: 1
      }
    ],
    postTestQuestions: [
      {
        id: 'ti-post-1',
        question: 'Por que o uso de senhas individuais e intransferíveis é mandatório nos sistemas de prontuário eletrônico?',
        options: ['Para que a TI saiba quem gasta mais memória', 'Para garantir a rastreabilidade e a fé pública dos registros em caso de perícia judicial ou auditoria sanitária', 'Apenas para dificultar o trabalho', 'Para economizar licenças de software'],
        correctIndex: 1,
        explanation: 'Se uma prescrição ou evolução errada for salva sob sua conta compartilhada, você responderá legalmente pela imperícia.'
      },
      {
        id: 'ti-post-2',
        question: 'Qual o risco para a clínica e para os pacientes em caso de infecção por Ransomware (sequestro digital de dados)?',
        options: ['O computador fica com a tela verde', 'Criptografia e bloqueio de todos os prontuários, prescrições de diálise e laudos com risco de interrupção do tratamento dos pacientes', 'Diminuição do brilho da tela', 'Aumento da temperatura ambiente'],
        correctIndex: 1,
        explanation: 'A indisponibilidade dos prontuários impede a verificação da prescrição do dialisato, paralisando as sessões e colocando vidas em risco.'
      },
      {
        id: 'ti-post-3',
        question: 'Documentos físicos impressos contendo dados pessoais de pacientes (como prescrições antigas e laudos) devem ser descartados:',
        options: ['Jogados inteiros no lixo comum da calçada', 'Fragmentados mecanicamente em triturador de papel antes do descarte para impedir vazamento de dados', 'Queimados na recepção', 'Doados para rascunho de crianças'],
        correctIndex: 1,
        explanation: 'A LGPD abrange dados digitais e em meio físico; o descarte sem trituração constitui incidente de segurança passível de sanção.'
      },
      {
        id: 'ti-post-4',
        question: 'Ao identificar um comportamento anômalo no computador (arquivos sumindo, janelas estranhas abrindo), a conduta imediata é:',
        options: ['Tentar consertar sozinho instalando programas da internet', 'Desconectar o cabo de rede imediatamente e comunicar o incidente com urgência à equipe de TI e ao DPO', 'Desligar e voltar para casa', 'Fingir que não viu'],
        correctIndex: 1,
        explanation: 'Desconectar o computador da rede isola a máquina e impede que o malware se propague lateralmente para os servidores centrais.'
      },
      {
        id: 'ti-post-5',
        question: 'Qual o papel do Encarregado de Dados (DPO) na estrutura hospitalar da clínica?',
        options: ['Vender computadores usados', 'Atuar como canal de comunicação entre a clínica, os titulares de dados (pacientes/colaboradores) e a Autoridade Nacional de Proteção de Dados (ANPD)', 'Consertar impressoras quebradas', 'Cobrar pacientes inadimplentes'],
        correctIndex: 1,
        explanation: 'O DPO é a autoridade designada pela LGPD para garantir as políticas de conformidade, treinamento e resposta a incidentes.'
      }
    ]
  }
];

import { app } from './config';
import { USE_MOCK } from './mockDb';

const TIPS_COLLECTION = 'tv_educational_tips';
const STORAGE_KEY = 'sistema_tv_educational_tips';

export const TIP_CATEGORIES = {
  hemodialise: {
    id: 'hemodialise',
    label: 'Hemodiálise',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    borderColor: '#38bdf8',
    iconName: 'Activity'
  },
  nutricao: {
    id: 'nutricao',
    label: 'Nutrição',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    borderColor: '#34d399',
    iconName: 'Apple'
  },
  liquidos: {
    id: 'liquidos',
    label: 'Líquidos',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    borderColor: '#7dd3fc',
    iconName: 'Droplets'
  },
  mental: {
    id: 'mental',
    label: 'Saúde Mental',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    borderColor: '#c084fc',
    iconName: 'Smile'
  },
  social: {
    id: 'social',
    label: 'Serviço Social',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    borderColor: '#f472b6',
    iconName: 'Users'
  },
  mitos: {
    id: 'mitos',
    label: 'Mitos & Verdades',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    borderColor: '#fbbf24',
    iconName: 'HelpCircle'
  },
  cuidados: {
    id: 'cuidados',
    label: 'Cuidados & Acesso',
    color: '#059669',
    gradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    borderColor: '#6ee7b7',
    iconName: 'ShieldCheck'
  }
};

// 70 Dicas Clínicas Reais (10 para cada categoria)
export const DEFAULT_TIPS = [
  // 1. Nutrição (10 dicas)
  {
    id: 'nutri_1',
    category: 'nutricao',
    title: 'Potássio sob Controle',
    text: 'Frutas como banana, mamão, laranja e melão contêm muito potássio. Dê preferência a maçã, pera e uva, sempre respeitando a sua cota prescrita pela nutricionista.',
    duration: 14,
    active: true
  },
  {
    id: 'nutri_2',
    category: 'nutricao',
    title: 'Ferva os Vegetais em Duas Águas',
    text: 'Cozinhe batata, cenoura e outros legumes em bastante água, despreze a primeira água após levantar fervura e finalize em água nova para reduzir o teor de potássio.',
    duration: 14,
    active: true
  },
  {
    id: 'nutri_3',
    category: 'nutricao',
    title: 'Cuidado com o Fósforo Oculto',
    text: 'Alimentos ultraprocessados, refrigerantes escuros e embutidos contêm fósforo químico industrial, que o corpo absorve quase 100%, sobrecarregando seus ossos.',
    duration: 14,
    active: true
  },
  {
    id: 'nutri_4',
    category: 'nutricao',
    title: 'Quelante de Fósforo na Hora Certa',
    text: 'Tome seus comprimidos quelantes de fósforo exatamente junto às refeições. Eles precisam se misturar ao bolo alimentar para impedir que o fósforo seja absorvido.',
    duration: 14,
    active: true
  },
  {
    id: 'nutri_5',
    category: 'nutricao',
    title: 'Atenção ao Sal Diet ou Light',
    text: 'O sal light ou diet substitui o sódio por cloreto de potássio! Ele é altamente perigoso para pacientes em diálise e pode provocar arritmias cardíacas graves.',
    duration: 14,
    active: true
  },
  {
    id: 'nutri_6',
    category: 'nutricao',
    title: 'Proteínas de Alto Valor Biológico',
    text: 'Quem faz hemodiálise precisa de boa quantidade de proteínas (carnes magras, ovos e frango) para evitar fraqueza muscular e manter a imunidade forte.',
    duration: 14,
    active: true
  },
  {
    id: 'nutri_7',
    category: 'nutricao',
    title: 'Laticínios com Moderação',
    text: 'Leite, queijos amarelos e iogurtes são muito ricos em fósforo. Prefira porções controladas e siga rigorosamente o plano elaborado pela equipe de nutrição.',
    duration: 14,
    active: true
  },
  {
    id: 'nutri_8',
    category: 'nutricao',
    title: 'Carambola: Proibida na Doença Renal',
    text: 'A carambola possui uma neurotoxina natural chamada caramboxina, que os rins não conseguem eliminar. Ela é terminantemente proibida para quem faz diálise.',
    duration: 14,
    active: true
  },
  {
    id: 'nutri_9',
    category: 'nutricao',
    title: 'Temperos Naturais para Dar Sabor',
    text: 'Realce o sabor das refeições usando alho, cebola, alecrim, orégano, cheiro-verde e limão. Evite caldos em cubo e temperos prontos cheios de sódio.',
    duration: 14,
    active: true
  },
  {
    id: 'nutri_10',
    category: 'nutricao',
    title: 'Acompanhe seu Ganho de Massa',
    text: 'Comer bem é sinônimo de viver com mais energia. Converse com a nutricionista da clínica para adequar seus lanches favoritos à sua rotina dialítica.',
    duration: 14,
    active: true
  },

  // 2. Hemodiálise (10 dicas)
  {
    id: 'hemo_1',
    category: 'hemodialise',
    title: 'Presença e Pontualidade Salvam Vidas',
    text: 'Nunca falte ou diminua o tempo da sua sessão de hemodiálise. Cada minuto conectado à máquina é fundamental para depurar toxinas e proteger o seu coração.',
    duration: 14,
    active: true
  },
  {
    id: 'hemo_2',
    category: 'hemodialise',
    title: 'Avise Qualquer Sintoma na Máquina',
    text: 'Se sentir tontura, cólicas, sensação de frio ou náuseas durante a sessão, avise a equipe imediatamente para ajustarem a ultrafiltração com segurança.',
    duration: 14,
    active: true
  },
  {
    id: 'hemo_3',
    category: 'hemodialise',
    title: 'Acompanhe seus Exames Mensais',
    text: 'Todos os meses seu sangue é analisado para verificar ureia, creatinina, potássio, hemoglobina e cálcio. Entender seus resultados ajuda a guiar o tratamento.',
    duration: 14,
    active: true
  },
  {
    id: 'hemo_4',
    category: 'hemodialise',
    title: 'Proteja seus Ossos e Artérias',
    text: 'O controle do paratormônio (PTH) evita a perda de massa óssea e impede o endurecimento dos vasos sanguíneos. Siga o uso correto dos seus medicamentos.',
    duration: 14,
    active: true
  },
  {
    id: 'hemo_5',
    category: 'hemodialise',
    title: 'Combate à Anemia Renal',
    text: 'A aplicação regular de eritropoietina (EPO) e ferro na diálise mantém seus glóbulos vermelhos nos níveis ideais, prevenindo o cansaço e a falta de ar.',
    duration: 14,
    active: true
  },
  {
    id: 'hemo_6',
    category: 'hemodialise',
    title: 'Pressão Arterial Equilibrada',
    text: 'Aferir a pressão antes, durante e após a diálise é rotina indispensável. Uma pressão bem controlada preserva o cérebro, a visão e a circulação.',
    duration: 14,
    active: true
  },
  {
    id: 'hemo_7',
    category: 'hemodialise',
    title: 'Repouso após o Tratamento',
    text: 'Após a diálise, seu corpo passou por um trabalho intenso. Descanse, faça um lanche leve e evite carregar peso ou fazer exercícios vigorosos nas horas seguintes.',
    duration: 14,
    active: true
  },
  {
    id: 'hemo_8',
    category: 'hemodialise',
    title: 'Vacinação em Dia é Proteção',
    text: 'Pacientes em diálise devem manter atualizadas as vacinas contra Hepatite B, Gripe, Pneumococo e COVID-19 para fortalecer o sistema imunológico.',
    duration: 14,
    active: true
  },
  {
    id: 'hemo_9',
    category: 'hemodialise',
    title: 'Remédios no Horário Certo',
    text: 'Alguns remédios de pressão podem precisar de ajuste nos dias de diálise. Sempre consulte o nefrologista antes de mudar o horário das suas doses.',
    duration: 14,
    active: true
  },
  {
    id: 'hemo_10',
    category: 'hemodialise',
    title: 'Equipe Multiprofissional ao seu Lado',
    text: 'Médicos, enfermeiros, técnicos, psicólogos, assistentes sociais e nutricionistas formam um time dedicado a cuidar de você em cada etapa da jornada.',
    duration: 14,
    active: true
  },

  // 3. Líquidos / Hidratação (10 dicas)
  {
    id: 'liq_1',
    category: 'liquidos',
    title: 'Entenda seu Peso Seco',
    text: 'Peso seco é o peso em que seu corpo está sem excesso de água acumulada e sem desidratação. Ele é a referência exata para calcular sua perda na máquina.',
    duration: 14,
    active: true
  },
  {
    id: 'liq_2',
    category: 'liquidos',
    title: 'Ganho de Peso Interdialítico (GPID)',
    text: 'Procure não ganhar mais de 3% a 5% do seu peso seco entre as sessões (em média entre 1,5 kg e 2,5 kg) para proteger seu coração de esforço excessivo.',
    duration: 14,
    active: true
  },
  {
    id: 'liq_3',
    category: 'liquidos',
    title: 'O Perigo do Excesso de Água',
    text: 'O líquido que o corpo não consegue urinar vai para o sangue e pulmões, podendo provocar falta de ar súbita e elevação perigosa da pressão arterial.',
    duration: 14,
    active: true
  },
  {
    id: 'liq_4',
    category: 'liquidos',
    title: 'Tudo o que é Líquido Conta',
    text: 'Sopas, cafés, sucos, gelatinas, refrigerantes, caldos e frutas suculentas (como melancia) somam no volume total de água que entra no organismo.',
    duration: 14,
    active: true
  },
  {
    id: 'liq_5',
    category: 'liquidos',
    title: 'Truque da Pedrinha de Gelo',
    text: 'Quando sentir a boca seca, chupe uma pequena pedra de gelo ou use rodelas de limão bem geladas. Isso mata a sede consumindo pouquíssimo volume de água.',
    duration: 14,
    active: true
  },
  {
    id: 'liq_6',
    category: 'liquidos',
    title: 'A Garrafinha de Controle Diário',
    text: 'Coloque em uma garrafa graduada a cota de líquido liberada pela nutricionista para o seu dia. Assim você vê claramente o quanto ainda pode beber.',
    duration: 14,
    active: true
  },
  {
    id: 'liq_7',
    category: 'liquidos',
    title: 'Menos Sal, Muito Menos Sede',
    text: 'A sede intensa não surge por acaso: alimentos com muito sódio ativam o reflexo de sede no cérebro. Cortar o sal é a melhor forma de controlar a água.',
    duration: 14,
    active: true
  },
  {
    id: 'liq_8',
    category: 'liquidos',
    title: 'Higiene Bucal Refrescante',
    text: 'Escovar os dentes ou enxaguar a boca com água fria sem engolir ajuda a manter a boca fresca e diminui a sensação incômoda de garganta ressecada.',
    duration: 14,
    active: true
  },
  {
    id: 'liq_9',
    category: 'liquidos',
    title: 'Sessões Sem Cãibras',
    text: 'Chegar à clínica com pouco ganho de peso permite que a máquina retire o líquido lentamente, prevenindo quedas bruscas de pressão e cãibras musculares.',
    duration: 14,
    active: true
  },
  {
    id: 'liq_10',
    category: 'liquidos',
    title: 'Acompanhe na Balança de Casa',
    text: 'Se tiver balança em casa, pese-se sempre no mesmo horário, preferencialmente ao acordar, para saber exatamente quantos quilos acumulou até a próxima sessão.',
    duration: 14,
    active: true
  },

  // 4. Saúde Mental (10 dicas)
  {
    id: 'ment_1',
    category: 'mental',
    title: 'Seus Sentimentos São Válidos',
    text: 'Sentir cansaço, tristeza ou ansiedade em alguns dias é perfeitamente compreensível. Conversar com a psicologia da clínica traz acolhimento e clareza.',
    duration: 14,
    active: true
  },
  {
    id: 'ment_2',
    category: 'mental',
    title: 'Construa uma Rotina Agradável',
    text: 'Ter horários regulares para dormir, se alimentar e realizar pequenas atividades prazerosas melhora a disposição física e traz serenidade emocional.',
    duration: 14,
    active: true
  },
  {
    id: 'ment_3',
    category: 'mental',
    title: 'O Poder da Conversa com a Família',
    text: 'Compartilhe suas dúvidas e sentimentos com familiares de confiança. O suporte de quem te ama fortalece a sua caminhada no tratamento renal.',
    duration: 14,
    active: true
  },
  {
    id: 'ment_4',
    category: 'mental',
    title: 'Troca de Experiências com Colegas',
    text: 'Conversar com outros pacientes que já passaram pelos mesmos desafios ajuda a perceber que você nunca está sozinho e que é possível viver muito bem.',
    duration: 14,
    active: true
  },
  {
    id: 'ment_5',
    category: 'mental',
    title: 'Transforme o Tempo da Diálise',
    text: 'Aproveite as horas na máquina para ler um bom livro, ouvir músicas relaxantes, ver podcasts, rezar ou aprender algo novo no celular.',
    duration: 14,
    active: true
  },
  {
    id: 'ment_6',
    category: 'mental',
    title: 'Evite o Isolamento Social',
    text: 'Manter contato com amigos, vizinhos e pessoas queridas afasta pensamentos negativos e preserva sua vitalidade psicológica.',
    duration: 14,
    active: true
  },
  {
    id: 'ment_7',
    category: 'mental',
    title: 'Comemore Cada Conquista',
    text: 'Um exame mensal com metas atingidas, uma sessão tranquila ou um dia com boa energia são vitórias reais que merecem ser celebradas com orgulho.',
    duration: 14,
    active: true
  },
  {
    id: 'ment_8',
    category: 'mental',
    title: 'O Tratamento é Parte da sua Vida',
    text: 'A hemodiálise não define quem você é: ela é o tratamento que permite que você continue desfrutando da companhia de quem ama e vivendo seus projetos.',
    duration: 14,
    active: true
  },
  {
    id: 'ment_9',
    category: 'mental',
    title: 'Respire Fundo nos Momentos Tensos',
    text: 'Diante de ansiedade ou preocupação, respire profundamente pelo nariz contando até quatro e solte o ar devagar pela boca para acalmar os batimentos.',
    duration: 14,
    active: true
  },
  {
    id: 'ment_10',
    category: 'mental',
    title: 'Cuidando de Quem Cuida',
    text: 'Os cuidadores e familiares também precisam de descanso e carinho. Incentive quem cuida de você a reservar tempo para recarregar as próprias energias.',
    duration: 14,
    active: true
  },

  // 5. Serviço Social (10 dicas)
  {
    id: 'soc_1',
    category: 'social',
    title: 'Tratamento Fora do Domicílio (TFD)',
    text: 'Pacientes que necessitam se deslocar para outro município para realizar a hemodiálise têm direito a transporte fornecido pelo SUS ou ajuda de custo.',
    duration: 14,
    active: true
  },
  {
    id: 'soc_2',
    category: 'social',
    title: 'Passe Livre e Transporte Coletivo',
    text: 'A maioria dos municípios e estados garante gratuidade no transporte público para pacientes renais em tratamento contínuo e para o seu acompanhante.',
    duration: 14,
    active: true
  },
  {
    id: 'soc_3',
    category: 'social',
    title: 'Benefício de Prestação Continuada (BPC)',
    text: 'Pacientes em situação de vulnerabilidade que não conseguem trabalhar podem ter direito a 1 salário mínimo mensal pago pelo INSS através do BPC/LOAS.',
    duration: 14,
    active: true
  },
  {
    id: 'soc_4',
    category: 'social',
    title: 'Auxílio por Incapacidade e Aposentadoria',
    text: 'Quem é segurado da Previdência Social tem direito a solicitar auxílio por incapacidade temporária ou aposentadoria por incapacidade permanente.',
    duration: 14,
    active: true
  },
  {
    id: 'soc_5',
    category: 'social',
    title: 'Saque Integral do FGTS e PIS/PASEP',
    text: 'A legislação brasileira autoriza o saque total dos saldos de contas do FGTS e PIS/PASEP para o trabalhador acometido por doença renal crônica grave.',
    duration: 14,
    active: true
  },
  {
    id: 'soc_6',
    category: 'social',
    title: 'Isenção de Imposto de Renda',
    text: 'Aposentados e pensionistas com diagnóstico de nefropatia grave têm direito à isenção do Imposto de Renda sobre os proventos de aposentadoria ou pensão.',
    duration: 14,
    active: true
  },
  {
    id: 'soc_7',
    category: 'social',
    title: 'Prioridade Legal em Filas e Atendimentos',
    text: 'A lei garante atendimento prioritário a pacientes renais em filas de bancos, órgãos públicos, farmácias e estabelecimentos de saúde.',
    duration: 14,
    active: true
  },
  {
    id: 'soc_8',
    category: 'social',
    title: 'Medicamentos de Alto Custo pelo SUS',
    text: 'Remédios especiais como eritropoietina, quelantes e ferro venoso são dispensados gratuitamente pelas farmácias estaduais mediante processo administrativo.',
    duration: 14,
    active: true
  },
  {
    id: 'soc_9',
    category: 'social',
    title: 'Mantenha seu CadÚnico Atualizado',
    text: 'A atualização do Cadastro Único no CRAS é a porta de entrada para tarifas sociais de energia, água e benefícios assistenciais do governo.',
    duration: 14,
    active: true
  },
  {
    id: 'soc_10',
    category: 'social',
    title: 'Procure o Serviço Social da Clínica',
    text: 'Nossa equipe de Serviço Social orienta você sobre laudos, requerimentos do INSS, isenções e direitos civis. Agende um momento para tirar dúvidas!',
    duration: 14,
    active: true
  },

  // 6. Mitos & Verdades (10 dicas)
  {
    id: 'mit_1',
    category: 'mitos',
    title: 'Mito: "Quem faz hemodiálise não urina mais nada."',
    text: 'Verdade: Muitos pacientes preservam volume residual de urina por meses ou anos. Cuidar dessa função residual ajuda muito no controle de líquidos!',
    duration: 14,
    active: true
  },
  {
    id: 'mit_2',
    category: 'mitos',
    title: 'Mito: "A fístula vai arrebentar se eu me movimentar."',
    text: 'Verdade: A fístula é resistente e forte. Exercícios leves, como apertar uma bolinha de borracha, são inclusive recomendados para amadurecer a veia.',
    duration: 14,
    active: true
  },
  {
    id: 'mit_3',
    category: 'mitos',
    title: 'Mito: "Paciente em diálise não pode mais viajar."',
    text: 'Verdade: Você pode viajar sim! É possível agendar sessões de diálise em trânsito em clínicas de outras cidades com antecedência junto ao serviço social.',
    duration: 14,
    active: true
  },
  {
    id: 'mit_4',
    category: 'mitos',
    title: 'Mito: "Quanto mais água eu beber, melhor para limpar o sangue."',
    text: 'Verdade: Mito perigoso! Sem urinar normalmente, a água fica retida no corpo e sobrecarrega o coração. O controle hídrico rigoroso é essencial.',
    duration: 14,
    active: true
  },
  {
    id: 'mit_5',
    category: 'mitos',
    title: 'Mito: "A comida de quem tem rim doente não tem sabor."',
    text: 'Verdade: Com temperos naturais frescos (alho, cebola, cheiro-verde, azeite e limão), suas refeições continuam muito saborosas e seguras para a saúde.',
    duration: 14,
    active: true
  },
  {
    id: 'mit_6',
    category: 'mitos',
    title: 'Mito: "A hemodiálise impede de fazer o transplante."',
    text: 'Verdade: A diálise é a ponte que mantém seu organismo forte e desintoxicado enquanto você aguarda a realização segura do transplante de rim.',
    duration: 14,
    active: true
  },
  {
    id: 'mit_7',
    category: 'mitos',
    title: 'Mito: "Exercício físico é totalmente proibido."',
    text: 'Verdade: Caminhadas leves, alongamentos e atividades físicas liberadas pelo cardiologista e nefrologista melhoram o condicionamento e o humor.',
    duration: 14,
    active: true
  },
  {
    id: 'mit_8',
    category: 'mitos',
    title: 'Mito: "Pode molhar o cateter no chuveiro se secar rápido."',
    text: 'Verdade: O curativo do cateter jamais deve ser molhado. Água carrega bactérias que podem atingir o coração. Proteja sempre com plástico filme.',
    duration: 14,
    active: true
  },
  {
    id: 'mit_9',
    category: 'mitos',
    title: 'Mito: "O paciente nunca mais poderá trabalhar ou produzir."',
    text: 'Verdade: Milhares de pacientes renais adaptam seus horários e turnos na clínica, mantendo carreiras, estudos e projetos de vida ativos.',
    duration: 14,
    active: true
  },
  {
    id: 'mit_10',
    category: 'mitos',
    title: 'Mito: "Sal light é seguro para quem tem problema no rim."',
    text: 'Verdade: Falso! O sal light é riquíssimo em potássio e pode causar parada cardíaca em pacientes renais. Use somente ervas e temperos naturais.',
    duration: 14,
    active: true
  },

  // 7. Cuidados & Acesso (10 dicas)
  {
    id: 'cuid_1',
    category: 'cuidados',
    title: 'Sinta o Frêmito da Fístula Todos os Dias',
    text: 'Coloque as pontas dos dedos suavemente sobre sua fístula para sentir o frêmito (vibração contínua). Se a vibração parar ou sumir, avise a clínica na hora!',
    duration: 14,
    active: true
  },
  {
    id: 'cuid_2',
    category: 'cuidados',
    title: 'Nunca Meça Pressão no Braço da Fístula',
    text: 'Não permita aferir a pressão arterial, colher exames de sangue ou aplicar injeções no membro onde fica a sua fístula arteriovenosa.',
    duration: 14,
    active: true
  },
  {
    id: 'cuid_3',
    category: 'cuidados',
    title: 'Evite Roupas e Acessórios Apertados',
    text: 'Não use relógios, pulseiras apertadas ou mangas coladas no braço da fístula. Evite também apoiar bolsas pesadas para não prender o fluxo de sangue.',
    duration: 14,
    active: true
  },
  {
    id: 'cuid_4',
    category: 'cuidados',
    title: 'Não Durma em Cima do Braço da FAV',
    text: 'Ao se deitar, posicione o corpo de modo que o braço da fístula fique livre e relaxado, sem compressão do peso do seu corpo ou travesseiro.',
    duration: 14,
    active: true
  },
  {
    id: 'cuid_5',
    category: 'cuidados',
    title: 'Curativo do Cateter é Sagrado',
    text: 'O cateter atinge veias profundas do coração. Mantenha o curativo limpo e seco, e nunca mexa nas pontas ou no curativo em casa por conta própria.',
    duration: 14,
    active: true
  },
  {
    id: 'cuid_6',
    category: 'cuidados',
    title: 'Se o Cateter Molhar, Venha à Clínica',
    text: 'Caso o curativo do cateter molhe no banho ou comece a se soltar, venha imediatamente à clínica para que a enfermagem realize a troca asséptica.',
    duration: 14,
    active: true
  },
  {
    id: 'cuid_7',
    category: 'cuidados',
    title: 'Sangramento no Trajeto da Fístula',
    text: 'Se a fístula sangrar em casa após retirar as gazes, aperte suavemente o local com pano ou gaze limpa por 15 minutos sem soltar. Se persistir, vá ao pronto-socorro.',
    duration: 14,
    active: true
  },
  {
    id: 'cuid_8',
    category: 'cuidados',
    title: 'Lave o Braço Antes de Cada Sessão',
    text: 'Lavar o braço da fístula com água e sabonete neutro antes de entrar na sala de hemodiálise reduz drasticamente o risco de bactérias na punção.',
    duration: 14,
    active: true
  },
  {
    id: 'cuid_9',
    category: 'cuidados',
    title: 'Não Coce as Marcas de Punção',
    text: 'Coçar a pele perto da fístula pode gerar feridas e infecções. Se houver coceira ou hematomas, peça orientação à enfermagem sobre compressas ou pomadas.',
    duration: 14,
    active: true
  },
  {
    id: 'cuid_10',
    category: 'cuidados',
    title: 'Febre ou Calafrios São Sinal de Alerta',
    text: 'Calafrios durante ou após a diálise, vermelhidão ou febre indicam possível infecção no acesso. Procure a equipe de saúde imediatamente!',
    duration: 14,
    active: true
  }
];

const getStoredTips = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TIPS));
      return DEFAULT_TIPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TIPS;
  } catch (e) {
    console.error('Erro ao carregar dicas locais:', e);
    return DEFAULT_TIPS;
  }
};

const saveStoredTips = (tips) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tips));
    window.dispatchEvent(new CustomEvent('tv-tips-updated', { detail: tips }));
  } catch (e) {
    console.error('Erro ao salvar dicas locais:', e);
  }
};

export const getTvTips = async () => {
  if (USE_MOCK) {
    return getStoredTips();
  }

  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, TIPS_COLLECTION));

    if (snap.empty) {
      // Seed default tips to Firestore
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      DEFAULT_TIPS.forEach(tip => {
        batch.set(doc(db, TIPS_COLLECTION, tip.id), tip);
      });
      await batch.commit();
      saveStoredTips(DEFAULT_TIPS);
      return DEFAULT_TIPS;
    }

    const remoteTips = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    saveStoredTips(remoteTips);
    return remoteTips;
  } catch (err) {
    console.error('Erro ao carregar dicas do Firestore, usando locais:', err);
    return getStoredTips();
  }
};

export const createTvTip = async (tipData) => {
  const newTip = {
    id: 'tip_' + Math.random().toString(36).substring(2, 9),
    category: tipData.category || 'nutricao',
    title: (tipData.title || '').trim(),
    text: (tipData.text || '').trim(),
    duration: Number(tipData.duration) || 14,
    active: tipData.active !== false,
    createdAt: new Date().toISOString()
  };

  if (USE_MOCK) {
    const current = getStoredTips();
    const updated = [newTip, ...current];
    saveStoredTips(updated);
    return newTip;
  }

  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await setDoc(doc(db, TIPS_COLLECTION, newTip.id), newTip);
    const current = getStoredTips();
    saveStoredTips([newTip, ...current]);
    return newTip;
  } catch (err) {
    console.error('Erro ao criar dica no Firestore:', err);
    const current = getStoredTips();
    saveStoredTips([newTip, ...current]);
    return newTip;
  }
};

export const updateTvTip = async (id, tipData) => {
  if (USE_MOCK) {
    const current = getStoredTips();
    const updated = current.map(t => t.id === id ? { ...t, ...tipData, updatedAt: new Date().toISOString() } : t);
    saveStoredTips(updated);
    return { id, ...tipData };
  }

  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, TIPS_COLLECTION, id), {
      ...tipData,
      updatedAt: new Date().toISOString()
    });
    const current = getStoredTips();
    const updated = current.map(t => t.id === id ? { ...t, ...tipData } : t);
    saveStoredTips(updated);
    return { id, ...tipData };
  } catch (err) {
    console.error('Erro ao atualizar dica no Firestore:', err);
    const current = getStoredTips();
    const updated = current.map(t => t.id === id ? { ...t, ...tipData } : t);
    saveStoredTips(updated);
    return { id, ...tipData };
  }
};

export const deleteTvTip = async (id) => {
  if (USE_MOCK) {
    const current = getStoredTips();
    const updated = current.filter(t => t.id !== id);
    saveStoredTips(updated);
    return true;
  }

  try {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, TIPS_COLLECTION, id));
    const current = getStoredTips();
    const updated = current.filter(t => t.id !== id);
    saveStoredTips(updated);
    return true;
  } catch (err) {
    console.error('Erro ao excluir dica no Firestore:', err);
    const current = getStoredTips();
    const updated = current.filter(t => t.id !== id);
    saveStoredTips(updated);
    return true;
  }
};

export const resetTvTipsToDefaults = async () => {
  saveStoredTips(DEFAULT_TIPS);
  if (!USE_MOCK) {
    try {
      const { getFirestore, collection, writeBatch, doc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const batch = writeBatch(db);
      DEFAULT_TIPS.forEach(tip => {
        batch.set(doc(db, TIPS_COLLECTION, tip.id), tip);
      });
      await batch.commit();
    } catch (e) {
      console.error('Erro ao resetar dicas no Firestore:', e);
    }
  }
  return DEFAULT_TIPS;
};

export const subscribeToTvTips = (callback) => {
  const handleUpdate = () => {
    callback(getStoredTips());
  };

  // Carregamento inicial
  getTvTips().then(callback);

  window.addEventListener('tv-tips-updated', handleUpdate);
  window.addEventListener('storage', handleUpdate);

  let remoteUnsub = () => {};

  if (!USE_MOCK) {
    import('firebase/firestore').then(({ getFirestore, collection, onSnapshot }) => {
      const db = getFirestore(app);
      remoteUnsub = onSnapshot(collection(db, TIPS_COLLECTION), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          saveStoredTips(items);
          callback(items);
        }
      }, (err) => {
        console.error('Erro no listener de dicas da TV:', err);
      });
    }).catch(() => {});
  }

  return () => {
    window.removeEventListener('tv-tips-updated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
    try {
      remoteUnsub();
    } catch (e) {}
  };
};

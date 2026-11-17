#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador da Apresentação Oficial em PowerPoint (.pptx)
Treinamento: Excelência no Atendimento a Clientes Internos e Externos em Nefrologia
Nex-Ai CLINIC — Módulo de Recursos Humanos & Educação Continuada
"""

import os
import sys
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

# Dimensões Widescreen 16:9
SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)

# Paleta de Cores Institucional Nex-Ai CLINIC (Nefrologia & Saúde)
NAVY_BG = RGBColor(15, 23, 42)        # #0F172A - Fundo Escuro (Capa e Encerramento)
NAVY_CARD = RGBColor(30, 41, 59)      # #1E293B - Cards no tema escuro
LIGHT_BG = RGBColor(248, 250, 252)    # #F8FAFC - Fundo Claro (Slides de conteúdo)
CARD_BG = RGBColor(255, 255, 255)     # #FFFFFF - Fundo dos cards brancos
BORDER_COLOR = RGBColor(226, 232, 240)# #E2E8F0 - Borda sutil dos cards
TEAL_PRIMARY = RGBColor(8, 145, 178)  # #0891B2 - Azul Petróleo / Ciano Clínico
BLUE_ACCENT = RGBColor(2, 132, 199)   # #0284C7 - Azul Oceano
EMERALD_GREEN = RGBColor(16, 185, 129)# #10B981 - Verde Esperança / Sucesso
AMBER_WARN = RGBColor(217, 119, 6)    # #D97706 - Âmbar Atenção
ROSE_ACCENT = RGBColor(225, 29, 72)   # #E11D48 - Vermelho Crítico / Alerta
TEXT_DARK = RGBColor(15, 23, 42)      # #0F172A - Texto Principal Escuro
TEXT_MUTED = RGBColor(100, 116, 139)  # #64748B - Texto Secundário / Apoio
TEXT_LIGHT = RGBColor(241, 245, 249)  # #F1F5F9 - Texto Claro sobre fundo escuro
WHITE = RGBColor(255, 255, 255)

LOGO_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'logo.png'))

def set_slide_background(slide, color):
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), SLIDE_WIDTH, SLIDE_HEIGHT)
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = color
    bg_shape.line.fill.background()
    return bg_shape

def add_header(slide, breadcrumb, title, subtitle=None):
    # Breadcrumb Tag
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = breadcrumb.upper()
    p.font.name = 'Arial'
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = TEAL_PRIMARY

    # Title
    p2 = tf.add_paragraph()
    p2.text = title
    p2.font.name = 'Arial'
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_DARK
    p2.space_before = Pt(4)

    # Subtitle
    if subtitle:
        p3 = tf.add_paragraph()
        p3.text = subtitle
        p3.font.name = 'Arial'
        p3.font.size = Pt(11)
        p3.font.color.rgb = TEXT_MUTED
        p3.space_before = Pt(2)

def add_card(slide, left, top, width, height, title, items, badge_text=None, border_color=BORDER_COLOR, bg_color=CARD_BG, title_color=TEXT_DARK):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1.5)

    # Text inside card
    tb = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), width - Inches(0.5), height - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    # Badge if any
    p_badge = tf.paragraphs[0]
    if badge_text:
        p_badge.text = badge_text.upper()
        p_badge.font.name = 'Arial'
        p_badge.font.size = Pt(9)
        p_badge.font.bold = True
        p_badge.font.color.rgb = TEAL_PRIMARY
        p_badge.space_after = Pt(4)
        p_title = tf.add_paragraph()
    else:
        p_title = p_badge

    # Card Title
    p_title.text = title
    p_title.font.name = 'Arial'
    p_title.font.size = Pt(14)
    p_title.font.bold = True
    p_title.font.color.rgb = title_color
    p_title.space_after = Pt(8)

    # Items / Bullet points
    for idx, item in enumerate(items):
        p_item = tf.add_paragraph()
        p_item.font.name = 'Arial'
        p_item.font.size = Pt(10.5)
        p_item.font.color.rgb = TEXT_DARK
        p_item.space_before = Pt(4)
        p_item.level = 0
        if isinstance(item, tuple):
            strong_text, desc_text = item
            run1 = p_item.add_run()
            run1.text = "• " + strong_text + ": "
            run1.font.bold = True
            run2 = p_item.add_run()
            run2.text = desc_text
            run2.font.bold = False
        else:
            p_item.text = "• " + item

def add_notes(slide, notes_text):
    notes_slide = slide.notes_slide
    text_frame = notes_slide.notes_text_frame
    text_frame.text = notes_text

def build_presentation():
    prs = pptx.Presentation()
    prs.slide_width = SLIDE_WIDTH
    prs.slide_height = SLIDE_HEIGHT
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 1: CAPA OFICIAL (Dark Theme)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, NAVY_BG)

    # Logo
    if os.path.exists(LOGO_PATH):
        s1.shapes.add_picture(LOGO_PATH, Inches(0.8), Inches(0.8), width=Inches(1.5), height=Inches(1.5))

    # Title & Badge Frame
    tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(2.6), Inches(11.7), Inches(3.8))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p_badge = tf1.paragraphs[0]
    p_badge.text = "PROGRAMA DE EDUCAÇÃO CONTINUADA EM SAÚDE • RDC 11/2014 & NR-32"
    p_badge.font.name = 'Arial'
    p_badge.font.size = Pt(11)
    p_badge.font.bold = True
    p_badge.font.color.rgb = TEAL_PRIMARY

    p_main = tf1.add_paragraph()
    p_main.text = "Excelência no Atendimento a\nClientes Internos e Externos em Nefrologia"
    p_main.font.name = 'Arial'
    p_main.font.size = Pt(32)
    p_main.font.bold = True
    p_main.font.color.rgb = WHITE
    p_main.space_before = Pt(8)

    p_sub = tf1.add_paragraph()
    p_sub.text = "Diretrizes de Humanização, Empatia Terapêutica ao Paciente Renal e a Corrente Vital de Cooperação Intersetorial na Hemodiálise"
    p_sub.font.name = 'Arial'
    p_sub.font.size = Pt(14)
    p_sub.font.color.rgb = RGBColor(148, 163, 184)
    p_sub.space_before = Pt(12)

    # Meta Tags Box
    tb_meta = s1.shapes.add_textbox(Inches(0.8), Inches(6.4), Inches(11.7), Inches(0.6))
    tf_meta = tb_meta.text_frame
    p_meta = tf_meta.paragraphs[0]
    p_meta.text = "Carga Horária: 4 Horas  |  Público-Alvo: Geral (100% dos Colaboradores)  |  Nex-Ai CLINIC • Cuidando da Vida"
    p_meta.font.name = 'Arial'
    p_meta.font.size = Pt(11)
    p_meta.font.color.rgb = RGBColor(203, 213, 225)

    add_notes(s1, 
        "ROTEIRO DE ABERTURA:\n"
        "Olá a todos os colaboradores da clínica! Sejam muito bem-vindos ao treinamento institucional 'Excelência no Atendimento a Clientes Internos e Externos em Nefrologia'.\n"
        "Este treinamento foi desenvolvido especialmente para a nossa realidade em hemodiálise e é direcionado para 100% da equipe: enfermagem, médicos, higienização, farmácia, manutenção, nutrição, psicologia, serviço social, recepção e administração.\n"
        "Ao longo deste vídeo, vamos entender como o acolhimento afetuoso transforma o desfecho clínico do doente renal e como o nosso trabalho intersetorial forma uma corrente vital onde ninguém trabalha sozinho."
    )

    # =========================================================================
    # SLIDE 2: OBJETIVOS & CONFORMIDADE SANITÁRIA
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, LIGHT_BG)
    add_header(s2, "Educação Continuada • Módulo Institucional", "1. Objetivos da Capacitação & Diretrizes Regulatórias", "Alinhamento com as normas da ANVISA RDC 11/2014, RDC 63/2011 e a Política Nacional de Humanização (PNH)")

    add_card(s2, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Cuidado Centrado no Paciente",
        [
            ("Acolhimento Integral", "Compreender as dimensões físicas, emocionais e sociais da insuficiência renal crônica."),
            ("Empatia Terapêutica", "Substituir a postura mecânica por uma escuta atenta, humanizada e resolutiva."),
            ("Impacto Clínico Real", "Comprovação científica de que pacientes acolhidos aderem mais à dieta e à diálise.")
        ],
        badge_text="Dimensão Externa",
        border_color=TEAL_PRIMARY
    )

    add_card(s2, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "A Corrente de Clientes Internos",
        [
            ("Conceito de Cliente Interno", "Todo colega ou setor que recebe o fruto do seu trabalho é seu cliente direto."),
            ("Interdependência Crítica", "Higienização, enfermagem, farmácia, tratamento de água e recepção em sincronia."),
            ("Cultura de Cooperação", "Eliminar o individualismo e focar na entrega perfeita para o próximo elo.")
        ],
        badge_text="Dimensão Interna",
        border_color=BLUE_ACCENT
    )

    add_card(s2, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Segurança & Conformidade",
        [
            ("RDC 11/2014 ANVISA", "Conformidade com os padrões de qualidade em serviços de diálise e capacitação anual."),
            ("Segurança do Paciente", "Cultura justa com notificação preventiva de falhas operacionais ao NSP."),
            ("LGPD e Ética Médica", "Proteção irrestrita da privacidade, prontuários e diagnósticos sorológicos.")
        ],
        badge_text="Regulatório",
        border_color=EMERALD_GREEN
    )

    add_notes(s2,
        "ROTEIRO DE NARRAÇÃO - SLIDE 2:\n"
        "Nossos objetivos nesta capacitação são claros e práticos. Primeiro, consolidar o paciente renal crônico e sua família no centro de todas as nossas atenções.\n"
        "Segundo, enxergar os nossos colegas de trabalho como clientes internos: quem recebe a sua informação, a sua poltrona higienizada ou o seu medicamento fracionado depende da sua excelência.\n"
        "E terceiro, cumprir rigorosamente as exigências sanitárias da ANVISA RDC 11/2014 e NR-32, garantindo que o atendimento de excelência seja um padrão institucional auditável e seguro."
    )

    # =========================================================================
    # SLIDE 3: O PACIENTE RENAL COMO CLIENTE EXTERNO
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, LIGHT_BG)
    add_header(s3, "Clientes Externos • O Paciente Renal", "2. A Realidade e Vulnerabilidade do Doente Renal Crônico", "Compreendendo a rotina extenuante e o peso psicossocial do tratamento hemodialítico")

    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
        "A Rotina Biológica e Física",
        [
            ("Dependência da Máquina", "3 sessões semanais ininterruptas de 4 horas para manter a própria vida."),
            ("Trauma Vascular Contínuo", "Punções repetidas com agulhas calibrosas (15G/16G/17G) ou risco infeccioso em cateteres."),
            ("Fadiga e Hipotensão", "Queda súbita de pressão durante a ultrafiltração e exaustão física prolongada após a diálise."),
            ("Restrição Hídrica Severa", "Controle milimétrico da ingestão de água, sede constante e acúmulo de líquido interdialítico.")
        ],
        badge_text="Impacto Físico",
        border_color=BLUE_ACCENT
    )

    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "O Impacto Psicossocial e Emocional",
        [
            ("Luto pela Perda da Saúde", "Sensação frequente de perda de controle sobre o próprio corpo, tempo e futuro."),
            ("Afastamento Profissional", "Incapacidade frequente de manter empregos formais, dependência de benefícios e perda de renda."),
            ("Medo da Complicação", "Ansiedade diária com o risco de perda da fístula, infecção e a espera pelo transplante."),
            ("Oscilações de Humor", "Irritabilidade ou tristeza profunda são sintomas legítimos da doença crônica e devem ser acolhidos.")
        ],
        badge_text="Impacto Psicológico",
        border_color=TEAL_PRIMARY
    )

    add_notes(s3,
        "ROTEIRO DE NARRAÇÃO - SLIDE 3:\n"
        "Para atender bem o paciente renal crônico, é fundamental calçar os sapatos dele.\n"
        "Esse paciente passa por uma rotina desgastante: 3 vezes por semana, faça chuva ou faça sol, ele precisa vir à clínica para filtrar o sangue durante 4 horas.\n"
        "Ele convive com a dor da punção da fístula, com a sede provocada pela restrição de líquidos, com cãibras e com uma fadiga intensa no pós-diálise.\n"
        "Muitas vezes ele perdeu o emprego e a autonomia. Por isso, quando ele chega irritado ou impaciente, nossa obrigação humana e técnica não é revidar, mas sim acolher com compaixão e serenidade."
    )

    # =========================================================================
    # SLIDE 4: FAMILIARES E CUIDADORES
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, LIGHT_BG)
    add_header(s4, "Clientes Externos • A Família", "3. Acolhimento a Familiares e Cuidadores Principais", "Apoio humanizado para prevenir o esgotamento físico e mental de quem acompanha o paciente")

    add_card(s4, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "O Burnout do Cuidador",
        [
            ("Sobrecarga Silenciosa", "O familiar assume dietas complexas, transporte, medicações e cuidados com o curativo da fístula."),
            ("Exaustão Emocional", "Sentimentos de impotência, culpa e cansaço extremo sem tempo para a própria saúde."),
            ("Sinal de Alerta", "Agressividade ou desespero na recepção quase sempre refletem sobrecarga e medo, não má índole.")
        ],
        badge_text="Diagnóstico",
        border_color=AMBER_WARN
    )

    add_card(s4, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Atitudes de Apoio no Posto",
        [
            ("Escuta Qualificada", "Ouvir as dificuldades da rotina doméstica com paciência e sem julgamentos precipitados."),
            ("Informações Claras", "Previsão correta de liberação após a hemostasia e cuidados seguros em casa."),
            ("Apoio Multiprofissional", "Encaminhar ativamente demandas sociais e psicológicas para a equipe multiprofissional.")
        ],
        badge_text="Boas Práticas",
        border_color=TEAL_PRIMARY
    )

    add_card(s4, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Orientações e Benefícios",
        [
            ("Transporte Sanitário", "Apoio contínuo nas escalas de van municipal e horários de embarque."),
            ("Guias e Laudos APAC", "Esclarecer com transparência os prazos de renovação e receitas de alto custo."),
            ("Parceria no Cuidado", "Tratar o familiar como um co-terapeuta fundamental na sobrevida do doente renal.")
        ],
        badge_text="Integração",
        border_color=EMERALD_GREEN
    )

    add_notes(s4,
        "ROTEIRO DE NARRAÇÃO - SLIDE 4:\n"
        "Nunca podemos esquecer que, junto com cada paciente renal, existe uma família e frequentemente um cuidador dedicado.\n"
        "Esses cuidadores sofrem do que a medicina chama de 'Burnout do Cuidador'. Eles preparam a comida especial sem sal, controlam os remédios, empurram a cadeira de rodas e esperam horas nas salas de espera.\n"
        "Quando esse familiar procura a recepção ou o posto de enfermagem angustiado, nossa postura deve ser de acolhimento total. O familiar não é um incômodo: ele é o nosso maior parceiro no tratamento."
    )

    # =========================================================================
    # SLIDE 5: PILARES DO ATENDIMENTO HUMANIZADO
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, LIGHT_BG)
    add_header(s5, "Atendimento Externo • Humanização", "4. Os 4 Pilares da Experiência Humanizada no Salão", "Ações práticas que elevam a dignidade do paciente desde a portaria até a poltrona")

    add_card(s5, Inches(0.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "1. Recepção Calorosa",
        [
            ("Chamar pelo Nome", "Nunca chamar pelo número do leito ou da máquina."),
            ("Apoio na Locomoção", "Auxílio proativo com andadores e cadeiras de rodas."),
            ("Ambiente Acolhedor", "Climatização agradável e água filtrada para acompanhantes.")
        ],
        badge_text="A Chegada",
        border_color=TEAL_PRIMARY
    )

    add_card(s5, Inches(3.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "2. Empatia Terapêutica",
        [
            ("Validação da Dor", "Reconhecer que a punção da fístula dói e tranquilizar."),
            ("Presença Atenta", "Não ficar olhando o relógio ou demonstrar pressa excessiva."),
            ("Contato Visual", "Olhar nos olhos do paciente ao conversar.")
        ],
        badge_text="No Salão",
        border_color=BLUE_ACCENT
    )

    add_card(s5, Inches(6.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "3. Conforto Físico",
        [
            ("Combate ao Frio", "Oferecer mantas limpas; o salão com ar condicionado exige cuidado."),
            ("Ajuste da Poltrona", "Garantir inclinação adequada e conforto lombar."),
            ("Hemostasia Segura", "Compressão com tempo correto, preservando a fístula.")
        ],
        badge_text="Intradialítico",
        border_color=EMERALD_GREEN
    )

    add_card(s5, Inches(9.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "4. Respeito e Voz",
        [
            ("Nome Social", "Respeito irrestrito à identidade de gênero do paciente."),
            ("Atenção ao Idoso", "Falar no volume adequado sem infantilizar o paciente."),
            ("Canal de Ouvidoria", "Incentivar sugestões para melhoria contínua da clínica.")
        ],
        badge_text="Dignidade",
        border_color=NAVY_CARD
    )

    add_notes(s5,
        "ROTEIRO DE NARRAÇÃO - SLIDE 5:\n"
        "Humanizar o atendimento não custa dinheiro, custa atenção e respeito.\n"
        "Primeiro: chame sempre o paciente pelo nome. Nunca diga 'o paciente da máquina 12' ou 'o leito 04'.\n"
        "Segundo: ofereça apoio com cadeiras de rodas assim que o paciente desce do transporte.\n"
        "Terceiro: cuide do conforto térmico. Pacientes em hemodiálise sentem muito frio devido à circulação extracorpórea e à anemia.\n"
        "E quarto: respeite a dignidade e a autonomia de cada pessoa, sem infantilizar os idosos."
    )

    # =========================================================================
    # SLIDE 6: GESTÃO DE IMPREVISTOS E ATRASOS
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, LIGHT_BG)
    add_header(s6, "Atendimento Externo • Comunicação", "5. Gestão de Imprevistos e Transparência em Atrasos", "Como a comunicação proativa dissipa a angústia na sala de espera durante intercorrências")

    add_card(s6, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Por Que Ocorrem Atrasos?",
        [
            ("Desinfecção de Máquinas", "Ciclos químicos e térmicos necessários para evitar contaminação cruzada."),
            ("Calibração da Osmose", "Ajustes de condutividade para garantir água biologicamente pura."),
            ("Intercorrências Graves", "Hipotensão severa ou hemostasia prolongada no turno anterior."),
            ("Acessos Difíceis", "Canulação cautelosa de fístulas delicadas para evitar hematomas.")
        ],
        badge_text="Causas Técnicas",
        border_color=BORDER_COLOR
    )

    add_card(s6, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "A Conduta Proativa Correta",
        [
            ("Avisar Imediatamente", "Nunca deixar a sala de espera sem notícias por mais de 10 minutos."),
            ("Explicar com Verdade", "Informar que a equipe está garantindo a desinfecção e segurança de todos."),
            ("Dar Previsão Realista", "Informar o tempo estimado com margem de segurança."),
            ("Acolher Dúvidas", "Responder com calma às preocupações de transporte e alimentação.")
        ],
        badge_text="O Que Fazer",
        border_color=EMERALD_GREEN
    )

    add_card(s6, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Condutas Inaceitáveis",
        [
            ("Silêncio e Esquiva", "Fugir das perguntas ou se trancar no posto de enfermagem."),
            ("Transferir a Culpa", "'A culpa é da equipe da limpeza' ou 'o médico atrasou'."),
            ("Grosseria ou Ironia", "Dizer que 'quem tem pressa não deveria fazer hemodiálise'."),
            ("Desdém", "Minimizar a fome ou o cansaço dos acompanhantes.")
        ],
        badge_text="O Que Evitar",
        border_color=ROSE_ACCENT
    )

    add_notes(s6,
        "ROTEIRO DE NARRAÇÃO - SLIDE 6:\n"
        "Em diálise, imprevistos acontecem: uma desinfecção de capilar que demora mais, uma calibração da osmose ou um paciente com sangramento no turno anterior.\n"
        "A diferença entre uma clínica respeitada e uma clínica caótica está na TRANSPARÊNCIA.\n"
        "Se o turno vai atrasar 20 minutos, vá até a sala de espera nos primeiros 5 minutos! Explique com gentileza: 'Pessoal, estamos realizando a desinfecção obrigatória das máquinas para a segurança de vocês. Vamos iniciar a entrada em 15 minutos'.\n"
        "O silêncio gera desespero e revolta; a comunicação proativa gera confiança e cooperação."
    )

    # =========================================================================
    # SLIDE 7: TRADUÇÃO DA LINGUAGEM TÉCNICA
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, LIGHT_BG)
    add_header(s7, "Comunicação Acessível • Didática", "6. Traduzindo o 'Mediquês' para a Linguagem do Paciente", "A clareza nas explicações reduz o medo, fortalece a confiança e aumenta a adesão às condutas")

    add_card(s7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
        "Termo Técnico Hospitalar",
        [
            ("Ultrafiltração elevada", "'Precisamos programar taxa de UF de 1.200 mL/h hoje'."),
            ("Kt/V e URR subótimos", "'O Kt/V veio 1.05 e a URR está abaixo de 65%'."),
            ("Recirculação de FAV", "'Há recirculação no acesso vascular decorrente da proximidade dos biséis'."),
            ("Hiperfosfatemia Crítica", "'Seu fósforo sérico atingiu 7,8 mg/dL no laboratório'."),
            ("Queda de Qb da Bomba", "'Tivemos que reduzir o fluxo para 250 mL/min por pressão arterial negativa'.")
        ],
        badge_text="Jargão Hermético",
        border_color=AMBER_WARN
    )

    add_card(s7, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "Como Explicar com Clareza e Afeto",
        [
            ("Líquido e Inchaço", "'O senhor acumulou um pouco mais de peso; vamos tirar o líquido com calma para não dar cãibra'."),
            ("Limpeza do Sangue", "'A diálise não conseguiu limpar tudo no mês passado; vamos estender um pouco para o senhor se sentir mais disposto'."),
            ("Posição das Agulhas", "'O sangue limpo está voltando antes de circular pelo corpo; vamos ajustar a posição da agulha para render melhor'."),
            ("Cuidado com os Ossos", "'O fósforo alto coça a pele e enfraquece os ossos; a nutri vai ajudar a escolher os alimentos certos'."),
            ("Fluxo da Máquina", "'A veia está um pouco estreita hoje; vamos rodar mais suave para proteger o seu braço'.")
        ],
        badge_text="Linguagem Empática",
        border_color=EMERALD_GREEN
    )

    add_notes(s7,
        "ROTEIRO DE NARRAÇÃO - SLIDE 7:\n"
        "Nós, profissionais de saúde, muitas vezes nos acostumamos com siglas e jargões técnicos: Kt/V, ultrafiltração, recirculação, fosfatemia.\n"
        "Para o paciente e para a família, isso soa como outra língua e provoca pânico.\n"
        "Aprenda a traduzir os termos com carinho e clareza. Não diga que a ultrafiltração está alta; diga que acumulou um pouco mais de líquido e que vamos tirar com cuidado para evitar cãibras.\n"
        "Quando o paciente entende o 'porquê' do que estamos fazendo, ele colabora muito mais com o tratamento."
    )

    # =========================================================================
    # SLIDE 8: CONCEITO DE CLIENTE INTERNO NA HEMODIÁLISE
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, LIGHT_BG)
    add_header(s8, "Clientes Internos • Teoria da Corrente", "7. O Conceito de Cliente Interno na Clínica de Hemodiálise", "Quem recebe o resultado do seu trabalho é seu cliente interno e depende da sua precisão")

    # Banner Destaque
    banner = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(1.1))
    banner.fill.solid()
    banner.fill.fore_color.rgb = RGBColor(224, 242, 254)
    banner.line.color.rgb = BLUE_ACCENT
    tb_b = s8.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(11.3), Inches(0.9))
    tf_b = tb_b.text_frame
    p_b1 = tf_b.paragraphs[0]
    p_b1.text = "A REGRA DE OURO DO CLIENTE INTERNO"
    p_b1.font.name = 'Arial'
    p_b1.font.size = Pt(10)
    p_b1.font.bold = True
    p_b1.font.color.rgb = BLUE_ACCENT
    p_b2 = tf_b.add_paragraph()
    p_b2.text = "“O colega de trabalho que recebe a sua informação, o seu leito limpo ou o seu insumo fracionado tem o mesmo direito de receber excelência, respeito e pontualidade que o paciente que senta na poltrona.”"
    p_b2.font.name = 'Arial'
    p_b2.font.size = Pt(12)
    p_b2.font.bold = True
    p_b2.font.color.rgb = NAVY_BG
    p_b2.space_before = Pt(3)

    add_card(s8, Inches(0.8), Inches(3.2), Inches(3.7), Inches(3.8),
        "1. Superar o Silo de Setor",
        [
            ("Fim da Fragmentação", "Nenhum setor é uma ilha isolada."),
            ("Visão Sistêmica", "Entender como o seu atraso afeta o setor seguinte."),
            ("Solidariedade Ativa", "Ajudar o colega do outro departamento nos momentos de pico.")
        ],
        badge_text="Cultura",
        border_color=TEAL_PRIMARY
    )

    add_card(s8, Inches(4.8), Inches(3.2), Inches(3.7), Inches(3.8),
        "2. Padrão de Entrega",
        [
            ("Comunicação sem Ruído", "Passar dados completos e sem abreviações duvidosas."),
            ("Conferência Dupla", "Checar antes de passar adiante para evitar retrabalho."),
            ("Pontualidade Rigorosa", "Cumprir prazos de liberação de máquinas e exames.")
        ],
        badge_text="Processo",
        border_color=BLUE_ACCENT
    )

    add_card(s8, Inches(8.8), Inches(3.2), Inches(3.7), Inches(3.8),
        "3. Clima Organizacional",
        [
            ("Gentileza no Trato", "'Por favor', 'obrigado' e 'bom dia' em todas as interações."),
            ("Resolução Pacífica", "Resolver divergências diretamente com o colega em particular."),
            ("Orgulho do Trabalho", "Reconhecer que o seu esforço salva vidas diariamente.")
        ],
        badge_text="Relacionamento",
        border_color=EMERALD_GREEN
    )

    add_notes(s8,
        "ROTEIRO DE NARRAÇÃO - SLIDE 8:\n"
        "Agora entramos no coração do treinamento: o conceito de CLIENTE INTERNO.\n"
        "Muitas pessoas acham que cliente é apenas quem paga ou quem recebe a consulta. Em saúde, isso é um erro fatal!\n"
        "O colega do setor vizinho que recebe a sua folha de prescrição, o seu dialisador esterilizado ou o seu computador consertado é o seu cliente interno.\n"
        "Se você entrega um trabalho incompleto, com pressa ou mal feito para o colega, ele terá que gastar o dobro de tempo para corrigir, gerando estresse e colocando a vida do paciente em risco."
    )

    # =========================================================================
    # SLIDE 9: A CORRENTE VITAL ENTRE SETORES
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, LIGHT_BG)
    add_header(s9, "Clientes Internos • Interdependência", "8. A Corrente Vital de Cooperação entre Setores", "Como cada área da clínica abastece e viabiliza a assistência direta de hemodiálise")

    add_card(s9, Inches(0.8), Inches(1.8), Inches(2.2), Inches(5.0),
        "Higienização",
        [
            ("Desinfecção Terminal", "Poltronas e mesas limpas com produto clorado/quaternário."),
            ("Destino do Lixo", "Manejo correto de pérfuro e infectante."),
            ("Entrega Segura", "Libera o leito pronto para a enfermagem canular.")
        ],
        badge_text="Elo 1",
        border_color=TEAL_PRIMARY
    )

    add_card(s9, Inches(3.2), Inches(1.8), Inches(2.2), Inches(5.0),
        "Farmácia",
        [
            ("Fracionamento Seguro", "Doses certas de heparina, eritropoietina e ferro."),
            ("Concentrados Ácidos", "Distribuição no salão sem falta de galões."),
            ("Kits de Linhas", "Dialisadores e agulhas separadas por paciente.")
        ],
        badge_text="Elo 2",
        border_color=BLUE_ACCENT
    )

    add_card(s9, Inches(5.6), Inches(1.8), Inches(2.2), Inches(5.0),
        "Água & Manutenção",
        [
            ("Osmose Reversa", "Garantia contínua de água pura (<10 µS/cm)."),
            ("Preventiva em Dia", "Máquinas calibradas sem alarmes de condutividade."),
            ("Suporte Imediato", "Troca rápida de equipamento em pane.")
        ],
        badge_text="Elo 3",
        border_color=EMERALD_GREEN
    )

    add_card(s9, Inches(8.0), Inches(1.8), Inches(2.2), Inches(5.0),
        "Enfermagem & Médicos",
        [
            ("Prescrição Dialítica", "Parâmetros exatos de tempo, fluxo e sódio."),
            ("Canulação Perfeita", "Técnica asséptica e proteção do acesso."),
            ("Monitorização 360", "Aferição de sinais vitais e resposta rápida.")
        ],
        badge_text="Elo 4",
        border_color=NAVY_CARD
    )

    add_card(s9, Inches(10.4), Inches(1.8), Inches(2.2), Inches(5.0),
        "Multi & Apoio",
        [
            ("Nutrição & Psico", "Ajustes de dieta, fósforo e apoio emocional."),
            ("Serviço Social", "Transporte e benefícios garantidos."),
            ("Recepção, TI & APAC", "Faturamento, prontuário e guias em dia.")
        ],
        badge_text="Elo 5",
        border_color=AMBER_WARN
    )

    add_notes(s9,
        "ROTEIRO DE NARRAÇÃO - SLIDE 9:\n"
        "Observem com atenção este mapa da nossa Corrente Vital.\n"
        "A equipe de Higienização desinfeta a poltrona e a máquina e entrega um ambiente estéril para a Enfermagem.\n"
        "A Farmácia separa a heparina e os concentrados com exatidão e abastece o salão.\n"
        "O operador da Osmose Reversa garante que a água que passa pelo filtro tenha pureza microbiológica absoluta.\n"
        "O médico prescreve, a enfermagem punciona e conecta o paciente, e a equipe multiprofissional com o administrativo garantem o prontuário, a nutrição e o transporte.\n"
        "Se um único elo falhar, toda a corrente é quebrada. Todos nós somos responsáveis pela vida do paciente."
    )

    # =========================================================================
    # SLIDE 10: O EFEITO DOMINÓ DO ATRASO INTERSETORIAL
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, LIGHT_BG)
    add_header(s10, "Clientes Internos • Causa e Efeito", "9. O Efeito Dominó: O Impacto de uma Falha de Processo", "Estudo de caso: Como 10 minutos de descuido inicial desestruturam o dia inteiro da clínica")

    add_card(s10, Inches(0.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "Passo 1: A Falha Inicial",
        [
            ("Ocorrência", "Atraso de 10 minutos na higienização de 4 leitos do Salão 01 entre turnos."),
            ("Causa", "Falta de comunicação prévia ou desvio de foco na hora da troca."),
            ("Aparência", "Parece 'pouca coisa' para quem está limpando.")
        ],
        badge_text="Gatilho",
        border_color=AMBER_WARN
    )

    add_card(s10, Inches(3.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "Passo 2: Efeito no Salão",
        [
            ("Atraso na Entrada", "Os pacientes demoram 15 minutos a mais para sentar."),
            ("Pressa na Punção", "A enfermagem corre contra o tempo para puncionar 20 fístulas."),
            ("Risco de Erro", "Aumenta o risco de perda de punção ou erro de identificação.")
        ],
        badge_text="Repercussão 1",
        border_color=ROSE_ACCENT
    )

    add_card(s10, Inches(6.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "Passo 3: Efeito na Recepção",
        [
            ("Aglomeração", "A sala de espera enche de pacientes e familiares nervosos."),
            ("Reclamações", "A recepcionista é cobrada rispidamente sem ter culpa."),
            ("Estresse Coletivo", "O clima entre os colaboradores começa a se degradar.")
        ],
        badge_text="Repercussão 2",
        border_color=BLUE_ACCENT
    )

    add_card(s10, Inches(9.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "Passo 4: Efeito Final",
        [
            ("Atraso na Saída", "O turno termina após o horário estipulado."),
            ("Perda de Transporte", "As vans municipais atrasam e pacientes perdem carona."),
            ("Conclusão", "Um pequeno atraso gerou prejuízo clínico e moral enorme.")
        ],
        badge_text="Desfecho",
        border_color=NAVY_CARD
    )

    add_notes(s10,
        "ROTEIRO DE NARRAÇÃO - SLIDE 10:\n"
        "Vamos a um estudo de caso muito comum para demonstrar o Efeito Dominó.\n"
        "Imagine que na troca do 1º para o 2º turno, a equipe de limpeza atrasou 10 minutos para liberar quatro poltronas.\n"
        "O que acontece? O paciente demora a entrar. A técnica de enfermagem punciona com pressa para não atrasar o relógio da máquina.\n"
        "Lá fora, os familiares começam a reclamar com a recepcionista. No final da sessão, a diálise termina mais tarde e a van do transporte da prefeitura vai embora sem o paciente.\n"
        "Percebam: dez minutos de desatenção em um setor geraram estresse, risco biológico e dor de cabeça para dezenas de pessoas.\n"
        "Compromisso com o horário e com a qualidade é respeito à vida."
    )

    # =========================================================================
    # SLIDE 11: COMUNICAÇÃO NÃO VIOLENTA (CNV)
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, LIGHT_BG)
    add_header(s11, "Comunicação Intersetorial • CNV", "10. Comunicação Não Violenta (CNV) na Rotina Hospitalar", "Como transformar cobranças agressivas em pedidos claros e colaborativos entre colegas")

    add_card(s11, Inches(0.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "1. Observar Fatos",
        [
            ("Sem Julgamentos", "Descrever o fato objetivo e concreto que ocorreu."),
            ("Evitar Generalizações", "Nunca use 'você sempre' ou 'vocês nunca'."),
            ("Exemplo Correto", "'O leito 4 ainda não está higienizado às 11h25'." )
        ],
        badge_text="Etapa 1",
        border_color=TEAL_PRIMARY
    )

    add_card(s11, Inches(3.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "2. Identificar Emoção",
        [
            ("Reconhecer Sentimento", "Expressar como a situação impacta o trabalho sem acusar."),
            ("Sem Vitimização", "Assumir a própria responsabilidade profissional."),
            ("Exemplo Correto", "'Fico preocupada com o horário de início do paciente com potássio alto'." )
        ],
        badge_text="Etapa 2",
        border_color=BLUE_ACCENT
    )

    add_card(s11, Inches(6.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "3. Necessidade Comum",
        [
            ("Foco no Objetivo", "Conectar o problema ao propósito compartilhado de saúde."),
            ("Segurança do Paciente", "Lembrar que o objetivo de ambos é o bem-estar da clínica."),
            ("Exemplo Correto", "'Precisamos garantir que a sessão termine no horário seguro'." )
        ],
        badge_text="Etapa 3",
        border_color=EMERALD_GREEN
    )

    add_card(s11, Inches(9.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "4. Pedido Concreto",
        [
            ("Ação Específica", "Pedir algo claro, positivo, possível e com prazo."),
            ("Sem Exigências Rudes", "Tom de solicitação profissional, não de ameaça."),
            ("Exemplo Correto", "'Você poderia priorizar a limpeza do leito 4 agora, por favor?'" )
        ],
        badge_text="Etapa 4",
        border_color=NAVY_CARD
    )

    add_notes(s11,
        "ROTEIRO DE NARRAÇÃO - SLIDE 11:\n"
        "Como nos comunicamos nos momentos de pressão? Gritando nos corredores? Falando mal do colega pelas costas?\n"
        "Isso destrói o ambiente de trabalho e não resolve o problema. A ferramenta que utilizamos é a Comunicação Não Violenta, baseada em quatro passos:\n"
        "1º - Observar os fatos sem julgar: 'O leito 4 não está limpo'.\n"
        "2º - Dizer como se sente: 'Estou preocupada'.\n"
        "3º - Lembrar a necessidade comum: 'Precisamos iniciar a diálise do paciente no horário'.\n"
        "4º - Fazer um pedido concreto e educado: 'Poderia priorizar o leito 4 agora, por favor?'.\n"
        "Elogie em público, corrija e converse sempre em particular."
    )

    # =========================================================================
    # SLIDE 12: FERRAMENTA SBAR NA PASSAGEM DE PLANTÃO
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, LIGHT_BG)
    add_header(s12, "Comunicação Estruturada • SBAR", "11. Passagem de Plantão Estruturada: Método SBAR", "O padrão internacional de segurança para transmissão de informações críticas sem perdas")

    add_card(s12, Inches(0.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "S — Situação",
        [
            ("O Que Ocorre Agora", "Identificação imediata do paciente, leito e o motivo do contato."),
            ("Exemplo Clínico", "'Estou passando o Sr. José, leito 07, com hipotensão intradialítica súbita de 80x50 mmHg'." )
        ],
        badge_text="Situação",
        border_color=TEAL_PRIMARY
    )

    add_card(s12, Inches(3.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "B — Breve Histórico",
        [
            ("Background Relevante", "Dados prévios essenciais: peso seco, ganho interdialítico e acesso vascular."),
            ("Exemplo Clínico", "'Ele tem FAV em MSE, ganho de 3,5 kg, programado para tirar 3.000 mL, já transcorridas 2 horas'." )
        ],
        badge_text="Histórico",
        border_color=BLUE_ACCENT
    )

    add_card(s12, Inches(6.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "A — Avaliação",
        [
            ("Análise Técnica", "O que o profissional observou e qual a sua impressão clínica/operacional."),
            ("Exemplo Clínico", "'Paciente pálido e sudorético. Zerei a ultrafiltração e infundi 100 mL de soro fisiológico'." )
        ],
        badge_text="Avaliação",
        border_color=AMBER_WARN
    )

    add_card(s12, Inches(9.8), Inches(1.8), Inches(2.7), Inches(5.0),
        "R — Recomendação",
        [
            ("Conduta Sugerida", "O que precisa ser feito imediatamente e quem deve agir."),
            ("Exemplo Clínico", "'Solicito avaliação médica imediata no leito para rever o peso seco e autorizar infusão adicional'." )
        ],
        badge_text="Recomendação",
        border_color=EMERALD_GREEN
    )

    add_notes(s12,
        "ROTEIRO DE NARRAÇÃO - SLIDE 12:\n"
        "A passagem de plantão é um dos momentos mais vulneráveis da assistência hospitalar.\n"
        "Para evitar esquecimentos e informações vagas, adotamos o método internacional SBAR:\n"
        "S de Situação: o que está acontecendo agora.\n"
        "B de Breve Histórico: os dados prévios e o peso do paciente.\n"
        "A de Avaliação: o que eu vi e quais medidas imediatas tomei.\n"
        "R de Recomendação: o que eu preciso que você ou o médico faça agora.\n"
        "Com o SBAR, a comunicação é rápida, precisa e salva vidas."
    )

    # =========================================================================
    # SLIDE 13: GESTÃO DE CONFLITOS E DESESCALADA EMOCIONAL
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13, LIGHT_BG)
    add_header(s13, "Gestão de Conflitos • Desescalada", "12. Técnicas de Desescalada de Conflitos e Crises", "Como desarmar a agressividade verbal de pacientes, familiares ou colegas sob forte estresse")

    add_card(s13, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Postura Corporal & Voz",
        [
            ("Linguagem Não Verbal", "Mantenha braços abertos, ombros relaxados e olhar atencioso."),
            ("Tom de Voz Sereno", "Fale mais baixo e mais devagar do que a pessoa irritada."),
            ("Sem Defensiva", "Não cruze os braços, não aponte o dedo e nunca faça cara de deboche."),
            ("Distância Segura", "Mantenha um metro de distância respeitosa.")
        ],
        badge_text="Autocontrole",
        border_color=BLUE_ACCENT
    )

    add_card(s13, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Escuta e Validação",
        [
            ("A Regra dos 40 Segundos", "Deixe a pessoa desabafar sem interromper nos primeiros instantes."),
            ("Validação Emocional", "'Eu compreendo perfeitamente o seu cansaço e a sua preocupação...'."),
            ("Desarme da Tensão", "A pessoa que se sente ouvida reduz o tom agressivo automaticamente."),
            ("Empatia Real", "Concorde com a legitimidade da emoção antes de explicar a técnica.")
        ],
        badge_text="Técnica Verbal",
        border_color=TEAL_PRIMARY
    )

    add_card(s13, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Resolução & Suporte",
        [
            ("Foco na Solução", "'Vamos resolver isso agora da seguinte maneira...'."),
            ("Ação Imediata", "Dê um passo concreto e cumpra exatamente o que prometeu."),
            ("Acionamento Rápido", "Se a crise persistir, acione o Serviço Social, Psicologia ou Supervisão."),
            ("Segurança da Equipe", "Acolhimento não significa tolerar violência física; priorize a segurança.")
        ],
        badge_text="Desfecho",
        border_color=EMERALD_GREEN
    )

    add_notes(s13,
        "ROTEIRO DE NARRAÇÃO - SLIDE 13:\n"
        "Em algum momento na recepção ou no salão de diálise, alguém vai chegar exaltado. Pode ser um familiar cansado, um paciente assustado ou até um colega estressado.\n"
        "Como agir? Anotem estas regras de ouro:\n"
        "1ª: Mantenha a voz calma e baixa. Quem fala baixo convida o outro a baixar o tom também.\n"
        "2ª: Não interrompa nos primeiros 40 segundos. Deixe a pessoa esvaziar a angústia.\n"
        "3ª: Valide o sentimento: 'Entendo perfeitamente a sua frustração'. Isso desarma a briga.\n"
        "E 4ª: Ofereça uma solução prática e imediata. Se necessário, peça apoio ao Serviço Social ou à Supervisão."
    )

    # =========================================================================
    # SLIDE 14: ÉTICA, SIGILO E LGPD NA HEMODIÁLISE
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14, LIGHT_BG)
    add_header(s14, "Ética Profissional • LGPD", "13. Sigilo Profissional e Proteção de Dados de Saúde", "A inviolabilidade das informações clínicas, sorológicas e cadastrais do paciente renal")

    add_card(s14, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Sigilo Profissional Absoluto",
        [
            ("Sorologias e Doenças", "Diagnósticos de Hepatite B, C, HIV e complicações são ultraconfidenciais."),
            ("Proibição em Corredores", "Terminantemente proibido comentar casos clínicos em refeitórios, elevadores e vans."),
            ("Comentários Externos", "Nunca fale sobre a saúde de pacientes com amigos ou vizinhos."),
            ("Código de Ética", "A quebra de sigilo constitui crime e falta disciplinar grave perante conselhos (COREN/CRM).")
        ],
        badge_text="Privacidade",
        border_color=ROSE_ACCENT
    )

    add_card(s14, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Redes Sociais e Celular",
        [
            ("Proibição Total de Fotos", "Nunca fotografar ou filmar pacientes, nem com consentimento verbal."),
            ("Telas e Prontuários", "Fotos do salão com monitores de máquinas ou nomes expostos são infrações gravíssimas."),
            ("Uso de Celular no Salão", "Celulares pessoais devem ser guardados no armário; risco de infecção cruzada."),
            ("Grupos de Mensagens", "Não compartilhar laudos de pacientes em grupos informais.")
        ],
        badge_text="Mídias Digitais",
        border_color=AMBER_WARN
    )

    add_card(s14, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Segurança LGPD & Física",
        [
            ("Bloqueio de Telas", "Sempre aperte 'Windows + L' ao se afastar do computador do posto."),
            ("Guarda de Prontuários", "Fichas de diálise e prontuários devem permanecer fechados."),
            ("Descarte Seguro", "Rascunhos com dados de pacientes devem ser fragmentados, nunca jogados no lixo comum."),
            ("DPO da Clínica", "Comunique qualquer suspeita de vazamento de dados ao encarregado de TI.")
        ],
        badge_text="LGPD na Prática",
        border_color=NAVY_CARD
    )

    add_notes(s14,
        "ROTEIRO DE NARRAÇÃO - SLIDE 14:\n"
        "Atenção máxima neste slide: Dados de saúde são dados sensíveis protegidos por lei (LGPD) e pelos códigos de ética profissional.\n"
        "É terminantemente proibido tirar fotos de pacientes dentro da clínica ou postar qualquer imagem de salão nas redes sociais.\n"
        "Sorologias de hepatite e HIV são confidenciais: jamais comente sobre a condição de um paciente no refeitório ou na recepção.\n"
        "Ao sair de perto do computador, bloqueie a tela. Prontuários e fichas não podem ficar expostos aos olhares de terceiros. Respeitar o paciente é proteger a sua privacidade."
    )

    # =========================================================================
    # SLIDE 15: CULTURA JUSTA DE SEGURANÇA DO PACIENTE
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background(s15, LIGHT_BG)
    add_header(s15, "Qualidade & Segurança • NSP", "14. Cultura Justa: Notificação e Melhoria Contínua", "Como transformar falhas operacionais em aprendizado do sistema, sem punições individuais")

    add_card(s15, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "A Cultura da Punição",
        [
            ("Abordagem Antiga", "Buscar culpados e punir quem cometeu a falha."),
            ("Consequência", "As pessoas escondem os erros e não pedem ajuda."),
            ("Resultado", "A falha se repete até provocar um dano grave ou óbito no paciente."),
            ("Cultura do Medo", "Bloqueia a inovação e desgasta as equipes.")
        ],
        badge_text="Modelo Ultrapassado",
        border_color=ROSE_ACCENT
    )

    add_card(s15, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "A Cultura Justa (Nex-Ai)",
        [
            ("Foco no Processo", "Analisar por que o sistema permitiu que a falha acontecesse."),
            ("Quase-Falhas (Near Miss)", "Comemorar e investigar erros interceptados antes de atingir o paciente."),
            ("Transparência Segura", "O colaborador notifica com tranquilidade, sabendo que não será perseguido."),
            ("Segurança Psicológica", "Equipes integradas que cuidam umas das outras.")
        ],
        badge_text="Nosso Padrão",
        border_color=EMERALD_GREEN
    )

    add_card(s15, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Como Agir na Prática",
        [
            ("Identificou um Risco?", "Comunique imediatamente o seu supervisor ou o NSP."),
            ("Houve Falha no Fluxo?", "Preencha a notificação de ocorrência no sistema."),
            ("Participe da Solução", "Contribua com ideias para simplificar e blindar o protocolo."),
            ("Meta Zero Dano", "Nosso compromisso inegociável com a vida de cada paciente renal.")
        ],
        badge_text="Plano de Ação",
        border_color=TEAL_PRIMARY
    )

    add_notes(s15,
        "ROTEIRO DE NARRAÇÃO - SLIDE 15:\n"
        "Na nossa clínica, praticamos a verdadeira CULTURA JUSTA de Segurança do Paciente.\n"
        "O que isso significa? Significa que quando uma quase-falha acontece — como uma medicação trocada que foi barrada na checagem ou um leito com atraso — nós não procuramos um 'bode expiatório' para punir.\n"
        "Nós investigamos o processo: o que falhou no sistema? A etiqueta estava confusa? Faltou iluminação? O protocolo precisa de ajuste?\n"
        "Notificar quase-falhas ao Núcleo de Segurança do Paciente (NSP) é um ato de coragem profissional que salva vidas."
    )

    # =========================================================================
    # SLIDE 16: CONCLUSÃO, PÓS-TESTE E CERTIFICAÇÃO DIGITAL (Dark Theme)
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    set_slide_background(s16, NAVY_BG)

    # Title Box
    tb16 = s16.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(1.8))
    tf16 = tb16.text_frame
    tf16.word_wrap = True

    p_badge16 = tf16.paragraphs[0]
    p_badge16.text = "ETAPA FINAL • AVALIAÇÃO DE EFICÁCIA & CERTIFICADO"
    p_badge16.font.name = 'Arial'
    p_badge16.font.size = Pt(11)
    p_badge16.font.bold = True
    p_badge16.font.color.rgb = TEAL_PRIMARY

    p_main16 = tf16.add_paragraph()
    p_main16.text = "Conclusão e Próximos Passos Obrigatórios"
    p_main16.font.name = 'Arial'
    p_main16.font.size = Pt(28)
    p_main16.font.bold = True
    p_main16.font.color.rgb = WHITE
    p_main16.space_before = Pt(4)

    # 3 Steps Cards on Dark
    s16_cards = [
        ("Passo 1: Acesse o Portal", "Abra o link do Portal do Colaborador no seu celular ou computador e digite seu CPF cadastrado no RH."),
        ("Passo 2: Responda o Pós-Teste", "Responda com atenção às 5 perguntas de fixação para mensuração do ganho de eficácia (+%)."),
        ("Passo 3: Emita seu Certificado", "Atingindo a nota mínima (70%), baixe seu Certificado Digital timbrado oficial com QR Code rastreável.")
    ]

    for idx, (c_title, c_desc) in enumerate(s16_cards):
        c_left = Inches(0.8 + idx * 4.0)
        c_shape = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.8), Inches(3.7), Inches(3.0))
        c_shape.fill.solid()
        c_shape.fill.fore_color.rgb = NAVY_CARD
        c_shape.line.color.rgb = TEAL_PRIMARY
        c_shape.line.width = Pt(1.5)

        tb_sc = s16.shapes.add_textbox(c_left + Inches(0.25), Inches(3.0), Inches(3.2), Inches(2.6))
        tf_sc = tb_sc.text_frame
        tf_sc.word_wrap = True

        p_ct = tf_sc.paragraphs[0]
        p_ct.text = c_title
        p_ct.font.name = 'Arial'
        p_ct.font.size = Pt(13)
        p_ct.font.bold = True
        p_ct.font.color.rgb = WHITE

        p_cd = tf_sc.add_paragraph()
        p_cd.text = c_desc
        p_cd.font.name = 'Arial'
        p_cd.font.size = Pt(10.5)
        p_cd.font.color.rgb = RGBColor(203, 213, 225)
        p_cd.space_before = Pt(8)

    # Footer Quote
    tb_quote = s16.shapes.add_textbox(Inches(0.8), Inches(6.2), Inches(11.7), Inches(0.8))
    tf_q = tb_quote.text_frame
    p_q = tf_q.paragraphs[0]
    p_q.text = "“O atendimento de excelência não é um ato isolado: é um hábito diário que salva vidas na hemodiálise.”\nNex-Ai CLINIC • Comitê de Humanização & Recursos Humanos"
    p_q.font.name = 'Arial'
    p_q.font.size = Pt(11)
    p_q.font.italic = True
    p_q.font.color.rgb = TEAL_PRIMARY
    p_q.alignment = PP_ALIGN.CENTER

    add_notes(s16,
        "ROTEIRO DE ENCERRAMENTO:\n"
        "Parabéns a todos por concluírem a etapa expositiva deste treinamento fundamental!\n"
        "Agora, para validar a sua participação e emitir o seu Certificado Digital de 4 horas com validação pelo Dossiê da Vigilância Sanitária:\n"
        "Acesse o link do Portal do Colaborador, informe o seu CPF e responda às cinco questões do Pós-teste.\n"
        "Lembrem-se todos os dias: o atendimento excelente que você presta ao paciente e ao seu colega de trabalho é o que faz da nossa clínica um porto seguro de saúde e humanidade.\n"
        "Muito obrigado pelo empenho de cada um de vocês!"
    )

    # =========================================================================
    # SALVAR ARQUIVOS
    # =========================================================================
    output_public = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'docs', 'Treinamento_Atendimento_Clientes_Nefrologia_NexAi.pptx'))
    output_docs = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs', 'Treinamento_Atendimento_Clientes_Nefrologia_NexAi.pptx'))

    os.makedirs(os.path.dirname(output_public), exist_ok=True)
    os.makedirs(os.path.dirname(output_docs), exist_ok=True)

    prs.save(output_public)
    prs.save(output_docs)

    print(f"[Sucesso] Apresentacao PPTX gerada com 16 slides e anotacoes do orador!")
    print(f"Salvo em: {output_public}")
    print(f"Salvo em: {output_docs}")

if __name__ == '__main__':
    build_presentation()

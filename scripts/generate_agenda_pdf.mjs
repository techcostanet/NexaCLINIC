import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Apresentação Módulo Agenda - NexaCLINIC</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 18mm 20mm;
      margin: 0 auto;
      background: white;
      position: relative;
      page-break-after: always;
      display: flex;
      flex-direction: column;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Top Brand Bar */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 2px solid #f1f5f9;
      margin-bottom: 24px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-badge {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    .logo-text {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }

    .logo-text span {
      color: #2563eb;
    }

    .doc-tag {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #2563eb;
      background: #eff6ff;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid #dbeafe;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%);
      border-radius: 20px;
      padding: 32px 30px;
      color: white;
      margin-bottom: 28px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.3);
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%);
      border-radius: 50%;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      padding: 5px 12px;
      border-radius: 30px;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hero h1 {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.25;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }

    .hero p {
      font-size: 13.5px;
      line-height: 1.55;
      color: #cbd5e1;
      max-width: 90%;
    }

    /* Section Headings */
    .section-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      letter-spacing: -0.3px;
    }

    .section-title::before {
      content: '';
      width: 4px;
      height: 18px;
      background: #2563eb;
      border-radius: 4px;
    }

    /* Feature Grid */
    .features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 24px;
    }

    .feature-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      transition: all 0.2s;
    }

    .feature-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .feature-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .icon-blue { background: #eff6ff; color: #2563eb; }
    .icon-green { background: #f0fdf4; color: #16a34a; }
    .icon-purple { background: #faf5ff; color: #9333ea; }
    .icon-amber { background: #fffbeb; color: #d97706; }
    .icon-indigo { background: #eef2ff; color: #4f46e5; }
    .icon-rose { background: #fff1f2; color: #e11d48; }

    .feature-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .feature-desc {
      font-size: 11.5px;
      line-height: 1.45;
      color: #64748b;
    }

    /* Highlights Banner */
    .highlights-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      justify-content: space-around;
      text-align: center;
      margin-bottom: 24px;
    }

    .highlight-item h3 {
      font-size: 18px;
      font-weight: 800;
      color: #2563eb;
    }

    .highlight-item p {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      margin-top: 2px;
    }

    /* Page Footer */
    .footer {
      margin-top: auto;
      padding-top: 14px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #94a3b8;
    }

    /* Page 2 Layout */
    .workflow-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .workflow-step {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
    }

    .step-number {
      width: 28px;
      height: 28px;
      background: #2563eb;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .step-content h4 {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 3px;
    }

    .step-content p {
      font-size: 11.5px;
      color: #64748b;
      line-height: 1.4;
    }

    .benefits-box {
      background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
      border: 1px solid #bfdbfe;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .benefits-title {
      font-size: 14px;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .benefits-list {
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .benefits-list li {
      font-size: 11.5px;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .check-icon {
      color: #16a34a;
      font-weight: bold;
    }

    .cta-card {
      background: #0f172a;
      color: white;
      border-radius: 14px;
      padding: 20px 24px;
      text-align: center;
    }

    .cta-card h3 {
      font-size: 15px;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .cta-card p {
      font-size: 11.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- PÁGINA 1 -->
  <div class="page">
    <div class="header-bar">
      <div class="logo-container">
        <div class="logo-badge">N</div>
        <div class="logo-text">Nexa<span>CLINIC</span></div>
      </div>
      <div class="doc-tag">Apresentação Executiva</div>
    </div>

    <div class="hero">
      <div class="hero-badge">⚡ Tecnologia & Gestão em Saúde</div>
      <h1>Módulo Agenda Inteligente</h1>
      <p>Transforme a experiência de agendamento da sua clínica. Uma plataforma moderna, fluida e integrada que elimina atrasos, reduz faltas e conecta recepção, consultórios e pacientes em tempo real.</p>
    </div>

    <div class="highlights-box">
      <div class="highlight-item">
        <h3>4 Visões</h3>
        <p>Dia, Salas, Semana e Mês</p>
      </div>
      <div class="highlight-item">
        <h3>1 Clique</h3>
        <p>Confirmação WhatsApp</p>
      </div>
      <div class="highlight-item">
        <h3>100% Nuvem</h3>
        <p>Tempo Real & Seguro</p>
      </div>
      <div class="highlight-item">
        <h3>Zero Conflito</h3>
        <p>Bloqueios & Cotas com IA</p>
      </div>
    </div>

    <div class="section-title">Principais Recursos & Diferenciais</div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-header">
          <div class="feature-icon icon-blue">📅</div>
          <div class="feature-title">Múltiplas Visões de Grade</div>
        </div>
        <div class="feature-desc">Alterne instantaneamente entre visualização diária por médico, grade visual por consultórios e salões de diálise, visão semanal e panorama mensal.</div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <div class="feature-icon icon-green">💬</div>
          <div class="feature-title">Confirmação via WhatsApp</div>
        </div>
        <div class="feature-desc">Dispare mensagens automáticas e personalizadas com 1 clique para os pacientes, confirmando médico, horário, sala e instruções de preparo.</div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <div class="feature-icon icon-purple">🏥</div>
          <div class="feature-title">Matriz de Consultórios & Salas</div>
        </div>
        <div class="feature-desc">Visão panorâmica de ocupação de espaços físicos: Consultórios 1, 2 e 3, Salões de Hemodiálise, Sala de Ultrassom e Procedimentos.</div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <div class="feature-icon icon-amber">📊</div>
          <div class="feature-title">Gestão de Cotas por Especialista</div>
        </div>
        <div class="feature-desc">Configure limites mensais de Primeiras Consultas e Retornos por médico, recebendo alertas visuais automáticos caso as cotas sejam atingidas.</div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <div class="feature-icon icon-rose">🛡️</div>
          <div class="feature-title">Feriados & Bloqueios Médicos</div>
        </div>
        <div class="feature-desc">Calendário brasileiro com feriados nacionais automáticos e sistema de bloqueio de agenda para férias, congressos e ausências programadas.</div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <div class="feature-icon icon-indigo">⚡</div>
          <div class="feature-title">Encaixes & Duração Dinâmica</div>
        </div>
        <div class="feature-desc">Suporte a encaixes identificados com destaque visual e slots de atendimento com duração personalizada por profissional (15min a 60min).</div>
      </div>
    </div>

    <div class="footer">
      <div>NexaCLINIC v4.1 • Sistema Integrado de Gestão Clínica</div>
      <div>Página 1 de 2</div>
    </div>
  </div>

  <!-- PÁGINA 2 -->
  <div class="page">
    <div class="header-bar">
      <div class="logo-container">
        <div class="logo-badge">N</div>
        <div class="logo-text">Nexa<span>CLINIC</span></div>
      </div>
      <div class="doc-tag">Fluxo Operacional & Benefícios</div>
    </div>

    <div class="section-title">A Jornada do Paciente em 4 Etapas Fluidas</div>

    <div class="workflow-container">
      <div class="workflow-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h4>Agendamento Rápido com Autocomplete</h4>
          <p>Busca inteligente por Nome ou CPF com cálculo automático de idade, preenchimento instantâneo de dados e verificação em tempo real de disponibilidade.</p>
        </div>
      </div>

      <div class="workflow-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h4>Confirmação Ativa e Redução de No-Show</h4>
          <p>Envio da confirmação oficial via WhatsApp e marcação visual de status (Confirmado, Pendente, Reagendado) para controle assertivo das vagas.</p>
        </div>
      </div>

      <div class="workflow-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h4>Check-in na Recepção em Tempo Real</h4>
          <p>Ao chegar à clínica, o paciente passa para o status "Aguardando" com 1 clique. O médico recebe o alerta visual na sala de atendimento sem necessidade de interfone.</p>
        </div>
      </div>

      <div class="workflow-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h4>Atendimento Clínico & Finalização</h4>
          <p>Transição para "Em Consulta" e "Finalizado", alimentando automaticamente as métricas de tempo de espera, pontualidade e produtividade médica.</p>
        </div>
      </div>
    </div>

    <div class="benefits-box">
      <div class="benefits-title">✨ Por Que Adotar o Módulo Agenda?</div>
      <ul class="benefits-list">
        <li><span class="check-icon">✓</span> Redução de até 40% nas faltas (no-show)</li>
        <li><span class="check-icon">✓</span> Zero risco de agendamentos duplicados</li>
        <li><span class="check-icon">✓</span> Interface intuitiva: sem treinamentos complexos</li>
        <li><span class="check-icon">✓</span> Sincronização em nuvem segura e ultrarrápida</li>
        <li><span class="check-icon">✓</span> Otimização máxima do uso dos consultórios</li>
        <li><span class="check-icon">✓</span> Indicadores de desempenho sempre atualizados</li>
      </ul>
    </div>

    <div class="cta-card">
      <h3>Pronto para elevar o nível de organização da sua clínica?</h3>
      <p>Acesse o módulo Agenda no menu superior e experimente a velocidade e elegância do NexaCLINIC.</p>
    </div>

    <div class="footer">
      <div>NexaCLINIC v4.1 • Sistema Integrado de Gestão Clínica</div>
      <div>Página 2 de 2</div>
    </div>
  </div>

</body>
</html>
  `;

  const outputPath = path.resolve(__dirname, '../Apresentacao_Modulo_Agenda_NexaCLINIC.pdf');

  console.log('Iniciando Puppeteer para gerar PDF...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    }
  });

  await browser.close();
  console.log('PDF gerado com sucesso em:', outputPath);
}

generatePDF().catch(err => {
  console.error('Erro ao gerar PDF:', err);
  process.exit(1);
});

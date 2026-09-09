# Padrão Oficial de Cabeçalho de Módulos (Module Header Standard)

Este documento define o padrão visual e arquitetural obrigatório para o topo de todos os módulos do sistema Nex-Ai CLINIC.

## 1. Princípio da Responsabilidade Única (Sem Redundâncias)

1. **A Navbar Superior (Global):**
   - Exibe a marca mãe limpa: `Nex-Ai` (usando `<NexAiBrand size="md" showIcon={!tenantSettings.logo} suffix="" />`).
   - Não exibe badge redundante do módulo ao lado do logo.
   - Centraliza os atalhos globais: `[Relatórios]`, `[Manual]`, `[Trocar Portal]`.
   - **É o ÚNICO local onde o seletor de Unidade (`<UnitSelector />`) deve existir.**

2. **O Cabeçalho do Módulo (Module Header):**
   - Utiliza o componente oficial padronizado: `src/components/common/ModuleHeader.jsx`.
   - **Título:** Utiliza o identificador do módulo com ponto de destaque colorido (ex: `.RECEPTION`, `.MED`, `.ASSIST`, `.STOCK`). Não repete o prefixo "Nex-Ai".
   - **Ícone:** Caixa quadrada de 46x46px com cantos arredondados (12px), gradiente específico do módulo e ícone vetorial branco de 25px.
   - **Subtítulo:** Frase direta e concisa explicando o objetivo operacional do módulo.
   - **Ações (Canto Direito):** Apenas botões de contexto da tela (ex: botão `TV`, atalhos de visualização ou abas compactas).
   - **PROIBIDO:** Duplicar `<UnitSelector />` no cabeçalho do módulo.

3. **Espaçamento e Containers:**
   - O elemento raiz do módulo (`styles.container`) deve possuir apenas:
     ```javascript
     container: {
       display: 'flex',
       flexDirection: 'column',
       gap: '1.25rem',
     }
     ```
   - **NUNCA** adicionar `padding: '1.5rem'` ou `margin: '0 auto'` no container interno do módulo, pois a tag `<main className="main-content">` já provê esse espaçamento globalmente via CSS.

## 2. Paleta de Cores e Gradientes por Módulo

| Módulo | Prefixo/Título | Gradiente do Ícone | Cor do Ponto (`dotColor`) | Ícone Sugerido |
| :--- | :--- | :--- | :--- | :--- |
| **Recepção** | `.RECEPTION` | `linear-gradient(135deg, #0d9488, #0f766e)` | `#0d9488` | `UserCheck` |
| **Assistencial** | `.ASSIST` | `linear-gradient(135deg, #ec4899, #a855f7)` | `#a855f7` | `Megaphone` |
| **Corpo Clínico** | `.MED` | `linear-gradient(135deg, #0284c7, #2563eb)` | `#0284c7` | `Stethoscope` |
| **Estoque** | `.STOCK` | `linear-gradient(135deg, #f59e0b, #d97706)` | `#f59e0b` | `Boxes` / `Package` |
| **Financeiro** | `.FINANCE` | `linear-gradient(135deg, #10b981, #059669)` | `#10b981` | `DollarSign` |
| **RH / Pessoal** | `.HR` | `linear-gradient(135deg, #6366f1, #4f46e5)` | `#6366f1` | `Users` |
| **Engenharia** | `.SERVICE` | `linear-gradient(135deg, #64748b, #475569)` | `#64748b` | `Wrench` |

## 3. Exemplo de Aplicação (Código)

```jsx
import ModuleHeader from './common/ModuleHeader';
import { UserCheck, Tv } from 'lucide-react';

<ModuleHeader
  icon={UserCheck}
  title=".RECEPTION"
  subtitle="Admissão completa de pacientes, cadastro clínico e auditoria presencial de ronda médica."
  gradient="linear-gradient(135deg, #0d9488, #0f766e)"
  dotColor="#0d9488"
  actions={
    <button
      type="button"
      onClick={() => window.open('/tv', '_blank')}
      className="btn-tv"
    >
      <Tv size={15} />
      <span>TV</span>
    </button>
  }
/>
```

# Diretrizes do Projeto NexaCLINIC

## Regras Obrigatórias de Deploy e Versionamento

Toda vez que um deploy for realizado, a seguinte sequência de ações deve ser executada obrigatoriamente:

1. **Versionamento Automático:**
   - O número de versão no `package.json` deve ser incrementado automaticamente.

2. **Histórico de Versões (Notas de Release):**
   - As alterações e notas da nova versão devem ser obrigatoriamente registradas no histórico de versões do sistema ([src/components/ChangelogModal.jsx](file:///c:/NexAi/NexAi.CLINIC/src/components/ChangelogModal.jsx)) e no arquivo [CHANGELOG.md](file:///c:/NexAi/NexAi.CLINIC/CHANGELOG.md).

3. **Sincronização Total com GitHub:**
   - Todo o código atualizado, incluindo este arquivo de regras (`.agents/AGENTS.md`), histórico de versões e arquivos de configuração, deve ser comitado e enviado para o GitHub (`git push origin main`).

4. **Deploy de Produção:**
   - Executar o deploy no Firebase Hosting para colocar a versão mais recente no ar.

## Padrões de Interface e UI/UX (Obrigatório)

1. **Rótulos Concisos (Padrão de 1 Palavra / Termo Único):**
   - Rótulos de campos de formulários (`<label>`), cabeçalhos de tabelas (`<th>`), filtros e colunas devem ser sempre simplificados, utilizando preferencialmente **apenas uma palavra** ou termo direto conciso (ex: `Fornecedor`, `Valor`, `Vencimento`, `Centro de Custo`, `Nota Fiscal`, `Ações`, `Pagamento`, `Banco`, `Status`, `Saldo`, `Devido`, `Pago`, `Realizado`, `Orçado`).
   - **Proibido usar rótulos duplos com barras ou conectivos redundantes**, tais como *"Fornecedor / Descrição"*, *"Ações & Baixa"*, *"Centro de Custos & Modalidade"*, *"Banco / Conta"*, *"Meio / Forma de Pagamento"*, *"Realizado / Pago (R$)"*.

## Regras de Documentação e Manuais dos Módulos (Obrigatório)

1. **Atualização Contínua dos Manuais (`src/data/moduleGuidesData.js`):**
   - A cada nova funcionalidade desenvolvida, alteração de fluxo operacional ou adição de novos módulos, é **obrigatório** atualizar o respectivo manual na base de dados [`src/data/moduleGuidesData.js`](file:///c:/Nexa/NexAi-CLINIC/src/data/moduleGuidesData.js).
   - O manual deve sempre manter preenchidas de forma direta e estruturada as seções:
     - **`Recursos`**: Lista objetiva do que o módulo entrega.
     - **`Tutorial`**: Passo a passo prático de como operar cada rotina.
     - **`Dúvidas`**: FAQ rápida com perguntas e respostas para dúvidas frequentes do usuário.



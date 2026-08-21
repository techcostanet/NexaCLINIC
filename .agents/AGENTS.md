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

1. **Rótulos Concisos (Padrão Rigoroso de 1 Palavra / Termo Único):**
   - Rótulos de campos de formulários (`<label>`), cabeçalhos de tabelas (`<th>`), abas, filtros, botões, modais e títulos de cards devem ser **estritamente diretos**, utilizando preferencialmente **apenas uma palavra** ou termo único indispensável.
   - **Terminantemente proibido usar termos duplos com barras (`/`) ou conectivos (`&`, `e`, `ou`) com a mesma finalidade**:
     - ❌ *"Instituição / Clínica Parceira"* ➡️ ✅ **`Parceiro`** ou **`Instituição`**
     - ❌ *"Produto / Medicamento"* ➡️ ✅ **`Insumo`** ou **`Produto`**
     - ❌ *"Estoque Atual / Nível"* ➡️ ✅ **`Saldo`**
     - ❌ *"Ações & Relatórios"* ou *"Ações & Baixa"* ➡️ ✅ **`Ações`**
     - ❌ *"Origem (Local)"* / *"Destino (Local)"* ➡️ ✅ **`Origem`** / **`Destino`**
     - ❌ *"Lote / Validade"* ➡️ ✅ **`Lote`** (e coluna separada **`Validade`**)
     - ❌ *"Data / Hora"* ➡️ ✅ **`Data`**
     - ❌ *"Fornecedor / Descrição"* ➡️ ✅ **`Fornecedor`**
     - ❌ *"Banco / Conta"* ➡️ ✅ **`Banco`**
     - ❌ *"Meio / Forma de Pagamento"* ➡️ ✅ **`Pagamento`**
     - ❌ *"Realizado / Pago"* ➡️ ✅ **`Realizado`**
   - **Regra de Limpeza Ativa (Boy Scout Rule):** Toda vez que qualquer arquivo ou componente for aberto ou alterado, é obrigatório varrer e remover quaisquer rótulos duplos ou redundantes encontrados.

## Regras de Documentação e Manuais dos Módulos (Obrigatório)

1. **Atualização Contínua dos Manuais (`src/data/moduleGuidesData.js`):**
   - A cada nova funcionalidade desenvolvida, alteração de fluxo operacional ou adição de novos módulos, é **obrigatório** atualizar o respectivo manual na base de dados [`src/data/moduleGuidesData.js`](file:///c:/Nexa/NexAi-CLINIC/src/data/moduleGuidesData.js).
   - O manual deve sempre manter preenchidas de forma direta e estruturada as seções:
     - **`Recursos`**: Lista objetiva do que o módulo entrega.
     - **`Tutorial`**: Passo a passo prático de como operar cada rotina.
     - **`Dúvidas`**: FAQ rápida com perguntas e respostas para dúvidas frequentes do usuário.



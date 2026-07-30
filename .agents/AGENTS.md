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

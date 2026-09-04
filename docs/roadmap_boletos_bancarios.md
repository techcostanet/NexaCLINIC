# Roadmap e Arquitetura: Evolução da Gestão de Boletos Bancários e Integração Financeira

Este documento registra a especificação técnica e o planejamento arquitetural das **Fases 2 e 3** da esteira de automação de pagamentos bancários do **NexaCLINIC**, concebidas para expandir o fluxo após a implantação da Fase 1 (anexo e extração da linha digitável na entrada de notas e contas a pagar).

---

## Fase 2: Gestão de Múltiplos Boletos e Parcelamento Avançado

### 1. Contexto e Necessidade
Muitas compras de insumos hospitalares, medicamentos de alto custo e contratos de manutenção são faturadas com condição de pagamento parcelada (ex: 30 / 60 / 90 dias ou quinzenais). Cada parcela gera uma duplicata fiscal na NF-e e um boleto bancário individual correspondente enviado pelo fornecedor.

### 2. Especificações Funcionais
1. **Multi-Anexador no Assistente de Importação:**
   * Na Etapa 3 (Financeiro) do assistente de importação de notas:
     * Permitir o upload em lote de múltiplos arquivos de boleto (ex: 3 PDFs ou imagens).
     * O sistema processa cada arquivo individualmente e extrai suas respectivas linhas digitáveis, datas de vencimento e valores.
2. **Vinculação 1:1 com as Parcelas:**
   * O sistema realiza o *matching* automático entre o boleto e a parcela com base na **Data de Vencimento** e no **Valor**.
   * Caso haja divergência ou parcelas de mesmo valor, o usuário poderá associar manualmente cada boleto à sua respectiva parcela através de um seletor simples.
3. **Conferência e Validação de Totais:**
   * Comparação automática: $\sum \text{Valor dos Boletos} = \text{Valor Total da NF-e}$.
   * Alerta visual caso algum boleto esteja ausente ou se a soma dos boletos diferir do valor total da nota.
4. **Propagação Segmentada para o Contas a Pagar:**
   * Cada título em `accounts_payable` recebe seu respectivo `boletoUrl`, `digitableLine`, `barcode` e identificador de parcela (ex: `1/3`, `2/3`, `3/3`).

---

## Fase 3: Automação Bancária & Arquivos de Remessa CNAB / APIs Bancárias

### 1. Contexto e Necessidade
Eliminar o trabalho manual de copiar/colar a linha digitável no Internet Banking para dezenas de títulos diários. Permitir que o operador financeiro gere um arquivo de lote para importação direta no banco da clínica ou envie os pagamentos via API.

### 2. Especificação do Arquivo CNAB 240 (Padrão FEBRABAN)
O formato **CNAB 240** (Centro Nacional de Automação Bancária) é o padrão oficial aceito por todos os grandes bancos brasileiros (Itaú, Bradesco, Banco do Brasil, Santander, Caixa, Cora, Inter, etc.) para a modalidade **Pagamento a Fornecedores**.

#### Estrutura do Arquivo de Remessa (.REM):
1. **Header de Arquivo (Registro Tipo 0):**
   * Código do banco de compensação (ex: `341` para Itaú, `237` para Bradesco).
   * CNPJ e Razão Social da clínica (Unidade Betim ou Unidade Taguatinga).
   * Código do convênio bancário / agência e conta corrente.
   * Data e hora de geração do arquivo e número sequencial do arquivo (NSA).
2. **Header de Lote (Registro Tipo 1):**
   * Tipo de serviço: `20` (Pagamento Fornecedor).
   * Forma de lançamento: `11` (Pagamento de Títulos / Boletos de Outros Bancos) ou `30` (Boletos do Próprio Banco).
3. **Detalhes do Lote - Segmento J (Registro Tipo 3):**
   * **Posição 018 a 061 (44 dígitos):** Código de barras do boleto (convertido a partir da linha digitável de 47 dígitos).
   * **Posição 062 a 091:** Nome do fornecedor / beneficiário favorecido.
   * **Posição 092 a 099:** Data de vencimento do boleto (`DDMMAAAA`).
   * **Posição 100 a 114 (15 posições, 2 decimais):** Valor nominal do documento.
   * **Posição 145 a 152:** Data agendada para o pagamento (`DDMMAAAA`).
   * **Posição 153 a 167:** Valor real a ser pago (com acréscimos ou descontos).
   * **Posição 183 a 202:** Nosso Número / Seu Número (Identificador da Despesa no NexaCLINIC para conciliação reversa).
4. **Detalhes do Lote - Segmento J-52 (Registro Complementar obrigatório por regulação do Banco Central):**
   * Chave PIX ou CNPJ do pagador (Clínica) e CNPJ/CPF do beneficiário final (Fornecedor).
5. **Trailer de Lote e Trailer de Arquivo (Registros Tipo 5 e 9):**
   * Totalização da quantidade de registros e soma dos valores dos pagamentos para validação de integridade.

### 3. Fluxo de Leitura do Arquivo de Retorno (.RET)
1. O financeiro faz o download do arquivo de retorno no Internet Banking após o processamento da remessa pelo banco.
2. O NexaCLINIC lê o arquivo de retorno, localiza cada título pelo identificador (`Seu Número` / ID da despesa) e:
   * **Se liquidado:** Atualiza o status automaticamente para `Pago`, preenche a data do pagamento, o valor efetivamente debitado e anexa a confirmação da transação.
   * **Se rejeitado (ex: código de barras inválido, saldo insuficiente):** Altera o status para `Rejeitado Bancário` com a descrição do código de ocorrência da FEBRABAN para ação rápida do financeiro.

### 4. Integração Direta via API Bancária (BaaS / Open Finance)
Para bancos digitais e modernos (ex: Inter PJ, Cora, Asaas, Itaú PJ Empresas via API):
* Criação de Webhooks e chamadas REST autorizadas por certificado mTLS / OAuth2.
* Agendamento do pagamento com 1 clique direto na tela do Contas a Pagar sem necessidade de download/upload de arquivos `.rem`/`.ret`.

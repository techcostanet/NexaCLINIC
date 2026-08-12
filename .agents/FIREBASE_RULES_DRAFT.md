# REGRAS DO PROJETO - INFRAESTRUTURA EM NUVEM (RASCUNHO)

Este projeto usa EXCLUSIVAMENTE Firebase + Firestore como backend na nuvem.

## Diretrizes Gerais
- **Backend:** Firebase Firestore (Cloud) — SEM EXCEÇÕES
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage
- **Hosting:** Firebase Hosting
- **PROIBIDO:** localStorage, sessionStorage, IndexedDB, SQLite, ou arquivos JSON/locais para persistência de dados.
- Toda operação CRUD deve usar obrigatoriamente as coleções do Firestore.
- NUNCA crie soluções com armazenamento local ou mockado.
- Sempre importe e use os SDKs oficiais do Firebase.

## Estrutura Principal de Coleções
- **Clínica / Pacientes:** `patients`, `prescriptions`, `sessions_logs`, `clinical_notes`, `checkins`
- **Estoque & Materiais:** `inventory_items`, `stock_transactions`, `suppliers`, `stock_sectors`, `product_categories`, `stock_loans`, `material_requisitions`, `stock_locations`, `inventories`, `stock_transfers`
- **Manutenção:** `equipments`, `service_orders`
- **Sistema & Auditoria:** `audit_logs`, `sectors`, `uploads_history`

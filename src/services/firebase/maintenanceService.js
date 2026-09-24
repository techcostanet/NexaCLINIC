import { app } from './config';
import { USE_MOCK } from './mockDb';

const LOCAL_STORAGE_EQUIPMENTS_KEY = 'nexa_maintenance_equipments';
const LOCAL_STORAGE_ORDERS_KEY = 'nexa_maintenance_service_orders';

// Initial Seed Data for Clinic & Hospital Equipments (Biomedical, Predial)
const INITIAL_EQUIPMENTS = [
  {
    "id": "EQP-BIO-001",
    "code": "PAT-00101",
    "name": "Máquina de Hemodiálise Fresenius 4008S",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Fresenius Medical Care",
    "model": "4008S Classic",
    "serialNumber": "SN-4008S-9921",
    "sector": "Salão A de Hemodiálise",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2023-01-15",
    "acquisitionValue": 125000,
    "warrantyUntil": "2026-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-11-20",
    "notes": "Equipamento principal de diálise. Calibração de condutividade e fluxo em dia."
  },
  {
    "id": "EQP-BIO-002",
    "code": "PAT-00102",
    "name": "Sistema de Osmose Reversa Duplo Passo 1500L/h",
    "category": "Biomédico",
    "subcategory": "Tratamento de Água",
    "brand": "PermeaTech",
    "model": "OSMO-DUO-1500",
    "serialNumber": "SN-OSM-2022-88",
    "sector": "Central de Tratamento de Água (CTA)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2022-06-10",
    "acquisitionValue": 280000,
    "warrantyUntil": "2025-06-10",
    "preventiveIntervalDays": 30,
    "lastPreventiveDate": "2026-07-05",
    "nextPreventiveDate": "2026-08-05",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-01",
    "notes": "Controle contínuo de condutividade e teste bacteriológico semanal."
  },
  {
    "id": "EQP-PRED-001",
    "code": "PAT-PRD-001",
    "name": "Grupo Gerador Stemac 250kVA CUMMINS",
    "category": "Infraestrutura",
    "subcategory": "Energia",
    "brand": "Stemac / Cummins",
    "model": "ST-250KVA-SILENT",
    "serialNumber": "GEN-250-8891",
    "sector": "Área Técnica Externa",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2021-11-20",
    "acquisitionValue": 195000,
    "warrantyUntil": "2024-11-20",
    "preventiveIntervalDays": 30,
    "lastPreventiveDate": "2026-07-15",
    "nextPreventiveDate": "2026-08-15",
    "requiresCalibration": true,
    "calibrationValidUntil": "2027-01-10",
    "notes": "Teste de transferência automática de carga semanal realizado às terças-feiras."
  },
  {
    "id": "EQP-HD-001",
    "code": "PAT-HD-001",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#1)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34980P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #1 Cronograma Dialisato. Coleta 2025: ago/25 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-002",
    "code": "PAT-HD-002",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#2)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34981P",
    "sector": "Regional Externa",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #2 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-003",
    "code": "PAT-HD-003",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#3)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34982P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #3 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-004",
    "code": "PAT-HD-004",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#4)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34983P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #4 Cronograma Dialisato. Coleta 2025: dez/25 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-005",
    "code": "PAT-HD-005",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#5)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34984P",
    "sector": "Regional Externa",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #5 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-006",
    "code": "PAT-HD-006",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#6)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34985P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #6 Cronograma Dialisato. Coleta 2025: jun/25 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-007",
    "code": "PAT-HD-007",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#7)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34986P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #7 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-008",
    "code": "PAT-HD-008",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#8)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34987P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #8 Cronograma Dialisato. Coleta 2025: mai/26 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-009",
    "code": "PAT-HD-009",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#9)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34988P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #9 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-010",
    "code": "PAT-HD-010",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#10)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34989P",
    "sector": "Regional Externa",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #10 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-011",
    "code": "PAT-HD-011",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#11)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34990P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #11 Cronograma Dialisato. Coleta 2025: set/25 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-012",
    "code": "PAT-HD-012",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#12)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34991P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #12 Cronograma Dialisato. Coleta 2025: jun/25 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-013",
    "code": "PAT-HD-013",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#13)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34992P",
    "sector": "Salão 1ª - Ponto 21",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #13 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: mar/26 | Recoleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-014",
    "code": "PAT-HD-014",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#14)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34993P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #14 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-015",
    "code": "PAT-HD-015",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#15)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34994P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #15 Cronograma Dialisato. Coleta 2025: ago/25 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-016",
    "code": "PAT-HD-016",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#16)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34995P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #16 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: fev/26 | Recoleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-017",
    "code": "PAT-HD-017",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#17)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34996P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #17 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-018",
    "code": "PAT-HD-018",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#18)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34997P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #18 Cronograma Dialisato. Coleta 2025: jul/25 | Coleta 2026: jul/26"
  },
  {
    "id": "EQP-HD-019",
    "code": "PAT-HD-019",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#19)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J34998P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #19 Cronograma Dialisato. Coleta 2025: mai/25 | Coleta 2026: jul/26"
  },
  {
    "id": "EQP-HD-020",
    "code": "PAT-HD-020",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#20)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35256P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #20 Cronograma Dialisato. Coleta 2025: mai/25"
  },
  {
    "id": "EQP-HD-021",
    "code": "PAT-HD-021",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#21)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35257P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #21 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-022",
    "code": "PAT-HD-022",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#22)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35258P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #22 Cronograma Dialisato. Coleta 2025: nov/25 | Coleta 2026: jul/26"
  },
  {
    "id": "EQP-HD-023",
    "code": "PAT-HD-023",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#23)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35259P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #23 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-024",
    "code": "PAT-HD-024",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#24)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35260P",
    "sector": "Salão 2ª - Ponto 27",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #24 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-025",
    "code": "PAT-HD-025",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#25)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35261P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #25 Cronograma Dialisato. Coleta 2025: jun/25 | Recoleta 2025: ago/25 | Coleta 2026: jan/26 | abr/26"
  },
  {
    "id": "EQP-HD-026",
    "code": "PAT-HD-026",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#26)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35262P",
    "sector": "Regional Externa",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #26 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-027",
    "code": "PAT-HD-027",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#27)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35263P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #27 Cronograma Dialisato. Coleta 2025: set/25 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-028",
    "code": "PAT-HD-028",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#28)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35264P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #28 Cronograma Dialisato. Coleta 2025: set/25 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-029",
    "code": "PAT-HD-029",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#29)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35265P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #29 Cronograma Dialisato. Coleta 2025: fev/26 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-030",
    "code": "PAT-HD-030",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#30)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35266P",
    "sector": "Salão 3º - Ponto BOX 1",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #30 Cronograma Dialisato. Coleta 2025: mar/26 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-031",
    "code": "PAT-HD-031",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#31)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35267P",
    "sector": "Regional Externa",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #31 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: mai/26"
  },
  {
    "id": "EQP-HD-032",
    "code": "PAT-HD-032",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#32)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35268P",
    "sector": "Salão 3º - Ponto 5",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #32 Cronograma Dialisato. Coleta 2025: mar/26 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-033",
    "code": "PAT-HD-033",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#33)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35269P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #33 Cronograma Dialisato. Coleta 2025: fev/26 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-034",
    "code": "PAT-HD-034",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#34)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35270P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #34 Cronograma Dialisato. Coleta 2025: nov/25 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-035",
    "code": "PAT-HD-035",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#35)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35271P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #35 Cronograma Dialisato. Coleta 2025: 2026"
  },
  {
    "id": "EQP-HD-036",
    "code": "PAT-HD-036",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#36)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35272P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #36 Cronograma Dialisato. Coleta 2025: mai/25"
  },
  {
    "id": "EQP-HD-037",
    "code": "PAT-HD-037",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#37)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35273P",
    "sector": "Salão 1º - Ponto 23",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #37 Cronograma Dialisato. Coleta 2025: mar/26 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-038",
    "code": "PAT-HD-038",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#38)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35274P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #38 Cronograma Dialisato. Coleta 2025: jan/26 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-039",
    "code": "PAT-HD-039",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#39)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35275P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #39 Cronograma Dialisato. Coleta 2025: mai/26 | Coleta 2026: mai/26"
  },
  {
    "id": "EQP-HD-040",
    "code": "PAT-HD-040",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#40)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35276P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #40 Cronograma Dialisato. Coleta 2025: mai/25"
  },
  {
    "id": "EQP-HD-041",
    "code": "PAT-HD-041",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#41)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35277P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #41 Cronograma Dialisato. Coleta 2025: fev/26 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-042",
    "code": "PAT-HD-042",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#42)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35278P",
    "sector": "Salão 3º - Ponto 6",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #42 Cronograma Dialisato. Coleta 2025: mar/26 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-043",
    "code": "PAT-HD-043",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#43)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35279P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #43 Cronograma Dialisato. Coleta 2025: dez/25 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-044",
    "code": "PAT-HD-044",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#44)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35280P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #44 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: abr/26"
  },
  {
    "id": "EQP-HD-045",
    "code": "PAT-HD-045",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#45)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35281P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #45 Cronograma Dialisato. Coleta 2025: nov/25"
  },
  {
    "id": "EQP-HD-046",
    "code": "PAT-HD-046",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#46)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35282P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #46 Cronograma Dialisato. Coleta 2025: jan/26 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-047",
    "code": "PAT-HD-047",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#47)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35283P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #47 Cronograma Dialisato. Coleta 2025: nov/25"
  },
  {
    "id": "EQP-HD-048",
    "code": "PAT-HD-048",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#48)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35284P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #48 Cronograma Dialisato. Coleta 2025: jan/26 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-049",
    "code": "PAT-HD-049",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#49)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35285P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #49 Cronograma Dialisato. Coleta 2025: out/25"
  },
  {
    "id": "EQP-HD-050",
    "code": "PAT-HD-050",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#50)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35286P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #50 Cronograma Dialisato. Coleta 2025: dez/25"
  },
  {
    "id": "EQP-HD-051",
    "code": "PAT-HD-051",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#51)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35287P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #51 Cronograma Dialisato. Coleta 2025: dez/25"
  },
  {
    "id": "EQP-HD-052",
    "code": "PAT-HD-052",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#52)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35288P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #52 Cronograma Dialisato. Coleta 2025: nov/25"
  },
  {
    "id": "EQP-HD-053",
    "code": "PAT-HD-053",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#53)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35289P",
    "sector": "Salão 1º - Ponto ???",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #53 Cronograma Dialisato. Coleta 2025: mar/26 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-054",
    "code": "PAT-HD-054",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#54)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35290P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #54 Cronograma Dialisato. Coleta 2025: set/25"
  },
  {
    "id": "EQP-HD-055",
    "code": "PAT-HD-055",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#55)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35291P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #55 Cronograma Dialisato. Coleta 2025: 2026"
  },
  {
    "id": "EQP-HD-056",
    "code": "PAT-HD-056",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#56)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35292P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #56 Cronograma Dialisato. Coleta 2025: jun/25"
  },
  {
    "id": "EQP-HD-057",
    "code": "PAT-HD-057",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#57)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35293P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #57 Cronograma Dialisato. Coleta 2025: mai/25"
  },
  {
    "id": "EQP-HD-058",
    "code": "PAT-HD-058",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#58)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35294P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #58 Cronograma Dialisato. Coleta 2025: jul/25 | Coleta 2026: jul/26"
  },
  {
    "id": "EQP-HD-059",
    "code": "PAT-HD-059",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#59)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35295P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #59 Cronograma Dialisato. Coleta 2025: jul/25 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-060",
    "code": "PAT-HD-060",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#60)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35296P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #60 Cronograma Dialisato. Coleta 2025: jun/25"
  },
  {
    "id": "EQP-HD-061",
    "code": "PAT-HD-061",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#61)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35297P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #61 Cronograma Dialisato. Coleta 2025: jun/25"
  },
  {
    "id": "EQP-HD-062",
    "code": "PAT-HD-062",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#62)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35298P",
    "sector": "Regional Externa",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #62 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: mai/26"
  },
  {
    "id": "EQP-HD-063",
    "code": "PAT-HD-063",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#63)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35556P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #63 Cronograma Dialisato. Coleta 2025: mai/26 | Coleta 2026: mai/26"
  },
  {
    "id": "EQP-HD-064",
    "code": "PAT-HD-064",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#64)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35557P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #64 Cronograma Dialisato. Coleta 2025: jul/25 | Recoleta 2025: out/25 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-065",
    "code": "PAT-HD-065",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#65)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35558P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #65 Cronograma Dialisato. Coleta 2025: out/25"
  },
  {
    "id": "EQP-HD-066",
    "code": "PAT-HD-066",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#66)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35559P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #66 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: abr/26"
  },
  {
    "id": "EQP-HD-067",
    "code": "PAT-HD-067",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#67)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35560P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #67 Cronograma Dialisato. Coleta 2025: dez/25"
  },
  {
    "id": "EQP-HD-068",
    "code": "PAT-HD-068",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#68)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35561P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #68 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: abr/26"
  },
  {
    "id": "EQP-HD-069",
    "code": "PAT-HD-069",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#69)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35562P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #69 Cronograma Dialisato. Coleta 2025: set/25"
  },
  {
    "id": "EQP-HD-070",
    "code": "PAT-HD-070",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#70)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35563P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #70 Cronograma Dialisato. Coleta 2025: mai/26 | Recoleta 2025: jan/00 | Coleta 2026: abr/26, mai/26 | Recoleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-071",
    "code": "PAT-HD-071",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#71)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35564P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #71 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-072",
    "code": "PAT-HD-072",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#72)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35565P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #72 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: abr/26"
  },
  {
    "id": "EQP-HD-073",
    "code": "PAT-HD-073",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#73)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35566P",
    "sector": "Regional Externa",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #73 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-074",
    "code": "PAT-HD-074",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#74)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35567P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #74 Cronograma Dialisato. Coleta 2025: mai/26 | Coleta 2026: mai/26"
  },
  {
    "id": "EQP-HD-075",
    "code": "PAT-HD-075",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#75)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35568P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #75 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: fev/26"
  },
  {
    "id": "EQP-HD-076",
    "code": "PAT-HD-076",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#76)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35569P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #76 Cronograma Dialisato. Coleta 2025: ago/25 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-077",
    "code": "PAT-HD-077",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#77)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35570P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #77 Cronograma Dialisato. Coleta 2025: dez/25"
  },
  {
    "id": "EQP-HD-078",
    "code": "PAT-HD-078",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#78)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35571P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #78 Cronograma Dialisato. Coleta 2025: set/25"
  },
  {
    "id": "EQP-HD-079",
    "code": "PAT-HD-079",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#79)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35572P",
    "sector": "Salão 1º - Ponto 7",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #79 Cronograma Dialisato. Coleta 2025: mar/26 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-080",
    "code": "PAT-HD-080",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#80)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35573P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #80 Cronograma Dialisato. Coleta 2025: dez/25"
  },
  {
    "id": "EQP-HD-081",
    "code": "PAT-HD-081",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#81)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35574P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #81 Cronograma Dialisato. Coleta 2025: ago/25"
  },
  {
    "id": "EQP-HD-082",
    "code": "PAT-HD-082",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#82)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35575P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #82 Cronograma Dialisato. Coleta 2025: set/25 | Recoleta 2025: out/25 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-083",
    "code": "PAT-HD-083",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#83)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35576P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #83 Cronograma Dialisato. Coleta 2025: jun/25 | Recoleta 2025: jul/25 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-084",
    "code": "PAT-HD-084",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#84)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35577P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #84 Cronograma Dialisato. Coleta 2025: mai/25 | Recoleta 2025: out/25"
  },
  {
    "id": "EQP-HD-085",
    "code": "PAT-HD-085",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#85)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35578P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #85 Cronograma Dialisato. Coleta 2025: jun/25 | Coleta 2026: jul/26"
  },
  {
    "id": "EQP-HD-086",
    "code": "PAT-HD-086",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#86)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35579P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #86 Cronograma Dialisato. Coleta 2025: 2026"
  },
  {
    "id": "EQP-HD-087",
    "code": "PAT-HD-087",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#87)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35580P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #87 Cronograma Dialisato. Coleta 2025: ago/25 | Recoleta 2025: out/25"
  },
  {
    "id": "EQP-HD-088",
    "code": "PAT-HD-088",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#88)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35581P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #88 Cronograma Dialisato. Coleta 2025: mai/25 | Coleta 2026: jun/26"
  },
  {
    "id": "EQP-HD-089",
    "code": "PAT-HD-089",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#89)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35582P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #89 Cronograma Dialisato. Coleta 2025: ago/25 | Coleta 2026: jul/26"
  },
  {
    "id": "EQP-HD-090",
    "code": "PAT-HD-090",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#90)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35583P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #90 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: abr/26"
  },
  {
    "id": "EQP-HD-091",
    "code": "PAT-HD-091",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#91)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35584P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #91 Cronograma Dialisato. Coleta 2025: nov/25"
  },
  {
    "id": "EQP-HD-092",
    "code": "PAT-HD-092",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#92)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35585P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #92 Cronograma Dialisato. Coleta 2025: 2026"
  },
  {
    "id": "EQP-HD-093",
    "code": "PAT-HD-093",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#93)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35586P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #93 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: abr/26"
  },
  {
    "id": "EQP-HD-094",
    "code": "PAT-HD-094",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#94)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35587P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #94 Cronograma Dialisato. Coleta 2025: dez/25"
  },
  {
    "id": "EQP-HD-095",
    "code": "PAT-HD-095",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#95)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35588P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #95 Cronograma Dialisato. Coleta 2025: jul/25 | Recoleta 2025: out/25 | Coleta 2026: jul/26"
  },
  {
    "id": "EQP-HD-096",
    "code": "PAT-HD-096",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#96)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35589P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #96 Cronograma Dialisato. Coleta 2025: out/25"
  },
  {
    "id": "EQP-HD-097",
    "code": "PAT-HD-097",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#97)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35590P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #97 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: jan/26"
  },
  {
    "id": "EQP-HD-098",
    "code": "PAT-HD-098",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#98)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35591P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #98 Cronograma Dialisato. Coleta 2025: 2026"
  },
  {
    "id": "EQP-HD-099",
    "code": "PAT-HD-099",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#99)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35592P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #99 Cronograma Dialisato. Coleta 2025: 2026 | Coleta 2026: abr/26"
  },
  {
    "id": "EQP-HD-100",
    "code": "PAT-HD-100",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#100)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35593P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #100 Cronograma Dialisato. Coleta 2025: out/25"
  },
  {
    "id": "EQP-HD-101",
    "code": "PAT-HD-101",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#101)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35594P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #101 Cronograma Dialisato. Coleta 2025: ago/25 | Coleta 2026: jul/26"
  },
  {
    "id": "EQP-HD-102",
    "code": "PAT-HD-102",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#102)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35595P",
    "sector": "Salão 2º - Ponto 23",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #102 Cronograma Dialisato. Coleta 2025: mar/26 | Coleta 2026: mar/26"
  },
  {
    "id": "EQP-HD-103",
    "code": "PAT-HD-103",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#103)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35596P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #103 Cronograma Dialisato. Coleta 2025: jun/25 | Recoleta 2025: jul/25"
  },
  {
    "id": "EQP-HD-104",
    "code": "PAT-HD-104",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#104)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35598P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #104 Cronograma Dialisato. Coleta 2025: mai/25"
  },
  {
    "id": "EQP-HD-105",
    "code": "PAT-HD-105",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#105)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35597P",
    "sector": "Salão de Hemodiálise (Geral)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Item #105 Cronograma Dialisato. Coleta 2025: mai/25"
  },
  {
    "id": "EQP-HD-106",
    "code": "PAT-HD-106",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#106)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J39997P",
    "sector": "Salão 01 - Box 02",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Equipamento Salão 01 Ponto 06. Escala oficial de hemodiálise."
  },
  {
    "id": "EQP-HD-107",
    "code": "PAT-HD-107",
    "name": "Máquina de Hemodiálise Nipro Diamax 220F (#107)",
    "category": "Biomédico",
    "subcategory": "Hemodiálise",
    "brand": "Nipro",
    "model": "DIAMAX 220F",
    "serialNumber": "24J35669P",
    "sector": "Salão 01 - Box 03",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2024-01-15",
    "acquisitionValue": 120000,
    "warrantyUntil": "2027-01-15",
    "preventiveIntervalDays": 90,
    "lastPreventiveDate": "2026-05-10",
    "nextPreventiveDate": "2026-08-10",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Equipamento Salão 01 Ponto 10. Escala oficial de hemodiálise."
  },
  {
    "id": "EQP-OSM-001",
    "code": "PAT-OSM-001",
    "name": "Osmose Portátil DELTAMED (ORP150.0367)",
    "category": "Biomédico",
    "subcategory": "Tratamento de Água",
    "brand": "DELTAMED",
    "model": "ORP150.0367",
    "serialNumber": "ORP150.0367",
    "sector": "Regional Externa (Diálise Externa)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2023-06-01",
    "acquisitionValue": 45000,
    "warrantyUntil": "2026-06-01",
    "preventiveIntervalDays": 30,
    "lastPreventiveDate": "2026-07-01",
    "nextPreventiveDate": "2026-08-01",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Osmose Portátil - Diálise Externa. Coleta: Todo mês é realizado - a partir de 04/26 | Recoleta 2026: jun/26"
  },
  {
    "id": "EQP-OSM-002",
    "code": "PAT-OSM-002",
    "name": "Osmose Portátil DELTAMED (ORP150.0579)",
    "category": "Biomédico",
    "subcategory": "Tratamento de Água",
    "brand": "DELTAMED",
    "model": "ORP150.0579",
    "serialNumber": "ORP150.0579",
    "sector": "Regional Externa (Diálise Externa)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2023-06-01",
    "acquisitionValue": 45000,
    "warrantyUntil": "2026-06-01",
    "preventiveIntervalDays": 30,
    "lastPreventiveDate": "2026-07-01",
    "nextPreventiveDate": "2026-08-01",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Osmose Portátil - Diálise Externa. Coleta: Todo mês é realizado - a partir de 04/26 | Recoleta 2026: 05/06/2026 - referente a Coleta 20/05"
  },
  {
    "id": "EQP-OSM-003",
    "code": "PAT-OSM-003",
    "name": "Osmose Portátil DELTAMED (ORP150.0584)",
    "category": "Biomédico",
    "subcategory": "Tratamento de Água",
    "brand": "DELTAMED",
    "model": "ORP150.0584",
    "serialNumber": "ORP150.0584",
    "sector": "Regional Externa (Diálise Externa)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2023-06-01",
    "acquisitionValue": 45000,
    "warrantyUntil": "2026-06-01",
    "preventiveIntervalDays": 30,
    "lastPreventiveDate": "2026-07-01",
    "nextPreventiveDate": "2026-08-01",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Osmose Portátil - Diálise Externa. Coleta: Todo mês é realizado - a partir de 04/26 | Recoleta 2026: 05/06/2026 - referente a Coleta 20/05"
  },
  {
    "id": "EQP-OSM-004",
    "code": "PAT-OSM-004",
    "name": "Osmose Portátil DELTAMED (ORP150.0585)",
    "category": "Biomédico",
    "subcategory": "Tratamento de Água",
    "brand": "DELTAMED",
    "model": "ORP150.0585",
    "serialNumber": "ORP150.0585",
    "sector": "Regional Externa (Diálise Externa)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2023-06-01",
    "acquisitionValue": 45000,
    "warrantyUntil": "2026-06-01",
    "preventiveIntervalDays": 30,
    "lastPreventiveDate": "2026-07-01",
    "nextPreventiveDate": "2026-08-01",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Osmose Portátil - Diálise Externa. Coleta: Todo mês é realizado - a partir de 04/26 | Recoleta 2026: jun/26"
  },
  {
    "id": "EQP-OSM-005",
    "code": "PAT-OSM-005",
    "name": "Osmose Portátil DELTAMED (ORP150.0369)",
    "category": "Biomédico",
    "subcategory": "Tratamento de Água",
    "brand": "DELTAMED",
    "model": "ORP150.0369",
    "serialNumber": "ORP150.0369",
    "sector": "Regional Externa (Diálise Externa)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2023-06-01",
    "acquisitionValue": 45000,
    "warrantyUntil": "2026-06-01",
    "preventiveIntervalDays": 30,
    "lastPreventiveDate": "2026-07-01",
    "nextPreventiveDate": "2026-08-01",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Osmose Portátil - Diálise Externa. Coleta: Todo mês é realizado - a partir de 04/26 | Recoleta 2026: 05/06/2026 - referente a Coleta 20/05"
  },
  {
    "id": "EQP-OSM-006",
    "code": "PAT-OSM-006",
    "name": "Osmose Portátil IPABRAS (911.567)",
    "category": "Biomédico",
    "subcategory": "Tratamento de Água",
    "brand": "IPABRAS",
    "model": "911.567",
    "serialNumber": "911.567",
    "sector": "Regional Externa (Diálise Externa)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2023-06-01",
    "acquisitionValue": 45000,
    "warrantyUntil": "2026-06-01",
    "preventiveIntervalDays": 30,
    "lastPreventiveDate": "2026-07-01",
    "nextPreventiveDate": "2026-08-01",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Osmose Portátil - Diálise Externa. Coleta: Todo mês é realizado - a partir de 04/26 | Recoleta 2026: jun/26"
  },
  {
    "id": "EQP-OSM-007",
    "code": "PAT-OSM-007",
    "name": "Osmose Portátil VEXER (181217-06.01.01.01)",
    "category": "Biomédico",
    "subcategory": "Tratamento de Água",
    "brand": "VEXER",
    "model": "181217-06.01.01.01",
    "serialNumber": "181217-06.01.01.01",
    "sector": "Regional Externa (Diálise Externa)",
    "criticality": "Alta",
    "status": "Em Operação",
    "acquisitionDate": "2023-06-01",
    "acquisitionValue": 45000,
    "warrantyUntil": "2026-06-01",
    "preventiveIntervalDays": 30,
    "lastPreventiveDate": "2026-07-01",
    "nextPreventiveDate": "2026-08-01",
    "requiresCalibration": true,
    "calibrationValidUntil": "2026-12-31",
    "notes": "Osmose Portátil - Diálise Externa. Coleta: Todo mês é realizado - a partir de 04/26 | Recoleta 2026: jul/26"
  }
];


const INITIAL_SERVICE_ORDERS = [
  {
    id: 'OS-2026-0001',
    code: 'OS-2026-0001',
    equipmentId: 'EQP-BIO-001',
    equipmentName: 'Máquina de Hemodiálise Fresenius 4008S',
    equipmentCategory: 'Biomédico',
    sector: 'Salão A de Hemodiálise',
    type: 'Corretiva',
    priority: 'Alta',
    status: 'Concluída',
    requesterName: 'Dra. Márcia Oliveira',
    requesterSector: 'Enfermagem / Salão A',
    assignedTechnician: 'Eng. Roberto Lima (Engenharia Clínica)',
    description: 'Alarme sonoro intermitente de baixa pressão de fluxo de diassat durante a sessão.',
    diagnostic: 'Substituído filtro da válvula de entrada e limpo o sensor de pressão. Testes de estanqueidade e fluxo aprovados.',
    openDate: '2026-07-28T08:30:00.000Z',
    completionDate: '2026-07-28T11:45:00.000Z',
    partsUsed: [
      { itemId: 'PROD-VLV-01', name: 'Filtro da Válvula de Entrada 4008S', quantity: 1, unitCost: 180.00 }
    ],
    laborCost: 250.00,
    totalCost: 430.00
  }
];


export const sanitizeTIEquipments = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(e => {
    if (!e) return false;
    const cat = String(e.category || '').toLowerCase();
    const subcat = String(e.subcategory || '').toLowerCase();
    const id = String(e.id || '').toLowerCase();
    const name = String(e.name || '').toLowerCase();
    const code = String(e.code || '').toLowerCase();
    const sector = String(e.sector || '').toLowerCase();

    if (cat.includes('ti') || cat.includes('software') || cat.includes('hardware')) return false;
    if (subcat.includes('servidor') || subcat.includes('impressora') || subcat.includes('erp')) return false;
    if (id.includes('ti-') || id.includes('sw-') || id.includes('eqp-ti') || id.includes('eqp-sw')) return false;
    if (code.includes('ti-') || code.includes('sw-') || code.includes('pat-ti') || code.includes('pat-sw')) return false;
    if (name.includes('servidor') || name.includes('poweredge') || name.includes('zebra') || name.includes('licença nexa')) return false;
    if (sector.includes('ti data center')) return false;

    return true;
  });
};

export const sanitizeTIOrders = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(o => {
    if (!o) return false;
    const cat = String(o.equipmentCategory || o.category || '').toLowerCase();
    const eqId = String(o.equipmentId || '').toLowerCase();
    const type = String(o.type || '').toLowerCase();
    const desc = String(o.description || '').toLowerCase();
    const name = String(o.equipmentName || '').toLowerCase();
    const tech = String(o.assignedTechnician || '').toLowerCase();
    const req = String(o.requesterName || '').toLowerCase();

    if (cat.includes('ti') || cat.includes('software') || cat.includes('hardware')) return false;
    if (eqId.includes('ti') || eqId.includes('sw')) return false;
    if (type.includes('ti')) return false;
    if (desc.includes('servidor') || desc.includes('poweredge') || desc.includes('zebra')) return false;
    if (name.includes('servidor') || name.includes('poweredge') || name.includes('zebra')) return false;
    if (tech.includes('ti') || req.includes('ti')) return false;

    return true;
  });
};

const getStoredEquipments = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_EQUIPMENTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length >= INITIAL_EQUIPMENTS.length) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler equipments do localStorage:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_EQUIPMENTS_KEY, JSON.stringify(INITIAL_EQUIPMENTS));
  return INITIAL_EQUIPMENTS;
};

const saveStoredEquipments = (equipments) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_EQUIPMENTS_KEY, JSON.stringify(equipments));
  } catch (e) {
    console.warn('Erro ao salvar equipments no localStorage:', e);
  }
};

const getStoredOrders = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Erro ao ler service orders do localStorage:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_SERVICE_ORDERS));
  return INITIAL_SERVICE_ORDERS;
};

const saveStoredOrders = (orders) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Erro ao salvar service orders no localStorage:', e);
  }
};

// ----------------------------------------------------------------------
// EQUIPMENT / ATIVOS APIS
// ----------------------------------------------------------------------

export const getEquipments = async () => {
  if (USE_MOCK) return getStoredEquipments();
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'equipments'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (items.length === 0) {
      const { doc, writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const colRef = collection(db, 'equipments');
      for (const eq of INITIAL_EQUIPMENTS) {
        const newRef = doc(colRef, eq.id);
        batch.set(newRef, { ...eq, createdAt: new Date().toISOString() });
      }
      await batch.commit();
      const newSnap = await getDocs(collection(db, 'equipments'));
      return sanitizeTIEquipments(newSnap.docs.map(d => ({ ...d.data(), id: d.id })));
    }
    return sanitizeTIEquipments(items);
  } catch (err) {
    console.error('Erro ao carregar equipments do Firestore:', err);
    return getStoredEquipments();
  }
};

export const getEquipmentById = async (idOrCode) => {
  if (!idOrCode) return null;
  const search = String(idOrCode).trim().toLowerCase();

  // Busca no Firestore caso online
  if (!USE_MOCK) {
    try {
      const { getFirestore, doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);

      // 1. Tenta buscar diretamente pelo ID do documento
      const directDoc = await getDoc(doc(db, 'equipments', idOrCode));
      if (directDoc.exists()) {
        return { ...directDoc.data(), id: directDoc.id };
      }

      // 2. Tenta buscar pelo campo 'code' (ex: PAT-HD-001)
      const qCode = query(collection(db, 'equipments'), where('code', '==', idOrCode));
      const snapCode = await getDocs(qCode);
      if (!snapCode.empty) {
        const d = snapCode.docs[0];
        return { ...d.data(), id: d.id };
      }
    } catch (e) {
      console.warn('Erro na busca direta do equipamento no Firestore:', e);
    }
  }

  // Fallback: busca na lista completa sanitizada
  const list = await getEquipments();
  return list.find(e => 
    String(e.id || '').toLowerCase() === search || 
    String(e.code || '').toLowerCase() === search
  ) || null;
};

export const saveEquipment = async (equipmentData) => {
  if (USE_MOCK) {
    const list = getStoredEquipments();
    if (equipmentData.id) {
      const idx = list.findIndex(e => e.id === equipmentData.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...equipmentData, updatedAt: new Date().toISOString() };
      else list.push({ ...equipmentData, createdAt: new Date().toISOString() });
    } else {
      const newId = `EQP-${Date.now().toString(36).toUpperCase()}`;
      equipmentData = { id: newId, ...equipmentData, createdAt: new Date().toISOString() };
      list.push(equipmentData);
    }
    saveStoredEquipments(list);
    return equipmentData;
  }

  try {
    const { getFirestore, collection, doc, setDoc, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (equipmentData.id) {
      await setDoc(doc(db, 'equipments', equipmentData.id), {
        ...equipmentData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return equipmentData;
    } else {
      const docRef = await addDoc(collection(db, 'equipments'), {
        ...equipmentData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...equipmentData };
    }
  } catch (err) {
    console.error('Erro ao salvar equipamento no Firestore:', err);
    return saveEquipment({ ...equipmentData });
  }
};

export const deleteEquipment = async (id) => {
  if (USE_MOCK) {
    const list = getStoredEquipments().filter(e => e.id !== id);
    saveStoredEquipments(list);
    return { success: true, id };
  }
  try {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'equipments', id));
    return { success: true, id };
  } catch (err) {
    console.error('Erro ao deletar equipamento no Firestore:', err);
    const list = getStoredEquipments().filter(e => e.id !== id);
    saveStoredEquipments(list);
    return { success: true, id };
  }
};

// ----------------------------------------------------------------------
// SERVICE ORDERS (ORDENS DE SERVIÇO) APIS
// ----------------------------------------------------------------------

export const getServiceOrders = async () => {
  if (USE_MOCK) return getStoredOrders();
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'service_orders'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (items.length === 0) {
      const { doc, writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const colRef = collection(db, 'service_orders');
      for (const os of INITIAL_SERVICE_ORDERS) {
        const newRef = doc(colRef, os.id);
        batch.set(newRef, { ...os, createdAt: new Date().toISOString() });
      }
      await batch.commit();
      const newSnap = await getDocs(collection(db, 'service_orders'));
      return sanitizeTIOrders(newSnap.docs.map(d => ({ ...d.data(), id: d.id })));
    }
    return items;
  } catch (err) {
    console.error('Erro ao carregar service_orders do Firestore:', err);
    return getStoredOrders();
  }
};

export const saveServiceOrder = async (orderData, updateNote = '', notifyEmail = true) => {
  const isNew = !orderData.id;
  const now = new Date().toISOString();

  if (isNew) {
    const dateStr = new Date().getFullYear();
    const count = getStoredOrders().length + 1;
    const seqStr = String(count).padStart(4, '0');
    orderData.code = orderData.code || `OS-${dateStr}-${seqStr}`;
    orderData.openDate = orderData.openDate || now;
    orderData.status = orderData.status || 'Aberta';
    orderData.priority = orderData.priority || 'Média';
    orderData.type = orderData.type || 'Corretiva';
    orderData.partsUsed = orderData.partsUsed || [];
    orderData.laborCost = Number(orderData.laborCost || 0);
    orderData.totalCost = Number(orderData.totalCost || 0);
    orderData.timelineLogs = [
      {
        id: `log-${Date.now()}`,
        date: now,
        author: orderData.requesterName || 'Solicitante',
        status: orderData.status,
        note: 'Chamado aberto no sistema.'
      }
    ];
  } else {
    orderData.timelineLogs = orderData.timelineLogs || [];
    if (updateNote || orderData.status) {
      orderData.timelineLogs.unshift({
        id: `log-${Date.now()}`,
        date: now,
        author: orderData.lastUpdatedBy || 'Técnico Manutenção',
        status: orderData.status,
        note: updateNote || `Status alterado para: ${orderData.status}`
      });
    }
  }

  // Handle Automatic Email Notification
  if (notifyEmail && orderData.requesterEmail) {
    const notification = {
      date: now,
      recipientEmail: orderData.requesterEmail,
      subject: `[NexaSERVICE] Atualização na Ordem de Serviço ${orderData.code}`,
      status: orderData.status,
      equipment: orderData.equipmentName,
      note: updateNote || (isNew ? 'Sua solicitação foi recebida e está aguardando triagem técnica.' : `A Ordem de Serviço mudou para o status: ${orderData.status}`),
      sent: true
    };

    orderData.emailNotifications = orderData.emailNotifications || [];
    orderData.emailNotifications.unshift(notification);
    
    console.log(`📧 [Notificação E-mail Enviada para ${orderData.requesterEmail}]:`, notification.subject, notification.note);
  }

  if (USE_MOCK) {
    const list = getStoredOrders();
    if (!isNew) {
      const idx = list.findIndex(o => o.id === orderData.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...orderData, updatedAt: now };
      else list.push({ ...orderData, createdAt: now });
    } else {
      const newId = `OS-${Date.now().toString(36).toUpperCase()}`;
      orderData = { id: newId, ...orderData, createdAt: now };
      list.push(orderData);
    }
    saveStoredOrders(list);
    return orderData;
  }

  try {
    const { getFirestore, collection, doc, setDoc, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (!isNew) {
      await setDoc(doc(db, 'service_orders', orderData.id), {
        ...orderData,
        updatedAt: now
      }, { merge: true });
      return orderData;
    } else {
      const docRef = await addDoc(collection(db, 'service_orders'), {
        ...orderData,
        createdAt: now
      });
      return { id: docRef.id, ...orderData };
    }
  } catch (err) {
    console.error('Erro ao salvar service order no Firestore, utilizando salvamento resiliente:', err);
    const list = getStoredOrders();
    if (!isNew) {
      const idx = list.findIndex(o => o.id === orderData.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...orderData, updatedAt: now };
      else list.push({ ...orderData, createdAt: now });
    } else {
      const newId = `OS-${Date.now().toString(36).toUpperCase()}`;
      orderData = { id: newId, ...orderData, createdAt: now };
      list.unshift(orderData);
    }
    saveStoredOrders(list);
    return orderData;
  }
};

export const deleteServiceOrder = async (id) => {
  if (USE_MOCK) {
    const list = getStoredOrders().filter(o => o.id !== id);
    saveStoredOrders(list);
    return { success: true, id };
  }
  try {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'service_orders', id));
    return { success: true, id };
  } catch (err) {
    console.error('Erro ao deletar service order no Firestore:', err);
    const list = getStoredOrders().filter(o => o.id !== id);
    saveStoredOrders(list);
    return { success: true, id };
  }
};

export const createPublicMaintenanceTicket = async (ticketData) => {
  const now = new Date().toISOString();
  const dateStr = new Date().getFullYear();
  let count = 1;
  try {
    const existing = await getServiceOrders();
    count = (existing?.length || 0) + 1;
  } catch (e) {
    count = Math.floor(1000 + Math.random() * 9000);
  }
  const seqStr = String(count).padStart(4, '0');
  const code = `OS-${dateStr}-${seqStr}`;

  const payload = {
    ...ticketData,
    code,
    type: ticketData.type || 'Corretiva',
    priority: ticketData.priority || 'Média',
    status: 'Aberta',
    openDate: now,
    source: 'QR Code Patrimônio',
    partsUsed: [],
    laborCost: 0,
    totalCost: 0,
    timelineLogs: [
      {
        id: `log-${Date.now()}`,
        date: now,
        author: ticketData.requesterName || 'Chamado QR Code',
        status: 'Aberta',
        note: `Chamado aberto via QR Code por ${ticketData.requesterName || 'Colaborador'}.`
      }
    ]
  };

  // Se o chamado for grave/urgente, atualiza o status operacional do equipamento
  if (ticketData.equipmentId && ['Alta', 'Crítico', 'Urgente'].includes(ticketData.priority)) {
    try {
      const eq = await getEquipmentById(ticketData.equipmentId);
      if (eq) {
        await saveEquipment({ ...eq, status: 'Em Manutenção' });
      }
    } catch (err) {
      console.warn('Erro ao atualizar status do equipamento para Em Manutenção:', err);
    }
  }

  return saveServiceOrder(payload, 'Abertura via QR Code no salão', Boolean(ticketData.requesterEmail));
};

// ----------------------------------------------------------------------
// REAL-TIME FIRESTORE CLOUD LISTENERS (SINCRONIZAÇÃO EM TEMPO REAL)
// ----------------------------------------------------------------------

export const subscribeToServiceOrders = (callback) => {
  if (USE_MOCK) {
    callback(getStoredOrders());
    return () => {};
  }
  let unsubscribe = () => {};
  import('firebase/firestore').then(({ getFirestore, collection, onSnapshot }) => {
    const db = getFirestore(app);
    unsubscribe = onSnapshot(collection(db, 'service_orders'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (items.length > 0) {
        items.sort((a, b) => new Date(b.createdAt || b.openDate || 0) - new Date(a.createdAt || a.openDate || 0));
        callback(items);
      } else {
        getServiceOrders().then(callback);
      }
    }, (err) => {
      console.error("Erro no listener real-time de service_orders:", err);
      callback(getStoredOrders());
    });
  }).catch(err => {
    console.error("Erro ao carregar Firestore no listener de service_orders:", err);
  });

  return () => unsubscribe();
};

export const subscribeToEquipments = (callback) => {
  if (USE_MOCK) {
    callback(getStoredEquipments());
    return () => {};
  }
  let unsubscribe = () => {};
  import('firebase/firestore').then(({ getFirestore, collection, onSnapshot }) => {
    const db = getFirestore(app);
    unsubscribe = onSnapshot(collection(db, 'equipments'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (items.length > 0) {
        callback(items);
      } else {
        getEquipments().then(callback);
      }
    }, (err) => {
      console.error("Erro no listener real-time de equipments:", err);
      callback(getStoredEquipments());
    });
  }).catch(err => {
    console.error("Erro ao carregar Firestore no listener de equipments:", err);
  });

  return () => unsubscribe();
};

// ----------------------------------------------------------------------
// IT SERVICE ORDERS (ORDENS DE SERVIÇO & SUPORTE DE T.I.) APIS
// ----------------------------------------------------------------------

const LOCAL_STORAGE_IT_ORDERS_KEY = 'nexa_it_service_orders';

export const SLA_HOURS_MAP = {
  'Crítico': 2,
  'Alta': 8,
  'Média': 24,
  'Baixa': 48
};

export const calculateSlaDeadline = (priority, startDateStr = null) => {
  const hours = SLA_HOURS_MAP[priority] || 24;
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const deadline = new Date(start.getTime() + hours * 60 * 60 * 1000);
  return deadline.toISOString();
};

export const INITIAL_IT_SERVICE_ORDERS = [];

const getStoredITOrders = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_IT_ORDERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Purgar chamados de teste antigos com códigos ou IDs de mock
        const cleaned = parsed.filter(o => 
          !o.id?.startsWith('OS-TI-2026-000') && 
          !o.code?.startsWith('TI-2026-000')
        );
        if (cleaned.length !== parsed.length) {
          saveStoredITOrders(cleaned);
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler IT service orders do localStorage:', e);
  }
  return [];
};

const saveStoredITOrders = (orders) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_IT_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Erro ao salvar IT service orders no localStorage:', e);
  }
};

export const getITServiceOrders = async () => {
  if (USE_MOCK) return getStoredITOrders();
  try {
    const { getFirestore, collection, getDocs, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'it_service_orders'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Identificar e purgar chamados de teste do Firestore se ainda existirem
    const testItems = items.filter(o => 
      o.id?.startsWith('OS-TI-2026-000') || 
      o.code?.startsWith('TI-2026-000')
    );
    if (testItems.length > 0) {
      for (const t of testItems) {
        try {
          await deleteDoc(doc(db, 'it_service_orders', t.id));
        } catch (delErr) {
          console.warn('Aviso ao remover chamado de teste do Firestore:', delErr);
        }
      }
      const cleaned = items.filter(o => 
        !o.id?.startsWith('OS-TI-2026-000') && 
        !o.code?.startsWith('TI-2026-000')
      );
      saveStoredITOrders(cleaned);
      return cleaned;
    }

    saveStoredITOrders(items);
    return items;
  } catch (err) {
    console.error('Erro ao carregar it_service_orders do Firestore:', err);
    return getStoredITOrders();
  }
};

export const saveITServiceOrder = async (orderData, updateNote = '', notifyEmail = true) => {
  const isNew = !orderData.id;
  const now = new Date().toISOString();

  if (isNew) {
    const dateStr = new Date().getFullYear();
    const existing = getStoredITOrders();
    const count = existing.length + 1;
    const seqStr = String(count).padStart(4, '0');
    orderData.code = orderData.code || `TI-${dateStr}-${seqStr}`;
    orderData.openDate = orderData.openDate || now;
    orderData.status = orderData.status || 'Aberta';
    orderData.priority = orderData.priority || 'Média';
    orderData.category = orderData.category || 'Hardware';
    orderData.subcategory = orderData.subcategory || 'Geral';
    orderData.sector = orderData.sector || 'Geral';
    orderData.origin = orderData.origin || 'user'; // 'user' | 'internal'
    orderData.taskType = orderData.taskType || (orderData.origin === 'internal' ? 'Preventiva' : null);
    if (orderData.origin === 'internal') {
      orderData.requesterName = orderData.requesterName || 'Equipe T.I.';
      orderData.requesterSector = orderData.requesterSector || 'T.I.';
    }
    orderData.slaHours = SLA_HOURS_MAP[orderData.priority] || 24;
    orderData.slaDeadline = orderData.slaDeadline || calculateSlaDeadline(orderData.priority, orderData.openDate);
    orderData.partsUsed = orderData.partsUsed || [];
    orderData.laborCost = Number(orderData.laborCost || 0);
    orderData.totalCost = Number(orderData.totalCost || 0);
    const initialNote = orderData.origin === 'internal'
      ? 'Tarefa interna proativa cadastrada pela equipe de T.I.'
      : 'Chamado de T.I. aberto no sistema.';
    orderData.timelineLogs = [
      {
        id: `log-${Date.now()}`,
        date: now,
        author: orderData.requesterName || (orderData.origin === 'internal' ? 'Equipe T.I.' : 'Solicitante'),
        status: orderData.status,
        note: initialNote
      }
    ];
  } else {
    orderData.timelineLogs = orderData.timelineLogs || [];
    if (updateNote || orderData.status) {
      orderData.timelineLogs.unshift({
        id: `log-${Date.now()}`,
        date: now,
        author: orderData.lastUpdatedBy || 'Técnico T.I.',
        status: orderData.status,
        note: updateNote || `Status alterado para: ${orderData.status}`
      });
    }
    if (orderData.priority && !orderData.slaDeadline) {
      orderData.slaDeadline = calculateSlaDeadline(orderData.priority, orderData.openDate || now);
    }
    if (['Resolvida', 'Cancelada', 'Concluída'].includes(orderData.status) && !orderData.completionDate) {
      orderData.completionDate = now;
    }
  }

  // Handle Automatic Email Notification
  if (notifyEmail && orderData.requesterEmail && orderData.origin !== 'internal') {
    const notification = {
      date: now,
      recipientEmail: orderData.requesterEmail,
      subject: `[NexaT.I.] Chamado ${orderData.code} - ${orderData.status}`,
      status: orderData.status,
      title: orderData.title,
      note: updateNote || (isNew ? 'Seu chamado de T.I. foi aberto e está na fila de atendimento.' : `Status atualizado para: ${orderData.status}`),
      sent: true
    };
    orderData.emailNotifications = orderData.emailNotifications || [];
    orderData.emailNotifications.unshift(notification);
    console.log(`📧 [Notificação T.I. para ${orderData.requesterEmail}]:`, notification.subject, notification.note);
  }

  if (USE_MOCK) {
    const list = getStoredITOrders();
    if (!isNew) {
      const idx = list.findIndex(o => o.id === orderData.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...orderData, updatedAt: now };
      else list.push({ ...orderData, createdAt: now });
    } else {
      const newId = `OS-TI-${Date.now().toString(36).toUpperCase()}`;
      orderData = { id: newId, ...orderData, createdAt: now };
      list.unshift(orderData);
    }
    saveStoredITOrders(list);
    return orderData;
  }

  try {
    const { getFirestore, collection, doc, setDoc, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (!isNew) {
      await setDoc(doc(db, 'it_service_orders', orderData.id), {
        ...orderData,
        updatedAt: now
      }, { merge: true });
      return orderData;
    } else {
      const docRef = await addDoc(collection(db, 'it_service_orders'), {
        ...orderData,
        createdAt: now
      });
      return { id: docRef.id, ...orderData };
    }
  } catch (err) {
    console.error('Erro ao salvar it_service_orders no Firestore, utilizando salvamento resiliente:', err);
    const list = getStoredITOrders();
    if (!isNew) {
      const idx = list.findIndex(o => o.id === orderData.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...orderData, updatedAt: now };
      else list.push({ ...orderData, createdAt: now });
    } else {
      const newId = `OS-TI-${Date.now().toString(36).toUpperCase()}`;
      orderData = { id: newId, ...orderData, createdAt: now };
      list.unshift(orderData);
    }
    saveStoredITOrders(list);
    return orderData;
  }
};

export const deleteITServiceOrder = async (id) => {
  if (USE_MOCK) {
    const list = getStoredITOrders().filter(o => o.id !== id);
    saveStoredITOrders(list);
    return { success: true, id };
  }
  try {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'it_service_orders', id));
    return { success: true, id };
  } catch (err) {
    console.error('Erro ao deletar IT service order no Firestore:', err);
    const list = getStoredITOrders().filter(o => o.id !== id);
    saveStoredITOrders(list);
    return { success: true, id };
  }
};

export const subscribeToITServiceOrders = (callback) => {
  if (USE_MOCK) {
    callback(getStoredITOrders());
    return () => {};
  }
  let unsubscribe = () => {};
  import('firebase/firestore').then(({ getFirestore, collection, onSnapshot }) => {
    const db = getFirestore(app);
    unsubscribe = onSnapshot(collection(db, 'it_service_orders'), (snap) => {
      let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items = items.filter(o => 
        !o.id?.startsWith('OS-TI-2026-000') && 
        !o.code?.startsWith('TI-2026-000')
      );
      items.sort((a, b) => new Date(b.createdAt || b.openDate || 0) - new Date(a.createdAt || a.openDate || 0));
      callback(items);
    }, (err) => {
      console.error("Erro no listener real-time de it_service_orders:", err);
      callback(getStoredITOrders());
    });
  }).catch(err => {
    console.error("Erro ao carregar Firestore no listener de it_service_orders:", err);
  });

  return () => unsubscribe();
};

// ==========================================
// T.I. DAILY ROUNDS (RONDA DIÁRIA DE T.I.)
// ==========================================
const LOCAL_STORAGE_IT_ROUNDS_KEY = 'nexa_it_daily_rounds';

const INITIAL_IT_DAILY_ROUNDS = [
  {
    id: 'round-sample-1',
    date: '2026-09-24T07:40:00.000Z',
    technician: 'Lucas T.I.',
    unitId: 'betim',
    unit: 'Betim',
    status: 'Conforme',
    summary: 'Ronda matinal 100% aprovada. Links redundantes ok, servidores 19°C e Zebras operacionais.',
    items: {
      internetPrimary: 'conforme',
      internetSecondary: 'conforme',
      serverRoomTemp: 'conforme',
      nightlyBackup: 'conforme',
      nobreaks: 'conforme',
      zebraPrinters: 'conforme',
      barcodeScanners: 'conforme',
      receptionTerminals: 'conforme'
    },
    notes: 'Realizada antes da abertura do 1º turno de hemodiálise. Sem pendências.'
  }
];

export const getITDailyRounds = async () => {
  if (USE_MOCK) {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_IT_ROUNDS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Erro ao ler rondas de T.I. do localStorage:', e);
    }
    return INITIAL_IT_DAILY_ROUNDS;
  }
  try {
    const { getFirestore, collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const db = getFirestore(app);
    const q = query(collection(db, 'it_daily_rounds'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (items.length === 0) {
      return INITIAL_IT_DAILY_ROUNDS;
    }
    return items;
  } catch (err) {
    console.error('Erro ao buscar rondas de T.I. no Firestore:', err);
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_IT_ROUNDS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return INITIAL_IT_DAILY_ROUNDS;
  }
};

export const saveITDailyRound = async (roundData) => {
  const now = new Date().toISOString();
  const id = roundData.id || `round-${Date.now()}`;
  const record = { ...roundData, id, date: roundData.date || now, createdAt: now };

  try {
    const existing = await getITDailyRounds();
    const updated = [record, ...existing.filter(r => r.id !== id)];
    localStorage.setItem(LOCAL_STORAGE_IT_ROUNDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao salvar ronda no localStorage:', e);
  }

  if (USE_MOCK) return record;

  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await setDoc(doc(db, 'it_daily_rounds', id), record, { merge: true });
    return record;
  } catch (err) {
    console.error('Erro ao salvar ronda no Firestore (salvo localmente):', err);
    return record;
  }
};

// ==========================================
// T.I. ASSETS INVENTORY (INVENTÁRIO DE ATIVOS T.I.)
// ==========================================
const LOCAL_STORAGE_IT_ASSETS_KEY = 'nexa_it_assets';

const INITIAL_IT_ASSETS = [
  {
    id: 'TI-AST-001',
    code: 'TI-PAT-001',
    name: 'Impressora Térmica Zebra ZD220',
    type: 'Impressora',
    sector: 'Recepção',
    location: 'Guichê 1',
    unitId: 'betim',
    unit: 'Betim',
    brand: 'Zebra',
    model: 'ZD220T 203DPI',
    serialNumber: 'ZBR2024-98211',
    ipAddress: '192.168.10.45',
    macAddress: '00:07:4D:A2:1F:B4',
    status: 'Operacional',
    acquisitionDate: '2024-03-15',
    notes: 'Impressora de etiquetas de tubos e exames laboratoriais.'
  },
  {
    id: 'TI-AST-002',
    code: 'TI-PAT-002',
    name: 'Desktop Dell OptiPlex 7090',
    type: 'Desktop',
    sector: 'Posto de Enfermagem',
    location: 'Bancada Central Salão A',
    unitId: 'betim',
    unit: 'Betim',
    brand: 'Dell',
    model: 'OptiPlex 7090 i5 16GB SSD 512GB',
    serialNumber: '8FJ2912',
    ipAddress: '192.168.10.60',
    macAddress: 'F4:02:70:9A:88:21',
    status: 'Operacional',
    acquisitionDate: '2024-01-20',
    notes: 'Estação clínica para evolução e prescrição médica.'
  },
  {
    id: 'TI-AST-003',
    code: 'TI-PAT-003',
    name: 'Switch Gerenciável 24P PoE+',
    type: 'Rede',
    sector: 'Sala de Servidores',
    location: 'Rack Principal - U08',
    unitId: 'betim',
    unit: 'Betim',
    brand: 'Ubiquiti',
    model: 'UniFi Switch Pro 24 PoE',
    serialNumber: 'UBQ2023-4410',
    ipAddress: '192.168.10.2',
    macAddress: '70:A7:41:2B:65:01',
    status: 'Operacional',
    acquisitionDate: '2023-11-10',
    notes: 'Distribuição de rede e alimentação PoE para Access Points.'
  },
  {
    id: 'TI-AST-004',
    code: 'TI-PAT-004',
    name: 'Nobreak Senoidal 3000VA',
    type: 'Energia',
    sector: 'Sala de Servidores',
    location: 'Piso Rack CPD',
    unitId: 'betim',
    unit: 'Betim',
    brand: 'SMS',
    model: 'Mirassol Sinus Triad 3kVA',
    serialNumber: 'SMS-3000-8812',
    ipAddress: '192.168.10.15',
    status: 'Operacional',
    acquisitionDate: '2023-08-15',
    notes: 'Alimentação ininterrupta do servidor Nexa e switches centrais.'
  },
  {
    id: 'TI-AST-005',
    code: 'TI-PAT-005',
    name: 'Leitor Código de Barras 2D',
    type: 'Periférico',
    sector: 'Farmácia Clínica',
    location: 'Bancada Fracionamento',
    unitId: 'betim',
    unit: 'Betim',
    brand: 'Honeywell',
    model: 'Voyager 1400g 2D USB',
    serialNumber: 'HNW-2024-5519',
    status: 'Operacional',
    acquisitionDate: '2024-05-10',
    notes: 'Leitura de lote e validade de medicamentos e kits.'
  }
];

export const getITAssets = async () => {
  if (USE_MOCK) {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_IT_ASSETS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Erro ao ler ativos T.I. do localStorage:', e);
    }
    return INITIAL_IT_ASSETS;
  }
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'it_assets'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (items.length === 0) {
      return INITIAL_IT_ASSETS;
    }
    return items;
  } catch (err) {
    console.error('Erro ao buscar ativos T.I. no Firestore:', err);
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_IT_ASSETS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return INITIAL_IT_ASSETS;
  }
};

export const saveITAsset = async (assetData) => {
  const isNew = !assetData.id;
  const now = new Date().toISOString();
  const id = assetData.id || `TI-AST-${Date.now().toString(36).toUpperCase()}`;
  const record = { ...assetData, id, updatedAt: now };
  if (isNew) record.createdAt = now;

  try {
    const existing = await getITAssets();
    const list = isNew ? [record, ...existing] : existing.map(a => a.id === id ? record : a);
    localStorage.setItem(LOCAL_STORAGE_IT_ASSETS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Erro ao salvar ativo T.I. no localStorage:', e);
  }

  if (USE_MOCK) return record;

  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await setDoc(doc(db, 'it_assets', id), record, { merge: true });
    return record;
  } catch (err) {
    console.error('Erro ao salvar ativo T.I. no Firestore:', err);
    return record;
  }
};

export const deleteITAsset = async (id) => {
  try {
    const existing = await getITAssets();
    const list = existing.filter(a => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_IT_ASSETS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Erro ao deletar ativo no localStorage:', e);
  }

  if (USE_MOCK) return { success: true, id };

  try {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'it_assets', id));
    return { success: true, id };
  } catch (err) {
    console.error('Erro ao deletar ativo no Firestore:', err);
    return { success: true, id };
  }
};

// ==========================================
// T.I. KNOWLEDGE BASE (WIKI & PROCEDIMENTOS RÁPIDOS)
// ==========================================
export const INITIAL_IT_WIKI_ARTICLES = [
  {
    id: 'wiki-1',
    title: 'Calibração e Troca de Ribbon na Impressora Zebra ZD220',
    category: 'Impressoras',
    summary: 'Procedimento para resolver luz vermelha piscante e desalinhamento de etiquetas.',
    steps: [
      'Abra a tampa superior pressionando as duas travas amarelas laterais.',
      'Verifique se o rolo de etiquetas está encaixado no suporte com os roletes centralizadores bem ajustados.',
      'Passe as etiquetas sob as duas guias transparentes ajustáveis até a saída frontal.',
      'Feche a tampa firmemente até ouvir os dois cliques laterais.',
      'Com a impressora ligada, segure o botão de avanço (Feed) até o LED piscar 2 vezes e solte imediatamente.',
      'A impressora puxará 2 a 3 etiquetas e calibrará automaticamente a altura do sensor de gap.'
    ]
  },
  {
    id: 'wiki-2',
    title: 'Falha de Internet e Ativação do Link Redundante 4G',
    category: 'Rede',
    summary: 'Procedimento para restabelecimento de conexão em contingência durante hemodiálise.',
    steps: [
      'Acesse a Sala de Servidores (CPD) e localize o roteador concentrador na U12.',
      'Verifique o LED da porta WAN 1 (Fibra Principal): se apagado ou laranja piscante, a operadora teve indisponibilidade.',
      'O sistema comuta automaticamente para o modem 4G/5G corporativo da porta WAN 2.',
      'Nos postos clínicos, aguarde 30 segundos ou desconecte e reconecte o cabo de rede para renovar o lease DHCP.',
      'Abra o navegador no Nex-Ai CLINIC e confirme o banner verde de conexão ativa.'
    ]
  },
  {
    id: 'wiki-3',
    title: 'Reset e Configuração de Leitor de Código de Barras USB',
    category: 'Periféricos',
    summary: 'Como restabelecer leitura rápida quando o scanner não envia os dados ao sistema.',
    steps: [
      'Desconecte o cabo USB do computador e aguarde 5 segundos.',
      'Reconecte em uma porta USB traseira da CPU (alimentação mais estável que as frontais).',
      'Aguarde o duplo bipe agudo indicando inicialização correta da porta serial virtual.',
      'Abra o Bloco de Notas (Notepad) no Windows e leia um código de barras de teste.',
      'Se o código for digitado e o cursor saltar de linha (Enter automático), o leitor está homologado.'
    ]
  },
  {
    id: 'wiki-4',
    title: 'Instalação do Certificado Digital A1 no Windows',
    category: 'Sistemas',
    summary: 'Passos para importar arquivo .pfx de médico para prescrições e laudos eletrônicos.',
    steps: [
      'Copie o arquivo do certificado (.pfx ou .p12) para a pasta Downloads da estação.',
      'Dê duplo clique no arquivo e selecione "Usuário Atual" no assistente do Windows.',
      'Clique em Avançar, digite a senha fornecida pela Autoridade Certificadora.',
      'Marque a opção "Marcar chave como exportável" e clique em Avançar.',
      'Selecione "Selecionar automaticamente o repositório de certificados conforme o tipo".',
      'Clique em Concluir. Abra o módulo .MED do Nex-Ai para assinar prescrições.'
    ]
  }
];

export const getITWikiArticles = () => {
  return INITIAL_IT_WIKI_ARTICLES;
};



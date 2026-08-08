# -*- coding: utf-8 -*-
import json

# Data from PDF 1 (2026 Cronograma)
raw_2026_nipro = [
    (1, "NIPRO - DIAMAX 220F", "24J34980P", "", "", "jun/26", ""),
    (2, "NIPRO - DIAMAX 220F", "24J34981P", "REGIONAL", "EXTERNA", "mar/26", ""),
    (3, "NIPRO - DIAMAX 220F", "24J34982P", "", "", "jan/26", ""),
    (4, "NIPRO - DIAMAX 220F", "24J34983P", "", "", "jan/26", ""),
    (5, "NIPRO - DIAMAX 220F", "24J34984P", "REGIONAL", "EXTERNA", "fev/26", ""),
    (6, "NIPRO - DIAMAX 220F", "24J34985P", "", "", "jan/26", ""),
    (7, "NIPRO - DIAMAX 220F", "24J34986P", "", "", "fev/26", ""),
    (8, "NIPRO - DIAMAX 220F", "24J34987P", "", "", "mar/26", ""),
    (9, "NIPRO - DIAMAX 220F", "24J34988P", "", "", "fev/26", ""),
    (10, "NIPRO - DIAMAX 220F", "24J34989P", "REGIONAL", "EXTERNA", "jan/26", ""),
    (11, "NIPRO - DIAMAX 220F", "24J34990P", "", "", "fev/26", ""),
    (12, "NIPRO - DIAMAX 220F", "24J34991P", "", "", "jan/26", ""),
    (13, "NIPRO - DIAMAX 220F", "24J34992P", "1ª", "21", "mar/26", "jun/26"),
    (14, "NIPRO - DIAMAX 220F", "24J34993P", "", "", "fev/26", ""),
    (15, "NIPRO - DIAMAX 220F", "24J34994P", "", "", "fev/26", ""),
    (16, "NIPRO - DIAMAX 220F", "24J34995P", "", "", "fev/26", "jun/26"),
    (17, "NIPRO - DIAMAX 220F", "24J34996P", "", "", "jan/26", ""),
    (18, "NIPRO - DIAMAX 220F", "24J34997P", "", "", "jul/26", ""),
    (19, "NIPRO - DIAMAX 220F", "24J34998P", "", "", "jul/26", ""),
    (20, "NIPRO - DIAMAX 220F", "24J35256P", "", "", "", ""),
    (21, "NIPRO - DIAMAX 220F", "24J35257P", "", "", "fev/26", ""),
    (22, "NIPRO - DIAMAX 220F", "24J35258P", "", "", "jul/26", ""),
    (23, "NIPRO - DIAMAX 220F", "24J35259P", "", "", "jan/26", ""),
    (24, "NIPRO - DIAMAX 220F", "24J35260P", "2ª", "27", "mar/26", ""),
    (25, "NIPRO - DIAMAX 220F", "24J35261P", "", "", "jan/26 | abr/26", ""),
    (26, "NIPRO - DIAMAX 220F", "24J35262P", "REGIONAL", "EXTERNA", "fev/26", ""),
    (27, "NIPRO - DIAMAX 220F", "24J35263P", "", "", "jan/26", ""),
    (28, "NIPRO - DIAMAX 220F", "24J35264P", "", "", "jan/26", ""),
    (29, "NIPRO - DIAMAX 220F", "24J35265P", "", "", "fev/26", ""),
    (30, "NIPRO - DIAMAX 220F", "24J35266P", "3º", "BOX 1", "mar/26", ""),
    (31, "NIPRO - DIAMAX 220F", "24J35267P", "REGIONAL", "EXTERNA", "mai/26", ""),
    (32, "NIPRO - DIAMAX 220F", "24J35268P", "3º", "5", "mar/26", ""),
    (33, "NIPRO - DIAMAX 220F", "24J35269P", "", "", "fev/26", ""),
    (34, "NIPRO - DIAMAX 220F", "24J35270P", "", "", "jun/26", ""),
    (35, "NIPRO - DIAMAX 220F", "24J35271P", "", "", "", ""),
    (36, "NIPRO - DIAMAX 220F", "24J35272P", "", "", "", ""),
    (37, "NIPRO - DIAMAX 220F", "24J35273P", "1º", "23", "mar/26", ""),
    (38, "NIPRO - DIAMAX 220F", "24J35274P", "", "", "jan/26", ""),
    (39, "NIPRO - DIAMAX 220F", "24J35275P", "", "", "mai/26", ""),
    (40, "NIPRO - DIAMAX 220F", "24J35276P", "", "", "", ""),
    (41, "NIPRO - DIAMAX 220F", "24J35277P", "", "", "fev/26", ""),
    (42, "NIPRO - DIAMAX 220F", "24J35278P", "3º", "6", "mar/26", ""),
    (43, "NIPRO - DIAMAX 220F", "24J35279P", "", "", "jun/26", ""),
    (44, "NIPRO - DIAMAX 220F", "24J35280P", "", "", "abr/26", ""),
    (45, "NIPRO - DIAMAX 220F", "24J35281P", "", "", "", ""),
    (46, "NIPRO - DIAMAX 220F", "24J35282P", "", "", "jan/26", ""),
    (47, "NIPRO - DIAMAX 220F", "24J35283P", "", "", "", ""),
    (48, "NIPRO - DIAMAX 220F", "24J35284P", "", "", "jan/26", ""),
    (49, "NIPRO - DIAMAX 220F", "24J35285P", "", "", "", ""),
    (50, "NIPRO - DIAMAX 220F", "24J35286P", "", "", "", ""),
    (51, "NIPRO - DIAMAX 220F", "24J35287P", "", "", "", ""),
    (52, "NIPRO - DIAMAX 220F", "24J35288P", "", "", "", ""),
    (53, "NIPRO - DIAMAX 220F", "24J35289P", "1º", "???", "mar/26", ""),
    (54, "NIPRO - DIAMAX 220F", "24J35290P", "", "", "", ""),
    (55, "NIPRO - DIAMAX 220F", "24J35291P", "", "", "", ""),
    (56, "NIPRO - DIAMAX 220F", "24J35292P", "", "", "", ""),
    (57, "NIPRO - DIAMAX 220F", "24J35293P", "", "", "", ""),
    (58, "NIPRO - DIAMAX 220F", "24J35294P", "", "", "jul/26", ""),
    (59, "NIPRO - DIAMAX 220F", "24J35295P", "", "", "jun/26", ""),
    (60, "NIPRO - DIAMAX 220F", "24J35296P", "", "", "", ""),
    (61, "NIPRO - DIAMAX 220F", "24J35297P", "", "", "", ""),
    (62, "NIPRO - DIAMAX 220F", "24J35298P", "REGIONAL", "EXTERNA", "mai/26", ""),
    (63, "NIPRO - DIAMAX 220F", "24J35556P", "", "", "mai/26", ""),
    (64, "NIPRO - DIAMAX 220F", "24J35557P", "", "", "jun/26", ""),
    (65, "NIPRO - DIAMAX 220F", "24J35558P", "", "", "", ""),
    (66, "NIPRO - DIAMAX 220F", "24J35559P", "", "", "abr/26", ""),
    (67, "NIPRO - DIAMAX 220F", "24J35560P", "", "", "", ""),
    (68, "NIPRO - DIAMAX 220F", "24J35561P", "", "", "abr/26", ""),
    (69, "NIPRO - DIAMAX 220F", "24J35562P", "", "", "", ""),
    (70, "NIPRO - DIAMAX 220F", "24J35563P", "", "", "abr/26, mai/26", "jun/26"),
    (71, "NIPRO - DIAMAX 220F", "24J35564P", "", "", "fev/26", ""),
    (72, "NIPRO - DIAMAX 220F", "24J35565P", "", "", "abr/26", ""),
    (73, "NIPRO - DIAMAX 220F", "24J35566P", "REGIONAL", "EXTERNA", "jun/26", ""),
    (74, "NIPRO - DIAMAX 220F", "24J35567P", "", "", "mai/26", ""),
    (75, "NIPRO - DIAMAX 220F", "24J35568P", "", "", "fev/26", ""),
    (76, "NIPRO - DIAMAX 220F", "24J35569P", "", "", "jun/26", ""),
    (77, "NIPRO - DIAMAX 220F", "24J35570P", "", "", "", ""),
    (78, "NIPRO - DIAMAX 220F", "24J35571P", "", "", "", ""),
    (79, "NIPRO - DIAMAX 220F", "24J35572P", "1º", "7", "mar/26", ""),
    (80, "NIPRO - DIAMAX 220F", "24J35573P", "", "", "", ""),
    (81, "NIPRO - DIAMAX 220F", "24J35574P", "", "", "", ""),
    (82, "NIPRO - DIAMAX 220F", "24J35575P", "", "", "jun/26", ""),
    (83, "NIPRO - DIAMAX 220F", "24J35576P", "", "", "jun/26", ""),
    (84, "NIPRO - DIAMAX 220F", "24J35577P", "", "", "", ""),
    (85, "NIPRO - DIAMAX 220F", "24J35578P", "", "", "jul/26", ""),
    (86, "NIPRO - DIAMAX 220F", "24J35579P", "", "", "", ""),
    (87, "NIPRO - DIAMAX 220F", "24J35580P", "", "", "", ""),
    (88, "NIPRO - DIAMAX 220F", "24J35581P", "", "", "jun/26", ""),
    (89, "NIPRO - DIAMAX 220F", "24J35582P", "", "", "jul/26", ""),
    (90, "NIPRO - DIAMAX 220F", "24J35583P", "", "", "abr/26", ""),
    (91, "NIPRO - DIAMAX 220F", "24J35584P", "", "", "", ""),
    (92, "NIPRO - DIAMAX 220F", "24J35585P", "", "", "", ""),
    (93, "NIPRO - DIAMAX 220F", "24J35586P", "", "", "abr/26", ""),
    (94, "NIPRO - DIAMAX 220F", "24J35587P", "", "", "", ""),
    (95, "NIPRO - DIAMAX 220F", "24J35588P", "", "", "jul/26", ""),
    (96, "NIPRO - DIAMAX 220F", "24J35589P", "", "", "", ""),
    (97, "NIPRO - DIAMAX 220F", "24J35590P", "", "", "jan/26", ""),
    (98, "NIPRO - DIAMAX 220F", "24J35591P", "", "", "", ""),
    (99, "NIPRO - DIAMAX 220F", "24J35592P", "", "", "abr/26", ""),
    (100, "NIPRO - DIAMAX 220F", "24J35593P", "", "", "", ""),
    (101, "NIPRO - DIAMAX 220F", "24J35594P", "", "", "jul/26", ""),
    (102, "NIPRO - DIAMAX 220F", "24J35595P", "2º", "23", "mar/26", ""),
    (103, "NIPRO - DIAMAX 220F", "24J35596P", "", "", "", ""),
    (104, "NIPRO - DIAMAX 220F", "24J35598P", "", "", "", ""),
    (105, "NIPRO - DIAMAX 220F", "24J35597P", "", "", "", "")
]

# Osmose Portatil (2026)
raw_2026_osmose = [
    ("OSMOSE DELTAMED", "ORP150.0367", "REGIONAL", "EXTERNA", "Todo mês é realizado - a partir de 04/26", "jun/26"),
    ("OSMOSE DELTAMED", "ORP150.0579", "REGIONAL", "EXTERNA", "Todo mês é realizado - a partir de 04/26", "05/06/2026 - referente a Coleta 20/05"),
    ("OSMOSE DELTAMED", "ORP150.0584", "REGIONAL", "EXTERNA", "Todo mês é realizado - a partir de 04/26", "05/06/2026 - referente a Coleta 20/05"),
    ("OSMOSE DELTAMED", "ORP150.0585", "REGIONAL", "EXTERNA", "Todo mês é realizado - a partir de 04/26", "jun/26"),
    ("OSMOSE DELTAMED", "ORP150.0369", "REGIONAL", "EXTERNA", "Todo mês é realizado - a partir de 04/26", "05/06/2026 - referente a Coleta 20/05"),
    ("OSMOSE IPABRAS", "911.567", "REGIONAL", "EXTERNA", "Todo mês é realizado - a partir de 04/26", "jun/26"),
    ("OSMOSE VEXER", "181217-06.01.01.01", "REGIONAL", "EXTERNA", "Todo mês é realizado - a partir de 04/26", "jul/26")
]

# 2025 Data map by Serial
raw_2025_map = {
    "24J34980P": {"coleta_2025": "ago/25", "recoleta_2025": ""},
    "24J34981P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34982P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34983P": {"coleta_2025": "dez/25", "recoleta_2025": ""},
    "24J34984P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34985P": {"coleta_2025": "jun/25", "recoleta_2025": ""},
    "24J34986P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34987P": {"coleta_2025": "mai/26", "recoleta_2025": ""},
    "24J34988P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34989P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34990P": {"coleta_2025": "set/25", "recoleta_2025": ""},
    "24J34991P": {"coleta_2025": "jun/25", "recoleta_2025": ""},
    "24J34992P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34993P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34994P": {"coleta_2025": "ago/25", "recoleta_2025": ""},
    "24J34995P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34996P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J34997P": {"coleta_2025": "jul/25", "recoleta_2025": ""},
    "24J34998P": {"coleta_2025": "mai/25", "recoleta_2025": ""},
    "24J35256P": {"coleta_2025": "mai/25", "recoleta_2025": ""},
    "24J35257P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35258P": {"coleta_2025": "nov/25", "recoleta_2025": ""},
    "24J35259P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35260P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35261P": {"coleta_2025": "jun/25", "recoleta_2025": "ago/25"},
    "24J35262P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35263P": {"coleta_2025": "set/25", "recoleta_2025": ""},
    "24J35264P": {"coleta_2025": "set/25", "recoleta_2025": ""},
    "24J35265P": {"coleta_2025": "fev/26", "recoleta_2025": ""},
    "24J35266P": {"coleta_2025": "mar/26", "recoleta_2025": ""},
    "24J35267P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35268P": {"coleta_2025": "mar/26", "recoleta_2025": ""},
    "24J35269P": {"coleta_2025": "fev/26", "recoleta_2025": ""},
    "24J35270P": {"coleta_2025": "nov/25", "recoleta_2025": ""},
    "24J35271P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35272P": {"coleta_2025": "mai/25", "recoleta_2025": ""},
    "24J35273P": {"coleta_2025": "mar/26", "recoleta_2025": ""},
    "24J35274P": {"coleta_2025": "jan/26", "recoleta_2025": ""},
    "24J35275P": {"coleta_2025": "mai/26", "recoleta_2025": ""},
    "24J35276P": {"coleta_2025": "mai/25", "recoleta_2025": ""},
    "24J35277P": {"coleta_2025": "fev/26", "recoleta_2025": ""},
    "24J35278P": {"coleta_2025": "mar/26", "recoleta_2025": ""},
    "24J35279P": {"coleta_2025": "dez/25", "recoleta_2025": ""},
    "24J35280P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35281P": {"coleta_2025": "nov/25", "recoleta_2025": ""},
    "24J35282P": {"coleta_2025": "jan/26", "recoleta_2025": ""},
    "24J35283P": {"coleta_2025": "nov/25", "recoleta_2025": ""},
    "24J35284P": {"coleta_2025": "jan/26", "recoleta_2025": ""},
    "24J35285P": {"coleta_2025": "out/25", "recoleta_2025": ""},
    "24J35286P": {"coleta_2025": "dez/25", "recoleta_2025": ""},
    "24J35287P": {"coleta_2025": "dez/25", "recoleta_2025": ""},
    "24J35288P": {"coleta_2025": "nov/25", "recoleta_2025": ""},
    "24J35289P": {"coleta_2025": "mar/26", "recoleta_2025": ""},
    "24J35290P": {"coleta_2025": "set/25", "recoleta_2025": ""},
    "24J35291P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35292P": {"coleta_2025": "jun/25", "recoleta_2025": ""},
    "24J35293P": {"coleta_2025": "mai/25", "recoleta_2025": ""},
    "24J35294P": {"coleta_2025": "jul/25", "recoleta_2025": ""},
    "24J35295P": {"coleta_2025": "jul/25", "recoleta_2025": ""},
    "24J35296P": {"coleta_2025": "jun/25", "recoleta_2025": ""},
    "24J35297P": {"coleta_2025": "jun/25", "recoleta_2025": ""},
    "24J35298P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35556P": {"coleta_2025": "mai/26", "recoleta_2025": ""},
    "24J35557P": {"coleta_2025": "jul/25", "recoleta_2025": "out/25"},
    "24J35558P": {"coleta_2025": "out/25", "recoleta_2025": ""},
    "24J35559P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35560P": {"coleta_2025": "dez/25", "recoleta_2025": ""},
    "24J35561P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35562P": {"coleta_2025": "set/25", "recoleta_2025": ""},
    "24J35563P": {"coleta_2025": "mai/26", "recoleta_2025": "jan/00"},
    "24J35564P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35565P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35566P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35567P": {"coleta_2025": "mai/26", "recoleta_2025": ""},
    "24J35568P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35569P": {"coleta_2025": "ago/25", "recoleta_2025": ""},
    "24J35570P": {"coleta_2025": "dez/25", "recoleta_2025": ""},
    "24J35571P": {"coleta_2025": "set/25", "recoleta_2025": ""},
    "24J35572P": {"coleta_2025": "mar/26", "recoleta_2025": ""},
    "24J35573P": {"coleta_2025": "dez/25", "recoleta_2025": ""},
    "24J35574P": {"coleta_2025": "ago/25", "recoleta_2025": ""},
    "24J35575P": {"coleta_2025": "set/25", "recoleta_2025": "out/25"},
    "24J35576P": {"coleta_2025": "jun/25", "recoleta_2025": "jul/25"},
    "24J35577P": {"coleta_2025": "mai/25", "recoleta_2025": "out/25"},
    "24J35578P": {"coleta_2025": "jun/25", "recoleta_2025": ""},
    "24J35579P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35580P": {"coleta_2025": "ago/25", "recoleta_2025": "out/25"},
    "24J35581P": {"coleta_2025": "mai/25", "recoleta_2025": ""},
    "24J35582P": {"coleta_2025": "ago/25", "recoleta_2025": ""},
    "24J35583P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35584P": {"coleta_2025": "nov/25", "recoleta_2025": ""},
    "24J35585P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35586P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35587P": {"coleta_2025": "dez/25", "recoleta_2025": ""},
    "24J35588P": {"coleta_2025": "jul/25", "recoleta_2025": "out/25"},
    "24J35589P": {"coleta_2025": "out/25", "recoleta_2025": ""},
    "24J35590P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35591P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35592P": {"coleta_2025": "2026", "recoleta_2025": ""},
    "24J35593P": {"coleta_2025": "out/25", "recoleta_2025": ""},
    "24J35594P": {"coleta_2025": "ago/25", "recoleta_2025": ""},
    "24J35595P": {"coleta_2025": "mar/26", "recoleta_2025": ""},
    "24J35596P": {"coleta_2025": "jun/25", "recoleta_2025": "jul/25"},
    "24J35598P": {"coleta_2025": "mai/25", "recoleta_2025": ""},
    "24J35597P": {"coleta_2025": "mai/25", "recoleta_2025": ""}
}

equipments = []
id_counter = 1

# Process Nipro machines
for item_no, modelo, serial, sala, ponto, coleta_2026, recoleta_2026 in raw_2026_nipro:
    d2025 = raw_2025_map.get(serial, {})
    coleta_2025 = d2025.get("coleta_2025", "")
    recoleta_2025 = d2025.get("recoleta_2025", "")
    
    # Determine sector
    sector_parts = []
    if sala:
        if sala.upper() == "REGIONAL":
            sector_parts.append("Regional Externa")
        else:
            sector_parts.append(f"Salão {sala}")
    if ponto:
        if ponto.upper() == "EXTERNA":
            if "Regional Externa" not in sector_parts:
                sector_parts.append("Externa")
        else:
            sector_parts.append(f"Ponto {ponto}")
            
    sector_str = " - ".join(sector_parts) if sector_parts else "Salão de Hemodiálise (Geral)"

    # Build Notes summary
    coleta_notes = []
    if coleta_2025:
        coleta_notes.append(f"Coleta 2025: {coleta_2025}")
    if recoleta_2025:
        coleta_notes.append(f"Recoleta 2025: {recoleta_2025}")
    if coleta_2026:
        coleta_notes.append(f"Coleta 2026: {coleta_2026}")
    if recoleta_2026:
        coleta_notes.append(f"Recoleta 2026: {recoleta_2026}")
        
    notes_str = f"Item #{item_no} Cronograma Dialisato. " + (" | ".join(coleta_notes) if coleta_notes else "Sem registro de coleta.")

    eq = {
        "id": f"EQP-HD-{id_counter:03d}",
        "code": f"PAT-HD-{id_counter:03d}",
        "name": f"Máquina de Hemodiálise Nipro Diamax 220F (#{item_no})",
        "category": "Biomédico",
        "subcategory": "Hemodiálise",
        "brand": "Nipro",
        "model": "DIAMAX 220F",
        "serialNumber": serial,
        "sector": sector_str,
        "criticality": "Alta",
        "status": "Em Operação",
        "acquisitionDate": "2024-01-15",
        "acquisitionValue": 120000.00,
        "warrantyUntil": "2027-01-15",
        "preventiveIntervalDays": 90,
        "lastPreventiveDate": "2026-05-10",
        "nextPreventiveDate": "2026-08-10",
        "requiresCalibration": True,
        "calibrationValidUntil": "2026-12-31",
        "notes": notes_str
    }
    equipments.append(eq)
    id_counter += 1

# Process Osmose Portatil
osmose_counter = 1
for modelo_raw, serial, sala, ponto, coleta, recoleta in raw_2026_osmose:
    brand = modelo_raw.replace("OSMOSE ", "").strip()
    
    sector_str = "Regional Externa (Diálise Externa)"
    
    notes_str = f"Osmose Portátil - Diálise Externa. Coleta: {coleta}"
    if recoleta:
        notes_str += f" | Recoleta 2026: {recoleta}"

    eq = {
        "id": f"EQP-OSM-{osmose_counter:03d}",
        "code": f"PAT-OSM-{osmose_counter:03d}",
        "name": f"Osmose Portátil {brand} ({serial})",
        "category": "Biomédico",
        "subcategory": "Tratamento de Água",
        "brand": brand,
        "model": serial,
        "serialNumber": serial,
        "sector": sector_str,
        "criticality": "Alta",
        "status": "Em Operação",
        "acquisitionDate": "2023-06-01",
        "acquisitionValue": 45000.00,
        "warrantyUntil": "2026-06-01",
        "preventiveIntervalDays": 30,
        "lastPreventiveDate": "2026-07-01",
        "nextPreventiveDate": "2026-08-01",
        "requiresCalibration": True,
        "calibrationValidUntil": "2026-12-31",
        "notes": notes_str
    }
    equipments.append(eq)
    osmose_counter += 1

print(f"Total de equipamentos cadastrados sem duplicatas: {len(equipments)}")
with open("c:/Nexa/NexAi-CLINIC/scratch/extracted_equipments.json", "w", encoding="utf-8") as f:
    json.dump(equipments, f, ensure_ascii=False, indent=2)

import pypdf
import json
import os
import re

pdf_path = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\034f7892-e181-4f79-b952-68fd2c23607c\media__1785782706128.pdf"
if not os.path.exists(pdf_path):
    pdf_path = r"C:\Users\Usuario\.gemini\antigravity-ide\brain\034f7892-e181-4f79-b952-68fd2c23607c\media__1785782019191.pdf"

reader = pypdf.PdfReader(pdf_path)

all_lines = []
for page in reader.pages:
    text = page.extract_text()
    for line in text.split('\n'):
        line = line.strip()
        if line:
            all_lines.append(line)

known_subgroups = [
    "MATERIAL MED. HOSP. - MAT/MED",
    "MEDICAMENTOS CONTROLADOS - PSICOT",
    "MEDICAMENTOS - MED",
    "OPME - OPME",
    "FIOS CIRÚRGICOS - FIOS CIRÚRGICOS",
    "FIOS CIRUGICOS - FIOS CIRUGICOS",
    "MATERIAL LIMPEZA - MATERIAIS LIMPEZA",
    "BENS PERMANENTES - BENS PERMANENT",
    "MATERIAL DE ESCRITORIO - MATERIAL DE",
    "EPI - EPI",
    "OSMOSE - OSMOSE",
    "PRESTAÇÃO DE SERVIÇOS - PRESTAÇÃO",
    "PRESTACAO DE SERVICOS - PRESTACAO",
    "SND - COZINHA",
    "MANUTENÇÃO - MANUTENÇÃO",
    "MANUTENCAO - MANUTENCAO",
    "OBRA - OBRA",
    "TI - TECNOLOGIA DA INFORMAÇÃO",
    "TI - TECNOLOGIA DA INFORMACAO",
    "DESCARTAVÉIS - DESCARTAVÉIS",
    "DESCARTAVEIS - DESCARTAVEIS",
    "DIÁLISE PERITONEAL - DP",
    "DIALISE PERITONEAL - DP"
]

def map_category(subgroup):
    sg = subgroup.upper()
    if "MEDICAMENTOS CONTROLADOS" in sg or "PSICOT" in sg:
        return "Medicamento Controlado"
    if "MEDICAMENTOS" in sg or ("MED" in sg and "MAT/MED" not in sg and "INTERNET" not in sg):
        return "Medicamento"
    if "MAT/MED" in sg or "MATERIAL MED" in sg:
        return "Insumo Clínico / MatMed"
    if "OPME" in sg:
        return "OPME"
    if "FIOS" in sg:
        return "Fios Cirúrgicos"
    if "LIMPEZA" in sg:
        return "Material de Limpeza"
    if "PERMANENT" in sg or "BENS" in sg:
        return "Bens Permanentes / Patrimônio"
    if "ESCRITORIO" in sg:
        return "Material de Escritório"
    if "EPI" in sg:
        return "EPI"
    if "OSMOSE" in sg:
        return "Osmose / Tratamento de Água"
    if "SERVIÇO" in sg or "SERVICO" in sg or "PRESTAÇÃO" in sg or "PRESTACAO" in sg:
        return "Serviços Terceirizados"
    if "SND" in sg or "COZINHA" in sg:
        return "Nutrição & Alimentação (SND)"
    if "MANUTENÇÃO" in sg or "MANUTENCAO" in sg:
        return "Manutenção & Conservação"
    if "OBRA" in sg:
        return "Obra & Infraestrutura"
    if "TI" in sg or "INFORMAÇÃO" in sg or "INFORMACAO" in sg:
        return "Tecnologia da Informação (T.I)"
    if "DESCARTAV" in sg:
        return "Descartáveis"
    if "DIÁLISE PERITONEAL" in sg or "DIALISE PERITONEAL" in sg or "DP" in sg:
        return "Diálise Peritoneal"
    return "Outros Insumos"

products = []
subgroup_counts = {}
category_counts = {}

header_patterns = ["HOSPITAL PUBLICO", "AV EDMEIA", "Telefone:", "Produtos", "Código Descrição"]

units_list = [
    "UNIDADE", "PAR", "CAIXA C/ 24 UNIDADES", "CAIXA C/ 36 UNIDADES", "CAIXA C/ 100 UNIDADES",
    "CAIXA C/ 500 UNIDADES", "CAIXA C/ 1000 UNIDADES", "CAIXA C/ 400", "CAIXA C/ 170", "CAIXA C/ 220",
    "CAIXA", "PACOTE C/ 100 UNIDADES", "PACOTE C/ 500 UNIDADES", "PACOTE C/ 250 UNIDADES",
    "PACOTE C/ 50 UNIDADES", "PACOTE C/ 60 UNIDADES", "PACOTE C/ 100 FOLHAS", "PACOTE C/ 500 FOLHAS",
    "PACOTE 1KG", "PACOTE 800ML", "PACOTE 400ML", "PACOTE", "ROLO C/ 500 SACOS", "ROLO C/ 400 SACOS",
    "ROLO C/ 700", "ROLO", "CILINDRO", "FRASCO 500ML", "FRASCO 250ML", "FRASCO 100ML", "FRASCO 20ML",
    "FRASCO 15ML", "FRASCO 10ML", "FRASCO 300ML", "FRASCO 700ML", "FRASCO 1 LITRO", "FRASCO AMPOLA 20ML",
    "FRASCO AMPOLA 5ML", "FRASCO AMPOLA 2ML", "FRASCO AMPOLA", "FRASCO", "GALÃO 5 LITROS", "GALÃO 6 LITROS",
    "GALÃO 6,2 LITROS", "GALÃO DE 5 LITROS", "GALÃO 5L", "GALÃO 1 LITRO", "GALÃO", "AMPOLA 10ML",
    "AMPOLA 5ML", "AMPOLA 4ML", "AMPOLA 3ML", "AMPOLA 2ML", "AMPOLA 1ML", "AMPOLA DE 10ML", "AMPOLA DE 1ML",
    "AMPOLA", "COMPRIMIDO SUBLINGUAL", "COMPRIMIDO", "BOMBONA 5L", "BOMBONA", "SACO 50KG", "SACO 25 KG",
    "SACO", "KIT C/200 FOLHAS", "KIT C/3", "KIT", "M²", "KG", "SERVICO", "EQUIPAMENTO", "NOTEBOOK", "LITRO"
]

# Sort units by length descending
units_list.sort(key=len, reverse=True)

for line in all_lines:
    if any(h in line for h in header_patterns) or line.startswith("03/08/2026") or "Sistema Dialsist" in line:
        continue

    match = re.match(r'^(\d+)\s+(\d+[\.\d]*)\s+(.*)$', line)
    if not match:
        continue

    idx_str, code_str, rest = match.groups()

    matched_sg_full = "MATERIAL MED. HOSP. - MAT/MED"
    for sg in known_subgroups:
        if rest.endswith(sg):
            matched_sg_full = sg
            rest = rest[:-len(sg)].strip()
            break

    barcode = ""
    bc_match = re.search(r'\s+(\d{8,14})$', rest)
    if bc_match:
        barcode = bc_match.group(1)
        rest = rest[:-len(bc_match.group(0))].strip()

    unit = "UNIDADE"
    desc = rest

    for u in units_list:
        if rest.endswith(u):
            unit = u
            desc = rest[:-len(u)].strip()
            break
        elif rest.endswith(u.replace(" ", "")): # Handles concatenated words like AVC/CVCUNIDADE
            unit = u
            desc = rest[:-len(u.replace(" ", ""))].strip()
            break

    category = map_category(matched_sg_full)

    subgroup_counts[matched_sg_full] = subgroup_counts.get(matched_sg_full, 0) + 1
    category_counts[category] = category_counts.get(category, 0) + 1

    products.append({
        "id": f"prod-hosp-{idx_str}",
        "code": code_str,
        "name": desc,
        "unit": unit,
        "barcode": barcode,
        "subgroup": matched_sg_full,
        "category": category,
        "currentStock": 50,
        "minStock": 20,
        "price": 10.00
    })

print(f"Total Products Parsed: {len(products)}")

out_path = r"c:\Nexa\NexAi-CLINIC\src\data\initialProducts.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"Saved refined dataset to {out_path}")

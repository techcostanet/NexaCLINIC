import pandas as pd
import json

file_path = r'C:\Users\Usuario\Documents\CONTAS A PAGAR DIALIZE 2026.csv'
df = pd.read_csv(file_path, sep=';', encoding='latin1', skiprows=3)

# Remove rows where Vencimento is empty or NaN
df = df.dropna(subset=['Vencimento'])

# Try to parse dates
# Vencimento format looks like "00/01/1900" or "01/09/2025" or "09/03/2026"
records_2026 = []
for index, row in df.iterrows():
    venc = str(row['Vencimento']).strip()
    if '2026' in venc:
        # It's a 2026 record
        # Format the record to match what Firestore expects in accounts_payable
        # From earlier inspection, schema for accounts_payable might include:
        # supplier, description, amount, dueDate, category, status, etc.
        
        # Let's clean the amount
        valor_devido = str(row.get('Valor Devido', '0')).replace('R$', '').replace('.', '').replace(',', '.').strip()
        try:
            amount = float(valor_devido)
        except:
            amount = 0.0
            
        record = {
            'fornecedor': str(row.get('Fornecedor', '')),
            'nf': str(row.get('NF', '')),
            'vencimento': venc,
            'valor': amount,
            'status': str(row.get('Situa\xe7\xe3o', '')),
            'grupo': str(row.get('GRUPO', '')),
            'despesa': str(row.get('DESPESAS', ''))
        }
        records_2026.append(record)

print(f"Total 2026 records found: {len(records_2026)}")
with open('records_2026.json', 'w', encoding='utf-8') as f:
    json.dump(records_2026, f, ensure_ascii=False, indent=2)

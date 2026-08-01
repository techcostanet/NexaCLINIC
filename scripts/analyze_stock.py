import sys

with open('src/components/StockPanel.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
for i, line in enumerate(lines):
    if "return (" in line and "className=\"panel\"" in lines[i+1]:
        print(f"Main return starts at line {i+1}")
        break

for i, line in enumerate(lines):
    if "activeTab ===" in line or "activeTab ===" in line.replace(" ", ""):
        print(f"Tab check at line {i+1}: {line.strip()}")

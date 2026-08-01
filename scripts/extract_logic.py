import os
import re

with open('src/components/StockPanel.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

return_idx = -1
for i, line in enumerate(lines):
    if "return (" in line and "<div" in lines[i+1]:
        return_idx = i
        break

if return_idx != -1:
    logic_lines = lines[:return_idx]
    
    start_func_idx = -1
    for i, line in enumerate(logic_lines):
        if "export default function StockPanel" in line:
            start_func_idx = i
            break
            
    if start_func_idx != -1:
        imports = "".join(logic_lines[:start_func_idx])
        body = "".join(logic_lines[start_func_idx+1:])
        
        exports = []
        states = re.findall(r'const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState', body)
        for s in states:
            exports.append(s)
            exports.append(f"set{s[0].upper()}{s[1:]}")
            
        funcs = re.findall(r'const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>', body)
        for f in funcs:
            if f not in exports:
                exports.append(f)
                
        funcs2 = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', body)
        for f in funcs2:
            if f not in exports:
                exports.append(f)
                
        # Also, there are derived variables at the end:
        # const filteredItems = getFilteredItems();
        # const lowStockItems = getLowStockItems();
        # const expiryList = getExpiryTransactions();
        
        exports.append('filteredItems')
        exports.append('lowStockItems')
        exports.append('expiryList')
                
        return_statement = "  return {\n    " + ",\n    ".join(exports) + "\n  };\n}\n"
        
        hook_content = imports.replace("export default function StockPanel() {", "")
        hook_content += "export function useStockLogic() {\n"
        hook_content += body
        hook_content += return_statement
        
        os.makedirs('src/components/Stock/hooks', exist_ok=True)
        with open('src/components/Stock/hooks/useStockLogic.js', 'w', encoding='utf-8') as f:
            f.write(hook_content)
            
        print("Generated useStockLogic.js")
        
        new_panel = imports
        new_panel += "import { useStockLogic } from './Stock/hooks/useStockLogic';\n\n"
        new_panel += "export default function StockPanel() {\n"
        new_panel += "  const stockLogic = useStockLogic();\n"
        new_panel += "  const {\n    " + ",\n    ".join(exports) + "\n  } = stockLogic;\n\n"
        new_panel += "".join(lines[return_idx:])
        
        with open('src/components/StockPanel_new.jsx', 'w', encoding='utf-8') as f:
            f.write(new_panel)
            
        print("Generated StockPanel_new.jsx")
    else:
        print("Could not find start function")
else:
    print("Could not find return statement")

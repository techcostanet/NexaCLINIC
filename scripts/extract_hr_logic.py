import os
import re

def extract_hook(filepath, component_name, hook_name, output_dir):
    with open(filepath, 'r', encoding='utf-8') as f:
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
            if f"export default function {component_name}" in line:
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
                    
            # Identify other variables declared via const that are not hooks or functions
            # e.g., const birthdaysThisMonth = ...
            derived = re.findall(r'^  const\s+([a-zA-Z0-9_]+)\s*=\s*[a-zA-Z0-9_]+\(', body, re.MULTILINE)
            for d in derived:
                if d not in exports:
                    exports.append(d)
            
            # also object destructurings: const { turnover, absenteeism, recentAbsences } = calculateCurrentMonthMetrics();
            destructs = re.findall(r'^  const\s+\{([^}]+)\}\s*=\s*[a-zA-Z0-9_]+\(', body, re.MULTILINE)
            for d in destructs:
                vars = [v.strip() for v in d.split(',')]
                for v in vars:
                    if v and v not in exports:
                        exports.append(v)
            
            # Make sure we don't have duplicates
            exports = list(dict.fromkeys(exports))
                    
            return_statement = "  return {\n    " + ",\n    ".join(exports) + "\n  };\n}\n"
            
            hook_content = imports.replace(f"export default function {component_name}() {{", "")
            hook_content += f"export function {hook_name}() {{\n"
            hook_content += body
            hook_content += return_statement
            
            os.makedirs(output_dir, exist_ok=True)
            with open(f'{output_dir}/{hook_name}.js', 'w', encoding='utf-8') as f:
                f.write(hook_content)
                
            print(f"Generated {hook_name}.js")
            
            new_panel = imports
            new_panel += f"import {{ {hook_name} }} from './{output_dir.split('/')[-2]}/{output_dir.split('/')[-1]}/{hook_name}';\n\n"
            new_panel += f"export default function {component_name}() {{\n"
            new_panel += f"  const logic = {hook_name}();\n"
            new_panel += f"  const {{\n    " + ",\n    ".join(exports) + "\n  } = logic;\n\n"
            new_panel += "".join(lines[return_idx:])
            
            with open(filepath.replace('.jsx', '_new.jsx'), 'w', encoding='utf-8') as f:
                f.write(new_panel)
                
            print(f"Generated {component_name}_new.jsx")
        else:
            print("Could not find start function")
    else:
        print("Could not find return statement")

extract_hook('src/components/HRPanel.jsx', 'HRPanel', 'useHRLogic', 'src/components/HR/hooks')

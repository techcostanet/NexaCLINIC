import os

with open('src/components/StockPanel.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

tabs = ['inventory', 'physical_inventory', 'transfers', 'invoices', 'suppliers', 'sectors', 'transactions', 'expiry', 'loans', 'requisitions']

os.makedirs('src/components/Stock/tabs', exist_ok=True)

for tab in tabs:
    # search for {activeTab === 'tab' && (
    search_str = f"{{activeTab === '{tab}' && ("
    start_idx = content.find(search_str)
    
    if start_idx == -1:
        # maybe it's {activeTab === 'tab' && lowStockItems.length > 0 && (
        print(f"Could not find exact match for tab {tab}, skipping auto-extract")
        continue
    
    # find the matching closing bracket )
    idx = content.find('(', start_idx) + 1
    brace_count = 1
    
    while idx < len(content):
        if content[idx] == '(':
            brace_count += 1
        elif content[idx] == ')':
            brace_count -= 1
            if brace_count == 0:
                break
        idx += 1
        
    end_idx = idx + 1
    
    tab_content = content[start_idx:end_idx]
    
    # write to file
    with open(f"src/components/Stock/tabs/{tab.capitalize()}Tab.txt", 'w', encoding='utf-8') as f:
        f.write(tab_content)
        
print("Extracted tab contents to txt files.")

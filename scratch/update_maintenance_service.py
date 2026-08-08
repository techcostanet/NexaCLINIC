# -*- coding: utf-8 -*-
import json

with open("scratch/combined_initial_equipments.json", "r", encoding="utf-8") as f:
    equipments = json.load(f)

# Format as JavaScript array literal
js_equipments = "const INITIAL_EQUIPMENTS = " + json.dumps(equipments, ensure_ascii=False, indent=2) + ";\n"

with open("src/services/firebase/maintenanceService.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace INITIAL_EQUIPMENTS definition
start_marker = "// Initial Seed Data for Clinic & Hospital Equipments (Biomedical, Predial, TI Hardware, TI Software)\nconst INITIAL_EQUIPMENTS = ["
end_marker = "];\n\nconst INITIAL_SERVICE_ORDERS ="

start_idx = content.find("const INITIAL_EQUIPMENTS = [")
end_idx = content.find("];\n\nconst INITIAL_SERVICE_ORDERS =")

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + js_equipments + content[end_idx + 2:]
    
    # Also update getStoredEquipments logic to auto-update localStorage if count < 100
    old_get_stored = """const getStoredEquipments = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_EQUIPMENTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Erro ao ler equipments do localStorage:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_EQUIPMENTS_KEY, JSON.stringify(INITIAL_EQUIPMENTS));
  return INITIAL_EQUIPMENTS;
};"""

    new_get_stored = """const getStoredEquipments = () => {
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
};"""

    new_content = new_content.replace(old_get_stored, new_get_stored)

    with open("src/services/firebase/maintenanceService.js", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("maintenanceService.js updated successfully!")
else:
    print("Could not find markers in maintenanceService.js!")

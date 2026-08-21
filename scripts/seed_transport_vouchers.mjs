import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

admin.initializeApp();
const db = getFirestore();

// March 2026
const defaultMarchData = [
  { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 140.20, currentBalance: 20.20, rechargeNeeded: 254.80, highlightType: null },
  { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 153.95, currentBalance: 33.95, rechargeNeeded: 241.05, highlightType: null },
  { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 412.50, balancePrevious: 389.95, currentBalance: 269.95, rechargeNeeded: 142.55, highlightType: null },
  { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 303.65, currentBalance: 183.65, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 217.05, currentBalance: 97.05, rechargeNeeded: 227.95, highlightType: null },
  { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 216.45, currentBalance: 96.45, rechargeNeeded: 228.55, highlightType: null },
  { employeeName: 'ANA PAULA DE OLIVEIRA EFIGENIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 121.50, currentBalance: 1.50, rechargeNeeded: 198.50, highlightType: null },
  { employeeName: 'ANDRÉA RODRIGUES SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 122.70, currentBalance: 2.70, rechargeNeeded: 197.30, highlightType: null },
  { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 27.90, voltaCost: 12.50, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 848.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 848.40, highlightType: 'orange' },
  { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 115.80, currentBalance: -4.20, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'CAROLINA CÁTIA FERNANDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 47.30, currentBalance: -72.70, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 262.55, currentBalance: 142.55, rechargeNeeded: 182.45, highlightType: null },
  { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 122.95, currentBalance: 2.95, rechargeNeeded: 322.05, highlightType: null },
  { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 312.50, balancePrevious: 223.30, currentBalance: 103.30, rechargeNeeded: 129.05, highlightType: null },
  { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 309.40, currentBalance: 189.40, rechargeNeeded: 135.60, highlightType: null },
  { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 147.40, currentBalance: 27.40, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'ELIANE ROSA MIRANDA GONÇALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 284.30, currentBalance: 164.30, rechargeNeeded: 160.70, highlightType: null },
  { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 89.40, currentBalance: -30.60, rechargeNeeded: 325.00, highlightType: 'red' },
  { employeeName: 'ELIZABETH FERREIRA TELES SANTANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 143.30, currentBalance: 23.30, rechargeNeeded: 301.70, highlightType: null },
  { employeeName: 'EMANUELLE MOREIRA FERREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 174.15, currentBalance: 54.15, rechargeNeeded: 270.85, highlightType: null },
  { employeeName: 'ERLAINE KELLE SOUZA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 117.46, currentBalance: -2.54, rechargeNeeded: 200.00, highlightType: 'red' },
  { employeeName: 'ESTER FERNANDES FERREIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'ESTHER GOMES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 223.49, currentBalance: 103.49, rechargeNeeded: 221.51, highlightType: null },
  { employeeName: 'FRANCYNE FERRAZ SILVA SANTOS', idaCost: 6.25, voltaCost: 0.00, dailyCost: 6.25, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 162.50, balancePrevious: 179.80, currentBalance: 59.80, rechargeNeeded: 102.70, highlightType: null },
  { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 137.45, currentBalance: 17.45, rechargeNeeded: 257.55, highlightType: null },
  { employeeName: 'GEOVANA GOMES RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 184.25, currentBalance: 64.25, rechargeNeeded: 134.40, highlightType: null },
  { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 106.80, currentBalance: -13.20, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 337.40, currentBalance: 217.40, rechargeNeeded: 107.60, highlightType: null },
  { employeeName: 'IANKA LORRANY DE CARVALHO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 286.10, currentBalance: 166.10, rechargeNeeded: 158.90, highlightType: null },
  { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 228.65, currentBalance: 108.65, rechargeNeeded: 216.35, highlightType: null },
  { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 147.60, currentBalance: 27.60, rechargeNeeded: 172.40, highlightType: 'yellow' },
  { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 122.35, currentBalance: 2.35, rechargeNeeded: 322.65, highlightType: null },
  { employeeName: 'JAQUELINA LOURENÇO DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 103.95, currentBalance: -16.05, rechargeNeeded: 200.00, highlightType: 'red' },
  { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 233.40, currentBalance: 113.40, rechargeNeeded: 87.00, highlightType: null },
  { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.90, currentBalance: 175.90, rechargeNeeded: 149.10, highlightType: null },
  { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 202.75, currentBalance: 82.75, rechargeNeeded: 117.25, highlightType: null },
  { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 217.80, currentBalance: 97.80, rechargeNeeded: 227.20, highlightType: null },
  { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 198.60, currentBalance: 78.60, rechargeNeeded: 246.40, highlightType: null },
  { employeeName: 'KAREN TAMARA ALVES TOTOU XISTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 148.60, currentBalance: 28.60, rechargeNeeded: 246.40, highlightType: null },
  { employeeName: 'KATIANE DE SOUZA GALHARDO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 148.30, currentBalance: 28.30, rechargeNeeded: 296.70, highlightType: null },
  { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 370.90, currentBalance: 250.90, rechargeNeeded: 75.00, highlightType: null },
  { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 439.40, highlightType: 'orange' },
  { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 10.40, voltaCost: 10.40, dailyCost: 20.80, workSchedule: '12X36', expectedValue: 332.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 332.80, highlightType: 'orange' },
  { employeeName: 'LEDA MARIA BELLICO EGG', idaCost: 13.95, voltaCost: 13.95, dailyCost: 27.90, workSchedule: '2ª A 6ª', expectedValue: 613.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 613.80, highlightType: 'orange' },
  { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 218.15, currentBalance: 98.15, rechargeNeeded: 176.85, highlightType: null },
  { employeeName: 'LETÍCIA CARMO SILVA CRUZ', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 205.45, currentBalance: 85.45, rechargeNeeded: 239.55, highlightType: null },
  { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 275.85, currentBalance: 155.85, rechargeNeeded: 169.15, highlightType: null },
  { employeeName: 'LORRAINE CRISTINA OLIVEIRA BARBOSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 365.55, currentBalance: 245.55, rechargeNeeded: 80.00, highlightType: null },
  { employeeName: 'LUCILENE RAMOS RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 117.35, currentBalance: -2.65, rechargeNeeded: 200.00, highlightType: 'red' },
  { employeeName: 'LUZIA APARECIDA PEREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 413.75, currentBalance: 293.75, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 115.55, currentBalance: -4.45, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'MARIANE GOMES MELO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 159.60, currentBalance: 39.60, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 321.80, currentBalance: 201.80, rechargeNeeded: 123.20, highlightType: null },
  { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 312.50, balancePrevious: 371.20, currentBalance: 251.20, rechargeNeeded: 61.30, highlightType: null },
  { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 300.00, balancePrevious: 222.40, currentBalance: 102.40, rechargeNeeded: 197.60, highlightType: null },
  { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 324.40, currentBalance: 204.40, rechargeNeeded: 120.60, highlightType: null },
  { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 323.60, currentBalance: 203.60, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 349.40, currentBalance: 229.40, rechargeNeeded: 95.60, highlightType: null },
  { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 364.95, currentBalance: 244.95, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'PÂMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 170.80, currentBalance: 50.80, rechargeNeeded: 154.20, highlightType: null },
  { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 235.80, currentBalance: 115.80, rechargeNeeded: 159.20, highlightType: null },
  { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 20.20, voltaCost: 20.20, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 0.00, highlightType: 'orange' },
  { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 289.15, currentBalance: 169.15, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 194.65, currentBalance: 74.65, rechargeNeeded: 125.35, highlightType: null },
  { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 167.35, currentBalance: 47.35, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'SABRINA VITÓRIA ASSUNÇÃO VIANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 259.90, currentBalance: 139.90, rechargeNeeded: 185.10, highlightType: null },
  { employeeName: 'SAMAIA DA COSTA BATISTA MELO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 115.80, currentBalance: -4.20, rechargeNeeded: 200.00, highlightType: 'red' },
  { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 110.20, currentBalance: -9.80, rechargeNeeded: 200.00, highlightType: 'red' },
  { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 222.10, currentBalance: 102.10, rechargeNeeded: 222.90, highlightType: null },
  { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 161.70, currentBalance: 41.70, rechargeNeeded: 283.30, highlightType: null },
  { employeeName: 'SILVANA FERNANDA NUNES LELIS', idaCost: 12.50, voltaCost: 12.50, dailyCost: 25.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 650.00, balancePrevious: 415.55, currentBalance: 295.55, rechargeNeeded: 354.45, highlightType: null },
  { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 576.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 576.00, highlightType: 'orange' },
  { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 184.30, currentBalance: 64.30, rechargeNeeded: 135.70, highlightType: null },
  { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 211.40, currentBalance: 91.40, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 289.65, currentBalance: 169.65, rechargeNeeded: 155.35, highlightType: null },
  { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 131.25, highlightType: null },
  { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 117.65, currentBalance: -2.35, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'VICTOR HENRIQUE SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 172.40, currentBalance: 52.40, rechargeNeeded: 147.60, highlightType: null },
  { employeeName: 'VITOR EMANUEL MENEZES NOVAIS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 111.70, currentBalance: -8.30, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'WANDA MARIA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 65.50, currentBalance: -54.50, rechargeNeeded: 200.00, highlightType: 'red' }
];

// April 2026
const defaultAprilData = [
  { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 113.75, currentBalance: -6.25, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'ADRIANA GONÇALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 275.00, balancePrevious: 116.35, currentBalance: -3.65, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 151.25, currentBalance: 31.25, rechargeNeeded: 243.75, highlightType: null },
  { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 412.50, balancePrevious: 413.75, currentBalance: 293.75, rechargeNeeded: 118.75, highlightType: null },
  { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 259.90, currentBalance: 139.90, rechargeNeeded: 185.10, highlightType: null },
  { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 206.25, highlightType: null },
  { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
  { employeeName: 'ANDRÉA RODRIGUES SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 143.75, highlightType: null },
  { employeeName: 'AUTELI DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 136.05, currentBalance: 16.05, rechargeNeeded: 171.45, highlightType: null },
  { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 888.80, highlightType: 'orange' },
  { employeeName: 'BRAULIO GUALTER NASCIMENTO MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 122.05, currentBalance: 2.05, rechargeNeeded: 272.95, highlightType: null },
  { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 884.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 884.00, highlightType: 'orange' },
  { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 323.00, currentBalance: 203.00, rechargeNeeded: 122.00, highlightType: null },
  { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
  { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 189.85, currentBalance: 69.85, rechargeNeeded: 255.15, highlightType: null },
  { employeeName: 'DALVA TEOFILO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 177.06, currentBalance: 57.06, rechargeNeeded: 130.44, highlightType: null },
  { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.00, currentBalance: 175.00, rechargeNeeded: 150.00, highlightType: null },
  { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 207.50, currentBalance: 87.50, rechargeNeeded: 237.50, highlightType: null },
  { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 147.40, currentBalance: 27.40, rechargeNeeded: 160.10, highlightType: null },
  { employeeName: 'ELIANE ROSA MIRANDA GONÇALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.00, currentBalance: 175.00, rechargeNeeded: 150.00, highlightType: null },
  { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 245.65, currentBalance: 125.65, rechargeNeeded: 199.35, highlightType: null },
  { employeeName: 'ELIZABETH FERREIRA TELES SANTANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 256.25, highlightType: null },
  { employeeName: 'ÉRICA ALVES DA SILVA', idaCost: 15.70, voltaCost: 15.70, dailyCost: 31.40, workSchedule: '2ª A 6ª', expectedValue: 690.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 690.80, highlightType: 'orange' },
  { employeeName: 'FRANCYNE FERRAZ SILVA SANTOS', idaCost: 6.25, voltaCost: 0.00, dailyCost: 6.25, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 162.50, balancePrevious: 220.00, currentBalance: 100.00, rechargeNeeded: 70.00, highlightType: null },
  { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 262.50, highlightType: null },
  { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 477.45, currentBalance: 357.45, rechargeNeeded: 20.00, highlightType: null },
  { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 263.05, currentBalance: 143.05, rechargeNeeded: 131.95, highlightType: null },
  { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 268.65, currentBalance: 148.65, rechargeNeeded: 176.35, highlightType: null },
  { employeeName: 'IANKA LORRANY DE CARVALHO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 432.50, currentBalance: 312.50, rechargeNeeded: 20.00, highlightType: null },
  { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.00, currentBalance: 175.00, rechargeNeeded: 150.00, highlightType: null },
  { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 88.75, currentBalance: -31.25, rechargeNeeded: 218.75, highlightType: 'red' },
  { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 275.00, highlightType: null },
  { employeeName: 'JAQUELINA LOURENÇO DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 91.45, currentBalance: -28.55, rechargeNeeded: 216.05, highlightType: 'red' },
  { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 195.00, currentBalance: 75.00, rechargeNeeded: 250.00, highlightType: null },
  { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 270.00, currentBalance: 150.00, rechargeNeeded: 40.00, highlightType: null },
  { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 363.75, currentBalance: 243.75, rechargeNeeded: 90.00, highlightType: null },
  { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'JUCILÉIA COELHO SANTOS RODRIGUES', idaCost: 21.15, voltaCost: 21.15, dailyCost: 42.30, workSchedule: '2ª A 6ª', expectedValue: 930.60, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 930.60, highlightType: 'orange' },
  { employeeName: 'KAREN TAMARA ALVES TOTOU XISTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 120.00, currentBalance: 0.00, rechargeNeeded: 275.00, highlightType: null },
  { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 402.15, currentBalance: 282.15, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'LARISSA ALVES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 143.40, currentBalance: 23.40, rechargeNeeded: 164.10, highlightType: null },
  { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 439.40, highlightType: 'orange' },
  { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 10.40, voltaCost: 10.40, dailyCost: 20.80, workSchedule: '12X36', expectedValue: 312.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 312.00, highlightType: 'orange' },
  { employeeName: 'LEDA MARIA BELLICO EGG', idaCost: 13.95, voltaCost: 13.95, dailyCost: 27.90, workSchedule: '2ª A 6ª', expectedValue: 613.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 613.80, highlightType: 'orange' },
  { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 270.00, currentBalance: 150.00, rechargeNeeded: 125.00, highlightType: null },
  { employeeName: 'LETÍCIA CARMO SILVA CRUZ', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 218.75, highlightType: null },
  { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ESPIRITO SANTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 162.50, currentBalance: 42.50, rechargeNeeded: 282.50, highlightType: null },
  { employeeName: 'LUCILENE RAMOS RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 148.60, currentBalance: 28.60, rechargeNeeded: 158.90, highlightType: null },
  { employeeName: 'LUZIA APARECIDA PEREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 290.55, currentBalance: 170.55, rechargeNeeded: 104.45, highlightType: null },
  { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 357.50, currentBalance: 237.50, rechargeNeeded: 90.00, highlightType: null },
  { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 232.55, currentBalance: 112.55, rechargeNeeded: 212.45, highlightType: null },
  { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 358.70, currentBalance: 238.70, rechargeNeeded: 90.00, highlightType: null },
  { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 281.25, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 137.50, highlightType: null },
  { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 351.25, currentBalance: 231.25, rechargeNeeded: 100.00, highlightType: null },
  { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 298.60, currentBalance: 178.60, rechargeNeeded: 15.00, highlightType: null },
  { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 277.45, currentBalance: 157.45, rechargeNeeded: 167.55, highlightType: null },
  { employeeName: 'PAMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 428.10, currentBalance: 308.10, rechargeNeeded: 20.00, highlightType: null },
  { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 225.00, highlightType: null },
  { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 20.20, voltaCost: 20.20, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 888.80, highlightType: 'orange' },
  { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 370.00, currentBalance: 250.00, rechargeNeeded: 75.00, highlightType: null },
  { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 137.50, highlightType: null },
  { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 98.60, currentBalance: -21.40, rechargeNeeded: 296.40, highlightType: 'red' },
  { employeeName: 'SABRINA VITÓRIA ASSUNÇÃO VIANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'SAMAIA DA COSTA BATISTA MELO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 140.80, currentBalance: 20.80, rechargeNeeded: 166.70, highlightType: null },
  { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 66.45, currentBalance: -53.55, rechargeNeeded: 241.05, highlightType: 'red' },
  { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 168.75, highlightType: null },
  { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.50, currentBalance: 137.50, rechargeNeeded: 187.50, highlightType: null },
  { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 540.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 540.00, highlightType: 'orange' },
  { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 162.50, highlightType: null },
  { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 130.15, currentBalance: 10.15, rechargeNeeded: 314.85, highlightType: null },
  { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 181.25, highlightType: null },
  { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 97.00, highlightType: null },
  { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 230.15, currentBalance: 110.15, rechargeNeeded: 164.85, highlightType: null },
  { employeeName: 'VICTOR HENRIQUE SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 245.00, currentBalance: 125.00, rechargeNeeded: 65.00, highlightType: null }
];

// May 2026
const defaultMayData = [
  { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 225.00, highlightType: null },
  { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 181.25, highlightType: null },
  { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 375.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 156.25, highlightType: null },
  { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 382.50, currentBalance: 262.50, rechargeNeeded: 62.50, highlightType: null },
  { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
  { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 207.50, currentBalance: 87.50, rechargeNeeded: 237.50, highlightType: null },
  { employeeName: 'AUTELI DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 87.50, highlightType: null },
  { employeeName: 'CAMILA GABRIELE SANTOS SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 63.75, currentBalance: -56.25, rechargeNeeded: 381.25, highlightType: 'red' },
  { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 206.25, highlightType: null },
  { employeeName: 'CAROLINA CATIA FERNANDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 351.25, currentBalance: 231.25, rechargeNeeded: 93.75, highlightType: null },
  { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 312.50, highlightType: null },
  { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 287.50, highlightType: null },
  { employeeName: 'DAIANE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 351.25, currentBalance: 231.25, rechargeNeeded: 93.75, highlightType: null },
  { employeeName: 'DALVA TEOFILO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 207.50, currentBalance: 87.50, rechargeNeeded: 112.50, highlightType: null },
  { employeeName: 'DANIELY ALVES DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 275.00, highlightType: null },
  { employeeName: 'DAVINE TAMARA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 357.50, currentBalance: 237.50, rechargeNeeded: 87.50, highlightType: null },
  { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 313.75, currentBalance: 193.75, rechargeNeeded: 131.25, highlightType: null },
  { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 218.75, highlightType: null },
  { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 55.45, currentBalance: -64.55, rechargeNeeded: 264.55, highlightType: 'red' },
  { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 218.75, highlightType: null },
  { employeeName: 'ELIZABETH FERREIRA TELES SANTANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
  { employeeName: 'ESTHER GOMES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 190.26, currentBalance: 70.26, rechargeNeeded: 254.74, highlightType: null },
  { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 138.75, currentBalance: 18.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'GEOVANA GOMES RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 377.65, currentBalance: 257.65, rechargeNeeded: 67.35, highlightType: null },
  { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 93.75, highlightType: null },
  { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 112.45, currentBalance: -7.55, rechargeNeeded: 332.55, highlightType: 'red' },
  { employeeName: 'IANKA LORRANY DE CARVALHO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 358.75, currentBalance: 238.75, rechargeNeeded: 86.25, highlightType: null },
  { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 162.50, highlightType: null },
  { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 281.25, highlightType: null },
  { employeeName: 'JAQUELINA LOURENÇO DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 126.25, currentBalance: 6.25, rechargeNeeded: 193.75, highlightType: null },
  { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 207.90, currentBalance: 87.90, rechargeNeeded: 112.10, highlightType: null },
  { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 193.75, highlightType: null },
  { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 253.75, currentBalance: 133.75, rechargeNeeded: 66.25, highlightType: null },
  { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 310.00, currentBalance: 190.00, rechargeNeeded: 135.00, highlightType: null },
  { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 206.25, highlightType: null },
  { employeeName: 'KAREN TAMARA ALVES TOTOU XISTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 212.50, highlightType: null },
  { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 433.40, currentBalance: 313.40, rechargeNeeded: 11.60, highlightType: null },
  { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 137.50, highlightType: null },
  { employeeName: 'LETÍCIA CARMO SILVA CRUZ', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ESPIRITO SANTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 219.15, currentBalance: 99.15, rechargeNeeded: 225.85, highlightType: null },
  { employeeName: 'LORRAINE CRISTINA OLIVEIRA BARBOSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 270.55, currentBalance: 150.55, rechargeNeeded: 174.45, highlightType: null },
  { employeeName: 'LUCILENE RAMOS RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 76.25, currentBalance: -43.75, rechargeNeeded: 243.75, highlightType: 'red' },
  { employeeName: 'MARIA DE FÁTIMA CARVALHO DE SOUSA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 300.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 207.50, currentBalance: 87.50, rechargeNeeded: 162.50, highlightType: null },
  { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 316.25, currentBalance: 196.25, rechargeNeeded: 128.75, highlightType: null },
  { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 292.95, currentBalance: 172.95, rechargeNeeded: 152.05, highlightType: null },
  { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 137.50, balancePrevious: 357.50, currentBalance: 237.50, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 300.00, balancePrevious: 126.25, currentBalance: 6.25, rechargeNeeded: 293.75, highlightType: null },
  { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 370.00, currentBalance: 250.00, rechargeNeeded: 75.00, highlightType: null },
  { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 288.60, currentBalance: 168.60, rechargeNeeded: 31.40, highlightType: null },
  { employeeName: 'MIGUEL MONTEIRO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 275.00, balancePrevious: 147.40, currentBalance: 27.40, rechargeNeeded: 247.60, highlightType: null },
  { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 312.50, highlightType: null },
  { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 220.00, currentBalance: 100.00, rechargeNeeded: 225.00, highlightType: null },
  { employeeName: 'PAMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 185.60, currentBalance: 65.60, rechargeNeeded: 259.40, highlightType: null },
  { employeeName: 'PEDRO CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 191.35, currentBalance: 71.35, rechargeNeeded: 178.65, highlightType: null },
  { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 106.25, highlightType: null },
  { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 292.15, currentBalance: 172.15, rechargeNeeded: 152.85, highlightType: null },
  { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 126.25, currentBalance: 6.25, rechargeNeeded: 193.75, highlightType: null },
  { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 93.75, highlightType: null },
  { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 63.75, currentBalance: -56.25, rechargeNeeded: 256.25, highlightType: 'red' },
  { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 218.75, highlightType: null },
  { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 107.50, currentBalance: -12.50, rechargeNeeded: 212.50, highlightType: 'red' },
  { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 326.25, currentBalance: 206.25, rechargeNeeded: 118.75, highlightType: null },
  { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 326.25, currentBalance: 206.25, rechargeNeeded: 118.75, highlightType: null },
  { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 142.00, currentBalance: 22.00, rechargeNeeded: 178.00, highlightType: null },
  { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 31.25, highlightType: null },
  { employeeName: 'JURANDI BASTOS GOVEIA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 87.50, highlightType: null },
  { employeeName: 'CLEBER NEVES ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 245.00, currentBalance: 125.00, rechargeNeeded: 125.00, highlightType: null },
  { employeeName: 'LETICIA DE OLIVEIRA BRAGA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 281.25, highlightType: null },
  { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 808.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 808.00, highlightType: 'orange' },
  { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 884.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 884.00, highlightType: 'orange' },
  { employeeName: 'ÉRICA ALVES DA SILVA', idaCost: 15.70, voltaCost: 15.70, dailyCost: 31.40, workSchedule: '2ª A 6ª', expectedValue: 628.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 628.00, highlightType: 'orange' },
  { employeeName: 'JUCILÉIA COELHO SANTOS RODRIGUES', idaCost: 21.15, voltaCost: 21.15, dailyCost: 42.30, workSchedule: '2ª A 6ª', expectedValue: 846.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 846.00, highlightType: 'orange' },
  { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 439.40, highlightType: 'orange' },
  { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 10.40, voltaCost: 10.40, dailyCost: 20.80, workSchedule: '12X36', expectedValue: 332.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 332.80, highlightType: 'orange' },
  { employeeName: 'LEDA MARIA BELLICO EGG', idaCost: 13.95, voltaCost: 13.95, dailyCost: 27.90, workSchedule: '2ª A 6ª', expectedValue: 558.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 558.00, highlightType: 'orange' },
  { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 20.20, voltaCost: 20.20, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 808.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 808.00, highlightType: 'orange' },
  { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 576.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 576.00, highlightType: 'orange' },
  { employeeName: 'MARIANA DE MORAIS CARVALHO', idaCost: 17.45, voltaCost: 17.45, dailyCost: 34.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 907.40, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 907.40, highlightType: 'orange' },
  { employeeName: 'JESSICA LUCIANA GONÇALVES DE ARAUJO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 151.25, currentBalance: 31.25, rechargeNeeded: 231.20, highlightType: null },
  { employeeName: 'ANA CAROLINA LOPES SOUSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 37.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 37.50, highlightType: null }
];

// June 2026
const defaultJuneData = [
  { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 126.25, currentBalance: 6.25, rechargeNeeded: 268.75, highlightType: null },
  { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 120.00, currentBalance: 0.00, rechargeNeeded: 275.00, highlightType: null },
  { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 412.50, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 331.25, highlightType: null },
  { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 313.75, currentBalance: 193.75, rechargeNeeded: 131.25, highlightType: null },
  { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 168.75, highlightType: null },
  { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 281.25, highlightType: null },
  { employeeName: 'AUTELI DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 76.25, currentBalance: -43.75, rechargeNeeded: 187.50, highlightType: 'red' },
  { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 888.80, highlightType: 'orange' },
  { employeeName: 'BARBARA COSTA PEREIRA', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: '2ª A 6ª', expectedValue: 371.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 371.80, highlightType: 'orange' },
  { employeeName: 'CAMILA GABRIELE SANTOS SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 401.25, currentBalance: 281.25, rechargeNeeded: 43.75, highlightType: null },
  { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 101.25, currentBalance: -18.75, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'CAROLINA CATIA FERNANDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 884.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 884.00, highlightType: 'orange' },
  { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
  { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 101.25, currentBalance: -18.75, rechargeNeeded: 325.00, highlightType: 'red' },
  { employeeName: 'CLEBER NEVES ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 88.75, currentBalance: -31.25, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
  { employeeName: 'DAIANE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 195.00, currentBalance: 75.00, rechargeNeeded: 250.00, highlightType: null },
  { employeeName: 'DALVA TEOFILO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 68.75, highlightType: null },
  { employeeName: 'DANIELY ALVES DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 388.75, currentBalance: 268.75, rechargeNeeded: 56.25, highlightType: null },
  { employeeName: 'DAVINE TAMARA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 288.75, currentBalance: 168.75, rechargeNeeded: 156.25, highlightType: null },
  { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 137.50, highlightType: null },
  { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 270.00, currentBalance: 150.00, rechargeNeeded: 175.00, highlightType: null },
  { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 95.00, currentBalance: -25.00, rechargeNeeded: 187.50, highlightType: 'red' },
  { employeeName: 'ELIANE DE PAULA FERREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 38.75, currentBalance: -81.25, rechargeNeeded: 187.50, highlightType: 'red' },
  { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 256.25, highlightType: null },
  { employeeName: 'ÉRICA ALVES DA SILVA', idaCost: 15.70, voltaCost: 15.70, dailyCost: 31.40, workSchedule: '2ª A 6ª', expectedValue: 314.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 314.00, highlightType: 'orange' },
  { employeeName: 'ESTHER GOMES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 168.75, highlightType: null },
  { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 76.25, currentBalance: -43.75, rechargeNeeded: 275.00, highlightType: 'red' },
  { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 401.25, currentBalance: 281.25, rechargeNeeded: 43.75, highlightType: null },
  { employeeName: 'GIULLIA HANNA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 134.70, currentBalance: 14.70, rechargeNeeded: 260.30, highlightType: null },
  { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 220.00, currentBalance: 100.00, rechargeNeeded: 225.00, highlightType: null },
  { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 496.35, currentBalance: 376.35, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'IANKA LORRANY DE CARVALHO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 395.00, currentBalance: 275.00, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 245.00, currentBalance: 125.00, rechargeNeeded: 200.00, highlightType: null },
  { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 151.25, currentBalance: 31.25, rechargeNeeded: 156.25, highlightType: null },
  { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
  { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 35.00, highlightType: null },
  { employeeName: 'JESSICA LUCIANA GONÇALVES DE ARAUJO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 212.50, highlightType: null },
  { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
  { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 68.75, highlightType: null },
  { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 301.25, currentBalance: 181.25, rechargeNeeded: 143.75, highlightType: null },
  { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'JUCILÉIA COELHO SANTOS RODRIGUES', idaCost: 21.15, voltaCost: 21.15, dailyCost: 42.30, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 1099.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 1099.80, highlightType: 'orange' },
  { employeeName: 'JOSE DOS SANTOS VIEIRA DO CARMO', idaCost: 12.50, voltaCost: 12.50, dailyCost: 25.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 650.00, balancePrevious: 106.25, currentBalance: -13.75, rechargeNeeded: 663.75, highlightType: 'red' },
  { employeeName: 'JURANDI BASTOS GOVEIA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 113.75, currentBalance: -6.25, rechargeNeeded: 193.75, highlightType: 'red' },
  { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 433.40, currentBalance: 313.40, rechargeNeeded: 11.60, highlightType: null },
  { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 439.40, highlightType: 'orange' },
  { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 10.40, voltaCost: 10.40, dailyCost: 20.80, workSchedule: '12X36', expectedValue: 312.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 312.00, highlightType: 'orange' },
  { employeeName: 'LEILA DOS SANTOS COSTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 217.30, currentBalance: 97.30, rechargeNeeded: 227.70, highlightType: null },
  { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 87.50, highlightType: null },
  { employeeName: 'LETICIA DE OLIVEIRA BRAGA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 212.50, highlightType: null },
  { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ESPIRITO SANTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 652.50, currentBalance: 532.50, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'LORRAINE CRISTINA OLIVEIRA BARBOSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 258.05, currentBalance: 138.05, rechargeNeeded: 186.95, highlightType: null },
  { employeeName: 'MARGARETH MARIA TEIXEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 46.75, currentBalance: -73.25, rechargeNeeded: 398.25, highlightType: 'red' },
  { employeeName: 'MARIANA DE MORAIS CARVALHO', idaCost: 17.45, voltaCost: 17.45, dailyCost: 34.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 907.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 907.40, highlightType: 'orange' },
  { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 262.50, highlightType: null },
  { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 345.00, currentBalance: 225.00, rechargeNeeded: 100.00, highlightType: null },
  { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 332.50, currentBalance: 212.50, rechargeNeeded: 112.50, highlightType: null },
  { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 281.25, balancePrevious: 245.00, currentBalance: 125.00, rechargeNeeded: 156.25, highlightType: null },
  { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 345.00, currentBalance: 225.00, rechargeNeeded: 100.00, highlightType: null },
  { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 288.60, currentBalance: 168.60, rechargeNeeded: 18.90, highlightType: null },
  { employeeName: 'MIGUEL MONTEIRO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 262.50, balancePrevious: 342.60, currentBalance: 222.60, rechargeNeeded: 39.90, highlightType: null },
  { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 137.50, highlightType: null },
  { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 193.75, highlightType: null },
  { employeeName: 'PAMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 287.50, highlightType: null },
  { employeeName: 'PEDRO CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 63.75, currentBalance: -56.25, rechargeNeeded: 331.25, highlightType: 'red' },
  { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 237.50, highlightType: null },
  { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 20.20, voltaCost: 20.20, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 888.80, highlightType: 'orange' },
  { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.50, currentBalance: 137.50, rechargeNeeded: 187.50, highlightType: null },
  { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 95.00, currentBalance: -25.00, rechargeNeeded: 212.50, highlightType: 'red' },
  { employeeName: 'ROSILENE MENDES DE BRITO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 195.00, currentBalance: 75.00, rechargeNeeded: 112.50, highlightType: null },
  { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 120.00, currentBalance: 0.00, rechargeNeeded: 275.00, highlightType: null },
  { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 113.75, currentBalance: -6.25, rechargeNeeded: 193.75, highlightType: 'red' },
  { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 70.00, currentBalance: -50.00, rechargeNeeded: 325.00, highlightType: 'red' },
  { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 540.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 540.00, highlightType: 'orange' },
  { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 175.00, highlightType: null },
  { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
  { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 313.75, currentBalance: 193.75, rechargeNeeded: 131.25, highlightType: null },
  { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 95.00, currentBalance: -25.00, rechargeNeeded: 187.50, highlightType: 'red' },
  { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 87.50, highlightType: null },
  { employeeName: 'KAUA HENRIQUE FERREIRA DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 145.00, currentBalance: 0.00, rechargeNeeded: 145.00, highlightType: null },
  { employeeName: 'RITA RENATA MOREIRA XAVIER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 150.00, currentBalance: 0.00, rechargeNeeded: 150.00, highlightType: null },
  { employeeName: 'YASMIN LORENI DE SOUZA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 275.00, highlightType: null }
];

// July 2026 (from scratch/import_vt_july.mjs)
const vtDataJuly = [
  { name: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '81.25', daysCount: '23' },
  { name: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '112.50', daysCount: '23' },
  { name: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: '6.25', voltaCost: '12.50', dailyCost: '18.75', workSchedule: '2ª A 6ª', currentBalance: '206.25', daysCount: '23' },
  { name: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '200.00', daysCount: '27' },
  { name: 'ANA CAROLINA LOPES SOUSA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '87.50', daysCount: '16' },
  { name: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '150.00', daysCount: '27' },
  { name: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '93.75', daysCount: '27' },
  { name: 'AVILMAR FERREIRA SANTOS', idaCost: '13.95', voltaCost: '6.25', dailyCost: '40.40', workSchedule: '2ª A 6ª', currentBalance: '0.00', daysCount: '23' },
  { name: 'BARBARA COSTA PEREIRA', idaCost: '8.45', voltaCost: '8.45', dailyCost: '16.90', workSchedule: '2ª A 6ª', currentBalance: '0.00', daysCount: '23' },
  { name: 'CAMILA GABRIELE SANTOS SOUZA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '275.00', daysCount: '27' },
  { name: 'CARLA EDUARDA DA SILVA MENDES', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '-43.75', daysCount: '27' },
  { name: 'CASSIA APARECIDA DE AVILA', idaCost: '17.00', voltaCost: '17.00', dailyCost: '34.00', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '0.00', daysCount: '27' },
  { name: 'CATIA BATISTA DE OLIVEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '200.00', daysCount: '27' },
  { name: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '-18.75', daysCount: '27' },
  { name: 'CLEIDE MOREIRA ROCHA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '-18.75', daysCount: '27' },
  { name: 'DAIANE CARVALHO SILVA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '112.50', daysCount: '27' },
  { name: 'DALVA TEOFILO DE ALMEIDA', idaCost: '5.95', voltaCost: '5.95', dailyCost: '11.90', workSchedule: '12x36', currentBalance: '143.75', daysCount: '6' },
  { name: 'DANIELY ALVES DE SOUZA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '225.00', daysCount: '27' },
  { name: 'DAVINE TAMARA RODRIGUES', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '112.50', daysCount: '27' },
  { name: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '168.75', daysCount: '27' },
  { name: 'DEISE GRAZIELA CARDOSO PINTO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '231.25', daysCount: '27' },
  { name: 'DEUZENITE PEREIRA FRANCISCO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '125.00', daysCount: '27' },
  { name: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '-112.50', daysCount: '16' },
  { name: 'ELIANE DE PAULA FERREIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12x36', currentBalance: '-43.75', daysCount: '4' },
  { name: 'ELISIANE FIRMINO DE PAULO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '68.75', daysCount: '27' },
  { name: 'GABRIELLY GONÇAVES DUARTE', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '12.50', daysCount: '23' },
  { name: 'GISLAINE MOREIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '281.25', daysCount: '27' },
  { name: 'GIULLIA HANNA SANTOS', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '125.00', daysCount: '23' },
  { name: 'GUILHERME FERREIRA MOZONI', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '93.75', daysCount: '27' },
  { name: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '345.10', daysCount: '27' },
  { name: 'IANKA LORRANY DE CARVALHO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '243.75', daysCount: '27' },
  { name: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '181.25', daysCount: '27' },
  { name: 'IZAMARA DE JESUS SILVA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '25.00', daysCount: '16' },
  { name: 'JAINE PINHEIRO PAIM', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '31.25', daysCount: '27' },
  { name: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12x36', currentBalance: '135.00', daysCount: '16' },
  { name: 'JESSICA LUCIANA GONÇALVES DE ARAUJO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '143.75', daysCount: '27' },
  { name: 'JHENIFER FAUSTINO DIAS', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '106.25', daysCount: '27' },
  { name: 'JHONATA BATISTA LOPES', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '125.00', daysCount: '16' },
  { name: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '225.00', daysCount: '27' },
  { name: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '-12.50', daysCount: '27' },
  { name: 'JOSE DOS SANTOS VIEIRA DO CARMO', idaCost: '11.90', voltaCost: '11.90', dailyCost: '23.80', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '406.25', daysCount: '27' },
  { name: 'JURANDI BASTOS GOVEIA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '-6.25', daysCount: '5' },
  { name: 'KAUA HENRIQUE FERREIRA DA SILVA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '-34.80', daysCount: '23' },
  { name: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '269.65', daysCount: '27' },
  { name: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: '8.45', voltaCost: '8.45', dailyCost: '16.90', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '0.00', daysCount: '27' },
  { name: 'LEANDRO AUGUSTO DO CARMO', idaCost: '10.40', voltaCost: '10.40', dailyCost: '20.80', workSchedule: '12X36', currentBalance: '0.00', daysCount: '0' },
  { name: 'LEILA DOS SANTOS COSTA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '225.00', daysCount: '27' },
  { name: 'LETICIA DE OLIVEIRA BRAGA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '162.50', daysCount: '27' },
  { name: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ESPIRITO SANTO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '501.25', daysCount: '27' },
  { name: 'LORRAINE CRISTINA OLIVEIRA BARBOSA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '138.05', daysCount: '27' },
  { name: 'MARGARETH MARIA TEIXEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '37.50', daysCount: '27' },
  { name: 'MARIANA DE MORAIS CARVALHO', idaCost: '17.45', voltaCost: '17.45', dailyCost: '34.90', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '0.00', daysCount: '27' },
  { name: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '125.00', daysCount: '23' },
  { name: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '156.25', daysCount: '27' },
  { name: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '212.50', daysCount: '27' },
  { name: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '20.30', daysCount: '27' },
  { name: 'MARLENE ELIAS DOS SANTOS', idaCost: '6.25', voltaCost: '12.50', dailyCost: '18.75', workSchedule: '12X36', currentBalance: '-6.25', daysCount: '5' },
  { name: 'MARLY MARQUES DE OLIVEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '250.00', daysCount: '27' },
  { name: 'MAYANE CABRAL DA MOTA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '116.30', daysCount: '16' },
  { name: 'MIGUEL MONTEIRO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'TERÇA A SÁBADO', currentBalance: '150.00', daysCount: '23' },
  { name: 'NATÁLIA GERALDA DE SOUZA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '137.50', daysCount: '27' },
  { name: 'NYCOLE GOMES SOARES', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '187.50', daysCount: '27' },
  { name: 'PAMELA CRISTINA DE SOUZA MATOS', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '200.00', daysCount: '27' },
  { name: 'PEDRO CASTRO DE ALMEIDA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '-120.00', daysCount: '23' },
  { name: 'POLIANA SABRINA MARTINS DUARTE', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '100.00', daysCount: '23' },
  { name: 'RITA RENATA MOREIRA XAVIER', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '-56.25', daysCount: '23' },
  { name: 'ROSANA BARBOSA DOS SANTOS', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '237.50', daysCount: '27' },
  { name: 'ROSEMARY ARANTES BORGES', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12x36', currentBalance: '-12.50', daysCount: '5' },
  { name: 'ROSILENE MENDES DE BRITO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '37.50', daysCount: '4' },
  { name: 'SERAFINA APARECIDA DOS SANTOS', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '-18.75', daysCount: '5' },
  { name: 'SHEILA FERREIRA SCHUFFNER', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '162.50', daysCount: '27' },
  { name: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '118.75', daysCount: '27' },
  { name: 'SILVANA RODRIGUES MARQUES', idaCost: '18.00', voltaCost: '18.00', dailyCost: '36.00', workSchedule: '12X36', currentBalance: '0.00', daysCount: '16' },
  { name: 'SUELLEN COSTA AMELIO', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '-37.50', daysCount: '16' },
  { name: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '162.50', daysCount: '27' },
  { name: 'TATIELE VITOR DE OLIVEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '287.50', daysCount: '27' },
  { name: 'THALITA MAIA NOGUEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '12X36', currentBalance: '-106.25', daysCount: '16' },
  { name: 'THAMER MAIA NOGUEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '37.50', daysCount: '23' },
  { name: 'YASMIN LORENI DE SOUZA SILVA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '136.25', daysCount: '23' },
  { name: 'ANA CLAUDIA PEREIRA ROSA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SABADO', currentBalance: '0.00', daysCount: '5' },
  { name: 'ANDRESSA DOS ANJOS FERREIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SABADO', currentBalance: '0.00', daysCount: '5' },
  { name: 'BRENO PORTES DE OLIVEIRA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '0.00', daysCount: '15' },
  { name: 'GEISIANE MORAIS CARVALHO GONZAGA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: 'SEGUNDA A SÁBADO', currentBalance: '0.00', daysCount: '7' },
  { name: 'VITORIA MARIA BALDAIA OLIVEIRA COSTA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '0.00', daysCount: '13' }
];

// August 2026
const defaultAugustData = [
  { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 131.25, highlightType: null },
  { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 176.25, currentBalance: 56.25, rechargeNeeded: 206.25, highlightType: null },
  { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 393.75, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 237.50, highlightType: null },
  { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 382.50, currentBalance: 262.50, rechargeNeeded: 62.50, highlightType: null },
  { employeeName: 'ANA CAROLINA LOPES SOUSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 150.00, highlightType: null },
  { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.00, currentBalance: 175.00, rechargeNeeded: 150.00, highlightType: null },
  { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 80.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 80.80, highlightType: 'orange' },
  { employeeName: 'BARBARA COSTA PEREIRA', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: '2ª A 6ª', expectedValue: 354.90, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 354.90, highlightType: 'orange' },
  { employeeName: 'BRENO PORTES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 106.25, highlightType: null },
  { employeeName: 'CAMILA GABRIELE SANTOS SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 395.00, currentBalance: 275.00, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 143.75, highlightType: null },
  { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 884.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 884.00, highlightType: 'orange' },
  { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 106.25, highlightType: null },
  { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
  { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 137.50, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 68.75, highlightType: null },
  { employeeName: 'DAIANE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 382.50, currentBalance: 262.50, rechargeNeeded: 62.50, highlightType: null },
  { employeeName: 'DANIELY ALVES DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 332.50, currentBalance: 212.50, rechargeNeeded: 112.50, highlightType: null },
  { employeeName: 'DAVINE TAMARA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 301.25, currentBalance: 181.25, rechargeNeeded: 143.75, highlightType: null },
  { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 382.50, currentBalance: 262.50, rechargeNeeded: 62.50, highlightType: null },
  { employeeName: 'DEISE GRAZIELE CARDOSO PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 137.50, highlightType: null },
  { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 181.25, highlightType: null },
  { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 195.00, currentBalance: 75.00, rechargeNeeded: 125.00, highlightType: null },
  { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 212.50, highlightType: null },
  { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 176.25, currentBalance: 56.25, rechargeNeeded: 206.25, highlightType: null },
  { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 401.25, currentBalance: 281.25, rechargeNeeded: 43.75, highlightType: null },
  { employeeName: 'GIULLIA HANNA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 43.75, highlightType: null },
  { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 206.25, highlightType: null },
  { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 343.85, currentBalance: 223.85, rechargeNeeded: 101.15, highlightType: null },
  { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 401.25, currentBalance: 281.25, rechargeNeeded: -81.25, highlightType: 'yellow' },
  { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 175.00, highlightType: null },
  { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
  { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 68.75, highlightType: null },
  { employeeName: 'JESSICA LUCIANA GONÇALVES DE ARAUJO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
  { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 181.25, highlightType: null },
  { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 62.50, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 370.00, currentBalance: 250.00, rechargeNeeded: 75.00, highlightType: null },
  { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 445.00, currentBalance: 325.00, rechargeNeeded: 60.00, highlightType: null },
  { employeeName: 'JOSE DOS SANTOS VIEIRA DO CARMO', idaCost: 12.50, voltaCost: 12.50, dailyCost: 25.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 650.00, balancePrevious: 475.10, currentBalance: 355.10, rechargeNeeded: 294.90, highlightType: null },
  { employeeName: 'KAUA HENRIQUE FERREIRA DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 120.00, currentBalance: 0.00, rechargeNeeded: 262.50, highlightType: null },
  { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.55, currentBalance: 137.55, rechargeNeeded: 187.45, highlightType: null },
  { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 439.40, highlightType: 'orange' },
  { employeeName: 'LEILA DOS SANTOS COSTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 106.25, highlightType: null },
  { employeeName: 'LETICIA DE OLIVEIRA BRAGA', idaCost: 0.00, voltaCost: 6.25, dailyCost: 6.25, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 162.50, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 56.25, highlightType: null },
  { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ESPIRITO SANTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 540.00, currentBalance: 420.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'MARIANA DE MORAIS CARVALHO', idaCost: 17.45, voltaCost: 17.45, dailyCost: 34.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 907.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 907.40, highlightType: 'orange' },
  { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 113.75, currentBalance: -6.25, rechargeNeeded: 268.75, highlightType: 'red' },
  { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 445.00, currentBalance: 325.00, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 137.50, highlightType: null },
  { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 420.00, currentBalance: 300.00, rechargeNeeded: 25.00, highlightType: null },
  { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 301.25, currentBalance: 181.25, rechargeNeeded: 143.75, highlightType: null },
  { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 86.20, currentBalance: -33.80, rechargeNeeded: 233.80, highlightType: 'red' },
  { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 168.75, highlightType: null },
  { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 288.75, currentBalance: 168.75, rechargeNeeded: 156.25, highlightType: null },
  { employeeName: 'PAMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 193.75, highlightType: null },
  { employeeName: 'PEDRO CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 382.50, highlightType: 'red' },
  { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 313.75, currentBalance: 193.75, rechargeNeeded: 68.75, highlightType: null },
  { employeeName: 'RITA RENATA MOREIRA XAVIER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 376.25, currentBalance: 256.25, rechargeNeeded: 10.00, highlightType: null },
  { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 395.00, currentBalance: 275.00, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.50, currentBalance: 137.50, rechargeNeeded: 187.50, highlightType: null },
  { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 332.50, currentBalance: 212.50, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 576.00, balancePrevious: 468.00, currentBalance: 0.00, rechargeNeeded: 108.00, highlightType: 'orange' },
  { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.50, currentBalance: 137.50, rechargeNeeded: 187.50, highlightType: null },
  { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 388.75, currentBalance: 268.75, rechargeNeeded: 56.25, highlightType: null },
  { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 138.75, currentBalance: 18.75, rechargeNeeded: 181.25, highlightType: null },
  { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 56.25, highlightType: null },
  { employeeName: 'VITORIA MARIA BALDAIA OLIVEIRA COSTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 182.50, currentBalance: 62.50, rechargeNeeded: 200.00, highlightType: null },
  { employeeName: 'YASMIN LORENI DE SOUZA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 357.50, currentBalance: 237.50, rechargeNeeded: 50.00, highlightType: null }
];

async function seed() {
  console.log("=== INICIANDO SINCRONIZAÇÃO E SEED DE VALES-TRANSPORTE ===");

  // 1. Get all employees in Firestore
  const empSnapshot = await db.collection('employees').get();
  const dbEmployees = [];
  empSnapshot.forEach(doc => {
    dbEmployees.push({ id: doc.id, ...doc.data() });
  });
  console.log(`Carregados ${dbEmployees.length} colaboradores do Firestore.`);

  // 2. Helper to find or create employee
  async function resolveEmployee(rawName) {
    if (!rawName) return { id: 'emp-unknown', name: 'Desconhecido' };
    const norm = rawName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let match = dbEmployees.find(e => {
      if (!e.name) return false;
      const eNorm = e.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return eNorm === norm || eNorm.includes(norm) || norm.includes(eNorm);
    });

    if (match) {
      return match;
    }

    console.log(`Criando funcionário para histórico de VT: ${rawName}`);
    const newDoc = await db.collection('employees').add({
      name: rawName.trim().toUpperCase(),
      role: 'Colaborador CLT',
      status: 'Ativo',
      sectorId: 'recursos_humanos_kjmz',
      salary: 2500,
      createdAt: new Date().toISOString()
    });
    const created = { id: newDoc.id, name: rawName.trim().toUpperCase() };
    dbEmployees.push(created);
    return created;
  }

  // 3. Load existing transport_vouchers
  const vSnapshot = await db.collection('transport_vouchers').get();
  const existingVouchers = [];
  vSnapshot.forEach(doc => existingVouchers.push({ id: doc.id, ...doc.data() }));
  console.log(`Documentos existentes em transport_vouchers: ${existingVouchers.length}`);

  // Update existing vouchers without period to 2026-08
  for (const ev of existingVouchers) {
    if (!ev.period) {
      console.log(`Atualizando período do vale existente ${ev.id} para 2026-08...`);
      const emp = dbEmployees.find(e => e.id === ev.employeeId);
      const ida = parseFloat(ev.idaCost) || 0;
      const volta = parseFloat(ev.voltaCost) || 0;
      const daily = parseFloat(ev.dailyCost) || (ida + volta);
      const days = parseInt(ev.daysCount) || 22;
      const expected = daily * days;
      const curBal = parseFloat(ev.currentBalance) || 0;
      const recharge = Math.max(0, expected - curBal);

      await db.collection('transport_vouchers').doc(ev.id).update({
        period: '2026-08',
        employeeName: emp?.name || ev.employeeName || 'Colaborador',
        expectedValue: expected,
        totalValue: expected,
        rechargeNeeded: recharge,
        rawRechargeNeeded: expected - curBal
      });
    }
  }

  // Helper to process standard dataset
  async function processStandardDataset(period, dataList) {
    console.log(`\nProcessando período ${period} (${dataList.length} itens)...`);
    let added = 0;
    let updated = 0;

    for (let idx = 0; idx < dataList.length; idx++) {
      const row = dataList[idx];
      const emp = await resolveEmployee(row.employeeName);
      
      const ida = parseFloat(row.idaCost) || 0;
      const volta = parseFloat(row.voltaCost) || 0;
      const daily = parseFloat(row.dailyCost) || (ida + volta);
      const exp = parseFloat(row.expectedValue) || (daily * 22);
      const curBal = parseFloat(row.currentBalance) || 0;
      const recNeeded = parseFloat(row.rechargeNeeded) !== undefined ? parseFloat(row.rechargeNeeded) : Math.max(0, exp - curBal);
      const days = row.workSchedule === '2ª A 6ª' ? 22 : (row.workSchedule === '12X36' ? 15 : 26);

      const existing = existingVouchers.find(v => v.period === period && (v.employeeId === emp.id || (v.employeeName && v.employeeName.trim().toLowerCase() === row.employeeName.trim().toLowerCase())));

      const docData = {
        employeeId: emp.id,
        employeeName: emp.name || row.employeeName,
        route: 'Linha Urbana - Betim / BH',
        idaCost: ida.toFixed(2),
        voltaCost: volta.toFixed(2),
        dailyCost: daily.toFixed(2),
        workSchedule: row.workSchedule || 'SEGUNDA A SÁBADO',
        daysCount: days.toString(),
        expectedValue: exp,
        totalValue: exp,
        balancePrevious: row.balancePrevious !== undefined ? parseFloat(row.balancePrevious) : 0,
        currentBalance: curBal,
        rechargeNeeded: recNeeded,
        rawRechargeNeeded: row.rechargeNeeded !== undefined ? parseFloat(row.rechargeNeeded) : (exp - curBal),
        cardType: 'BetimCARD',
        cardNumber: '31' + String(100000 + idx),
        discountPercent: '6',
        period: period,
        highlightType: row.highlightType || null,
        updatedAt: new Date().toISOString()
      };

      if (existing) {
        await db.collection('transport_vouchers').doc(existing.id).update(docData);
        updated++;
      } else {
        docData.createdAt = new Date().toISOString();
        const ref = await db.collection('transport_vouchers').add(docData);
        existingVouchers.push({ id: ref.id, ...docData });
        added++;
      }
    }
    console.log(`Período ${period} finalizado: ${added} adicionados, ${updated} atualizados.`);
  }

  // Helper to process July dataset
  async function processJulyDataset() {
    const period = '2026-07';
    console.log(`\nProcessando período ${period} (Julho - ${vtDataJuly.length} itens)...`);
    let added = 0;
    let updated = 0;

    for (let idx = 0; idx < vtDataJuly.length; idx++) {
      const row = vtDataJuly[idx];
      const emp = await resolveEmployee(row.name);
      
      const ida = parseFloat(row.idaCost) || 0;
      const volta = parseFloat(row.voltaCost) || 0;
      const daily = parseFloat(row.dailyCost) || (ida + volta);
      const days = parseInt(row.daysCount) || (row.workSchedule === '2ª A 6ª' ? 22 : 26);
      const exp = daily * days;
      const curBal = parseFloat(row.currentBalance) || 0;
      const recNeeded = Math.max(0, exp - curBal);

      const existing = existingVouchers.find(v => v.period === period && (v.employeeId === emp.id || (v.employeeName && v.employeeName.trim().toLowerCase() === row.name.trim().toLowerCase())));

      const docData = {
        employeeId: emp.id,
        employeeName: emp.name || row.name,
        route: 'Linha Urbana - Betim / BH',
        idaCost: ida.toFixed(2),
        voltaCost: volta.toFixed(2),
        dailyCost: daily.toFixed(2),
        workSchedule: row.workSchedule || 'SEGUNDA A SÁBADO',
        daysCount: days.toString(),
        expectedValue: exp,
        totalValue: exp,
        balancePrevious: 0,
        currentBalance: curBal,
        rechargeNeeded: recNeeded,
        rawRechargeNeeded: exp - curBal,
        cardType: 'BetimCARD',
        cardNumber: '31' + String(300000 + idx),
        discountPercent: '6',
        period: period,
        highlightType: curBal < 0 ? 'red' : (recNeeded === 0 ? 'yellow' : null),
        updatedAt: new Date().toISOString()
      };

      if (existing) {
        await db.collection('transport_vouchers').doc(existing.id).update(docData);
        updated++;
      } else {
        docData.createdAt = new Date().toISOString();
        const ref = await db.collection('transport_vouchers').add(docData);
        existingVouchers.push({ id: ref.id, ...docData });
        added++;
      }
    }
    console.log(`Período ${period} finalizado: ${added} adicionados, ${updated} atualizados.`);
  }

  // Run all periods
  await processStandardDataset('2026-03', defaultMarchData);
  await processStandardDataset('2026-04', defaultAprilData);
  await processStandardDataset('2026-05', defaultMayData);
  await processStandardDataset('2026-06', defaultJuneData);
  await processJulyDataset();
  await processStandardDataset('2026-08', defaultAugustData);

  console.log("\n=== SEED E SINCRONIZAÇÃO CONCLUÍDOS COM SUCESSO! ===");
  process.exit(0);
}

seed().catch(err => {
  console.error("Erro no seed:", err);
  process.exit(1);
});

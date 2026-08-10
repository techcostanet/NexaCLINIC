const fs = require('fs');
const content = fs.readFileSync('src/mockFirebase.js', 'utf-8');

const febData = [
  { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 111.90, currentBalance: -8.10, rechargeNeeded: 250.00, highlightType: 'red' },
  { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 284.45, currentBalance: 164.45, rechargeNeeded: 85.55, highlightType: null },
  { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 375.00, balancePrevious: 302.30, currentBalance: 182.30, rechargeNeeded: 192.70, highlightType: null },
  { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 338.00, currentBalance: 218.00, rechargeNeeded: 82.00, highlightType: null },
  { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 236.85, currentBalance: 116.85, rechargeNeeded: 183.15, highlightType: null },
  { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 201.15, currentBalance: 81.15, rechargeNeeded: 218.85, highlightType: null },
  { employeeName: 'ANA PAULA DE OLIVEIRA EFIGENIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 165.45, currentBalance: 45.45, rechargeNeeded: 129.55, highlightType: null },
  { employeeName: 'ANDRÉA RODRIGUES SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 105.95, currentBalance: -14.05, rechargeNeeded: 189.05, highlightType: 'red' },
  { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 100.00, currentBalance: -20.00, rechargeNeeded: 250.00, highlightType: 'red' },
  { employeeName: 'CAROLINA CÁTIA FERNANDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 207.10, currentBalance: 87.10, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 230.90, currentBalance: 110.90, rechargeNeeded: 189.10, highlightType: null },
  { employeeName: 'CLAUDICELIA RODRIGUES FÉLIX', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 290.40, currentBalance: 170.40, rechargeNeeded: 129.60, highlightType: null },
  { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 100.00, currentBalance: -20.00, rechargeNeeded: 300.00, highlightType: 'red' },
  { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 177.35, currentBalance: 57.35, rechargeNeeded: 242.65, highlightType: null },
  { employeeName: 'DENISE VIEIRA MARQUES RODRIGUES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: '2ª A 6ª', expectedValue: 338.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 338.00, highlightType: 'orange' },
  { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 300.00, highlightType: null },
  { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 3.65, currentBalance: -116.35, rechargeNeeded: 175.00, highlightType: 'red' },
  { employeeName: 'ELIANE ROSA MIRANDA GONÇALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 284.45, currentBalance: 164.45, rechargeNeeded: 135.55, highlightType: null },
  { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 266.60, currentBalance: 146.60, rechargeNeeded: 153.40, highlightType: null },
  { employeeName: 'EMANUELLE MOREIRA FERREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 96.45, currentBalance: -23.55, rechargeNeeded: 300.00, highlightType: 'red' },
  { employeeName: 'ERLAINE KELLE SOUZA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 83.51, currentBalance: -36.49, rechargeNeeded: 175.00, highlightType: 'red' },
  { employeeName: 'ESTHER GOMES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 223.49, currentBalance: 103.49, rechargeNeeded: 196.51, highlightType: null },
  { employeeName: 'FABIOLA NUNES AMARAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 355.55, currentBalance: 235.55, rechargeNeeded: 64.45, highlightType: null },
  { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 184.25, currentBalance: 64.25, rechargeNeeded: 235.75, highlightType: null },
  { employeeName: 'GLACE KELLEN DOS SANTOS BERNARDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 353.50, currentBalance: 233.50, rechargeNeeded: 66.50, highlightType: null },
  { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 381.15, currentBalance: 261.15, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 228.60, currentBalance: 108.60, rechargeNeeded: 191.40, highlightType: null },
  { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 3.85, currentBalance: -116.15, rechargeNeeded: 175.00, highlightType: 'red' },
  { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 100.00, currentBalance: -20.00, rechargeNeeded: 300.00, highlightType: 'red' },
  { employeeName: 'JAQUELINA LOURENÇO DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 213.05, currentBalance: 93.05, rechargeNeeded: 81.95, highlightType: null },
  { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 213.05, currentBalance: 93.05, rechargeNeeded: 81.95, highlightType: null },
  { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 326.10, currentBalance: 206.10, rechargeNeeded: 93.90, highlightType: null },
  { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 217.00, currentBalance: 97.00, rechargeNeeded: 78.00, highlightType: null },
  { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 230.90, currentBalance: 110.90, rechargeNeeded: 189.10, highlightType: null },
  { employeeName: 'JOELMA SANTOS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 352.00, currentBalance: 232.00, rechargeNeeded: 68.00, highlightType: null },
  { employeeName: 'JULIETA GLEUMA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 76.20, currentBalance: -43.80, rechargeNeeded: 250.00, highlightType: 'red' },
  { employeeName: 'KAREN TAMARA ALVES TOTOU XISTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 153.55, currentBalance: 33.55, rechargeNeeded: 216.45, highlightType: null },
  { employeeName: 'KATIANE DE SOUZA GALHARDO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 272.55, currentBalance: 152.55, rechargeNeeded: 147.45, highlightType: null },
  { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 224.95, currentBalance: 104.95, rechargeNeeded: 195.05, highlightType: null },
  { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 10.40, voltaCost: 10.40, dailyCost: 20.80, workSchedule: '12X36', expectedValue: 291.20, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 291.20, highlightType: 'orange' },
  { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 327.05, currentBalance: 207.05, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'LETÍCIA CARMO SILVA CRUZ', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 159.50, currentBalance: 39.50, rechargeNeeded: 260.50, highlightType: null },
  { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 338.35, currentBalance: 218.35, rechargeNeeded: 81.65, highlightType: null },
  { employeeName: 'LORRAINE CRISTINA OLIVEIRA BARBOSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 278.50, currentBalance: 158.50, rechargeNeeded: 141.50, highlightType: null },
  { employeeName: 'LUCILENE RAMOS RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 111.90, currentBalance: -8.10, rechargeNeeded: 183.10, highlightType: 'red' },
  { employeeName: 'LUZIA APARECIDA PEREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 282.65, currentBalance: 162.65, rechargeNeeded: 137.35, highlightType: null },
  { employeeName: 'MARIANE GOMES MELO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 242.80, currentBalance: 122.80, rechargeNeeded: 177.20, highlightType: null },
  { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 304.95, currentBalance: 184.95, rechargeNeeded: 115.05, highlightType: null },
  { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 367.75, currentBalance: 247.75, rechargeNeeded: 52.25, highlightType: null },
  { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 262.50, balancePrevious: 248.75, currentBalance: 128.75, rechargeNeeded: 133.75, highlightType: null },
  { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 221.59, currentBalance: 101.59, rechargeNeeded: 198.41, highlightType: null },
  { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 323.60, currentBalance: 203.60, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 324.00, currentBalance: 204.00, rechargeNeeded: 96.00, highlightType: null },
  { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 260.65, currentBalance: 140.65, rechargeNeeded: 159.35, highlightType: null },
  { employeeName: 'PÂMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 260.65, currentBalance: 140.65, rechargeNeeded: 159.35, highlightType: null },
  { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 285.70, currentBalance: 165.70, rechargeNeeded: 84.30, highlightType: null },
  { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 20.20, voltaCost: 20.20, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 808.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 808.00, highlightType: 'orange' },
  { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 289.15, currentBalance: 169.15, rechargeNeeded: 130.85, highlightType: null },
  { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 97.90, currentBalance: -22.10, rechargeNeeded: 175.00, highlightType: 'red' },
  { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 159.50, currentBalance: 39.50, rechargeNeeded: 210.50, highlightType: null },
  { employeeName: 'SABRINA VITÓRIA ASSUNÇÃO VIANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 242.80, currentBalance: 122.80, rechargeNeeded: 177.20, highlightType: null },
  { employeeName: 'SAMAIA DA COSTA BATISTA MELO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 58.35, currentBalance: -61.65, rechargeNeeded: 175.00, highlightType: 'red' },
  { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 189.25, currentBalance: 69.25, rechargeNeeded: 105.75, highlightType: null },
  { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 236.85, currentBalance: 116.85, rechargeNeeded: 183.15, highlightType: null },
  { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 153.55, currentBalance: 33.55, rechargeNeeded: 266.45, highlightType: null },
  { employeeName: 'SILVANA FERNANDA NUNES LELIS', idaCost: 12.50, voltaCost: 12.50, dailyCost: 25.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 600.00, balancePrevious: 504.60, currentBalance: 384.60, rechargeNeeded: 215.40, highlightType: null },
  { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 504.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 504.00, highlightType: 'orange' },
  { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 147.60, currentBalance: 27.60, rechargeNeeded: 147.40, highlightType: null },
  { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 254.70, currentBalance: 134.70, rechargeNeeded: 165.30, highlightType: null },
  { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 273.70, currentBalance: 153.70, rechargeNeeded: 146.30, highlightType: null },
  { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 156.00, currentBalance: 36.00, rechargeNeeded: 139.00, highlightType: null },
  { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 248.75, currentBalance: 128.75, rechargeNeeded: 121.25, highlightType: null },
  { employeeName: 'VICTOR HENRIQUE SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 165.45, currentBalance: 45.45, rechargeNeeded: 129.55, highlightType: null },
  { employeeName: 'VITOR EMANUEL MENEZES NOVAIS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 123.80, currentBalance: 3.80, rechargeNeeded: 246.20, highlightType: null },
  { employeeName: 'WANDA MARIA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 175.00, balancePrevious: 100.00, currentBalance: -20.00, rechargeNeeded: 175.00, highlightType: 'red' },
  { employeeName: 'ELIZABETH FERREIRA TELES SANTANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 225.00, highlightType: null },
  { employeeName: 'FRANCYNE FERRAZ SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 300.00, highlightType: null },
  { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 250.00, highlightType: null },
  { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 250.00, highlightType: null },
  { employeeName: 'IANKA LORRANY DE CARVALHO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 112.50, highlightType: null },
  { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 188.30, highlightType: 'orange' },
  { employeeName: 'LEDA MARIA BELLICO EGG', idaCost: 13.95, voltaCost: 13.95, dailyCost: 27.90, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 530.10, highlightType: 'orange' },
  { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 250.00, highlightType: null },
  { employeeName: 'JOANA CRISTINA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 325.00, rechargeNeeded: 0.00, highlightType: 'yellow' }
];

const janData = [
  { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 153.55, currentBalance: 53.55, rechargeNeeded: 196.35, highlightType: null },
  { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 177.35, currentBalance: 77.35, rechargeNeeded: 232.05, highlightType: null },
  { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 5.95, voltaCost: 11.90, dailyCost: 17.85, workSchedule: '2ª A 6ª', expectedValue: 374.85, balancePrevious: 277.35, currentBalance: 177.35, rechargeNeeded: 197.50, highlightType: null },
  { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 343.95, currentBalance: 243.95, rechargeNeeded: 65.45, highlightType: null },
  { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 100.00, currentBalance: 0.00, rechargeNeeded: 309.40, highlightType: null },
  { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 207.10, currentBalance: 107.10, rechargeNeeded: 202.30, highlightType: null },
  { employeeName: 'ANA LETICIA DA SILVA EVANGELISTA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 321.30, currentBalance: 221.30, rechargeNeeded: 88.10, highlightType: null },
  { employeeName: 'ANA PAULA DE OLIVEIRA EFIGENIO', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 137.40, currentBalance: 37.40, rechargeNeeded: 141.10, highlightType: null },
  { employeeName: 'ANDRÉA RODRIGUES SILVA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 129.75, currentBalance: 29.75, rechargeNeeded: 148.75, highlightType: null },
  { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 135.70, currentBalance: 35.70, rechargeNeeded: 214.20, highlightType: null },
  { employeeName: 'CAROLINA CÁTIA FERNANDES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 195.20, currentBalance: 95.20, rechargeNeeded: 154.70, highlightType: null },
  { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 201.15, currentBalance: 101.15, rechargeNeeded: 148.75, highlightType: null },
  { employeeName: 'CLAUDICELIA RODRIGUES FÉLIX', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 100.00, currentBalance: 0.00, rechargeNeeded: 309.40, highlightType: null },
  { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 123.80, currentBalance: 23.80, rechargeNeeded: 285.60, highlightType: null },
  { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 100.00, currentBalance: 0.00, rechargeNeeded: 309.40, highlightType: null },
  { employeeName: 'CRISTIANA MÁRCIA DE OLIVEIRA DA LUZ', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 105.95, currentBalance: 5.95, rechargeNeeded: 303.45, highlightType: null },
  { employeeName: 'DENISE VIEIRA MARQUES RODRIGUES', idaCost: 7.75, voltaCost: 7.75, dailyCost: 15.50, workSchedule: '2ª A 6ª', expectedValue: 325.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 325.50, highlightType: 'orange' },
  { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 284.45, currentBalance: 184.45, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'ELIANE ROSA MIRANDA GONÇALVES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 88.10, currentBalance: -11.90, rechargeNeeded: 309.40, highlightType: 'red' },
  { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 141.65, currentBalance: 41.65, rechargeNeeded: 267.75, highlightType: null },
  { employeeName: 'EMANUELLE MOREIRA FERREIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 54.80, currentBalance: -45.20, rechargeNeeded: 249.90, highlightType: 'red' },
  { employeeName: 'EMERSON CARDOSO DOS SANTOS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 100.00, currentBalance: 0.00, rechargeNeeded: 309.40, highlightType: null },
  { employeeName: 'ERLAINE KELLE SOUZA RODRIGUES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 65.66, currentBalance: -34.34, rechargeNeeded: 178.50, highlightType: 'red' },
  { employeeName: 'ESTHER GOMES DOS SANTOS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 449.90, currentBalance: 349.90, rechargeNeeded: 0.00, highlightType: null },
  { employeeName: 'FLAVIA CAROLINA DE ROSSI', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 172.50, currentBalance: 0.00, rechargeNeeded: 178.50, highlightType: 'yellow' },
  { employeeName: 'GEOVANA GOMES RODRIGUES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 358.14, currentBalance: 258.14, rechargeNeeded: 51.26, highlightType: null },
  { employeeName: 'GISLAINE MOREIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 218.80, currentBalance: 118.80, rechargeNeeded: 190.60, highlightType: null },
  { employeeName: 'GLACE KELLEN DOS SANTOS BERNARDES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 378.50, currentBalance: 278.50, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 361.80, currentBalance: 261.80, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'INGRID RESENDE DOS SANTOS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 141.65, currentBalance: 41.65, rechargeNeeded: 208.25, highlightType: null },
  { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 94.05, currentBalance: -5.95, rechargeNeeded: 309.40, highlightType: 'red' },
  { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 188.10, currentBalance: 88.10, rechargeNeeded: 90.40, highlightType: null },
  { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 236.85, currentBalance: 136.85, rechargeNeeded: 172.55, highlightType: 'yellow' },
  { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.15, voltaCost: 6.15, dailyCost: 12.30, workSchedule: '12X36', expectedValue: 184.50, balancePrevious: 265.50, currentBalance: 165.50, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 189.25, currentBalance: 89.25, rechargeNeeded: 220.15, highlightType: null },
  { employeeName: 'JOELMA SANTOS SILVA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 408.25, currentBalance: 308.25, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'JULIETA GLEUMA DE OLIVEIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 70.25, currentBalance: -29.75, rechargeNeeded: 249.90, highlightType: 'red' },
  { employeeName: 'KAREN TAMARA ALVES TOTOU XISTO', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 147.60, currentBalance: 47.60, rechargeNeeded: 202.30, highlightType: null },
  { employeeName: 'KATIANE DE SOUZA GALHARDO', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 236.85, currentBalance: 136.85, rechargeNeeded: 172.55, highlightType: null },
  { employeeName: 'LAYESCA BRANDÃO RODRIGUES ALMEIDA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 171.40, currentBalance: 71.40, rechargeNeeded: 178.50, highlightType: null },
  { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 9.55, voltaCost: 9.55, dailyCost: 19.10, workSchedule: '12X36', expectedValue: 286.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 286.50, highlightType: 'orange' },
  { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 348.75, currentBalance: 248.75, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'LETÍCIA CARMO SILVA CRUZ', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 129.75, currentBalance: 29.75, rechargeNeeded: 279.65, highlightType: null },
  { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 363.05, currentBalance: 263.05, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'LORRAINE CRISTINA OLIVEIRA BARBOSA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 231.36, currentBalance: 131.36, rechargeNeeded: 178.04, highlightType: null },
  { employeeName: 'LUCIANE MACÊDO DE MENEZES ALVES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 219.00, currentBalance: 119.00, rechargeNeeded: 190.40, highlightType: null },
  { employeeName: 'LUCILENE RAMOS RODRIGUES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 94.05, currentBalance: -5.95, rechargeNeeded: 178.50, highlightType: 'red' },
  { employeeName: 'LUZIA APARECIDA PEREIRA DOS SANTOS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 290.40, currentBalance: 190.40, rechargeNeeded: 119.00, highlightType: null },
  { employeeName: 'MARIANE GOMES MELO SILVA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 177.35, currentBalance: 77.35, rechargeNeeded: 232.05, highlightType: null },
  { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 290.40, currentBalance: 190.40, rechargeNeeded: 119.00, highlightType: null },
  { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 320.15, currentBalance: 220.15, rechargeNeeded: 89.25, highlightType: null },
  { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 5.95, voltaCost: 11.90, dailyCost: 17.85, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 464.10, balancePrevious: 230.90, currentBalance: 130.90, rechargeNeeded: 333.20, highlightType: null },
  { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 384.45, currentBalance: 284.45, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 188.10, currentBalance: 88.10, rechargeNeeded: 221.30, highlightType: null },
  { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 298.75, currentBalance: 198.75, rechargeNeeded: 110.65, highlightType: null },
  { employeeName: 'NYCOLE GOMES SOARES', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 159.50, currentBalance: 59.50, rechargeNeeded: 249.90, highlightType: null },
  { employeeName: 'PÂMELA CRISTINA DE SOUZA MATOS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 296.35, currentBalance: 196.35, rechargeNeeded: 113.05, highlightType: null },
  { employeeName: 'PAULO RODRIGUES DAMASCENO', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: 'yellow' },
  { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 330.90, currentBalance: 230.90, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 18.55, voltaCost: 18.55, dailyCost: 37.10, workSchedule: '2ª A 6ª', expectedValue: 779.10, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 779.10, highlightType: 'orange' },
  { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 326.10, currentBalance: 226.10, rechargeNeeded: 83.30, highlightType: null },
  { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 159.50, currentBalance: 59.50, rechargeNeeded: 190.40, highlightType: null },
  { employeeName: 'SABRINA VITÓRIA ASSUNÇÃO VIANA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 242.80, currentBalance: 142.80, rechargeNeeded: 166.60, highlightType: null },
  { employeeName: 'SAMAIA DA COSTA BATISTA MELO', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 117.85, currentBalance: 17.85, rechargeNeeded: 160.65, highlightType: null },
  { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 201.15, currentBalance: 101.15, rechargeNeeded: 208.25, highlightType: null },
  { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 201.15, currentBalance: 101.15, rechargeNeeded: 208.25, highlightType: null },
  { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 15.40, voltaCost: 15.40, dailyCost: 30.80, workSchedule: '12X36', expectedValue: 462.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 462.00, highlightType: 'orange' },
  { employeeName: 'SILVANA FERNANDA NUNES LELIS', idaCost: 11.90, voltaCost: 11.90, dailyCost: 23.80, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 618.80, balancePrevious: 391.55, currentBalance: 291.55, rechargeNeeded: 327.25, highlightType: null },
  { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 111.90, currentBalance: 11.90, rechargeNeeded: 166.60, highlightType: null },
  { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 207.10, currentBalance: 107.10, rechargeNeeded: 202.30, highlightType: null },
  { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 290.40, currentBalance: 190.40, rechargeNeeded: 119.00, highlightType: null },
  { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 298.25, currentBalance: 198.25, rechargeNeeded: 50.00, highlightType: null },
  { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 82.15, currentBalance: -17.85, rechargeNeeded: 249.90, highlightType: 'red' },
  { employeeName: 'VITOR EMANUEL MENEZES NOVAIS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '2ª A 6ª', expectedValue: 249.90, balancePrevious: 165.45, currentBalance: 65.45, rechargeNeeded: 184.45, highlightType: null },
  { employeeName: 'WANDA MARIA DOS SANTOS', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: '12X36', expectedValue: 178.50, balancePrevious: 105.95, currentBalance: 5.95, rechargeNeeded: 172.55, highlightType: null },
  { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 287.50, highlightType: 'red' },
  { employeeName: 'JAQUELINA LOURENÇO DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 162.50, highlightType: 'red' },
  { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 162.50, highlightType: 'red' },
  { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 162.50, highlightType: 'red' },
  { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 218.78, highlightType: 'red' },
  { employeeName: 'VICTOR HENRIQUE SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 75.00, highlightType: 'red' },
  { employeeName: 'FABIOLA NUNES AMARAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 112.50, highlightType: 'red' },
  { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 75.00, highlightType: 'red' },
  { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 300.00, highlightType: 'red' },
  { employeeName: 'ESTER FERNANDES', idaCost: 0.00, voltaCost: 0.00, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: -100.00, rechargeNeeded: 250.00, highlightType: 'red' }
];

let updatedContent = content;

// Build injection string
let injection = '';

injection += `
    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-02')) {
      const defaultFebData = ` + JSON.stringify(febData) + `;
      const febVouchers = defaultFebData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtfeb-' + (idx + 1),
            name: v.employeeName,
            role: 'Colaborador CLT',
            sectorId: 'rh',
            admissionDate: '2024-01-01',
            contractType: 'CLT',
            salary: 2500,
            status: 'Ativo',
            city: 'Betim',
            state: 'MG'
          };
          parsed.employees.push(emp);
        }
        return {
          id: 'vt-feb-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 20 : (v.workSchedule === '12X36' ? 14 : 24),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(600000 + idx),
          period: '2026-02',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-02'),
        ...febVouchers
      ];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-01')) {
      const defaultJanData = ` + JSON.stringify(janData) + `;
      const janVouchers = defaultJanData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtjan-' + (idx + 1),
            name: v.employeeName,
            role: 'Colaborador CLT',
            sectorId: 'rh',
            admissionDate: '2024-01-01',
            contractType: 'CLT',
            salary: 2500,
            status: 'Ativo',
            city: 'Betim',
            state: 'MG'
          };
          parsed.employees.push(emp);
        }
        return {
          id: 'vt-jan-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 21 : (v.workSchedule === '12X36' ? 15 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(700000 + idx),
          period: '2026-01',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-01'),
        ...janVouchers
      ];
      updated = true;
    }
`;

updatedContent = updatedContent.replace(
  /(\s+parsed\.transport_vouchers = \[\n\s+\.\.\.\(parsed\.transport_vouchers \|\| \[\]\)\.filter\(v => v\.period !== '2026-03'\),\n\s+\.\.\.marchVouchers\n\s+\];\n\s+updated = true;\n\s+\})/g,
  '$1\n' + injection
);

fs.writeFileSync('src/mockFirebase.js', updatedContent);
console.log('Script ok');

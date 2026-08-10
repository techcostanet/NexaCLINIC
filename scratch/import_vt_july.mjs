import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const vtData = [
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
  { name: 'VITORIA MARIA BALDAIA OLIVEIRA COSTA', idaCost: '6.25', voltaCost: '6.25', dailyCost: '12.50', workSchedule: '2ª A 6ª', currentBalance: '0.00', daysCount: '13' },
];

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const db = getFirestore();
  
  // 1. Get all employees
  const snapshot = await db.collection('employees').get();
  const dbEmployees = [];
  snapshot.forEach(doc => {
    dbEmployees.push({ id: doc.id, ...doc.data() });
  });

  // Also get existing vouchers to avoid duplication or to update
  const vSnapshot = await db.collection('transportVouchers').get();
  const existingVouchers = [];
  vSnapshot.forEach(doc => existingVouchers.push({ id: doc.id, ...doc.data() }));

  let createdCount = 0;
  let updatedCount = 0;
  let notFound = [];

  for (const row of vtData) {
    // Exact or loose match by name
    const normalizedName = row.name.toLowerCase().trim();
    const emp = dbEmployees.find(e => e.name.toLowerCase().trim() === normalizedName);
    
    let targetEmployeeId = '';

    if (emp) {
      targetEmployeeId = emp.id;
    } else {
      console.log(`Creating dummy employee for: ${row.name}`);
      // Create employee if it doesn't exist
      const newEmpRef = await db.collection('employees').add({
        name: row.name,
        role: 'Colaborador',
        status: 'Ativo',
        sectorId: 'hr',
        createdAt: new Date().toISOString()
      });
      targetEmployeeId = newEmpRef.id;
      dbEmployees.push({ id: targetEmployeeId, name: row.name }); // cache
    }

    // Check if voucher exists for this employee
    const existing = existingVouchers.find(v => v.employeeId === targetEmployeeId);

    const voucherData = {
      employeeId: targetEmployeeId,
      idaCost: row.idaCost,
      voltaCost: row.voltaCost,
      dailyCost: row.dailyCost,
      workSchedule: row.workSchedule,
      currentBalance: row.currentBalance,
      daysCount: row.daysCount,
      route: 'Linha Padrão', // Default route since none is provided in PDF
      cardType: 'BHBus',
      discountPercent: '6',
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      await db.collection('transportVouchers').doc(existing.id).update(voucherData);
      updatedCount++;
    } else {
      voucherData.createdAt = new Date().toISOString();
      await db.collection('transportVouchers').add(voucherData);
      createdCount++;
    }
  }

  console.log(`Import completed. Created: ${createdCount}, Updated: ${updatedCount}`);
  process.exit(0);
} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}

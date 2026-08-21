// Mock Firebase Services using LocalStorage
// This allows the app to run immediately without a real Firebase configuration.

import initialSuppliers from './data/initialSuppliers.json';
import initialProducts from './data/initialProducts.json';

const MOCK_STORAGE_KEY = 'sistema_indicadores_mock_db';

const getDefaultPatients = () => [
  {
    "name": "ADAIR PRAXEDES MORENO",
    "cpf": "700.604.366-20",
    "birthDate": "1968-07-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-1",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADAO LUCIANO DIAS",
    "cpf": "031.117.166-43",
    "birthDate": "1972-07-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 60.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-2",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADCELIO BARBOSA DE OLIVEIRA",
    "cpf": "036.567.406-07",
    "birthDate": "1976-12-09",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 49.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-3",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADEJUTO CAMILO ESTEVES NETO",
    "cpf": "018.234.886-50",
    "birthDate": "1968-11-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 72.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-4",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADELINA FERREIRA DE ALMEIDA PEREIRA",
    "cpf": "369.434.362-87",
    "birthDate": "1962-05-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 30.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-5",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADELINO VIEIRA JEREMIAS",
    "cpf": "344.621.396-15",
    "birthDate": "1950-06-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 64.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-6",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADELMARIA ALVES PEREIRA SILVA",
    "cpf": "068.638.836-43",
    "birthDate": "1967-03-26",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-7",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADEMAR GUIMARAES",
    "cpf": "824.118.596-00",
    "birthDate": "1970-02-08",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-8",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADENIR PINTO DE ALMEIDA",
    "cpf": "228.700.086-00",
    "birthDate": "1954-03-07",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-9",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADEZIR JOSE DA SILVA",
    "cpf": "653.390.966-53",
    "birthDate": "1965-05-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-10",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADILSON DIAS TIOTEL",
    "cpf": "059.758.946-11",
    "birthDate": "1976-02-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "",
    "room": "",
    "dryWeight": 54.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-11",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADIRSON MARQUES DA SILVA",
    "cpf": "343.522.606-49",
    "birthDate": "1959-09-07",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 56.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-12",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADRIANA PINHEIRO DE FREITAS",
    "cpf": "016.933.136-93",
    "birthDate": "1993-08-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 42.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-13",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ADRIANO CHACARA DE DEUS",
    "cpf": "842.048.506-34",
    "birthDate": "1971-09-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-14",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "AFONSINA DO AMOR DIVINO",
    "cpf": "033.478.986-99",
    "birthDate": "1949-01-04",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 53.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-15",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "AGNALDO GONCALVES",
    "cpf": "511.591.206-68",
    "birthDate": "1966-03-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-16",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "AGNALDO SIMIAO DA ROCHA",
    "cpf": "455.628.306-04",
    "birthDate": "1961-07-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 136.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-17",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "AGNELO LOPES DE ALMEIDA",
    "cpf": "768.601.916-00",
    "birthDate": "1967-04-24",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 72.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-18",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "AILTON DA CUNHA BATISTA",
    "cpf": "089.906.327-65",
    "birthDate": "1980-09-11",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Florestal",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 121.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-19",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "AILTON NERES DOS SANTOS",
    "cpf": "396.623.655-91",
    "birthDate": "1966-03-09",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 68.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-20",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "AIRTON SANTOS ROSA",
    "cpf": "033.479.566-48",
    "birthDate": "1976-08-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-21",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALAIDE MARIA DE JESUS SILVA",
    "cpf": "250.291.346-20",
    "birthDate": "1954-07-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 73.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-22",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALAN ALVES TEIXEIRA",
    "cpf": "038.028.496-04",
    "birthDate": "1979-01-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 97.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-23",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALCEBIADES GONCALVES DE SOUZA FILHO",
    "cpf": "742.083.306-00",
    "birthDate": "1967-12-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 56.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-24",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALCIDES SOARES JUNIOR",
    "cpf": "051.264.486-17",
    "birthDate": "1982-09-19",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-25",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALESSANDRA FERREIRA VIEIRA",
    "cpf": "042.644.276-81",
    "birthDate": "1972-11-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-26",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ALEXANDRA GONCALVES",
    "cpf": "058.509.616-31",
    "birthDate": "1976-04-29",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 73.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-27",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALEXANDRE JOSE DE PAULA",
    "cpf": "041.044.406-55",
    "birthDate": "1978-09-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 81.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-28",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALEXANDRE LOPES ARAGAO",
    "cpf": "044.340.596-45",
    "birthDate": "1978-02-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 47.7,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-29",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALINE SILVESTRE SEMIL FERREIRA",
    "cpf": "092.799.596-46",
    "birthDate": "1986-10-07",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-30",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALISSOMALVES DA SILVA",
    "cpf": "712.091.236-49",
    "birthDate": "1971-08-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 108.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-31",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALMIR MORAIS DE MIRANDA",
    "cpf": "026.043.826-01",
    "birthDate": "1945-01-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-32",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ALVARO RODRIGUES CRUZ",
    "cpf": "092.675.466-19",
    "birthDate": "1980-11-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 61.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-33",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALVIMAR SANTOS MUNIZ",
    "cpf": "892.377.066-34",
    "birthDate": "1962-03-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-34",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALVINA CARNEIRO DOS SANTOS",
    "cpf": "815.972.236-20",
    "birthDate": "1954-09-19",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-35",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ALZENY MARIA MARQUES",
    "cpf": "094.961.286-37",
    "birthDate": "1975-07-23",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 55.4,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-36",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ALZIRA MARGARIDA DE SOUZA",
    "cpf": "060.857.206-37",
    "birthDate": "1953-07-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-37",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| AMADEU FERREIRA DOS SANTOS",
    "cpf": "081.482.368-87",
    "birthDate": "1937-04-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 76.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-38",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| AMADEU PEREIRA SANDER",
    "cpf": "770.994.006-49",
    "birthDate": "1953-07-11",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 84.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-39",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "AMANDA RENATA FELICIO DE LIMA ASSIS",
    "cpf": "112.682.076-83",
    "birthDate": "1991-02-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 49.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-40",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| AMANDA SUELEN MARTINS",
    "cpf": "109.382.706-80",
    "birthDate": "1991-10-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Nova Serrana",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-41",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| AMAURI EMILIANO PEREIRA",
    "cpf": "760.176.566-00",
    "birthDate": "1969-04-13",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 64.8,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-42",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "AMELIA LIFONSSINA MIRANDA",
    "cpf": "725.521.076-72",
    "birthDate": "1952-08-18",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 56.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-43",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ANA LUCIA DA SILVA SOARES",
    "cpf": "811.503.006-63",
    "birthDate": "1966-08-29",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 133.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-44",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANDRE JOSE DA SILVA",
    "cpf": "338.405.608-61",
    "birthDate": "1984-02-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 63.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-45",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANDREI DUTRA NASTRI",
    "cpf": "402.438.738-32",
    "birthDate": "1991-07-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 110.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-46",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANDREISA GONÇALVES GUIEIRO",
    "cpf": "020.332.886-84",
    "birthDate": "1997-08-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 50.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-47",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANDRELINO ALEIXO DA SILVA",
    "cpf": "155.817.216-53",
    "birthDate": "1942-01-11",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-48",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANDRES FELIPE PARAMO RIVILLAS",
    "cpf": "720.249.964-93",
    "birthDate": "1999-06-19",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-49",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANEZIO CALISTO FERREIRA",
    "cpf": "048.827.736-19",
    "birthDate": "1979-10-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-50",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANGELA MARIA BARROSO DA SILVA",
    "cpf": "063.284.116-85",
    "birthDate": "1975-08-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 79.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-51",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANGELA MARIA DA SILVA",
    "cpf": "898.357.356-20",
    "birthDate": "1956-01-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 89.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-52",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANISIA DA CONSOLAÇÃO MARTINS DE SENA CRU",
    "cpf": "048.565.606-03",
    "birthDate": "1963-04-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-53",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTENOR GIL COSTA",
    "cpf": "502.135.716-68",
    "birthDate": "1960-04-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 80.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-54",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTENOR JOSE DOS SANTOS",
    "cpf": "450.934.156-34",
    "birthDate": "1955-02-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-55",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIA FERREIRA DE FIGUEIREDO",
    "cpf": "092.870.496-37",
    "birthDate": "1960-05-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-56",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIA GILDETE ALVES LOPES",
    "cpf": "038.422.833-00",
    "birthDate": "1989-06-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 53.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-57",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO ABRAAO ESTEVES FERREIRA",
    "cpf": "275.620.346-72",
    "birthDate": "1946-05-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-58",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO ALVES DA SILVA",
    "cpf": "264.030.486-00",
    "birthDate": "1955-06-27",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-59",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO CARLOS MORAES",
    "cpf": "823.119.006-68",
    "birthDate": "1962-09-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-60",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO CARNEIRO CRUZ",
    "cpf": "233.884.476-91",
    "birthDate": "1946-12-29",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-61",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO CASSIO ALVES",
    "cpf": "205.550.246-87",
    "birthDate": "1950-10-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 55.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-62",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO DACIO DIAS FERREIRA",
    "cpf": "274.534.216-91",
    "birthDate": "1955-02-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-63",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO EUSTAQUIO PEREIRA DE ARAUJO",
    "cpf": "583.537.206-04",
    "birthDate": "1952-06-08",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 62.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-64",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO FERREIRA LUCAS",
    "cpf": "549.327.776-04",
    "birthDate": "1963-03-19",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-65",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO JOSE DA SILVA",
    "cpf": "976.977.706-44",
    "birthDate": "1969-11-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-66",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO JOSE DE CASTRO",
    "cpf": "133.990.206-00",
    "birthDate": "1939-08-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-67",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO JOSE JUSTINIANO",
    "cpf": "316.835.686-72",
    "birthDate": "1959-07-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-68",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO PEREIRA DIAS",
    "cpf": "278.622.246-04",
    "birthDate": "1950-10-13",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-69",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ANTONIO ROBERTO DE FARIA",
    "cpf": "203.851.106-34",
    "birthDate": "1948-09-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 59.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-70",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ANTONIO VICENTE DE JESUS",
    "cpf": "660.720.426-00",
    "birthDate": "1960-10-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 74.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-71",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ANTONIO VICENTE PINTO",
    "cpf": "421.912.896-49",
    "birthDate": "1957-01-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 77.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-72",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ARDEBIO DA SILVA",
    "cpf": "408.166.802-72",
    "birthDate": "1970-12-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 62.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-73",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ARI GONCALVES DE MATOS",
    "cpf": "261.029.196-53",
    "birthDate": "1952-05-13",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 48.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-74",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ARLEMDE SOUZA",
    "cpf": "041.400.296-25",
    "birthDate": "1977-06-16",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 86.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-75",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ARLETE APARECIDA ALBINO DA SILVA",
    "cpf": "003.070.016-79",
    "birthDate": "1947-12-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-76",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ARLINDO PIRES DO PRADO",
    "cpf": "524.843.786-53",
    "birthDate": "1952-06-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 67.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-77",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ARMANDO ALVES DE MOURA",
    "cpf": "876.031.446-04",
    "birthDate": "1951-10-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 90.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-78",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| AVAIR ROMUALDO DA SILVA",
    "cpf": "854.492.616-91",
    "birthDate": "1971-02-07",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-79",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "BEATRIZ SILVA",
    "cpf": "025.148.406-86",
    "birthDate": "1964-03-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 59.8,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-80",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "BENIGNO NEVES DA SILVA",
    "cpf": "543.904.356-04",
    "birthDate": "1965-12-27",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-81",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "BRUNA GOMES PEREIRA",
    "cpf": "111.387.796-01",
    "birthDate": "1999-09-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 39.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-82",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "BRUNO XAVIER DE SOUZA",
    "cpf": "065.810.286-90",
    "birthDate": "1984-01-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-83",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CAMILA FARIA MACIEL",
    "cpf": "081.107.136-70",
    "birthDate": "1988-02-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-84",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CAMILA MOREIRA DA SILVA GOMES",
    "cpf": "090.895.776-96",
    "birthDate": "1990-02-06",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-85",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CAMILO ANASTACIO DA SILVA",
    "cpf": "174.868.076-53",
    "birthDate": "1945-01-11",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 70.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-86",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CARLINA CECILIA ORTIZLOPEZ",
    "cpf": "115.113.092-37",
    "birthDate": "1995-01-27",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 50.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-87",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CARLOS ANTONIO QUEIROGA",
    "cpf": "318.037.336-91",
    "birthDate": "1959-02-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 55.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-88",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CARLOS JOSE PINTO",
    "cpf": "428.093.636-68",
    "birthDate": "1956-12-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 81.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-89",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CARLOS MANOEL DE JESUS",
    "cpf": "216.870.996-34",
    "birthDate": "1955-03-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 65.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-90",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CARMEN VIEGA DE ARAUJO",
    "cpf": "046.898.536-06",
    "birthDate": "1942-08-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Quarta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 49.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-91",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CAROLINA VITORIA ALMEIDA",
    "cpf": "163.185.076-80",
    "birthDate": "2001-06-24",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-92",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| CATARINA ILIAS DE CAMPOS",
    "cpf": "105.095.296-07",
    "birthDate": "1945-07-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-93",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CELIA APARECIDA DELFINO",
    "cpf": "051.350.296-30",
    "birthDate": "1979-03-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 76.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-94",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CELSO GONCALVES MATOS",
    "cpf": "568.268.776-00",
    "birthDate": "1966-03-31",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "",
    "room": "",
    "dryWeight": 92.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-95",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CELSO LUIZ RODRIGUES LISBOA",
    "cpf": "047.404.082-87",
    "birthDate": "1954-11-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-96",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CELSO MARCIO CARNEIRO",
    "cpf": "457.007.296-87",
    "birthDate": "1957-04-09",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-97",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CESAR ANTONIO COELHO",
    "cpf": "427.982.056-20",
    "birthDate": "1961-02-09",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 81.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-98",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CICERA EIDE PEREIRA",
    "cpf": "096.610.626-17",
    "birthDate": "1970-11-19",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-99",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CIRILO PEREIRA DE MORAIS SOBRINHO",
    "cpf": "012.611.216-94",
    "birthDate": "1980-08-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 74.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-100",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLAUDIA CIRIACO",
    "cpf": "018.123.715-60",
    "birthDate": "1980-04-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-101",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "/ CLAUDIA DE FREITAS CARMO GOMES",
    "cpf": "029.679.906-80",
    "birthDate": "1969-02-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 71.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-102",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| CLAUDIA DUARTE DOS SANTOS",
    "cpf": "089.513.126-90",
    "birthDate": "1986-07-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 76.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-103",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLAUDIANE ESTER ALVES",
    "cpf": "029.282.656-78",
    "birthDate": "1975-07-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-104",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLAUDINA ESTER ALVES",
    "cpf": "029.282.916-79",
    "birthDate": "1975-07-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 61.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-105",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLAUDIO ARI BARBOSA RIBEIRO",
    "cpf": "146.417.966-29",
    "birthDate": "1999-07-09",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-106",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLAUDIO ERLIISABEL",
    "cpf": "754.299.186-87",
    "birthDate": "1963-11-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-107",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLAUDIO ROSA DE OLIVEIRA",
    "cpf": "042.915.608-18",
    "birthDate": "1961-07-17",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 96.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-108",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLAUDIONOR JOSE DOS SANTOS",
    "cpf": "469.956.415-15",
    "birthDate": "1961-05-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 89.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-109",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLEBER DUARTE PRADO",
    "cpf": "186.096.356-00",
    "birthDate": "1946-04-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Bonfim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 61.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-110",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLEBER PORTO DE OLIVEIRA",
    "cpf": "665.873.106-30",
    "birthDate": "1968-08-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 89.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-111",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLEONE FERREIRA DE OLIVEIRA",
    "cpf": "037.737.336-23",
    "birthDate": "1969-12-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 56.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-112",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| CLEUDENIR FERREIRA DA SILVA PEREIRA",
    "cpf": "083.341.496-89",
    "birthDate": "1969-11-27",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 85.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-113",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "/ CLEUSA ALVES DOS SANTOS",
    "cpf": "027.699.916-98",
    "birthDate": "1969-02-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-114",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CLOTILDES DAS DORES FLAVIO",
    "cpf": "023.736.326-75",
    "birthDate": "1941-07-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 47.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-115",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CREUSA BOTELHO DA COSTA",
    "cpf": "008.934.726-97",
    "birthDate": "1961-02-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-116",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CRISTIANE DO AMARAL EVANGELISTA DOS SANT",
    "cpf": "013.266.636-74",
    "birthDate": "1973-02-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 47.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-117",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CRISTINA CANDIDA MONTEIRO DE JESUS",
    "cpf": "089.448.636-52",
    "birthDate": "1968-05-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 52.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-118",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| CRISTINA PEREIRA DOS SANTOS",
    "cpf": "157.964.658-13",
    "birthDate": "1968-11-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 74.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-119",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "CUSTODIO VITAL DA SILVA",
    "cpf": "551.896.106-59",
    "birthDate": "1957-01-09",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 61.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-120",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DAIANA APARECIDA DA SILVA",
    "cpf": "099.644.966-30",
    "birthDate": "1988-05-22",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 96.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-121",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DALCIO GONCALVES DE OLIVEIRA",
    "cpf": "658.412.719-20",
    "birthDate": "1965-04-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-122",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DALVA ALVES SANTOS",
    "cpf": "072.484.206-38",
    "birthDate": "1976-12-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 38.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-123",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "/DALVA ROBERTA DE LIMA",
    "cpf": "256.514.396-68",
    "birthDate": "1957-02-23",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 49.9,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-124",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DANIEL DA SILVA",
    "cpf": "078.651.676-36",
    "birthDate": "1981-04-16",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-125",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DANIEL DE SOUZA",
    "cpf": "270.339.706-25",
    "birthDate": "1950-08-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 58.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-126",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DANIEL DOMINGOS DE PAULA",
    "cpf": "012.451.646-78",
    "birthDate": "1978-10-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 78.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-127",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DANIEL FERNANDO CYRIACO",
    "cpf": "081.091.686-04",
    "birthDate": "1971-09-16",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 90.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-128",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| DANIELA FERNANDA PINHEIRO DE SOUZA ANTUN",
    "cpf": "082.927.926-19",
    "birthDate": "1987-07-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-129",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DAYLAN ALMEIDA DOS SANTOS",
    "cpf": "038.958.755-97",
    "birthDate": "1992-10-24",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-130",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DEBORA JULIANA DOS SANTOS",
    "cpf": "116.355.716-18",
    "birthDate": "1996-04-06",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-131",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DENILTON VERTEIRO DOS ANJOS",
    "cpf": "029.856.586-24",
    "birthDate": "1974-12-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-132",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DENIS NOGUEIRA DUARTE",
    "cpf": "107.893.396-09",
    "birthDate": "1983-04-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 59.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-133",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DEUBLA JUNQUEIRA REZENDE",
    "cpf": "055.898.546-79",
    "birthDate": "1967-08-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 54.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-134",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DINAK COSTA SANTOS",
    "cpf": "566.763.876-20",
    "birthDate": "1963-10-29",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-135",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DIRCE ROSA DE ANDRADE",
    "cpf": "024.579.156-60",
    "birthDate": "1957-03-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 50.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-136",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DJAIR RAIMUNDO DOS SANTOS",
    "cpf": "599.718.946-53",
    "birthDate": "1966-08-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 77.2,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-137",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DJALMA DIAS DA SILVA",
    "cpf": "202.335.076-04",
    "birthDate": "1942-02-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 58.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-138",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "DORALICE DE OLIVEIRA ROSA",
    "cpf": "028.281.316-02",
    "birthDate": "1959-04-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-139",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ECIO DE OLIVEIRA SANTOS",
    "cpf": "042.364.626-56",
    "birthDate": "1973-06-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 107.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-140",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDENIR KINUPE PEREIRA",
    "cpf": "485.752.082-68",
    "birthDate": "1942-08-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-141",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDERSON ESTEVES DO CARMO",
    "cpf": "732.934.826-00",
    "birthDate": "1973-08-24",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 93.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-142",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDILSON JOSE DE ANDRADE",
    "cpf": "524.325.136-49",
    "birthDate": "1965-04-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 74.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-143",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDINHO DA SILVA",
    "cpf": "604.696.506-30",
    "birthDate": "1965-08-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 69.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-144",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDIVALDO BATISTA FERREIRA",
    "cpf": "230.029.806-68",
    "birthDate": "1956-08-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 82.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-145",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDMARVICENTE DE OLIVEIRA",
    "cpf": "607.191.766-20",
    "birthDate": "1960-01-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 69.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-146",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDNA MAGALHAES COUTINHO",
    "cpf": "040.801.986-71",
    "birthDate": "1980-03-16",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-147",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDNA MARQUES MARCAL DE ANDRADE",
    "cpf": "098.770.186-08",
    "birthDate": "1987-04-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Rio Manso",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 99.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-148",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDSON ALVES RODRIGUES",
    "cpf": "816.428.066-68",
    "birthDate": "1959-09-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-149",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDSON DA SILVA FARIA LIMA",
    "cpf": "057.764.496-34",
    "birthDate": "1983-03-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-150",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDSON JOSE DE OLIVEIRA",
    "cpf": "697.224.476-53",
    "birthDate": "1961-01-16",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 74.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-151",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDSON RODRIGUES",
    "cpf": "253.139.677-20",
    "birthDate": "1950-01-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-152",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDUARDO JUNIOR DE OLIVEIRA TEIXEIRA",
    "cpf": "077.115.276-08",
    "birthDate": "1985-06-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 55.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-153",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDUARDO LEANDRO GONCALVES",
    "cpf": "037.071.666-35",
    "birthDate": "1979-08-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 77.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-154",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDVALDO BARBOSA DE SOUZA",
    "cpf": "689.368.006-63",
    "birthDate": "1971-02-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 99.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-155",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDVANICE SANTOS DE | ESUS",
    "cpf": "081.246.346-37",
    "birthDate": "1973-09-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 44.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-156",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EDYANE CARVALHO DE JESUS",
    "cpf": "101.709.756-90",
    "birthDate": "1990-03-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 78.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-157",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELAINE BATISTA ROCHA",
    "cpf": "007.011.666-06",
    "birthDate": "1975-09-07",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 81.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-158",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELAINE DE JESUS MOURA MOREIRA",
    "cpf": "014.722.936-73",
    "birthDate": "1978-12-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-159",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELAINE GOMES DE OLIVEIRA",
    "cpf": "066.736.146-41",
    "birthDate": "1982-02-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-160",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELANE LEITE ALMEIDA",
    "cpf": "074.816.226-71",
    "birthDate": "1964-09-19",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-161",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELENA SILVA DE REZENDE",
    "cpf": "081.699.486-22",
    "birthDate": "1956-07-22",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 70.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-162",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELENICE APARECIDA MENEZES PENA",
    "cpf": "069.557.766-22",
    "birthDate": "1983-03-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 82.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-163",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELENILTON LOPES DE OLIVEIRA",
    "cpf": "031.239.546-92",
    "birthDate": "1974-08-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 84.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-164",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELIA AMERICO ROCHA",
    "cpf": "010.865.236-01",
    "birthDate": "1962-06-18",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 78.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-165",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELIANA MARCIA CHAVES",
    "cpf": "981.157.666-15",
    "birthDate": "1977-10-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 90.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-166",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELIANA PEREIRA DOS SANTOS",
    "cpf": "014.738.766-30",
    "birthDate": "1984-04-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 141.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-167",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELIANE APARECIDA FERREIRA",
    "cpf": "034.667.426-33",
    "birthDate": "1972-05-26",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-168",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELIANE ARAUJO DA SILVA BENTO",
    "cpf": "036.279.226-70",
    "birthDate": "1977-11-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 81.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-169",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELIAS VIEIRA DA SILVA",
    "cpf": "667.722.306-04",
    "birthDate": "1967-08-19",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 93.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-170",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELIETE ROCHA DIAS",
    "cpf": "612.382.446-53",
    "birthDate": "1964-05-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 84.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-171",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELISABETH GONCALVES DE OLIVEIRA",
    "cpf": "811.851.206-10",
    "birthDate": "1958-06-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-172",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELISANGELA APARECIDA LINO FERREIRA DOS $",
    "cpf": "081.704.466-35",
    "birthDate": "1980-06-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 59.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-173",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELISIENE CRISTINA NUNES ALMEIDA",
    "cpf": "062.444.186-54",
    "birthDate": "1977-03-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 86.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-174",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELOISA GOMES DA SILVA",
    "cpf": "068.244.076-07",
    "birthDate": "1984-05-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 95.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-175",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELQUIAS RODRIGUES FIGUEIREDO",
    "cpf": "015.633.056-31",
    "birthDate": "1989-05-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 59.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-176",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ELZA MARIA DE OLIVEIRA",
    "cpf": "047.384.846-56",
    "birthDate": "1954-11-16",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 79.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-177",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EMILSON BARRETO GONCALVES",
    "cpf": "369.854.816-04",
    "birthDate": "1956-07-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-178",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ENILSON JOSE ALVES",
    "cpf": "033.721.836-65",
    "birthDate": "1967-06-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 92.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-179",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ERECLYDES MARTINHO MENDES",
    "cpf": "186.527.436-49",
    "birthDate": "1951-11-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 77.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-180",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ERINEA FERREIRA DE ARAUJO",
    "cpf": "005.441.196-30",
    "birthDate": "1967-12-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 103.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-181",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ESTANISLAU AZEVEDO FILHO",
    "cpf": "398.818.656-20",
    "birthDate": "1961-04-29",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-182",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ESTER GUIMARAES DE SOUZA",
    "cpf": "081.327.366-80",
    "birthDate": "1983-12-12",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-183",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ETIENNE RODRIGUES DE SOUZA",
    "cpf": "077.062.766-86",
    "birthDate": "1984-06-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 61.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-184",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EULALIA RODRIGUES DOS REIS",
    "cpf": "132.613.406-06",
    "birthDate": "1998-02-07",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 62.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-185",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EUSTAQUIO FERNANDES GONCALVES",
    "cpf": "507.841.106-20",
    "birthDate": "1960-09-11",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 74.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-186",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EVA DIVINA DE AGUIAR CARVALHO",
    "cpf": "513.825.046-91",
    "birthDate": "1957-06-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-187",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "EXPEDITO BASTOS",
    "cpf": "522.385.986-34",
    "birthDate": "1947-05-11",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-188",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FABIANA BERNARDES DA SILVA RODRIGUES",
    "cpf": "083.917.436-59",
    "birthDate": "1987-09-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 101.05,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-189",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FABIANA FELIPE DE ABREU",
    "cpf": "064.040.126-00",
    "birthDate": "1983-01-12",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 70.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-190",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FABIANO RIBEIRO ROCHA",
    "cpf": "129.582.486-82",
    "birthDate": "1994-10-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-191",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FABIO MAURILIO ALVES DE SOUZA",
    "cpf": "533.939.456-53",
    "birthDate": "1963-01-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-192",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FABRICIO MOREIRA BARBOSA",
    "cpf": "058.688.796-27",
    "birthDate": "1982-03-16",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 106.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-193",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FELIPE AUGUSTO CALDAS PEREIRA",
    "cpf": "098.405.376-01",
    "birthDate": "1988-11-27",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-194",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FERNANDO DE CARVALHO CEZARIO",
    "cpf": "072.708.826-22",
    "birthDate": "1988-01-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 80.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-195",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FERNANDO FERREIRA COSTA SOUSA",
    "cpf": "084.163.716-44",
    "birthDate": "1989-07-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 90.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-196",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FLAVIA PAULINA DOS SANTOS CAMPOS",
    "cpf": "044.217.806-93",
    "birthDate": "1979-09-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 73.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-197",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FLAVIANA MARQUES GOMES DA SILVA",
    "cpf": "083.944.356-02",
    "birthDate": "1987-09-07",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 63.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-198",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FLAVIO AUGUSTO DA PAIXAO",
    "cpf": "042.109.076-69",
    "birthDate": "1981-11-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-199",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FLAVIO FERREIRA",
    "cpf": "113.834.066-93",
    "birthDate": "1993-01-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-200",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FRANCISCO CARLOS FERNANDES",
    "cpf": "074.869.036-01",
    "birthDate": "",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 65.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-201",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FRANCISCO DE ASSIS MATIAS DE OLIVEIRA",
    "cpf": "401.959.106-72",
    "birthDate": "1952-04-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-202",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "FREDERICO ETIENNE DE BARROS ROCHA",
    "cpf": "935.021.766-04",
    "birthDate": "1971-04-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 97.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-203",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GABRIEL FRANCISCO SILVESTRE DE OLIVEIRA",
    "cpf": "219.715.286-68",
    "birthDate": "1947-09-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-204",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GABRIELY PEREIRA DIAS",
    "cpf": "021.411.266-73",
    "birthDate": "1999-02-19",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 68.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-205",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GEISE SOUZA RAMOS SILVA",
    "cpf": "110.915.796-79",
    "birthDate": "1989-11-16",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 104.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-206",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GENECI MARQUES",
    "cpf": "083.975.376-43",
    "birthDate": "1977-04-04",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 51.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-207",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GERALDA MARIA DE LIMA",
    "cpf": "119.814.346-07",
    "birthDate": "1956-04-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 74.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-208",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GERALDO BARBOSA DA SILVA",
    "cpf": "761.969.506-06",
    "birthDate": "1953-06-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-209",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GERALDO LUIZ DA SILVA",
    "cpf": "520.288.956-91",
    "birthDate": "1952-05-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-210",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GERALDO RAIMUNDO MENDONCA",
    "cpf": "154.788.746-04",
    "birthDate": "1944-09-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-211",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| GERONIMO SANTOS GOMES",
    "cpf": "874.942.486-68",
    "birthDate": "1972-03-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 85.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-212",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GETULIO RAMOS PEREIRA",
    "cpf": "529.795.126-72",
    "birthDate": "1965-08-24",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 76.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-213",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GILMA MARIA CUNHA MELO",
    "cpf": "087.181.256-89",
    "birthDate": "1963-05-06",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 100.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-214",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| GILMAR NEVES MOREIRA",
    "cpf": "757.364.466-34",
    "birthDate": "1968-07-17",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 72.3,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-215",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GILSILEIA MODESTO ALMEIDA",
    "cpf": "042.938.986-89",
    "birthDate": "1977-01-24",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 75.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-216",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GILSON BALDOINO MELHOR",
    "cpf": "487.597.676-34",
    "birthDate": "1962-07-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 42.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-217",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GIRLENE MARCELINA DA SILVA",
    "cpf": "046.017.336-77",
    "birthDate": "1978-02-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-218",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GISLENE DAS DORES MARTINS",
    "cpf": "596.264.026-87",
    "birthDate": "1956-12-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 39.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-219",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "GLADSTONE MENDES MOREIRA",
    "cpf": "536.676.386-04",
    "birthDate": "1964-07-19",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-220",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "HELENI ROSA DE JESUS",
    "cpf": "065.046.506-75",
    "birthDate": "1981-05-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 88.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-221",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "HELIO RESENDE CAPAZ",
    "cpf": "432.814.946-68",
    "birthDate": "1960-04-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 66.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-222",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| HENDEL TAVARES",
    "cpf": "070.683.226-46",
    "birthDate": "1986-05-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 67.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-223",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "HUANDER DE FARIA EUZEBIO",
    "cpf": "026.535.056-57",
    "birthDate": "1976-09-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 76.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-224",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IDIOLA MARIA CORREIA VALERIO",
    "cpf": "029.350.946-89",
    "birthDate": "1946-01-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-225",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ILSON MATEUS LOPES",
    "cpf": "023.627.266-73",
    "birthDate": "2001-03-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 47.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-226",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ILZA MARIA DE CASTRO SOUZA",
    "cpf": "084.843.536-21",
    "birthDate": "1970-03-23",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 53.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-227",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IMAR FERREIRA DE ASSIS",
    "cpf": "792.801.966-34",
    "birthDate": "1969-05-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 97.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-228",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| INACIO SOTOCORNO",
    "cpf": "239.495.899-53",
    "birthDate": "1957-01-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 61.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-229",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "INES LUIZA DE PAULA SILVA",
    "cpf": "758.685.716-49",
    "birthDate": "1966-11-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 115.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-230",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IRACI DA ANUNCIAÇÃO",
    "cpf": "014.666.746-87",
    "birthDate": "1940-01-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 69.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-231",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IRENE TEIXEIRA DA SILVA",
    "cpf": "032.853.716-09",
    "birthDate": "1969-10-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 66.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-232",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IRIS MARIA DA SILVA SARAIVA",
    "cpf": "000.608.356-05",
    "birthDate": "1961-11-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-233",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ISABEL EVANGELISTA GANGANA",
    "cpf": "577.210.846-87",
    "birthDate": "1963-07-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 55.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-234",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ISAIAS MARCELINO DA SILVA",
    "cpf": "408.420.886-87",
    "birthDate": "1945-04-29",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-235",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ISMAR GREGORIO DE SOUSA",
    "cpf": "375.269.526-91",
    "birthDate": "1951-11-13",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-236",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IVANETE MARIA FELICIO DA SILVA",
    "cpf": "794.024.966-53",
    "birthDate": "1968-04-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-237",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IVANI DE CARVALHO DA SILVA",
    "cpf": "067.991.616-46",
    "birthDate": "1983-11-24",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 68.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-238",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IVANIA PEREIRA DUARTE",
    "cpf": "096.516.296-65",
    "birthDate": "1979-04-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-239",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IVANILDA ADRIANA SOBRINHO",
    "cpf": "864.910.086-49",
    "birthDate": "1973-06-22",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 65.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-240",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IVANILDE APARECIDA DA SILVA MARTINS",
    "cpf": "006.903.156-86",
    "birthDate": "1971-10-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 54.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-241",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "Ivo MOREIRA DOS SANTOS",
    "cpf": "631.966.546-72",
    "birthDate": "1967-09-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "CAPD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-242",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IVvOLINA MARIA AMBROSIA DE SOUZA",
    "cpf": "070.737.996-25",
    "birthDate": "1960-02-16",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 76.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-243",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IvONE FERREIRA LOPES",
    "cpf": "060.037.306-17",
    "birthDate": "1975-09-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 49.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-244",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IVONE MARIA COUTINHO",
    "cpf": "006.978.496-51",
    "birthDate": "1974-10-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 53.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-245",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IZABEL GONCALVES FERNANDES",
    "cpf": "042.853.486-40",
    "birthDate": "1954-12-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 29.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-246",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IZABEL VICENTINA DE CAMARGOS SILVA",
    "cpf": "627.064.896-34",
    "birthDate": "1963-10-29",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-247",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "IZENILCE BATISTA BORGES",
    "cpf": "761.770.256-68",
    "birthDate": "1963-12-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 54.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-248",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JACI ROCHA PINTO",
    "cpf": "200.410.046-04",
    "birthDate": "1950-04-08",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 73.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-249",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JACIARA SILVA DE SOUZA",
    "cpf": "041.537.526-65",
    "birthDate": "1970-09-19",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-250",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JADIR ANTONIO DE FARIA",
    "cpf": "186.750.506-15",
    "birthDate": "1956-05-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-251",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| JADIR GERALDO DA SILVA",
    "cpf": "566.925.106-78",
    "birthDate": "1966-10-29",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 51.7,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-252",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| JAILTON ALVES GONÇALVES",
    "cpf": "055.017.716-75",
    "birthDate": "1977-07-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 51.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-253",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JAMERSON DE OLIVEIRA MALTA",
    "cpf": "030.733.376-01",
    "birthDate": "1976-07-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-254",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JANAINA MANSOR DA CONCEICAO",
    "cpf": "035.456.736-50",
    "birthDate": "1976-08-06",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 68.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-255",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JANETHE MARIA DO NASCIMENTO SANTOS",
    "cpf": "092.958.536-44",
    "birthDate": "1962-02-17",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-256",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JANICE APARECIDA DE MELO",
    "cpf": "040.915.106-80",
    "birthDate": "1964-01-22",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "CAPD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-257",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JANILTON ALVES",
    "cpf": "477.851.106-97",
    "birthDate": "1965-11-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 69.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-258",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JAROSLAVIO DORNAS DE ARAUJO",
    "cpf": "761.633.776-72",
    "birthDate": "1971-07-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 83.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-259",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| JEANNE MARIA DA SILVA",
    "cpf": "162.929.078-56",
    "birthDate": "1972-04-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "CAPD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-260",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JEFERSON ALFREDO GOULART",
    "cpf": "943.089.186-34",
    "birthDate": "1975-08-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 59.3,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-261",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JEFFERSON ALVES LEITE",
    "cpf": "012.895.256-33",
    "birthDate": "1981-02-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 87.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-262",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| JEFFERSON AVELINO BENTO",
    "cpf": "084.762.946-54",
    "birthDate": "1988-01-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-263",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JEOZADAQUE JUNIO PEREIRA DIAS",
    "cpf": "114.313.716-70",
    "birthDate": "1993-09-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 63.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-264",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JERONIMO RIBEIRO DE SALES",
    "cpf": "644.153.506-82",
    "birthDate": "1951-09-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 51.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-265",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JERRY ADRIANO CASSIMIRO",
    "cpf": "005.466.926-05",
    "birthDate": "1974-02-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 63.2,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-266",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JESIO DE JESUS RIBEIRO",
    "cpf": "099.417.526-48",
    "birthDate": "1989-08-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-267",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JESSICA RIEGER MESSIAS",
    "cpf": "126.054.866-05",
    "birthDate": "1993-11-19",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 54.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-268",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JESUS DOS SANTOS DE PAULO",
    "cpf": "664.505.946-91",
    "birthDate": "1966-01-13",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 72.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-269",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JHONATAN JUNIO MENDES DA SILVA PIRES",
    "cpf": "123.368.896-09",
    "birthDate": "1994-09-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-270",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOAO ALVES DOS SANTOS",
    "cpf": "266.116.516-91",
    "birthDate": "1937-06-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 50.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-271",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOAO ALVES RAMOS",
    "cpf": "116.989.898-06",
    "birthDate": "1968-05-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 102.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-272",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOAO BATISTA ALVES DOS SANTOS",
    "cpf": "034.518.506-48",
    "birthDate": "1956-10-17",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 83.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-273",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOAO BATISTA DA SILVA",
    "cpf": "091.901.116-05",
    "birthDate": "1989-01-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 54.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-274",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOAO EUSTAQUIO RAMOS",
    "cpf": "414.279.046-34",
    "birthDate": "1946-06-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-275",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOAO EVANGELISTA DE GOIS",
    "cpf": "217.061.316-15",
    "birthDate": "1945-10-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Florestal",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 74.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-276",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOAO LUCIO DA SILVA",
    "cpf": "764.457.476-04",
    "birthDate": "1959-05-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 76.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-277",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOAO RAIMUNDO PINTO",
    "cpf": "259.142.786-00",
    "birthDate": "1960-06-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 81.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-278",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "[JOAQUIM FELIPE SIQUEIRA",
    "cpf": "274.506.786-91",
    "birthDate": "1956-05-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-279",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| [JOAQUIMVELOSO NETO",
    "cpf": "764.648.226-91",
    "birthDate": "1936-11-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "CAPD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-280",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOELITON DA SILVA MEDEIROS",
    "cpf": "113.767.456-31",
    "birthDate": "1988-08-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 93.3,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-281",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| JOHN WILSON PEREIRA NEPOMUCENO",
    "cpf": "879.549.076-00",
    "birthDate": "1966-07-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 45.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-282",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| JORGE DOS SANTOS CASSIANO",
    "cpf": "232.259.476-87",
    "birthDate": "1954-10-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 71.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-283",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JORGE SALVIANO FILHO",
    "cpf": "953.158.886-49",
    "birthDate": "1969-08-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 47.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-284",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE ADAO SOARES",
    "cpf": "522.801.797-68",
    "birthDate": "1953-09-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 76.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-285",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE ALVES DE OLIVEIRA",
    "cpf": "403.773.186-04",
    "birthDate": "1965-03-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 61.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-286",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE ANTONIO DE ALMEIDA",
    "cpf": "736.482.306-97",
    "birthDate": "1967-06-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 80.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-287",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE ANTONIO DOS REIS",
    "cpf": "344.808.206-63",
    "birthDate": "1957-12-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 62.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-288",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| JOSE APARECIDO DA SILVA",
    "cpf": "041.769.326-51",
    "birthDate": "1966-08-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-289",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE BERNARDES NETO",
    "cpf": "720.177.596-00",
    "birthDate": "1968-10-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 80.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-290",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE BOSCO DOS SANTOS",
    "cpf": "968.592.616-68",
    "birthDate": "1949-12-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-291",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "|JOSE CAMILO NETO",
    "cpf": "317.445.246-53",
    "birthDate": "1950-09-09",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Bonfim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 64.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-292",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE CARLOS DA COSTA",
    "cpf": "504.681.206-10",
    "birthDate": "1964-12-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-293",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE CARLOS DA SILVA AMARO",
    "cpf": "131.587.086-04",
    "birthDate": "1952-02-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "",
    "room": "",
    "dryWeight": 50.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-294",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE CARLOS DE OLIVEIRA",
    "cpf": "577.314.976-15",
    "birthDate": "1961-12-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-295",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| JOSE CARLOS DIAS DA ROCHA",
    "cpf": "591.497.368-68",
    "birthDate": "1952-10-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-296",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE CARLOS PEREIRA",
    "cpf": "039.459.536-00",
    "birthDate": "1972-04-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 54.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-297",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE DE ARIMATEIA DE OLIVEIRA",
    "cpf": "421.341.296-20",
    "birthDate": "1962-09-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 88.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-298",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE DE SALES CAMILO",
    "cpf": "310.921.366-49",
    "birthDate": "1954-11-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 86.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-299",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE DE SALVEVIEIRA",
    "cpf": "643.987.656-20",
    "birthDate": "1968-09-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 85.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-300",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE DE SOUSA PASSOS",
    "cpf": "551.586.336-49",
    "birthDate": "1965-02-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-301",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "/ JOSE DIAS CAMPOS",
    "cpf": "001.590.898-40",
    "birthDate": "1958-05-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Florestal",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 74.3,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-302",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE DIAS DE SOUZA NETO",
    "cpf": "892.396.956-72",
    "birthDate": "1963-11-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Piedade dos Gerais",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 66.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-303",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE DOMINGOS DE LIMA",
    "cpf": "358.857.774-20",
    "birthDate": "1954-12-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-304",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE DOS PASSOS CAMARGOS DOS SANTOS",
    "cpf": "015.220.326-57",
    "birthDate": "1984-01-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 53.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-305",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE DOS SANTOS DE OLIVEIRA",
    "cpf": "249.370.536-04",
    "birthDate": "1957-11-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-306",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE EDMO MENDES",
    "cpf": "611.647.556-68",
    "birthDate": "1963-08-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 78.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-307",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE EUCLIDES DA SILVA SOARES",
    "cpf": "065.707.036-09",
    "birthDate": "1984-12-17",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-308",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE EUSTAQUIO DE CASTILHO",
    "cpf": "909.814.136-68",
    "birthDate": "1962-04-27",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 54.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-309",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE EUSTAQUIO DE VASCONCELOS",
    "cpf": "472.320.567-53",
    "birthDate": "1957-11-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 54.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-310",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE FELISBINO NETO",
    "cpf": "466.859.876-34",
    "birthDate": "1959-07-29",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 81.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-311",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE FIGUEIREDO DA SILVA",
    "cpf": "245.072.616-00",
    "birthDate": "1935-02-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-312",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE FRANCISCO DE CARVALHO",
    "cpf": "649.252.696-15",
    "birthDate": "1965-07-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-313",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE FRANCISCO DE FREITAS",
    "cpf": "736.656.906-25",
    "birthDate": "1968-04-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 62.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-314",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE GERALDO FERREIRA",
    "cpf": "064.629.078-94",
    "birthDate": "1962-05-24",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 100.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-315",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE GERALDO PATRICIO",
    "cpf": "343.930.566-04",
    "birthDate": "1940-02-07",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-316",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE MARCIANO DE BRITOS",
    "cpf": "399.726.666-20",
    "birthDate": "1953-07-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 59.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-317",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE MIGUEL GOMES DE OLIVEIRA",
    "cpf": "231.217.346-87",
    "birthDate": "1956-09-29",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 66.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-318",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE MURILO FERREIRA",
    "cpf": "856.442.186-00",
    "birthDate": "1971-12-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 69.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-319",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE NEWTON DO NASCIMENTO",
    "cpf": "027.786.696-04",
    "birthDate": "1960-09-27",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 70.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-320",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE PEDRO DE PAULO",
    "cpf": "256.504.086-53",
    "birthDate": "1954-04-29",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-321",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE RIBEIRO DE SOUZA",
    "cpf": "568.988.866-49",
    "birthDate": "1959-02-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-322",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE ROBSON DE ASSIS",
    "cpf": "209.326.506-00",
    "birthDate": "1957-03-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-323",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSE VICENTE DUARTE",
    "cpf": "036.069.856-57",
    "birthDate": "1948-06-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-324",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JOSIANE PINTO",
    "cpf": "075.359.316-50",
    "birthDate": "1983-07-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 79.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-325",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JUAREZALVES DE LIMA",
    "cpf": "087.352.148-05",
    "birthDate": "1961-10-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-326",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JUCILEI JOSE BASILIO",
    "cpf": "040.168.766-05",
    "birthDate": "1980-03-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 51.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-327",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JULIANA ALVES LOPES VELOSO",
    "cpf": "090.178.656-01",
    "birthDate": "1990-03-23",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-328",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JULIO CESAR MARTINS",
    "cpf": "354.625.906-87",
    "birthDate": "1960-05-07",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 81.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-329",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "JULIO PIMENTA DOS SANTOS",
    "cpf": "780.757.346-53",
    "birthDate": "1960-04-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 61.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-330",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LAUDICEIA VIEGA REIS",
    "cpf": "016.915.797-00",
    "birthDate": "1963-11-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-331",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "/LAURENI CANDIDA GONÇALVES DA ROCHA",
    "cpf": "979.704.336-34",
    "birthDate": "1966-10-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 56.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-332",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| LAURITA ATANASIA GOMES",
    "cpf": "093.802.706-90",
    "birthDate": "1958-09-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 51.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-333",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LAURO REIS DE OLIVEIRA",
    "cpf": "296.143.926-49",
    "birthDate": "1954-01-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-334",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LEANDRO DUTRA DE OLIVEIRA SILVA",
    "cpf": "130.911.766-73",
    "birthDate": "1994-11-08",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 64.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-335",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LEANDRO JONATA PEREIRA",
    "cpf": "050.802.376-94",
    "birthDate": "1980-12-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-336",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LECI MATIAS DA SILVA",
    "cpf": "539.164.686-34",
    "birthDate": "1965-09-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 68.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-337",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LEONARD JANNEU FERREIRA",
    "cpf": "039.539.266-75",
    "birthDate": "1979-05-08",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-338",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LEONARDO GERSON DA PAIXAO",
    "cpf": "117.679.576-70",
    "birthDate": "1991-03-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 58.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-339",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LEONORA FERREIRA DOS SANTOS",
    "cpf": "798.336.406-72",
    "birthDate": "1960-02-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 78.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-340",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LOUDIVELDO SALVADOR LUIZ",
    "cpf": "015.160.956-00",
    "birthDate": "1985-12-11",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 89.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-341",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "/LOURDES MARIA EVANGELISTA VASCONCELOS",
    "cpf": "726.306.636-04",
    "birthDate": "1956-08-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-342",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LOURDINHA FERREIRA DE MORAIS",
    "cpf": "024.786.966-06",
    "birthDate": "1956-06-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 60.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-343",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LOURIVAL HENRRIQUES DE OLIVEIRA",
    "cpf": "526.126.006-04",
    "birthDate": "1950-08-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 78.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-344",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUANA MARGARIDA",
    "cpf": "102.729.016-79",
    "birthDate": "1986-12-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-345",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUCIA FONSECA DE JESUS",
    "cpf": "040.777.966-36",
    "birthDate": "1975-05-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 62.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-346",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUCIA MARIA DA CUNHA AMARAL",
    "cpf": "915.649.646-04",
    "birthDate": "1958-09-24",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 44.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-347",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUCIANA GONCALVES OSORIO",
    "cpf": "041.469.156-35",
    "birthDate": "1971-09-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-348",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUCIANO OTAVIANO DA SILVA GOMES",
    "cpf": "034.427.956-13",
    "birthDate": "1978-08-31",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 80.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-349",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUCINEIA ANTONIA DA CRUZ OLIVEIRA",
    "cpf": "735.540.226-91",
    "birthDate": "1973-05-22",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 78.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-350",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUCIO MOREIRA DE ABREU",
    "cpf": "264.363.456-04",
    "birthDate": "1951-10-31",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 61.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-351",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "/ LUCY FATIMA DA SILVA MOREIRA",
    "cpf": "145.980.578-07",
    "birthDate": "1957-12-29",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-352",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUIDY ANTONIO MAIA DE ALCANTARA",
    "cpf": "012.029.136-36",
    "birthDate": "1979-05-27",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-353",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUIZ CARLOS FERNANDES DA SILVA",
    "cpf": "051.138.376-28",
    "birthDate": "1974-10-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 76.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-354",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUIZ GONZAGA DE OLIVEIRA",
    "cpf": "129.601.446-00",
    "birthDate": "1953-08-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 86.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-355",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUIZJOSE DA SILVA",
    "cpf": "371.084.686-20",
    "birthDate": "1951-08-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 72.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-356",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUIZ RAIMUNDO DA SILVA",
    "cpf": "746.680.996-00",
    "birthDate": "1966-08-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-357",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUIZ RICARDO DA SILVA",
    "cpf": "071.762.776-48",
    "birthDate": "1984-08-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Florestal",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 57.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-358",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUIZ RICARDO FREITAS FERNANDES DE AQUINO",
    "cpf": "125.614.096-19",
    "birthDate": "1993-08-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 82.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-359",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUZILENA JOSE DA SILVA",
    "cpf": "024.666.956-00",
    "birthDate": "1974-07-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 59.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-360",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "LUZIMAR DIAS RIBEIRO",
    "cpf": "072.100.656-60",
    "birthDate": "1966-03-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-361",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MAGNO GERALDO BATISTA DOS SANTOS",
    "cpf": "360.147.296-15",
    "birthDate": "1949-12-11",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-362",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MANOEL NERES DE SOUZA",
    "cpf": "020.259.387-80",
    "birthDate": "1958-01-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-363",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARCELINO MARTINS DE OLIVEIRA",
    "cpf": "749.961.856-00",
    "birthDate": "1930-05-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 266.8,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-364",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARCELO MARCIO GABRIEL DA SILVA",
    "cpf": "068.532.256-43",
    "birthDate": "1983-03-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-365",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARCELO MARTINS DA GAMA",
    "cpf": "036.493.516-25",
    "birthDate": "1977-11-19",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 71.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-366",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARCIA APARECIDA RODRIGUES MARQUES",
    "cpf": "086.841.876-52",
    "birthDate": "1965-11-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Florestal",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 77.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-367",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARCIA DO ROSARIO BICALHO",
    "cpf": "867.162.206-15",
    "birthDate": "1967-03-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 72.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-368",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARCIA PRISCILA NEVES",
    "cpf": "114.137.696-24",
    "birthDate": "1993-08-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-369",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARCILIA DOS REIS DE CARVALHO SOUZA",
    "cpf": "897.911.186-04",
    "birthDate": "1961-08-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 44.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-370",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARCILIO MORAIS",
    "cpf": "063.094.736-89",
    "birthDate": "1980-05-08",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "",
    "room": "",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-371",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARCIO DIAS",
    "cpf": "631.486.846-72",
    "birthDate": "1960-07-07",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 83.2,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-372",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARCO AURELIO DE SOUZA OLIVEIRA",
    "cpf": "254.238.436-34",
    "birthDate": "1956-04-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 85.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-373",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARGARETE SILVA FERREIRA",
    "cpf": "432.697.536-91",
    "birthDate": "1960-03-27",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 84.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-374",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARGARIDA BENTO DA SILVA",
    "cpf": "221.814.666-53",
    "birthDate": "1938-12-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-375",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARGARIDA CONSOLAÇÃO MOTA ESPIRITO SANTO",
    "cpf": "050.735.336-66",
    "birthDate": "1966-03-27",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 94.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-376",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA ANTONIA DE RESENDE",
    "cpf": "412.084.802-78",
    "birthDate": "1946-06-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 51.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-377",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA APARECIDA DA COSTA RAMOS",
    "cpf": "968.687.676-68",
    "birthDate": "1958-10-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 48.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-378",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIA APARECIDA DA SILVA CARVALHO",
    "cpf": "063.111.676-11",
    "birthDate": "1970-01-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 40.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-379",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA APARECIDA DA SILVA PINTO",
    "cpf": "037.484.186-12",
    "birthDate": "1964-06-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 54.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-380",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA APARECIDA DOS SANTOS",
    "cpf": "005.362.677-07",
    "birthDate": "1958-11-06",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-381",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA APARECIDA DOS SANTOS RIBEIRO",
    "cpf": "581.663.196-91",
    "birthDate": "1965-01-18",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 79.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-382",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIA APARECIDA FAGUNDES DE OLIVEIRA",
    "cpf": "068.616.656-65",
    "birthDate": "1961-11-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 77.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-383",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA APARECIDA FERNANDES RESENDE",
    "cpf": "905.158.896-87",
    "birthDate": "1963-10-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 53.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-384",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA APARECIDA INACIO PASSOS",
    "cpf": "820.470.656-15",
    "birthDate": "1971-11-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-385",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA APARECIDA PEREIRA DE CARVALHO",
    "cpf": "081.599.816-35",
    "birthDate": "1964-02-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 50.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-386",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA APARECIDA QUINTINA FERREIRA",
    "cpf": "943.458.646-15",
    "birthDate": "1971-08-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 74.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-387",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA APARECIDA RODRIGUES",
    "cpf": "853.171.876-72",
    "birthDate": "1964-05-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-388",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIA CARMELITA FERREIRA PINTO",
    "cpf": "881.399.566-00",
    "birthDate": "1951-11-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "",
    "room": "",
    "dryWeight": 63.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-389",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA CATARINA MESSIAS",
    "cpf": "709.679.386-00",
    "birthDate": "1953-09-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 57.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-390",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DA CONCEICAO DA SILVA",
    "cpf": "898.048.136-53",
    "birthDate": "1961-02-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 71.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-391",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DA CONCEICAO MARQUES",
    "cpf": "701.307.226-50",
    "birthDate": "1948-05-22",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-392",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DAS DORES ASSEREUY",
    "cpf": "892.012.056-00",
    "birthDate": "1956-08-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 46.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-393",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DAS GRAÇAS DE LAIA",
    "cpf": "005.449.546-61",
    "birthDate": "1974-03-07",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 50.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-394",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DE ALMEIDA SANTOS ROCHA",
    "cpf": "746.399.946-72",
    "birthDate": "1948-09-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-395",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIA DE FATIMA CARVALHO DE OLIVEIRA",
    "cpf": "029.436.436-61",
    "birthDate": "1959-04-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 77.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-396",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DE FATIMA MOREIRA DA SILVA",
    "cpf": "039.131.226-05",
    "birthDate": "1962-05-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-397",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DE LOURDES AZEVEDO DE PAULA",
    "cpf": "892.194.496-68",
    "birthDate": "1963-08-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Três Marias",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-398",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DIONIZIA DOS PASSOS",
    "cpf": "255.669.466-15",
    "birthDate": "1944-10-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 33.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-399",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DO DIVINO BARREIRO BATISTA PEREIRA",
    "cpf": "771.213.256-91",
    "birthDate": "1964-10-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 60.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-400",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DO ROSARIO ALMEIDA",
    "cpf": "778.174.946-49",
    "birthDate": "1959-09-04",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 55.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-401",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA DO SOCORRO MOREIRA GONCALVES",
    "cpf": "102.698.116-64",
    "birthDate": "1975-11-22",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 90.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-402",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIA DOS SANTOS SOARES DE ALMEIDA",
    "cpf": "960.536.746-72",
    "birthDate": "1970-11-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 70.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-403",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA ELIANE PEREIRA SILVA",
    "cpf": "032.722.796-60",
    "birthDate": "1969-12-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 82.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-404",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA GERALDA DE OLIVEIRA MARTINS",
    "cpf": "012.703.816-79",
    "birthDate": "1962-04-19",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 72.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-405",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIA GERALDA SANTOS DE ASSIS",
    "cpf": "056.957.476-51",
    "birthDate": "1956-05-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 51.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-406",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA GONCALVES MAIA",
    "cpf": "837.244.196-00",
    "birthDate": "1970-05-24",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-407",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA HELENA CORREA",
    "cpf": "034.325.896-03",
    "birthDate": "1949-02-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 47.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-408",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIA HELENA DE CARVALHO CORDEIRO",
    "cpf": "287.415.198-09",
    "birthDate": "1938-11-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-409",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIA HELENA FERREIRA DE SOUZA",
    "cpf": "292.056.036-00",
    "birthDate": "1955-08-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-410",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA JOSE ALVES FERREIRA",
    "cpf": "654.198.986-91",
    "birthDate": "1962-03-19",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 75.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-411",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA JOSE BRUM",
    "cpf": "064.677.106-06",
    "birthDate": "1975-06-29",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 92.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-412",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIA LIODETE DOS SANTOS",
    "cpf": "092.712.426-29",
    "birthDate": "1963-03-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-413",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA LUZIA PEREIRA DA SILVA",
    "cpf": "952.714.736-00",
    "birthDate": "1958-05-17",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "",
    "room": "",
    "dryWeight": 60.6,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-414",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA MARTA DE OLIVEIRA",
    "cpf": "997.877.176-04",
    "birthDate": "1968-06-17",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 87.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-415",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA MARTA FERREIRA DA MOTA",
    "cpf": "098.260.806-32",
    "birthDate": "1981-08-04",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 72.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-416",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA MOREIRA DE MELO",
    "cpf": "611.524.986-49",
    "birthDate": "1957-04-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 64.8,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-417",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA PERPETUA GOMES DA SILVA",
    "cpf": "612.380.746-34",
    "birthDate": "1943-09-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 47.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-418",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA ROSA SOARES",
    "cpf": "040.419.086-39",
    "birthDate": "1974-09-12",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-419",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIA VAZDA SILVA",
    "cpf": "165.793.378-42",
    "birthDate": "1972-09-06",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 61.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-420",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARIANA DE FREITAS CAMPOS",
    "cpf": "028.554.346-61",
    "birthDate": "1976-12-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 105.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-421",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARILEIDE RODRIGUES DE BARROS",
    "cpf": "707.652.286-10",
    "birthDate": "1966-05-19",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 63.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-422",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARILENA JOSE DA SILVA",
    "cpf": "031.487.446-16",
    "birthDate": "1968-01-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 70.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-423",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARILZA ALVES ALMEIDA",
    "cpf": "533.109.936-04",
    "birthDate": "1958-09-26",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 53.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-424",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARINA PAULINO VAILANTE",
    "cpf": "883.659.216-34",
    "birthDate": "1958-07-18",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 75.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-425",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARINEIDE PEREIRA DA SILVA",
    "cpf": "039.133.456-55",
    "birthDate": "1975-04-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 107.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-426",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MARIO FRANCISCO DE ALMEIDA",
    "cpf": "378.538.646-04",
    "birthDate": "1964-03-31",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 61.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-427",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARLENE DE JESUS HERINGER",
    "cpf": "003.566.186-09",
    "birthDate": "1967-12-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 47.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-428",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARLENE FREITAS PEREIRA",
    "cpf": "081.327.696-94",
    "birthDate": "1987-12-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-429",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARLETE ANDRADE NEVES FERREIRA",
    "cpf": "095.202.276-10",
    "birthDate": "1967-08-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 55.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-430",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARLON FELICIO DOS SANTOS",
    "cpf": "103.837.536-35",
    "birthDate": "1991-12-16",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 57.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-431",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARLUCIA RIBEIRO DA SILVA MELO",
    "cpf": "921.304.886-68",
    "birthDate": "1971-01-16",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 94.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-432",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARTA MARIA DIAS",
    "cpf": "039.906.626-86",
    "birthDate": "1952-06-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-433",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MARTAJANE SOARES DE SOUSA",
    "cpf": "094.496.306-40",
    "birthDate": "1987-10-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 63.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-434",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MATEUS FELIPE FELIX DA SILVA",
    "cpf": "121.398.116-66",
    "birthDate": "1994-08-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 88.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-435",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| MATILDES MADALENA GUEDES GUARIEIRO",
    "cpf": "794.026.666-72",
    "birthDate": "1966-03-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 63.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-436",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MATOSALEM ESTEVAO DA SILVA",
    "cpf": "276.944.106-04",
    "birthDate": "1951-08-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 77.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-437",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MAURO CARDOSO VIEIRA",
    "cpf": "518.106.546-53",
    "birthDate": "1959-06-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 69.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-438",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MAURO DOS SANTOS",
    "cpf": "614.430.186-00",
    "birthDate": "1962-03-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 88.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-439",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MAXWEL TEIXEIRA SABINO",
    "cpf": "118.656.166-13",
    "birthDate": "1993-09-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-440",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MICHAEL SOARES PEDRAS",
    "cpf": "060.008.256-33",
    "birthDate": "1984-08-17",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 75.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-441",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MICHELE APARECIDA RAMOS DE SOUZA",
    "cpf": "099.755.336-71",
    "birthDate": "1988-03-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 67.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-442",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MIEKO SAIKI",
    "cpf": "274.312.908-53",
    "birthDate": "1948-05-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-443",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MIGUEL RODRIGUES RAMOS",
    "cpf": "359.168.006-06",
    "birthDate": "1955-09-29",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 81.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-444",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MILTON AFONSO PARREIRAS",
    "cpf": "695.089.256-04",
    "birthDate": "1966-04-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Bonfim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 93.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-445",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MILTON LEITE DA CUNHA",
    "cpf": "570.608.386-00",
    "birthDate": "1967-10-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 65.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-446",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MILTON PEREIRA DE SOUZA",
    "cpf": "336.359.606-59",
    "birthDate": "1958-04-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 85.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-447",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MIRIAN DE LOURDES COSTA",
    "cpf": "071.852.166-80",
    "birthDate": "1977-02-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-448",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MOISES CORDEIRO DA SILVA",
    "cpf": "758.026.003-49",
    "birthDate": "1975-07-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 56.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-449",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MONICA CARVALHO XAVIER",
    "cpf": "081.597.026-98",
    "birthDate": "1980-08-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 50.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-450",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "MONICA DA SILVA",
    "cpf": "654.562.206-44",
    "birthDate": "1969-03-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 96.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-451",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NAYARA PEREIRA NUNES",
    "cpf": "110.866.946-86",
    "birthDate": "1991-11-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 104.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-452",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NELSA MARIA MARCAL FERNANDES",
    "cpf": "011.704.396-67",
    "birthDate": "1974-10-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-453",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NELSON PEREIRA",
    "cpf": "717.009.946-20",
    "birthDate": "1967-01-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 72.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-454",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NEUSA DE FATIMA SABINA DA SILVA",
    "cpf": "628.604.107-91",
    "birthDate": "1960-02-07",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-455",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NEUSA MARIA XAVIER BANDEIRA",
    "cpf": "843.812.136-53",
    "birthDate": "1957-08-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 46.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-456",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NEUSA PEREIRA DE CARVALHO CHAVES",
    "cpf": "070.883.587-27",
    "birthDate": "1955-10-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-457",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NILDE GONCALVES DO NASCIMENTO",
    "cpf": "695.245.566-34",
    "birthDate": "1961-03-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 56.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-458",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NILSON JESUS MACHADO",
    "cpf": "809.507.606-68",
    "birthDate": "1966-04-19",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Bonfim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-459",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NILVA DAS DORES DE SOUZA",
    "cpf": "033.875.596-90",
    "birthDate": "1974-04-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 88.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-460",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NILZA MARIA DE JESUS",
    "cpf": "774.574.396-68",
    "birthDate": "1953-12-29",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 43.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-461",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "NILZETE LOPES DE ATAIDES",
    "cpf": "084.400.736-66",
    "birthDate": "1961-08-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 56.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-462",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ODAIL COSTA DE OLIVEIRA",
    "cpf": "712.988.866-00",
    "birthDate": "1960-07-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 52.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-463",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ODETE ALVES DE CAMPOS",
    "cpf": "242.803.566-53",
    "birthDate": "1952-12-18",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-464",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ODETE ALVES FERREIRA",
    "cpf": "039.787.956-39",
    "birthDate": "1958-12-26",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-465",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ODETE DE SOUZA MOREIRA",
    "cpf": "664.420.016-87",
    "birthDate": "1960-04-29",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 85.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-466",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ODETE DIAS",
    "cpf": "026.689.016-42",
    "birthDate": "1952-08-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-467",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ODETE MARIA COSTA SILVA",
    "cpf": "044.150.776-09",
    "birthDate": "1968-12-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-468",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "OLGA MARIA ALMEIDA FIGUEIREDO",
    "cpf": "907.710.366-04",
    "birthDate": "1965-01-22",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 61.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-469",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "OLINDA ROCHA LEANDRO",
    "cpf": "352.087.751-15",
    "birthDate": "1959-01-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Florestal",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-470",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ORLANDO GUIMARAES DE SOUZA",
    "cpf": "978.852.587-34",
    "birthDate": "1949-09-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 74.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-471",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ORLANDO LIMA PINHEIRO",
    "cpf": "086.487.156-28",
    "birthDate": "1986-10-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 64.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-472",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "OSEIAS PEREIRA DA FONSECA",
    "cpf": "637.827.076-72",
    "birthDate": "1967-06-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 56.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-473",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "OSVALDO MENDES DOS SANTOS",
    "cpf": "448.318.626-49",
    "birthDate": "1957-09-07",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 54.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-474",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "OTACILIO ANTONIO DE OLIVEIRA MAIA",
    "cpf": "342.531.146-87",
    "birthDate": "1959-09-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 88.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-475",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "OTAVIO CARLOS MOURAO DAIBERT",
    "cpf": "311.564.446-91",
    "birthDate": "1959-06-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 77.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-476",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PALOMA DIAS BATISTA GONCALVES",
    "cpf": "119.743.306-64",
    "birthDate": "1991-11-23",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-477",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PALOMA DINIZ DUTRA",
    "cpf": "114.525.806-93",
    "birthDate": "1996-11-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-478",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAMELA BIANCA CAMILO",
    "cpf": "020.218.326-27",
    "birthDate": "1997-05-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 47.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-479",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO ALVES DE OLIVEIRA",
    "cpf": "752.660.406-53",
    "birthDate": "1968-07-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 72.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-480",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO ANDRE SOARES SANTOS",
    "cpf": "072.382.056-29",
    "birthDate": "1985-09-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 89.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-481",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO BOAVENTURA DA SILVA",
    "cpf": "205.598.106-44",
    "birthDate": "1957-07-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 77.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-482",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO DA CRUZ MOUTINHO",
    "cpf": "083.881.566-91",
    "birthDate": "1947-04-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-483",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO FRANCISCO GONCALVES",
    "cpf": "656.067.286-72",
    "birthDate": "1948-11-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 62.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-484",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO LUCIO DE MATOS",
    "cpf": "216.597.536-00",
    "birthDate": "1955-06-23",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-485",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO MARTINS DE AGUIAR",
    "cpf": "373.545.316-34",
    "birthDate": "1960-11-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-486",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO PEREIRA DE OLIVEIRA",
    "cpf": "041.373.896-59",
    "birthDate": "1958-07-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Piedade dos Gerais",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-487",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO ROBERTO DE ARAUJO",
    "cpf": "880.245.716-68",
    "birthDate": "1971-07-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-488",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO ROBERTO PEREIRA DOS SANTOS",
    "cpf": "048.921.996-99",
    "birthDate": "1981-02-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-489",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO SERGIO DA ROCHA",
    "cpf": "054.606.637-25",
    "birthDate": "1978-02-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 134.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-490",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PAULO SILVINO AMBROZIO",
    "cpf": "710.501.916-68",
    "birthDate": "1967-09-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-491",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PEDRO FRANCISCO NETO",
    "cpf": "029.492.526-05",
    "birthDate": "1969-10-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 61.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-492",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PERCILIA JOSE CORREIA DA SILVA",
    "cpf": "050.299.386-30",
    "birthDate": "1971-09-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 69.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-493",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PETRONILIA ELIANA SILVA",
    "cpf": "033.103.856-04",
    "birthDate": "1967-06-04",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 66.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-494",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "PRISCILA DAIANE CAETANO DIAS",
    "cpf": "112.470.406-07",
    "birthDate": "1991-09-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Rio Manso",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 114.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-495",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RAFAEL GERALDO MACHADO DOVALE",
    "cpf": "067.759.016-40",
    "birthDate": "1985-12-17",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 87.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-496",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RAQUELAPARECIDA LOPES",
    "cpf": "124.724.516-01",
    "birthDate": "1991-03-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-497",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RAQUEL SILVA GOMES VASCONCELOS",
    "cpf": "084.628.436-77",
    "birthDate": "1984-03-07",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 41.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-498",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RAYMUNDA FERNANDES DE ASSIS",
    "cpf": "005.115.186-33",
    "birthDate": "1966-05-31",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 69.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-499",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "REALINA DE ASSIS ANDRADE SALES",
    "cpf": "422.429.596-20",
    "birthDate": "1946-11-27",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-500",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "REGINA APARECIDA DA SILVA",
    "cpf": "953.172.956-53",
    "birthDate": "1972-10-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 89.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-501",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "REGINA CARLA DE OLIVEIRA",
    "cpf": "075.858.316-84",
    "birthDate": "1983-08-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-502",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "REGINA CELIA CASEMIRA COELHO",
    "cpf": "003.718.816-09",
    "birthDate": "1963-04-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 70.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-503",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "REGINA PATRICIA SOUZA NASCIMENTO",
    "cpf": "062.113.076-16",
    "birthDate": "1982-10-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-504",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "REINALDO GONCALVES PEREIRA",
    "cpf": "059.087.496-99",
    "birthDate": "1982-06-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 74.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-505",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "REINALDO VICENTE DE PAULA",
    "cpf": "061.792.096-69",
    "birthDate": "1983-07-11",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-506",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RENATA FRAGA PEREIRA",
    "cpf": "154.847.297-26",
    "birthDate": "1997-03-01",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-507",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RENATO CARDOSO PIRES",
    "cpf": "036.660.556-99",
    "birthDate": "1976-11-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-508",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RENI DOS SANTOS",
    "cpf": "000.182.936-03",
    "birthDate": "1964-10-12",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 90.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-509",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RICARDO JUNIO ALVES DE BRITO",
    "cpf": "715.527.236-15",
    "birthDate": "1970-07-17",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-510",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RIVALDO QUARESMA DE OLIVEIRA",
    "cpf": "633.715.106-20",
    "birthDate": "1961-02-10",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 78.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-511",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROBERTA ALMEIDA BENTO",
    "cpf": "045.538.686-28",
    "birthDate": "1980-03-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 69.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-512",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROBERTO RAMOS DO CARMO",
    "cpf": "880.248.576-34",
    "birthDate": "1972-11-24",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-513",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROBSON JUNIO CORDEIRO",
    "cpf": "068.072.376-50",
    "birthDate": "1982-05-09",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 92.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-514",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RODRIGO WAGNER FARIA",
    "cpf": "005.282.166-86",
    "birthDate": "1978-08-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-515",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROGERIO BORGES DE BARROS",
    "cpf": "766.562.766-87",
    "birthDate": "1965-04-16",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 47.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-516",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROGERIO GUILHERME DE REZENDE",
    "cpf": "891.132.416-72",
    "birthDate": "1972-05-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 85.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-517",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROMENIO DE MORAIS MACHADO",
    "cpf": "037.305.016-07",
    "birthDate": "1977-01-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-518",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROMILDO SUDARIO DA SILVA",
    "cpf": "897.920.766-20",
    "birthDate": "1970-08-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 74.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-519",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RONALDO MARCIO MACHADO DE JESUS",
    "cpf": "795.299.176-00",
    "birthDate": "1969-10-21",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-520",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RONALDO SELMO DE AMORIM",
    "cpf": "583.539.336-91",
    "birthDate": "1967-07-07",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 98.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-521",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RONIVON MARTINS DE OLIVEIRA",
    "cpf": "814.155.246-53",
    "birthDate": "1970-01-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 60.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-522",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROSA MARIA DA SILVA VIEIRA",
    "cpf": "058.034.986-10",
    "birthDate": "1968-07-23",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-523",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROSANGELA AKEMI ITO",
    "cpf": "785.200.376-15",
    "birthDate": "1972-05-29",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 44.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-524",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROSANGELA DOMINGOS",
    "cpf": "000.865.976-12",
    "birthDate": "1972-01-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Florestal",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 53.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-525",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROSANGELA EUSTAQUIA DA SILVA OLIVEIRA",
    "cpf": "276.985.806-87",
    "birthDate": "1957-04-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-526",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROSELI MERENCIANA DE BARCELOS",
    "cpf": "969.076.496-91",
    "birthDate": "1970-11-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 79.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-527",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROSELIA RUFINA DA SILVA",
    "cpf": "935.984.836-00",
    "birthDate": "1966-10-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-528",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROSELINE ALVES FERREIRA",
    "cpf": "780.581.716-20",
    "birthDate": "1966-07-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 68.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-529",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROSEMEIRE FERREIRA SIMOES",
    "cpf": "009.368.026-00",
    "birthDate": "1972-03-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 56.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-530",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ROSILEIA VIDEL DOS SANTOS",
    "cpf": "040.450.106-02",
    "birthDate": "1978-02-26",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 43.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-531",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RUAN LOPES CALDAS",
    "cpf": "138.572.856-64",
    "birthDate": "2005-09-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-532",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "RUTH MARIA ROCHA",
    "cpf": "301.036.736-87",
    "birthDate": "1956-05-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-533",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SALETEIRANI CORDEIRO RIBEIRO",
    "cpf": "864.136.946-53",
    "birthDate": "",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-534",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SAMARA CAROLINA SILVA",
    "cpf": "127.729.746-00",
    "birthDate": "1995-03-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Rio Manso",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "",
    "room": "",
    "dryWeight": 114.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-535",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SANDRA DA SILVA",
    "cpf": "006.973.536-05",
    "birthDate": "1971-10-11",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-536",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SANDRA REGINA DE ASSIS RODRIGUES",
    "cpf": "086.015.376-26",
    "birthDate": "1966-12-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 69.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-537",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SEBASTIANA AYMORES DA COSTA",
    "cpf": "519.460.766-00",
    "birthDate": "1938-04-29",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "",
    "room": "",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-538",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SEBASTIANA PEREIRA MACIEL",
    "cpf": "851.712.556-87",
    "birthDate": "1965-01-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 87.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-539",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SEBASTIAO APARECIDO FELIX",
    "cpf": "390.345.856-20",
    "birthDate": "1959-07-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 66.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-540",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SEBASTIAO DE SOUZA RIBEIRO",
    "cpf": "373.816.606-87",
    "birthDate": "1958-05-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 76.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-541",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SEBASTIAO GOMES DE SOUSA",
    "cpf": "172.783.091-15",
    "birthDate": "1952-01-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 90.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-542",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SEBASTIAO JERONIMO CORREIA",
    "cpf": "736.019.346-04",
    "birthDate": "1952-09-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 52.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-543",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SEBASTIAO PINTO DA VITORIA",
    "cpf": "568.880.076-34",
    "birthDate": "1961-11-30",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 57.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-544",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SEBASTIAO RIBEIRO DOS SANTOS",
    "cpf": "300.335.946-00",
    "birthDate": "1952-01-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 56.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-545",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SEBASTIAO RODRIGUES",
    "cpf": "032.180.488-00",
    "birthDate": "1956-09-01",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 73.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-546",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SELMO CLAUDIO MOURA",
    "cpf": "408.836.046-04",
    "birthDate": "1957-04-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 71.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-547",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SERGIO ADEMIR DOS PASSOS",
    "cpf": "055.653.306-29",
    "birthDate": "1978-10-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-548",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SERGIO DE OLIVEIRA SILVA",
    "cpf": "508.160.316-49",
    "birthDate": "1967-06-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-549",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SERGIO DOS SANTOS",
    "cpf": "005.463.626-48",
    "birthDate": "1972-11-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 83.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-550",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SHEILA TATIANA DE SOUSA",
    "cpf": "037.854.146-33",
    "birthDate": "1978-11-16",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-551",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SILMA FERREIRA DE SOUZA",
    "cpf": "092.356.486-10",
    "birthDate": "1967-06-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 51.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-552",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SILMARA CRISTINA DIAS",
    "cpf": "083.673.006-29",
    "birthDate": "1988-02-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 72.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-553",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SILVANA LUCIA DOS SANTOS ANUNCIACAO",
    "cpf": "763.784.036-00",
    "birthDate": "1961-03-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 48.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-554",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SILVANIA MAZINE DE MATTOS",
    "cpf": "051.742.476-26",
    "birthDate": "1968-08-16",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 47.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-555",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SILVIA DIAS PEREIRA LOURENCO",
    "cpf": "913.882.446-91",
    "birthDate": "1968-03-25",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-556",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SILVIO GONCALVES DA ROCHA",
    "cpf": "388.412.406-44",
    "birthDate": "1949-03-06",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 68.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-557",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SIMAO ALVES DA SILVA",
    "cpf": "374.948.056-72",
    "birthDate": "1960-10-28",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 95.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-558",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SIMONE FERNANDES CAETANO",
    "cpf": "130.747.746-14",
    "birthDate": "1984-11-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-559",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SIOMARA APARECIDA MACHADO",
    "cpf": "028.851.996-52",
    "birthDate": "1975-04-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 80.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-560",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SIONARA FATIMA DA SILVA",
    "cpf": "033.109.556-48",
    "birthDate": "1978-12-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 81.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-561",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SIONI MARIA GONCALVES",
    "cpf": "823.997.606-97",
    "birthDate": "1957-05-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 93.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-562",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SIRLANE DE JESUS CHAVES",
    "cpf": "038.578.716-28",
    "birthDate": "1974-10-15",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 46.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-563",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SIRLEY ANTONIO RIBEIRO",
    "cpf": "392.137.817-68",
    "birthDate": "1957-02-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 73.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-564",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SOLANGE RODRIGUES CALDEIRA DE SA",
    "cpf": "080.919.686-71",
    "birthDate": "1979-12-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 46.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-565",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SONIA DE FATIMA SOARES RAMALHO",
    "cpf": "029.124.366-56",
    "birthDate": "1977-04-10",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-566",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SONIA MARIA MOREIRA",
    "cpf": "502.441.836-00",
    "birthDate": "1963-08-08",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Piedade dos Gerais",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 48.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-567",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SUZANA MARTINS DE NORONHA BRITO",
    "cpf": "191.943.826-20",
    "birthDate": "1948-08-06",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 46.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-568",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "SYNDOMAR SILVA RIBEIRO",
    "cpf": "026.019.336-40",
    "birthDate": "1975-04-13",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 93.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-569",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TAMIRIS MONICA LEMOS CARLOS",
    "cpf": "000.745.896-79",
    "birthDate": "1969-07-02",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-570",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TANIA APARECIDA MACHADO",
    "cpf": "647.971.636-15",
    "birthDate": "1964-10-16",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-571",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TANIA MARIA BATISTA NOVAIS",
    "cpf": "116.142.238-23",
    "birthDate": "1966-07-13",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 81.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-572",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TANIA MARIA DE JESUS DOS SANTOS",
    "cpf": "037.723.156-82",
    "birthDate": "1962-01-18",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 64.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-573",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TANIA NERES DAMASIO",
    "cpf": "045.956.496-06",
    "birthDate": "1981-03-06",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 50.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-574",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TARCISIO PIRES DO CARMO",
    "cpf": "279.534.916-72",
    "birthDate": "1954-02-13",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 104.6,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-575",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TATIANE LOPES PEREIRA WILL",
    "cpf": "117.301.576-02",
    "birthDate": "1986-07-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 48.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-576",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TEREZA CRISTINA COSTA PEREIRA",
    "cpf": "079.753.516-01",
    "birthDate": "1966-06-23",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-577",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TEREZINHA DE JESUS GOMES DE CARVALHO",
    "cpf": "846.262.916-00",
    "birthDate": "1959-10-03",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 128.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-578",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TEREZINHA VIEGAS CAMPOS",
    "cpf": "500.409.526-49",
    "birthDate": "1949-03-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 56.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-579",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "THAYLON LEMES DOS SANTOS",
    "cpf": "122.105.566-60",
    "birthDate": "1998-01-17",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 53.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-580",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "THIAGO SOUZA DO VALE",
    "cpf": "098.938.056-43",
    "birthDate": "1988-10-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-581",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "TULIO HENRIQUE SILVA",
    "cpf": "106.908.856-01",
    "birthDate": "1991-02-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-582",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "UILLIAN PEREIRA FERNANDES",
    "cpf": "059.243.816-33",
    "birthDate": "1982-10-05",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "",
    "shift": "",
    "room": "",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-583",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ULISES PEREIRA DA ROCHA",
    "cpf": "553.200.266-68",
    "birthDate": "1964-12-18",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 59.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-584",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALDERSON BRENDO GOMES DA SILVA",
    "cpf": "080.611.311-10",
    "birthDate": "2005-08-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 70.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-585",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALDETE ALMEIDA DOS SANTOS",
    "cpf": "373.267.916-00",
    "birthDate": "1954-07-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-586",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALDILSON LOURENCO FERREIRA",
    "cpf": "032.772.746-24",
    "birthDate": "1976-12-04",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 77.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-587",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALDINEI LUCAS DE SOUSA",
    "cpf": "036.675.436-03",
    "birthDate": "1978-03-25",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 56.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-588",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALDIR RODRIGUES DOS SANTOS",
    "cpf": "748.456.676-49",
    "birthDate": "1967-10-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 77.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-589",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALDIR XAVIER DA SILVA",
    "cpf": "864.242.206-82",
    "birthDate": "1962-02-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 53.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-590",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALDIRENE PEREIRA DA SILVA",
    "cpf": "754.230.306-68",
    "birthDate": "1970-01-18",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": 50.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-591",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALERIA GOMES DA SILVA",
    "cpf": "037.056.856-78",
    "birthDate": "1972-10-21",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 94.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-592",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALERIA MOREIRA DA CRUZ",
    "cpf": "042.311.746-79",
    "birthDate": "1975-01-20",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Esmeraldas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 58.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-593",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VALTER EMERICK SAAR",
    "cpf": "388.287.406-63",
    "birthDate": "1957-06-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 85.2,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-594",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VANDERCI BATISTA E SILVA",
    "cpf": "030.395.136-21",
    "birthDate": "1970-10-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Rio Manso",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 83.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-595",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VANDERLEI PEREIRA DE LIMA",
    "cpf": "278.089.978-62",
    "birthDate": "1979-03-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-596",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VANDERLUCIO FERREIRA DA SILVA",
    "cpf": "016.733.546-45",
    "birthDate": "1962-02-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 41.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-597",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VANESSA ELIANE DA SILVA",
    "cpf": "038.939.786-58",
    "birthDate": "1977-04-05",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Mário Campos",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 49.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-598",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VANESSA LACERDA DA ROCHA",
    "cpf": "109.398.796-03",
    "birthDate": "1991-11-09",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 52.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-599",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VANTUIL ANDRE EVANGELISTA",
    "cpf": "254.724.966-91",
    "birthDate": "1951-08-31",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 81.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-600",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VERA LUCIA",
    "cpf": "764.841.306-04",
    "birthDate": "1957-11-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 50.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-601",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VERA LUCIA FONSECA DE SOUZA",
    "cpf": "060.958.596-70",
    "birthDate": "1963-08-23",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 49.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-602",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VILMA FERREIRA VIANA",
    "cpf": "063.721.296-71",
    "birthDate": "1968-01-28",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Juatuba",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 68.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-603",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VILMA LUCIA NUNES",
    "cpf": "937.108.796-04",
    "birthDate": "1954-03-30",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 55.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-604",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VILMA SOARES DE MEDEIROS",
    "cpf": "385.012.366-91",
    "birthDate": "1953-11-27",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 1",
    "dryWeight": null,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-605",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "VIVIANE FONSECA BONIFACIO GARCIA",
    "cpf": "063.111.616-80",
    "birthDate": "1982-03-22",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 68.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-606",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WAGNER BERNARDES DA SILVA",
    "cpf": "049.532.766-20",
    "birthDate": "1980-09-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 67.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-607",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WALDEMAR SERAFIM",
    "cpf": "379.054.306-34",
    "birthDate": "1962-01-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-608",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WALDEVINO LIMA DA SILVA FILHO",
    "cpf": "767.006.236-34",
    "birthDate": "1965-09-26",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 2",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-609",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WALTAIR FAUSTINO DOS SANTOS",
    "cpf": "369.803.156-68",
    "birthDate": "1958-02-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 1",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-610",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WANDERSON ALVES SANTOS",
    "cpf": "017.216.936-45",
    "birthDate": "1987-01-12",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 65.5,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-611",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WANDERSON APARECIDO DA SILVA",
    "cpf": "812.070.346-49",
    "birthDate": "1973-02-20",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 57.6,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-612",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WANDERSON COSTA AREDES",
    "cpf": "046.099.426-31",
    "birthDate": "1981-04-15",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 3",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-613",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WASHINGTON PEREIRA BARRADO",
    "cpf": "036.680.306-93",
    "birthDate": "1977-11-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 81.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-614",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WEBERT ALEXANDRE VIEIRA",
    "cpf": "068.149.316-05",
    "birthDate": "1985-08-03",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 82.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-615",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WELLINGTON HENRIQUE MEDEIROS SIQUEIRA",
    "cpf": "102.011.136-43",
    "birthDate": "1990-11-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "2º Turno",
    "room": "Salão 3",
    "dryWeight": 57.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-616",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WELTON ARAUJO LOPES",
    "cpf": "144.994.476-07",
    "birthDate": "1997-07-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "3º Turno",
    "room": "Salão 2",
    "dryWeight": 75.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-617",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WELTON PEREIRA DOS SANTOS",
    "cpf": "006.380.606-13",
    "birthDate": "1976-06-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 66.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-618",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WEMERSON ALVES DE FREITAS",
    "cpf": "102.583.416-02",
    "birthDate": "1989-12-19",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Mateus Leme",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 92.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-619",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WESLEN PATRICK REIS DA SILVA",
    "cpf": "017.691.156-17",
    "birthDate": "2003-03-14",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Ribeirão das Neves",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Terça, quinta e sábado",
    "shift": "1º Turno",
    "room": "Salão 3",
    "dryWeight": 66.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-620",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WILLIAN BAZILIO LIMA",
    "cpf": "105.660.976-13",
    "birthDate": "1992-10-22",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "São Joaquim de Bicas",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 66.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-621",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "WILLIAN MARINS PERES",
    "cpf": "039.804.816-97",
    "birthDate": "1978-02-02",
    "gender": "Masculino",
    "patientType": "Crônico",
    "city": "Betim",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "1º Turno",
    "room": "Salão 2",
    "dryWeight": 64.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-622",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "ZELEONICE MARIA DAS DORES TEIXEIRA",
    "cpf": "941.634.646-20",
    "birthDate": "1952-09-24",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Igarapé",
    "state": "MG",
    "treatmentType": "HD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "2º Turno",
    "room": "Salão 1",
    "dryWeight": 60.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-623",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  },
  {
    "name": "| ZELIA MARIA RIBEIRO",
    "cpf": "840.001.126-00",
    "birthDate": "1968-07-14",
    "gender": "Feminino",
    "patientType": "Crônico",
    "city": "Brumadinho",
    "state": "MG",
    "treatmentType": "APD",
    "dialysisFrequency": "Segunda, quarta e sexta",
    "shift": "",
    "room": "",
    "dryWeight": 68.0,
    "treatmentStatus": "Ativo",
    "accessType": "Fístula Arteriovenosa",
    "id": "pat-624",
    "createdAt": "2026-07-15T12:00:00.000Z",
    "admissionDate": "2025-01-01"
  }
];

// Helper to get/set mock database
const getDB = () => {
  const db = localStorage.getItem(MOCK_STORAGE_KEY);
  if (db) {
    const parsed = JSON.parse(db);
    let updated = false;

    // Migrate patients
    if (!parsed.patients || parsed.patients.length < 50 || !parsed.patients.some(p => p.cpf === '700.604.366-20')) {
      parsed.patients = getDefaultPatients();
      updated = true;
    } else {
      // Ensure existing patients have the new keys
      parsed.patients = parsed.patients.map((p, idx) => {
        if (p.chartNumber === undefined) {
          const mockTemplate = getDefaultPatients()[idx] || getDefaultPatients()[0];
          return {
            ...p,
            chartNumber: mockTemplate.chartNumber,
            cpf: mockTemplate.cpf,
            admissionDate: mockTemplate.admissionDate,
            treatmentStatus: mockTemplate.treatmentStatus,
            dialysisFrequency: mockTemplate.dialysisFrequency,
            dryWeight: mockTemplate.dryWeight
          };
        }
        return p;
      });
      updated = true;
    }

    // Migrate shifts
    if (!parsed.shifts) {
      parsed.shifts = [
        { id: 'shift_1', name: '1º Turno' },
        { id: 'shift_2', name: '2º Turno' },
        { id: 'shift_3', name: '3º Turno' }
      ];
      updated = true;
    }

    // Migrate rooms
    if (!parsed.rooms) {
      parsed.rooms = [
        { id: 'room_1', name: 'Salão 1' },
        { id: 'room_2', name: 'Salão 2' },
        { id: 'room_3', name: 'Salão 3' }
      ];
      updated = true;
    }

    // Migrate accessTypes
    if (!parsed.accessTypes) {
      parsed.accessTypes = [
        { id: 'access_1', name: 'Fístula Arteriovenosa' },
        { id: 'access_2', name: 'Cateter Duplo Lúmen' },
        { id: 'access_3', name: 'Prótese' }
      ];
      updated = true;
    }

    // Migrate dialysisFrequencies
    if (!parsed.dialysisFrequencies) {
      parsed.dialysisFrequencies = [
        { id: 'freq_1', name: '3x por semana (Seg/Qua/Sex)' },
        { id: 'freq_2', name: '3x por semana (Ter/Qui/Sáb)' },
        { id: 'freq_3', name: '2x por semana' },
        { id: 'freq_4', name: 'Diário' }
      ];
      updated = true;
    }

    // Migrate users status and fields
    if (parsed.users) {
      let usersChanged = false;
      parsed.users = parsed.users.map(u => {
        if (!u.status) {
          u.status = 'active';
          usersChanged = true;
        }
        return u;
      });
      if (usersChanged) updated = true;
    }

    // Migrate psychology sector
    if (parsed.sectors && !parsed.sectors.some(s => s.id === 'psicologia')) {
      parsed.sectors.push({
        id: 'psicologia',
        name: 'Psicologia',
        description: 'Métricas de cobertura de atendimento psicológico, risco emocional e encaminhamentos à rede.'
      });
      updated = true;
    }

    // Migrate nutrition sector
    if (parsed.sectors && !parsed.sectors.some(s => s.id === 'nutricao')) {
      parsed.sectors.push({
        id: 'nutricao',
        name: 'Nutrição',
        description: 'Métricas de cobertura de atendimento nutritional, adequação metabólica e controle de peso.'
      });
      updated = true;
    }

    // Migrate psychology indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.sectorId === 'psicologia')) {
      parsed.indicators.push(
        { id: 'taxa_atendimento_psico', name: 'Taxa de Atendimento Psicológico', sectorId: 'psicologia', unit: '%', target: 40.0, description: 'Percentual de pacientes atendidos no mês sobre o total em diálise (DP + HD).' },
        { id: 'taxa_risco_psico', name: 'Taxa de Risco Psicológico', sectorId: 'psicologia', unit: '%', target: 25.0, description: 'Percentual de pacientes identificados com ansiedade, depressão ou risco emocional.' },
        { id: 'taxa_encaminhamento_rede', name: 'Taxa de Encaminhamento à Rede', sectorId: 'psicologia', unit: '%', target: 5.0, description: 'Percentual de encaminhamentos para acompanhamento externo ou avaliação de transplante.' }
      );
      updated = true;
    }

    // Migrate nutrition indicators (clean up and structure adjacent indicators)
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'nutri_baixo_peso')) {
      parsed.indicators = parsed.indicators.filter(i => i.sectorId !== 'nutricao');
      parsed.indicators.push(
        { id: 'taxa_atendimento_nutri', name: 'Taxa de Atendimento Nutricional', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes atendidos no mês pela equipe de Nutrição.' },
        
        { id: 'potassio_baixo', name: 'Potássio Sérico Baixo (< 3,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 5.0, description: 'Percentual de pacientes com nível de Potássio sérico baixo (< 3,5 mEq/L).' },
        { id: 'controle_potassio', name: 'Potássio Sérico Adequado (3,5 a 5,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes com nível de Potássio sérico adequado (entre 3,5 e 5,5 mEq/L).' },
        { id: 'potassio_alto', name: 'Potássio Sérico Alto (> 5,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes com nível de Potássio sérico alto (> 5,5 mEq/L).' },
        
        { id: 'fosforo_baixo', name: 'Fósforo Sérico Baixo (< 3,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 10.0, description: 'Percentual de pacientes com nível de Fósforo sérico baixo (< 3,5 mg/dL).' },
        { id: 'controle_fosforo', name: 'Fósforo Sérico Adequado (3,5 a 5,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes com nível de Fósforo sérico adequado (entre 3,5 e 5,5 mg/dL).' },
        { id: 'fosforo_alto', name: 'Fósforo Sérico Alto (> 5,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 20.0, description: 'Percentual de pacientes com nível de Fósforo sérico alto (> 5,5 mg/dL).' },
        
        { id: 'nutri_baixo_peso', name: 'Taxa de Pacientes com Baixo Peso (IMC < 18,5)', sectorId: 'nutricao', unit: '%', target: 20.0, description: 'Percentual de pacientes classificados com baixo peso (IMC < 18,5).' },
        { id: 'nutri_peso_adequado', name: 'Taxa de Pacientes com Peso Adequado (IMC 18,5 - 24,9)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes classificados com peso adequado (IMC 18,5 a 24,9).' },
        { id: 'nutri_obesidade', name: 'Taxa de Pacientes com Obesidade (IMC ≥ 30)', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes classificados com obesidade (IMC ≥ 30).' },

        { id: 'controle_gpid', name: 'Controle de Peso Interdialítico (GPID)', sectorId: 'nutricao', unit: '%', target: 70.0, description: 'Percentual de pacientes com ganho de peso interdialítico adequado (≤ 5% do peso seco).' },
        { id: 'controle_albumina', name: 'Adequação de Albumina Sérica', sectorId: 'nutricao', unit: '%', target: 70.0, description: 'Percentual de pacientes com nível de Albumina sérica adequado (> 3.0 g/dL).' }
      );
      updated = true;
    }

    // Migrate clinical quality indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'qualidade_ktv')) {
      parsed.indicators.push(
        { id: 'qualidade_ktv', name: 'Adequação de Hemodiálise (Kt/V > 1,2)', sectorId: 'qualidade', unit: '%', target: 70.0, description: 'Percentual de pacientes com Kt/V maior que 1,2.' },
        { id: 'qualidade_hb_normal', name: 'Pacientes sem Anemia (HB >= 10)', sectorId: 'qualidade', unit: '%', target: 50.0, description: 'Percentual de pacientes com Hemoglobina maior ou igual a 10 g/dL.' },
        { id: 'qualidade_hb_grave', name: 'Pacientes com Anemia Grave (HB <= 7)', sectorId: 'qualidade', unit: '%', target: 5.0, description: 'Percentual de pacientes com Hemoglobina menor ou igual a 7 g/dL.' },
        { id: 'qualidade_pth', name: 'Paratormônio Elevado (PTH > 600 pg/ml)', sectorId: 'qualidade', unit: '%', target: 20.0, description: 'Percentual de pacientes com nível de PTH maior que 600 pg/ml.' }
      );
      
      const qualData = [
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 71.48, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 74.91, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 76.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 69.64, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 62.41, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 62.90, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 54.90, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 58.10, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 61.50, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 58.40, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 3.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.62, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 4.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.74, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'qualidade_pth', sectorId: 'qualidade', value: 63.93, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...parsed.indicator_data, ...qualData];
      updated = true;
    }

    // Migrate psychology indicator data
    if (parsed.indicator_data && !parsed.indicator_data.some(d => d.indicatorId === 'taxa_atendimento_psico')) {
      const psicoData = [
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 49.04, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 29.01, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 6.79, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 28.27, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 36.96, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 40.58, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 28.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 26.00, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 15.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 14.56, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 34.43, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 21.79, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 5.92, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 3.21, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 9.30, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 8.47, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 1.30, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 4.97, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...parsed.indicator_data, ...psicoData];
      updated = true;
    }

    // Migrate/add nutrition indicator data (including IMC classification sub-indicators)
    if (parsed.indicator_data && !parsed.indicator_data.some(d => d.indicatorId === 'nutri_baixo_peso')) {
      // Filter out any simple old nutrition entries first to avoid duplicates
      parsed.indicator_data = parsed.indicator_data.filter(d => 
        d.indicatorId !== 'taxa_atendimento_nutri' && 
        d.indicatorId !== 'controle_potassio' && 
        d.indicatorId !== 'controle_fosforo' && 
        d.indicatorId !== 'potassio_baixo' &&
        d.indicatorId !== 'potassio_alto' &&
        d.indicatorId !== 'fosforo_baixo' &&
        d.indicatorId !== 'fosforo_alto' &&
        d.indicatorId !== 'controle_gpid' && 
        d.indicatorId !== 'controle_albumina'
      );

      const nutriData = [
        // Cobertura Atendimento Nutricional
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 16.88, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 15.87, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 10.27, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 12.46, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 4.32, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 18.04, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Potássio Baixo (< 3,5)
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 25.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.02, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Potássio Adequado
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 66.03, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 60.09, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 61.39, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 63.82, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 68.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Potássio Alto (> 5,5)
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 8.30, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 38.63, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.73, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.17, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 30.61, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Fósforo Baixo (< 3,5)
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 7.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 13.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 15.52, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 29.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 20.41, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Fósforo Adequado
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 48.44, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 57.18, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 34.72, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 62.16, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 61.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 58.84, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Fósforo Alto (> 5,5)
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 43.86, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 29.54, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 49.74, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 8.11, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 20.75, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Baixo Peso
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 56.52, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 0.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 41.17, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 45.45, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Peso Adequado
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 34.78, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 80.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 47.05, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 18.18, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Obesidade
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 8.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 22.22, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 20.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.76, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.11, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 36.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Ganho de Peso Interdialítico (GPID)
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 68.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 72.72, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 66.23, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 55.69, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 58.75, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 54.43, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Albumina Sérica
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 97.40, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.10, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 94.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.80, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.50, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...parsed.indicator_data, ...nutriData];
      updated = true;
    }

    // Migrate users: remove fictitious @clinica.com users and ensure real users exist
    if (parsed.users) {
      const initialCount = parsed.users.length;
      parsed.users = parsed.users.filter(u => !u.email || !u.email.toLowerCase().endsWith('@clinica.com'));
      if (parsed.users.length !== initialCount) updated = true;

      const realUsersDef = [
        {
          uid: 'techcosta-admin-uid',
          email: 'contato@techcosta.net',
          name: 'Administrador TechCosta',
          role: 'admin',
          allowedSectors: ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'],
          status: 'active'
        },
        {
          uid: 'anacg-uid',
          email: 'anacg@nexa.com',
          name: 'Ana Carolina Cerqueira Gonzaga',
          role: 'rh',
          allowedSectors: ['rh'],
          status: 'active'
        },
        {
          uid: 'jsoares-uid',
          email: 'jsoares@nexa.com',
          name: 'J. Soares',
          role: 'rh',
          allowedSectors: ['rh'],
          status: 'active'
        }
      ];

      realUsersDef.forEach(ru => {
        const existing = parsed.users.find(u => u.email && u.email.toLowerCase() === ru.email.toLowerCase());
        if (!existing) {
          parsed.users.push({ ...ru, createdAt: new Date().toISOString() });
          updated = true;
        } else {
          let uChanged = false;
          if (existing.status !== 'active') { existing.status = 'active'; uChanged = true; }
          if (existing.role !== ru.role) { existing.role = ru.role; uChanged = true; }
          if (!existing.allowedSectors || existing.allowedSectors.length === 0) {
            existing.allowedSectors = ru.allowedSectors;
            uChanged = true;
          }
          if (uChanged) updated = true;
        }
      });
    }

    // Migrate clinical mortality indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'mortalidade_hd')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'mortalidade_hd' && 
        i.id !== 'mortalidade_dp' && 
        i.id !== 'mortalidade_geral' &&
        i.id !== 'obitos_relacionados_hddp' &&
        i.id !== 'total_pacientes_hd' &&
        i.id !== 'total_pacientes_dp' &&
        i.id !== 'obitos_prevalentes_hd' &&
        i.id !== 'obitos_prevalentes_dp'
      );
      parsed.indicators.push(
        { id: 'mortalidade_hd', name: 'Taxa de Mortalidade Pacientes HD', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de óbitos de pacientes em hemodiálise (HD) sobre o total de pacientes atendidos em HD' },
        { id: 'mortalidade_dp', name: 'Taxa de Mortalidade Pacientes DP', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de óbitos de pacientes em diálise peritoneal (DP) sobre o total de pacientes atendidos em DP' },
        { id: 'mortalidade_geral', name: 'Taxa de Mortalidade Geral', sectorId: 'medica', unit: '%', target: 1.0, description: 'Fórmula: Número de óbitos em HD ou DP / Número total de pacientes atendidos HD ou DP * 100' },
        { id: 'obitos_relacionados_hddp', name: 'Óbitos relacionados a HD/DP', sectorId: 'medica', unit: 'óbitos', target: 2.0, description: 'Número de óbitos diretamente relacionados ao tratamento dialítico' },
        { id: 'total_pacientes_hd', name: 'Total de pacientes atendidos em HD', sectorId: 'medica', unit: 'pacientes', target: 550.0, description: 'Total de pacientes sob tratamento de hemodiálise no mês' },
        { id: 'total_pacientes_dp', name: 'Total de pacientes atendidos em DP', sectorId: 'medica', unit: 'pacientes', target: 75.0, description: 'Total de pacientes sob tratamento de diálise peritoneal no mês' },
        { id: 'obitos_prevalentes_hd', name: 'Óbitos Prevalentes e incidentes em HD', sectorId: 'medica', unit: 'óbitos', target: 5.0, description: 'Total de óbitos acumulados no mês de pacientes de hemodiálise' },
        { id: 'obitos_prevalentes_dp', name: 'Óbitos Prevalentes e incidentes em DP', sectorId: 'medica', unit: 'óbitos', target: 1.0, description: 'Total de óbitos acumulados no mês de pacientes de diálise peritoneal' }
      );

      // Seed data
      const mortData = [
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.10, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.83, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.09, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.09, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.46, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 2.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 2.63, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 4.17, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 0.96, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.78, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 0.95, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.28, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.28, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 2.25, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 2, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 3, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 2, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 547, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 546, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 550, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 550, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 548, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 549, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 75, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 73, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 79, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 76, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 77, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 72, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 10, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 8, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 11, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 1, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 2, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 3, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...(parsed.indicator_data || []), ...mortData];
      updated = true;
    }

    // Migrate clinical hospitalization indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_hospitalizacao_geral')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'total_internacoes_hosp' && 
        i.id !== 'taxa_hospitalizacao_geral' && 
        i.id !== 'taxa_hospitalizacao_intercorrência_dialitica' && 
        i.id !== 'taxa_internacoes_dp' && 
        i.id !== 'taxa_internacoes_hd' && 
        i.id !== 'taxa_internacao_intercorrencia_dp' && 
        i.id !== 'taxa_internacoes_intercorrencia_hd'
      );
      parsed.indicators.push(
        { id: 'total_internacoes_hosp', name: 'Total de internações Hospitalares', sectorId: 'medica', unit: 'internações', target: 25.0, description: 'Soma total de internações ocorridas no mês de pacientes de HD e DP' },
        { id: 'taxa_hospitalizacao_geral', name: 'Taxa Hospitalização Geral', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual geral de pacientes que necessitaram de hospitalização' },
        { id: 'taxa_hospitalizacao_intercorrência_dialitica', name: 'Taxa hospitalização por Intercorrência Dialitica (DP +HD)', sectorId: 'medica', unit: '%', target: 2.0, description: 'Percentual de internações causadas por intercorrência relacionada à diálise' },
        { id: 'taxa_internacoes_dp', name: 'Taxa de internações DP', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual de internações de pacientes em diálise peritoneal' },
        { id: 'taxa_internacoes_hd', name: 'Taxa de internações HD', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual de internações de pacientes em hemodiálise' },
        { id: 'taxa_internacao_intercorrencia_dp', name: 'Taxa de internação por intercorrencia DP', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de internações por intercorrência de diálise peritoneal' },
        { id: 'taxa_internacoes_intercorrencia_hd', name: 'Taxa de internações intercorrência HD', sectorId: 'medica', unit: '%', target: 2.0, description: 'Percentual de internações por intercorrência de hemodiálise' }
      );

      // Seed data
      const hospData = [
        // total_internacoes_hosp
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 33, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 18, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 27, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 27, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 30, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 31, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_hospitalizacao_geral
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 5.31, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 2.91, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.29, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.31, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.80, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.99, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_hospitalizacao_intercorrência_dialitica
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.41, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.94, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.91, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.40, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.24, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.93, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_internacoes_dp
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 6.67, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.06, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 1.32, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.19, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.56, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_internacoes_hd
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 5.12, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 3.11, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.18, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.73, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.74, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.92, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_internacao_intercorrencia_dp
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 2.67, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 1.27, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 2.60, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 0.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_internacoes_intercorrencia_hd
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.38, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.01, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.73, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.19, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.19, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...hospData];
      updated = true;
    }

    // Migrate clinical vascular access indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_uso_cdl_fim_mes')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'taxa_uso_cdl_fim_mes' && 
        i.id !== 'taxa_uso_permcath' && 
        i.id !== 'taxa_uso_ptfe' && 
        i.id !== 'taxa_uso_cateter_longo_prazo' && 
        i.id !== 'taxa_pacientes_fav' && 
        i.id !== 'perdas_fav'
      );
      parsed.indicators.push(
        { id: 'taxa_uso_cdl_fim_mes', name: 'Taxa de Uso de CDL (Fim do Mês)', sectorId: 'enfermagem', unit: '%', target: 7.0, description: 'Percentual de pacientes utilizando Cateter Duplo Lúmen temporário no final do mês' },
        { id: 'taxa_uso_permcath', name: 'Taxa de Utilização de Permcath', sectorId: 'enfermagem', unit: '%', target: 23.0, description: 'Percentual de pacientes utilizando Cateter de longa permanência (Permcath)' },
        { id: 'taxa_uso_ptfe', name: 'Taxa de Utilização de PTFE (Prótese)', sectorId: 'enfermagem', unit: '%', target: 4.0, description: 'Percentual de pacientes utilizando prótese vascular (PTFE) como acesso' },
        { id: 'taxa_uso_cateter_longo_prazo', name: 'Taxa de Utilização de Cateter > 3 Meses', sectorId: 'enfermagem', unit: '%', target: 10.0, description: 'Percentual de pacientes utilizando cateter temporário por mais de 3 meses' },
        { id: 'taxa_pacientes_fav', name: 'Taxa de Pacientes com FAV (Fístula)', sectorId: 'enfermagem', unit: '%', target: 66.0, description: 'Percentual de pacientes com Fístula Arteriovenosa (acesso definitivo padrão-ouro)' },
        { id: 'perdas_fav', name: 'Número de Perdas de FAV (Acesso Definitivo)', sectorId: 'enfermagem', unit: 'perdas', target: 2.0, description: 'Número total de fístulas arteriovenosas que foram perdidas/inviabilizadas no mês' }
      );

      // Seed data
      const vascularData = [
        // taxa_uso_cdl_fim_mes
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 9.14, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 8.97, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 9.45, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 10.18, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 11.13, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 10.93, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_uso_permcath
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 26.33, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 27.47, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 25.45, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 25.82, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 24.64, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 21.68, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_uso_ptfe
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.10, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.27, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.27, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_uso_cateter_longo_prazo
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 2.93, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 2.56, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 3.09, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 3.64, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 4.01, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 4.19, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_pacientes_fav
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 63.60, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 65.10, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.00, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.40, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 66.10, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // perdas_fav
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 0, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 6, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 3, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...vascularData];
      updated = true;
    }

    // Migrate clinical FAV confection indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'total_fav_confeccionadas')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'total_fav_confeccionadas' && 
        i.id !== 'taxa_fav_simples' && 
        i.id !== 'taxa_fav_bloqueio' && 
        i.id !== 'taxa_fav_basilica' && 
        i.id !== 'taxa_fav_maturacao' && 
        i.id !== 'taxa_falencia_primaria'
      );
      parsed.indicators.push(
        { id: 'total_fav_confeccionadas', name: 'Total de FAV Confeccionadas', sectorId: 'enfermagem', unit: 'FAVs', target: 18.0, description: 'Total de fístulas arteriovenosas confeccionadas cirurgicamente no período' },
        { id: 'taxa_fav_simples', name: 'Taxa de FAV Simples (Confecção)', sectorId: 'enfermagem', unit: '%', target: 15.0, description: 'Percentual de confecções de fístula arteriovenosa simples (nativa)' },
        { id: 'taxa_fav_bloqueio', name: 'Taxa de FAV Simples com Bloqueio (Confecção)', sectorId: 'enfermagem', unit: '%', target: 51.0, description: 'Percentual de confecções de fístula arteriovenosa simples com bloqueio de plexo' },
        { id: 'taxa_fav_basilica', name: 'Taxa de FAV Basílica (Confecção)', sectorId: 'enfermagem', unit: '%', target: 31.0, description: 'Percentual de confecções de fístula arteriovenosa utilizando a veia basílica' },
        { id: 'taxa_fav_maturacao', name: 'Taxa de FAV em Maturação', sectorId: 'enfermagem', unit: '%', target: 106.0, description: 'Percentual de fístulas em processo de maturação em relação às confeccionadas' },
        { id: 'taxa_falencia_primaria', name: 'Taxa de Falência Primária de FAV', sectorId: 'enfermagem', unit: '%', target: 17.0, description: 'Percentual de fístulas arteriovenosas que apresentaram falência antes da primeira punção' }
      );

      // Seed data
      const favConfData = [
        // total_fav_confeccionadas
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 8, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 16, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 19, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 18, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 29, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_fav_simples
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 25.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 25.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 10.53, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 16.67, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 0.00, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_fav_bloqueio
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 25.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 50.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 68.42, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 55.56, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 55.17, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_fav_basilica
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 50.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 25.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 21.05, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 22.22, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 37.93, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_fav_maturacao
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 87.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 81.25, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 78.95, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 122.22, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 162.07, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_falencia_primaria
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 12.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 18.75, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 21.05, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 16.67, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 13.79, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...favConfData];
      updated = true;
    }

    // Migrate surgeon performance indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_fav_moises')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'taxa_fav_moises' && 
        i.id !== 'falencia_fav_moises' && 
        i.id !== 'taxa_fav_alexandre' && 
        i.id !== 'falencia_fav_alexandre' && 
        i.id !== 'taxa_fav_euler_ricardo' && 
        i.id !== 'falencia_fav_euler_ricardo'
      );
      parsed.indicators.push(
        { id: 'taxa_fav_moises', name: 'Dr. Moisés: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 47.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelo Dr. Moisés' },
        { id: 'falencia_fav_moises', name: 'Dr. Moisés: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 22.0, description: 'Percentual de fístulas realizadas pelo Dr. Moisés que falharam antes da maturação' },
        { id: 'taxa_fav_alexandre', name: 'Dr. Alexandre: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 51.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelo Dr. Alexandre' },
        { id: 'falencia_fav_alexandre', name: 'Dr. Alexandre: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 12.0, description: 'Percentual de fístulas realizadas pelo Dr. Alexandre que falharam antes da maturação' },
        { id: 'taxa_fav_euler_ricardo', name: 'Dr. Euler/Ricardo: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 13.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelos Dr. Euler/Ricardo' },
        { id: 'falencia_fav_euler_ricardo', name: 'Dr. Euler/Ricardo: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 5.0, description: 'Percentual de fístulas realizadas pelos Dr. Euler/Ricardo que falharam antes da maturação' }
      );

      // Seed data
      const surgeonData = [
        // Dr. Moisés: Confecção
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 62.50, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 43.75, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 57.89, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 27.78, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 41.38, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Moisés: Falência Primária
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 20.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 28.57, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 18.18, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 20.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 25.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Alexandre: Confecção
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 37.50, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 56.25, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 42.11, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 72.22, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 44.83, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Alexandre: Falência Primária
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 11.11, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 25.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 15.38, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 7.69, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Euler/Ricardo: Confecção
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 13.79, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Euler/Ricardo: Falência Primária
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...surgeonData];
      updated = true;
    }

    // Migrate hemotransfusion indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_hemotransfusao')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'total_pacientes_hddp' && 
        i.id !== 'pacientes_hemotransfundidos_bruto' && 
        i.id !== 'total_bolsas_infundidas' && 
        i.id !== 'total_reacoes_transfusionais' && 
        i.id !== 'taxa_hemotransfusao' && 
        i.id !== 'taxa_pacientes_hemotransfundidos' && 
        i.id !== 'taxa_reacao_transfusional'
      );
      parsed.indicators.push(
        { id: 'total_pacientes_hddp', name: 'Total de Pacientes HD e DP', sectorId: 'medica', unit: 'pacientes', target: 624.0, description: 'Total bruto de pacientes ativos em hemodiálise e diálise peritoneal no período' },
        { id: 'pacientes_hemotransfundidos_bruto', name: 'Pacientes Hemotransfundidos (Bruto)', sectorId: 'medica', unit: 'pacientes', target: 11.0, description: 'Número total de pacientes que necessitaram de transfusão de sangue no mês' },
        { id: 'total_bolsas_infundidas', name: 'Total de Bolsas Infundidas (Hemotransfusões)', sectorId: 'medica', unit: 'bolsas', target: 16.0, description: 'Número de bolsas de concentrado de hemácias ou outros hemocomponentes transfundidos' },
        { id: 'total_reacoes_transfusionais', name: 'Total de Reações Transfusionais', sectorId: 'medica', unit: 'reações', target: 0.0, description: 'Número total de reações adversas transfusionais notificadas no período' },
        { id: 'taxa_hemotransfusao', name: 'Taxa de Hemotransfusão', sectorId: 'medica', unit: '%', target: 3.0, description: 'Fórmula: Total de hemotransfusões / Total de pacientes HD e DP * 100' },
        { id: 'taxa_pacientes_hemotransfundidos', name: 'Taxa de Pacientes Hemotransfundidos', sectorId: 'medica', unit: '%', target: 2.0, description: 'Fórmula: Total de pacientes hemotransfundidos / Total de pacientes HD e DP * 100' },
        { id: 'taxa_reacao_transfusional', name: 'Taxa de Reação Transfusional', sectorId: 'medica', unit: '%', target: 0.0, description: 'Fórmula: Total de reações transfusionais / Total de bolsas infundidas * 100' }
      );

      // Seed data
      const transfusionData = [
        // total_pacientes_hddp
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 621, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 619, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 629, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 626, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 625, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 621, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // pacientes_hemotransfundidos_bruto
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 8, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 7, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 13, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 12, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 12, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 11, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // total_bolsas_infundidas
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 16, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 15, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 16, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 19, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 17, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 14, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // total_reacoes_transfusionais
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_hemotransfusao
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.58, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.42, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.54, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 3.04, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.72, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.25, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_pacientes_hemotransfundidos
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.29, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.13, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 2.07, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.92, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.92, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.77, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_reacao_transfusional
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...transfusionData];
      updated = true;
    }

    if (!parsed.accounts_payable) {
      parsed.accounts_payable = [
        { id: 'pay-1', supplier: 'Baxter Hospitalar Ltda', cnpj: '12.345.678/0001-90', description: 'Compra de Dialisadores HF80', amount: 10200.00, dueDate: '2026-07-25', status: 'Pendente', category: 'Insumo Clínico', invoiceNumber: '9931', paymentDate: '' },
        { id: 'pay-2', supplier: 'Fresenius Medical Care', cnpj: '98.765.432/0001-21', description: 'Concentrado Ácido de Hemodiálise', amount: 2475.00, dueDate: '2026-07-20', status: 'Pago', category: 'Concentrado', invoiceNumber: '10432', paymentDate: '2026-07-15' },
        { id: 'pay-3', supplier: 'Distribuidora Farmamed', cnpj: '33.221.109/0001-44', description: 'Medicamentos Epoetina', amount: 3600.00, dueDate: '2026-08-05', status: 'Pendente', category: 'Medicamento', invoiceNumber: '2844', paymentDate: '' },
        { id: 'pay-4', supplier: 'Companhia de Água e Saneamento', cnpj: '11.222.333/0001-00', description: 'Consumo de água - Osmose Reversa', amount: 4800.00, dueDate: '2026-07-30', status: 'Pendente', category: 'Serviço/Utilidades', invoiceNumber: '0726', paymentDate: '' },
        { id: 'pay-5', supplier: 'Concessionária de Energia S.A.', cnpj: '44.555.666/0001-11', description: 'Energia Elétrica', amount: 8900.00, dueDate: '2026-07-28', status: 'Pago', category: 'Serviço/Utilidades', invoiceNumber: '1126', paymentDate: '2026-07-16' }
      ];
      updated = true;
    }
    if (!parsed.accounts_receivable) {
      parsed.accounts_receivable = [
        { id: 'rec-1', client: 'Sistema Único de Saúde (SUS) - APAC', category: 'SUS', description: 'Repasse APAC Hemodiálise Jun/2026', amount: 485000.00, dueDate: '2026-07-30', status: 'Pendente', invoiceNumber: 'APAC-2026-06', receivedDate: '' },
        { id: 'rec-2', client: 'Unimed BH', category: 'Convênio', description: 'Mensalidade Hemodiálise Convênio Jun/2026', amount: 72000.00, dueDate: '2026-07-22', status: 'Pago', invoiceNumber: 'UNIMED-993', receivedDate: '2026-07-20' },
        { id: 'rec-3', client: 'Bradesco Saúde', category: 'Convênio', description: 'Procedimentos de nefrologia', amount: 28400.00, dueDate: '2026-07-24', status: 'Pendente', invoiceNumber: 'BRAD-402', receivedDate: '' },
        { id: 'rec-4', client: 'Amil Assistência', category: 'Convênio', description: 'Sessões de diálise peritoneal APD', amount: 19800.00, dueDate: '2026-07-27', status: 'Pago', invoiceNumber: 'AMIL-112', receivedDate: '2026-07-16' }
      ];
      updated = true;
    }
    if (!parsed.xml_imports) {
      parsed.xml_imports = [
        { id: 'xml-1', filename: 'NFe-31260712345678000190550010000099311002345678.xml', supplier: 'Baxter Hospitalar Ltda', invoiceNumber: '9931', amount: 10200.00, importDate: '2026-07-15T10:30:00.000Z', status: 'Conciliado' }
      ];
      updated = true;
    }

    if (parsed.sectors && !parsed.sectors.some(s => s.id === 'rh')) {
      parsed.sectors.push({
        id: 'rh',
        name: 'Recursos Humanos',
        description: 'Indicadores de rotatividade (turnover), absenteísmo e performance de colaboradores'
      });
      updated = true;
    }
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_turnover')) {
      parsed.indicators.push(
        { id: 'taxa_turnover', name: 'Taxa de Turnover (Rotatividade)', sectorId: 'rh', unit: '%', target: 2.0, description: 'Percentual de rotatividade de funcionários no período. Fórmulas: ((Admissões + Desligamentos) / 2) / Média de Funcionários Ativos * 100' },
        { id: 'taxa_absenteismo', name: 'Taxa de Absenteísmo', sectorId: 'rh', unit: '%', target: 3.0, description: 'Percentual de horas/dias de faltas e atrasos não justificados em relação à jornada total contratual' }
      );
      
      const rhData = [
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 1.80, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 2.20, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 1.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 2.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 1.20, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 2.50, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 2.80, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 3.10, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 2.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 2.90, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 2.20, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 3.40, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...(parsed.indicator_data || []), ...rhData];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-08')) {
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

      if (!parsed.employees) parsed.employees = [];

      const augustVouchers = defaultAugustData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtaug-' + (idx + 1),
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
          id: 'vt-aug-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 21 : (v.workSchedule === '12X36' ? 16 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(100000 + idx),
          period: '2026-08',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-08'),
        ...augustVouchers
      ];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-06')) {
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
        { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 113.75, currentBalance: -6.25, rechargeNeeded: 187.50, highlightType: 'red' },
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

      const juneVouchers = defaultJuneData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtjun-' + (idx + 1),
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
          id: 'vt-jun-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 22 : (v.workSchedule === '12X36' ? 15 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(200000 + idx),
          period: '2026-06',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-06'),
        ...juneVouchers
      ];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-05')) {
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
        { employeeName: 'ANA CAROLINA LOPES SOUSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 37.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 37.50, highlightType: null },
        { employeeName: 'BARBARA COSTA PEREIRA', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: '2ª A 6ª', expectedValue: 165.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 165.00, highlightType: null },
        { employeeName: 'GIULLIA HANNA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 125.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'KAUA HENRIQUE FERREIRA DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 62.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'LEILA DOS SANTOS COSTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 225.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 225.00, highlightType: null },
        { employeeName: 'MARGARETH MARIA TEIXEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 150.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'RITA RENATA MOREIRA XAVIER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 62.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'ROSILENE MENDES DE BRITO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 125.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'YASMIN LORENI DE SOUZA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null }
      ];

      const mayVouchers = defaultMayData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtmay-' + (idx + 1),
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
          id: 'vt-may-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 20 : (v.workSchedule === '12X36' ? 16 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(300000 + idx),
          period: '2026-05',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-05'),
        ...mayVouchers
      ];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-04')) {
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
        { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 162.50, currentBalance: 42.50, rechargeNeeded: 282.50, highlightType: null },
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
        { employeeName: 'PÂMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 428.10, currentBalance: 308.10, rechargeNeeded: 20.00, highlightType: null },
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
        { employeeName: 'VICTOR HENRIQUE SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 245.00, currentBalance: 125.00, rechargeNeeded: 65.00, highlightType: null },
        { employeeName: 'DAIANE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 162.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 162.50, highlightType: null },
        { employeeName: 'DANIELY ALVES DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 175.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 175.00, highlightType: null },
        { employeeName: 'DAVINE TAMARA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 175.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 175.00, highlightType: null },
        { employeeName: 'JEISIANE ALVARENGA LUCAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 150.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'MARIA DE FÁTIMA CARVALHO DE SOUSA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 112.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 112.50, highlightType: null },
        { employeeName: 'MIGUEL MONTEIRO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 125.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'PEDRO CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 237.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 237.50, highlightType: null },
        { employeeName: 'CLEBER NEVES ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 87.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 87.50, highlightType: null },
        { employeeName: 'JURANDI BASTOS GOVEIA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 62.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'LETICIA DE OLIVEIRA BRAGA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 75.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 75.00, highlightType: null },
        { employeeName: 'MARIANA DE MORAISA CARVALHO', idaCost: 17.45, voltaCost: 17.45, dailyCost: 34.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 209.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 209.40, highlightType: null },
        { employeeName: 'JESSICA LUCIANA GONÇALVES DE ARAUJO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 75.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 75.00, highlightType: null }
      ];

      const aprilVouchers = defaultAprilData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtapr-' + (idx + 1),
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
          id: 'vt-apr-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 22 : (v.workSchedule === '12X36' ? 15 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(500000 + idx),
          period: '2026-04',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-04'),
        ...aprilVouchers
      ];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-03')) {
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
        { employeeName: 'WANDA MARIA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 65.50, currentBalance: -54.50, rechargeNeeded: 200.00, highlightType: 'red' },
        { employeeName: 'ADRIANA GONÇALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 125.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'AUTELI DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 150.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 848.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 848.40, highlightType: 'orange' },
        { employeeName: 'BRAULIO GUALTER NASCIMENTO MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 300.00, highlightType: null },
        { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 646.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 646.00, highlightType: 'orange' },
        { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 175.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 175.00, highlightType: null },
        { employeeName: 'ÉRICA ALVES DA SILVA', idaCost: 15.70, voltaCost: 15.70, dailyCost: 31.40, workSchedule: '2ª A 6ª', expectedValue: 345.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 345.40, highlightType: 'orange' },
        { employeeName: 'JUCILÉIA COELHO SANTOS RODRIGUES', idaCost: 21.15, voltaCost: 21.15, dailyCost: 42.30, workSchedule: '2ª A 6ª', expectedValue: 507.60, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 507.60, highlightType: 'orange' },
        { employeeName: 'LARISSA ALVES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 87.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 87.50, highlightType: null },
        { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 175.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 175.00, highlightType: null }
      ];

      const marchVouchers = defaultMarchData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtmar-' + (idx + 1),
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
          id: 'vt-mar-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 22 : (v.workSchedule === '12X36' ? 16 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(400000 + idx),
          period: '2026-03',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-03'),
        ...marchVouchers
      ];
      updated = true;
    }

    if (!parsed.tenant_settings) {
      parsed.tenant_settings = {
        name: 'Nexa Nefrologia & Clínica Integrada',
        cnpj: '12.345.678/0001-90',
        logo: '',
        themeColor: '#ec4899'
      };
      updated = true;
    }

    if (!parsed.user_profiles) {
      parsed.user_profiles = [
        { id: 'admin', name: 'Administrador / T.I.', permissions: { index: 'write', reception: 'write', clinical: 'write', calendar: 'write', stock: 'write', maintenance: 'write', purchasing: 'write', requisitions: 'write', apac: 'write', finance: 'write', hr: 'write', sesmt: 'write', config: 'write' } },
        { id: 'reception', name: 'Recepção / Atendimento', permissions: { index: 'read', reception: 'write', clinical: 'none', calendar: 'write', stock: 'none', maintenance: 'read', purchasing: 'none', requisitions: 'none', apac: 'read', finance: 'none', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'clinical', name: 'Equipe Multiprofissional', permissions: { index: 'read', reception: 'read', clinical: 'write', calendar: 'read', stock: 'read', maintenance: 'read', purchasing: 'none', requisitions: 'write', apac: 'none', finance: 'none', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'financial', name: 'Gestão Financeira', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'none', maintenance: 'read', purchasing: 'read', requisitions: 'none', apac: 'write', finance: 'write', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'hr', name: 'Recursos Humanos (RH)', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'none', maintenance: 'read', purchasing: 'read', requisitions: 'none', apac: 'none', finance: 'none', hr: 'write', sesmt: 'read', config: 'none' } },
        { id: 'sesmt', name: 'SESMT & Segurança do Trabalho', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'none', maintenance: 'read', purchasing: 'none', requisitions: 'none', apac: 'none', finance: 'none', hr: 'read', sesmt: 'write', config: 'none' } },
        { id: 'stock_keeper', name: 'Almoxarifado & Farmácia', permissions: { index: 'read', reception: 'none', clinical: 'read', calendar: 'none', stock: 'write', maintenance: 'read', purchasing: 'write', requisitions: 'write', apac: 'none', finance: 'none', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'technician', name: 'Manutenção & Engenharia Clínica', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'read', maintenance: 'write', purchasing: 'read', requisitions: 'read', apac: 'none', finance: 'none', hr: 'none', sesmt: 'read', config: 'none' } },
        { id: 'apac', name: 'Faturamento & APACs', permissions: { index: 'read', reception: 'read', clinical: 'none', calendar: 'none', stock: 'none', maintenance: 'none', purchasing: 'none', requisitions: 'none', apac: 'write', finance: 'read', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'purchasing', name: 'Compras & Suprimentos', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'read', maintenance: 'none', purchasing: 'write', requisitions: 'read', apac: 'none', finance: 'read', hr: 'none', sesmt: 'none', config: 'none' } }
      ];
      updated = true;
    }

    if (updated) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  }

  // Default initial database state
  const initialDB = {
    users: [
      {
        uid: 'techcosta-admin-uid',
        email: 'contato@techcosta.net',
        name: 'Administrador TechCosta',
        role: 'admin',
        allowedSectors: ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'],
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'anacg-uid',
        email: 'anacg@nexa.com',
        name: 'Ana Carolina Cerqueira Gonzaga',
        role: 'rh',
        allowedSectors: ['rh'],
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'jsoares-uid',
        email: 'jsoares@nexa.com',
        name: 'J. Soares',
        role: 'rh',
        allowedSectors: ['rh'],
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'roseannefa-uid',
        email: 'roseannefa@nexa.com',
        name: 'Roseanne Faria',
        role: 'sesmt',
        allowedSectors: ['sesmt'],
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ],
    sectors: [
      { id: 'enfermagem', name: 'Enfermagem', description: 'Métricas assistenciais da equipe de enfermagem' },
      { id: 'medica', name: 'Equipe Médica', description: 'Indicadores clínicos e mortalidade' },
      { id: 'qualidade', name: 'Qualidade', description: 'Satisfação do paciente e auditorias' },
      { id: 'faturamento', name: 'Faturamento', description: 'Glosas, custos e faturamento de diálise' },
      { id: 'psicologia', name: 'Psicologia', description: 'Métricas de cobertura de atendimento psicológico, risco emocional e encaminhamentos à rede.' },
      { id: 'nutricao', name: 'Nutrição', description: 'Métricas de cobertura de atendimento nutricional, adequação metabólica e controle de peso.' },
      { id: 'sesmt', name: 'SESMT & Segurança', description: 'Inspeções de EPI, Extintores e Hidrantes' }
    ],
    indicators: [
      { id: 'taxa_infeccao_cateter', name: 'Taxa de Infecção por Cateter', sectorId: 'enfermagem', unit: '%', target: 1.5, description: 'Percentual de pacientes com infecção de acesso vascular (cateter)' },
      { id: 'reuso_capilares', name: 'Média de Reuso de Dialisadores', sectorId: 'enfermagem', unit: 'reusos', target: 12, description: 'Número médio de vezes que um dialisador (capilar) é reusado' },
      { id: 'taxa_uso_cdl_fim_mes', name: 'Taxa de Uso de CDL (Fim do Mês)', sectorId: 'enfermagem', unit: '%', target: 7.0, description: 'Percentual de pacientes utilizando Cateter Duplo Lúmen temporário no final do mês' },
      { id: 'taxa_uso_permcath', name: 'Taxa de Utilização de Permcath', sectorId: 'enfermagem', unit: '%', target: 23.0, description: 'Percentual de pacientes utilizando Cateter de longa permanência (Permcath)' },
      { id: 'taxa_uso_ptfe', name: 'Taxa de Utilização de PTFE (Prótese)', sectorId: 'enfermagem', unit: '%', target: 4.0, description: 'Percentual de pacientes utilizando prótese vascular (PTFE) como acesso' },
      { id: 'taxa_uso_cateter_longo_prazo', name: 'Taxa de Utilização de Cateter > 3 Meses', sectorId: 'enfermagem', unit: '%', target: 10.0, description: 'Percentual de pacientes utilizando cateter temporário por mais de 3 meses' },
      { id: 'taxa_pacientes_fav', name: 'Taxa de Pacientes com FAV (Fístula)', sectorId: 'enfermagem', unit: '%', target: 66.0, description: 'Percentual de pacientes com Fístula Arteriovenosa (acesso definitivo padrão-ouro)' },
      { id: 'perdas_fav', name: 'Número de Perdas de FAV (Acesso Definitivo)', sectorId: 'enfermagem', unit: 'perdas', target: 2.0, description: 'Número total de fístulas arteriovenosas que foram perdidas/inviabilizadas no mês' },
      { id: 'total_fav_confeccionadas', name: 'Total de FAV Confeccionadas', sectorId: 'enfermagem', unit: 'FAVs', target: 18.0, description: 'Total de fístulas arteriovenosas confeccionadas cirurgicamente no período' },
      { id: 'taxa_fav_simples', name: 'Taxa de FAV Simples (Confecção)', sectorId: 'enfermagem', unit: '%', target: 15.0, description: 'Percentual de confecções de fístula arteriovenosa simples (nativa)' },
      { id: 'taxa_fav_bloqueio', name: 'Taxa de FAV Simples com Bloqueio (Confecção)', sectorId: 'enfermagem', unit: '%', target: 51.0, description: 'Percentual de confecções de fístula arteriovenosa simples com bloqueio de plexo' },
      { id: 'taxa_fav_basilica', name: 'Taxa de FAV Basílica (Confecção)', sectorId: 'enfermagem', unit: '%', target: 31.0, description: 'Percentual de confecções de fístula arteriovenosa utilizando a veia basílica' },
      { id: 'taxa_fav_maturacao', name: 'Taxa de FAV em Maturação', sectorId: 'enfermagem', unit: '%', target: 106.0, description: 'Percentual de fístulas em processo de maturação em relação às confeccionadas' },
      { id: 'taxa_falencia_primaria', name: 'Taxa de Falência Primária de FAV', sectorId: 'enfermagem', unit: '%', target: 17.0, description: 'Percentual de fístulas arteriovenosas que apresentaram falência antes da primeira punção' },
      { id: 'mortalidade_mensal', name: 'Taxa de Mortalidade Mensal', sectorId: 'medica', unit: '%', target: 5.0, description: 'Percentual de óbitos de pacientes em tratamento no mês' },
      { id: 'mortalidade_hd', name: 'Taxa de Mortalidade Pacientes HD', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de óbitos de pacientes em hemodiálise (HD) sobre o total de pacientes atendidos em HD' },
      { id: 'mortalidade_dp', name: 'Taxa de Mortalidade Pacientes DP', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de óbitos de pacientes em diálise peritoneal (DP) sobre o total de pacientes atendidos em DP' },
      { id: 'mortalidade_geral', name: 'Taxa de Mortalidade Geral', sectorId: 'medica', unit: '%', target: 1.0, description: 'Fórmula: Número de óbitos em HD ou DP / Número total de pacientes atendidos HD ou DP * 100' },
      { id: 'obitos_relacionados_hddp', name: 'Óbitos relacionados a HD/DP', sectorId: 'medica', unit: 'óbitos', target: 2.0, description: 'Número de óbitos diretamente relacionados ao tratamento dialítico' },
      { id: 'total_pacientes_hd', name: 'Total de pacientes atendidos em HD', sectorId: 'medica', unit: 'pacientes', target: 550.0, description: 'Total de pacientes sob tratamento de hemodiálise no mês' },
      { id: 'total_pacientes_dp', name: 'Total de pacientes atendidos em DP', sectorId: 'medica', unit: 'pacientes', target: 75.0, description: 'Total de pacientes sob tratamento de diálise peritoneal no mês' },
      { id: 'obitos_prevalentes_hd', name: 'Óbitos Prevalentes e incidentes em HD', sectorId: 'medica', unit: 'óbitos', target: 5.0, description: 'Total de óbitos acumulados no mês de pacientes de hemodiálise' },
      { id: 'obitos_prevalentes_dp', name: 'Óbitos Prevalentes e incidentes em DP', sectorId: 'medica', unit: 'óbitos', target: 1.0, description: 'Total de óbitos acumulados no mês de pacientes de diálise peritoneal' },
      { id: 'total_internacoes_hosp', name: 'Total de internações Hospitalares', sectorId: 'medica', unit: 'internações', target: 25.0, description: 'Soma total de internações ocorridas no mês de pacientes de HD e DP' },
      { id: 'taxa_hospitalizacao_geral', name: 'Taxa Hospitalização Geral', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual geral de pacientes que necessitaram de hospitalização' },
      { id: 'taxa_hospitalizacao_intercorrência_dialitica', name: 'Taxa hospitalização por Intercorrência Dialitica (DP +HD)', sectorId: 'medica', unit: '%', target: 2.0, description: 'Percentual de internações causadas por intercorrência relacionada à diálise' },
      { id: 'taxa_internacoes_dp', name: 'Taxa de internações DP', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual de internações de pacientes em diálise peritoneal' },
      { id: 'taxa_internacoes_hd', name: 'Taxa de internações HD', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual de internações de pacientes em hemodiálise' },
      { id: 'taxa_internacao_intercorrencia_dp', name: 'Taxa de internação por intercorrencia DP', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de internações por intercorrência de diálise peritoneal' },
      { id: 'taxa_internacoes_intercorrencia_hd', name: 'Taxa de internações intercorrência HD', sectorId: 'medica', unit: '%', target: 2.0, description: 'Percentual de internações por intercorrência de hemodiálise' },
      { id: 'taxa_fav_moises', name: 'Dr. Moisés: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 47.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelo Dr. Moisés' },
      { id: 'falencia_fav_moises', name: 'Dr. Moisés: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 22.0, description: 'Percentual de fístulas realizadas pelo Dr. Moisés que falharam antes da maturação' },
      { id: 'taxa_fav_alexandre', name: 'Dr. Alexandre: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 51.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelo Dr. Alexandre' },
      { id: 'falencia_fav_alexandre', name: 'Dr. Alexandre: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 12.0, description: 'Percentual de fístulas realizadas pelo Dr. Alexandre que falharam antes da maturação' },
      { id: 'taxa_fav_euler_ricardo', name: 'Dr. Euler/Ricardo: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 13.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelos Dr. Euler/Ricardo' },
      { id: 'falencia_fav_euler_ricardo', name: 'Dr. Euler/Ricardo: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 5.0, description: 'Percentual de fístulas realizadas pelos Dr. Euler/Ricardo que falharam antes da maturação' },
      { id: 'taxa_internacao', name: 'Taxa de Internação Hospitalar', sectorId: 'medica', unit: '%', target: 10.0, description: 'Porcentagem de pacientes que necessitaram de internação no período' },
      { id: 'total_pacientes_hddp', name: 'Total de Pacientes HD e DP', sectorId: 'medica', unit: 'pacientes', target: 624.0, description: 'Total bruto de pacientes ativos em hemodiálise e diálise peritoneal no período' },
      { id: 'pacientes_hemotransfundidos_bruto', name: 'Pacientes Hemotransfundidos (Bruto)', sectorId: 'medica', unit: 'pacientes', target: 11.0, description: 'Número total de pacientes que necessitaram de transfusão de sangue no mês' },
      { id: 'total_bolsas_infundidas', name: 'Total de Bolsas Infundidas (Hemotransfusões)', sectorId: 'medica', unit: 'bolsas', target: 16.0, description: 'Número de bolsas de concentrado de hemácias ou outros hemocomponentes transfundidos' },
      { id: 'total_reacoes_transfusionais', name: 'Total de Reações Transfusionais', sectorId: 'medica', unit: 'reações', target: 0.0, description: 'Número total de reações adversas transfusionais notificadas no período' },
      { id: 'taxa_hemotransfusao', name: 'Taxa de Hemotransfusão', sectorId: 'medica', unit: '%', target: 3.0, description: 'Fórmula: Total de hemotransfusões / Total de pacientes HD e DP * 100' },
      { id: 'taxa_pacientes_hemotransfundidos', name: 'Taxa de Pacientes Hemotransfundidos', sectorId: 'medica', unit: '%', target: 2.0, description: 'Fórmula: Total de pacientes hemotransfundidos / Total de pacientes HD e DP * 100' },
      { id: 'taxa_reacao_transfusional', name: 'Taxa de Reação Transfusional', sectorId: 'medica', unit: '%', target: 0.0, description: 'Fórmula: Total de reações transfusionais / Total de bolsas infundidas * 100' },
      { id: 'satisfacao_paciente', name: 'Satisfação do Paciente (NPS)', sectorId: 'qualidade', unit: 'pontos', target: 80.0, description: 'Net Promoter Score aferido na pesquisa trimestral' },
      { id: 'glosas_faturamento', name: 'Percentual de Glosas', sectorId: 'faturamento', unit: '%', target: 2.0, description: 'Porcentagem de faturamento glosado pelo SUS/Convênios' },
      
      { id: 'taxa_atendimento_psico', name: 'Taxa de Atendimento Psicológico', sectorId: 'psicologia', unit: '%', target: 40.0, description: 'Percentual de pacientes atendidos no mês sobre o total em diálise (DP + HD).' },
      { id: 'taxa_risco_psico', name: 'Taxa de Risco Psicológico', sectorId: 'psicologia', unit: '%', target: 25.0, description: 'Percentual de pacientes identificados com ansiedade, depressão ou risco emocional.' },
      { id: 'taxa_encaminhamento_rede', name: 'Taxa de Encaminhamento à Rede', sectorId: 'psicologia', unit: '%', target: 5.0, description: 'Percentual de encaminhamentos para acompanhamento externo ou avaliação de transplante.' },
      { id: 'psico_total_pacientes', name: 'Total de pacientes em diálise', sectorId: 'psicologia', unit: 'pacientes', target: 600, description: 'Total de pacientes em diálise no mês.' },
      { id: 'psico_admitidos', name: 'Número de pacientes admitidos no mês', sectorId: 'psicologia', unit: 'pacientes', target: 20, description: 'Pacientes admitidos no mês.' },
      { id: 'psico_atendidos', name: 'Número de pacientes atendidos no mês', sectorId: 'psicologia', unit: 'pacientes', target: 240, description: 'Pacientes atendidos no mês.' },
      { id: 'psico_crise', name: 'Número paciente atendido em crise', sectorId: 'psicologia', unit: 'pacientes', target: 5, description: 'Pacientes atendidos em crise.' },
      { id: 'psico_demanda_espontanea', name: 'Número de pacientes com demanda espontânea', sectorId: 'psicologia', unit: 'pacientes', target: 20, description: 'Atendimentos por demanda espontânea.' },
      { id: 'psico_busca_ativa', name: 'Número de pacientes com demanda por busca ativa', sectorId: 'psicologia', unit: 'pacientes', target: 200, description: 'Atendimentos por busca ativa.' },
      { id: 'psico_familiares', name: 'Número de atendimentos a familiares/acompanhantes', sectorId: 'psicologia', unit: 'atendimentos', target: 50, description: 'Atendimentos a familiares e acompanhantes.' },
      { id: 'psico_ansiedade_provavel', name: 'Ansiedade provável', sectorId: 'psicologia', unit: 'pacientes', target: 10, description: 'Pacientes com ansiedade provável.' },
      { id: 'psico_ansiedade_possivel', name: 'Ansiedade possível', sectorId: 'psicologia', unit: 'pacientes', target: 20, description: 'Pacientes com ansiedade possível.' },
      { id: 'psico_depressao_provavel', name: 'Depressão provável', sectorId: 'psicologia', unit: 'pacientes', target: 10, description: 'Pacientes com depressão provável.' },
      { id: 'psico_depressao_possivel', name: 'Depressão possível', sectorId: 'psicologia', unit: 'pacientes', target: 20, description: 'Pacientes com depressão possível.' },
      { id: 'psico_outros_riscos', name: 'Outros riscos', sectorId: 'psicologia', unit: 'pacientes', target: 10, description: 'Pacientes com outros riscos psicológicos.' },
      { id: 'psico_encam_psiquiatria', name: 'Psiquiatria', sectorId: 'psicologia', unit: 'pacientes', target: 5, description: 'Encaminhamentos para psiquiatria.' },
      { id: 'psico_encam_rede', name: 'Rede', sectorId: 'psicologia', unit: 'pacientes', target: 5, description: 'Encaminhamentos para a rede.' },
      { id: 'psico_encam_tx', name: 'Avaliação para TX', sectorId: 'psicologia', unit: 'pacientes', target: 10, description: 'Encaminhamentos para avaliação de transplante.' },      
      { id: 'taxa_atendimento_nutri', name: 'Taxa de Atendimento Nutricional', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes atendidos no mês pela equipe de Nutrição.' },
      
      { id: 'potassio_baixo', name: 'Potássio Sérico Baixo (< 3,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 5.0, description: 'Percentual de pacientes com nível de Potássio sérico baixo (< 3,5 mEq/L).' },
      { id: 'controle_potassio', name: 'Potássio Sérico Adequado (3,5 a 5,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes com nível de Potássio sérico adequado (entre 3,5 e 5,5 mEq/L).' },
      { id: 'potassio_alto', name: 'Potássio Sérico Alto (> 5,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes com nível de Potássio sérico alto (> 5,5 mEq/L).' },
      
      { id: 'fosforo_baixo', name: 'Fósforo Sérico Baixo (< 3,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 10.0, description: 'Percentual de pacientes com nível de Fósforo sérico baixo (< 3,5 mg/dL).' },
      { id: 'controle_fosforo', name: 'Fósforo Sérico Adequado (3,5 a 5,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes com nível de Fósforo sérico adequado (entre 3,5 e 5,5 mg/dL).' },
      { id: 'fosforo_alto', name: 'Fósforo Sérico Alto (> 5,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 20.0, description: 'Percentual de pacientes com nível de Fósforo sérico alto (> 5,5 mg/dL).' },
      
      { id: 'nutri_baixo_peso', name: 'Taxa de Pacientes com Baixo Peso (IMC < 18,5)', sectorId: 'nutricao', unit: '%', target: 20.0, description: 'Percentual de pacientes classificados com baixo peso (IMC < 18,5).' },
      { id: 'nutri_peso_adequado', name: 'Taxa de Pacientes com Peso Adequado (IMC 18,5 - 24,9)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes classificados com peso adequado (IMC 18,5 a 24,9).' },
      { id: 'nutri_obesidade', name: 'Taxa de Pacientes com Obesidade (IMC ≥ 30)', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes classificados com obesidade (IMC ≥ 30).' },

      { id: 'controle_gpid', name: 'Controle de Peso Interdialítico (GPID)', sectorId: 'nutricao', unit: '%', target: 70.0, description: 'Percentual de pacientes com ganho de peso interdialítico adequado (≤ 5% do peso seco).' },
      { id: 'controle_albumina', name: 'Adequação de Albumina Sérica', sectorId: 'nutricao', unit: '%', target: 70.0, description: 'Percentual de pacientes com nível de Albumina sérica adequado (> 3.0 g/dL).' },

      { id: 'qualidade_ktv', name: 'Adequação de Hemodiálise (Kt/V > 1,2)', sectorId: 'qualidade', unit: '%', target: 70.0, description: 'Percentual de pacientes com Kt/V maior que 1,2.' },
      { id: 'qualidade_hb_normal', name: 'Pacientes sem Anemia (HB >= 10)', sectorId: 'qualidade', unit: '%', target: 50.0, description: 'Percentual de pacientes com Hemoglobina maior ou igual a 10 g/dL.' },
      { id: 'qualidade_hb_grave', name: 'Pacientes com Anemia Grave (HB <= 7)', sectorId: 'qualidade', unit: '%', target: 5.0, description: 'Percentual de pacientes com Hemoglobina menor ou igual a 7 g/dL.' },
      { id: 'qualidade_pth', name: 'Paratormônio Elevado (PTH > 600 pg/ml)', sectorId: 'qualidade', unit: '%', target: 20.0, description: 'Percentual de pacientes com nível de PTH maior que 600 pg/ml.' }
    ],
    indicator_data: [
      // Kt/V (Qualidade)
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 71.48, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 74.91, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 76.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 69.64, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 62.41, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Hb >= 10 (Qualidade)
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 62.90, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 54.90, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 58.10, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 61.50, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 58.40, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Hb <= 7 (Qualidade)
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 3.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.62, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 4.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.74, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // PTH > 600 (Qualidade)
      { indicatorId: 'qualidade_pth', sectorId: 'qualidade', value: 63.93, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.8, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.4, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.2, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.6, period: '2026-07', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 11.2, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 11.8, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 12.3, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 12.1, period: '2026-07', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 4.2, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 5.1, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 4.8, period: '2026-07', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 9.5, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 11.2, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 8.9, period: '2026-07', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 78, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 82, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 84, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      
      // Cobertura Atendimento Psicológico (Psicologia)
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 49.04, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 29.01, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 6.79, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 28.27, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 36.96, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 40.58, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Taxa de Risco Psicológico (Psicologia)
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 28.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 26.00, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 15.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 14.56, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 34.43, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 21.79, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Taxa de Encaminhamento à Rede (Psicologia)
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 5.92, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 3.21, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 9.30, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 8.47, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 1.30, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 4.97, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Cobertura Atendimento Nutricional (Nutrição)
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 16.88, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 15.87, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 10.27, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 12.46, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 4.32, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 18.04, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Potássio Baixo (< 3,5)
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 25.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.02, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Potássio Adequado (Nutrição)
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 66.03, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 60.09, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 61.39, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 63.82, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 68.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Potássio Alto (> 5,5)
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 8.30, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 38.63, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.73, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.17, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 30.61, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Fósforo Baixo (< 3,5)
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 7.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 13.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 15.52, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 29.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 20.41, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Fósforo Adequado (Nutrição)
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 48.44, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 57.18, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 34.72, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 62.16, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 61.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 58.84, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Fósforo Alto (> 5,5)
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 43.86, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 29.54, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 49.74, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 8.11, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 20.75, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Baixo Peso
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 56.52, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 0.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 41.17, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 45.45, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Peso Adequado
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 34.78, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 80.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 47.05, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 18.18, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Obesidade
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 8.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 22.22, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 20.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.76, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.11, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 36.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Ganho de Peso Interdialítico (Nutrição)
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 68.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 72.72, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 66.23, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 55.69, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 58.75, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 54.43, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Albumina Sérica (Nutrição)
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 97.40, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.10, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 94.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.80, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.50, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // mortalidade_hd
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.10, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.83, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.09, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.09, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.46, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 2.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // mortalidade_dp
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 2.63, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 4.17, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // mortalidade_geral
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 0.96, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.78, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 0.95, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.28, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.28, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 2.25, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // obitos_relacionados_hddp
      { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 2, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 3, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 2, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_pacientes_hd
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 547, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 546, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 550, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 550, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 548, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 549, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_pacientes_dp
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 75, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 73, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 79, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 76, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 77, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 72, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // obitos_prevalentes_hd
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 10, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 8, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 11, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // obitos_prevalentes_dp
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 1, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 2, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 3, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_internacoes_hosp
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 33, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 18, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 27, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 27, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 30, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 31, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_hospitalizacao_geral
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 5.31, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 2.91, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.29, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.31, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.80, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.99, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_hospitalizacao_intercorrência_dialitica
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.41, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.94, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.91, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.40, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.24, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.93, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_internacoes_dp
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 6.67, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.06, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 1.32, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.19, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.56, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_internacoes_hd
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 5.12, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 3.11, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.18, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.73, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.74, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.92, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_internacao_intercorrencia_dp
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 2.67, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 1.27, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 2.60, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 0.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_internacoes_intercorrencia_hd
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.38, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.01, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.73, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.19, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.19, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_uso_cdl_fim_mes
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 9.14, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 8.97, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 9.45, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 10.18, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 11.13, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 10.93, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_uso_permcath
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 26.33, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 27.47, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 25.45, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 25.82, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 24.64, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 21.68, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_uso_ptfe
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.10, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.27, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.27, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_uso_cateter_longo_prazo
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 2.93, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 2.56, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 3.09, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 3.64, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 4.01, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 4.19, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_pacientes_fav
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 63.60, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 65.10, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.00, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.40, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 66.10, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // perdas_fav
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 0, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 6, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 3, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // total_fav_confeccionadas
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 8, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 16, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 19, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 18, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 29, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_fav_simples
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 25.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 25.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 10.53, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 16.67, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 0.00, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_fav_bloqueio
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 25.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 50.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 68.42, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 55.56, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 55.17, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_fav_basilica
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 50.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 25.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 21.05, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 22.22, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 37.93, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_fav_maturacao
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 87.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 81.25, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 78.95, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 122.22, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 162.07, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_falencia_primaria
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 12.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 18.75, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 21.05, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 16.67, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 13.79, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // Dr. Moisés: Confecção
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 62.50, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 43.75, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 57.89, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 27.78, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 41.38, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Moisés: Falência Primária
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 20.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 28.57, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 18.18, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 20.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 25.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Alexandre: Confecção
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 37.50, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 56.25, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 42.11, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 72.22, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 44.83, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Alexandre: Falência Primária
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 11.11, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 25.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 15.38, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 7.69, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Euler/Ricardo: Confecção
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 13.79, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Euler/Ricardo: Falência Primária
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_pacientes_hddp
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 621, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 619, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 629, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 626, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 625, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 621, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // pacientes_hemotransfundidos_bruto
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 8, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 7, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 13, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 12, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 12, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 11, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_bolsas_infundidas
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 16, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 15, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 16, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 19, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 17, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 14, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_reacoes_transfusionais
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_hemotransfusao
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.58, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.42, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.54, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 3.04, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.72, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.25, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_pacientes_hemotransfundidos
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.29, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.13, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 2.07, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.92, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.92, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.77, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_reacao_transfusional
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
    ],
    uploads_history: [],
    patients: getDefaultPatients(),
    shifts: [
      { id: 'shift_1', name: '1º Turno' },
      { id: 'shift_2', name: '2º Turno' },
      { id: 'shift_3', name: '3º Turno' }
    ],
    rooms: [
      { id: 'room_1', name: 'Salão 1' },
      { id: 'room_2', name: 'Salão 2' },
      { id: 'room_3', name: 'Salão 3' }
    ],
    accessTypes: [
      { id: 'access_1', name: 'Fístula Arteriovenosa' },
      { id: 'access_2', name: 'Cateter Duplo Lúmen' },
      { id: 'access_3', name: 'Prótese' }
    ],
    dialysisFrequencies: [
      { id: 'freq_1', name: '3x por semana (Seg/Qua/Sex)' },
      { id: 'freq_2', name: '3x por semana (Ter/Qui/Sáb)' },
      { id: 'freq_3', name: '2x por semana' },
      { id: 'freq_4', name: 'Diário' }
    ],
    prescriptions: [
      {
        id: 'presc-1',
        patientId: 'pat-1',
        patientName: 'ADAIR PRAXEDES MORENO',
        type: 'HD',
        dialyzerModel: 'HF80 (Alto Fluxo)',
        sessionTime: '4.0',
        bloodFlow: '350',
        dialysateFlow: '500',
        heparinType: 'Intermitente',
        heparinDose: '5000 UI',
        bicarbonate: '32 mEq/L',
        sodium: '138 mEq/L',
        dryWeight: 64.0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'presc-2',
        patientId: 'pat-2',
        patientName: 'ADAO LUCIANO DIAS',
        type: 'HD',
        dialyzerModel: 'HF60 (Baixo Fluxo)',
        sessionTime: '4.0',
        bloodFlow: '300',
        dialysateFlow: '500',
        heparinType: 'Sem Heparina',
        heparinDose: '0',
        bicarbonate: '30 mEq/L',
        sodium: '140 mEq/L',
        dryWeight: 60.5,
        updatedAt: new Date().toISOString()
      }
    ],
    sessions_logs: [
      {
        id: 'log-1',
        patientId: 'pat-1',
        patientName: 'ADAIR PRAXEDES MORENO',
        date: new Date().toISOString().substring(0, 10),
        shift: '2º Turno',
        room: 'Salão 1',
        chairNumber: '1',
        hourlyData: [
          { hour: '1ªh', bp: '130/80', hr: '76', venousPressure: '120', arterialPressure: '-150', bloodFlowReal: '350', ufRate: '0.8', notes: 'Início sem queixas' },
          { hour: '2ªh', bp: '125/75', hr: '74', venousPressure: '120', arterialPressure: '-160', bloodFlowReal: '350', ufRate: '0.8', notes: 'Sessão estável' },
          { hour: '3ªh', bp: '110/70', hr: '80', venousPressure: '130', arterialPressure: '-160', bloodFlowReal: '330', ufRate: '0.5', notes: 'Caimbra leve em panturrilha. Reduzida taxa de UF.' }
        ],
        complications: ['Câimbras'],
        notes: 'Paciente finalizou bem a diálise, caimbras resolvidas com soro fisiológico e redução da taxa de UF.'
      }
    ],
    clinical_notes: [
      {
        id: 'note-1',
        patientId: 'pat-1',
        patientName: 'ADAIR PRAXEDES MORENO',
        date: new Date().toISOString().substring(0, 10),
        category: 'Médica',
        author: 'Dr. Lucas (Nefrologista)',
        text: 'Paciente evoluindo com boa tolerância hemodinâmica à ultrafiltração. Kt/V do último mês de 1.45 (dentro da meta). Acesso fístula arteriovenosa com bom frêmito, sem sinais inflamatórios.'
      },
      {
        id: 'note-2',
        patientId: 'pat-1',
        patientName: 'ADAIR PRAXEDES MORENO',
        date: new Date().toISOString().substring(0, 10),
        category: 'Nutrição',
        author: 'Nutr. Julia',
        text: 'Paciente relata boa adesão à dieta hipopotassêmica. Ganho de peso interdialítico médio de 2.1kg (adequado para o peso seco de 64kg).'
      }
    ],
    inventory_items: initialProducts,
    stock_transactions: [
      { id: 'tx-1', itemId: 'item-1', itemName: 'Dialisador HF80 (Alto Fluxo)', quantity: 150, type: 'Entrada', batch: 'L-A120', expiryDate: '2028-05-10', operator: 'Almoxarife João', date: '2026-07-01T09:00:00.000Z', notes: 'Compra regular nota fiscal 9931' },
      { id: 'tx-2', itemId: 'item-1', itemName: 'Dialisador HF80 (Alto Fluxo)', quantity: 30, type: 'Saída', batch: 'L-A120', expiryDate: '2028-05-10', operator: 'Almoxarife João', date: '2026-07-10T14:30:00.000Z', notes: 'Dispensação para a Sala 1' },
      { id: 'tx-3', itemId: 'item-6', itemName: 'Sacarato Hidróxido Ferro III 100mg', quantity: 10, type: 'Saída', batch: 'L-M400', expiryDate: '2026-08-30', operator: 'Farmacêutica Marta', date: '2026-07-14T11:15:00.000Z', notes: 'Aplicação de rotina pós-diálise' }
    ],
    suppliers: initialSuppliers,
    stock_sectors: [
      { id: 'sec-stock-1', name: 'Almoxarifado Central', description: 'Armazenamento geral de insumos da clínica' },
      { id: 'sec-stock-2', name: 'Farmácia Satélite', description: 'Dispensação imediata de medicamentos de alto custo' },
      { id: 'sec-stock-3', name: 'Posto de Enfermagem', description: 'Materiais de uso rápido em hemodiálise' }
    ],
    purchase_invoices: [],
    employees: [
      {
        id: 'emp-1',
        name: 'Clara Rodrigues',
        gender: 'Feminino',
        birthDate: '1990-05-15',
        cpf: '123.456.789-01',
        rg: 'MG-12.345.678',
        motherName: 'Maria Rodrigues',
        phone: '(31) 98765-4321',
        email: 'clara.rodrigues@clinica.com',
        city: 'Belo Horizonte',
        state: 'MG',
        address: 'Rua das Flores, 123',
        cep: '30123-456',
        role: 'Enfermeira Chefe',
        sectorId: 'enfermagem',
        admissionDate: '2023-01-10',
        contractType: 'CLT',
        salary: 4500,
        bankName: 'Banco do Brasil',
        bankAgency: '1234-5',
        bankAccount: '98765-4',
        photo: '',
        dependents: [
          { name: 'Mateus Rodrigues', relationship: 'Filho(a)', birthDate: '2018-09-20' }
        ],
        warnings: [
          { id: 'warn-1', date: '2026-02-10', motive: 'Atraso Injustificado', text: 'Chegada tardia no início do turno sem aviso prévio.', docUrl: '' }
        ],
        vaccinations: [
          { name: 'Hepatite B', dose: '3ª Dose', date: '2025-06-12', expiryDate: '', lot: 'HEP-B-9988' },
          { name: 'Dupla Viral (DT)', dose: 'Reforço', date: '2024-03-10', expiryDate: '2034-03-10', lot: 'DT-4411' }
        ],
        documents: [
          { name: 'Diploma de Enfermagem', category: 'Diploma', expiryDate: '', fileUrl: '' }
        ]
      },
      {
        id: 'emp-2',
        name: 'Dr. Lucas Nefro',
        gender: 'Masculino',
        birthDate: '1982-11-04',
        cpf: '987.654.321-00',
        rg: 'MG-9.876.543',
        motherName: 'Juliana Nefro',
        phone: '(31) 99988-7766',
        email: 'lucas.nefro@clinica.com',
        city: 'Betim',
        state: 'MG',
        address: 'Av. Amazonas, 456',
        cep: '32600-000',
        role: 'Médico Nefrologista',
        sectorId: 'medica',
        admissionDate: '2022-03-01',
        contractType: 'PJ',
        salary: 12000,
        bankName: 'Itaú',
        bankAgency: '4321',
        bankAccount: '12345-6',
        photo: '',
        dependents: [],
        warnings: [],
        vaccinations: [
          { name: 'COVID-19 Bivalente', dose: 'Reforço', date: '2024-01-15', expiryDate: '2025-01-15', lot: 'COV-BIV-12' }
        ],
        documents: []
      }
    ],
    audit_logs: [
      {
        id: 'log-audit-1',
        date: new Date().toISOString(),
        operator: 'admin@clinica.com',
        action: 'Inicialização do Sistema',
        details: 'Banco de dados local mock inicializado com sucesso.'
      }
    ]
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialDB));
  return initialDB;
};

const setDB = (data) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
};

const recalculateRhIndicators = (db) => {
  if (!db.employees) db.employees = [];
  if (!db.indicator_data) db.indicator_data = [];

  const periods = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];
  
  periods.forEach(period => {
    const [year, monthStr] = period.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(monthStr) - 1;

    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);

    const activeEmployees = db.employees.filter(e => {
      if (!e.admissionDate) return false;
      const adm = new Date(e.admissionDate);
      if (adm > endDate) return false;
      
      if (e.status === 'Inativo' && e.terminationDate) {
        const term = new Date(e.terminationDate);
        if (term < startDate) return false;
      }
      return true;
    });

    const activeCount = activeEmployees.length;

    const hires = db.employees.filter(e => {
      if (!e.admissionDate) return false;
      const adm = new Date(e.admissionDate);
      return adm >= startDate && adm <= endDate;
    }).length;

    const demissions = db.employees.filter(e => {
      if (e.status === 'Inativo' && e.terminationDate) {
        const term = new Date(e.terminationDate);
        return term >= startDate && term <= endDate;
      }
      return false;
    }).length;

    const turnoverRate = activeCount > 0 ? (((hires + demissions) / 2) / activeCount) * 100 : 0;

    let missedHours = 0;
    activeEmployees.forEach(e => {
      if (e.absences) {
        e.absences.forEach(abs => {
          if (abs.date && abs.type === 'Falta Injustificada') {
            const absDate = new Date(abs.date);
            if (absDate >= startDate && absDate <= endDate) {
              missedHours += parseFloat(abs.hours) || 0;
            }
          }
        });
      }
    });

    const absenteeismRate = activeCount > 0 ? (missedHours / (activeCount * 176)) * 100 : 0;

    const turnIndex = db.indicator_data.findIndex(d => d.indicatorId === 'taxa_turnover' && d.period === period);
    const turnEntry = {
      indicatorId: 'taxa_turnover',
      sectorId: 'rh',
      value: parseFloat(turnoverRate.toFixed(2)),
      period,
      uploadedBy: 'system-rh',
      uploadedAt: new Date().toISOString()
    };
    if (turnIndex > -1) {
      db.indicator_data[turnIndex] = turnEntry;
    } else {
      db.indicator_data.push(turnEntry);
    }

    const absIndex = db.indicator_data.findIndex(d => d.indicatorId === 'taxa_absenteismo' && d.period === period);
    const absEntry = {
      indicatorId: 'taxa_absenteismo',
      sectorId: 'rh',
      value: parseFloat(absenteeismRate.toFixed(2)),
      period,
      uploadedBy: 'system-rh',
      uploadedAt: new Date().toISOString()
    };
    if (absIndex > -1) {
      db.indicator_data[absIndex] = absEntry;
    } else {
      db.indicator_data.push(absEntry);
    }
  });
};

// Auth State Subscriptions
let authCallbacks = [];
let currentUser = null;

// Load persisted user if any
const savedUserSession = sessionStorage.getItem('sistema_indicadores_session');
if (savedUserSession) {
  const db = getDB();
  const found = db.users.find(u => u.uid === savedUserSession);
  if (found) currentUser = found;
}

const triggerAuthChange = () => {
  authCallbacks.forEach(cb => cb(currentUser));
};

export const mockAuth = {
  signInWithEmailAndPassword: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    const cleanEmail = (email || '').trim().toLowerCase();
    const found = db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    let isValid = false;
    if (found) {
      const prefix = cleanEmail.split('@')[0];
      if (
        password === prefix + '123' || 
        password === 'admin123' || 
        password === '123456' || 
        password === 'nexa123' || 
        password === 'techcosta123' || 
        password === 'admin'
      ) {
        isValid = true;
      }
    }

    if (found && isValid) {
      if (found.status === 'inactive') {
        throw { code: 'auth/user-disabled', message: 'Este usuário está inativo no sistema. Procure o administrador.' };
      }
      currentUser = found;
      sessionStorage.setItem('sistema_indicadores_session', found.uid);
      triggerAuthChange();
      return { user: { uid: found.uid, email: found.email } };
    }
    throw { code: 'auth/invalid-credential', message: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
  },

  signOut: async () => {
    currentUser = null;
    sessionStorage.removeItem('sistema_indicadores_session');
    triggerAuthChange();
    return true;
  },

  onAuthStateChanged: (callback) => {
    authCallbacks.push(callback);
    callback(currentUser);
    return () => {
      authCallbacks = authCallbacks.filter(cb => cb !== callback);
    };
  },

  createUser: async (email, name, role, allowedSectors) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const db = getDB();
    const emailExists = db.users.some(u => u.email === email);
    if (emailExists) {
      throw new Error('E-mail já cadastrado.');
    }
    const newUser = {
      uid: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
      allowedSectors,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    setDB(db);
    return newUser;
  }
};

export const mockFirestore = {
  // Users List
  getUsers: async () => {
    const db = getDB();
    return db.users;
  },

  updateUserPermissions: async (uid, allowedSectors) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    const index = db.users.findIndex(u => u.uid === uid);
    if (index > -1) {
      db.users[index].allowedSectors = allowedSectors;
      setDB(db);
      return db.users[index];
    }
    throw new Error('Usuário não encontrado');
  },

  updateUser: async (uid, userData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    const index = db.users.findIndex(u => u.uid === uid);
    if (index > -1) {
      db.users[index] = {
        ...db.users[index],
        ...userData,
        updatedAt: new Date().toISOString()
      };
      setDB(db);
      return db.users[index];
    }
    throw new Error('Usuário não encontrado');
  },

  deleteUser: async (uid) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.users = db.users.filter(u => u.uid !== uid);
    setDB(db);
    return { success: true };
  },

  // Sectors Methods
  getSectors: async () => {
    const db = getDB();
    return db.sectors;
  },

  createSector: async (sectorData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const id = sectorData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
    const newSector = {
      id: id + '_' + Math.random().toString(36).substr(2, 4),
      ...sectorData
    };
    db.sectors.push(newSector);
    setDB(db);
    return newSector;
  },

  updateSector: async (id, sectorData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.sectors.findIndex(s => s.id === id);
    if (index > -1) {
      db.sectors[index] = { ...db.sectors[index], ...sectorData };
      setDB(db);
      return db.sectors[index];
    }
    throw new Error('Setor não encontrado');
  },

  deleteSector: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.sectors = db.sectors.filter(s => s.id !== id);
    db.indicators = db.indicators.filter(i => i.sectorId !== id);
    setDB(db);
    return { success: true };
  },

  // Access Types Methods (CRUD)
  getAccessTypes: async () => {
    const db = getDB();
    return db.accessTypes || [];
  },

  createAccessType: async (accessData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const newAccess = {
      id: 'access_' + Math.random().toString(36).substr(2, 5),
      ...accessData
    };
    if (!db.accessTypes) db.accessTypes = [];
    db.accessTypes.push(newAccess);
    setDB(db);
    return newAccess;
  },

  updateAccessType: async (id, accessData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.accessTypes.findIndex(a => a.id === id);
    if (index > -1) {
      db.accessTypes[index] = { ...db.accessTypes[index], ...accessData };
      setDB(db);
      return db.accessTypes[index];
    }
    throw new Error('Tipo de acesso não encontrado');
  },

  deleteAccessType: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.accessTypes = db.accessTypes.filter(a => a.id !== id);
    setDB(db);
    return { success: true };
  },

  // Dialysis Frequencies Methods (CRUD)
  getDialysisFrequencies: async () => {
    const db = getDB();
    return db.dialysisFrequencies || [];
  },

  createDialysisFrequency: async (frequencyData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const newFreq = {
      id: 'freq_' + Math.random().toString(36).substr(2, 5),
      ...frequencyData
    };
    if (!db.dialysisFrequencies) db.dialysisFrequencies = [];
    db.dialysisFrequencies.push(newFreq);
    setDB(db);
    return newFreq;
  },

  updateDialysisFrequency: async (id, frequencyData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.dialysisFrequencies.findIndex(f => f.id === id);
    if (index > -1) {
      db.dialysisFrequencies[index] = { ...db.dialysisFrequencies[index], ...frequencyData };
      setDB(db);
      return db.dialysisFrequencies[index];
    }
    throw new Error('Escala de diálise não encontrada');
  },

  deleteDialysisFrequency: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.dialysisFrequencies = db.dialysisFrequencies.filter(f => f.id !== id);
    setDB(db);
    return { success: true };
  },

  // Indicators list
  getIndicators: async () => {
    const db = getDB();
    return db.indicators;
  },

  // Get indicator data history
  getIndicatorData: async (allowedSectorIds) => {
    const db = getDB();
    if (!allowedSectorIds || allowedSectorIds.length === 0) return [];
    return db.indicator_data.filter(d => allowedSectorIds.includes(d.sectorId));
  },

  // Save indicator data in batch
  saveIndicatorDataBatch: async (records, fileName, uploaderUid) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const db = getDB();
    
    let rowsProcessed = 0;
    
    records.forEach(rec => {
      const sector = db.sectors.find(s => s.name.toLowerCase() === rec.sector.toLowerCase() || s.id === rec.sector.toLowerCase());
      if (!sector) return;

      let indicator = db.indicators.find(ind => ind.name.toLowerCase() === rec.indicatorName.toLowerCase() && ind.sectorId === sector.id);
      
      if (!indicator) {
        const indId = rec.indicatorName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
        indicator = {
          id: indId + '_' + Math.random().toString(36).substr(2, 4),
          name: rec.indicatorName,
          sectorId: sector.id,
          unit: rec.unit || '%',
          target: parseFloat(rec.target) || 0,
          description: 'Criado via importação de arquivo'
        };
        db.indicators.push(indicator);
      }

      const existingIndex = db.indicator_data.findIndex(d => d.indicatorId === indicator.id && d.period === rec.period);
      
      const dataPoint = {
        indicatorId: indicator.id,
        sectorId: sector.id,
        value: parseFloat(rec.value),
        period: rec.period,
        uploadedBy: uploaderUid,
        uploadedAt: new Date().toISOString()
      };

      if (existingIndex > -1) {
        db.indicator_data[existingIndex] = dataPoint;
      } else {
        db.indicator_data.push(dataPoint);
      }
      rowsProcessed++;
    });

    const uploadRecord = {
      id: 'upload-' + Math.random().toString(36).substr(2, 9),
      fileName,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString(),
      status: 'success',
      rowsProcessed
    };
    db.uploads_history.push(uploadRecord);

    setDB(db);
    return uploadRecord;
  },

  // Get upload history
  getUploadsHistory: async () => {
    const db = getDB();
    return db.uploads_history.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  },

  // Patients Methods
  getPatients: async () => {
    const db = getDB();
    return db.patients || [];
  },

  createPatient: async (patientData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    const newPatient = {
      id: 'pat-' + Math.random().toString(36).substr(2, 9),
      ...patientData,
      createdAt: new Date().toISOString()
    };
    if (!db.patients) db.patients = [];
    db.patients.push(newPatient);
    setDB(db);
    return newPatient;
  },

  updatePatient: async (id, patientData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.patients.findIndex(p => p.id === id);
    if (index > -1) {
      db.patients[index] = {
        ...db.patients[index],
        ...patientData,
        updatedAt: new Date().toISOString()
      };
      setDB(db);
      return db.patients[index];
    }
    throw new Error('Paciente não encontrado');
  },

  deletePatient: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.patients = db.patients.filter(p => p.id !== id);
    setDB(db);
    return { success: true };
  },

  // Shifts Methods (CRUD)
  getShifts: async () => {
    const db = getDB();
    return db.shifts || [];
  },

  createShift: async (shiftData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const newShift = {
      id: 'shift_' + Math.random().toString(36).substr(2, 5),
      ...shiftData
    };
    if (!db.shifts) db.shifts = [];
    db.shifts.push(newShift);
    setDB(db);
    return newShift;
  },

  updateShift: async (id, shiftData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.shifts.findIndex(s => s.id === id);
    if (index > -1) {
      db.shifts[index] = { ...db.shifts[index], ...shiftData };
      setDB(db);
      return db.shifts[index];
    }
    throw new Error('Turno não encontrado');
  },

  deleteShift: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.shifts = db.shifts.filter(s => s.id !== id);
    setDB(db);
    return { success: true };
  },

  // Rooms Methods (CRUD)
  getRooms: async () => {
    const db = getDB();
    return db.rooms || [];
  },

  createRoom: async (roomData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const newRoom = {
      id: 'room_' + Math.random().toString(36).substr(2, 5),
      ...roomData
    };
    if (!db.rooms) db.rooms = [];
    db.rooms.push(newRoom);
    setDB(db);
    return newRoom;
  },

  updateRoom: async (id, roomData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.rooms.findIndex(r => r.id === id);
    if (index > -1) {
      db.rooms[index] = { ...db.rooms[index], ...roomData };
      setDB(db);
      return db.rooms[index];
    }
    throw new Error('Salão não encontrado');
  },

  deleteRoom: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.rooms = db.rooms.filter(r => r.id !== id);
    setDB(db);
    return { success: true };
  },

  // Indicators management (CRUD)
  createIndicator: async (indicatorData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    const id = indicatorData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
    const newIndicator = {
      id: id + '_' + Math.random().toString(36).substr(2, 5),
      ...indicatorData
    };
    db.indicators.push(newIndicator);
    setDB(db);
    return newIndicator;
  },

  updateIndicator: async (id, indicatorData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.indicators.findIndex(i => i.id === id);
    if (index > -1) {
      db.indicators[index] = {
        ...db.indicators[index],
        ...indicatorData
      };
      setDB(db);
      return db.indicators[index];
    }
    throw new Error('Indicador não encontrado');
  },

  deleteIndicator: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.indicators = db.indicators.filter(i => i.id !== id);
    db.indicator_data = db.indicator_data.filter(d => d.indicatorId !== id);
    setDB(db);
    return { success: true };
  },

  // Save single manual entry
  saveSingleIndicatorRecord: async (record, uploaderUid) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    
    const existingIndex = db.indicator_data.findIndex(
      d => d.indicatorId === record.indicatorId && d.period === record.period
    );
    
    const dataPoint = {
      indicatorId: record.indicatorId,
      sectorId: record.sectorId,
      value: parseFloat(record.value),
      period: record.period,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      db.indicator_data[existingIndex] = dataPoint;
    } else {
      db.indicator_data.push(dataPoint);
    }

    const ind = db.indicators.find(i => i.id === record.indicatorId);
    const indName = ind ? ind.name : 'Indicador';

    const uploadRecord = {
      id: 'upload-' + Math.random().toString(36).substr(2, 9),
      fileName: `Lançamento Manual: ${indName}`,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString(),
      status: 'success',
      rowsProcessed: 1
    };
    db.uploads_history.push(uploadRecord);

    setDB(db);
    return dataPoint;
  },

  getCheckins: async () => {
    const db = getDB();
    return db.checkins || [];
  },

  saveCheckin: async (checkinData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.checkins) db.checkins = [];
    
    // Remove any check-in for the same patient on the same day to avoid duplicates
    const checkinDate = checkinData.date; // YYYY-MM-DD
    db.checkins = db.checkins.filter(
      c => !(c.patientId === checkinData.patientId && c.date === checkinDate)
    );

    const newCheckin = {
      id: 'chk-' + Math.random().toString(36).substr(2, 9),
      ...checkinData,
      timestamp: new Date().toISOString()
    };
    db.checkins.push(newCheckin);
    setDB(db);
    return newCheckin;
  },

  deleteCheckin: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.checkins) {
      db.checkins = db.checkins.filter(c => c.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  // Clinical Prescriptions
  getPrescriptions: async () => {
    const db = getDB();
    return db.prescriptions || [];
  },

  savePrescription: async (prescData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.prescriptions) db.prescriptions = [];
    const index = db.prescriptions.findIndex(p => p.patientId === prescData.patientId);
    
    const updatedPresc = {
      id: index > -1 ? db.prescriptions[index].id : 'presc-' + Math.random().toString(36).substr(2, 9),
      ...prescData,
      updatedAt: new Date().toISOString()
    };

    if (index > -1) {
      db.prescriptions[index] = updatedPresc;
    } else {
      db.prescriptions.push(updatedPresc);
    }
    setDB(db);
    return updatedPresc;
  },

  // Clinical Sessions Logs
  getSessionsLogs: async () => {
    const db = getDB();
    return db.sessions_logs || [];
  },

  saveSessionLog: async (logData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.sessions_logs) db.sessions_logs = [];
    const index = db.sessions_logs.findIndex(l => l.patientId === logData.patientId && l.date === logData.date);

    const updatedLog = {
      id: index > -1 ? db.sessions_logs[index].id : 'log-' + Math.random().toString(36).substr(2, 9),
      ...logData,
      updatedAt: new Date().toISOString()
    };

    if (index > -1) {
      db.sessions_logs[index] = updatedLog;
    } else {
      db.sessions_logs.push(updatedLog);
    }
    setDB(db);
    return updatedLog;
  },

  // Clinical Notes
  getClinicalNotes: async () => {
    const db = getDB();
    return db.clinical_notes || [];
  },

  createClinicalNote: async (noteData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.clinical_notes) db.clinical_notes = [];
    const newNote = {
      id: 'note-' + Math.random().toString(36).substr(2, 9),
      ...noteData,
      date: new Date().toISOString().substring(0, 10)
    };
    db.clinical_notes.push(newNote);
    setDB(db);
    return newNote;
  },

  deleteClinicalNote: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.clinical_notes) {
      db.clinical_notes = db.clinical_notes.filter(n => n.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  // Stock/Inventory Items
  getInventoryItems: async () => {
    const db = getDB();
    return db.inventory_items || [];
  },

  createInventoryItem: async (itemData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.inventory_items) db.inventory_items = [];
    const newItem = {
      id: 'item-' + Math.random().toString(36).substr(2, 9),
      ...itemData,
      currentStock: parseFloat(itemData.currentStock) || 0,
      minStock: parseFloat(itemData.minStock) || 0,
      price: parseFloat(itemData.price) || 0
    };
    db.inventory_items.push(newItem);
    setDB(db);
    return newItem;
  },

  updateInventoryItem: async (id, itemData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.inventory_items.findIndex(i => i.id === id);
    if (index > -1) {
      db.inventory_items[index] = {
        ...db.inventory_items[index],
        ...itemData,
        currentStock: parseFloat(itemData.currentStock) || 0,
        minStock: parseFloat(itemData.minStock) || 0,
        price: parseFloat(itemData.price) || 0
      };
      setDB(db);
      return db.inventory_items[index];
    }
    throw new Error('Item não encontrado');
  },

  // Stock Transactions
  getStockTransactions: async () => {
    const db = getDB();
    return db.stock_transactions || [];
  },

  createStockTransaction: async (txData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.stock_transactions) db.stock_transactions = [];
    if (!db.inventory_items) db.inventory_items = [];

    const newTx = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      ...txData,
      quantity: parseFloat(txData.quantity) || 0,
      date: new Date().toISOString()
    };

    // Update item stock based on transaction type
    const itemIndex = db.inventory_items.findIndex(i => i.id === txData.itemId);
    if (itemIndex > -1) {
      const current = parseFloat(db.inventory_items[itemIndex].currentStock) || 0;
      const change = parseFloat(txData.quantity) || 0;
      if (txData.type === 'Entrada') {
        db.inventory_items[itemIndex].currentStock = current + change;
      } else {
        db.inventory_items[itemIndex].currentStock = Math.max(0, current - change);
      }
    }

    db.stock_transactions.push(newTx);
    setDB(db);
    return newTx;
  },

  // Suppliers CRUD
  getSuppliers: async () => {
    const db = getDB();
    return db.suppliers || [];
  },

  createSupplier: async (supplierData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.suppliers) db.suppliers = [];
    const newSupplier = {
      id: 'sup-' + Math.random().toString(36).substr(2, 9),
      ...supplierData
    };
    db.suppliers.push(newSupplier);
    setDB(db);
    return newSupplier;
  },

  updateSupplier: async (id, supplierData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.suppliers.findIndex(s => s.id === id);
    if (index > -1) {
      db.suppliers[index] = { ...db.suppliers[index], ...supplierData };
      setDB(db);
      return db.suppliers[index];
    }
    throw new Error('Fornecedor não encontrado');
  },

  // Stock Sectors CRUD
  getStockSectors: async () => {
    const db = getDB();
    return db.stock_sectors || [];
  },

  createStockSector: async (sectorData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.stock_sectors) db.stock_sectors = [];
    const newSector = {
      id: 'sec-stock-' + Math.random().toString(36).substr(2, 9),
      ...sectorData
    };
    db.stock_sectors.push(newSector);
    setDB(db);
    return newSector;
  },

  deleteInventoryItem: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.inventory_items) db.inventory_items = db.inventory_items.filter(i => i.id !== id);
    setDB(db);
    return { success: true };
  },

  deleteSupplier: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.suppliers) db.suppliers = db.suppliers.filter(s => s.id !== id);
    setDB(db);
    return { success: true };
  },

  deleteStockSector: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.stock_sectors) db.stock_sectors = db.stock_sectors.filter(s => s.id !== id);
    setDB(db);
    return { success: true };
  },

  // Stock Loans API (Empréstimos de Produtos / Medicamentos)
  getStockLoans: async () => {
    const db = getDB();
    if (!db.stock_loans || db.stock_loans.length === 0) {
      db.stock_loans = [
        {
          id: 'loan-1',
          type: 'Concedido', // Concedido para Terceiros
          productName: 'Erythropoietin (Epoetina) 4000UI',
          quantity: 10,
          unit: 'Caixa(s)',
          partnerName: 'Hospital São Lucas - BH',
          loanDate: '2026-07-20',
          expectedReturnDate: '2026-08-05',
          status: 'Ativo',
          notes: 'Empréstimo emergencial concedido para UTI do hospital.'
        },
        {
          id: 'loan-2',
          type: 'Recebido', // Recebido de Terceiros
          productName: 'Dialisador Capilar High-Flux 1.8m2',
          quantity: 5,
          unit: 'Unidade(s)',
          partnerName: 'Clínica NefroVida Contagem',
          loanDate: '2026-07-22',
          expectedReturnDate: '2026-08-10',
          status: 'Ativo',
          notes: 'Empréstimo recebido para suprir atraso do fornecedor.'
        }
      ];
      setDB(db);
    }
    return db.stock_loans;
  },

  saveStockLoan: async (loanData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.stock_loans) db.stock_loans = [];

    const isEdit = !!loanData.id;
    const loanId = loanData.id || 'loan-' + Math.random().toString(36).substr(2, 9);

    const updatedLoan = {
      ...loanData,
      id: loanId,
      quantity: parseFloat(loanData.quantity) || 0,
      status: loanData.status || 'Ativo',
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      const idx = db.stock_loans.findIndex(l => l.id === loanId);
      if (idx > -1) db.stock_loans[idx] = updatedLoan;
    } else {
      db.stock_loans.push(updatedLoan);
    }

    setDB(db);
    return updatedLoan;
  },

  returnStockLoan: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.stock_loans) {
      const idx = db.stock_loans.findIndex(l => l.id === id);
      if (idx > -1) {
        db.stock_loans[idx].status = 'Devolvido';
        db.stock_loans[idx].returnDate = new Date().toISOString().substring(0, 10);
      }
    }
    setDB(db);
    return { success: true };
  },

  deleteStockLoan: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.stock_loans) {
      db.stock_loans = db.stock_loans.filter(l => l.id !== id);
    }
    setDB(db);
    return { success: true };
  },

  // Product Categories API (Gerenciamento Centralizado no Módulo T.I)
  getProductCategories: async () => {
    const db = getDB();
    if (!db.product_categories || db.product_categories.length === 0) {
      db.product_categories = [
        { id: 'cat-1', name: 'Insumo Clínico', module: 'Estoque', description: 'Linhas de sangue, dialisadores, agulhas de fístula' },
        { id: 'cat-2', name: 'Concentrado', module: 'Estoque', description: 'Solução ácida, bicarbonato de sódio para diálise' },
        { id: 'cat-3', name: 'Medicamento', module: 'Estoque', description: 'Epoetina, ferro injetável, calcitriol, heparina' },
        { id: 'cat-4', name: 'Material Médico', module: 'Estoque', description: 'Gaze, luvas estéreis, seringas, esparadrapos' },
        { id: 'cat-5', name: 'Equipamento', module: 'Estoque/Financeiro', description: 'Peças de reposição e bombas de hemodiálise' },
        { id: 'cat-6', name: 'Serviço/Utilidades', module: 'Financeiro', description: 'Energia elétrica, água, manutenção preventiva' }
      ];
      setDB(db);
    }
    return db.product_categories;
  },

  saveProductCategory: async (catData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.product_categories) db.product_categories = [];

    const isEdit = !!catData.id;
    const catId = catData.id || 'cat-' + Math.random().toString(36).substr(2, 9);

    const updatedCat = {
      ...catData,
      id: catId,
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      const idx = db.product_categories.findIndex(c => c.id === catId);
      if (idx > -1) db.product_categories[idx] = updatedCat;
    } else {
      db.product_categories.push(updatedCat);
    }

    setDB(db);
    return updatedCat;
  },

  deleteProductCategory: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.product_categories) {
      db.product_categories = db.product_categories.filter(c => c.id !== id);
    }
    setDB(db);
    return { success: true };
  },

  // Purchase Invoices CRUD
  getPurchaseInvoices: async () => {
    const db = getDB();
    return db.purchase_invoices || [];
  },

  createPurchaseInvoice: async (invoiceData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.purchase_invoices) db.purchase_invoices = [];
    if (!db.stock_transactions) db.stock_transactions = [];
    if (!db.inventory_items) db.inventory_items = [];

    const newInvoice = {
      id: 'inv-' + Math.random().toString(36).substr(2, 9),
      ...invoiceData,
      entryDate: new Date().toISOString().substring(0, 10),
      status: 'Processada'
    };

    // Auto-create transactions and increment stock level
    for (const item of (invoiceData.items || [])) {
      const newTx = {
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        itemId: item.itemId,
        itemName: item.name,
        quantity: parseFloat(item.quantity) || 0,
        type: 'Entrada',
        batch: item.batch || 'XML-IMPORT',
        expiryDate: item.expiryDate || '',
        operator: 'Importador XML',
        date: new Date().toISOString(),
        notes: `Entrada via NF-e ${invoiceData.number}`
      };
      db.stock_transactions.push(newTx);

      const itemIndex = db.inventory_items.findIndex(i => i.id === item.itemId);
      if (itemIndex > -1) {
        const current = parseFloat(db.inventory_items[itemIndex].currentStock) || 0;
        db.inventory_items[itemIndex].currentStock = current + newTx.quantity;
      }
    }

    db.purchase_invoices.push(newInvoice);
    setDB(db);
    return newInvoice;
  },

  // Employees CRUD
  getEmployees: async () => {
    const db = getDB();
    return db.employees || [];
  },

  createEmployee: async (employeeData) => {
    await new Promise(resolve => setTimeout(resolve, 350));
    const db = getDB();
    if (!db.employees) db.employees = [];
    const newEmployee = {
      id: 'emp-' + Math.random().toString(36).substr(2, 9),
      ...employeeData,
      status: employeeData.status || 'Ativo',
      terminationDate: employeeData.terminationDate || '',
      absences: employeeData.absences || [],
      warnings: employeeData.warnings || [],
      vaccinations: employeeData.vaccinations || [],
      documents: employeeData.documents || [],
      dependents: employeeData.dependents || []
    };
    db.employees.push(newEmployee);
    recalculateRhIndicators(db);
    setDB(db);
    return newEmployee;
  },

  updateEmployee: async (id, employeeData) => {
    await new Promise(resolve => setTimeout(resolve, 350));
    const db = getDB();
    const index = db.employees.findIndex(e => e.id === id);
    if (index > -1) {
      const old = db.employees[index];
      db.employees[index] = {
        ...old,
        ...employeeData,
        status: employeeData.status || old.status || 'Ativo',
        terminationDate: employeeData.terminationDate !== undefined ? employeeData.terminationDate : (old.terminationDate || ''),
        absences: employeeData.absences !== undefined ? employeeData.absences : (old.absences || []),
        dependents: employeeData.dependents !== undefined ? employeeData.dependents : (old.dependents || []),
        warnings: employeeData.warnings !== undefined ? employeeData.warnings : (old.warnings || []),
        vaccinations: employeeData.vaccinations !== undefined ? employeeData.vaccinations : (old.vaccinations || []),
        documents: employeeData.documents !== undefined ? employeeData.documents : (old.documents || [])
      };
      recalculateRhIndicators(db);
      setDB(db);
      return db.employees[index];
    }
    throw new Error('Funcionário não encontrado');
  },

  deleteEmployee: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.employees) {
      db.employees = db.employees.filter(e => e.id !== id);
      recalculateRhIndicators(db);
      setDB(db);
    }
    return { success: true };
  },

  // Transport Vouchers CRUD
  getTransportVouchers: async () => {
    const db = getDB();
    return db.transport_vouchers || [];
  },

  createTransportVoucher: async (voucherData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.transport_vouchers) db.transport_vouchers = [];
    const newVoucher = {
      id: 'vt-' + Math.random().toString(36).substr(2, 9),
      ...voucherData,
      dailyCost: parseFloat(voucherData.dailyCost) || 0,
      daysCount: parseInt(voucherData.daysCount) || 0,
      totalValue: (parseFloat(voucherData.dailyCost) || 0) * (parseInt(voucherData.daysCount) || 0),
      discountPercent: parseFloat(voucherData.discountPercent) || 6
    };
    db.transport_vouchers.push(newVoucher);
    setDB(db);
    return newVoucher;
  },

  updateTransportVoucher: async (id, voucherData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.transport_vouchers.findIndex(v => v.id === id);
    if (index > -1) {
      const old = db.transport_vouchers[index];
      db.transport_vouchers[index] = {
        ...old,
        ...voucherData,
        dailyCost: parseFloat(voucherData.dailyCost) || 0,
        daysCount: parseInt(voucherData.daysCount) || 0,
        totalValue: (parseFloat(voucherData.dailyCost) || 0) * (parseInt(voucherData.daysCount) || 0),
        discountPercent: parseFloat(voucherData.discountPercent) || 6
      };
      setDB(db);
      return db.transport_vouchers[index];
    }
    throw new Error('Vale-Transporte não encontrado');
  },

  deleteTransportVoucher: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const db = getDB();
    if (db.transport_vouchers) {
      db.transport_vouchers = db.transport_vouchers.filter(v => v.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  importTransportVouchersBatch: async (period, vouchersList) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.transport_vouchers) db.transport_vouchers = [];
    if (!db.employees) db.employees = [];

    // Filter out previous vouchers for this period
    db.transport_vouchers = db.transport_vouchers.filter(v => v.period !== period);

    const newItems = vouchersList.map((v, idx) => {
      let empName = (v.employeeName || v.name || 'Sem Nome').trim();
      let emp = db.employees.find(e => e.name && e.name.trim().toLowerCase() === empName.toLowerCase());
      if (!emp && empName) {
        emp = {
          id: 'emp-imp-' + Math.random().toString(36).substr(2, 7),
          name: empName.toUpperCase(),
          role: 'Colaborador CLT',
          sectorId: 'rh',
          admissionDate: new Date().toISOString().split('T')[0],
          contractType: 'CLT',
          salary: 2500,
          status: 'Ativo',
          city: 'Betim',
          state: 'MG'
        };
        db.employees.push(emp);
      }

      const ida = parseFloat(v.idaCost || v.ida) || 0;
      const volta = parseFloat(v.voltaCost || v.volta) || 0;
      const daily = parseFloat(v.dailyCost || v.totalDia) || (ida + volta);
      const expected = parseFloat(v.expectedValue || v.previsto) || 0;
      const prevBal = parseFloat(v.balancePrevious || v.noCartao) || 0;
      const currBal = parseFloat(v.currentBalance || v.cartao) || 0;
      const req = parseFloat(v.rechargeNeeded || v.recarga) || 0;

      return {
        id: 'vt-' + period.replace('-', '') + '-' + (idx + 1),
        employeeId: emp ? emp.id : '',
        employeeName: empName.toUpperCase(),
        route: v.route || 'Linha Urbana',
        idaCost: ida,
        voltaCost: volta,
        dailyCost: daily,
        workSchedule: v.workSchedule || v.escala || 'SEGUNDA A SÁBADO',
        expectedValue: expected,
        daysCount: parseInt(v.daysCount) || (v.workSchedule === '2ª A 6ª' ? 21 : (v.workSchedule === '12X36' ? 16 : 26)),
        totalValue: expected,
        balancePrevious: prevBal,
        currentBalance: currBal,
        rechargeNeeded: Math.max(0, req),
        rawRechargeNeeded: req,
        cardType: v.cardType || 'BetimCARD / BHBus',
        cardNumber: v.cardNumber || '',
        period: period,
        highlightType: v.highlightType || (req < 0 ? 'yellow' : (prevBal === 0 && currBal === 0 ? 'orange' : null)),
        discountPercent: 6
      };
    });

    db.transport_vouchers.push(...newItems);
    setDB(db);
    return newItems;
  },

  // Audit Logs
  getAuditLogs: async () => {
    const db = getDB();
    const logs = db.audit_logs || [];
    return logs.map(l => (l.operator === 'rh@clinica.com' ? { ...l, operator: 'Ana Carolina Cerqueira Gonzaga' } : l));
  },

  createAuditLog: async (logData) => {
    const db = getDB();
    if (!db.audit_logs) db.audit_logs = [];
    const newLog = {
      id: 'log-audit-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      ...logData
    };
    db.audit_logs.push(newLog);
    setDB(db);
    return newLog;
  },

  // Financial management
  getCostCenters: async () => {
    const db = getDB();
    if (!db.cost_centers || db.cost_centers.length === 0) {
      db.cost_centers = [
        { id: '1.1', code: '1.1', name: 'Insumos Dialíticos & Linhas de Sangue', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.2', code: '1.2', name: 'Farmácia Clínica & Medicamentos (MatMed)', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.3', code: '1.3', name: 'Concentrados & Soluções para Diálise', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.4', code: '1.4', name: 'Laboratório & Análises Clínicas Especializadas', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.5', code: '1.5', name: 'Gases Medicinais & Oxigenoterapia', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.6', code: '1.6', name: 'Tratamento de Água & Osmose Reversa', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.7', code: '1.7', name: 'Enfermagem & Assistência Multidisciplinar', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.8', code: '1.8', name: 'Honorários Médicos & Nefrologia PJ', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.9', code: '1.9', name: 'Diálise Peritoneal (DP / DPA)', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '2.1', code: '2.1', name: 'Energia Elétrica & Gerador', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.2', code: '2.2', name: 'Água Potável & Efluentes Hospitalares', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.3', code: '2.3', name: 'Engenharia Clínica & Manutenção de Máquinas', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.4', code: '2.4', name: 'Manutenção Predial & Climatização (HVAC)', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.5', code: '2.5', name: 'Higienização, Limpeza & Desinfecção Hospitalar', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.6', code: '2.6', name: 'Gestão de Resíduos Infectantes (RSS / Lixo Hospitalar)', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.7', code: '2.7', name: 'Lavanderia & Enxoval Hospitalar', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.8', code: '2.8', name: 'Nutrição, Dietética & Copa dos Pacientes', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '3.1', code: '3.1', name: 'Folha de Pagamento Salarial (CLT)', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '3.2', code: '3.2', name: 'Encargos Trabalhistas (FGTS, INSS, PIS)', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '3.3', code: '3.3', name: 'Benefícios (Vale Transporte, Alimentação, Plano de Saúde)', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '3.4', code: '3.4', name: 'Segurança do Trabalho & Saúde Ocupacional (SESMT, EPIs, PCMSO)', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '3.5', code: '3.5', name: 'Educação Continuada, Treinamentos & SIPAT', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '4.1', code: '4.1', name: 'Tecnologia da Informação (TI), Softwares & Nuvem', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.2', code: '4.2', name: 'Contabilidade, Auditoria & Consultoria Financeira', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.3', code: '4.3', name: 'Assessoria Jurídica, Contratos & Compliance', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.4', code: '4.4', name: 'Anuidades & Licenças Regulatórias (CRM, COREN, CRF, VISA, ANVISA)', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.5', code: '4.5', name: 'Aluguel, IPTU, Condomínio & Seguros Patrimoniais', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.6', code: '4.6', name: 'Material de Escritório, Gráfica & Despesas Administrativas', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '5.1', code: '5.1', name: 'Tributos e Impostos (ISS, PIS/COFINS, IRPJ, CSLL)', parentId: '5', parentName: '5. FINANCEIRO, FISCAL & LOGÍSTICA', unit: 'Betim' },
        { id: '5.2', code: '5.2', name: 'Despesas, Tarifas & Juros Bancários', parentId: '5', parentName: '5. FINANCEIRO, FISCAL & LOGÍSTICA', unit: 'Betim' },
        { id: '5.3', code: '5.3', name: 'Transporte de Pacientes, Ambulância & Logística', parentId: '5', parentName: '5. FINANCEIRO, FISCAL & LOGÍSTICA', unit: 'Betim' }
      ];
      setDB(db);
    }
    return db.cost_centers;
  },

  getBudgetPlans: async () => {
    const db = getDB();
    if (!db.budget_plans) {
      db.budget_plans = [];
      setDB(db);
    }
    return db.budget_plans;
  },

  saveBudgetPlan: async (plan) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.budget_plans) db.budget_plans = [];
    let updated;
    if (plan.id) {
      const idx = db.budget_plans.findIndex(b => b.id === plan.id);
      if (idx > -1) {
        db.budget_plans[idx] = { ...db.budget_plans[idx], ...plan };
        updated = db.budget_plans[idx];
      }
    } else {
      updated = { id: 'bp-' + Math.random().toString(36).substr(2, 9), ...plan };
      db.budget_plans.push(updated);
    }
    setDB(db);
    return updated;
  },

  getAgreements: async () => {
    const db = getDB();
    if (!db.agreements || db.agreements.length === 0) {
      db.agreements = [
        {
          id: 'agr-1',
          supplier: 'LACERDA ALIMENTAÇÃO',
          unit: 'Betim',
          totalAmount: 152185.80,
          installmentCount: 6,
          installmentAmount: 25364.30,
          paidInstallments: 3,
          dueDay: 10,
          status: 'Ativo',
          notes: 'Acordo referente a fornecimento de marmitas e lanches clínicos'
        },
        {
          id: 'agr-2',
          supplier: 'FARMARIN INDUSTRIA E COMERCIO LTDA',
          unit: 'Betim',
          totalAmount: 354371.22,
          installmentCount: 14,
          installmentAmount: 25312.23,
          paidInstallments: 2,
          dueDay: 2,
          status: 'Ativo',
          notes: 'Renegociação de fornecimento de concentrados e capilares'
        }
      ];
      setDB(db);
    }
    return db.agreements;
  },

  saveAgreement: async (agr) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.agreements) db.agreements = [];
    let updated;
    if (agr.id) {
      const idx = db.agreements.findIndex(a => a.id === agr.id);
      if (idx > -1) {
        db.agreements[idx] = { ...db.agreements[idx], ...agr };
        updated = db.agreements[idx];
      }
    } else {
      updated = { id: 'agr-' + Math.random().toString(36).substr(2, 9), ...agr };
      db.agreements.push(updated);
    }
    setDB(db);
    return updated;
  },

  getAccountsPayable: async () => {
    const db = getDB();
    if (!db.accounts_payable) {
      db.accounts_payable = [];
      setDB(db);
    }
    return db.accounts_payable;
  },

  saveAccountsPayable: async (item) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.accounts_payable) db.accounts_payable = [];
    
    let updatedItem;
    if (item.id) {
      const idx = db.accounts_payable.findIndex(p => p.id === item.id);
      if (idx > -1) {
        db.accounts_payable[idx] = { ...db.accounts_payable[idx], ...item };
        updatedItem = db.accounts_payable[idx];
      }
    } else {
      updatedItem = {
        id: 'pay-' + Math.random().toString(36).substr(2, 9),
        ...item,
        status: item.status || 'Pendente'
      };
      db.accounts_payable.push(updatedItem);
    }
    setDB(db);
    return updatedItem;
  },

  deleteAccountsPayable: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.accounts_payable) {
      db.accounts_payable = db.accounts_payable.filter(p => p.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  getAccountsReceivable: async () => {
    const db = getDB();
    return db.accounts_receivable || [];
  },

  saveAccountsReceivable: async (item) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.accounts_receivable) db.accounts_receivable = [];
    
    let updatedItem;
    if (item.id) {
      const idx = db.accounts_receivable.findIndex(r => r.id === item.id);
      if (idx > -1) {
        db.accounts_receivable[idx] = { ...db.accounts_receivable[idx], ...item };
        updatedItem = db.accounts_receivable[idx];
      }
    } else {
      updatedItem = {
        id: 'rec-' + Math.random().toString(36).substr(2, 9),
        ...item,
        status: item.status || 'Pendente'
      };
      db.accounts_receivable.push(updatedItem);
    }
    setDB(db);
    return updatedItem;
  },

  deleteAccountsReceivable: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.accounts_receivable) {
      db.accounts_receivable = db.accounts_receivable.filter(r => r.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  getXmlImports: async () => {
    const db = getDB();
    return db.xml_imports || [];
  },

  saveXmlImport: async (xmlData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.xml_imports) db.xml_imports = [];
    
    const newXml = {
      id: 'xml-' + Math.random().toString(36).substr(2, 9),
      filename: xmlData.filename,
      supplier: xmlData.supplier,
      invoiceNumber: xmlData.invoiceNumber,
      amount: parseFloat(xmlData.amount),
      importDate: new Date().toISOString(),
      status: 'Conciliado'
    };
    db.xml_imports.push(newXml);

    // Also automatically create a Bill Payable linked to this XML
    if (!db.accounts_payable) db.accounts_payable = [];
    const newBill = {
      id: 'pay-' + Math.random().toString(36).substr(2, 9),
      supplier: xmlData.supplier,
      cnpj: xmlData.cnpj || '12.345.678/0001-90',
      description: `Importação XML NF-e ${xmlData.invoiceNumber}`,
      amount: parseFloat(xmlData.amount),
      dueDate: xmlData.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 15 days from now
      status: 'Pendente',
      category: 'Insumo Clínico',
      invoiceNumber: xmlData.invoiceNumber,
      paymentDate: ''
    };
    db.accounts_payable.push(newBill);
    
    setDB(db);
    return { success: true, bill: newBill, xml: newXml };
  },

  // Tenant Settings (SaaS Configurations)
  getTenantSettings: async () => {
    const db = getDB();
    return db.tenant_settings || { name: 'Nexa Nefrologia', cnpj: '', logo: '', themeColor: '#ec4899' };
  },

  saveTenantSettings: async (settings) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    db.tenant_settings = { ...(db.tenant_settings || {}), ...settings };
    setDB(db);
    return db.tenant_settings;
  },

  // User Profiles (RBAC Roles)
  getUserProfiles: async () => {
    const db = getDB();
    return db.user_profiles || [];
  },

  saveUserProfile: async (profile) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.user_profiles) db.user_profiles = [];
    const index = db.user_profiles.findIndex(p => p.id === profile.id);
    if (index > -1) {
      db.user_profiles[index] = { ...db.user_profiles[index], ...profile };
    } else {
      db.user_profiles.push(profile);
    }
    setDB(db);
    return profile;
  },

  // Backup and Restore
  exportBackup: async () => {
    const db = getDB();
    return JSON.stringify(db);
  },

  importBackup: async (backupJson) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const parsed = JSON.parse(backupJson);
      if (parsed.users && parsed.employees) {
        setDB(parsed);
        return { success: true };
      }
      throw new Error('Formato de backup inválido.');
    } catch (err) {
      throw new Error('Falha ao restaurar backup: ' + err.message);
    }
  },

  // Debts and Installments API
  getDebts: async () => {
    const db = getDB();
    if (!db.debts) {
      db.debts = [];
      setDB(db);
    }
    return db.debts;
  },

  saveDebt: async (debtData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.debts) db.debts = [];
    if (!db.accounts_payable) db.accounts_payable = [];

    const isEdit = !!debtData.id;
    const debtId = debtData.id || 'debt-' + Math.random().toString(36).substr(2, 9);
    
    const count = parseInt(debtData.installmentCount) || 1;
    const totalVal = parseFloat(debtData.totalAmount) || 0;
    const instVal = parseFloat(debtData.installmentAmount) || (totalVal / count);

    const updatedDebt = {
      ...debtData,
      id: debtId,
      totalAmount: totalVal,
      installmentCount: count,
      installmentAmount: instVal,
      status: debtData.status || 'Ativo',
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      const idx = db.debts.findIndex(d => d.id === debtId);
      if (idx > -1) db.debts[idx] = updatedDebt;
    } else {
      db.debts.push(updatedDebt);

      // AUTOMATICALLY GENERATE N MONTHLY INSTALLMENTS IN ACCOUNTS PAYABLE
      const firstDate = new Date(debtData.firstDueDate || Date.now());
      for (let i = 0; i < count; i++) {
        const dueDate = new Date(firstDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        const padInst = String(i + 1).padStart(2, '0');
        const padCount = String(count).padStart(2, '0');

        db.accounts_payable.push({
          id: `pay-${debtId}-inst-${i + 1}`,
          debtId: debtId,
          supplier: debtData.creditor,
          cnpj: debtData.cnpj || '00.000.000/0001-00',
          description: `Dívida: ${debtData.creditor} (Parc. ${padInst}/${padCount})`,
          amount: instVal,
          dueDate: dueDate.toISOString().substring(0, 10),
          category: debtData.category || 'Equipamento',
          invoiceNumber: `DIV-${debtId.substring(0, 6)}-${padInst}`,
          status: 'Pendente',
          paymentDate: ''
        });
      }
    }

    setDB(db);
    return updatedDebt;
  },

  deleteDebt: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.debts) {
      db.debts = db.debts.filter(d => d.id !== id);
    }
    if (db.accounts_payable) {
      db.accounts_payable = db.accounts_payable.filter(p => p.debtId !== id);
    }
    setDB(db);
    return { success: true };
  },

  // Bank Statement Reconciliation API
  getBankStatements: async () => {
    const db = getDB();
    if (!db.bank_statements) {
      db.bank_statements = [];
      setDB(db);
    }
    return db.bank_statements;
  },

  saveBankStatement: async (statementData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.bank_statements) db.bank_statements = [];
    const newTx = {
      id: 'bank-' + Math.random().toString(36).substr(2, 9),
      ...statementData,
      status: statementData.status || 'Pendente'
    };
    db.bank_statements.push(newTx);
    setDB(db);
    return newTx;
  },

  // Material Requisitions API (Salão de Hemodiálise & Estoque)
  getMaterialRequisitions: async () => {
    const db = getDB();
    if (!db.material_requisitions) {
      db.material_requisitions = [
        {
          id: 'req-1',
          requisitionCode: 'REQ-2026-0001',
          requestedBy: 'Ana Clara (Técnica)',
          userId: 'user-tech-1',
          patientId: 'pat-1',
          patientName: 'ADAIR PRAXEDES MORENO',
          status: 'Pendente',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          items: [
            { itemId: 'item-1', itemName: 'Capilar Dialisador FX 80', requestedQuantity: 2, deliveredQuantity: 0, unit: 'unidades' },
            { itemId: 'item-3', itemName: 'Agulha para Fístula 16G', requestedQuantity: 4, deliveredQuantity: 0, unit: 'unidades' }
          ],
          fulfillment: null
        }
      ];
      setDB(db);
    }
    return db.material_requisitions;
  },

  saveMaterialRequisition: async (reqData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.material_requisitions) db.material_requisitions = [];
    const isEdit = !!reqData.id;
    const reqId = reqData.id || 'req-' + Date.now();
    const count = db.material_requisitions.length + 1;
    const code = reqData.requisitionCode || `REQ-2026-${String(count).padStart(4, '0')}`;

    const updatedReq = {
      ...reqData,
      id: reqId,
      requisitionCode: code,
      status: reqData.status || 'Pendente',
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      const idx = db.material_requisitions.findIndex(r => r.id === reqId);
      if (idx > -1) {
        db.material_requisitions[idx] = { ...db.material_requisitions[idx], ...updatedReq };
      } else {
        db.material_requisitions.unshift(updatedReq);
      }
    } else {
      updatedReq.createdAt = new Date().toISOString();
      db.material_requisitions.unshift(updatedReq);
    }

    setDB(db);
    return updatedReq;
  },

  deleteMaterialRequisition: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.material_requisitions) {
      db.material_requisitions = db.material_requisitions.filter(r => r.id !== id);
    }
    setDB(db);
    return { success: true };
  },

  // Product Batches (Lotes e Rastreabilidade)
  getProductBatches: async (itemId = null) => {
    const db = getDB();
    if (!db.product_batches) {
      db.product_batches = [];
      setDB(db);
    }
    let list = db.product_batches;
    if (itemId) {
      list = list.filter(b => b.itemId === itemId);
    }
    return list.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
  },

  saveProductBatch: async (batchData) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const db = getDB();
    if (!db.product_batches) db.product_batches = [];
    
    const currentQty = parseFloat(batchData.currentQuantity) || 0;
    let status = 'Ativo';
    if (currentQty <= 0) {
      status = 'Esgotado';
    } else if (batchData.expiryDate && new Date(batchData.expiryDate) < new Date()) {
      status = 'Vencido';
    } else if (batchData.status) {
      status = batchData.status;
    }

    const payload = {
      ...batchData,
      id: batchData.id || 'batch-' + Date.now(),
      currentQuantity: currentQty,
      status,
      updatedAt: new Date().toISOString()
    };

    const idx = db.product_batches.findIndex(b => b.id === payload.id);
    if (idx > -1) {
      db.product_batches[idx] = { ...db.product_batches[idx], ...payload };
    } else {
      payload.createdAt = new Date().toISOString();
      db.product_batches.push(payload);
    }
    setDB(db);
    return payload;
  },

  deleteProductBatch: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const db = getDB();
    if (db.product_batches) {
      db.product_batches = db.product_batches.filter(b => b.id !== id);
    }
    setDB(db);
    return { success: true };
  },

  upsertProductBatchOnEntry: async (entryData) => {
    const db = getDB();
    if (!db.product_batches) db.product_batches = [];
    const batchNumber = (entryData.batchNumber || '').trim();
    const qty = parseFloat(entryData.quantity) || 0;
    if (!batchNumber) return null;

    const existing = db.product_batches.find(b => b.itemId === entryData.itemId && b.batchNumber === batchNumber);
    if (existing) {
      existing.currentQuantity = (parseFloat(existing.currentQuantity) || 0) + qty;
      existing.initialQuantity = (parseFloat(existing.initialQuantity) || 0) + qty;
      existing.status = (existing.expiryDate && new Date(existing.expiryDate) < new Date()) ? 'Vencido' : 'Ativo';
      existing.updatedAt = new Date().toISOString();
      setDB(db);
      return existing;
    } else {
      const newBatch = {
        id: 'batch-' + Date.now(),
        itemId: entryData.itemId,
        itemName: entryData.itemName || '',
        batchNumber: batchNumber,
        expiryDate: entryData.expiryDate || '',
        initialQuantity: qty,
        currentQuantity: qty,
        unit: entryData.unit || 'unidades',
        costPrice: parseFloat(entryData.costPrice) || 0,
        supplierName: entryData.supplierName || '',
        invoiceNumber: entryData.invoiceNumber || '',
        status: (entryData.expiryDate && new Date(entryData.expiryDate) < new Date()) ? 'Vencido' : 'Ativo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.product_batches.push(newBatch);
      setDB(db);
      return newBatch;
    }
  },


  // NexaASSIST - Feed Assistencial
  getAssistPosts: async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const db = getDB();
    if (!db.assist_posts || db.assist_posts.length === 0) {
      db.assist_posts = [
        {
          id: 'post-titan-real-1',
          source: 'email',
          title: 'INFECÇÃO - ALEXANDRE JOSE DE PAULA',
          message: 'ATB: Ceftazidima 2g/vancomicina 1g com lok, por 14 dias.\nMédico Responsável: ISABELA.\nRealizado coleta de Hemocultura 1ª E 2ª amostra, hemograma e PCR.',
          category: 'Intercorrência',
          urgency: 'Urgente',
          patientId: 'pat-alexandre',
          patientName: 'ALEXANDRE JOSE DE PAULA',
          room: 'Salão 3',
          shift: '1º Turno',
          status: 'published',
          originalFrom: 'Márcia Alves Teixeira <enfermagembetim7@dialize.com.br>',
          originalSubject: 'INFECÇÃO ALEXANDRE JOSE DE PAULA',
          author: 'Márcia Alves Teixeira',
          authorRole: 'Enfermeira (Titan IMAP)',
          createdAt: new Date().toISOString(),
          readBy: []
        },
        {
          id: 'post-titan-real-2',
          source: 'email',
          title: 'Admissão de Raquel Tabita Andrade da Silva - 17/08/2026!',
          message: 'Prezadas (o),\nBoa Tarde!\nComunico admissão da paciente Raquel Tabita Andrade da Silva:\nData: 18/08/2026.\nProveniência: Hospital Manoel Gonçalves de Souza Moreira - Itaúna.\nTurno: 2º Turno de Terça, Quinta e Sábado.\nSalão: 3. Ponto: 14.\nAcesso: CDL em VJID.\nHorário: 11:30 às 15:30.',
          category: 'Internação',
          urgency: 'Urgente',
          patientId: 'pat-raquel',
          patientName: 'RAQUEL TABITA ANDRADE DA SILVA',
          room: 'Salão 3',
          shift: '2º Turno',
          status: 'published',
          originalFrom: 'Erick Assis Correia de Moura <coordenfermagembetim@dialize.com.br>',
          originalSubject: 'Admissão de Raquel Tabita Andrade da Silva - 17/08/2026!',
          author: 'Erick Assis Correia de Moura',
          authorRole: 'Coordenador de Enfermagem (Titan IMAP)',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          readBy: []
        },
        {
          id: 'post-titan-real-3',
          source: 'email',
          title: 'Alta hospitalar Celso Gonçalves Matos',
          message: 'Boa tarde!\nInformo alta hospitalar do paciente Celso Gonçalves Matos do HPRB em 14/08/26.\nModalidade: APD.\nAtte,\nGraziella Santos Xavier',
          category: 'Alta',
          urgency: 'Atenção',
          patientId: 'pat-celso',
          patientName: 'CELSO GONÇALVES MATOS',
          room: 'Salão 2',
          shift: '1º Turno',
          status: 'published',
          originalFrom: 'Graziella Santos - Enfermeira Diálise Peritoneal <enfermagembetim11@dialize.com.br>',
          originalSubject: 'Alta hospitalar Celso Gonçalves Matos',
          author: 'Graziella Santos Xavier',
          authorRole: 'Enfermeira Diálise Peritoneal (Titan IMAP)',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          readBy: []
        },
        {
          id: 'post-titan-real-4',
          source: 'email',
          title: 'Hospitalização Flavio Ferreira e Ester Guimarães',
          message: 'Boa tarde!\nInformo Internação dos seguintes pacientes: Flavio Ferreira da Silva internado no HPRB em 13/08/26 e Ester Guimarães internada em 15/08/26.\nAtte,\nGraziella Santos',
          category: 'Internação',
          urgency: 'Urgente',
          patientId: 'pat-flavio',
          patientName: 'FLAVIO FERREIRA DA SILVA',
          room: 'Salão 1',
          shift: '3º Turno',
          status: 'published',
          originalFrom: 'Graziella Santos - Enfermeira Diálise Peritoneal <enfermagembetim11@dialize.com.br>',
          originalSubject: 'Hospitalização Flavio Ferreira e Ester Guimarães',
          author: 'Graziella Santos',
          authorRole: 'Enfermeira Diálise Peritoneal (Titan IMAP)',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          readBy: []
        },
        {
          id: 'post-1',
          source: 'email',
          title: 'Internação Hospitalar - ADAIR PRAXEDES MORENO',
          message: 'Informamos que o paciente Adair Praxedes Moreno foi internado ontem à noite no Hospital Municipal com quadro de febre e suspeita de infecção no cateter. Sessão de hoje suspensa na clínica.',
          category: 'Internação',
          urgency: 'Urgente',
          patientId: 'pat-1',
          patientName: 'ADAIR PRAXEDES MORENO',
          room: 'Salão 1',
          shift: '2º Turno',
          status: 'published',
          author: 'Enfª. Juliana Mendes',
          authorRole: 'Enfermagem (E-mail)',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          readBy: [
            { userId: 'user-admin', name: 'Dr. Lucas (Nefro)', role: 'Médico', readAt: new Date(Date.now() - 3600000 * 2).toISOString() }
          ]
        },
        {
          id: 'post-2',
          source: 'native',
          title: 'Alta Hospitalar e Retorno às Sessões',
          message: 'Paciente Adão Luciano Dias recebeu alta hospitalar do Hospital Regional. Retorna para as sessões regulares de hemodiálise amanhã no 1º Turno (Salão 3). Acesso FAV íntegro.',
          category: 'Alta',
          urgency: 'Atenção',
          patientId: 'pat-2',
          patientName: 'ADAO LUCIANO DIAS',
          room: 'Salão 3',
          shift: '1º Turno',
          status: 'published',
          author: 'Dr. Lucas (Nefrologista)',
          authorRole: 'Corpo Médico',
          createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          readBy: []
        },
        {
          id: 'post-3',
          source: 'native',
          title: 'Ajuste de Dieta e Suplementação Hiperproteica',
          message: 'Realizada avaliação nutricional do paciente Adcelio Barbosa. Iniciada prescrição de suplemento hiperproteico específico para hemodiálise e reforçada a orientação de restrição hídrica para 800ml/dia.',
          category: 'Nutrição',
          urgency: 'Informativo',
          patientId: 'pat-3',
          patientName: 'ADCELIO BARBOSA DE OLIVEIRA',
          room: 'Salão 1',
          shift: '3º Turno',
          status: 'published',
          author: 'Dra. Camila Santos',
          authorRole: 'Nutrição Clínica',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          readBy: []
        },
        {
          id: 'post-4',
          source: 'email',
          title: 'Acolhimento Familiar e Encaminhamento de Transporte',
          message: 'Realizado atendimento social com a família da paciente. Foi solicitado apoio para transporte sanitário municipal (TFD) para os dias de terça, quinta e sábado.',
          category: 'Serviço Social',
          urgency: 'Informativo',
          patientId: null,
          patientName: null,
          room: 'Geral',
          shift: 'Geral',
          status: 'pending_link',
          author: 'Assistente Social Mariana',
          authorRole: 'Serviço Social (E-mail)',
          createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
          readBy: []
        }
      ];
      setDB(db);
    }
    return db.assist_posts;
  },

  createAssistPost: async (postData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    if (!db.assist_posts) db.assist_posts = [];
    const newPost = {
      ...postData,
      id: 'post-' + Date.now(),
      createdAt: postData.createdAt || new Date().toISOString(),
      readBy: postData.readBy || []
    };
    db.assist_posts.unshift(newPost);
    setDB(db);
    return newPost;
  },

  updateAssistPost: async (id, postData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    if (db.assist_posts) {
      const idx = db.assist_posts.findIndex(p => p.id === id);
      if (idx > -1) {
        db.assist_posts[idx] = { ...db.assist_posts[idx], ...postData, updatedAt: new Date().toISOString() };
        setDB(db);
        return db.assist_posts[idx];
      }
    }
    return { id, ...postData };
  },

  deleteAssistPost: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    if (db.assist_posts) {
      db.assist_posts = db.assist_posts.filter(p => p.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  toggleAssistPostRead: async (postId, user) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const db = getDB();
    if (!db.assist_posts) return null;
    const post = db.assist_posts.find(p => p.id === postId);
    if (!post) return null;

    if (!Array.isArray(post.readBy)) post.readBy = [];
    const userId = user.id || user.uid || user.email || 'user';
    const userName = user.name || user.email || 'Profissional';
    const idx = post.readBy.findIndex(r => r.userId === userId || r.name === userName);

    if (idx > -1) {
      post.readBy.splice(idx, 1);
    } else {
      post.readBy.push({
        userId,
        name: userName,
        role: user.role || 'Profissional',
        readAt: new Date().toISOString()
      });
    }
    setDB(db);
    return post.readBy;
  },

  getProductBatches: async (itemId = null) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.product_batches) db.product_batches = [];
    if (itemId) {
      return db.product_batches.filter(b => b.itemId === itemId);
    }
    return db.product_batches;
  },

  saveProductBatch: async (batchData) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.product_batches) db.product_batches = [];
    if (batchData.id) {
      const idx = db.product_batches.findIndex(b => b.id === batchData.id);
      if (idx > -1) {
        db.product_batches[idx] = { ...db.product_batches[idx], ...batchData, updatedAt: new Date().toISOString() };
        setDB(db);
        return db.product_batches[idx];
      }
    }
    const newDoc = { id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...batchData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    db.product_batches.push(newDoc);
    setDB(db);
    return newDoc;
  },

  deleteProductBatch: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (db.product_batches) {
      db.product_batches = db.product_batches.filter(b => b.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  deductProductBatch: async (batchId, quantity) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.product_batches) return null;
    const batch = db.product_batches.find(b => b.id === batchId);
    if (!batch) return null;
    const qty = parseFloat(quantity) || 0;
    batch.currentQuantity = Math.max(0, (parseFloat(batch.currentQuantity) || 0) - qty);
    if (batch.currentQuantity <= 0) {
      batch.status = 'Esgotado';
    }
    batch.updatedAt = new Date().toISOString();
    setDB(db);
    return batch;
  },

  getPatientDispensations: async (patientId = null) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.patient_dispensations) db.patient_dispensations = [];
    if (patientId) {
      return db.patient_dispensations.filter(d => d.patientId === patientId).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }
    return [...db.patient_dispensations].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  },

  savePatientDispensation: async (dispData) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.patient_dispensations) db.patient_dispensations = [];
    const newDoc = { id: `disp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...dispData, date: dispData.date || new Date().toISOString(), createdAt: new Date().toISOString() };
    db.patient_dispensations.push(newDoc);
    setDB(db);
    return newDoc;
  },

  getBatchTraceability: async (searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!searchTerm) return { batches: [], dispensations: [] };
    const term = String(searchTerm).trim().toLowerCase();
    const batches = (db.product_batches || []).filter(b => 
      (b.batchNumber && b.batchNumber.toLowerCase().includes(term)) ||
      (b.itemName && b.itemName.toLowerCase().includes(term)) ||
      (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(term))
    );
    const batchNumbers = new Set(batches.map(b => (b.batchNumber || '').toLowerCase()).filter(Boolean));
    const batchIds = new Set(batches.map(b => b.id));
    const dispensations = (db.patient_dispensations || []).filter(d =>
      (d.batchNumber && (batchNumbers.has(d.batchNumber.toLowerCase()) || d.batchNumber.toLowerCase().includes(term))) ||
      (d.batchId && batchIds.has(d.batchId)) ||
      (d.itemName && d.itemName.toLowerCase().includes(term)) ||
      (d.patientName && d.patientName.toLowerCase().includes(term))
    );
    dispensations.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return { batches, dispensations };
  }
};


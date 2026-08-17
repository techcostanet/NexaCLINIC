export { app, firebaseConfig } from './services/firebase/config';

import * as authFunctions from './services/firebase/authService';
import * as patientFunctions from './services/firebase/patientService';
import * as stockFunctions from './services/firebase/stockService';
import * as financialFunctions from './services/firebase/financialService';
import * as hrFunctions from './services/firebase/hrService';
import * as clinicalFunctions from './services/firebase/clinicalService';
import * as systemFunctions from './services/firebase/systemService';
import * as maintenanceFunctions from './services/firebase/maintenanceService';
import * as sesmtFunctions from './services/firebase/sesmtService';
import * as assistFunctions from './services/firebase/assistService';

// Standard exports for the rest of the application
export const authService = {
  ...authFunctions
};

export const dbService = {
  ...authFunctions,
  ...patientFunctions,
  ...stockFunctions,
  ...financialFunctions,
  ...hrFunctions,
  ...clinicalFunctions,
  ...systemFunctions,
  ...maintenanceFunctions,
  ...sesmtFunctions,
  ...assistFunctions,
};

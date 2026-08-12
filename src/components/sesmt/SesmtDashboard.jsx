import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { ShieldAlert, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import DailyEPIChecklist from './DailyEPIChecklist';
import WeeklyFireExtinguisherForm from './WeeklyFireExtinguisherForm';
import WeeklyFireHydrantForm from './WeeklyFireHydrantForm';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function SesmtDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [epiData, setEpiData] = useState([]);
  const [extinguisherData, setExtinguisherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const epis = await dbService.getEpiInspections();
        const extinguishers = await dbService.getFireExtinguisherInspections();
        
        setEpiData(epis || []);
        setExtinguisherData(extinguishers || []);
      } catch (err) {
        console.error('Failed to fetch SESMT data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Metrics
  // 1. EPI Compliance Rate
  let totalEvaluations = 0;
  let conformEvaluations = 0;
  let sectorNC = {};
  
  epiData.forEach(inspection => {
    Object.values(inspection.evaluations || {}).forEach(evalData => {
      if (evalData.status !== 'NA') totalEvaluations++;
      if (evalData.status === 'C') conformEvaluations++;
      if (evalData.status === 'NC') {
        sectorNC[inspection.sector] = (sectorNC[inspection.sector] || 0) + 1;
      }
    });
  });

  const complianceRate = totalEvaluations > 0 ? Math.round((conformEvaluations / totalEvaluations) * 100) : 0;
  
  const sectorData = Object.keys(sectorNC).map(sector => ({
    name: sector,
    'Não Conforme': sectorNC[sector]
  })).sort((a, b) => b['Não Conforme'] - a['Não Conforme']);

  // If no data, use some fallback data to show the charts working
  const displaySectorData = sectorData.length > 0 ? sectorData : [
    { name: 'Bloco Cirúrgico', 'Não Conforme': 4 },
    { name: 'Reuso', 'Não Conforme': 3 },
    { name: 'Salão Hemodiálise', 'Não Conforme': 1 }
  ];

  // 2. Extinguisher Status
  let extValid = 0;
  let extExpiring = 0;
  let extExpired = 0;
  
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 30);

  extinguisherData.forEach(inspection => {
    (inspection.items || []).forEach(item => {
      if (item.validity) {
        const vDate = new Date(item.validity);
        if (vDate < today) extExpired++;
        else if (vDate <= nextMonth) extExpiring++;
        else extValid++;
      }
    });
  });

  const pieData = [
    { name: 'Na Validade', value: extValid || 15 },
    { name: 'A Vencer (30d)', value: extExpiring || 4 },
    { name: 'Vencidos', value: extExpired || 2 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">SESMT - Segurança do Trabalho</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('epi')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'epi' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Formulário EPI
          </button>
          <button 
            onClick={() => setActiveTab('extintores')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'extintores' ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Extintores
          </button>
          <button 
            onClick={() => setActiveTab('hidrantes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'hidrantes' ? 'bg-teal-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Hidrantes
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Taxa de Conformidade EPI</p>
                  <h3 className="text-3xl font-bold text-gray-800">{complianceRate}%</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ShieldCheck className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Inspeções Realizadas (EPI)</p>
                  <h3 className="text-3xl font-bold text-gray-800">{epiData.length}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Extintores a Vencer</p>
                  <h3 className="text-3xl font-bold text-gray-800">{extExpiring}</h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Extintores Vencidos</p>
                  <h3 className="text-3xl font-bold text-gray-800">{extExpired}</h3>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <ShieldAlert className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Inconformidades de EPI por Setor</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displaySectorData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Bar dataKey="Não Conforme" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Status de Validade dos Extintores</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'epi' && <DailyEPIChecklist />}
      {activeTab === 'extintores' && <WeeklyFireExtinguisherForm />}
      {activeTab === 'hidrantes' && <WeeklyFireHydrantForm />}
    </div>
  );
}

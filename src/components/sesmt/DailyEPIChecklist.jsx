import React, { useState } from 'react';
import { dbService } from '../../firebase';
import { Save } from 'lucide-react';

const SECTORS = [
  'Salão Hemodiálise', 
  'Diálise Peritoneal', 
  'Hemodiálise Externa', 
  'Bloco Cirúrgico', 
  'Reuso', 
  'Sala Amarela'
];

const ITEMS = [
  { id: 'uso_epi', label: 'Uso adequado do EPI' },
  { id: 'higienizacao', label: 'Higienização das mãos' },
  { id: 'descarte', label: 'Descarte de resíduos' },
  { id: 'conservacao', label: 'Conservação e armazenamento de EPI' }
];

export default function DailyEPIChecklist() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    sector: SECTORS[0],
    enfermeiro: '',
    tecnicoSeguranca: '',
    evaluations: ITEMS.reduce((acc, item) => ({
      ...acc,
      [item.id]: { status: 'C', observation: '' }
    }), {})
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEvaluationChange = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      evaluations: {
        ...prev.evaluations,
        [itemId]: {
          ...prev.evaluations[itemId],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await dbService.saveEpiInspection({
        ...formData,
        createdAt: new Date().toISOString()
      });
      setMessage('Checklist salvo com sucesso!');
      // Reset after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Erro ao salvar checklist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Checklist de Verificação Diária de EPI e Segurança</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
            <input 
              type="time" 
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
            <select 
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ITEMS.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.label}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex justify-center space-x-4">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`status-${item.id}`} 
                          value="C" 
                          checked={formData.evaluations[item.id].status === 'C'}
                          onChange={(e) => handleEvaluationChange(item.id, 'status', e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-green-600 font-medium" title="Conforme">C</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`status-${item.id}`} 
                          value="NC" 
                          checked={formData.evaluations[item.id].status === 'NC'}
                          onChange={(e) => handleEvaluationChange(item.id, 'status', e.target.value)}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-red-600 font-medium" title="Não Conforme">NC</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`status-${item.id}`} 
                          value="NA" 
                          checked={formData.evaluations[item.id].status === 'NA'}
                          onChange={(e) => handleEvaluationChange(item.id, 'status', e.target.value)}
                          className="text-gray-400 focus:ring-gray-400"
                        />
                        <span className="text-gray-500 font-medium" title="Não Avaliado">NA</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input 
                      type="text" 
                      value={formData.evaluations[item.id].observation}
                      onChange={(e) => handleEvaluationChange(item.id, 'observation', e.target.value)}
                      placeholder="Observações..."
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enfermeiro(a) Responsável</label>
            <input 
              type="text" 
              name="enfermeiro"
              value={formData.enfermeiro}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Nome"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Técnico de Segurança do Trabalho</label>
            <input 
              type="text" 
              name="tecnicoSeguranca"
              value={formData.tecnicoSeguranca}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Nome"
              required 
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            <span>{loading ? 'Salvando...' : 'Salvar Checklist'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

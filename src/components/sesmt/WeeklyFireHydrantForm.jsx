import React, { useState } from 'react';
import { dbService } from '../../firebase';
import { Save } from 'lucide-react';

const NUM_HYDRANTS = 6;
const CRITERIA = [
  { id: 'mangueira', label: 'Mangueira' },
  { id: 'bicos', label: 'Bicos' },
  { id: 'chaves', label: 'Chaves' },
  { id: 'estado_fisico', label: 'Estado Físico' }
];

export default function WeeklyFireHydrantForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    inspectorName: '',
    items: Array.from({ length: NUM_HYDRANTS }).map((_, i) => ({
      hydrantNum: i + 1,
      validity: '',
      evaluations: CRITERIA.reduce((acc, c) => ({ ...acc, [c.id]: 'C' }), {})
    }))
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index][field] = value;
      return { ...prev, items: newItems };
    });
  };

  const handleEvaluationChange = (index, critId, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index].evaluations[critId] = value;
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await dbService.saveFireHydrantInspection({
        date: formData.date,
        inspectorName: formData.inspectorName,
        items: formData.items,
        createdAt: new Date().toISOString()
      });
      setMessage('Inspeção de hidrantes salva com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Erro ao salvar inspeção.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Inspeção Semanal de Hidrantes de Incêndio</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Inspeção</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Inspetor</label>
            <input 
              type="text" 
              name="inspectorName"
              value={formData.inspectorName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Assinatura/Nome"
              required 
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-teal-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">N° Hidrante</th>
                {CRITERIA.slice(0, 1).map(c => (
                  <th key={c.id} className="px-4 py-3 text-center font-semibold text-xs">{c.label}</th>
                ))}
                <th className="px-4 py-3 text-left font-semibold">Validade (Mangueira)</th>
                {CRITERIA.slice(1).map(c => (
                  <th key={c.id} className="px-4 py-3 text-center font-semibold text-xs">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.items.map((item, index) => (
                <tr key={item.hydrantNum} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 text-center">{item.hydrantNum}</td>
                  
                  <td className="px-4 py-3 text-center">
                    <select
                      value={item.evaluations['mangueira']}
                      onChange={(e) => handleEvaluationChange(index, 'mangueira', e.target.value)}
                      className={`w-full p-2 text-sm border rounded font-semibold ${item.evaluations['mangueira'] === 'C' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                    >
                      <option value="C">C</option>
                      <option value="NC">NC</option>
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <input 
                      type="date"
                      value={item.validity}
                      onChange={(e) => handleItemChange(index, 'validity', e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </td>

                  {CRITERIA.slice(1).map(c => (
                    <td key={c.id} className="px-4 py-3 text-center">
                      <select
                        value={item.evaluations[c.id]}
                        onChange={(e) => handleEvaluationChange(index, c.id, e.target.value)}
                        className={`w-full p-2 text-sm border rounded font-semibold ${item.evaluations[c.id] === 'C' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                      >
                        <option value="C">C</option>
                        <option value="NC">NC</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center space-x-2 bg-teal-800 text-white px-6 py-2 rounded hover:bg-teal-900 disabled:opacity-50"
          >
            <Save size={20} />
            <span>{loading ? 'Salvando...' : 'Salvar Inspeção'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

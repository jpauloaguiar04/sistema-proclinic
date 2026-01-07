import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Save, Search, ClipboardList, X, Tag } from 'lucide-react';

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [termo, setTermo] = useState('');
  
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  const [form, setForm] = useState({
    nome: '',
    codigoTuss: '',
    precoBase: 0,
    modalidade: 'CR' // Padrão
  });

  // Lista de Modalidades DICOM Comuns
  const modalidades = [
    { id: 'CR', nome: 'Raio-X (CR)' },
    { id: 'DX', nome: 'Raio-X Digital (DX)' },
    { id: 'CT', nome: 'Tomografia (CT)' },
    { id: 'MR', nome: 'Ressonância (MR)' },
    { id: 'US', nome: 'Ultrassom (US)' },
    { id: 'XA', nome: 'Hemodinâmica/Angio (XA)' },
    { id: 'MG', nome: 'Mamografia (MG)' },
    { id: 'OT', nome: 'Outros' }
  ];

  const API_URL = '/api';

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/Servicos`);
      if (res.ok) setServicos(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (item: any = null) => {
    if (item) {
      setEditando(item);
      setForm({
        nome: item.nome,
        codigoTuss: item.codigoTuss || '',
        precoBase: item.precoBase || 0,
        modalidade: item.modalidade || 'CR'
      });
    } else {
      setEditando(null);
      setForm({ nome: '', codigoTuss: '', precoBase: 0, modalidade: 'CR' });
    }
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.nome) return alert("Nome obrigatório");

    try {
      const payload = { ...form };
      let res;
      
      if (editando) {
        res = await fetch(`${API_URL}/Servicos/${editando.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editando.id, ...payload })
        });
      } else {
        res = await fetch(`${API_URL}/Servicos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setModalAberto(false);
        carregar();
      } else {
        alert("Erro ao salvar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const excluir = async (id: number) => {
    if (!confirm("Excluir serviço?")) return;
    await fetch(`${API_URL}/Servicos/${id}`, { method: 'DELETE' });
    carregar();
  };

  const filtrados = servicos.filter((s: any) => s.nome.toLowerCase().includes(termo.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="text-indigo-600" /> Exames e Serviços
        </h1>
        <button onClick={() => abrirModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={20} /> Novo Serviço
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Buscar exame..."
                value={termo}
                onChange={e => setTermo(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-sm font-bold text-slate-600">Código TUSS</th>
              <th className="p-4 text-sm font-bold text-slate-600">Descrição</th>
              <th className="p-4 text-sm font-bold text-slate-600">Modalidade</th>
              <th className="p-4 text-sm font-bold text-slate-600">Preço Base</th>
              <th className="p-4 text-sm font-bold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={5} className="p-8 text-center text-slate-400">Carregando...</td></tr>}
            {!loading && filtrados.map((s: any) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="p-4 text-slate-600 font-mono text-xs">{s.codigoTuss || '-'}</td>
                <td className="p-4 font-bold text-slate-800">{s.nome}</td>
                <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold border border-slate-300">
                        {s.modalidade || 'CR'}
                    </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">R$ {s.precoBase.toFixed(2)}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => abrirModal(s)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded"><Edit size={18}/></button>
                  <button onClick={() => excluir(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Tag size={20}/> {editando ? 'Editar' : 'Novo'} Serviço</h3>
                    <button onClick={() => setModalAberto(false)}><X/></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Exame *</label>
                        <input className="w-full p-2 border rounded" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Código TUSS</label>
                            <input className="w-full p-2 border rounded" value={form.codigoTuss} onChange={e => setForm({...form, codigoTuss: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Preço Base (R$)</label>
                            <input type="number" className="w-full p-2 border rounded" value={form.precoBase} onChange={e => setForm({...form, precoBase: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Modalidade DICOM (Equipamento)</label>
                        <select 
                            className="w-full p-2 border rounded bg-white" 
                            value={form.modalidade} 
                            onChange={e => setForm({...form, modalidade: e.target.value})}
                        >
                            {modalidades.map(m => (
                                <option key={m.id} value={m.id}>{m.id} - {m.nome}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Isso define para qual tipo de equipamento o exame será enviado na Worklist.</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
                    <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded">Cancelar</button>
                    <button onClick={salvar} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700">Salvar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
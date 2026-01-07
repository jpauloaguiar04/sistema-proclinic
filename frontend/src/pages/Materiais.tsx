import React, { useState, useEffect } from 'react';
import { Package, Trash2, Info, Plus, Save } from 'lucide-react';

const API_URL = '/api/Materiais'; // Corrigido para usar Proxy

export default function Materiais() {
  const [materiais, setMateriais] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    nome: '', 
    descricao: '', 
    precoBase: 0, 
    tipo: 'MATERIAL', 
    codigoTuss: '' 
  });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const res = await fetch(API_URL);
      if(res.ok) setMateriais(await res.json());
    } catch (e) { console.error(e); }
  };

  const salvar = async () => {
    if (!form.nome) return alert("Preencha o nome.");
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form)
      });
      setForm({ nome: '', descricao: '', precoBase: 0, tipo: 'MATERIAL', codigoTuss: '' });
      carregar();
      alert("Salvo com sucesso!");
    } catch (e) { alert("Erro ao salvar."); }
  };

  const excluir = async (id: number) => {
    if (confirm("Excluir item?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        carregar();
      } catch (e) { alert("Erro ao excluir."); }
    }
  };

  return (
    <div className="p-8 h-full bg-slate-50 animate-fade-in flex flex-col">
      <h1 className="text-3xl font-light text-slate-800 mb-6 flex items-center">
        <Package className="mr-3 text-indigo-600" size={32} /> Cadastro de Materiais & Kits
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full overflow-hidden">
        
        {/* FORMULÁRIO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h2 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2"><Plus size={20}/> Novo Item</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Kit / Material</label>
              <input className="w-full border p-2 rounded" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Kit Contraste"/>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição Detalhada</label>
              <textarea 
                className="w-full border p-2 rounded h-20 resize-none" 
                value={form.descricao} 
                onChange={e => setForm({...form, descricao: e.target.value})} 
                placeholder="Ex: Contém 1 seringa, 50ml contraste..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
              <select className="w-full border p-2 rounded" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                <option value="MATERIAL">Material / Kit</option>
                <option value="MEDICAMENTO">Medicamento</option>
                <option value="TAXA">Taxa / Aluguel</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Base (R$)</label><input type="number" className="w-full border p-2 rounded font-bold" value={form.precoBase} onChange={e => setForm({...form, precoBase: parseFloat(e.target.value)})}/></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cód. TUSS</label><input className="w-full border p-2 rounded" value={form.codigoTuss} onChange={e => setForm({...form, codigoTuss: e.target.value})}/></div>
            </div>
            
            <button onClick={salvar} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold shadow mt-2 hover:bg-indigo-700 transition flex justify-center items-center gap-2">
                <Save size={18}/> Salvar Item
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
              <tr><th className="p-4">Nome / Descrição</th><th className="p-4">Tipo</th><th className="p-4 text-right">Preço</th><th className="p-4 text-center">Ação</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materiais.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-slate-700">{m.nome}</div>
                    {m.descricao && <div className="text-xs text-slate-400 mt-1 flex items-start"><Info size={12} className="mr-1 mt-0.5"/> {m.descricao}</div>}
                    {m.codigoTuss && <div className="text-xs text-indigo-400 font-mono mt-1">TUSS: {m.codigoTuss}</div>}
                  </td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold">{m.tipo}</span></td>
                  <td className="p-4 text-right text-emerald-600 font-bold">R$ {m.precoBase.toFixed(2)}</td>
                  <td className="p-4 text-center"><button onClick={() => excluir(m.id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18}/></button></td>
                </tr>
              ))}
              {materiais.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum material cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
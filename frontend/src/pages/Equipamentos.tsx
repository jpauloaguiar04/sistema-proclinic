import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Monitor, Save, Trash2, Plus, Server } from 'lucide-react';

const API_URL = 'http://172.16.1.207:5000/api/Equipamentos';

export default function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    nome: '', 
    aeTitle: '', 
    modalidade: 'CR', 
    ip: '', 
    porta: 0 
  });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const res = await axios.get(API_URL);
      setEquipamentos(res.data);
    } catch (e) { console.error(e); }
  };

  const salvar = async () => {
    if (!form.nome || !form.aeTitle) return alert("Preencha Nome e AE Title (Nome DICOM).");
    try {
      await axios.post(API_URL, form);
      setForm({ nome: '', aeTitle: '', modalidade: 'CR', ip: '', porta: 0 });
      carregar();
      alert("Equipamento salvo!");
    } catch (e) { alert("Erro ao salvar."); }
  };

  const excluir = async (id: number) => {
    if (confirm("Excluir equipamento?")) {
      await axios.delete(`${API_URL}/${id}`);
      carregar();
    }
  };

  return (
    <div className="p-8 h-full bg-slate-50 animate-fade-in flex flex-col">
      <h1 className="text-3xl font-light text-slate-800 mb-6 flex items-center">
        <Server className="mr-3 text-indigo-600" size={32} /> Equipamentos & Worklist
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full overflow-hidden">
        
        {/* FORMULÁRIO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h2 className="font-bold text-lg text-slate-700 mb-4">Novo Equipamento</h2>
          <div className="space-y-3">
            <div>
              <label className="label-premium">Nome Interno</label>
              <input className="input-premium" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Raio-X Sala 01"/>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-premium">AE Title (DICOM)</label>
                <input className="input-premium font-mono uppercase" value={form.aeTitle} onChange={e => setForm({...form, aeTitle: e.target.value.toUpperCase()})} placeholder="RX_SALA1"/>
                <p className="text-[10px] text-slate-400 mt-1">Deve ser igual na máquina.</p>
              </div>
              <div>
                <label className="label-premium">Modalidade</label>
                <select className="input-premium" value={form.modalidade} onChange={e => setForm({...form, modalidade: e.target.value})}>
                  <option value="CR">CR (Raio-X Computadorizado)</option>
                  <option value="DX">DX (Raio-X Digital)</option>
                  <option value="CT">CT (Tomografia)</option>
                  <option value="MR">MR (Ressonância)</option>
                  <option value="US">US (Ultrassom)</option>
                  <option value="MG">MG (Mamografia)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="label-premium">IP (Opcional)</label><input className="input-premium" value={form.ip} onChange={e => setForm({...form, ip: e.target.value})}/></div>
              <div><label className="label-premium">Porta (Opcional)</label><input type="number" className="input-premium" value={form.porta} onChange={e => setForm({...form, porta: parseInt(e.target.value)})}/></div>
            </div>
            
            <button onClick={salvar} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold shadow mt-2 hover:bg-indigo-700 transition flex items-center justify-center">
              <Plus size={18} className="mr-2"/> Cadastrar
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
              <tr><th className="p-4">Nome</th><th className="p-4">AE Title</th><th className="p-4">Mod</th><th className="p-4 text-center">Ação</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipamentos.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700">{e.nome}</td>
                  <td className="p-4 font-mono text-indigo-600 bg-indigo-50 w-fit px-2 rounded">{e.aeTitle}</td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold">{e.modalidade}</span></td>
                  <td className="p-4 text-center"><button onClick={() => excluir(e.id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18}/></button></td>
                </tr>
              ))}
              {equipamentos.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum equipamento cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

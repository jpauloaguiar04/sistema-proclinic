import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Stethoscope, Save, Trash2, Upload, ImageIcon } from 'lucide-react';

// AJUSTE SEU IP AQUI SE MUDAR
const API_URL = 'http://172.16.1.207:5000/api/Medicos';

export default function Medicos() {
  const [medicos, setMedicos] = useState<any[]>([]);
  const [novoMedico, setNovoMedico] = useState({ nome: '', crm: '', uf: 'AC', telefone: '', email: '', assinaturaBase64: '' });

  useEffect(() => { carregarMedicos(); }, []);

  const carregarMedicos = async () => {
    try {
      const res = await axios.get(API_URL);
      setMedicos(res.data);
    } catch (error) { console.error("Erro ao carregar médicos"); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovoMedico({ ...novoMedico, assinaturaBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const salvarMedico = async () => {
    if (!novoMedico.nome || !novoMedico.crm) return alert("Preencha Nome e CRM");
    try {
      await axios.post(API_URL, { ...novoMedico, ativo: true });
      setNovoMedico({ nome: '', crm: '', uf: 'AC', telefone: '', email: '', assinaturaBase64: '' });
      carregarMedicos();
      alert("Médico salvo com sucesso!");
    } catch (error) { alert("Erro ao salvar médico."); }
  };

  const excluir = async (id: number) => {
    if (confirm("Excluir este médico?")) {
      await axios.delete(`${API_URL}/${id}`);
      carregarMedicos();
    }
  };

  return (
    <div className="p-8 h-full bg-slate-50 animate-fade-in">
      <h1 className="text-3xl font-light text-slate-800 mb-8 flex items-center">
        <Stethoscope className="mr-3 text-indigo-600" size={32} /> Corpo Clínico
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORMULÁRIO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h2 className="font-bold text-lg mb-4 text-slate-700">Novo Médico</h2>
          <div className="space-y-4">
            <div><label className="label-premium">Nome Completo</label><input className="input-premium" value={novoMedico.nome} onChange={e => setNovoMedico({...novoMedico, nome: e.target.value})} /></div>
            <div className="flex gap-2">
              <div className="flex-1"><label className="label-premium">CRM</label><input className="input-premium" value={novoMedico.crm} onChange={e => setNovoMedico({...novoMedico, crm: e.target.value})} /></div>
              <div className="w-20"><label className="label-premium">UF</label><input className="input-premium" value={novoMedico.uf} onChange={e => setNovoMedico({...novoMedico, uf: e.target.value})} maxLength={2} /></div>
            </div>
            
            {/* UPLOAD ASSINATURA */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              {novoMedico.assinaturaBase64 ? (
                <img src={novoMedico.assinaturaBase64} alt="Assinatura" className="h-16 mx-auto object-contain" />
              ) : (
                <div className="text-slate-400 text-sm">
                  <Upload className="mx-auto mb-1" />
                  Clique para enviar Assinatura (Imagem)
                </div>
              )}
            </div>

            <button onClick={salvarMedico} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold shadow hover:bg-emerald-700 flex justify-center items-center">
              <Save size={18} className="mr-2"/> Salvar Médico
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicos.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
              <div>
                <div className="font-bold text-lg text-slate-800">{m.nome}</div>
                <div className="text-indigo-600 font-mono text-sm font-bold">CRM/{m.uf}: {m.crm}</div>
                {m.assinaturaBase64 ? (
                  <div className="mt-2 text-xs text-emerald-600 flex items-center"><ImageIcon size={12} className="mr-1"/> Assinatura Digital OK</div>
                ) : (
                  <div className="mt-2 text-xs text-red-400">Sem assinatura</div>
                )}
              </div>
              <button onClick={() => excluir(m.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
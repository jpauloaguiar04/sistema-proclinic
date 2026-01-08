import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Ícones para identificar visualmente
import { Stethoscope, Save, Trash2, Upload, User, FileText } from 'lucide-react';

// --- CORREÇÃO AQUI: Caminho relativo para usar o Proxy do Vite/Nginx ---
const API_URL = '/api/Medicos'; 

// Interface para garantir que os dados estejam certos
interface Medico {
  id: number;
  nome: string;
  crm: string;
  uf: string;
  email: string;
  telefone: string;
  assinaturaBase64: string;
  ehSolicitante: boolean;
  ehCorpoClinico: boolean;
  ativo: boolean;
}

export default function Medicos() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  
  // Estado do formulário
  const [novoMedico, setNovoMedico] = useState({ 
    nome: '', 
    crm: '', 
    uf: 'AC', 
    telefone: '', 
    email: '', 
    assinaturaBase64: '', 
    ehSolicitante: false, 
    ehCorpoClinico: true // Padrão é ser do corpo clínico
  });

  useEffect(() => { 
    carregarMedicos(); 
  }, []);

  const carregarMedicos = async () => {
    try {
      const res = await axios.get(API_URL);
      setMedicos(res.data);
    } catch (error) { 
      console.error("Erro ao carregar médicos. Verifique se o Backend está rodando.", error); 
    }
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
      // Envia os dados para a API
      await axios.post(API_URL, { ...novoMedico, ativo: true });
      
      // Limpa o form mantendo o padrão
      setNovoMedico({ 
        nome: '', crm: '', uf: 'AC', telefone: '', email: '', 
        assinaturaBase64: '', 
        ehSolicitante: false, 
        ehCorpoClinico: true 
      });
      
      carregarMedicos();
      alert("Médico salvo com sucesso!");
    } catch (error) { 
      console.error(error);
      alert("Erro ao salvar médico. Verifique o console."); 
    }
  };

  const excluir = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este médico?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        carregarMedicos();
      } catch (error) {
        alert("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="p-8 h-full bg-slate-50 animate-fade-in overflow-auto">
      <h1 className="text-3xl font-light text-slate-800 mb-8 flex items-center">
        <Stethoscope className="mr-3 text-indigo-600" size={32} /> Gestão de Médicos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- FORMULÁRIO --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-4">
          <h2 className="font-bold text-lg mb-4 text-slate-700">Novo Cadastro</h2>
          <div className="space-y-4">
            
            {/* TIPO DE MÉDICO (Checkboxes) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                <label className={`flex flex-col items-center justify-center p-2 border rounded cursor-pointer transition text-xs font-bold text-center ${novoMedico.ehCorpoClinico ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'hover:bg-white text-slate-600'}`}>
                    <input type="checkbox" className="mb-1 accent-indigo-600" checked={novoMedico.ehCorpoClinico} onChange={e => setNovoMedico({...novoMedico, ehCorpoClinico: e.target.checked})} />
                    Corpo Clínico (Lauda)
                </label>
                <label className={`flex flex-col items-center justify-center p-2 border rounded cursor-pointer transition text-xs font-bold text-center ${novoMedico.ehSolicitante ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'hover:bg-white text-slate-600'}`}>
                    <input type="checkbox" className="mb-1 accent-emerald-600" checked={novoMedico.ehSolicitante} onChange={e => setNovoMedico({...novoMedico, ehSolicitante: e.target.checked})} />
                    Solicitante (Pede Exame)
                </label>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nome Completo</label>
                <input className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                       value={novoMedico.nome} onChange={e => setNovoMedico({...novoMedico, nome: e.target.value})} />
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">CRM</label>
                  <input className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                         value={novoMedico.crm} onChange={e => setNovoMedico({...novoMedico, crm: e.target.value})} />
              </div>
              <div className="w-20">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">UF</label>
                  <input className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase" 
                         value={novoMedico.uf} onChange={e => setNovoMedico({...novoMedico, uf: e.target.value})} maxLength={2} />
              </div>
            </div>

            {/* Mostra campo de assinatura APENAS se for Corpo Clínico */}
            {novoMedico.ehCorpoClinico && (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative group">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {novoMedico.assinaturaBase64 ? (
                    <div className="relative">
                        <img src={novoMedico.assinaturaBase64} alt="Assinatura" className="h-16 mx-auto object-contain" />
                        <span className="text-[10px] text-slate-400 block mt-1">Clique para alterar</span>
                    </div>
                ) : (
                    <div className="text-slate-400 text-sm group-hover:text-indigo-500 transition-colors">
                    <Upload className="mx-auto mb-1" />
                    Enviar Assinatura Digital
                    </div>
                )}
                </div>
            )}

            <button onClick={salvarMedico} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow hover:bg-indigo-700 flex justify-center items-center transition-all transform active:scale-95">
              <Save size={18} className="mr-2"/> Salvar
            </button>
          </div>
        </div>

        {/* --- LISTA --- */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
          {medicos.length === 0 && (
            <div className="col-span-2 text-center text-slate-400 py-10">
                Nenhum médico cadastrado ainda.
            </div>
          )}
          
          {medicos.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start relative overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Etiquetas Laterais Visuais */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 flex flex-col">
                  {m.ehCorpoClinico && <div className="h-1/2 bg-indigo-500" title="Corpo Clínico"></div>}
                  {m.ehSolicitante && <div className="h-1/2 bg-emerald-500" title="Solicitante"></div>}
              </div>

              <div className="pl-3 w-full">
                <div className="font-bold text-lg text-slate-800">{m.nome}</div>
                <div className="text-slate-500 font-mono text-sm mb-2">CRM/{m.uf}: {m.crm}</div>
                
                <div className="flex gap-2 flex-wrap">
                    {m.ehCorpoClinico && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-200">LAUDADOR</span>}
                    {m.ehSolicitante && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">SOLICITANTE</span>}
                </div>
              </div>
              <button onClick={() => excluir(m.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
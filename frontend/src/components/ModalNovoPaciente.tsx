import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, User, FileText, Phone, CreditCard } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPacienteSalvo: (paciente: any) => void;
  convenios: any[]; // <--- Recebe a lista de convênios da Agenda
}

export default function ModalNovoPaciente({ isOpen, onClose, onPacienteSalvo, convenios }: ModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Estado do formulário
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    sexo: 'M',
    convenioId: '' // <--- Campo para o ID do convênio
  });

  if (!isOpen) return null;

  const salvar = async () => {
    if (!form.nome || !form.cpf) return alert("Preencha Nome e CPF");

    try {
      setLoading(true);
      
      // Prepara o envio, convertendo vazio para null
      const payload = {
        ...form,
        convenioId: form.convenioId ? parseInt(form.convenioId) : null
      };

      // Caminho relativo para usar o proxy
      const res = await axios.post('/api/Pacientes', payload); 
      
      alert("Paciente cadastrado com sucesso!");
      
      // Devolve o paciente NOVO para a tela de Agenda já preencher o campo
      onPacienteSalvo(res.data); 
      
      onClose(); // Fecha o modal
      
      // Limpa o formulário para o próximo
      setForm({ nome: '', cpf: '', dataNascimento: '', telefone: '', sexo: 'M', convenioId: '' });
      
    } catch (error) {
      alert("Erro ao salvar paciente. Verifique se o CPF já existe.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <User size={20}/> Novo Paciente Rápido
          </h2>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-6 space-y-4">
          
          {/* Nome */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome Completo</label>
            <input 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
              autoFocus
            />
          </div>

          {/* CPF e Nascimento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">CPF</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3 text-slate-400"/>
                <input 
                  className="w-full pl-9 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})}
                  maxLength={14} placeholder="000.000.000-00"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nascimento</label>
              <input 
                type="date"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.dataNascimento} onChange={e => setForm({...form, dataNascimento: e.target.value})}
              />
            </div>
          </div>

          {/* Telefone e Sexo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Telefone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-slate-400"/>
                <input 
                  className="w-full pl-9 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})}
                />
              </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Sexo</label>
                <select 
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}
                >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                </select>
            </div>
          </div>

          {/* --- CAMPO DE CONVÊNIO --- */}
          <div>
             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Convênio Padrão</label>
             <div className="relative">
                <CreditCard size={16} className="absolute left-3 top-3 text-slate-400"/>
                <select 
                    className="w-full pl-9 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={form.convenioId} onChange={e => setForm({...form, convenioId: e.target.value})}
                >
                    <option value="">Particular / Nenhum</option>
                    {convenios && convenios.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
             </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">
            Cancelar
          </button>
          <button 
            onClick={salvar} 
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : <><Save size={18}/> Salvar e Usar</>}
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Save, Trash2, Search, FileText, Phone, CreditCard, Calendar } from 'lucide-react';

// Caminho relativo para usar o proxy corretamente
const API_URL = '/api';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [convenios, setConvenios] = useState<any[]>([]); // <--- Lista para o Dropdown
  const [termoBusca, setTermoBusca] = useState('');
  
  // Estado do formulário
  const [form, setForm] = useState({
    id: 0,
    nome: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    sexo: 'M',
    convenioId: '' // <--- Armazena o ID do convênio selecionado
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Busca Pacientes e Convênios simultaneamente
      const [resPac, resConv] = await Promise.all([
        axios.get(`${API_URL}/Pacientes`),
        axios.get(`${API_URL}/Convenios`)
      ]);
      
      setPacientes(resPac.data);
      setConvenios(resConv.data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  const salvar = async () => {
    if (!form.nome || !form.cpf) return alert("Nome e CPF são obrigatórios");

    // Converte o ID para número ou null antes de enviar
    const payload = {
        ...form,
        convenioId: form.convenioId ? parseInt(form.convenioId.toString()) : null
    };

    try {
      if (form.id === 0) {
        // Criar Novo
        await axios.post(`${API_URL}/Pacientes`, payload);
      } else {
        // Editar Existente
        await axios.put(`${API_URL}/Pacientes/${form.id}`, payload);
      }
      
      alert("Paciente salvo com sucesso!");
      limparForm();
      carregarDados(); // Atualiza a lista na tela
    } catch (error) {
      alert("Erro ao salvar. Verifique se o CPF já existe.");
      console.error(error);
    }
  };

  const editar = (p: any) => {
    // Preenche o formulário com os dados do paciente clicado
    setForm({
        id: p.id,
        nome: p.nome,
        cpf: p.cpf,
        dataNascimento: p.dataNascimento ? p.dataNascimento.split('T')[0] : '',
        telefone: p.telefone || '',
        email: p.email || '',
        sexo: p.sexo || 'M',
        convenioId: p.convenioId || '' // <--- Aqui ele seleciona o convênio no dropdown
    });
  };

  const excluir = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este paciente?")) {
      try {
        await axios.delete(`${API_URL}/Pacientes/${id}`);
        carregarDados();
      } catch (error) {
        alert("Erro ao excluir. O paciente pode ter agendamentos vinculados.");
      }
    }
  };

  const limparForm = () => {
    setForm({ id: 0, nome: '', cpf: '', dataNascimento: '', telefone: '', email: '', sexo: 'M', convenioId: '' });
  };

  // Filtro de busca local
  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
    p.cpf.includes(termoBusca)
  );

  return (
    <div className="p-8 h-full bg-slate-50 animate-fade-in overflow-auto">
      <h1 className="text-3xl font-light text-slate-800 mb-8 flex items-center">
        <User className="mr-3 text-indigo-600" size={32} /> Cadastro de Pacientes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- FORMULÁRIO (Coluna da Esquerda) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-4">
          <h2 className="font-bold text-lg mb-4 text-slate-700 flex justify-between">
            {form.id === 0 ? 'Novo Paciente' : 'Editando Paciente'}
            {form.id !== 0 && <button onClick={limparForm} className="text-xs text-indigo-600 underline">Cancelar Edição</button>}
          </h2>
          
          <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome Completo</label>
                <input className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                       value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">CPF</label>
                    <input className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                           value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} maxLength={14} placeholder="000.000.000-00"/>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nascimento</label>
                    <input type="date" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                           value={form.dataNascimento} onChange={e => setForm({...form, dataNascimento: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Telefone</label>
                    <input className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                           value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Sexo</label>
                    <select className="w-full p-2 border border-slate-300 rounded bg-white" value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                    </select>
                </div>
            </div>

            {/* --- SELEÇÃO DE CONVÊNIO --- */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Convênio Padrão</label>
                <div className="relative">
                    <CreditCard size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <select 
                        className="w-full pl-9 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={form.convenioId} onChange={e => setForm({...form, convenioId: e.target.value})}
                    >
                        <option value="">Particular / Sem Convênio</option>
                        {convenios.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button onClick={salvar} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow hover:bg-indigo-700 flex justify-center items-center transition-all">
              <Save size={18} className="mr-2"/> Salvar Paciente
            </button>
          </div>
        </div>

        {/* --- LISTA DE PACIENTES (Coluna da Direita) --- */}
        <div className="col-span-2">
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20}/>
                <input 
                    className="w-full pl-10 p-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Buscar por nome ou CPF..."
                    value={termoBusca}
                    onChange={e => setTermoBusca(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                {pacientesFiltrados.map(p => {
                    // Descobre o nome do convênio pelo ID para mostrar no card
                    const nomeConvenio = convenios.find(c => c.id === p.convenioId)?.nome || 'Particular';

                    return (
                        <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow group">
                            <div>
                                <div className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    {p.nome}
                                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                                        {p.sexo === 'M' ? 'MASC' : 'FEM'}
                                    </span>
                                </div>
                                <div className="text-slate-500 text-sm flex gap-4 mt-1">
                                    <span className="flex items-center gap-1"><FileText size={14}/> {p.cpf}</span>
                                    <span className="flex items-center gap-1"><Phone size={14}/> {p.telefone || '-'}</span>
                                    
                                    {/* Exibe o convênio no card */}
                                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                        <CreditCard size={14}/> {nomeConvenio}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    <Calendar size={12}/> Nasc: {p.dataNascimento ? new Date(p.dataNascimento).toLocaleDateString('pt-BR') : '-'}
                                </div>
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => editar(p)} className="px-3 py-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded text-sm font-bold">
                                    Editar
                                </button>
                                <button onClick={() => excluir(p.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                    );
                })}
                
                {pacientesFiltrados.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        Nenhum paciente encontrado.
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
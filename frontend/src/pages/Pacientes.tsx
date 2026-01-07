import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Save, Search, User, Phone, Calendar, CreditCard, X } from 'lucide-react';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [termo, setTermo] = useState('');
  
  // Modal e Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    sexo: 'M', // Padrão
    telefone: '',
    convenio: ''
  });

  const API_URL = '/api';

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/Pacientes`);
      if (res.ok) setPacientes(await res.json());
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (paciente: any = null) => {
    if (paciente) {
      setPacienteEditando(paciente);
      setForm({
        nome: paciente.nome,
        cpf: paciente.cpf,
        // Corta o 'T' da data ISO para o input type="date"
        dataNascimento: paciente.dataNascimento ? paciente.dataNascimento.split('T')[0] : '',
        sexo: paciente.sexo || 'M',
        telefone: paciente.telefone || '',
        convenio: paciente.convenio || ''
      });
    } else {
      setPacienteEditando(null);
      setForm({ nome: '', cpf: '', dataNascimento: '', sexo: 'M', telefone: '', convenio: '' });
    }
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.nome || !form.cpf || !form.dataNascimento) return alert("Preencha os obrigatórios (*)");

    const payload = {
        ...form,
        // Garante data UTC zerada (00:00:00)
        dataNascimento: new Date(form.dataNascimento).toISOString()
    };

    try {
      let res;
      if (pacienteEditando) {
        // PUT
        res = await fetch(`${API_URL}/Pacientes/${pacienteEditando.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: pacienteEditando.id, ...payload })
        });
      } else {
        // POST
        res = await fetch(`${API_URL}/Pacientes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert("Salvo com sucesso!");
        setModalAberto(false);
        carregarPacientes();
      } else {
        const erro = await res.text();
        alert("Erro ao salvar: " + erro);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const excluir = async (id: number) => {
    if (!confirm("Excluir paciente?")) return;
    await fetch(`${API_URL}/Pacientes/${id}`, { method: 'DELETE' });
    carregarPacientes();
  };

  const filtrados = pacientes.filter((p: any) => 
    p.nome.toLowerCase().includes(termo.toLowerCase()) || 
    p.cpf.includes(termo)
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="text-emerald-600" /> Pacientes
        </h1>
        <button onClick={() => abrirModal()} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700">
          <Plus size={20} /> Novo Paciente
        </button>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Buscar por Nome ou CPF..."
                value={termo}
                onChange={e => setTermo(e.target.value)}
            />
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-sm font-bold text-slate-600">Nome</th>
              <th className="p-4 text-sm font-bold text-slate-600">CPF</th>
              <th className="p-4 text-sm font-bold text-slate-600">Nascimento</th>
              <th className="p-4 text-sm font-bold text-slate-600">Sexo</th>
              <th className="p-4 text-sm font-bold text-slate-600">Convênio</th>
              <th className="p-4 text-sm font-bold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Carregando...</td></tr>}
            
            {!loading && filtrados.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-800">{p.nome}</td>
                <td className="p-4 text-slate-600 font-mono text-xs">{p.cpf}</td>
                <td className="p-4 text-slate-600 text-sm">
                    {new Date(p.dataNascimento).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-slate-600 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        p.sexo === 'M' ? 'bg-blue-100 text-blue-700' :
                        p.sexo === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {p.sexo === 'M' ? 'MASC' : p.sexo === 'F' ? 'FEM' : 'OUTRO'}
                    </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">{p.convenio || '-'}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => abrirModal(p)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded"><Edit size={18}/></button>
                  <button onClick={() => excluir(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL FORMULÁRIO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><User size={20}/> {pacienteEditando ? 'Editar' : 'Novo'} Paciente</h3>
                    <button onClick={() => setModalAberto(false)}><X/></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nome Completo *</label>
                        <input className="w-full p-2 border rounded" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">CPF *</label>
                            <input className="w-full p-2 border rounded" placeholder="000.000.000-00" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nascimento *</label>
                            <input type="date" className="w-full p-2 border rounded" value={form.dataNascimento} onChange={e => setForm({...form, dataNascimento: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Sexo *</label>
                            <select className="w-full p-2 border rounded bg-white" value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                                <option value="O">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Telefone</label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-2.5 top-3 text-slate-400"/>
                                <input className="w-full pl-8 p-2 border rounded" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Convênio Padrão</label>
                        <div className="relative">
                            <CreditCard size={14} className="absolute left-2.5 top-3 text-slate-400"/>
                            <input className="w-full pl-8 p-2 border rounded" placeholder="Ex: Unimed, Particular..." value={form.convenio} onChange={e => setForm({...form, convenio: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
                    <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded">Cancelar</button>
                    <button onClick={salvar} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded shadow hover:bg-emerald-700">Salvar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
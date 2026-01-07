import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Clock, Monitor } from 'lucide-react';

export default function ConfigAgendas() {
  const [agendas, setAgendas] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(false);

  // CORREÇÃO: Usa caminho relativo para o Proxy do Vite (docker friendly)
  const API_URL = '/api'; 

  const [form, setForm] = useState({
    id: 0,
    nome: '',
    intervaloMinutos: 20,
    horarioInicio: '08:00',
    horarioFim: '18:00',
    ativa: true,
    equipamentoId: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resAgendas, resEquip] = await Promise.all([
        fetch(`${API_URL}/Agendas`),
        fetch(`${API_URL}/Equipamentos`)
      ]);

      if (resAgendas.ok) setAgendas(await resAgendas.json());
      if (resEquip.ok) setEquipamentos(await resEquip.json());

    } catch (error) {
      console.error("Erro ao conectar na API:", error);
    } finally {
      setLoading(false);
    }
  };

  const salvar = async () => {
    if (!form.nome) return alert("Nome obrigatório");

    // Garante formato HH:mm:ss para o TimeSpan do C#
    const payload = {
        ...form,
        horarioInicio: form.horarioInicio.length === 5 ? form.horarioInicio + ":00" : form.horarioInicio,
        horarioFim: form.horarioFim.length === 5 ? form.horarioFim + ":00" : form.horarioFim,
        equipamentoId: form.equipamentoId ? parseInt(form.equipamentoId) : null
    };

    try {
      const res = await fetch(`${API_URL}/Agendas`, {
        method: 'POST', // Backend trata como Upsert se mandar ID? Se não, precisamos ajustar controller.
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Agenda salva!");
        setForm({ id: 0, nome: '', intervaloMinutos: 20, horarioInicio: '08:00', horarioFim: '18:00', ativa: true, equipamentoId: '' });
        carregarDados();
      } else {
        alert("Erro ao salvar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const excluir = async (id: number) => {
    if (!confirm("Excluir esta agenda?")) return;
    try {
      await fetch(`${API_URL}/Agendas/${id}`, { method: 'DELETE' });
      carregarDados();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="text-indigo-600" /> Configuração de Salas e Agendas
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULÁRIO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="font-bold text-slate-600 mb-4 border-b pb-2">Nova / Editar Agenda</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nome da Agenda / Sala</label>
              <input 
                className="w-full border p-2 rounded bg-slate-50" 
                placeholder="Ex: Ressonância 01"
                value={form.nome}
                onChange={e => setForm({...form, nome: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Equipamento DICOM (Worklist)</label>
              <select 
                className="w-full border p-2 rounded bg-slate-50"
                value={form.equipamentoId}
                onChange={e => setForm({...form, equipamentoId: e.target.value})}
              >
                <option value="">-- Nenhum (Apenas Agenda) --</option>
                {equipamentos.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.nome} ({e.modalidade})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Início</label>
                <input type="time" className="w-full border p-2 rounded" 
                  value={form.horarioInicio} onChange={e => setForm({...form, horarioInicio: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Fim</label>
                <input type="time" className="w-full border p-2 rounded" 
                  value={form.horarioFim} onChange={e => setForm({...form, horarioFim: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Intervalo (Minutos)</label>
              <input type="number" className="w-full border p-2 rounded" 
                value={form.intervaloMinutos} onChange={e => setForm({...form, intervaloMinutos: parseInt(e.target.value)})} />
            </div>

            <button onClick={salvar} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center gap-2">
              <Save size={18} /> Salvar Configuração
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div className="lg:col-span-2 space-y-4">
          {loading && <p>Carregando...</p>}
          {agendas.map((a: any) => (
            <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md transition">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{a.nome}</h3>
                <div className="text-sm text-slate-500 mt-1 flex gap-4">
                  <span className="flex items-center gap-1"><Clock size={14}/> {a.horarioInicio} às {a.horarioFim}</span>
                  <span className="bg-slate-100 px-2 rounded text-xs py-0.5">⏱ {a.intervaloMinutos} min</span>
                </div>
                {a.equipamentoId && (
                    <div className="mt-2 text-xs text-indigo-600 font-bold flex items-center gap-1">
                        <Monitor size={12}/> Vinculado ao Equipamento ID: {a.equipamentoId}
                    </div>
                )}
              </div>
              <button onClick={() => excluir(a.id)} className="text-red-400 hover:text-red-600 p-2">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}